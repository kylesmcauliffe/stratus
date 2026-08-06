#!/usr/bin/env node
/**
 * Fetch Census ACS 5-year county demographics for counties in hospital-public-profiles.json.
 * Requires CENSUS_API_KEY (free at https://api.census.gov/data/key_signup.html).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const profilesPath = path.join(root, 'src/data/hospital-public-profiles.json');
const outPath = path.join(root, 'src/data/county-demographics.json');

const STATE_FIPS = {
  AL: '01', AK: '02', AZ: '04', AR: '05', CA: '06', CO: '08', CT: '09', DE: '10', DC: '11',
  FL: '12', GA: '13', HI: '15', ID: '16', IL: '17', IN: '18', IA: '19', KS: '20', KY: '21',
  LA: '22', ME: '23', MD: '24', MA: '25', MI: '26', MN: '27', MS: '28', MO: '29', MT: '30',
  NE: '31', NV: '32', NH: '33', NJ: '34', NM: '35', NY: '36', NC: '37', ND: '38', OH: '39',
  OK: '40', OR: '41', PA: '42', RI: '44', SC: '45', SD: '46', TN: '47', TX: '48', UT: '49',
  VT: '50', VA: '51', WA: '53', WV: '54', WI: '55', WY: '56', PR: '72', VI: '78', GU: '66',
};

function loadEnvFiles() {
  for (const name of ['.env', '.env.local']) {
    const file = path.join(root, name);
    if (!fs.existsSync(file)) continue;
    for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq < 1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

function normalizeCounty(name) {
  return name
    .trim()
    .toUpperCase()
    .replace(/\s+COUNTY$/i, '')
    .replace(/\s+PARISH$/i, '')
    .replace(/\s+BOROUGH$/i, '')
    .replace(/\s+CITY$/i, '')
    .replace(/\s+/g, ' ');
}

function countyKey(state, county) {
  return `${state.trim().toUpperCase()}|${normalizeCounty(county)}`;
}

async function fetchAcsForState(state, fips, apiKey) {
  const base =
    `https://api.census.gov/data/2022/acs/acs5?get=NAME,B01003_001E,B19013_001E&for=county:*&in=state:${fips}`;
  const url = apiKey ? `${base}&key=${encodeURIComponent(apiKey)}` : base;
  const res = await fetch(url);
  const text = await res.text();
  if (!res.ok || text.includes('<html')) {
    throw new Error(`Census API ${state}: ${res.status} — ${text.slice(0, 120)}`);
  }
  const data = JSON.parse(text);
  const rows = data.slice(1);
  const byCounty = {};
  for (const row of rows) {
    const name = row[0];
    const population = row[1] === null ? null : Number(row[1]);
    const medianIncome = row[2] === null ? null : Number(row[2]);
    const countyName = name.split(',')[0].trim();
    byCounty[normalizeCounty(countyName)] = {
      population: Number.isFinite(population) ? population : null,
      medianIncome: Number.isFinite(medianIncome) ? medianIncome : null,
      countyName,
      state,
    };
  }
  return byCounty;
}

function writeEmpty(reason) {
  const existing = fs.existsSync(outPath) ? JSON.parse(fs.readFileSync(outPath, 'utf8')) : null;
  if (existing?.byKey && Object.keys(existing.byKey).length > 0) {
    console.warn(`${reason} — keeping existing county-demographics.json`);
    return;
  }
  fs.writeFileSync(
    outPath,
    JSON.stringify({ generatedAt: new Date().toISOString().slice(0, 10), byKey: {} }, null, 2),
  );
  console.warn(`${reason} — wrote empty county-demographics.json`);
}

async function main() {
  loadEnvFiles();
  const apiKey = process.env.CENSUS_API_KEY?.trim();
  if (!apiKey) {
    writeEmpty('CENSUS_API_KEY not set (get one at https://api.census.gov/data/key_signup.html)');
    return;
  }

  const profiles = JSON.parse(fs.readFileSync(profilesPath, 'utf8'));
  const needed = new Map();
  for (const entry of Object.values(profiles.byCcn)) {
    const state = entry.general?.state;
    const county = entry.general?.county;
    if (!state || !county) continue;
    const key = countyKey(state, county);
    if (!needed.has(key)) needed.set(key, { state, county });
  }

  const statesNeeded = [...new Set([...needed.values()].map((v) => v.state))];
  console.log(`Counties needed: ${needed.size} across ${statesNeeded.length} states`);

  const byKey = {};
  let matched = 0;
  for (const st of statesNeeded.sort()) {
    const fips = STATE_FIPS[st];
    if (!fips) {
      console.warn(`  Skip unknown state: ${st}`);
      continue;
    }
    const acs = await fetchAcsForState(st, fips, apiKey);
    for (const [key, { county }] of needed) {
      if (!key.startsWith(`${st}|`)) continue;
      const norm = normalizeCounty(county);
      const demo = acs[norm];
      if (demo) {
        byKey[key] = demo;
        matched++;
      }
    }
    await new Promise((r) => setTimeout(r, 120));
  }

  fs.writeFileSync(
    outPath,
    JSON.stringify({ generatedAt: new Date().toISOString().slice(0, 10), byKey }, null, 2),
  );
  console.log(`Matched ${matched}/${needed.size} counties → ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
