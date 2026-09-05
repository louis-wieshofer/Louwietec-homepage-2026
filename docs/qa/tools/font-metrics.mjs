#!/usr/bin/env node
/** font-metrics.mjs — liest Metriken und Glyph-Abdeckung der gehosteten Schriften
 *  (Basis für die Fallback-@font-face-Regeln in site.css). Dev-only. */
import * as fontkit from 'fontkit';
import path from 'node:path';
const ROOT = path.resolve(new URL('.', import.meta.url).pathname, '../../..');
const files = ['Geist-latin.woff2', 'Geist-latin-ext.woff2', 'GeistMono-latin.woff2', 'GeistMono-latin-ext.woff2'];
for (const f of files) {
  const font = fontkit.openSync(path.join(ROOT, 'assets/fonts/geist', f));
  const u = font.unitsPerEm, os2 = font['OS/2'], hh = font.hhea;
  console.log(f.padEnd(26), `upm ${u}`, `asc ${(hh.ascent / u).toFixed(3)}`, `desc ${(hh.descent / u).toFixed(3)}`, `gap ${(hh.lineGap / u).toFixed(3)}`,
    `xAvg ${((os2 && os2.xAvgCharWidth) / u).toFixed(3)}`, `glyphs ${font.numGlyphs}`,
    `⌖(U+2316) ${font.hasGlyphForCodePoint(0x2316) ? 'ja' : 'nein'}`, `→(U+2192) ${font.hasGlyphForCodePoint(0x2192) ? 'ja' : 'nein'}`);
}
console.log('\nFallback (Arial/Liberation Sans xAvg 0.580; Courier New/Liberation Mono xAvg 0.600):');
console.log('  Geist Fallback:      size-adjust 100.2% · ascent-override 100.3% · descent-override 29.4% · line-gap-override 0%');
console.log('  Geist Mono Fallback: size-adjust 100%   · ascent-override 100.5% · descent-override 29.5% · line-gap-override 0%');
