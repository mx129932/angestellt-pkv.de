// Content-Quality-Gate: Prueft alle T6-Artikel gegen ihre Briefs und Schreibregeln.
// Laeuft VOR dem Build-Quality-Gate und VOR jedem Commit.
//
// Prueft:
// - Alle Pflicht-H2s aus dem Brief vorhanden
// - Primary Keyword im Title
// - Meta-Description 140-160 Zeichen
// - Keine Gedankenstriche (Em-Dash, En-Dash)
// - Keine ASCII-Umlaute in sichtbarem Text
// - Keine Sie-Anrede
// - Kein "wobei"
// - Keine Anglizismen
// - Mindestens 3 FAQ-Fragen
// - Fazit-Section vorhanden
// - Brief validation-Felder alle true
//
// Usage: node scripts/content-quality-gate.js

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PROJECT = path.resolve(ROOT, '..');
const BRIEFS_DIR = path.join(PROJECT, '3_Content-Briefings', 'briefs');
const PAGES_DIR = path.join(ROOT, 'src', 'pages');
const PIPELINE_STATUS = path.join(PROJECT, '3_Content-Briefings', 'pipeline-status.json');

// --- Helpers ---

function normalize(text) {
  return text.toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/é/g, 'e');
}

function stripHtml(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

// --- Load Data ---

const briefFiles = fs.readdirSync(BRIEFS_DIR).filter(f => f.endsWith('.json'));
const pipeline = JSON.parse(fs.readFileSync(PIPELINE_STATUS, 'utf8'));

let totalFails = 0;
let totalPass = 0;
const issues = [];

for (const bf of briefFiles) {
  const brief = JSON.parse(fs.readFileSync(path.join(BRIEFS_DIR, bf), 'utf8'));
  const slug = brief.slug;
  const articlePath = path.join(PAGES_DIR, ...slug.split('/'), 'index.astro');
  const articleIssues = [];

  // --- Brief Validation ---

  // Check all validation fields are true
  for (const [key, val] of Object.entries(brief.validation || {})) {
    if (val !== true) {
      articleIssues.push(`Brief validation.${key} = ${val}`);
    }
  }

  // Check title length
  const title = brief.content_plan?.title || '';
  if (title.length >= 60) {
    articleIssues.push(`Brief title ${title.length} chars (must be <60)`);
  }

  // Check description length
  const desc = brief.content_plan?.description || '';
  if (desc.length < 140 || desc.length > 160) {
    articleIssues.push(`Brief description ${desc.length} chars (must be 140-160)`);
  }

  // Check Gedankenstriche in brief
  if (title.includes('—') || title.includes('–') || desc.includes('—') || desc.includes('–')) {
    articleIssues.push('Brief: Gedankenstrich in title/description');
  }

  // Check min 3 facts
  const facts = brief.content_plan?.mandatory_facts || [];
  if (facts.length < 3) {
    articleIssues.push(`Brief: only ${facts.length} mandatory_facts (need 3+)`);
  }

  // Check min 3 FAQ
  const faqs = brief.content_plan?.faq_questions || [];
  if (faqs.length < 3) {
    articleIssues.push(`Brief: only ${faqs.length} faq_questions (need 3+)`);
  }

  // Check Fazit in mandatory_h2
  const h2list = brief.content_plan?.mandatory_h2 || [];
  if (!h2list.some(h => normalize(h).includes('fazit'))) {
    articleIssues.push('Brief: "Fazit" missing from mandatory_h2');
  }

  // --- Article Checks (only if file exists) ---

  if (!fs.existsSync(articlePath)) {
    articleIssues.push('Article file MISSING');
  } else {
    const content = fs.readFileSync(articlePath, 'utf8');

    // Split frontmatter and body
    const parts = content.split('---');
    const body = parts.length >= 3 ? parts.slice(2).join('---') : content;
    const textOnly = stripHtml(body);

    // 1. Check mandatory H2s
    const h2Regex = /<h2[^>]*>(.*?)<\/h2>/gs;
    const articleH2s = [];
    let m;
    while ((m = h2Regex.exec(content)) !== null) {
      articleH2s.push(normalize(stripHtml(m[1])));
    }

    for (const mandatoryH2 of h2list) {
      const mandNorm = normalize(mandatoryH2);
      const words = mandNorm.split(/\s+/).filter(w => w.length > 2).slice(0, 4);
      const found = articleH2s.some(h2 => words.every(w => h2.includes(w)));
      if (!found) {
        articleIssues.push(`Missing H2: "${mandatoryH2}"`);
      }
    }

    // 2. Check Fazit section exists
    if (!/<section[^>]*id=['"]fazit['"]/.test(content)) {
      articleIssues.push('No <section id="fazit"> found');
    }

    // 3. Check Gedankenstriche in body
    if (body.includes('—') || body.includes('–')) {
      articleIssues.push('Gedankenstrich in article body');
    }

    // 4. Check ASCII umlauts in visible text
    const asciiPatterns = [
      [/\bfuer\b/gi, 'fuer'],
      [/\bueber\b/gi, 'ueber'],
      [/(?<![a-zA-Z/\-])Rueck/g, 'Rueck'],
      [/(?<![a-zA-Z/\-])Hoech/g, 'Hoech'],
      [/\bhaeuf/gi, 'haeuf'],
      [/\bmuess/gi, 'muess'],
      [/\baendern/gi, 'aendern'],
      [/\bdrueck/gi, 'drueck'],
      [/(?<![a-zA-Z])Aender/g, 'Aender'],
    ];

    for (const [pattern, label] of asciiPatterns) {
      const matches = textOnly.match(pattern);
      if (matches && matches.length > 0) {
        articleIssues.push(`ASCII umlaut "${label}" (${matches.length}x)`);
      }
    }

    // 5. Check Sie-Anrede
    const sieMatches = body.match(/\b(Ihren?|Ihrem|Ihrer|Ihnen)\b/g);
    if (sieMatches) {
      articleIssues.push(`Sie-Anrede found (${sieMatches.length}x)`);
    }

    // 6. Check "wobei"
    if (/\bwobei\b/i.test(textOnly)) {
      articleIssues.push('"wobei" found');
    }

    // 7. Check Anglizismen
    const anglizismen = ['benefits', 'features', 'coverage', 'provider', 'upgrade', 'downgrade', 'claim'];
    for (const ang of anglizismen) {
      if (new RegExp(`\\b${ang}\\b`, 'i').test(textOnly)) {
        articleIssues.push(`Anglizismus "${ang}"`);
      }
    }

    // 8. Check Primary KW in title attribute
    const titleAttr = content.match(/title=['"]([^'"]+)['"]/);
    if (titleAttr) {
      const titleNorm = normalize(titleAttr[1]);
      const pkNorm = normalize(brief.seo?.primary_keyword || '');
      const pkWords = pkNorm.split(/\s+/).filter(w => w.length > 3);
      if (pkWords.length > 0) {
        const matchRatio = pkWords.filter(w => titleNorm.includes(w)).length / pkWords.length;
        if (matchRatio < 0.5) {
          articleIssues.push(`Primary KW weak in title (${Math.round(matchRatio * 100)}%)`);
        }
      }
    }

    // 9. Check min 3 FAQ details elements
    const faqCount = (body.match(/<details/g) || []).length;
    if (faqCount < 3) {
      articleIssues.push(`Only ${faqCount} FAQ entries (need 3+)`);
    }
  }

  // --- Report ---

  if (articleIssues.length > 0) {
    totalFails++;
    issues.push({ slug, issues: articleIssues });
    console.log(`FAIL  ${slug}`);
    for (const issue of articleIssues) {
      console.log(`      - ${issue}`);
    }
  } else {
    totalPass++;
    console.log(`PASS  ${slug}`);
  }
}

console.log(`\n${'='.repeat(60)}`);
console.log(`Content-Quality-Gate: ${totalPass} PASS, ${totalFails} FAIL`);

if (totalFails > 0) {
  console.error(`\n${totalFails} Artikel haben Probleme. Bitte fixen vor Commit.`);
  process.exit(1);
}

console.log('\nContent-Quality-Gate: alles gruen.');
