# Design

> **IST-Zustand der LOUWIETEC-Website per Mai 2026.**
> Quelle: `css/styles.css` (2346 Zeilen), `index.html`, `about.html`, `approach.html`, `principles.html`, `contact.html`, `impressum.html`, `js/main.js` (737 Zeilen).
> Dieses Dokument beschreibt, **was IST** — nicht, was sein soll. Soll-Diskussionen finden im Audit (vorheriger redesign-skill-Run) und in `PRODUCT.md` statt.
> Doku-Sprache: Hochdeutsch. Klassennamen, Tokens, Werte, Easings, Property-Namen: EN/CSS-original.

## Theme

Single dark theme als Default mit einer **vollständigen Light-Inversion auf `contact.html`**. Hintergrund-Basis dunkelmarineblau (`#0A0E1A`), nicht reines Schwarz. Akzent ist ein desaturiertes Mittelblau (`--accent`); Klassen-Naming entsprechend harmonisiert (`accent-line`, `cta-link--accent`). Frühere Gold-Iteration aus dem Naming entfernt im Pass 2026-05-07.

Stimmungsbild: „Operations-VP-Boutique nach Feierabend." Atmospheric — Gradient-Orbs, Mesh-Canvas, Network-Grid-Punkte, Noise-Overlay, Custom-Cursor-Dot, Monogram-Breathing. **Nicht minimalistisch.** Maximalistische Stille.

| Page | Theme |
|---|---|
| `index.html` | dark + Hero-Mesh-Canvas + Preloader |
| `about.html` | dark |
| `approach.html` | dark |
| `principles.html` | dark + Horizontal-Scroll-Pinning |
| `contact.html` | **light-inversion** (`#F0EDE6` Beige, `#09090B` Tinte) |
| `impressum.html` | dark, reduziert |

Color-Strategy-Klassifikation (per impeccable-Reference): **Restrained.** Tinted Neutrals + ein Akzent (`--accent`) unter ~10% der Surface. Akzent erscheint nur in: 2-px-Akzent-Linien (`.accent-line` / `.hero-accent-line`), Bullets, Selection-Background, Hover-Borders, einzelnem CTA (`.cta-link--accent`), Hamburger-Lines.

## Color Tokens

Definiert in `css/styles.css:14-34` (`:root`). Werte sind sRGB Hex/RGBA, **nicht OKLCH**.

### Dark (Default)

| Token | Wert | Verwendung |
|---|---|---|
| `--bg-primary` | `#0A0E1A` | Body, Footer, Nav-scrolled |
| `--bg-elevated` | `#0F1424` | definiert, aktuell ungenutzt |
| `--bg-card` | `rgba(255, 255, 255, 0.03)` | `.glass-card` Hintergrund |
| `--accent` | `rgba(70, 140, 220, 0.6)` | Hover-Borders, Akzent-Lines, Bullets, Selection |
| `--accent-hover` | `#5BA8E8` | CTA-Hover-State |
| `--accent-subtle` | `rgba(70, 140, 220, 0.1)` | definiert, ungenutzt |
| `--text-primary` | `#EDEDED` | Headings, betonte Aussagen |
| `--text-secondary` | `#6B6B76` | Body-Text, Subtitles |
| `--text-tertiary` | `#3A3A44` | Nav-Links default, Footer-Text, Meta |
| `--border-subtle` | `rgba(255, 255, 255, 0.06)` | Glass-card-Border |
| `--border-hover` | `rgba(70, 140, 220, 0.15)` | Glass-card-Hover-Border |

### Light (Contact-Inversion, hardcoded in `body.page-contact`)

| Wert | Verwendung |
|---|---|
| `#F0EDE6` | Body-Background — warmes Beige, nicht reines Weiß |
| `#09090B` | Headings, primärer Text |
| `#6B6B76` | Sekundär-Text, identisch mit Dark-Variante |
| `#9A9A9A` | Tertiär (Footer-Separators, Nav-Link-default) |
| `#CCCCCC` | Contact-Email default-color |
| `rgba(0, 0, 0, 0.08)` | Borders, Scrollbar-Track |
| `rgba(0, 0, 0, 0.1)` | Mobile-Menu-Divider |
| `rgba(0, 0, 0, 0.15)` | Contact-Email-Border-default |

### Bekannte Befunde (aus Audit)

- Akzent ist mit `0.6` Alpha desaturiert auf dunklem Background — kontrastschwach gegen `--text-secondary` für Hover-States.
- Schatten sind reines `rgba(0,0,0,*)` auf marineblauem Background, **nicht** zur Hue getintet.
- Naming-Drift `gold ↔ blau` aus früherer Iteration: per Pass 2026-05-07 vollständig auf `accent-*` harmonisiert.

## Typography

Geladen über Google Fonts CDN (`<link>` in jeder HTML-Datei): **Playfair Display** (400, 400 italic, 700) + **Inter** (300, 400, 500, 600).

| Token | Wert |
|---|---|
| `--font-display` | `'Playfair Display', Georgia, serif` |
| `--font-body` | `'Inter', system-ui, sans-serif` |
| Body line-height | `1.8` |
| Body weight | `400` |

### Type Scale (gemessen aus dem CSS)

| Element | Family | Weight | Size | Letter-Spacing | Transform |
|---|---|---|---|---|---|
| `.hero-title` | Inter | 300 | `clamp(2.2rem, 5vw + 1rem, 4.5rem)` | `0.6em → 0.35em` (animiert) | uppercase |
| `.hero-tagline` | Playfair italic | 400 | `clamp(1rem, 1.5vw + 0.5rem, 1.35rem)` | `0.03em` | none |
| `.page-header-title` | Playfair | 700 | `clamp(2rem, 3vw + 1rem, 3.5rem)` | `0.01em` | none |
| `.section-heading h2` / `.split-left h2` | Playfair | 700 | `clamp(1.75rem, 2vw + 0.5rem, 2.5rem)` | `0.01em` | none |
| `.thesis-text` | Playfair | 400 | `1.25–1.5rem` (line-height `1.8`) | — | none |
| `.thesis-accent` | Playfair | 700 | `1.25–1.5rem` | — | none |
| `.bento-number` | Playfair | 700 | `3–3.5rem` | — | none |
| `.bento-title` | Inter | 600 | `1.125–1.25rem` | — | none |
| `.bento-desc` | Inter | 400 | `0.9375rem` (line-height `1.7`) | — | none |
| `.number-value` | Playfair | 700 | `clamp(2.5rem, 3vw + 1rem, 3.5rem)` | `-0.02em` | none |
| `.number-label` | Inter | 500 | `0.6875rem` | `0.2em` | uppercase |
| `.capability-title` | Inter | 600 | `0.875rem` | `0.08em` | uppercase |
| `.principle-title` | Inter | 700 | `1.25rem` | — | none |
| `.principle-desc` | Inter | 400 | `0.9375rem` (line-height `1.8`) | — | none |
| `.founder-name` | Inter | 600 | `1.5rem` | — | none |
| `.founder-role` | Inter | 500 | `0.75rem` | `0.2em` | uppercase |
| `.contact-name` | Inter | 600 | `1.5rem` | — | none |
| `.contact-role` | Inter | 500 | `0.75rem` | `0.2em` | uppercase |
| `.contact-email` | Inter | 400 | `1.25rem` | — | none |
| `.nav-link` | Inter | 500 | `0.75rem` (≥1024px: `0.8125rem`) | `0.15em` | uppercase |
| `.cta-link` | Inter | 500 | `0.875rem` | `0.1em` | uppercase |
| `.mobile-menu-link` | Playfair | 700 | `2rem` | — | none |
| `.footer-link` | Inter | 400 | `0.8125rem` | — | none |
| `.cta-heading` | Playfair | 700 | `clamp(1.5rem, 2vw + 0.5rem, 2rem)` | — | none |
| `.trust-content h2` | Playfair | 700 | `1.75–2rem` | — | none |
| `.expect-content h2` | Playfair | 700 | `1.75rem` | — | none |
| `.expect-item` | Inter | 400 | `1.0625rem` (line-height `1.75`) | — | none |
| `.intro-text` | Inter | 400 | `1.0625–1.125rem` (line-height `1.85`) | — | none |
| `.thesis-quote-mark` | Playfair | 400 | `8–10rem` | — | none |
| `.decorative-number` | Playfair | 700 | `clamp(5rem, 8vw + 2rem, 10rem)` | — | none |

### Konventionen

- **Display-Type** (Headings, Numbers, Quote-Marks, Mobile-Menu) → Playfair Display.
- **Functional-Type** (Body, Subtitles, Labels, CTAs, Capabilities, Bento, Nav, Footer) → Inter.
- Uppercase + breite Letter-Spacing nur für Meta-Labels und Nav (≥`0.08em`).
- Body-Line-Height global `1.8`. Lokale Overrides: `1.7` in `.bento-desc`, `1.85` in `.intro-text` und `.split-right .glass-card .prose`.

### Bekannte Befunde

- Inter + Playfair Display ist die häufigste AI-Default-Kombination. Audit-Befund. PRODUCT.md erlaubt Beibehaltung im IST-Zustand; Soll-Wechsel ist eine separate Entscheidung.
- Numbers-Section ohne `font-variant-numeric: tabular-nums` trotz datendichter Anzeige.
- `.hero-title` mit `letter-spacing: 0.6em` ist der „luxuriöse Wide-Tracking"-Trick — wird unter PRODUCT.md-Prinzip 5 („generational") toleriert.

## Layout & Spacing

### Container

| Token | Wert |
|---|---|
| `--max-content` | `1100px` (≥1440px: `1200px`) |
| `--max-prose` | `680px` |
| `.nav-inner max-width` | `1200px` (≥1440px: `1300px`) |

### Section-Padding-Skala (vertikal × horizontal)

| Section | Default | ≥768px | ≥1024px | ≥1440px |
|---|---|---|---|---|
| `.hero` | `min-height: 100vh`, `0 1.5rem` | — | — | — |
| `.page-header` | `10rem 1.5rem 4rem` | — | — | — |
| `.section-thesis` | `6rem 1.5rem` | `8rem 2rem` | `9rem 2.5rem` | `10rem 3rem` |
| `.section-split` | `7.5rem 1.5rem` | `8rem 2rem` | `9rem 2.5rem` | `10rem 3rem` |
| `.section-bento` | `7.5rem 1.5rem` | `8rem 2rem` | `9rem 2.5rem` | `10rem 3rem` |
| `.section-numbers` | `5rem 1.5rem` | `6rem 2rem` | `7rem 2.5rem` | `8rem 3rem` |
| `.section-capabilities` | `7.5rem 1.5rem` | `8rem 2rem` | `9rem 2.5rem` | `10rem 3rem` |
| `.section-cta` | `6rem 1.5rem` | — | — | — |
| `.section-intro`, `.section-founder` | `6rem 1.5rem` | — | — | — |
| `.section-trust` | `7.5rem 1.5rem` | — | — | — |
| `.section-contact-info` | `2rem 1.5rem 4rem` | — | — | — |
| `.section-expect` | `4rem 1.5rem` | — | — | — |
| `.section-closing` | `3rem 1.5rem 5rem` | — | — | — |
| `.footer-inner` | `3rem 1.5rem` | — | — | `4rem 3rem` |
| `.impressum-content` | `8rem 1.5rem 4rem` | — | — | — |

### Small-Phone-Override (≤480px)

Sections kollabieren auf `3.5–4rem 1.25rem`. Glass-Card-Padding auf `1.5rem`, Border-Radius auf `12px`.

### Grid-Strukturen

| Pattern | Mobile | ≥768px | ≥1024px |
|---|---|---|---|
| `.bento-grid` | 1 col | `repeat(12, 1fr)` mit Custom-Spans | gleich |
| `.numbers-grid` | `repeat(2, 1fr)` (≤480: 1 col) | `repeat(3, 1fr)` | gleich |
| `.capabilities-grid` | 1 col | `repeat(2, 1fr)` (768–1023) | `repeat(3, 1fr)` (≥1024) |
| `.enterprise-grid` | 1 col | `repeat(2, 1fr)` | gleich |
| `.split-layout` | column | row, `35%` left-sticky / `65%` right | gleich (gap `5rem`) |
| `.horizontal-track` | column (Mobile-Fallback) | flex-row, gap `2rem`, `padding-left: 40vw` | gleich |

### Bento-Spans (≥768px, asymmetrisch)

- Card 1 → `grid-column: 1 / 8` (7/12)
- Card 2 → `grid-column: 8 / 13` (5/12)
- Card 3 → `grid-column: 1 / 6` (5/12)
- Card 4 → `grid-column: 6 / 13` (7/12)

Resultat: zwei Reihen mit gespiegeltem 7/5-Pattern.

### Z-Index-Skala (de facto, nicht in CSS-Variablen)

| Layer | Wert | Element |
|---|---|---|
| 0 | `0` | `#network-grid` (Canvas, Punktraster) |
| 1 | `1` | `.gradient-orb`, `.hero-brackets` |
| 2 | `2` | `<main>`, alle Content-Sections, Footer |
| 100 | `100` | `.nav` |
| 105 | `105` | `.mobile-menu` |
| 110 | `110` | `.nav-hamburger` |
| 150 | `150` | `.cursor-dot` |
| 200 | `200` | `.preloader` |
| 9999 | `9999` | `body::after` (Noise-Overlay) |
| 10000 | `10000` | `.skip-link` |

`9999`/`10000` sind hartkodiert und folgen keiner Skala. Audit-Befund.

## Surfaces & Elevation

### Glass-Card (universeller Container)

```css
background:
  radial-gradient(circle at var(--glow-x, 50%) var(--glow-y, 50%),
                  var(--card-glow, transparent) 0%, transparent 60%),
  var(--bg-card);
border: 1px solid var(--border-subtle);
border-radius: 16px;          /* ≤480px: 12px */
padding: 2.5rem;              /* ≤480px: 1.5rem */
backdrop-filter: blur(12px);
box-shadow:
  0 1px 2px rgba(0, 0, 0, 0.3),
  0 4px 16px rgba(0, 0, 0, 0.2),
  inset 0 1px 0 rgba(255, 255, 255, 0.04);
transition: border-color 0.4s ease, box-shadow 0.4s ease;
```

Hover-State:

```css
border-color: var(--border-hover);
box-shadow:
  0 1px 2px rgba(0, 0, 0, 0.3),
  0 8px 32px rgba(0, 0, 0, 0.25),
  inset 0 1px 0 rgba(255, 255, 255, 0.05);
```

Tilt-Variante (`data-tilt`): zusätzlich `transform-style: preserve-3d`, `will-change: transform`, JS-gesteuerte 3D-Rotation per Mouse-Position.

### Glow-Pointer-Tracking

`--glow-x`, `--glow-y`, `--card-glow` werden per JS auf der gehoverten Card gesetzt. Der `radial-gradient` folgt der Maus. „Spotlight-Border"-Pattern, aber als radial-glow.

### Schatten-Charakteristik

Reines Schwarz (`rgba(0,0,0,*)`), nicht zur Marineblau-Hue getintet. Inner-Edge-Highlight `rgba(255,255,255,0.04)` ist der einzige „echte" Glas-Edge-Trick. Echte Glasmorphismus-Detailtreue (selten korrekt umgesetzt — hier korrekt).

### Noise-Layer

SVG `feTurbulence`-Pattern als `body::after`, `opacity: 0.025`, `position: fixed`, `z-index: 9999`, `pointer-events: none`. Auf Contact-Inversion: `opacity: 0.015`, `filter: invert(1)`.

## Components

### Navigation

- Fixed top, `height: 72px`, `z-index: 100`.
- Default: transparent. Scrolled-State: `rgba(10,14,26,0.88)` + `backdrop-filter: blur(16px)` + Bottom-Border `rgba(255,255,255,0.06)`.
- Logo: 32×32 PNG mit `mix-blend-mode: screen`.
- Desktop-Links: `Inter 500 0.75rem uppercase 0.15em`, `--text-tertiary` default → `--text-primary` hover.
- Active-State: `.nav-link--active` = `--text-primary`.
- Hamburger (≤768px): drei `1px` Lines, mittlere Line schmaler (16px vs 24px), Akzent-Farbe.
- Mobile-Menu: Fullscreen-Overlay, `rgba(10,14,26,0.98)` + `blur(20px)`, `transform: translateX(100%) → 0` mit `cubic-bezier(0.76, 0, 0.24, 1)` 0.5s.

### Section-Divider

`200px` zentrierte Linie mit `linear-gradient(90deg, transparent, accent, transparent)`. Animiert in `transform: scaleX(0) → 1` über 0.8s on `in-view`.

### Hero (nur `index.html`)

Z-Stack:

1. `#network-grid` Canvas (Layer 0): JS-animiertes Punktraster.
2. `.gradient-orb × 3` (Layer 1): Position-fixed, `width: 450–600px`, `filter: blur(120px)`, `background: rgba(255,255,255,0.015–0.02)`. Animiert mit 45–60s `float-orb-*` Keyframes.
3. `#gradient-mesh` Canvas (Layer 0 in Hero): Mesh-Gradient, JS-gerendert.
4. `.hero-brackets`: vier 40–60px L-Brackets in Akzent mit `0.12` Alpha.
5. `.hero-monogram`: 160–180px Brain-PNG mit `mix-blend-mode: screen` und `drop-shadow` Glow. `.monogram-breathing` läuft `8s ease-in-out infinite` (`scale(1) → 1.02`).
6. `#monogram-particles` Canvas: Partikel-Effekt um Monogram.
7. `.hero-accent-line`: 100×1px gradient line, animiert `scaleX(0) → 1`.
8. `.hero-title`: „LOUWIETEC" in Inter 300 mit Letter-Spacing-Animation.
9. `.hero-tagline`: Playfair italic, JS-typed (Typing-Effekt mit `.typing-cursor` blink).
10. `.scroll-indicator`: 1×48px gradient line mit `scrollDot` 2s infinite.

Hero-Sequenz: Preloader-Split (1.2s + 0.7s) → `body.loading` entfernen → `.hero--animate` triggert Cascade aus 8 Animationen über 2.5s.

### Preloader (nur Homepage)

`z-index: 200`, Fullscreen `--bg-primary`. Monogram fade-in, Line scaleX, dann Split-Panels `translateY(±100%)` mit `cubic-bezier(0.76, 0, 0.24, 1)`.

### Bento-Grid (`approach.html`)

12-Column-Grid mit asymmetrischem 7/5-Pattern. `.bento-large` (Card 1, 4) hat zusätzliche `::before`/`::after` Corner-Brackets in `rgba(70,140,220,0.1)`. `.bento-number` (Playfair 700, 3rem, Akzent) als visuelles Zähl-Marker.

### Numbers-Section

`.numbers-card` (Glass-Card) mit `.numbers-grid` (3×2 ≥768px). `.number-value.number-reveal` startet bei `font-size: 8rem; opacity: 0.05; filter: blur(8px)` und animiert auf `font-size: 3rem; opacity: 1; filter: blur(0)` über 1.5s `cubic-bezier(0.23, 1, 0.32, 1)` on `in-view` + JS-Counter triggern.

### Horizontal-Scroll-Principles (`principles.html`)

`.principles-sticky { position: sticky; top: 0; height: 100vh }` + `.horizontal-track { display: flex; padding-left: 40vw }` mit JS-gesteuerter `transform: translateX()` on scroll. Mobile: kollabiert in vertikale Spalte (`transform: none !important`).

### Decorative-Number

Position-absolute Playfair 700 `5–10rem` mit `opacity: 0.04`, hinter Section-Headings. „01", „02" usw.

### CTA-Link (universeller Action-Style)

```css
font: 500 0.875rem/1 var(--font-body);
text-transform: uppercase;
letter-spacing: 0.1em;
color: var(--text-secondary);
border-bottom: 1px solid transparent;
padding-bottom: 2px;
transition: color 0.3s ease, border-color 0.3s ease;
```

Hover: `color: var(--text-primary); border-color: var(--accent);`

Variante `.cta-link--accent`: default-color `--accent`, hover `--accent-hover`. **Es gibt keine Buttons.** Kein Filled-Style.

### Magnetic-Hover (`data-magnetic`)

JS-gesteuert: gehoverte Elemente folgen leicht der Maus (Translate). Anwendung: Logo, Nav-Links, CTAs, Email-Link.

### Custom-Cursor

6×6px Dot in `--accent`, `position: fixed`, `z-index: 150`. Hover-Variante 24×24px in `rgba(70,140,220,0.35)`. Versteckt auf `pointer: coarse` (Touch). Auf Contact-Page invertiert (`#09090B`).

### Footer

`.site-footer`: `border-top: 1px solid rgba(255,255,255,0.04)`, `text-align: center`, `padding: 3rem 1.5rem`. Watermark: 300×300 Brain-PNG, `opacity: 0.015`, absolut zentriert. Footer-Monogram: 24×24, opacity 0.3. Footer-Links als Inline-Liste mit `·`-Separatoren.

`.inverted-footer` (nur Contact): `#F0EDE6` Background, dunkle Schrift, kein Watermark.

### Skip-Link

`top: -100% → 0` on focus, `bg: var(--accent)`, `color: var(--bg-primary)`, `z-index: 10000`. Sauber implementiert.

### Selection

```css
::selection {
  background: var(--accent);
  color: var(--bg-primary);
}
```

## Iconography

**Es gibt keine Icons.** Bewusste Abwesenheit. Stattdessen:

- `&#9670;` (Diamant-Glyphen) als Bullets in `.expect-list`.
- `→` (Unicode-Pfeil) in CTA-Links.
- `01`, `02`, `03`, `04` als Bento-Card-Marker — Typografie als Icon.
- `«` Quote-Mark in Thesis-Cards (Playfair, dekorativ).
- L-Bracket-Spans als Hero/Bento-Corner-Marker (CSS-only, keine Icon-Library).

Logo: einzelnes PNG (`assets/louwietec-brain.png`), in 24/32/80/160/180/300px-Verwendungen. Kein SVG. Kein Responsive-Source-Set.

## Motion

### Smooth-Scroll

`Lenis 1.x` per CDN (`<script src="https://cdn.jsdelivr.net/npm/lenis@1/dist/lenis.min.js" defer>`), JS-Init in `js/main.js`. Override: `html { scroll-behavior: auto; }` — natives Smooth-Scroll bewusst deaktiviert.

### Easing-Konventionen

| Use-Case | Easing | Duration |
|---|---|---|
| Reveal-Lines (Text) | `cubic-bezier(0.25, 0.1, 0.25, 1)` | 0.8s |
| Card-Tilt | `cubic-bezier(0.23, 1, 0.32, 1)` | 0.6s |
| Number-Reveal | `cubic-bezier(0.23, 1, 0.32, 1)` | 1.5s |
| Glass-Card-Hover | `ease` | 0.4s |
| Preloader-Split | `cubic-bezier(0.76, 0, 0.24, 1)` | 0.7s |
| Mobile-Menu-Slide | `cubic-bezier(0.76, 0, 0.24, 1)` | 0.5s |
| Section-Divider-Reveal | `cubic-bezier(0.25, 0.1, 0.25, 1)` | 0.8s |
| Generic `data-animate` | `ease-out` | 0.7s |
| Skip-Link-Reveal | `ease` | 0.2s |

Alle Eases sind ease-out / cubic-bezier mit langem Auslauf. **Keine Springs, kein Bounce, kein Elastic.** Konsistent mit PRODUCT.md-Prinzip 5 („generational").

### Animation-Patterns

- **Reveal-Lines:** `[data-reveal] > .reveal-line { transform: translateY(105%) }` → `0` on `in-view`. IntersectionObserver-getriggert.
- **Fade-Patterns:** `[data-animate]` → `opacity 0/1 + transform translateY(24px)/0`. Varianten: `fade-left`, `fade-right`, `fade-scale`.
- **Section-Dividers:** `transform: scaleX(0) → 1` on `in-view`.
- **Number-Counters:** JS-getriebene Count-Up, parallel zum CSS-Reveal.
- **Hero-Sequenz (Homepage):** kaskadierte Animations über 2.5s.
- **Gradient-Orbs:** `float-orb-1/2/3` Keyframes, 45–60s, infinite, ease-in-out. Translate ±80px in vier Phasen.
- **Monogram-Breathing:** `scale(1) ↔ 1.02` + `drop-shadow` color-shift, 8s, infinite.
- **Scroll-Indicator-Dot:** `top: 4 → 44px` + opacity-cycle, 2s, infinite.
- **Cursor-Dot:** `width / height / opacity` transition 0.3s on hover.
- **Magnetic-Hover:** JS-Translate basierend auf Maus-Distanz.
- **Card-Tilt:** JS-Mouse-zu-3D-Rotation (`transform-style: preserve-3d`).
- **Card-Glow:** `--glow-x/y/--card-glow` JS-getrieben, `radial-gradient` folgt der Maus.

### Animation-Property-Hygiene

Alle Animationen nutzen `transform` und `opacity` (GPU-accelerated). Kein animiertes `top`/`left`/`width`/`height` für Performance-Pfade. **Eine Ausnahme:** `.scroll-indicator-dot` animiert `top` — vernachlässigbar, ein Element.

### `prefers-reduced-motion`

**Aktuell nicht respektiert.** Audit-Pflichtbefund. Betroffen: Preloader, Reveal-Lines, Monogram-Breathing, Gradient-Orbs, Mesh-Canvas, Cursor-Dot, Number-Reveal, Section-Divider, Tilt, Magnetic, Lenis-Smooth-Scroll. PRODUCT.md verlangt Behebung als A11y-Pflicht.

## Accessibility-IST-Zustand

| Aspekt | Status |
|---|---|
| `lang`-Attribut | `en` pauschal auf allen Pages |
| Skip-Link | ✓ vorhanden, focus-revealed |
| ARIA-Labels | ✓ auf Nav, Buttons, dekorativen Layern (`aria-hidden`) |
| `:focus-visible` Custom-Style | ✗ kein Custom-Style; Browser-Defaults |
| `prefers-reduced-motion` | ✗ nicht implementiert |
| `font-variant-numeric: tabular-nums` | ✗ nicht in Numbers-Section |
| Kontrast `--text-secondary` auf `--bg-primary` | grenzwertig (~4.4:1, knapp unter AA) |
| Print-Stylesheet | ✓ vorhanden, sinnvoll |
| `<html lang>` korrekt | ✗ pauschal `en`, DE-Version geplant |
| Schema.org Strukturdaten | ✓ ausführlich (Organization, LocalBusiness, Person, Service, BreadcrumbList) |
| Sub-Page-Indexierung | `noindex` bewusst (siehe unten) |

## Build & Asset-Pipeline (IST)

| Aspekt | Status |
|---|---|
| `package.json` | Tailwind v4 als devDependency, Build-Script `tailwindcss -i src/input.css -o css/output.css --minify` |
| `src/input.css` | 9 Zeilen |
| `css/output.css` | **1 Zeile, faktisch leer** — Tailwind wird nicht genutzt |
| `css/styles.css` | 2346 Zeilen handgeschriebenes Vanilla-CSS — de-facto-Quelle |
| `js/main.js` | 737 Zeilen (Lenis-Init, Network-Grid, Gradient-Mesh, Particles, Cursor, Magnetic, Tilt, Reveals, Number-Counter, Mobile-Menu, Hero-Sequenz, Page-Transitions) |
| Fonts | Google Fonts CDN — Audit-Befund: DSGVO-Risiko, sollte self-hosted |
| Lenis | jsdelivr CDN |
| Build-Time | nicht relevant (statisches HTML, kein SSG) |
| Deployment | nginx (`nginx.conf`, `Dockerfile`, `docker-compose.yml`) auf eigenem Host (CNAME `louwietec.com`) |

## Page-Inventar

| Page | Sections (in Reihenfolge) |
|---|---|
| `index.html` | Preloader → Hero → Thesis (glass-card) → Intro → Numbers → CTA → Footer |
| `about.html` | Page-Header → Story (split, glass-card) → Thesis (glass-card) → Built-for-Enterprise (`enterprise-grid` 2×2) → Founder → CTA → Footer |
| `approach.html` | Page-Header → The-Model (split, glass-card) → How-It-Works (4-card bento, asymmetrisch 7/5) → Capabilities (3×2 grid) → Numbers → CTA → Footer |
| `principles.html` | Page-Header → Thesis → Three-Principles (horizontal-scroll-pinning) → Trust → CTA → Footer |
| `contact.html` | **Light-Inversion** Page-Header → Contact-Info → What-to-Expect (Diamant-Bullets) → Closing → Inverted-Footer |
| `impressum.html` | reduzierte Layout, dark, nur Text + Back-Link |

## Sub-Page-Indexierung — Strategie, nicht Bug

`<meta name="robots" content="noindex, follow">` auf `about.html`, `approach.html`, `principles.html`, `contact.html`. **Bewusste Boutique-Strategie**, festgeschrieben in `PRODUCT.md` Prinzip 2. Nur `index.html` ist `index, follow`. Wer die Sub-Pages findet, findet sie über persönliche Empfehlung oder direkten Link, nicht über Google.

Tradeoff: die Sub-Pages tauchen nicht in Google-Site-Searches auf. Wer „LOUWIETEC About" googelt, findet die Homepage, klickt sich von dort. Akzeptierter Effekt.
