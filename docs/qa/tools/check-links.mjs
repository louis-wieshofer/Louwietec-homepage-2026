#!/usr/bin/env node
/**
 * check-links.mjs — prüft alle internen Verweise der Site gegen das Dateisystem:
 * href/src/srcset/poster/action/data-jobs-src in allen HTML-Dateien, Anker (#id)
 * gegen die Ziel-Datei, Manifest-Icons, CSS url(). Externe Verweise werden
 * gelistet (erlaubt: mailto:, tel:, die beiden Vertragshosts in JS-Konstanten).
 * Report nach docs/qa/links/<datum>/report.md. Exit 1 bei kaputten internen Links.
 * Dev-only.
 */
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'node-html-parser';

const ROOT = process.env.LW_ROOT || path.resolve(new URL('.', import.meta.url).pathname, '../../..');
const today = new Date().toISOString().slice(0, 10);
const OUT = path.join(ROOT, 'docs/qa/links', today);
const SKIP = new Set(['.git', 'node_modules', 'docs']);

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(e.name) || e.name.startsWith('.')) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}
const files = walk(ROOT);
const htmlFiles = files.filter((f) => f.endsWith('.html'));
const cssFiles = files.filter((f) => f.endsWith('.css'));

/** Löst einen Site-Pfad auf eine Datei auf (Pages-Semantik: /x/ → /x/index.html, /x → /x.html oder /x/index.html). */
function resolveTarget(urlPath, fromFile) {
  let p = urlPath.split('?')[0];
  const abs = p.startsWith('/') ? path.join(ROOT, p) : path.resolve(path.dirname(fromFile), p);
  const candidates = p.endsWith('/') ? [path.join(abs, 'index.html')] : [abs, abs + '.html', path.join(abs, 'index.html')];
  return candidates.find((c) => fs.existsSync(c) && fs.statSync(c).isFile()) || null;
}
const idCache = new Map();
function hasId(file, id) {
  if (!idCache.has(file)) {
    const root = parse(fs.readFileSync(file, 'utf8'));
    idCache.set(file, new Set(root.querySelectorAll('[id]').map((el) => el.getAttribute('id'))));
  }
  return idCache.get(file).has(id);
}

const broken = [], external = [], checked = { internal: 0, anchors: 0, external: 0 };
function check(ref, fromFile, what) {
  if (!ref || ref.startsWith('data:') || ref.startsWith('javascript:')) return;
  if (/^(mailto|tel):/.test(ref)) { external.push(`${path.relative(ROOT, fromFile)} → ${ref} (${what})`); checked.external++; return; }
  if (/^https?:\/\//.test(ref)) { external.push(`${path.relative(ROOT, fromFile)} → ${ref} (${what}) ⚠ extern`); checked.external++; return; }
  const [pathPart, hash] = ref.split('#');
  let target = fromFile;
  if (pathPart) {
    target = resolveTarget(pathPart, fromFile);
    checked.internal++;
    if (!target) { broken.push(`${path.relative(ROOT, fromFile)} → ${ref} (${what}): Ziel fehlt`); return; }
  }
  if (hash !== undefined && hash !== '' && target.endsWith('.html')) {
    checked.anchors++;
    if (!hasId(target, decodeURIComponent(hash))) broken.push(`${path.relative(ROOT, fromFile)} → ${ref} (${what}): Anker #${hash} fehlt in ${path.relative(ROOT, target)}`);
  }
}

for (const f of htmlFiles) {
  const root = parse(fs.readFileSync(f, 'utf8'));
  for (const el of root.querySelectorAll('[href]')) check(el.getAttribute('href'), f, `<${el.rawTagName} href>`);
  for (const el of root.querySelectorAll('[src]')) check(el.getAttribute('src'), f, `<${el.rawTagName} src>`);
  for (const el of root.querySelectorAll('[poster], [action], [data-jobs-src]')) for (const a of ['poster', 'action', 'data-jobs-src']) if (el.getAttribute(a)) check(el.getAttribute(a), f, a);
  for (const el of root.querySelectorAll('[srcset]')) for (const part of el.getAttribute('srcset').split(',')) check(part.trim().split(/\s+/)[0], f, 'srcset');
  for (const m of root.querySelectorAll('meta[http-equiv="refresh"]')) { const u = (m.getAttribute('content') || '').match(/url=(.+)$/i); if (u) check(u[1].trim(), f, 'meta refresh'); }
}
for (const f of cssFiles) {
  const css = fs.readFileSync(f, 'utf8');
  for (const m of css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)) check(m[1], f, 'css url()');
}
const manifest = path.join(ROOT, 'site.webmanifest');
if (fs.existsSync(manifest)) for (const icon of JSON.parse(fs.readFileSync(manifest, 'utf8')).icons || []) check(icon.src, manifest, 'manifest icon');

fs.mkdirSync(OUT, { recursive: true });
const report = [`# Link-Check — ${today}`, '', `${htmlFiles.length} HTML-Dateien · ${checked.internal} interne Verweise · ${checked.anchors} Anker · ${checked.external} externe/mailto`, '',
  `## Kaputt (${broken.length})`, '', ...broken.map((b) => `- ${b}`), '', `## Extern / mailto (${external.length})`, '', ...[...new Set(external)].map((e) => `- ${e}`), ''];
fs.writeFileSync(path.join(OUT, 'report.md'), report.join('\n'));
console.log(report.slice(0, 4).join('\n'));
for (const b of broken) console.log(`✗ ${b}`);
const ext = [...new Set(external)].filter((e) => e.includes('⚠'));
for (const e of ext) console.log(`⚠ ${e}`);
console.log(broken.length ? `${broken.length} kaputte Verweise` : 'Alle internen Verweise gültig.');
process.exit(broken.length ? 1 : 0);
