#!/usr/bin/env node
/**
 * integration.spec.mjs — die zwölf Tests des Integrationstags (Vertrag §4.3), Website-Seite.
 * Standard: gegen den Playwright-Mock (mock-fixture.mjs). Mit LW_LIVE=1 laufen die Tests ohne Mock gegen
 * das echte Backend (Integrationstag) — dann muss die Seite von einer erlaubten Origin ausgeliefert werden.
 * Startet bei Bedarf einen lokalen Server (Port 8080). Report → docs/qa/integration/<datum>/report.md. Exit 1 bei Fehlern.
 *   node docs/qa/tools/integration.spec.mjs            # alle Tests
 *   node docs/qa/tools/integration.spec.mjs 3 7 10     # nur diese Tests
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { installMock, installUmamiStub } from './mock-fixture.mjs';
const require = createRequire('/opt/node22/lib/node_modules/');
const { chromium } = require('playwright');

const ROOT = process.env.LW_ROOT || path.resolve(new URL('.', import.meta.url).pathname, '../../..');
const BASE = process.env.LW_BASE || 'http://localhost:8080';
const LIVE = process.env.LW_LIVE === '1';
const only = process.argv.slice(2).map(Number).filter(Boolean);
const today = new Date().toISOString().slice(0, 10);
const OUT = path.join(ROOT, 'docs/qa/integration', today);

async function serverUp() { try { const r = await fetch(BASE + '/'); return r.ok; } catch (e) { return false; } }
let server = null;
if (!(await serverUp())) {
  server = spawn('python3', ['-m', 'http.server', new URL(BASE).port || '8080', '--directory', ROOT], { stdio: 'ignore' });
  for (let i = 0; i < 30 && !(await serverUp()); i++) await new Promise((r) => setTimeout(r, 200));
}

const browser = await chromium.launch();
const results = [];
const assert = (cond, msg) => { if (!cond) throw new Error(msg); };
async function withPage(fn, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce', ...opts.context });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  const mock = LIVE ? null : await installMock(page, opts.mock || {});
  try { return await fn(page, mock, errors); } finally { await ctx.close(); }
}
async function fill(page, form, values) {
  for (const [name, val] of Object.entries(values)) {
    const el = page.locator(`${form} [name="${name}"]`).first();
    const type = await el.evaluate((e) => e.tagName === 'SELECT' ? 'select' : e.type);
    if (type === 'select') await el.selectOption(val);
    else if (type === 'checkbox') { if (val) await el.check({ force: true }); }
    else if (type === 'radio') await page.locator(`${form} [name="${name}"][value="${val}"]`).check({ force: true });
    else await el.fill(String(val));
  }
}
const KONTAKT = { firma: 'Testfirma GmbH', name: 'Test Person', email: 'test@example.com', anliegen: 'ledger', nachricht: 'Testnachricht aus dem Integrationslauf.', consent: true };
async function submitAndWait(page, form, timeout = 8000) {
  await page.click(`${form} [data-submit]`);
  // fertig, wenn das Formular nicht mehr sendet (aria-busy) und ein Ergebnis sichtbar ist: bestätigt, Statuszeile oder Feldfehler
  await page.waitForFunction((sel) => { const f = document.querySelector(sel); return f && f.getAttribute('aria-busy') !== 'true' && (f.classList.contains('is-sent') || (f.querySelector('[data-form-status]')?.textContent || '').trim() || f.querySelector('[aria-invalid="true"]')); }, form, { timeout });
  return page.evaluate((sel) => { const f = document.querySelector(sel); return { sent: f.classList.contains('is-sent'), status: (f.querySelector('[data-form-status]')?.textContent || '').trim(), errors: [...f.querySelectorAll('[data-error-for]:not([hidden])')].map((e) => e.getAttribute('data-error-for') + ': ' + e.textContent) }; }, form);
}
const TESTS = [
  ['Healthz → body[data-backend="up"] in < 2,5 s', async () => withPage(async (page) => {
    await page.goto(BASE + '/kontakt/');
    await page.waitForSelector('body[data-backend="up"]', { timeout: 2500 });
    const mailtoHidden = await page.locator('form[data-form="kontakt"] [data-form-mailto]').isHidden();
    assert(mailtoHidden, 'mailto-Fallback sollte bei erreichbarem Dienst verborgen sein');
  })],
  ['Config liest Status korrekt (reserve/deposit/live, deposit_eur, Enterprise nie Kaufen)', async () => {
    for (const [status, expect] of [['reserve', 1], ['deposit', 2], ['live', 2]]) {
      await withPage(async (page) => {
        await page.goto(BASE + '/ledger/');
        await page.waitForSelector('[data-product-cta] button', { timeout: 5000 });
        const texts = await page.locator('[data-product-cta] button').allTextContents();
        assert(texts.length === expect, `${status}: ${texts.length} Buttons statt ${expect} (${texts.join(' | ')})`);
        assert(texts.includes('Erstanwender-Platz reservieren — kostenlos'), `${status}: Reserve-Button fehlt`);
        if (status === 'deposit') assert(texts.some((t) => t === 'Platz fixieren — 120 € Anzahlung, anrechenbar, rückforderbar'), `deposit: Text/Betrag aus /config fehlt (${texts.join(' | ')})`);
        if (status === 'live') assert(texts.includes('Jetzt buchen'), 'live: „Jetzt buchen“ fehlt');
        const ent = await page.locator('[data-product-cta-enterprise]').first();
        assert((await ent.textContent()).trim() === 'Gespräch anfragen' && (await ent.getAttribute('href')).includes('anliegen=enterprise'), 'Enterprise: nur „Gespräch anfragen“ → Kontakt');
      }, { mock: { statuses: { ledger: status }, deposit_eur: 120 } });
    }
  }],
  ['Jedes der fünf Formulare (+ Reservierung) sendet und bestätigt, Felder exakt nach Vertrag', async () => {
    const cases = [
      ['/kontakt/', 'kontakt', KONTAKT, ['firma', 'name', 'email', 'anliegen', 'nachricht', 'consent', 'website', 'ts']],
      ['/investoren/', 'investoren', { name: 'Test Person', organisation: 'Prüf AG', email: 'i@example.com', rolle: 'pruefer', nachricht: 'Format-Gespräch.', consent: true }, ['name', 'organisation', 'email', 'rolle', 'nachricht', 'consent', 'website', 'ts']],
      ['/karriere/', 'karriere', { name: 'Test Person', email: 'k@example.com', link: 'https://example.com/cv', rolle: 'Initiativ — überzeuge uns.', motivation: 'Gebaut: …', consent: true }, ['name', 'email', 'link', 'rolle', 'motivation', 'consent', 'website', 'ts']],
      ['/kostenlos/', 'lagereport', { email: 'l@example.com', consent: true }, ['email', 'consent', 'website', 'ts']],
      ['/kostenlos/', 'selbstcheck', { q0: '2', q1: '1', q2: '2', q3: '0', q4: '2', q5: '1', q6: '2', q7: '2', q8: '1', q9: '2', firma: 'Testfirma', email: 's@example.com', consent: true }, ['email', 'firma', 'antworten', 'consent', 'website', 'ts']],
      ['/lens/', 'reserve', { firma: 'Testfirma', name: 'Test Person', email: 'r@example.com', edition: 'starter', branche: 'banking', betriebsort: 'cloud', consent: true }, ['firma', 'name', 'email', 'produkt', 'edition', 'branche', 'betriebsort', 'consent', 'website', 'ts']],
    ];
    for (const [url, kind, values, keys] of cases) {
      await withPage(async (page, mock) => {
        await page.goto(BASE + url);
        await page.waitForSelector('body[data-backend]:not([data-backend="pending"])');
        if (kind === 'reserve') { await page.click('[data-product-cta] button'); await page.waitForSelector('[data-reserve-form]:not([hidden])'); }
        const form = `form[data-form="${kind}"]`;
        await fill(page, form, values);
        const r = await submitAndWait(page, form);
        assert(r.sent, `${kind}: nicht bestätigt (Status: ${r.status}; Fehler: ${r.errors.join(', ')})`);
        const rec = mock.records.find((x) => x.path.endsWith(kind === 'reserve' ? '/reserve' : `/forms/${kind}`));
        assert(rec, `${kind}: keine Anfrage beim Mock`);
        const got = Object.keys(rec.body).sort().join(','), want = [...keys].sort().join(',');
        assert(got === want, `${kind}: Felder ${got} ≠ ${want}`);
        assert(typeof rec.body.ts === 'number' && rec.body.website === '' && rec.body.consent === true, `${kind}: ts/website/consent falsch`);
        if (kind === 'selbstcheck') { assert(JSON.stringify(rec.body.antworten) === '[2,1,2,0,2,1,2,2,1,2]', 'selbstcheck: antworten falsch'); assert(await page.locator('[data-selfcheck-score]').textContent() === '15', 'selbstcheck: Score nicht angezeigt'); }
        if (kind === 'reserve') assert((await page.locator('[data-reserve-result]').textContent()).includes('Reserviert'), 'reserve: Bestätigungstext fehlt');
      }, { mock: { minAgeMs: 0 } });
    }
  }],
  ['Spam-Test (Honeypot) → SPAM_REJECTED sichtbar', async () => withPage(async (page) => {
    await page.goto(BASE + '/kontakt/'); await page.waitForSelector('body[data-backend="up"]');
    await fill(page, 'form[data-form="kontakt"]', KONTAKT);
    await page.evaluate(() => { document.querySelector('form[data-form="kontakt"] [name="website"]').value = 'http://spam.example'; });
    const r = await submitAndWait(page, 'form[data-form="kontakt"]');
    assert(!r.sent && /Spam/i.test(r.status), `Honeypot nicht abgelehnt (Status: ${r.status})`);
  }, { mock: { minAgeMs: 0 } })],
  ['Zeit-Test (< 3 s nach Rendern) → abgelehnt', async () => withPage(async (page) => {
    await page.goto(BASE + '/kontakt/'); await page.waitForSelector('body[data-backend="up"]');
    await page.evaluate(() => { document.querySelector('form[data-form="kontakt"] [name="ts"]').value = String(Date.now()); });
    await fill(page, 'form[data-form="kontakt"]', KONTAKT);
    const r = await submitAndWait(page, 'form[data-form="kontakt"]');
    assert(!r.sent && /Spam/i.test(r.status), `Zu schnelle Anfrage nicht abgelehnt (Status: ${r.status})`);
  })],
  ['Kontingent 5 → sechste Reservierung = Warteliste', async () => withPage(async (page, mock) => {
    for (let i = 1; i <= 6; i++) {
      await page.goto(BASE + '/ledger/'); await page.waitForSelector('[data-product-cta] button');
      await page.click('[data-product-cta] button'); await page.waitForSelector('[data-reserve-form]:not([hidden])');
      await fill(page, 'form[data-form="reserve"]', { firma: `Firma ${i}`, name: 'Test', email: `r${i}@example.com`, edition: 'pro', branche: 'leasing', betriebsort: 'onprem', consent: true });
      const r = await submitAndWait(page, 'form[data-form="reserve"]');
      assert(r.sent, `Reservierung ${i} nicht bestätigt (${r.status})`);
      const text = await page.locator('[data-reserve-result]').textContent();
      if (i <= 5) assert(text.includes('Reserviert'), `Reservierung ${i}: erwartet „Reserviert“`); else assert(text.includes('Warteliste'), 'Sechste Reservierung: erwartet Warteliste');
    }
    assert(mock.state.contingent.ledger.leasing === 0, 'Kontingent nicht auf 0');
  }, { mock: { minAgeMs: 0, contingent: 5 } })],
  ['Fallback bei abgeschaltetem Backend → mailto mit Vertrags-Betreff, Anzahlung/Kauf verborgen', async () => withPage(async (page) => {
    await page.goto(BASE + '/ledger/');
    await page.waitForSelector('body[data-backend="down"]', { timeout: 4000 });
    await page.waitForSelector('[data-product-cta] button');
    const texts = await page.locator('[data-product-cta] button').allTextContents();
    assert(texts.length === 1 && texts[0] === 'Erstanwender-Platz reservieren — kostenlos', `down: Buttons ${texts.join(' | ')}`);
    await page.click('[data-product-cta] button'); await page.waitForSelector('[data-reserve-form]:not([hidden])');
    await page.selectOption('form[data-form="reserve"] [name="edition"]', 'starter');
    assert(await page.locator('form[data-form="reserve"] [data-submit]').isHidden(), 'Absenden sollte verborgen sein');
    const href = decodeURIComponent(await page.locator('form[data-form="reserve"] [data-form-mailto]').getAttribute('href'));
    assert(href.startsWith('mailto:office@louwietec.com') && href.includes('subject=[LOUWIETEC] Reservierung LEDGER Starter'), `mailto-Betreff falsch: ${href.slice(0, 120)}`);
    await page.goto(BASE + '/kontakt/'); await page.waitForSelector('body[data-backend="down"]', { timeout: 4000 });
    const h2 = decodeURIComponent(await page.locator('form[data-form="kontakt"] [data-form-mailto]').getAttribute('href'));
    assert(h2.includes('subject=[LOUWIETEC] Kontakt'), `Kontakt-Betreff falsch: ${h2.slice(0, 100)}`);
  }, { mock: { down: true, statuses: { ledger: 'live' } } })],
  ['CORS von fremder Origin abgelehnt (serverseitig; Website zeigt Fehler + mailto)', async () => withPage(async (page) => {
    await page.route('https://web.service.louwietec.com/forms/kontakt', (route) => route.request().method() === 'OPTIONS' ? route.fulfill({ status: 403, body: '' }) : route.fulfill({ status: 403, body: 'forbidden' }));
    await page.goto(BASE + '/kontakt/'); await page.waitForSelector('body[data-backend="up"]');
    await fill(page, 'form[data-form="kontakt"]', KONTAKT);
    const r = await submitAndWait(page, 'form[data-form="kontakt"]');
    assert(!r.sent && /nicht erreichbar/i.test(r.status), `CORS-Ablehnung nicht als Fehler angezeigt (${r.status})`);
    assert(await page.locator('form[data-form="kontakt"] [data-form-mailto]').isVisible(), 'mailto-Fallback nach CORS-Fehler nicht sichtbar');
  }, { mock: { minAgeMs: 0 } })],
  ['Ereignisse: cta_click mit target, magnet_start (visit = Umami-Pageview)', async () => withPage(async (page) => {
    await installUmamiStub(page);
    await page.goto(BASE + '/'); await page.waitForTimeout(400);
    await page.click('a[data-track-target="produkte"]');
    await page.goto(BASE + '/kostenlos/'); await page.waitForTimeout(300);
    await page.focus('form[data-form="selbstcheck"] [name="q0"]');
    await page.waitForTimeout(200);
    const ev = await page.evaluate(() => window.__umamiEvents);
    assert(ev.some((e) => e.name === 'magnet_start' && e.props.magnet === 'selbstcheck'), `magnet_start fehlt: ${JSON.stringify(ev)}`);
    await page.goto(BASE + '/'); await page.waitForTimeout(300);
    await page.click('a[data-track-target="produkte"]'); await page.waitForTimeout(200);
    const ev2 = await page.evaluate(() => window.__umamiEvents);
    assert(ev2.some((e) => e.name === 'cta_click' && e.props.target === 'produkte'), `cta_click fehlt: ${JSON.stringify(ev2)}`);
  })],
  ['Fehlerhülle bei Validierungsfehler am Feld (aria-invalid, Meldung, Fokus)', async () => withPage(async (page, mock) => {
    await page.goto(BASE + '/kontakt/'); await page.waitForSelector('body[data-backend="up"]');
    await fill(page, 'form[data-form="kontakt"]', KONTAKT);
    mock.forceError = { status: 400, code: 'VALIDATION_ERROR', field: 'email', message: 'Diese E-Mail-Adresse wird nicht akzeptiert.' };
    const r = await submitAndWait(page, 'form[data-form="kontakt"]');
    assert(r.errors.some((e) => e.startsWith('email: Diese E-Mail-Adresse')), `Feldfehler fehlt: ${JSON.stringify(r.errors)}`);
    const st = await page.evaluate(() => { const i = document.querySelector('form[data-form="kontakt"] [name="email"]'); return { invalid: i.getAttribute('aria-invalid'), focused: document.activeElement === i }; });
    assert(st.invalid === 'true' && st.focused, `aria-invalid/Fokus: ${JSON.stringify(st)}`);
  }, { mock: { minAgeMs: 0 } })],
  ['Enterprise-Anliegen landet als solches (?anliegen=enterprise)', async () => withPage(async (page, mock) => {
    await page.goto(BASE + '/kontakt/?anliegen=enterprise'); await page.waitForSelector('body[data-backend="up"]');
    assert(await page.locator('form[data-form="kontakt"] [name="anliegen"]').inputValue() === 'enterprise', 'Vorauswahl enterprise fehlt');
    await fill(page, 'form[data-form="kontakt"]', { ...KONTAKT, anliegen: 'enterprise' });
    const r = await submitAndWait(page, 'form[data-form="kontakt"]');
    assert(r.sent && mock.records[0].body.anliegen === 'enterprise', 'anliegen ≠ enterprise');
  }, { mock: { minAgeMs: 0 } })],
  ['Rate-Limit greift (RATE_LIMITED sichtbar)', async () => withPage(async (page) => {
    await page.goto(BASE + '/kontakt/'); await page.waitForSelector('body[data-backend="up"]');
    let last = null;
    for (let i = 0; i < 3; i++) {
      await page.reload(); await page.waitForSelector('body[data-backend="up"]');
      await fill(page, 'form[data-form="kontakt"]', { ...KONTAKT, email: `t${i}@example.com` });
      last = await submitAndWait(page, 'form[data-form="kontakt"]');
    }
    assert(!last.sent && /Zu viele Anfragen/i.test(last.status), `Rate-Limit nicht angezeigt (${last.status})`);
  }, { mock: { minAgeMs: 0, ratePerMinute: 2 } })],
];

let n = 0;
for (const [name, fn] of TESTS) {
  n++;
  if (only.length && !only.includes(n)) continue;
  const t0 = Date.now();
  try { await fn(); results.push({ n, name, ok: true, ms: Date.now() - t0 }); console.log(`✓ ${n}. ${name} (${Date.now() - t0} ms)`); }
  catch (e) { results.push({ n, name, ok: false, ms: Date.now() - t0, error: e.message }); console.log(`✗ ${n}. ${name}\n    ${e.message}`); }
}
await browser.close();
if (server) server.kill();
fs.mkdirSync(OUT, { recursive: true });
const passed = results.filter((r) => r.ok).length;
fs.writeFileSync(path.join(OUT, 'report.md'), [`# Integrationstests — ${today} (${LIVE ? 'echtes Backend' : 'Mock-Fixture'})`, '', `${passed}/${results.length} bestanden`, '', '| # | Test | Ergebnis | Dauer |', '|---|---|---|---|', ...results.map((r) => `| ${r.n} | ${r.name} | ${r.ok ? '✓' : '✗ ' + r.error} | ${r.ms} ms |`), ''].join('\n'));
console.log(`\n${passed}/${results.length} bestanden · Report: ${path.relative(ROOT, OUT)}/report.md`);
process.exit(passed === results.length ? 0 : 1);
