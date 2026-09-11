// CityLife Santos Wiki — Calculators (Part 1/3)
const CALCS = (() => {
  function formatTime(minutes) {
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const h = Math.floor(minutes / 60); const m = Math.round(minutes % 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }

  function calculateHeat() {
    const level = parseInt(document.getElementById('heatLevel')?.value) || 0;
    const rate = document.getElementById('heatDecayRate')?.value || 'normal';
    if (level <= 0) return document.getElementById('heatResult').innerHTML = '<div class="calc-result">Heat is at 0 — you\'re clear!</div>';
    const baseTime = level * 3; let totalMin = baseTime;
    switch(rate) { case 'cold': totalMin *= 1.4; break; case 'indoors': totalMin *= 1.2; break; default: totalMin *= 0.75; }
    const endTime = new Date(Date.now() + totalMin * 60000);
    document.getElementById('heatResult').innerHTML = `<div><strong>Current Heat:</strong> ${level}/100</div><div><strong>Decay Rate:</strong> ${rate}</div><div style="margin-top:8px"><strong>Clears at:</strong> ${endTime.toLocaleTimeString()}</div><div style="margin-top:4px"><strong>Wait time:</strong> ${formatTime(totalMin)}</div>`;
    showToast(`Heat timer set! Clears in ${formatTime(totalMin)}`, 'success');
  }

  function calculateLoot() {
    const bodies = parseInt(document.getElementById('bodyCount')?.value) || 1;
    const tpb = parseFloat(document.getElementById('timePerBody')?.value) || 8;
    const totalSec = bodies * tpb; const buffer = totalSec * 0.3;
    document.getElementById('friskResult').innerHTML = `<div><strong>Bodies:</strong> ${bodies}</div><div style="margin-top:8px"><strong>Total time:</strong> ${formatTime(totalSec/60)}</div><div style="color:var(--accent-orange)"><strong>Buffer (+${Math.round(buffer)}s):</strong></div><div style="color:var(--accent-green);margin-top:4px"><strong>Safe total:</strong> ${formatTime((totalSec+buffer)/60)}</div>`;
  function addWarrant() {
    const name = document.getElementById('warnPlayerName')?.value.trim();
    if (!name) return showToast('Enter a player name', 'error');
    if (WARNANT_DATA.find(w => w.name.toLowerCase() === name.toLowerCase())) return showToast(`${name} already exists`, 'info');
    WARRANT_DATA.push({ id:Date.now(), name, strikes:[false,false,false,false,false] });
    saveWarrants(); renderWarrantList(); document.getElementById('warnPlayerName').value = '';
    showToast(`Added ${name}`, 'success');
  }

  function toggleStrike(pid, si) { const p=WARRANT_DATA.find(w=>w.id===pid); if(!p)return; p.strikes[si]=!p.strikes[si]; saveWarrants(); renderWarrantList(); }
  function removePlayer(pid) { WARRANT_DATA=WARRANT_DATA.filter(w=>w.id!==pid); saveWarrants(); renderWarrantList(); showToast('Removed','info'); }

  function getStrikeColor(count) { if(count>=4)return 'var(--accent-red)'; if(count>=2)return 'var(--accent-orange)'; return 'var(--text-muted)'; }

  function calculateCapacity() {
    const total = parseInt(document.getElementById('totalMembers')?.value)||0; const teams = parseInt(document.getElementById('teamCount')?.value)||3;
    if(total<=0) return document.getElementById('capacityResult').innerHTML='<div class="calc-result">Enter valid count</div>';
    const base=Math.floor(total/teams); let rem=total%teams; let html='<div style="margin-bottom:8px"><strong>Breakdown:</strong></div>';
    ['Assault','Support','Scavenger','Backup','Flank'].slice(0,teams).forEach((name,i) => { html+=`<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:.82rem"><span>Team ${i+1} (${name})</span><strong>${base+(rem-->0?1:0)} members</strong></div>`; });
    document.getElementById('capacityResult').innerHTML=html+`<div style="margin-top:8px;padding-top:8px;border-top:1px solid rgba(139,92,246,.2)"><strong>Total:</strong> ${total}</div>`;
  }

  function renderWarrantList() {
    const c=document.getElementById('warrantList'); if(!c)return;
    if(WARRANT_DATA.length===0){c.innerHTML='<p style="color:var(--text-muted);font-size:.85rem;text-align:center;padding:24px">No players added yet.</p>';return;}
    let html=''; WARRANT_DATA.forEach(p=>{ const cnt=p.strikes.filter(Boolean).length; const col=getStrikeColor(cnt);
      html+=`<div class="warn-row" style="border-bottom:1px solid var(--border-color)"><span class="player-name">${p.name}</span><span style="font-size:.7rem;color:${col}">${cnt}/5</span>
      <div class="warn-dots">${p.strikes.map((s,i)=>`<div class="warn-dot ${s?'filled':''}" onclick="CALCS.toggleStrike(${p.id},${i})"></div>`).join('')}</div>
      <button class="action-btn" style="width:28px;height:28px;font-size:.7rem;padding:0" onclick="CALCS.removePlayer(${p.id})">&times;</button></div>`; });
    c.innerHTML=html;
  }

  return { calculateHeat, calculateLoot, addWarrant, toggleStrike, removePlayer, calculateCapacity, renderWarrantList };
})();

    showToast(`Loot timer: ${Math.round(totalSec)}s`, 'info');
  }
