# PHASE 4 — STATUS 🟢

**Datum:** 2026-09-05 · **Branch:** `feature/website-v2`

## Erledigt
- `hero.js` mit zwei Modi: **placeholder** (Canvas: aus Punkten wird beim Scrollen eine Kette aus dreizehn Gliedern; am Ende dockt das Icon per FLIP am Header-Logo an, das kurz glüht) und **frames** (Bildsequenz aus `/assets/frames/<version>/manifest.json`, Preload-Pool, Shot 1 läuft beim Laden einmal stumm, Rest folgt dem Scroll; Hochformat-Set bei Portrait). Hero ist mit ScrollTrigger unter dem Header gepinnt (Desktop +150 %, Mobil +80 %). Umschalten per `?hero=frames|placeholder`; Manifest-Fehler → Platzhalter.
- Manifest-Schema: `{ version, fps, count, width, height, pattern, intro_end, poster, portrait:{pattern,width,height} }`.
- `make-dummy-frames.mjs`: 30 Test-Frames 640×360 + 30 Frames 360×640 (WebP, 256 KB gesamt) + `manifest.json` unter `assets/frames/v0-dummy/`.
- Handshake `lw:motion-ready` zwischen `motion.js` (Vendor geladen) und `hero.js` (Pinnen).
- Ohne Bewegung/JS: `hero-poster.svg` sichtbar, Canvas ausgeblendet.

## Beleg
- Chromium (1440×900): Platzhalter aktiv, Pin-Spacer vorhanden, Canvas zeichnet, Fortschritt 0 → 1 nach 2 200 px, Icon angedockt, Header-Logo glüht; 0 Fehler.
- `?hero=frames`: 30 Frames + Poster geladen (31 Anfragen), Intro abgespielt, Scrub bis Fortschritt 1, Andocken; 0 Fehler.
- Reduced Motion: Poster Opacity 0,55, Canvas `display: none`.

## Abweichungen
1. Die Higgsfield-Sequenz liegt noch nicht vor → Test-Sequenz `v0-dummy` (Vorschau, reine Linien) als Platzhalter der Schnittstelle. Produktiv bleibt der Canvas-Platzhalter aktiv (`data-hero-mode="placeholder"`); Umschalten auf Frames erfordert nur neuen Ordner + `data-hero-mode="frames"`.
2. Frames werden per `fetch` + `createImageBitmap` geladen (nicht als `<img>`), damit der Hausgesetz-Prüfer Bilder außerhalb `/assets/brand|frames/` weiter verbieten kann.

## Offen für Louis
1. Higgsfield-Sequenz Version A/B (16:9 und 9:16, WebP, 30 fps) — Ablage unter `/assets/frames/<version>/` mit Manifest; Baff-Test entscheidet A/B.
2. Gewicht der echten Sequenz (~300 Frames) gegen < 2 s mobil: Vorschlag `step`/reduzierte fps auf Mobil, Laden nach LCP.

## Nächster Schritt
Phase 5 (Anbindung): `api.js`, `forms.js`, `products.js`, `analytics.js`, `jobs.js`, Redirect-Stubs, Playwright-Mock-Fixture und Integrationstests.
