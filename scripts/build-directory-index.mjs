#!/usr/bin/env node
/**
 * Merge team-hospitals + public profiles + county demographics into directory index + state summaries.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const hospitalsPath = path.join(root, 'src/data/team-hospitals.ts');
const profilesPath = path.join(root, 'src/data/hospital-public-profiles.json');
const countyPath = path.join(root, 'src/data/county-demographics.json');
const cbsaPath = path.join(root, 'src/data/cbsa-demographics.json');
const indexOut = path.join(root, 'src/data/hospital-directory-index.json');
const stateOut = path.join(root, 'src/data/state-summaries.json');
const benchmarksOut = path.join(root, 'src/data/research-benchmarks.json');
const trackerPath = path.join(root, 'src/data/hospital-rainfall-tracker.json');

function normalizeCounty(name) {
  return name
    .trim()
    .toUpperCase()
    .replace(/\s+COUNTY$/i, '')
    .replace(/\s+PARISH$/i, '')
    .replace(/\s+BOROUGH$/i, '')
    .replace(/\s+CITY$/i, '');
}

function countyKey(state, county) {
  return `${state.trim().toUpperCase()}|${normalizeCounty(county)}`;
}

function parseNum(v) {
  if (v == null || v === '') return null;
  const n = Number(String(v).replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
}

const HOSPITAL_LINE_RE =
  /^\s*\{ name: (?:"((?:\\"|[^"])*)"|'((?:\\'|[^'])*)'), state: '([A-Z]{2})'(?:, city: '((?:\\'|[^'])*)')?(?:, ccn: '(\d{6})')?(?:, cbsaCode: '(\d+)')?(?:, participation: '(Mandatory|Voluntary)')?(?:, healthSystem: '((?:\\'|[^'])*)')? \},?\s*$/;

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
      ccn: m[5],
      cbsaCode: m[6],
      participation: m[7],
      healthSystem: m[8]?.replace(/\\'/g, "'"),
    });
  }
  return assignSlugs(raw);
}

function median(nums) {
  if (!nums.length) return null;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

function buildStateSummaries(records) {
  const byState = {};
  for (const r of records) {
    (byState[r.state] ??= []).push(r);
  }
  const summaries = {};
  for (const [state, list] of Object.entries(byState)) {
    const withData = list.filter((h) => h.overallRating != null || h.beds != null);
    const stars = list.map((h) => h.overallRating).filter((n) => n != null);
    const beds = list.map((h) => h.beds).filter((n) => n != null);
    const rural = list.filter((h) => h.ruralUrban === 'R').length;
    const ownershipCounts = {};
    for (const h of list) {
      if (!h.ownership) continue;
      ownershipCounts[h.ownership] = (ownershipCounts[h.ownership] ?? 0) + 1;
    }
    const ownershipBreakdown = Object.entries(ownershipCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([label, count]) => ({ label, count }));

    const mspb = list.map((h) => h.mspbScore).filter((n) => n != null);
    const hvbp = list.map((h) => h.hvbpTps).filter((n) => n != null);
    const hcahps = list.map((h) => h.hcahpsStar).filter((n) => n != null);
    const cjr = list.map((h) => h.teamRankByCjr).filter((n) => n != null);
    const outreachYes = list.filter((h) => h.outreachStatus === 'Yes').length;

    summaries[state] = {
      state,
      count: list.length,
      medianStars: median(stars),
      pctRural: list.length ? Math.round((rural / list.length) * 100) : 0,
      totalBeds: beds.reduce((a, b) => a + b, 0),
      medianBeds: median(beds),
      withPublicDataCount: withData.length,
      ownershipBreakdown,
      medianMspb: median(mspb),
      medianHvbpTps: median(hvbp),
      medianHcahpsStar: median(hcahps),
      medianTeamRankCjr: median(cjr),
      pctOutreachYes: list.length ? Math.round((outreachYes / list.length) * 100) : 0,
    };
  }
  return summaries;
}

function buildBenchmarks(records) {
  const pick = (fn) => records.map(fn).filter((n) => n != null && Number.isFinite(n));
  const national = {
    medianStars: median(pick((h) => h.overallRating)),
    medianBeds: median(pick((h) => h.beds)),
    medianMspb: median(pick((h) => h.mspbScore)),
    medianHvbpTps: median(pick((h) => h.hvbpTps)),
    medianHcahpsStar: median(pick((h) => h.hcahpsStar)),
    medianHrrpExcess: median(pick((h) => h.hrrpAvgExcess)),
    medianTeamRankCjr: median(pick((h) => h.teamRankByCjr)),
    pctHacrpPenalty: records.length
      ? Math.round((records.filter((h) => h.hacrpPenalty).length / records.length) * 100)
      : 0,
    pctOutreachYes: records.length
      ? Math.round((records.filter((h) => h.outreachStatus === 'Yes').length / records.length) * 100)
      : 0,
  };
  return { national };
}

function main() {
  const team = loadTeamHospitals();
  const profiles = JSON.parse(fs.readFileSync(profilesPath, 'utf8'));
  const countyFile = fs.existsSync(countyPath)
    ? JSON.parse(fs.readFileSync(countyPath, 'utf8'))
    : { byKey: {} };
  const cbsaFile = fs.existsSync(cbsaPath)
    ? JSON.parse(fs.readFileSync(cbsaPath, 'utf8'))
    : { byCbsa: {} };
  const trackerFile = fs.existsSync(trackerPath)
    ? JSON.parse(fs.readFileSync(trackerPath, 'utf8'))
    : { byCcn: {} };

  const records = team.map((h) => {
    const pub = h.ccn ? profiles.byCcn[h.ccn] : undefined;
    const g = pub?.general;
    const c = pub?.costReport;
    const ck = g?.county && g?.state ? countyKey(g.state, g.county) : null;
    const demo = ck ? countyFile.byKey[ck] : undefined;
    const cbsaCode = c?.medicareCbsaNumber?.trim();
    const cbsaKey = cbsaCode ? String(cbsaCode).replace(/\D/g, '').padStart(5, '0') : null;
    const cbsaDemo = cbsaKey ? cbsaFile.byCbsa[cbsaKey] ?? cbsaFile.byCbsa[cbsaCode] : undefined;
    const tr = h.ccn ? trackerFile.byCcn[h.ccn] : undefined;

    return {
      slug: h.slug,
      name: h.name,
      state: h.state,
      city: h.city,
      ccn: h.ccn,
      healthSystem: h.healthSystem,
      streetCity: g?.city,
      address: g?.address,
      zip: g?.zip,
      county: g?.county,
      phone: g?.phone,
      hospitalType: g?.hospitalType,
      ownership: g?.ownership,
      emergencyServices: g?.emergencyServices,
      overallRating: parseNum(g?.overallRating),
      beds: parseNum(c?.numberOfBeds),
      discharges: parseNum(c?.totalDischarges),
      fte: parseNum(c?.fteEmployees),
      ruralUrban: c?.ruralUrban,
      medicareCbsaNumber: c?.medicareCbsaNumber,
      cbsaName: cbsaDemo?.name,
      population: demo?.population ?? null,
      medianIncome: demo?.medianIncome ?? null,
      cbsaPopulation: cbsaDemo?.population ?? null,
      cbsaMedianIncome: cbsaDemo?.medianIncome ?? null,
      hcahpsStar: parseNum(pub?.hcahps?.starRating),
      hvbpTps: pub?.hvbp?.totalPerformanceScore ?? null,
      mspbScore: pub?.mspb?.score ?? null,
      hacrpPenalty: pub?.hacrp?.paymentReduction === 'Yes',
      hrrpAvgExcess: pub?.hrrp?.avgExcessReadmissionRatio ?? null,
      hrrpConditionsAbovePeers: pub?.hrrp?.conditionsAbovePeers ?? null,
      region: tr?.region,
      teamRankByCjr: tr?.teamRankByCjr ?? null,
      cjrTop50: tr?.cjrTop50 ?? null,
      cjrQualityComposite: tr?.cjrQualityComposite ?? null,
      cjrOverallRank: tr?.cjrOverallRank ?? null,
      outreachStatus: tr?.outreachStatus,
      pipelineStatus: tr?.pipelineStatus,
      salesStage: tr?.salesStage,
      leadershipBuyIn: tr?.leadershipBuyIn,
      systemSiteCount: tr?.systemSiteCount ?? null,
      estTcv: tr?.estTcv ?? null,
    };
  });

  const stateSummaries = buildStateSummaries(records);
  const benchmarks = buildBenchmarks(records);
  const ownershipOptions = [...new Set(records.map((r) => r.ownership).filter(Boolean))].sort();
  const systemOptions = [...new Set(records.map((r) => r.healthSystem).filter(Boolean))].sort();
  const regions = [...new Set(records.map((r) => r.region).filter(Boolean))].sort();
  const pipelines = [...new Set(records.map((r) => r.pipelineStatus).filter(Boolean))].sort();
  const salesStages = [...new Set(records.map((r) => r.salesStage).filter(Boolean))].sort();
  const outreachStatuses = [...new Set(records.map((r) => r.outreachStatus).filter(Boolean))].sort();

  fs.writeFileSync(
    indexOut,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString().slice(0, 10),
        hospitals: records,
        filterOptions: {
          ownership: ownershipOptions,
          healthSystems: systemOptions,
          regions,
          pipelineStatuses: pipelines,
          salesStages,
          outreachStatuses,
        },
      },
      null,
      2,
    ),
  );
  fs.writeFileSync(
    benchmarksOut,
    JSON.stringify(
      { generatedAt: new Date().toISOString().slice(0, 10), ...benchmarks, byState: stateSummaries },
      null,
      2,
    ),
  );
  fs.writeFileSync(
    stateOut,
    JSON.stringify(
      { generatedAt: new Date().toISOString().slice(0, 10), byState: stateSummaries },
      null,
      2,
    ),
  );

  console.log(`Wrote ${records.length} hospitals → ${indexOut}`);
  console.log(`Wrote ${Object.keys(stateSummaries).length} state summaries → ${stateOut}`);
}

main();
