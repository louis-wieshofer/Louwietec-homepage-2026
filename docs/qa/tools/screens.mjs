#!/usr/bin/env node
/**
 * screens.mjs — Belege für Bewegung und stille Version:
 *   · Screenshots aller Seiten in 1440×900 und 390×844, jeweils mit Bewegung und mit
 *     prefers-reduced-motion: reduce (stille Version) → docs/qa/screens/<datum>/
 *   · Scroll-Video der Startseite (Desktop und Mobil, ≤ 20 s) → docs/qa/video/<datum>/
 *   · Kontrollwerte: Konsolenfehler, horizontales Scrollen, Kette/Siegel-Zustand am Ende.
 * Voraussetzung: Playwright + Chromium der Umgebung, lokaler Server auf Port 8080
 *   (python3 -m http.server 8080 --directory .). Dev-only.
 *
 *   node docs/qa/tools/screens.mjs            # alles
 *   node docs/qa/tools/screens.mjs --video    # nur Video
 *   node docs/qa/tools/screens.mjs --shots    # nur Screenshots
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire('/opt/node22/lib/node_modules/');
const { chromium } = require('playwright');

const ROOT = process.env.LW_ROOT || path.resolve(new URL('.', import.meta.url).pathname, '../../..');
const BASE = process.env.LW_BASE || 'http://localhost:8080';
const today = new Date().toISOString().slice(0, 10);
const SHOTS = path.join(ROOT, 'docs/qa/screens', today);
const VIDEO = path.join(ROOT, 'docs/qa/video', today);
const PAGES = ['/', '/ledger/', '/lens/', '/forge/', '/kostenlos/', '/investoren/', '/karriere/', '/ueber-uns/', '/kontakt/', '/faq/', '/rechtliches/impressum/', '/rechtliches/datenschutz/', '/rechtliches/agb/', '/styleguide/', '/404.html'];
const argv = process.argv.slice(2);
const doShots = argv.length === 0 || argv.includes('--shots');
const doVideo = argv.length === 0 || argv.includes('--video');
const name = (u) => (u === '/' ? 'start' : u.replace(/^\/|\/$/g, '').replace(/[\/.]/g, '-'));

async function scrollThrough(page, stepPx, stepMs) {
  const total = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  for (let y = 0; y < total + stepPx; y += stepPx) { await page.mouse.wheel(0, stepPx); await page.waitForTimeout(stepMs); }
  await page.waitForTimeout(1200);
}

const report = [`# Screens & Video — ${today}`, ''];
const browser = await chromium.launch();

if (doShots) {
  fs.mkdirSync(SHOTS, { recursive: true });
  for (const vp of [{ w: 1440, h: 900, tag: 'desktop' }, { w: 390, h: 844, tag: 'mobile' }]) {
    for (const rm of ['no-preference', 'reduce']) {
      const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, reducedMotion: rm, deviceScaleFactor: 1 });
      const page = await ctx.newPage();
      for (const u of PAGES) {
        const errs = [];
        page.on('pageerror', (e) => errs.push(String(e)));
        await page.goto(BASE + u, { waitUntil: 'load' });
        if (rm === 'no-preference') await scrollThrough(page, 600, 60); else await page.waitForTimeout(300);
        await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(300);
        const info = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth > innerWidth, motion: document.documentElement.classList.contains('js-motion') }));
        const file = `${name(u)}-${vp.tag}${rm === 'reduce' ? '-reduced' : ''}.png`;
        await page.screenshot({ path: path.join(SHOTS, file), fullPage: true });
        report.push(`- ${file}: ${info.overflow ? '⚠ horizontaler Überlauf' : 'kein Überlauf'} · js-motion ${info.motion ? 'an' : 'aus'} · Fehler ${errs.length}`);
      }
      await ctx.close();
    }
  }
}

if (doVideo) {
  fs.mkdirSync(VIDEO, { recursive: true });
  for (const vp of [{ w: 1280, h: 720, tag: 'desktop' }, { w: 390, h: 844, tag: 'mobile' }]) {
    const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, recordVideo: { dir: VIDEO, size: { width: vp.w, height: vp.h } } });
    const page = await ctx.newPage();
    await page.goto(BASE + '/', { waitUntil: 'load' });
    await page.waitForTimeout(1500);
    await scrollThrough(page, vp.tag === 'desktop' ? 320 : 220, 140);
    const end = await page.evaluate(() => ({ closed: document.querySelectorAll('.chain__link.is-closed').length, links: document.querySelectorAll('.chain__link').length, seal: !!document.querySelector('[data-seal].is-stamped') }));
    await page.waitForTimeout(1500);
    const video = page.video();
    await ctx.close();
    const tmp = await video.path();
    const out = path.join(VIDEO, `start-scroll-${vp.tag}.webm`);
    fs.renameSync(tmp, out);
    report.push(`- ${path.basename(out)}: Kette ${end.closed}/${end.links} geschlossen · Siegel ${end.seal ? 'gefallen' : 'NICHT gefallen'} · ${Math.round(fs.statSync(out).size / 1024)} KB`);
  }
}

await browser.close();
fs.mkdirSync(SHOTS, { recursive: true });
fs.writeFileSync(path.join(SHOTS, 'report.md'), report.join('\n') + '\n');
console.log(report.join('\n'));
