# Lighthouse — 2026-09-06

Schwelle 90 für Performance, Accessibility, Best Practices; SEO wird mitgemessen, zählt erst ab Phase 6b. Lokaler Server ohne Kompression und HTTP/2 (GitHub Pages liefert beides); simulierte Drosselung: mobil Slow 4G + CPU ×4, Desktop 40 ms RTT / 10 Mbit/s / CPU ×1 (Lighthouse-Presets). Konsolenfehler durch das nicht erreichbare Backend (web.service.louwietec.com) zählen in Best Practices mit, bis Session 2 den Dienst bereitstellt.

| Seite | Form | Perf | A11y | Best Practices | SEO | LCP | CLS | TBT | Befunde |
|---|---|---|---|---|---|---|---|---|---|
| / | mobile | 98 | 100 | 100 | 100 | 2,3 s | 0 | 0 ms | — |

**Alle Messungen ≥ Schwelle.**
