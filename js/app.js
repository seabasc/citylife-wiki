// CityLife Santos Wiki — Main App Controller (Part 1/2)
const APP = (() => {
  function init() { SEARCH.init(); buildRuleNav(); renderRules(); MAP.init(); CALCS.renderWarrantList(); WIKI.renderWikiList(); FAVORITES=JSON.parse(localStorage.getItem('cls_favorites')||'[]'); renderFavorites(); buildWelcomeScreen(); setupEventListeners(); if('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(()=>{}); showToast('Welcome to City Life Santos Wiki!','success'); }

  function buildWelcomeScreen() {
    const p=document.getElementById('panel-welcome'); if(!p)return;
    p.innerHTML=`<div class="welcome-screen"><div class="welcome-icon">&#x1F3D6;&#xFE0F;</div><h1>Welcome to CityLife Santos Wiki</h1><p>Your all-in-one gang wiki — rules, map pins, calculators, and more.</p>
      <div class="quick-links">
        <div class="quick-link" data-panel="rules"><div class="quick-link-icon">&#x1F4D2;</div><div class="quick-link-title">Rules</div><div class="quick-link-desc">Browse all server &amp; gang rules</div></div>
        <div class="quick-link" data-panel="map"><div class="quick-link-icon">&#x1F5FA;</div><div class="quick-link-title">GTA V Map</div><div class="quick-link-desc">Mark locations &amp; territories</div></div>
        <div class="quick-link" data-panel="calculators"><div class="quick-link-icon">&#x1F9EE;</div><div class="quick-link-title">Calculators</div><div class="quick-link-desc">Heat timer, warrants &amp; more</div></div>
        <div class="quick-link" data-panel="wiki"><div class="quick-link-icon">&#x1F4D6;</div><div class="quick-link-title">Wiki Pages</div><div class="quick-link-desc">Strategies, routes &amp; lore</div></div>
      </div></div>`;
  }

  function buildRuleNav() { const n=document.getElementById('ruleNav'); if(!n)return; let h=''; RULES_DATA.categories.forEach(c=>{h+=`<div class="sidebar-sub-item" data-cat="${c.id}">${c.icon} ${c.title}</div>`}); n.innerHTML=h; }

  function renderRules() { const c=document.getElementById('rulesContent'); if(!c)return; let h='';
    RULES_DATA.categories.forEach(cat=>{ h+=`<div class="rule-category" data-cat-id="${cat.id}"><div class="category-header" onclick="toggleCategory(this)">
      <div class="category-icon" style="background:${cat.color}22;color:${cat.color}">${cat.icon}</div><span class="category-title">${cat.title}</span>
      <span class="category-count">${cat.rules.length} rules</span><span class="category-toggle">&#x25B6;</span></div><div class="category-body">`;
      cat.rules.forEach(rule=>{ h+=`<div class="rule-item" id="${rule.id}" onclick="APP.toggleFav('rule-${rule.id}')"><div class="rule-name">${FAVORITES.includes('rule-'+rule.id)?'&#x2B50; ':''}${rule.name}</div><div class="rule-content">${rule.content.replace(/\n/g,'<br>')}</div></div>`; });
      h+='</div></div>'; });
    c.innerHTML=h; const first=c.querySelector('.rule-category'); if(first)first.classList.add('expanded');
    document.querySelectorAll('[data-cat]').forEach(el=>{ el.addEventListener('click',()=>{ const ce=document.querySelector(`[data-cat-id="${el.dataset.cat}"]`); if(ce&&(!ce.classList.contains('expanded')))ce.classList.add('expanded'); navigateToPanel('rules'); setTimeout(()=>ce?.scrollIntoView({behavior:'smooth',block:'start'}),100); }); }); }

  function toggleCategory(el) { el.parentElement.classList.toggle('expanded'); }

  function navigateToPanel(id) { document.querySelectorAll('.content-panel').forEach(p=>p.classList.remove('active')); document.querySelectorAll('.sidebar-item').forEach(i=>i.classList.remove('active')); const p=document.getElementById(`panel-${id}`); if(p)p.classList.add('active'); document.querySelector(`[data-panel="${id}"]`)?.classList.add('active'); document.getElementById('mainContent').scrollTop=0; document.getElementById('sidebar')?.classList.remove('open'); }

  function renderFavorites() { const c=document.getElementById('favesContent'); if(!c)return; const items=[]; RULES_DATA.categories.forEach(cat=>{ cat.rules.forEach(r=>{ if(FAVORITES.includes('rule-'+r.id))items.push({type:'Rule',name:r.id,fullName:r.name}); }); });
    let h=''; if(!items.length)h='<p style="color:var(--text-muted);text-align:center;padding:40px;font-size:.95rem">No favorites yet. Click any rule to add it here.</p>';
    else items.forEach(i=>{ h+=`<div class="rule-item"><div class="rule-name">${i.fullName}</div><div class="rule-content" style="display:flex;gap:8px;align-items:center;margin-top:8px"><span style="font-size:.75rem;padding:2px 8px;background:var(--bg-tertiary);border-radius:4px">${i.type}</span><button class="action-btn" style="width:28px;height:28px;font-size:.7rem;color:var(--accent-red)" onclick="APP.removeFav('${i.name}')">&#x2B50;</button></div></div>`; }); c.innerHTML=h; }

  function toggleFav(id) { if(FAVORITES.includes(id)) FAVORITES=FAVORITES.filter(f=>f!==id); else FAVORITES.push(id); saveFavorites(); renderRules(); renderFavorites(); showToast(FAVORITES.includes(id)?'Added to favorites':'Removed from favorites','info'); }
  function removeFav(id) { FAVORITES=FAVORITES.filter(f=>f!==id); saveFavorites(); renderRules(); renderFavorites(); }

  function setupEventListeners() {
    document.querySelectorAll('[data-panel]').forEach(i=>{ i.addEventListener('click',()=>navigateToPanel(i.dataset.panel)); });
    document.querySelectorAll('.quick-link[data-panel]').forEach(l=>{ l.addEventListener('click',()=>navigateToPanel(l.dataset.panel)); });
    const si=document.getElementById('searchInput'); let dt;
    si?.addEventListener('input',e=>{ clearTimeout(dt); dt=setTimeout(()=>SEARCH.search(e.target.value),150); });
    si?.addEventListener('keydown',e=>{ if(e.key==='ArrowDown'){e.preventDefault();SEARCH.focusNext();} else if(e.key==='ArrowUp'){e.preventDefault();SEARCH.focusPrev();} else if(e.key==='Enter'){const d=document.getElementById('searchResults');const f=d?.querySelector('.focused');if(f)SEARCH.navigateTo({type:f.dataset.type,id:f.dataset.id});} else if(e.key==='Escape'){SEARCH.dismissDropdown();si.blur();} });
    document.addEventListener('click',e=>{ const s=document.querySelector('.topbar-search'); if(s&&!s.contains(e.target))SEARCH.dismissDropdown(); });
    document.getElementById('searchResults')?.addEventListener('click',e=>{ const it=e.target.closest('.search-result-item'); if(it){it.classList.add('focused');setTimeout(()=>it.classList.remove('focused'),200);SEARCH.navigateTo({type:it.dataset.type,id:it.dataset.id});} });
    document.getElementById('searchModeToggle')?.addEventListener('click',()=>SEARCH.toggleAI());
    let isDark=true; document.getElementById('themeToggle')?.addEventListener('click',()=>{isDark=!isDark;document.documentElement.style.setProperty('--bg-primary',isDark?'#0a0a0f':'#f5f5fa');document.documentElement.style.setProperty('--bg-secondary',isDark?'#12121a':'#ffffff');document.documentElement.style.setProperty('--bg-tertiary',isDark?'#1a1a28':'#e8e8f0');document.documentElement.style.setProperty('--text-primary',isDark?'#e8e8f0':'#1a1a28');showToast(isDark?'Dark mode':'Light mode','info');});
    document.getElementById('settingsBtn')?.addEventListener('click',()=>{ document.getElementById('modalOverlay').classList.add('visible'); document.getElementById('modalContent').innerHTML=`<button class="modal-close" onclick="APP._close()">&times;</button><h3>Settings</h3>
      <div class="calc-field"><label class="calc-label">Export Data</label><button class="calc-btn" onclick="APP.exportData()">Download Backup (JSON)</button></div>
      <div class="calc-field" style="margin-top:12px"><label class="calc-label">Import Data</label><input type="file" class="calc-input" id="importFile" accept=".json"></div>
      <button class="calc-btn" onclick="APP.importData()" style="margin-top:8px">Upload Backup</button>
      <div class="calc-field" style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border-color)"><label class="calc-label" style="color:var(--accent-red)">Reset All Data</label><button class="calc-btn" onclick="APP.resetAll()" style="background:var(--accent-red);margin-top:4px">Delete Everything</button></div>`; });
    document.getElementById('sidebarToggle')?.addEventListener('click',()=>document.getElementById('sidebar')?.classList.toggle('open'));
    document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='k'){e.preventDefault();si?.focus();}}); }

  function exportData() { const d={warrants:WARRANT_DATA,favorites:FAVORITES,mapPins:MAP_PINS,wikiPages:JSON.parse(localStorage.getItem('cls_wiki_pages')||'[]'),exportedAt:new Date().toISOString()}; const b=new Blob([JSON.stringify(d,null,2)],{type:'application/json'}); const u=URL.createObjectURL(b); const a=document.createElement('a');a.href=u;a.download=`cls-wiki-${Date.now()}.json`;a.click();URL.revokeObjectURL(u); showToast('Exported!','success'); }
  function importData() { const f=document.getElementById('importFile')?.files?.[0]; if(!f)return; const r=new FileReader(); r.onload=e=>{try{const d=JSON.parse(e.target.result);if(d.warrants){WARRANT_DATA=d.warrants;saveWarrants();CALCS.renderWarrantList();}if(d.mapPins){MAP_PINS=d.mapPins;saveMapPins();}showToast('Imported!','success');}catch(err){showToast('Invalid file','error');}}; r.readAsText(f); }
  function resetAll() { if(!confirm('Delete ALL data?'))return; localStorage.clear();location.reload(); }
  function _close() { document.getElementById('modalOverlay').classList.remove('visible'); }

  return { init, navigateToPanel, toggleFav, removeFav, renderFavorites, exportData, importData, resetAll, _close };
})();

function showToast(msg, type='info') { const c=document.getElementById('toastContainer'); if(!c)return; const t=document.createElement('div'); t.className=`toast ${type}`; t.textContent=msg; c.appendChild(t); setTimeout(()=>t.remove(),3000); }
