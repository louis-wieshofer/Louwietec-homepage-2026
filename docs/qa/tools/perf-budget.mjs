#!/usr/bin/env node
/**
 * perf-budget.mjs — Performance-Budget je Seite (Phase 6), gemessen in Chromium:
 *   · Transfer ohne /assets/frames/: ≤ 600 KB (geschätzt komprimiert wie auf GitHub Pages: Text-Typen gzip, Binär roh)
 *   · Schriften: höchstens 2 Dateien beim ersten Laden (Geist + Geist Mono latin; latin-ext nur bei Bedarf)
 *   · kein Bild über 200 KB · CLS = 0 (stille Version und mit Bewegung) · Anfragen nur an die eigene Origin
 *   Report docs/qa/perf/<datum>/report.md. Exit 1 bei Budgetverletzung.
 *   node docs/qa/tools/perf-budget.mjs [/ledger/ …]
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const TOOLS = path.resolve(new URL('.', import.meta.url).pathname);
const ROOT = process.env.LW_ROOT || path.resolve(TOOLS, '../../..');
const BASE = process.env.LW_BASE || 'http://localhost:8080';
const { chromium } = createRequire('/opt/node22/lib/node_modules/')('playwright');
const ALL = ['/', '/ledger/', '/lens/', '/forge/', '/kostenlos/', '/investoren/', '/karriere/', '/ueber-uns/', '/kontakt/', '/faq/', '/rechtliches/impressum/', '/rechtliches/datenschutz/', '/rechtliches/agb/'];
const PAGES = process.argv.slice(2).filter((a) => a.startsWith('/')).length ? process.argv.slice(2).filter((a) => a.startsWith('/')) : ALL;
const BUDGET = { totalKB: 600, fonts: 2, imageKB: 200, cls: 0 };
const today = new Date().toISOString().slice(0, 10);
const OUT = path.join(ROOT, 'docs/qa/perf', today);
fs.mkdirSync(OUT, { recursive: true });

async function serverUp() { try { const r = await fetch(BASE + '/'); return r.ok; } catch (e) { return false; } }
let server = null;
if (!(await serverUp())) {
  server = spawn('python3', ['-m', 'http.server', new URL(BASE).port || '8080', '--directory', ROOT], { stdio: 'ignore' });
  for (let i = 0; i < 30 && !(await serverUp()); i++) await new Promise((r) => setTimeout(r, 200));
}
const TEXT = /^(text\/|application\/(javascript|json|manifest|xml)|image\/svg)/;
const kind = (ct, url) => /font/.test(ct) || /\.woff2?$/.test(url) ? 'font' : /^image\//.test(ct) ? 'image' : /javascript/.test(ct) ? 'js' : /css/.test(ct) ? 'css' : /html/.test(ct) ? 'html' : 'other';

const browser = await chromium.launch();
const rows = [];
let problems = 0;
const report = [`# Performance-Budget — ${today}`, '', `Budget: Transfer ≤ ${BUDGET.totalKB} KB (ohne Frames, Text komprimiert geschätzt), ≤ ${BUDGET.fonts} Schriftdateien, kein Bild > ${BUDGET.imageKB} KB, CLS = ${BUDGET.cls}, keine Fremd-Anfragen. Lokaler Server ohne Kompression; Pages komprimiert Text.`, ''];
try {
  for (const u of PAGES) {
    for (const rm of ['reduce', 'no-preference']) {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: rm });
      const page = await ctx.newPage();
      const res = [];
      page.on('response', async (r) => {
        try {
          const url = r.url(); const ct = r.headers()['content-type'] || '';
          let body = null; try { body = await r.body(); } catch (e) { body = Buffer.alloc(0); }
          const raw = body.length; const comp = TEXT.test(ct) ? zlib.gzipSync(body).length : raw;
          res.push({ url, ct, raw, comp, kind: kind(ct, url), status: r.status(), foreign: !url.startsWith(BASE) && !url.startsWith('data:') });
        } catch (e) { /* abgebrochen */ }
      });
      await page.addInitScript(() => { window.__cls = 0; new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: 'layout-shift', buffered: true }); });
      await page.goto(BASE + u, { waitUntil: 'networkidle' });
      await page.waitForTimeout(800);
      // Scrollen (Kette, Reveals, Hero) und wieder warten – Layout-Shifts danach zählen mit
      await page.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 90)); } window.scrollTo(0, 0); });
      await page.waitForTimeout(600);
      const cls = await page.evaluate(() => Math.round(window.__cls * 1000) / 1000);
      const lcp = await page.evaluate(() => new Promise((r) => { const po = new PerformanceObserver((l) => { const e = l.getEntries().pop(); r(e ? { t: Math.round(e.startTime), el: e.element ? e.element.tagName + (e.element.className ? '.' + String(e.element.className).split(' ')[0] : '') : '' } : null); }); po.observe({ type: 'largest-contentful-paint', buffered: true }); setTimeout(() => r(null), 300); }));
      const noFrames = res.filter((r) => !/\/assets\/frames\//.test(r.url) && r.status < 400);
      const totalKB = Math.round(noFrames.reduce((s, r) => s + r.comp, 0) / 1024);
      const rawKB = Math.round(noFrames.reduce((s, r) => s + r.raw, 0) / 1024);
      const fonts = noFrames.filter((r) => r.kind === 'font');
      const bigImages = noFrames.filter((r) => r.kind === 'image' && r.raw > BUDGET.imageKB * 1024);
      const foreign = res.filter((r) => r.foreign);
      const bad = [];
      if (totalKB > BUDGET.totalKB) bad.push(`Transfer ${totalKB} KB > ${BUDGET.totalKB}`);
      if (fonts.length > BUDGET.fonts) bad.push(`${fonts.length} Schriften (${fonts.map((f) => path.basename(f.url)).join(', ')})`);
      if (bigImages.length) bad.push(`Bild > ${BUDGET.imageKB} KB: ${bigImages.map((i) => path.basename(i.url) + ' ' + Math.round(i.raw / 1024) + ' KB').join(', ')}`);
      if (cls > BUDGET.cls) bad.push(`CLS ${cls}`);
      if (foreign.length) bad.push(`Fremd-Anfragen: ${foreign.map((f) => f.url).join(', ')}`);
      if (bad.length) problems++;
      const byKind = Object.entries(noFrames.reduce((m, r) => { m[r.kind] = (m[r.kind] || 0) + r.comp; return m; }, {})).map(([k, v]) => `${k} ${Math.round(v / 1024)}`).join(' · ');
      rows.push({ u, rm, totalKB, rawKB, fonts: fonts.length, req: noFrames.length, cls, lcp, bad, byKind });
      console.log(`${bad.length ? '✗' : '✓'} ${u.padEnd(26)} ${rm === 'reduce' ? 'still   ' : 'Bewegung'} ${String(totalKB).padStart(4)} KB (roh ${rawKB}) · ${noFrames.length} Anfragen · Schriften ${fonts.length} · CLS ${cls} · LCP ${lcp ? lcp.t + ' ms ' + lcp.el : '–'}${bad.length ? ' · ' + bad.join('; ') : ''}`);
      await ctx.close();
    }
  }
} finally { await browser.close(); if (server) server.kill(); }
report.push('| Seite | Modus | Transfer (komprimiert) | roh | Anfragen | Schriften | CLS | LCP | Aufteilung KB | Befund |', '|---|---|---|---|---|---|---|---|---|---|', ...rows.map((r) => `| ${r.u} | ${r.rm === 'reduce' ? 'still' : 'Bewegung'} | ${r.totalKB} KB | ${r.rawKB} KB | ${r.req} | ${r.fonts} | ${r.cls} | ${r.lcp ? r.lcp.t + ' ms (' + r.lcp.el + ')' : '–'} | ${r.byKind} | ${r.bad.join('; ') || '—'} |`), '', problems ? `**${problems} Messungen über Budget.**` : '**Alle Seiten im Budget.**', '');
fs.writeFileSync(path.join(OUT, 'report.md'), report.join('\n'));
console.log(`\n${problems ? problems + ' Messungen über Budget' : 'Alle Seiten im Budget'} · ${path.relative(ROOT, OUT)}/report.md`);
process.exit(problems ? 1 : 0);
