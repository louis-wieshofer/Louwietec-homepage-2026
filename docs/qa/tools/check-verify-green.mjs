#!/usr/bin/env node
/**
 * check-verify-green.mjs — Hausgesetze, maschinell geprüft:
 *   · Verifiziert-Grün (--verify / #2FD37A) kommt im CSS genau dreimal zur Anwendung
 *     (Siegel · bestandener Beleg · Verifiziert-Stempel) und wird genau einmal definiert;
 *     in HTML/JS/SVG kommt der Hex-Wert nicht vor. CSS-Kommentare zählen nicht mit.
 *   · kein Gold, keine „Trusted by“-Leiste, keine Stock-/Foto-Bilder: Bild-URLs
 *     (<img>/<source>/<video>/<image>, auch srcset und poster) nur aus /assets/brand/, /assets/frames/ oder data:.
 *   · border-radius (auch Longhands wie border-top-left-radius) immer 0 oder var(--radius);
 *     --radius ist genau einmal definiert und lautet 0.
 *   · keine Fremd-Requests: kein http(s)://-Verweis in src/srcset/href/poster/data von
 *     <script>/<link>/<img>/<source>/<video>/<audio>/<track>/<image>; <iframe>/<object>/<embed> gar nicht.
 *     <link> wird nur für ladende rel-Werte geprüft (stylesheet, preload, icon, manifest …);
 *     canonical/alternate auf louwietec.com bleiben erlaubt.
 *   · <style>-Blöcke und style="…"-Attribute in HTML laufen durch dieselbe CSS-Prüfung.
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
const stripCssComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '');
let problems = 0;
const fail = (msg) => { problems++; console.log(`✗ ${msg}`); };
const ok = (msg) => console.log(`✓ ${msg}`);

// Eine CSS-Prüfung für Stylesheets, <style>-Blöcke und style="…"
let uses = 0, defs = 0;
const radiusDefs = [];
function checkCss(raw, where) {
  const css = stripCssComments(raw);
  uses += count(css, /var\(--verify\)/g);
  defs += count(css, /#2fd37a/gi);
  for (const m of css.matchAll(/--radius\s*:\s*([^;}]+)/g)) radiusDefs.push({ where, value: m[1].trim() });
  const radii = [...css.matchAll(/border(?:-[a-z]+)*-radius\s*:\s*([^;}]+)/g)]
    .map((m) => m[1].replace(/\s*!important\s*$/, '').trim())
    .filter((v) => !/^(0|0px|var\(--radius\))$/.test(v));
  if (radii.length) fail(`${where}: border-radius ≠ 0: ${radii.join(', ')}`);
  if (/\bgold\b/i.test(css)) fail(`${where}: „gold“ gefunden`);
  if (/url\(\s*["']?https?:\/\//i.test(css)) fail(`${where}: externe URL im CSS`);
}

// CSS-Dateien
const cssFiles = walk(path.join(ROOT, 'assets/css'), ['.css']);
for (const f of cssFiles) checkCss(fs.readFileSync(f, 'utf8'), path.relative(ROOT, f));

// HTML / JS / SVG / JSON
const LOCAL_MEDIA = /^\/assets\/(brand|frames)\//;
const LOADING_REL = /stylesheet|preload|modulepreload|icon|manifest|prefetch|preconnect|dns-prefetch/;
const OWN_HOST = /^https:\/\/(www\.)?louwietec\.com\//;
const others = walk(ROOT, ['.html', '.js', '.svg', '.json']);
for (const f of others) {
  const rel = path.relative(ROOT, f);
  const s = fs.readFileSync(f, 'utf8');
  if (/#2fd37a/i.test(s)) fail(`${rel}: Verifiziert-Grün außerhalb des CSS`);
  if (/trusted by/i.test(s)) fail(`${rel}: „Trusted by“ gefunden`);
  if (f.endsWith('.html')) {
    const html = s.replace(/<!--[\s\S]*?-->/g, '');
    if (/\bgold\b/i.test(html)) fail(`${rel}: „Gold“ im Markup`);
    for (const m of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) checkCss(m[1], `${rel} <style>`);
    for (const m of html.matchAll(/\sstyle=(?:"([^"]*)"|'([^']*)')/g)) checkCss(m[1] ?? m[2], `${rel} style=""`);
    for (const m of html.matchAll(/<(img|source|video|audio|iframe|object|embed|image|script|link|track)\b([^>]*)>/gi)) {
      const tag = m[1].toLowerCase(), attrs = m[2];
      if (tag === 'iframe' || tag === 'object' || tag === 'embed') { fail(`${rel}: <${tag}> ist nicht erlaubt (Fremdinhalt)`); continue; }
      const relAttr = (attrs.match(/\srel=["']([^"']+)["']/) || [])[1] || '';
      for (const a of attrs.matchAll(/\s(src|srcset|href|poster|data|xlink:href)=["']([^"']*)["']/g)) {
        const name = a[1], value = a[2];
        const urls = name === 'srcset' ? value.split(',').map((c) => c.trim().split(/\s+/)[0]).filter(Boolean) : [value];
        for (const url of urls) {
          if (['img', 'source', 'video', 'image'].includes(tag) || name === 'poster') {
            if (!LOCAL_MEDIA.test(url) && !url.startsWith('data:') && !url.startsWith('#')) fail(`${rel}: <${tag} ${name}="${url}"> außerhalb /assets/brand|frames/`);
          } else if (/^https?:\/\//i.test(url)) {
            if (tag === 'link') {
              if (LOADING_REL.test(relAttr) && !OWN_HOST.test(url)) fail(`${rel}: externe Ressource ${url}`);
            } else {
              fail(`${rel}: <${tag} ${name}="${url}"> — Fremd-Request`);
            }
          }
        }
      }
    }
    if (!/<html[^>]*\slang="de"/.test(s)) fail(`${rel}: <html lang="de"> fehlt`);
  }
}

// Summen (CSS-Dateien + HTML-Styles)
uses === 3 ? ok(`var(--verify) im CSS: ${uses}× (Soll 3)`) : fail(`var(--verify) im CSS: ${uses}× (Soll 3)`);
defs === 1 ? ok(`#2FD37A im CSS: ${defs}× (Soll 1)`) : fail(`#2FD37A im CSS: ${defs}× (Soll 1)`);
if (radiusDefs.length === 1 && /^0(px)?$/.test(radiusDefs[0].value)) ok(`--radius: ${radiusDefs[0].value} (genau einmal, in ${radiusDefs[0].where})`);
else fail(`--radius muss genau einmal definiert sein und 0 lauten: ${radiusDefs.map((d) => `${d.where} → ${d.value}`).join(', ') || 'keine Definition'}`);
ok(`${cssFiles.length} CSS-Dateien und ${others.length} HTML/JS/SVG/JSON-Dateien geprüft (Grün, Gold, „Trusted by“, Radius, Fremdbilder, Fremd-Requests)`);

console.log(problems ? `${problems} Verstöße` : 'Alle Hausgesetze eingehalten.');
process.exit(problems ? 1 : 0);
