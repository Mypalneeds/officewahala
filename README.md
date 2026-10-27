# Office Wahala 🇳🇬

**Dodge your boss. Collect your salary. Survive the wahala.**

Office Wahala is a free browser arcade game about surviving a chaotic Nigerian workday. You walk an endless office corridor and grab salary, lunch money and data bundles. You dodge "quick" meetings, urgent tasks, runaway printers, network outages and Oga himself, who chases you down the corridor.

- Free, no sign-up, no ads, no tracking
- Plays on phones, tablets and desktops
- Plain HTML, CSS and JavaScript. No build step, no dependencies
- Personal best saved on the device. Optional global leaderboard with Supabase

---

## Project structure

```
office-wahala/
├── index.html           Screens: menu (staff ID card), HUD, pause, game over (appraisal), leaderboard
├── style.css            All styling and the colour palette
├── game.js              Game engine, sprites, sound, scoring, sharing, leaderboard client
├── supabase/
│   └── schema.sql       Optional: database setup for the global leaderboard
├── README.md
├── LICENSE              MIT
└── .gitignore
```

All asset paths are relative. All graphics are drawn in code on an HTML canvas, and all sounds are generated with the Web Audio API. There are no image, font or audio files to break.

---

## How to play

| | Computer | Phone / tablet |
|---|---|---|
| Move | Arrow keys or W A S D | Put a finger anywhere and drag |
| Pause / resume | Space, Esc or P | Pause button (top right) |
| Start / restart | Enter | Buttons on screen |
| Sound on/off | M | Speaker button |

**Collect**

| Item | Effect |
|---|---|
| Salary (₦ note) | +100 |
| Data bundle | +75 |
| Lunch money (jollof pack) | +50 |
| Leave approval | 5 s invincibility. Obstacles bounce off you |
| Generator fuel | 5 s speed boost |
| Friday bonus (TGIF star) | +500 and one life back (rare, from level 3) |

**Dodge**: falling files, urgent tasks, "quick" meetings (level 1). Deadlines (level 2). Network outages and printers sliding in from the sides (level 3). The colleague with "one small task" (level 4). Oga visits from level 2, with a warning first. Oga costs two lives.

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

**Drag and drop**: open app.netlify.com/drop and drag the `office-wahala` folder onto the page.

## Deploy on GitHub Pages

This works because the game uses relative paths and needs no server code.

1. In your repository: **Settings → Pages**.
2. Set **Source** to **Deploy from a branch**, **Branch** to `main`, **Folder** to `/ (root)` → **Save**.
3. After a minute the game is live at `https://YOUR-USERNAME.github.io/office-wahala/`.

---

## Share links

The **Share score** button produces a message like:

> I survived 02:35 of Office Wahala and scored 2,450 points! Can you beat my score? 🇳🇬

It opens the phone's share sheet where supported (WhatsApp, X and so on). Otherwise it copies the message to the clipboard.

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
| `ow_name` | Last name used for the leaderboard |

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
| `OBSTACLES` / `ITEMS` tables | game.js | Per-type unlock level, weight, speed, points |

If you change `LEVEL_SECONDS` or the scoring and use the leaderboard, update the two plausibility checks in `supabase/schema.sql` (`p_duration / 20` and `p_duration * 550`).

---

## Browser support

Current Chrome, Edge, Firefox and Safari on desktop, Android and iOS. Uses Canvas 2D, Pointer Events, `requestAnimationFrame`, `localStorage`, Web Audio (optional) and the Web Share API (optional, with clipboard fallback). The game pauses automatically when you switch tabs or apps.

## License

MIT. See `LICENSE`. All artwork and sounds are original and generated in code.
