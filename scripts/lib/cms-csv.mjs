import fs from 'node:fs';
import readline from 'node:readline';

export function parseCsvLine(line) {
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

export function headerIndex(header, name) {
  const i = header.findIndex((h) => h.replace(/"/g, '').trim() === name);
  return i >= 0 ? i : -1;
}

export function normalizeCcn(value) {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (!digits) return null;
  return digits.padStart(6, '0').slice(-6);
}

export function parseNum(value) {
  const v = String(value ?? '').trim();
  if (!v || v === 'Not Available' || v === 'N/A' || v === 'Too Few to Report') return null;
  const n = Number(v.replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
}

export async function fetchCsvText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed ${url}: ${res.status}`);
  return res.text();
}

/** Stream a remote CSV and invoke handler per data row (after header). */
export async function streamCsvUrl(url, onRow, { filter } = {}) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed ${url}: ${res.status}`);
  const rl = readline.createInterface({ input: res.body, crlfDelay: Infinity });
  let header = null;
  let idx = null;
  for await (const line of rl) {
    if (!line.trim()) continue;
    if (!header) {
      header = parseCsvLine(line);
      idx = filter ? filter(header) : null;
      continue;
    }
    const row = parseCsvLine(line);
    if (filter && !filter(header, row, idx)) continue;
    onRow(row, header, idx);
  }
}

/** Stream local or remote via download-then-read for reliability on large files. */
export async function streamCsvFromText(text, onRow) {
  const lines = text.split(/\r?\n/);
  let header = null;
  let idx = null;
  for (const line of lines) {
    if (!line.trim()) continue;
    if (!header) {
      header = parseCsvLine(line);
      idx = buildIndex(header);
      continue;
    }
    onRow(parseCsvLine(line), idx);
  }
}

export function buildIndex(header) {
  const map = {};
  header.forEach((name, i) => {
    map[name.replace(/"/g, '').trim()] = i;
  });
  return map;
}

export function rowVal(row, idx, name) {
  const i = idx[name];
  return i == null ? '' : (row[i] ?? '');
}

export function loadTeamCcns(hospitalsPath) {
  const src = fs.readFileSync(hospitalsPath, 'utf8');
  const ccns = new Set();
  for (const m of src.matchAll(/ccn: '(\d{6})'/g)) ccns.add(m[1]);
  return ccns;
}
