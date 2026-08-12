#!/usr/bin/env node
/**
 * Export hospital-rainfall-tracker.json → Master Tracker CSV (import-rainfall-tracker format).
 * Usage: npm run export:tracker-csv [output.csv]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const trackerPath = path.join(root, 'src/data/hospital-rainfall-tracker.json');
const indexPath = path.join(root, 'src/data/hospital-directory-index.json');
const outPath =
  process.argv[2] ?? path.join(root, 'data/sources/rainfall-master-tracker.csv');

const HEADERS = [
  'Hospital Name',
  'Hospital CCN',
  'Affiliated Health System',
  'Location (City/Metro)',
  'State',
  'Region',
  'CBSA',
  'Participant Type',
  'Newly Identified',
  'TEAM Rank by CJR',
  'CJR Top 50',
  'CJR Quality Composite',
  'CJR Overall Rank (of 307)',
  'Outreach Status',
  'System # of Sites',
  'Pipeline Status',
  'Sales Stage',
  'Leadership Buy In',
  'ACV - Track 1',
  'ACV - Track 2',
  'Est. TCV',
  'Health System Impact',
  'Contact Name',
  'Contact Email',
  'Contact Title',
  'Contact Phone',
  'Next Steps',
  'Contact 2 Name',
  'Contact 2 Email',
  'Contact 3 Name',
  'Contact 3 Email',
  'Contact 4 Name',
  'Contact 4 Email',
  'Contact 5 Name',
  'Contact 5 Email',
  'Contact 6 Name',
  'Contact 6 Email',
  'Contact 7 Name',
  'Contact 7 Email',
];

function esc(v) {
  const s = String(v ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function yesNo(v) {
  if (v === true) return 'Yes';
  if (v === false) return 'No';
  return '';
}

function money(v) {
  if (v == null || !Number.isFinite(v)) return '';
  return `$${Math.round(v).toLocaleString('en-US')}`;
}

function main() {
  const tracker = JSON.parse(fs.readFileSync(trackerPath, 'utf8'));
  const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  const byCcn = new Map(index.hospitals.filter((h) => h.ccn).map((h) => [h.ccn, h]));

  const rows = [HEADERS.join(',')];
  for (const rec of Object.values(tracker.byCcn)) {
    const h = byCcn.get(rec.ccn);
    const extra = rec.additionalContacts ?? [];
    const row = [
      rec.hospitalName || h?.name || '',
      rec.ccn || '',
      rec.healthSystem || h?.healthSystem || '',
      rec.metro || h?.city || h?.cbsaName || '',
      rec.state || h?.state || '',
      rec.region || h?.region || '',
      rec.cbsaCode || h?.medicareCbsaNumber || '',
      rec.participantType || 'Mandatory',
      rec.newlyIdentified ? 'Y' : 'N',
      rec.teamRankByCjr ?? '',
      yesNo(rec.cjrTop50),
      rec.cjrQualityComposite ?? '',
      rec.cjrOverallRank ?? '',
      rec.outreachStatus ?? '',
      rec.systemSiteCount ?? '',
      rec.pipelineStatus ?? '',
      rec.salesStage ?? '',
      rec.leadershipBuyIn ?? '',
      money(rec.acvTrack1),
      money(rec.acvTrack2),
      money(rec.estTcv),
      money(rec.healthSystemImpact),
      rec.contactName ?? '',
      rec.contactEmail ?? '',
      rec.contactTitle ?? '',
      rec.contactPhone ?? '',
      rec.nextSteps ?? '',
      extra[0]?.name ?? '',
      extra[0]?.email ?? '',
      extra[1]?.name ?? '',
      extra[1]?.email ?? '',
      extra[2]?.name ?? '',
      extra[2]?.email ?? '',
      extra[3]?.name ?? '',
      extra[3]?.email ?? '',
      extra[4]?.name ?? '',
      extra[4]?.email ?? '',
      extra[5]?.name ?? '',
      extra[5]?.email ?? '',
      extra[6]?.name ?? '',
      extra[6]?.email ?? '',
    ];
    rows.push(row.map(esc).join(','));
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, rows.join('\n') + '\n');
  console.log(`Exported ${Object.keys(tracker.byCcn).length} rows → ${outPath}`);
}

main();
