// Operation: Ascent service worker
const V = 'ascent-v1';
const SHELL = ['./', 'index.html', 'style.css', 'script.js', 'manifest.json', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const same = new URL(r.url).origin === location.origin;
  if (same) {
    // App files: network first so updates arrive, cache as offline fallback
    e.respondWith(
      fetch(r).then(res => { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); return res; })
        .catch(() => caches.match(r, { ignoreSearch: true }).then(m => m || (r.mode === 'navigate' ? caches.match('index.html') : undefined)))
    );
  } else {
    // Fonts, MediaPipe library and pose model: cache first, saved after first download
    e.respondWith(
      caches.match(r).then(m => m || fetch(r).then(res => {
        if (res.ok || res.type === 'opaque') { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); }
        return res;
      }))
    );
  }
});
