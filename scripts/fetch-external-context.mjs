#!/usr/bin/env node
/**
 * Fetch public web context for TEAM hospitals + health systems.
 * Writes:
 *   src/data/hospital-external-context.json
 *   src/data/system-external-context.json
 *
 * Usage: npm run fetch:external-context
 *
 * Optional: CMS_NEWS_API_KEY for NewsAPI.org headlines (free tier).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadTeamCcns } from './lib/cms-csv.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const hospitalsPath = path.join(root, 'src/data/team-hospitals.ts');
const profilesPath = path.join(root, 'src/data/hospital-public-profiles.json');
const hospitalOut = path.join(root, 'src/data/hospital-external-context.json');
const systemOut = path.join(root, 'src/data/system-external-context.json');

const HOSPITAL_LINE_RE =
  /^\s*\{ name: (?:"((?:\\"|[^"])*)"|'((?:\\'|[^'])*)'), state: '([A-Z]{2})'(?:, city: '((?:\\'|[^'])*)')?(?:, ccn: '(\d{6})')?(?:, cbsaCode: '(\d+)')?(?:, participation: '(Mandatory|Voluntary)')?(?:, healthSystem: '((?:\\'|[^'])*)')? \},?\s*$/;

function loadTeamRows() {
  const src = fs.readFileSync(hospitalsPath, 'utf8');
  const rows = [];
  for (const line of src.split('\n')) {
    const m = line.match(HOSPITAL_LINE_RE);
    if (!m) continue;
    const name = (m[1] ?? m[2]).replace(/\\"/g, '"').replace(/\\'/g, "'");
    rows.push({
      name,
      state: m[3],
      city: m[4]?.replace(/\\'/g, "'"),
      ccn: m[5],
      healthSystem: m[8]?.replace(/\\'/g, "'"),
    });
  }
  return rows;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchJson(url, init) {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return res.json();
}

async function wikipediaSummary(title) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  try {
    const data = await fetchJson(url, {
      headers: { Accept: 'application/json', 'User-Agent': 'RainfallHospitalDirectory/1.0' },
    });
    if (data.type === 'disambiguation' || !data.extract) return null;
    return {
      title: data.title,
      extract: data.extract,
      url: data.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
      thumbnail: data.thumbnail?.source ?? null,
    };
  } catch {
    return null;
  }
}

async function newsHeadlines(query) {
  const key = process.env.CMS_NEWS_API_KEY || process.env.NEWS_API_KEY;
  if (!key) return [];
  const url = new URL('https://newsapi.org/v2/everything');
  url.searchParams.set('q', query);
  url.searchParams.set('language', 'en');
  url.searchParams.set('sortBy', 'publishedAt');
  url.searchParams.set('pageSize', '5');
  try {
    const data = await fetchJson(url.toString(), { headers: { 'X-Api-Key': key } });
    return (data.articles ?? []).map((a) => ({
      title: a.title,
      url: a.url,
      source: a.source?.name,
      publishedAt: a.publishedAt,
    }));
  } catch {
    return [];
  }
}

function systemWikiQuery(systemName) {
  const map = {
    'HCA Healthcare': 'HCA Healthcare',
    'CommonSpirit Health': 'CommonSpirit Health',
    Ascension: 'Ascension (healthcare)',
    'Trinity Health': 'Trinity Health (health system)',
    'AdventHealth': 'AdventHealth',
    'Providence': 'Providence Health & Services',
    'Kaiser Permanente': 'Kaiser Permanente',
    'Cleveland Clinic': 'Cleveland Clinic',
    'Mayo Clinic': 'Mayo Clinic',
  };
  return map[systemName] ?? systemName;
}

async function main() {
  const rows = loadTeamRows();
  const profiles = fs.existsSync(profilesPath)
    ? JSON.parse(fs.readFileSync(profilesPath, 'utf8'))
    : { byCcn: {} };

  const systems = [...new Set(rows.map((r) => r.healthSystem).filter(Boolean))].sort();
  console.log(`Health systems: ${systems.length}`);

  const systemByName = {};
  for (const name of systems) {
    const wiki = await wikipediaSummary(systemWikiQuery(name));
    await sleep(120);
    const news = await newsHeadlines(`"${name}" hospital OR health`);
    await sleep(120);
    systemByName[name] = {
      name,
      wikipedia: wiki,
      news,
      hospitalCount: rows.filter((r) => r.healthSystem === name).length,
    };
    console.log(`  system ${name}: wiki=${Boolean(wiki)} news=${news.length}`);
  }

  const byCcn = {};
  let done = 0;
  for (const row of rows) {
    if (!row.ccn) continue;
    const pub = profiles.byCcn?.[row.ccn];
    const facility = pub?.general?.facilityName || row.name;
    const wiki = await wikipediaSummary(facility);
    await sleep(80);
    byCcn[row.ccn] = {
      ccn: row.ccn,
      wikipedia: wiki,
      systemKey: row.healthSystem ?? null,
    };
    done++;
    if (done % 50 === 0) console.log(`  hospitals ${done}/${rows.length}`);
  }

  const generatedAt = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(
    systemOut,
    JSON.stringify({ generatedAt, byName: systemByName }, null, 2),
  );
  fs.writeFileSync(
    hospitalOut,
    JSON.stringify({ generatedAt, byCcn }, null, 2),
  );
  console.log(`Wrote ${Object.keys(systemByName).length} systems → ${systemOut}`);
  console.log(`Wrote ${Object.keys(byCcn).length} hospital contexts → ${hospitalOut}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
