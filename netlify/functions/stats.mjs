/* Office Wahala: analytics for the dashboard (password protected).
   GET /api/stats?days=7   header x-dashboard-key: <DASHBOARD_KEY>
   Rolls raw batches up into hourly and daily aggregates; completed hours/days are cached. */
import { getStore } from '@netlify/blobs';
import { emptyAgg, addBatch, mergeAgg, summarize, lagos, pad2 } from '../lib/analytics.mjs';
import { checkKey } from '../lib/auth.mjs';

export const config = { path: '/api/stats' };

const json = (b, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

async function pool(items, n, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => {
    while (i < items.length) { const k = i++; out[k] = await fn(items[k]); }
  }));
  return out;
}

async function hourAgg(store, day, hh, cacheable) {
  const ck = `agg/hour/${day}/${hh}`;
  const cached = await store.get(ck, { type: 'json' }).catch(() => null);
  if (cached) return cached;
  const { blobs } = await store.list({ prefix: `raw/${day}/${hh}/` });
  const a = emptyAgg();
  const recs = await pool(blobs, 24, (b) => store.get(b.key, { type: 'json' }).catch(() => null));
  for (const r of recs) if (r) addBatch(a, r);
  if (cacheable) await store.setJSON(ck, a).catch(() => {});
  return a;
}

async function dayAgg(store, day, today, nowHour) {
  const ck = `agg/day/${day}`;
  if (day < today) {
    const cached = await store.get(ck, { type: 'json' }).catch(() => null);
    if (cached) return cached;
  }
  const hours = [];
  for (let h = 0; h < 24; h++) {
    if (day === today && h > nowHour) break;
    hours.push(pad2(h));
  }
  const parts = await pool(hours, 6, (hh) => hourAgg(store, day, hh, day < today || Number(hh) < nowHour));
  const a = parts.reduce((acc, p) => mergeAgg(acc, p), emptyAgg());
  if (day < today) await store.setJSON(ck, a).catch(() => {});
  return a;
}

export default async (req) => {
  const auth = checkKey(req);
  if (auth === 'not-configured') return json({ error: 'Set a DASHBOARD_KEY (at least 8 characters) in Netlify → Site configuration → Environment variables, then redeploy.' }, 503);
  if (auth !== 'ok') return json({ error: 'Wrong dashboard key.' }, 401);
  const url = new URL(req.url);
  const days = Math.max(1, Math.min(90, parseInt(url.searchParams.get('days') || '7', 10) || 7));
  const now = Date.now();
  const { day: today, hour: nowHour } = lagos(now);
  const list = [];
  for (let i = days - 1; i >= 0; i--) list.push(lagos(now - i * 86400000).day);
  const store = getStore('office-wahala-stats');
  const dayAggs = await pool(list, 4, (d) => dayAgg(store, d, today, nowHour));
  const total = dayAggs.reduce((acc, a) => mergeAgg(acc, a), emptyAgg());
  const series = list.map((d, i) => {
    const a = dayAggs[i];
    return { day: d, visitors: Object.keys(a.vids).length, newVisitors: Object.keys(a.newv).length, sessions: Object.keys(a.sids).length,
      pageViews: a.pv, games: a.games, finished: a.overs, playSeconds: Math.round(a.play) };
  });
  const live = Object.values(total.last).filter((t) => now - t < 5 * 60 * 1000).length;
  return json({ generated: new Date(now).toISOString(), timezone: 'Africa/Lagos', from: list[0], to: list[list.length - 1], days, live, series, total: summarize(total) });
};
