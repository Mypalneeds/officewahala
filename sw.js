/* Office Wahala service worker: makes the game work offline after the first visit.
   Bump VERSION whenever you deploy changes so players get the new files. */
const VERSION = 'ow-v8.2.0';
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
  'icons/favicon-32.png',
  'icons/logo-mark-96.webp',
  'favicon.ico',
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

/* ---------- v7: opt-in reminders (local only, no push server, no sign-up) ----------
   The game writes a small config into the "ow-config" cache when reminders are on.
   Browsers that support Periodic Background Sync wake us about twice a day; we show
   at most one notification per day, and only for something useful. */
const CFG_URL = '/__ow_config';
const lagosToday = () => new Date(Date.now() + 3600e3).toISOString().slice(0, 10);
const lagosWeekday = () => new Date(Date.now() + 3600e3).getUTCDay();

async function readCfg() {
  const c = await caches.open('ow-config');
  const r = await c.match(CFG_URL);
  return r ? r.json() : null;
}
async function writeCfg(cfg) {
  const c = await caches.open('ow-config');
  await c.put(CFG_URL, new Response(JSON.stringify(cfg), { headers: { 'content-type': 'application/json' } }));
}

async function rivalNote(cfg) {
  if (!cfg.api || !cfg.leagues || !cfg.leagues.length) return null;
  const ranks = cfg.ranks || {};
  let note = null;
  for (const code of cfg.leagues.slice(0, 6)) {
    try {
      const res = await fetch(cfg.api.replace(/\/$/, '') + '/' + encodeURIComponent(code) + '?me=' + encodeURIComponent(cfg.playerId), { cache: 'no-store' });
      if (!res.ok) continue;
      const b = await res.json();
      const me = b.me || {};
      const prev = ranks[code];
      if (!note && me.rank && prev && prev.rank && me.rank > prev.rank && b.round && prev.round === b.round.n) {
        const above = (b.players || [])[me.rank - 2];
        note = { title: 'Your colleague passed you!', body: (above ? above.name : 'Someone') + ' pushed you down to #' + me.rank + ' in ' + b.name + '. Time for one shift?', tag: 'ow-rival' };
      }
      if (me.rank && b.round) ranks[code] = { rank: me.rank, round: b.round.n };
    } catch (e) { /* offline: skip */ }
  }
  cfg.ranks = ranks;
  return note;
}

async function reminderCheck() {
  const cfg = await readCfg().catch(() => null);
  if (!cfg || !cfg.on || !self.registration.showNotification) return;
  if (typeof Notification !== 'undefined' && Notification.permission !== 'granted') return;
  const today = lagosToday();
  if (cfg.lastNote === today) return;
  let note = await rivalNote(cfg);
  if (!note && cfg.attLast !== today) {
    note = { title: 'The register is open', body: 'Sign in at Wahala & Sons today' + (cfg.attDayNext ? ' for ₦' + Number(cfg.attDayNext).toLocaleString('en-NG') : '') + '. Oga is watching.', tag: 'ow-register' };
  }
  if (!note && lagosWeekday() === 1) note = { title: 'New weekly challenges', body: 'Fresh challenges are on the notice board this week.', tag: 'ow-weekly' };
  if (note) {
    await self.registration.showNotification(note.title, { body: note.body, tag: note.tag, icon: 'icons/icon-192.png', badge: 'icons/favicon-32.png', data: { url: './' } });
    cfg.lastNote = today;
  }
  await writeCfg(cfg).catch(() => {});
}

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'ow-reminders') event.waitUntil(reminderCheck());
});
// Lets the game ask for a check right away (used by tests and on some browsers).
self.addEventListener('message', (event) => {
  if (event.data === 'ow-reminder-check') event.waitUntil(reminderCheck());
});
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) if ('focus' in c) return c.focus();
      return self.clients.openWindow ? self.clients.openWindow((event.notification.data && event.notification.data.url) || './') : null;
    })
  );
});
