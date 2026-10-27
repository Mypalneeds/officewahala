/* Office Wahala: collect anonymous gameplay events.
   POST /api/track        { v, s, c, e: [{ n, t, p }] }  -> 204
   GET  /api/track/health -> { ok: true }
   Stores each batch as its own blob under raw/<day>/<hour>/ (Lagos time). No IP addresses are stored. */
import { getStore } from '@netlify/blobs';
import { cleanBatch, isBot, lagos, pad2 } from '../lib/analytics.mjs';

export const config = { path: ['/api/track', '/api/track/health'] };

const json = (b, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

export default async (req, context) => {
  const url = new URL(req.url);
  if (req.method === 'GET' && url.pathname.endsWith('/health')) return json({ ok: true });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (isBot(req.headers.get('user-agent') || '')) return new Response(null, { status: 204 });
  try {
    const text = await req.text();
    if (text.length > 48000) return json({ error: 'Too large' }, 413);
    const rec = cleanBatch(JSON.parse(text));
    const cc = context && context.geo && context.geo.country && context.geo.country.code;
    if (cc && /^[A-Z]{2}$/.test(cc)) rec.cc = cc;
    const now = Date.now();
    const { day, hour } = lagos(now);
    const store = getStore('office-wahala-stats');
    const key = `raw/${day}/${pad2(hour)}/${now}-${Math.random().toString(36).slice(2, 10)}`;
    await store.setJSON(key, rec);
    return new Response(null, { status: 204 });
  } catch (e) {
    return json({ error: 'Bad request' }, 400);
  }
};
