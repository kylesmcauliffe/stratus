#!/usr/bin/env node
/**
 * Import Rainfall Master Tracker CSV → src/data/hospital-rainfall-tracker.json (by CCN).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCsvLine, normalizeCcn } from './lib/cms-csv.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const csvPath =
  process.argv[2] ??
  path.join(root, 'data/sources/rainfall-master-tracker.csv');
const outPath = path.join(root, 'src/data/hospital-rainfall-tracker.json');

function parseMoney(v) {
  const s = String(v ?? '').trim();
  if (!s || s === 'N/A') return null;
  const n = Number(s.replace(/[$,]/g, ''));
  return Number.isFinite(n) ? n : null;
}

function parseNum(v) {
  const s = String(v ?? '').trim();
  if (!s || s === 'N/A') return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function parseYesNo(v) {
  const s = String(v ?? '').trim().toLowerCase();
  if (s === 'yes' || s === 'y') return true;
  if (s === 'no' || s === 'n') return false;
  return null;
}

function idx(header, name) {
  return header.findIndex((h) => h.trim() === name);
}

function main() {
  const text = fs.readFileSync(csvPath, 'utf8');
  const lines = text.split(/\r?\n/).filter(Boolean);
  const header = parseCsvLine(lines[0]);
  const i = {
    name: idx(header, 'Hospital Name'),
    ccn: idx(header, 'Hospital CCN'),
    system: idx(header, 'Affiliated Health System'),
    metro: idx(header, 'Location (City/Metro)'),
    state: idx(header, 'State'),
    region: idx(header, 'Region'),
    cbsa: idx(header, 'CBSA'),
    participant: idx(header, 'Participant Type'),
    newly: idx(header, 'Newly Identified'),
    cjrRank: idx(header, 'TEAM Rank by CJR'),
    cjrTop50: idx(header, 'CJR Top 50'),
    cjrQuality: idx(header, 'CJR Quality Composite'),
    cjrOverall: idx(header, 'CJR Overall Rank (of 307)'),
    outreach: idx(header, 'Outreach Status'),
    systemSites: idx(header, 'System # of Sites'),
    pipeline: idx(header, 'Pipeline Status'),
    salesStage: idx(header, 'Sales Stage'),
    leadership: idx(header, 'Leadership Buy In'),
    acv1: idx(header, 'ACV - Track 1'),
    acv2: idx(header, 'ACV - Track 2'),
    tcv: idx(header, 'Est. TCV'),
    sysImpact: idx(header, 'Health System Impact'),
    contactName: idx(header, 'Contact Name'),
    contactEmail: idx(header, 'Contact Email'),
    contactTitle: idx(header, 'Contact Title'),
    contactPhone: idx(header, 'Contact Phone'),
    nextSteps: idx(header, 'Next Steps'),
    c2Name: idx(header, 'Contact 2 Name'),
    c2Email: idx(header, 'Contact 2 Email'),
    c3Name: idx(header, 'Contact 3 Name'),
    c3Email: idx(header, 'Contact 3 Email'),
    c4Name: idx(header, 'Contact 4 Name'),
    c4Email: idx(header, 'Contact 4 Email'),
    c5Name: idx(header, 'Contact 5 Name'),
    c5Email: idx(header, 'Contact 5 Email'),
    c6Name: idx(header, 'Contact 6 Name'),
    c6Email: idx(header, 'Contact 6 Email'),
    c7Name: idx(header, 'Contact 7 Name'),
    c7Email: idx(header, 'Contact 7 Email'),
  };

  function pushContact(list, name, email, title, phone) {
    const n = String(name ?? '').trim();
    const e = String(email ?? '').trim();
    if (!n && !e) return;
    list.push({
      name: n || undefined,
      email: e || undefined,
      title: String(title ?? '').trim() || undefined,
      phone: String(phone ?? '').trim() || undefined,
    });
  }

  const byCcn = {};
  for (const line of lines.slice(1)) {
    const row = parseCsvLine(line);
    const ccn = normalizeCcn(row[i.ccn]);
    if (!ccn) continue;
    const extraContacts = [];
    pushContact(extraContacts, row[i.c2Name], row[i.c2Email]);
    pushContact(extraContacts, row[i.c3Name], row[i.c3Email]);
    pushContact(extraContacts, row[i.c4Name], row[i.c4Email]);
    pushContact(extraContacts, row[i.c5Name], row[i.c5Email]);
    pushContact(extraContacts, row[i.c6Name], row[i.c6Email]);
    pushContact(extraContacts, row[i.c7Name], row[i.c7Email]);

    byCcn[ccn] = {
      hospitalName: row[i.name] ?? '',
      ccn,
      healthSystem: row[i.system] || undefined,
      metro: row[i.metro] || undefined,
      state: row[i.state]?.trim().toUpperCase() || undefined,
      region: row[i.region] || undefined,
      cbsaCode: row[i.cbsa] || undefined,
      participantType: row[i.participant] || undefined,
      newlyIdentified: row[i.newly] === 'Y',
      teamRankByCjr: parseNum(row[i.cjrRank]),
      cjrTop50: parseYesNo(row[i.cjrTop50]),
      cjrQualityComposite: parseNum(row[i.cjrQuality]),
      cjrOverallRank: parseNum(row[i.cjrOverall]),
      outreachStatus: row[i.outreach] || undefined,
      systemSiteCount: parseNum(row[i.systemSites]),
      pipelineStatus: row[i.pipeline] || undefined,
      salesStage: row[i.salesStage] || undefined,
      leadershipBuyIn: row[i.leadership] || undefined,
      acvTrack1: parseMoney(row[i.acv1]),
      acvTrack2: parseMoney(row[i.acv2]),
      estTcv: parseMoney(row[i.tcv]),
      healthSystemImpact: parseMoney(row[i.sysImpact]),
      contactName: row[i.contactName] || undefined,
      contactEmail: row[i.contactEmail] || undefined,
      contactTitle: row[i.contactTitle] || undefined,
      contactPhone: row[i.contactPhone] || undefined,
      additionalContacts: extraContacts.length ? extraContacts : undefined,
      nextSteps: row[i.nextSteps] || undefined,
    };
  }

  fs.writeFileSync(
    outPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString().slice(0, 10),
        source: path.basename(csvPath),
        count: Object.keys(byCcn).length,
        byCcn,
      },
      null,
      2,
    ),
  );
  console.log(`Wrote ${Object.keys(byCcn).length} tracker rows → ${outPath}`);
}

main();
