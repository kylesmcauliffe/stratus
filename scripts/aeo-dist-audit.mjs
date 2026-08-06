#!/usr/bin/env node
/**
 * Directory dist audit — run after `npm run build` or `npm run build:staging`
 * Usage: npm run build:staging && node scripts/aeo-dist-audit.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const DIST = path.resolve('dist');

function walk(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.name.startsWith('.')) continue;
    if (ent.isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}

const files = walk(DIST);
const issues = [];
const warnings = [];
const passes = [];

console.log('\n# Directory Dist Audit\n');
console.log(`Dist root: ${DIST}`);
console.log(`Total files: ${files.length}`);

if (!fs.existsSync(path.join(DIST, 'index.html'))) issues.push('Missing dist/index.html');
else passes.push('Home page built');

if (!fs.existsSync(path.join(DIST, 'llms.txt'))) issues.push('Missing dist/llms.txt');
else passes.push('llms.txt present');

const robots = fs.existsSync(path.join(DIST, 'robots.txt'))
  ? fs.readFileSync(path.join(DIST, 'robots.txt'), 'utf8')
  : '';
if (!robots.includes('Disallow: /')) warnings.push('robots.txt does not disallow all crawlers');
else passes.push('robots.txt disallows indexing');

const hospitalDirs = files.filter((f) => f.includes('/hospitals/') && f.endsWith('/index.html'));
console.log(`Hospital profile pages: ${hospitalDirs.length}`);
if (hospitalDirs.length < 700) {
  warnings.push(`Expected ~741 hospital profiles, found ${hospitalDirs.length}`);
} else {
  passes.push('Hospital profile count in expected range');
}

const ogPngs = files.filter((f) => f.includes('/og/') && f.endsWith('.png'));
console.log(`OG PNGs: ${ogPngs.length}`);
if (ogPngs.length > 20) {
  warnings.push(`Many OG images (${ogPngs.length}) — consider shared profile OG only`);
} else {
  passes.push('Lean OG image set');
}

console.log('\n## Results\n');
for (const p of passes) console.log(`✓ ${p}`);
for (const w of warnings) console.log(`⚠ ${w}`);
for (const i of issues) console.log(`✗ ${i}`);

if (issues.length) process.exit(1);
