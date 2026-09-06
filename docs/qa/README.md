# QA-Werkzeuge

Alle Skripte unter `docs/qa/tools/` sind **dev-only**: Sie prüfen die Website oder erzeugen
Assets, aber sie bauen keine Seiten. Die Site ist reines HTML/CSS/JS ohne Build-Schritt;
GitHub Pages liefert den Root von `main` unverändert aus.

## Einrichtung

```bash
cd docs/qa/tools && npm ci
```

`docs/qa/tools/package-lock.json` ist committet und legt die Auflösung aller Abhängigkeiten fest, damit die
Gates reproduzierbar laufen; `npm ci` installiert genau diesen Stand. `npm install` nur, um Abhängigkeiten
bewusst zu ändern — dann das aktualisierte Lockfile mit committen.

Playwright + Chromium werden aus der Umgebung verwendet (kein Download nötig).

## Skripte

| Skript | Zweck | Gate |
|---|---|---|
| `check-partials.mjs` (`--fix`) | Gemeinsame Blöcke (head-common, header, footer, scripts) byteidentisch mit `docs/partials/` | Phase 1 ff. |
| `check-verify-green.mjs` | Hausgesetze: Verifiziert-Grün genau 3× im CSS, kein Gold, kein „Trusted by“, Bilder nur aus `/assets/brand|frames/`, Radius 0, keine Fremd-Skripte | Phase 1 ff. |
| `diff-copy.mjs` (`--page /ledger/`, `--expected`) | Wortgleichheit: Texte-Dokument gegen die zehn Inhaltsseiten; Extra-Zeilen nur per `docs/qa/extra-text-allowlist.txt`; Report `docs/qa/copy-diff/<datum>/` | Phase 2 ff. |
| `check-links.mjs` | Interne Verweise, Anker, Manifest-Icons, CSS-`url()` gegen das Dateisystem; Report `docs/qa/links/<datum>/` | Phase 2 ff. |
| `check-contract.mjs` | Formulare und `config.js` gegen `docs/CONTRACT.md` (Enums, Endpunkte, Pflichtfelder, Honeypot, `ts`, `consent`); der Vertrag wird geparst, keine zweite Wahrheit | Phase 5 ff. |
| `integration.spec.mjs` (`[Nr …]`, `LW_LIVE=1`) | Die zwölf Integrationstests aus Vertrag §4.3 in Chromium: Healthz, `/config`-Buttons, alle Formulare mit exakten Feldnamen, Honeypot, Zeit-Test, Kontingent → Warteliste, mailto-Fallback, CORS-Ablehnung, Ereignisse, Fehlerhülle, Enterprise-Anliegen, Rate-Limit; Report `docs/qa/integration/<datum>/`; startet bei Bedarf den Server auf 8080 | Phase 5 ff.; Phase 7 mit `LW_LIVE=1` |
| `mock-fixture.mjs` | Testdouble des Backends per Playwright-Route (kein Server, kein Port, kein Backend-Code): antwortet auf `web.service.louwietec.com` vertragsgemäß inkl. Spam-Schutz, Kontingent, Rate-Limit, Fehlerhülle; `installUmamiStub()` zeichnet Ereignisse auf | Hilfsmodul |
| `lighthouse.mjs` (`[/seite …]`, `--mobile|--desktop`, `--seo`) | Lighthouse für alle Seiten, mobil und Desktop; Gate ≥ 90 für Performance, Accessibility, Best Practices (SEO mitgemessen, Gate erst ab Phase 6b mit `--seo`); Reports `docs/qa/lighthouse/<datum>/` (HTML + JSON + `summary.md`) | Phase 6 ff. |
| `a11y.mjs` (`[/seite …]`) | axe-core (WCAG 2.1 AA + Best Practice) in 1440 und 390, Tastatur-Walk (alle Interaktiven erreichbar, Fokus sichtbar, Honeypot unerreichbar), Skip-Link mit und ohne Bewegung, Beleg-Popover per Tastatur, mobiles Menü; Report `docs/qa/a11y/<datum>/` | Phase 6 ff. |
| `perf-budget.mjs` (`[/seite …]`) | Budget je Seite: Transfer ≤ 600 KB (ohne Frames, Text komprimiert geschätzt), ≤ 2 Schriftdateien, kein Bild > 200 KB, CLS = 0 (still und mit Bewegung), keine Fremd-Anfragen; Report `docs/qa/perf/<datum>/` | Phase 6 ff. |
| `screens.mjs` (`--shots`, `--video`) | Screenshots aller Seiten (Desktop/Mobil, Bewegung/Reduced-Motion) und Scroll-Video der Startseite; Report `docs/qa/screens/<datum>/report.md`; Server auf Port 8080 nötig | Phase 3 ff. |
| `make-dummy-frames.mjs [version]` | Test-Bildsequenz (30 Frames 16:9 + 9:16, WebP) und `manifest.json` für die Frame-Scrub-Schnittstelle des Heros | Phase 4 |
| `make-brand.mjs` | Marken-Assets aus den Root-Logos (transparente Varianten, Weiß, Tinte, Favicons, Manifest) | Phase 1 |
| `font-metrics.mjs` | Fallback-Metriken der Schriften und Glyph-Abdeckung | Phase 1 |

Reports landen unter `docs/qa/<bereich>/<datum>/` und werden im jeweiligen Phasenbericht
(`docs/reports/PHASE-n.md`) referenziert.

## Gates vor jedem Push

```bash
node docs/qa/tools/check-partials.mjs && node docs/qa/tools/check-verify-green.mjs \
  && node docs/qa/tools/diff-copy.mjs && node docs/qa/tools/check-links.mjs \
  && node docs/qa/tools/check-contract.mjs && node docs/qa/tools/integration.spec.mjs
```

Der Integrationslauf gegen das Testdouble ersetzt nicht den Integrationstag: Erst `LW_LIVE=1`
gegen das echte Backend (von einer erlaubten Origin, CORS) belegt Vertrag §4.3.
