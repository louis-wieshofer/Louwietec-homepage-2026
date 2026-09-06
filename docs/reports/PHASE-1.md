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

## Nachtrag 2026-09-06 — Befunde der fünf nachgeholten Reviews (Workflow 2)
27 Befunde (1 Blocker, 9 Major, 17 Minor), Majors einzeln von Skeptikern geprüft: 3 widerlegt (Reveal-Blocker bereits in Phase 5 behoben; Canonical-Links sind keine Fremd-Requests; angekündigte JS-Host-Prüfung war kein Versprechen), der Rest eingebaut:
- **Navigation/Bewegung (`nav.js`, `motion.js`):** `--header-h` mit echter Root-Schriftgröße statt fest 16 px; `matchMedia`-Guard; `init` entkoppelt (ein scheiternder Schritt reißt die anderen nicht mit); der Anker-Interceptor lässt den Skip-Link nativ durch (WCAG 2.4.1) und setzt nach sanftem Scrollen den Fokus auf das Ziel; `href="#"` und ungültige Selektoren bleiben dem Browser überlassen. `<main id="main" tabindex="-1">` auf allen Seiten, `main:focus` ohne Rahmen.
- **CSS (`site.css`, `motion.css`):** mobiles Menü scrollt selbst (`max-height`, `overflow-y`), Header exakt 64 px, Tabellenköpfe in der Kartenansicht umbrechen, Kette rendert in `site.css` nur den geschlossenen Endzustand (offenes Glied ist Vorher-Zustand in `motion.css`), Siegel-Vorher-Zustand nur für `[data-seal]`, Tap-Ziele der mobilen Kette 24 px, `html:not(.js)`-Header statisch, Druck: Primärbutton/Siegel/Stempel schwarz auf weiß, Popover aus, Print-Guard in `motion.css`; Fallback-Metriken der Schrift neu berechnet (`size-adjust` 104 %, `font-metrics.mjs` layoutet jetzt ein Textmuster).
- **Partials:** mobiles Menü ist eine `<nav aria-label="Menü">`-Landmarke, Footer-Produktlinks mit Leerzeichen vor „by LOUWIETEC“, `favicon.ico` deklariert 16/32/48; Styleguide: Siegel gestempelt, Demo-Kette mit echtem Anker.
- **Vertrag/Werkzeuge:** Enums in `config.js` je Liste eingefroren (`check-contract.mjs` liest beide Schreibweisen); `check-verify-green.mjs` prüft jetzt auch `--radius`-Wert, Longhand-Radien, `<style>`-Blöcke, `srcset`/`poster`/`<source>`/`<iframe>`, Einzel-Anführungszeichen und ignoriert CSS-Kommentare; `package-lock.json` für reproduzierbare Gates.
- **Belege:** Gates grün (Partials 22 Seiten, Hausgesetze, Wortgleichheit 10/10, Links, Vertrag 8 Formulare, Integration 12/12); `a11y.mjs` auf `/` und `/kontakt/` ohne Befund (Tastatur-Walk, Skip-Link mit und ohne Bewegung, Popover, Menü); Druckansicht ohne verborgene Zustände; Menü bei 390×480 scrollbar, letzter Punkt erreichbar; Kette 5/5 geschlossen, Siegel gestempelt, CLS 0.

## Nächster Schritt
Seiten-Reviews (Workflow 3), dann Phase 6 (QA).
