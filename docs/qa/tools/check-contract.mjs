#!/usr/bin/env node
/**
 * check-contract.mjs — Formulare und config.js gegen docs/CONTRACT.md (Enums, Endpunkte, Pflichtfelder).
 * Parst den Vertrag selbst (keine zweite Wahrheit): Enum-Zeilen „- `name`: `a` | `b`“ und die Endpunkt-Tabelle
 * „| `POST /pfad` | **pflicht, felder** … |“. Prüft dann jede form[data-form][data-endpoint]:
 *   Endpunkt existiert · alle Pflichtfelder als [name] vorhanden · select/radio-Werte ⊆ Enum · Honeypot website, ts, consent.
 * Außerdem: ENUMS in assets/js/config.js identisch mit dem Vertrag. Exit 1 bei Abweichung. Dev-only.
 */
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'node-html-parser';

const ROOT = process.env.LW_ROOT || path.resolve(new URL('.', import.meta.url).pathname, '../../..');
const contract = fs.readFileSync(path.join(ROOT, 'docs/CONTRACT.md'), 'utf8');

// Enums
const enums = {};
for (const m of contract.matchAll(/^\s*- `([a-z.]+)`(?: \([^)]*\))?: (`[^\n]+)$/gm)) {
  const name = m[1].replace('produkt.status', 'status');
  enums[name] = [...m[2].matchAll(/`([a-z]+)`/g)].map((x) => x[1]);
}
// Endpunkte mit Pflichtfeldern (fett) und optionalen Feldern
const endpoints = {};
for (const m of contract.matchAll(/^\| `(GET|POST) ([^`]+)`[^|]*\| ([^|]*)\|/gm)) {
  const [, method, p, fields] = m;
  const required = [...fields.matchAll(/\*\*([^*]+)\*\*/g)].flatMap((x) => x[1].split(',').map((s) => s.trim())).filter((s) => /^[a-z_]+$/.test(s));
  const all = fields.replace(/\*\*/g, '').split(/[,\s]+/).map((s) => s.trim()).filter((s) => /^[a-z_]+$/.test(s));
  endpoints[`${method} ${p.replace(/\s*\*.*$/, '').trim()}`] = { required, optional: all.filter((f) => !required.includes(f)) };
}
let problems = 0;
const fail = (m) => { problems++; console.log(`✗ ${m}`); };
const ok = (m) => console.log(`✓ ${m}`);
ok(`Vertrag gelesen: ${Object.keys(enums).length} Enums, ${Object.keys(endpoints).length} Endpunkte`);

// config.js
const cfg = fs.readFileSync(path.join(ROOT, 'assets/js/config.js'), 'utf8');
const cfgEnums = {};
const block = cfg.match(/ENUMS = Object\.freeze\(\{([\s\S]*?)\}\)/);
if (block) for (const m of block[1].matchAll(/(\w+): \[([^\]]+)\]/g)) cfgEnums[m[1]] = [...m[2].matchAll(/'([a-z]+)'/g)].map((x) => x[1]);
for (const [name, vals] of Object.entries(enums)) {
  const c = cfgEnums[name];
  if (!c) { fail(`config.js: Enum „${name}“ fehlt`); continue; }
  const same = c.length === vals.length && vals.every((v) => c.includes(v));
  same ? ok(`config.js Enum ${name}: ${vals.length} Werte identisch`) : fail(`config.js Enum ${name}: ${JSON.stringify(c)} ≠ ${JSON.stringify(vals)}`);
}

// Formulare
function walk(dir, out = []) { for (const e of fs.readdirSync(dir, { withFileTypes: true })) { if (['.git', 'node_modules', 'docs'].includes(e.name) || e.name.startsWith('.')) continue; const p = path.join(dir, e.name); e.isDirectory() ? walk(p, out) : e.name.endsWith('.html') && out.push(p); } return out; }
const ENUM_FIELD = { anliegen: 'anliegen', rolle: 'rolle', edition: 'edition', branche: 'branche', betriebsort: 'betriebsort', produkt: 'produkt' };
let formsSeen = 0;
for (const f of walk(ROOT)) {
  const root = parse(fs.readFileSync(f, 'utf8'));
  for (const form of root.querySelectorAll('form[data-form]')) {
    formsSeen++;
    const rel = `${path.relative(ROOT, f)} [${form.getAttribute('data-form')}]`;
    const ep = `POST ${form.getAttribute('data-endpoint')}`;
    const spec = endpoints[ep];
    if (!spec) { fail(`${rel}: Endpunkt ${ep} nicht im Vertrag`); continue; }
    const names = new Set(form.querySelectorAll('[name]').map((el) => el.getAttribute('name')));
    const isSelfcheck = form.getAttribute('data-form') === 'selbstcheck';
    for (const r of spec.required) {
      if (r === 'antworten' && isSelfcheck) { const qs = [...Array(10).keys()].every((i) => names.has(`q${i}`)); qs ? ok(`${rel}: antworten über q0…q9`) : fail(`${rel}: Radios q0…q9 unvollständig`); continue; }
      if (!names.has(r)) fail(`${rel}: Pflichtfeld „${r}“ fehlt`);
    }
    for (const n of names) {
      if (/^q\d$/.test(n)) continue;
      if (!spec.required.includes(n) && !spec.optional.includes(n)) fail(`${rel}: Feld „${n}“ nicht im Vertrag für ${ep}`);
    }
    const hp = form.querySelector('input[name="website"]');
    if (!hp || hp.getAttribute('tabindex') !== '-1') fail(`${rel}: Honeypot website fehlt oder ist fokussierbar`);
    if (!form.querySelector('input[name="ts"][type="hidden"]')) fail(`${rel}: verstecktes Feld ts fehlt`);
    if (!form.querySelector('input[name="consent"][type="checkbox"]')) fail(`${rel}: consent-Checkbox fehlt`);
    for (const [field, en] of Object.entries(ENUM_FIELD)) {
      // Vertrag: bei POST /forms/karriere ist „rolle“ ein optionales Freitextfeld (Rollen aus jobs.json), kein Enum.
      if (field === 'rolle' && form.getAttribute('data-form') === 'karriere') continue;
      const sel = form.querySelector(`select[name="${field}"]`);
      const radios = form.querySelectorAll(`input[type="radio"][name="${field}"]`);
      const values = sel ? sel.querySelectorAll('option').map((o) => o.getAttribute('value')).filter(Boolean) : radios.map((r) => r.getAttribute('value'));
      if (!values.length) continue;
      const bad = values.filter((v) => !enums[en].includes(v));
      const missing = enums[en].filter((v) => !values.includes(v));
      if (bad.length) fail(`${rel}: ${field} hat vertragsfremde Werte ${JSON.stringify(bad)}`);
      if (missing.length && field !== 'produkt' && field !== 'rolle') fail(`${rel}: ${field} fehlen Werte ${JSON.stringify(missing)}`);
    }
    ok(`${rel}: Endpunkt, Felder, Honeypot, ts, consent geprüft`);
  }
}
ok(`${formsSeen} Formulare geprüft`);
console.log(problems ? `${problems} Abweichungen vom Vertrag` : 'Formulare und config.js entsprechen dem Vertrag.');
process.exit(problems ? 1 : 0);
