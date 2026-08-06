#!/usr/bin/env node
/**
 * Post-build security checks — run after `npm run build:production`
 * Usage: npm run build:production && npm run audit:security
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const DIST = path.resolve('dist');
const headersPath = path.join(DIST, '_headers');
let failed = 0;

function fail(msg) {
  console.error(`FAIL: ${msg}`);
  failed++;
}
function pass(msg) {
  console.log(`PASS: ${msg}`);
}

if (!fs.existsSync(headersPath)) {
  fail('_headers missing from dist/ (copy from public/_headers at build)');
} else {
  const h = fs.readFileSync(headersPath, 'utf8');
  if (!h.includes('Strict-Transport-Security')) fail('_headers missing HSTS');
  else pass('HSTS in dist/_headers');
  if (!h.includes('X-Content-Type-Options: nosniff')) fail('_headers missing nosniff');
  else pass('X-Content-Type-Options in dist/_headers');
  if (!h.includes('X-Frame-Options: DENY')) fail('_headers missing X-Frame-Options');
  else pass('X-Frame-Options in dist/_headers');
  if (!/\/llms\.txt[\s\S]*Access-Control-Allow-Origin: \*/.test(h)) {
    fail('_headers missing CORS for /llms.txt');
  } else pass('LLM CORS overrides in dist/_headers');
}

try {
  const audit = JSON.parse(execSync('npm audit --omit=dev --json', { encoding: 'utf8' }));
  const v = audit.metadata?.vulnerabilities ?? {};
  if ((v.high ?? 0) + (v.critical ?? 0) > 0) {
    fail(`npm audit --omit=dev reports ${v.high ?? 0} high, ${v.critical ?? 0} critical`);
  } else {
    pass(`npm audit (production deps): 0 high/critical`);
    try {
      const devAudit = JSON.parse(execSync('npm audit --json', { encoding: 'utf8' }));
      const dv = devAudit.metadata?.vulnerabilities ?? {};
      if ((dv.high ?? 0) + (dv.critical ?? 0) > 0) {
        console.log(
          `NOTE: ${dv.high ?? 0} high in devDependencies (e.g. xlsx for local scripts) — not shipped in dist/.`,
        );
      }
    } catch {
      /* dev audit informational only */
    }
  }
} catch (e) {
  const out = e.stdout?.toString() ?? '';
  if (out) {
    try {
      const audit = JSON.parse(out);
      const v = audit.metadata?.vulnerabilities ?? {};
      if ((v.high ?? 0) + (v.critical ?? 0) > 0) fail(`npm audit --omit=dev: ${v.high} high`);
      else pass(`npm audit (production deps): 0 high/critical`);
    } catch {
      fail('npm audit failed to run');
    }
  } else fail('npm audit failed to run');
}

console.log(failed ? `\n${failed} check(s) failed.\n` : '\nAll security checks passed.\n');
process.exit(failed ? 1 : 0);
