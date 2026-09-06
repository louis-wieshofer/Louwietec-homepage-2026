#!/usr/bin/env node
/** font-metrics.mjs — Metriken und Glyph-Abdeckung der gehosteten Schriften und die daraus abgeleiteten
 *  Fallback-Deskriptoren für site.css („Geist Fallback“ / „Geist Mono Fallback“). Dev-only.
 *
 *  size-adjust wird NICHT aus OS/2-xAvgCharWidth geschätzt (je Schrift nach anderer Formel berechnet, als
 *  Breitenvergleich untauglich), sondern gemessen: ein deutsches Textmuster wird in der gehosteten Schrift
 *  und in der lokalen Fallback-Schrift gelayoutet, das Verhältnis der Vorschubbreiten ist size-adjust.
 *  ascent-/descent-override = hhea-Werte ÷ size-adjust, weil die Overrides mit size-adjust skaliert werden. */
import * as fontkit from 'fontkit';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(new URL('.', import.meta.url).pathname, '../../..');
const FONTS = path.join(ROOT, 'assets/fonts/geist');
const SAMPLE = 'Die Nachweispflicht für Hochrisiko-KI kommt. Wir machen Unternehmen unaufhaltbar: jede Entscheidung belegt, '
  + 'jede Änderung nachvollziehbar, jeder Bericht prüfbar. Wien, Österreich – Straße, Größe, Prüfung. 2027-12-02 · 453 Tage.';
const FALLBACKS = {
  'Geist Fallback': [
    '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
    '/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf',
    '/System/Library/Fonts/Supplemental/Arial.ttf', '/Library/Fonts/Arial.ttf', 'C:\\Windows\\Fonts\\arial.ttf',
  ],
  'Geist Mono Fallback': [
    '/usr/share/fonts/truetype/liberation/LiberationMono-Regular.ttf',
    '/usr/share/fonts/truetype/liberation2/LiberationMono-Regular.ttf',
    '/System/Library/Fonts/Supplemental/Courier New.ttf', '/Library/Fonts/Courier New.ttf', 'C:\\Windows\\Fonts\\cour.ttf',
  ],
};

const width = (font, text) => font.layout(text).glyphs.reduce((a, g) => a + g.advanceWidth, 0) / font.unitsPerEm;
const pct = (x) => `${(x * 100).toFixed(1)}%`;

for (const f of ['Geist-latin.woff2', 'Geist-latin-ext.woff2', 'GeistMono-latin.woff2', 'GeistMono-latin-ext.woff2']) {
  const font = fontkit.openSync(path.join(FONTS, f));
  const u = font.unitsPerEm, hh = font.hhea;
  console.log(f.padEnd(26), `upm ${u}`, `asc ${(hh.ascent / u).toFixed(3)}`, `desc ${(hh.descent / u).toFixed(3)}`, `gap ${(hh.lineGap / u).toFixed(3)}`,
    `glyphs ${font.numGlyphs}`, `⌖(U+2316) ${font.hasGlyphForCodePoint(0x2316) ? 'ja' : 'nein'}`, `→(U+2192) ${font.hasGlyphForCodePoint(0x2192) ? 'ja' : 'nein'}`);
}

console.log('\nFallback-Deskriptoren (Textmuster gelayoutet, Verhältnis der Vorschubbreiten):');
for (const [name, hosted] of [['Geist Fallback', 'Geist-latin.woff2'], ['Geist Mono Fallback', 'GeistMono-latin.woff2']]) {
  const font = fontkit.openSync(path.join(FONTS, hosted));
  const local = FALLBACKS[name].find((p) => fs.existsSync(p));
  if (!local) { console.log(`  ${name}: keine lokale Fallback-Schrift gefunden (${FALLBACKS[name].join(', ')})`); continue; }
  const fb = fontkit.openSync(local);
  const r = width(font, SAMPLE) / width(fb, SAMPLE);
  const asc = font.hhea.ascent / font.unitsPerEm, desc = Math.abs(font.hhea.descent) / font.unitsPerEm;
  console.log(`  ${name} (gegen ${path.basename(local)}): size-adjust ${pct(r)} · ascent-override ${pct(asc / r)} · descent-override ${pct(desc / r)} · line-gap-override 0%`);
}
