// CityLife Santos Wiki — Service Worker (PWA offline support)
const CACHE_NAME = 'cls-wiki-v2';
const ASSETS = [
  './', './index.html', './wiki.html', './css/style.css',
  './js/data.js', './js/search.js', './js/map.js',
  './js/calculators.js', './js/wiki.js', './js/app.js',
  './community-wiki-data.json', './assets/manifest.json',
  './assets/icons/brand-logo.png', './assets/icons/icon-192.png', './assets/icons/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Don't cache dynamic data files — always fetch fresh
  if (e.request.url.includes('-data.json')) {
    e.respondWith(fetch(e.request));
    return;
  }
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(resp => {
      if (resp.status === 200) { const clone = resp.clone(); caches.open(CACHE_NAME).then(c => c.put(e.request, clone)); }
      return resp;
    }).catch(() => caches.match('./index.html')))
  );
});
