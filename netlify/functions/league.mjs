/* Office Wahala: Office Leagues API v2 (Netlify Functions + Netlify Blobs).
   Private leaderboards that colleagues join with a 6-character code. The creator
   sets the rules (when it runs, shift length, number of tries, same office for
   everyone, upgrades, commute, best vs total score, prize) and manages the league
   with a 4–6 digit admin PIN.

   Routes
     GET  /api/league/health                 -> { ok: true, v: 2 }
     POST /api/league                        -> create  { name, playerId, pin, rules }      -> { code, name }
     GET  /api/league/:code?me=<playerId>    -> board, rules, round, history, my tries
     POST /api/league/:code/start            -> start a league shift { playerId, name }     -> { runId, seed, rules, triesLeft }
     POST /api/league/:code/score            -> submit  { playerId, name, score, duration, level, runId }
     POST /api/league/:code/admin            -> { playerId, pin, action: check|rules|kick|end|new, ... }
     GET  /api/league/:code/ghost?me=         -> best run of the leader (same-office leagues) to race against
     POST /api/league/:code/wall              -> post a ready-made line { playerId, name, line }
     POST /api/league/:code/react             -> toggle a reaction { playerId, post, emoji: clap|laugh|fire|heart }
     POST /api/league/:code/gift              -> send lunch money { playerId, name, to: pid, amount: 100|200|500 } (₦500/day out, ₦1,500/day in)
     GET  /api/league/gifts?me=<playerId>     -> collect lunch money sent to you

   Leagues made before v2 ("legacy") keep working: weekly, no rules, no admin,
   and accept scores without a runId (older cached copies of the game).

   Data lives in the "office-wahala" blob store:
     leagues/<CODE>                          league record (see newLeague)
     scores/<CODE>/<roundKey>/<playerId>     { name, score, best, total, plays, tries, duration, level, run, updated }
     rl/<kind>/<id>                          rate-limit timestamps
   No IP addresses, emails or phone numbers are stored.
*/
import { getStore } from '@netlify/blobs';

export const config = { path: ['/api/league', '/api/league/*'] };

const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
// Blocked words. SUBSTR: blocked anywhere in the name. WORDS: blocked only as whole words
// (so names like "Dickson" or "Grapes" still work).
const SUBSTR = ['fuck', 'shit', 'bitch', 'cunt', 'pussy', 'nigger', 'nigga', 'whore', 'slut', 'bastard', 'asshole',
  'ashawo', 'olosho', 'werey', 'oloriburuku', 'kpekus', 'gbola', 'oloshi'];
const WORDS = ['dick', 'prick', 'rape', 'ode', 'toto', 'mumu', 'dindin', 'ass', 'sex'];

const HOUR = 3600 * 1000, DAY = 24 * HOUR;
// Job titles players buy in the staff shop (keep in sync with TITLES in game.js). Only these exact titles are shown.
const TITLES = { dodger: 'Senior Oga-Dodger', latecomer: 'Professional Latecomer', gist: 'Chief Gist Officer', wahala: 'Head of Wahala',
  vibes: 'Director of Vibes', smallchops: 'Minister of Small Chops', ogatrain: 'Oga in Training', legend: 'Office Legend' };
// League wall: players pick from these lines (no free text = nothing to moderate). Keep in sync with WALL_LINES in game.js.
export const WALL_LINES = ['Who send you?', 'Abeg slow down o!', 'Na me be MD now.', 'See as you dey shake!', 'Oga don catch you!',
  'This board na my own.', 'I dey come for your position.', 'Small small, I go pass you.', 'Share the jollof!', 'Lunch break don finish o.',
  'Make una stop dey form busy!', 'Who get extra tries? Asking for a friend.', 'NEPA no fit stop me today.', 'Congrats, you try!',
  'Respect the leader.', 'Rematch tomorrow!', 'The prize na my own this week.', 'My data finish, I go come back.', 'Na God dey give promotion.', 'Good game everybody!'];
const REACTS = ['clap', 'laugh', 'fire', 'heart'];
const GIFT_AMOUNTS = [100, 200, 500];
const GIFT_SEND_CAP = 500, GIFT_RECV_CAP = 1500;
const lagosDay = (now) => new Date(now + HOUR).toISOString().slice(0, 10);
const publicPost = (p) => ({ id: p.id, t: p.t, kind: p.kind, name: p.name, line: p.line, text: p.text, reacts: p.reacts || {} });
async function addPost(store, code, post) {
  const key = `walls/${code}`;
  const w = (await store.get(key, { type: 'json' }).catch(() => null)) || { posts: [] };
  w.posts = [{ id: randId(8), t: Date.now(), reacts: {}, rx: [], ...post }, ...w.posts].slice(0, 60);
  await store.setJSON(key, w);
  return w;
}
const flairOf = (b) => ({ gold: b.gold === true, title: TITLES[b.title] ? b.title : '' });
const SHIFT_CHOICES = [0, 60, 90, 120, 180, 300];
const MAX_BOARD = 50;

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
});
const fail = (msg, status = 400) => json({ error: msg }, status);

export function cleanName(s, max = 20) {
  return String(s || '').replace(/[^A-Za-z0-9 _.\-&']/g, '').replace(/\s+/g, ' ').trim().slice(0, max);
}
export function cleanText(s, max = 80) {
  return String(s || '').replace(/[<>{}\\`]/g, '').replace(/\s+/g, ' ').trim().slice(0, max);
}
export function isRude(s) {
  const low = String(s || '').toLowerCase();
  const flat = low.replace(/0/g, 'o').replace(/1/g, 'i').replace(/3/g, 'e').replace(/[^a-z]/g, '');
  if (SUBSTR.some((w) => flat.includes(w))) return true;
  const words = low.replace(/0/g, 'o').replace(/1/g, 'i').split(/[^a-z]+/);
  return words.some((w) => WORDS.includes(w));
}
// ISO week in Lagos time (UTC+1), e.g. "2026-W44". Weekly leagues reset every Monday.
export function weekKey(now = Date.now()) {
  const d = new Date(now + HOUR);
  const day = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - day + 3);
  const firstThu = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round(((d - firstThu) / 86400000 - 3 + ((firstThu.getUTCDay() + 6) % 7)) / 7);
  return d.getUTCFullYear() + '-W' + String(week).padStart(2, '0');
}
// Monday 00:00 Lagos time of the current week, as a UTC timestamp.
export function weekStart(now = Date.now()) {
  const d = new Date(now + HOUR);
  const day = (d.getUTCDay() + 6) % 7;
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - day) - HOUR;
}
const validCode = (c) => /^[A-HJ-NP-Z2-9]{6}$/.test(c);
const validPlayer = (p) => typeof p === 'string' && /^[a-z0-9]{12,40}$/.test(p);
const validPin = (p) => typeof p === 'string' && /^\d{4,6}$/.test(p);

async function sha(s) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
export const pidOf = async (playerId) => (await sha('pid:' + playerId)).slice(0, 12);
const randId = (n = 12) => [...crypto.getRandomValues(new Uint8Array(n))].map((b) => CODE_CHARS[b % CODE_CHARS.length]).join('');

export const DEFAULT_RULES = { schedule: 'week', start: 0, end: 0, shiftSecs: 0, tries: 0, sameOffice: false, upgrades: true, commute: true, scoring: 'best', prize: '' };

// Validate rules from the creator. Throws with a readable message.
export function cleanRules(r, now = Date.now()) {
  r = r || {};
  const out = { ...DEFAULT_RULES };
  out.schedule = r.schedule === 'custom' ? 'custom' : 'week';
  if (out.schedule === 'custom') {
    const start = Math.floor(Number(r.start)), end = Math.floor(Number(r.end));
    if (!Number.isFinite(start) || !Number.isFinite(end)) throw new Error('Pick a start and end time for the tournament.');
    if (end <= start + 10 * 60 * 1000) throw new Error('The tournament must run for at least 10 minutes.');
    if (end - start > 31 * DAY) throw new Error('A tournament can run for at most 31 days.');
    if (end < now) throw new Error('The end time is already in the past.');
    if (start > now + 60 * DAY) throw new Error('Start within the next 60 days.');
    out.start = start; out.end = end;
  }
  const secs = Math.floor(Number(r.shiftSecs) || 0);
  out.shiftSecs = SHIFT_CHOICES.includes(secs) ? secs : 0;
  const tries = Math.floor(Number(r.tries) || 0);
  out.tries = Math.max(0, Math.min(20, tries));
  out.sameOffice = !!r.sameOffice;
  out.upgrades = r.upgrades !== false;
  out.commute = r.commute !== false;
  out.scoring = r.scoring === 'total' ? 'total' : 'best';
  out.prize = cleanText(r.prize, 80);
  if (out.prize && isRude(out.prize)) throw new Error('Please keep the prize note friendly.');
  return out;
}

function roundFor(rules, n, now) {
  if (rules.schedule === 'custom') return { n, key: 'r' + n, start: rules.start, end: rules.end, week: '' };
  const ws = weekStart(now);
  return { n, key: 'r' + n, start: ws, end: ws + 7 * DAY, week: weekKey(now) };
}
const isLegacy = (L) => !L.v;
// The round the league is in right now (legacy: this ISO week).
function currentRound(L, now) {
  if (isLegacy(L)) { const ws = weekStart(now); return { n: 0, key: weekKey(now), start: ws, end: ws + 7 * DAY, week: weekKey(now) }; }
  return L.round;
}
function roundStatus(r, now) {
  if (r.closed || now >= r.end) return 'ended';
  if (now < r.start) return 'upcoming';
  return 'open';
}
const ownerOf = (L, pid) => pid === L.owner || (L.owners || []).includes(pid);
const rulesOf = (L) => (isLegacy(L) ? DEFAULT_RULES : L.rules);
const scoreOf = (row, rules) => (rules.scoring === 'total' ? (row.total ?? row.score ?? 0) : (row.best ?? row.score ?? 0));

async function readRows(store, code, key, rules) {
  const { blobs } = await store.list({ prefix: `scores/${code}/${key}/` });
  const rows = (await Promise.all(blobs.slice(0, 300).map(async (b) => {
    const r = await store.get(b.key, { type: 'json' }).catch(() => null);
    if (!r) return null;
    const playerId = b.key.split('/').pop();
    return { ...r, playerId };
  }))).filter((r) => r && (r.plays ?? 1) > 0);
  rows.sort((a, b) => scoreOf(b, rules) - scoreOf(a, rules) || (a.updated || 0) - (b.updated || 0));
  return rows;
}

// Weekly v2 leagues roll over on Monday: archive the winners and open a new round.
async function rollIfNeeded(store, code, L, now) {
  if (isLegacy(L) || L.rules.schedule !== 'week' || L.round.week === weekKey(now)) return L;
  await archive(store, code, L);
  L.round = roundFor(L.rules, L.round.n + 1, now);
  await store.setJSON(`leagues/${code}`, L);
  return L;
}
async function archive(store, code, L) {
  if (L.round.archived) return;
  const rows = await readRows(store, code, L.round.key, L.rules);
  L.history = [{ n: L.round.n, start: L.round.start, end: Math.min(L.round.end, Date.now()), players: rows.length,
    winners: await Promise.all(rows.slice(0, 3).map(async (r) => ({ name: r.name, score: scoreOf(r, L.rules), pid: await pidOf(r.playerId) }))) }, ...(L.history || [])].slice(0, 12);
  L.round.archived = true;
  if (rows[0]) await addPost(store, code, { kind: 'auto', name: rows[0].name, text: `Round ${L.round.n} winner: ${rows[0].name} with ${scoreOf(rows[0], L.rules).toLocaleString('en-NG')}!` }).catch(() => {});
}

async function limited(store, kind, id, seconds) {
  const key = `rl/${kind}/${id}`;
  const last = await store.get(key, { type: 'json' }).catch(() => null);
  const now = Date.now();
  if (last && now - last.t < seconds * 1000) return true;
  await store.setJSON(key, { t: now });
  return false;
}

async function readBody(req, max = 4000) {
  const text = await req.text();
  if (text.length > max) throw new Error('too large');
  return JSON.parse(text || '{}');
}

function plausible(score, duration, level) {
  if (!(score >= 0 && duration >= 1 && level >= 1) || score > 3000000 || duration > 36000) return 'Invalid score.';
  // One level per 20s of office time; real play peaks well under ~150 points/second.
  if (level > Math.floor(duration / 20) + 2 || score > duration * 900 + 4000) return 'Score does not match the time survived.';
  return '';
}

function publicLeague(L, code, now) {
  const r = currentRound(L, now);
  return {
    code, name: L.name, v: L.v || 1, rules: rulesOf(L), legacy: isLegacy(L),
    round: { n: r.n, start: r.start, end: r.closed ? Math.min(r.end, r.closedAt || r.end) : r.end, status: roundStatus(r, now) },
    history: L.history || [],
  };
}

export default async (req, context) => {
  const url = new URL(req.url);
  const parts = url.pathname.replace(/\/+$/, '').split('/').slice(3); // after /api/league
  const store = getStore({ name: 'office-wahala', consistency: 'strong' });
  const ip = ((context && context.ip) || req.headers.get('x-nf-client-connection-ip') || 'unknown').replace(/[^a-z0-9.:]/gi, '');
  const now = Date.now();

  try {
    if (parts[0] === 'health' && req.method === 'GET') return json({ ok: true, v: 2, week: weekKey(now) });

    // ---------- Claim lunch-money gifts sent to me (any league) ----------
    if (parts[0] === 'gifts' && req.method === 'GET') {
      const me = url.searchParams.get('me') || '';
      if (!validPlayer(me)) return fail('Invalid player.');
      const pid = await pidOf(me);
      const { blobs } = await store.list({ prefix: `gifts/${pid}/` });
      const gifts = [];
      for (const bl of blobs.slice(0, 50)) {
        const g = await store.get(bl.key, { type: 'json' }).catch(() => null);
        await store.delete(bl.key).catch(() => {});
        if (g) gifts.push(g);
      }
      return json({ gifts });
    }

    // ---------- Create a league ----------
    if (parts.length === 0 && req.method === 'POST') {
      const body = await readBody(req);
      const name = cleanName(body.name, 30);
      if (name.length < 2) return fail('Give your league a name (at least 2 letters).');
      if (isRude(name)) return fail('Please choose a friendlier league name.');
      if (!validPlayer(body.playerId)) return fail('Invalid player.');
      if (!validPin(String(body.pin || ''))) return fail('Choose an admin PIN of 4 to 6 digits.');
      let rules;
      try { rules = cleanRules(body.rules, now); } catch (e) { return fail(e.message); }
      if (await limited(store, 'create', ip, 30)) return fail('Wait a few seconds before creating another league.', 429);
      for (let i = 0; i < 8; i++) {
        let code = '';
        for (const b of crypto.getRandomValues(new Uint8Array(6))) code += CODE_CHARS[b % CODE_CHARS.length];
        if (await store.get(`leagues/${code}`)) continue;
        const salt = randId(10);
        const L = { v: 2, name, created: now, owner: await pidOf(body.playerId), pin: { salt, hash: await sha(`${code}:${body.pin}:${salt}`) },
          rules, round: roundFor(rules, 1, now), history: [], kicked: [] };
        await store.setJSON(`leagues/${code}`, L);
        return json({ code, name, rules }, 201);
      }
      return fail('Could not create a league. Try again.', 500);
    }

    const code = String(parts[0] || '').toUpperCase();
    if (!validCode(code)) return fail('That league code is not valid.', 404);
    let L = await store.get(`leagues/${code}`, { type: 'json' });
    if (!L) return fail('No league with that code. Check the code and try again.', 404);
    L = await rollIfNeeded(store, code, L, now);
    const rules = rulesOf(L);
    const round = currentRound(L, now);

    // ---------- Board ----------
    if (parts.length === 1 && req.method === 'GET') {
      const rows = await readRows(store, code, round.key, rules);
      const out = publicLeague(L, code, now);
      out.week = weekKey(now);
      out.players = await Promise.all(rows.slice(0, MAX_BOARD).map(async (r) => ({
        pid: await pidOf(r.playerId), name: r.name, score: scoreOf(r, rules), best: r.best ?? r.score ?? 0, total: r.total ?? r.score ?? 0,
        plays: r.plays ?? 1, duration: r.duration, level: r.level, gold: !!r.gold, title: TITLES[r.title] || '',
      })));
      const wall = await store.get(`walls/${code}`, { type: 'json' }).catch(() => null);
      out.wall = wall ? wall.posts.slice(0, 30).map(publicPost) : [];
      out.wallLines = WALL_LINES.length;
      const me = url.searchParams.get('me') || '';
      if (validPlayer(me)) {
        const mine = rows.findIndex((r) => r.playerId === me);
        const rec = await store.get(`scores/${code}/${round.key}/${me}`, { type: 'json' }).catch(() => null);
        const tries = rec ? rec.tries || 0 : 0;
        const myPid = await pidOf(me);
        out.me = { pid: myPid, rank: mine >= 0 ? mine + 1 : 0, best: rec ? rec.best ?? rec.score ?? 0 : 0, total: rec ? rec.total ?? rec.score ?? 0 : 0,
          tries, triesLeft: rules.tries ? Math.max(0, rules.tries - tries) : null, isOwner: !isLegacy(L) && ownerOf(L, myPid),
          kicked: (L.kicked || []).includes(myPid) };
      }
      return json(out);
    }

    // ---------- Start a league shift (uses a try) ----------
    if (parts[1] === 'start' && req.method === 'POST') {
      const b = await readBody(req);
      if (!validPlayer(b.playerId)) return fail('Invalid player.');
      const name = cleanName(b.name, 20);
      if (name.length < 1) return fail('Add your name first.');
      if (isRude(name)) return fail('Please choose a friendlier name.');
      const pid = await pidOf(b.playerId);
      if ((L.kicked || []).includes(pid)) return fail('The league admin removed you from this league.', 403);
      const status = roundStatus(round, now);
      if (status === 'upcoming') return fail('This league has not started yet.', 409);
      if (status === 'ended') return fail('This round has ended. Wait for the admin to start a new one.', 409);
      if (await limited(store, 'start', b.playerId, 4)) return fail('Slow down a little.', 429);
      const key = `scores/${code}/${round.key}/${b.playerId}`;
      const rec = (await store.get(key, { type: 'json' }).catch(() => null)) || { name, best: 0, total: 0, plays: 0, tries: 0 };
      if (rules.tries && (rec.tries || 0) >= rules.tries) return fail(`You have used all ${rules.tries} tries for this round.`, 409);
      rec.tries = (rec.tries || 0) + 1;
      rec.name = name;
      Object.assign(rec, flairOf(b));
      rec.run = { id: randId(12), t: now, used: false };
      await store.setJSON(key, rec);
      return json({ runId: rec.run.id, seed: rules.sameOffice ? `${code}:${round.key}` : '', rules, round: publicLeague(L, code, now).round,
        triesLeft: rules.tries ? rules.tries - rec.tries : null });
    }

    // ---------- Submit a score ----------
    if (parts[1] === 'score' && req.method === 'POST') {
      const b = await readBody(req, 40000);
      if (!validPlayer(b.playerId)) return fail('Invalid player.');
      const name = cleanName(b.name, 20);
      if (name.length < 1) return fail('Add your name first.');
      if (isRude(name)) return fail('Please choose a friendlier name.');
      const score = Math.floor(Number(b.score)), duration = Math.floor(Number(b.duration)), level = Math.floor(Number(b.level));
      const bad = plausible(score, duration, level);
      if (bad) return fail(bad);
      const pid = await pidOf(b.playerId);
      if ((L.kicked || []).includes(pid)) return fail('The league admin removed you from this league.', 403);

      if (isLegacy(L) && !b.runId) {
        // Older copies of the game: weekly best, no tries.
        if (await limited(store, 'score', b.playerId, 8)) return fail('Slow down a little.', 429);
        const key = `scores/${code}/${round.key}/${b.playerId}`;
        const prev = (await store.get(key, { type: 'json' }).catch(() => null)) || { best: 0, total: 0, plays: 0, tries: 0 };
        const better = score > (prev.best ?? prev.score ?? 0);
        const rec = { ...prev, name, plays: (prev.plays ?? (prev.score !== undefined ? 1 : 0)) + 1, total: (prev.total ?? prev.score ?? 0) + score,
          best: better ? score : prev.best ?? prev.score, duration: better ? duration : prev.duration, level: better ? level : prev.level, updated: now };
        rec.score = rec.best;
        await store.setJSON(key, rec);
        return json({ ok: true, week: weekKey(now) });
      }

      // Find the run: the current round first, then the round that just ended (a shift can finish after the deadline).
      const keys = [round.key];
      if (!isLegacy(L) && L.round.n > 1) keys.push('r' + (L.round.n - 1));
      let key = '', rec = null;
      for (const k of keys) {
        const r = await store.get(`scores/${code}/${k}/${b.playerId}`, { type: 'json' }).catch(() => null);
        if (r && r.run && r.run.id === b.runId) { key = `scores/${code}/${k}/${b.playerId}`; rec = r; break; }
      }
      if (!rec) return fail('This shift was not started for the league. Press Play on the league to start one.', 409);
      if (rec.run.used) return fail('This shift was already submitted.', 409);
      const elapsed = (now - rec.run.t) / 1000;
      if (elapsed > 4 * 3600) return fail('This shift started too long ago.', 409);
      if (duration > elapsed + 5) return fail('Score does not match the time played.');
      if (rules.shiftSecs && duration > rules.shiftSecs + 3) return fail('Score is longer than the league shift length.');
      const rk = key.split('/')[2];
      const before = await readRows(store, code, rk, rules);
      rec.run.used = true;
      rec.name = name;
      Object.assign(rec, flairOf(b));
      rec.plays = (rec.plays || 0) + 1;
      rec.total = (rec.total || 0) + score;
      const newBest = score > (rec.best || 0) || rec.plays === 1;
      if (newBest) { rec.best = score; rec.duration = duration; rec.level = level; }
      rec.score = rec.best;
      rec.updated = now;
      await store.setJSON(key, rec);
      // ghost of your best run (same-office leagues only: everyone gets the same obstacles, so the ghost lines up)
      if (newBest && rules.sameOffice && typeof b.ghost === 'string' && b.ghost.length <= 30000 && /^[A-Za-z0-9+/=]*$/.test(b.ghost)) {
        await store.setJSON(`ghosts/${code}/${rk}/${b.playerId}`, { name, score, dur: duration, path: b.ghost, step: 0.2, t: now });
      }
      const rows = await readRows(store, code, rk, rules);
      if (rows[0] && rows[0].playerId === b.playerId && before[0] && before[0].playerId !== b.playerId) {
        await addPost(store, code, { kind: 'auto', name, text: `${name} took 1st place with ${scoreOf(rows[0], rules).toLocaleString('en-NG')}!` }).catch(() => {});
      }
      const rank = rows.findIndex((r) => r.playerId === b.playerId) + 1;
      return json({ ok: true, rank, players: rows.length, best: rec.best, total: rec.total,
        triesLeft: rules.tries ? Math.max(0, rules.tries - (rec.tries || 0)) : null });
    }

    // ---------- Ghost of the leader's best run ----------
    if (parts[1] === 'ghost' && req.method === 'GET') {
      if (!rules.sameOffice) return fail('Ghosts need "Same office for everyone".', 409);
      const me = url.searchParams.get('me') || '';
      const rows = await readRows(store, code, round.key, rules);
      const order = rows.filter((r) => r.playerId !== me).concat(rows.filter((r) => r.playerId === me));
      for (const r of order.slice(0, 6)) {
        const g = await store.get(`ghosts/${code}/${round.key}/${r.playerId}`, { type: 'json' }).catch(() => null);
        if (g) return json({ name: g.name, score: g.score, dur: g.dur, path: g.path, step: g.step, mine: r.playerId === me });
      }
      return json({ none: true });
    }

    // ---------- League wall: ready-made lines + reactions ----------
    if (parts[1] === 'wall' && req.method === 'POST') {
      const b = await readBody(req);
      if (!validPlayer(b.playerId)) return fail('Invalid player.');
      const name = cleanName(b.name, 20);
      if (!name || isRude(name)) return fail('Add a friendly name first.');
      const line = Math.floor(Number(b.line));
      if (!(line >= 0 && line < WALL_LINES.length)) return fail('Pick a line to post.');
      if ((L.kicked || []).includes(await pidOf(b.playerId))) return fail('The league admin removed you from this league.', 403);
      if (await limited(store, 'wall', b.playerId, 8)) return fail('Slow down a little.', 429);
      const w = await addPost(store, code, { kind: 'line', name, line });
      return json({ ok: true, wall: w.posts.slice(0, 30).map(publicPost) });
    }
    if (parts[1] === 'react' && req.method === 'POST') {
      const b = await readBody(req);
      if (!validPlayer(b.playerId)) return fail('Invalid player.');
      if (!REACTS.includes(b.emoji)) return fail('Unknown reaction.');
      const key = `walls/${code}`;
      const w = (await store.get(key, { type: 'json' }).catch(() => null)) || { posts: [] };
      const post = w.posts.find((x) => x.id === b.post);
      if (!post) return fail('That post is gone.', 404);
      const tag = (await pidOf(b.playerId)) + ':' + b.emoji;
      post.rx = post.rx || []; post.reacts = post.reacts || {};
      if (post.rx.includes(tag)) { post.rx = post.rx.filter((x) => x !== tag); post.reacts[b.emoji] = Math.max(0, (post.reacts[b.emoji] || 1) - 1); }
      else { post.rx = [...post.rx, tag].slice(-300); post.reacts[b.emoji] = (post.reacts[b.emoji] || 0) + 1; }
      await store.setJSON(key, w);
      return json({ ok: true, wall: w.posts.slice(0, 30).map(publicPost) });
    }

    // ---------- Lunch money gifts (pretend naira, capped per day) ----------
    if (parts[1] === 'gift' && req.method === 'POST') {
      const b = await readBody(req);
      if (!validPlayer(b.playerId)) return fail('Invalid player.');
      const name = cleanName(b.name, 20);
      if (!name || isRude(name)) return fail('Add a friendly name first.');
      const amount = Math.floor(Number(b.amount));
      if (!GIFT_AMOUNTS.includes(amount)) return fail('Pick ₦100, ₦200 or ₦500.');
      const myPid = await pidOf(b.playerId);
      if ((L.kicked || []).includes(myPid)) return fail('The league admin removed you from this league.', 403);
      const to = String(b.to || '');
      if (to === myPid) return fail('You cannot send lunch money to yourself.');
      const rows = await readRows(store, code, round.key, rules);
      let toRow = null;
      for (const r of rows) if ((await pidOf(r.playerId)) === to) { toRow = r; break; }
      if (!toRow) return fail('That colleague is not on this round’s board.', 404);
      const day = lagosDay(now);
      const sk = `rl/giftsent/${b.playerId}/${day}`, rk = `rl/giftrecv/${to}/${day}`;
      const sent = (await store.get(sk, { type: 'json' }).catch(() => null)) || { sum: 0 };
      const recv = (await store.get(rk, { type: 'json' }).catch(() => null)) || { sum: 0 };
      if (sent.sum + amount > GIFT_SEND_CAP) return fail(`You can send up to ₦${GIFT_SEND_CAP} a day. You have ₦${Math.max(0, GIFT_SEND_CAP - sent.sum)} left today.`, 429);
      if (recv.sum + amount > GIFT_RECV_CAP) return fail(`${toRow.name} has received enough lunch money today. Try tomorrow.`, 429);
      sent.sum += amount; recv.sum += amount;
      await store.setJSON(sk, sent); await store.setJSON(rk, recv);
      await store.setJSON(`gifts/${to}/${now}-${randId(6)}`, { from: name, amount, league: L.name, code, t: now });
      await addPost(store, code, { kind: 'gift', name, text: `${name} sent ${toRow.name} ₦${amount} lunch money` }).catch(() => {});
      return json({ ok: true, leftToday: GIFT_SEND_CAP - sent.sum });
    }

    // ---------- Admin ----------
    if (parts[1] === 'admin' && req.method === 'POST') {
      if (isLegacy(L)) return fail('This league was created before league rules existed. Create a new league to set rules.', 409);
      const b = await readBody(req);
      const isOwner = validPlayer(b.playerId) && ownerOf(L, await pidOf(b.playerId));
      if (!isOwner) {
        const pin = String(b.pin || '');
        if (!validPin(pin)) return fail('Enter the admin PIN.', 401);
        const fk = `rl/pinfail/${code}`;
        const f = (await store.get(fk, { type: 'json' }).catch(() => null)) || { n: 0, t: now };
        if (now - f.t > 15 * 60 * 1000) { f.n = 0; f.t = now; }
        if (f.n >= 5) return fail('Too many wrong PINs. Try again in 15 minutes.', 429);
        if ((await sha(`${code}:${pin}:${L.pin.salt}`)) !== L.pin.hash) {
          f.n++; await store.setJSON(fk, f);
          return fail('Wrong admin PIN.', 401);
        }
        // A correct PIN on a new phone makes that phone an owner device too.
        if (validPlayer(b.playerId)) { const p = await pidOf(b.playerId); L.owners = [...new Set([...(L.owners || []), p])].slice(-5); }
      }
      const act = String(b.action || '');
      if (act === 'check') { await store.setJSON(`leagues/${code}`, L); return json({ ok: true, ...publicLeague(L, code, now), kicked: L.kicked.length }); }
      if (act === 'rules') {
        const name = b.name !== undefined ? cleanName(b.name, 30) : L.name;
        if (name.length < 2) return fail('Give your league a name (at least 2 letters).');
        if (isRude(name)) return fail('Please choose a friendlier league name.');
        let next;
        try { next = cleanRules({ ...L.rules, ...(b.rules || {}) }, now); } catch (e) { return fail(e.message); }
        // Schedule changes apply from the next round; the rest apply right away.
        const scheduleChanged = next.schedule !== L.rules.schedule || next.start !== L.rules.start || next.end !== L.rules.end;
        L.name = name;
        L.rules = next;
        if (scheduleChanged && roundStatus(L.round, now) === 'upcoming') L.round = { ...roundFor(next, L.round.n, now) };
        await store.setJSON(`leagues/${code}`, L);
        return json({ ok: true, ...publicLeague(L, code, now), note: scheduleChanged && roundStatus(L.round, now) !== 'upcoming' ? 'New dates apply when you start the next round.' : '' });
      }
      if (act === 'kick') {
        const pid = String(b.pid || '');
        if (!/^[0-9a-f]{12}$/.test(pid)) return fail('Pick a player to remove.');
        if (pid === L.owner) return fail('You cannot remove the league creator.');
        L.kicked = [...new Set([...(L.kicked || []), pid])].slice(-200);
        await store.setJSON(`leagues/${code}`, L);
        const rows = await readRows(store, code, L.round.key, L.rules);
        for (const r of rows) if ((await pidOf(r.playerId)) === pid) await store.setJSON(`scores/${code}/${L.round.key}/${r.playerId}`, { ...r, plays: 0, best: 0, total: 0, score: 0 });
        return json({ ok: true });
      }
      if (act === 'end') {
        if (roundStatus(L.round, now) === 'ended') return fail('This round has already ended.', 409);
        await archive(store, code, L);
        L.round.closed = true; L.round.closedAt = now; L.round.end = Math.max(L.round.start, Math.min(L.round.end, now));
        await store.setJSON(`leagues/${code}`, L);
        return json({ ok: true, ...publicLeague(L, code, now) });
      }
      if (act === 'new') {
        if (roundStatus(L.round, now) !== 'ended') await archive(store, code, L);
        else if (!L.round.archived) await archive(store, code, L);
        let rulesNext = L.rules;
        if (L.rules.schedule === 'custom') {
          try { rulesNext = cleanRules({ ...L.rules, start: b.start ?? L.rules.start, end: b.end ?? L.rules.end }, now); } catch (e) { return fail(e.message); }
          if (rulesNext.end <= now) return fail('Pick new dates for the next round.');
        }
        L.rules = rulesNext;
        L.round = roundFor(rulesNext, L.round.n + 1, now);
        if (rulesNext.schedule === 'week') { L.round.start = now; }
        await store.setJSON(`leagues/${code}`, L);
        return json({ ok: true, ...publicLeague(L, code, now) });
      }
      return fail('Unknown admin action.');
    }

    return fail('Not found.', 404);
  } catch (e) {
    return fail('Something went wrong. Try again.', 500);
  }
};
