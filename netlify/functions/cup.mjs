/* Office Wahala: Weekly Cups. Official public tournaments with real prizes, run from the dashboard.
   Free to enter, no sign-ups: players are identified by the random device ID the game makes.
   The highest single score wins. The organiser checks the top scores, then pays winners
   personally (bank transfer, airtime, gift card, voucher). Winners claim on WhatsApp with a
   private claim code that only their device can see.

   Routes (public)
     GET  /api/cup?me=<playerId>            live, upcoming and recently ended cups, each with its top 10 and your rank
     GET  /api/cup/winners                  finished cups with their winners (public winners page)
     GET  /api/cup/claims?me=<playerId>     prizes you won, with your claim code and payment status
     GET  /api/cup/<id>?me=<playerId>       one cup's board (top 50) and your place
     POST /api/cup/<id>/start  { playerId, name }                      start a cup run (uses a try)
     POST /api/cup/<id>/score  { playerId, name, state, runId, score, duration, level }
   Routes (dashboard, header x-dashboard-key)
     GET  /api/cup/admin                    every cup with full boards, flags and claim codes
     POST /api/cup/admin { action: create | update | cancel | delete | reject | restore | paid | unpaid, ... }

   Data lives in the "office-wahala" blob store under cups/ and cupscores/.
*/
import { getStore } from '@netlify/blobs';
import { checkKey } from '../lib/auth.mjs';

export const config = { path: ['/api/cup', '/api/cup/*'] };

const HOUR = 3600 * 1000, DAY = 24 * HOUR;
const BOARD = 50;
const CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const SUBSTR = ['fuck', 'shit', 'bitch', 'cunt', 'pussy', 'nigger', 'nigga', 'whore', 'slut', 'bastard', 'asshole',
  'ashawo', 'olosho', 'werey', 'oloriburuku', 'kpekus', 'gbola', 'oloshi'];
const WORDS = ['dick', 'prick', 'rape', 'ode', 'toto', 'mumu', 'dindin', 'ass', 'sex'];
const STATE_IDS = ['ab', 'ad', 'ak', 'an', 'ba', 'by', 'be', 'bo', 'cr', 'de', 'eb', 'ed', 'ek', 'en', 'fc', 'go', 'im', 'ji', 'kd', 'kn', 'kt', 'ke', 'ko', 'kw',
  'la', 'na', 'ni', 'og', 'on', 'os', 'oy', 'pl', 'ri', 'so', 'ta', 'yo', 'za'];
const SHIFT_CHOICES = [0, 60, 90, 120, 180, 300];

const json = (body, status = 200, cache = 'no-store') => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': cache } });
const fail = (msg, status = 400) => json({ error: msg }, status);
const validPlayer = (p) => typeof p === 'string' && /^[a-z0-9]{12,40}$/.test(p);
const validId = (id) => typeof id === 'string' && /^c[A-HJ-NP-Z2-9]{8}$/.test(id);
export const cleanName = (s, max = 20) => String(s || '').replace(/[^A-Za-z0-9 _.\-&']/g, '').replace(/\s+/g, ' ').trim().slice(0, max);
const cleanText = (s, max = 120) => String(s || '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, max);
function isRude(s) {
  const low = String(s).toLowerCase();
  const squashed = low.replace(/[^a-z]/g, '');
  if (SUBSTR.some((w) => squashed.includes(w))) return true;
  return low.split(/[^a-z]+/).some((w) => WORDS.includes(w));
}
const randId = (n) => [...crypto.getRandomValues(new Uint8Array(n))].map((b) => CHARS[b % CHARS.length]).join('');
async function sha(s) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
const pidOf = async (playerId) => (await sha('pid:' + playerId)).slice(0, 12);
const env = (k) => (globalThis.Netlify && Netlify.env && Netlify.env.get(k)) || process.env[k] || '';
// Office Wahala is closed on Saturdays and Sundays (Lagos time). Home cups play every day.
export function officeClosedNow(now = Date.now()) {
  const forced = env('OW_FORCE_DOW');
  const d = forced !== '' ? Number(forced) : new Date(now + HOUR).getUTCDay();
  return d === 0 || d === 6;
}
// A short claim code only the winner's device can get (it needs the private device ID).
async function claimCode(cup, pid) {
  const secret = env('CUP_SECRET') || env('DASHBOARD_KEY') || 'office-wahala';
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(cup.id + ':' + pid)));
  return (cup.game === 'home' ? 'HW-' : 'OW-') + [...sig.slice(0, 6)].map((b) => CHARS[b % CHARS.length]).join('');
}
async function readBody(req, max = 6000) {
  const text = await req.text();
  if (text.length > max) throw new Error('too large');
  return JSON.parse(text || '{}');
}
async function limited(store, kind, id, seconds) {
  const key = `rl/${kind}/${id}`;
  const last = await store.get(key, { type: 'json' }).catch(() => null);
  const now = Date.now();
  if (last && now - last.t < seconds * 1000) return true;
  await store.setJSON(key, { t: now });
  return false;
}
function plausible(score, duration, level) {
  if (!(score >= 0 && duration >= 1 && level >= 1) || score > 3000000 || duration > 36000) return 'Invalid score.';
  if (level > Math.floor(duration / 20) + 2 || score > duration * 900 + 4000) return 'Score does not match the time survived.';
  return '';
}
// Things the organiser should look at before paying (not automatic disqualification).
function flagsFor(score, duration, level) {
  const f = [];
  if (score / Math.max(1, duration) > 220) f.push('very fast scoring (' + Math.round(score / Math.max(1, duration)) + ' pts/s)');
  if (Math.abs(level - (1 + Math.floor(duration / 20))) > 1) f.push('level does not match time');
  if (duration < 20 && score > 3000) f.push('high score in a very short run');
  return f;
}
export const statusOf = (c, now = Date.now()) => (c.cancelled ? 'cancelled' : now < c.start ? 'upcoming' : now >= c.end ? 'ended' : 'live');

export function cleanCup(b, now = Date.now()) {
  const name = cleanText(b.name, 60);
  if (name.length < 3) throw new Error('Give the cup a name (at least 3 letters).');
  const game = b.game === 'home' ? 'home' : 'office';
  const start = Math.floor(Number(b.start)), end = Math.floor(Number(b.end));
  if (!Number.isFinite(start) || !Number.isFinite(end)) throw new Error('Pick a start and end time.');
  if (end <= start + 30 * 60 * 1000) throw new Error('A cup must run for at least 30 minutes.');
  if (end - start > 31 * DAY) throw new Error('A cup can run for at most 31 days.');
  const prizes = (Array.isArray(b.prizes) ? b.prizes : []).map((p) => cleanText(p, 60)).filter(Boolean).slice(0, 20);
  if (!prizes.length) throw new Error('Add at least one prize (for 1st place).');
  const secs = Math.floor(Number(b.shiftSecs) || 0);
  return {
    name, game, start, end, prizes,
    shiftSecs: SHIFT_CHOICES.includes(secs) ? secs : 0,
    tries: Math.max(0, Math.min(50, Math.floor(Number(b.tries) || 0))),
    repeat: !!b.repeat,
    sponsor: cleanText(b.sponsor, 40),
    sponsorUrl: /^https:\/\/[^\s"'<>]{3,200}$/.test(String(b.sponsorUrl || '')) ? String(b.sponsorUrl) : '',
    note: cleanText(b.note, 200),
  };
}
function publicCup(c, now) {
  return { id: c.id, name: c.name, game: c.game, start: c.start, end: c.end, status: statusOf(c, now), prizes: c.prizes, shiftSecs: c.shiftSecs, tries: c.tries,
    sponsor: c.sponsor || '', sponsorUrl: c.sponsorUrl || '', note: c.note || '', week: c.week || '' };
}
const lagosWeek = (t) => {
  const d = new Date(t + HOUR); d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + 3 - ((d.getUTCDay() + 6) % 7));
  const firstThu = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  return d.getUTCFullYear() + '-W' + String(1 + Math.round(((d - firstThu) / DAY - 3 + ((firstThu.getUTCDay() + 6) % 7)) / 7)).padStart(2, '0');
};

async function readIndex(store) { return (await store.get('cups/index', { type: 'json' }).catch(() => null)) || { ids: [] }; }
async function readCup(store, id) { return validId(id) ? store.get('cups/c/' + id, { type: 'json' }).catch(() => null) : null; }
async function saveCup(store, c) { await store.setJSON('cups/c/' + c.id, c); }
async function createCup(store, data, now) {
  const c = Object.assign({ id: 'c' + randId(8), created: now, rejected: [], paid: {} }, data);
  c.week = lagosWeek(c.start);
  await saveCup(store, c);
  const idx = await readIndex(store);
  idx.ids = [c.id, ...idx.ids.filter((x) => x !== c.id)].slice(0, 200);
  await store.setJSON('cups/index', idx);
  return c;
}
// Weekly repeat: when a repeating cup ends, the next week's copy starts automatically.
async function rollRepeats(store, cups, now) {
  const out = [...cups];
  for (const c of cups) {
    if (!c.repeat || c.cancelled || now < c.end || c.next) continue;
    const len = c.end - c.start;
    let start = c.end; while (start + len <= now) start += 7 * DAY;
    const nc = await createCup(store, { name: c.name, game: c.game, start, end: start + len, prizes: c.prizes, shiftSecs: c.shiftSecs, tries: c.tries,
      repeat: true, sponsor: c.sponsor, sponsorUrl: c.sponsorUrl, note: c.note }, now);
    c.next = nc.id; c.repeat = false;
    await saveCup(store, c);
    out.unshift(nc);
  }
  return out;
}
async function allCups(store, now, limit = 60) {
  const idx = await readIndex(store);
  const cups = (await Promise.all(idx.ids.slice(0, limit).map((id) => readCup(store, id)))).filter(Boolean);
  return rollRepeats(store, cups, now);
}
async function rowsOf(store, c) {
  const { blobs } = await store.list({ prefix: `cupscores/${c.id}/` });
  const rows = (await Promise.all(blobs.map((bl) => store.get(bl.key, { type: 'json' }).catch(() => null)))).filter((r) => r && r.plays > 0);
  rows.sort((a, b) => b.best - a.best || a.bestAt - b.bestAt);
  return rows;
}
// Ranked board without disqualified players; prize places follow this order.
const ranked = (c, rows) => rows.filter((r) => !(c.rejected || []).includes(r.pid));
const pubRow = (r, i) => ({ rank: i + 1, name: r.name, state: r.state || '', score: r.best, duration: r.duration, level: r.level, plays: r.plays });

export default async (req) => {
  const url = new URL(req.url);
  const parts = url.pathname.replace(/^\/api\/cup\/?/, '').split('/').filter(Boolean);
  const store = getStore({ name: 'office-wahala', consistency: 'strong' });
  const now = Date.now();
  try {
    if (parts[0] === 'health') return json({ ok: true });

    // ---------- Dashboard ----------
    if (parts[0] === 'admin') {
      const auth = checkKey(req);
      if (auth === 'not-configured') return fail('Set DASHBOARD_KEY in Netlify first.', 503);
      if (auth !== 'ok') return fail('Wrong dashboard key.', 401);
      if (req.method === 'GET') {
        const cups = await allCups(store, now, 80);
        const out = [];
        for (const c of cups) {
          const rows = await rowsOf(store, c);
          const live = ranked(c, rows);
          const board = [];
          for (const r of rows.slice(0, 40)) {
            const place = live.indexOf(r);
            const prize = place >= 0 && place < c.prizes.length ? c.prizes[place] : '';
            board.push({ pid: r.pid, name: r.name, state: r.state || '', score: r.best, duration: r.duration, level: r.level, plays: r.plays, tries: r.tries,
              flags: r.flags || [], runs: (r.runs || []).slice(-5), rejected: (c.rejected || []).includes(r.pid), place: place >= 0 ? place + 1 : 0, prize,
              code: prize ? await claimCode(c, r.pid) : '', paid: (c.paid || {})[r.pid] || null, first: r.first, bestAt: r.bestAt });
          }
          out.push(Object.assign(publicCup(c, now), { repeat: !!c.repeat, players: rows.length, board, created: c.created }));
        }
        return json({ cups: out, now });
      }
      if (req.method !== 'POST') return fail('Method not allowed.', 405);
      const b = await readBody(req, 20000);
      const act = b.action;
      if (act === 'create') {
        let data;
        try { data = cleanCup(b.cup || {}, now); } catch (e) { return fail(e.message); }
        const games = b.cup && b.cup.game === 'both' ? ['office', 'home'] : [data.game];
        const made = [];
        for (const g of games) made.push(publicCup(await createCup(store, Object.assign({}, data, { game: g, name: games.length > 1 ? data.name + (g === 'home' ? ' (Home)' : ' (Office)') : data.name }), now), now));
        return json({ ok: true, cups: made });
      }
      const c = await readCup(store, b.id);
      if (!c) return fail('Cup not found.', 404);
      if (act === 'update') {
        let data;
        try { data = cleanCup(Object.assign({}, c, b.cup || {}, { game: c.game }), now); } catch (e) { return fail(e.message); }
        Object.assign(c, data, { week: lagosWeek(data.start) });
        await saveCup(store, c);
        return json({ ok: true, cup: publicCup(c, now) });
      }
      if (act === 'cancel') { c.cancelled = !c.cancelled; c.repeat = false; await saveCup(store, c); return json({ ok: true, cup: publicCup(c, now) }); }
      if (act === 'delete') {
        const { blobs } = await store.list({ prefix: `cupscores/${c.id}/` });
        for (const bl of blobs) await store.delete(bl.key).catch(() => {});
        await store.delete('cups/c/' + c.id);
        const idx = await readIndex(store); idx.ids = idx.ids.filter((x) => x !== c.id); await store.setJSON('cups/index', idx);
        return json({ ok: true });
      }
      const pid = String(b.pid || '');
      if (!/^[0-9a-f]{12}$/.test(pid)) return fail('Pick a player.');
      c.rejected = c.rejected || []; c.paid = c.paid || {};
      if (act === 'reject') { if (!c.rejected.includes(pid)) c.rejected.push(pid); }
      else if (act === 'restore') c.rejected = c.rejected.filter((x) => x !== pid);
      else if (act === 'paid') c.paid[pid] = { t: now, method: cleanText(b.method, 40) || 'Paid', note: cleanText(b.note, 120) };
      else if (act === 'unpaid') delete c.paid[pid];
      else return fail('Unknown action.');
      await saveCup(store, c);
      return json({ ok: true });
    }

    // ---------- Public winners page ----------
    if (parts[0] === 'winners' && req.method === 'GET') {
      const cups = await allCups(store, now, 80);
      const done = [], live = [];
      for (const c of cups) {
        const st = statusOf(c, now);
        if (st === 'cancelled') continue;
        const rows = ranked(c, await rowsOf(store, c));
        if (st === 'ended') {
          done.push(Object.assign(publicCup(c, now), { players: rows.length,
            winners: c.prizes.map((prize, i) => (rows[i] ? { place: i + 1, name: rows[i].name, state: rows[i].state || '', score: rows[i].best, prize, paid: !!(c.paid || {})[rows[i].pid] } : null)).filter(Boolean) }));
        } else live.push(Object.assign(publicCup(c, now), { players: rows.length, top: rows.slice(0, 10).map(pubRow) }));
      }
      return json({ live, done: done.slice(0, 52) }, 200, 'public, max-age=60');
    }

    // ---------- Your prizes ----------
    if (parts[0] === 'claims' && req.method === 'GET') {
      const me = url.searchParams.get('me') || '';
      if (!validPlayer(me)) return fail('Invalid player.');
      const pid = await pidOf(me);
      const cups = await allCups(store, now, 40);
      const claims = [];
      for (const c of cups) {
        if (statusOf(c, now) !== 'ended' || now - c.end > 45 * DAY) continue;
        const rec = await store.get(`cupscores/${c.id}/${me}`, { type: 'json' }).catch(() => null);
        if (!rec || !rec.plays) continue;
        const rows = ranked(c, await rowsOf(store, c));
        const place = rows.findIndex((r) => r.pid === pid);
        if (place < 0 || place >= c.prizes.length) continue;
        claims.push({ cup: c.id, name: c.name, game: c.game, week: c.week, place: place + 1, prize: c.prizes[place], score: rec.best,
          code: await claimCode(c, pid), paid: !!(c.paid || {})[pid], paidAt: ((c.paid || {})[pid] || {}).t || 0, ended: c.end });
      }
      return json({ claims });
    }

    // ---------- List ----------
    if (parts.length === 0 && req.method === 'GET') {
      const me = url.searchParams.get('me') || '';
      const cups = await allCups(store, now, 40);
      const out = [];
      for (const c of cups) {
        const st = statusOf(c, now);
        if (st === 'cancelled' || (st === 'ended' && now - c.end > 7 * DAY)) continue;
        const rows = ranked(c, await rowsOf(store, c));
        const mine = validPlayer(me) ? rows.findIndex((r) => r.playerId === me) : -1;
        const recMe = validPlayer(me) ? await store.get(`cupscores/${c.id}/${me}`, { type: 'json' }).catch(() => null) : null;
        out.push(Object.assign(publicCup(c, now), { players: rows.length, top: rows.slice(0, 10).map(pubRow),
          me: mine >= 0 ? { rank: mine + 1, score: rows[mine].best, triesLeft: c.tries ? Math.max(0, c.tries - (recMe ? recMe.tries || 0 : 0)) : null }
            : { rank: 0, score: 0, triesLeft: c.tries ? Math.max(0, c.tries - (recMe ? recMe.tries || 0 : 0)) : null } }));
      }
      out.sort((a, b) => ({ live: 0, upcoming: 1, ended: 2 }[a.status] - { live: 0, upcoming: 1, ended: 2 }[b.status]) || a.end - b.end);
      return json({ cups: out, now });
    }

    // ---------- One cup ----------
    const c = await readCup(store, parts[0]);
    if (!c) return fail('That cup does not exist.', 404);
    if (parts.length === 1 && req.method === 'GET') {
      const me = url.searchParams.get('me') || '';
      const rows = ranked(c, await rowsOf(store, c));
      const mine = validPlayer(me) ? rows.findIndex((r) => r.playerId === me) : -1;
      const recMe = validPlayer(me) ? await store.get(`cupscores/${c.id}/${me}`, { type: 'json' }).catch(() => null) : null;
      return json(Object.assign(publicCup(c, now), { players: rows.length, top: rows.slice(0, BOARD).map(pubRow),
        me: { rank: mine + 1, score: mine >= 0 ? rows[mine].best : 0, triesLeft: c.tries ? Math.max(0, c.tries - (recMe ? recMe.tries || 0 : 0)) : null } }));
    }

    if (parts[1] === 'start' && req.method === 'POST') {
      const b = await readBody(req);
      if (!validPlayer(b.playerId)) return fail('Invalid player.');
      const name = cleanName(b.name, 20);
      if (name.length < 1) return fail('Add your name first.');
      if (isRude(name)) return fail('Please choose a friendlier name.');
      const st = statusOf(c, now);
      if (st === 'upcoming') return fail('This cup has not started yet.', 409);
      if (st !== 'live') return fail('This cup has ended.', 409);
      if (c.game !== 'home' && officeClosedNow(now)) return fail('Office is closed on Saturdays and Sundays. The Office Cup opens again on Monday.', 409);
      if (await limited(store, 'cupstart', b.playerId, 4)) return fail('Slow down a little.', 429);
      const pid = await pidOf(b.playerId);
      if ((c.rejected || []).includes(pid)) return fail('You have been removed from this cup.', 403);
      const key = `cupscores/${c.id}/${b.playerId}`;
      const rec = (await store.get(key, { type: 'json' }).catch(() => null)) || { playerId: b.playerId, pid, name, best: 0, plays: 0, tries: 0, runs: [], first: now };
      if (c.tries && rec.tries >= c.tries) return fail(`You have used all ${c.tries} tries for this cup.`, 409);
      rec.tries++; rec.name = name;
      rec.run = { id: randId(12), t: now, used: false };
      await store.setJSON(key, rec);
      return json({ runId: rec.run.id, seed: 'cup:' + c.id, triesLeft: c.tries ? c.tries - rec.tries : null,
        rules: { world: c.game, shiftSecs: c.shiftSecs, tries: c.tries, sameOffice: true, upgrades: false, commute: false, scoring: 'best', schedule: 'custom', prize: c.prizes[0] || '' },
        cup: publicCup(c, now) });
    }

    if (parts[1] === 'score' && req.method === 'POST') {
      const b = await readBody(req);
      if (!validPlayer(b.playerId)) return fail('Invalid player.');
      const name = cleanName(b.name, 20);
      if (name.length < 1 || isRude(name)) return fail('Please choose a friendly name.');
      const score = Math.floor(Number(b.score)), duration = Math.floor(Number(b.duration)), level = Math.floor(Number(b.level));
      const bad = plausible(score, duration, level);
      if (bad) return fail(bad);
      const key = `cupscores/${c.id}/${b.playerId}`;
      const rec = await store.get(key, { type: 'json' }).catch(() => null);
      if (!rec || !rec.run || rec.run.id !== b.runId) return fail('This run was not started for the cup.', 409);
      if (rec.run.used) return fail('This run was already submitted.', 409);
      const elapsed = (now - rec.run.t) / 1000;
      if (elapsed > 4 * 3600) return fail('This run started too long ago.', 409);
      if (duration > elapsed + 5) return fail('Score does not match the time played.');
      if (c.shiftSecs && duration > c.shiftSecs + 3) return fail('Score is longer than the cup shift length.');
      if (rec.run.t > c.end + 60 * 1000) return fail('This cup has ended.', 409);
      rec.run.used = true;
      rec.name = name;
      if (STATE_IDS.includes(b.state)) rec.state = b.state;
      rec.plays++;
      const fl = flagsFor(score, duration, level);
      rec.runs = [...(rec.runs || []), { score, duration, level, t: now, flags: fl }].slice(-20);
      if (score > rec.best || rec.plays === 1) { rec.best = score; rec.duration = duration; rec.level = level; rec.bestAt = now; rec.flags = fl; }
      await store.setJSON(key, rec);
      const rows = ranked(c, await rowsOf(store, c));
      const rank = rows.findIndex((r) => r.playerId === b.playerId) + 1;
      return json({ ok: true, rank, players: rows.length, best: rec.best, prizePlace: rank > 0 && rank <= c.prizes.length ? c.prizes[rank - 1] : '',
        triesLeft: c.tries ? Math.max(0, c.tries - rec.tries) : null });
    }
    return fail('Not found.', 404);
  } catch (e) {
    return fail('Something went wrong: ' + (e && e.message ? e.message : 'unknown'), 500);
  }
};
