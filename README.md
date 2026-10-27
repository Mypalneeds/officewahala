# Office Wahala 🇳🇬

**Dodge your boss. Collect your salary. Survive the wahala.**

Office Wahala is a free browser arcade game about surviving a chaotic Nigerian workday. You walk an endless office corridor and grab salary, lunch money and data bundles. You dodge "quick" meetings, urgent tasks, runaway printers, network outages and Oga himself, who chases you down the corridor.

- Free, no sign-up, no ads, no tracking
- Plays on phones, tablets and desktops, and installs as an app that works offline
- Plain HTML, CSS and JavaScript. No build step, no dependencies
- Original Afrobeats/Amapiano-style soundtrack generated in code (no audio files, no licences)
- English and Pidgin
- Personal best saved on the device. Optional global leaderboard with Supabase

Built by **Mmadubuko Micheal**, CEO, [Analaize Limited](https://www.analaize.com.ng). Contact the developer: 07066459689.

Live: https://officewahala.netlify.app

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
│                        settings, suggestion box, leaderboard, boss-key spreadsheet
├── style.css            All styling and the colour palette
├── game.js              Game engine, sprites, sound effects, badges, sharing, settings
├── music.js             The generated soundtrack (Web Audio sequencer)
├── sw.js                Service worker: offline play after the first visit
├── manifest.webmanifest App name, colours and icons for "install to home screen"
├── netlify.toml         Netlify settings (no build step; caching headers for sw.js)
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

No configuration file is needed.

**From GitHub**
1. Go to app.netlify.com → **Add new site → Import an existing project → GitHub** → choose `office-wahala`.
2. Leave **Build command** empty. Set **Publish directory** to `.` (or leave it blank).
3. Click **Deploy site**.

**Drag and drop**: open app.netlify.com/drop and drag the `office-wahala` folder onto the page. To update an existing site this way, open the site in Netlify → **Deploys** → drag the folder onto the "Drag and drop your site output folder here" box (dropping on app.netlify.com/drop creates a new site with a new address).

**Turn on the suggestion box (one time)**
1. In Netlify open your site → **Forms**. If you see **Enable form detection**, click it.
2. Redeploy once (drag the folder again, or **Deploys → Trigger deploy**). Netlify finds the form called `review`.
3. Reviews then appear under **Forms → review**. To get each one by email: **Forms → Form notifications → Add notification → Email notification**, pick the `review` form and enter your email.

The free plan includes 100 form submissions a month. On Vercel or GitHub Pages the review form can't post anywhere, so players use the WhatsApp link under it instead.

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

The data never leaves the device. Clearing site data resets it. In private browsing, or if storage is blocked, the game still works and just doesn't remember between visits.

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

If you change `LEVEL_SECONDS` or the scoring and use the leaderboard, update the two plausibility checks in `supabase/schema.sql` (`p_duration / 20` and `p_duration * 550`).

---

## Updating the live game

When you change any file, also bump `VERSION` at the top of `sw.js` (for example `ow-v2.0.1`). Players' phones then fetch the new files instead of the copy saved for offline play.

## Browser support

Current Chrome, Edge, Firefox and Safari on desktop, Android and iOS. Uses Canvas 2D, Pointer Events, `requestAnimationFrame`, `localStorage`, a service worker, Web Audio (optional) and the Web Share API (optional, with clipboard fallback). The game pauses automatically when you switch tabs or apps.

## License

MIT. See `LICENSE`. All artwork, sounds and music are original and generated in code.
