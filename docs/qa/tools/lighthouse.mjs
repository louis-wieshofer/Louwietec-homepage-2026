#!/usr/bin/env node
/**
 * lighthouse.mjs — Lighthouse für alle Seiten, mobil und Desktop (Phase 6, Gate ≥ 90).
 *   Kategorien Performance, Accessibility, Best Practices werden bewertet; SEO wird mitgemessen,
 *   zählt aber erst ab Phase 6b als Gate (Schalter --seo).
 *   Reports: docs/qa/lighthouse/<datum>/<seite>-<form>.report.html + .json, summary.md. Exit 1 unter Schwelle.
 *   Server auf Port 8080 wird bei Bedarf gestartet (python3 -m http.server). Chromium aus der Umgebung. Dev-only.
 *
 *   node docs/qa/tools/lighthouse.mjs                 # alle Seiten, beide Formfaktoren
 *   node docs/qa/tools/lighthouse.mjs /ledger/ /faq/  # nur diese Seiten
 *   node docs/qa/tools/lighthouse.mjs --seo           # SEO als Gate mitzählen (Phase 6b)
 *   node docs/qa/tools/lighthouse.mjs --mobile|--desktop
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const TOOLS = path.resolve(new URL('.', import.meta.url).pathname);
const ROOT = process.env.LW_ROOT || path.resolve(TOOLS, '../../..');
const BASE = process.env.LW_BASE || 'http://localhost:8080';
const require = createRequire(path.join(TOOLS, 'node_modules/'));
const lighthouse = (await import(pathToFileURL(require.resolve('lighthouse')).href)).default;
const chromeLauncher = await import(pathToFileURL(require.resolve('chrome-launcher')).href);
const CHROME = process.env.CHROME_PATH || fs.readdirSync('/opt/pw-browsers').filter((d) => /^chromium-\d+$/.test(d)).map((d) => `/opt/pw-browsers/${d}/chrome-linux/chrome`).find((p) => fs.existsSync(p));

const ALL = ['/', '/ledger/', '/lens/', '/forge/', '/kostenlos/', '/investoren/', '/karriere/', '/ueber-uns/', '/kontakt/', '/faq/', '/rechtliches/impressum/', '/rechtliches/datenschutz/', '/rechtliches/agb/'];
const argv = process.argv.slice(2);
const seoGate = argv.includes('--seo');
const forms = argv.includes('--mobile') ? ['mobile'] : argv.includes('--desktop') ? ['desktop'] : ['mobile', 'desktop'];
const pages = argv.filter((a) => a.startsWith('/'));
const PAGES = pages.length ? pages : ALL;
const THRESHOLD = Number(process.env.LW_LH_MIN || 90);
const today = new Date().toISOString().slice(0, 10);
const OUT = path.join(ROOT, 'docs/qa/lighthouse', today);
fs.mkdirSync(OUT, { recursive: true });
const name = (u) => (u === '/' ? 'start' : u.replace(/^\/|\/$/g, '').replace(/[\/.]/g, '-'));

async function serverUp() { try { const r = await fetch(BASE + '/'); return r.ok; } catch (e) { return false; } }
let server = null;
if (!(await serverUp())) {
  server = spawn('python3', ['-m', 'http.server', new URL(BASE).port || '8080', '--directory', ROOT], { stdio: 'ignore' });
  for (let i = 0; i < 30 && !(await serverUp()); i++) await new Promise((r) => setTimeout(r, 200));
}

const chrome = await chromeLauncher.launch({ chromePath: CHROME, chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'] });
const rows = [];
let failures = 0;
try {
  for (const form of forms) {
    for (const u of PAGES) {
      const flags = { port: chrome.port, output: ['html', 'json'], logLevel: 'error', onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'] };
      // Drosselung wie in den Lighthouse-Presets: mobil = „Slow 4G“ + CPU ×4 (Standard), Desktop = 40 ms RTT, 10 Mbit/s, CPU ×1
      const throttling = form === 'desktop' ? { rttMs: 40, throughputKbps: 10 * 1024, cpuSlowdownMultiplier: 1, requestLatencyMs: 0, downloadThroughputKbps: 0, uploadThroughputKbps: 0 } : undefined;
      const config = { extends: 'lighthouse:default', settings: { formFactor: form, screenEmulation: form === 'desktop' ? { mobile: false, width: 1440, height: 900, deviceScaleFactor: 1, disabled: false } : { mobile: true, width: 390, height: 844, deviceScaleFactor: 3, disabled: false }, throttlingMethod: 'simulate', ...(throttling ? { throttling } : {}), locale: 'de' } };
      const result = await lighthouse(BASE + u, flags, config);
      const lhr = result.lhr;
      const score = (c) => Math.round((lhr.categories[c]?.score ?? 0) * 100);
      const s = { performance: score('performance'), accessibility: score('accessibility'), 'best-practices': score('best-practices'), seo: score('seo') };
      const base = path.join(OUT, `${name(u)}-${form}`);
      fs.writeFileSync(`${base}.report.html`, result.report[0]);
      fs.writeFileSync(`${base}.report.json`, result.report[1]);
      const gated = ['performance', 'accessibility', 'best-practices', ...(seoGate ? ['seo'] : [])];
      const bad = gated.filter((c) => s[c] < THRESHOLD);
      if (bad.length) failures++;
      const metrics = { lcp: lhr.audits['largest-contentful-paint']?.displayValue, cls: lhr.audits['cumulative-layout-shift']?.displayValue, tbt: lhr.audits['total-blocking-time']?.displayValue, fcp: lhr.audits['first-contentful-paint']?.displayValue };
      const fails = Object.values(lhr.audits).filter((a) => a.score !== null && a.score < 0.9 && a.scoreDisplayMode === 'binary' && (lhr.categories.accessibility.auditRefs.some((r) => r.id === a.id) || lhr.categories['best-practices'].auditRefs.some((r) => r.id === a.id) || (seoGate && lhr.categories.seo.auditRefs.some((r) => r.id === a.id)))).map((a) => a.id);
      rows.push({ u, form, ...s, ...metrics, bad, fails });
      console.log(`${bad.length ? '✗' : '✓'} ${u.padEnd(26)} ${form.padEnd(7)} P ${s.performance} · A ${s.accessibility} · BP ${s['best-practices']} · SEO ${s.seo}${seoGate ? '' : ' (nicht gewertet)'} · LCP ${metrics.lcp} · CLS ${metrics.cls}${fails.length ? ' · ' + fails.join(', ') : ''}`);
    }
  }
} finally {
  await chrome.kill();
  if (server) server.kill();
}
const md = [`# Lighthouse — ${today}`, '', `Schwelle ${THRESHOLD} für Performance, Accessibility, Best Practices${seoGate ? ' und SEO' : '; SEO wird mitgemessen, zählt erst ab Phase 6b'}. Lokaler Server ohne Kompression und HTTP/2 (GitHub Pages liefert beides); simulierte Drosselung: mobil Slow 4G + CPU ×4, Desktop 40 ms RTT / 10 Mbit/s / CPU ×1 (Lighthouse-Presets). Konsolenfehler durch das nicht erreichbare Backend (web.service.louwietec.com) zählen in Best Practices mit, bis Session 2 den Dienst bereitstellt.`, '',
  '| Seite | Form | Perf | A11y | Best Practices | SEO | LCP | CLS | TBT | Befunde |', '|---|---|---|---|---|---|---|---|---|---|',
  ...rows.map((r) => `| ${r.u} | ${r.form} | ${r.performance} | ${r.accessibility} | ${r['best-practices']} | ${r.seo} | ${r.lcp} | ${r.cls} | ${r.tbt} | ${r.fails.join(', ') || '—'} |`), '',
  failures ? `**${failures} Messungen unter der Schwelle.**` : '**Alle Messungen ≥ Schwelle.**', ''].join('\n');
fs.writeFileSync(path.join(OUT, 'summary.md'), md);
console.log(`\n${failures ? failures + ' Messungen unter ' + THRESHOLD : 'Alle Messungen ≥ ' + THRESHOLD} · ${path.relative(ROOT, OUT)}/summary.md`);
process.exit(failures ? 1 : 0);
