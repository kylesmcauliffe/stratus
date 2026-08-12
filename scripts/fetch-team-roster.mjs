#!/usr/bin/env node
/**
 * Download CMS TEAM participant XLSX and regenerate team-hospitals.ts
 * Usage: npm run fetch:team-roster
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import xlsx from 'xlsx';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const sourcesDir = path.join(root, 'data/sources');
const xlsxPath = path.join(sourcesDir, 'team-participant-list.xlsx');
const csvPath = path.join(sourcesDir, '2026q1-team-participant-list.csv');

const TEAM_LIST_URL = 'https://www.cms.gov/team-model-participant-list';

async function downloadRoster() {
  fs.mkdirSync(sourcesDir, { recursive: true });
  const res = await fetch(TEAM_LIST_URL);
  if (!res.ok) throw new Error(`Download failed: ${res.status} ${TEAM_LIST_URL}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(xlsxPath, buf);
  console.log(`Downloaded ${(buf.length / 1024).toFixed(0)} KB → ${xlsxPath}`);
}

function xlsxToCsv() {
  const wb = xlsx.readFile(xlsxPath);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' });

  const lines = [];
  for (const row of rows) {
    if (!row || !row.length) continue;
    const first = String(row[0] ?? '').trim();
    if (first.startsWith('Acute care hospitals') || first.startsWith('Notes:')) continue;
    if (first === 'End of Worksheet') break;
    if (first === 'Mandatory or Voluntary Participant') continue;

    const participation = String(row[0] ?? '').trim();
    const ccn = String(row[1] ?? '').replace(/\D/g, '').padStart(6, '0');
    const name = String(row[2] ?? '').trim();
    const cbsaCode = String(row[3] ?? '').trim();
    const cbsaName = String(row[4] ?? '').trim();
    const state = String(row[5] ?? '').trim().toUpperCase();
    if (ccn.length !== 6 || !name || !state) continue;

    const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
    lines.push([participation, ccn, esc(name), cbsaCode, esc(cbsaName), state].join(','));
  }

  fs.writeFileSync(csvPath, lines.join('\n') + '\n');
  console.log(`Wrote ${lines.length} rows → ${csvPath}`);
  return lines.length;
}

async function main() {
  await downloadRoster();
  const count = xlsxToCsv();
  execSync(`node scripts/sync-team-roster-from-csv.mjs "${csvPath}"`, { cwd: root, stdio: 'inherit' });
  console.log(`TEAM roster synced (${count} hospitals)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
