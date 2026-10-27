/* ==========================================================
   OFFICE WAHALA — original soundtrack engine
   An Afrobeats / Amapiano-style groove generated live with the
   Web Audio API: kick, clap, shekere, clave, log-drum bass,
   highlife-style keys and a talking-drum fill. 100% original,
   no audio files, no licences needed.

   Optional: set CONFIG.MUSIC_TRACKS in game.js to a list of
   licensed audio files and they will be played instead.
   ========================================================== */
(function () {
  'use strict';

  // A minor / C major highlife-style progression, one chord per bar.
  // Each chord: [log-drum root (Hz), chord tones (Hz)]
  const N = (semi) => 220 * Math.pow(2, semi / 12); // semitones from A3
  const CHORDS = [
    { root: N(-12), tones: [N(0), N(3), N(7), N(10)] },   // Am7
    { root: N(-7), tones: [N(5), N(8), N(12), N(15)] },   // Dm7
    { root: N(-14), tones: [N(-2), N(2), N(5), N(10)] },  // G7
    { root: N(-9), tones: [N(3), N(7), N(10), N(14)] },   // Cmaj7
  ];

  //            0 1 2 3 4 5 6 7 8 9 A B C D E F
  const KICK = [1,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0];
  const KICK2= [1,0,0,1,0,0,1,0,1,0,0,1,0,0,1,0];
  const CLAP = [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0];
  const CLAVE= [1,0,0,1,0,0,1,0,0,0,1,0,1,0,0,0];
  const LOG  = [0,0,0,1,0,0,1,0,0,1,0,1,0,0,1,0];
  const LOGP = [0,0,0,0,0,0,7,0,0,0,0,5,0,0,0,0]; // semitone jumps for some log-drum hits
  const KEYS = [0,0,1,0,0,0,1,0,0,0,1,0,0,1,0,0];
  const ARP  = [0,1,2,3,2,1,3,2];

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
    bpm: 102,
    step: 0,
    nextTime: 0,
    timer: null,
    fillAt: -1,
    tracks: [],
    trackIdx: 0,
    audioEl: null,
    trackSrc: null,

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
    },

    /* ---------- public controls ---------- */
    start(mode) {
      if (!this.ctx || !this.on) return;
      this.mode = mode || this.mode;
      if (this.tracks.length) { this.startTracks(); return; }
      if (this.running) { this.fadeTo(this.targetVol(), 0.4); return; }
      this.running = true;
      this.step = 0;
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
    setMode(mode) { this.mode = mode; if (this.running) this.fadeTo(this.targetVol(), 0.5); },
    setLevel(level) {
      this.level = level;
      this.bpm = Math.min(124, 104 + (level - 1) * 2);
      if (this.audioEl) this.audioEl.playbackRate = Math.min(1.12, 1 + (level - 1) * 0.008);
    },
    muffle(on) {
      if (!this.filter) return;
      const t = this.ctx.currentTime;
      this.filter.frequency.cancelScheduledValues(t);
      this.filter.frequency.setValueAtTime(this.filter.frequency.value, t);
      this.filter.frequency.exponentialRampToValueAtTime(on ? 420 : 18000, t + (on ? 0.5 : 0.9));
    },
    fill() { this.fillAt = (Math.floor(this.step / 16) + 1) * 16 % 64; }, // talking drum on next bar
    targetVol() { return this.mode === 'menu' ? this.vol * 0.55 : this.vol; },
    fadeTo(v, s) {
      if (!this.out) return;
      const t = this.ctx.currentTime;
      this.out.gain.cancelScheduledValues(t);
      this.out.gain.setValueAtTime(this.out.gain.value, t);
      this.out.gain.linearRampToValueAtTime(v, t + s);
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
          // Bad file: fall back to the generated groove.
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
      const stepDur = 60 / this.bpm / 4;
      while (this.nextTime < ctx.currentTime + 0.12) {
        this.playStep(this.step, this.nextTime, stepDur);
        this.nextTime += stepDur;
        this.step = (this.step + 1) % 64;
      }
    },

    playStep(step, t, sd) {
      const s = step % 16;
      const bar = Math.floor(step / 16);
      const chord = CHORDS[bar];
      const game = this.mode === 'game';
      const hot = game ? Math.min(1, (this.level - 1) / 6) : 0;
      const swing = s % 2 === 1 ? sd * 0.12 : 0; // light afro swing
      const tt = t + swing;

      // talking drum fill replaces percussion for one bar
      const filling = this.fillAt >= 0 && step >= this.fillAt && step < this.fillAt + 16;
      if (filling) {
        if ([0, 3, 6, 8, 10, 11, 12, 14].includes(s)) this.talkingDrum(tt, s);
        if (s === 15) this.fillAt = -1;
      }

      // shekere (16ths, accents on the offbeat)
      this.shaker(tt, s % 4 === 2 ? 0.16 : 0.07);

      if (game && !filling) {
        if ((hot > 0.4 ? KICK2 : KICK)[s]) this.kick(t);
        if (CLAP[s]) this.clap(tt);
        if (CLAVE[s] && this.level >= 2) this.clave(tt);
      } else if (!game && s % 8 === 0) {
        this.kick(t, 0.35);
      }

      // log drum bass (the Amapiano signature)
      if (LOG[s] && (game || s === 3 || s === 9)) this.logDrum(tt, chord.root * Math.pow(2, LOGP[s] / 12), game ? 0.5 : 0.3);

      // highlife keys: chord stabs plus a gentle arpeggio
      if (KEYS[s]) this.keys(tt, chord.tones, game ? 0.05 : 0.045);
      if (s % 2 === 0 && (hot > 0.15 || !game)) {
        const n = chord.tones[ARP[(s / 2) % 8]] * 2;
        this.pluck(tt, n, game ? 0.05 : 0.04);
      }
    },

    /* ---------- instruments ---------- */
    env(g, t, a, peak, d) {
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(peak, t + a);
      g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
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
    clave(t) {
      const o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = 'triangle'; o.frequency.value = 2400;
      this.env(g, t, 0.002, 0.08, 0.05);
      o.connect(g); g.connect(this.out);
      o.start(t); o.stop(t + 0.08);
    },
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
    keys(t, tones, v) {
      for (const f of tones) {
        const o = this.ctx.createOscillator(), g = this.ctx.createGain();
        o.type = 'triangle'; o.frequency.value = f;
        this.env(g, t, 0.01, v, 0.32);
        o.connect(g); g.connect(this.out);
        o.start(t); o.stop(t + 0.4);
      }
    },
    pluck(t, f, v) {
      const o = this.ctx.createOscillator(), g = this.ctx.createGain(), p = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
      o.type = 'sine'; o.frequency.value = f;
      this.env(g, t, 0.003, v, 0.18);
      o.connect(g);
      if (p) { p.pan.value = Math.sin(t * 3) * 0.5; g.connect(p); p.connect(this.out); } else g.connect(this.out);
      o.start(t); o.stop(t + 0.22);
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
