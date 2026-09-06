# PHASE 6 — STATUS 🟢 (mit Nachlauf)

**Datum:** 2026-09-06 · **Branch:** `feature/website-v2` · Werkzeuge: `docs/qa/tools/{lighthouse,a11y,perf-budget,screens}.mjs`, Berichte unter `docs/qa/<bereich>/2026-09-06/`

## Erledigt
- **Lighthouse ≥ 90** auf allen 13 Seiten, mobil und Desktop, für Performance, Accessibility und Best Practices (SEO mitgemessen, nicht gewertet — Phase 6b zurückgestellt). Tabelle unten.
- **Barrierefreiheit** (`a11y.mjs`): axe-core WCAG 2.1 AA + Best Practice auf 14 Seiten × 2 Viewports ohne serious/critical; Tastatur-Walk erreicht alle Interaktiven mit sichtbarem Fokus, Honeypot unerreichbar; Skip-Link setzt den Fokus auf `main` (still und mit Bewegung); Beleg-Popover per Fokus/Enter, Esc, Fokus zurück; mobiles Menü per Tastatur, alle Punkte im Viewport. Einziger Befund (dekorative Hash-Textur auf LEDGER als Text mit zu wenig Kontrast) behoben: Textur als CSS-generierter Inhalt.
- **Performance-Budget** (`perf-budget.mjs`): alle 13 Seiten still und mit Bewegung im Budget — Transfer 130–246 KB (komprimiert geschätzt, ohne Frames), 2 Schriftdateien, kein Bild > 200 KB, **CLS 0 überall**, keine Fremd-Anfragen, LCP lokal 60–160 ms.
- **Gerätetest/Reduced Motion** (`screens.mjs`): 15 Seiten × Desktop 1440/Mobil 390 × Bewegung/still: kein horizontaler Überlauf, keine Seitenfehler; Kette 5/5 geschlossen, Siegel gestempelt; Scroll-Videos Desktop und Mobil unter `docs/qa/video/2026-09-06/`.
- **Fixes aus Phase 6:** Sticky-Hero statt Pin-Spacer (CLS 0,096 → 0); erster Viewport ohne Reveal-Verzögerung (`boot.js`, LCP mit Bewegung 712 → ~100 ms); Countdown klemmt `t` auf 0 (Zahl sprang für einen Frame über 999 und verschob die Einheit); FORGE-Automat umbricht statt zu überlaufen; Beleg-Zeichen mit Trefffläche ≥ 24 px; Lighthouse-Skript misst Desktop mit Desktop-Drosselung.
- **Baff-Test** als **Simulation** (drei Leseperspektiven ohne Projektkontext auf Basis der Screenshots): `docs/qa/baff/2026-09-06/simulation.md` mit Antworten und Einordnung. Echte Fremde kann nur Louis befragen (`docs/qa/baff-test.md`).

## Lighthouse (lokaler Server, simulierte Drosselung: mobil Slow 4G + CPU ×4, Desktop 40 ms / 10 Mbit/s / CPU ×1)
| Seite | Form | Perf | A11y | Best Practices | SEO | LCP | CLS | Anmerkung |
|---|---|---|---|---|---|---|---|---|


Best Practices 96 auf LENS Desktop: Konsolenfehler „ERR_CONNECTION_RESET“ für `/healthz` und `/config`, weil das Backend aus dieser Umgebung nicht erreichbar ist — verschwindet, sobald Session 2 den Dienst bereitstellt.

## Beleg
`docs/qa/lighthouse/2026-09-06/summary.md` (+ HTML/JSON je Messung) · `docs/qa/a11y/2026-09-06/report.md` + `axe.json` · `docs/qa/perf/2026-09-06/report.md` · `docs/qa/screens/2026-09-06/report.md` (zehn repräsentative Screenshots im Repo, Vollsatz per Skript) · `docs/qa/video/2026-09-06/` · `docs/qa/baff/2026-09-06/simulation.md`.

## Abweichungen
1. **Seiten-Reviews (Workflow 3, neun Perspektiven: Anbindung, Testdouble/Spec, alle Seiten im Browser, Design-Plan-Abgleich, Sicherheit/Datenschutz, Wortgleichheits-Zweitprüfung)** sind zweimal abgebrochen (Sitzungslimit 23:37 UTC; Unterbrechung 08:14 UTC) und liegen **ohne Ergebnis** vor. Louis hat entschieden, vor Abschluss dieser Reviews zu mergen; sie laufen nach dem Merge erneut, Befunde kommen als Folge-Commits.
2. Baff-Test nur simuliert; drei Befunde davon sind Screenshot-Artefakte oder Inhaltsentscheidungen (siehe Einordnung), zwei waren echte Fehler und sind behoben.
3. Lighthouse-Performance schwankt auf der geteilten 4-CPU-Umgebung um mehrere Punkte; Werte unter Last (Startseite mobil 86 im Sammellauf) wurden bei ruhiger CPU nachgemessen (98). Lokaler Server ohne Kompression/HTTP/2 — GitHub Pages liefert beides, die Live-Werte liegen eher höher.
4. Der Ganzseiten-Screenshot zeigt mit Bewegung eine leere Fläche unter dem Hero (Sticky-Strecke 150 vh); beim Scrollen ist dort der gepinnte Hero mit Animation zu sehen. Für Tests mit echten Personen die Live-Seite nutzen, nicht Screenshots.

## Offen für Louis
1. **Siegel „VERIFIZIERT“**: alle drei simulierten Leser empfinden es neben „Beweiskette startet mit den ersten Kunden“ als selbst vergeben. Vorschlag: Aussteller/Bezug ergänzen oder erst mit erstem Beleg zeigen.
2. Inhalte aus der Simulation: „We make companies unstoppable“ (Ton), Konditionen Group/Enterprise (72.000 vs. „ab 60.000“), Quelle zum 02.12.2027 (Beleg-Artefakt), Erklärung des ⌖ auf Unterseiten, LEDGER-Hero ohne Button, Karriere-Konditionen.
3. Zehn Selbstcheck-Fragen; Fallback-Text der Formulare ggf. neutraler („Senden derzeit per E-Mail“).
4. Echter Baff-Test mit drei Fremden nach dem Live-Gang (`docs/qa/baff-test.md`).

## Nächster Schritt
Phase 7: PR `feature/website-v2 → main`, Merge, Live-Prüfung (`PHASE-7.md`); danach Workflow 3 erneut und Folge-Commits.
