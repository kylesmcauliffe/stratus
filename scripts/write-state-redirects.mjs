#!/usr/bin/env node
/**
 * Netlify _redirects: lowercase state paths → canonical uppercase (301).
 * Avoids Astro HTML meta-refresh stubs for /states/ca/ etc.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const summaries = JSON.parse(
  fs.readFileSync(path.join(root, 'src/data/state-summaries.json'), 'utf8'),
);
const index = JSON.parse(
  fs.readFileSync(path.join(root, 'src/data/hospital-directory-index.json'), 'utf8'),
);

function slugFromName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const lines = ['# Canonical uppercase state codes'];
const states = Object.keys(summaries.byState ?? {}).sort();

for (const st of states) {
  const lower = st.toLowerCase();
  if (lower === st) continue;
  lines.push(`/states/${lower}    /states/${st}    301`);
  lines.push(`/states/${lower}/    /states/${st}/    301`);
}

const regionStates = new Map();
for (const h of index.hospitals ?? []) {
  if (!h.region || !h.state) continue;
  const slug = slugFromName(h.region);
  const set = regionStates.get(slug) ?? new Set();
  set.add(h.state);
  regionStates.set(slug, set);
}

for (const [regionSlug, stateSet] of regionStates) {
  for (const st of stateSet) {
    const lower = st.toLowerCase();
    if (lower === st) continue;
    lines.push(`/regions/${regionSlug}/states/${lower}    /regions/${regionSlug}/states/${st}    301`);
    lines.push(
      `/regions/${regionSlug}/states/${lower}/    /regions/${regionSlug}/states/${st}/    301`,
    );
  }
}

const out = path.join(root, 'public/_redirects');
fs.writeFileSync(out, `${lines.join('\n')}\n`);
console.log(`Wrote ${lines.length - 1} state redirect rules to public/_redirects`);
