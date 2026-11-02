// Office Wahala: builds the "make money" guide pages from tools/seo-content.mjs.
//   node tools/build-seo-pages.mjs
// Each page gets: a one-paragraph answer (for Google answers and AI assistants), key facts,
// a table of contents, the article, optional steps, FAQs, sources, related pages,
// and Article + FAQPage + HowTo + BreadcrumbList structured data.
// It also refreshes the matching blocks in sitemap.xml and llms.txt (between the "seo-pages" markers).
// To add a page: add an entry to seo-content.mjs and run this script again.
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { PAGES, UPDATED } from './seo-content.mjs';

const SITE = 'https://officewahala.netlify.app';
const IMG = SITE + '/screenshots/menu.jpg';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const strip = (h) => String(h).replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#x27;|&rsquo;/g, "'").replace(/\s+/g, ' ').trim();
const byPath = Object.fromEntries(PAGES.map((p) => [p.path, p]));
// Existing hand-written pages that guides can link to as related.
Object.assign(byPath, {
  'home-wahala/': { path: 'home-wahala/', short: 'Home Wahala: the game that runs every day', card: 'Dodge Mummy\'s slipper at home, and play the Home Cup at weekends.' },
  'about/': { path: 'about/', short: 'About Office Wahala and the developer', card: 'Who makes the game, how it is built and its version history.' },
  'winners/': { path: 'winners/', short: 'Weekly Cup winners', card: 'Every finished cup, its winners and whether they were paid.' },
});

const NAV = [
  ['/how-to-play/', 'How to play'], ['/home-wahala/', 'Home Wahala'], ['/winners/', 'Winners'],
  ['/make-money-playing-games/', 'Win prizes'], ['/faq/', 'FAQ'], ['/about/', 'About'],
];
export const FOOT = `<nav aria-label="Footer">
        <a href="/">Play the game</a>
        <a href="/how-to-play/">How to play</a>
        <a href="/home-wahala/">Home Wahala</a>
        <a href="/winners/">Weekly Cup winners</a>
        <a href="/cup-rules/">Cup rules</a>
        <a href="/make-money-playing-games/">Make money playing games</a>
        <a href="/how-to-make-money-online-nigeria/">Make money online in Nigeria</a>
        <a href="/faq/">FAQ</a>
        <a href="/nigerian-office-slang/">Nigerian office slang</a>
        <a href="/about/">About</a>
        <a href="/privacy/">Privacy</a>
        <a href="https://wa.me/2347066459689?text=I%20want%20to%20sponsor%20a%20Weekly%20Cup%20on%20Office%20Wahala" rel="noopener">Sponsor a Weekly Cup</a>
      </nav>`;

function words(p) {
  return strip([p.lede, p.answer, ...(p.sections || []).map((s) => s.html), ...((p.steps && p.steps.items) || []).flat(), ...(p.faqs || []).flat()].join(' ')).split(' ').length;
}

function schema(p, url) {
  const crumbs = [['Office Wahala', SITE + '/'], ...p.crumbs.map(([n, u]) => [n, u ? SITE + u : url])];
  const graph = [
    {
      '@type': 'Article', '@id': url + '#article', headline: p.h1, description: p.desc, url, inLanguage: 'en-NG',
      datePublished: p.published || UPDATED, dateModified: UPDATED, image: IMG, wordCount: words(p),
      author: { '@id': SITE + '/#developer' }, publisher: { '@id': SITE + '/#analaize' },
      isPartOf: { '@id': SITE + '/#website' }, mainEntityOfPage: url, breadcrumb: { '@id': url + '#crumbs' },
      about: (p.about || []).map((a) => ({ '@type': 'Thing', name: a })),
      speakable: { '@type': 'SpeakableSpecification', cssSelector: ['.answer'] },
      ...(p.sources && p.sources.length ? { citation: p.sources.map(([t, u]) => ({ '@type': 'CreativeWork', name: t, url: u })) } : {}),
    },
    { '@type': 'BreadcrumbList', '@id': url + '#crumbs', itemListElement: crumbs.map(([n, u], i) => ({ '@type': 'ListItem', position: i + 1, name: n, item: u })) },
    { '@type': 'WebSite', '@id': SITE + '/#website', url: SITE + '/', name: 'Office Wahala', publisher: { '@id': SITE + '/#analaize' } },
    { '@type': 'Organization', '@id': SITE + '/#analaize', name: 'Analaize Limited', url: 'https://www.analaize.com.ng', address: { '@type': 'PostalAddress', addressLocality: 'Lagos', addressCountry: 'NG' } },
    { '@type': 'Person', '@id': SITE + '/#developer', name: 'Mmadubuko Micheal', jobTitle: 'CEO', worksFor: { '@id': SITE + '/#analaize' }, url: 'https://www.analaize.com.ng' },
  ];
  if (p.faqs && p.faqs.length) graph.push({ '@type': 'FAQPage', '@id': url + '#faq', mainEntity: p.faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: strip(a) } })) });
  if (p.steps) graph.push({ '@type': 'HowTo', '@id': url + '#howto', name: p.steps.name, totalTime: p.steps.time || undefined, estimatedCost: { '@type': 'MonetaryAmount', currency: 'NGN', value: '0' },
    step: p.steps.items.map(([n, t], i) => ({ '@type': 'HowToStep', position: i + 1, name: n, text: strip(t), url: url + '#step-' + (i + 1) })) });
  const kids = PAGES.filter((k) => k.parent === p.path);
  if (kids.length) graph.push({ '@type': 'ItemList', '@id': url + '#guides', name: p.listTitle || 'More guides', itemListElement: kids.map((k, i) => ({ '@type': 'ListItem', position: i + 1, url: SITE + '/' + k.path, name: k.h1 })) });
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 1);
}

function render(p) {
  const url = SITE + '/' + p.path;
  const mins = Math.max(2, Math.round(words(p) / 220));
  const kids = PAGES.filter((k) => k.parent === p.path);
  const toc = (p.sections || []).filter((s) => s.id && !s.noToc);
  const crumbHtml = ['<a href="/">Office Wahala</a>', ...p.crumbs.map(([n, u]) => (u ? `<a href="${u}">${esc(n)}</a>` : esc(n)))].join(' › ');
  const nav = NAV.map(([u, n]) => `<a href="${u}"${p.path.startsWith(u.slice(1)) && u !== '/' ? ' aria-current="page"' : ''}>${n}</a>`).join('\n        ');
  const related = (p.related || []).map((r) => byPath[r]).filter(Boolean);
  return `<!doctype html>
<html lang="en-NG">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(p.title)}</title>
  <meta name="description" content="${esc(p.desc)}">
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">
  <link rel="canonical" href="${url}">
  <meta name="theme-color" content="#0d1526">
  <meta name="author" content="Mmadubuko Micheal, Analaize Limited">
  <meta property="og:site_name" content="Office Wahala">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${esc(p.title)}">
  <meta property="og:description" content="${esc(p.desc)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${IMG}">
  <meta property="og:locale" content="en_NG">
  <meta property="article:modified_time" content="${UPDATED}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="icon" href="/icons/favicon-32.png" type="image/png" sizes="32x32">
  <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
  <link rel="stylesheet" href="/pages.css">
  <script type="application/ld+json">
${schema(p, url)}
  </script>
</head>
<body>
  <header class="site-head">
    <div class="wrap">
      <a class="brand" href="/"><img class="brand-logo" src="/icons/logo-mark-96.webp" width="40" height="40" alt=""><strong>Office Wahala</strong></a>
      <nav class="site-nav" aria-label="Guides">
        ${nav}
        <a class="play-cta" href="/">Play free</a>
      </nav>
    </div>
  </header>
  <main class="wrap">
    <p class="crumbs">${crumbHtml}</p>
    <h1>${esc(p.h1)}</h1>
    <p class="lede">${p.lede}</p>
    <p class="byline">By <strong>Mmadubuko Micheal</strong>, Analaize Limited, Lagos · Updated <time datetime="${UPDATED}">${new Date(UPDATED).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</time> · ${mins} min read</p>
    <div class="answer"><p><strong>Short answer:</strong> ${p.answer}</p></div>
${p.facts ? `    <aside class="facts" aria-label="Key facts"><h2 class="facts-h">Key facts</h2><ul>${p.facts.map((f) => `<li>${f}</li>`).join('')}</ul></aside>\n` : ''}${toc.length > 2 ? `    <nav class="toc" aria-label="On this page"><strong>On this page</strong><ol>${toc.map((s) => `<li><a href="#${s.id}">${esc(strip(s.h))}</a></li>`).join('')}${p.steps ? '<li><a href="#steps">' + esc(p.steps.title || 'Step by step') + '</a></li>' : ''}${p.faqs ? '<li><a href="#faq">Questions people ask</a></li>' : ''}</ol></nav>\n` : ''}${(p.sections || []).map((s) => `    <h2${s.id ? ` id="${s.id}"` : ''}>${s.h}</h2>\n    ${s.html}`).join('\n')}
${p.steps ? `    <h2 id="steps">${esc(p.steps.title || 'Step by step')}</h2>\n    <ol class="steps">${p.steps.items.map(([n, t], i) => `<li id="step-${i + 1}"><strong>${esc(n)}</strong> ${t}</li>`).join('')}</ol>` : ''}
${kids.length ? `    <h2 id="guides">${esc(p.listTitle || 'More guides')}</h2>\n    <div class="cards">${kids.map((k) => `<a class="card-link" href="/${k.path}"><strong>${esc(k.short || k.h1)}</strong><span>${esc(k.card || k.desc)}</span></a>`).join('')}</div>` : ''}
${p.faqs ? `    <h2 id="faq">Questions people ask</h2>\n    <div class="faq">${p.faqs.map(([q, a]) => `\n      <details>\n        <summary>${esc(q)}</summary>\n        <p>${a}</p>\n      </details>`).join('')}\n    </div>` : ''}
    <aside class="disclosure"><p><strong>Honest note:</strong> we make Office Wahala, so we are not neutral about it. Office Wahala prizes come only from the free Weekly Cups and weekly leaderboards, and only the top players win. The naira you earn inside the game is pretend money: it cannot be bought, sold or cashed out. Nothing on this page is financial or legal advice.</p></aside>
${p.sources && p.sources.length ? `    <h2 id="sources">Sources</h2>\n    <ul class="sources">${p.sources.map(([t, u]) => `<li><a href="${u}" rel="noopener" target="_blank">${esc(t)}</a></li>`).join('')}</ul>` : ''}
${related.length ? `    <h2 id="related">Related guides</h2>\n    <div class="cards">${related.map((k) => `<a class="card-link" href="/${k.path}"><strong>${esc(k.short || k.h1)}</strong><span>${esc(k.card || k.desc)}</span></a>`).join('')}</div>` : ''}
    <div class="cta-box">
      <p><strong>${esc(p.cta || 'Play the free Weekly Cup.')}</strong> No sign-up, no deposit, no download. Your best score could win airtime, data or a bank transfer.</p>
      <a class="play-cta" href="/">Play free now</a>
    </div>
  </main>
  <footer class="site-foot">
    <div class="wrap">
      ${FOOT}
      <p>Built by <strong>Mmadubuko Micheal</strong>, CEO, <a href="https://www.analaize.com.ng" rel="noopener">Analaize Limited</a>, Lagos. Contact the developer: <a href="tel:+2347066459689">07066459689</a> · <a href="https://wa.me/2347066459689" rel="noopener">WhatsApp</a></p>
      <p>Last updated ${UPDATED}.</p>
    </div>
  </footer>
  <script src="/analytics.js" defer></script>
</body>
</html>
`.replace(/\n{3,}/g, '\n');
}

for (const p of PAGES) {
  mkdirSync(p.path, { recursive: true });
  writeFileSync(p.path + 'index.html', render(p));
}

// sitemap + llms.txt blocks
const replaceBlock = (file, start, end, body) => {
  const s = readFileSync(file, 'utf8');
  const i = s.indexOf(start), j = s.indexOf(end);
  if (i < 0 || j < 0) throw new Error('markers missing in ' + file);
  writeFileSync(file, s.slice(0, i + start.length) + '\n' + body + '\n' + s.slice(j));
};
replaceBlock('sitemap.xml', '<!-- seo-pages:start -->', '<!-- seo-pages:end -->', PAGES.map((p) => `  <url>
    <loc>${SITE}/${p.path}</loc>
    <lastmod>${UPDATED}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${p.parent ? '0.7' : '0.8'}</priority>
  </url>`).join('\n') + '\n  ');
replaceBlock('llms.txt', '<!-- seo-pages:start -->', '<!-- seo-pages:end -->', PAGES.map((p) => `- [${p.h1}](${SITE}/${p.path}): ${strip(p.answer).slice(0, 220)}`).join('\n'));
console.log('Built', PAGES.length, 'guide pages:', PAGES.reduce((n, p) => n + words(p), 0), 'words');
