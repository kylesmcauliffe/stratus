#!/usr/bin/env node
/**
 * Enrich src/data/team-hospitals.ts from the CMS TEAM participant list (XLSX).
 * Adds city (parsed from CBSA Name) and healthSystem (inferred from facility name prefix).
 *
 * Usage: npm run enrich:hospitals
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import XLSX from 'xlsx';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const hospitalsPath = path.join(root, 'src/data/team-hospitals.ts');
const CMS_URL = 'https://www.cms.gov/team-model-participant-list';

const SYSTEM_PREFIXES = [
  ['ADVENTHEALTH', 'AdventHealth'],
  ['ASCENSION ', 'Ascension'],
  ['ADVENTIST HEALTH', 'Adventist Health'],
  ['ALLINA HEALTH', 'Allina Health'],
  ['BANNER ', 'Banner Health'],
  ['BAYCARE ', 'BayCare'],
  ['BAYLOR SCOTT', 'Baylor Scott & White Health'],
  ['BON SECOURS', 'Bon Secours Mercy Health'],
  ['CAROLINAS HEALTHCARE', 'Atrium Health'],
  ['CATHOLIC HEALTH', 'Catholic Health'],
  ['CHILDRENS HOSPITAL', 'Children\'s hospital network'],
  ['CHRISTUS ', 'Christus Health'],
  ['CLEVELAND CLINIC', 'Cleveland Clinic'],
  ['COMMONSPIRIT', 'CommonSpirit Health'],
  ['COMMUNITY HEALTH SYSTEM', 'Community Health Systems'],
  ['COOPER UNIVERSITY', 'Cooper University Health Care'],
  ['DUKE UNIVERSITY', 'Duke Health'],
  ['EMORY ', 'Emory Healthcare'],
  ['HCA ', 'HCA Healthcare'],
  ['HENRY FORD', 'Henry Ford Health'],
  ['INFIRMARY ', 'Infirmary Health'],
  ['INOVA ', 'Inova Health System'],
  ['INTERMOUNTAIN', 'Intermountain Health'],
  ['KAISER', 'Kaiser Permanente'],
  ['LEE HEALTH', 'Lee Health'],
  ['MAYO CLINIC', 'Mayo Clinic'],
  ['MERCY ', 'Mercy'],
  ['METHODIST ', 'Methodist'],
  ['MOUNT SINAI', 'Mount Sinai Health System'],
  ['NORTHWELL', 'Northwell Health'],
  ['NORTON ', 'Norton Healthcare'],
  ['NYU ', 'NYU Langone Health'],
  ['OHIOHEALTH', 'OhioHealth'],
  ['ORLANDO HEALTH', 'Orlando Health'],
  ['PEACEHEALTH', 'PeaceHealth'],
  ['PIEDMONT ', 'Piedmont Healthcare'],
  ['PROVIDENCE ', 'Providence'],
  ['SENTARA ', 'Sentara Health'],
  ['SSM ', 'SSM Health'],
  ['STANFORD', 'Stanford Medicine'],
  ['TENET ', 'Tenet Healthcare'],
  ['TRINITY HEALTH', 'Trinity Health'],
  ['UCLA', 'UCLA Health'],
  ['UCSF', 'UCSF Health'],
  ['UNC ', 'UNC Health'],
  ['UNITED HEALTH SERVICES', 'United Health Services'],
  ['UNIVERSITY OF ', 'University health system'],
  ['UNIVERSITY HOSPITAL', 'University hospital'],
  ['UT SOUTHWESTERN', 'UT Southwestern'],
  ['VANDERBILT', 'Vanderbilt Health'],
  ['WELLSTAR', 'Wellstar Health System'],
];

function normalizeName(name) {
  return name.toUpperCase().replace(/[^A-Z0-9]+/g, ' ').trim();
}

function inferHealthSystem(name) {
  const upper = name.toUpperCase();
  for (const [prefix, system] of SYSTEM_PREFIXES) {
    if (upper.startsWith(prefix) || upper.includes(` ${prefix}`)) return system;
  }
  return undefined;
}

function cityFromCbsa(cbsaName, state) {
  if (!cbsaName || typeof cbsaName !== 'string') return undefined;
  const parts = cbsaName.split(',').map((p) => p.trim());
  if (parts.length < 2) return undefined;
  const cbsaState = parts[parts.length - 1].toUpperCase();
  if (state && cbsaState !== state) return parts[0] || undefined;
  return parts.slice(0, -1).join(', ') || undefined;
}

function escapeTsString(value) {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

async function downloadCmsXlsx() {
  const res = await fetch(CMS_URL);
  if (!res.ok) throw new Error(`CMS download failed: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  return XLSX.read(buf, { type: 'buffer' });
}

function loadCmsRows(workbook) {
  const sheet = workbook.Sheets['TEAM Participant List'];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  const map = new Map();
  for (const row of rows.slice(2)) {
    const name = row[2];
    const state = row[5];
    const cbsa = row[4];
    if (!name || !state) continue;
    const ccn = String(row[1] ?? '').replace(/\D/g, '').padStart(6, '0').slice(-6);
    map.set(`${normalizeName(name)}|${state}`, { name, state, cbsa, ccn: ccn.length === 6 ? ccn : undefined });
  }
  return map;
}

function formatEntry({ name, state, city, ccn, healthSystem }, useDoubleName = false) {
  const namePart = useDoubleName
    ? `name: "${escapeTsString(name).replace(/"/g, '\\"')}"`
    : `name: '${escapeTsString(name)}'`;
  const parts = [namePart, `state: '${state}'`];
  if (city) parts.push(`city: '${escapeTsString(city)}'`);
  if (ccn) parts.push(`ccn: '${ccn}'`);
  if (healthSystem) parts.push(`healthSystem: '${escapeTsString(healthSystem)}'`);
  return `{ ${parts.join(', ')} }`;
}

const HOSPITAL_LINE_RE =
  /^\s*\{ name: (?:"((?:\\"|[^"])*)"|'((?:\\'|[^'])*)'), state: '([A-Z]{2})'(?:, city: '((?:\\'|[^'])*)')?(?:, ccn: '(\d{6})')?(?:, healthSystem: '((?:\\'|[^'])*)')? \},?\s*$/;

function parseHospitalLine(line) {
  const m = line.match(HOSPITAL_LINE_RE);
  if (!m) return null;
  const name = (m[1] ?? m[2]).replace(/\\"/g, '"').replace(/\\'/g, "'");
  return {
    name,
    state: m[3],
    city: m[4]?.replace(/\\'/g, "'"),
    ccn: m[5],
    healthSystem: m[6]?.replace(/\\'/g, "'"),
    useDoubleName: Boolean(m[1]),
  };
}

function enrichFile(source, cmsMap) {
  let matched = 0;
  let enrichedCity = 0;
  let enrichedSystem = 0;
  let enrichedCcn = 0;

  const out = source.split('\n').map((line) => {
    const parsed = parseHospitalLine(line);
    if (!parsed) return line;

    const { name, state, useDoubleName } = parsed;
    const cms = cmsMap.get(`${normalizeName(name)}|${state}`);
    let city = parsed.city;
    let ccn = parsed.ccn;
    let healthSystem = parsed.healthSystem;

    if (cms) {
      matched++;
      const parsedCity = cityFromCbsa(cms.cbsa, state);
      if (parsedCity && !city) {
        city = parsedCity;
        enrichedCity++;
      }
      if (cms.ccn && !ccn) {
        ccn = cms.ccn;
        enrichedCcn++;
      }
    }
    if (!healthSystem) {
      const inferred = inferHealthSystem(name);
      if (inferred) {
        healthSystem = inferred;
        enrichedSystem++;
      }
    }

    return `  ${formatEntry({ name, state, city, ccn, healthSystem }, useDoubleName)},`;
  });

  return {
    content: out.join('\n'),
    stats: { matched, enrichedCity, enrichedSystem, enrichedCcn },
  };
}

async function main() {
  console.log('Downloading CMS participant list…');
  const workbook = await downloadCmsXlsx();
  const cmsMap = loadCmsRows(workbook);
  console.log(`CMS rows: ${cmsMap.size}`);

  const source = fs.readFileSync(hospitalsPath, 'utf8');
  const { content, stats } = enrichFile(source, cmsMap);
  fs.writeFileSync(hospitalsPath, content);

  console.log('Enrichment complete:');
  console.log(`  Matched to CMS: ${stats.matched}`);
  console.log(`  Cities added: ${stats.enrichedCity}`);
  console.log(`  Health systems inferred: ${stats.enrichedSystem}`);
  console.log(`  CCNs added: ${stats.enrichedCcn}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
