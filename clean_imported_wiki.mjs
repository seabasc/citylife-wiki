import fs from 'fs';
import path from 'path';

const root = process.cwd();
const importFile = path.join(root, 'clrp_wiki_import.json');
const pagesDirectory = path.join(root, 'clrp_pages');
const imported = JSON.parse(fs.readFileSync(importFile, 'utf8'));

const boilerplate = /^> For the complete documentation index, see \[llms\.txt\]\([^\n]+\)\. Markdown versions of documentation pages are available by appending `\.md` to page URLs; this page is available as \[Markdown\]\([^\n]+\)\.\n*/gm;
const promotionalTerms = /\b(?:gfuel|g fuel|affiliate|sponsor(?:ship|ed)?|buy me a coffee|patreon|ko-fi)\b/i;
const rulesDestinations = /(?:rplife\.city\/info\/rules|docs\.google\.com\/document\/d\/12tLS-m7DvJRhOVMdeqSlrLOydPyCW59sRn8Noob4oyk)/i;

function localFilename(url) {
  return `${new URL(url).pathname.replace(/^\/+/, '').replace(/\.md$/i, '').replace(/\//g, '-')}.md`;
}

function cleanLink(label, destination) {
  if (rulesDestinations.test(destination)) return '[Rules](wiki:rules)';
  if (/^https?:\/\//i.test(destination)) return label.trim();
  if (/\.md(?:#.*)?$/i.test(destination) && !knownPaths.has(new URL(destination, 'https://wiki.cityliferp.net').pathname)) return label.trim();
  return `[${label}](${destination})`;
}

function cleanContent(content, pageUrl) {
  const isWelcomePage = new URL(pageUrl).pathname === '/welcome.md';
  const withoutWelcomePromotion = isWelcomePage ? content.replace(/<figure>[\s\S]*?<\/figure>\s*/gi, '') : content;
  const withoutBoilerplate = withoutWelcomePromotion.replace(boilerplate, '');
  const withoutMissingReferences = withoutBoilerplate.replace(/\{% content-ref[^%]*%\}\n?\[([^\]]+)\]\((\/[^)\s]+\.md)\)\n?\{% endcontent-ref %\}\n?/g, (match, label, destination) => knownPaths.has(new URL(destination, 'https://wiki.cityliferp.net').pathname) ? match : '');
  const paragraphs = withoutMissingReferences.split(/\n{2,}/).filter(paragraph => !promotionalTerms.test(paragraph));
  return paragraphs.join('\n\n')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)(?:\s+"[^"]*")?\)/g, (_, label, destination) => cleanLink(label, destination))
    .replace(/<a\s+[^>]*href=["']https?:\/\/[^"']+["'][^>]*>([\s\S]*?)<\/a>/gi, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trimEnd() + '\n';
}

const originalCount = imported.pages.length;
const removedPages = imported.pages.filter(page => /\/support-citylife\//i.test(page.url));
const retainedPages = imported.pages.filter(page => !/\/support-citylife\//i.test(page.url));
const knownPaths = new Set(retainedPages.map(page => new URL(page.url).pathname));
imported.pages = retainedPages
  .map(page => ({ ...page, content: cleanContent(page.content, page.url) }));
imported.totalPages = imported.pages.length;

fs.writeFileSync(importFile, `${JSON.stringify(imported, null, 2)}\n`, 'utf8');
for (const page of imported.pages) fs.writeFileSync(path.join(pagesDirectory, localFilename(page.url)), page.content, 'utf8');
for (const page of removedPages) fs.rmSync(path.join(pagesDirectory, localFilename(page.url)), { force: true });

console.log(`Cleaned ${imported.pages.length} imported pages; removed ${originalCount - imported.pages.length} non-reference page(s).`);