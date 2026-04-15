# PKV-Angestellt — Website V2

Astro-Projekt für `test.pkv-angestellt.de` (Test) und später `pkv-angestellt.de` (Live).

## Struktur

- `src/layouts/Base.astro` — HTML-Shell, Meta, Font-Imports
- `src/layouts/T1.astro` … `T7.astro` — die 7 Stitch-Templates 1:1 aus `2_Design-Input/templates/*/code.html`
- `src/pages/**` — 63 Routen aus `1_IA-und-Fakten/IA_v2.xlsx`, jede nutzt das in der IA zugewiesene Template
- `src/styles/global.css` — Tailwind-Base + selbst gehostete Fonts (Inter, Newsreader via `@fontsource/*`)
- `tailwind.config.mjs` — alle Farbtokens aus dem Stitch-Export (Primary Navy #002046, Tertiary #00261c, Hanseatic-Surfaces)
- `scripts/upload.js` — FTP-Deploy (Test-Default, `--live` für Live)
- `scripts/quality-gate.js` — Check vor Deploy (Routen, Footprint, Lorem-Ipsum)

## Workflow

```bash
npm install
npm run dev              # lokale Vorschau auf http://localhost:4321
npm run build            # dist/ erzeugen
npm run quality          # Quality-Gate
npm run deploy:test      # Test-Deploy (test.pkv-angestellt.de)
npm run deploy:live      # Live-Deploy (NUR mit expliziter Freigabe)
```

`.env` aus `.env.example` ableiten und mit echten FTP-Daten füllen. `.env` ist in `.gitignore`.

## Footprint-Regeln

- Fonts sind selbst gehostet (kein Google-Fonts-Link im Build, außer Material Symbols als Übergang)
- Eigene CSS-Klassennamen, kein Re-Use aus selbststaendig-pkv.de
- `robots.txt` auf `Disallow: /` (Test) — vor Live-Deploy umstellen
- Separater FTP-User / Pfad (siehe STATUS.md)

## Update der Templates

Wenn Max neue Stitch-Exports in `2_Design-Input/templates/` legt, müssen die Layouts/Pages neu generiert werden. Die Generator-Scripts liegen unter `_design/` (außerhalb des Repos).
