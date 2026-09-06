#!/usr/bin/env node
/**
 * a11y.mjs — Barrierefreiheit maschinell (Phase 6): axe-core (WCAG 2.1 AA + Best Practice) auf allen
 *   Seiten in 1440×900 und 390×844, dazu ein Tastatur-Walk je Seite:
 *   · alle sichtbaren interaktiven Elemente werden per Tab erreicht (Reihenfolge protokolliert),
 *   · jeder Fokus ist sichtbar (Outline oder Box-Shadow), · Skip-Link führt nach #main (mit und ohne Bewegung),
 *   · Beleg-Popover öffnet per Enter, schließt per Esc, Fokus kehrt zurück, · mobiles Menü per Tastatur.
 *   Report docs/qa/a11y/<datum>/report.md (+ axe.json). Exit 1 bei axe-Verstößen (serious/critical) oder Walk-Fehlern.
 *   node docs/qa/tools/a11y.mjs [/ledger/ …]
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const TOOLS = path.resolve(new URL('.', import.meta.url).pathname);
const ROOT = process.env.LW_ROOT || path.resolve(TOOLS, '../../..');
const BASE = process.env.LW_BASE || 'http://localhost:8080';
const { chromium } = createRequire('/opt/node22/lib/node_modules/')('playwright');
const { default: AxeBuilder } = createRequire(path.join(TOOLS, 'node_modules/'))('@axe-core/playwright');
const ALL = ['/', '/ledger/', '/lens/', '/forge/', '/kostenlos/', '/investoren/', '/karriere/', '/ueber-uns/', '/kontakt/', '/faq/', '/rechtliches/impressum/', '/rechtliches/datenschutz/', '/rechtliches/agb/', '/404.html'];
const PAGES = process.argv.slice(2).filter((a) => a.startsWith('/')).length ? process.argv.slice(2).filter((a) => a.startsWith('/')) : ALL;
const today = new Date().toISOString().slice(0, 10);
const OUT = path.join(ROOT, 'docs/qa/a11y', today);
fs.mkdirSync(OUT, { recursive: true });

async function serverUp() { try { const r = await fetch(BASE + '/'); return r.ok; } catch (e) { return false; } }
let server = null;
if (!(await serverUp())) {
  server = spawn('python3', ['-m', 'http.server', new URL(BASE).port || '8080', '--directory', ROOT], { stdio: 'ignore' });
  for (let i = 0; i < 30 && !(await serverUp()); i++) await new Promise((r) => setTimeout(r, 200));
}

const INTERACTIVE = 'a[href], button, input, select, textarea, summary, [tabindex]:not([tabindex="-1"])';
const describe = (el) => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : ''}${el.name ? '[' + el.name + ']' : ''}`;

/** Tab-Walk: bis zu 250 Schritte, sammelt Fokusziele und Sichtbarkeit des Fokus. */
async function walk(page) {
  await page.evaluate(() => { window.scrollTo(0, 0); document.activeElement?.blur?.(); });
  const seen = [];
  const invisible = [];
  let last = null;
  for (let i = 0; i < 250; i++) {
    await page.keyboard.press('Tab');
    const cur = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      const visibleFocus = (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || (cs.boxShadow && cs.boxShadow !== 'none') || el.classList.contains('skip-link');
      const d = `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : ''}${el.name ? '[' + el.name + ']' : ''}`;
      return { d, visibleFocus, offscreen: r.width === 0 && r.height === 0, hp: !!el.closest('.hp') };
    });
    if (!cur) break;
    if (seen.length && cur.d === seen[0].d && i > 3) break; // Zyklus geschlossen
    if (last && cur.d === last.d) { if (++cur.repeat > 2) break; }
    seen.push(cur); last = cur;
    if (!cur.visibleFocus && !cur.offscreen) invisible.push(cur.d);
  }
  const expected = await page.evaluate((sel) => [...document.querySelectorAll(sel)].filter((el) => { const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); return !el.closest('[hidden]') && cs.display !== 'none' && cs.visibility !== 'hidden' && !el.disabled && (r.width > 0 || r.height > 0) && !el.closest('.hp') && el.tabIndex >= 0; }).map((el) => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : ''}${el.name ? '[' + el.name + ']' : ''}`), INTERACTIVE);
  const reached = new Set(seen.map((s) => s.d));
  const missed = expected.filter((d) => !reached.has(d));
  const honeypot = seen.filter((s) => s.hp).map((s) => s.d);
  return { stops: seen.length, order: seen.slice(0, 12).map((s) => s.d), invisible, missed, honeypot };
}

async function skipLink(page) {
  await page.evaluate(() => { window.scrollTo(0, 0); document.activeElement?.blur?.(); });
  await page.keyboard.press('Tab');
  const first = await page.evaluate(() => document.activeElement?.className || '');
  if (!/skip-link/.test(first)) return { ok: false, why: `erster Tab-Stopp ist ${first || 'nichts'}` };
  await page.keyboard.press('Enter');
  await page.waitForTimeout(400);
  const r = await page.evaluate(() => { const main = document.getElementById('main'); const a = document.activeElement; return { inMain: !!main && (a === main || main.contains(a)), hash: location.hash, active: a?.tagName + (a?.id ? '#' + a.id : '') }; });
  if (!r.inMain) return { ok: false, why: `Fokus nach Enter: ${r.active}, hash ${r.hash}` };
  return { ok: true };
}

async function popover(page) {
  const btn = page.locator('button.beleg[data-beleg]').first();
  if (!(await btn.count())) return { ok: true, skipped: 'kein Beleg-Zeichen' };
  await btn.scrollIntoViewIfNeeded(); await btn.focus(); await page.waitForTimeout(250);
  const isOpen = () => page.evaluate(() => { const d = document.querySelector('[role="dialog"]'); return !!d && !d.hidden && getComputedStyle(d).display !== 'none'; });
  if (!(await isOpen())) return { ok: false, why: 'Popover öffnet nicht bei Fokus' };
  await page.keyboard.press('Escape'); await page.waitForTimeout(200);
  if (await isOpen()) return { ok: false, why: 'Popover schließt nicht per Esc' };
  const back = await page.evaluate(() => document.activeElement?.classList.contains('beleg'));
  if (!back) return { ok: false, why: 'Fokus kehrt nach Esc nicht zum Beleg-Zeichen zurück' };
  await page.keyboard.press('Enter'); await page.waitForTimeout(200);
  if (!(await isOpen())) return { ok: false, why: 'Popover öffnet nicht per Enter' };
  const expanded = await page.evaluate(() => document.querySelector('button.beleg[aria-expanded="true"]') !== null);
  await page.keyboard.press('Escape'); await page.waitForTimeout(150);
  return { ok: expanded, why: expanded ? '' : 'aria-expanded nicht true bei offenem Popover' };
}

async function mobileMenu(page) {
  const toggle = page.locator('[data-nav-toggle]').first();
  if (!(await toggle.count()) || !(await toggle.isVisible())) return { ok: false, why: 'Menü-Knopf nicht sichtbar' };
  await toggle.focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(250);
  const open = await page.evaluate(() => ({ expanded: document.querySelector('[data-nav-toggle]')?.getAttribute('aria-expanded'), links: [...document.querySelectorAll('[data-nav-toggle] ~ *, #site-menu, .site-menu')].some((m) => getComputedStyle(m).display !== 'none') }));
  if (open.expanded !== 'true') return { ok: false, why: `aria-expanded nach Enter = ${open.expanded}` };
  await page.keyboard.press('Tab');
  const firstLink = await page.evaluate(() => document.activeElement?.tagName === 'A');
  const fit = await page.evaluate(() => { const links = [...document.querySelectorAll('.site-menu a, #site-menu a')]; const last = links[links.length - 1]; if (!last) return true; last.focus(); const r = last.getBoundingClientRect(); return r.bottom <= innerHeight + 1 && r.top >= 0; });
  await page.keyboard.press('Escape'); await page.waitForTimeout(250);
  const closed = await page.evaluate(() => ({ expanded: document.querySelector('[data-nav-toggle]')?.getAttribute('aria-expanded'), focusOnToggle: document.activeElement === document.querySelector('[data-nav-toggle]') }));
  if (closed.expanded !== 'false') return { ok: false, why: 'Menü schließt nicht per Esc' };
  return { ok: firstLink && closed.focusOnToggle && fit, why: [!firstLink && 'erster Tab nach Öffnen kein Link', !closed.focusOnToggle && 'Fokus nach Esc nicht auf dem Knopf', !fit && 'letzter Menüpunkt nicht im Viewport erreichbar'].filter(Boolean).join('; ') };
}

const browser = await chromium.launch();
const report = [`# Barrierefreiheit — ${today}`, '', 'axe-core (wcag2a, wcag2aa, wcag21aa, best-practice) auf allen Seiten in 1440×900 und 390×844 (stille Version), Tastatur-Walk, Skip-Link mit und ohne Bewegung, Beleg-Popover, mobiles Menü.', ''];
const axeAll = {};
let problems = 0;
const fail = (m) => { problems++; report.push(`- ✗ ${m}`); console.log(`✗ ${m}`); };
const ok = (m) => { report.push(`- ✓ ${m}`); console.log(`✓ ${m}`); };
try {
  for (const u of PAGES) {
    report.push(`## ${u}`);
    for (const vp of [{ w: 1440, h: 900, tag: 'desktop' }, { w: 390, h: 844, tag: 'mobile' }]) {
      const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, reducedMotion: 'reduce' });
      const page = await ctx.newPage();
      await page.goto(BASE + u, { waitUntil: 'load' });
      await page.waitForTimeout(300);
      const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice']).analyze();
      axeAll[`${u} ${vp.tag}`] = axe.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.slice(0, 5).map((n) => n.target.join(' ')) }));
      const serious = axe.violations.filter((v) => ['serious', 'critical'].includes(v.impact));
      const minor = axe.violations.filter((v) => !['serious', 'critical'].includes(v.impact));
      if (serious.length) fail(`${vp.tag}: axe ${serious.map((v) => `${v.id} (${v.impact}, ${v.nodes.length}×: ${v.nodes[0]?.target.join(' ')})`).join('; ')}`); else ok(`${vp.tag}: axe ohne serious/critical (${axe.passes.length} bestanden${minor.length ? ', ' + minor.map((v) => v.id + ' ' + v.impact).join(', ') + ' als Hinweis' : ''})`);
      const w = await walk(page);
      if (w.missed.length) fail(`${vp.tag}: per Tab nicht erreicht: ${w.missed.slice(0, 8).join(', ')}${w.missed.length > 8 ? ' …' : ''}`); else ok(`${vp.tag}: alle ${w.stops} Tab-Stopps erreichbar (${w.order.slice(0, 6).join(' → ')} …)`);
      if (w.invisible.length) fail(`${vp.tag}: Fokus nicht sichtbar auf ${[...new Set(w.invisible)].slice(0, 8).join(', ')}`);
      if (w.honeypot.length) fail(`${vp.tag}: Honeypot per Tab erreichbar (${w.honeypot.join(', ')})`);
      const sk = await skipLink(page);
      sk.ok ? ok(`${vp.tag}: Skip-Link → #main (stille Version)`) : fail(`${vp.tag}: Skip-Link — ${sk.why}`);
      if (vp.tag === 'desktop') { const p = await popover(page); p.ok ? ok(`Beleg-Popover: Fokus/Enter öffnet, Esc schließt, Fokus zurück, aria-expanded${p.skipped ? ' (' + p.skipped + ')' : ''}`) : fail(`Beleg-Popover — ${p.why}`); }
      if (vp.tag === 'mobile') { const m = await mobileMenu(page); m.ok ? ok('mobiles Menü: Enter öffnet, Tab erreicht Links, alle im Viewport, Esc schließt, Fokus zurück') : fail(`mobiles Menü — ${m.why}`); }
      await ctx.close();
    }
    // Skip-Link auch mit Bewegung (Lenis/Anker-Interceptor)
    const ctxM = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });
    const pm = await ctxM.newPage(); await pm.goto(BASE + u, { waitUntil: 'networkidle' }); await pm.waitForTimeout(600);
    const skm = await skipLink(pm);
    skm.ok ? ok('Skip-Link → #main (mit Bewegung)') : fail(`Skip-Link mit Bewegung — ${skm.why}`);
    await ctxM.close();
    report.push('');
  }
} finally {
  await browser.close();
  if (server) server.kill();
}
fs.writeFileSync(path.join(OUT, 'axe.json'), JSON.stringify(axeAll, null, 2));
report.push(problems ? `**${problems} Befunde.**` : '**Keine Befunde.**', '');
fs.writeFileSync(path.join(OUT, 'report.md'), report.join('\n'));
console.log(`\n${problems ? problems + ' Befunde' : 'Keine Befunde'} · ${path.relative(ROOT, OUT)}/report.md`);
process.exit(problems ? 1 : 0);
