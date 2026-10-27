/* Office Wahala service worker: makes the game work offline after the first visit.
   Bump VERSION whenever you deploy changes so players get the new files. */
const VERSION = 'ow-v2.0.0';
const SHELL = [
  './',
  'index.html',
  'style.css',
  'game.js',
  'music.js',
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;                 // review form posts go straight to the network
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;  // never cache other sites
  if (url.pathname.startsWith('/.netlify/')) return;

  // Pages: network first so updates show up, cache when offline.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => { const copy = res.clone(); caches.open(VERSION).then((c) => c.put('index.html', copy)); return res; })
        .catch(() => caches.match('index.html').then((r) => r || caches.match('./')))
    );
    return;
  }
  // Files: cache first, refresh in the background.
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((cached) => {
      const fresh = fetch(req).then((res) => {
        if (res && res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
        return res;
      }).catch(() => cached);
      return cached || fresh;
    })
  );
});
