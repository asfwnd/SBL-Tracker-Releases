const CACHE = 'sbl-tracker-v2'; // bumped: now also caches the icon files the themed-icon regeneration reads from

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png']))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first for index.html so a fresh version loads whenever there's a
// connection, falling back to the cached copy the moment signal drops —
// everything else (fonts/CDN scripts already inline) just passes through.
self.addEventListener('fetch', (e) => {
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).then((res) => {
        caches.open(CACHE).then((cache) => cache.put(e.request, res.clone()));
        return res;
      }).catch(() => caches.match(e.request).then((res) => res || caches.match('./index.html')))
    );
  }
});
