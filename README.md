# LOUWIETEC — Website

Quellcode der Website von LOUWIETEC (Wien) unter `https://louwietec.com`.
Reines HTML, CSS und JavaScript **ohne Build-Schritt**: GitHub Pages liefert den Root des
Branches `main` unverändert aus. Was im Repo liegt, ist das, was ausgeliefert wird.

Stand: Website v2 live auf `main` seit 2026-09-06 (Phasen 0 bis 6; SEO/GEO zurückgestellt, Integrationstag mit dem Backend offen), siehe [Phasenstand](#phasenstand).
Backend-Code gehört nicht in dieses Repo; die Website spricht den getrennten Backend-Dienst
ausschließlich über den [Schnittstellen-Vertrag](docs/CONTRACT.md) an.

## Hosting

Kurzfassung, Details und Belege in [docs/HOSTING.md](docs/HOSTING.md):

- **GitHub Pages** liefert den **Root von `main`** aus (Legacy-Modus „Deploy from a branch“).
  `.nojekyll` ist vorhanden (seit Phase 1), es läuft kein Jekyll-Build. Pages-Einstellungen
  werden nicht verändert.
- **Domain:** `CNAME` = `louwietec.com`. `www.louwietec.com` und
  `louis-wieshofer.github.io/Louwietec-homepage-2026/` leiten mit 301 auf den Apex. HTTPS aktiv.
- **Keine eigenen Workflows** (`.github/` existiert nicht).
- **Backend-Hosts:** `web.service.louwietec.com` (API), `analytics.service.louwietec.com`
  (Umami). Stand 2026-09-05 liefern beide ein selbstsigniertes Traefik-Zertifikat; bis Session 2
  gültige Zertifikate einrichtet, läuft die Anbindung nur gegen ein Testdouble (siehe unten).

## Repo-Struktur

### Ist-Stand (nach Phase 5)

```
CNAME  .nojekyll  .gitignore  README.md  favicon.ico  site.webmanifest  jobs.json  404.html
index.html                              Startseite (Beweiskette, Hero, Siegel)
ledger/ lens/ forge/                    Produktseiten mit Reservierungsformular (Buttons aus GET /config)
kostenlos/ investoren/ karriere/        Selbstcheck + Lagereport, Investoren, offene Rollen (jobs.json)
ueber-uns/ kontakt/ faq/                weitere Inhaltsseiten (je index.html)
rechtliches/{impressum,datenschutz,agb}/  Platzhalter „in Gründung“, Inhalt folgt
styleguide/                             lebende Design-Abnahme (noindex)
about.html approach.html principles.html contact.html impressum.html privacy.html en/index.html
                                        Redirect-Stubs der alten Adressen (Karte in docs/HOSTING.md)
IMG_0707.png  IMG_0710.png              Quell-Logos (Volllogo, Icon), bleiben im Root
assets/
  brand/          icon, icon-white, icon-ink, logo-full, logo-full-white (.png + .webp),
                  favicon-16/32, apple-touch-icon, icon-192/512/512-maskable, hero-poster.svg
  css/            site.css (Tokens, Fonts, Base, Flächen, Komponenten, Endzustände)
                  rooms.css (Raum-Motive, Hero-Layout, Demos)  motion.css (nur Vorher-Zustände, Übergänge)
  fonts/geist/    Geist / Geist Mono, latin + latin-ext (.woff2), OFL.txt
  frames/v0-dummy/  Test-Bildsequenz + manifest.json für den Frame-Hero (echte Sequenz folgt)
  js/             boot, config, main, nav, api, forms, products, analytics, jobs,
                  motion, chain, hero, countdown, beleg, belege, ticker, demos
  vendor/         gsap 3.15.0 + ScrollTrigger, lenis 1.3.26 (mit Lizenzen, kein CDN)
  louwietec-brain.png, og-image.png   Alt-Pfade aus v1, bleiben bis alle Verweise umgestellt sind
docs/
  CONTRACT.md     Schnittstellen-Vertrag v1, byteweise unverändert (identisch im Backend-Repo)
  HOSTING.md      Hosting-, Pages- und Domain-Fakten, Redirect-Karte
  PAGES.md        Seitenkarte, belege.md Beleg-Register
  copy/Website_Texte_Final_v2.md   Texte der zehn Inhaltsseiten, wortgleich übernommen
  partials/       head-common.html, header.html, footer.html, scripts.html (Quelle der gemeinsamen Blöcke)
  qa/README.md, qa/tools/          Prüf- und Erzeugungsskripte, dev-only; Reports unter qa/<bereich>/<datum>/
  reports/PHASE-n.md               Ampel-Bericht je Phase
```

### Geplant (noch nicht vorhanden)

| Pfad | Phase | Inhalt |
|---|---|---|
| `robots.txt`, `sitemap.xml`, `llms.txt`, OG-Bilder, JSON-LD, `check-seo.mjs` | 6b | SEO/GEO, zurückgestellt (siehe `docs/reports/PHASE-6b.md`) |

## Arbeitsweise

### Kein Build-Schritt

Das HTML im Repo ist das Deliverable. Es gibt keinen Bundler, kein Framework und keine
Vorverarbeitung. Die Skripte unter `docs/qa/tools/` prüfen die Site oder erzeugen Assets, sie
bauen keine Seiten. Lokal ansehen:

```bash
python3 -m http.server 8080 --directory .
```

### Partials ohne Build

Gemeinsame Blöcke stehen in jeder HTML-Seite ausgeschrieben, damit Pages sie ohne Build
ausliefern kann. Quelle der Wahrheit ist [docs/partials/](docs/partials/). In den Seiten
stehen die Blöcke zwischen Markern auf Spalte 0:

```html
<!-- @partial:header -->
…
<!-- /@partial:header -->
```

Namen: `head-common`, `header`, `footer`, `scripts`. Seiten ohne gemeinsame Blöcke
(Redirect-Stubs) tragen `<!-- @partials:none -->`.

Ablauf bei Änderungen: Partial in `docs/partials/` bearbeiten, dann

```bash
node docs/qa/tools/check-partials.mjs --fix
```

ausführen und die geänderten Seiten mitcommitten. Ohne `--fix` ist das Skript das Gate
(Exit 1 bei Abweichung). Seitenspezifisch außerhalb der Marker bleiben `<title>`,
Description, `<html lang="de" data-theme="stage|paper">`, `<body data-page="…">` und
`<main data-copy-root>`.

### Hausgesetze

- **Tokens:** `--ink #0B0F19`, `--paper #F6F5F1`, `--signal #4F8DFF`, `--verify #2FD37A`,
  `--navy #14213D`, `--radius 16px` (`--radius-sm 6px` für schmale Elemente). Schriften Geist und Geist Mono, selbst gehostet
  (Lizenz: `assets/fonts/geist/OFL.txt`).
- **Verifiziert-Grün** `--verify` kommt im CSS **genau dreimal** zur Anwendung (Siegel,
  bestandener Beleg, Verifiziert-Stempel) und nur auf Tinte-Flächen (auf Papier 1,8:1).
  `--signal` nie als Text oder Fokusring auf Papier (2,9:1); dort `--navy`.
- **Eckenradius 16 px** auf allen Flächen (Karten, Knöpfe, Felder, Popover, Siegel, Demos);
  `--radius-sm` 6 px für Elemente unter etwa 40 px Breite (Kettenglieder, Chips, Stempel).
  Feste Pixelwerte sind verboten, gerundet wird ausschließlich über die beiden Tokens.
  Diese Regel ersetzt seit 2026-09-06 das ursprüngliche „Radius 0“ des Design-Plans (Entscheidung Louis; Stärke am 2026-09-07 von 10 auf 16 px angehoben).
- **Keine Fremd-Requests:** keine CDNs, keine Google Fonts zur Laufzeit, nichts
  Cookie-Setzendes, nichts aus US-Clouds. Bibliotheken werden vendored. Einzige externe Hosts
  sind die beiden Vertragshosts.
- **Kein Backend-Code im Repo.** Testdouble für die Anbindung ist eine
  Playwright-Route-Interception unter `docs/qa/tools/` (kein Server, kein Port).
- **Texte wortgleich** aus [docs/copy/Website_Texte_Final_v2.md](docs/copy/Website_Texte_Final_v2.md);
  nichts umformulieren. Texte, die dort nicht stehen (Nav, Footer, 404, Formular-Microcopy),
  gehen als Freigabeliste in den Phasenbericht.
- **Kein Claim ohne Deckung:** keine erfundenen Logos, Zahlen oder „Trusted by“; keine
  Fotos, kein Stock, kein Gold. Rechtliches nur „unterstützt die Erfüllung“.
- **Reduced Motion** ist eine vollwertige stille Version: `site.css` rendert jeden Endzustand;
  `motion.css` wird nur mit `media="(prefers-reduced-motion: no-preference)"` geladen und
  greift nur unter `html.js-motion` (gesetzt von `boot.js`, nicht bei `saveData`).
- **UI-Sprache** Deutsch, Anrede „Sie“. Produktnamen LEDGER, LENS, FORGE, je „by LOUWIETEC“.
- **Widerspruchsregel:** Texte-Dokument vor Design-Plan bei Inhalten; Design-Plan vor
  Texte-Dokument bei Gestaltung; Vertrag vor beiden beim Backend; Orchestrierung vor allen
  bei Repo, Branching und Hosting. Bleibt ein Widerspruch: melden, nicht raten.

Die Hausgesetze werden maschinell geprüft, siehe [QA-Werkzeuge](#qa-werkzeuge).

## Backend nur über den Vertrag

- [docs/CONTRACT.md](docs/CONTRACT.md) ist der Schnittstellen-Vertrag v1 und liegt identisch im
  Backend-Repo (Session 2). Weicht die Implementierung vom Vertrag ab, ist die Implementierung
  falsch. Änderungswunsch = Vorschlag an Louis, dann Versionssprung, dann PR in beiden Repos am
  selben Tag.
- **Basis-URL** `https://web.service.louwietec.com` (`API_BASE` in
  [assets/js/config.js](assets/js/config.js)), Analytics `https://analytics.service.louwietec.com`.
  Kein anderer Host.
- **Fallback:** Beim Laden `GET /healthz` mit 2 s Timeout. Antwortet der Dienst nicht, zeigen
  alle Formulare den `mailto:`-Fallback an `office@louwietec.com` mit vorausgefülltem Betreff
  (`[LOUWIETEC] Kontakt`, `[LOUWIETEC] Reservierung LEDGER Starter` usw.); Buttons für
  Anzahlung und Kauf werden ausgeblendet.
- **Buttons nur aus `/config`:** Der Button je Produkt wird ausschließlich aus
  `produkt.status` (`reserve` | `deposit` | `live`) abgeleitet. Kontingente, Status und Preise
  kommen nie aus dem Frontend. Enterprise hat nie einen Kaufen-Button, nur „Gespräch anfragen“.
- **Feldnamen, Enums, Fehlercodes, Ereignisnamen** wörtlich aus dem Vertrag (`ENUMS`,
  `ERROR_CODES` in `config.js`). Jedes Formular mit Honeypot `website`, Zeitstempel `ts` und
  `consent`; Fehlerhülle des Vertrags wird am Feld angezeigt.
- **Analytics** cookielos (Umami, eigene Instanz). Die Website sendet `visit`, `magnet_start`,
  `cta_click`. Die Website-ID ist offen (Session 2).

## QA-Werkzeuge

Details in [docs/qa/README.md](docs/qa/README.md). Alle Skripte sind dev-only.

```bash
cd docs/qa/tools && npm install   # devDependencies: sharp, png-to-ico, fontkit; Playwright/Chromium aus der Umgebung
```

```bash
node docs/qa/tools/check-partials.mjs          # Gate: gemeinsame Blöcke byteidentisch mit docs/partials/ (Exit 1 bei Abweichung)
node docs/qa/tools/check-partials.mjs --fix    # Blöcke aus docs/partials/ in die Seiten schreiben
node docs/qa/tools/check-verify-green.mjs      # Hausgesetze: --verify 3x im CSS, kein Gold, kein "Trusted by",
                                               # <img> nur aus /assets/brand|frames/, Radius nur über Tokens, keine Fremd-Skripte
node docs/qa/tools/diff-copy.mjs               # Gate: Wortgleichheit der zehn Seiten mit dem Texte-Dokument
node docs/qa/tools/check-links.mjs             # Gate: interne Verweise, Anker, Manifest, CSS-url()
node docs/qa/tools/check-contract.mjs          # Gate: Formulare und config.js gegen docs/CONTRACT.md
node docs/qa/tools/integration.spec.mjs        # Gate: zwölf Integrationstests gegen das Testdouble (LW_LIVE=1: echtes Backend)
node docs/qa/tools/screens.mjs                 # Screenshots aller Seiten + Scroll-Video (Server auf 8080)
node docs/qa/tools/lighthouse.mjs              # Gate ab Phase 6: Lighthouse ≥ 90 (mobil + Desktop, alle Seiten)
node docs/qa/tools/a11y.mjs                    # Gate ab Phase 6: axe + Tastatur-Walk, Skip-Link, Popover, Menü
node docs/qa/tools/perf-budget.mjs             # Gate ab Phase 6: Transfer, Schriften, Bilder, CLS 0, keine Fremd-Anfragen
node docs/qa/tools/make-brand.mjs              # Marken-Assets aus IMG_0707.png / IMG_0710.png erzeugen
node docs/qa/tools/make-dummy-frames.mjs       # Test-Bildsequenz für den Frame-Hero
node docs/qa/tools/font-metrics.mjs            # Fallback-Metriken und Glyph-Abdeckung der Schriften
```

Für Screenshots und Browser-Tests: lokaler Server (`python3 -m http.server 8080 --directory .`)
und Playwright mit Chromium. Reports landen unter `docs/qa/<bereich>/<datum>/` und werden im
jeweiligen Phasenbericht referenziert. Der SEO-Check folgt in Phase 6b.

## Branching

| Branch | Rolle |
|---|---|
| `main` | Live. Pages liefert den Root aus. Merge erst nach bestandener Phase 6/6b und Integrationstag, per Pull Request mit Merge-Commit. |
| `archive/website-v1-2026-08` | Alte Website (= `main@922ab41`). **Wird nie wieder angefasst.** |
| `feature/website-v2` | Arbeits-Branch der neuen Website. Atomare Commits, ein Push je Phase. |

Kein Force-Push, kein History-Rewrite, kein Squash. Der Tag `website-v1-final` auf `922ab41`
liegt bislang nur lokal, weil der Push aus der Session verweigert wurde (Befehle in
[docs/HOSTING.md](docs/HOSTING.md), Abschnitt „Archiv“). Der Harness-Branch
`claude/louwietec-website-2026-2tzukw` bleibt unberührt.

## Phasenstand

Je Phase entsteht ein Ampel-Bericht unter [docs/reports/](docs/reports/) im Format
Erledigt / Beleg / Abweichungen / Offen für Louis / Nächster Schritt. Ab Phase 1 startet die
nächste Phase, sobald die vorige mit Push und Bericht abgeschlossen ist; der Merge nach `main`
bleibt eine eigene Freigabe.

| Phase | Inhalt | Gate | Stand | Bericht |
|---|---|---|---|---|
| 0 Archiv | Archiv-Branch, Tag, Pages/CNAME dokumentiert, Arbeits-Branch | Branch-Liste; Archiv identisch mit altem `main` | abgeschlossen, Ampel gelb (Tag-Push offen) | [PHASE-0.md](docs/reports/PHASE-0.md) |
| 1 Fundament | Struktur, Tokens, Schriften, Header/Footer, Logo-Regeln, 404, `docs/CONTRACT.md`, `config.js` | `/styleguide/` zeigt Tokens und Komponenten | abgeschlossen inkl. Nachtrag aus fünf Reviews | [PHASE-1.md](docs/reports/PHASE-1.md) |
| 2 Inhalte | Zehn Seiten wortgleich, Tabellen, Meta, FAQ | Diff je Seite gegen Texte-Dokument = 0; Link-Check fehlerfrei | abgeschlossen | [PHASE-2.md](docs/reports/PHASE-2.md) |
| 3 Bewegung | Beweiskette, Lücke, Siegel, Raum-Motive, Countdown, Beleg-Zeichen | Scroll-Video Desktop und Mobil; Reduced-Motion-Screenshots | abgeschlossen | [PHASE-3.md](docs/reports/PHASE-3.md) |
| 4 Hero | Canvas-Platzhalter, Frame-Scrub-Schnittstelle | Test mit 30 Dummy-Frames | abgeschlossen | [PHASE-4.md](docs/reports/PHASE-4.md) |
| 5 Anbindung | Formulare gegen Testdouble, `/config`-Buttons, Fallback, Analytics-Ereignisse, `jobs.json`, Rechtliches, Redirect-Stubs | Jedes Formular sendet; Fallback-Test; Ereignisse sichtbar | abgeschlossen (zwölf Tests grün gegen Testdouble) | [PHASE-5.md](docs/reports/PHASE-5.md) |
| 6 QA | Lighthouse ≥ 90 (mobil und Desktop), Gerätetest, Reduced-Motion, Tastatur, Baff-Test | Reports unter `docs/qa/` | abgeschlossen (Baff-Test simuliert; Seiten-Reviews laufen nach) | [PHASE-6.md](docs/reports/PHASE-6.md) |
| 6b SEO/GEO | JSON-LD, OG-Bilder, `sitemap.xml`, `robots.txt`, `llms.txt`, hreflang-Vorbereitung | SEO-Check grün, Lighthouse SEO ≥ 90 | zurückgestellt (Entscheidung Louis, 2026-09-06); Arbeitsliste im Bericht | [PHASE-6b.md](docs/reports/PHASE-6b.md) |
| 7 Integration und Go-Live | PR nach `main` und Merge (Freigabe Louis 2026-09-06); Integrationstag mit Session 2 (zwölf Tests gegen das echte Backend) folgt, wenn das Backend fertig ist | Website live auf `louwietec.com`; bis zum Integrationstag läuft die Anbindung im mailto-Fallback | Merge 2026-09-06, Integrationstag offen | [PHASE-7.md](docs/reports/PHASE-7.md) |

Phase 6b ist gegenüber dem Phasenplan der Orchestrierung ergänzt (SEO/GEO erst nach
bestandener QA, vor dem Pull Request).

## Kontakt

`office@louwietec.com`
