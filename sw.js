/* Office Wahala service worker: makes the game work offline after the first visit.
   Bump VERSION whenever you deploy changes so players get the new files. */
const VERSION = 'ow-v4.1.0';
const SHELL = [
  './',
  'index.html',
  'style.css',
  'game.js',
  'music.js',
  'voice.js',
  'analytics.js',
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
  if (url.pathname.startsWith('/.netlify/') || url.pathname.startsWith('/api/') || url.pathname.startsWith('/dashboard')) return;

  // Pages: network first so updates show up; offline, use the cached copy of that page,
  // or the game itself for any page we don't have.
  if (req.mode === 'navigate') {
    const key = url.pathname.endsWith('/') ? url.pathname + 'index.html' : url.pathname;
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.ok && !url.pathname.startsWith('/dashboard')) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(key, copy)); }
          return res;
        })
        .catch(() => caches.match(key).then((r) => r || caches.match('index.html')).then((r) => r || caches.match('./')))
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
