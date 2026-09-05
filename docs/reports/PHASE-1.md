# PHASE 1 — STATUS 🟢 (Nachtrag aus Review-Workflow folgt)

**Datum:** 2026-09-05 · **Branch:** `feature/website-v2` · **Commits:** `90beb47` … `c70dcf3`

## Erledigt
- Scaffolding: `.nojekyll`, `.gitignore`, `docs/CONTRACT.md` (byteweise aus dem Anhang der Orchestrierung), `docs/copy/Website_Texte_Final_v2.md` (sha256-identisch), `README.md`.
- Schriften: Geist und Geist Mono als variable woff2 (Latin, Latin-Ext) selbst gehostet, OFL beigelegt, metrik-kompatible Fallbacks (kein Layout-Shift). Befund: `⌖` (U+2316) und `→` sind in Geist nicht enthalten → Beleg-Zeichen als SVG-Sprite (`#i-beleg`), Pfeile in CTAs entfallen (im Texte-Dokument Strukturzeichen).
- Marken-Assets aus den Root-Logos (`make-brand.mjs`): transparente Original-, Weiß- und Tinten-Varianten, Favicons, PWA-Icons, `favicon.ico`, `site.webmanifest`, `hero-poster.svg`. Root-Logos unverändert.
- `site.css`: Tokens (Verifiziert-Grün genau dreimal), Bühne/Papier-Flächensystem (auch Root, Karten, Popover), Header/Nav/Footer, Buttons, Karten, Konditionen-Tabelle → Karten auf Mobil, Beleg-Zeichen, Siegel, Kette, Countdown, Formulare, Fokus, Print. `motion.css` als media-gegatete Hülle.
- JS-Grundgerüst: `boot.js`, `config.js` (Enums/Fehlercodes wörtlich aus dem Vertrag, `office@louwietec.com`), `main.js` (Modul-Registry nach DOM-Vertrag), `nav.js`.
- Partials (`docs/partials/`) mit Prüfer `check-partials.mjs`; Hausgesetz-Prüfer `check-verify-green.mjs`; `font-metrics.mjs`.
- `404.html` und `/styleguide/` (lebende Design-Abnahme, noindex) mit Screenshots Desktop/Mobil/Reduced-Motion.
- Kontrast-Review (Workflow, 12 Befunde) vollständig eingearbeitet: Bühnen-Token-Liste um `html[data-theme=stage]`, `.card--stage`, `.beleg-pop` erweitert; UI-Konturen `--line-strong` α .48 (≥ 3:1); Skip-Link-Ring innen; Kette mit Tinte-Halo und flächenunabhängigem Fokus; Beleg-ok nur auf Tinte grün; Siegel/Stempel mit eigener Tinte-Fläche; Print-Tokens; `::placeholder`; Feld-Fehlerrahmen über `--field-border`.

## Beleg
- `node docs/qa/tools/check-partials.mjs` → 0 Probleme · `check-verify-green.mjs` → „Alle Hausgesetze eingehalten“ (`var(--verify)` 3×, `#2FD37A` 1×).
- Chromium: `site.css` liefert 206 Top-Level-Regeln = 206 im Quelltext (keine verworfene Regel); `document.fonts` enthält Geist und Geist Mono; Root-Fokus auf Bühnen-Seiten `#4F8DFF`, `color-scheme: dark`; Fehlerrahmen `rgb(179,38,30)`; kein horizontales Scrollen bei 1440 und 390.
- `docs/qa/screens/2026-09-05/styleguide-{desktop,mobile,desktop-reduced}.png`.
- Kontraste (WCAG): Papier/Tinte 17,55 · Signal auf Tinte 6,01 · Tinte auf Signal 6,01 · Navy auf Papier 14,64 · Verify auf Tinte 9,78 · Alarm Bühne 4,89 · Alarm Papier 5,99 · muted 5,60/7,95 · UI-Konturen 3,31.

## Abweichungen
1. Bibliotheken werden vendored statt per cdnjs geladen (Phase 3): cdnjs ist Cloudflare/US, Lenis fehlt dort ohnehin.
2. Review-Workflow 1: 33 von 36 Agenten scheiterten am Sitzungslimit (Reset 22:20 UTC). Die fünf offenen Prüfperspektiven (JS, Partials/A11y, Hausgesetze/Assets/Lizenzen, CSS still/robust, Styleguide im Browser) laufen als Workflow 2; Befunde werden als Nachtrag committet.
3. Umgebung hat 4 CPUs → höchstens 2 parallele Agenten; Workflows sind darauf zugeschnitten.

## Offen für Louis
1. **Freigabe von UI-Texten außerhalb des Texte-Dokuments:** Nav-Labels (LEDGER, LENS, FORGE, Kostenlos, Investoren & Partner, Karriere, Über uns, Kontakt, FAQ), Footer („Produkte“, „Unternehmen“, „Rechtliches“, „by LOUWIETEC“, „office@louwietec.com · Wien, Österreich“, „© 2026 LOUWIETEC“), „Zum Inhalt springen“, „Menü“, „Startseite“, 404 („404 · Nicht gefunden“, „Diese Seite gibt es nicht.“, „Die Adresse ist ungültig oder die Seite wurde verschoben.“, „Zur Startseite“, „Kontakt“), „Beleg anzeigen“, „Beleg folgt“, „in Arbeit“, „Vorschau · Beispieldaten“.
2. Beleg-Zeichen als SVG statt Schriftzeichen (Geist hat kein ⌖); im Fließtext bleibt das Zeichen als Text mit Symbol-Fallbackschrift.

## Nächster Schritt
Nachtrag aus Workflow 2 (Fixes committen), dann Phase 2 (bereits gebaut, siehe `PHASE-2.md`) und Phase 3 (Bewegung).
