# Performance-Budget — 2026-09-07

Budget: Transfer ≤ 600 KB (ohne Frames, Text komprimiert geschätzt), ≤ 2 Schriftdateien, kein Bild > 200 KB, CLS = 0, keine Fremd-Anfragen. Lokaler Server ohne Kompression; Pages komprimiert Text.

| Seite | Modus | Transfer (komprimiert) | roh | Anfragen | Schriften | CLS | LCP | Aufteilung KB | Befund |
|---|---|---|---|---|---|---|---|---|---|
| / | still | 158 KB | 225 KB | 18 | 2 | 0 | 112 ms (H1.display) | html 5 · css 14 · font 51 · image 77 · js 10 | — |
| / | Bewegung | 219 KB | 383 KB | 25 | 2 | 0 | 100 ms (H1.display) | html 5 · css 14 · font 51 · js 71 · image 77 | — |
| /ledger/ | still | 151 KB | 231 KB | 20 | 2 | 0 | 112 ms (H1.mt-7) | html 6 · css 14 · js 19 · font 51 · image 60 | — |
| /ledger/ | Bewegung | 204 KB | 371 KB | 24 | 2 | 0 | 112 ms (H1.mt-7) | html 6 · font 51 · css 14 · js 72 · image 60 | — |
| /kontakt/ | still | 139 KB | 196 KB | 16 | 2 | 0 | 72 ms (H1) | html 3 · font 51 · js 14 · css 11 · image 60 | — |
| /kontakt/ | Bewegung | 193 KB | 335 KB | 20 | 2 | 0 | 84 ms (H1.is-in) | html 3 · js 67 · css 11 · font 51 · image 60 | — |

**Alle Seiten im Budget.**
