# PHASE 6b — STATUS ⚪ zurückgestellt (Entscheidung Louis, 2026-09-06)

**SEO/GEO wird später gemacht.** Louis hat am 2026-09-06 entschieden: „6b braucht es noch nicht, nur dokumentieren; die vorhandenen Meta-Angaben reichen fürs Erste.“ Diese Datei ist die Arbeitsliste für den späteren Lauf. Die Website geht mit dem Stand aus Phase 2 live: Titles und Descriptions wortgleich aus dem Texte-Dokument (Start, LEDGER, LENS, FORGE, Kostenlos-Title, Investoren-Title), `canonical` je Seite, `theme-color`, Icons, Manifest, `noindex` auf Styleguide, 404 und Redirect-Stubs.

## Ist-Stand (live nach dem Merge)
- Kein `robots.txt`, keine `sitemap.xml`, kein `llms.txt` (Suchmaschinen crawlen ohne Einschränkung; die alte Sitemap-Adresse liefert 404, unkritisch).
- OG/Twitter: `assets/og-image.png` aus Website v1 (1200×630, alte Botschaft) ist noch referenziert, wo Phase 2 es gesetzt hat; kein seitenspezifisches OG-Bild.
- Kein JSON-LD, kein `hreflang`.
- Fehlende Titles/Descriptions (nicht im Texte-Dokument vorgegeben) stehen als **Vorschläge** in den Seiten: Karriere, Über uns, Kontakt, FAQ, Rechtliches sowie Descriptions Kostenlos/Investoren — Freigabe durch Louis offen.
- Lighthouse-Kategorie SEO wird in Phase 6 mitgemessen, aber nicht als Gate gewertet (`lighthouse.mjs` ohne `--seo`).

## Aufgaben für den späteren Lauf (Reihenfolge)
1. **Titles/Descriptions** freigeben oder ersetzen (Liste oben), Head-Reihenfolge laut Architekturplan G (charset, viewport, title, description, robots, site-verification nur Start, canonical, hreflang, theme-color, OG, Twitter, Icons, Preloads, CSS, boot.js, JSON-LD).
2. **JSON-LD:** `Organization` (@id `/#org`, legalName „in Gründung“ bis Eintragung, Adresse nur nach Bestätigung, Gründer, `knowsAbout`) auf Start + Über uns · `Product` je Produktseite (Offers Starter/Pro/Group als `UnitPriceSpecification`, Enterprise ohne Preis, `availability: PreOrder`) · `FAQPage` (fünf Fragen wortgleich) · `ContactPage`, `AboutPage`.
3. **OG-Bilder** nur Typografie (Tinte, Mono-Kicker, Geist-Headline, Signal-Kettenlinie, Icon weiß) per Playwright aus `og-template.html`: `og-default`, `og-start`, `og-ledger`, `og-lens`, `og-forge`, `og-kostenlos`, `og-investoren` (≤ 300 KB); `assets/og-image.png` ersetzen; `og:locale de_AT`, `og:image:alt`, Twitter-Card.
4. **`sitemap.xml`** (13 URLs, `xhtml:link hreflang`), **`robots.txt`** (Allow `/`, Disallow `/styleguide/` und `/docs/`, KI-Crawler ausdrücklich erlaubt), **`llms.txt`** nach llmstxt.org.
5. **hreflang:** `de` + `x-default` → DE; EN als Kommentar vorbereitet (die alte Sprachumschaltung `?lang=` gab es nur clientseitig).
6. **Google-Site-Verification** `Nx8f-p-YnHfAIOnSDoPXzmmVQS-dR2b8dbJ9BSJQcLA` aus Website v1 auf der Startseite übernehmen; Search Console: neue Sitemap einreichen, alte Adressen prüfen (Redirect-Stubs liefern 200 + Meta-Refresh, `/en/*` per 404-Karte).
7. **`check-seo.mjs`** (ein h1 je Seite, Title/Description-Längen, canonical = Route, hreflang, OG/Twitter, JSON-LD parst, Sitemap ⊇ indexierbare Seiten, `noindex` auf Styleguide/404/Stubs, Countdown-Fallback älter als 30 Tage → Warnung) und `lighthouse.mjs --seo` als Gate ≥ 90.

## Nächster Schritt
Nichts vor Freigabe. Wenn Louis „SEO jetzt“ sagt: Punkte 1–7 als eigene Commits auf einem Branch von `main`, dann PR.
