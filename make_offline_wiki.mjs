import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const importFile = path.join(root, 'clrp_wiki_import.json');
const pagesDirectory = path.join(root, 'clrp_pages');
const assetsDirectory = path.join(root, 'assets', 'wiki');
const vendorDirectory = path.join(root, 'vendor');
const imported = JSON.parse(fs.readFileSync(importFile, 'utf8'));
const contentTypeExtensions = new Map([
  ['image/png', '.png'], ['image/jpeg', '.jpg'], ['image/gif', '.gif'], ['image/webp', '.webp'], ['image/avif', '.avif'], ['image/svg+xml', '.svg']
]);
const libraries = [
  ['fuse.min.js', 'https://cdn.jsdelivr.net/npm/fuse.js@7.0.0/dist/fuse.min.js'],
  ['marked.min.js', 'https://cdn.jsdelivr.net/npm/marked@12.0.2/marked.min.js']
];

function localFilename(url) {
  return `${new URL(url).pathname.replace(/^\/+/, '').replace(/\.md$/i, '').replace(/\//g, '-')}.md`;
}

function imageUrls(content) {
  return [...content.matchAll(/https:\/\/1220491511-files\.gitbook\.io\/[^\s"')<>]+/gi)].map(match => match[0]);
}

function decodedUrl(url) {
  return url.replaceAll('&amp;', '&');
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function removeBrokenMedia(content, url) {
  const escapedUrl = escapeRegExp(url);
  return content
    .replace(new RegExp(`<figure[^>]*>[\\s\\S]*?${escapedUrl}[\\s\\S]*?<\\/figure>`, 'gi'), '')
    .replace(new RegExp(`<img[^>]*${escapedUrl}[^>]*>`, 'gi'), '')
    .replace(new RegExp(`!\\[[^\\]]*\\]\\(${escapedUrl}\\)`, 'gi'), '')
    .replace(/\n{3,}/g, '\n\n');
}

async function download(url) {
  const response = await fetch(decodedUrl(url));
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  const body = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get('content-type')?.split(';')[0].toLowerCase();
  const extension = contentTypeExtensions.get(contentType) || path.extname(new URL(decodedUrl(url)).pathname) || '.bin';
  return { body, extension };
}

fs.mkdirSync(assetsDirectory, { recursive: true });
fs.mkdirSync(vendorDirectory, { recursive: true });
const urls = [...new Set(imported.pages.flatMap(page => imageUrls(page.content)))];
const replacements = new Map();
const failures = [];
const unavailableImages = new Set();

for (const url of urls) {
  try {
    const { body, extension } = await download(url);
    const filename = `${crypto.createHash('sha256').update(url).digest('hex').slice(0, 20)}${extension}`;
    fs.writeFileSync(path.join(assetsDirectory, filename), body);
    replacements.set(url, `assets/wiki/${filename}`);
    console.log(`Mirrored image: ${filename}`);
  } catch (error) {
    if (error.message.startsWith('404 ')) unavailableImages.add(url);
    else failures.push(`${url}: ${error.message}`);
  }
}

for (const [filename, url] of libraries) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    fs.writeFileSync(path.join(vendorDirectory, filename), Buffer.from(await response.arrayBuffer()));
    console.log(`Vendored library: ${filename}`);
  } catch (error) {
    failures.push(`${url}: ${error.message}`);
  }
}

if (failures.length) {
  console.error(`Offline vendoring failed for ${failures.length} resource(s):\n${failures.join('\n')}`);
  process.exit(1);
}

for (const page of imported.pages) {
  let content = page.content;
  for (const [url, localPath] of replacements) content = content.replaceAll(url, localPath);
  for (const url of unavailableImages) content = removeBrokenMedia(content, url);
  page.content = content;
  fs.writeFileSync(path.join(pagesDirectory, localFilename(page.url)), content, 'utf8');
}
fs.writeFileSync(importFile, `${JSON.stringify(imported, null, 2)}\n`, 'utf8');
console.log(`Offline-ready wiki content: ${imported.pages.length} pages, ${replacements.size} images, ${unavailableImages.size} unavailable image(s) removed, ${libraries.length} libraries.`);