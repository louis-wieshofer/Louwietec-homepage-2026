# QA-Werkzeuge

Alle Skripte unter `docs/qa/tools/` sind **dev-only**: Sie prüfen die Website oder erzeugen
Assets, aber sie bauen keine Seiten. Die Site ist reines HTML/CSS/JS ohne Build-Schritt;
GitHub Pages liefert den Root von `main` unverändert aus.

## Einrichtung

```bash
cd docs/qa/tools && npm install
```

Playwright + Chromium werden aus der Umgebung verwendet (kein Download nötig).

## Skripte

| Skript | Zweck | Gate |
|---|---|---|
| `check-partials.mjs` (`--fix`) | Gemeinsame Blöcke (head-common, header, footer, scripts) byteidentisch mit `docs/partials/` | Phase 1 ff. |
| `check-verify-green.mjs` | Hausgesetze: Verifiziert-Grün genau 3× im CSS, kein Gold, kein „Trusted by“, Bilder nur aus `/assets/brand|frames/`, Radius 0, keine Fremd-Skripte | Phase 1 ff. |
| `diff-copy.mjs` (`--page /ledger/`, `--expected`) | Wortgleichheit: Texte-Dokument gegen die zehn Inhaltsseiten; Extra-Zeilen nur per `docs/qa/extra-text-allowlist.txt`; Report `docs/qa/copy-diff/<datum>/` | Phase 2 ff. |
| `check-links.mjs` | Interne Verweise, Anker, Manifest-Icons, CSS-`url()` gegen das Dateisystem; Report `docs/qa/links/<datum>/` | Phase 2 ff. |
| `make-brand.mjs` | Marken-Assets aus den Root-Logos (transparente Varianten, Weiß, Tinte, Favicons, Manifest) | Phase 1 |
| `font-metrics.mjs` | Fallback-Metriken der Schriften und Glyph-Abdeckung | Phase 1 |

Reports landen unter `docs/qa/<bereich>/<datum>/` und werden im jeweiligen Phasenbericht
(`docs/reports/PHASE-n.md`) referenziert.
