/* Office Wahala analytics: shared helpers for the track and stats functions.
   Raw event batches are stored per hour (append-only, no write conflicts),
   then rolled up into hourly and daily aggregates that are cached once complete. */

export const EVENTS = new Set([
  'page_view', 'visible_time', 'screen', 'js_error',
  'game_start', 'commute_end', 'level_up', 'boss', 'event_start', 'blackout', 'powerup_pick', 'powerup_use', 'task_done',
  'game_over', 'career_day', 'promotion', 'badge', 'boss_key',
  'share', 'challenge_open', 'review_submit', 'league_create', 'league_join', 'league_play', 'league_admin', 'shop_tab', 'look_buy',
  'shop_buy', 'outfit_buy', 'setting', 'install_prompt', 'install_click', 'install_done',
  'ad_view', 'ad_click',
]);

const BOT_UA = /bot|crawl|spider|slurp|facebookexternalhit|headless|lighthouse|pagespeed|phantom|puppeteer|playwright|python|curl|wget|httpclient/i;
export const isBot = (ua) => !ua || BOT_UA.test(ua);

// Lagos time (UTC+1) day and hour keys
export function lagos(ts) {
  const d = new Date(ts + 3600 * 1000);
  return { day: d.toISOString().slice(0, 10), hour: d.getUTCHours() };
}
export const pad2 = (n) => String(n).padStart(2, '0');

const ID = /^[a-z0-9]{8,40}$/;
const clip = (v, n) => String(v == null ? '' : v).replace(/[\u0000-\u001f]/g, ' ').slice(0, n);

function cleanProps(p) {
  const out = {};
  if (!p || typeof p !== 'object') return out;
  let n = 0;
  for (const [k, v] of Object.entries(p)) {
    if (n++ >= 14) break;
    if (!/^[a-z_]{1,20}$/i.test(k)) continue;
    if (typeof v === 'number' && Number.isFinite(v)) out[k] = Math.round(v * 100) / 100;
    else if (typeof v === 'boolean') out[k] = v;
    else if (typeof v === 'string') out[k] = clip(v, 140);
  }
  return out;
}
function cleanCtx(c) {
  c = c && typeof c === 'object' ? c : {};
  return {
    ref: clip(c.ref, 80).toLowerCase(),
    src: clip(c.src, 40).toLowerCase(),
    med: clip(c.med, 40).toLowerCase(),
    cmp: clip(c.cmp, 60).toLowerCase(),
    lang: clip(c.lang, 12).toLowerCase(),
    dev: ['phone', 'tablet', 'desktop'].includes(c.dev) ? c.dev : 'other',
    sw: Number.isFinite(c.sw) ? Math.round(c.sw) : 0,
    app: !!c.app,
    gl: c.gl === 'pcm' ? 'pcm' : 'en',
    ver: clip(c.ver, 12),
  };
}

// Validate an incoming batch. Returns a clean record or throws.
export function cleanBatch(body, now = Date.now()) {
  if (!body || typeof body !== 'object') throw new Error('bad body');
  if (!ID.test(body.v || '') || !ID.test(body.s || '')) throw new Error('bad ids');
  if (!Array.isArray(body.e) || body.e.length === 0 || body.e.length > 60) throw new Error('bad events');
  const e = [];
  for (const ev of body.e) {
    if (!ev || !EVENTS.has(ev.n)) continue;
    let t = Number(ev.t);
    if (!Number.isFinite(t) || t < now - 2 * 86400000 || t > now + 300000) t = now;
    e.push({ n: ev.n, t: Math.round(t), p: cleanProps(ev.p) });
  }
  if (!e.length) throw new Error('no valid events');
  return { v: body.v, s: body.s, c: cleanCtx(body.c), e };
}

/* ---------------- aggregation ---------------- */
const DIMS = ['path', 'ref', 'src', 'country', 'dev', 'lang', 'gl', 'app', 'mode', 'cause', 'level', 'scoreb', 'boss', 'event', 'pick', 'power',
  'commute', 'blackout', 'shop', 'outfit', 'badge', 'setting', 'share', 'screen', 'career', 'adv', 'adc', 'install'];
const FUNNEL = ['view', 'start', 'arrive', 'lvl3', 'over', 'share'];

export function emptyAgg() {
  const a = { pv: 0, vids: {}, newv: {}, sids: {}, ev: {}, dims: {}, games: 0, overs: 0, play: 0, office: 0, scoreSum: 0, maxScore: 0,
    visible: 0, naira: 0, hours: Array.from({ length: 24 }, () => ({ v: {}, g: 0, pv: 0 })), funnel: {}, errors: {}, last: {} };
  for (const d of DIMS) a.dims[d] = {};
  for (const f of FUNNEL) a.funnel[f] = {};
  return a;
}
const inc = (m, k, n = 1) => { if (k === undefined || k === null || k === '') return; m[k] = (m[k] || 0) + n; };
const scoreBucket = (s) => (s < 500 ? '0-499' : s < 1500 ? '500-1.5k' : s < 3000 ? '1.5k-3k' : s < 6000 ? '3k-6k' : s < 10000 ? '6k-10k' : '10k+');
const levelBucket = (l) => (l <= 1 ? '1' : l <= 2 ? '2' : l <= 3 ? '3' : l <= 5 ? '4-5' : l <= 9 ? '6-9' : l <= 14 ? '10-14' : '15+');

export function addBatch(a, b) {
  const { v, s, c } = b;
  a.vids[v] = 1;
  a.sids[s] = 1;
  for (const ev of b.e) {
    const p = ev.p || {};
    const h = lagos(ev.t).hour;
    a.hours[h].v[v] = 1;
    inc(a.ev, ev.n);
    if (!a.last[v] || ev.t > a.last[v]) a.last[v] = ev.t;
    switch (ev.n) {
      case 'page_view':
        a.pv++; a.hours[h].pv++;
        a.funnel.view[s] = 1;
        inc(a.dims.path, p.path || '/');
        inc(a.dims.ref, c.ref || 'direct');
        if (c.src) inc(a.dims.src, c.src + (c.med ? ' / ' + c.med : '') + (c.cmp ? ' / ' + c.cmp : ''));
        inc(a.dims.country, b.cc || '??');
        inc(a.dims.dev, c.dev);
        inc(a.dims.lang, (c.lang || '').slice(0, 2) || '??');
        inc(a.dims.gl, c.gl);
        inc(a.dims.app, c.app ? 'installed app' : 'browser');
        if (p.first) a.newv[v] = 1;
        break;
      case 'visible_time': a.visible += Math.min(3600, Math.max(0, p.secs || 0)); break;
      case 'screen': inc(a.dims.screen, p.name); break;
      case 'js_error': if (Object.keys(a.errors).length < 60 || a.errors[p.m]) inc(a.errors, (p.m || 'unknown') + (p.src ? ' @ ' + p.src : '')); break;
      case 'game_start': a.games++; a.hours[h].g++; inc(a.dims.mode, p.mode || 'normal'); a.funnel.start[s] = 1; break;
      case 'commute_end': a.funnel.arrive[s] = 1; inc(a.dims.commute, p.skipped ? 'skipped' : p.late > 0 ? 'late' : 'on time'); break;
      case 'level_up': if ((p.level || 0) >= 3) a.funnel.lvl3[s] = 1; break;
      case 'boss': inc(a.dims.boss, p.type); break;
      case 'event_start': inc(a.dims.event, p.id); break;
      case 'blackout': inc(a.dims.blackout, p.survived ? 'survived' : 'hit'); break;
      case 'powerup_pick': inc(a.dims.pick, p.id); break;
      case 'powerup_use': inc(a.dims.power, p.id); break;
      case 'game_over': {
        a.overs++;
        a.play += Math.min(7200, Math.max(0, p.real || 0));
        a.office += Math.min(7200, Math.max(0, p.secs || 0));
        a.scoreSum += Math.max(0, p.score || 0);
        a.maxScore = Math.max(a.maxScore, p.score || 0);
        inc(a.dims.scoreb, scoreBucket(p.score || 0));
        inc(a.dims.level, levelBucket(p.level || 1));
        inc(a.dims.cause, p.cause || 'unknown');
        a.funnel.over[s] = 1;
        if ((p.level || 0) >= 3) a.funnel.lvl3[s] = 1;
        break;
      }
      case 'career_day': inc(a.dims.career, (['Mon', 'Tue', 'Wed', 'Thu', 'Fri'][p.day] || '?') + (p.success ? ' done' : ' failed')); break;
      case 'badge': inc(a.dims.badge, p.id); break;
      case 'share': inc(a.dims.share, p.kind); a.funnel.share[s] = 1; break;
      case 'shop_buy': inc(a.dims.shop, p.id); a.naira += p.price || 0; break;
      case 'outfit_buy': inc(a.dims.outfit, p.id); a.naira += p.price || 0; break;
      case 'look_buy': inc(a.dims.outfit, (p.kind || 'look') + ': ' + p.id); a.naira += p.price || 0; break;
      case 'setting': inc(a.dims.setting, p.k + ': ' + p.v); break;
      case 'install_prompt': case 'install_click': case 'install_done': inc(a.dims.install, ev.n.replace('install_', '')); break;
      case 'ad_view': inc(a.dims.adv, p.id + '|' + (p.where || '?')); break;
      case 'ad_click': inc(a.dims.adc, p.id + '|' + (p.where || '?')); break;
    }
  }
  return a;
}

const mergeMap = (x, y) => { for (const [k, n] of Object.entries(y || {})) x[k] = (x[k] || 0) + n; return x; };
const mergeSet = (x, y) => { for (const k of Object.keys(y || {})) x[k] = 1; return x; };
export function mergeAgg(a, b) {
  if (!b) return a;
  a.pv += b.pv; a.games += b.games; a.overs += b.overs; a.play += b.play; a.office += b.office; a.scoreSum += b.scoreSum;
  a.maxScore = Math.max(a.maxScore, b.maxScore); a.visible += b.visible; a.naira += b.naira || 0;
  mergeSet(a.vids, b.vids); mergeSet(a.newv, b.newv); mergeSet(a.sids, b.sids); mergeMap(a.ev, b.ev); mergeMap(a.errors, b.errors);
  for (const d of DIMS) mergeMap(a.dims[d], (b.dims || {})[d]);
  for (const f of FUNNEL) mergeSet(a.funnel[f], (b.funnel || {})[f]);
  for (let i = 0; i < 24; i++) { const H = b.hours[i]; if (!H) continue; mergeSet(a.hours[i].v, H.v); a.hours[i].g += H.g; a.hours[i].pv += H.pv; }
  for (const [k, t] of Object.entries(b.last || {})) if (!a.last[k] || t > a.last[k]) a.last[k] = t;
  return a;
}

const top = (m, n = 25) => Object.entries(m || {}).sort((x, y) => y[1] - x[1]).slice(0, n);
export function summarize(a) {
  const visitors = Object.keys(a.vids).length;
  const newVisitors = Object.keys(a.newv).length;
  const dims = {};
  for (const d of DIMS) dims[d] = top(a.dims[d], d === 'adv' || d === 'adc' ? 200 : 25);
  return {
    visitors, newVisitors, returning: Math.max(0, visitors - newVisitors), sessions: Object.keys(a.sids).length, pageViews: a.pv,
    gamesStarted: a.games, gamesFinished: a.overs, playSeconds: Math.round(a.play), officeSeconds: Math.round(a.office), visibleSeconds: Math.round(a.visible),
    avgScore: a.overs ? Math.round(a.scoreSum / a.overs) : 0, maxScore: a.maxScore, nairaSpent: a.naira,
    events: top(a.ev, 60), dims,
    funnel: Object.fromEntries(FUNNEL.map((f) => [f, Object.keys(a.funnel[f]).length])),
    hours: a.hours.map((H) => ({ visitors: Object.keys(H.v).length, games: H.g, pageViews: H.pv })),
    errors: top(a.errors, 30),
  };
}
