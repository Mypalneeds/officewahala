/* ==========================================================
   OFFICE WAHALA — anonymous, cookie-free analytics
   Sends small batches of gameplay events to /api/track (a Netlify
   Function). No cookies, no names, no IP addresses stored. Players can
   switch it off in Settings; Do Not Track / Global Privacy Control
   start it switched off. On hosts without the function it stays silent.
   Usage from other scripts:  window.OWTrack('game_start', { mode: 'normal' })
   ========================================================== */
(function () {
  'use strict';
  var SCRIPT = document.currentScript && document.currentScript.src;
  var API = new URL('api/track', SCRIPT || location.href).href;
  var VERSION = '5.0.0';
  var MAX_QUEUE = 300;

  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } }
  function sget(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function sset(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* ignore */ } }
  function rid(n) { var s = '', a = 'abcdefghijklmnopqrstuvwxyz0123456789'; for (var i = 0; i < n; i++) s += a[(Math.random() * 36) | 0]; return s; }

  var privacySignal = navigator.doNotTrack === '1' || window.doNotTrack === '1' || navigator.globalPrivacyControl === true;
  function isOn() { var v = get('ow_track'); return v === null ? !privacySignal : v === '1'; }
  var automated = navigator.webdriver && !/[?&]trackdebug\b/.test(location.search);

  // visitor + session ids
  var first = false;
  var vid = get('ow_vid');
  if (!/^[a-z0-9]{8,40}$/.test(vid || '')) { vid = rid(20); set('ow_vid', vid); first = true; }
  var now = Date.now();
  var sid = sget('ow_sid');
  var last = parseInt(get('ow_last') || '0', 10);
  if (!sid || now - last > 30 * 60 * 1000) { sid = rid(16); sset('ow_sid', sid); }
  set('ow_last', String(now));

  // context sent with each batch
  function device() {
    var ua = navigator.userAgent || '';
    var touch = (navigator.maxTouchPoints || 0) > 0;
    var w = Math.min(screen.width || 0, screen.height || 0);
    if (/ipad|tablet/i.test(ua) || (touch && w >= 600)) return 'tablet';
    if (/mobi|android|iphone/i.test(ua) || (touch && w < 600)) return 'phone';
    return 'desktop';
  }
  var q = new URLSearchParams(location.search);
  var ref = '';
  try { if (document.referrer) { var r = new URL(document.referrer); if (r.host !== location.host) ref = r.host.replace(/^www\./, ''); } } catch (e) { /* ignore */ }
  var utm = { src: q.get('utm_source') || '', med: q.get('utm_medium') || '', cmp: q.get('utm_campaign') || '' };
  if (!utm.src && q.get('beat')) utm.src = 'challenge-link';
  if (!utm.src && q.get('league')) utm.src = 'league-invite';
  if (utm.src) sset('ow_utm', JSON.stringify(utm)); else { try { utm = JSON.parse(sget('ow_utm') || 'null') || utm; } catch (e) { /* ignore */ } }
  if (ref) sset('ow_ref', ref); else ref = sget('ow_ref') || '';
  var standalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
  function ctx() {
    return { ref: ref, src: utm.src, med: utm.med, cmp: utm.cmp, lang: navigator.language || '', dev: device(),
      sw: Math.round((window.innerWidth || 0) / 100) * 100, app: !!standalone, gl: get('ow_lang') === 'pcm' ? 'pcm' : 'en', ver: VERSION };
  }

  var queue = [];
  var enabled = null; // null = not checked yet
  var sending = false;

  function track(name, props) {
    if (automated || enabled === false || !isOn()) return;
    if (queue.length >= MAX_QUEUE) queue.shift();
    queue.push({ n: name, t: Date.now(), p: props || {} });
    set('ow_last', String(Date.now()));
    if (enabled && queue.length >= 25) flush();
  }
  function payload(batch) { return JSON.stringify({ v: vid, s: sid, c: ctx(), e: batch }); }
  function flush(useBeacon) {
    if (!enabled || !queue.length || (sending && !useBeacon)) return;
    var batch = queue.splice(0, 50);
    var body = payload(batch);
    if (useBeacon && navigator.sendBeacon) {
      try { if (navigator.sendBeacon(API, new Blob([body], { type: 'text/plain' }))) return; } catch (e) { /* fall through */ }
    }
    sending = true;
    fetch(API, { method: 'POST', body: body, keepalive: true, headers: { 'content-type': 'text/plain' } })
      .then(function (r) { if (!r.ok && r.status >= 500) queue = batch.concat(queue).slice(0, MAX_QUEUE); })
      .catch(function () { queue = batch.concat(queue).slice(0, MAX_QUEUE); })
      .then(function () { sending = false; if (queue.length >= 25) flush(); });
  }

  // visible time
  var visibleSince = document.visibilityState === 'visible' ? Date.now() : 0;
  function endVisible() {
    if (!visibleSince) return;
    var secs = Math.round((Date.now() - visibleSince) / 1000);
    visibleSince = 0;
    if (secs >= 1) track('visible_time', { secs: secs });
  }
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') { endVisible(); flush(true); }
    else visibleSince = Date.now();
  });
  window.addEventListener('pagehide', function () { endVisible(); flush(true); });

  // errors (max 5 per page)
  var errCount = 0;
  function err(m, src) {
    if (errCount++ >= 5) return;
    track('js_error', { m: String(m || 'error').slice(0, 140), src: String(src || '').replace(location.origin, '').slice(0, 60) });
  }
  window.addEventListener('error', function (e) { err(e.message, e.filename ? e.filename + ':' + e.lineno : ''); });
  window.addEventListener('unhandledrejection', function (e) { err('Promise: ' + (e.reason && e.reason.message ? e.reason.message : String(e.reason))); });

  // first page view
  track('page_view', { path: location.pathname, first: first, title: document.title.slice(0, 80) });

  // Only start sending once the server says analytics are live (static hosts answer {ok:false}).
  if (/^https?:$/.test(location.protocol) && !automated && isOn()) {
    fetch(API + '/health', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { enabled = !!(j && j.ok); if (enabled) flush(); else queue = []; })
      .catch(function () { enabled = false; queue = []; });
  }
  setInterval(function () { flush(); }, 20000);

  track.flush = function () { flush(); };
  track.isOn = isOn;
  track.active = function () { return enabled === true && isOn() && !automated; };
  track.setEnabled = function (on) {
    set('ow_track', on ? '1' : '0');
    if (!on) { queue = []; return; }
    if (enabled === null && /^https?:$/.test(location.protocol) && !automated) {
      fetch(API + '/health', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; })
        .then(function (j) { enabled = !!(j && j.ok); if (enabled) flush(); }).catch(function () { enabled = false; });
    }
  };
  track.ids = function () { return { vid: vid, sid: sid }; };
  window.OWTrack = track;
})();
