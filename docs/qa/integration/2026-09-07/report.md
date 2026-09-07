# Integrationstests, 2026-09-07 (Mock-Fixture)

12/12 bestanden

| # | Test | Ergebnis | Dauer |
|---|---|---|---|
| 1 | Healthz → body[data-backend="up"] in < 2,5 s | ✓ | 193 ms |
| 2 | Config liest Status korrekt (reserve/deposit/live, deposit_eur, Enterprise nie Kaufen) | ✓ | 663 ms |
| 3 | Jedes der fünf Formulare (+ Reservierung) sendet und bestätigt, Felder exakt nach Vertrag | ✓ | 2162 ms |
| 4 | Spam-Test (Honeypot) → SPAM_REJECTED sichtbar | ✓ | 297 ms |
| 5 | Zeit-Test (< 3 s nach Rendern) → abgelehnt | ✓ | 284 ms |
| 6 | Kontingent 5 → sechste Reservierung = Warteliste | ✓ | 2487 ms |
| 7 | Fallback bei abgeschaltetem Backend → mailto mit Vertrags-Betreff, Anzahlung/Kauf verborgen | ✓ | 347 ms |
| 8 | CORS von fremder Origin abgelehnt (serverseitig; Website zeigt Fehler + mailto) | ✓ | 300 ms |
| 9 | Ereignisse: cta_click mit target, magnet_start (visit = Umami-Pageview) | ✓ | 1737 ms |
| 10 | Fehlerhülle bei Validierungsfehler am Feld (aria-invalid, Meldung, Fokus) | ✓ | 283 ms |
| 11 | Enterprise-Anliegen landet als solches (?anliegen=enterprise) | ✓ | 262 ms |
| 12 | Rate-Limit greift (RATE_LIMITED sichtbar) | ✓ | 849 ms |
