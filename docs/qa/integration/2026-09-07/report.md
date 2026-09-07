# Integrationstests, 2026-09-07 (Mock-Fixture)

12/12 bestanden

| # | Test | Ergebnis | Dauer |
|---|---|---|---|
| 1 | Healthz → body[data-backend="up"] in < 2,5 s | ✓ | 210 ms |
| 2 | Config liest Status korrekt (reserve/deposit/live, deposit_eur, Enterprise nie Kaufen) | ✓ | 724 ms |
| 3 | Jedes der fünf Formulare (+ Reservierung) sendet und bestätigt, Felder exakt nach Vertrag | ✓ | 2087 ms |
| 4 | Spam-Test (Honeypot) → SPAM_REJECTED sichtbar | ✓ | 298 ms |
| 5 | Zeit-Test (< 3 s nach Rendern) → abgelehnt | ✓ | 316 ms |
| 6 | Kontingent 5 → sechste Reservierung = Warteliste | ✓ | 2170 ms |
| 7 | Fallback bei abgeschaltetem Backend → mailto mit Vertrags-Betreff, Anzahlung/Kauf verborgen | ✓ | 321 ms |
| 8 | CORS von fremder Origin abgelehnt (serverseitig; Website zeigt Fehler + mailto) | ✓ | 259 ms |
| 9 | Ereignisse: cta_click mit target, magnet_start (visit = Umami-Pageview) | ✓ | 1739 ms |
| 10 | Fehlerhülle bei Validierungsfehler am Feld (aria-invalid, Meldung, Fokus) | ✓ | 276 ms |
| 11 | Enterprise-Anliegen landet als solches (?anliegen=enterprise) | ✓ | 300 ms |
| 12 | Rate-Limit greift (RATE_LIMITED sichtbar) | ✓ | 817 ms |
