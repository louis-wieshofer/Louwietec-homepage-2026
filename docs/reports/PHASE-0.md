# PHASE 0 — STATUS 🟡

**Datum:** 2026-09-05 · **Branch:** `feature/website-v2` · **Basis:** `main@922ab41`

## Erledigt
- Pages-Konfiguration und CNAME geprüft und dokumentiert (`docs/HOSTING.md`): Pages liefert den Root von `main` (Legacy-Build), `CNAME` = `louwietec.com`, `www.` und `github.io` leiten 301 auf den Apex; kein `.nojekyll`, kein `.github/`, kein `README.md`, keine Tags.
- Archiv-Branch `archive/website-v1-2026-08` von `main` angelegt und gepusht; identisch mit `main@922ab41` (`git diff --stat` leer).
- Tag `website-v1-final` auf `922ab41` lokal angelegt (annotiert).
- Arbeits-Branch `feature/website-v2` von `main` angelegt; alte Site per `git rm` entfernt (36 Dateien) — erhalten: `CNAME`, `.gitignore`, `IMG_0707.png`, `IMG_0710.png`, `assets/louwietec-brain.png`, `assets/og-image.png`.
- Backend-Erreichbarkeit geprüft: beide `*.service.louwietec.com`-Hosts liefern das Traefik-Default-Zertifikat.

## Beleg
- `git ls-remote --heads origin` → `refs/heads/archive/website-v1-2026-08` = `922ab41…`, `refs/heads/main` = `922ab41…`, `refs/heads/feature/website-v2`.
- `git diff --stat main archive/website-v1-2026-08` → leer.
- Live-`ETag "6a84501b-4cbd"` = 19 645 Byte = `index.html` auf `main`; Pages-Run #34 head `922ab41` success.
- `openssl s_client` → `CN = TRAEFIK DEFAULT CERT` für `web.service.louwietec.com` und `analytics.service.louwietec.com`.
- Commits auf `feature/website-v2`: `b52e8ae` (alte Site entfernt), `52cbc3d` (HOSTING.md), dieser Bericht.

## Abweichungen
1. **Tag-Push verweigert:** Der Egress-Proxy der Session beantwortet `git-receive-pack` für `refs/tags/*` mit HTTP 403 (Branch-Pushes funktionieren). Der Tag liegt nur lokal. → **Vorschlag:** Louis setzt den Tag selbst (Befehle in `docs/HOSTING.md`, Abschnitt „Archiv“) oder per GitHub-Release auf Commit `922ab41`.
2. **Arbeits-Branch:** `feature/website-v2` statt des technisch vorgegebenen Session-Branches `claude/louwietec-website-2026-2tzukw` — von Louis so entschieden; der Session-Branch bleibt unberührt.
3. **Marken-Assets `assets/louwietec-brain.png` und `assets/og-image.png`** bleiben vorerst an den alten Pfaden (Regel „alte Pfade belassen, bis alle Verweise umgestellt sind“); `og-image.png` wird in Phase 6b durch das neue OG-Bild am selben Pfad ersetzt.

## Offen für Louis
1. Tag `website-v1-final` pushen (siehe Abweichung 1).
2. **Session 2:** gültige TLS-Zertifikate für `web.service.louwietec.com` und `analytics.service.louwietec.com` (derzeit Traefik-Default, selbstsigniert) — ohne sie sind Mock-Modus, `GET /healthz` und der Integrationstag nicht möglich. Zusätzlich: CORS erlaubt nur `louwietec.com`-Origins → ein lokaler Integrationslauf kann nicht bestehen; Staging-Origin nötig oder Tests nach dem Merge gegen die Produktions-Origin.
3. Redirect-Karte: `/en/…` existierte in v1 nie (v1 nutzte `?lang=de`); `impressum.html` und `privacy.html` fehlen in §8 → Vorschlag: Stubs nach `/rechtliches/impressum/` bzw. `/rechtliches/datenschutz/`.
4. Widersprüche, nach Rangfolge aufgelöst (bitte bestätigen): „Goldlinie“/„Countdown-Balken Gold“ (Texte) vs. „Kein Gold“ (Orchestrierung) → Signal-Blau; „Countdown serverseitig“ (Texte/Design) vs. Client-JS mit statischem Fallback (Orchestrierung) → Client-JS.
5. Fehlende Texte, die später gebraucht werden (werden je Phase als Vorschlagsliste vorgelegt): Meta-Titles Karriere/Über uns/Kontakt/FAQ, Descriptions Kostenlos/Investoren, Footer/Nav/Formular-Microcopy, Consent-Text, Erfolgs-/Fehlertexte, die zehn Selbstcheck-Fragen mit Antwortoptionen und Stufen-Labels, Reservierungs-Statustexte, jobs.json-Beschreibungen, 404-Text, Datenschutz/Impressum/AGB („in Gründung“).
6. Kontrast-Regel zur Kenntnis: `--signal` auf Papier nur 2,9:1, `--verify` auf Papier 1,8:1 → Signal nie als Text/Fokusring auf Papier (dort Navy), Verifiziert-Grün nur auf Ink-Flächen.

## Nächster Schritt
Warten auf Go. Danach Phase 1 (Fundament): `.nojekyll`, `README.md`, `docs/CONTRACT.md` unverändert, Geist/Geist Mono selbst gehostet, Tokens, Header/Footer-Partials, Logo-Varianten, `404.html`, `config.js`, `/styleguide/` als Gate.
