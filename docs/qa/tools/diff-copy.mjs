#!/usr/bin/env node
/**
 * diff-copy.mjs — beweist Wortgleichheit: Texte-Dokument (Markdown) gegen die
 * zehn Inhaltsseiten (HTML). Gate Phase 2: 0 fehlend, 0 geändert, jede Extra-Zeile
 * in docs/qa/extra-text-allowlist.txt.
 *
 *   node docs/qa/tools/diff-copy.mjs              # alle Seiten, Report nach docs/qa/copy-diff/<datum>/
 *   node docs/qa/tools/diff-copy.mjs --page /ledger/
 *   node docs/qa/tools/diff-copy.mjs --expected   # nur die erwarteten Zeilen je Seite ausgeben
 *
 * Markdown-Seite: Rollen werden aus der Dokumentstruktur abgeleitet (Meta-Title,
 * Kicker, H1/H2, Karten/Blöcke, CTAs in [..], Tabellenzeilen, Fließtext); Struktur-
 * labels (**Sektion:**, **Lead:** …) entfallen. HTML-Seite: sichtbarer Text in
 * main[data-copy-root] ohne script/style/template/noscript, [data-diff-ignore],
 * .beleg, .sr-only, [aria-hidden=true], nav.chain. Blöcke = Zeilen, <br> trennt,
 * Tabellenzeilen = Zellen mit „ · “. Normalisierung beidseitig (NFC, Whitespace,
 * Anführungszeichen, Markdown-Auszeichnung, [XXX] → Zahl).
 * Dev-only, erzeugt keine Seiten.
 */
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'node-html-parser';
import { diffArrays } from 'diff';

const ROOT = process.env.LW_ROOT || path.resolve(new URL('.', import.meta.url).pathname, '../../..');
const MD = path.join(ROOT, 'docs/copy/Website_Texte_Final_v2.md');
const ALLOWLIST = path.join(ROOT, 'docs/qa/extra-text-allowlist.txt');
const ROUTES = { 1: '/', 2: '/ledger/', 3: '/lens/', 4: '/forge/', 5: '/kostenlos/', 6: '/investoren/', 7: '/karriere/', 8: '/ueber-uns/', 9: '/kontakt/', 10: '/faq/' };
const DROP_LABELS = new Set(['Hero-Text', 'Lead', 'Text', 'These', 'Intro', 'Abschluss-Sektion', 'Verbindungszeile darunter', 'Countdown-Balken (Gold, nur in diesem Raum)']);
const HEADING_LABELS = new Set(['Woran wir uns halten', 'Unsere Gesetze', 'Offene Rollen', 'Bewerbung', 'Partner', 'Wo wir stehen (ehrlich)']);
const argv = process.argv.slice(2);
const onlyPage = argv.includes('--page') ? argv[argv.indexOf('--page') + 1] : null;
const today = new Date().toISOString().slice(0, 10);
const OUT = path.join(ROOT, 'docs/qa/copy-diff', today);

export function norm(s) {
  return String(s).normalize('NFC')
    .replace(/[   ]/g, ' ')
    .replace(/[„“”‟"]/g, '"').replace(/[‚‘’‛]/g, "'")
    .replace(/\*\*/g, '').replace(/(^|[\s(])\*([^*]+)\*(?=[\s).,;:!?]|$)/g, '$1$2')
    .replace(/\[XXX\]/g, '§NUM§')
    .replace(/→/g, ' ').replace(/[\[\]]/g, '')
    .replace(/\s+/g, ' ').trim();
}

/* ---------- Markdown → erwartete Zeilen je Seite ---------- */
export function extractExpected(mdText) {
  const pages = {};
  let page = null;
  for (const raw of mdText.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    const sp = line.match(/^# SEITE (\d+) — (.+)$/);
    if (sp) { page = { n: +sp[1], route: ROUTES[+sp[1]], items: [] }; pages[page.n] = page; continue; }
    if (/^## ANHANG/.test(line)) { page = null; continue; }
    if (!page || line === '---') continue;
    const push = (role, text) => page.items.push({ role, text });
    let m;
    if ((m = line.match(/^\*\*Meta-Title:\*\*\s*(.+)$/))) { push('meta-title', m[1]); continue; }
    if ((m = line.match(/^\*\*Meta-Description:\*\*\s*(.+)$/))) { push('meta-description', m[1]); continue; }
    if ((m = line.match(/^\*\*Kicker:\*\*\s*(.+)$/))) { push('kicker', m[1]); continue; }
    if ((m = line.match(/^\*\*H1:\*\*\s*(.+)$/))) { push('h1', m[1]); continue; }
    if ((m = line.match(/^\*\*H2:\*\*\s*(.+)$/))) { push('h2', m[1]); continue; }
    if ((m = line.match(/^\*\*(Tagline-Zeile[^*]*|Vertrauens-Zeile|Zeile):\*\*\s*(.+)$/))) { push('text', m[2]); continue; }
    if (/^\*\*CTA[^*]*:\*\*/.test(line)) { for (const c of line.matchAll(/\[([^\]]+)\]/g)) push('cta', c[1]); continue; }
    if (/^\*\*Sektion:/.test(line)) continue;
    if ((m = line.match(/^\*\*(?:Karte|Block) \d+ — ([^*]+)\*\*$/))) { push('h3', m[1]); continue; }
    if ((m = line.match(/^→\s*\[([^\]]+)\]$/))) { push('cta', m[1]); continue; }
    if ((m = line.match(/^\*\*Formular:\*\*\s*(.+)$/))) { push('form-spec', m[1]); continue; }
    if ((m = line.match(/^\*\*Darunter:\*\*\s*(.+)$/))) { push('contact-spec', m[1]); continue; }
    if ((m = line.match(/^\*\*([^*]+):\*\*\s*(.*)$/))) {
      const label = m[1], rest = m[2].trim().replace(/\s*\[(Formular|dynamische Liste aus Repo-Datei)\]\s*$/, '');
      if (DROP_LABELS.has(label)) { if (rest) push('text', rest); continue; }
      if (HEADING_LABELS.has(label)) { if (rest) push('text', `${label}: ${rest}`); else push('h3', `${label}:`); continue; }
      push('text', line.replace(/\s*\[(Formular|dynamische Liste aus Repo-Datei)\]\s*$/, '')); continue;
    }
    if (/^\|/.test(line)) {
      if (/^\|\s*-{2,}/.test(line)) continue;
      const cells = line.split('|').slice(1, -1).map((c) => c.trim());
      push(cells[0] === 'Edition' ? 'table-head' : 'table-row', cells.join(' · '));
      continue;
    }
    if ((m = line.match(/^\*\*(„[^*]+)\*\*$/))) { push('h3', m[1]); continue; }
    if ((m = line.match(/^\*([^*].*)\*$/))) { push('text', m[1]); continue; }
    push('text', line);
  }
  return pages;
}

/* ---------- HTML → tatsächliche Zeilen ---------- */
const BLOCK = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'li', 'figcaption', 'dt', 'dd', 'blockquote', 'summary', 'caption', 'pre']);
const STANDALONE = new Set(['a', 'button']);
const CONTAINERS = new Set(['div', 'section', 'article', 'header', 'footer', 'ul', 'ol', 'table', 'thead', 'tbody', 'tfoot', 'figure', 'form', 'fieldset', 'details', 'aside', 'nav', 'main']);
const DROP_SEL = 'script, style, template, noscript, [data-diff-ignore], .beleg, .sr-only, [aria-hidden="true"], nav.chain';

export function extractActual(html) {
  const root = parse(html, { comment: false });
  const title = root.querySelector('title')?.text ?? '';
  const desc = root.querySelector('meta[name="description"]')?.getAttribute('content') ?? '';
  const main = root.querySelector('main[data-copy-root]');
  const lines = [];
  if (!main) return { title, desc, lines, error: 'main[data-copy-root] fehlt' };
  const fresh = parse(html, { comment: false }); // unveränderter Baum für Struktur-Prüfungen (Formulare sind data-diff-ignore)
  for (const el of main.querySelectorAll(DROP_SEL)) el.remove();
  const textOf = (el) => el.innerHTML.split(/<br\s*\/?>/i).map((chunk) => parse(chunk).text);
  const walk = (node) => {
    const tag = node.rawTagName?.toLowerCase();
    if (tag === 'tr') { lines.push(node.querySelectorAll('th, td').map((c) => c.text).join(' · ')); return; }
    if (BLOCK.has(tag)) { for (const t of textOf(node)) lines.push(t); return; }
    if (STANDALONE.has(tag)) { lines.push(node.text); return; }
    let buf = '';
    for (const child of node.childNodes) {
      if (child.nodeType === 3) buf += child.text;
      else if (child.nodeType === 1) {
        const t = child.rawTagName?.toLowerCase();
        if (BLOCK.has(t) || STANDALONE.has(t) || t === 'tr' || CONTAINERS.has(t)) { if (buf.trim()) { lines.push(buf); buf = ''; } walk(child); }
        else buf += child.text;
      }
    }
    if (buf.trim()) lines.push(buf);
  };
  walk(main);
  return { title, desc, lines: lines.map(norm).filter(Boolean), root: fresh };
}

/* ---------- Vergleich ---------- */
function routeFile(route) { return path.join(ROOT, route === '/' ? 'index.html' : route.replace(/^\//, '') + 'index.html'); }
function escapeRe(s) { return s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'); }

function comparePage(page, allow) {
  const file = routeFile(page.route);
  const res = { route: page.route, file: path.relative(ROOT, file), missing: [], extra: [], extraAllowed: [], meta: [], spec: [], ok: false };
  if (!fs.existsSync(file)) { res.missing.push('(Seite existiert nicht)'); return res; }
  const html = fs.readFileSync(file, 'utf8');
  const act = extractActual(html);
  if (act.error) { res.missing.push(act.error); return res; }

  const expected = [];
  for (const it of page.items) {
    const t = norm(it.text);
    if (it.role === 'meta-title') { if (norm(act.title) !== t) res.meta.push(`Title\n    soll: ${t}\n    ist:  ${norm(act.title)}`); continue; }
    if (it.role === 'meta-description') { if (norm(act.desc) !== t) res.meta.push(`Description\n    soll: ${t}\n    ist:  ${norm(act.desc)}`); continue; }
    if (it.role === 'form-spec') {
      const names = ['firma', 'name', 'email', 'anliegen', 'nachricht'];
      const form = act.root.querySelector('form[data-form="kontakt"]');
      const missingFields = form ? names.filter((n) => !form.querySelector(`[name="${n}"]`)) : names;
      if (missingFields.length) res.spec.push(`Kontaktformular: Felder fehlen: ${missingFields.join(', ')}`);
      continue;
    }
    if (it.role === 'contact-spec') {
      const hasMail = !!act.root.querySelector('main a[href^="mailto:"]');
      const hasWien = act.lines.some((l) => l.includes('Wien, Österreich'));
      if (!hasMail) res.spec.push('Kontakt: mailto:-Link fehlt („E-Mail-Adresse direkt“)');
      if (!hasWien) res.spec.push('Kontakt: „Wien, Österreich“ fehlt');
      continue;
    }
    expected.push(t);
  }

  // Ist-Zeilen angleichen: Zahlenplatzhalter und „ · “-Listen (mehrere Blöcke = eine Dokumentzeile)
  let actual = act.lines.slice();
  for (const e of expected) {
    if (e.includes('§NUM§')) {
      const re = new RegExp('^' + escapeRe(e).replace(/§NUM§/g, '\\d[\\d.]*') + '$');
      actual = actual.map((a) => (re.test(a) ? e : a));
    }
  }
  const actualSet = new Set(actual);
  for (const e of expected) {
    if (actualSet.has(e) || !e.includes(' · ')) continue;
    const parts = e.split(' · ');
    for (let i = 0; i + parts.length <= actual.length; i++) {
      if (actual.slice(i, i + parts.length).join(' · ') === e) { actual.splice(i, parts.length, e); break; }
    }
  }

  const d = diffArrays(expected, actual);
  for (const part of d) {
    if (part.removed) res.missing.push(...part.value);
    else if (part.added) for (const v of part.value) (allow.has(v) ? res.extraAllowed : res.extra).push(v);
  }
  res.ok = !res.missing.length && !res.extra.length && !res.meta.length && !res.spec.length;
  res.counts = { expected: expected.length, actual: actual.length };
  return res;
}

/* ---------- Main ---------- */
const pages = extractExpected(fs.readFileSync(MD, 'utf8'));
if (argv.includes('--expected')) {
  for (const p of Object.values(pages)) { console.log(`\n== ${p.route}`); for (const it of p.items) console.log(`${it.role.padEnd(16)} ${norm(it.text)}`); }
  process.exit(0);
}
const allow = new Set(fs.existsSync(ALLOWLIST) ? fs.readFileSync(ALLOWLIST, 'utf8').split('\n').map((l) => norm(l.replace(/^#.*$/, ''))).filter(Boolean) : []);
fs.mkdirSync(OUT, { recursive: true });
let failures = 0;
const summary = [];
for (const p of Object.values(pages)) {
  if (onlyPage && p.route !== onlyPage) continue;
  const r = comparePage(p, allow);
  if (!r.ok) failures++;
  const name = p.route === '/' ? 'start' : p.route.replace(/\//g, '');
  const lines = [`# Wortgleichheit ${p.route} — ${r.ok ? 'BESTANDEN' : 'ABWEICHUNGEN'}`, '', `Datei: ${r.file} · Stand ${today}`, r.counts ? `Erwartet ${r.counts.expected} Zeilen · gefunden ${r.counts.actual} Zeilen` : '', ''];
  const sec = (title, arr) => { if (arr.length) { lines.push(`## ${title} (${arr.length})`, ''); for (const x of arr) lines.push(`- ${x}`); lines.push(''); } };
  sec('Fehlend (im Dokument, nicht auf der Seite)', r.missing);
  sec('Zusätzlich (auf der Seite, nicht im Dokument, nicht freigegeben)', r.extra);
  sec('Meta-Abweichungen', r.meta);
  sec('Struktur-Vorgaben nicht erfüllt', r.spec);
  sec('Zusätzlich, freigegeben (Allowlist)', r.extraAllowed);
  fs.writeFileSync(path.join(OUT, `${name}.md`), lines.join('\n'));
  summary.push(`| ${p.route} | ${r.ok ? '✓' : '✗'} | ${r.missing.length} | ${r.extra.length} | ${r.meta.length} | ${r.spec.length} | ${r.extraAllowed.length} |`);
  console.log(`${r.ok ? '✓' : '✗'} ${p.route.padEnd(14)} fehlend ${r.missing.length} · extra ${r.extra.length} · meta ${r.meta.length} · spec ${r.spec.length} · erlaubt ${r.extraAllowed.length}`);
  for (const x of r.missing.slice(0, 6)) console.log(`    − ${x.slice(0, 120)}`);
  for (const x of r.extra.slice(0, 6)) console.log(`    + ${x.slice(0, 120)}`);
  for (const x of [...r.meta, ...r.spec]) console.log(`    ! ${x}`);
}
fs.writeFileSync(path.join(OUT, 'summary.md'), ['# Wortgleichheits-Diff — Zusammenfassung', '', `Stand ${today}`, '', '| Seite | Status | fehlend | extra | meta | spec | erlaubt |', '|---|---|---|---|---|---|---|', ...summary, ''].join('\n'));
console.log(`\nReport: ${path.relative(ROOT, OUT)}/ · ${failures ? failures + ' Seite(n) mit Abweichungen' : 'alle Seiten wortgleich'}`);
process.exit(failures ? 1 : 0);
