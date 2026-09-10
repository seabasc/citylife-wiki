// Merge CityLife Roleplay.txt + clrp_wiki_import.json into one master JSON
// Usage: node merge_sources.mjs

import fs from 'fs';
import path from 'path';

const RULES_FILE = path.join(process.cwd(), 'CityLife Roleplay.txt');
const WIKI_FILE = path.join(process.cwd(), 'clrp_wiki_import.json');
const OUTPUT_FILE = path.join(process.cwd(), 'citylife_master_data.json');

// Read raw rules file
console.log('Reading CityLife Roleplay.txt...');
let rulesContent;
try {
  rulesContent = fs.readFileSync(RULES_FILE, 'utf8');
} catch(e) {
  console.error(`Rules file not found: ${RULES_FILE}`);
  process.exit(1);
}

// Read imported wiki JSON
console.log('Reading clrp_wiki_import.json...');
let wikiData;
try {
  const raw = fs.readFileSync(WIKI_FILE, 'utf8');
  wikiData = JSON.parse(raw);
} catch(e) {
  console.error(`Wiki file not found or invalid: ${WIKI_FILE}`);
  process.exit(1);
}

// Build unified structure
const master = {
  version: "1.0",
  generatedAt: new Date().toISOString(),
  sources: {
    rules: {
      name: "CityLife Roleplay.txt (Server Rules)",
      lines: rulesContent.split('\n').length,
      bytes: Buffer.byteLength(rulesContent, 'utf8')
    },
    wiki: {
      name: "clrp_wiki_import.json (Official Wiki)",
      totalPages: wikiData.totalPages || wikiData.pages?.length || 0,
      pages: wikiData.pages ? wikiData.pages.map(p => ({
        title: p.title,
        url: p.url,
        content: p.content,
        categoryId: p.categoryId ?? undefined,
        id: p.id ?? undefined
      })) : []
    }
  },
  rulesRaw: rulesContent, // raw rules text at root for easy access
  wikiPages: wikiData.pages || [] // individual wiki pages array
};

// Write combined file
console.log('Writing citylife_master_data.json...');
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(master, null, 2), 'utf8');

const sizeMB = (fs.statSync(OUTPUT_FILE).size / 1024 / 1024).toFixed(2);

console.log(`\n✅ Merge complete!`);
console.log(`   Rules: ${rulesContent.split('\n').length} lines (${(Buffer.byteLength(rulesContent, 'utf8')/1024).toFixed(0)} KB)`);
console.log(`   Wiki: ${wikiData.totalPages || wikiData.pages?.length || 0} pages`);
console.log(`   Combined file: ${OUTPUT_FILE}`);
console.log(`   Total size: ${sizeMB} MB`);
