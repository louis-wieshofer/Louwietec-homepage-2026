# PHASE 7 — STATUS 🟢 Go-Live erfolgt · 🟡 Integrationstag offen

**Datum:** 2026-09-06 · **Freigabe:** Louis („Passt, mergen!“, nach Rückfrage zu Archiv und Pages-Ablauf)

## Entscheidung
Louis hat am 2026-09-06 entschieden, die Website **vor** dem Integrationstag live zu nehmen: Das Backend (Session 2) ist noch nicht fertig, der Live-Lauf der zwölf Tests (`LW_LIVE=1`) findet statt, sobald `web.service.louwietec.com` mit gültigem Zertifikat und CORS für `https://louwietec.com` antwortet. Bis dahin läuft die Anbindung im Fallback: `GET /healthz` scheitert → `body[data-backend="down"]` → Formulare zeigen „Per E-Mail senden“ (`mailto:office@louwietec.com` mit Vertragsbetreff und Feldern), Produktseiten zeigen nur „Erstanwender-Platz reservieren — kostenlos“ im mailto-Modus, Anzahlung/Kauf bleiben verborgen. Sobald der Dienst antwortet, schaltet die Seite ohne Deployment um (Buttons aus `GET /config`).

## Vor dem Merge geprüft (Stand `feature/website-v2`)
- Gates: `check-partials` 22 Seiten · `check-verify-green` · `diff-copy` 10/10 wortgleich · `check-links` · `check-contract` 8 Formulare · `integration.spec` 12/12 gegen das Testdouble · `node --check` alle Module.
- Phase 6: Lighthouse mobil und Desktop (siehe `PHASE-6.md`), `a11y.mjs` ohne Befund, `perf-budget.mjs` alle 13 Seiten im Budget (CLS 0), Screenshots/Video ohne Überlauf und Fehler.
- Archiv: `archive/website-v1-2026-08` = `main@922ab41` auf origin, Diff leer. Rücknahme jederzeit per `git revert -m 1 <merge-commit>` auf `main`.
- Pages-Ablauf: Root von `main`, `CNAME` = `louwietec.com` unverändert im Branch, `.nojekyll` vorhanden, `404.html` im Root, Redirect-Stubs für die alten Adressen.

## Ablauf
1. PR `feature/website-v2 → main`, Merge-Commit (kein Squash, kein Rebase, keine Historienänderung).
2. Pages-Build (`pages-build-deployment`) läuft automatisch; erwartete Dauer 1–2 Minuten, Cache 10 Minuten.
3. Live-Prüfung per Abruf: `/` (Inhalt = `index.html` des Merges), `/about` (Stub mit Meta-Refresh → `/ueber-uns/`), `/rechtliches/impressum/`, `/assets/css/site.css`, `/en/about` → 404-Seite mit Weiterleitungskarte, `/styleguide/` (noindex).
4. Ergebnis unten nachtragen.

## Live-Prüfung nach dem Merge (2026-09-06, ~09:35 UTC)
PR #2 gemergt als Merge-Commit `b92c503` (Head `6d3e026`). Pages-Build nach 10 s live. Abrufe gegen `https://louwietec.com`:

| Adresse | Ergebnis |
|---|---|
| `/` | 200, 17 491 B, SHA-256 identisch mit `index.html` des Merges |
| `/about`, `/contact` | 200, Stub mit `<meta http-equiv="refresh" content="0; url=/ueber-uns/">` bzw. `/kontakt/` und Canonical |
| `/rechtliches/impressum/` | 200, Betreiberzeile „Louis Wieshofer“ vorhanden |
| `/ledger/`, `/assets/css/site.css`, `/assets/js/main.js`, `/jobs.json` | 200, korrekte Content-Types |
| `/en/about` | 404 mit der neuen `404.html` (Weiterleitungskarte im Skript) |
| `/styleguide/` | 200, `<meta name="robots" content="noindex">` |
| `https://www.louwietec.com/`, `http://louwietec.com/` | 301 → `https://louwietec.com/` |

Backend-Verhalten live: `GET /healthz` auf `web.service.louwietec.com` scheitert (Zertifikat) → Formulare im mailto-Fallback, Produkt-Buttons nur „Reservieren“; Konsole meldet die zwei fehlgeschlagenen Anfragen (Best Practices in Lighthouse 96 statt 100, bis der Dienst steht).

## Nachlauf
- Workflow 3 (neun Seiten-Reviews) läuft nach dem Merge erneut; Befunde kommen als Folge-PR auf `main`.
- Echter Baff-Test mit drei Fremden auf der Live-Seite (`docs/qa/baff-test.md`).

## Offen für Louis / Session 2
1. **Integrationstag:** zwölf Tests gegen das echte Backend (`LW_LIVE=1 node docs/qa/tools/integration.spec.mjs` von einer erlaubten Origin), gültige TLS-Zertifikate auf `web.service` und `analytics.service`, CORS für `https://louwietec.com`, Umami-Website-ID in `config.js`.
2. **Tag `website-v1-final`** liegt nur lokal in der Session (Push vom Proxy verweigert): `git tag -a website-v1-final 922ab41 -m "Website v1 archiviert" && git push origin website-v1-final`.
3. **Rechtstexte:** Impressum und Datenschutz nennen bis zur Eintragung die Betreiberangaben aus Website v1 (Louis Wieshofer, Lange Gasse 65, 1080 Wien) — bitte bestätigen; vollständige Texte (Datenschutz mit Rechtsgrundlagen, Speicherdauer; AGB) folgen mit der GmbH.
4. **Inhalte:** zehn Selbstcheck-Fragen mit je drei Antworten (Platzhalter live), Rollenbeschreibungen in `jobs.json`, Freigabe der UI-Texte außerhalb des Texte-Dokuments (Listen in `PHASE-1.md`, `PHASE-5.md`), echte Hero-Bildsequenz (Manifest-Schnittstelle steht, `?hero=frames`).
5. **SEO/GEO** (Phase 6b) zurückgestellt, Arbeitsliste in `PHASE-6b.md`; Search Console nach dem Merge: alte Sitemap-Adresse liefert 404 (unkritisch).
