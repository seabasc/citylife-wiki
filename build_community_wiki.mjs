// build_community_wiki.mjs — Enrich imported wiki + merge with community data → single source of truth
// Run: node build_community_wiki.mjs
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const importPath = path.join(root, 'clrp_wiki_import.json');
const communityPath = path.join(root, 'community-wiki-data.json');
const outputPath = path.join(root, 'community-wiki-data.json');
const rulesPath = path.join(root, 'CityLife Roleplay.txt');

// ── Read inputs ────────────────────────────────────────────────────────
const imported = JSON.parse(fs.readFileSync(importPath, 'utf8'));
const community  = JSON.parse(fs.readFileSync(communityPath, 'utf8'));
const rulesRaw = fs.readFileSync(rulesPath, 'utf8');

const pages = [...imported.pages];

// ── Resolve categoryId from URL path ───────────────────────────────────
function resolveCategory(pageUrl) {
  const u     = new URL(pageUrl);
  const slug  = path.basename(u.pathname).replace(/\.md$/, '');
  const p     = u.pathname;

  // — criminal-activities (explicit slugs) —
  const criminalSlugs = [
    'heists', 'bobcat-heist-wip', 'drug-manufacturing', 'growing-and-selling',
    'manufacturing-meth', 'manufacturing-moonshine', 'manufacturing-opium',
    'mushrooms', 'meth', 'bank-heists', 'jewelry-store-heist',
    'container-robberies', 'house-robberies', 'store-robberies', 'atm-robberies'
  ];
  if (criminalSlugs.includes(slug)) return 'criminal-activities';

  // — jobs-careers (explicit slugs) —
  const jobsSlugs = ['crypto-mining', 'maintenance-and-repairs', 'upgrading-your-rig'];
  if (jobsSlugs.includes(slug)) return 'jobs-careers';

  // — path-based categorization (checked top-down, first match wins) —
  if (/^\/getting-started\//.test(p))                  return 'getting-started';
  if (/^\/criminal-guide\/criminal-guide\/gang-life/.test(p)) return 'getting-started';
  if (/^\/useful-information\//.test(p))               return 'useful-information';
  if (/^\/criminal-guide\//.test(p))                   return 'criminal-activities';
  if (/^\/job-guide\//.test(p))                        return 'jobs-careers';
  if (/^\/skill-guide\/skill-guide\/drug-sales/.test(p)) return 'criminal-activities';
  if (/^\/skill-guide\//.test(p))                      return 'skills-gathering';

  // — economy-properties fallback —
  const ecoSlugs = ['collectibles', 'gym-life', 'motels', 'pawnshop-rings',
    'refueling-vehicles', 'skill-trophies', 'storage-units', 'treasure-maps'];
  if (ecoSlugs.includes(slug)) return 'economy-properties';

  // — welcome landing page → getting-started —
  if (slug === 'welcome' || slug === 'welcome-page') return 'getting-started';

  // — default: useful-information —
  return 'useful-information';
}

// ── Stable ID from URL path ────────────────────────────────────────────
function stableId(pageUrl) {
  const u = new URL(pageUrl);
  return u.pathname.replace(/^\/+/, '').replace(/\.md$/, '').replace(/\//g, '-');
}

// ── Enrich imported pages ──────────────────────────────────────────────
pages.forEach(p => {
  p.categoryId = resolveCategory(p.url);
  p.id         = stableId(p.url);
});

// ── Category definitions ───────────────────────────────────────────────
const categories = [
  { id: 'getting-started',     name: 'Getting Started',     icon: '01' },
  { id: 'useful-information',  name: 'Useful Information',  icon: '02' },
  { id: 'jobs-careers',        name: 'Jobs & Careers',      icon: '03' },
  { id: 'skills-gathering',    name: 'Skills & Gathering',  icon: '04' },
  { id: 'criminal-activities', name: 'Criminal Activities', icon: '05' },
  { id: 'economy-properties',  name: 'Economy & Properties', icon: '06' }
];

// ── Output ─────────────────────────────────────────────────────────────
const output = {
  version: '1.0',
  title: 'City Life / Santos Cartel Community Wiki',
  lastReviewed: new Date().toISOString().split('T')[0],
  categories,
  locations: community.locations || [],
  ruleGuideLinks: community.ruleGuideLinks || [],
  rulesRaw,
  pages
};

fs.writeFileSync(outputPath, JSON.stringify(output, null, 2) + '\n', 'utf8');

// ── Report ─────────────────────────────────────────────────────────────
const counts = {};
pages.forEach(p => { counts[p.categoryId] = (counts[p.categoryId] || 0) + 1; });
console.log(`Built community-wiki-data.json with ${pages.length} pages.`);
console.log('Categories:', JSON.stringify(counts, null, 2));

const nullCat = pages.filter(p => !p.categoryId);
if (nullCat.length) {
  console.warn(`⚠️ ${nullCat.length} pages have no categoryId:`, nullCat.map(p => `${p.title} (${p.url})`));
} else {
  console.log('✓ All pages have valid category assignments.');
}
