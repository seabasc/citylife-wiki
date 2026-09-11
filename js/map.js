// CityLife Santos Wiki — Map Integration (Part 1/2)
const MAP = (() => {
  let map = null;
  let currentLayer = 'roadmap';
  let customLayers = { roadmap: null, satellite: null, atlus: null };
  const LAYER_COLORS = { police:'var(--accent-blue)', military:'var(--accent-red)', gang:'var(--accent-purple)', territory:'var(--accent-orange)', business:'var(--accent-green)', escape:'var(--accent-cyan)', other:'#9898b0' };

  function init() {
    map = L.map('map-view', { center:[30.7, -117.2], zoom:5, zoomControl:false });
    window._currentMap = map;

    // Standard tile layers
    customLayers.roadmap = L.imageOverlay("https://www.bragitoff.com/wp-content/uploads/2015/11/GTAV-HD-MAP-roadmap.jpg", [[30.5, -119.2], [31.6, -117.1]]).addTo(map);

    customLayers.satellite = L.imageOverlay("https://www.bragitoff.com/wp-content/uploads/2015/11/GTAV-HD-MAP-satellite.jpg", [[30.5, -119.2], [31.6, -117.1]]);

    customLayers.atlus = L.imageOverlay("https://www.bragitoff.com/wp-content/uploads/2015/11/GTAV_ATLUS_8192x8192.png", [[30.5, -119.2], [31.6, -117.1]]);

    // Load map pins from localStorage
    loadPins();

    // Setup layer switching
    document.querySelectorAll('.layer-tab').forEach(tab => {
      tab.addEventListener('click', () => switchLayer(tab.dataset.layer));
    });

    // Setup click to add pin
    map.on('click', onMapClick);
  }

  function switchLayer(name) {
    Object.values(customLayers).forEach(l => map.removeLayer(l));
    customLayers[name].addTo(map);
    currentLayer = name;
    document.querySelectorAll('.layer-tab').forEach(t => t.classList.toggle('active', t.dataset.layer === name));
  }

  // Color-coded markers for pins
  function getPinColor(category) {
    return LAYER_COLORS[category] || '#9898b0';
  }

  function createIcon(color) {
    return L.divIcon({
      className: 'custom-pin',
      html: `<div style="width:28px;height:28px;background:${color};border-radius:50%;border:3px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;">
        <div style="width:8px;height:8px;background:#fff;border-radius:50%;"></div></div>`,
      iconSize:[28,28], iconAnchor:[14,14], popupAnchor:[0,-14]
    });
  }

  function loadPins() {
    MAP_PINS.forEach(pin => addPinToMap(pin));
  }

  function addPinToMap(pin) {
    if (!map || !pin.lat || !pin.lng) return;
    const icon = createIcon(getPinColor(pin.category));
    const marker = L.marker([pin.lat, pin.lng], { icon }).addTo(map);
    marker.bindPopup(createPinPopup(pin), { maxWidth:250 });
    marker._pinId = pin.id;
  }

  function createPinPopup(pin) {
    return `<div class="pin-popup">
      <h4>${pin.title}</h4>
      ${pin.description ? `<p>${pin.description}</p>` : ''}
      <span class="pin-category" style="background:${getPinColor(pin.category)}22;color:${getPinColor(pin.category)}">${pin.category || 'other'}</span><br>
      <button class="pin-delete-btn" onclick="MAP.removePin(${pin.id})">Delete Pin</button>
    </div>`;
  }

  function onMapClick(e) {
    const { lat, lng } = e.latlng;
    // Show add pin dialog
    showAddPinModal(lat, lng);
  }

  function showAddPinModal(lat, lng) {
    const overlay = document.getElementById('modalOverlay');
    const content = document.getElementById('modalContent');
    const cats = Object.keys(LAYER_COLORS).join('</option><option value="');
    content.innerHTML = `
      <button class="modal-close" onclick="MAP.closeModal()">&times;</button>
      <h3>Add Map Pin</h3>
      <div class="calc-field"><label class="calc-label">Title</label>
        <input type="text" class="calc-input" id="pinTitle" placeholder="e.g. Gun Store Location"></div>
      <div class="calc-field"><label class="calc-label">Description</label>
        <textarea class="calc-input" id="pinDesc" rows="3" placeholder="Notes about this location..."></textarea></div>
      <div class="calc-field"><label class="calc-label">Category</label>
        <select class="calc-input" id="pinCat"><option value="${cats}">other</option></select></div>
      <button class="calc-btn" onclick="MAP.savePin(${lat},${lng})" style="margin-top:12px;">Save Pin</button>`;
    overlay.classList.add('visible');
  }

  function savePin(lat, lng) {
    const title = document.getElementById('pinTitle').value.trim();
    if (!title) return showToast('Please enter a title', 'error');
    const pin = { id: Date.now(), lat, lng, title, description:document.getElementById('pinDesc').value.trim(), category:document.getElementById('pinCat').value };
    MAP_PINS.push(pin); saveMapPins();
    addPinToMap(pin);
    closeModal();
    showToast(`Pin "${title}" saved!`, 'success');
  }

  function removePin(id) {
    MAP_PINS = MAP_PINS.filter(p => p.id !== id); saveMapPins();
    map.eachLayer(l => { if (l._pinId === id) map.removeLayer(l); });
    showToast('Pin removed', 'info');
  }

  function closeModal() { document.getElementById('modalOverlay').classList.remove('visible'); }

  return { init, switchLayer, removePin, savePin, closeModal };
})();
