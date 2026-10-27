// House ads shown until you add your own in the dashboard (Ads tab).
export const DEFAULT_ADS = {
  updated: '2026-10-27',
  ads: [
    {
      id: 'advertise-here', brand: 'YOUR BRAND HERE', headline: 'Advertise on Lagos roads in Office Wahala', sub: 'WhatsApp 0706 645 9689',
      url: 'https://wa.me/2347066459689?text=I%20want%20to%20advertise%20on%20Office%20Wahala',
      bg: '#f5b301', fg: '#17203a', accent: '#008751', image: '', weight: 3, where: ['road', 'office', 'menu'], start: '', end: '',
    },
    {
      id: 'analaize', brand: 'Analaize Limited', headline: 'Websites, SEO & market research', sub: 'analaize.com.ng',
      url: 'https://www.analaize.com.ng', bg: '#0d1526', fg: '#ffffff', accent: '#19c37d', image: '', weight: 2, where: ['road', 'office', 'menu'], start: '', end: '',
    },
    {
      id: 'office-leagues', brand: 'OFFICE LEAGUES', headline: 'Challenge your whole office every week', sub: 'Menu → Office leagues',
      url: 'https://officewahala.netlify.app/', bg: '#7a1fa2', fg: '#ffffff', accent: '#ffd23f', image: '', weight: 1, where: ['road', 'office'], start: '', end: '',
    },
  ],
};

const HEX = /^#[0-9a-f]{6}$/i;
const clip = (v, n) => String(v == null ? '' : v).replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, n);
const okUrl = (u) => { try { const x = new URL(u); return x.protocol === 'https:' ? x.toString() : ''; } catch (e) { return ''; } };
const needUrl = (u, id, what) => {
  if (!u) return '';
  const ok = okUrl(String(u).trim());
  if (!ok) throw new Error(`Ad "${id}": the ${what} must start with https://`);
  return ok;
};
const okDate = (d) => (/^\d{4}-\d{2}-\d{2}$/.test(d || '') ? d : '');

// Validate an ads config from the dashboard. Throws with a readable message.
export function cleanAds(body) {
  if (!body || !Array.isArray(body.ads)) throw new Error('Expected { ads: [...] }');
  if (body.ads.length > 30) throw new Error('At most 30 ads.');
  const seen = new Set();
  const ads = body.ads.map((a, i) => {
    const id = clip(a.id, 40).toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    if (!id) throw new Error(`Ad ${i + 1}: needs an id`);
    if (seen.has(id)) throw new Error(`Ad ${i + 1}: id "${id}" is used twice`);
    seen.add(id);
    const brand = clip(a.brand, 40);
    if (!brand) throw new Error(`Ad "${id}": needs a brand name`);
    const where = (Array.isArray(a.where) ? a.where : []).filter((w) => ['road', 'office', 'menu'].includes(w));
    return {
      id, brand, headline: clip(a.headline, 60), sub: clip(a.sub, 40),
      url: needUrl(a.url, id, 'link'), image: needUrl(a.image, id, 'image link'),
      bg: HEX.test(a.bg) ? a.bg : '#0d1526', fg: HEX.test(a.fg) ? a.fg : '#ffffff', accent: HEX.test(a.accent) ? a.accent : '#f5b301',
      weight: Math.max(1, Math.min(10, Math.round(Number(a.weight) || 1))),
      where: where.length ? where : ['road', 'office', 'menu'],
      start: okDate(a.start), end: okDate(a.end),
    };
  });
  return { updated: new Date().toISOString().slice(0, 10), ads };
}
