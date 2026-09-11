// assign_categories.mjs — Assign categoryId, stable id, and resolve duplicates
// Run: node assign_categories.mjs
// Reads  clrp_wiki_import.json
// Writes  clrp_wiki_import.json (enriched in-place)

import fs from 'fs';
import path from 'path';

const root = process.cwd();
const inputPath = path.join(root, 'clrp_wiki_import.json');
const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

/* ── Direct slug → category mapping (25 unambiguous URLs) ─────────────── */
const SLUG_TO_CATEGORY = {
  // — criminal-activities (6) —
  'heists': 'criminal-activities',
  'bobcat-heist-wip': 'criminal-activities',
  'drug-manufacturing': 'criminal-activities',
  'growing-and-selling': 'criminal-activities',
  'manufacturing-meth': 'criminal-activities',
  'manufacturing-moonshine': 'criminal-activities',
  'manufacturing-opium': 'criminal-activities',
  'mushrooms': 'criminal-activities',
  'meth': 'criminal-activities',

  // — jobs-careers (3) —
  'crypto-mining': 'jobs-careers',
  'maintenance-and-repairs': 'jobs-careers',
  'upgrading-your-rig': 'jobs-careers',

  // — criminal-activities (heist/robbery) (6) —
  'bank-heists': 'criminal-activities',
  'jewelry-store-heist': 'criminal-activities',
  'container-robberies': 'criminal-activities',
  'house-robberies': 'criminal-activities',
  'store-robberies': 'criminal-activities',
  'atm-robberies': 'criminal-activities',

  // — skills-gathering (4) —
  'collectibles': 'skills-gathering',
  'gym-life': 'skills-gathering',
  'skill-trophies': 'skills-gathering',
  'treasure-maps': 'skills-gathering',

  // — economy-properties (4) —
  'mosleys-used-car-dealership': 'economy-properties',
  'motels': 'economy-properties',
  'pawnshop-rings': 'economy-properties',
  'storage-units': 'economy-properties',
};

/* ── Resolvers (checked in priority order) ────────────────────────────── */
function resolveCategory(pageUrl) {
  const u = new URL(pageUrl);
  const slug = path.basename(u.pathname).replace(/\.md$/, '');

  if (slug in SLUG_TO_CATEGORY) return SLUG_TO_CATEGORY[slug];

  const p = u.pathname;

  // — explicit path patterns (checked top-down, first match wins) —
  if (p === '/welcome.md')                           return 'getting-started';
  if (/^\/getting-started\//.test(p))              return 'getting-started';
  if (/^\/useful-information\//.test(p))           return 'useful-information';
  if (/^\/criminal-guide\//.test(p))               return 'criminal-activities';
  if (/^\/job-guide\//.test(p))                    return 'jobs-careers';
  if (/^\/skill-guide\/skill-guide\/drug-sales/.test(p)) return 'criminal-activities';
  if (/^\/skill-guide\//.test(p))                  return 'skills-gathering';

  return null; // unreachable for well-formed wiki data
}

/* ── Main enrichment ─────────────────────────────────────────────────── */

function slugify(str) {
  return str.toLowerCase()
    .replace(/[^\w]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function assignCategories(pages) {
  const result = [];
  const seenSlugs = new Set(); // prevents ID collisions across all categories

  for (const page of pages) {
    const slug = slugify(new URL(page.url).pathname);
    const categoryId = resolveCategory(page.url);

    // Guarantee unique id
    let baseId = slug;
    if (seenSlugs.has(baseId)) {
      // If the same slug appears twice (should not happen after this), add index
      const idx = Array.from(seenSlugs).filter(s => s.startsWith(slug + '-') || s === slug).length;
      baseId = `${slug}-${idx}`;
    }

    let pageId = baseId;
    seenSlugs.add(pageId);

    result.push({ ...page, categoryId, id: pageId });
  }

  return result;
}

/* ── Run & persist ────────────────────────────────────────────────────── */

const enriched = assignCategories(data.pages);
data.pages = enriched;
data.totalPages = enriched.length;

fs.writeFileSync(inputPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');

console.log(`Categorised ${enriched.length} pages.`);

// Per-category summary
const counts = {};
enriched.forEach(p => { counts[p.categoryId] = (counts[p.categoryId] || 0) + 1; });
console.log('Categories:', JSON.stringify(counts, null, 2));