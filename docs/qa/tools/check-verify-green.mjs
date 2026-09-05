#!/usr/bin/env node
/**
 * check-verify-green.mjs — Hausgesetze, maschinell geprüft:
 *   · Verifiziert-Grün (--verify / #2FD37A) kommt im CSS genau dreimal zur Anwendung
 *     (Siegel · bestandener Beleg · Verifiziert-Stempel) und wird genau einmal definiert;
 *     in HTML/JS/SVG kommt der Hex-Wert nicht vor.
 *   · kein Gold, keine „Trusted by“-Leiste, keine Stock-/Foto-Bilder:
 *     <img> nur aus /assets/brand/ oder /assets/frames/.
 *   · border-radius immer 0 (nur var(--radius) oder 0).
 *   · keine Fremd-Requests: kein http(s)://-Verweis in src/href von <script>/<link>,
 *     außer den beiden Vertragshosts in JS-Konstanten.
 * Exit 1 bei Verstoß. Dev-only.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(new URL('.', import.meta.url).pathname, '../../..');
const SKIP = new Set(['.git', 'node_modules', 'docs']);

function walk(dir, exts, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(e.name) || e.name.startsWith('.')) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, exts, out);
    else if (exts.some((x) => e.name.endsWith(x))) out.push(p);
  }
  return out;
}
const count = (s, re) => (s.match(re) || []).length;
let problems = 0;
const fail = (msg) => { problems++; console.log(`✗ ${msg}`); };
const ok = (msg) => console.log(`✓ ${msg}`);

// CSS
const cssFiles = walk(path.join(ROOT, 'assets/css'), ['.css']);
let uses = 0, defs = 0;
for (const f of cssFiles) {
  const s = fs.readFileSync(f, 'utf8');
  uses += count(s, /var\(--verify\)/g);
  defs += count(s, /#2fd37a/gi);
  const radii = [...s.matchAll(/border-radius\s*:\s*([^;]+);/g)].map((m) => m[1].trim()).filter((v) => !/^(0|0px|var\(--radius\))$/.test(v));
  if (radii.length) fail(`${path.relative(ROOT, f)}: border-radius ≠ 0: ${radii.join(', ')}`);
  if (/\bgold\b/i.test(s)) fail(`${path.relative(ROOT, f)}: „gold“ gefunden`);
  if (/url\(\s*["']?https?:\/\//i.test(s)) fail(`${path.relative(ROOT, f)}: externe URL im CSS`);
}
uses === 3 ? ok(`var(--verify) im CSS: ${uses}× (Soll 3)`) : fail(`var(--verify) im CSS: ${uses}× (Soll 3)`);
defs === 1 ? ok(`#2FD37A im CSS: ${defs}× (Soll 1)`) : fail(`#2FD37A im CSS: ${defs}× (Soll 1)`);

// HTML / JS / SVG
const others = walk(ROOT, ['.html', '.js', '.svg', '.json']);
for (const f of others) {
  const rel = path.relative(ROOT, f);
  const s = fs.readFileSync(f, 'utf8');
  if (/#2fd37a/i.test(s)) fail(`${rel}: Verifiziert-Grün außerhalb des CSS`);
  if (/trusted by/i.test(s)) fail(`${rel}: „Trusted by“ gefunden`);
  if (f.endsWith('.html')) {
    if (/\bgold\b/i.test(s.replace(/<!--[\s\S]*?-->/g, ''))) fail(`${rel}: „Gold“ im Markup`);
    for (const m of s.matchAll(/<img\b[^>]*\ssrc="([^"]+)"/g)) {
      const src = m[1];
      if (!/^\/assets\/(brand|frames)\//.test(src) && !src.startsWith('data:')) fail(`${rel}: <img src="${src}"> außerhalb /assets/brand|frames/`);
    }
    for (const m of s.matchAll(/<script\b[^>]*\ssrc="(https?:\/\/[^"]+)"/g)) fail(`${rel}: externes Skript ${m[1]}`);
    for (const m of s.matchAll(/<link\b([^>]*)>/g)) {
      const rel = (m[1].match(/\srel="([^"]+)"/) || [])[1] || '';
      const href = (m[1].match(/\shref="(https?:\/\/[^"]+)"/) || [])[1];
      if (href && /stylesheet|preload|modulepreload|icon|manifest|prefetch/.test(rel) && !/^https:\/\/(www\.)?louwietec\.com\//.test(href)) fail(`${path.relative(ROOT, f)}: externe Ressource ${href}`);
    }
    if (!/<html[^>]*\slang="de"/.test(s)) fail(`${rel}: <html lang="de"> fehlt`);
  }
}
ok(`${others.length} HTML/JS/SVG/JSON-Dateien ohne Grün, Gold, „Trusted by“, Fremdbilder oder Fremd-Skripte geprüft`);

console.log(problems ? `${problems} Verstöße` : 'Alle Hausgesetze eingehalten.');
process.exit(problems ? 1 : 0);
