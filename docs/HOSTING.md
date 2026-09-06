# Hosting- und Pages-Fakten (Phase 0, Stand 2026-09-05)

Dieses Dokument hält fest, wie die Website ausgeliefert wird und was vor dem Neubau
vorgefunden wurde. Es wurde **nichts an den Pages-Einstellungen verändert.**

## GitHub Pages

| Punkt | Befund | Beleg |
|---|---|---|
| Quelle | Pages liefert den **Root des Branches `main`** aus (Legacy-Modus „Deploy from a branch“, Workflow `pages-build-deployment`, Jekyll-Build) | Live-`ETag: "6a84501b-4cbd"` → 0x4cbd = 19 645 Byte = exakt `index.html` auf `main@922ab41`; letzter Pages-Run #34 (head 922ab41, success, 2026-08-18) |
| Einstellungs-API | `GET /repos/…/pages` ist aus der Session-Umgebung nicht abrufbar (Proxy 403) | Branch/Ordner daher über den Inhalt belegt, nicht über die Einstellung selbst |
| Eigene Workflows | **keine** (`.github/` existiert nicht) | Dateiliste |
| `.nojekyll` | **nicht vorhanden** → Pages führt derzeit den Jekyll-Build aus; wird in Phase 1 angelegt (statische Site, kein Jekyll nötig) | Dateiliste |
| `README.md` | nicht vorhanden; entsteht in Phase 1 | Dateiliste |

## Domain

| Punkt | Befund |
|---|---|
| `CNAME` | `louwietec.com` (ohne abschließenden Zeilenumbruch) — **unverändert übernommen** |
| DNS Apex | 185.199.108.153 (GitHub Pages) |
| `https://louwietec.com/` | HTTP/2 200, `server: GitHub.com`, HTTPS aktiv |
| `https://www.louwietec.com/` | 301 → `https://louwietec.com/` |
| `https://louis-wieshofer.github.io/Louwietec-homepage-2026/` | 301 → `https://louwietec.com/` |

## Repository-Zustand vor dem Neubau

- `main` = `922ab41` („Add files via upload“, 2026-08-18). Alte Site: `index.html`, `about.html`, `approach.html`, `principles.html`, `contact.html`, `impressum.html`, `privacy.html`; Tailwind-Build (`package.json`, `src/input.css`, `css/output.css`); Docker/nginx/compose (Coolify-Relikte); Fonts Inter + Playfair; i18n EN/DE über `?lang=de` + localStorage; `ORBIT Launchfilm.mp4` (15,3 MB); Alt-Dokumente DESIGN.md, PRODUCT.md, WEBSITE-TEXTE.md, LOUWIETEC_Website_Texte_DE.md.
- Weitere Remote-Branches: `claude/fix-github-pages-assets-Calcz` (PR #1, geschlossen, nicht gemerged), `claude/floating-brain-logo-lb1W5`.
- Keine Tags.
- Erhalten: `CNAME`, `.gitignore`, `IMG_0707.png` (Volllogo 1536×1024), `IMG_0710.png` (Icon 1024×1024), `assets/louwietec-brain.png`, `assets/og-image.png` (alte Pfade bleiben bis zur Umstellung).
- SEO-Altbestand, der übernommen wird: Google-Site-Verification-Meta-Tag (Search-Console-Zugang).

## Archiv

- Branch `archive/website-v1-2026-08` = `main@922ab41`, gepusht, `git diff main archive/website-v1-2026-08` leer. **Wird nie wieder angefasst.**
- Tag `website-v1-final` auf `922ab41` lokal angelegt (annotiert). **Push des Tags wurde vom Egress-Proxy der Session mit HTTP 403 auf `git-receive-pack` für `refs/tags/*` verweigert** (Branch-Pushes funktionieren). Der Tag muss von Louis gesetzt werden:
  ```bash
  git fetch origin main
  git tag -a website-v1-final 922ab41184f4a2ae586bef1fe35f0dd00d36bbda -m "Website v1 (2026-04 bis 2026-08), archiviert vor Neubau"
  git push origin website-v1-final
  ```
  Alternativ über GitHub → Releases → „Draft a new release“ → Tag `website-v1-final` auf Commit `922ab41`.

## Backend-Erreichbarkeit (Vertrag v1)

| Host | DNS | TLS-Befund (2026-09-05) |
|---|---|---|
| `web.service.louwietec.com` | 65.21.153.22 | `CN = TRAEFIK DEFAULT CERT` (selbstsigniert, gültig 2026-08-17 bis 2027-08-17) |
| `analytics.service.louwietec.com` | 65.21.153.22 | `CN = TRAEFIK DEFAULT CERT` (selbstsigniert) |

Browser lehnen dieses Zertifikat ab. Bis Session 2 gültige Zertifikate (Let's Encrypt über Coolify/Traefik) einrichtet, ist weder `GET /healthz` noch der Mock-Modus aus einer Website heraus erreichbar. Entwicklung und Tests der Anbindung laufen bis dahin gegen eine Playwright-Route-Interception (Testdouble, kein Server-Code im Repo).

## Redirect-Karte (Umsetzung ab Phase 5, als Meta-Refresh-Stubs mit `<link rel="canonical">`)

| Alte URL | Neue URL | Quelle |
|---|---|---|
| `/about`, `/about.html` | `/ueber-uns/` | Orchestrierung §8 |
| `/approach`, `/approach.html` | `/` | §8 |
| `/principles`, `/principles.html` | `/ueber-uns/` | §8 |
| `/contact`, `/contact.html` | `/kontakt/` | §8 |
| `/en/…` | DE-Seite (`/en/index.html` + JS-Map in `404.html`; `/en/…` existierte in v1 nie, v1 nutzte `?lang=de`) | §8, Vorschlag |
| `/impressum.html` | `/rechtliches/impressum/` | Vorschlag (nicht in §8) |
| `/privacy.html` | `/rechtliches/datenschutz/` | Vorschlag (nicht in §8) |

Hinweis: GitHub Pages liefert `about.html` sowohl für `/about` als auch für `/about.html`; die Stubs sind daher flache Dateien.
