# PHASE 5 — STATUS 🟢

**Datum:** 2026-09-05 · **Branch:** `feature/website-v2`

## Erledigt
- **`api.js`** — einzige Stelle, die mit `https://web.service.louwietec.com` spricht: `GET /healthz` (Timeout 2 s) und `GET /config` parallel beim Laden, Ergebnis in `body[data-backend="up|down"]` und Ereignis `lw:backend`; `post()` mit Vertragshülle (`{ok,data}` / `{ok:false,error:{code,message,field?}}`), Netzfehler → clientseitiger Code `NETWORK`; deutsche Statustexte je Fehlercode (Vorschläge).
- **`forms.js`** — sechs Formulare (Kontakt, Investoren, Karriere, Lagereport, Selbstcheck, Reservierung) mit Payload exakt nach Vertrag: `ts` beim Rendern, Honeypot `website`, `consent` als Boolean, `antworten` als zehn Ganzzahlen aus den Radios `q0…q9`; clientseitige Prüfung (Pflichtfelder, E-Mail, URL, Enums aus `config.js`); Fehlerhülle → Meldung am Feld, `aria-invalid`, Fokus; `RATE_LIMITED`/`SPAM_REJECTED`/`INTERNAL`/`NETWORK` → Statuszeile plus `mailto:`-Fallback; Backend down → Absenden verborgen, `mailto:office@louwietec.com` mit Vertrags-Betreff (`[LOUWIETEC] Kontakt`, `[LOUWIETEC] Reservierung {PRODUKT} {Edition}`) und Body aus den Feldern; `?anliegen=`/`?rolle=` Vorauswahl; `aria-busy` während des Sendens.
- **`products.js`** — Produkt-Buttons **ausschließlich** aus `config.products[p].status`: `reserve` → „Erstanwender-Platz reservieren — kostenlos“; `deposit` → zusätzlich „Platz fixieren — {deposit_eur} € Anzahlung, anrechenbar, rückforderbar“ (`POST /reserve/deposit` nach Reservierung → `checkout_url`); `live` → „Jetzt buchen“ (`POST /checkout`, 409 → Statuszeile). Ohne Config/down → nur Reservieren im mailto-Modus. Enterprise bleibt statisch „Gespräch anfragen“ → `/kontakt/?anliegen=enterprise`. Reservierungsabschnitt (`#reservieren`) auf LEDGER, LENS, FORGE eingeblendet per Klick, Produkt als verstecktes Feld.
- **`analytics.js`** — Umami der eigenen Instanz, cookielos; Skript nur mit gesetzter `ANALYTICS_WEBSITE_ID`; Ereignisse `visit` (Pageview), `magnet_start` (erster Kontakt mit Selbstcheck/Lagereport, Klick Verifier), `cta_click` (delegiert auf `[data-track="cta_click"]` mit `target`, `produkt`, `edition`, `branche`); Warteschlange bis `window.umami` da ist.
- **`jobs.js`** — rendert `/jobs.json` in die Rollenliste (Template) und füllt das Rollenfeld der Bewerbung; die statische Liste bleibt die stille Version.
- **Redirect-Stubs** `about.html`, `approach.html`, `principles.html`, `contact.html`, `impressum.html`, `privacy.html`, `en/index.html` (Meta-Refresh 0, `<link rel="canonical">`, `noindex`, sichtbarer Link) und Weiterleitungskarte in `404.html` für `/en/*` und `?lang=`.
- **QA-Werkzeuge:** `check-contract.mjs` (Formulare + `config.js` gegen den geparsten Vertrag), `mock-fixture.mjs` (Testdouble per Playwright-Route, kein Backend-Code), `integration.spec.mjs` (die zwölf Tests aus Vertrag §4.3, Report `docs/qa/integration/<datum>/`); `package.json`/`docs/qa/README.md` ergänzt.
- **Vorgezogen aus dem laufenden Phase-1-Review (Blocker):** `motion.css` — die Verbergen-Regel der Reveals war spezifischer als die Zeigen-Regel, unter erlaubter Bewegung blieb der Großteil des Seiteninhalts unsichtbar; Ziel-Liste jetzt in `:where()`. Dazu `motion.css` nur für `screen` (Druck zeigte Vorher-Zustände), Lenis übernimmt vor `scrollTo` die native Position (Fokus-Scroll), Reservieren-Knopf fokussiert das erste echte Feld statt des Honeypots.

## Beleg
- `node docs/qa/tools/integration.spec.mjs` → **12/12 bestanden** (`docs/qa/integration/2026-09-05/report.md`): Healthz < 2,5 s · Config-Status reserve/deposit/live mit `deposit_eur` 120 aus `/config`, Enterprise nie Kauf · sechs Formulare senden mit exakt den Vertragsfeldern · Honeypot → `SPAM_REJECTED` · `ts` < 3 s → abgelehnt · Kontingent 5 → sechste Reservierung Warteliste · Backend aus → nur Reservieren, `mailto:` mit `[LOUWIETEC] Reservierung LEDGER Starter` und `[LOUWIETEC] Kontakt` · CORS-403 → Fehlertext + mailto · `magnet_start`/`cta_click` mit Props · Feldfehler mit `aria-invalid` + Fokus · `?anliegen=enterprise` landet als `enterprise` · `RATE_LIMITED` sichtbar.
- Gates grün: `check-partials` (22 Seiten), `check-verify-green` (`--verify` 3×, keine Fremd-Skripte), `diff-copy` (alle zehn Seiten wortgleich), `check-links` (alle internen Verweise gültig), `check-contract` (8 Formulare, 7 Enums identisch mit `config.js`).
- Reveal-Prüfung in Chromium mit Bewegung nach dem Fix: 0 verborgene Blöcke mit `.is-in` auf `/`, `/ledger/`, `/404.html`, `/faq/`, `/kontakt/` (vorher 23 von 29 auf der Startseite).

## Abweichungen
1. **Testdouble statt Backend:** beide `*.service.louwietec.com` liefern weiterhin das Traefik-Standardzertifikat; das Testdouble beantwortet die Anfragen im Browser per Route-Interception exakt nach Vertrag. Der Live-Lauf (`LW_LIVE=1`) ist Phase 7 und braucht gültige Zertifikate und eine erlaubte Origin (CORS).
2. **Karriere-Rolle:** laut Vertrag ein optionales Freitextfeld; Werte sind die Rollentitel aus `jobs.json` (dritte Rolle heißt wie im Texte-Dokument „Initiativ — überzeuge uns.“). Der Vertragsprüfer nimmt dieses Feld vom Enum-Vergleich aus.
3. **Anzahlung:** Betrag aus `config.deposit_eur`, Fallback 89 € (Vertrag) nur wenn `/config` keinen Wert liefert.
4. **Statustexte** (Senden, Erfolg, Fehlercodes, Stufen des Selbstchecks „Gut aufgestellt / Lücken vorhanden / Dringender Handlungsbedarf“, Reservierungs-/Wartelistentext) sind Vorschläge und stehen in `forms.js`/`api.js`; `mailto`-Betreffe außer den beiden Vertragsbetreffen ebenso (`config.js`).
5. **Analytics:** `ANALYTICS_WEBSITE_ID` ist leer → kein Skript geladen; `visit` ist der Umami-Pageview (kein eigenes Ereignis). Ereignisse wurden gegen einen `window.umami`-Stub belegt.
6. **Redirects:** `/en/*` gab es in v1 nicht als Pfade (Sprache lief über `?lang=`); die 404-Karte deckt beides ab, aber GitHub Pages liefert dafür HTTP 404 vor der Weiterleitung.

## Offen für Louis
1. Session 2: gültige TLS-Zertifikate auf `web.service` und `analytics.service`, CORS für eine Staging-Origin (sonst Live-Lauf erst nach Merge), Umami-Website-ID.
2. Freigabe der Statustexte, Fehlertexte, Erfolgstexte, Consent-Sätze und Stufen-Labels (Liste in Abweichung 4).
3. Zehn Selbstcheck-Fragen mit je drei Antworten (Platzhalter „Frage n (Text folgt)“ steht im Markup).
4. `jobs.json`: Beschreibungen der drei Rollen (derzeit leer), Art/Ort bestätigen („projektbasiert · Wien / remote“).
5. Rechtstexte für Impressum, Datenschutz (Umami, Formular-Backend, GitHub-Pages-Hosting), AGB.

## Nächster Schritt
Nachtrag Phase 1 aus dem Review-Workflow (Skip-Link unter Bewegung, mobiles Menü, Header-Höhe, Druck, Tap-Ziele, Enums), Seiten-Reviews, dann Phase 6 (QA).
