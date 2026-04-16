# PKV-Angestellt — Website V2

Astro-Projekt für `test.angestellt-pkv.de` (Test) und später `angestellt-pkv.de` (Live).
Hoster: all-inkl (KasServer).

> ❄️ **Design eingefroren seit 2026-04-15** — siehe [DESIGN-FREEZE.md](./DESIGN-FREEZE.md).
> Ab jetzt werden nur noch Inhalte ergänzt, keine Layout-/Farb-/Komponenten-Änderungen.

## Struktur

- `src/layouts/Base.astro` — HTML-Shell, Meta, Font-Imports
- `src/layouts/T1.astro` … `T7.astro` — die 7 Stitch-Templates 1:1 aus `2_Design-Input/templates/*/code.html`
- `src/pages/**` — 63 Routen aus `1_IA-und-Fakten/IA_v2.xlsx`, jede nutzt das in der IA zugewiesene Template
- `src/styles/global.css` — Tailwind-Base + selbst gehostete Fonts (Inter, Newsreader via `@fontsource/*`)
- `tailwind.config.mjs` — alle Farbtokens aus dem Stitch-Export (Primary Navy #002046)
- `scripts/upload.js` — FTP-Deploy inkrementell mit MD5-Manifest (Test-Default, `--live` für Live)
- `scripts/quality-gate.js` — Check vor Deploy
- `scripts/config.json` — FTP-Zugang (gitignored, Vorlage: `config.json.example`)

## Workflow

```bash
npm install
npm run dev              # lokale Vorschau auf http://localhost:4321
npm run build            # dist/ erzeugen
npm run quality          # Quality-Gate
npm run deploy:test      # Test-Deploy (inkrementell, nur Änderungen)
npm run deploy:test:dry  # Dry-Run: zeigt was passieren würde
npm run deploy:test:full # Vollständiger Upload (ignoriert Manifest)
npm run deploy:live      # Live-Deploy (mit Bestätigungsabfrage)
```

Direktaufruf mit Flags ist auch möglich:

```bash
node scripts/upload.js --dry-run
node scripts/upload.js --no-delete
node scripts/upload.js --full
```

## Deploy-Features

- **Inkrementell**: Nur geänderte Dateien (MD5-Vergleich)
- **Auto-Cleanup**: Lokal gelöschte Dateien werden auch vom Server entfernt
- **Sicherheitslimit**: > 50 Löschungen brauchen Bestätigung
- **Separate Manifeste** für Test und Live (`.upload-manifest-test.json` / `-live.json`)
- **Dry-Run** zeigt Plan ohne Aktion
- **LIVE** nur mit `--live` + Tastatur-Bestätigung

## Setup FTP

`scripts/config.json` aus `config.json.example` ableiten und FTP-Daten eintragen. Die Datei ist gitignored.

## Passwortschutz Testumgebung

Bei all-inkl: im KAS-Panel unter „Verzeichnisschutz" für `/test.angestellt-pkv.de/` anlegen (User + Passwort). Kein `.htaccess` im Projekt — macht der Hoster.

## Footprint-Regeln

- Fonts selbst gehostet (kein Google-Fonts-Link im Build)
- Eigene CSS-Klassennamen, kein Re-Use aus selbststaendig-pkv.de
- `robots.txt` auf `Disallow: /` (Test) — vor Live-Deploy umstellen
- Separater FTP-User gegenüber selbststaendig-pkv
