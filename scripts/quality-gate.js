// Quality-Gate: Minimal-Checks vor Commit/Deploy.
// - dist/ existiert nach Build
// - Alle 63 Routen aus IA sind erreichbar
// - Kein Google-Fonts-Link im Build (Footprint)
// - Kein "lorem ipsum" im Build
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

const REQUIRED_ROUTES = [
  '/', '/pkv-angestellte/', '/grundlagen/', '/grundlagen/gkv-vs-pkv/',
  '/kosten/', '/kosten/arbeitgeberzuschuss/', '/rechner/', '/rechner/pkv-beitrag/',
  '/beratung/', '/ueber-uns/', '/impressum/', '/datenschutz/'
];

let fails = 0;
function check(ok, msg) {
  console.log(`${ok ? 'OK' : 'FAIL'} — ${msg}`);
  if (!ok) fails++;
}

check(fs.existsSync(DIST), 'dist/ existiert');
if (!fs.existsSync(DIST)) process.exit(1);

for (const route of REQUIRED_ROUTES) {
  const rel = route === '/' ? 'index.html' : route.replace(/^\/|\/$/g, '') + '/index.html';
  const file = path.join(DIST, rel);
  check(fs.existsSync(file), `Route ${route} -> ${rel}`);
}

// Fonts-Footprint-Check: Material Symbols ist aktuell noch erlaubt, Rest nicht.
function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

const htmlFiles = walk(DIST);
let googleFontsHit = 0;
let loremHit = 0;
for (const f of htmlFiles) {
  const c = fs.readFileSync(f, 'utf8');
  // Material Symbols ist noch Übergang, Rest darf nicht rein:
  if (/fonts\.googleapis\.com\/css2\?family=(Inter|Newsreader)/i.test(c)) googleFontsHit++;
  if (/lorem ipsum/i.test(c)) loremHit++;
}
check(googleFontsHit === 0, 'Keine Google-Fonts-Links für Inter/Newsreader (Footprint)');
check(loremHit === 0, 'Kein "lorem ipsum" im Build');

if (fails) {
  console.error(`\n${fails} Check(s) fehlgeschlagen.`);
  process.exit(1);
}
console.log('\nQuality-Gate: alles grün.');
