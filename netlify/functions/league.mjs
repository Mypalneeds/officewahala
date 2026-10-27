/* Office Wahala: Office Leagues API (Netlify Functions + Netlify Blobs).
   Private weekly leaderboards that colleagues join with a 6-character code.

   Routes
     GET  /api/league/health              -> { ok: true }
     POST /api/league                     -> create  { name, playerId }            -> { code, name }
     GET  /api/league/:code               -> board   (this week's top 50)
     POST /api/league/:code/score         -> submit  { playerId, name, score, duration, level }

   Data lives in the "office-wahala" blob store:
     leagues/<CODE>                         { name, created }
     scores/<CODE>/<YYYY-Www>/<playerId>   { name, score, duration, level, updated }
     rl/<kind>/<id>                         rate-limit timestamps
*/
import { getStore } from '@netlify/blobs';

export const config = { path: ['/api/league', '/api/league/*'] };

const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
// Blocked words. SUBSTR: blocked anywhere in the name. WORDS: blocked only as whole words
// (so names like "Dickson" or "Grapes" still work).
const SUBSTR = ['fuck', 'shit', 'bitch', 'cunt', 'pussy', 'nigger', 'nigga', 'whore', 'slut', 'bastard', 'asshole',
  'ashawo', 'olosho', 'werey', 'oloriburuku', 'kpekus', 'gbola', 'oloshi'];
const WORDS = ['dick', 'prick', 'rape', 'ode', 'toto', 'mumu', 'dindin', 'ass', 'sex'];

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
});
const fail = (msg, status = 400) => json({ error: msg }, status);

export function cleanName(s, max = 20) {
  return String(s || '').replace(/[^A-Za-z0-9 _.\-&']/g, '').replace(/\s+/g, ' ').trim().slice(0, max);
}
export function isRude(s) {
  const low = String(s || '').toLowerCase();
  const flat = low.replace(/0/g, 'o').replace(/1/g, 'i').replace(/3/g, 'e').replace(/[^a-z]/g, '');
  if (SUBSTR.some((w) => flat.includes(w))) return true;
  const words = low.replace(/0/g, 'o').replace(/1/g, 'i').split(/[^a-z]+/);
  return words.some((w) => WORDS.includes(w));
}
// ISO week in Lagos time (UTC+1), e.g. "2026-W44". Leagues reset every Monday.
export function weekKey(now = Date.now()) {
  const d = new Date(now + 3600 * 1000);
  const day = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - day + 3);
  const firstThu = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round(((d - firstThu) / 86400000 - 3 + ((firstThu.getUTCDay() + 6) % 7)) / 7);
  return d.getUTCFullYear() + '-W' + String(week).padStart(2, '0');
}
const validCode = (c) => /^[A-HJ-NP-Z2-9]{6}$/.test(c);
const validPlayer = (p) => typeof p === 'string' && /^[a-z0-9]{12,40}$/.test(p);

async function limited(store, kind, id, seconds) {
  const key = `rl/${kind}/${id}`;
  const last = await store.get(key, { type: 'json' }).catch(() => null);
  const now = Date.now();
  if (last && now - last.t < seconds * 1000) return true;
  await store.setJSON(key, { t: now });
  return false;
}

async function readBody(req) {
  const text = await req.text();
  if (text.length > 2000) throw new Error('too large');
  return JSON.parse(text || '{}');
}

export default async (req, context) => {
  const url = new URL(req.url);
  const parts = url.pathname.replace(/\/+$/, '').split('/').slice(3); // after /api/league
  const store = getStore({ name: 'office-wahala', consistency: 'strong' });
  const ip = (context && context.ip) || req.headers.get('x-nf-client-connection-ip') || 'unknown';

  try {
    if (parts[0] === 'health' && req.method === 'GET') return json({ ok: true, week: weekKey() });

    // Create a league
    if (parts.length === 0 && req.method === 'POST') {
      const body = await readBody(req);
      const name = cleanName(body.name, 30);
      if (name.length < 2) return fail('Give your league a name (at least 2 letters).');
      if (isRude(name)) return fail('Please choose a friendlier league name.');
      if (!validPlayer(body.playerId)) return fail('Invalid player.');
      if (await limited(store, 'create', ip.replace(/[^a-z0-9.:]/gi, ''), 30)) return fail('Wait a few seconds before creating another league.', 429);
      for (let i = 0; i < 8; i++) {
        let code = '';
        const rnd = crypto.getRandomValues(new Uint8Array(6));
        for (const b of rnd) code += CODE_CHARS[b % CODE_CHARS.length];
        const exists = await store.get(`leagues/${code}`);
        if (exists) continue;
        await store.setJSON(`leagues/${code}`, { name, created: Date.now() });
        return json({ code, name }, 201);
      }
      return fail('Could not create a league. Try again.', 500);
    }

    const code = String(parts[0] || '').toUpperCase();
    if (!validCode(code)) return fail('That league code is not valid.', 404);
    const league = await store.get(`leagues/${code}`, { type: 'json' });
    if (!league) return fail('No league with that code. Check the code and try again.', 404);
    const week = weekKey();

    // Board
    if (parts.length === 1 && req.method === 'GET') {
      const { blobs } = await store.list({ prefix: `scores/${code}/${week}/` });
      const rows = (await Promise.all(blobs.slice(0, 200).map((b) => store.get(b.key, { type: 'json' }).catch(() => null))))
        .filter(Boolean)
        .sort((a, b) => b.score - a.score || a.updated - b.updated)
        .slice(0, 50)
        .map((r) => ({ name: r.name, score: r.score, duration: r.duration, level: r.level }));
      return json({ code, name: league.name, week, players: rows });
    }

    // Submit a score
    if (parts[1] === 'score' && req.method === 'POST') {
      const b = await readBody(req);
      if (!validPlayer(b.playerId)) return fail('Invalid player.');
      const name = cleanName(b.name, 20);
      if (name.length < 1) return fail('Add your name first.');
      if (isRude(name)) return fail('Please choose a friendlier name.');
      const score = Math.floor(Number(b.score));
      const duration = Math.floor(Number(b.duration));
      const level = Math.floor(Number(b.level));
      if (!(score >= 0 && duration >= 1 && level >= 1) || score > 3000000 || duration > 36000) return fail('Invalid score.');
      // Plausibility: one level per 20s of office time; real play peaks well under ~150 points/second.
      if (level > Math.floor(duration / 20) + 2 || score > duration * 900 + 4000) return fail('Score does not match the time survived.');
      if (await limited(store, 'score', b.playerId, 8)) return fail('Slow down a little.', 429);
      const key = `scores/${code}/${week}/${b.playerId}`;
      const prev = await store.get(key, { type: 'json' }).catch(() => null);
      if (!prev || score > prev.score || prev.name !== name) {
        const best = prev && prev.score > score ? prev : { score, duration, level };
        await store.setJSON(key, { name, score: best.score, duration: best.duration, level: best.level, updated: Date.now() });
      }
      return json({ ok: true, week });
    }

    return fail('Not found.', 404);
  } catch (e) {
    return fail('Something went wrong. Try again.', 500);
  }
};
