// Content for the "make money" guide pages. Built into static HTML by tools/build-seo-pages.mjs.
// House rules for these pages:
//  - Be honest. Office Wahala prizes come only from the free Weekly Cups and weekly leaderboards; only top players win.
//  - The in-game naira is pretend money. It can never be bought, sold or cashed out. Never suggest otherwise.
//  - No income promises, no "earn ₦X daily". No financial or legal advice.
//  - Every page answers one real question first (the .answer box), in plain words.
export const UPDATED = '2026-11-02';

const MM = 'make-money-playing-games/';
const MO = 'how-to-make-money-online-nigeria/';
const CUP = '<a href="/cup-rules/">cup rules</a>';
const WIN = '<a href="/winners/">winners page</a>';

const SRC = {
  cbex: ['TechCabal: CBEX, the "double your money" platform that collapsed (April 2025)', 'https://techcabal.com/2025/04/15/cbex-ponzi-collapse-nigeria/'],
  efcc: ['ThisDay: EFCC and Interpol probe the ₦1.3 trillion CBEX loss', 'https://thisdaylive.com/index.php/2025/04/22/efcc-interpol-in-joint-n1-3tn-cbex-probe'],
  sec: ['Nairametrics: SEC warns Nigerians about Ponzi schemes on WhatsApp, TikTok and Instagram (May 2026)', 'https://nairametrics.com/2026/05/14/sec-warns-nigerians-against-rising-ponzi-schemes-on-whatsapp-tiktok-instagram/'],
  lottery: ['Aluko & Oyebode: the Supreme Court ruling on the National Lottery Act (22 November 2024)', 'https://www.aluko-oyebode.com/insights/nigeria-lottery-act-supreme-court-ruling-2024/'],
  pwc: ['PwC Nigeria: Supreme Court verdict on the National Lottery Act', 'https://www.pwc.com/ng/en/assets/pdf/supreme-court-verdict-on-the-national-lottery-act.pdf'],
  dubawa: ['Dubawa: four red flags Nigerians ignored until CBEX crashed', 'https://dubawa.org/four-red-flags-nigerians-ignored-until-cbex-crashed/'],
};

const cupFacts = [
  'Office Wahala Weekly Cups are <strong>free to enter</strong>: no deposit, no purchase, no sign-up.',
  'Your <strong>best single run</strong> counts. The highest scores when the cup ends win.',
  'Prizes are paid by <strong>bank transfer, airtime, data, gift card or voucher</strong>, as shown on each cup.',
  'Winners claim on <strong>WhatsApp</strong> with a private claim code that only their phone can see.',
  'The <strong>in-game naira is pretend money</strong> and can never be cashed out.',
];

export const PAGES = [
  /* =================================================================== */
  {
    path: MM, crumbs: [['Make money playing games']], short: 'Make money playing games',
    title: 'How to Make Money Playing Games in Nigeria (Honest 2026 Guide)',
    h1: 'How to make money playing games in Nigeria',
    desc: 'What really pays when you play games in Nigeria in 2026: free prize tournaments, esports, streaming and testing, plus the "earn per game" apps and Ponzi traps to avoid.',
    lede: 'Yes, you can win real money playing games in Nigeria, but not the way most adverts say. Here is what actually pays, what is a trap, and where Office Wahala fits.',
    answer: 'The honest ways to get paid for playing games in Nigeria are <strong>free-entry tournaments with real prizes</strong> (like the Office Wahala Weekly Cup), <strong>esports competitions</strong>, <strong>streaming or making videos</strong> about games, and <strong>paid game testing</strong>. Apps that pay you "per game", play-to-earn tokens and anything that asks for a deposit first are where most people lose money. Treat game prizes as a bonus for being good, not as a salary.',
    about: ['Make money playing games', 'Online games Nigeria', 'Game tournaments'],
    facts: [
      'Only the top players in any tournament win, so most players earn nothing. That is normal.',
      'A legitimate prize game never asks you to pay, deposit or "activate" your account first.',
      'Betting and lotteries are regulated in Nigeria; since a November 2024 Supreme Court ruling, mostly by each state.',
      'Office Wahala Weekly Cups are free, skill-based and publish every winner and payment status on a public page.',
      'In April 2025 the CBEX "double your money" platform collapsed with an estimated ₦1.3 trillion in losses.',
    ],
    sections: [
      { id: 'what-pays', h: 'Five ways games can really pay', html: `<p>Every real way of earning from games has one thing in common: someone is paying for something valuable. A sponsor pays for attention, a viewer pays for entertainment, a studio pays for feedback. If you cannot see who is paying and why, be careful.</p>
    <div class="table-wrap"><table><thead><tr><th scope="col">Way</th><th scope="col">Who pays you</th><th scope="col">What you need</th><th scope="col">Honest reality</th></tr></thead><tbody>
      <tr><td>Free tournaments with prizes</td><td>The game maker or a sponsor</td><td>Skill and practice</td><td>Only the top few win each week. Free to try, so there is nothing to lose.</td></tr>
      <tr><td>Esports competitions</td><td>Organisers and sponsors</td><td>Top-level skill, a good phone or console, steady internet</td><td>Big prizes exist, but you compete with the best players in the country.</td></tr>
      <tr><td>Streaming and game videos</td><td>Viewers, platforms and brands</td><td>Personality, consistency, data</td><td>Slow to start. Most creators earn nothing for months.</td></tr>
      <tr><td>Game testing</td><td>Studios and testing companies</td><td>Attention to detail, clear writing</td><td>Small, irregular jobs. Good for building a skill.</td></tr>
      <tr><td>Making games</td><td>Players, sponsors and clients</td><td>Coding or design skills</td><td>The most reliable long-term path, and the hardest.</td></tr>
    </tbody></table></div>` },
      { id: 'traps', h: 'What usually does not pay', html: `<p>These are the offers that fill WhatsApp statuses and TikTok comments. Some are outright scams; others simply pay so little that your data costs more than you earn.</p>
    <ul>
      <li><strong>"Earn ₦5,000 per game" apps.</strong> They show a growing balance, then ask you to reach an impossible minimum, watch endless ads or pay a "withdrawal fee".</li>
      <li><strong>Play-to-earn crypto games.</strong> Rewards are paid in tokens whose price depends on new players joining. When new money stops, the token price falls. Read <a href="/${MM}play-to-earn-crypto/">our guide to play-to-earn games</a>.</li>
      <li><strong>"Invest and play" platforms.</strong> If you must deposit before you can earn, it is not a game, it is an investment, and Nigeria's SEC keeps warning about unregistered ones.</li>
      <li><strong>Selling in-game money.</strong> Many games, including Office Wahala, forbid it, and buyers often pay with stolen cards.</li>
    </ul>` },
      { id: 'office-wahala', h: 'How Office Wahala\'s free Weekly Cup works', html: `<p>Office Wahala is a free Nigerian arcade game you play in your browser: dodge Oga, meetings and NEPA blackouts at work, or dodge Mummy\'s slipper at home in Home Wahala. Every week we run free <strong>Weekly Cups</strong> and <strong>weekly leaderboards</strong> with real prizes.</p>
    <ul>${cupFacts.map((f) => `<li>${f}</li>`).join('')}</ul>
    <p>Each cup is for one game: an Office Cup runs Monday to Friday, a Home Cup runs every day. Every finished cup is listed on the ${WIN} with each winner and whether they have been paid. The full ${CUP} explain checks, claims and age limits.</p>` },
      { id: 'legal', h: 'Is it legal to win money from games in Nigeria?', html: `<p>Winning a prize for skill in a free contest is not the same as gambling. Gambling usually means paying to enter (a stake) for a chance to win. Since the Supreme Court ruling of 22 November 2024, lotteries and gaming are regulated mainly by each state (and by the federal government in the FCT), so rules can differ from state to state. If a game asks you to pay a stake, check that the operator is licensed where you live. This page is general information, not legal advice. See <a href="/${MM}skill-games-vs-betting/">skill games vs betting</a> for more.</p>` },
    ],
    steps: { name: 'How to start winning game prizes in Nigeria safely', title: 'How to start, safely', items: [
      ['Pick a free-entry contest.', 'Choose tournaments that never ask for a deposit, like the Office Wahala Weekly Cup.'],
      ['Read the rules.', 'Check who runs it, when it ends, how winners are checked and how prizes are paid.'],
      ['Check past winners.', 'A real organiser shows past winners and whether they were paid. Office Wahala publishes them on the winners page.'],
      ['Practise.', 'Your best single run counts, so play a few normal shifts first to learn the patterns.'],
      ['Protect your details.', 'Never share your BVN, card PIN or OTP to "receive" a prize. Office Wahala winners only send a claim code and how they want to be paid.'],
    ] },
    faqs: [
      ['Can you really make money playing games in Nigeria?', 'Yes, but only in a few honest ways: winning free tournaments, esports, streaming, game testing or making games. Most people who play will not earn anything, and that is fine if the game is free and fun.'],
      ['Which game pays the most in Nigeria?', 'There is no single answer. Esports tournaments pay the most to the very best players. For ordinary players, free weekly tournaments with small prizes, such as airtime or bank transfers, are the most realistic.'],
      ['Do I need to pay anything to play the Office Wahala Weekly Cup?', 'No. Entry is free, there is no sign-up and nothing to buy. The game runs in your phone\'s browser.'],
      ['Can I cash out the naira I earn inside Office Wahala?', 'No. The in-game naira is pretend money for the shop and outfits. Real prizes come only from the Weekly Cups and weekly leaderboards.'],
      ['How do I know a game that pays is not a scam?', 'Real ones never ask for money first, explain exactly how winners are chosen, show past winners, and pay on time. See our list of <a href="/' + MM + 'scams-red-flags/">red flags</a>.'],
    ],
    sources: [SRC.cbex, SRC.sec, SRC.lottery],
    related: [MO, MM + 'free-games-that-pay-real-money/', MM + 'scams-red-flags/'],
    listTitle: 'Guides by question',
  },

  /* ------------------------------------------------------------------- */
  {
    path: MM + 'win-free-airtime/', parent: MM, crumbs: [['Make money playing games', '/' + MM], ['Win free airtime']],
    short: 'Win free airtime playing games', card: 'Free tournaments that pay airtime to MTN, Airtel, Glo and 9mobile numbers.',
    title: 'How to Win Free Airtime Playing Games in Nigeria (2026)',
    h1: 'How to win free airtime playing games in Nigeria',
    desc: 'Win free airtime on MTN, Airtel, Glo or 9mobile by playing free games in Nigeria. How airtime prizes work, how to claim, and the fake "free recharge" links to avoid.',
    lede: 'Airtime is the most common prize in Nigerian online contests because it can be sent to any network in seconds. Here is how to win it honestly.',
    answer: 'You can win free airtime by playing <strong>free-entry game tournaments</strong> that list airtime as a prize, such as the <strong>Office Wahala Weekly Cup</strong>. Play during the cup, post a high score, and if you finish in the prize places you claim on WhatsApp and the airtime is sent to the number you choose. Ignore "free recharge" links that ask you to share them or enter your details first.',
    about: ['Free airtime', 'Win airtime Nigeria'],
    facts: ['Airtime prizes work on MTN, Airtel, Glo and 9mobile.', 'Each Office Wahala cup lists its prizes for every place before you play.', 'You choose the number the airtime goes to when you claim.', 'Real contests never need your SIM PIN, OTP or BVN.'],
    sections: [
      { id: 'why-airtime', h: 'Why airtime is such a common prize', html: '<p>Airtime is small, fast and useful to everyone. An organiser can send it the same day without needing your bank details, which is why contests often use it for the places below 1st. Each Office Wahala cup shows its exact prizes on the cup card before you play.</p>' },
      { id: 'fake', h: 'The "free airtime" links to avoid', html: `<p>Messages such as "MTN is giving everyone ₦10,000 free recharge, share to 15 groups" are fake. Networks do not run giveaways through forwarded links. These pages collect phone numbers, push you to install apps, or ask for an OTP that lets someone take over your WhatsApp. If a link wants you to share it before you get anything, close it.</p>` },
      { id: 'office-wahala', h: 'Winning airtime in Office Wahala', html: `<p>Open the game and look for the <strong>Weekly Cup</strong> card on the menu. It shows the prizes for each place. Your best single run counts. Every normal shift you play also counts on that week's <strong>top players</strong> board, and the organiser can credit top players with airtime too. Winners see a claim code in the game.</p>` },
    ],
    steps: { name: 'How to win and claim airtime in the Office Wahala Weekly Cup', title: 'How to win and claim airtime', items: [
      ['Open Office Wahala.', 'Go to officewahala.netlify.app on any phone. There is nothing to download.'],
      ['Tap the Weekly Cup card.', 'Check the prizes and when the cup ends. Type the name you want on the board.'],
      ['Play your best run.', 'Only your best single score counts, so you can keep trying (unless the cup limits tries).'],
      ['Check the board when the cup ends.', 'If you are in the prize places, a claim code appears in the game.'],
      ['Claim on WhatsApp.', 'Tap Claim on WhatsApp and send the code with the phone number for the airtime.'],
    ] },
    faqs: [
      ['Which networks can receive airtime prizes?', 'MTN, Airtel, Glo and 9mobile. You choose the number when you claim.'],
      ['How fast is airtime sent after I win?', 'The organiser aims to pay within 3 working days of a valid claim, and airtime is usually the fastest prize to send.'],
      ['Can I win airtime without playing the cup?', 'Yes. Every normal Office Wahala or Home Wahala shift counts on the weekly top players board, and top players can be credited with airtime.'],
      ['Is "share this link for free airtime" real?', 'No. Networks do not give airtime through forwarded links. Never enter an OTP or PIN on such pages.'],
    ],
    related: [MM + 'win-free-data/', MM + 'scams-red-flags/', MM],
    cta: 'Play for free airtime this week.',
  },
  {
    path: MM + 'win-free-data/', parent: MM, crumbs: [['Make money playing games', '/' + MM], ['Win free data']],
    short: 'Win free data playing games', card: 'Data bundle prizes, how to claim them, and keeping your data use low.',
    title: 'How to Win Free Data Playing Games in Nigeria',
    h1: 'How to win free data playing games in Nigeria',
    desc: 'Win free data bundles by playing free games in Nigeria. Which contests pay data, how to claim, and how to play without burning your data.',
    lede: 'Data is what keeps you online, so a data prize goes a long way. You can win it from free contests, as long as the game itself does not eat your bundle first.',
    answer: 'Free data prizes come from <strong>free-entry contests</strong> run by game makers and sponsors. In <strong>Office Wahala</strong>, data is one of the prize types for Weekly Cups and weekly leaderboards. The game itself is light: once it has loaded it works offline, so practising costs almost no data. Winners claim on WhatsApp and the bundle is sent to their number.',
    about: ['Free data Nigeria', 'Win data bundle'],
    facts: ['Office Wahala works offline after the first visit.', 'Only sending your score to the cup needs a connection.', 'Data prizes are sent to the number you choose.', 'Data bundles cannot be swapped for cash by the organiser unless offered.'],
    sections: [
      { id: 'light', h: 'Pick games that do not waste your data', html: '<p>A game that streams video ads between rounds can use more data than any prize is worth. Office Wahala has no video or pop-up ads, caches itself on your phone and keeps working without internet, so you can practise on the bus and only go online to post your cup score.</p>' },
      { id: 'how', h: 'How data prizes work', html: `<p>When a cup lists a data prize (for example "₦2,000 data"), the winner tells the organiser which network and number to use. It is sent as a bundle of about that value. The ${CUP} say prizes cannot be swapped unless the organiser offers it.</p>` },
    ],
    steps: { name: 'How to win a data prize in Office Wahala', title: 'How to win a data prize', items: [
      ['Install the game.', 'Open Office Wahala and tap Install (Android) or Share → Add to Home Screen (iPhone). It then works offline.'],
      ['Practise offline.', 'Play normal shifts to learn the bosses, events and power-ups.'],
      ['Go online for the cup.', 'Open the Weekly Cup card and play your best run while connected so the score is sent.'],
      ['Claim if you win.', 'Send your claim code on WhatsApp with your network and number.'],
    ] },
    faqs: [
      ['How much data does Office Wahala use?', 'Very little. It loads once and is then cached on your phone. Sending a cup score is a tiny request.'],
      ['Can I get data instead of airtime?', 'Prizes are paid as shown on the cup. Ask when you claim; the organiser may offer a swap, but does not have to.'],
      ['Do data prizes expire?', 'Bundles follow your network\'s normal validity rules for that bundle size.'],
    ],
    related: [MM + 'win-free-airtime/', MM + 'on-your-phone/', MM],
  },
  {
    path: MM + 'bank-transfer-prizes/', parent: MM, crumbs: [['Make money playing games', '/' + MM], ['Games that pay to your bank']],
    short: 'Games that pay to your bank account', card: 'Free contests that pay winners by bank transfer, and what details are safe to share.',
    title: 'Games That Pay Directly to Your Bank Account in Nigeria (Free Entry)',
    h1: 'Games that pay directly to your bank account in Nigeria',
    desc: 'Which games pay winners by bank transfer in Nigeria, what details you should and should not share, and how Office Wahala pays Weekly Cup winners.',
    lede: 'A bank transfer is the prize everyone wants. It is also the prize scammers use as bait. Here is how to tell them apart.',
    answer: 'Some free contests pay winners <strong>straight to a Nigerian bank account</strong>. In the <strong>Office Wahala Weekly Cup</strong>, 1st place prizes are often bank transfers. To receive one you only share your <strong>account name, account number and bank</strong>. Never share your BVN, card details, PIN, password or OTP: nobody needs those to send you money.',
    about: ['Bank transfer prizes', 'Games that pay Nigeria'],
    facts: ['To receive a transfer you need only account name, number and bank.', 'Your BVN, PIN, card number and OTP are never needed to pay you.', 'Office Wahala winners share bank details only on WhatsApp, only after winning.', 'Paid prizes are marked "Paid" on the public winners page.'],
    sections: [
      { id: 'safe', h: 'What to share, and what never to share', html: `<div class="table-wrap"><table><thead><tr><th scope="col">Safe to share to receive money</th><th scope="col">Never share</th></tr></thead><tbody>
      <tr><td>Account name</td><td>BVN or NIN</td></tr><tr><td>Account number (10 digits)</td><td>Card number, expiry date, CVV</td></tr><tr><td>Bank name</td><td>PIN, password or OTP</td></tr></tbody></table></div>
    <p>If someone says you must pay a "transfer fee", "tax" or "activation fee" before your prize can be released, it is a scam. A real organiser simply sends the money.</p>` },
      { id: 'office-wahala', h: 'How Office Wahala pays bank transfer prizes', html: `<p>When a cup ends, winners see a private claim code in the game. They tap <strong>Claim on WhatsApp</strong>, send the code and their account details, and the organiser checks the score before paying. The organiser aims to pay within 3 working days of a valid claim and then marks the prize as Paid on the ${WIN}. Cash prizes go to players aged 18 or over; younger winners get airtime, a gift card or a voucher, or a parent can claim.</p>` },
    ],
    faqs: [
      ['Do I need a bank account to win?', 'No. If you do not want to share bank details, you can ask for a different prize type when the cup offers it, such as airtime or a voucher.'],
      ['Will I be charged a fee to receive my prize?', 'No. Office Wahala never charges winners anything. Any "fee" request is a scam.'],
      ['How do I know Office Wahala really pays?', 'Every finished cup, its winners and their payment status are listed on the public winners page.'],
      ['Is my bank number shown publicly?', 'No. The board shows only the name you typed and, if you chose one, your state. Payment details stay in your WhatsApp chat with the organiser.'],
    ],
    related: [MM + 'is-office-wahala-legit/', MM + 'scams-red-flags/', MM + 'gift-cards-and-vouchers/'],
  },
  {
    path: MM + 'gift-cards-and-vouchers/', parent: MM, crumbs: [['Make money playing games', '/' + MM], ['Win gift cards and vouchers']],
    short: 'Win gift cards and shopping vouchers', card: 'Supermarket vouchers, gift cards and promo codes from sponsored game contests.',
    title: 'Win Gift Cards and Supermarket Vouchers Playing Games in Nigeria',
    h1: 'Win gift cards and supermarket vouchers playing games',
    desc: 'How sponsored game contests in Nigeria give gift cards, supermarket vouchers and promo codes, how to redeem them, and gift card scams to avoid.',
    lede: 'When a brand sponsors a contest, the prize is often its own voucher. That is good news for players: sponsors fund more prizes.',
    answer: 'Gift cards and vouchers usually come from <strong>sponsored contests</strong>: a shop, restaurant or app pays for the prizes in return for its name on the contest. Office Wahala Weekly Cups can be sponsored, and sponsored cups may list <strong>supermarket vouchers, gift cards or promo codes</strong> as prizes. You redeem them with the brand, following the terms on the voucher.',
    about: ['Gift card prizes', 'Supermarket vouchers'],
    facts: ['Sponsor names show on the cup card, the share image and the winners page.', 'Vouchers have their own expiry dates and terms set by the brand.', 'A real gift card prize is sent to you; you never pay to "unlock" it.', 'Under-18 winners of cash cups receive vouchers or airtime instead.'],
    sections: [
      { id: 'sponsors', h: 'Why sponsors give vouchers', html: '<p>A voucher brings a winner into the sponsor\'s shop or app, which is worth more to the brand than the same amount in cash. That is why sponsored cups can offer more prizes, or more places, than unsponsored ones.</p>' },
      { id: 'scams', h: 'Gift card scams to watch for', html: '<ul><li>Someone "pays" you with a gift card code and asks for change in cash.</li><li>A message says you won a gift card but must buy another gift card to claim it.</li><li>A site asks for your card details to "verify" a free gift card.</li></ul><p>A real voucher prize only needs you to say where to send it.</p>' },
      { id: 'sponsor-a-cup', h: 'Run a cup for your brand', html: '<p>Businesses can sponsor an Office Wahala Weekly Cup and put their name in front of players across Nigeria. <a href="https://wa.me/2347066459689?text=I%20want%20to%20sponsor%20a%20Weekly%20Cup%20on%20Office%20Wahala" rel="noopener">Ask about sponsoring on WhatsApp</a>.</p>' },
    ],
    faqs: [
      ['Can I swap a voucher for cash?', 'Only if the organiser offers it. The cup rules say prizes are paid as shown on the cup.'],
      ['Which shops are the vouchers for?', 'It depends on the sponsor of each cup. The cup card in the game shows the prizes before you play.'],
      ['Do vouchers expire?', 'Yes, most do. Check the date and terms on the voucher and use it early.'],
    ],
    related: [MM + 'bank-transfer-prizes/', MM + 'online-tournaments/', MM],
  },
  {
    path: MM + 'free-games-that-pay-real-money/', parent: MM, crumbs: [['Make money playing games', '/' + MM], ['Free games that pay real money']],
    short: 'Free games that pay real money', card: 'What "free" really means, and a 30-second test for any game that promises money.',
    title: 'Free Games That Pay Real Money in Nigeria: What Actually Works (2026)',
    h1: 'Free games that pay real money in Nigeria',
    desc: 'Are there free games that pay real money in Nigeria? What "free" really means, a quick test for spotting fake paying games, and how Office Wahala\'s free Weekly Cup pays winners.',
    lede: 'Lots of games call themselves free and paying. Very few are both. Use this quick test before you spend your time and data.',
    answer: 'A game is genuinely <strong>free and paying</strong> only if you can enter without paying, the rules say exactly how winners are picked, and past winners are shown. The <strong>Office Wahala Weekly Cup</strong> meets all three: free entry, highest score wins, and a public winners page with payment status. Games that pay "everyone" for playing usually pay nobody in the end.',
    about: ['Free games that pay', 'Real money games Nigeria'],
    facts: ['"Free to download" is not the same as "free to win".', 'If every player is promised money, ask who is paying for it.', 'A small number of winners with real, public payouts is a good sign.', 'Office Wahala has no deposits, no in-game purchases and no withdrawals.'],
    sections: [
      { id: 'test', h: 'The 30-second test', html: `<ol><li><strong>Do I have to pay anything, ever?</strong> A deposit, an "activation", a VIP level, a withdrawal fee. If yes, it is not free.</li><li><strong>Who pays the prizes?</strong> A sponsor or the game maker is fine. New players\' deposits are not.</li><li><strong>How are winners chosen?</strong> There should be a clear rule, like "highest score when the cup ends".</li><li><strong>Can I see past winners?</strong> Look for names, dates and whether they were paid.</li><li><strong>Can I contact a real person?</strong> A real phone number or business beats an anonymous Telegram admin.</li></ol>` },
      { id: 'everyone', h: 'Why "everyone earns" is a warning sign', html: '<p>Money has to come from somewhere. When an app promises that every player earns, the money usually comes from adverts (which pay very little per player) or from new users\' deposits (which is how Ponzi schemes work). In a contest, a few people win and everyone else had fun for free. That is honest.</p>' },
      { id: 'office-wahala', h: 'Office Wahala, by the test', html: `<p>No payment ever. Prizes come from the developer, Analaize Limited in Lagos, or a named sponsor. The highest single score wins. Every finished cup is on the ${WIN}. And you can reach the developer on WhatsApp at 07066459689.</p>` },
    ],
    faqs: [
      ['What is the best free game that pays real money in Nigeria?', 'Look for free-entry tournaments with public winners. Office Wahala\'s Weekly Cup is one, and it is made in Lagos for Nigerian players.'],
      ['Do free games that pay real money need a sign-up?', 'Not always. Office Wahala has no accounts: your phone keeps a private ID, and only your phone can see your claim code.'],
      ['Why do some "paying" games have a minimum withdrawal?', 'A high minimum keeps most players from ever reaching it. If the minimum keeps moving or needs a fee, stop.'],
    ],
    related: [MM + 'no-deposit/', MM + 'scams-red-flags/', MM + 'is-office-wahala-legit/'],
  },
  {
    path: MM + 'on-your-phone/', parent: MM, crumbs: [['Make money playing games', '/' + MM], ['On your phone']],
    short: 'Make money playing games on your phone', card: 'Phone-friendly ways to win prizes, plus tips for battery, data and storage.',
    title: 'How to Make Money Playing Games on Your Phone in Nigeria',
    h1: 'How to make money playing games on your phone in Nigeria',
    desc: 'Phone-only ways to win money playing games in Nigeria: free browser tournaments, mobile esports and short game videos. Tips for low data, low storage and older Android phones.',
    lede: 'You do not need a gaming PC. Most Nigerian players game on a phone, and so do most winners.',
    answer: 'On a phone, the realistic options are <strong>free browser tournaments</strong> (like Office Wahala\'s Weekly Cup, which needs no download), <strong>mobile esports</strong> in popular competitive games, and <strong>short game videos</strong> on social media. Start with free contests because they cost nothing; esports and content take much longer to pay.',
    about: ['Mobile games Nigeria', 'Earn on phone'],
    facts: ['Office Wahala runs in the browser: no Play Store download, about the size of a few photos.', 'It works on older Android phones and iPhones.', 'Installing it to your home screen makes it open full screen and work offline.', 'Touch controls: drag to move; on a keyboard use the arrow keys.'],
    sections: [
      { id: 'options', h: 'Phone-friendly options compared', html: `<div class="table-wrap"><table><thead><tr><th scope="col">Option</th><th scope="col">Cost to start</th><th scope="col">Time to first naira</th></tr></thead><tbody>
      <tr><td>Free browser tournaments</td><td>Nothing</td><td>As soon as you win a week</td></tr>
      <tr><td>Mobile esports</td><td>A capable phone and steady data</td><td>Months of practice for most players</td></tr>
      <tr><td>Short game videos</td><td>Data for uploading</td><td>Often many months</td></tr>
      <tr><td>Game testing</td><td>Nothing</td><td>Irregular small jobs</td></tr></tbody></table></div>` },
      { id: 'tips', h: 'Tips for playing to win on a phone', html: '<ul><li>Turn on Do Not Disturb so a call does not end your best run.</li><li>Play with the phone on a table if your hands get tired; steady thumbs beat fast thumbs.</li><li>Close other apps on older phones so the game runs smoothly.</li><li>Charge before a serious attempt: low-power mode can slow games down.</li></ul>' },
    ],
    steps: { name: 'Set up Office Wahala on your phone', title: 'Set up Office Wahala on your phone', items: [
      ['Open the site.', 'Go to officewahala.netlify.app in Chrome (Android) or Safari (iPhone).'],
      ['Install it.', 'Tap Install app on Android, or Share → Add to Home Screen → Add on iPhone.'],
      ['Set your name and state.', 'Your name shows on the boards; your state counts for State Wars.'],
      ['Play the Weekly Cup.', 'Tap the cup card on the menu and post your best run before it ends.'],
    ] },
    faqs: [
      ['Do I need to download an app?', 'No. Office Wahala is a website that you can add to your home screen. It is not on the Play Store, so beware of fake "Office Wahala" apps.'],
      ['Will it work on my old Android phone?', 'It is designed to. If it is slow, close other apps and turn off battery saver while you play.'],
      ['Can I play on iPhone?', 'Yes, in Safari. Tap Share, then Add to Home Screen for the full-screen version.'],
    ],
    related: [MO + 'with-just-your-phone/', MM + 'win-free-data/', MM],
  },
  {
    path: MM + 'no-deposit/', parent: MM, crumbs: [['Make money playing games', '/' + MM], ['No deposit, no investment']],
    short: 'Games that pay without a deposit', card: 'Why "no deposit" matters, and the tricks used to get a deposit later.',
    title: 'Games That Pay Without Deposit or Investment in Nigeria',
    h1: 'Games that pay without a deposit or investment',
    desc: 'How to find games in Nigeria that pay prizes without any deposit, investment or activation fee, and the tricks platforms use to get your money later.',
    lede: 'The safest rule in online money: if you never send money, you cannot lose money. Here is how to keep it that way.',
    answer: 'Games that pay without a deposit are <strong>free-entry contests</strong> where a sponsor or the game maker funds the prizes, such as the <strong>Office Wahala Weekly Cup</strong>. Be careful with platforms that start free and then ask for a small deposit to "upgrade", "unlock withdrawal" or "join VIP": that is how most losses begin.',
    about: ['No deposit games', 'Free entry contests'],
    facts: ['Office Wahala has no deposits, no wallet top-ups and no withdrawals.', 'The in-game naira cannot be bought or cashed out.', 'Prizes are funded by the developer or a named sponsor.', 'Nigeria\'s SEC advises checking that any platform taking money is registered.'],
    sections: [
      { id: 'tricks', h: 'How "no deposit" platforms get a deposit later', html: '<ul><li><strong>The upgrade:</strong> "Free users earn ₦50 a task; VIP users earn ₦2,000. VIP is only ₦5,000."</li><li><strong>The unlock:</strong> your balance is ₦48,000 but you must pay ₦3,000 to withdraw.</li><li><strong>The team bonus:</strong> you earn more for every friend who deposits, which turns you into the recruiter.</li><li><strong>The tax:</strong> "CBN tax" or "clearance fee" before payout. Real taxes are not collected like this.</li></ul>' },
      { id: 'why', h: 'Why free contests can afford prizes', html: '<p>A free game earns from sponsors and brand partners, not from players. A cup with a few prizes a week costs the organiser a known, fixed amount. A platform that promises everyone returns has no fixed cost, which is why those platforms run out of money.</p>' },
    ],
    faqs: [
      ['Is there any game that pays without investment?', 'Yes: free-entry tournaments where prizes are funded by the organiser or sponsors. Only the winners get paid, and you never pay anything.'],
      ['What if a game asks for a small fee to withdraw?', 'Do not pay it. A real prize is sent without fees, and paying once usually leads to more fees.'],
      ['Can I lose money playing Office Wahala?', 'No. There is nothing to buy and nowhere to send money.'],
    ],
    sources: [SRC.sec, SRC.dubawa],
    related: [MM + 'free-games-that-pay-real-money/', MM + 'scams-red-flags/', MO + 'with-no-money-to-start/'],
  },
  {
    path: MM + 'play-to-earn-crypto/', parent: MM, crumbs: [['Make money playing games', '/' + MM], ['Play-to-earn crypto games']],
    short: 'Are play-to-earn crypto games legit?', card: 'How token rewards really work and why most players lose money.',
    title: 'Are Play-to-Earn Crypto Games Legit in Nigeria? (Honest Answer)',
    h1: 'Are play-to-earn crypto games legit in Nigeria?',
    desc: 'How play-to-earn (P2E) crypto games pay players, why most Nigerian players end up losing money, warning signs, and safer ways to win from games.',
    lede: 'Play-to-earn games promised to turn gaming into income. For most players, the maths never worked.',
    answer: 'Some play-to-earn games are real products, but they are <strong>high-risk for players</strong>. Rewards are usually paid in a token whose value depends on new players buying in. When new money slows, the token price falls and so do earnings. Many need an upfront purchase of characters or tokens, which makes them closer to a speculative investment than a game. If you want game prizes without that risk, choose <strong>free-entry tournaments</strong>.',
    about: ['Play to earn', 'Crypto games Nigeria'],
    facts: ['Most P2E games require buying an NFT, character or token to start.', 'Earnings are in tokens whose price can fall sharply.', 'Platforms promising guaranteed crypto returns match the SEC\'s Ponzi warning signs.', 'CBEX, a crypto platform popular in Nigeria, froze withdrawals in April 2025.'],
    sections: [
      { id: 'how', h: 'How play-to-earn actually pays', html: '<p>In most P2E games you buy a starter character or token, play to earn more tokens, then sell them for naira. The tokens only have value while someone wants to buy them. In the early months, new players buy in and prices rise; later, sellers outnumber buyers and prices fall. Late joiners often never earn back what they paid to start.</p>' },
      { id: 'signs', h: 'Warning signs in a P2E game', html: '<ul><li>You must buy something before you can earn anything.</li><li>Earnings are quoted per day or per month, as if guaranteed.</li><li>Referral bonuses are bigger than gameplay rewards.</li><li>Withdrawals have waiting periods, minimums or fees that keep changing.</li><li>The team is anonymous and the "game" is barely playable.</li></ul>' },
      { id: 'cbex', h: 'What CBEX taught Nigerian investors', html: '<p>In April 2025 the CBEX trading platform, which promised to double users\' money, stopped withdrawals. The EFCC estimated losses of about ₦1.3 trillion and opened an investigation with Interpol. CBEX was not a game, but the pattern (fast "returns", referral rewards, sudden freeze) is the same one to watch for in any earn-while-you-play platform.</p>' },
    ],
    faqs: [
      ['Is crypto gaming legal in Nigeria?', 'Playing games is legal. Platforms that take investments must follow Nigerian securities rules, and the SEC warns against unregistered ones. This is general information, not legal advice.'],
      ['Can I make money from P2E without investing?', 'Some offer free starter accounts, but earnings are usually tiny and paid in tokens that can fall in value.'],
      ['What is a safer alternative?', 'Free-entry tournaments with cash, airtime or voucher prizes, where you never buy anything.'],
    ],
    sources: [SRC.cbex, SRC.efcc, SRC.sec],
    related: [MM + 'scams-red-flags/', MM + 'no-deposit/', MM],
  },
  {
    path: MM + 'scams-red-flags/', parent: MM, crumbs: [['Make money playing games', '/' + MM], ['Scams and red flags']],
    short: 'Game and "earn money" app scams: 9 red flags', card: 'The signs that a paying game, task app or investment is a scam.',
    title: 'Gaming and "Earn Money" App Scams in Nigeria: 9 Red Flags (2026)',
    h1: 'Gaming and "earn money" app scams in Nigeria: 9 red flags',
    desc: 'Nine red flags that a paying game, task app or "play and earn" platform in Nigeria is a scam, with recent examples, how to report, and what to do if you have already paid.',
    lede: 'Most online money scams in Nigeria follow the same script. Learn the script and you will spot them early.',
    answer: 'The biggest red flags are: <strong>you must pay before you can earn</strong>, <strong>guaranteed daily returns</strong>, <strong>bigger rewards for recruiting than for playing</strong>, <strong>withdrawal fees or moving minimums</strong>, and <strong>requests for your BVN, PIN or OTP</strong>. A real prize game is free, explains how winners are picked and shows past winners.',
    about: ['Online scams Nigeria', 'Ponzi schemes'],
    facts: ['Nigeria\'s SEC warned in May 2026 about Ponzi schemes promoted on WhatsApp, TikTok, Instagram, Telegram and Facebook.', 'The SEC advises checking a platform\'s registration before sending money.', 'CBEX losses were estimated at ₦1.3 trillion in 2025.', 'No real prize ever needs your OTP or PIN.'],
    sections: [
      { id: 'flags', h: 'The 9 red flags', html: '<ol class="flags"><li><strong>Pay to start.</strong> Registration fee, activation fee, starter pack, VIP level.</li><li><strong>Guaranteed returns.</strong> "Earn 5% daily", "double in 30 days".</li><li><strong>Recruit to earn.</strong> Team bonuses bigger than gameplay rewards.</li><li><strong>Withdrawal games.</strong> Fees, "tax", a minimum that rises, or "withdrawal day" only once a month.</li><li><strong>Your secrets.</strong> Requests for BVN, card PIN, OTP, internet banking password or a WhatsApp code.</li><li><strong>Urgency.</strong> "Only 50 slots left", "price goes up tonight".</li><li><strong>Fake proof.</strong> Screenshots of alerts and testimonials from accounts that only post about the platform.</li><li><strong>No real company.</strong> No address, no registration, admins only on Telegram.</li><li><strong>Moving rules.</strong> Terms change after you join, usually just before you can withdraw.</li></ol>' },
      { id: 'already-paid', h: 'If you have already paid', html: '<ul><li>Stop sending money, including "fees" to recover your funds; recovery offers are often a second scam.</li><li>Screenshot everything: chats, payment receipts, the website and the names used.</li><li>Call your bank to report the transfer and ask about blocking or recall.</li><li>Report investment schemes to the SEC, and fraud to the EFCC or the police.</li></ul>' },
      { id: 'contrast', h: 'What an honest prize game looks like', html: `<p>Office Wahala never asks for money, never asks for your BVN or OTP, explains the rules on the ${CUP} page, and lists every finished cup, winner and payment status on the ${WIN}.</p>` },
    ],
    faqs: [
      ['How do I check if an investment platform is registered?', 'Nigeria\'s SEC advises checking the company on its official registers before sending money. If you cannot find it, do not invest.'],
      ['Are "task apps" that pay for likes and follows real?', 'Some pay tiny amounts at first to build trust, then ask for a deposit to unlock bigger tasks. Treat any deposit request as a stop sign.'],
      ['Someone says I won a prize I never entered for. Is it real?', 'No. You cannot win a contest you did not enter. Do not click the link or share any codes.'],
    ],
    sources: [SRC.sec, SRC.cbex, SRC.dubawa],
    related: [MM + 'play-to-earn-crypto/', MM + 'no-deposit/', MO],
  },
  {
    path: MM + 'online-tournaments/', parent: MM, crumbs: [['Make money playing games', '/' + MM], ['Online tournaments with prizes']],
    short: 'Online game tournaments with cash prizes', card: 'How weekly online tournaments work, scoring, tie-breaks and checks.',
    title: 'Online Game Tournaments in Nigeria With Cash Prizes (How They Work)',
    h1: 'Online game tournaments in Nigeria with cash prizes',
    desc: 'How online game tournaments with cash prizes work in Nigeria: formats, scoring, tie-breaks, anti-cheat checks and payouts, with Office Wahala\'s free Weekly Cup as an example.',
    lede: 'A good tournament is simple: clear rules, a fair contest and winners who get paid. Here is how to read any tournament before you play.',
    answer: 'Online tournaments in Nigeria range from big esports events to <strong>free weekly score contests</strong>. In a score contest like the <strong>Office Wahala Weekly Cup</strong>, everyone plays the same game during the cup dates, <strong>your best single run counts</strong>, ties go to whoever reached the score first, and the organiser checks the top scores for cheating before paying winners.',
    about: ['Online tournaments Nigeria', 'Weekly Cup'],
    facts: ['Office Wahala cups give every player the same game with shop upgrades switched off.', 'Some cups limit tries or run length; the cup card says so.', 'Suspicious scores are checked; cheaters are removed and the next player moves up.', 'The organiser can pause a cup if something goes wrong; the board stays visible.'],
    sections: [
      { id: 'formats', h: 'Common tournament formats', html: '<ul><li><strong>Best score:</strong> play as often as you like; your highest single run counts (Office Wahala Weekly Cups).</li><li><strong>Limited tries:</strong> the same, but with, say, 5 attempts.</li><li><strong>Brackets:</strong> head-to-head matches, common in esports.</li><li><strong>Leaderboard season:</strong> points add up over weeks.</li></ul>' },
      { id: 'fair', h: 'What makes a tournament fair', html: '<p>Everyone should play the same version of the game, with no paid advantages. In Office Wahala cups, the office layout is the same for everyone and shop upgrades are off, so it comes down to skill. Equal scores are split by time: the player who reached the score first ranks higher.</p>' },
      { id: 'checks', h: 'How winners are checked', html: `<p>Before paying, the organiser looks at the top scores for signs of tampering: scores that rise too fast for the time played, levels that do not match the time survived, and many names from one person. Those are removed and the next player moves up. The decision is explained in the ${CUP}.</p>` },
    ],
    faqs: [
      ['How long does a Weekly Cup last?', 'Most run Monday to Sunday (Lagos time), but each cup shows its own start and end time.'],
      ['What happens if a cup is paused?', 'The board stays visible but no new runs can start until it resumes. A run already started still counts.'],
      ['Can a cup end early?', 'Yes, if something goes wrong. The board at that moment becomes the final result and winners claim as usual.'],
      ['Is there a team or league option?', 'Yes. Office Wahala also has free private leagues for your office, school or friends, without prizes.'],
    ],
    related: [MM + 'every-day-including-weekends/', MM + 'skill-games-vs-betting/', MM],
  },
  {
    path: MM + 'every-day-including-weekends/', parent: MM, crumbs: [['Make money playing games', '/' + MM], ['Win prizes every day']],
    short: 'Win prizes every day, even weekends', card: 'Office Cups run Monday to Friday; Home Cups run every day.',
    title: 'Win Prizes Playing Games Every Day in Nigeria, Even at Weekends',
    h1: 'Win prizes playing games every day, even at weekends',
    desc: 'Office Wahala\'s Office Cup runs Monday to Friday, but Home Wahala and its Home Cup run every day. How to keep playing for prizes on Saturday and Sunday.',
    lede: 'Office Wahala closes at weekends, because nobody should be at work on Saturday. Home Wahala does not.',
    answer: 'In Office Wahala, the <strong>Office Cup runs Monday to Friday</strong> (Lagos time) and the office is closed on Saturday and Sunday. <strong>Home Wahala</strong>, a day at home dodging Mummy\'s slipper, is <strong>open every day</strong>, and its <strong>Home Cup</strong> and weekly Home leaderboard keep running through the weekend.',
    about: ['Home Wahala', 'Weekend games'],
    facts: ['Each cup is for one game: Office or Home.', 'Office shifts, career mode and office leagues pause at weekends.', 'Home shifts count on the Home weekly board every day.', 'Weekly boards reset every Monday at midnight, Lagos time.'],
    sections: [
      { id: 'home', h: 'What is Home Wahala?', html: '<p>Home Wahala is the second game in Office Wahala: a Nigerian childhood day at home. Dodge the slipper, the broom and "I will count to three", run errands, greet the visiting aunties and do not touch the meat in the pot. <a href="/home-wahala/">Read the Home Wahala guide</a>.</p>' },
      { id: 'plan', h: 'A simple weekly plan', html: '<div class="table-wrap"><table><thead><tr><th scope="col">Day</th><th scope="col">Play</th></tr></thead><tbody><tr><td>Monday to Friday</td><td>Office Cup and/or Home Cup; every normal shift counts on its weekly board</td></tr><tr><td>Saturday and Sunday</td><td>Home Cup and the Home weekly board</td></tr><tr><td>Sunday night</td><td>Last chance before the weekly boards reset at midnight</td></tr></tbody></table></div>' },
    ],
    faqs: [
      ['Why is Office Wahala closed at weekends?', 'Because it is a game about the Nigerian workday, and nobody should be at work on Saturday. The shop, your desk and leaderboards stay open.'],
      ['Which time zone do cups use?', 'Lagos time (West Africa Time, UTC+1).'],
      ['Can I play both cups in the same week?', 'Yes. They are separate cups with separate prizes and winners.'],
    ],
    steps: { name: 'Play the Home Cup at the weekend', title: 'Play the Home Cup at the weekend', items: [
      ['Open Office Wahala.', 'On Saturday or Sunday the menu switches you to Home Wahala automatically.'],
      ['Tap the Weekly Cup card.', 'At weekends it shows the Home Cup, with its prizes and end time.'],
      ['Learn Mummy\'s patterns.', 'Watch for the slipper wind-up and the count to three, and greet every aunty.'],
      ['Post your best run.', 'Only your best single score counts, so keep trying until the cup ends.'],
    ] },
    related: ['home-wahala/', MM + 'online-tournaments/', MM],
  },
  {
    path: MM + 'is-office-wahala-legit/', parent: MM, crumbs: [['Make money playing games', '/' + MM], ['Is Office Wahala legit?']],
    short: 'Is Office Wahala legit?', card: 'Who runs it, how prizes are funded and how you can check payouts yourself.',
    title: 'Is Office Wahala Legit? How the Weekly Cup Prizes Really Work',
    h1: 'Is Office Wahala legit?',
    desc: 'Is Office Wahala a real game that pays? Who runs it, how Weekly Cup prizes are funded, how winners are checked and paid, and how to verify it yourself.',
    lede: 'Good question to ask about any game that offers money. Here is everything you need to check us yourself.',
    answer: '<strong>Yes.</strong> Office Wahala is a free browser game made by <strong>Analaize Limited</strong>, a Lagos company led by Mmadubuko Micheal. Prizes come only from free <strong>Weekly Cups</strong> and weekly leaderboards, funded by the developer or named sponsors. It never asks for money, never sells in-game currency, and lists every finished cup, winner and payment status on a public winners page.',
    about: ['Office Wahala', 'Is it legit'],
    facts: ['Developer: Analaize Limited, Lagos. Contact: 07066459689 (WhatsApp).', 'No deposits, no purchases, no withdrawals, no sign-up.', 'The in-game naira is pretend money and cannot be cashed out.', 'Winners and payment status are public at /winners/.', 'Rules are published at /cup-rules/.'],
    sections: [
      { id: 'what-it-is', h: 'What Office Wahala is', html: '<p>A free arcade game about surviving a Nigerian workday: the Lagos commute, Oga, HR queries, the 5pm meeting and NEPA blackouts. At home, Home Wahala has Mummy\'s slipper and the visiting aunties. It plays in any phone browser in English or Pidgin. <a href="/about/">More about the game and the developer</a>.</p>' },
      { id: 'funding', h: 'How prizes are funded', html: '<p>The developer funds cup prizes as promotion for the game, and brands can sponsor cups to reach players. Sponsors are named on the cup card, the share image and the winners page. Players never fund prizes.</p>' },
      { id: 'verify', h: 'How to check us yourself', html: `<ul><li>Look at the ${WIN}: every finished cup, its winners and whether each prize was paid.</li><li>Read the ${CUP}: who can win, how scores are checked, claim and payment times.</li><li>Message the developer on WhatsApp: 07066459689.</li><li>Notice what we never ask for: money, BVN, PIN, OTP or passwords.</li></ul>` },
    ],
    faqs: [
      ['Does Office Wahala ask for money?', 'Never. There are no deposits, purchases or fees of any kind.'],
      ['Can I sell my in-game naira?', 'No. It is pretend money for the shop and outfits, and it cannot be bought or cashed out.'],
      ['What if I win and am not paid?', 'Message the developer on WhatsApp with your claim code. The organiser aims to pay within 3 working days of a valid claim and marks each prize Paid publicly.'],
      ['Is there an Office Wahala app on the Play Store?', 'No. The official game is at officewahala.netlify.app. Treat any app using the name as unofficial.'],
    ],
    related: [MM + 'bank-transfer-prizes/', MM + 'free-games-that-pay-real-money/', 'about/'],
  },
  {
    path: MM + 'skill-games-vs-betting/', parent: MM, crumbs: [['Make money playing games', '/' + MM], ['Skill games vs betting']],
    short: 'Skill games vs betting: the difference', card: 'Stake, chance and skill, how Nigerian regulation is changing, and age rules.',
    title: 'Skill Games vs Betting in Nigeria: What\'s the Difference?',
    h1: 'Skill games vs betting in Nigeria: what\'s the difference?',
    desc: 'The difference between free skill contests and betting in Nigeria: stakes, chance and skill, who regulates gaming after the 2024 Supreme Court ruling, and age rules for prizes.',
    lede: 'Both can pay money. They are not the same thing, and the difference matters for your pocket and the law.',
    answer: 'The key differences are <strong>stake</strong> and <strong>chance</strong>. Betting and lotteries mean <strong>paying to enter</strong> for an outcome you mostly cannot control. A <strong>free skill contest</strong> costs nothing to enter and the best performance wins. Paid betting is regulated in Nigeria, mainly by the states since the Supreme Court ruling of 22 November 2024. Office Wahala\'s Weekly Cups are free and decided by score.',
    about: ['Skill games', 'Betting Nigeria', 'Gaming regulation'],
    facts: ['On 22 November 2024 the Supreme Court nullified the National Lottery Act 2005 for the states.', 'States now regulate lotteries in their territory; the federal government still covers the FCT.', 'In Lagos, gaming is overseen by the Lagos State Lotteries and Gaming Authority.', 'Office Wahala cash prizes go to players aged 18 or over.'],
    sections: [
      { id: 'compare', h: 'Side by side', html: '<div class="table-wrap"><table><thead><tr><th scope="col"></th><th scope="col">Free skill contest</th><th scope="col">Betting or lottery</th></tr></thead><tbody><tr><td>Cost to enter</td><td>Nothing</td><td>A stake every time</td></tr><tr><td>Who decides the winner</td><td>Your performance</td><td>Mostly chance</td></tr><tr><td>Can you lose money?</td><td>No</td><td>Yes, often more than you win</td></tr><tr><td>Who funds prizes</td><td>Organiser or sponsor</td><td>Players\' stakes</td></tr></tbody></table></div>' },
      { id: 'law', h: 'Who regulates gaming in Nigeria now', html: '<p>Until 2024 the National Lottery Regulatory Commission licensed lotteries across the country. On 22 November 2024 the Supreme Court held that the National Assembly could not legislate on lotteries for the states, only for the FCT. State laws, such as Lagos\'s, now govern lotteries and gaming in each state, and lawyers note that online gaming across state lines is still being worked out. If a platform takes stakes, it should be licensed where you live. This is general information, not legal advice.</p>' },
      { id: 'age', h: 'Age rules', html: `<p>Betting is for adults only. In Office Wahala, anyone can play, but cash prizes go only to players aged 18 or over; younger winners get airtime, a gift card or a voucher of the same value, or a parent or guardian can claim for them. See the ${CUP}.</p>` },
    ],
    faqs: [
      ['Is a free game with prizes gambling?', 'Generally, gambling involves paying a stake for a chance to win. A free contest decided by skill is different. Rules vary by state, so this is not legal advice.'],
      ['Can students under 18 win Office Wahala prizes?', 'Yes, but not cash: they receive airtime, a gift card or a voucher, or a parent can claim for them.'],
      ['Where can I get help with gambling problems?', 'If betting is hurting your finances or mood, talk to someone you trust, set blocks on betting sites with your bank, and seek professional support.'],
    ],
    sources: [SRC.lottery, SRC.pwc],
    related: [MM + 'online-tournaments/', MM + 'play-to-earn-crypto/', MM],
  },

  /* =================================================================== */
  {
    path: MO, crumbs: [['Make money online in Nigeria']], short: 'How to make money online in Nigeria',
    title: 'How to Make Money Online in Nigeria in 2026 (Honest, No-Hype Guide)',
    h1: 'How to make money online in Nigeria',
    desc: 'Honest ways to make money online in Nigeria in 2026: freelancing, remote jobs, selling online, tutoring, content and digital products. How to get paid, what to avoid, and where to start with no money.',
    lede: 'There is real money online for Nigerians, and a lot of noise. This guide sticks to methods that work, how long they take, and the traps in between.',
    answer: 'The most reliable ways to make money online in Nigeria are to <strong>sell a skill</strong> (writing, design, coding, video editing, virtual assistance, tutoring), <strong>sell products or services</strong> through WhatsApp, Instagram and online stores, and <strong>land a remote job</strong>. Content creation and affiliate marketing can pay but take longer. Anything that pays you for doing almost nothing, or asks for a deposit first, is the fastest way to <strong>lose</strong> money online.',
    about: ['Make money online Nigeria', 'Side hustle Nigeria', 'Freelancing Nigeria'],
    facts: ['Skills pay; schemes don\'t. Almost every reliable method is selling a skill or a product.', 'Expect weeks to months before the first steady income.', 'Online income is taxable in Nigeria like any other income.', 'Nigeria\'s SEC warned again in May 2026 about Ponzi schemes promoted on social media.', 'Free game prizes, like Office Wahala\'s Weekly Cup, are a fun extra, not an income.'],
    sections: [
      { id: 'methods', h: 'Methods that work, compared', html: `<div class="table-wrap"><table><thead><tr><th scope="col">Method</th><th scope="col">Start-up cost</th><th scope="col">Time to first income</th><th scope="col">Good for</th></tr></thead><tbody>
      <tr><td>Freelancing (writing, design, code, editing)</td><td>Low: a phone or laptop and data</td><td>Weeks to a few months</td><td>Anyone with or willing to learn a skill</td></tr>
      <tr><td>Remote jobs</td><td>Low</td><td>Depends on hiring</td><td>People with experience in a field</td></tr>
      <tr><td>Selling on WhatsApp, Instagram or an online store</td><td>Stock or a service to sell</td><td>Days to weeks</td><td>Traders, makers, food and fashion businesses</td></tr>
      <tr><td>Online tutoring and lessons</td><td>Low</td><td>Days to weeks</td><td>Teachers, students with strong subjects</td></tr>
      <tr><td>Virtual assistance and customer support</td><td>Low</td><td>Weeks</td><td>Organised people with good written English</td></tr>
      <tr><td>Content creation (YouTube, TikTok, blogs)</td><td>Data and time</td><td>Often many months</td><td>Consistent creators with a clear niche</td></tr>
      <tr><td>Affiliate marketing</td><td>Low</td><td>Months</td><td>People who already have an audience</td></tr>
      <tr><td>Digital products (templates, e-books, courses)</td><td>Time to make them</td><td>Months</td><td>Experts in a topic</td></tr></tbody></table></div>` },
      { id: 'skills', h: 'Skills that sell well online', html: '<ul><li><strong>Writing:</strong> website copy, product descriptions, social media posts, CVs.</li><li><strong>Design:</strong> flyers, logos, social media graphics, presentation decks.</li><li><strong>Tech:</strong> websites, WordPress, spreadsheets, data cleaning, basic automation.</li><li><strong>Video:</strong> short-form editing for brands and creators.</li><li><strong>Admin:</strong> inbox and calendar management, research, data entry.</li><li><strong>Teaching:</strong> WAEC/JAMB subjects, languages, coding for kids.</li></ul><p>Pick one, learn it well from free resources, make three sample pieces, and show them to real clients.</p>' },
      { id: 'payment', h: 'Getting paid from abroad', html: '<p>Clients outside Nigeria usually pay through a freelance platform, a domiciliary (dollar) account, or an international payment service. Before you choose one, check its fees, how fast it converts to naira, and that it works with Nigerian banks. Never use someone else\'s account to receive money: it can get your bank account frozen.</p>' },
      { id: 'avoid', h: 'What to avoid', html: `<ul><li>"Invest ₦20,000, earn ₦5,000 daily" schemes, including ones dressed as trading bots or AI.</li><li>Task apps that pay for likes and follows, then ask for a deposit.</li><li>Courses that promise guaranteed income and sell mainly to their own students.</li><li>Anyone who needs your BVN, PIN or OTP.</li></ul><p>See <a href="/${MM}scams-red-flags/">the 9 red flags</a>.</p>` },
      { id: 'tax', h: 'Tax on online income', html: '<p>Money you earn online is income like any other, and Nigeria\'s tax rules were updated from January 2026. Keep simple records of what you earn and ask a tax adviser or your state internal revenue service what applies to you.</p>' },
      { id: 'games', h: 'Where games fit in', html: `<p>Playing games is not a job, but free contests are a harmless way to win something extra while you build real income. <a href="/${MM}">How to make money playing games</a> covers what really pays.</p>` },
    ],
    steps: { name: 'How to start making money online in Nigeria with little or no money', title: 'Your first 30 days', time: 'P30D', items: [
      ['Week 1: pick one skill.', 'Choose a skill people already pay for and that you enjoy. Use free videos and guides to learn the basics.'],
      ['Week 2: make samples.', 'Create three examples of your work. Do one free job for a small business you know in exchange for a review.'],
      ['Week 3: put it where buyers are.', 'Set up a simple profile on a freelance platform, LinkedIn and your WhatsApp status with your samples and prices.'],
      ['Week 4: pitch every day.', 'Send five short, personal messages a day to businesses that need your skill. Follow up once.'],
      ['Keep going: reinvest.', 'Use your first earnings for data, tools or a course that raises your rates.'],
    ] },
    faqs: [
      ['What is the fastest way to make money online in Nigeria?', 'Selling a service you can already do (like design, writing, typing or tutoring) to people you know, through WhatsApp and Instagram. It is not instant, but it is real.'],
      ['Can I make money online in Nigeria without paying anything?', 'Yes. Freelancing, tutoring and many remote jobs need only a phone or laptop, data and a skill. Be wary of anything that asks you to pay to start earning.'],
      ['Is it legit to make money online in Nigeria?', 'Yes, millions do through freelancing, remote work and online selling. The illegitimate part is the schemes promising easy returns.'],
      ['How much can I make online in Nigeria?', 'It varies widely by skill, effort and clients. Be suspicious of anyone quoting fixed daily earnings.'],
      ['Can I make money playing games online in Nigeria?', 'You can win prizes in free contests such as the Office Wahala Weekly Cup, but treat that as a bonus, not an income.'],
    ],
    sources: [SRC.sec, SRC.cbex],
    related: [MM, MM + 'scams-red-flags/', MM + 'free-games-that-pay-real-money/'],
    listTitle: 'Guides for your situation',
    cta: 'Take a break and play for prizes.',
  },
  {
    path: MO + 'students/', parent: MO, crumbs: [['Make money online in Nigeria', '/' + MO], ['For students']],
    short: 'Make money online as a student', card: 'Tutoring, campus services and skills you can learn between lectures.',
    title: 'How to Make Money Online as a Student in Nigeria (2026)',
    h1: 'How to make money online as a student in Nigeria',
    desc: 'Realistic ways for Nigerian university and polytechnic students to make money online: tutoring, campus services, freelancing and content, without hurting your grades. Age rules included.',
    lede: 'You have more time than money and more skill than you think. Here is how to turn that into income without failing your courses.',
    answer: 'The best options for Nigerian students are <strong>tutoring</strong> (WAEC, JAMB and course subjects), <strong>campus services sold online</strong> (typing, project formatting, design, printing runs), <strong>freelancing</strong> in a skill you are learning, and <strong>part-time remote work</strong>. Start small, keep it to a few hours a week during exams, and never pay to "join" an earning scheme.',
    about: ['Students Nigeria', 'Student side hustle'],
    facts: ['Your classmates and juniors are your first customers.', 'A WhatsApp status can be your first shop.', 'Under-18s need a parent or guardian for most payment accounts.', 'Office Wahala cash prizes are for 18+; younger winners get vouchers or airtime.'],
    sections: [
      { id: 'ideas', h: 'Ideas that fit a student timetable', html: '<ul><li><strong>Tutoring:</strong> JAMB and WAEC prep for secondary school students, online or in small groups.</li><li><strong>Typing and formatting:</strong> projects, CVs and seminar slides for other students.</li><li><strong>Design:</strong> event flyers for departments, fellowships and campus businesses.</li><li><strong>Content:</strong> short videos explaining hard topics in your course.</li><li><strong>Reselling:</strong> buy in bulk, sell to hostel mates through WhatsApp.</li></ul>' },
      { id: 'balance', h: 'Protect your grades', html: '<p>Set a weekly limit, say ten hours, and pause client work two weeks before exams. A first-class or a strong second-class upper will pay you more over a lifetime than any side hustle.</p>' },
      { id: 'pricing', h: 'How to price as a student', html: '<p>Students often charge too little and then resent the work. Ask three people already doing the same service what they charge, start a little below them, and raise your price after every five happy customers. Take part payment upfront for big jobs like project formatting, and always agree the deadline in writing on WhatsApp so there is no argument later.</p>' },
      { id: 'scams-students', h: 'Scams aimed at students', html: '<p>Watch for "earn while you study" apps that ask for a registration fee, fake scholarship and grant offers that need a "processing fee", and loan apps that harass your contacts. A real opportunity does not charge you to apply.</p>' },
    ],
    faqs: [
      ['Can a student make money online without a laptop?', 'Yes. Tutoring, selling, design apps and short-video editing can all be done on a phone.'],
      ['Are "student ambassador" earning schemes legit?', 'Some are real marketing jobs. If you must pay to become an ambassador, it is not a job.'],
      ['Can students win Office Wahala prizes?', 'Yes. Players aged 18 or over can win cash; younger winners receive airtime, a gift card or a voucher.'],
    ],
    steps: { name: 'Start a student online business in two weeks', title: 'Start in two weeks', items: [
      ['List what you are good at.', 'Your strongest subjects, software you know, things classmates ask you for help with.'],
      ['Choose one service.', 'Pick the one people already ask you for. That is your proof of demand.'],
      ['Set a price and a WhatsApp catalogue.', 'Add the service, price and three examples to a WhatsApp Business catalogue.'],
      ['Tell 20 people.', 'Post on your status, class groups and department pages. Ask satisfied customers for a screenshot review.'],
    ] },
    related: [MO + 'with-just-your-phone/', MO + 'with-no-money-to-start/', MM + 'skill-games-vs-betting/'],
  },
  {
    path: MO + 'nysc-corps-members/', parent: MO, crumbs: [['Make money online in Nigeria', '/' + MO], ['For corps members']],
    short: 'Make money online as an NYSC corps member', card: 'Build income and experience during service year, from any PPA.',
    title: 'How to Make Money Online During NYSC: A Corps Member\'s Guide',
    h1: 'How to make money online during NYSC',
    desc: 'Practical ways for NYSC corps members to earn online during the service year: freelancing, tutoring, remote internships and skills (SAED) you can sell, plus scams that target corpers.',
    lede: 'The service year gives you a monthly allowance, free afternoons and a new city. It is a good year to start an online income.',
    answer: 'Corps members do best with <strong>freelancing</strong> in a skill from their course or SAED training, <strong>online tutoring</strong>, <strong>remote internships</strong> that turn into jobs, and <strong>selling services</strong> in their new community. Use the year to build a portfolio and references; avoid "corper investment" schemes that promise to multiply your allowance.',
    about: ['NYSC', 'Corps members'],
    facts: ['NYSC\'s SAED programme teaches skills you can sell online.', 'Remote internships often lead to post-service jobs.', 'Corps members are frequent targets of "allowance doubling" schemes.', 'Keep your PPA duties first; online work fits around them.'],
    sections: [
      { id: 'ideas', h: 'What works for corpers', html: '<ul><li><strong>Freelance your degree:</strong> accountants do bookkeeping, engineers do drawings, English graduates write and edit.</li><li><strong>Teach online:</strong> many corpers already teach at their PPA; offer evening lessons to more students online.</li><li><strong>Remote internship:</strong> a few months of remote work gives you a reference and often an offer.</li><li><strong>Local services online:</strong> design, photography or catering for your new community, promoted on WhatsApp.</li></ul>' },
      { id: 'allowance', h: 'Protect your allowance', html: `<p>Groups promising to double your allowance by "trading" or "investing" are a common trap. The SEC has warned about unregistered schemes on WhatsApp and Telegram. See <a href="/${MM}scams-red-flags/">the 9 red flags</a>.</p>` },
      { id: 'portfolio', h: 'Leave service year with a portfolio', html: '<p>Whatever you earn, the bigger prize is proof. Keep a simple folder of everything you do: before-and-after designs, reports you wrote, students you taught and their results, and short reviews from clients and your PPA supervisor. When service ends, that folder is what gets you the next job or client, especially for remote roles where employers cannot meet you in person.</p>' },
    ],
    faqs: [
      ['Can corps members legally do freelance work?', 'Yes, as long as it does not interfere with your PPA and NYSC duties.'],
      ['What skill should a corper learn for online work?', 'One linked to your degree or SAED training, so you start with an advantage.'],
      ['Is it worth playing games for prizes during service year?', 'As a break, sure: free contests like the Office Wahala Weekly Cup cost nothing. Do not treat them as income.'],
    ],
    sources: [SRC.sec],
    steps: { name: 'Make your service year pay', title: 'A plan for the service year', items: [
      ['Month 1: settle in.', 'Learn your PPA routine and find out which afternoons and weekends are free.'],
      ['Month 2: pick your skill.', 'Choose one from your degree or SAED and make three samples.'],
      ['Months 3 to 6: first clients.', 'Offer your service locally and online. Aim for steady reviews, not big money.'],
      ['Months 7 to 11: grow and apply.', 'Raise prices, apply for remote internships and jobs with your portfolio.'],
    ] },
    related: [MO + 'side-hustle-for-office-workers/', MO + 'with-no-money-to-start/', MO],
  },
  {
    path: MO + 'stay-at-home-parents/', parent: MO, crumbs: [['Make money online in Nigeria', '/' + MO], ['For stay-at-home parents']],
    short: 'Make money online as a stay-at-home parent', card: 'Flexible work that fits school runs, naps and family time.',
    title: 'How to Make Money Online From Home in Nigeria as a Stay-at-Home Parent',
    h1: 'How to make money online from home as a stay-at-home parent',
    desc: 'Flexible ways for Nigerian stay-at-home mums and dads to earn online: home food and baking businesses, virtual assistance, tutoring, reselling and content, with tips for working around children.',
    lede: 'Your hours are broken into small pieces, so your work needs to be too. These options fit around school runs and naps.',
    answer: 'Good options for stay-at-home parents are <strong>a home business sold online</strong> (food, baking, small chops, fashion, hair), <strong>virtual assistance</strong> in fixed hours, <strong>online tutoring</strong> after school runs, and <strong>reselling</strong> through WhatsApp. Pick work you can pause and restart, and be wary of "work from home" offers that ask for a starter fee.',
    about: ['Work from home Nigeria', 'Stay-at-home parents'],
    facts: ['Asynchronous work (no live meetings) fits around children best.', 'WhatsApp Business catalogues let you sell without a website.', 'Many "work from home" scams ask for a registration fee.', 'Set two protected work blocks a day rather than working all day.'],
    sections: [
      { id: 'ideas', h: 'Ideas that fit family life', html: '<ul><li><strong>Food business:</strong> take orders on WhatsApp for weekend deliveries.</li><li><strong>Virtual assistant:</strong> manage inboxes, bookings and social media for small businesses.</li><li><strong>Tutoring:</strong> evening lessons for primary and secondary pupils.</li><li><strong>Reselling:</strong> children\'s clothes, school supplies, household items.</li><li><strong>Content:</strong> parenting, recipes or home tips, if you enjoy being on camera.</li></ul>' },
      { id: 'routine', h: 'A routine that works', html: '<p>Choose two blocks a day, for example during the school run window and after bedtime. Batch tasks: reply to all orders at once, cook in bulk, schedule posts in one sitting.</p>' },
      { id: 'trust', h: 'Build trust when customers cannot see you', html: '<p>Online buyers worry about paying someone they have never met. Post real photos of your work, share delivery videos, ask happy customers for short voice notes or screenshots you can repost, and keep a clear refund rule. For services, offer a small first job at a fair price so new clients can test you without much risk.</p>' },
    ],
    faqs: [
      ['What can I sell from home in Nigeria?', 'Food, baked goods, clothing, hair and beauty services, crafts, and digital services like design or typing.'],
      ['Do I need a website?', 'No. A WhatsApp Business catalogue and an Instagram page are enough to start.'],
      ['Are "data entry from home" jobs real?', 'Some are. Avoid any that charge you to start or for "training materials".'],
    ],
    steps: { name: 'Launch a home-based online business', title: 'Launch from home', items: [
      ['Pick what you already do well.', 'Cooking, baking, sewing, hair, teaching or organising: start with what friends already praise.'],
      ['Test with ten customers.', 'Sell to people you know first and ask for honest feedback.'],
      ['Set order days.', 'Take orders until a cut-off day so you can plan around the children.'],
      ['Open a WhatsApp Business catalogue.', 'Add prices, photos and your delivery areas.'],
    ] },
    related: [MO + 'with-just-your-phone/', MO + 'with-no-money-to-start/', MO],
  },
  {
    path: MO + 'side-hustle-for-office-workers/', parent: MO, crumbs: [['Make money online in Nigeria', '/' + MO], ['Side hustles for office workers']],
    short: 'Online side hustles for office workers', card: 'Earn after 5pm without wahala with your employer.',
    title: 'Online Side Hustles for Nigerian Office Workers (After 5pm)',
    h1: 'Online side hustles for Nigerian office workers',
    desc: 'Online side hustles that fit a 9-to-5 in Nigeria: freelancing your work skills, consulting, digital products and weekend businesses, plus how to avoid conflict with your employer.',
    lede: 'Salary week comes once a month. These side hustles can add something in between, after the 5pm meeting finally ends.',
    answer: 'The best side hustles for office workers <strong>reuse the skills you use at work</strong>: Excel and reporting, writing, design, HR documents, accounting or IT support, sold as <strong>freelance or consulting work</strong> in the evenings and weekends. Check your employment contract for conflict-of-interest rules, never use company time or data, and start with one or two clients.',
    about: ['Side hustle Nigeria', 'Office workers'],
    facts: ['Read your contract: some employers restrict outside work.', 'Never use company laptops, data or clients for your side hustle.', 'Evenings and weekends suit async freelance work.', 'Many office skills (spreadsheets, writing, HR, accounting) sell well to small businesses.'],
    sections: [
      { id: 'ideas', h: 'Office skills that sell', html: '<ul><li><strong>Spreadsheets and reports:</strong> build templates and dashboards for SMEs.</li><li><strong>HR documents:</strong> handbooks, contracts and job descriptions for small companies.</li><li><strong>Bookkeeping:</strong> monthly records for shops and startups.</li><li><strong>Writing and editing:</strong> proposals, CVs and company profiles.</li><li><strong>IT support:</strong> set up email, devices and websites for small offices.</li></ul>' },
      { id: 'safe', h: 'Keep it clean with your employer', html: '<p>Do your side work outside office hours, on your own devices, for clients who are not your employer\'s customers or competitors. If in doubt, ask HR before HR sends you a query.</p>' },
      { id: 'packaging', h: 'Package your skill as a product', html: '<p>Small businesses buy outcomes, not hours. Instead of "I can do Excel", offer "a monthly sales report template set up in one week" or "a staff handbook for companies under 20 people". A clear package with a fixed price is easier to sell, easier to deliver in the evenings, and easier for happy clients to recommend.</p>' },
    ],
    faqs: [
      ['Is it legal to have a side hustle in Nigeria?', 'Generally yes, but your employment contract may restrict outside work or competing business. Check it, and ask if unsure.'],
      ['How many hours a week should a side hustle take?', 'Start with five to ten hours. Grow only if your main job and rest do not suffer.'],
      ['What can I do during lunch break?', 'Reply to clients, plan your week, or play a quick Office Wahala shift: every normal shift counts on the weekly top players board.'],
    ],
    steps: { name: 'Start a side hustle around a 9-to-5', title: 'Start around your 9-to-5', items: [
      ['Check your contract.', 'Look for clauses on outside work, competition and confidentiality.'],
      ['Choose one package.', 'Turn a work skill into a fixed-price service for small businesses.'],
      ['Find the first client in your network.', 'Friends who run businesses are the quickest first customers.'],
      ['Protect your rest.', 'Cap the hours, and keep at least one day a week fully off.'],
    ] },
    related: [MO + 'nysc-corps-members/', MO, MM],
    cta: 'Survive the workday in Office Wahala.',
  },
  {
    path: MO + 'with-no-money-to-start/', parent: MO, crumbs: [['Make money online in Nigeria', '/' + MO], ['With no money to start']],
    short: 'Make money online with no money to start', card: 'Zero-capital ways to start, using skills, time and your network.',
    title: 'How to Make Money Online in Nigeria With No Money to Start',
    h1: 'How to make money online in Nigeria with no money to start',
    desc: 'Zero-capital ways to start making money online in Nigeria: services, freelancing, tutoring and reselling without stock, plus why "pay to start" offers are a trap when you are broke.',
    lede: 'When you have no capital, your capital is your time, your skills and the people you know. That is enough to start.',
    answer: 'With no money, start by <strong>selling a service</strong>, not a product: tutoring, typing, design on a phone, social media help for small businesses, errands or cleaning booked online. <strong>Pre-orders</strong> let you sell products without stock. Most importantly, avoid any offer that asks for a "small" fee to start earning: when money is tight, those losses hurt most.',
    about: ['No capital business', 'Start with nothing'],
    facts: ['Services need skill and time, not capital.', 'Pre-orders (customers pay before you buy) remove stock risk.', 'Free learning resources are enough for most beginner skills.', 'Free contests, like the Office Wahala Weekly Cup, never cost you anything.'],
    sections: [
      { id: 'ideas', h: 'Zero-capital ideas', html: '<ul><li><strong>Services:</strong> tutoring, typing, CV writing, phone-based design, social media management.</li><li><strong>Pre-order selling:</strong> collect orders and payment, then buy and deliver.</li><li><strong>Affiliate links:</strong> recommend products you genuinely use to people who trust you.</li><li><strong>Referral programmes:</strong> legitimate apps sometimes pay for genuine sign-ups, without you paying anything.</li></ul>' },
      { id: 'trap', h: 'The "small fee" trap', html: `<p>"Just ₦2,000 to activate your account" sounds small. It rarely stays small. Platforms that charge to start usually earn from new members, not from real work. See <a href="/${MM}no-deposit/">games and platforms that pay without a deposit</a>.</p>` },
      { id: 'reinvest', h: 'Turn the first ₦10,000 into tools', html: '<p>Your first earnings are your seed money. Before spending them, ask what would let you earn more next month: more data for client calls, a ring light for product photos, a paid template pack, or a short course in a skill clients ask for. Spending the first few payments on tools is how a zero-capital hustle becomes a small business.</p>' },
    ],
    faqs: [
      ['Can I really start an online business with ₦0?', 'Yes, if it is a service or pre-order business. You need a phone, some data and a skill.'],
      ['What skill can I learn for free?', 'Writing, basic design, spreadsheets, social media management and video editing all have good free tutorials.'],
      ['Should I borrow money to invest in an online opportunity?', 'Be very careful. Borrowing to invest in schemes promising returns is how many people lost money in collapses like CBEX.'],
    ],
    sources: [SRC.cbex],
    steps: { name: 'Start making money online with no capital', title: 'Start with ₦0', items: [
      ['Write down three things people ask you for.', 'Help with homework, phones, cooking, writing, hair: these are your services.'],
      ['Choose one and set a price.', 'Check what others charge nearby and online.'],
      ['Tell your network.', 'Post on your WhatsApp status every day for a week with examples.'],
      ['Use pre-orders for products.', 'Collect payment first, then buy and deliver.'],
    ] },
    related: [MM + 'no-deposit/', MO + 'with-just-your-phone/', MO + 'students/'],
  },
  {
    path: MO + 'with-just-your-phone/', parent: MO, crumbs: [['Make money online in Nigeria', '/' + MO], ['With just your phone']],
    short: 'Make money online with just your phone', card: 'Phone-only work: selling, design, editing, tutoring and support.',
    title: 'How to Make Money Online in Nigeria With Just Your Phone',
    h1: 'How to make money online in Nigeria with just your phone',
    desc: 'Phone-only ways to make money online in Nigeria: WhatsApp selling, phone design and video editing, tutoring, customer support and content, with apps and habits that help.',
    lede: 'No laptop? Many Nigerian online earners started with only a phone. Here is what you can do with one.',
    answer: 'With only a phone you can <strong>sell on WhatsApp and Instagram</strong>, <strong>design graphics and edit short videos</strong> with mobile apps, <strong>tutor</strong> over voice and video calls, do <strong>customer support and social media management</strong> for small businesses, and <strong>create content</strong>. A laptop helps later for freelancing at scale, but it is not needed to start.',
    about: ['Phone business', 'Mobile money making'],
    facts: ['WhatsApp Business is free and has a product catalogue.', 'Mobile design and video apps are enough for social media work.', 'Keep a separate number or profile for business if you can.', 'Office Wahala runs in your phone\'s browser and works offline.'],
    sections: [
      { id: 'ideas', h: 'What you can do on a phone', html: '<ul><li><strong>Social selling:</strong> a WhatsApp Business catalogue and status updates.</li><li><strong>Design:</strong> flyers and posts for churches, events and shops.</li><li><strong>Video editing:</strong> short clips for brands and creators.</li><li><strong>Tutoring:</strong> voice-note and video-call lessons.</li><li><strong>Social media management:</strong> post and reply for small businesses.</li></ul>' },
      { id: 'habits', h: 'Phone habits that help', html: '<ul><li>Back up your work to the cloud so a lost phone is not a lost business.</li><li>Use a password manager and two-step verification on WhatsApp.</li><li>Buy data in bundles and edit offline when you can.</li></ul>' },
      { id: 'limits', h: 'When a phone is not enough', html: '<p>Some work is hard on a small screen: long documents, large spreadsheets, coding and full-length video editing. If clients keep asking for those, that is the moment to save for a laptop, or to rent time at a hub or cyber café for the heavy jobs while your phone handles messages, design and selling.</p>' },
    ],
    faqs: [
      ['Can I do freelancing on my phone?', 'You can start, especially for design, editing, writing and support. Some platforms and clients will expect a laptop later.'],
      ['Which phone do I need?', 'Any recent Android or iPhone with a good camera and enough storage for your apps works.'],
      ['Can I win prizes playing games on my phone?', 'Yes. The Office Wahala Weekly Cup is free and runs in your phone\'s browser.'],
    ],
    steps: { name: 'Set up a phone-only online business', title: 'Set up your phone business', items: [
      ['Install WhatsApp Business.', 'Add a profile photo, description, hours and a catalogue.'],
      ['Install one design or editing app.', 'Learn it with free tutorials until you can make a flyer in 15 minutes.'],
      ['Make five samples.', 'Post them on your status and Instagram.'],
      ['Turn on security.', 'Enable two-step verification and back up your chats and files.'],
    ] },
    related: [MM + 'on-your-phone/', MO + 'with-no-money-to-start/', MO + 'stay-at-home-parents/'],
  },
];
