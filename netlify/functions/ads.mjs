/* Office Wahala: sponsor billboards.
   GET  /api/ads   -> { ads: [...] }  (public, cached briefly)
   POST /api/ads   header x-dashboard-key -> save a new config from the dashboard */
import { getStore } from '@netlify/blobs';
import { DEFAULT_ADS, cleanAds } from '../lib/ads-default.mjs';
import { checkKey } from '../lib/auth.mjs';

export const config = { path: '/api/ads' };

const json = (b, s = 200, cache = 'no-store') => new Response(JSON.stringify(b), { status: s, headers: { 'content-type': 'application/json', 'cache-control': cache } });

export default async (req) => {
  const store = getStore('office-wahala-ads');
  if (req.method === 'GET') {
    const cfg = await store.get('config', { type: 'json' }).catch(() => null);
    return json(cfg || DEFAULT_ADS, 200, 'public, max-age=120');
  }
  if (req.method === 'POST') {
    const auth = checkKey(req);
    if (auth === 'not-configured') return json({ error: 'Set DASHBOARD_KEY in Netlify first.' }, 503);
    if (auth !== 'ok') return json({ error: 'Wrong dashboard key.' }, 401);
    try {
      const text = await req.text();
      if (text.length > 60000) throw new Error('Config too large.');
      const cfg = cleanAds(JSON.parse(text));
      await store.setJSON('config', cfg);
      return json(cfg);
    } catch (e) { return json({ error: e.message || 'Invalid config' }, 400); }
  }
  return json({ error: 'Method not allowed' }, 405);
};
