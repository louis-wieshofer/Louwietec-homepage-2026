# Performance-Budget — 2026-09-06

Budget: Transfer ≤ 600 KB (ohne Frames, Text komprimiert geschätzt), ≤ 2 Schriftdateien, kein Bild > 200 KB, CLS = 0, keine Fremd-Anfragen. Lokaler Server ohne Kompression; Pages komprimiert Text.

| Seite | Modus | Transfer (komprimiert) | roh | Anfragen | Schriften | CLS | LCP | Aufteilung KB | Befund |
|---|---|---|---|---|---|---|---|---|---|
| / | still | 157 KB | 224 KB | 18 | 2 | 0 | 132 ms (H1.display) | html 5 · css 14 · js 10 · font 51 · image 77 | — |
| / | Bewegung | 218 KB | 381 KB | 25 | 2 | 0 | 112 ms (H1.display) | html 5 · css 14 · js 71 · image 77 · font 51 | — |
| /ledger/ | still | 150 KB | 230 KB | 20 | 2 | 0 | 132 ms (H1.mt-7) | html 6 · js 19 · css 14 · font 51 · image 60 | — |
| /ledger/ | Bewegung | 204 KB | 369 KB | 24 | 2 | 0 | 128 ms (H1.mt-7) | html 6 · font 51 · js 72 · css 14 · image 60 | — |
| /kontakt/ | still | 139 KB | 195 KB | 16 | 2 | 0 | 92 ms (H1) | font 51 · html 3 · css 11 · js 14 · image 60 | — |
| /kontakt/ | Bewegung | 192 KB | 334 KB | 20 | 2 | 0 | 104 ms (H1.is-in) | html 3 · css 11 · js 67 · font 51 · image 60 | — |

**Alle Seiten im Budget.**
