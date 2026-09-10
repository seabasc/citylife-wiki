// CityLife Santos Wiki — Smart Search Engine (Part 1/2)
const SEARCH = (() => {
  let fuse = null; let aiEnabled = false; let allItems = []; let focusedIndex = -1;

  function init() {
    allItems = [];
    RULES_DATA.categories.forEach(cat => {
      cat.rules.forEach(rule => {
        allItems.push({ id:rule.id, type:'rule', category:cat.title, categoryId:cat.id,
          title:rule.name, content:rule.content, searchable:`${cat.title} ${rule.name} ${rule.content}`.toLowerCase() });
      });
    });
    getWikiPages?.().forEach(page => {
      allItems.push({ id:page.id, type:'wiki', category:'Wiki', title:page.title, content:page.content,
        searchable:`${page.title} ${page.content}`.toLowerCase() });
    });
    MAP_PINS.forEach(pin => {
      allItems.push({ id:`pin-${pin.id}`, type:'map', category:'Map Pin', title:pin.title,
        content:pin.description||'', searchable:`${pin.title} ${pin.description} ${pin.category}`.toLowerCase() });
    });
    fuse = new Fuse(allItems, { keys:['title','content'], includeScore:true, threshold:0.35, minMatchCharLength:2, shouldSort:true });

    window._SYNONYMS = {
      'jail':['penitentiary','lockup','detention'], 'combat log':['logging','leaving','disconnect','quit'],
      'frisk':['search','pat down','cuff'], 'arrest':['detain','book','take in'],
      'gang war':['territory','block push','turf war','blueprint'], 'heist':['robbery','job','score','payout'],
      'gun store':['spray shop','armory','weapons','firearms'], 'heat':['wanted','stars','police response'],
      'warrant':['strike','penitentiary time']
    };
  }

  function expandQuery(query) {
    const terms = query.toLowerCase().split(/\s+/); let expanded = [...terms];
    terms.forEach(t => { if (window._SYNONYMS[t]) expanded.push(...window._SYNONYMS[t]); });
    if (query.length <= 3) expanded.push(query);
    return expanded.join(' ');
  }

  function fuseSearch(query, limit=25) {
    if (!fuse || !query || query.trim().length < 2) return [];
    const results = fuse.search(expandQuery(query.trim()), { limit });
    return results.map(r => ({ ...r.item, score:Math.round((1-r.score)*100),
      excerpt:(r.item.content||'').substring(0,150).replace(new RegExp(`(${query.trim().replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`,'gi'),'<mark class="search-highlight">$1</mark>') }));
  }

  function highlightMatch(text, query) {
    if (!query) return (text||'').substring(0,120);
    return text.substring(0,150).replace(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`,'gi'),'<mark class="search-highlight">$1</mark>');
  }

  function search(query) {
    const results = fuseSearch(query);
    if (!query || query.trim().length < 2) return [];
    const groups = { rules:[], wiki:[], map:[] };
    results.forEach(r => { if (groups[r.type]) groups[r.type].push(r); });
    renderSearchResults(groups, query);
    return results;
  }

  function renderSearchResults(groups, query) {
    const container = document.getElementById('searchResults'); if (!container) return;
    let html = '';
    if (groups.rules.length) groups.rules.forEach((item,i) => {
      html += `<div class="search-result-item" data-index="${i}" data-type="${item.type}" data-id="${item.id}">
        <div class="result-category">${item.category}</div><div class="result-title">${item.title}</div>
        ${item.excerpt?`<div class="result-excerpt">${item.excerpt}</div>`:''}</div>`; });
    if (groups.wiki.length) groups.wiki.forEach((item,i) => {
      html += `<div class="search-result-item" data-index="${i}" data-type="${item.type}" data-id="${item.id}">
        <div class="result-category">${item.category}</div><div class="result-title">${item.title}</div></div>`; });
    if (groups.map.length) groups.map.forEach((item,i) => {
      html += `<div class="search-result-item" data-index="${i}" data-type="${item.type}" data-id="${item.id}">
        <div class="result-category">${item.category}</div><div class="result-title">${item.title}</div></div>`; });
    if (!html) { container.innerHTML='<div class="search-empty">No results found</div>'; container.classList.add('visible'); return; }
    container.innerHTML = html; container.classList.add('visible');
    container._items = Array.from(container.querySelectorAll('.search-result-item'));
  }

  function focusNext() { const d=document.getElementById('searchResults'); if(!d?.length)return; focusedIndex=(focusedIndex+1)%d._items.length; updateFocus(); }
  function focusPrev() { const d=document.getElementById('searchResults'); if(!d?.length)return; focusedIndex=(focusedIndex-1+d._items.length)%d._items.length; updateFocus(); }
  function updateFocus() {
    const d=document.getElementById('searchResults'); if(!d||!d._items?.length)return;
    d._items.forEach((el,i) => el.classList.toggle('focused', i===focusedIndex));
    if(d._items[focusedIndex]) d._items[focusedIndex].scrollIntoView({block:'nearest'});
  }

  function dismissDropdown() { const c=document.getElementById('searchResults'); if(c) c.classList.remove('visible'); focusedIndex=-1; }

  return { init, search, focusNext, focusPrev, dismissDropdown, toggleAI:()=>{ aiEnabled=!aiEnabled; document.getElementById('searchModeToggle')?.classList.toggle('active',aiEnabled); }, closeSearchInput:()=>{document.getElementById('searchInput').value=''} };
})();
