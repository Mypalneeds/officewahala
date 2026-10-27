# Office Wahala 🇳🇬

**Dodge your boss. Collect your salary. Survive the wahala.**

Office Wahala is a free browser arcade game about surviving a chaotic Nigerian workday. You walk an endless office corridor and grab salary, lunch money and data bundles. You dodge "quick" meetings, urgent tasks, runaway printers, network outages and Oga himself, who chases you down the corridor.

- Free, no sign-up, no pop-up ads, no cookies. Roadside billboards you control from your own dashboard, and anonymous gameplay stats players can switch off
- Plays on phones, tablets and desktops, and installs as an app that works offline
- Plain HTML, CSS and JavaScript. The game itself has no dependencies; the optional Netlify Functions use one (`@netlify/blobs`)
- Original Afrobeats/Amapiano-style soundtrack generated in code (no audio files, no licences)
- English and Pidgin
- Personal best saved on the device. Optional global leaderboard with Supabase

Built by **Mmadubuko Micheal**, CEO, [Analaize Limited](https://www.analaize.com.ng). Contact the developer: 07066459689.

Live: https://officewahala.netlify.app

## What's in version 4

| Feature | What it does |
|---|---|
| SEO pages | Five real guide pages Google can index: **How to play**, **FAQ** (18 questions), **Nigerian office slang** (32 terms), **About** and **Privacy**, plus a friendly 404 ("This page don japa"). Each has its own title, description, canonical link, breadcrumbs and Open Graph tags. |
| Structured data (rich results) | JSON-LD on every page: VideoGame, WebApplication, WebSite, Organization, Person, FAQPage, HowTo, DefinedTermSet (the slang glossary), AboutPage and BreadcrumbList. |
| AEO (answer engines) | Every guide page opens with a short direct answer, questions are written the way people ask them, and `llms.txt` gives ChatGPT, Perplexity, Gemini and Claude a plain summary of the game and its pages. |
| Crawl files | `sitemap.xml` (with real gameplay screenshots as image entries), `robots.txt` (keeps `/dashboard/` and `/api/` out of search), a `<noscript>` description on the game page, and real screenshots in `screenshots/`. |
| Analytics dashboard | `/dashboard/`, behind a password you choose: visitors (new and returning), sessions, page views, games, total and average playtime, scores, live visitors, a daily chart, busiest hours (Lagos time), a player funnel, traffic sources and UTM campaigns, countries, devices, languages, and a breakdown of almost every in-game event (what ended each shift, levels reached, bosses, shift events, power-ups, commute, blackouts, career days, badges, shop, outfits, shares, settings, installs) plus any JavaScript errors. Export to CSV. |
| Roadside billboards | Billboards line the Lagos road during the commute, ad screens hang on the office walls, a sponsored card sits on the menu and a "Shift sponsored by…" line on the appraisal. You manage every ad (brand, message, colours, image, link, dates, where it shows, how often) from the dashboard's **Ads** tab, with a live preview and view and click counts per ad. Changes go live in about two minutes, with no redeploy. |

## What's in version 3

| Feature | What it does |
|---|---|
| Morning commute | Each shift opens with a 15-second dash down a Lagos road: okadas, kekes, danfos, potholes and agberos asking "Owo da?". Every hit makes you 10 minutes late; arrive late and you start with one fewer life, arrive on time for +100. After your first commute a "Skip commute" button appears, and Settings can turn it off. |
| Shift events | From level 2, every 40–55 seconds a 15-second event changes the rules: **Salary week** (money everywhere), **Audit** (no pickups, survival points ×2), **Oga is travelling** (no Oga, double colleague work), **AGM day** (meetings everywhere), **Bank alert** (gold rains down). |
| Boss variety | Joining Oga: **MD's driver** (from level 3) dashes across a lane after a red warning, twice. **HR lady** (level 4) throws query letters that home in on you. **Aunty from Accounts** (level 5) freezes your salary pickups for 6 seconds if she touches you. |
| Report desks | From level 2 a glowing desk slides down. Stand on it for 3 seconds to submit a report for +300 while everything keeps coming. |
| Keep-for-later power-ups | Auto-reply (clears the screen), Fake call (sends every boss away), Puff-puff (colleagues, Aunty and HR stop chasing for 8 seconds). One slot; tap **Use** or press **E**. |
| Salary & staff shop | Every shift pays ₦1 per 5 points into a wallet. Spend it on an ergonomic chair (speed), stabilizer (shorter blackouts), canteen card (bigger lunch), health insurance (extra life), auto-reply in your pocket, or buy locked outfits early. Upgrades are switched off on the daily shift to keep it fair. |
| Career mode | A five-day work week with one goal a day: Monday survive till 12pm, Tuesday collect lunch, Wednesday submit reports, Thursday outrun Oga, Friday grab TGIF bonuses. Each day pays a bonus; finishing Friday earns a **promotion letter** you can share as an image. Goals get harder each week. |
| Office leagues | Private weekly scoreboards. Create one ("Analaize Team"), share the 6-letter code or invite link, and everyone's best score of the week shows up. Resets every Monday. Needs the Netlify Function (see below). |
| Name your Oga | Settings → "Name your Oga": the name appears on Oga's badge, in the warning banner and in the voice line ("Oga Chukwudi is coming!"). It stays on that phone and is never shared or uploaded. A word filter blocks insults. |
| AI voices | 40 voiced lines in English and Pidgin for the narrator, Oga, HR, Aunty, the driver, agberos and colleagues. See **Voices** below. Off by default, like all sound. |
| More badges | 19 badges in total: Lagos commuter, Report machine, Promoted!, Big spender, Seen it all. |

## What's in version 2

| Feature | What it does |
|---|---|
| Soundtrack | Original groove (log-drum bass, shekere, claps, highlife keys) built live with Web Audio. Speeds up each level, plays a talking-drum fill when Oga appears, and goes muffled during blackouts. Off until the player turns it on. |
| NEPA blackout | From level 3 the lights go out for about 7 seconds. You only see a circle around your worker; generator fuel makes it bigger. Get through without a hit for +150. |
| Boss key | Press `B` (or the button on the pause screen) and the game turns into a fake "Q3 Revenue Report" spreadsheet, tab title included. Press `B` or `Esc` to come back. |
| Challenge links | "Challenge a colleague" shares a link like `?beat=2450&by=Tunde`. Whoever opens it sees the challenge on the menu and a target in the HUD while they play. |
| Share image | A 1080×1920 appraisal card (WhatsApp Status / Instagram Story size), shared directly on phones that support it or saved with "Save image". |
| Office clock | Each level is one office hour from 8:00am. The windows show the Lagos skyline changing from morning to night, and the office lighting follows. |
| Badges & wardrobe | 14 badges. Badges unlock outfits: Ankara Friday, Senator, corporate suit, match-day jersey, Agbada & fila, Gele & iro, Gold legend. Two characters: Emeka and Adaeze. Ranks from Intern to MD / CEO. |
| Daily shift | Everyone gets the same obstacle pattern each day, so colleagues compete on equal terms. |
| English / Pidgin | All menus and in-game lines switch in Settings. |
| Graphics | Auto / High / Low. Auto drops to Low by itself if the phone struggles for a few seconds. |
| Install & offline | Installs to the home screen (Android "Install app" button, iPhone "Add to Home Screen") and works without data after the first visit. |
| Suggestion box | Star rating + review, sent to your Netlify dashboard. A WhatsApp link to 07066459689 is always there as a backup. |

---

## Project structure

```
office-wahala/
├── index.html           All screens: menu (staff ID card), HUD, pause, appraisal, wardrobe,
│                        shop, leagues, promotion letter, settings, suggestion box,
│                        leaderboard, boss-key spreadsheet
├── style.css            All styling and the colour palette
├── game.js              Game engine, sprites, sound effects, badges, sharing, settings
├── music.js             The generated soundtrack (Web Audio sequencer)
├── voice.js             Voice lines (single source of truth) + speaking engine
├── voices/              voices.json (+ MP3 clips once you run the generator)
├── tools/
│   ├── build-icons.mjs  Rebuilds the Font Awesome icon set inside index.html (only when adding icons)
│   ├── generate-voices.bat   Windows: double-click to make the Nigerian AI voice clips
│   └── generate_voices.py    The generator itself (Mac/Linux: python3 tools/generate_voices.py)
├── analytics.js         Anonymous, cookie-free event tracking (sends only when /api/track is live)
├── dashboard/           Password-protected analytics dashboard and billboard manager (not indexed)
├── how-to-play/ faq/ nigerian-office-slang/ about/ privacy/   Guide pages for Google (pages.css)
├── 404.html             "This page don japa" not-found page
├── robots.txt sitemap.xml llms.txt   Crawl files for search engines and AI answer engines
├── screenshots/         Real gameplay screenshots used by the pages and the sitemap
├── netlify/functions/
│   ├── league.mjs       Office Leagues API (Netlify Function + Netlify Blobs storage)
│   ├── track.mjs        Receives analytics batches (POST /api/track)
│   ├── stats.mjs        Dashboard numbers (GET /api/stats, needs DASHBOARD_KEY)
│   └── ads.mjs          Billboard ads (GET public, POST from the dashboard)
├── netlify/lib/         Shared code: aggregation, ad validation, default ads, dashboard key check
├── api/                 Placeholder answers used when the functions aren't deployed
├── package.json         One dependency for the leagues function (@netlify/blobs)
├── sw.js                Service worker: offline play after the first visit
├── manifest.webmanifest App name, colours and icons for "install to home screen"
├── netlify.toml         Netlify settings: copies the game into dist/, builds the function
├── icons/               App icons and the social preview image (og-image.png)
├── supabase/
│   └── schema.sql       Optional: database setup for the global leaderboard
├── README.md
├── LICENSE              MIT
└── .gitignore
```

All asset paths are relative. All game graphics are drawn in code on an HTML canvas, and all sounds and music are generated with the Web Audio API. The only image files are the app icons and the link-preview picture in `icons/`.

---

## How to play

| | Computer | Phone / tablet |
|---|---|---|
| Move | Arrow keys or W A S D | Put a finger anywhere and drag |
| Pause / resume | Space, Esc or P | Pause button (top right) |
| Use power-up | E | **Use** button (bottom right) |
| Start / restart | Enter | Buttons on screen |
| Sound on/off | M | Speaker button |
| Boss key (hide the game) | B | Pause → "Boss key" |

**Collect**

| Item | Effect |
|---|---|
| Salary (₦ note) | +100 |
| Data bundle | +75 |
| Lunch money (jollof pack) | +50 |
| Leave approval | 5 s invincibility. Obstacles bounce off you |
| Generator fuel | 5 s speed boost, and a bigger circle of light during blackouts |
| Friday bonus (TGIF star) | +500 and one life back (rare, from level 3) |

**Dodge**: falling files, urgent tasks, "quick" meetings (level 1). Deadlines (level 2). Network outages and printers sliding in from the sides (level 3). The colleague with "one small task" (level 4). Oga visits from level 2, with a warning first. He costs two lives; outrun him until he gives up for +100. From level 3, NEPA takes light now and then.

**Scoring**
- Survival points every second, multiplied by your level
- Collect 5, 10, 15… items in a row without getting hit for a streak bonus. Your multiplier also rises to ×1.5, ×2, ×2.5 and ×3
- Brushing past an obstacle without touching it gives a +10 "close call" bonus
- A new level arrives every 20 seconds. Obstacles get faster and more frequent
- You start with 3 lives. Scores never go negative

On real Fridays, TGIF bonuses appear twice as often.

---

## Run it locally

The game is static files, so any local web server works. Pick one:

```bash
# Python (built into macOS/Linux)
cd office-wahala
python3 -m http.server 8000
# open http://localhost:8000

# Node.js
npx serve .
```

You can also double-click `index.html`. Everything works from `file://` except clipboard sharing in some browsers.

**Testing on your phone**: run the server on your computer, find your computer's local IP (for example `192.168.1.20`) and open `http://192.168.1.20:8000` on a phone on the same Wi-Fi.

**Debug hooks**: add `?debug` to the URL to expose `window.__OW` in the browser console (for example `__OW.spawnBoss()`). It does nothing unless that flag is present.

---

## Upload to GitHub

**With the website (no Git needed)**
1. Sign in at github.com → **New repository** → name it `office-wahala` → **Public** → **Create repository**.
2. Click **uploading an existing file**.
3. Drag in everything **inside** the `office-wahala` folder, including the `supabase` folder. Files like `.gitignore` may be hidden; that is fine.
4. Click **Commit changes**.

**With Git**
```bash
cd office-wahala
git init
git add .
git commit -m "Office Wahala: first release"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/office-wahala.git
git push -u origin main
```

---

## Deploy on Vercel

No configuration file is needed.

1. Go to vercel.com and sign in with GitHub.
2. **Add New… → Project** → pick `office-wahala` → **Import**.
3. Set **Framework Preset** to **Other**. Leave **Build Command** empty and set **Output Directory** to `.` (or leave it at the default).
4. Click **Deploy**. Your game goes live at `https://office-wahala-xxxx.vercel.app`.

Without GitHub: `npm i -g vercel`, then run `vercel` inside the folder and accept the defaults.

## Deploy on Netlify

`netlify.toml` already holds the right settings, so there is nothing to type in.

**From GitHub (recommended: turns on Office Leagues)**
1. Go to app.netlify.com → **Add new site → Import an existing project → GitHub** → choose `office-wahala`.
2. Leave the build settings as Netlify fills them from `netlify.toml` (build command copies files into `dist`, publish directory `dist`).
3. Click **Deploy site**. Every push to GitHub redeploys automatically.

**Move your existing drag-and-drop site to GitHub (keeps officewahala.netlify.app)**
1. Upload the project to a GitHub repository (see "Upload to GitHub").
2. In Netlify open the officewahala site → **Site configuration → Build & deploy → Continuous deployment → Link repository** → choose the repo.
3. Netlify builds it. Office Leagues switch on by themselves: the **Office leagues** button appears on the menu once the function answers.

**Drag and drop**: open app.netlify.com/drop and drag the `office-wahala` folder onto the page. To update an existing site this way, open the site in Netlify → **Deploys** → drag the folder onto the "Drag and drop your site output folder here" box (dropping on app.netlify.com/drop creates a new site with a new address).

**Turn on the suggestion box (one time)**
1. In Netlify open your site → **Forms**. If you see **Enable form detection**, click it.
2. Redeploy once (drag the folder again, or **Deploys → Trigger deploy**). Netlify finds the form called `review`.
3. Reviews then appear under **Forms → review**. To get each one by email: **Forms → Form notifications → Add notification → Email notification**, pick the `review` form and enter your email.

The free plan includes 100 form submissions a month. On Vercel or GitHub Pages the review form can't post anywhere, so players use the WhatsApp link under it instead.

## Office leagues (Netlify Function)

Leagues need a tiny server. It lives in `netlify/functions/league.mjs` and stores data in Netlify Blobs, which is included on Netlify's free plan. No extra account, keys or database setup.

- **It only runs when Netlify builds the site** (GitHub-linked or `netlify deploy` with the CLI). Drag-and-drop uploads skip functions; the game then hides the Leagues button and everything else works.
- **What it stores:** league name and code; each player's weekly best (name, score, time, level) under a random player ID. No emails, phone numbers or IP addresses are stored. IP is only used briefly to rate-limit league creation.
- **Checks:** names are cleaned and run through a word filter; scores must fit the time survived (one level per 20 s, at most ~900 points/s); one submission per player every 8 s; league creation limited per IP. Like any browser game, a determined cheater could still fake a believable score.
- **Weeks** run Monday to Sunday, Lagos time. Old weeks stay in storage but aren't shown.
- **Data:** Netlify dashboard → your site → **Blobs** → store `office-wahala`.
- If you host somewhere other than Netlify, change `CONFIG.LEAGUE_API` in `game.js` to any server that implements the same four routes (listed at the top of `league.mjs`).

## Get it on Google (SEO) and AI answers (AEO)

Everything on the site side is already done. These steps tell Google and Bing it exists. Do them once, after the v4 deploy is live.

**Google Search Console**
1. Go to search.google.com/search-console and click **Add property**. Choose **URL prefix** and enter `https://officewahala.netlify.app/`.
2. Verify ownership. Easiest on a netlify.app address: pick **HTML tag**, copy the `content="…"` value and send it to whoever edits the site (or add `<meta name="google-site-verification" content="…">` to the `<head>` of `index.html` yourself), redeploy, then click **Verify**.
3. Open **Sitemaps**, enter `sitemap.xml` and click **Submit**.
4. Open **URL inspection**, paste the home page address and click **Request indexing**. Repeat for `/faq/`, `/how-to-play/` and `/nigerian-office-slang/`.
5. Indexing usually takes a few days to two weeks. **Performance** then shows which searches bring people in.

**Bing (also feeds ChatGPT search, DuckDuckGo and Copilot)**
1. Go to bing.com/webmasters and sign in. Choose **Import from Google Search Console** (fastest) or add the site and verify the same way.
2. Under **Sitemaps** submit `https://officewahala.netlify.app/sitemap.xml`.

**Check the structured data:** paste a page into search.google.com/test/rich-results (FAQ, How-to and VideoGame should show as valid) and validator.schema.org.

**What helps from here:** links from other sites (a tweet, a blog post, a Nairaland thread, your Analaize website, a LinkedIn post) matter more than anything else. Ask friends to search "Office Wahala game" and click the result; shared challenge links bring people back.

**Using your own domain?** The address `https://officewahala.netlify.app` is written in `index.html` (canonical, Open Graph, JSON-LD, `CONFIG.SHARE_URL` in `game.js`), every guide page, `sitemap.xml`, `robots.txt` and `llms.txt`. Search-and-replace it in all files, redeploy, then add the new domain in Search Console.

## Analytics dashboard

The game sends small anonymous batches of events (page views, shifts started and finished, levels, scores, bosses, power-ups, shares, settings, ad views and clicks, errors) to `/api/track`. They are stored in Netlify Blobs and rolled up per hour and per day.

**Turn it on (one time)**
1. Netlify → your site → **Site configuration → Environment variables → Add a variable**. Key: `DASHBOARD_KEY`. Value: a long password only you know (at least 8 characters; 16+ is better). Scope: all, or at least Functions.
2. **Deploys → Trigger deploy → Deploy site** so the functions see the new variable.
3. Open `https://officewahala.netlify.app/dashboard/` and enter the password. It is kept for that browser tab only.

Tracking starts as soon as the site is deployed from GitHub; the password is only needed to read the numbers. Data before the deploy is not available.

**Privacy (also written on the /privacy/ page)**
- No cookies, no names, no emails and no IP addresses are stored. A random visitor ID in `localStorage` (`ow_vid`) tells new from returning visitors; the country comes from Netlify's location header and only the two-letter code is kept.
- Players can switch it off in **Settings → Anonymous stats** (`ow_track` = `0`). Browsers sending Do Not Track or Global Privacy Control start with it off.
- Bots and crawlers are ignored.
- Drag-and-drop, Vercel and GitHub Pages deploys send nothing: the script checks `/api/track/health` first.

**Notes**
- Times and days are Lagos time (WAT).
- "Live now" counts visitors active in the last 5 minutes. Playtime is wall-clock time in shifts; "Time on site" counts time with the tab visible.
- Netlify's free plan covers 125,000 function calls a month. Each visitor normally causes 2–5 calls, so roughly 25,000–50,000 visits a month fit. If the site goes viral, check **Usage** in Netlify.
- Raw data: Netlify → your site → **Blobs** → store `office-wahala-stats`.

## Sell billboard space

There are four ad spots, all managed from **Dashboard → Ads**:

| Spot | Where | Clickable |
|---|---|---|
| Road billboards | Both sides of the road during the morning commute | No (seen by everyone who plays the commute) |
| Office screens | TV screens on the corridor walls | No |
| Menu card | "Sponsored" card on the staff ID menu | Yes |
| Appraisal line | "Shift sponsored by …" on the game-over screen | Yes |

**Add an advertiser:** Dashboard → **Ads** → **+ Add ad**. Fill in the brand, a short headline, a small line (website or phone), a link starting with `https://`, colours, and optionally an image link (a wide picture, about 640×360, hosted anywhere that gives an `https://` address). Choose where it shows, a weight from 1 to 10 (higher = shown more often) and optional start and end dates for the campaign. Click **Save ads**. Players see it within about two minutes; no redeploy.

**Reporting to advertisers:** the performance table shows views per ad on the road, office and menu, plus clicks and click-through rate. Pick a date range at the top and use **Export CSV**.

The game ships with three house ads: "YOUR BRAND HERE" (links to WhatsApp so advertisers can reach you), Analaize Limited and Office Leagues. Edit or remove them like any other ad. Without the functions (drag-and-drop deploys) the game shows these defaults from the file `api/ads`; edit that JSON file to change them by hand.

Ads never pop up, never cover the play area and never make sound. Keep it that way; that is why people will keep playing.

## Voices

Every line is in `voice.js` (between the `LINES_START` / `LINES_END` markers), in English and Pidgin, with a speaker for each (narrator, Oga, HR, Aunty, driver, agbero, colleague). Players turn voices on in Settings or with the speaker button. The game speaks in one of two ways, chosen automatically:

1. **Studio clips (best).** Run the generator once on your own computer, then upload the game again:
   - Windows: double-click `tools/generate-voices.bat` (needs Python from python.org and internet).
   - Mac/Linux: `python3 -m pip install edge-tts && python3 tools/generate_voices.py`

   It makes 80 MP3s in `voices/en` and `voices/pcm` with Microsoft's Nigerian neural voices, **Abeo** (male: Oga, driver, agbero, colleague) and **Ezinne** (female: narrator, HR, Aunty), and writes `voices/voices.json`. The game finds them automatically. The clips total about 1–2 MB and are cached for offline play after they've been heard once.
   The generator uses the free `edge-tts` package, which talks to the read-aloud service built into Microsoft Edge. It isn't an official Microsoft API, so it could change or stop working. Clips you've already made keep working either way.
2. **Device AI speech (always available).** Without clips, the game uses the phone's or browser's own speech engine and picks a Nigerian-English voice when there is one: Google's "English (Nigeria)" on most Android phones, Microsoft Abeo/Ezinne in Edge on Windows. Other devices use their best English voice, with pitch changes to tell characters apart. Settings shows which voice is in use.

To change or add a line: edit it in `voice.js`, run the generator again, redeploy. Lines marked `"ttsOnly": true` (the "Oga {name} is coming!" line) are always spoken by the device, because they include the player's own text.

## Deploy on GitHub Pages

This works because the game uses relative paths and needs no server code.

1. In your repository: **Settings → Pages**.
2. Set **Source** to **Deploy from a branch**, **Branch** to `main`, **Folder** to `/ (root)` → **Save**.
3. After a minute the game is live at `https://YOUR-USERNAME.github.io/office-wahala/`.

---

## Share links

The **Challenge a colleague** button produces a message like:

> I survived 02:35 of Office Wahala and scored 2,450 points! Can you beat my score? 🇳🇬 https://officewahala.netlify.app/?beat=2450&by=Tunde

On phones that support it, the share sheet opens with the appraisal image attached. Otherwise the message is copied to the clipboard. Opening the link shows the challenge on the menu and a "Beat Tunde: 2,450" target while playing. Daily-shift challenges only count on the same day's daily shift.

Challenge scores live in the link, so they can be edited by anyone who knows how. They're for fun between colleagues, not a ranking.

**Which link is included**
- If `CONFIG.SHARE_URL` in `game.js` is set, that URL is used.
- If it is empty, the game uses the page's own address, but only on a real domain (for example your Vercel URL). On `localhost`, a local IP address or `file://`, no link is added. The game never makes up a URL.

After deploying, set your final address once so shares always use it (for example a custom domain):

```js
// game.js
SHARE_URL: 'https://office-wahala.vercel.app',
```

---

## Personal best storage

The best score is saved in the browser's `localStorage` under these keys:

| Key | Meaning |
|---|---|
| `ow_best` | Personal best score |
| `ow_muted` | `1` = sound off (default), `0` = sound on |
| `ow_played` | Set after the first round. Collapses the instructions on small screens |
| `ow_name` | Player name (shown on challenges and the ID card) |
| `ow_music` | `1` = music on (default off) |
| `ow_lang` | `en` or `pcm` (Pidgin) |
| `ow_gfx` | `auto`, `high` or `low` |
| `ow_char`, `ow_outfit` | Chosen character and outfit |
| `ow_stats`, `ow_badges` | Lifetime counters and unlocked badges |
| `ow_daily_YYYY-MM-DD` | Best score on that day's daily shift |
| `ow_wallet`, `ow_upg`, `ow_owned` | Naira wallet, shop upgrades, outfits bought |
| `ow_career` | Career week and day |
| `ow_voices`, `ow_commute`, `ow_commuted` | Voices on/off, commute on/off, first commute done |
| `ow_oga` | Your Oga's name (only ever on this device) |
| `ow_pid`, `ow_leagues`, `ow_weekbest` | Random league player ID, joined leagues, this week's best run |
| `ow_vid`, `ow_last`, `ow_track` | Anonymous visitor ID, last activity time, stats on/off (see Analytics dashboard) |
| `ow_ads` | Last billboard list, so ads still show offline |

This data never leaves the device, except your name and weekly best score when you join an Office League, and the anonymous visitor ID sent with gameplay stats (unless switched off). Clearing site data resets it. In private browsing, or if storage is blocked, the game still works and just doesn't remember between visits.

---

## Optional: global leaderboard (Supabase, free tier)

Without this, the game is fully playable with local bests, and no leaderboard buttons are shown. The game never shows fake or made-up scores.

**1. Create the database**
1. Create a free project at supabase.com.
2. Open **SQL Editor → New query**, paste the whole of `supabase/schema.sql` and click **Run**.

The SQL does the following:
- Creates a `scores` table with Row Level Security on and no policies. The public key cannot read or write the table directly.
- Adds `submit_score(...)`. It cleans names (letters, numbers, spaces, `. _ -`, max 20 chars) and rejects scores that are impossible for the time survived or the level reached. It also rate-limits each client IP (hashed, never stored raw) to one submission per 20 seconds and 30 per hour.
- Adds `get_leaderboard(limit)`, which returns the top scores: name, score and time only.

**2. Connect the game**
In Supabase: **Project Settings → API**. Copy the **Project URL** and the **anon public** key into `game.js`:

```js
SUPABASE_URL: 'https://abcdxyz.supabase.co',
SUPABASE_ANON_KEY: 'eyJhbGciOi...your anon key...',
```

The anon key is designed to be public; the SQL functions do the protecting. **Never** put the `service_role` key in the game. It bypasses all security.

**3. Redeploy.** Leaderboard buttons now appear on the menu and game-over screens, and players can submit a name after each round.

**Limits to know about**: a browser game cannot fully stop a determined cheater from sending made-up numbers, because all game logic runs on the player's device. The plausibility checks stop obvious fakes. If cheating becomes a problem, you can delete rows in **Table Editor → scores**.

---

## Customise

Everything you'd want to change is at the top of `game.js`, plus the palette in `style.css`.

**Title and wording**
- Page title and description: `<title>` and `<meta>` tags in `index.html`
- On-screen title: the `.title` heading in `index.html`
- Share text: `CONFIG.TITLE` in `game.js`

**Messages** (`MESSAGES` in `game.js`)
- `ambient`: random office lines that pop up during play
- `hit`: what's shown when each obstacle hits you
- `bossTalk`, `colleagueTalk`: speech bubbles
- `over`: game-over verdicts by score range, plus `newBest`

**Music**
- The generated soundtrack is in `music.js`: tempo (`bpm`, raised per level in `setLevel`), drum patterns (`KICK`, `CLAP`, `LOG`…) and chords (`CHORDS`).
- To use real songs instead, put the audio files in a `music/` folder and list them in `game.js`:
  ```js
  MUSIC_TRACKS: ['music/track1.mp3', 'music/track2.mp3'],
  ```
  They play in order and loop, and skip back to the generated groove if a file fails. **Only use tracks you have a licence for.** Commercial Nigerian songs need permission from the label or artist, and an unlicensed track can get the site taken down. Royalty-free sources such as Uppbeat or Pixabay Music, or a beat bought from a producer with a licence that covers games, are safe. Also add the files to `SHELL` in `sw.js` if they should play offline.

**Credits and contact**
- The credit block is at the bottom of the menu card in `index.html` (`<footer class="credits">`).
- The text on the share image is `CONFIG.CREDIT` in `game.js`.
- The WhatsApp number for the suggestion box is in `index.html` (`review-wa`) and `game.js` (`updateWaLink`).

**Colours**
- Interface: the `:root` variables at the top of `style.css` (`--green`, `--gold`, `--navy-800`…)
- Game world: the `COLORS` object in `game.js`. Individual sprites are in `SPRITES`

**Difficulty**

| Setting | Where | Effect |
|---|---|---|
| `CONFIG.START_LIVES` / `MAX_LIVES` | game.js | Lives at the start and cap |
| `CONFIG.LEVEL_SECONDS` | game.js | Seconds per level |
| `CONFIG.PLAYER_SPEED` | game.js | How fast you move |
| `DIFFICULTY.spawnBase` / `spawnMin` / `spawnDecay` | game.js | How often obstacles appear |
| `DIFFICULTY.speedPerLevel` / `speedMax` | game.js | How fast obstacles get |
| `DIFFICULTY.bossFromLevel` / `bossEvery` | game.js | When and how often Oga shows up |
| `DIFFICULTY.itemEvery` | game.js | How often collectibles appear |
| `DIFFICULTY.blackoutFromLevel` / `blackoutEvery` / `blackoutLength` | game.js | NEPA blackouts |
| `OBSTACLES` / `ITEMS` tables | game.js | Per-type unlock level, weight, speed, points |
| `BADGES` / `OUTFITS` | game.js | Badge goals and which badge unlocks which outfit |
| `DIFFICULTY.eventEvery` / `eventLength` | game.js | How often shift events happen and how long they last |
| `DIFFICULTY.taskEvery` / `taskSeconds` | game.js | Report desks |
| `DIFFICULTY.commuteSeconds`, `COMMUTE_OBS` | game.js | Commute length and road hazards |
| `BOSS_TYPES` | game.js | Which boss appears from which level, and how often |
| `SHOP_ITEMS`, `OUTFIT_PRICES` | game.js | Shop prices and effects; outfit prices |
| `CAREER_DAYS` | game.js | Career goals per weekday (each takes the week number) |

If you change `LEVEL_SECONDS` or the scoring, update the plausibility checks in `netlify/functions/league.mjs` (`duration / 20`, `duration * 900`) and, if you use Supabase, in `supabase/schema.sql` (`p_duration / 20`, `p_duration * 900`; already raised to 900 for v3 scoring).

---

## Updating the live game

When you change any file, also bump `VERSION` at the top of `sw.js` (for example `ow-v4.0.1`). Players' phones then fetch the new files instead of the copy saved for offline play.

## Browser support

Current Chrome, Edge, Firefox and Safari on desktop, Android and iOS. Uses Canvas 2D, Pointer Events, `requestAnimationFrame`, `localStorage`, a service worker, Web Audio (optional) and the Web Share API (optional, with clipboard fallback). The game pauses automatically when you switch tabs or apps.

## License

MIT. See `LICENSE`. All artwork, sounds and music are original and generated in code.

Interface icons: [Font Awesome Free 6](https://fontawesome.com) by Fonticons, Inc., licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). They are stored inside `index.html` (no CDN, so they work offline). To add one: `npm i --no-save @fortawesome/fontawesome-free@6`, add its name to the list in `tools/build-icons.mjs`, run `node tools/build-icons.mjs`, then use `<svg class="ico"><use href="#i-NAME"/></svg>` in HTML or `ico('NAME')` in `game.js`.
