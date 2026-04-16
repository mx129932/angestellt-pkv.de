# Design-Freeze — PKV-Angestellte

**Status:** ❄️ EINGEFROREN — ab 2026-04-15, nach Approval von Max.

Ab jetzt werden am visuellen Design **keine Änderungen mehr vorgenommen**. Was fließt
in neue Seiten ein: **nur Inhalte** (Texte, Bilder, Fakten, FAQ-Listen, Rechner-Logik).

---

## Eingefrorene Artefakte

Nicht mehr anfassen ohne expliziten Freigabe-Request von Max:

| Datei | Rolle |
|---|---|
| `src/layouts/Base.astro` | Globales HTML-Gerüst, Header/Footer, Meta |
| `src/components/Header.astro` | Sticky-Nav, Branding `PKV · für Angestellte` |
| `src/components/Footer.astro` | 4-spaltiger Footer |
| `src/pages/index.astro` | Homepage (custom, **nicht** T1) |
| `src/layouts/CategoryHub.astro` | Kategorie-Hub-Layout (ersetzt T3 für Hubs) |
| `src/components/ArticleCard.astro` | Artikel-Teaser |
| `src/components/TopicCard.astro` | Kategorie-Teaser |
| `src/components/RechnerEmbed.astro` | iFrame-Wrapper für Rechner |
| `src/components/FAQAccordion.astro` | CSS-only FAQ-Akkordeon |
| `src/components/CTABlock.astro` | Full-width Navy-CTA |
| `src/components/Breadcrumbs.astro` | Breadcrumb-Trail mit JSON-LD |
| `tailwind.config.mjs` | Farben, Fonts, Token-System |

**Farb-Tokens (nicht mehr ändern):**
- `primary` = `#002046` (Navy)
- `amber-accent` = `#D4A017`
- `amber-accent-dark` = `#B8860B`
- Background-Surface = `#FAF7F2`
- Schriften: `font-serif` = Newsreader, Body = Inter

**Abstände / Radien / Shadows:** folgen den Utility-Klassen, die in den o. g.
Komponenten bereits in Verwendung sind. Keine neuen Shadow-/Radius-Werte
einführen — bestehende wiederverwenden.

---

## Was noch erlaubt ist

- **Content in Kategorie-Hubs**: `intro`, `keyword`, `faq`, `readingTime` per Props.
- **Neue Artikel-Seiten**: nur mit dem noch zu bauenden `ArticlePage.astro`-Layout
  (Phase 3), nicht per Template-Copy.
- **Neue Rechner**: innerhalb des `rechner-tools/`-Ordners, Einbindung via
  `RechnerEmbed`-Komponente.
- **Fakten-Updates** in `src/data/fakten-2026.json` (wenn angelegt).
- **ia.json-Erweiterung** um neue Seiten (Zeilen hinzufügen).

## Was NICHT mehr erlaubt ist

- Neue `<style>`-Blöcke oder Inline-Styles in Seiten.
- Neue Tailwind-Utilities außerhalb des bestehenden Token-Sets.
- Eigenmächtige Layout-Varianten pro Seite — wenn eine Seite nicht ins Schema
  passt: **STOP und Freigabe einholen**, nicht improvisieren.
- Änderungen an T1–T7 (sind Stitch-Vorlagen, aktuell nicht mehr aktiv verwendet
  außer T2/T4/T5/T6/T7 für Subpages — kommen als nächstes dran).

---

## Re-Opening

Wenn Max einen neuen Design-Durchgang wünscht:
1. Ansage im Chat, welcher Teil aufgetaut wird (z. B. "Footer öffne ich").
2. Änderung in **genau einer** Komponente.
3. Screenshot-Review durch Max.
4. Diese Datei aktualisieren (Datum + Vermerk).

---

## Freeze-Entscheidungen (Log)

- **2026-04-15** — Home-Design final nach Runde 1 (Badge fix, FAQ klickbar,
  Mobile-Reorder Hero, Rechner-Teaser statt Live-Rechner, Kategorien aus ia.json,
  Abschnitt umbenannt, Meta-Info aus Expertise-Teasern entfernt).
- **2026-04-15** — CategoryHub-Layout final nach Runde 1 (Kapitel-Chip raus,
  Meta in Sidebar, "Mehr zu [Keyword]", kompakte Kacheln mit Icon, CTA + FAQ
  unten, Mobile-Breadcrumb-Spacing, Mobile-1-Spalten-Grid).
- **2026-04-15** — CategoryHub Runde 2: Sidebar-Umbau → Meta-Block, "Artikel"-
  Label und TOC entfernt; stattdessen "Beliebte Rechner" (3 Teaser) + Mini-CTA
  auf `/beratung/` umgestellt. Kachelhöhe via `h-full` + `auto-rows-fr` +
  `min-h-[92px]` vereinheitlicht.
- **2026-04-15** — CategoryHub Runde 3: Beratungs-CTA aus Sidebar raus, ersetzt
  durch About-Teaser (Team-Foto 4:3, "Warum dieses Portal existiert",
  "Mehr über uns erfahren" → `/ueber-uns/`).
- **2026-04-15** — CategoryHub Runde 4 (final): Sidebar-Headlines responsiv —
  Mobile als vollwertige `font-serif text-2xl` Content-Headlines (analog
  "Häufige Fragen"), Desktop als 10px Uppercase-Micro-Labels. Zusätzliche
  "Über uns"-Headline über dem About-Teaser (ersetzt das interne "About"-Label).
  ✅ CategoryHub final eingefroren.
- **2026-04-15** — Template-Harmonisierung (Beitrag T6, Rechner T5):
  Einheitliche Container-Breite `max-w-6xl`, Breadcrumb-Position `pt-6 md:pt-10`,
  H1-Block-Abstand `py-8 md:py-12` auf CategoryHub, T5 und T6 identisch. Content
  "hüpft" beim Template-Wechsel nicht mehr. T4 (Ueber-uns) weicht bewusst ab
  (eigener Hero-Aufbau). Home weicht ebenfalls bewusst ab.
- **2026-04-15** — T6 (Beitrag) Rework: Bild -20% (aspect-4/3 statt 450px fix),
  Mobile-Grid korrigiert (grid-cols-1 lg:grid-cols-12, min-w-0 auf allen Spalten,
  overflow-x-auto auf Tabelle), Sidebar: TOC mit Scrollspy (IntersectionObserver,
  aktiver Link fett + amber-Border + 4px-Balken), "Meistgelesen" → "Beliebte
  Rechner", CTA neu (Beratung-Card mit amber-Button statt broken Button).
  Sidebar-Headlines harmonisiert (responsive: mobile h2, desktop micro-label).
- **2026-04-15** — T5 (Rechner) Angleichung: Breadcrumb + H1 + Intro ergänzt
  (parentCrumb/parentHref als Props), Container auf max-w-6xl, Result-Panel
  vereinfacht und in Brand-Tokens übersetzt (bg-primary, bg-amber-accent).
- **2026-04-15** — T6 (Beitrag) Final: Bild weiter verkleinert (lg:col-span-4,
  aspect-4/3), Sidebar links (lg:order-1, lg:col-span-4), Artikel rechts
  (lg:order-2, lg:col-span-8). Lead-Blockquote entfernt. "Für dich
  zusammengefasst" (id=zusammenfassung) als erstes Element im Artikel + erster
  TOC-Eintrag. 3er-Teaser-Grid "Weiterlesen" am Ende. Bottom-Inline-CTA raus.
  MOBILE: TOC direkt unter Bild (erste Sektion im Artikel), Beliebte-Rechner in
  Mitte, Beratung-CTA ganz am Ende. Scrollspy observiert Desktop + Mobile TOC
  parallel via `.toc-root .toc-link`.
- **2026-04-15** — T5 Nachtrag: Modul 1 "Noch Fragen" CTA (navy + amber,
  analog T6-Beratungsblock) + Modul 2 "Weitere Rechner" (3-Teaser-Grid analog
  T6-Weiterlesen) als feste Bestandteile unter jedem Rechner-Body eingebaut.
  Teaser-Daten aktuell Dummy im Template, später aus ia.json.
- **2026-04-15** — T2 (Conversion) Neubau für /beratung/ + /pkv-angestellte/:
  Top-Whitespace reduziert (pt-6 md:pt-10 statt pt-24), Hero-Bild mit
  Trust-Overlays (4,9/5 Bewertung + 15+ Jahre Erfahrung als Floating-Badges
  mit Star/workspace_premium-Icons), neue Module "So läuft eine Beratung bei
  uns ab" (4-Step-Ablauf mit Nummer-Badges) und "Unser Versprechen"
  (6-Kachel-Grid mit Icons: Provisionen/Daten/Spam/Quellen/Antwortzeit/
  Abschlusspflicht). Brand-Tokens durchgezogen (bg-primary, bg-amber-accent,
  font-serif, "du"-Ansprache). Props: headline/headlineAccent/lead/advisorName
  für Seitenvarianten.
- **2026-04-15** — Finaler Konsistenz-Pass über alle Templates:
  (a) T4 komplett neu im Brand-System: Stitch-Export ersetzt, max-w-6xl,
  pt-6 md:pt-10 Breadcrumb, alternierende Hintergründe
  (#FAF7F2 → white → #FAF7F2 → white), Brand-Tokens durchgezogen
  (amber-accent-dark statt brand-amber, font-serif statt serif), "du"-Ansprache.
  Team-Karten, Prinzipien-Grid, Quellen-Liste und Kontakt-CTA harmonisiert.
  (b) Home: About-Teaser von white auf #FAF7F2 umgestellt, damit FAQ (white)
  und About nicht adjazent gleich hinterlegt sind. Restliche "Sie"/"Ihre"-
  Residuen in H1 + FAQ-Intro + Kategorien-H2 auf "du" korrigiert.
  (c) T2 FAQ-Widget von <details>/<summary> auf peer-checkbox-Pattern
  umgestellt — identisch zu Home/CategoryHub (add-Icon + rotate-45).
  (d) T2 Mobile-Reihenfolge Hero korrigiert: links (H1 + Lead + USPs) zuerst,
  rechts (Bild + CTA) danach — vorher umgekehrt.
- **2026-04-15** — 🧊 FINALER FREEZE aller Basis-Templates: Home, CategoryHub
  (8 Kategorieseiten), Sitemap, T4 (About-us), T5 (Rechner, 10 Seiten),
  T6 (Beitrag, alle Artikelseiten). 7 Artikelseiten von T5 auf T6 korrigiert
  (absicherung/krankentagegeld, familie/elternzeit, kosten/altersrueckstellung,
  kosten/arbeitgeberzuschuss, kosten/pkv-kosten-uebersicht,
  kosten/selbstbeteiligung, wechsel/tarifwechsel-204). Alle Layouts bedürfen ab
  jetzt expliziter Freigabe vor jeder Änderung.
