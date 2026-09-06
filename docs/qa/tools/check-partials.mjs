#!/usr/bin/env node
/**
 * check-partials.mjs — prüft, dass die gemeinsamen Blöcke (head-common, header,
 * footer, scripts) in jeder HTML-Datei byteidentisch mit docs/partials/*.html sind.
 *
 *   node docs/qa/tools/check-partials.mjs          # Gate: Exit 1 bei Abweichung
 *   node docs/qa/tools/check-partials.mjs --fix    # schreibt die Blöcke aus docs/partials/ in die Seiten
 *
 * Marker in den Seiten:  <!-- @partial:NAME --> … <!-- /@partial:NAME -->
 * Seiten ohne gemeinsame Blöcke (Redirect-Stubs) tragen <!-- @partials:none -->.
 * Dev-only: erzeugt keine Seiten, ist kein Build-Schritt (das HTML ist das Deliverable).
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(new URL('.', import.meta.url).pathname, '../../..');
const PARTIALS_DIR = path.join(ROOT, 'docs/partials');
const FIX = process.argv.includes('--fix');
const KNOWN_PAGES = new Set(['start', 'ledger', 'lens', 'forge', 'kostenlos', 'investoren', 'karriere', 'ueber-uns', 'kontakt', 'faq', 'styleguide', '404', 'impressum', 'datenschutz', 'agb']);
const REQUIRED = ['head-common', 'header', 'footer', 'scripts'];

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || e.name === 'node_modules' || e.name === 'docs') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.isFile() && e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

const partials = {};
for (const f of fs.readdirSync(PARTIALS_DIR)) {
  if (!f.endsWith('.html')) continue;
  partials[f.replace(/\.html$/, '')] = fs.readFileSync(path.join(PARTIALS_DIR, f), 'utf8').replace(/^\n+|\n+$/g, '');
}

let problems = 0, fixed = 0;
const pages = walk(ROOT);
for (const file of pages) {
  const rel = path.relative(ROOT, file);
  let html = fs.readFileSync(file, 'utf8');
  if (html.includes('<!-- @partials:none -->')) continue;
  let changed = false;

  for (const name of Object.keys(partials)) {
    const open = `<!-- @partial:${name} -->`, close = `<!-- /@partial:${name} -->`;
    const re = new RegExp(`${open.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\n?([\\s\\S]*?)\\n?${close.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}`, 'g');
    const matches = [...html.matchAll(re)];
    if (REQUIRED.includes(name) && matches.length !== 1) {
      console.log(`✗ ${rel}: Partial „${name}“ ${matches.length === 0 ? 'fehlt' : 'mehrfach vorhanden'}`);
      problems++;
      continue;
    }
    for (const m of matches) {
      if (m[1] === partials[name]) continue;
      if (FIX) {
        html = html.replace(m[0], `${open}\n${partials[name]}\n${close}`);
        changed = true; fixed++;
        console.log(`↻ ${rel}: Partial „${name}“ synchronisiert`);
      } else {
        problems++;
        console.log(`✗ ${rel}: Partial „${name}“ weicht ab`);
        const a = partials[name].split('\n'), b = m[1].split('\n');
        for (let i = 0; i < Math.max(a.length, b.length); i++) {
          if (a[i] !== b[i]) { console.log(`    Zeile ${i + 1}\n    soll: ${a[i] ?? '∅'}\n    ist:  ${b[i] ?? '∅'}`); break; }
        }
      }
    }
  }

  const page = html.match(/<body[^>]*\sdata-page="([^"]+)"/);
  if (!page) { console.log(`✗ ${rel}: <body data-page="…"> fehlt`); problems++; }
  else if (!KNOWN_PAGES.has(page[1])) { console.log(`✗ ${rel}: unbekannter data-page-Wert „${page[1]}“`); problems++; }

  if (changed) fs.writeFileSync(file, html);
}

console.log(`${pages.length} Seiten geprüft · ${Object.keys(partials).length} Partials · ${problems} Probleme${FIX ? ` · ${fixed} synchronisiert` : ''}`);
process.exit(problems && !FIX ? 1 : 0);
