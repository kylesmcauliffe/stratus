#!/usr/bin/env node
/**
 * Synthesize Rainfall tracker fields from CMS directory metrics when Master Tracker CSV is unavailable.
 * Usage: npm run synth:tracker
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const indexPath = path.join(root, 'src/data/hospital-directory-index.json');
const outPath = path.join(root, 'src/data/hospital-rainfall-tracker.json');

const REGIONS = {
  CT: 'Northeast', ME: 'Northeast', MA: 'Northeast', NH: 'Northeast', RI: 'Northeast', VT: 'Northeast',
  NJ: 'Northeast', NY: 'Northeast', PA: 'Northeast', DE: 'Northeast', MD: 'Northeast', DC: 'Northeast',
  AL: 'South', AR: 'South', FL: 'South', GA: 'South', KY: 'South', LA: 'South', MS: 'South', NC: 'South',
  OK: 'South', SC: 'South', TN: 'South', TX: 'South', VA: 'South', WV: 'South',
  IL: 'Midwest', IN: 'Midwest', IA: 'Midwest', KS: 'Midwest', MI: 'Midwest', MN: 'Midwest', MO: 'Midwest',
  NE: 'Midwest', ND: 'Midwest', OH: 'Midwest', SD: 'Midwest', WI: 'Midwest',
  AZ: 'West', CO: 'West', ID: 'West', MT: 'West', NV: 'West', NM: 'West', UT: 'West', WY: 'West',
  AK: 'West', CA: 'West', HI: 'West', OR: 'West', WA: 'West',
};

function score(h) {
  const stars = h.overallRating ?? 0;
  const mspb = h.mspbScore ?? 1;
  const beds = h.beds ?? 0;
  const hvbp = h.hvbpTps ?? 50;
  const penalty = h.hacrpPenalty ? -15 : 0;
  return stars * 20 + Math.max(0, 1.15 - mspb) * 40 + Math.min(beds / 50, 20) + hvbp * 0.2 + penalty;
}

function main() {
  const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  const hospitals = [...index.hospitals].sort((a, b) => score(b) - score(a));
  const byCcn = {};

  hospitals.forEach((h, i) => {
    if (!h.ccn) return;
    const rank = i + 1;
    const top50 = rank <= 50;
    const outreachRoll = (rank + (h.overallRating ?? 3) * 17) % 100;
    const outreachStatus = outreachRoll < 35 ? 'Yes' : outreachRoll < 55 ? 'Partial' : 'No';
    const pipelineStatuses = ['Cold', 'Prospecting', 'Demo', 'LOI', 'Active'];
    const pipelineStatus = pipelineStatuses[Math.min(4, Math.floor(rank / 150))];
    const salesStages = ['Research', 'Intro', 'Discovery', 'Pilot', 'SOW Review', 'Contract', 'Live'];
    const salesStage = salesStages[Math.min(6, Math.floor(rank / 100))];
    const estTcv = Math.round((h.beds ?? 200) * 1800 + (6 - (h.overallRating ?? 3)) * 120000);

    byCcn[h.ccn] = {
      hospitalName: h.name,
      ccn: h.ccn,
      healthSystem: h.healthSystem,
      state: h.state,
      region: REGIONS[h.state] ?? 'South',
      teamRankByCjr: rank,
      cjrTop50: top50,
      cjrQualityComposite: Math.round(100 - rank / 8),
      cjrOverallRank: rank,
      outreachStatus,
      pipelineStatus,
      salesStage,
      estTcv,
    };
  });

  fs.writeFileSync(
    outPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        source: 'synthetic-from-cms-metrics',
        count: Object.keys(byCcn).length,
        byCcn,
      },
      null,
      2,
    ),
  );
  console.log(`Synthesized tracker for ${Object.keys(byCcn).length} hospitals → ${outPath}`);
}

main();
