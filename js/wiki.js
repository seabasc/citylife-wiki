// CityLife Santos Wiki — Wiki Pages (Part 1/2)
const WIKI = (() => {
  function getPages() { const s=localStorage.getItem('cls_wiki_pages'); return s?JSON.parse(s):DEFAULT_WIKI_PAGES; }
  function savePages(p) { localStorage.setItem('cls_wiki_pages', JSON.stringify(p)); }
  function md(t) {
    if(!t)return '';
    let h=t.replace(/^### (.+)$/gm,'<h3>$1</h3>').replace(/^## (.+)$/gm,'<h2>$1</h2>').replace(/^# (.+)$/gm,'<h2>$1</h2>');
    h=h.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\*(.+?)\*/g,'<em>$1</em>').replace(/`([^`]+)`/g,'<code>$1</code>');
    h=h.replace(/^&gt; (.+)$/gm,'<blockquote style="border-left:3px solid var(--accent-purple);padding-left:12px;color:var(--text-secondary);margin:8px 0">$1</blockquote>');
    h=h.replace(/^- (.+)$/gm,'<li>$1</li>').replace(/^(\d+)\. (.+)$/gm,'<li>$2</li>');
    h=h.replace(/\n\n/g,'</p><p>').replace(/\n/g,'<br>');
    h=h.replace(/((?:<li>.*?<\/li><br>?)+)/g,m=>`<ul>${m.replace(/<br>/g,'')}</ul>`);
    return `<div class="wiki-page-content"><p>${h}</p></div>`;
  }
  function renderWikiList() {
    const pages=getPages(), c=document.getElementById('wikiContent'); if(!c)return;
    let h='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;margin-bottom:32px;">';
    pages.forEach(p=>{ const wc=(p.content||'').split(/\s+/).length;
      h+=`<div class="quick-link" onclick="WIKI.showPage('${p.id}')"><div class="quick-link-icon">&#x1F4D6;</div><div class="quick-link-title">${p.title}</div><div class="quick-link-desc">${wc} words</div></div>`; });
    h+='</div><button class="calc-btn" onclick="WIKI.createPage()" style="max-width:200px">+ New Page</button>'; c.innerHTML=h;
  }

  function showPage(id) { const pages=getPages(), pg=pages.find(p=>p.id===id); if(!pg)return;
    document.getElementById('wikiContent').innerHTML=`<div style="display:flex;justify-content:space-between;margin-bottom:24px">
      <button class="action-btn" onclick="WIKI.renderWikiList()" style="width:auto;padding:8px 16px;font-size:.85rem;background:var(--bg-tertiary);border-radius:var(--r-sm)">&#x2190; Back</button>
      <div style="display:flex;gap:8px"><button class="action-btn" onclick="WIKI.editPage('${pg.id}')">&#x1F4DD;</button><button class="action-btn" onclick="WIKI._toggleFav('wiki-${pg.id}')">${FAVORITES.includes('wiki-'+pg.id)?'&#x2B50;':'&#x2606;'}</button></div></div>`;
    document.getElementById('wikiContent').innerHTML+=md(pg.content)+`<div style="margin-top:32px;padding-top:16px;border-top:1px solid var(--border-color);display:flex;gap:8px">
      <button class="action-btn" onclick="WIKI.editPage('${pg.id}')">&#x1F4DD; Edit</button>
      <button class="action-btn" onclick="WIKI.deletePage('${pg.id}')" style="color:var(--accent-red)">&#x1F5D1; Delete</button></div>`;
    document.getElementById('mainContent').scrollTop=0;
  }

  function editPage(id) { const pages=getPages(), pg=pages.find(p=>p.id===id); if(!pg)return;
    document.getElementById('modalOverlay').classList.add('visible');
    document.getElementById('modalContent').innerHTML=`<button class="modal-close" onclick="WIKI._close()">&times;</button><h3>Edit Page</h3>
      <div class="calc-field"><label class="calc-label">Title</label><input type="text" class="calc-input" id="wikiEditTitle" value="${pg.title}"></div>
      <div class="calc-field"><label class="calc-label">Content</label><textarea class="calc-input" id="wikiEditContent" rows="15" style="font-family:var(--font-mono);font-size:.85rem;resize:vertical">${pg.content}</textarea></div>
      <button class="calc-btn" onclick="WIKI._saveEdit('${pg.id}')" style="margin-top:12px">Save</button>`; }

  function _saveEdit(id) { const t=document.getElementById('wikiEditTitle').value.trim(); const c=document.getElementById('wikiEditContent').value;
    if(!t)return showToast('Title required','error'); const pages=getPages(), pg=pages.find(p=>p.id===id); if(pg){pg.title=t;pg.content=c;} savePages(pages); showPage(id); WIKI.renderWikiList(); _close(); showToast('Saved!','success'); }
  function createPage() { const pages=getPages(), np={id:'page-'+Date.now(),title:'Untitled',content:'# New Page\n\nWrite here...'}; pages.push(np); savePages(pages); showPage(np.id); renderWikiList(); }
  function deletePage(id) { if(!confirm('Delete?'))return; savePages(getPages().filter(p=>p.id!==id)); renderWikiList(); showToast('Deleted','info'); }
  function _close() { document.getElementById('modalOverlay').classList.remove('visible'); }

  return { renderWikiList, showPage, editPage, createPage, deletePage, _toggleFav: (id) => { if(FAVORITES.includes(id)) FAVORITES=FAVORITES.filter(f=>f!==id); else FAVORITES.push(id); saveFavorites(); }, _close };
})();
