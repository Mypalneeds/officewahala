/* ==========================================================
   OFFICE WAHALA — original soundtrack engine
   A playlist of Afrobeats / Amapiano / highlife-style songs
   generated live with the Web Audio API: kick, clap, shekere,
   clave, log-drum bass, highlife guitar and keys, bells, flute and
   a talking-drum fill. 100% original, no audio files, no licences.

   Songs change every ~minute during play (with a talking-drum
   transition), and every new shift starts the next song.

   Optional: set CONFIG.MUSIC_TRACKS in game.js to a list of
   licensed audio files and they will be played instead, in turn.
   ========================================================== */
(function () {
  'use strict';

  const N = (semi) => 220 * Math.pow(2, semi / 12); // semitones from A3
  // chord helper: root (semitones from A3, bass octave) + chord tones (semitones from A3)
  const C = (root, tones) => ({ root: N(root), tones: tones.map(N) });

  //  16-step patterns           0 1 2 3 4 5 6 7 8 9 A B C D E F
  const P = {
    kickAfro:   [1,0,0,1,0,0,1,0,1,0,0,1,0,0,1,0],
    kickAmapi:  [1,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0],
    kickFour:   [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
    kickHalf:   [1,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0],
    kickHigh:   [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
    clap:       [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
    clapAfro:   [0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,0],
    clave:      [1,0,0,1,0,0,1,0,0,0,1,0,1,0,0,0],
    bell:       [1,0,1,0,1,1,0,1,0,1,0,1,0,0,0,0],
    log:        [0,0,0,1,0,0,1,0,0,1,0,1,0,0,1,0],
    logBusy:    [0,0,1,1,0,0,1,0,0,1,0,1,0,1,1,0],
    logSparse:  [0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0],
    keys:       [0,0,1,0,0,0,1,0,0,0,1,0,0,1,0,0],
    keysOff:    [0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0],
    keysPiano:  [1,0,0,1,0,0,1,0,0,0,1,0,0,1,0,0],
    bass:       [1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0],
  };
  const LOGP = [0,0,0,0,0,0,7,0,0,0,0,5,0,0,0,0];

  // Each song: tempo, progression (one chord per bar), drum patterns, lead line.
  // lead: 32 steps (2 bars) of chord-tone indexes (0-3, +4 = octave up), -1 = rest.
  const SONGS = [
    { name: 'Office Amapiano', gain: 0.93, bpm: 104, menu: true, kick: 'kickAmapi', kick2: 'kickAfro', clap: 'clap', log: 'log', keys: 'keys', guitar: false,
      lead: 'pluck', arp: [0, 1, 2, 3, 2, 1, 3, 2],
      prog: [C(-12, [0, 3, 7, 10]), C(-7, [5, 8, 12, 15]), C(-14, [-2, 2, 5, 10]), C(-9, [3, 7, 10, 14])] }, // Am7 Dm7 G7 Cmaj7
    { name: 'Lagos Traffic', gain: 0.68, bpm: 110, kick: 'kickAfro', kick2: 'kickAfro', clap: 'clapAfro', log: 'logSparse', bass: true, keys: 'keysOff', guitar: true,
      lead: 'flute', melody: [4, -1, 5, -1, 6, -1, 5, 4, -1, -1, 2, -1, 3, -1, 2, -1, 4, -1, 6, -1, 7, -1, 6, 5, -1, -1, 4, -1, 2, -1, -1, -1],
      prog: [C(-14, [-2, 1, 5, 8]), C(-11, [1, 5, 8, 12]), C(-9, [3, 6, 10, 13]), C(-16, [-4, 0, 3, 7])] }, // Gm Bb C Eb-ish
    { name: 'Highlife Lunch Break', gain: 1.4, bpm: 98, menu: true, kick: 'kickHalf', kick2: 'kickAfro', clap: 'clap', log: null, keys: 'keysOff', guitar: true, bells: true,
      lead: 'guitar', arp: [0, 2, 1, 3, 0, 2, 1, 3],
      prog: [C(-9, [3, 7, 10, 15]), C(-4, [8, 12, 15, 20]), C(-2, [10, 14, 17, 22]), C(-9, [3, 7, 10, 15]),
        C(-12, [0, 3, 7, 12]), C(-4, [8, 12, 15, 20]), C(-2, [10, 14, 17, 22]), C(-9, [3, 7, 10, 15])] }, // C F G C Am F G C
    { name: 'Owambe Saturday', gain: 0.72, bpm: 112, kick: 'kickFour', kick2: 'kickAfro', clap: 'clapAfro', log: null, bass: true, keys: 'keysPiano', guitar: true, bells: true, talk: true,
      lead: 'bell', melody: [0, -1, 2, -1, 4, -1, 2, -1, 3, -1, 2, 1, 0, -1, -1, -1, 0, -1, 2, -1, 4, 5, 4, -1, 3, -1, 2, -1, 1, -1, -1, -1],
      prog: [C(-16, [-4, 0, 3, 8]), C(-11, [1, 5, 8, 13]), C(-9, [3, 7, 10, 15]), C(-16, [-4, 0, 3, 8])] }, // F Bb C F
    { name: 'Overtime Vibes', gain: 1.45, bpm: 92, menu: true, kick: 'kickHigh', kick2: 'kickAmapi', clap: 'clap', log: 'logSparse', keys: 'keysOff', guitar: false, soft: true,
      lead: 'keys', arp: [0, 2, 3, 2, 1, 3, 2, 1],
      prog: [C(-7, [5, 8, 12, 15, 19]), C(-14, [-2, 2, 5, 9]), C(-9, [3, 7, 10, 14]), C(-4, [8, 12, 15, 19])] }, // Dm9 G9 Cmaj7 Fmaj7
    { name: 'TGIF Piano', gain: 0.84, bpm: 113, kick: 'kickAmapi', kick2: 'kickAmapi', clap: 'clap', log: 'logBusy', keys: 'keysPiano', guitar: false, shakerUp: true,
      lead: 'pluck', melody: [7, -1, 6, -1, 4, -1, -1, 6, 7, -1, 6, -1, 4, -1, 2, -1, 3, -1, 4, -1, 6, -1, -1, 4, 3, -1, 2, -1, 0, -1, -1, -1],
      prog: [C(-17, [-5, -2, 2, 5]), C(-10, [2, 5, 9, 12]), C(-12, [0, 3, 7, 10]), C(-14, [-2, 2, 5, 9])] }, // Em7 Bm7? -> Em C Am G feel
  ];

  const M = {
    ctx: null,
    out: null,
    filter: null,
    noise: null,
    vol: 0.55,
    on: false,       // user setting
    running: false,  // scheduler active
    mode: 'menu',    // 'menu' | 'game'
    level: 1,
    bpm: 104,
    step: 0,
    nextTime: 0,
    timer: null,
    fillAt: -1,
    song: 0,
    songBars: 0,     // bars played in the current song
    switchAt: -1,    // bar when we change song
    onSong: null,    // callback(name) when the song changes
    tracks: [],
    trackIdx: 0,
    audioEl: null,
    trackSrc: null,
    get songs() { return SONGS.map((s) => s.name); },
    get songName() { return this.tracks.length ? 'Track ' + (this.trackIdx + 1) : SONGS[this.song].name; },

    init(ctx, destination, tracks) {
      if (this.ctx) return;
      this.ctx = ctx;
      this.out = ctx.createGain();
      this.out.gain.value = 0;
      this.filter = ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.value = 18000;
      this.filter.Q.value = 0.8;
      this.out.connect(this.filter);
      this.filter.connect(destination);
      const len = Math.floor(ctx.sampleRate * 1);
      this.noise = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = this.noise.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      this.tracks = Array.isArray(tracks) ? tracks.filter(Boolean) : [];
      this.song = Math.floor(Math.random() * SONGS.length);
    },

    /* ---------- public controls ---------- */
    start(mode) {
      if (!this.ctx || !this.on) return;
      const prev = this.mode;
      this.mode = mode || this.mode;
      if (this.tracks.length) { this.startTracks(); return; }
      if (this.running) {
        if (prev !== this.mode && this.mode === 'menu' && !SONGS[this.song].menu) this.pickSong('menu');
        this.fadeTo(this.targetVol(), 0.4);
        return;
      }
      if (this.mode === 'menu' && !SONGS[this.song].menu) this.pickSong('menu', true);
      this.running = true;
      this.step = 0;
      this.songBars = 0;
      this.bpm = this.songBpm();
      this.nextTime = this.ctx.currentTime + 0.08;
      this.fadeTo(this.targetVol(), 0.6);
      clearInterval(this.timer);
      this.timer = setInterval(() => this.schedule(), 25);
    },
    stop(fade = 0.35) {
      if (!this.ctx) return;
      this.fadeTo(0, fade);
      if (this.audioEl) { const el = this.audioEl; setTimeout(() => { if (!this.running) el.pause(); }, fade * 1000 + 50); }
      this.running = false;
      clearInterval(this.timer);
      this.timer = null;
    },
    // Start the next song (each new shift calls this; the player can too).
    next() {
      if (this.tracks.length) { if (this.audioEl) this.nextTrack(); return this.songName; }
      this.pickSong(this.mode);
      this.step = 0; this.songBars = 0; this.switchAt = -1; this.fillAt = -1;
      this.bpm = this.songBpm();
      if (this.running) this.fadeTo(this.targetVol(), 0.6);
      return this.songName;
    },
    // Switch to a named song (each office has its own favourite).
    playSong(name) {
      const i = SONGS.findIndex((s) => s.name === name);
      if (i < 0 || this.tracks.length) return this.songName;
      this.song = i; this.step = 0; this.songBars = 0; this.switchAt = -1; this.fillAt = -1;
      this.bpm = this.songBpm();
      if (this.running) this.fadeTo(this.targetVol(), 0.6);
      return this.songName;
    },
    setMode(mode) { this.mode = mode; if (this.running) this.fadeTo(this.targetVol(), 0.5); },
    setLevel(level) {
      this.level = level;
      this.bpm = this.songBpm();
      if (this.audioEl) this.audioEl.playbackRate = Math.min(1.12, 1 + (level - 1) * 0.008);
    },
    muffle(on) {
      if (!this.filter) return;
      const t = this.ctx.currentTime;
      this.filter.frequency.cancelScheduledValues(t);
      this.filter.frequency.setValueAtTime(this.filter.frequency.value, t);
      this.filter.frequency.exponentialRampToValueAtTime(on ? 420 : 18000, t + (on ? 0.5 : 0.9));
    },
    fill() { this.fillAt = (Math.floor(this.step / 16) + 1) * 16; }, // talking drum on next bar
    targetVol() { const g = this.tracks.length ? 1 : SONGS[this.song].gain || 1; return (this.mode === 'menu' ? this.vol * 0.55 : this.vol) * g; },
    fadeTo(v, s) {
      if (!this.out) return;
      const t = this.ctx.currentTime;
      this.out.gain.cancelScheduledValues(t);
      this.out.gain.setValueAtTime(this.out.gain.value, t);
      this.out.gain.linearRampToValueAtTime(v, t + s);
    },
    songBpm() {
      const s = SONGS[this.song];
      return this.mode === 'game' ? Math.min(s.bpm + 18, s.bpm + (this.level - 1) * 2) : s.bpm - 4;
    },
    pickSong(mode, quiet) {
      const pool = SONGS.map((s, i) => i).filter((i) => i !== this.song && (mode !== 'menu' || SONGS[i].menu));
      this.song = pool[Math.floor(Math.random() * pool.length)];
      if (!quiet && typeof this.onSong === 'function') { try { this.onSong(SONGS[this.song].name); } catch (e) { /* ignore */ } }
    },

    /* ---------- licensed tracks backend ---------- */
    startTracks() {
      if (!this.audioEl) {
        this.audioEl = new Audio();
        this.audioEl.preload = 'auto';
        this.audioEl.crossOrigin = 'anonymous';
        try {
          this.trackSrc = this.ctx.createMediaElementSource(this.audioEl);
          this.trackSrc.connect(this.out);
        } catch (e) { /* plays directly if routing fails */ }
        this.audioEl.addEventListener('ended', () => this.nextTrack());
        this.audioEl.addEventListener('error', () => {
          // Bad file: fall back to the generated songs.
          this.tracks = [];
          this.running = false;
          this.start(this.mode);
        });
        this.audioEl.src = this.tracks[this.trackIdx];
      }
      this.running = true;
      this.audioEl.play().catch(() => {});
      this.fadeTo(this.targetVol() * 1.4, 0.8);
    },
    nextTrack() {
      this.trackIdx = (this.trackIdx + 1) % this.tracks.length;
      this.audioEl.src = this.tracks[this.trackIdx];
      this.audioEl.play().catch(() => {});
    },

    /* ---------- sequencer ---------- */
    schedule() {
      if (!this.running) return;
      const ctx = this.ctx;
      if (ctx.state !== 'running') return;
      if (this.nextTime < ctx.currentTime - 0.2) this.nextTime = ctx.currentTime + 0.05; // recover after a stall
      while (this.nextTime < ctx.currentTime + 0.12) {
        const stepDur = 60 / this.bpm / 4;
        this.playStep(this.step, this.nextTime, stepDur);
        this.nextTime += stepDur;
        this.step++;
        if (this.step % 16 === 0) this.barDone();
      }
    },
    barDone() {
      this.songBars++;
      const s = SONGS[this.song];
      const len = this.mode === 'game' ? 24 : 32;              // ~55-70 seconds per song in play
      const phrase = s.prog.length;
      if (this.switchAt < 0 && this.songBars >= len && this.songBars % phrase === phrase - 1) {
        this.fillAt = this.step;                                 // talking-drum bar, then a new song
        this.switchAt = this.songBars + 1;
      }
      if (this.switchAt >= 0 && this.songBars >= this.switchAt) {
        this.switchAt = -1;
        this.pickSong(this.mode);
        this.step = 0; this.songBars = 0; this.fillAt = -1;
        this.bpm = this.songBpm();
        this.fadeTo(this.targetVol(), 1.2);
      }
    },

    playStep(step, t, sd) {
      const song = SONGS[this.song];
      const s = step % 16;
      const bar = Math.floor(step / 16);
      const chord = song.prog[bar % song.prog.length];
      const game = this.mode === 'game';
      const hot = game ? Math.min(1, (this.level - 1) / 6) : 0;
      const swing = s % 2 === 1 ? sd * 0.12 : 0; // light afro swing
      const tt = t + swing;
      const soft = song.soft ? 0.75 : 1;

      // talking drum fill replaces percussion for one bar
      const filling = this.fillAt >= 0 && step >= this.fillAt && step < this.fillAt + 16;
      if (filling) {
        if ([0, 3, 6, 8, 10, 11, 12, 14].includes(s)) this.talkingDrum(tt, s);
        if (s === 15) this.fillAt = -1;
      } else if (song.talk && game && bar % 4 === 3 && [8, 11, 14].includes(s)) this.talkingDrum(tt, s);

      // shekere (16ths, accents on the offbeat)
      this.shaker(tt, (s % 4 === 2 ? 0.16 : 0.07) * (song.shakerUp ? 1.3 : 1) * soft);

      if (game && !filling) {
        if (P[hot > 0.4 ? song.kick2 : song.kick][s]) this.kick(t, 0.9 * soft);
        if (P[song.clap][s]) this.clap(tt);
        if (P.clave[s] && this.level >= 2 && !song.bells) this.clave(tt);
        if (song.bells && P.bell[s] && this.level >= 2) this.agogo(tt, s);
      } else if (!game && s % 8 === 0) {
        this.kick(t, 0.35);
      }

      // bass: log drum (Amapiano) or round sub bass (Afrobeats/highlife)
      if (song.log && P[song.log][s] && (game || s === 3 || s === 9)) this.logDrum(tt, chord.root * Math.pow(2, LOGP[s] / 12), (game ? 0.5 : 0.3) * soft);
      if (song.bass && P.bass[s]) this.sub(tt, chord.root, game ? 0.42 : 0.26, sd * (s === 0 ? 5 : 3.5));

      // chords
      if (P[song.keys][s]) this.keys(tt, chord.tones.slice(0, 4), (game ? 0.05 : 0.045) * soft);
      if (song.guitar && s % 2 === 1 && (game || s % 4 === 1)) {
        const n = chord.tones[[1, 2, 3, 2, 0, 2, 3, 1][(s >> 1) % 8]] * 2;
        this.guitar(tt, n, game ? 0.05 : 0.035);
      }

      // lead: written melody, or an arpeggio over the chord
      if (song.melody) {
        if (game || bar % 2 === 1) {
          const idx = song.melody[(bar % 2) * 16 + s];
          if (idx >= 0) {
            const f = chord.tones[idx % 4] * (idx >= 4 ? 4 : 2);
            this.lead(song.lead, tt, f, (game ? 0.06 : 0.04) * (hot > 0.15 || !game ? 1 : 0.75));
          }
        }
      } else if (s % 2 === 0 && (hot > 0.15 || !game || song.soft)) {
        const n = chord.tones[song.arp[(s / 2) % 8] % chord.tones.length] * 2;
        this.lead(song.lead, tt, n, game ? 0.05 : 0.04);
      }
    },

    /* ---------- instruments ---------- */
    env(g, t, a, peak, d) {
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + a);
      g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
    },
    osc(type, f, t, a, v, d, panX) {
      const o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = type; o.frequency.value = f;
      this.env(g, t, a, v, d);
      o.connect(g);
      if (panX !== undefined && this.ctx.createStereoPanner) { const p = this.ctx.createStereoPanner(); p.pan.value = panX; g.connect(p); p.connect(this.out); } else g.connect(this.out);
      o.start(t); o.stop(t + a + d + 0.05);
      return o;
    },
    kick(t, v = 0.9) {
      const o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(140, t);
      o.frequency.exponentialRampToValueAtTime(42, t + 0.14);
      this.env(g, t, 0.004, v, 0.26);
      o.connect(g); g.connect(this.out);
      o.start(t); o.stop(t + 0.32);
    },
    noiseHit(t, type, freq, q, v, d) {
      const src = this.ctx.createBufferSource(), f = this.ctx.createBiquadFilter(), g = this.ctx.createGain();
      src.buffer = this.noise;
      f.type = type; f.frequency.value = freq; f.Q.value = q;
      this.env(g, t, 0.002, v, d);
      src.connect(f); f.connect(g); g.connect(this.out);
      src.start(t, Math.random() * 0.5, d + 0.05);
    },
    shaker(t, v) { this.noiseHit(t, 'highpass', 7000, 0.7, v, 0.045); },
    clap(t) {
      this.noiseHit(t, 'bandpass', 1500, 0.9, 0.35, 0.12);
      this.noiseHit(t + 0.012, 'bandpass', 1800, 0.9, 0.22, 0.09);
    },
    clave(t) { this.osc('triangle', 2400, t, 0.002, 0.08, 0.05); },
    agogo(t, s) { this.osc('square', s % 4 === 0 ? 880 : 1320, t, 0.002, 0.03, 0.09, 0.3); },
    logDrum(t, f, v) {
      const o = this.ctx.createOscillator(), o2 = this.ctx.createOscillator();
      const g = this.ctx.createGain(), lp = this.ctx.createBiquadFilter();
      o.type = 'sine'; o2.type = 'triangle';
      o.frequency.setValueAtTime(f * 1.9, t);
      o.frequency.exponentialRampToValueAtTime(f, t + 0.05);
      o2.frequency.setValueAtTime(f * 1.9, t);
      o2.frequency.exponentialRampToValueAtTime(f, t + 0.05);
      lp.type = 'lowpass'; lp.frequency.value = 900;
      this.env(g, t, 0.005, v, 0.42);
      o.connect(g); o2.connect(lp); lp.connect(g); g.connect(this.out);
      o.start(t); o2.start(t); o.stop(t + 0.5); o2.stop(t + 0.5);
    },
    sub(t, f, v, d) {
      const o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(v, t + 0.01);
      g.gain.setValueAtTime(v * 0.8, t + d * 0.7);
      g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(g); g.connect(this.out);
      o.start(t); o.stop(t + d + 0.05);
    },
    keys(t, tones, v) { for (const f of tones) this.osc('triangle', f, t, 0.01, v, 0.32); },
    guitar(t, f, v) {
      // bright, short highlife guitar: sawtooth through a lowpass that closes fast
      const o = this.ctx.createOscillator(), g = this.ctx.createGain(), lp = this.ctx.createBiquadFilter();
      o.type = 'sawtooth'; o.frequency.value = f;
      lp.type = 'lowpass'; lp.Q.value = 2;
      lp.frequency.setValueAtTime(3200, t); lp.frequency.exponentialRampToValueAtTime(600, t + 0.15);
      this.env(g, t, 0.003, v, 0.16);
      o.connect(lp); lp.connect(g);
      if (this.ctx.createStereoPanner) { const p = this.ctx.createStereoPanner(); p.pan.value = -0.35; g.connect(p); p.connect(this.out); } else g.connect(this.out);
      o.start(t); o.stop(t + 0.22);
    },
    lead(kind, t, f, v) {
      if (kind === 'flute') {
        const o = this.osc('sine', f, t, 0.04, v * 1.1, 0.28, 0.2);
        const lfo = this.ctx.createOscillator(), lg = this.ctx.createGain();
        lfo.frequency.value = 5.5; lg.gain.value = f * 0.012;
        lfo.connect(lg); lg.connect(o.frequency); lfo.start(t); lfo.stop(t + 0.35);
        this.noiseHit(t, 'bandpass', f * 2, 3, v * 0.25, 0.05);
      } else if (kind === 'bell') {
        this.osc('sine', f, t, 0.002, v, 0.5, 0.25);
        this.osc('sine', f * 2.76, t, 0.002, v * 0.35, 0.22, 0.25);
      } else if (kind === 'guitar') {
        this.guitar(t, f, v * 1.1);
      } else if (kind === 'keys') {
        this.osc('triangle', f, t, 0.006, v, 0.4, Math.sin(t * 2) * 0.4);
        this.osc('sine', f * 2, t, 0.004, v * 0.3, 0.2);
      } else {
        this.osc('sine', f, t, 0.003, v, 0.18, Math.sin(t * 3) * 0.5);
      }
    },
    talkingDrum(t, s) {
      const o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = 'sine';
      const base = 150 + (s % 3) * 25;
      const up = s % 2 === 0;
      o.frequency.setValueAtTime(up ? base : base * 1.6, t);
      o.frequency.exponentialRampToValueAtTime(up ? base * 1.7 : base * 0.9, t + 0.12);
      this.env(g, t, 0.004, 0.55, 0.2);
      o.connect(g); g.connect(this.out);
      o.start(t); o.stop(t + 0.26);
    },
  };

  window.OWMusic = M;
})();
