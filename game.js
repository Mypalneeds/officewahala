/* ==========================================================
   OFFICE WAHALA — a Nigerian office arcade game
   Vanilla JavaScript + HTML Canvas. No dependencies.
   MIT License.
   ========================================================== */
(() => {
  'use strict';

  /* ==================== CONFIG (edit me) ==================== */
  const CONFIG = {
    TITLE: 'Office Wahala',

    // Public URL of your deployed game, e.g. 'https://office-wahala.vercel.app'.
    // Leave empty to use the page's own address automatically when the game is
    // served over http(s) from a real domain (never localhost).
    SHARE_URL: '',

    // Optional global leaderboard (Supabase). Leave both empty for local-only
    // personal bests. The anon key is designed to be public; security comes from
    // the SQL in supabase/schema.sql. NEVER paste a service_role key here.
    SUPABASE_URL: '',
    SUPABASE_ANON_KEY: '',

    START_LIVES: 3,
    MAX_LIVES: 5,
    LEVEL_SECONDS: 20,      // a new level every N seconds
    PLAYER_SPEED: 300,      // world units per second
  };

  const DIFFICULTY = {
    spawnBase: 0.95,        // seconds between obstacles at level 1
    spawnMin: 0.3,          // fastest possible spawn interval
    spawnDecay: 0.9,        // interval multiplier per level
    speedPerLevel: 0.07,    // obstacle speed increase per level
    speedMax: 2.3,          // cap on speed multiplier
    itemEvery: [1.4, 2.4],  // seconds between collectibles (min, max)
    bossFromLevel: 2,       // Oga starts appearing at this level
    bossEvery: [20, 32],    // seconds between Oga visits
    survivalPerSecond: 5,   // survival points per second, multiplied by level (max 25)
    graceSeconds: 1.2,      // no obstacles for the first moments of a round
  };

  const COLORS = {
    floor: '#16223a',
    floorLine: '#1c2b48',
    wall: '#0c1424',
    green: '#008751',
    greenBright: '#19c37d',
    gold: '#f5b301',
    red: '#e5484d',
    white: '#ffffff',
    ink: '#17203a',
  };

  const MESSAGES = {
    ambient: [
      'We are a family here.',
      'Abeg, let me breathe!',
      'Kindly do the needful.',
      'Please revert ASAP.',
      'Per my last email…',
      'Send me the soft copy.',
      'Who ate my jollof in the office fridge?',
      'Up NEPA! Light is back.',
      'Let us take this offline.',
      'Traffic on Third Mainland was madness today.',
      'Is the AC working or na only me?',
      'Who approved this leave?',
      'Please CC me on that mail.',
      'Can you join this call quickly?',
      'Salary go soon land. Hold on.',
      'Just one small task.',
    ],
    hit: {
      file: 'Falling files! Who arranged this cabinet?',
      task: 'Please revert ASAP.',
      meeting: 'Are you available for a quick meeting?',
      deadline: 'This deadline was yesterday o!',
      network: 'Network don disappear!',
      printer: 'Printer jam! Again!',
      colleague: 'Just one small task…',
      boss: 'Oga caught you! Kindly do the needful.',
    },
    bossTalk: ['Come here!', 'Quick one…', 'Do the needful!', 'Where is the report?', 'My office. Now.'],
    colleagueTalk: ['One small task', 'Abeg help me', 'Quick favour…'],
    over: [
      { max: 499, text: 'You no reach lunch break. Oga is already asking for you.' },
      { max: 1499, text: 'You survived till 10am. Small small, you go reach.' },
      { max: 2999, text: 'Lunch break survivor. Oga is impressed… slightly.' },
      { max: 5999, text: 'Closing time champion. Salary has entered!' },
      { max: 9999, text: 'Employee of the month. They will give you more work now.' },
      { max: Infinity, text: 'Legend of the office. HR wants to frame your photo.' },
    ],
    newBest: 'New personal best! Promotion loading…',
  };

  const OBSTACLES = {
    file:      { unlock: 1, weight: 5, r: 13, speed: [190, 260] },
    task:      { unlock: 1, weight: 4, r: 15, speed: [250, 330] },
    meeting:   { unlock: 1, weight: 3, r: 19, speed: [120, 165] },
    deadline:  { unlock: 2, weight: 3, r: 15, speed: [160, 215] },
    network:   { unlock: 3, weight: 2, r: 16, speed: [140, 185] },
    printer:   { unlock: 3, weight: 2, w: 54, h: 40, speed: [170, 240] },
    colleague: { unlock: 4, weight: 2, r: 17, speed: [105, 140] },
  };

  const ITEMS = {
    lunch:  { weight: 40, pts: 50, label: '+50 Lunch money', color: '#ff9a3c' },
    salary: { weight: 26, pts: 100, label: 'Salary has entered! +100', color: '#f5b301' },
    data:   { weight: 24, pts: 75, label: '+75 Data bundle', color: '#5ad1ff' },
    fuel:   { weight: 6, pts: 0, power: 'fuel', dur: 5, label: 'Gen fuel! Speed boost', color: '#ffd34d' },
    leave:  { weight: 4.5, pts: 0, power: 'leave', dur: 5, label: 'Leave approved! Nothing can touch you', color: '#3ee08f' },
    friday: { weight: 1.6, pts: 500, unlock: 3, label: 'TGIF! +500', color: '#ffe066' },
  };

  /* ==================== Helpers ==================== */
  const TAU = Math.PI * 2;
  const $ = (id) => document.getElementById(id);
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const pick = (arr) => arr[(Math.random() * arr.length) | 0];
  const IS_FRIDAY = new Date().getDay() === 5;
  const DEBUG = /[?&]debug\b/.test(location.search);

  function weighted(entries) {
    let total = 0;
    for (const [, w] of entries) total += w;
    let r = Math.random() * total;
    for (const [k, w] of entries) { r -= w; if (r <= 0) return k; }
    return entries[entries.length - 1][0];
  }

  function fmtTime(sec) {
    const s = Math.max(0, Math.floor(sec));
    const m = Math.floor(s / 60);
    return String(m).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  }
  const fmtNum = (n) => Math.max(0, Math.floor(n)).toLocaleString('en-NG');

  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, String(v)); } catch (e) { /* storage unavailable */ } },
  };

  function rr(c, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }
  function circle(c, x, y, r) { c.beginPath(); c.arc(x, y, r, 0, TAU); }
  function hash(n) { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

  /* ==================== Audio (synthesised, off by default) ==================== */
  const Sound = {
    ctx: null,
    master: null,
    muted: store.get('ow_muted', '1') !== '0',
    ensure() {
      if (this.ctx) return true;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      try {
        this.ctx = new AC();
        this.master = this.ctx.createGain();
        this.master.gain.value = 0.35;
        this.master.connect(this.ctx.destination);
        return true;
      } catch (e) { this.ctx = null; return false; }
    },
    setMuted(m) {
      this.muted = m;
      store.set('ow_muted', m ? '1' : '0');
      if (!m && this.ensure() && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    },
    tone(freq, dur, type = 'square', vol = 0.3, slideTo = 0, delay = 0) {
      if (this.muted || !this.ctx) return;
      const t0 = this.ctx.currentTime + delay;
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, t0);
      if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(vol, t0 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g); g.connect(this.master);
      o.start(t0); o.stop(t0 + dur + 0.02);
    },
    noise(dur, vol = 0.25) {
      if (this.muted || !this.ctx) return;
      const len = Math.floor(this.ctx.sampleRate * dur);
      const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const src = this.ctx.createBufferSource();
      const g = this.ctx.createGain();
      g.gain.value = vol;
      src.buffer = buf; src.connect(g); g.connect(this.master);
      src.start();
    },
    play(name) {
      if (this.muted || !this.ctx) return;
      switch (name) {
        case 'coin': this.tone(988, 0.07, 'square', 0.18); this.tone(1319, 0.14, 'square', 0.18, 0, 0.06); break;
        case 'big': [784, 988, 1175, 1568].forEach((f, i) => this.tone(f, 0.12, 'square', 0.16, 0, i * 0.06)); break;
        case 'power': this.tone(330, 0.3, 'sawtooth', 0.14, 990); break;
        case 'hit': this.noise(0.22, 0.3); this.tone(220, 0.28, 'sawtooth', 0.2, 55); break;
        case 'near': this.tone(660, 0.05, 'triangle', 0.12); break;
        case 'level': [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.13, 'triangle', 0.22, 0, i * 0.08)); break;
        case 'start': [392, 523, 659].forEach((f, i) => this.tone(f, 0.12, 'square', 0.16, 0, i * 0.08)); break;
        case 'warn': this.tone(880, 0.14, 'square', 0.14); this.tone(660, 0.14, 'square', 0.14, 0, 0.18); this.tone(880, 0.14, 'square', 0.14, 0, 0.36); break;
        case 'over': [523, 415, 330, 247].forEach((f, i) => this.tone(f, 0.22, 'triangle', 0.22, 0, i * 0.16)); break;
        case 'click': this.tone(600, 0.04, 'triangle', 0.1); break;
      }
    },
  };

  /* ==================== Sprites ==================== */
  // Each sprite draws centred on (0,0) at in-game size. t = time in seconds.
  function drawPerson(c, p) {
    const s = p.s || 1;
    const w = p.walk || 0;
    const lg = Math.sin(w) * 3;
    c.save();
    c.scale(s, s);
    // shadow
    c.fillStyle = 'rgba(0,0,0,.3)';
    c.beginPath(); c.ellipse(0, 23, 15, 5, 0, 0, TAU); c.fill();
    // legs + shoes
    c.fillStyle = p.pants || '#26324f';
    rr(c, -9, 7, 7, 14 + lg, 3); c.fill();
    rr(c, 2, 7, 7, 14 - lg, 3); c.fill();
    c.fillStyle = '#111827';
    rr(c, -10, 19 + lg, 9, 4, 2); c.fill();
    rr(c, 1, 19 - lg, 9, 4, 2); c.fill();
    // arms
    c.fillStyle = p.sleeve || p.shirt;
    rr(c, -17.5, -7 + lg * 0.6, 6, 16, 3); c.fill();
    rr(c, 11.5, -7 - lg * 0.6, 6, 16, 3); c.fill();
    c.fillStyle = p.skin;
    circle(c, -14.5, 9 + lg * 0.6, 3.2); c.fill();
    circle(c, 14.5, 9 - lg * 0.6, 3.2); c.fill();
    // body
    c.fillStyle = p.shirt;
    rr(c, -12, -10, 24, 21, 7); c.fill();
    if (p.suit) {
      c.fillStyle = '#ffffff';
      c.beginPath(); c.moveTo(-4, -10); c.lineTo(0, 0); c.lineTo(4, -10); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(255,255,255,.18)'; c.lineWidth = 1.2;
      c.beginPath(); c.moveTo(-6, -9); c.lineTo(-1, 6); c.moveTo(6, -9); c.lineTo(1, 6); c.stroke();
    } else {
      c.fillStyle = '#ffffff';
      c.beginPath(); c.moveTo(-6.5, -10); c.lineTo(0, -4); c.lineTo(6.5, -10); c.closePath(); c.fill();
    }
    // tie
    if (p.tie) {
      c.fillStyle = p.tie;
      c.beginPath(); c.moveTo(0, -5); c.lineTo(-2.6, -1.5); c.lineTo(0, 8); c.lineTo(2.6, -1.5); c.closePath(); c.fill();
    }
    // ID card on lanyard
    if (p.badge) {
      c.strokeStyle = p.badge; c.lineWidth = 1.2;
      c.beginPath(); c.moveTo(-5, -9); c.lineTo(-6, 2); c.moveTo(5, -9); c.lineTo(-4, 2); c.stroke();
      c.fillStyle = '#fff'; rr(c, -9, 1, 7, 8, 1.5); c.fill();
      c.fillStyle = p.badge; c.fillRect(-8, 2.5, 5, 1.8);
    }
    // papers or phone
    if (p.papers) {
      c.fillStyle = '#f5f5f0';
      for (let i = 0; i < 4; i++) { rr(c, -10 + i * 0.6, -3 - i * 3, 20, 5, 1); c.fill(); c.strokeStyle = 'rgba(0,0,0,.12)'; c.lineWidth = 0.8; c.stroke(); }
    }
    if (p.phone) {
      c.fillStyle = '#0f172a'; rr(c, 12, 2 - lg * 0.6, 6, 10, 1.5); c.fill();
      c.fillStyle = '#5ad1ff'; c.fillRect(13, 3.5 - lg * 0.6, 4, 6);
    }
    // head
    c.fillStyle = p.skin;
    circle(c, -10, -19, 2.6); c.fill();
    circle(c, 10, -19, 2.6); c.fill();
    circle(c, 0, -20, 10.5); c.fill();
    // hair
    c.fillStyle = p.hair || '#1a1a1a';
    c.beginPath(); c.arc(0, -21, 10.8, Math.PI * 1.02, Math.PI * 1.98); c.closePath(); c.fill();
    if (p.cap) { c.fillStyle = p.cap; rr(c, -11, -32, 22, 8, 4); c.fill(); }
    // face
    const lx = clamp(p.lookX || 0, -1, 1) * 1.3;
    const ly = clamp(p.lookY || 0, -1, 1) * 1;
    c.fillStyle = '#fff';
    c.beginPath(); c.ellipse(-3.9, -19, 2.7, 3, 0, 0, TAU); c.ellipse(3.9, -19, 2.7, 3, 0, 0, TAU); c.fill();
    c.fillStyle = '#111';
    circle(c, -3.9 + lx, -18.7 + ly, 1.4); c.fill();
    circle(c, 3.9 + lx, -18.7 + ly, 1.4); c.fill();
    c.strokeStyle = '#2a1608'; c.lineWidth = 1.5; c.lineCap = 'round';
    c.beginPath();
    if (p.mood === 'angry') {
      c.moveTo(-7, -24.5); c.lineTo(-1.5, -22.3); c.moveTo(7, -24.5); c.lineTo(1.5, -22.3);
      c.moveTo(-3.5, -13); c.lineTo(3.5, -13);
    } else if (p.mood === 'worried') {
      c.moveTo(-7, -22.5); c.lineTo(-1.8, -24.3); c.moveTo(7, -22.5); c.lineTo(1.8, -24.3);
      c.stroke(); c.beginPath(); c.fillStyle = '#3b1d0c'; c.ellipse(0, -13.2, 2, 2.4, 0, 0, TAU); c.fill();
      c.beginPath();
    } else if (p.mood === 'cool') {
      c.stroke();
      c.fillStyle = '#0f172a';
      rr(c, -8, -21.5, 7, 4, 1.5); c.fill(); rr(c, 1, -21.5, 7, 4, 1.5); c.fill();
      c.fillRect(-1, -20.5, 2, 1.2);
      c.beginPath(); c.arc(0, -15.5, 3.6, 0.15 * Math.PI, 0.85 * Math.PI);
    } else {
      c.arc(0, -15.8, 3.8, 0.15 * Math.PI, 0.85 * Math.PI);
    }
    c.stroke();
    c.restore();
  }

  const SPRITES = {
    player(c, t, o = {}) {
      drawPerson(c, {
        shirt: '#00a35f', skin: '#8d5524', hair: '#141414', tie: COLORS.gold, badge: '#ffffff',
        pants: '#24314f', walk: o.walk || t * 10, mood: o.mood || 'happy', lookX: o.lookX, lookY: o.lookY, s: o.s || 1,
      });
    },
    boss(c, t, o = {}) {
      drawPerson(c, {
        shirt: '#2b3245', sleeve: '#2b3245', suit: true, skin: '#6b3f1f', hair: '#0e0e0e', tie: '#d62f3a',
        pants: '#1b2131', walk: t * 9, mood: 'angry', phone: true, lookX: o.lookX, lookY: o.lookY, s: o.s || 1.28,
      });
    },
    colleague(c, t, o = {}) {
      drawPerson(c, {
        shirt: '#7a5af8', skin: '#a0663a', hair: '#2b1a10', pants: '#2d2f3e', walk: t * 8, mood: 'happy', papers: true, s: o.s || 1,
      });
    },
    file(c, t) {
      c.fillStyle = '#c98f2e';
      rr(c, -15, -12, 12, 6, 2); c.fill();
      c.fillStyle = '#e9b44c';
      rr(c, -15, -9, 30, 21, 3); c.fill();
      c.fillStyle = '#fff';
      c.fillRect(-12, -11, 24, 4);
      c.fillStyle = 'rgba(0,0,0,.15)';
      c.fillRect(-15, -1, 30, 1.5);
    },
    task(c) {
      c.fillStyle = '#ffffff';
      rr(c, -13, -16, 26, 32, 3); c.fill();
      c.fillStyle = '#cbd2e0';
      for (let i = 0; i < 4; i++) c.fillRect(-9, -11 + i * 5, i === 3 ? 10 : 18, 2);
      c.save(); c.rotate(-0.28);
      c.strokeStyle = COLORS.red; c.lineWidth = 2;
      rr(c, -15, 4, 30, 11, 2); c.stroke();
      c.fillStyle = COLORS.red;
      c.font = '900 8px system-ui, Arial, sans-serif';
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('URGENT', 0, 9.8);
      c.restore();
    },
    meeting(c, t) {
      c.fillStyle = 'rgba(0,0,0,.25)';
      rr(c, -41, -14, 84, 32, 9); c.fill();
      c.fillStyle = '#ffffff';
      rr(c, -42, -16, 84, 32, 9); c.fill();
      // calendar icon
      c.fillStyle = '#fff'; rr(c, -37, -10, 18, 19, 3); c.fill();
      c.strokeStyle = '#d0d5e0'; c.lineWidth = 1; c.stroke();
      c.fillStyle = COLORS.red; rr(c, -37, -10, 18, 6, 3); c.fill(); c.fillRect(-37, -6, 18, 2);
      c.fillStyle = COLORS.ink;
      c.font = '900 9px system-ui, Arial, sans-serif';
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('9', -28, 3);
      c.textAlign = 'left';
      c.font = '800 8.5px system-ui, Arial, sans-serif';
      c.fillText('Quick meeting?', -15, -4, 54);
      c.fillStyle = '#6b7590';
      c.font = '600 7px system-ui, Arial, sans-serif';
      c.fillText('Starts now, 3hrs', -15, 6, 54);
    },
    deadline(c, t) {
      const sh = Math.sin(t * 40) * 0.12;
      c.save(); c.rotate(sh);
      c.fillStyle = '#b91c1c';
      circle(c, -9, -12, 5); c.fill(); circle(c, 9, -12, 5); c.fill();
      c.fillStyle = COLORS.red;
      circle(c, 0, 0, 15); c.fill();
      c.fillStyle = '#fff';
      circle(c, 0, 0, 11); c.fill();
      c.strokeStyle = COLORS.ink; c.lineWidth = 2; c.lineCap = 'round';
      c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -8); c.moveTo(0, 0); c.lineTo(5, 3); c.stroke();
      c.fillStyle = '#7f1d1d';
      c.fillRect(-8, 13, 3, 4); c.fillRect(5, 13, 3, 4);
      c.restore();
    },
    network(c, t) {
      const pulse = (Math.sin(t * 6) + 1) / 2;
      c.strokeStyle = `rgba(229,72,77,${0.25 + pulse * 0.35})`;
      c.lineWidth = 2;
      circle(c, 0, 0, 19 + pulse * 3); c.stroke();
      c.fillStyle = '#1f2937';
      circle(c, 0, 0, 16); c.fill();
      c.strokeStyle = '#6b7280'; c.lineWidth = 2.4; c.lineCap = 'round';
      for (let i = 1; i <= 3; i++) { c.beginPath(); c.arc(0, 7, i * 4.2, Math.PI * 1.25, Math.PI * 1.75); c.stroke(); }
      c.fillStyle = '#6b7280'; circle(c, 0, 7, 1.8); c.fill();
      c.strokeStyle = COLORS.red; c.lineWidth = 3;
      c.beginPath(); c.moveTo(4, -2); c.lineTo(12, 6); c.moveTo(12, -2); c.lineTo(4, 6); c.stroke();
    },
    printer(c, t) {
      c.fillStyle = 'rgba(0,0,0,.3)';
      c.beginPath(); c.ellipse(0, 22, 28, 6, 0, 0, TAU); c.fill();
      c.fillStyle = '#ffffff';
      c.save(); c.translate(0, -14 + Math.sin(t * 14) * 1.5);
      rr(c, -14, -10, 28, 12, 1); c.fill();
      c.restore();
      c.fillStyle = '#c6ccd8';
      rr(c, -27, -14, 54, 18, 5); c.fill();
      c.fillStyle = '#e4e8ef';
      rr(c, -27, -2, 54, 22, 5); c.fill();
      c.fillStyle = '#8f98aa';
      rr(c, -18, 6, 36, 5, 2); c.fill();
      c.fillStyle = Math.sin(t * 10) > 0 ? COLORS.red : '#7f1d1d';
      circle(c, 20, -6, 2.6); c.fill();
      c.fillStyle = COLORS.ink;
      c.font = '900 7px system-ui, Arial, sans-serif';
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('PAPER JAM', -3, -7);
    },
    salary(c, t) {
      c.save(); c.rotate(Math.sin(t * 3) * 0.12);
      c.fillStyle = '#0d7a45';
      rr(c, -18, -11, 36, 22, 3); c.fill();
      c.strokeStyle = COLORS.gold; c.lineWidth = 2;
      rr(c, -15, -8, 30, 16, 2); c.stroke();
      c.fillStyle = '#fff';
      c.font = '900 13px system-ui, Arial, sans-serif';
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('₦', 0, 1);
      c.fillStyle = COLORS.gold;
      circle(c, -11, 0, 2); c.fill(); circle(c, 11, 0, 2); c.fill();
      c.restore();
    },
    lunch(c, t) {
      c.fillStyle = '#f6f6f2';
      c.beginPath(); c.moveTo(-15, -2); c.lineTo(15, -2); c.lineTo(12, 12); c.lineTo(-12, 12); c.closePath(); c.fill();
      c.strokeStyle = '#d9d9d0'; c.lineWidth = 1; c.stroke();
      // jollof
      c.fillStyle = '#e2571e';
      c.beginPath(); c.ellipse(0, -3, 14, 5, 0, Math.PI, 0); c.fill();
      c.fillStyle = '#f08a3e';
      for (let i = 0; i < 6; i++) { circle(c, -9 + i * 3.6, -4 - (i % 2) * 2, 1.4); c.fill(); }
      // plantain + chicken
      c.fillStyle = '#f2c14e'; c.beginPath(); c.ellipse(-6, -6, 4, 2, -0.4, 0, TAU); c.fill();
      c.fillStyle = '#9a4f1f'; c.beginPath(); c.ellipse(6, -7, 4, 3, 0.3, 0, TAU); c.fill();
      // lid
      c.fillStyle = '#ffffff';
      c.save(); c.translate(0, -8); c.rotate(-0.15);
      c.beginPath(); c.moveTo(-15, 0); c.lineTo(15, 0); c.lineTo(12, -9); c.lineTo(-12, -9); c.closePath(); c.fill();
      c.strokeStyle = '#d9d9d0'; c.stroke();
      c.restore();
    },
    data(c, t) {
      c.fillStyle = '#0f172a';
      rr(c, -10, -16, 20, 32, 4); c.fill();
      c.fillStyle = '#1d4ed8';
      rr(c, -8, -13, 16, 24, 2); c.fill();
      c.fillStyle = '#fff';
      for (let i = 0; i < 4; i++) c.fillRect(-6 + i * 3.4, -4 - i * 2.5, 2.4, 3 + i * 2.5);
      c.font = '900 7px system-ui, Arial, sans-serif';
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('2GB', 0, 6);
      c.fillStyle = '#334155'; c.fillRect(-3, 13, 6, 1.5);
    },
    leave(c, t) {
      c.fillStyle = '#e8f8ef';
      rr(c, -13, -16, 26, 32, 3); c.fill();
      c.strokeStyle = COLORS.green; c.lineWidth = 2; c.stroke();
      c.fillStyle = COLORS.green;
      c.font = '900 7px system-ui, Arial, sans-serif';
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('LEAVE', 0, -9);
      c.strokeStyle = COLORS.green; c.lineWidth = 3.2; c.lineCap = 'round'; c.lineJoin = 'round';
      c.beginPath(); c.moveTo(-6, 3); c.lineTo(-1, 8); c.lineTo(7, -2); c.stroke();
    },
    fuel(c, t) {
      c.fillStyle = '#f2c14e';
      rr(c, -12, -10, 24, 26, 4); c.fill();
      c.fillStyle = '#d39b16';
      rr(c, -8, -16, 12, 7, 3); c.fill();
      c.fillStyle = '#f2c14e'; rr(c, -5, -14, 6, 4, 2); c.fill();
      c.fillStyle = '#9b6b00'; rr(c, 6, -16, 5, 8, 2); c.fill();
      c.strokeStyle = '#d39b16'; c.lineWidth = 1.6;
      c.beginPath(); c.moveTo(-8, -4); c.lineTo(8, 12); c.moveTo(8, -4); c.lineTo(-8, 12); c.stroke();
    },
    friday(c, t) {
      c.save(); c.rotate(t * 1.6);
      c.fillStyle = '#ffd23f';
      c.beginPath();
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * TAU - Math.PI / 2;
        const r = i % 2 ? 8.5 : 19;
        c.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      c.closePath(); c.fill();
      c.strokeStyle = '#f59e0b'; c.lineWidth = 1.5; c.stroke();
      c.restore();
      c.fillStyle = COLORS.ink;
      c.font = '900 7.5px system-ui, Arial, sans-serif';
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('TGIF', 0, 1);
    },
  };

  /* ==================== DOM ==================== */
  const canvas = $('game');
  const ctx = canvas.getContext('2d');
  const ui = {
    hud: $('hud'), score: $('hud-score'), time: $('hud-time'), level: $('hud-level'), lives: $('hud-lives'),
    best: $('hud-best'), streak: $('hud-streak'), puLeave: $('pu-leave'), puFuel: $('pu-fuel'),
    toast: $('toast'), banner: $('banner'),
    screens: { menu: $('screen-menu'), pause: $('screen-pause'), over: $('screen-over'), board: $('screen-board') },
    menuBest: $('menu-best'), fridayNote: $('friday-note'),
    overScore: $('over-score'), overTime: $('over-time'), overLevel: $('over-level'), overBest: $('over-best'),
    overItems: $('over-items'), overNear: $('over-near'), overStreak: $('over-streak'), overMsg: $('over-message'), overStamp: $('over-stamp'),
    lbForm: $('lb-form'), lbName: $('lb-name'), lbSubmit: $('lb-submit'), lbStatus: $('lb-status'),
    boardList: $('board-list'), boardStatus: $('board-status'),
    muteHud: $('btn-mute-hud'), muteMenu: $('btn-mute-menu'),
  };

  /* ==================== World / sizing ==================== */
  let W = 360, H = 720, scale = 1, dpr = 1;
  let FX0 = 0, FX1 = 360;                 // corridor (playfield) extents
  const MAX_CORRIDOR = 820;

  function resize() {
    const cw = Math.max(1, window.innerWidth);
    const ch = Math.max(1, window.innerHeight);
    dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    scale = Math.min(ch / 720, cw / 360);
    W = cw / scale;
    H = ch / scale;
    const cwid = Math.min(W, MAX_CORRIDOR);
    FX0 = (W - cwid) / 2;
    FX1 = FX0 + cwid;
    canvas.width = Math.round(cw * dpr);
    canvas.height = Math.round(ch * dpr);
    canvas.style.width = cw + 'px';
    canvas.style.height = ch + 'px';
    if (G && G.player) {
      const p = G.player;
      p.x = clamp(p.x, minX(), maxX()); p.y = clamp(p.y, minY(), maxY());
      p.tx = p.x; p.ty = p.y;
    }
  }
  const HUD_SPACE = 70;
  const minX = () => FX0 + 20;
  const maxX = () => FX1 - 20;
  const minY = () => Math.max(HUD_SPACE + 30, H * 0.3);
  const maxY = () => H - 34;

  /* ==================== Game state ==================== */
  const G = {
    state: 'menu',
    best: parseInt(store.get('ow_best', '0'), 10) || 0,
    t: 0,
    player: null,
  };

  function newRound() {
    G.time = 0;
    G.scoreF = 0;
    G.level = 1;
    G.lives = CONFIG.START_LIVES;
    G.streak = 0;
    G.maxStreak = 0;
    G.collected = 0;
    G.nearMisses = 0;
    G.spawnT = DIFFICULTY.graceSeconds;
    G.itemT = 1.2;
    G.bossT = rand(DIFFICULTY.bossEvery[0], DIFFICULTY.bossEvery[1]);
    G.msgT = rand(7, 12);
    G.scroll = 0;
    G.shake = 0;
    G.flash = 0;
    G.dyingT = 0;
    G.obstacles = [];
    G.items = [];
    G.particles = [];
    G.floaters = [];
    G.bestAtStart = G.best;
    G.beatBest = false;
    G.lastMsg = '';
    G.player = {
      x: (FX0 + FX1) / 2, y: H * 0.78, vx: 0, vy: 0, tx: 0, ty: 0, r: 15,
      invuln: 0, leave: 0, fuel: 0, walk: 0,
    };
    G.player.tx = G.player.x; G.player.ty = G.player.y;
    G.hudCache = {};
    G.submitted = false;
  }

  const levelMult = () => Math.min(DIFFICULTY.speedMax, 1 + DIFFICULTY.speedPerLevel * (G.level - 1));
  const streakMult = () => 1 + Math.min(4, Math.floor(G.streak / 5)) * 0.5;

  /* ==================== Input ==================== */
  const keys = new Set();
  const KEYMAP = {
    ArrowLeft: 'L', KeyA: 'L', ArrowRight: 'R', KeyD: 'R',
    ArrowUp: 'U', KeyW: 'U', ArrowDown: 'D', KeyS: 'D',
  };
  const drag = { active: false, id: null, lx: 0, ly: 0, used: false };

  function isTyping(e) {
    const tg = e.target;
    return tg && (tg.tagName === 'INPUT' || tg.tagName === 'TEXTAREA' || tg.isContentEditable);
  }

  window.addEventListener('keydown', (e) => {
    if (isTyping(e)) return;
    const dir = KEYMAP[e.code];
    if (dir) {
      if (G.state === 'playing') { keys.add(dir); drag.used = false; e.preventDefault(); }
      return;
    }
    const onButton = e.target && (e.target.tagName === 'BUTTON' || e.target.tagName === 'SUMMARY');
    if (e.code === 'Space') {
      if (onButton && G.state !== 'playing') return; // let the button handle it
      if (G.state === 'playing' || G.state === 'paused') {
        e.preventDefault();
        if (e.repeat) return;
        G.state === 'playing' ? pauseGame() : resumeGame();
      }
    } else if (e.code === 'Enter' || e.code === 'NumpadEnter') {
      if (onButton || e.repeat) return;
      if (G.state === 'menu' || G.state === 'over') { e.preventDefault(); startGame(); }
      else if (G.state === 'paused') { e.preventDefault(); resumeGame(); }
      else if (G.state === 'board') { e.preventDefault(); closeBoard(); }
    } else if (e.code === 'Escape' || e.code === 'KeyP') {
      if (G.state === 'playing') pauseGame();
      else if (G.state === 'paused') resumeGame();
      else if (G.state === 'board') closeBoard();
    } else if (e.code === 'KeyM') {
      toggleMute();
    }
  });
  window.addEventListener('keyup', (e) => { const d = KEYMAP[e.code]; if (d) keys.delete(d); });

  canvas.addEventListener('pointerdown', (e) => {
    if (G.state !== 'playing') return;
    e.preventDefault();
    drag.active = true; drag.id = e.pointerId; drag.lx = e.clientX; drag.ly = e.clientY; drag.used = true;
    if (G.player) { G.player.tx = G.player.x; G.player.ty = G.player.y; }
    try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drag.active || e.pointerId !== drag.id || !G.player) return;
    e.preventDefault();
    const sens = e.pointerType === 'mouse' ? 1 : 1.35;
    const p = G.player;
    p.tx = clamp(p.tx + ((e.clientX - drag.lx) / scale) * sens, minX(), maxX());
    p.ty = clamp(p.ty + ((e.clientY - drag.ly) / scale) * sens, minY(), maxY());
    drag.lx = e.clientX; drag.ly = e.clientY;
  });
  const endDrag = (e) => { if (e.pointerId === drag.id) { drag.active = false; drag.id = null; } };
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  // Block page scroll / pinch while playing.
  document.addEventListener('touchmove', (e) => {
    if ((G.state === 'playing' || G.state === 'dying') && e.cancelable) e.preventDefault();
  }, { passive: false });

  document.addEventListener('visibilitychange', () => { if (document.hidden && G.state === 'playing') pauseGame(); });
  window.addEventListener('blur', () => { keys.clear(); if (G.state === 'playing') pauseGame(); });
  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', () => setTimeout(resize, 120));

  /* ==================== UI: toast / banner / HUD ==================== */
  let toastTimer = 0;
  function toast(text, kind = 'info', ms = 2200) {
    ui.toast.textContent = text;
    ui.toast.className = 'toast is-on is-' + kind;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { ui.toast.className = 'toast'; }, ms);
  }
  let bannerTimer = 0;
  function banner(text, warn = false) {
    ui.banner.textContent = text;
    ui.banner.className = 'banner';
    void ui.banner.offsetWidth; // restart animation
    ui.banner.className = 'banner is-on' + (warn ? ' is-warn' : '');
    clearTimeout(bannerTimer);
    bannerTimer = setTimeout(() => { ui.banner.className = 'banner'; }, 1550);
  }
  function clearOverlays() {
    clearTimeout(toastTimer); clearTimeout(bannerTimer);
    ui.toast.className = 'toast'; ui.banner.className = 'banner';
  }

  const HEART = (on) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.3 3 4.5 6.8 4.5c2.1 0 3.6 1.1 5.2 3 1.6-1.9 3.1-3 5.2-3 3.8 0 5.9 3.8 4.4 7.3C19.5 16.4 12 21 12 21z" fill="${on ? '#e5484d' : 'rgba(255,255,255,.16)'}"/></svg>`;

  function updateHud(force) {
    const c = G.hudCache;
    const score = Math.floor(G.scoreF);
    if (force || c.score !== score) { ui.score.textContent = fmtNum(score); c.score = score; }
    const ts = Math.floor(G.time);
    if (force || c.time !== ts) { ui.time.textContent = fmtTime(ts); c.time = ts; }
    if (force || c.level !== G.level) { ui.level.textContent = G.level; c.level = G.level; }
    if (force || c.lives !== G.lives) {
      const slots = Math.min(CONFIG.MAX_LIVES, Math.max(CONFIG.START_LIVES, G.lives));
      let html = '';
      for (let i = 0; i < slots; i++) html += HEART(i < G.lives);
      if (G.lives > slots) html += '<span>+' + (G.lives - slots) + '</span>';
      ui.lives.innerHTML = html;
      ui.lives.setAttribute('aria-label', 'Lives: ' + G.lives);
      c.lives = G.lives;
    }
    const beat = score > G.bestAtStart && G.bestAtStart > 0;
    const bestShown = Math.max(G.bestAtStart, score);
    if (force || c.best !== bestShown || c.beat !== beat) {
      ui.best.textContent = beat ? 'New best! ' + fmtNum(bestShown) : 'Best ' + fmtNum(bestShown);
      ui.best.classList.toggle('is-beaten', beat);
      c.best = bestShown; c.beat = beat;
    }
    const mult = streakMult();
    const sk = G.streak >= 2 ? G.streak + '|' + mult : '';
    if (force || c.streak !== sk) {
      ui.streak.hidden = !sk;
      if (sk) ui.streak.textContent = 'Streak ' + G.streak + (mult > 1 ? ' · x' + mult : '');
      c.streak = sk;
    }
    const p = G.player;
    setPU(ui.puLeave, p.leave, ITEMS.leave.dur, 'leave');
    setPU(ui.puFuel, p.fuel, ITEMS.fuel.dur, 'fuel');
  }
  function setPU(el, val, dur, key) {
    const c = G.hudCache;
    const on = val > 0;
    if (c['pu_' + key] !== on) { el.hidden = !on; c['pu_' + key] = on; }
    if (on) el.lastElementChild.style.width = clamp((val / dur) * 100, 0, 100).toFixed(1) + '%';
  }

  /* ==================== Screens & flow ==================== */
  function showScreen(name) {
    for (const [k, el] of Object.entries(ui.screens)) el.classList.toggle('is-active', k === name);
    ui.hud.hidden = !(name === null || name === 'pause');
    if (name) {
      const el = ui.screens[name];
      const focusEl = el.querySelector('.btn-primary');
      if (focusEl) setTimeout(() => { try { focusEl.focus({ preventScroll: true }); } catch (e) { focusEl.focus(); } }, 30);
    }
  }

  function startGame() {
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    resize();
    newRound();
    keys.clear();
    drag.active = false;
    clearOverlays();
    G.state = 'playing';
    showScreen(null);
    updateHud(true);
    if (!Sound.muted) Sound.setMuted(false); // create/resume audio inside the user gesture
    Sound.play('start');
    const coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    toast(coarse ? 'Drag anywhere to move. Clock in!' : 'Arrow keys or WASD to move. Clock in!', 'info', 2400);
    lastFrame = performance.now();
  }

  function pauseGame() {
    if (G.state !== 'playing') return;
    G.state = 'paused';
    keys.clear();
    drag.active = false;
    showScreen('pause');
  }

  function resumeGame() {
    if (G.state !== 'paused') return;
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    G.state = 'playing';
    showScreen(null);
    lastFrame = performance.now();
  }

  function toMenu() {
    G.state = 'menu';
    keys.clear();
    clearOverlays();
    ui.menuBest.textContent = fmtNum(G.best);
    showScreen('menu');
  }

  function die() {
    G.state = 'dying';
    G.dyingT = 0.9;
    keys.clear();
    drag.active = false;
  }

  function gameOver() {
    G.state = 'over';
    const score = Math.floor(G.scoreF);
    const isBest = score > G.bestAtStart;
    if (score > G.best) { G.best = score; store.set('ow_best', score); }
    clearOverlays();
    ui.overScore.textContent = fmtNum(score);
    ui.overTime.textContent = fmtTime(G.time);
    ui.overLevel.textContent = G.level;
    ui.overBest.textContent = fmtNum(G.best);
    ui.overItems.textContent = G.collected;
    ui.overStreak.textContent = G.maxStreak;
    ui.overNear.textContent = G.nearMisses;
    const tier = MESSAGES.over.find((m) => score <= m.max) || MESSAGES.over[MESSAGES.over.length - 1];
    const beatOld = isBest && G.bestAtStart > 0;
    ui.overMsg.textContent = beatOld ? MESSAGES.newBest + ' ' + tier.text : tier.text;
    ui.overStamp.textContent = beatOld ? 'New best' : G.bestAtStart === 0 ? 'First shift' : 'Shift over';
    ui.overStamp.classList.toggle('is-best', beatOld);
    // restart stamp animation
    ui.overStamp.style.animation = 'none'; void ui.overStamp.offsetWidth; ui.overStamp.style.animation = '';
    ui.menuBest.textContent = fmtNum(G.best);
    if (LB.enabled) {
      ui.lbForm.hidden = score <= 0;
      ui.lbStatus.textContent = '';
      ui.lbStatus.className = 'lb-status';
      ui.lbSubmit.disabled = false;
      ui.lbName.value = store.get('ow_name', '');
    }
    Sound.play('over');
    showScreen('over');
  }

  /* ==================== Spawning ==================== */
  function spawnInterval() {
    const base = Math.max(DIFFICULTY.spawnMin, DIFFICULTY.spawnBase * Math.pow(DIFFICULTY.spawnDecay, G.level - 1));
    const widthFactor = clamp(520 / (FX1 - FX0), 0.6, 1.15);
    return base * widthFactor;
  }

  function spawnObstacle() {
    const options = Object.entries(OBSTACLES).filter(([, d]) => G.level >= d.unlock).map(([k, d]) => [k, d.weight]);
    const type = weighted(options);
    const d = OBSTACLES[type];
    const m = levelMult();
    const sp = rand(d.speed[0], d.speed[1]) * m;
    const o = { type, t: 0, rot: rand(-0.4, 0.4), vr: rand(-2.5, 2.5), minD: Infinity, warn: 0, phase: 'move', life: 0 };
    if (type === 'printer') {
      const fromLeft = Math.random() < 0.5;
      o.w = d.w; o.h = d.h;
      o.y = clamp(G.player.y + rand(-70, 70), minY(), maxY());
      o.x = fromLeft ? FX0 - 40 : FX1 + 40;
      o.vx = fromLeft ? sp : -sp; o.vy = 0;
      o.warn = 0.85; o.side = fromLeft ? 'L' : 'R';
      o.rot = 0; o.vr = 0;
    } else if (type === 'colleague') {
      const fromLeft = Math.random() < 0.5;
      o.r = d.r; o.hr = d.r * 0.8;
      o.x = fromLeft ? FX0 - 30 : FX1 + 30;
      o.y = rand(minY() - 60, minY() + 60);
      o.speed = sp; o.vx = fromLeft ? sp : -sp; o.vy = 0;
      o.warn = 0.85; o.side = fromLeft ? 'L' : 'R';
      o.life = 6.5; o.rot = 0; o.vr = 0;
      o.talk = pick(MESSAGES.colleagueTalk);
    } else {
      o.r = d.r; o.hr = d.r * 0.82;
      o.x = rand(FX0 + d.r + 6, FX1 - d.r - 6);
      o.y = -d.r - 20;
      o.vx = 0; o.vy = sp;
      if (type === 'meeting') { o.baseX = clamp(o.x, FX0 + 50, FX1 - 50); o.phaseOff = rand(0, TAU); o.rot = 0; o.vr = 0; }
      if (type === 'deadline') { o.vx = (Math.random() < 0.5 ? -1 : 1) * rand(60, 110) * m; o.rot = 0; o.vr = 0; }
      if (type === 'network') { o.rot = 0; o.vr = 0; }
      if (type === 'task') { o.vr *= 0.4; }
    }
    G.obstacles.push(o);
  }

  function spawnBoss() {
    if (G.obstacles.some((o) => o.type === 'boss')) return;
    const p = G.player;
    const sides = ['L', 'R', 'T'];
    const side = pick(sides);
    const o = { type: 'boss', side, phase: 'warn', warn: 1.6, t: 0, r: 22, hr: 19, minD: Infinity, vx: 0, vy: 0, talkT: 0, talk: pick(MESSAGES.bossTalk) };
    if (side === 'L') { o.x = FX0 - 40; o.y = clamp(p.y, minY(), maxY()); }
    else if (side === 'R') { o.x = FX1 + 40; o.y = clamp(p.y, minY(), maxY()); }
    else { o.x = clamp(p.x, FX0 + 40, FX1 - 40); o.y = -40; }
    o.speed = Math.min(CONFIG.PLAYER_SPEED * 0.9, CONFIG.PLAYER_SPEED * (0.7 + 0.02 * G.level));
    o.chase = 5.5 + Math.min(4, G.level * 0.25);
    G.obstacles.push(o);
    banner('Oga is coming!', true);
    Sound.play('warn');
  }

  function spawnItem() {
    const options = Object.entries(ITEMS)
      .filter(([, d]) => !d.unlock || G.level >= d.unlock)
      .map(([k, d]) => [k, k === 'friday' && IS_FRIDAY ? d.weight * 2 : d.weight]);
    const type = weighted(options);
    const r = 15;
    G.items.push({
      type, r,
      x: rand(FX0 + r + 10, FX1 - r - 10), y: -r - 20,
      vy: rand(120, 165) * (0.85 + 0.15 * levelMult()),
      t: rand(0, 3), wob: rand(0, TAU),
    });
  }

  /* ==================== Effects ==================== */
  function burst(x, y, color, n = 14, speed = 160, text) {
    for (let i = 0; i < n; i++) {
      if (G.particles.length > 320) G.particles.shift();
      const a = rand(0, TAU), s = rand(speed * 0.3, speed);
      G.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 40, life: rand(0.4, 0.8), max: 0.8, color, size: rand(2, 4.5), text: text && i % 4 === 0 ? text : null });
    }
  }
  function floater(text, x, y, color = '#fff', size = 15) {
    if (G.floaters.length > 40) G.floaters.shift();
    G.floaters.push({ text, x: clamp(x, FX0 + 50, FX1 - 50), y, life: 1.1, max: 1.1, color, size });
  }

  /* ==================== Update ==================== */
  function updatePlayer(dt) {
    const p = G.player;
    let ax = 0, ay = 0;
    if (keys.has('L')) ax -= 1;
    if (keys.has('R')) ax += 1;
    if (keys.has('U')) ay -= 1;
    if (keys.has('D')) ay += 1;
    const spd = CONFIG.PLAYER_SPEED * (p.fuel > 0 ? 1.45 : 1);
    if (ax || ay) {
      const len = Math.hypot(ax, ay);
      const tvx = (ax / len) * spd, tvy = (ay / len) * spd;
      const k = Math.min(1, dt * 16);
      p.vx += (tvx - p.vx) * k; p.vy += (tvy - p.vy) * k;
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.tx = p.x; p.ty = p.y;
    } else if (drag.used) {
      const dx = p.tx - p.x, dy = p.ty - p.y;
      const dist = Math.hypot(dx, dy);
      const maxStep = spd * 2.4 * dt;
      if (dist > 0.01) {
        const step = Math.min(dist, maxStep);
        p.vx = (dx / dist) * step / dt; p.vy = (dy / dist) * step / dt;
        p.x += (dx / dist) * step; p.y += (dy / dist) * step;
      } else { p.vx = 0; p.vy = 0; }
    } else {
      const k = Math.min(1, dt * 12);
      p.vx -= p.vx * k; p.vy -= p.vy * k;
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.tx = p.x; p.ty = p.y;
    }
    p.x = clamp(p.x, minX(), maxX());
    p.y = clamp(p.y, minY(), maxY());
    const moving = Math.hypot(p.vx, p.vy);
    p.walk += dt * (moving > 20 ? 12 : 0);
    if (p.fuel > 0 && moving > 40 && Math.random() < 0.6) {
      G.particles.push({ x: p.x + rand(-6, 6), y: p.y + 20, vx: rand(-20, 20), vy: rand(20, 60), life: 0.35, max: 0.35, color: '#ffd34d', size: rand(2, 4) });
    }
    p.invuln = Math.max(0, p.invuln - dt);
    p.leave = Math.max(0, p.leave - dt);
    p.fuel = Math.max(0, p.fuel - dt);
  }

  function hurt(o) {
    const p = G.player;
    const dmg = o.type === 'boss' ? 2 : 1;
    G.lives = Math.max(0, G.lives - dmg);
    G.streak = 0;
    p.invuln = 1.6;
    G.shake = o.type === 'boss' ? 18 : 11;
    G.flash = 0.25;
    burst(p.x, p.y, COLORS.red, 18, 200);
    floater(dmg > 1 ? '-2 lives' : '-1 life', p.x, p.y - 40, '#ff8a8e', 16);
    toast(MESSAGES.hit[o.type] || 'Wahala!', 'bad', 1800);
    Sound.play('hit');
    if (navigator.vibrate) { try { navigator.vibrate(o.type === 'boss' ? [60, 40, 90] : 60); } catch (e) { /* ignore */ } }
    if (G.lives <= 0) die();
  }

  function addScore(pts) { G.scoreF = Math.max(0, G.scoreF + pts); }

  function bonk(o) {
    // Player is on leave: obstacles bounce off.
    addScore(25);
    burst(o.x, o.y, COLORS.greenBright, 10, 160);
    floater('+25 On leave!', o.x, o.y - 20, '#7df0b5', 13);
    Sound.play('near');
  }

  function collidesCircle(o, p) {
    const dx = o.x - p.x, dy = o.y - p.y;
    const rr2 = o.hr + p.r * 0.85;
    const d = Math.hypot(dx, dy);
    o.minD = Math.min(o.minD, d - rr2);
    return d < rr2;
  }
  function collidesRect(o, p) {
    const hw = o.w * 0.42, hh = o.h * 0.4;
    const cx = clamp(p.x, o.x - hw, o.x + hw);
    const cy = clamp(p.y, o.y - hh, o.y + hh);
    const d = Math.hypot(p.x - cx, p.y - cy);
    o.minD = Math.min(o.minD, d - p.r * 0.85);
    return d < p.r * 0.85;
  }

  function updateObstacles(dt) {
    const p = G.player;
    const list = G.obstacles;
    for (let i = list.length - 1; i >= 0; i--) {
      const o = list[i];
      o.t += dt;
      let remove = false;

      if (o.warn > 0) { o.warn -= dt; if (o.type !== 'boss') continue; }

      switch (o.type) {
        case 'meeting':
          o.y += o.vy * dt;
          o.x = clamp(o.baseX + Math.sin(o.t * 2.2 + o.phaseOff) * 38, FX0 + 42, FX1 - 42);
          break;
        case 'deadline':
          o.y += o.vy * dt; o.x += o.vx * dt;
          if (o.x < FX0 + o.r) { o.x = FX0 + o.r; o.vx = Math.abs(o.vx); }
          if (o.x > FX1 - o.r) { o.x = FX1 - o.r; o.vx = -Math.abs(o.vx); }
          break;
        case 'network':
          o.y += o.vy * dt;
          o.x += clamp(p.x - o.x, -1, 1) * 34 * dt;
          break;
        case 'printer':
          o.x += o.vx * dt;
          if ((o.vx > 0 && o.x > FX1 + 60) || (o.vx < 0 && o.x < FX0 - 60)) remove = true;
          break;
        case 'colleague': {
          o.life -= dt;
          if (o.life > 0) {
            const dx = p.x - o.x, dy = p.y - o.y;
            const d = Math.hypot(dx, dy) || 1;
            const k = Math.min(1, dt * 1.4);
            o.vx += ((dx / d) * o.speed - o.vx) * k;
            o.vy += ((dy / d) * o.speed - o.vy) * k;
          } else {
            o.vy += (o.speed * 1.6 - o.vy) * Math.min(1, dt * 2);
            o.vx *= 0.98;
          }
          o.x += o.vx * dt; o.y += o.vy * dt;
          if (o.life < 0 && (o.y > H + 50 || o.x < FX0 - 60 || o.x > FX1 + 60)) remove = true;
          if (o.life < -8) remove = true;
          break;
        }
        case 'boss': {
          if (o.phase === 'warn') {
            if (o.warn <= 0) {
              o.phase = 'chase';
              if (o.side === 'T') o.vy = o.speed; else o.vx = o.side === 'L' ? o.speed : -o.speed;
            }
            break;
          }
          o.talkT -= dt;
          if (o.talkT <= 0) { o.talk = pick(MESSAGES.bossTalk); o.talkT = 2.2; }
          if (o.phase === 'chase') {
            o.chase -= dt;
            const dx = p.x - o.x, dy = p.y - o.y;
            const d = Math.hypot(dx, dy) || 1;
            const k = Math.min(1, dt * 2.2);
            o.vx += ((dx / d) * o.speed - o.vx) * k;
            o.vy += ((dy / d) * o.speed - o.vy) * k;
            if (o.chase <= 0) o.phase = 'leave';
          } else if (o.phase === 'leave') {
            const dir = o.x < (FX0 + FX1) / 2 ? -1 : 1;
            o.vx += (dir * o.speed * 1.4 - o.vx) * Math.min(1, dt * 3);
            o.vy += (-o.speed * 0.3 - o.vy) * Math.min(1, dt * 3);
            if (o.x < FX0 - 70 || o.x > FX1 + 70 || o.y < -70) remove = true;
          }
          o.x += o.vx * dt; o.y += o.vy * dt;
          break;
        }
        default:
          o.y += o.vy * dt;
      }
      o.rot += (o.vr || 0) * dt;

      if (o.type !== 'printer' && o.type !== 'colleague' && o.type !== 'boss' && o.y > H + 50) remove = true;

      // collision
      const active = !(o.type === 'boss' && o.phase !== 'chase') && !o.hitDone;
      if (!remove && active && G.state === 'playing') {
        const hit = o.type === 'printer' ? collidesRect(o, p) : collidesCircle(o, p);
        if (hit) {
          if (p.leave > 0) {
            if (o.type === 'boss') {
              toast('Who approved this leave?!', 'good', 1800);
              addScore(50); floater('+50 Untouchable', o.x, o.y - 40, '#7df0b5', 15);
              o.phase = 'leave'; o.hitDone = true;
              burst(o.x, o.y, COLORS.greenBright, 16, 200);
            } else { bonk(o); remove = true; }
          } else if (p.invuln <= 0) {
            hurt(o);
            if (o.type === 'boss') { o.phase = 'leave'; o.hitDone = true; }
            else { burst(o.x, o.y, '#ffffff', 8, 120); remove = true; }
          }
        }
      }

      if (remove) {
        // near-miss reward
        if (!o.hitDone && o.minD < 18 && o.minD > -1 && G.state === 'playing' && p.invuln <= 0) {
          addScore(10);
          G.nearMisses++;
          floater('Close one! +10', p.x, p.y - 44, '#c7d2fe', 13);
          Sound.play('near');
        }
        list.splice(i, 1);
      }
    }
  }

  function updateItems(dt) {
    const p = G.player;
    for (let i = G.items.length - 1; i >= 0; i--) {
      const it = G.items[i];
      it.t += dt;
      it.y += it.vy * dt;
      it.x += Math.sin(it.t * 2 + it.wob) * 12 * dt;
      if (it.y > H + 40) { G.items.splice(i, 1); continue; }
      if (G.state !== 'playing') continue;
      if (Math.hypot(it.x - p.x, it.y - p.y) < it.r + p.r + 6) {
        G.items.splice(i, 1);
        collect(it);
      }
    }
  }

  function collect(it) {
    const d = ITEMS[it.type];
    const p = G.player;
    G.collected++;
    G.streak++;
    G.maxStreak = Math.max(G.maxStreak, G.streak);
    const mult = streakMult();
    if (d.pts) {
      const pts = Math.round(d.pts * mult);
      addScore(pts);
      floater('+' + pts + (mult > 1 ? ' (x' + mult + ')' : ''), it.x, it.y - 10, d.color, it.type === 'friday' ? 20 : 16);
    }
    if (d.power === 'leave') { p.leave = d.dur; p.invuln = 0; toast(d.label, 'good', 1800); Sound.play('power'); }
    else if (d.power === 'fuel') { p.fuel = d.dur; toast(d.label, 'good', 1600); Sound.play('power'); }
    else if (it.type === 'friday') {
      if (G.lives < CONFIG.MAX_LIVES) { G.lives++; floater('+1 life', p.x, p.y - 50, '#ff8a8e', 15); }
      toast('TGIF! Friday bonus +500', 'good', 1800);
      Sound.play('big');
    } else if (it.type === 'salary') {
      if (Math.random() < 0.45) toast('Salary has entered!', 'good', 1400);
      Sound.play('coin');
    } else Sound.play('coin');
    const money = it.type === 'salary' || it.type === 'lunch' || it.type === 'friday';
    burst(it.x, it.y, d.color, it.type === 'friday' ? 26 : 14, 170, money ? '₦' : null);
    if (G.streak > 0 && G.streak % 5 === 0) {
      const bonus = Math.min(250, 25 * (G.streak / 5));
      addScore(bonus);
      floater('Streak ' + G.streak + '! +' + bonus, p.x, p.y - 62, '#ffe066', 17);
      Sound.play('big');
    }
  }

  function updateParticles(dt) {
    for (let i = G.particles.length - 1; i >= 0; i--) {
      const q = G.particles[i];
      q.life -= dt;
      if (q.life <= 0) { G.particles.splice(i, 1); continue; }
      q.vy += 260 * dt;
      q.x += q.vx * dt; q.y += q.vy * dt;
    }
    for (let i = G.floaters.length - 1; i >= 0; i--) {
      const f = G.floaters[i];
      f.life -= dt;
      f.y -= 42 * dt;
      if (f.life <= 0) G.floaters.splice(i, 1);
    }
  }

  function step(dt) {
    G.t += dt;
    if (G.state === 'playing') {
      G.time += dt;
      const newLevel = 1 + Math.floor(G.time / CONFIG.LEVEL_SECONDS);
      if (newLevel > G.level) {
        G.level = newLevel;
        banner('Level ' + G.level);
        Sound.play('level');
        if (G.level === OBSTACLES.deadline.unlock) setTimeout(() => G.state === 'playing' && toast('Deadlines incoming. Shift!', 'info'), 1600);
        if (G.level === OBSTACLES.printer.unlock) setTimeout(() => G.state === 'playing' && toast('Printers don dey run. Watch the sides!', 'info'), 1600);
        if (G.level === OBSTACLES.colleague.unlock) setTimeout(() => G.state === 'playing' && toast('Your colleague has "one small task" for you…', 'info'), 1600);
      }
      addScore(DIFFICULTY.survivalPerSecond * Math.min(G.level, 25) * dt);
      G.scroll += (55 + 6 * Math.min(G.level, 20)) * dt;

      updatePlayer(dt);

      G.spawnT -= dt;
      if (G.spawnT <= 0) { spawnObstacle(); G.spawnT = spawnInterval() * rand(0.7, 1.3); }
      G.itemT -= dt;
      if (G.itemT <= 0) { spawnItem(); G.itemT = rand(DIFFICULTY.itemEvery[0], DIFFICULTY.itemEvery[1]); }
      if (G.level >= DIFFICULTY.bossFromLevel) {
        G.bossT -= dt;
        if (G.bossT <= 0) { spawnBoss(); G.bossT = rand(DIFFICULTY.bossEvery[0], DIFFICULTY.bossEvery[1]) * Math.max(0.6, 1 - G.level * 0.02); }
      }
      G.msgT -= dt;
      if (G.msgT <= 0) {
        let m = pick(MESSAGES.ambient);
        if (m === G.lastMsg) m = pick(MESSAGES.ambient);
        G.lastMsg = m;
        toast(m, 'info', 2200);
        G.msgT = rand(9, 16);
      }
      updateObstacles(dt);
      updateItems(dt);
      updateParticles(dt);
      if (G.state === 'playing' || G.state === 'dying') updateHud(false);
    } else if (G.state === 'dying') {
      G.dyingT -= dt;
      updateObstacles(dt * 0.25);
      updateParticles(dt);
      updateHud(false);
      if (G.dyingT <= 0) gameOver();
    } else if (G.state === 'menu' || G.state === 'over' || G.state === 'board') {
      G.scroll += 40 * dt;
    }
    G.shake *= Math.exp(-dt * 9);
    G.flash = Math.max(0, (G.flash || 0) - dt);
  }

  /* ==================== Render ==================== */
  function drawDecor(c, kind, x, y, side, t) {
    // x,y is the decor anchor; side = -1 left wall, 1 right wall, 0 open office
    c.save();
    c.translate(x, y);
    switch (kind) {
      case 'desk': {
        // chair
        c.fillStyle = '#26324d';
        circle(c, side * -6, 30, 11); c.fill();
        c.fillStyle = '#7a4f2c';
        rr(c, -26, -8, 52, 30, 4); c.fill();
        c.fillStyle = '#8a5a33';
        rr(c, -26, -8, 52, 4, 2); c.fill();
        // laptop
        c.fillStyle = '#9aa3b5'; rr(c, -12, 0, 24, 14, 2); c.fill();
        c.fillStyle = '#5ad1ff'; c.globalAlpha = 0.75 + Math.sin(t * 2 + x) * 0.1; rr(c, -10, 1.5, 20, 10, 1.5); c.fill(); c.globalAlpha = 1;
        c.fillStyle = '#f5f5f0'; c.fillRect(14, 2, 8, 10);
        c.fillStyle = '#b45309'; circle(c, -19, 6, 3.5); c.fill();
        break;
      }
      case 'plant':
        c.fillStyle = '#9a5b2e'; rr(c, -9, 4, 18, 16, 3); c.fill();
        c.fillStyle = '#1f8a4c';
        circle(c, 0, -4, 11); c.fill(); circle(c, -8, 2, 7); c.fill(); circle(c, 8, 1, 7); c.fill();
        c.fillStyle = '#2bb366'; circle(c, -3, -8, 5); c.fill();
        break;
      case 'water':
        c.fillStyle = '#dfe5ee'; rr(c, -10, -4, 20, 26, 3); c.fill();
        c.fillStyle = 'rgba(90,209,255,.8)'; circle(c, 0, -12, 10); c.fill();
        c.fillStyle = '#3b82f6'; c.fillRect(-4, 6, 3, 4); c.fillStyle = COLORS.red; c.fillRect(1, 6, 3, 4);
        break;
      case 'door': {
        c.fillStyle = '#5b3a22'; rr(c, -18, -26, 36, 52, 3); c.fill();
        c.fillStyle = '#6d4729'; rr(c, -14, -22, 28, 20, 2); c.fill(); rr(c, -14, 2, 28, 20, 2); c.fill();
        c.fillStyle = COLORS.gold; circle(c, side * -11, 2, 2.4); c.fill();
        c.fillStyle = '#e8eaf0'; rr(c, -16, -40, 32, 11, 2); c.fill();
        c.fillStyle = COLORS.ink; c.font = '800 6.5px system-ui, Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText(((x * 7 + y) | 0) % 2 ? "MD'S OFFICE" : 'HR', 0, -34.5);
        break;
      }
      case 'meetingroom': {
        c.fillStyle = 'rgba(160,200,255,.12)'; rr(c, -30, -34, 60, 68, 4); c.fill();
        c.strokeStyle = 'rgba(160,200,255,.4)'; c.lineWidth = 1.5; c.stroke();
        c.fillStyle = '#6b4a2f'; rr(c, -16, -18, 32, 36, 8); c.fill();
        c.fillStyle = '#26324d';
        for (const [cx, cy] of [[-22, -8], [-22, 8], [22, -8], [22, 8]]) { circle(c, cx, cy, 5); c.fill(); }
        c.fillStyle = '#c7d7f5'; c.font = '800 6.5px system-ui, Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText('MEETING ROOM', 0, -28);
        break;
      }
      case 'cabinet':
        c.fillStyle = '#7b8496'; rr(c, -12, -22, 24, 44, 3); c.fill();
        c.fillStyle = '#9aa3b5';
        for (let i = 0; i < 3; i++) { rr(c, -9, -19 + i * 14, 18, 11, 2); c.fill(); }
        c.fillStyle = '#4b5263';
        for (let i = 0; i < 3; i++) c.fillRect(-4, -15 + i * 14, 8, 2);
        break;
      case 'copier':
        c.fillStyle = '#c6ccd8'; rr(c, -16, -16, 32, 32, 4); c.fill();
        c.fillStyle = '#e4e8ef'; rr(c, -14, -14, 28, 10, 2); c.fill();
        c.fillStyle = '#19c37d'; circle(c, 9, 6, 2); c.fill();
        break;
    }
    c.restore();
  }

  const WALL_DECOR = ['desk', 'desk', 'plant', 'water', 'door', 'cabinet', 'copier', 'desk', 'meetingroom'];
  function drawBackground(c, t) {
    c.fillStyle = COLORS.wall;
    c.fillRect(0, 0, W, H);
    // open-office bays outside the corridor (wide screens)
    if (FX0 > 20) {
      const SEGB = 110;
      const offB = G.scroll % SEGB;
      const baseB = Math.floor(G.scroll / SEGB);
      c.globalAlpha = 0.5;
      for (let k = -1; k <= Math.ceil(H / SEGB) + 1; k++) {
        const y = k * SEGB + offB;
        const id = k - baseB;
        for (let x = FX0 - 70; x > -40; x -= 90) { drawDecor(c, hash(id * 3.1 + x) > 0.85 ? 'plant' : 'desk', x, y, 0, t); }
        for (let x = FX1 + 70; x < W + 40; x += 90) { drawDecor(c, hash(id * 5.7 + x) > 0.85 ? 'plant' : 'desk', x, y, 0, t); }
      }
      c.globalAlpha = 1;
      // corridor walls
      c.fillStyle = '#25345a';
      c.fillRect(FX0 - 6, 0, 6, H); c.fillRect(FX1, 0, 6, H);
    }
    // corridor floor (carpet tiles)
    c.fillStyle = COLORS.floor;
    c.fillRect(FX0, 0, FX1 - FX0, H);
    const TILE = 64;
    const off = G.scroll % TILE;
    c.strokeStyle = COLORS.floorLine;
    c.lineWidth = 2;
    c.beginPath();
    for (let y = off - TILE; y < H + TILE; y += TILE) { c.moveTo(FX0, y); c.lineTo(FX1, y); }
    const cx = (FX0 + FX1) / 2;
    for (let x = cx % TILE; x < FX1; x += TILE) { if (x > FX0) { c.moveTo(x, 0); c.lineTo(x, H); } }
    c.stroke();
    // centre walkway runner
    c.fillStyle = 'rgba(0,135,81,.10)';
    c.fillRect(cx - 40, 0, 80, H);
    c.fillStyle = 'rgba(255,255,255,.035)';
    for (let y = (G.scroll * 1) % 48 - 48; y < H; y += 48) c.fillRect(cx - 2, y, 4, 22);
    // wall decor along both corridor edges
    const SEG = 150;
    const segOff = G.scroll % SEG;
    const base = Math.floor(G.scroll / SEG);
    for (let k = -1; k <= Math.ceil(H / SEG) + 1; k++) {
      const y = k * SEG + segOff;
      const id = k - base;
      const kl = WALL_DECOR[Math.floor(hash(id * 1.37) * WALL_DECOR.length)];
      const kr = WALL_DECOR[Math.floor(hash(id * 2.91 + 9) * WALL_DECOR.length)];
      const inset = kl === 'meetingroom' ? 32 : 28;
      drawDecor(c, kl, FX0 + inset, y, -1, t);
      drawDecor(c, kr, FX1 - (kr === 'meetingroom' ? 32 : 28), y + 70, 1, t);
    }
    // top vignette for depth
    const g = c.createLinearGradient(0, 0, 0, 160);
    g.addColorStop(0, 'rgba(8,13,26,.85)');
    g.addColorStop(1, 'rgba(8,13,26,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, W, 160);
  }

  function drawWarning(c, o, t) {
    const pulse = (Math.sin(t * 18) + 1) / 2;
    let x, y, ang;
    if (o.side === 'L') { x = FX0 + 16; y = o.y; ang = Math.PI; }
    else if (o.side === 'R') { x = FX1 - 16; y = o.y; ang = 0; }
    else { x = o.x; y = HUD_SPACE + 34; ang = -Math.PI / 2; }
    c.save();
    c.translate(x, y);
    c.globalAlpha = 0.55 + pulse * 0.45;
    c.fillStyle = o.type === 'boss' ? COLORS.red : COLORS.gold;
    circle(c, 0, 0, 15); c.fill();
    c.fillStyle = '#fff';
    c.font = '900 18px system-ui, Arial, sans-serif';
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('!', 0, 1);
    c.rotate(ang);
    c.fillStyle = o.type === 'boss' ? COLORS.red : COLORS.gold;
    c.beginPath(); c.moveTo(19, 0); c.lineTo(27, -7); c.lineTo(27, 7); c.closePath(); c.fill();
    c.restore();
  }

  function speech(c, text, x, y, color = '#fff', ink = COLORS.ink) {
    c.font = '800 10px system-ui, Arial, sans-serif';
    const w = c.measureText(text).width + 14;
    const bx = clamp(x - w / 2, FX0 + 4, FX1 - w - 4);
    c.fillStyle = color;
    rr(c, bx, y - 22, w, 18, 8); c.fill();
    c.beginPath(); c.moveTo(clamp(x, bx + 8, bx + w - 8) - 4, y - 5); c.lineTo(clamp(x, bx + 8, bx + w - 8) + 4, y - 5); c.lineTo(clamp(x, bx + 8, bx + w - 8), y + 1); c.closePath(); c.fill();
    c.fillStyle = ink;
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(text, bx + w / 2, y - 13);
  }

  function drawGlow(c, x, y, r, color, t) {
    const g = c.createRadialGradient(x, y, 2, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    c.globalAlpha = 0.35 + Math.sin(t * 5) * 0.1;
    c.fillStyle = g;
    circle(c, x, y, r); c.fill();
    c.globalAlpha = 1;
  }

  function render() {
    const c = ctx;
    const t = G.t;
    c.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
    c.save();
    if (G.shake > 0.3) c.translate(rand(-G.shake, G.shake), rand(-G.shake, G.shake));
    drawBackground(c, t);

    const inRound = G.player && G.state !== 'menu' && !(G.state === 'board' && boardReturn === 'menu');
    if (inRound) {
      const p = G.player;
      // items
      for (const it of G.items) {
        drawGlow(c, it.x, it.y, 30, ITEMS[it.type].color, t + it.wob);
        c.save(); c.translate(it.x, it.y + Math.sin(it.t * 4) * 2); SPRITES[it.type](c, it.t); c.restore();
      }
      // obstacles
      let bossNear = false;
      for (const o of G.obstacles) {
        if (o.warn > 0 && (o.type !== 'boss' || o.phase === 'warn')) { drawWarning(c, o, t); continue; }
        c.save();
        c.translate(o.x, o.y);
        if (o.type === 'boss') {
          bossNear = true;
          const lx = (p.x - o.x) / 120, ly = (p.y - o.y) / 120;
          SPRITES.boss(c, o.t, { lookX: lx, lookY: ly });
          c.restore();
          c.save();
          c.fillStyle = COLORS.gold;
          rr(c, o.x - 16, o.y - 64, 32, 14, 7); c.fill();
          c.fillStyle = COLORS.ink; c.font = '900 9px system-ui, Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
          c.fillText('OGA', o.x, o.y - 56.5);
          if (o.phase === 'chase') speech(c, o.talk, o.x, o.y - 68);
          c.restore();
          continue;
        }
        if (o.type === 'colleague') {
          SPRITES.colleague(c, o.t);
          c.restore();
          if (o.life > 0) speech(c, o.talk, o.x, o.y - 34);
          continue;
        }
        c.rotate(o.rot || 0);
        SPRITES[o.type](c, o.t);
        c.restore();
      }
      // player
      const blink = p.invuln > 0 && Math.floor(p.invuln * 10) % 2 === 0;
      if (p.leave > 0) {
        c.strokeStyle = `rgba(62,224,143,${0.5 + Math.sin(t * 10) * 0.25})`;
        c.lineWidth = 3;
        circle(c, p.x, p.y - 2, 30 + Math.sin(t * 6) * 2); c.stroke();
      }
      if (G.state !== 'dying' || Math.floor(G.dyingT * 12) % 2 === 0) {
        c.save();
        c.globalAlpha = blink ? 0.35 : 1;
        c.translate(p.x, p.y);
        const tilt = clamp(p.vx / 1600, -0.12, 0.12);
        c.rotate(tilt);
        const mood = G.state === 'dying' ? 'worried' : p.leave > 0 ? 'cool' : bossNear ? 'worried' : 'happy';
        SPRITES.player(c, t, { walk: p.walk, mood, lookX: p.vx / CONFIG.PLAYER_SPEED, lookY: p.vy / CONFIG.PLAYER_SPEED - 0.4 });
        c.restore();
        if (p.leave > 0) speech(c, 'On leave!', p.x, p.y - 36, '#3ee08f');
      }
      // particles
      for (const q of G.particles) {
        c.globalAlpha = clamp(q.life / q.max, 0, 1);
        if (q.text) {
          c.fillStyle = q.color;
          c.font = '900 13px system-ui, Arial, sans-serif';
          c.textAlign = 'center'; c.textBaseline = 'middle';
          c.fillText(q.text, q.x, q.y);
        } else {
          c.fillStyle = q.color;
          c.fillRect(q.x - q.size / 2, q.y - q.size / 2, q.size, q.size);
        }
      }
      c.globalAlpha = 1;
      // floaters
      for (const f of G.floaters) {
        const a = clamp(f.life / f.max * 1.6, 0, 1);
        c.globalAlpha = a;
        c.font = `900 ${f.size}px system-ui, Arial, sans-serif`;
        c.textAlign = 'center'; c.textBaseline = 'middle';
        c.lineWidth = 4; c.strokeStyle = 'rgba(8,13,26,.85)'; c.lineJoin = 'round';
        c.strokeText(f.text, f.x, f.y);
        c.fillStyle = f.color;
        c.fillText(f.text, f.x, f.y);
      }
      c.globalAlpha = 1;
    } else {
      // attract mode: a worker strolling up the corridor
      const x = (FX0 + FX1) / 2 + Math.sin(t * 0.7) * Math.min(120, (FX1 - FX0) * 0.3);
      c.save(); c.translate(x, H * 0.82); SPRITES.player(c, t, { walk: t * 10, mood: 'happy', lookY: -0.5 }); c.restore();
    }
    c.restore();
    if (G.flash > 0) {
      c.fillStyle = `rgba(229,72,77,${G.flash * 0.9})`;
      c.fillRect(0, 0, W, H);
    }
  }

  /* ==================== Main loop ==================== */
  let lastFrame = performance.now();
  function frame(now) {
    let dt = (now - lastFrame) / 1000;
    lastFrame = now;
    if (!(dt > 0)) dt = 0;
    dt = Math.min(dt, 0.05);
    // sub-step for stable collisions on slow frames
    const steps = dt > 1 / 50 ? 2 : 1;
    for (let i = 0; i < steps; i++) step(dt / steps);
    render();
    requestAnimationFrame(frame);
  }

  /* ==================== Sharing ==================== */
  function shareUrl() {
    if (CONFIG.SHARE_URL) return CONFIG.SHARE_URL;
    const { protocol, hostname } = location;
    const local = !hostname || hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]' || hostname.endsWith('.local') || /^192\.168\.|^10\./.test(hostname);
    if ((protocol === 'https:' || protocol === 'http:') && !local) return location.origin + location.pathname;
    return '';
  }
  function shareText() {
    return `I survived ${fmtTime(G.time)} of ${CONFIG.TITLE} and scored ${fmtNum(G.scoreF)} points! Can you beat my score? 🇳🇬`;
  }
  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return true; }
    } catch (e) { /* fall through */ }
    try {
      const ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch (e) { return false; }
  }
  async function shareScore() {
    const url = shareUrl();
    const text = shareText();
    const data = url ? { title: CONFIG.TITLE, text, url } : { title: CONFIG.TITLE, text };
    if (navigator.share && (!navigator.canShare || navigator.canShare(data))) {
      try { await navigator.share(data); return; }
      catch (e) { if (e && e.name === 'AbortError') return; }
    }
    const ok = await copyText(url ? text + ' ' + url : text);
    toast(ok ? 'Score copied. Paste it in your office group chat!' : 'Could not copy automatically. Your score: ' + fmtNum(G.scoreF), ok ? 'good' : 'info', 2600);
  }

  /* ==================== Optional global leaderboard (Supabase) ==================== */
  const LB = {
    enabled: !!(CONFIG.SUPABASE_URL && CONFIG.SUPABASE_ANON_KEY),
    async rpc(fn, body) {
      const res = await fetch(CONFIG.SUPABASE_URL.replace(/\/$/, '') + '/rest/v1/rpc/' + fn, {
        method: 'POST',
        headers: {
          apikey: CONFIG.SUPABASE_ANON_KEY,
          Authorization: 'Bearer ' + CONFIG.SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body || {}),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error((json && (json.message || json.hint)) || 'Request failed (' + res.status + ')');
      return json;
    },
  };

  async function submitScore(e) {
    e.preventDefault();
    if (!LB.enabled || G.submitted) return;
    const name = ui.lbName.value.trim().slice(0, 20);
    if (!name) { ui.lbStatus.textContent = 'Type a name first.'; ui.lbStatus.className = 'lb-status err'; return; }
    store.set('ow_name', name);
    ui.lbSubmit.disabled = true;
    ui.lbStatus.textContent = 'Submitting…'; ui.lbStatus.className = 'lb-status';
    try {
      await LB.rpc('submit_score', { p_name: name, p_score: Math.floor(G.scoreF), p_duration: Math.floor(G.time), p_level: G.level });
      G.submitted = true;
      ui.lbStatus.textContent = 'Score submitted to the leaderboard.'; ui.lbStatus.className = 'lb-status ok';
    } catch (err) {
      ui.lbSubmit.disabled = false;
      ui.lbStatus.textContent = 'Could not submit: ' + err.message; ui.lbStatus.className = 'lb-status err';
    }
  }

  let boardReturn = 'menu';
  async function openBoard(from) {
    if (!LB.enabled) return;
    boardReturn = from;
    G.state = 'board';
    showScreen('board');
    ui.boardList.innerHTML = '';
    ui.boardStatus.textContent = 'Loading scores…';
    ui.boardStatus.hidden = false;
    try {
      const rows = await LB.rpc('get_leaderboard', { p_limit: 20 });
      if (!Array.isArray(rows) || rows.length === 0) { ui.boardStatus.textContent = 'No scores yet. Play a round and be the first on the board.'; return; }
      ui.boardStatus.hidden = true;
      for (const r of rows) {
        const li = document.createElement('li');
        const n = document.createElement('span'); n.className = 'n'; n.textContent = r.name;
        const s = document.createElement('span'); s.className = 's'; s.textContent = fmtNum(r.score);
        const tt = document.createElement('span'); tt.className = 't'; tt.textContent = 'Survived ' + fmtTime(r.duration);
        li.append(n, s, tt);
        ui.boardList.appendChild(li);
      }
    } catch (err) {
      ui.boardStatus.textContent = 'Could not load the leaderboard: ' + err.message;
    }
  }
  function closeBoard() {
    G.state = boardReturn;
    showScreen(boardReturn);
  }

  /* ==================== Sound toggle ==================== */
  function syncMuteUi() {
    const on = !Sound.muted;
    ui.muteHud.setAttribute('aria-pressed', String(on));
    ui.muteHud.setAttribute('aria-label', on ? 'Turn sound off' : 'Turn sound on');
    ui.muteMenu.setAttribute('aria-pressed', String(on));
    ui.muteMenu.textContent = on ? 'Sound: on' : 'Sound: off';
  }
  function toggleMute() {
    Sound.setMuted(!Sound.muted);
    syncMuteUi();
    Sound.play('click');
  }

  /* ==================== Legend icons ==================== */
  function drawIcons() {
    const r = Math.min(window.devicePixelRatio || 1, 3);
    document.querySelectorAll('canvas.icon').forEach((el) => {
      const kind = el.dataset.sprite;
      const size = 30;
      el.width = size * r; el.height = size * r;
      const c = el.getContext('2d');
      c.setTransform(r, 0, 0, r, 0, 0);
      c.clearRect(0, 0, size, size);
      c.save();
      c.translate(size / 2, size / 2);
      const fit = { boss: 0.42, colleague: 0.5, meeting: 0.34, printer: 0.48, player: 0.5 }[kind] || 0.72;
      if (kind === 'boss' || kind === 'colleague') c.translate(0, 3);
      c.scale(fit, fit);
      if (kind === 'boss') SPRITES.boss(c, 0, { s: 1.28 });
      else SPRITES[kind](c, 0.3);
      c.restore();
    });
  }

  /* ==================== Wire up buttons ==================== */
  $('btn-play').addEventListener('click', startGame);
  $('btn-again').addEventListener('click', startGame);
  $('btn-restart').addEventListener('click', startGame);
  $('btn-resume').addEventListener('click', resumeGame);
  $('btn-pause').addEventListener('click', () => { if (G.state === 'playing') pauseGame(); else if (G.state === 'paused') resumeGame(); });
  $('btn-menu-pause').addEventListener('click', toMenu);
  $('btn-menu-over').addEventListener('click', toMenu);
  $('btn-share').addEventListener('click', shareScore);
  ui.muteHud.addEventListener('click', (e) => { toggleMute(); e.currentTarget.blur(); });
  ui.muteMenu.addEventListener('click', toggleMute);
  $('btn-board-back').addEventListener('click', closeBoard);
  ui.lbForm.addEventListener('submit', submitScore);
  if (LB.enabled) {
    $('btn-board-menu').hidden = false;
    $('btn-board-over').hidden = false;
    $('btn-board-menu').addEventListener('click', () => openBoard('menu'));
    $('btn-board-over').addEventListener('click', () => openBoard('over'));
  }

  // First-time visitors see instructions open; returning players get a compact menu.
  const howto = $('howto');
  if (store.get('ow_played', '0') === '1' && window.innerHeight < 900) howto.open = false;
  $('btn-play').addEventListener('click', () => store.set('ow_played', '1'));

  /* ==================== Boot ==================== */
  ui.menuBest.textContent = fmtNum(G.best);
  ui.fridayNote.hidden = !IS_FRIDAY;
  syncMuteUi();
  resize();
  newRound();
  G.state = 'menu';
  drawIcons();
  window.addEventListener('resize', drawIcons);
  requestAnimationFrame((n) => { lastFrame = n; requestAnimationFrame(frame); });

  if (DEBUG) {
    window.__OW = { G, step, render, CONFIG, DIFFICULTY, spawnBoss, spawnItem, spawnObstacle, startGame, pauseGame, resumeGame, toMenu, shareText };
  }
})();
