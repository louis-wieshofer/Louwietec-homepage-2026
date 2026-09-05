# PHASE 3 — STATUS 🟢

**Datum:** 2026-09-05 · **Branch:** `feature/website-v2` · **Commits:** `4e5eae0` … `1003f7c` (+ Belege)

## Erledigt
- GSAP 3.15.0, ScrollTrigger und Lenis 1.3.26 vendored (`assets/vendor/`, Lizenzhinweise), keine Laufzeit-Anfragen an CDNs.
- `motion.js`/`motion.css`: Vorher-Zustände nur unter `html.js-motion`; Reveals beim Scrollen, Hero-Headline Wort für Wort, Papier-Sektionen schieben sich über die Bühne (ScrollTrigger-Scrub), sanftes Scrollen (Lenis am GSAP-Ticker), Teardown bei Fehlern oder Wechsel zu `prefers-reduced-motion`.
- `chain.js`: Beweiskette als Fortschrittsanzeige — Glieder rasten mit 120 ms (Mobil 60 ms) und Glühen ein, die Lücke im Vertrauenslücken-Abschnitt bleibt offen und schließt sich bei den drei Fähigkeiten zuerst, am Ende leuchtet die Kette durch und das Siegel VERIFIZIERT fällt mit Stempel-Bewegung; Fortschrittslinie folgt dem Scroll.
- `beleg.js`/`belege.js`/`docs/belege.md`: Beleg-Zeichen mit Kärtchen (Titel, Status, Artefakt); alle Belege ehrlich „Beleg folgt“, nur die Countdown-Rechnung ist „Beleg vorhanden“.
- `countdown.js`: Tage bis 02.12.2027 nachgerechnet, zählt von 999 herunter und rastet ein.
- `ticker.js`: Hash-Ticker mit echten SHA-256-Werten (crypto.subtle), nur im Bild und bei Bewegung.
- `demos.js`: Miniaturen (Start) auf Hover/Fokus/Tap; LEDGER-Kette wächst mit echt verketteten Hashes, Manipulation wird echt gerechnet und rot erkannt, Bericht klappt auf; LENS-Raster/Trend; FORGE-Takt und Automaten; Investoren-Thesen nacheinander.
- `screens.mjs`: Screenshots (Bewegung/Reduced-Motion, Desktop/Mobil) und Scroll-Videos als Belege.

## Beleg
- `docs/qa/video/2026-09-05/start-scroll-desktop.webm` (419 KB) und `start-scroll-mobile.webm` (324 KB): Kette 5/5 geschlossen, Siegel gefallen.
- `docs/qa/screens/2026-09-05/report.md`: 60 Aufnahmen (15 Seiten × Desktop/Mobil × Bewegung/Reduced), kein horizontaler Überlauf, 0 Fehler; kuratierte Auswahl im Repo.
- Chromium-Test: nach Laden 4 Glieder offen + Lücke markiert, Siegel nicht gefallen; nach Scroll 5 geschlossen, 5 durchleuchtet, Siegel gefallen, Fortschritt 100 %, Ticker 6 Einträge; LEDGER: Countdown 453 eingerastet, Manipulation → „Manipulation erkannt · Kette ab Eintrag 03 ungültig“ (2 Einträge rot), Zurücksetzen → intakt; Beleg-Popover öffnet per Hover. Reduced Motion: `js-motion` aus, GSAP nicht geladen, alle Glieder geschlossen, Siegel und Texte sichtbar (Opacity 1).
- Hausgesetze weiterhin eingehalten (Verifiziert-Grün 3×), Links gültig.

## Abweichungen
1. Bibliotheken vendored statt cdnjs (Begründung Phase 1).
2. Das letzte Kettenglied bleibt Signal-Blau; Grün liegt beim Siegel (Verwendung 1), beim bestandenen Beleg (2) und beim Verifiziert-Stempel (3) — exakt wie im Design-Plan.
3. Hero-Bewegung siehe Phase 4 (Platzhalter + Frame-Schnittstelle).

## Offen für Louis
1. Beleg-Artefakte existieren noch nicht (24 h, 14 Tage, zehn Fragen, drei Minuten, AI-Act-Quelle) → bleiben „Beleg folgt“; Quellenangabe zum EU AI Act kann jederzeit in `belege.js` ergänzt werden.
2. Baff-Test „Er sieht das Siegel fallen: Lächelt er?“ braucht drei Fremde (Phase 6).

## Nächster Schritt
Phase 4 (Hero) — siehe `PHASE-4.md`.
