#!/usr/bin/env node
/**
 * Census ACS 5-year demographics for CBSAs referenced in hospital cost reports.
 * Requires CENSUS_API_KEY (https://api.census.gov/data/key_signup.html).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const profilesPath = path.join(root, 'src/data/hospital-public-profiles.json');
const outPath = path.join(root, 'src/data/cbsa-demographics.json');

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

function normalizeCbsa(code) {
  const digits = String(code).replace(/\D/g, '');
  if (!digits) return null;
  return digits.padStart(5, '0');
}

async function fetchCbsa(cbsaRaw, apiKey) {
  const cbsa = normalizeCbsa(cbsaRaw);
  if (!cbsa) return null;
  const url =
    `https://api.census.gov/data/2022/acs/acs5?get=NAME,B01003_001E,B19013_001E&for=metropolitan%20statistical%20area/micropolitan%20statistical%20area:${cbsa}&key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url);
  const text = await res.text();
  if (!res.ok || text.includes('<html') || !text.trim()) return null;
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return null;
  }
  if (!Array.isArray(data) || data.length < 2) return null;
  const row = data[1];
  const population = parseNum(row[1]);
  const medianIncome = parseNum(row[2]);
  const name = String(row[0] ?? '').split(',')[0].trim();
  return {
    cbsa,
    name,
    population,
    medianIncome,
  };
}

function parseNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

async function main() {
  loadEnvFiles();
  const apiKey = process.env.CENSUS_API_KEY?.trim();
  if (!apiKey) {
    console.warn('CENSUS_API_KEY not set — skipping CBSA demographics');
    if (!fs.existsSync(outPath)) {
      fs.writeFileSync(outPath, JSON.stringify({ generatedAt: '', byCbsa: {} }, null, 2));
    }
    return;
  }

  const profiles = JSON.parse(fs.readFileSync(profilesPath, 'utf8'));
  const cbsas = new Set();
  for (const entry of Object.values(profiles.byCcn)) {
    const c = entry.costReport?.medicareCbsaNumber;
    if (c && /^\d+$/.test(String(c).trim())) cbsas.add(String(c).trim());
  }

  console.log(`Unique CBSAs: ${cbsas.size}`);
  const byCbsa = {};
  let failed = 0;
  for (const cbsa of [...cbsas].sort()) {
    const demo = await fetchCbsa(cbsa, apiKey);
    const key = normalizeCbsa(cbsa) ?? cbsa;
    if (demo) byCbsa[key] = demo;
    else failed++;
    await new Promise((r) => setTimeout(r, 120));
  }
  if (failed) console.warn(`  ${failed} CBSAs had no ACS match`);

  fs.writeFileSync(
    outPath,
    JSON.stringify({ generatedAt: new Date().toISOString().slice(0, 10), byCbsa }, null, 2),
  );
  console.log(`Wrote ${Object.keys(byCbsa).length}/${cbsas.size} CBSAs → ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
