#!/usr/bin/env node
/**
 * make-brand.mjs — erzeugt die Marken-Assets unter /assets/brand/ aus den
 * beiden Logo-Dateien im Repo-Root (IMG_0710.png Icon, IMG_0707.png Volllogo).
 *
 * Dev-only. Erzeugt keine Seiten, ist kein Build-Schritt der Site.
 * Abhängigkeiten: sharp, png-to-ico (siehe package.json in diesem Ordner).
 *
 * Verfahren: Die Quell-PNGs sind blau auf weiß gefülltem Grund. Die Deckkraft
 * wird aus dem „Abstand zu Weiß“ abgeleitet (min(R,G,B)), die Originalfarbe
 * wird gegen Weiß entblendet. Daraus entstehen transparente Original-, Weiß-
 * und Tinten-Varianten, Favicons, PWA-Icons und favicon.ico.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';

const ROOT = path.resolve(new URL('.', import.meta.url).pathname, '../../..');
const OUT = path.join(ROOT, 'assets/brand');
const PAPER = [246, 245, 241];
const INK = [11, 15, 25];

function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }

/** Liest ein PNG, gibt {data, width, height} als RGBA-Rohdaten zurück. */
async function raw(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

/** Ermittelt den kleinsten Kanalwert der dominanten Markenfarbe (für die Alpha-Skala). */
function dominantMinChannel({ data }) {
  const hist = new Map();
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const mn = Math.min(r, g, b);
    if (mn > 200) continue; // (fast) weiß überspringen
    const key = `${r >> 3},${g >> 3},${b >> 3}`;
    hist.set(key, (hist.get(key) || 0) + 1);
  }
  let best = null, n = 0;
  for (const [k, v] of hist) if (v > n) { n = v; best = k; }
  const [r, g, b] = best.split(',').map(v => (v << 3) + 4);
  return { rgb: [r, g, b], min: Math.min(r, g, b) };
}

/**
 * Baut aus Blau-auf-Weiß ein RGBA-Bild mit echter Transparenz.
 * mode: 'original' (entblendete Originalfarbe) | 'paper' | 'ink'
 */
function unblend(img, minBlue, mode) {
  const { data, width, height } = img;
  const out = Buffer.alloc(data.length);
  const scale = 255 - minBlue;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2], a0 = data[i + 3] / 255;
    let a = clamp01((255 - Math.min(r, g, b)) / scale) * a0;
    if (a < 0.03) a = 0;
    let rr, gg, bb;
    if (mode === 'paper') [rr, gg, bb] = PAPER;
    else if (mode === 'ink') [rr, gg, bb] = INK;
    else if (a > 0) {
      // Entblenden gegen Weiß: C = C' * a + 255 * (1 - a)  ⇒  C' = (C - 255(1-a)) / a
      rr = clamp01((r - 255 * (1 - a)) / a / 255) * 255;
      gg = clamp01((g - 255 * (1 - a)) / a / 255) * 255;
      bb = clamp01((b - 255 * (1 - a)) / a / 255) * 255;
    } else { rr = gg = bb = 0; }
    out[i] = Math.round(rr); out[i + 1] = Math.round(gg); out[i + 2] = Math.round(bb); out[i + 3] = Math.round(a * 255);
  }
  return { data: out, width, height };
}

/** Beschneidet auf die Bounding-Box der Deckkraft (+ Rand in % der Kantenlänge). */
function bbox({ data, width, height }, threshold = 8) {
  let x0 = width, y0 = height, x1 = -1, y1 = -1;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    if (data[(y * width + x) * 4 + 3] > threshold) {
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
  }
  return { left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 };
}

async function toSharp(img) {
  return sharp(img.data, { raw: { width: img.width, height: img.height, channels: 4 } });
}

async function writeVariants(base, img, { square = false, pad = 0.06 } = {}) {
  const box = bbox(img);
  let s = (await toSharp(img)).extract(box);
  if (square) {
    const side = Math.max(box.width, box.height);
    const p = Math.round(side * pad);
    s = s.extend({
      top: Math.floor((side - box.height) / 2) + p, bottom: Math.ceil((side - box.height) / 2) + p,
      left: Math.floor((side - box.width) / 2) + p, right: Math.ceil((side - box.width) / 2) + p,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    });
  }
  const buf = await s.png({ compressionLevel: 9 }).toBuffer();
  await fs.writeFile(path.join(OUT, `${base}.png`), buf);
  await sharp(buf).webp({ quality: 90, alphaQuality: 90 }).toFile(path.join(OUT, `${base}.webp`));
  return buf;
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  const iconSrc = await raw(path.join(ROOT, 'IMG_0710.png'));
  const fullSrc = await raw(path.join(ROOT, 'IMG_0707.png'));
  const dom = dominantMinChannel(iconSrc);
  console.log(`Markenblau (dominant): rgb(${dom.rgb.join(',')}) · min-Kanal ${dom.min}`);

  // Icon-Varianten (quadratisch, transparent)
  const iconPng = await writeVariants('icon', unblend(iconSrc, dom.min, 'original'), { square: true });
  await writeVariants('icon-white', unblend(iconSrc, dom.min, 'paper'), { square: true });
  await writeVariants('icon-ink', unblend(iconSrc, dom.min, 'ink'), { square: true });

  // Volllogo-Varianten (beschnitten, transparent)
  await writeVariants('logo-full', unblend(fullSrc, dom.min, 'original'));
  await writeVariants('logo-full-white', unblend(fullSrc, dom.min, 'paper'));

  // Favicons und PWA-Icons
  const sizes = { 'favicon-16': 16, 'favicon-32': 32, 'favicon-48': 48, 'icon-192': 192, 'icon-512': 512 };
  for (const [name, px] of Object.entries(sizes)) {
    await sharp(iconPng).resize(px, px, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9 }).toFile(path.join(OUT, `${name}.png`));
  }
  // Apple Touch Icon: deckend auf Papier, 12 % Rand
  await sharp(iconPng).resize(Math.round(180 * 0.76), Math.round(180 * 0.76), { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({ top: 22, bottom: 21, left: 22, right: 21, background: { r: PAPER[0], g: PAPER[1], b: PAPER[2], alpha: 1 } })
    .flatten({ background: { r: PAPER[0], g: PAPER[1], b: PAPER[2] } })
    .png({ compressionLevel: 9 }).toFile(path.join(OUT, 'apple-touch-icon.png'));
  // Maskable: Icon bei 60 % auf Papier (Safe Zone)
  const inner = Math.round(512 * 0.6), rest = 512 - inner;
  await sharp(iconPng).resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({ top: Math.floor(rest / 2), bottom: Math.ceil(rest / 2), left: Math.floor(rest / 2), right: Math.ceil(rest / 2), background: { r: PAPER[0], g: PAPER[1], b: PAPER[2], alpha: 1 } })
    .flatten({ background: { r: PAPER[0], g: PAPER[1], b: PAPER[2] } })
    .png({ compressionLevel: 9 }).toFile(path.join(OUT, 'icon-512-maskable.png'));
  // favicon.ico aus 16/32/48
  const ico = await pngToIco(['favicon-16', 'favicon-32', 'favicon-48'].map(n => path.join(OUT, `${n}.png`)));
  await fs.writeFile(path.join(ROOT, 'favicon.ico'), ico);
  await fs.unlink(path.join(OUT, 'favicon-48.png'));

  // Web-Manifest
  const manifest = {
    name: 'LOUWIETEC', short_name: 'LOUWIETEC', lang: 'de', start_url: '/', display: 'browser',
    background_color: '#F6F5F1', theme_color: '#0B0F19',
    icons: [
      { src: '/assets/brand/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/assets/brand/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/assets/brand/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
  await fs.writeFile(path.join(ROOT, 'site.webmanifest'), JSON.stringify(manifest, null, 2) + '\n');

  const files = (await fs.readdir(OUT)).sort();
  for (const f of files) {
    const st = await fs.stat(path.join(OUT, f));
    const meta = /\.(png|webp)$/.test(f) ? await sharp(path.join(OUT, f)).metadata() : {};
    console.log(`${f.padEnd(26)} ${String(st.size).padStart(7)} B  ${meta.width || ''}${meta.width ? '×' + meta.height : ''}`);
  }
  console.log('favicon.ico', (await fs.stat(path.join(ROOT, 'favicon.ico'))).size, 'B');
}

main().catch(e => { console.error(e); process.exit(1); });
