/**
 * PKV-Angestellt — Bildgenerierung via OpenAI GPT Image 1
 * ========================================================
 *
 * Aufruf (von 7_Website-V2/ aus):
 *   node scripts/generate-images.js --list
 *   node scripts/generate-images.js --only hero-home
 *   node scripts/generate-images.js --only-first 5
 *   node scripts/generate-images.js
 *   node scripts/generate-images.js --export-alt
 *
 * Voraussetzung (einmalig):
 *   npm install openai       (bereits in package.json)
 *   API-Key in .env:  OPENAI_API_KEY=sk-...
 *
 * Stil: Aquarell — Navy #002046, Sage Green, Amber #D4A017,
 * Cream-Papier-Hintergrund. Kein Text, keine Personen.
 * Referenz: 3_Content-Briefings/BILDERBRIEFING.md
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execFileSync } from "child_process";
import OpenAI from "openai";

// --- Pfade (Script liegt in 7_Website-V2/scripts/) ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const WEBSITE_ROOT = join(__dirname, "..");
const OUTPUT_DIR = join(WEBSITE_ROOT, "public", "img");
mkdirSync(OUTPUT_DIR, { recursive: true });

// --- .env laden ---
const envPath = join(WEBSITE_ROOT, ".env");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const [k, ...rest] = trimmed.split("=");
      process.env[k.trim()] = rest.join("=").trim();
    }
  }
}

const client = new OpenAI();

// === GLOBAL STIL-SUFFIX (Aquarell) ===
const STYLE_SUFFIX = [
  "Delicate watercolor painting on visible textured cream paper.",
  "Loose expressive brushstrokes with visible pigment diffusion and soft edges.",
  "Warm muted palette: deep navy, sage green, amber gold accents.",
  "Areas of white paper left intentionally unpainted.",
  "Artistic and handmade, like a thoughtful editorial magazine illustration.",
  "No hyperrealism, no photorealism.",
  "No text, no letters, no numbers, no logos, no recognizable faces.",
].join(" ");

// === BILDQUEUE ===
const IMAGES = [
  // ─── STARTSEITE ───
  {
    id: "hero-home",
    size: "1024x1024",
    prompt:
      "A compass rose painted in loose watercolor strokes, its needle pointing forward. Around it, gentle paths radiate outward in different directions, each in a slightly different tone (navy, sage, amber). The composition feels like standing at a starting point with many possibilities ahead. Warm light from above.",
    alt: "Aquarellierte Kompassrose mit ausstrahlenden Wegen in Navy, Sage und Amber auf Papierstruktur.",
  },

  // ─── HUB-SEITEN ───
  {
    id: "hero-hub-grundlagen",
    size: "1536x1024",
    prompt:
      "An open book lying flat, its pages fanning out in loose watercolor washes. From the pages, soft shapes emerge upward like growing knowledge: a small shield, a balance scale silhouette, branching paths. Navy and sage tones with amber highlights on key elements.",
    alt: "Aufgeschlagenes Buch in Aquarell, aus dessen Seiten Schild, Waage und Pfade emporwachsen.",
  },
  {
    id: "hero-hub-wechsel",
    size: "1536x1024",
    prompt:
      "A figure silhouette standing at a crossroads where two paths diverge. One path flows in sage green toward an open gateway, the other curves back in navy. At the fork, warm amber light illuminates the decision point. Loose brushstrokes blur the paths into the paper texture.",
    alt: "Silhouette an einer Weggabelung, ein Pfad in Sage zum Tor, einer in Navy zurueck, Amber am Scheideweg.",
  },
  {
    id: "hero-hub-kosten",
    size: "1536x1024",
    prompt:
      "A balance scale in loose watercolor strokes, one side holding layered coins or discs in amber, the other side holding a protective shield in navy. The scale tips slightly but is held in equilibrium by a sage-colored support beneath. The composition suggests weighing cost against protection.",
    alt: "Aquarellierte Waage mit Amber-Muenzen auf einer Seite und Navy-Schild auf der anderen, Sage-Stuetze.",
  },
  {
    id: "hero-hub-leistungen",
    size: "1536x1024",
    prompt:
      "Four puzzle pieces in different colors (navy, sage, amber, cream with navy outline) fitting together to form a shield shape. Each piece has a distinct texture and brushstroke style, suggesting different coverage areas combining into complete protection. Loose watercolor with visible paper grain.",
    alt: "Vier Puzzleteile in Navy, Sage, Amber und Cream fuegen sich zu einem Schild zusammen, Aquarell.",
  },
  {
    id: "hero-hub-aufnahme",
    size: "1536x1024",
    prompt:
      "A doorway slightly ajar with warm amber light streaming through the gap. On this side, a figure silhouette approaches with careful steps. The door frame is painted in navy, the surrounding wall in soft sage. The mood is cautious optimism, approaching an important process.",
    alt: "Halboffene Tuer mit Amber-Licht, Silhouette naehert sich vorsichtig, Navy-Rahmen und Sage-Wand.",
  },
  {
    id: "hero-hub-absicherung",
    size: "1536x1024",
    prompt:
      "A protective umbrella rendered in navy watercolor strokes, sheltering three smaller elements beneath it: a clock (time/waiting), a small figure silhouette, and a cradle shape. Amber accents on the umbrella handle and edges. Sage green ground beneath. The composition conveys multi-layered protection.",
    alt: "Navy-Regenschirm in Aquarell schuetzt Uhr, Figur und Wiege, mit Amber-Akzenten auf Sage-Grund.",
  },
  {
    id: "hero-hub-familie",
    size: "1536x1024",
    prompt:
      "A large protective silhouette (parent) with arms extended, sheltering two smaller silhouettes (children) beneath. The parent figure is painted in navy, the children in lighter sage tones. Warm amber light glows between them, connecting parent and children. Loose, tender brushstrokes on cream paper.",
    alt: "Grosse Navy-Silhouette schuetzt zwei kleinere Sage-Figuren, Amber-Licht verbindet sie, Aquarell.",
  },
  {
    id: "hero-hub-lebenssituationen",
    size: "1536x1024",
    prompt:
      "A winding path seen from above, passing through different landscape zones: a structured navy area (employment), a green sage meadow (transition), an amber-lit clearing (new beginnings). The path is continuous and never breaks. Loose aerial-view watercolor with visible paper texture beneath.",
    alt: "Gewundener Pfad von oben durch verschiedene Landschaftszonen in Navy, Sage und Amber, Aquarell.",
  },
  {
    id: "hero-hub-rechner",
    size: "1536x1024",
    prompt:
      "An abacus or counting frame rendered in loose watercolor, its beads in navy, sage, and amber sliding along horizontal bars. The frame is simple and elegant, suggesting calculation and comparison. Soft shadows and pigment diffusion. Cream paper background.",
    alt: "Aquarellierter Abakus mit Kugeln in Navy, Sage und Amber auf horizontalen Stangen, Papierstruktur.",
  },

  // ─── SONDERSEITEN ───
  {
    id: "hero-ueber-uns",
    size: "1536x1024",
    prompt:
      "Three abstract figure silhouettes standing side by side, each in a slightly different tone (navy, sage, muted amber). They cast long, confident shadows on cream ground. The composition suggests a team standing together with clarity and purpose. Loose, expressive watercolor strokes.",
    alt: "Drei abstrakte Silhouetten in Navy, Sage und Amber nebeneinander mit langen Schatten, Aquarell.",
  },
  {
    id: "hero-glossar",
    size: "1536x1024",
    prompt:
      "An open dictionary or reference book seen from above, its pages fanning out. Small abstract symbols and shapes float above the pages like ideas taking form: tiny shields, keys, scales, paths. Navy ink for the book, sage and amber for the floating elements. Loose, scholarly watercolor.",
    alt: "Offenes Nachschlagewerk von oben, darueber schweben kleine Symbole in Sage und Amber, Aquarell.",
  },

  // ─── ARTIKEL: KOSTEN (9) ───
  {
    id: "hero-kosten-arbeitgeberzuschuss",
    size: "1536x1024",
    prompt:
      "Two hands reaching toward each other from opposite sides. The larger hand in navy (employer) passes a golden shield to the smaller hand in sage (employee). Warm amber light glows where the shield changes hands. The gesture is generous and supportive. Loose watercolor brushstrokes on cream paper.",
    alt: "Grosse Navy-Hand reicht goldenen Schild an kleinere Sage-Hand, Amber-Licht beim Uebergeben, Aquarell.",
  },
  {
    id: "hero-kosten-altersrueckstellung",
    size: "1536x1024",
    prompt:
      "A growing tree painted in navy trunk with sage leaves, its roots forming layers beneath the ground in amber tones suggesting accumulated reserves. The deeper the roots, the richer the amber glow. Above ground the tree stands stable and sheltering. Metaphor: long-term growth creates stability.",
    alt: "Aquarellbaum mit Navy-Stamm und Sage-Blaettern, Amber-leuchtende Wurzelschichten als Rueckstellungen.",
  },
  {
    id: "hero-kosten-beitragsanpassung",
    size: "1536x1024",
    prompt:
      "Two gentle hills or waves rising from left to right. The larger wave in sage (GKV increases) rises steeper, the smaller wave in navy (PKV adjustments) rises more gradually. Amber highlights mark the crests. The composition shows both go up, but at different rates. Loose watercolor landscape feeling.",
    alt: "Zwei ansteigende Wellen in Sage und Navy, die groessere steiler, Amber-Akzente an den Kuppen.",
  },
  {
    id: "hero-kosten-gkv-hoechstbeitrag",
    size: "1536x1024",
    prompt:
      "A ceiling or lid painted in sage green pressing down from above, while amber pressure pushes up from below. The space between is painted in navy, representing the squeeze of maximum contribution rates. The lid has visible weight. Metaphor: a cap that keeps rising higher each year.",
    alt: "Sage-Deckel drueckt von oben, Amber-Druck von unten, Navy-Zwischenraum wird enger, Aquarell.",
  },
  {
    id: "hero-kosten-gkv-zusatzbeitrag",
    size: "1536x1024",
    prompt:
      "A stack of watercolor layers, the base layer solid and steady in sage (Grundbeitrag), topped by an additional layer in amber that grows thicker toward the right side of the frame (rising Zusatzbeitrag). Small variations in the amber layer suggest differences between insurers. Navy accents at the edges.",
    alt: "Sage-Grundschicht mit wachsender Amber-Zusatzschicht darauf, Variationen sichtbar, Aquarell.",
  },
  {
    id: "hero-kosten-pkv-im-alter",
    size: "1536x1024",
    prompt:
      "An elderly figure silhouette walking a downhill path that becomes lighter and warmer. Three supporting pillars along the path in navy, sage, and amber (the three relief mechanisms). The figure appears unburdened, the path ahead is illuminated. Loose, gentle watercolor.",
    alt: "Aeltere Silhouette auf abwaerts hellerem Weg, drei Stuetzpfeiler in Navy, Sage und Amber, Aquarell.",
  },
  {
    id: "hero-kosten-pkv-kosten-uebersicht",
    size: "1536x1024",
    prompt:
      "A layered cross-section like geological strata, each layer a different cost component: navy base (Grundbeitrag), sage layer (Pflegepflicht), thin amber stripe (Zuschlaege), cream top (what you actually pay net). The layers are clearly distinct but form one unified structure. Loose watercolor with visible edges.",
    alt: "Geologische Schichten in Navy, Sage, Amber und Cream zeigen PKV-Kostenbestandteile, Aquarell.",
  },
  {
    id: "hero-kosten-pkv-steuer",
    size: "1536x1024",
    prompt:
      "A document or form rendered in navy watercolor with a large portion highlighted in warm amber (the deductible base coverage). A smaller section at the top remains in pale sage (limited deductibility for extras). The amber section glows, suggesting money flowing back. Loose brushwork.",
    alt: "Navy-Dokument mit grossem Amber-Bereich und kleinem Sage-Rest, Geld fliesst zurueck, Aquarell.",
  },
  {
    id: "hero-kosten-selbstbeteiligung",
    size: "1536x1024",
    prompt:
      "A seesaw or balance beam with a small amber weight on one end (Selbstbeteiligung) tipping the larger navy side (monthly premium) downward. The small weight creates a large effect. Sage green ground beneath. The metaphor is clear: a small personal contribution reduces the larger cost significantly.",
    alt: "Amber-Gewicht kippt groessere Navy-Seite der Wippe nach unten, Sage-Grund, Aquarell.",
  },

  // ─── ARTIKEL: WECHSEL (5) ───
  {
    id: "hero-wechsel-gkv-in-pkv",
    size: "1536x1024",
    prompt:
      "A figure silhouette stepping through an open doorway from a sage-colored room into a navy-blue room lit with warm amber light. The step is mid-motion, one foot still in the old room. Documents flutter through the doorway with the movement. Loose, dynamic watercolor.",
    alt: "Silhouette schreitet durch Tuer von Sage-Raum in Navy-Raum mit Amber-Licht, Dokumente flattern.",
  },
  {
    id: "hero-wechsel-pkv-in-gkv",
    size: "1536x1024",
    prompt:
      "A narrow passage or bottleneck between two walls, one navy (PKV) and one sage (GKV). The passage is tight and partially blocked. A small figure silhouette squeezes through with effort. Amber light is visible on the other side but barely reachable. The mood is constraint, not impossibility.",
    alt: "Enge Passage zwischen Navy- und Sage-Wand, Silhouette zwaengt sich durch, Amber-Licht dahinter.",
  },
  {
    id: "hero-wechsel-optionstarif",
    size: "1536x1024",
    prompt:
      "A small golden key in amber tones, locked safely inside a translucent navy safe or vault. Time passes around it (suggested by soft sage swirls), but the key remains unchanged and protected. The metaphor: preserving something valuable for future use. Delicate watercolor.",
    alt: "Goldener Schluessel sicher in Navy-Tresor, Sage-Zeitwirbel drumherum, Aquarell auf Papier.",
  },
  {
    id: "hero-wechsel-tarifwechsel-204",
    size: "1536x1024",
    prompt:
      "Two side-by-side doors in a hallway, one old and worn in darker navy, one fresh and lighter in sage. A golden thread in amber connects both doors at the base, showing what transfers from old to new (the retained reserves). A figure steps from the old door toward the new. Loose watercolor.",
    alt: "Zwei Tueren, alt in Navy und neu in Sage, Amber-Faden verbindet sie am Boden, Silhouette wechselt.",
  },
  {
    id: "hero-wechsel-versicherungspflichtgrenze",
    size: "1536x1024",
    prompt:
      "A horizontal line dividing the composition. Below the line, the space is painted in constrained sage tones. Above the line, the space opens into warm amber and navy freedom. A figure silhouette is mid-step, crossing over the line from below to above. The line itself glows faintly.",
    alt: "Horizontale Grenzlinie, darunter Sage-Enge, darueber Navy-Amber-Weite, Silhouette steigt ueber.",
  },

  // ─── ARTIKEL: GRUNDLAGEN (3) ───
  {
    id: "hero-grundlagen-gkv-vs-pkv",
    size: "1536x1024",
    prompt:
      "A balance scale in the center, perfectly level. On the left pan, interlocking figures in sage (solidarity principle). On the right pan, a single distinct figure with a tailored shield in navy (equivalence principle). Amber light illuminates both sides equally, no bias. Loose watercolor, fair comparison.",
    alt: "Ausgeglichene Waage, links verbundene Sage-Figuren, rechts einzelne Navy-Figur mit Schild, Amber-Licht.",
  },
  {
    id: "hero-grundlagen-lohnt-sich-pkv",
    size: "1536x1024",
    prompt:
      "A crossroads seen from above with four paths leading in different directions, each in a different color: navy (age), sage (health), amber (income), cream with navy outline (family). A figure silhouette stands at the center, considering. Each path shows a different terrain. The question mark is in the composition itself, not drawn.",
    alt: "Kreuzung von oben mit vier farbigen Pfaden, Silhouette in der Mitte waegt ab, Aquarell.",
  },
  {
    id: "hero-grundlagen-vor-und-nachteile",
    size: "1536x1024",
    prompt:
      "A split composition: the left half bright with upward-floating elements in amber and sage (advantages: shield, open door, light), the right half shows descending elements in darker navy tones (risks: weight, narrowing path). The split runs vertically through the center. Neither side dominates. Balanced, honest watercolor.",
    alt: "Geteilte Komposition, links aufsteigende Amber-Sage-Elemente, rechts absteigende Navy-Elemente.",
  },

  // ─── ARTIKEL: AUFNAHME (6) ───
  {
    id: "hero-aufnahme-gesundheitspruefung",
    size: "1536x1024",
    prompt:
      "A magnifying glass hovering over layered translucent pages, each layer representing a year further back in time, growing fainter. The magnifying glass is rendered in amber, the pages in navy and sage tones fading to cream. The mood is thorough but not threatening, routine examination.",
    alt: "Amber-Lupe schwebt ueber geschichtete Seiten, die nach hinten in Sage und Cream verblassen, Aquarell.",
  },
  {
    id: "hero-aufnahme-leistungsausschluesse",
    size: "1536x1024",
    prompt:
      "A shield in navy with one section cut away or transparent, showing the gap. Beside it, a smaller complete shield with added weight on top (the alternative: surcharge). The composition offers a visual choice between partial coverage and full coverage at higher cost. Amber accents on the decision point.",
    alt: "Navy-Schild mit ausgeschnittenem Stueck neben kleinerem belasteten Schild, Amber am Entscheidungspunkt.",
  },
  {
    id: "hero-aufnahme-risikovoranfrage",
    size: "1536x1024",
    prompt:
      "A figure silhouette peeking through a keyhole in a large navy door, seeing warm amber light and opportunities beyond. The figure is outside, anonymous, uncommitted. The keyhole is the only opening. Sage-colored ground beneath. The mood is curiosity without exposure.",
    alt: "Silhouette blickt durch Schluesselloch einer Navy-Tuer, Amber-Licht dahinter, Sage-Grund, Aquarell.",
  },
  {
    id: "hero-aufnahme-risikozuschlag",
    size: "1536x1024",
    prompt:
      "A simple scale with a standard weight on one side in navy and additional smaller weights stacked on top in amber (the surcharges). A hand reaches in from the side, removing one of the extra weights, showing negotiability. Sage green background. The metaphor is clear: extra cost that can be reduced.",
    alt: "Waage mit Navy-Grundgewicht und Amber-Zusatzgewichten, Hand entfernt eines, Sage-Hintergrund.",
  },
  {
    id: "hero-aufnahme-tarifanalyse",
    size: "1536x1024",
    prompt:
      "A magnifying glass examining a multi-layered structure: the top layer shows smooth surface (apparent quality), beneath it visible layers in navy, sage, and amber reveal deeper details and hidden structures. The magnifying glass reveals what's beneath the surface. Analytical, careful watercolor.",
    alt: "Lupe enthuellt Schichten unter glatter Oberflaeche in Navy, Sage und Amber, analytisch, Aquarell.",
  },
  {
    id: "hero-aufnahme-wartezeiten",
    size: "1536x1024",
    prompt:
      "A bridge spanning a gap between two cliff edges. The left cliff in sage (GKV), the right cliff in navy (PKV). The bridge is painted in amber, smooth and uninterrupted, showing seamless transition. Below the bridge, the gap is soft and misty. The metaphor: the bridge of seamless transfer eliminates the waiting period.",
    alt: "Amber-Bruecke verbindet Sage-Klippe mit Navy-Klippe ueber nebligem Abgrund, Aquarell.",
  },

  // ─── ARTIKEL: ABSICHERUNG (3) ───
  {
    id: "hero-absicherung-berufsunfaehigkeit",
    size: "1536x1024",
    prompt:
      "A figure silhouette supported by a strong safety net rendered in navy brushstrokes, stretched between two posts. The net catches the figure mid-fall. Below the net, amber light suggests the financial protection that prevents hitting the ground. Sage-colored sky above. The mood is security in crisis.",
    alt: "Silhouette in Navy-Sicherheitsnetz aufgefangen, Amber-Licht darunter, Sage-Himmel, Aquarell.",
  },
  {
    id: "hero-absicherung-krankentagegeld",
    size: "1536x1024",
    prompt:
      "A timeline flowing left to right. The first section is a solid amber band (employer pays, stability). Then a gap or dip appears. From the gap, a navy lifeline rises and continues the band forward (Krankentagegeld takes over). The transition is the focus, the moment support changes hands. Sage accents.",
    alt: "Zeitstrahl mit Amber-Band, Luecke, dann Navy-Rettungslinie die weitertraegt, Sage-Akzente, Aquarell.",
  },
  {
    id: "hero-absicherung-mutterschutz",
    size: "1536x1024",
    prompt:
      "Two protective hands cradling a small glowing sphere in warm amber, surrounded by gentle navy brushstrokes forming a cocoon-like embrace. The larger hand (employer support) and the smaller hand (state benefit) work together. Sage-colored light radiates outward. Tender, warm watercolor.",
    alt: "Zwei Haende umhuellen leuchtende Amber-Kugel in Navy-Kokon, Sage-Licht strahlt aus, Aquarell.",
  },

  // ─── ARTIKEL: FAMILIE (2) ───
  {
    id: "hero-familie-elternzeit",
    size: "1536x1024",
    prompt:
      "A parent figure silhouette in navy carrying a small child shape, stepping from a supported platform (with amber pillars, employer era) onto a path where they must walk alone. Ahead, three small bridges or stepping stones in sage, amber, and cream offer different routes forward. Loose watercolor, tender but practical.",
    alt: "Navy-Elternsilhouette mit Kind tritt von Amber-Plattform auf Pfad mit drei Sage-Trittstufen, Aquarell.",
  },
  {
    id: "hero-familie-kinder",
    size: "1536x1024",
    prompt:
      "A large protective tree in navy with spreading branches. Under each branch, a small individual nest in a different soft tone (sage, amber, cream), each separate but sheltered by the same tree. No merged family blob, each child element is distinct. The tree represents the parent's PKV, the nests the individual child policies.",
    alt: "Navy-Baum mit ausladenden Aesten, darunter einzelne Nester in Sage, Amber und Cream, Aquarell.",
  },

  // ─── ARTIKEL: LEBENSSITUATIONEN (5) ───
  {
    id: "hero-lebenssituationen-angestellt-selbststaendig",
    size: "1536x1024",
    prompt:
      "A figure silhouette standing with one foot on a navy platform (employment) and one foot on a sage platform (self-employment). The platforms are at different heights, the figure balances between them. Amber light on the higher platform shows which side dominates. The composition shows the tension of dual status.",
    alt: "Silhouette mit je einem Fuss auf Navy- und Sage-Plattform in verschiedenen Hoehen, Amber-Akzent.",
  },
  {
    id: "hero-lebenssituationen-bkv",
    size: "1536x1024",
    prompt:
      "A primary shield in solid navy (main insurance) with a secondary, translucent shield layered on top in sage with amber edges (the BKV addition). The second shield adds coverage without replacing the first. A building silhouette in the background suggests the employer source. Loose watercolor layering.",
    alt: "Navy-Hauptschild mit durchscheinendem Sage-Zusatzschild darueber, Gebaeude-Silhouette im Hintergrund.",
  },
  {
    id: "hero-lebenssituationen-kuendigung-jobwechsel",
    size: "1536x1024",
    prompt:
      "A continuous navy thread or ribbon flowing from left to right without breaking, while the background changes behind it: from one workplace silhouette to another, with a brief gap between them. The thread is the PKV that stays constant. Amber knots mark where the employer contribution reconnects. Sage background transitions.",
    alt: "Durchgehendes Navy-Band vor wechselndem Hintergrund, Amber-Knoten wo AG-Zuschuss neu ansetzt, Aquarell.",
  },
  {
    id: "hero-lebenssituationen-oeffentlicher-dienst",
    size: "1536x1024",
    prompt:
      "A building with classical columns (public sector) painted in navy. From its entrance, a figure steps out onto the same path as a figure from a modern building (private sector) in sage. Both paths merge into one amber-lit road ahead (same PKV rules). The composition shows: same destination despite different starting points.",
    alt: "Figuren aus Navy-Saeulengebaeude und Sage-Buero treffen sich auf gemeinsamem Amber-Weg, Aquarell.",
  },
  {
    id: "hero-lebenssituationen-rente",
    size: "1536x1024",
    prompt:
      "A figure silhouette walking a gently downhill path that becomes lighter and warmer toward the horizon. Three pillars along the path provide support: one in navy (Altersrueckstellung), one in sage (DRV-Zuschuss), one in amber (Entlastungstarif). The figure appears unburdened. Warm, hopeful watercolor.",
    alt: "Silhouette auf abwaerts hellerem Weg, drei Stuetzpfeiler in Navy, Sage und Amber, Aquarell.",
  },

  // ─── ARTIKEL: LEISTUNGEN (4) ───
  {
    id: "hero-leistungen-basistarif-standardtarif",
    size: "1536x1024",
    prompt:
      "A safety net stretched below a tightrope. On the tightrope, a figure walks in navy. Below, the net is painted in sage (Basistarif) with amber reinforcement threads (Standardtarif). The net is visible, reliable, clearly there to catch. The mood is: protection exists even if you fall. Loose watercolor.",
    alt: "Figur auf Navy-Seil ueber Sage-Sicherheitsnetz mit Amber-Verstaerkungsfaeden, Aquarell.",
  },
  {
    id: "hero-leistungen-beste-pkv",
    size: "1536x1024",
    prompt:
      "Several shield shapes arranged in a loose group, most in sage and cream tones. One shield in the foreground stands out in navy with amber highlights, slightly taller and more defined than the others. Not a crown or trophy, just quiet distinction through stability and clarity. Loose watercolor, no ranking numbers.",
    alt: "Mehrere Schilde in Sage und Cream, eines vorne in Navy mit Amber-Akzenten ragt heraus, Aquarell.",
  },
  {
    id: "hero-leistungen-tarifbausteine",
    size: "1536x1024",
    prompt:
      "Four distinct building blocks in watercolor, each a different color and shape: navy rectangle (stationaer), sage square (ambulant), amber triangle (Zahn), cream circle with navy outline (Pflege). They are arranged so they could fit together but remain individual, showing modularity. Each block has a unique texture.",
    alt: "Vier Bausteine in Navy, Sage, Amber und Cream, einzeln aber zusammensetzbar, Aquarell.",
  },
  {
    id: "hero-leistungen-uebersicht",
    size: "1536x1024",
    prompt:
      "A panoramic watercolor landscape showing a wide river (the insurance) flowing through different terrain: a village (ambulant care), a castle (hospital), a garden (dental/wellness), a bridge (Kostenerstattung connecting everything). Navy water, sage banks, amber details on buildings. The river connects all areas. Broad, overview composition.",
    alt: "Panorama-Aquarell mit Navy-Fluss durch Dorf, Burg, Garten, verbunden durch Amber-Bruecke.",
  },
];

// === PNG zu WebP konvertieren (via cwebp, magick oder sharp) ===
async function convertToWebP(pngPath) {
  const webpPath = pngPath.replace(/\.png$/, ".webp");

  // Versuch 1: cwebp CLI (brew install webp / apt install webp / choco install webp)
  try {
    execFileSync("cwebp", ["-q", "82", pngPath, "-o", webpPath], { stdio: "pipe" });
    return webpPath;
  } catch (_) { /* nicht verfuegbar */ }

  // Versuch 2: ImageMagick (magick oder convert)
  for (const cmd of ["magick", "convert"]) {
    try {
      execFileSync(cmd, [pngPath, "-quality", "82", webpPath], { stdio: "pipe" });
      return webpPath;
    } catch (_) { /* nicht verfuegbar */ }
  }

  // Versuch 3: sharp (npm install sharp)
  try {
    const { default: sharp } = await import("sharp");
    await sharp(pngPath).webp({ quality: 82 }).toFile(webpPath);
    return webpPath;
  } catch (_) { /* nicht verfuegbar */ }

  return null;
}

// === Bild generieren ===
async function generateImage(entry) {
  const webpFilename = `${entry.id}.webp`;
  const webpPath = join(OUTPUT_DIR, webpFilename);

  // Skip wenn WebP bereits existiert
  if (existsSync(webpPath)) {
    console.log(`  Existiert, uebersprungen: ${webpFilename}`);
    return true;
  }

  const pngFilename = `${entry.id}.png`;
  const pngPath = join(OUTPUT_DIR, pngFilename);
  const fullPrompt = `${entry.prompt}\n\n${STYLE_SUFFIX}`;
  console.log(`  Generiere ${pngFilename} (${entry.size})...`);

  try {
    const result = await client.images.generate({
      model: "gpt-image-1",
      prompt: fullPrompt,
      n: 1,
      size: entry.size,
      quality: "medium",
    });

    const imageData = result.data[0].b64_json;
    writeFileSync(pngPath, Buffer.from(imageData, "base64"));
    const pngKB = (readFileSync(pngPath).length / 1024).toFixed(0);

    // Konvertiere zu WebP
    const converted = await convertToWebP(pngPath);
    if (converted) {
      const webpKB = (readFileSync(converted).length / 1024).toFixed(0);
      unlinkSync(pngPath); // PNG loeschen
      console.log(`  ok: ${webpFilename} (${webpKB} KB, vorher ${pngKB} KB PNG)`);
    } else {
      console.log(`  ok: ${pngFilename} (${pngKB} KB, WebP-Konvertierung nicht moeglich)`);
    }
    return true;
  } catch (e) {
    console.error(`  FEHLER ${pngFilename}: ${e.message}`);
    return false;
  }
}

// === Alt-Texte exportieren ===
function exportAltTexts() {
  const data = {};
  for (const img of IMAGES) {
    data[img.id] = { alt: img.alt, size: img.size };
  }
  const outPath = join(WEBSITE_ROOT, "src", "data", "image-alt-texts.json");
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(data, null, 2), "utf-8");
  console.log(`Alt-Texte exportiert: ${outPath}  (${Object.keys(data).length} Eintraege)`);
}

// === Liste anzeigen ===
function listImages() {
  console.log(`${"Nr".padStart(3)}  ${"Groesse".padEnd(12)} ${"ID".padEnd(50)} Alt (Auszug)`);
  console.log("-".repeat(120));
  for (let i = 0; i < IMAGES.length; i++) {
    const img = IMAGES[i];
    const altExcerpt = img.alt.length > 55 ? img.alt.slice(0, 55) + "..." : img.alt;
    console.log(
      `${String(i + 1).padStart(3)}  ${img.size.padEnd(12)} ${img.id.padEnd(50)} ${altExcerpt}`
    );
  }
  console.log(`\nGesamt: ${IMAGES.length}`);
}

// === CLI ===
async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--list")) {
    listImages();
    return;
  }

  if (args.includes("--export-alt")) {
    exportAltTexts();
    return;
  }

  // Bestehende PNGs zu WebP konvertieren (ohne Neugenerierung)
  if (args.includes("--convert")) {
    const { readdirSync } = await import("fs");
    const pngs = readdirSync(OUTPUT_DIR).filter((f) => f.endsWith(".png"));
    if (pngs.length === 0) {
      console.log("Keine PNGs zum Konvertieren gefunden.");
      return;
    }
    console.log(`Konvertiere ${pngs.length} PNGs zu WebP...`);
    let ok = 0;
    for (const f of pngs) {
      const pngPath = join(OUTPUT_DIR, f);
      const result = await convertToWebP(pngPath);
      if (result) {
        const pngKB = (readFileSync(pngPath).length / 1024).toFixed(0);
        const webpKB = (readFileSync(result).length / 1024).toFixed(0);
        unlinkSync(pngPath);
        console.log(`  ${f} -> ${f.replace(".png", ".webp")} (${pngKB} KB -> ${webpKB} KB)`);
        ok++;
      } else {
        console.log(`  ${f}: Konvertierung fehlgeschlagen (cwebp/magick/sharp nicht gefunden)`);
      }
    }
    console.log(`\nFertig: ${ok}/${pngs.length} konvertiert.`);
    return;
  }

  let images = IMAGES;

  const onlyIdx = args.indexOf("--only");
  if (onlyIdx !== -1 && args[onlyIdx + 1]) {
    const id = args[onlyIdx + 1];
    images = IMAGES.filter((i) => i.id === id);
    if (images.length === 0) {
      console.log(`ID '${id}' nicht gefunden. Verfuegbare IDs:`);
      for (const i of IMAGES) console.log(`  ${i.id}`);
      process.exit(1);
    }
  }

  const firstIdx = args.indexOf("--only-first");
  if (firstIdx !== -1 && args[firstIdx + 1]) {
    const n = parseInt(args[firstIdx + 1], 10);
    images = IMAGES.slice(0, n);
  }

  console.log(`\nPKV-Angestellt Bildgenerierung (Aquarell-Stil)`);
  console.log(`Output-Verzeichnis: ${OUTPUT_DIR}`);
  console.log(`Anzahl: ${images.length}\n`);

  let ok = 0;
  const failed = [];

  for (const img of images) {
    if (await generateImage(img)) {
      ok++;
    } else {
      failed.push(img.id);
    }
  }

  console.log(`\n${"=".repeat(50)}\nFertig: ${ok}/${images.length}`);
  if (failed.length > 0) {
    console.log("Fehlgeschlagen:");
    for (const f of failed) console.log(`  ${f}`);
  }
}

main();
