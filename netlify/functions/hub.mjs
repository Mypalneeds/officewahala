/* Office Wahala: community features (Netlify Functions + Netlify Blobs).
   No sign-ups and no personal data: players are identified only by the random
   device ID the game makes on first visit; boards show the name they typed.

   Routes
     GET  /api/hub/health
     POST /api/hub/state      { playerId, state, score, duration, level }   add a shift to your state's weekly total
     GET  /api/hub/states?me= -> this week's State Wars table (+ last week's winner, your contribution)
     POST /api/hub/season     { playerId, name, state, score, duration, level }   your best this month
     GET  /api/hub/season?me= -> this month's top 50
     POST /api/hub/referral   { playerId, name, ref }   new player finished a first shift via an invite link
     POST /api/hub/desk       { playerId, name, desk }  share your desk so league colleagues can see it
     GET  /api/hub/desk/:pid  -> a colleague's desk

   Data lives in the "office-wahala" blob store under states/, statep/, season/, ref/, desks/ and gifts/.
*/
import { getStore } from '@netlify/blobs';

export const config = { path: ['/api/hub', '/api/hub/*'] };

const HOUR = 3600 * 1000;
export const STATES = {
  ab: 'Abia', ad: 'Adamawa', ak: 'Akwa Ibom', an: 'Anambra', ba: 'Bauchi', by: 'Bayelsa', be: 'Benue', bo: 'Borno', cr: 'Cross River',
  de: 'Delta', eb: 'Ebonyi', ed: 'Edo', ek: 'Ekiti', en: 'Enugu', fc: 'FCT Abuja', go: 'Gombe', im: 'Imo', ji: 'Jigawa', kd: 'Kaduna',
  kn: 'Kano', kt: 'Katsina', ke: 'Kebbi', ko: 'Kogi', kw: 'Kwara', la: 'Lagos', na: 'Nasarawa', ni: 'Niger', og: 'Ogun', on: 'Ondo',
  os: 'Osun', oy: 'Oyo', pl: 'Plateau', ri: 'Rivers', so: 'Sokoto', ta: 'Taraba', yo: 'Yobe', za: 'Zamfara',
};
const SUBSTR = ['fuck', 'shit', 'bitch', 'cunt', 'pussy', 'nigger', 'nigga', 'whore', 'slut', 'bastard', 'asshole',
  'ashawo', 'olosho', 'werey', 'oloriburuku', 'kpekus', 'gbola', 'oloshi'];
const WORDS = ['dick', 'prick', 'rape', 'ode', 'toto', 'mumu', 'dindin', 'ass', 'sex'];
// Desk items players can place (keep in sync with DESK_ITEMS in game.js)
export const DESK_IDS = ['plant', 'fan', 'gen', 'laptop', 'flag', 'clock', 'flask', 'letter', 'eotm', 'radio', 'lamp', 'phone2', 'calendar', 'stickers', 'trophies', 'mug'];
const REF_BONUS = 1000, REF_MONTH_CAP = 20;
const SHIFT_DAY_CAP = 25; // shifts per player per day that count for State Wars

const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
const fail = (msg, status = 400) => json({ error: msg }, status);
const validPlayer = (p) => typeof p === 'string' && /^[a-z0-9]{12,40}$/.test(p);
const cleanName = (s, max = 20) => String(s || '').replace(/[^A-Za-z0-9 _.\-&']/g, '').replace(/\s+/g, ' ').trim().slice(0, max);
function isRude(s) {
  const low = String(s || '').toLowerCase();
  const flat = low.replace(/0/g, 'o').replace(/1/g, 'i').replace(/3/g, 'e').replace(/[^a-z]/g, '');
  if (SUBSTR.some((w) => flat.includes(w))) return true;
  return low.replace(/0/g, 'o').replace(/1/g, 'i').split(/[^a-z]+/).some((w) => WORDS.includes(w));
}
async function sha(s) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
// Same scrambled player ID the leagues use, so a desk or referral can be linked from a league board.
export const pidOf = async (playerId) => (await sha('pid:' + playerId)).slice(0, 12);
export function weekKey(now = Date.now()) {
  const d = new Date(now + HOUR);
  const day = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - day + 3);
  const firstThu = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round(((d - firstThu) / 86400000 - 3 + ((firstThu.getUTCDay() + 6) % 7)) / 7);
  return d.getUTCFullYear() + '-W' + String(week).padStart(2, '0');
}
const lagosDay = (now) => new Date(now + HOUR).toISOString().slice(0, 10);
export const monthKey = (now = Date.now()) => new Date(now + HOUR).toISOString().slice(0, 7);
function plausible(score, duration, level) {
  if (!(score >= 0 && duration >= 1 && level >= 1) || score > 3000000 || duration > 36000) return 'Invalid score.';
  if (level > Math.floor(duration / 20) + 2 || score > duration * 900 + 4000) return 'Score does not match the time survived.';
  return '';
}
async function readBody(req, max = 4000) {
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
const randId = (n = 6) => [...crypto.getRandomValues(new Uint8Array(n))].map((b) => 'abcdefghjkmnpqrstuvwxyz23456789'[b % 31]).join('');

async function stateTable(store, week) {
  const rows = await Promise.all(Object.keys(STATES).map(async (id) => {
    const s = await store.get(`states/${week}/${id}`, { type: 'json' }).catch(() => null);
    const players = s ? s.players || 0 : 0, total = s ? s.total || 0 : 0;
    return { id, name: STATES[id], total, players, avg: players ? Math.round(total / players) : 0 };
  }));
  return rows.sort((a, b) => b.total - a.total || b.avg - a.avg || a.name.localeCompare(b.name));
}

export default async (req) => {
  const url = new URL(req.url);
  const parts = url.pathname.replace(/\/+$/, '').split('/').slice(3); // after /api/hub
  const store = getStore({ name: 'office-wahala', consistency: 'strong' });
  const now = Date.now();
  try {
    if (parts[0] === 'health' && req.method === 'GET') return json({ ok: true, week: weekKey(now), season: monthKey(now) });

    // ---------- State Wars ----------
    if (parts[0] === 'state' && req.method === 'POST') {
      const b = await readBody(req);
      if (!validPlayer(b.playerId)) return fail('Invalid player.');
      if (!STATES[b.state]) return fail('Pick your state first.');
      const score = Math.floor(Number(b.score)), duration = Math.floor(Number(b.duration)), level = Math.floor(Number(b.level));
      const bad = plausible(score, duration, level);
      if (bad) return fail(bad);
      if (await limited(store, 'state', b.playerId, 10)) return fail('Slow down a little.', 429);
      const week = weekKey(now), day = lagosDay(now);
      const pk = `statep/${week}/${b.playerId}`;
      const me = (await store.get(pk, { type: 'json' }).catch(() => null)) || { state: b.state, sum: 0, shifts: 0, days: {} };
      // you play for one state per week (stops state-hopping); change applies next Monday
      const st = me.state;
      if ((me.days[day] || 0) >= SHIFT_DAY_CAP) return json({ ok: true, counted: false, state: st, note: 'Daily limit for State Wars reached. Your shifts still count for everything else.' });
      me.days = { [day]: (me.days[day] || 0) + 1 };
      const first = me.shifts === 0;
      me.sum += score; me.shifts++;
      await store.setJSON(pk, me);
      const sk = `states/${week}/${st}`;
      const s = (await store.get(sk, { type: 'json' }).catch(() => null)) || { total: 0, players: 0 };
      s.total += score; if (first) s.players++;
      await store.setJSON(sk, s);
      return json({ ok: true, counted: true, state: st, mine: me.sum, stateTotal: s.total });
    }
    if (parts[0] === 'states' && req.method === 'GET') {
      const week = weekKey(now);
      const table = await stateTable(store, week);
      const lastWeek = weekKey(now - 7 * 24 * HOUR);
      const prev = await stateTable(store, lastWeek);
      const out = { week, states: table, lastWinner: prev[0] && prev[0].total > 0 ? prev[0] : null };
      const me = url.searchParams.get('me') || '';
      if (validPlayer(me)) {
        const mine = await store.get(`statep/${week}/${me}`, { type: 'json' }).catch(() => null);
        out.me = mine ? { state: mine.state, sum: mine.sum, shifts: mine.shifts } : null;
      }
      return json(out);
    }

    // ---------- Monthly season board ----------
    if (parts[0] === 'season' && req.method === 'POST') {
      const b = await readBody(req);
      if (!validPlayer(b.playerId)) return fail('Invalid player.');
      const name = cleanName(b.name, 20);
      if (!name) return fail('Add your name first.');
      if (isRude(name)) return fail('Please choose a friendlier name.');
      const score = Math.floor(Number(b.score)), duration = Math.floor(Number(b.duration)), level = Math.floor(Number(b.level));
      const bad = plausible(score, duration, level);
      if (bad) return fail(bad);
      if (await limited(store, 'season', b.playerId, 8)) return fail('Slow down a little.', 429);
      const month = monthKey(now);
      const pid = await pidOf(b.playerId);
      const tk = `season/${month}/top`;
      const top = (await store.get(tk, { type: 'json' }).catch(() => null)) || { rows: [] };
      const prev = top.rows.find((r) => r.pid === pid);
      if (!prev || score > prev.score || prev.name !== name) {
        const row = { pid, name, score: Math.max(score, prev ? prev.score : 0), state: STATES[b.state] ? b.state : '', t: now };
        top.rows = [row, ...top.rows.filter((r) => r.pid !== pid)].sort((a, c) => c.score - a.score || a.t - c.t).slice(0, 50);
        await store.setJSON(tk, top);
      }
      const rank = top.rows.findIndex((r) => r.pid === pid) + 1;
      return json({ ok: true, season: month, rank });
    }
    if (parts[0] === 'season' && req.method === 'GET') {
      const month = monthKey(now);
      const top = (await store.get(`season/${month}/top`, { type: 'json' }).catch(() => null)) || { rows: [] };
      const me = url.searchParams.get('me') || '';
      const pid = validPlayer(me) ? await pidOf(me) : '';
      return json({ season: month, top: top.rows.map((r) => ({ name: r.name, score: r.score, state: r.state, me: r.pid === pid })), rank: pid ? top.rows.findIndex((r) => r.pid === pid) + 1 : 0 });
    }

    // ---------- Referrals: both players get ₦1,000 (pretend money) ----------
    if (parts[0] === 'referral' && req.method === 'POST') {
      const b = await readBody(req);
      if (!validPlayer(b.playerId)) return fail('Invalid player.');
      const ref = String(b.ref || '');
      if (!/^[0-9a-f]{12}$/.test(ref)) return fail('Invalid invite.');
      const myPid = await pidOf(b.playerId);
      if (ref === myPid) return fail('You cannot invite yourself.');
      const ck = `ref/claimed/${b.playerId}`;
      if (await store.get(ck)) return fail('Invite bonus already claimed on this phone.', 409);
      const month = monthKey(now);
      const nk = `ref/count/${ref}/${month}`;
      const n = (await store.get(nk, { type: 'json' }).catch(() => null)) || { n: 0 };
      await store.setJSON(ck, { ref, t: now });
      const name = cleanName(b.name, 20);
      if (n.n < REF_MONTH_CAP) {
        n.n++; await store.setJSON(nk, n);
        await store.setJSON(`gifts/${ref}/${now}-${randId()}`, { kind: 'referral', from: name && !isRude(name) ? name : 'A new colleague', amount: REF_BONUS, league: 'Invite', t: now });
      }
      return json({ ok: true, bonus: REF_BONUS });
    }

    // ---------- Desks ----------
    if (parts[0] === 'desk' && req.method === 'POST') {
      const b = await readBody(req);
      if (!validPlayer(b.playerId)) return fail('Invalid player.');
      const name = cleanName(b.name, 20);
      if (!name || isRude(name)) return fail('Add a friendly name first.');
      const d = b.desk || {};
      const items = (Array.isArray(d.items) ? d.items : []).filter((x) => DESK_IDS.includes(x)).slice(0, 16);
      const desk = { items: [...new Set(items)], badges: Math.max(0, Math.min(999, Math.floor(Number(d.badges) || 0))),
        stickers: Math.max(0, Math.min(99, Math.floor(Number(d.stickers) || 0))), streak: Math.max(0, Math.min(9999, Math.floor(Number(d.streak) || 0))),
        office: /^[a-z]{2,12}$/.test(d.office || '') ? d.office : 'agency', title: cleanName(d.title, 30) };
      if (await limited(store, 'desk', b.playerId, 5)) return fail('Slow down a little.', 429);
      const pid = await pidOf(b.playerId);
      await store.setJSON(`desks/${pid}`, { name, desk, t: now });
      return json({ ok: true, pid });
    }
    if (parts[0] === 'desk' && parts[1] && req.method === 'GET') {
      if (!/^[0-9a-f]{12}$/.test(parts[1])) return fail('Invalid desk.', 404);
      const d = await store.get(`desks/${parts[1]}`, { type: 'json' }).catch(() => null);
      if (!d) return fail('This colleague has not set up their desk yet.', 404);
      return json(d);
    }
    return fail('Not found.', 404);
  } catch (e) {
    return fail('Something went wrong. Try again.', 500);
  }
};
