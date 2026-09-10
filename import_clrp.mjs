// CLRP Wiki Full Importer — runs in Node.js, no browser/CORS needed
// Usage: node import_clrp.mjs
// Output: clrp_wiki_import.json + all pages in /clrp_pages/ folder

import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';

const OUTPUT_FILE = path.join(process.cwd(), 'clrp_wiki_import.json');
const PAGES_DIR = path.join(process.cwd(), 'clrp_pages');

// Create pages directory
if (!fs.existsSync(PAGES_DIR)) fs.mkdirSync(PAGES_DIR, { recursive: true });

function fetchHttps(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https://') ? https : http;
    const req = client.get(url, { headers: { 'User-Agent': 'CLWikiImport/1.0' } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchHttps(res.headers.location));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

async function main() {
  console.log('Fetching wiki index (llms.txt)...');
  const llmsRes = await fetchHttps('https://wiki.cityliferp.net/llms.txt');
  
  if (llmsRes.status !== 200) {
    console.error(`Failed to fetch llms.txt: HTTP ${llmsRes.status}`);
    process.exit(1);
  }
  
  const llmsContent = llmsRes.body;
  
  // Parse markdown links from llms.txt
  const pageRegex = /- \[([^\]]+)\]\((https:\/\/wiki\.cityliferp\.net\/[^)]+\.md)\)/g;
  let match;
  const seen = new Set();
  const pages = [];
  
  while ((match = pageRegex.exec(llmsContent)) !== null) {
    const title = match[1].trim();
    const url = match[2];
    
    if (seen.has(url)) continue;
    seen.add(url);
    
    // Derive filename: strip prefix, replace / and . with -, add .md
    const fileName = url.replace('https://wiki.cityliferp.net/', '').replace(/[\/]/g, '-').replace(/\.md$/, '') + '.md';
    pages.push({ title, url, fileName });
  }
  
  console.log(`Found ${pages.length} unique pages. Starting download...\n`);
  
  let completed = 0;
  const result = { generatedAt: new Date().toISOString(), totalPages: pages.length, pages: [] };
  
  // Download each page sequentially with delay
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    
    // Check if already downloaded (resume support)
    const existingPagePath = path.join(PAGES_DIR, page.fileName);
    let content = '';
    
    try {
      const res = await fetchHttps(page.url);
      if (res.status === 200) {
        content = res.body;
        fs.writeFileSync(existingPagePath, content, 'utf8');
        
        // Also add to result structure
        result.pages.push({ title: page.title, url: page.url, content });
      } else {
        content = `(HTTP ${res.status}: failed)`;
      }
    } catch(e) {
      content = `(error: ${e.message})`;
    }
    
    completed++;
    const pct = ((completed / pages.length) * 100).toFixed(1);
    process.stdout.write(`\rDownloading: ${page.title} (${completed}/${pages.length}) - ${pct}%   `);
    
    if (i < pages.length - 1) await new Promise(r => setTimeout(r, 50)); // rate limit
  }
  
  console.log('\n\nWriting import file...');
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2), 'utf8');
  
  const okPages = result.pages.filter(p => !p.content.includes('error')).length;
  const sizeMB = (fs.statSync(OUTPUT_FILE).size / 1024 / 1024).toFixed(2);
  
  console.log(`\n✅ Import complete!`);
  console.log(`   Pages: ${okPages}/${pages.length} successfully downloaded`);
  console.log(`   Data file: ${OUTPUT_FILE}`);
  console.log(`   Page files: ${PAGES_DIR}/ (${pages.length} .md files)`);
  console.log(`   Data size: ${sizeMB} MB`);
  console.log('\nTo use in your wiki app, the data is stored as JSON at:', OUTPUT_FILE);
}

main().catch(e => {
  console.error('Fatal error:', e.message);
  process.exit(1);
});
