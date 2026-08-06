#!/usr/bin/env node
/**
 * Fetch Wikipedia summaries + Wikidata facts for TEAM hospitals and health systems.
 * Output: src/data/hospital-external-context.json, src/data/system-external-context.json
 *
 * Usage:
 *   npm run fetch:external-context
 *   npm run fetch:external-context -- --systems-only
 *   npm run fetch:external-context -- --limit 50
 *   npm run fetch:external-context -- --slug abbott-northwestern-hospital
 *   npm run fetch:external-context -- --hospitals-only --state CT
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const hospitalsPath = path.join(root, 'src/data/team-hospitals.ts');
const hospitalOut = path.join(root, 'src/data/hospital-external-context.json');
const systemOut = path.join(root, 'src/data/system-external-context.json');
const systemQueriesPath = path.join(__dirname, 'data/system-wiki-queries.json');

const USER_AGENT = 'RainfallHospitalDirectory/1.0 (internal research; contact rainfallhealth.com)';
const DELAY_MS = Number(process.env.WIKI_DELAY_MS || 1100);
const MAX_RETRIES = 4;

const HOSPITAL_LINE_RE =
  /^\s*\{ name: (?:"((?:\\"|[^"])*)"|'((?:\\'|[^'])*)'), state: '([A-Z]{2})'(?:, city: '((?:\\'|[^'])*)')?(?:, ccn: '(\d{6})')?(?:, cbsaCode: '(\d+)')?(?:, participation: '(Mandatory|Voluntary)')?(?:, healthSystem: '((?:\\'|[^'])*)')? \},?\s*$/;

const args = process.argv.slice(2);
const systemsOnly = args.includes('--systems-only');
const hospitalsOnly = args.includes('--hospitals-only');
const limitIdx = args.indexOf('--limit');
const limit = limitIdx >= 0 ? Number(args[limitIdx + 1]) : null;
const slugIdx = args.indexOf('--slug');
const singleSlug = slugIdx >= 0 ? args[slugIdx + 1] : null;
const systemIdx = args.indexOf('--system');
const singleSystem = systemIdx >= 0 ? args[systemIdx + 1] : null;
const stateIdx = args.indexOf('--state');
const filterState = stateIdx >= 0 ? String(args[stateIdx + 1] || '').trim().toUpperCase() : null;
const skipSystems = hospitalsOnly || systemsOnly || singleSlug || singleSystem || filterState;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function systemSlugFromName(name) {
  return slugify(name);
}

function displayName(name) {
  return name
    .toLowerCase()
    .split(/\s+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ''))
    .join(' ');
}

function loadTeamHospitals() {
  const src = fs.readFileSync(hospitalsPath, 'utf8');
  const raw = [];
  for (const line of src.split('\n')) {
    const m = line.match(HOSPITAL_LINE_RE);
    if (!m) continue;
    const name = (m[1] ?? m[2]).replace(/\\"/g, '"').replace(/\\'/g, "'");
    raw.push({
      name,
      state: m[3],
      city: m[4]?.replace(/\\'/g, "'"),
      healthSystem: m[8]?.replace(/\\'/g, "'"),
    });
  }
  const baseCounts = new Map();
  return raw.map((input) => {
    const base = `${slugify(input.name)}-${slugify(input.state)}`;
    const n = (baseCounts.get(base) ?? 0) + 1;
    baseCounts.set(base, n);
    return { ...input, slug: n === 1 ? base : `${base}-${n}` };
  });
}

const HOSPITAL_HINTS = /\b(hospital|medical center|clinic|health system|healthcare)\b/i;
const BAD_HINTS =
  /\b(disambiguation|song|film|album|airport|school district|township|mass shooting|clinic attack|murder trial)\b/i;

function scoreWikiResult(title, snippet) {
  let score = 0;
  if (HOSPITAL_HINTS.test(title)) score += 4;
  if (BAD_HINTS.test(title)) score -= 6;
  if (snippet && HOSPITAL_HINTS.test(snippet)) score += 2;
  if (BAD_HINTS.test(snippet || '')) score -= 3;
  return score;
}

function confidenceFromScore(score) {
  if (score >= 5) return 'high';
  if (score >= 3) return 'medium';
  return 'low';
}

async function fetchWithRetry(url, options = {}) {
  let wait = DELAY_MS;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const res = await fetch(url, { ...options, headers: { 'User-Agent': USER_AGENT, ...options.headers } });
    if (res.status === 429) {
      const retryAfter = Number(res.headers.get('retry-after') || 0);
      wait = Math.max(wait * 2, retryAfter * 1000 || 5000);
      console.warn(`  rate limited; waiting ${wait}ms (attempt ${attempt + 1})`);
      await sleep(wait);
      continue;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
    return res;
  }
  throw new Error(`Rate limited after retries: ${url}`);
}

async function wikiApi(params) {
  const url = new URL('https://en.wikipedia.org/w/api.php');
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  url.searchParams.set('format', 'json');
  const res = await fetchWithRetry(url);
  return res.json();
}

async function searchWikipedia(query) {
  const data = await wikiApi({
    action: 'query',
    list: 'search',
    srsearch: query,
    srlimit: '5',
    origin: '*',
  });
  return data.query?.search ?? [];
}

async function fetchPageDetails(title) {
  const data = await wikiApi({
    action: 'query',
    titles: title,
    prop: 'extracts|pageprops|info',
    exintro: '1',
    explaintext: '1',
    redirects: '1',
    inprop: 'url',
    ppprop: 'wikibase_item',
    origin: '*',
  });
  const pages = data.query?.pages ?? {};
  const page = Object.values(pages)[0];
  if (!page || page.missing !== undefined) return null;
  const extract = (page.extract || '').trim();
  const SUMMARY_MAX = 5000;
  const summary =
    extract.length > SUMMARY_MAX
      ? `${extract.slice(0, SUMMARY_MAX - 1).replace(/\s+\S*$/, '')}…`
      : extract;
  return {
    wikipediaTitle: page.title,
    wikipediaUrl: page.fullurl || `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, '_'))}`,
    summary,
    wikidataId: page.pageprops?.wikibase_item,
  };
}

function yearFromWikidataTime(time) {
  if (!time) return null;
  const m = String(time).match(/^\+?(-?\d{4})/);
  if (!m) return null;
  const y = parseInt(m[1], 10);
  return y > 1500 && y <= new Date().getFullYear() + 1 ? y : null;
}

function claimAmount(claims, pid) {
  const c = claims?.[pid]?.[0];
  if (!c) return null;
  const dv = c.mainsnak?.datavalue;
  if (!dv) return null;
  if (dv.type === 'time') return yearFromWikidataTime(dv.value?.time);
  if (dv.type === 'quantity') {
    const n = parseFloat(String(dv.value?.amount ?? '').replace(/^\+/, ''));
    return Number.isFinite(n) ? Math.round(n) : null;
  }
  if (dv.type === 'string') return dv.value;
  return null;
}

async function fetchWikidataFacts(qid) {
  const url = `https://www.wikidata.org/wiki/Special:EntityData/${qid}.json`;
  let res;
  try {
    res = await fetchWithRetry(url);
  } catch {
    return {};
  }
  const json = await res.json();
  const entity = json.entities?.[qid];
  if (!entity) return {};
  const claims = entity.claims ?? {};
  const foundedYear = claimAmount(claims, 'P571');
  const website = claimAmount(claims, 'P856');
  const wikidataBeds = claimAmount(claims, 'P6801');
  const wikidataEmployees = claimAmount(claims, 'P1128');
  const ageYears = foundedYear ? new Date().getFullYear() - foundedYear : undefined;
  return {
    foundedYear: foundedYear ?? undefined,
    ageYears: ageYears && ageYears > 0 ? ageYears : undefined,
    website: typeof website === 'string' ? website : undefined,
    wikidataBeds: wikidataBeds ?? undefined,
    wikidataEmployees: wikidataEmployees ?? undefined,
  };
}

async function resolveWikipedia(searchQuery, { minScore = 3 } = {}) {
  const results = await searchWikipedia(searchQuery);
  if (!results.length) return null;
  let best = null;
  let bestScore = -99;
  for (const r of results) {
    const score = scoreWikiResult(r.title, r.snippet);
    if (score > bestScore) {
      bestScore = score;
      best = r;
    }
  }
  if (!best || bestScore < minScore) return null;
  const page = await fetchPageDetails(best.title);
  if (!page?.summary) return null;
  const facts = page.wikidataId ? await fetchWikidataFacts(page.wikidataId) : {};
  return {
    ...page,
    ...facts,
    confidence: confidenceFromScore(bestScore),
    searchQuery,
  };
}

function hospitalSearchQueries(hospital) {
  const label = displayName(hospital.name);
  const city = hospital.city?.split(',')[0]?.trim();
  const queries = [
    city ? `${label} hospital ${city} ${hospital.state}` : null,
    `${label} hospital ${hospital.state}`,
    label.replace(/\s+Hospital$/i, '') + ` ${hospital.state}`,
  ].filter(Boolean);
  return [...new Set(queries)];
}

async function enrichHospital(hospital) {
  for (const q of hospitalSearchQueries(hospital)) {
    const hit = await resolveWikipedia(q, { minScore: 3 });
    if (hit) return hit;
  }
  return null;
}

async function enrichSystem(name, curatedQuery) {
  const q = curatedQuery || `${name} (health care)`;
  return resolveWikipedia(q, { minScore: 4 });
}

function loadExisting(path) {
  try {
    return JSON.parse(fs.readFileSync(path, 'utf8'));
  } catch {
    return { generatedAt: null, source: 'Wikipedia + Wikidata', bySlug: {} };
  }
}

function writeJson(path, data) {
  fs.writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
}

async function main() {
  const systemQueries = JSON.parse(fs.readFileSync(systemQueriesPath, 'utf8'));
  const hospitals = loadTeamHospitals();
  const hospitalStore = loadExisting(hospitalOut);
  const systemStore = loadExisting(systemOut);

  let hospitalDone = 0;
  let hospitalHit = 0;
  let systemDone = 0;
  let systemHit = 0;

  const persist = () => {
    const generatedAt = new Date().toISOString();
    hospitalStore.generatedAt = generatedAt;
    hospitalStore.source = 'Wikipedia + Wikidata';
    systemStore.generatedAt = generatedAt;
    systemStore.source = 'Wikipedia + Wikidata';
    if (!hospitalsOnly) writeJson(systemOut, systemStore);
    if (!systemsOnly) writeJson(hospitalOut, hospitalStore);
  };

  if (!skipSystems) {
    let systems = [...new Set(hospitals.map((h) => h.healthSystem).filter(Boolean))].sort();
    if (singleSystem) systems = systems.filter((n) => n === singleSystem);
    console.log(`Health systems to enrich: ${systems.length}`);
    for (const name of systems) {
      const slug = systemSlugFromName(name);
      if (systemStore.bySlug[slug] && !singleSlug && !singleSystem) {
        systemDone += 1;
        systemHit += 1;
        continue;
      }
      const hit = await enrichSystem(name, systemQueries[name]);
      systemDone += 1;
      if (hit) {
        systemStore.bySlug[slug] = hit;
        systemHit += 1;
        console.log(`  ✓ system ${name}`);
      } else {
        console.log(`  – system ${name} (no match)`);
      }
      persist();
      await sleep(DELAY_MS);
    }
  }

  if (!systemsOnly) {
    let list = hospitals;
    if (singleSlug) list = list.filter((h) => h.slug === singleSlug);
    if (filterState) list = list.filter((h) => h.state === filterState);
    if (limit != null && Number.isFinite(limit)) list = list.slice(0, limit);

    console.log(`Hospitals to enrich: ${list.length}`);
    for (const hospital of list) {
      if (hospitalStore.bySlug[hospital.slug] && !singleSlug) {
        hospitalDone += 1;
        continue;
      }
      const hit = await enrichHospital(hospital);
      hospitalDone += 1;
      if (hit) {
        hospitalStore.bySlug[hospital.slug] = hit;
        hospitalHit += 1;
        if (hospitalDone % 25 === 0 || hospitalDone === list.length) {
          console.log(`  … hospitals ${hospitalDone}/${list.length} (${hospitalHit} matched)`);
        }
      }
      if (hospitalDone % 10 === 0) persist();
      await sleep(DELAY_MS);
    }
    persist();
  }

  console.log('\nExternal context fetch complete:');
  if (!hospitalsOnly) console.log(`  Systems: ${systemHit}/${systemDone} with Wikipedia match`);
  if (!systemsOnly) {
    const total = Object.keys(hospitalStore.bySlug).length;
    console.log(`  Hospitals: ${hospitalHit} new matches this run; ${total} total in file`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
