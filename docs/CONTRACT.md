# ANHANG — SCHNITTSTELLEN-VERTRAG v1 (unverändert, identisch in Session 2)


## 1. Grundlagen

- **Basis-URL Backend:** `https://web.service.louwietec.com` (Coolify-Service, HTTPS automatisch). Kein anderer Host.
- **Erlaubte Origins (CORS):** `https://louwietec.com`, `https://www.louwietec.com`. Alles andere: 403.
- **Format:** JSON, UTF-8, `Content-Type: application/json`. Alle Antworten haben exakt diese Hülle:
  ```json
  { "ok": true,  "data": { ... } }
  { "ok": false, "error": { "code": "VALIDATION_ERROR", "message": "…", "field": "email" } }
  ```
- **Fehlercodes (vollständige Liste):** `VALIDATION_ERROR` (400) · `SPAM_REJECTED` (400) · `RATE_LIMITED` (429, max 20 Anfragen/Minute/IP) · `PRODUCT_NOT_LIVE` (409) · `NOT_FOUND` (404) · `INTERNAL` (500). Kontingent voll ist **kein Fehler** (siehe `/reserve`).
- **Spam-Schutz (jedes POST-Formular):** verstecktes Feld `website` muss leer sein; Feld `ts` = Unix-Millisekunden beim Rendern des Formulars, Absenden < 3.000 ms danach wird abgelehnt. Feld `consent` muss `true` sein (Datenschutzhinweis).
- **Aufzählungen (Enums), beidseitig verbindlich:**
  - `produkt`: `ledger` | `lens` | `forge`
  - `edition`: `starter` | `pro` | `group`
  - `betriebsort`: `cloud` | `onprem`
  - `anliegen` (Kontakt): `ledger` | `lens` | `forge` | `enterprise` | `investor` | `presse` | `sonstiges`
  - `rolle` (Investoren): `pruefer` | `implementierer` | `kapital` | `sonstiges`
  - `branche`: `banking` | `versicherung` | `leasing` | `inkasso` | `gesundheit` | `energie` | `industrie` | `handel` | `dienstleistung` | `oeffentlich` | `sonstige`
  - `produkt.status` (aus `/config`): `reserve` (nur kostenlose Reservierung) | `deposit` (zusätzlich 89-€-Anzahlung) | `live` (Kauf möglich)

## 2. Endpunkte

| Methode & Pfad | Anfrage (Pflichtfelder fett) | Antwort `data` |
|---|---|---|
| `GET /healthz` | — | `{ "status": "up", "version": "1.0.x", "contract": "1.0" }` |
| `GET /config` | — | `{ "products": { "ledger": { "status": "reserve" }, "lens": { "status": "reserve" }, "forge": { "status": "reserve" } }, "contingent": { "ledger": { "banking": 5, … }, … }, "deposit_eur": 89 }` |
| `POST /forms/kontakt` | **firma, name, email, anliegen, nachricht, consent, website, ts** | `{ "received": true, "id": "…" }` |
| `POST /forms/investoren` | **name, organisation, email, rolle, nachricht, consent, website, ts** | `{ "received": true, "id": "…" }` |
| `POST /forms/karriere` | **name, email, motivation, consent, website, ts**, link, rolle | `{ "received": true, "id": "…" }` |
| `POST /forms/lagereport` | **email, consent, website, ts**, firma | `{ "subscribed": true }` |
| `POST /forms/selbstcheck` | **email, firma, antworten** (Array, genau 10 Ganzzahlen 0–2), **consent, website, ts** | `{ "score": 0–20, "stufe": "gut" \| "luecken" \| "dringend", "empfehlungen": ["…","…","…"] }` |
| `POST /reserve` | **firma, name, email, produkt, edition, branche, betriebsort, consent, website, ts** | `{ "reservation_id": "…", "status": "reserviert" \| "warteliste", "plaetze_frei": n }` |
| `POST /reserve/deposit` *(Stufe B)* | **reservation_id, email** | `{ "checkout_url": "https://checkout.stripe.com/…" }` |
| `POST /reserve/refund` *(Stufe B)* | **reservation_id, email** | `{ "confirmation_sent": true }` — Ausführung über Link in der Mail (`GET /reserve/refund/confirm?token=…`) |
| `POST /checkout` *(Stufe B)* | **produkt, edition, betriebsort, email, firma**, reservation_id | `{ "checkout_url": "…" }` — bei Status ≠ `live`: `409 PRODUCT_NOT_LIVE` |
| `POST /webhooks/stripe` | nur Stripe (Signaturprüfung) | — |

**Verhalten der Website je `produkt.status`:** `reserve` → Button „Erstanwender-Platz reservieren — kostenlos" · `deposit` → zusätzlich „Platz fixieren — 89 € Anzahlung, anrechenbar, rückforderbar" · `live` → „Jetzt buchen" (Checkout). Enterprise hat nie einen Kaufen-Button, nur „Gespräch anfragen" (Kontaktformular mit `anliegen = enterprise`).

**Fallback:** Die Website ruft beim Laden `GET /healthz` mit 2 s Timeout. Antwortet der Dienst nicht, zeigen alle Formulare den `mailto:`-Fallback mit vorausgefülltem Betreff (`[LOUWIETEC] Kontakt`, `[LOUWIETEC] Reservierung LEDGER Starter` usw.) und Buttons für Anzahlung/Kauf werden ausgeblendet.

## 3. Messkette (Analytics-Ereignisse, identische Namen auf beiden Seiten)

Cookieloses Analytics (Umami, eigene Instanz unter `analytics.service.louwietec.com`, eine Website-ID für beide Seiten). **Website sendet:** `visit` (automatisch), `magnet_start` (Selbstcheck gestartet / Verifier-Download / Report-Formular geöffnet), `cta_click` (mit Eigenschaft `target`). **Backend sendet (serverseitig):** `magnet_complete` (Formular erfolgreich), `reservation`, `deposit`, `checkout_started`, `purchase`, `talk_booked` (manuell markiert), `offer`, `close`. Eigenschaften: `produkt`, `edition`, `branche` wo vorhanden.

## 4. Zusammenspiel-Protokoll (so wird es reibungslos)

1. **Mock zuerst:** Das Backend liefert ab Phase 1 eine `openapi.yaml` (aus diesem Vertrag) und einen Mock-Modus (`MOCK=1`: alle Endpunkte antworten mit gültigen Beispielantworten, nichts wird gespeichert). Die Website baut ab Tag 1 gegen `web.service.louwietec.com` im Mock-Modus — nicht gegen lokale Annahmen.
2. **Vertrag im Repo:** Beide Repos enthalten diese Datei unverändert als `docs/CONTRACT.md`. Weicht die Implementierung vom Vertrag ab, ist die Implementierung falsch — nicht der Vertrag. Änderungswunsch = Vorschlag an Louis, dann Versionssprung, dann PR in **beiden** Repos am selben Tag.
3. **Integrationstag (vor Go-Live der Website):** Mock aus, echtes Backend an, gemeinsame Abnahme mit zwölf Tests: Healthz · Config liest Status korrekt · jedes der fünf Formulare sendet und bestätigt · Spam-Test (Honeypot) · Zeit-Test (< 3 s) · Reservierung mit Kontingent 5 → sechste = Warteliste · Fallback bei abgeschaltetem Backend · CORS von fremder Origin abgelehnt · Ereignisse erscheinen im Analytics · Fehlerhülle bei Validierungsfehler korrekt angezeigt · Enterprise-Anliegen landet als solches · Rate-Limit greift.
4. **Stufe B (Stripe) wird separat integriert**, wenn die GmbH existiert — die Website ist dafür vorbereitet, weil sie ihre Buttons ausschließlich aus `/config` ableitet: Umschalten eines Produkts auf `deposit` oder `live` erfordert **keinen Website-Deploy.**
5. **Wer besitzt was:** Feldnamen, Enums, Fehlercodes, Ereignisnamen → dieser Vertrag. Texte auf Buttons und in Mails → Website-Texte-Dokument. Kontingente, Status, Preise → Backend-Konfiguration (Coolify-ENV), nie im Frontend hartkodiert.
