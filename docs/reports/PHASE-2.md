# PHASE 2 — STATUS 🟢

**Datum:** 2026-09-05 · **Branch:** `feature/website-v2` · **Commits:** `ddb8aaa` … `e5c114f`

## Erledigt
- Zehn Inhaltsseiten wortgleich: `/`, `/ledger/`, `/lens/`, `/forge/`, `/kostenlos/`, `/investoren/`, `/karriere/`, `/ueber-uns/`, `/kontakt/`, `/faq/` — inkl. Meta-Titles/-Descriptions, soweit im Texte-Dokument vorhanden; Konditionen-Tabellen mit Kartenmodus; FAQ.
- Drei Rechtliches-Seiten als Platzhalter („in Gründung“), Datenschutz mit den nötigen Abschnitten als Überschriften.
- `rooms.css` (Raum-Motive, statische Endzustände aller Demonstrationen), `jobs.json` (Rollen wortgleich), `docs/PAGES.md` (DOM-Vertrag je Seite).
- Formulare statisch nach Vertrag (Feldnamen, Enums, Honeypot `website`, `ts`, `consent`), Verdrahtung folgt in Phase 5.
- Gates: `diff-copy.mjs` (Wortgleichheit), `check-links.mjs`, `check-partials.mjs`, `check-verify-green.mjs`.

## Beleg
- `docs/qa/copy-diff/2026-09-05/summary.md`: 10/10 Seiten wortgleich, 0 fehlend, 0 geändert, 2 freigegebene Extra-Zeilen (Allowlist).
- `docs/qa/links/2026-09-05/report.md`: 15 HTML-Dateien, 726 interne Verweise, 42 Anker, 0 kaputt.
- `check-partials`: 15 Seiten, 0 Probleme · Hausgesetze: eingehalten (20 Dateien).
- Chromium (1440 und 390): 0 Konsolenfehler, kein horizontales Scrollen (FORGE-Automaten-Raster auf Mobil zweispaltig gemacht), genau ein `h1` je Seite.

## Abweichungen
1. **Allowlist (2 Zeilen):** `office@louwietec.com · Wien, Österreich` (erfüllt „E-Mail-Adresse direkt · Wien, Österreich“) und `FAQ / Einwände` (H1-Vorschlag; das Dokument hat für die FAQ keine H1).
2. Überschriften mit Doppelpunkt wortgleich übernommen: „Woran wir uns halten:“, „Offene Rollen:“, „Partner:“, „Wo wir stehen (ehrlich):“.
3. Investoren-These bleibt ein Absatz (wortgleich), visuell in drei Sätze gegliedert.
4. Pfeile `→` vor CTAs entfallen (Strukturzeichen, nicht in Geist).
5. CTA-Ziele ohne Endpunkt: „Automatisierungs-Potenzial-Check starten“ → `/kontakt/?anliegen=forge`; „Design-Partner werden“ → `/kontakt/?anliegen=lens`; „Demo mit Beispieldaten ansehen“ → Anker zur Raster-Demo; Partner-CTAs → Investoren-Formular mit `?rolle=`; „Download & Spezifikation“ (Verifier) → Hinweis „in Arbeit“, da noch kein Verifier existiert.
6. Beleg-Zeichen an Zahlen, die Behauptungen sind (24 Stunden, 14 Tage, zehn Fragen, drei Minuten, 2027, 453); Preise tragen kein Beleg-Zeichen.
7. `[Formular]` und `[dynamische Liste aus Repo-Datei]` sind durch das Formular bzw. die Rollenliste aus `jobs.json` ersetzt.

## Offen für Louis
1. **Freigabe UI-Texte (Phase 2):** Formular-Labels, Consent-Texte, Buttons („Anfrage senden“, „Nachricht senden“, „Bewerbung senden“, „Ergebnis anzeigen“, „Eintragen“, „Per E-Mail senden“), Erfolgs-/Fehlertexte, Selbstcheck-Antwortstufen („Nein“, „Teilweise“, „Ja“), „Datenraum anfragen“, Demo-Beschriftungen („Vorschau · Beispieldaten“, „Manipulation erkannt · Kette ab Eintrag 03 ungültig“, „Eintrag 03 manipulieren“, „Zurücksetzen“, „Trend kippt · Frühwarnung“), „Beweiskette startet mit dem ersten Kunden.“, Verifier-Hinweis, Rechtliches-Platzhalter, Seitentitel Karriere/Über uns/Kontakt/FAQ.
2. **Zehn Selbstcheck-Fragen** fehlen im Texte-Dokument → derzeit „Frage n (Text folgt)“.
3. Meta-Descriptions für Kostenlos, Investoren, Karriere, Über uns, Kontakt, FAQ → Phase 6b (SEO), Vorschläge folgen dort.
4. Firmendaten für Impressum/AGB/Datenschutz (in Gründung).

## Nächster Schritt
Phase 3 (Bewegung): GSAP/ScrollTrigger/Lenis vendored, Beweiskette mit Lücke und Siegel, Raum-Motive, Countdown, Beleg-Popover, Hash-Ticker, Reduced-Motion-Belege. Parallel: Seiten-Review-Workflow (A11y/Browser je Seite).
