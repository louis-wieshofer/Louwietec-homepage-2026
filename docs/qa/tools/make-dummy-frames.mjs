#!/usr/bin/env node
/**
 * make-dummy-frames.mjs — erzeugt eine Test-Bildsequenz für die Frame-Scrub-Schnittstelle des Heros:
 * 30 Frames 16:9 (640×360) und 30 Frames 9:16 (360×640) als WebP, dazu manifest.json.
 * Motiv: aus Punkten wird eine Kette aus dreizehn Gliedern (reine Typografie/Linien, kein Foto).
 * Die echte Higgsfield-Sequenz ersetzt später nur den Ordner /assets/frames/<version>/ und das Manifest.
 * Dev-only (sharp).
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(new URL('.', import.meta.url).pathname, '../../..');
const VERSION = process.argv[2] || 'v0-dummy';
const OUT = path.join(ROOT, 'assets/frames', VERSION);
const COUNT = 30, FPS = 30, INTRO_END = 12, LINKS = 13;

function frameSvg(i, W, H) {
  const p = i / (COUNT - 1);
  const margin = Math.min(W, H) * 0.08, usable = W - margin * 2, step = usable / (LINKS + 1);
  let rects = '';
  const shown = p * (LINKS + 2);
  for (let k = 0; k < LINKS; k++) {
    const a = Math.min(1, Math.max(0, shown - k));
    if (a <= 0) continue;
    const x = margin + step * (k + 1), y = H * 0.58 - (k / (LINKS - 1)) * H * 0.14;
    const horiz = k % 2 === 0, w = (horiz ? step * 1.05 : step * 0.5) * (0.6 + 0.4 * a), h = (horiz ? step * 0.5 : step * 1.05) * (0.6 + 0.4 * a);
    rects += `<rect x="${(x - w / 2).toFixed(1)}" y="${(y - h / 2).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="${k === LINKS - 1 && p > 0.9 ? 'rgba(79,141,255,.3)' : 'none'}" stroke="rgba(79,141,255,${(0.25 + 0.75 * a).toFixed(2)})" stroke-width="${Math.max(2, W / 320)}"/>`;
  }
  let dots = '';
  let s = 7; const rnd = () => { s = (s * 16807 + 11) % 2147483647; return s / 2147483647; };
  for (let d = 0; d < 80; d++) {
    const dx = rnd() * W, dy = rnd() * H, tx = margin + step * ((d % LINKS) + 1), ty = H * 0.58 - ((d % LINKS) / (LINKS - 1)) * H * 0.14;
    const k = Math.min(1, p / 0.85);
    dots += `<circle cx="${(dx + (tx - dx) * k).toFixed(1)}" cy="${(dy + (ty - dy) * k).toFixed(1)}" r="${(2.2 - k).toFixed(2)}" fill="rgba(79,141,255,${(0.85 - 0.5 * k).toFixed(2)})"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#0B0F19"/>${dots}${rects}<text x="${margin}" y="${H * 0.92}" font-family="monospace" font-size="${Math.max(10, W / 60)}" fill="rgba(246,245,241,.28)">DUMMY ${String(i).padStart(4, '0')} · ${Math.round(p * 100)} %</text></svg>`;
}

async function renderSet(dir, W, H) {
  await fs.mkdir(dir, { recursive: true });
  let bytes = 0;
  for (let i = 0; i < COUNT; i++) {
    const buf = await sharp(Buffer.from(frameSvg(i, W, H))).webp({ quality: 72 }).toBuffer();
    await fs.writeFile(path.join(dir, `frame_${String(i).padStart(4, '0')}.webp`), buf);
    bytes += buf.length;
  }
  return bytes;
}

const landscape = await renderSet(OUT, 640, 360);
const portrait = await renderSet(path.join(OUT, 'portrait'), 360, 640);
await sharp(Buffer.from(frameSvg(0, 640, 360))).webp({ quality: 72 }).toFile(path.join(OUT, 'poster.webp'));
const manifest = {
  version: VERSION, fps: FPS, count: COUNT, width: 640, height: 360, pattern: 'frame_{i:04}.webp', intro_end: INTRO_END, poster: 'poster.webp',
  portrait: { pattern: 'portrait/frame_{i:04}.webp', width: 360, height: 640 },
  hinweis: 'Test-Sequenz (Vorschau). Die Higgsfield-Sequenz ersetzt diesen Ordner; Schnittstelle: hero.js liest dieses Manifest.',
};
await fs.writeFile(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`${VERSION}: ${COUNT} Frames 16:9 (${Math.round(landscape / 1024)} KB) + ${COUNT} Frames 9:16 (${Math.round(portrait / 1024)} KB) + manifest.json → ${path.relative(ROOT, OUT)}`);
