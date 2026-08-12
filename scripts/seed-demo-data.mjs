#!/usr/bin/env node
/**
 * Demo hospital dataset for Expo development when CMS source CSVs are unavailable.
 * Run: npm run seed:demo
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const dataDir = path.join(root, 'src/data');

const DEMO_HOSPITALS = [
  { name: 'Cedars-Sinai Medical Center', state: 'CA', city: 'Los Angeles', ccn: '050625', healthSystem: 'Cedars-Sinai', region: 'West', overallRating: 5, beds: 886, discharges: 52000, mspbScore: 0.98, hvbpTps: 72, hcahpsStar: 4, hacrpPenalty: false, teamRankByCjr: 12, cjrTop50: true, outreachStatus: 'Yes', pipelineStatus: 'Demo', salesStage: 'SOW Review', estTcv: 2400000, ownership: 'Nonprofit', ruralUrban: 'U' },
  { name: 'UCLA Medical Center', state: 'CA', city: 'Los Angeles', ccn: '050262', healthSystem: 'UCLA Health', region: 'West', overallRating: 5, beds: 520, discharges: 31000, mspbScore: 1.02, hvbpTps: 68, hcahpsStar: 4, hacrpPenalty: false, teamRankByCjr: 28, cjrTop50: true, outreachStatus: 'Yes', pipelineStatus: 'Prospecting', salesStage: 'Discovery', estTcv: 1800000, ownership: 'Government', ruralUrban: 'U' },
  { name: 'Stanford Health Care', state: 'CA', city: 'Stanford', ccn: '050441', healthSystem: 'Stanford Medicine', region: 'West', overallRating: 5, beds: 613, discharges: 28000, mspbScore: 0.95, hvbpTps: 78, hcahpsStar: 5, hacrpPenalty: false, teamRankByCjr: 8, cjrTop50: true, outreachStatus: 'Yes', pipelineStatus: 'LOI', salesStage: 'Contract', estTcv: 3200000, ownership: 'Nonprofit', ruralUrban: 'U' },
  { name: 'Memorial Hermann Texas Medical Center', state: 'TX', city: 'Houston', ccn: '450068', healthSystem: 'Memorial Hermann', region: 'South', overallRating: 4, beds: 1050, discharges: 48000, mspbScore: 1.08, hvbpTps: 55, hcahpsStar: 3, hacrpPenalty: true, teamRankByCjr: 145, cjrTop50: false, outreachStatus: 'Partial', pipelineStatus: 'Prospecting', salesStage: 'Intro', estTcv: 950000, ownership: 'Nonprofit', ruralUrban: 'U' },
  { name: 'Houston Methodist Hospital', state: 'TX', city: 'Houston', ccn: '450076', healthSystem: 'Houston Methodist', region: 'South', overallRating: 5, beds: 907, discharges: 42000, mspbScore: 1.01, hvbpTps: 64, hcahpsStar: 4, hacrpPenalty: false, teamRankByCjr: 52, cjrTop50: false, outreachStatus: 'Yes', pipelineStatus: 'Demo', salesStage: 'Pilot', estTcv: 1600000, ownership: 'Nonprofit', ruralUrban: 'U' },
  { name: 'NYU Langone Hospitals', state: 'NY', city: 'New York', ccn: '330214', healthSystem: 'NYU Langone', region: 'Northeast', overallRating: 5, beds: 725, discharges: 39000, mspbScore: 0.99, hvbpTps: 71, hcahpsStar: 4, hacrpPenalty: false, teamRankByCjr: 19, cjrTop50: true, outreachStatus: 'Yes', pipelineStatus: 'Active', salesStage: 'Implementation', estTcv: 2800000, ownership: 'Nonprofit', ruralUrban: 'U' },
  { name: 'Mount Sinai Hospital', state: 'NY', city: 'New York', ccn: '330024', healthSystem: 'Mount Sinai', region: 'Northeast', overallRating: 4, beds: 1171, discharges: 55000, mspbScore: 1.12, hvbpTps: 48, hcahpsStar: 3, hacrpPenalty: true, teamRankByCjr: 210, cjrTop50: false, outreachStatus: 'No', pipelineStatus: 'Cold', salesStage: 'Research', estTcv: 720000, ownership: 'Nonprofit', ruralUrban: 'U' },
  { name: 'Massachusetts General Hospital', state: 'MA', city: 'Boston', ccn: '220071', healthSystem: 'Mass General Brigham', region: 'Northeast', overallRating: 5, beds: 999, discharges: 47000, mspbScore: 1.04, hvbpTps: 66, hcahpsStar: 4, hacrpPenalty: false, teamRankByCjr: 35, cjrTop50: true, outreachStatus: 'Yes', pipelineStatus: 'Demo', salesStage: 'SOW Review', estTcv: 2100000, ownership: 'Nonprofit', ruralUrban: 'U' },
  { name: 'Mayo Clinic Hospital Rochester', state: 'MN', city: 'Rochester', ccn: '240014', healthSystem: 'Mayo Clinic', region: 'Midwest', overallRating: 5, beds: 1265, discharges: 62000, mspbScore: 0.92, hvbpTps: 82, hcahpsStar: 5, hacrpPenalty: false, teamRankByCjr: 3, cjrTop50: true, outreachStatus: 'Yes', pipelineStatus: 'Active', salesStage: 'Live', estTcv: 4500000, ownership: 'Nonprofit', ruralUrban: 'U' },
  { name: 'Northwestern Memorial Hospital', state: 'IL', city: 'Chicago', ccn: '140281', healthSystem: 'Northwestern Medicine', region: 'Midwest', overallRating: 5, beds: 894, discharges: 41000, mspbScore: 1.0, hvbpTps: 69, hcahpsStar: 4, hacrpPenalty: false, teamRankByCjr: 41, cjrTop50: true, outreachStatus: 'Yes', pipelineStatus: 'Prospecting', salesStage: 'Discovery', estTcv: 1750000, ownership: 'Nonprofit', ruralUrban: 'U' },
  { name: 'Emory University Hospital', state: 'GA', city: 'Atlanta', ccn: '110079', healthSystem: 'Emory Healthcare', region: 'South', overallRating: 5, beds: 733, discharges: 36000, mspbScore: 1.06, hvbpTps: 58, hcahpsStar: 4, hacrpPenalty: false, teamRankByCjr: 88, cjrTop50: false, outreachStatus: 'Partial', pipelineStatus: 'Prospecting', salesStage: 'Intro', estTcv: 1100000, ownership: 'Nonprofit', ruralUrban: 'U' },
  { name: 'Duke University Hospital', state: 'NC', city: 'Durham', ccn: '340030', healthSystem: 'Duke Health', region: 'South', overallRating: 5, beds: 957, discharges: 44000, mspbScore: 0.97, hvbpTps: 74, hcahpsStar: 4, hacrpPenalty: false, teamRankByCjr: 22, cjrTop50: true, outreachStatus: 'Yes', pipelineStatus: 'Demo', salesStage: 'Pilot', estTcv: 2300000, ownership: 'Nonprofit', ruralUrban: 'U' },
  { name: 'University of Michigan Hospital', state: 'MI', city: 'Ann Arbor', ccn: '230046', healthSystem: 'Michigan Medicine', region: 'Midwest', overallRating: 5, beds: 1000, discharges: 46000, mspbScore: 1.03, hvbpTps: 63, hcahpsStar: 4, hacrpPenalty: false, teamRankByCjr: 47, cjrTop50: true, outreachStatus: 'Yes', pipelineStatus: 'LOI', salesStage: 'Contract', estTcv: 1950000, ownership: 'Government', ruralUrban: 'U' },
  { name: 'Banner University Medical Center Phoenix', state: 'AZ', city: 'Phoenix', ccn: '030014', healthSystem: 'Banner Health', region: 'West', overallRating: 4, beds: 712, discharges: 33000, mspbScore: 1.09, hvbpTps: 51, hcahpsStar: 3, hacrpPenalty: true, teamRankByCjr: 312, cjrTop50: false, outreachStatus: 'No', pipelineStatus: 'Cold', salesStage: 'Research', estTcv: 580000, ownership: 'Nonprofit', ruralUrban: 'U' },
  { name: 'Mercy Hospital Springfield', state: 'MO', city: 'Springfield', ccn: '260047', healthSystem: 'Mercy', region: 'Midwest', overallRating: 3, beds: 886, discharges: 29000, mspbScore: 1.14, hvbpTps: 42, hcahpsStar: 3, hacrpPenalty: true, teamRankByCjr: 489, cjrTop50: false, outreachStatus: 'No', pipelineStatus: 'Cold', salesStage: 'Research', estTcv: 420000, ownership: 'Nonprofit', ruralUrban: 'R' },
  { name: 'St. Mary Medical Center', state: 'PA', city: 'Langhorne', ccn: '390049', healthSystem: 'Trinity Health', region: 'Northeast', overallRating: 3, beds: 357, discharges: 18000, mspbScore: 1.11, hvbpTps: 45, hcahpsStar: 3, hacrpPenalty: false, teamRankByCjr: 378, cjrTop50: false, outreachStatus: 'Partial', pipelineStatus: 'Prospecting', salesStage: 'Intro', estTcv: 390000, ownership: 'Nonprofit', ruralUrban: 'U' },
  { name: 'UCHealth University of Colorado Hospital', state: 'CO', city: 'Aurora', ccn: '060009', healthSystem: 'UCHealth', region: 'West', overallRating: 5, beds: 678, discharges: 32000, mspbScore: 0.96, hvbpTps: 76, hcahpsStar: 4, hacrpPenalty: false, teamRankByCjr: 31, cjrTop50: true, outreachStatus: 'Yes', pipelineStatus: 'Demo', salesStage: 'SOW Review', estTcv: 1650000, ownership: 'Government', ruralUrban: 'U' },
  { name: 'Oregon Health & Science University Hospital', state: 'OR', city: 'Portland', ccn: '220009', healthSystem: 'OHSU', region: 'West', overallRating: 4, beds: 576, discharges: 24000, mspbScore: 1.05, hvbpTps: 59, hcahpsStar: 4, hacrpPenalty: false, teamRankByCjr: 156, cjrTop50: false, outreachStatus: 'Partial', pipelineStatus: 'Prospecting', salesStage: 'Discovery', estTcv: 880000, ownership: 'Government', ruralUrban: 'U' },
  { name: 'Vanderbilt University Medical Center', state: 'TN', city: 'Nashville', ccn: '440039', healthSystem: 'Vanderbilt Health', region: 'South', overallRating: 5, beds: 865, discharges: 43000, mspbScore: 1.0, hvbpTps: 67, hcahpsStar: 4, hacrpPenalty: false, teamRankByCjr: 55, cjrTop50: false, outreachStatus: 'Yes', pipelineStatus: 'LOI', salesStage: 'Contract', estTcv: 1880000, ownership: 'Nonprofit', ruralUrban: 'U' },
  { name: 'University of Washington Medical Center', state: 'WA', city: 'Seattle', ccn: '500008', healthSystem: 'UW Medicine', region: 'West', overallRating: 5, beds: 450, discharges: 22000, mspbScore: 0.94, hvbpTps: 79, hcahpsStar: 5, hacrpPenalty: false, teamRankByCjr: 15, cjrTop50: true, outreachStatus: 'Yes', pipelineStatus: 'Active', salesStage: 'Live', estTcv: 2600000, ownership: 'Government', ruralUrban: 'U' },
  { name: 'Intermountain Medical Center', state: 'UT', city: 'Murray', ccn: '460009', healthSystem: 'Intermountain Health', region: 'West', overallRating: 4, beds: 504, discharges: 26000, mspbScore: 0.99, hvbpTps: 61, hcahpsStar: 4, hacrpPenalty: false, teamRankByCjr: 98, cjrTop50: false, outreachStatus: 'Yes', pipelineStatus: 'Demo', salesStage: 'Pilot', estTcv: 1250000, ownership: 'Nonprofit', ruralUrban: 'U' },
];

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function assignSlugs(inputs) {
  const baseCounts = new Map();
  return inputs.map((input) => {
    const base = `${slugify(input.name)}-${slugify(input.state)}`;
    const n = (baseCounts.get(base) ?? 0) + 1;
    baseCounts.set(base, n);
    return { ...input, slug: n === 1 ? base : `${base}-${n}` };
  });
}

function median(nums) {
  if (!nums.length) return null;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

const hospitals = assignSlugs(DEMO_HOSPITALS).map((h) => ({
  slug: h.slug,
  name: h.name,
  state: h.state,
  city: h.city,
  ccn: h.ccn,
  healthSystem: h.healthSystem,
  overallRating: h.overallRating,
  beds: h.beds,
  discharges: h.discharges,
  fte: Math.round(h.beds * 2.4),
  ruralUrban: h.ruralUrban,
  ownership: h.ownership,
  population: Math.round(h.beds * 1200),
  medianIncome: 62000 + Math.round(Math.random() * 28000),
  cbsaPopulation: Math.round(h.beds * 8000),
  cbsaMedianIncome: 58000 + Math.round(Math.random() * 32000),
  hcahpsStar: h.hcahpsStar,
  hvbpTps: h.hvbpTps,
  mspbScore: h.mspbScore,
  hacrpPenalty: h.hacrpPenalty,
  hrrpAvgExcess: h.overallRating <= 3 ? 1.08 : h.overallRating === 4 ? 1.02 : 0.97,
  hrrpConditionsAbovePeers: h.overallRating <= 3 ? 4 : h.overallRating === 4 ? 2 : 0,
  region: h.region,
  teamRankByCjr: h.teamRankByCjr,
  cjrTop50: h.cjrTop50,
  cjrQualityComposite: 100 - Math.round(h.teamRankByCjr / 5),
  cjrOverallRank: h.teamRankByCjr,
  outreachStatus: h.outreachStatus,
  pipelineStatus: h.pipelineStatus,
  salesStage: h.salesStage,
  estTcv: h.estTcv,
  systemSiteCount: 5 + Math.floor(Math.random() * 20),
}));

const filterOptions = {
  ownership: [...new Set(hospitals.map((h) => h.ownership).filter(Boolean))].sort(),
  healthSystems: [...new Set(hospitals.map((h) => h.healthSystem).filter(Boolean))].sort(),
  regions: [...new Set(hospitals.map((h) => h.region).filter(Boolean))].sort(),
  pipelineStatuses: [...new Set(hospitals.map((h) => h.pipelineStatus).filter(Boolean))].sort(),
  salesStages: [...new Set(hospitals.map((h) => h.salesStage).filter(Boolean))].sort(),
  outreachStatuses: [...new Set(hospitals.map((h) => h.outreachStatus).filter(Boolean))].sort(),
};

const byState = {};
for (const h of hospitals) {
  (byState[h.state] ??= []).push(h);
}

const stateSummaries = {};
for (const [state, list] of Object.entries(byState)) {
  const stars = list.map((h) => h.overallRating).filter((n) => n != null);
  const beds = list.map((h) => h.beds).filter((n) => n != null);
  const rural = list.filter((h) => h.ruralUrban === 'R').length;
  const ownershipCounts = {};
  for (const h of list) {
    if (!h.ownership) continue;
    ownershipCounts[h.ownership] = (ownershipCounts[h.ownership] ?? 0) + 1;
  }
  stateSummaries[state] = {
    state,
    count: list.length,
    medianStars: median(stars),
    medianBeds: median(beds),
    medianMspb: median(list.map((h) => h.mspbScore).filter((n) => n != null)),
    medianHvbpTps: median(list.map((h) => h.hvbpTps).filter((n) => n != null)),
    medianHcahpsStar: median(list.map((h) => h.hcahpsStar).filter((n) => n != null)),
    medianTeamRankCjr: median(list.map((h) => h.teamRankByCjr).filter((n) => n != null)),
    pctRural: list.length ? Math.round((rural / list.length) * 100) : 0,
    pctOutreachYes: list.length ? Math.round((list.filter((h) => h.outreachStatus === 'Yes').length / list.length) * 100) : 0,
    totalBeds: beds.reduce((a, b) => a + b, 0),
    withPublicDataCount: list.length,
    ownershipBreakdown: Object.entries(ownershipCounts).map(([label, count]) => ({ label, count })),
  };
}

const national = {
  medianStars: median(hospitals.map((h) => h.overallRating).filter(Boolean)),
  medianBeds: median(hospitals.map((h) => h.beds).filter(Boolean)),
  medianMspb: median(hospitals.map((h) => h.mspbScore).filter(Boolean)),
  medianHvbpTps: median(hospitals.map((h) => h.hvbpTps).filter(Boolean)),
  medianHcahpsStar: median(hospitals.map((h) => h.hcahpsStar).filter(Boolean)),
  medianHrrpExcess: median(hospitals.map((h) => h.hrrpAvgExcess).filter(Boolean)),
  medianTeamRankCjr: median(hospitals.map((h) => h.teamRankByCjr).filter(Boolean)),
  pctHacrpPenalty: Math.round((hospitals.filter((h) => h.hacrpPenalty).length / hospitals.length) * 100),
  pctOutreachYes: Math.round((hospitals.filter((h) => h.outreachStatus === 'Yes').length / hospitals.length) * 100),
};

const generatedAt = new Date().toISOString();

fs.mkdirSync(dataDir, { recursive: true });

fs.writeFileSync(
  path.join(dataDir, 'hospital-directory-index.json'),
  JSON.stringify({ generatedAt, hospitals, filterOptions }, null, 2),
);

fs.writeFileSync(
  path.join(dataDir, 'state-summaries.json'),
  JSON.stringify({ generatedAt, byState: stateSummaries }, null, 2),
);

fs.writeFileSync(
  path.join(dataDir, 'research-benchmarks.json'),
  JSON.stringify({ generatedAt, national, byState: stateSummaries }, null, 2),
);

const teamLines = hospitals.map(
  (h) =>
    `  { name: ${JSON.stringify(h.name)}, state: '${h.state}', city: ${JSON.stringify(h.city)}, ccn: '${h.ccn}', participation: 'Mandatory', healthSystem: ${JSON.stringify(h.healthSystem)} },`,
);

const teamTs = `/** Demo TEAM roster — replace with npm run sync:team-roster for production data. */
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

export const teamHospitals: TeamHospital[] = [
${teamLines.join('\n')}
].map((h, _, arr) => {
  const slug = ${JSON.stringify(hospitals.map((h) => h.slug))}[arr.indexOf(h)] ?? '';
  return { ...h, slug };
});

export const TEAM_MANDATED_HOSPITAL_COUNT = teamHospitals.length;
`;

// Fix team-hospitals.ts with proper slug assignment
const teamHospitalsTs = `/** Demo TEAM roster — replace with npm run sync:team-roster for production data. */
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

export const teamHospitals: TeamHospital[] = [
${hospitals
  .map(
    (h) =>
      `  { slug: ${JSON.stringify(h.slug)}, name: ${JSON.stringify(h.name)}, state: '${h.state}', city: ${JSON.stringify(h.city)}, ccn: '${h.ccn}', participation: 'Mandatory', healthSystem: ${JSON.stringify(h.healthSystem)} },`,
  )
  .join('\n')}
];

export const TEAM_MANDATED_HOSPITAL_COUNT = teamHospitals.length;
`;

fs.writeFileSync(path.join(dataDir, 'team-hospitals.ts'), teamHospitalsTs);

console.log(`Seeded ${hospitals.length} demo hospitals → src/data/`);
