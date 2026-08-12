#!/usr/bin/env node
/**
 * Prefer real Rainfall Master Tracker CSV when present; otherwise synth + export + import.
 * Usage: npm run prepare:tracker
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const csvPath = path.join(root, 'data/sources/rainfall-master-tracker.csv');
const indexPath = path.join(root, 'src/data/hospital-directory-index.json');

function run(cmd, args) {
  const r = spawnSync(cmd, args, { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

function main() {
  if (!fs.existsSync(indexPath)) {
    console.error('Missing hospital-directory-index.json — run build:directory-index first.');
    process.exit(1);
  }

  if (fs.existsSync(csvPath)) {
    console.log(`Using Master Tracker CSV: ${csvPath}`);
    run('node', ['scripts/import-rainfall-tracker.mjs', csvPath]);
    return;
  }

  console.log('No rainfall-master-tracker.csv — synthesizing tracker from CMS metrics…');
  run('node', ['scripts/synth-tracker-from-index.mjs']);
  run('node', ['scripts/export-tracker-csv.mjs', csvPath]);
  run('node', ['scripts/import-rainfall-tracker.mjs', csvPath]);
  console.log(`Bootstrap CSV written to ${csvPath} (replace with real Rainfall export when available).`);
}

main();
