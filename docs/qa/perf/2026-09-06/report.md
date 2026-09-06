# Performance-Budget — 2026-09-06

Budget: Transfer ≤ 600 KB (ohne Frames, Text komprimiert geschätzt), ≤ 2 Schriftdateien, kein Bild > 200 KB, CLS = 0, keine Fremd-Anfragen. Lokaler Server ohne Kompression; Pages komprimiert Text.

| Seite | Modus | Transfer (komprimiert) | roh | Anfragen | Schriften | CLS | LCP | Aufteilung KB | Befund |
|---|---|---|---|---|---|---|---|---|---|
| / | still | 158 KB | 224 KB | 18 | 2 | 0 | 136 ms (H1.display) | html 5 · css 14 · image 77 · js 10 · font 51 | — |
| / | Bewegung | 218 KB | 381 KB | 25 | 2 | 0 | 104 ms (H1.display) | html 5 · css 14 · font 51 · js 71 · image 77 | — |
| /ledger/ | still | 151 KB | 230 KB | 20 | 2 | 0 | 120 ms (H1.mt-7) | html 6 · css 14 · font 51 · js 19 · image 60 | — |
| /ledger/ | Bewegung | 204 KB | 369 KB | 24 | 2 | 0 | 144 ms (H1.mt-7) | html 6 · font 51 · css 14 · js 72 · image 60 | — |
| /lens/ | still | 147 KB | 221 KB | 17 | 2 | 0 | 88 ms (H1.mt-5) | html 6 · font 51 · css 14 · js 16 · image 60 | — |
| /lens/ | Bewegung | 200 KB | 360 KB | 21 | 2 | 0 | 112 ms (H1.mt-5) | html 6 · css 14 · js 69 · font 51 · image 60 | — |
| /forge/ | still | 149 KB | 226 KB | 19 | 2 | 0 | 100 ms (H1.mt-5) | html 5 · font 51 · css 14 · js 18 · image 60 | — |
| /forge/ | Bewegung | 202 KB | 365 KB | 23 | 2 | 0 | 120 ms (H1.mt-5) | html 5 · css 14 · js 71 · font 51 · image 60 | — |
| /kostenlos/ | still | 140 KB | 201 KB | 16 | 2 | 0 | 112 ms (H1.mt-5) | html 4 · css 11 · font 51 · js 14 · image 60 | — |
| /kostenlos/ | Bewegung | 193 KB | 341 KB | 20 | 2 | 0 | 104 ms (H1.mt-5) | html 4 · css 11 · font 51 · js 67 · image 60 | — |
| /investoren/ | still | 145 KB | 215 KB | 18 | 2 | 0 | 84 ms (P) | html 4 · font 51 · css 14 · js 16 · image 60 | — |
| /investoren/ | Bewegung | 199 KB | 354 KB | 22 | 2 | 0 | 96 ms (H1.mt-5) | html 4 · font 51 · css 14 · js 69 · image 60 | — |
| /karriere/ | still | 138 KB | 193 KB | 16 | 2 | 0 | 96 ms (H1.mt-5) | html 3 · css 11 · js 12 · font 51 · image 60 · other 0 | — |
| /karriere/ | Bewegung | 192 KB | 333 KB | 20 | 2 | 0 | 76 ms (H1.mt-5) | html 3 · css 11 · font 51 · js 66 · image 60 · other 0 | — |
| /ueber-uns/ | still | 192 KB | 234 KB | 13 | 2 | 0 | 76 ms (H1.mt-5) | html 2 · font 51 · js 6 · css 11 · image 122 | — |
| /ueber-uns/ | Bewegung | 246 KB | 374 KB | 17 | 2 | 0 | 84 ms (H1.mt-5) | html 2 · css 11 · font 51 · js 59 · image 122 | — |
| /kontakt/ | still | 139 KB | 195 KB | 16 | 2 | 0 | 80 ms (H1) | html 3 · js 14 · css 11 · font 51 · image 60 | — |
| /kontakt/ | Bewegung | 192 KB | 334 KB | 20 | 2 | 0 | 96 ms (H1.is-in) | html 3 · js 67 · css 11 · font 51 · image 60 | — |
| /faq/ | still | 131 KB | 173 KB | 12 | 2 | 0 | 60 ms (H2) | html 3 · css 11 · js 6 · font 51 · image 60 | — |
| /faq/ | Bewegung | 184 KB | 312 KB | 16 | 2 | 0 | 76 ms (H2) | html 3 · js 59 · font 51 · css 11 · image 60 | — |
| /rechtliches/impressum/ | still | 130 KB | 172 KB | 12 | 2 | 0 | 72 ms (H1.mt-5) | html 2 · font 51 · css 11 · js 6 · image 60 | — |
| /rechtliches/impressum/ | Bewegung | 184 KB | 311 KB | 16 | 2 | 0 | 76 ms (H1.mt-5) | html 2 · css 11 · js 59 · font 51 · image 60 | — |
| /rechtliches/datenschutz/ | still | 131 KB | 173 KB | 12 | 2 | 0 | 68 ms (H1.mt-5) | html 2 · js 6 · css 11 · font 51 · image 60 | — |
| /rechtliches/datenschutz/ | Bewegung | 184 KB | 312 KB | 16 | 2 | 0 | 88 ms (H1.mt-5) | html 2 · js 59 · css 11 · font 51 · image 60 | — |
| /rechtliches/agb/ | still | 130 KB | 172 KB | 12 | 2 | 0 | 72 ms (P) | html 2 · css 11 · js 6 · font 51 · image 60 | — |
| /rechtliches/agb/ | Bewegung | 184 KB | 311 KB | 16 | 2 | 0 | 88 ms (P.is-in) | html 2 · font 51 · css 11 · js 59 · image 60 | — |

**Alle Seiten im Budget.**
