#!/usr/bin/env node
/**
 * Regenerate src/data/team-hospitals.ts from CMS TEAM participant list CSV.
 *
 * Usage:
 *   node scripts/sync-team-roster-from-csv.mjs
 *   node scripts/sync-team-roster-from-csv.mjs /path/to/list.csv
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const defaultCsv = path.join(root, 'data/sources/2026q1-team-participant-list.csv');
const hospitalsPath = path.join(root, 'src/data/team-hospitals.ts');

const CLOSED_TEAM_FACILITIES = new Set([
  'ALEXANDRIA EMERGENCY HOSPITAL',
  'ADVENTHEALTH PALM COAST PARKWAY',
]);

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
  ['CHRISTUS ', 'Christus Health'],
  ['CLEVELAND CLINIC', 'Cleveland Clinic'],
  ['COMMONSPIRIT', 'CommonSpirit Health'],
  ['COMMUNITY HEALTH SYSTEM', 'Community Health Systems'],
  ['DUKE UNIVERSITY', 'Duke Health'],
  ['EMORY ', 'Emory Healthcare'],
  ['HCA ', 'HCA Healthcare'],
  ['HENRY FORD', 'Henry Ford Health'],
  ['INTERMOUNTAIN', 'Intermountain Health'],
  ['KAISER', 'Kaiser Permanente'],
  ['MERCY ', 'Mercy'],
  ['METHODIST ', 'Methodist'],
  ['MOUNT SINAI', 'Mount Sinai Health System'],
  ['NORTHWELL', 'Northwell Health'],
  ['NYU ', 'NYU Langone Health'],
  ['OHIOHEALTH', 'OhioHealth'],
  ['ORLANDO HEALTH', 'Orlando Health'],
  ['PROVIDENCE ', 'Providence'],
  ['SENTARA ', 'Sentara Health'],
  ['SSM ', 'SSM Health'],
  ['STANFORD', 'Stanford Medicine'],
  ['TENET ', 'Tenet Healthcare'],
  ['TRINITY HEALTH', 'Trinity Health'],
  ['UCLA', 'UCLA Health'],
  ['UCSF', 'UCSF Health'],
  ['UNC ', 'UNC Health'],
  ['VANDERBILT', 'Vanderbilt Health'],
  ['WELLSTAR', 'Wellstar Health System'],
];

function parseCsvLine(line) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (c === ',' && !inQuotes) {
      out.push(cur.trim());
      cur = '';
      continue;
    }
    cur += c;
  }
  out.push(cur.trim());
  return out;
}

function cityFromCbsa(cbsaName) {
  if (!cbsaName) return undefined;
  const parts = cbsaName.split(',').map((p) => p.trim());
  if (parts.length < 2) return cbsaName;
  return parts.slice(0, -1).join(', ') || undefined;
}

function inferHealthSystem(name) {
  const upper = name.toUpperCase();
  for (const [prefix, system] of SYSTEM_PREFIXES) {
    if (upper.startsWith(prefix) || upper.includes(` ${prefix}`)) return system;
  }
  return undefined;
}

function escapeTsString(value) {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function needsDoubleQuotes(name) {
  return name.includes("'") || name.includes('"');
}

function formatEntry(h) {
  const namePart = needsDoubleQuotes(h.name)
    ? `name: "${escapeTsString(h.name).replace(/"/g, '\\"')}"`
    : `name: '${escapeTsString(h.name)}'`;
  const parts = [namePart, `state: '${h.state}'`];
  if (h.city) parts.push(`city: '${escapeTsString(h.city)}'`);
  if (h.ccn) parts.push(`ccn: '${h.ccn}'`);
  if (h.cbsaCode) parts.push(`cbsaCode: '${h.cbsaCode}'`);
  if (h.participation) parts.push(`participation: '${h.participation}'`);
  if (h.healthSystem) parts.push(`healthSystem: '${escapeTsString(h.healthSystem)}'`);
  return `  { ${parts.join(', ')} },`;
}

function loadCsvRows(csvPath) {
  const text = fs.readFileSync(csvPath, 'utf8');
  const rows = [];
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    if (
      line.startsWith('Acute care') ||
      line.startsWith('Notes:') ||
      line.startsWith('Mandatory or Voluntary') ||
      line.startsWith('End of Worksheet')
    ) {
      continue;
    }
    const r = parseCsvLine(line);
    const ccn = String(r[1] ?? '')
      .replace(/\D/g, '')
      .padStart(6, '0')
      .slice(-6);
    if (ccn.length !== 6 || !r[2] || !r[5]) continue;
    const state = r[5].trim().toUpperCase();
    const name = r[2].trim();
    if (CLOSED_TEAM_FACILITIES.has(name)) continue;
    rows.push({
      participation: r[0] === 'Voluntary' ? 'Voluntary' : 'Mandatory',
      ccn,
      name,
      cbsaCode: String(r[3] ?? '').trim() || undefined,
      city: cityFromCbsa(r[4]),
      state,
      healthSystem: inferHealthSystem(name),
    });
  }
  rows.sort((a, b) => a.name.localeCompare(b.name) || a.state.localeCompare(b.state));
  return rows;
}

function generateTs(rows, sourceLabel) {
  const count = rows.length;
  const entries = rows.map(formatEntry).join('\n');
  return `import {
  assignHospitalSlugs,
  buildTeamHospitalsBySlug,
  getTeamHospitalBySlug,
} from '@/lib/hospital-slug';

/**
 * Roster row before slug assignment (source data in this file).
 * city — CBSA metro from CMS TEAM participant list (not street address).
 * cbsaCode — Medicare CBSA from CMS list.
 */
export interface TeamHospitalInput {
  name: string;
  state: string;
  city?: string;
  ccn?: string;
  cbsaCode?: string;
  participation?: 'Mandatory' | 'Voluntary';
  healthSystem?: string;
}

export interface TeamHospital extends TeamHospitalInput {
  slug: string;
}

// ${sourceLabel}
export const TEAM_MANDATED_HOSPITAL_COUNT = ${count};

const CLOSED_TEAM_FACILITIES = new Set<string>([
  'ALEXANDRIA EMERGENCY HOSPITAL',
  'ADVENTHEALTH PALM COAST PARKWAY',
]);

const allTeamHospitalsRaw: TeamHospitalInput[] = [
${entries}
];

const allTeamHospitals = assignHospitalSlugs(allTeamHospitalsRaw);

export const teamHospitals: TeamHospital[] = allTeamHospitals.filter(
  (h) => !CLOSED_TEAM_FACILITIES.has(h.name),
);

export const teamHospitalsBySlug = buildTeamHospitalsBySlug(teamHospitals);

export function lookupTeamHospital(slug: string): TeamHospital | undefined {
  return getTeamHospitalBySlug(slug, teamHospitalsBySlug);
}

export { hospitalProfilePath } from '@/lib/hospital-slug';
`;
}

function main() {
  const csvPath = process.argv[2] ? path.resolve(process.argv[2]) : defaultCsv;
  if (!fs.existsSync(csvPath)) {
    console.error(`CSV not found: ${csvPath}`);
    process.exit(1);
  }
  const rows = loadCsvRows(csvPath);
  const label = `CMS TEAM participant list — ${path.basename(csvPath)} (${rows.length} hospitals, synced ${new Date().toISOString().slice(0, 10)})`;
  fs.writeFileSync(hospitalsPath, generateTs(rows, label));
  console.log(`Wrote ${rows.length} hospitals → ${hospitalsPath}`);
  console.log(
    `  Mandatory: ${rows.filter((r) => r.participation === 'Mandatory').length}, Voluntary: ${rows.filter((r) => r.participation === 'Voluntary').length}`,
  );
}

main();
