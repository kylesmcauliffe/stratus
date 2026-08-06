#!/usr/bin/env node
/**
 * Fetch public CMS datasets → src/data/hospital-public-profiles.json (keyed by CCN).
 *
 * Usage: npm run fetch:public-data
 */
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { Readable } from 'node:stream';
import { fileURLToPath } from 'node:url';
import {
  buildIndex,
  fetchCsvText,
  headerIndex,
  loadTeamCcns,
  normalizeCcn,
  parseCsvLine,
  parseNum,
  rowVal,
} from './lib/cms-csv.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const hospitalsPath = path.join(root, 'src/data/team-hospitals.ts');
const outPath = path.join(root, 'src/data/hospital-public-profiles.json');

const SOURCES = {
  general: {
    id: 'cms-hospital-general-information',
    dataset: 'xubh-q36u',
    csv:
      'https://data.cms.gov/provider-data/sites/default/files/resources/893c372430d9d71a1c52737d01239d47_1777413958/Hospital_General_Information.csv',
  },
  costReport: {
    id: 'cms-hospital-cost-report-2023',
    csv:
      'https://data.cms.gov/sites/default/files/2026-01/3c39f483-c7e0-4025-8396-4df76942e10f/CostReport_2023_Final.csv',
  },
  hrrp: {
    id: 'cms-hrrp-fy2026',
    dataset: '9n3s-kdb3',
    csv:
      'https://data.cms.gov/provider-data/sites/default/files/resources/a171bc36c488d3e0dc33ec63abb469a6_1770163617/FY_2026_Hospital_Readmissions_Reduction_Program_Hospital.csv',
  },
  hacrp: {
    id: 'cms-hacrp-fy2026',
    dataset: 'yq43-i98g',
    csv:
      'https://data.cms.gov/provider-data/sites/default/files/resources/74be67fd6833391f578abb5605d03ce6_1770163605/FY_2026_HAC_Reduction_Program_Hospital.csv',
  },
  hcahps: {
    id: 'cms-hcahps-hospital',
    dataset: 'dgck-syfz',
    csv:
      'https://data.cms.gov/provider-data/sites/default/files/resources/78a50346fbe828ea0ce2837847af6a7c_1777413952/HCAHPS-Hospital.csv',
  },
  hvbpTps: {
    id: 'cms-hvbp-tps',
    dataset: 'ypbt-wvdk',
    csv:
      'https://data.cms.gov/provider-data/sites/default/files/resources/5551d4839c1dd75e3f7fe1310a1e2369_1770163628/hvbp_tps.csv',
  },
  mspb: {
    id: 'cms-mspb-hospital',
    dataset: 'rrqw-56er',
    csv:
      'https://data.cms.gov/provider-data/sites/default/files/resources/69874ce604586980ac088283c1b35095_1777413962/Medicare_Hospital_Spending_Per_Patient-Hospital.csv',
  },
};

function cleanRating(value) {
  const v = String(value ?? '').trim();
  if (!v || v === 'Not Available' || v === 'N/A') return null;
  return v;
}

async function streamRemoteCsv(url, onRow) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed ${url}: ${res.status}`);
  const nodeStream = Readable.fromWeb(res.body);
  const rl = readline.createInterface({ input: nodeStream, crlfDelay: Infinity });
  let idx = null;
  for await (const line of rl) {
    if (!line.trim()) continue;
    if (!idx) {
      idx = buildIndex(parseCsvLine(line));
      continue;
    }
    onRow(parseCsvLine(line), idx);
  }
}

async function loadGeneralInfo(ccnSet) {
  console.log('Hospital General Information…');
  const text = await fetchCsvText(SOURCES.general.csv);
  const lines = text.split(/\r?\n/).filter(Boolean);
  const header = parseCsvLine(lines[0]);
  const idx = {
    ccn: headerIndex(header, 'Facility ID'),
    name: headerIndex(header, 'Facility Name'),
    address: headerIndex(header, 'Address'),
    city: headerIndex(header, 'City/Town'),
    state: headerIndex(header, 'State'),
    zip: headerIndex(header, 'ZIP Code'),
    county: headerIndex(header, 'County/Parish'),
    phone: headerIndex(header, 'Telephone Number'),
    type: headerIndex(header, 'Hospital Type'),
    ownership: headerIndex(header, 'Hospital Ownership'),
    er: headerIndex(header, 'Emergency Services'),
    birthing: headerIndex(header, 'Meets criteria for birthing friendly designation'),
    rating: headerIndex(header, 'Hospital overall rating'),
    readmWorse: headerIndex(header, 'Count of READM Measures Worse'),
    readmBetter: headerIndex(header, 'Count of READM Measures Better'),
    safetyBetter: headerIndex(header, 'Count of Safety Measures Better'),
  };

  const byCcn = {};
  let matched = 0;
  for (const line of lines.slice(1)) {
    const row = parseCsvLine(line);
    const ccn = normalizeCcn(row[idx.ccn]);
    if (!ccn || !ccnSet.has(ccn)) continue;
    matched++;
    byCcn[ccn] = {
      ccn,
      general: {
        facilityName: row[idx.name] ?? '',
        address: row[idx.address] ?? '',
        city: row[idx.city] ?? '',
        state: row[idx.state] ?? '',
        zip: row[idx.zip] ?? '',
        county: row[idx.county] ?? '',
        phone: row[idx.phone] ?? '',
        hospitalType: row[idx.type] ?? '',
        ownership: row[idx.ownership] ?? '',
        emergencyServices: row[idx.er] ?? '',
        birthingFriendly: row[idx.birthing] ?? '',
        overallRating: cleanRating(row[idx.rating]),
        readmMeasuresWorse: cleanRating(row[idx.readmWorse]),
        readmMeasuresBetter: cleanRating(row[idx.readmBetter]),
        safetyMeasuresBetter: cleanRating(row[idx.safetyBetter]),
      },
    };
  }
  console.log(`  matched ${matched}`);
  return byCcn;
}

async function loadCostReports(ccnSet, byCcn) {
  console.log('Hospital Cost Report 2023…');
  const text = await fetchCsvText(SOURCES.costReport.csv);
  let idx = null;
  let matched = 0;
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    if (!idx) {
      const header = parseCsvLine(line);
      idx = {
        ccn: headerIndex(header, 'Provider CCN'),
        fyEnd: headerIndex(header, 'Fiscal Year End Date'),
        beds: headerIndex(header, 'Number of Beds'),
        discharges: headerIndex(header, 'Total Discharges (V + XVIII + XIX + Unknown)'),
        fte: headerIndex(header, 'FTE - Employees on Payroll'),
        cbsa: headerIndex(header, 'Medicare CBSA Number'),
        rural: headerIndex(header, 'Rural Versus Urban'),
      };
      continue;
    }
    const row = parseCsvLine(line);
    const ccn = normalizeCcn(row[idx.ccn]);
    if (!ccn || !ccnSet.has(ccn) || !byCcn[ccn]) continue;
    matched++;
    byCcn[ccn].costReport = {
      fiscalYearEnd: row[idx.fyEnd] ?? '',
      numberOfBeds: row[idx.beds] || null,
      totalDischarges: row[idx.discharges] || null,
      fteEmployees: row[idx.fte] || null,
      medicareCbsaNumber: row[idx.cbsa] || null,
      ruralUrban: row[idx.rural] || null,
    };
  }
  console.log(`  matched ${matched}`);
}

async function loadHrrp(ccnSet, byCcn) {
  console.log('HRRP FY2026 (streaming)…');
  let matched = 0;
  await streamRemoteCsv(SOURCES.hrrp.csv, (row, idx) => {
    const ccn = normalizeCcn(rowVal(row, idx, 'Facility ID'));
    if (!ccn || !ccnSet.has(ccn) || !byCcn[ccn]) return;
    const measure = rowVal(row, idx, 'Measure Name');
    const excess = parseNum(rowVal(row, idx, 'Excess Readmission Ratio'));
    if (!byCcn[ccn].hrrp) {
      byCcn[ccn].hrrp = { fiscalYear: '2026', measures: [] };
      matched++;
    }
    if (measure && excess != null) {
      byCcn[ccn].hrrp.measures.push({
        measure,
        excessReadmissionRatio: excess,
        predictedRate: parseNum(rowVal(row, idx, 'Predicted Readmission Rate')),
        expectedRate: parseNum(rowVal(row, idx, 'Expected Readmission Rate')),
      });
    }
  });
  for (const ccn of Object.keys(byCcn)) {
    const h = byCcn[ccn].hrrp;
    if (!h?.measures?.length) continue;
    const ratios = h.measures.map((m) => m.excessReadmissionRatio).filter((n) => n != null);
    h.avgExcessReadmissionRatio =
      ratios.length > 0 ? ratios.reduce((a, b) => a + b, 0) / ratios.length : null;
    h.conditionsAbovePeers = ratios.filter((r) => r > 1).length;
  }
  console.log(`  matched ${matched}`);
}

async function loadHacrp(ccnSet, byCcn) {
  console.log('HACRP FY2026…');
  const text = await fetchCsvText(SOURCES.hacrp.csv);
  let idx = null;
  let matched = 0;
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    if (!idx) {
      idx = buildIndex(parseCsvLine(line));
      continue;
    }
    const row = parseCsvLine(line);
    const ccn = normalizeCcn(rowVal(row, idx, 'Facility ID'));
    if (!ccn || !ccnSet.has(ccn) || !byCcn[ccn]) continue;
    matched++;
    byCcn[ccn].hacrp = {
      fiscalYear: rowVal(row, idx, 'Fiscal Year') || '2026',
      totalHacScore: parseNum(rowVal(row, idx, 'Total HAC Score')),
      paymentReduction: rowVal(row, idx, 'Payment Reduction') || null,
      psi90: parseNum(rowVal(row, idx, 'PSI 90 Composite Value')),
    };
  }
  console.log(`  matched ${matched}`);
}

async function loadHcahps(ccnSet, byCcn) {
  console.log('HCAHPS summary stars (streaming)…');
  let matched = 0;
  await streamRemoteCsv(SOURCES.hcahps.csv, (row, idx) => {
    if (rowVal(row, idx, 'HCAHPS Measure ID') !== 'H_STAR_RATING') return;
    const ccn = normalizeCcn(rowVal(row, idx, 'Facility ID'));
    if (!ccn || !ccnSet.has(ccn) || !byCcn[ccn]) return;
    matched++;
    byCcn[ccn].hcahps = {
      starRating: cleanRating(rowVal(row, idx, 'Patient Survey Star Rating')),
      completedSurveys: parseNum(rowVal(row, idx, 'Number of Completed Surveys')),
      responseRatePercent: parseNum(rowVal(row, idx, 'Survey Response Rate Percent')),
    };
  });
  console.log(`  matched ${matched}`);
}

async function loadHvbp(ccnSet, byCcn) {
  console.log('HVBP Total Performance Score…');
  const text = await fetchCsvText(SOURCES.hvbpTps.csv);
  let idx = null;
  let matched = 0;
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    if (!idx) {
      idx = buildIndex(parseCsvLine(line));
      continue;
    }
    const row = parseCsvLine(line);
    const ccn = normalizeCcn(rowVal(row, idx, 'Facility ID'));
    if (!ccn || !ccnSet.has(ccn) || !byCcn[ccn]) continue;
    matched++;
    byCcn[ccn].hvbp = {
      fiscalYear: rowVal(row, idx, 'Fiscal Year') || '2026',
      totalPerformanceScore: parseNum(rowVal(row, idx, 'Total Performance Score')),
      clinicalOutcomes: parseNum(rowVal(row, idx, 'Weighted Normalized Clinical Outcomes Domain Score')),
      patientExperience: parseNum(rowVal(row, idx, 'Weighted Person And Community Engagement Domain Score')),
      safety: parseNum(rowVal(row, idx, 'Weighted Safety Domain Score')),
      efficiency: parseNum(rowVal(row, idx, 'Weighted Efficiency And Cost Reduction Domain Score')),
    };
  }
  console.log(`  matched ${matched}`);
}

async function loadMspb(ccnSet, byCcn) {
  console.log('Medicare Spending per Beneficiary…');
  let matched = 0;
  await streamRemoteCsv(SOURCES.mspb.csv, (row, idx) => {
    const ccn = normalizeCcn(rowVal(row, idx, 'Facility ID'));
    if (!ccn || !ccnSet.has(ccn) || !byCcn[ccn]) return;
    if (rowVal(row, idx, 'Measure ID') !== 'MSPB-1') return;
    matched++;
    byCcn[ccn].mspb = {
      score: parseNum(rowVal(row, idx, 'Score')),
      measureName: rowVal(row, idx, 'Measure Name'),
    };
  });
  console.log(`  matched ${matched}`);
}

async function main() {
  const ccnSet = loadTeamCcns(hospitalsPath);
  console.log(`TEAM hospitals with CCN: ${ccnSet.size}`);

  const byCcn = await loadGeneralInfo(ccnSet);
  await loadCostReports(ccnSet, byCcn);
  await loadHrrp(ccnSet, byCcn);
  await loadHacrp(ccnSet, byCcn);
  await loadHcahps(ccnSet, byCcn);
  await loadHvbp(ccnSet, byCcn);
  await loadMspb(ccnSet, byCcn);

  const output = {
    generatedAt: new Date().toISOString().slice(0, 10),
    sources: Object.values(SOURCES).map((s) => ({
      id: s.id,
      dataset: s.dataset,
      url: s.csv,
    })),
    byCcn,
  };

  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`Wrote ${Object.keys(byCcn).length} profiles → ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
