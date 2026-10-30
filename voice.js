/* ==========================================================
   OFFICE WAHALA — voice lines
   Two ways to speak, chosen automatically:
   1. Studio clips: if voices/voices.json exists (made by
      tools/generate_voices.py with Microsoft's Nigerian neural
      voices), those MP3s are played.
   2. Otherwise the device's own AI speech (Web Speech API), set to
      prefer Nigerian-English voices: Google "English (Nigeria)" on
      Android, Microsoft Abeo / Ezinne in Edge on Windows.
   Lines below are the single source of truth: the generator script
   reads the JSON between the LINES markers.
   ========================================================== */
(function () {
  'use strict';

  /*LINES_START*/
  const LINES = {
    "boss_coming":   { "who": "narrator", "prio": 3, "en": "Oga is coming!", "pcm": "Oga dey come!" },
    "boss_name":     { "who": "narrator", "prio": 3, "en": "Oga {oga} is coming!", "pcm": "Oga {oga} dey come!", "ttsOnly": true },
    "boss_caught":   { "who": "oga", "prio": 3, "en": "Come here! Kindly do the needful.", "pcm": "Come here! Do the needful." },
    "boss_escaped":  { "who": "narrator", "prio": 2, "en": "You escaped Oga!", "pcm": "You don run pass Oga!" },
    "driver":        { "who": "driver", "prio": 3, "en": "Make way! M.D. is coming!", "pcm": "Comot for road! M.D. dey come!" },
    "hr":            { "who": "hr", "prio": 3, "en": "You have a query!", "pcm": "You get query!" },
    "aunty":         { "who": "aunty", "prio": 3, "en": "Who approved this payment?", "pcm": "Who approve this payment?" },
    "aunty_freeze":  { "who": "aunty", "prio": 3, "en": "Your salary is frozen!", "pcm": "Your salary don freeze!" },
    "nepa_off":      { "who": "narrator", "prio": 3, "en": "NEPA has taken light!", "pcm": "NEPA don take light!" },
    "nepa_on":       { "who": "narrator", "prio": 3, "en": "Up NEPA!", "pcm": "Up NEPA!" },
    "salary":        { "who": "narrator", "prio": 1, "en": "Salary has entered!", "pcm": "Salary don enter!" },
    "tgif":          { "who": "narrator", "prio": 2, "en": "T.G.I.F!", "pcm": "T.G.I.F o!" },
    "leave":         { "who": "narrator", "prio": 2, "en": "Leave approved!", "pcm": "Leave don approve!" },
    "level":         { "who": "narrator", "prio": 1, "en": "Another hour. Keep going!", "pcm": "Another hour. Hold body!" },
    "report_done":   { "who": "narrator", "prio": 2, "en": "Report submitted!", "pcm": "Report don submit!" },
    "streak":        { "who": "narrator", "prio": 1, "en": "You are on fire!", "pcm": "You dey on fire!" },
    "use_autoreply": { "who": "narrator", "prio": 3, "en": "Out of office!", "pcm": "I no dey office!" },
    "use_fakecall":  { "who": "narrator", "prio": 3, "en": "Sir, the M.D. is calling you!", "pcm": "Sir, M.D. dey call you!" },
    "use_puffpuff":  { "who": "narrator", "prio": 3, "en": "Puff-puff for everybody!", "pcm": "Puff-puff for everybody!" },
    "ev_salary":     { "who": "narrator", "prio": 3, "en": "Salary week! Money everywhere!", "pcm": "Salary week! Money full everywhere!" },
    "ev_audit":      { "who": "narrator", "prio": 3, "en": "Audit! Touch nothing!", "pcm": "Audit! No touch anything!" },
    "ev_travel":     { "who": "narrator", "prio": 3, "en": "Oga is travelling!", "pcm": "Oga don travel!" },
    "ev_agm":        { "who": "narrator", "prio": 3, "en": "A.G.M. day. Every meeting is compulsory.", "pcm": "A.G.M. day. Every meeting na by force." },
    "ev_alert":      { "who": "narrator", "prio": 3, "en": "Bank alert!", "pcm": "Alert don land!" },
    "commute":       { "who": "narrator", "prio": 3, "en": "Get to work before eight!", "pcm": "Reach office before eight o!" },
    "okada":         { "who": "agbero", "prio": 2, "en": "Okada! Watch your back!", "pcm": "Okada! Shine your eye!" },
    "agbero":        { "who": "agbero", "prio": 2, "en": "Owo da?", "pcm": "Owo da?" },
    "late":          { "who": "oga", "prio": 3, "en": "You are late again!", "pcm": "You late again!" },
    "early":         { "who": "narrator", "prio": 3, "en": "Early bird! Clock in.", "pcm": "Early bird! Clock in." },
    "goal_done":     { "who": "narrator", "prio": 3, "en": "Goal done! Clock out.", "pcm": "Goal don complete! Clock out." },
    "promoted":      { "who": "oga", "prio": 3, "en": "Congratulations. You have been promoted!", "pcm": "Congratulations. Dem don promote you!" },
    "game_over":     { "who": "oga", "prio": 3, "en": "See me in my office.", "pcm": "Come see me for my office." },
    "new_best":      { "who": "narrator", "prio": 3, "en": "New personal best!", "pcm": "New personal best!" },
    "a1":  { "who": "colleague", "prio": 0, "en": "We are a family here.", "pcm": "We be family for here o." },
    "a2":  { "who": "colleague", "prio": 0, "en": "Kindly do the needful.", "pcm": "Do the needful sharp sharp." },
    "a3":  { "who": "colleague", "prio": 0, "en": "Please revert A.S.A.P.", "pcm": "Revert A.S.A.P. abeg." },
    "a4":  { "who": "colleague", "prio": 0, "en": "Per my last email.", "pcm": "As I talk for my last email." },
    "a5":  { "who": "colleague", "prio": 0, "en": "Who ate my jollof in the office fridge?", "pcm": "Who chop my jollof for office fridge?" },
    "a6":  { "who": "colleague", "prio": 0, "en": "Just one small task.", "pcm": "Na just one small task." },
    "a7":  { "who": "colleague", "prio": 0, "en": "Abeg, let me breathe!", "pcm": "Abeg, make I breathe!" },
    "a8":  { "who": "colleague", "prio": 0, "en": "Send me the soft copy.", "pcm": "Send me the soft copy." },
    "h_mum_coming":  { "who": "narrator", "prio": 3, "en": "Mummy is coming!", "pcm": "Mummy dey come!" },
    "h_count":       { "who": "mum", "prio": 3, "en": "Come here! I will count to three!", "pcm": "Come here! I go count reach three!" },
    "h_caught":      { "who": "mum", "prio": 3, "en": "Will you do it again?", "pcm": "You go do am again?" },
    "h_escaped":     { "who": "narrator", "prio": 2, "en": "You escaped Mummy!", "pcm": "You don run pass Mummy!" },
    "h_dad":         { "who": "dad", "prio": 3, "en": "Who did this? Come to my room.", "pcm": "Who do this one? Come my room." },
    "h_dad_caught":  { "who": "dad", "prio": 3, "en": "Come to my room. Now.", "pcm": "Come my room. Now now." },
    "h_tattle":      { "who": "sister", "prio": 3, "en": "Mummy! Come and see what he did!", "pcm": "Mummy! Come see wetin e do!" },
    "h_tattle_warn": { "who": "sister", "prio": 1, "en": "I am watching you.", "pcm": "I dey watch you o." },
    "h_change":      { "who": "mum", "prio": 3, "en": "Where is my change?", "pcm": "Where my change?" },
    "h_grandma":     { "who": "narrator", "prio": 2, "en": "Grandma is here!", "pcm": "Grandma don come!" },
    "h_over":        { "who": "mum", "prio": 3, "en": "Go and sleep. Tomorrow is another day.", "pcm": "Go sleep. Tomorrow na another day." }
  };
  /*LINES_END*/

  // Voice casting for device speech: [pitch, rate, preferred gender]
  const CAST = {
    narrator: [1.0, 1.05, 'f'],
    oga: [0.7, 0.95, 'm'],
    driver: [0.95, 1.2, 'm'],
    agbero: [0.85, 1.1, 'm'],
    hr: [1.1, 1.0, 'f'],
    aunty: [1.25, 1.0, 'f'],
    colleague: [1.05, 1.08, 'm'],
    mum: [1.12, 1.08, 'f'],
    dad: [0.62, 0.9, 'm'],
    sister: [1.45, 1.15, 'f'],
  };

  const V = {
    LINES,
    enabled: false,
    lang: 'en',
    clips: null,        // { en: {id: file}, pcm: {...} } when studio clips exist
    voices: { m: null, f: null, any: null },
    busyUntil: 0,
    curPrio: -1,
    audio: null,
    ready: false,
    hasTTS: 'speechSynthesis' in window && typeof window.SpeechSynthesisUtterance === 'function',

    init() {
      if (this.ready) return;
      this.ready = true;
      if (this.hasTTS) {
        this.pickVoices();
        try { speechSynthesis.addEventListener('voiceschanged', () => this.pickVoices()); } catch (e) { /* old browsers */ }
      }
      if (location.protocol === 'http:' || location.protocol === 'https:') {
        fetch('voices/voices.json', { cache: 'no-cache' })
          .then((r) => (r.ok ? r.json() : null))
          .then((j) => { if (j && j.lines) this.clips = j.lines; })
          .catch(() => {});
      }
    },

    pickVoices() {
      let list = [];
      try { list = speechSynthesis.getVoices() || []; } catch (e) { list = []; }
      if (!list.length) return;
      const score = (v) => {
        const lang = (v.lang || '').toLowerCase().replace('_', '-');
        const name = (v.name || '').toLowerCase();
        let s = 0;
        if (lang === 'en-ng' || name.includes('nigeria')) s += 100;
        else if (['en-gh', 'en-ke', 'en-za', 'en-tz'].includes(lang)) s += 45;
        else if (lang === 'en-gb') s += 30;
        else if (lang.startsWith('en')) s += 15;
        else return -1;
        if (name.includes('natural') || name.includes('neural') || name.includes('online') || name.includes('google')) s += 12;
        return s;
      };
      const gender = (v) => {
        const n = (v.name || '').toLowerCase();
        if (/abeo|male\b|guy|david|mark|george|ryan|thomas|daniel|james/.test(n) && !/female/.test(n)) return 'm';
        if (/ezinne|female|woman|zira|susan|hazel|sonia|libby|aria|jenny|samantha|karen|moira|tessa/.test(n)) return 'f';
        return '';
      };
      const ranked = list.map((v) => [score(v), v]).filter(([s]) => s >= 0).sort((a, b) => b[0] - a[0]);
      if (!ranked.length) return;
      const best = ranked[0][0];
      const top = ranked.filter(([s]) => s >= best - 15).map(([, v]) => v);
      this.voices.any = top[0];
      this.voices.m = top.find((v) => gender(v) === 'm') || null;
      this.voices.f = top.find((v) => gender(v) === 'f') || null;
    },

    describe() {
      if (this.clips) return 'Studio voices (Nigerian neural)';
      const v = this.voices.f || this.voices.m || this.voices.any;
      if (!this.hasTTS) return 'Not supported on this browser';
      if (!v) return 'Device voice';
      return v.name + (/(en[-_]ng|nigeria)/i.test(v.lang + v.name) ? '' : ' (no Nigerian voice on this device)');
    },

    stop() {
      try { if (this.hasTTS) speechSynthesis.cancel(); } catch (e) { /* ignore */ }
      if (this.audio) { try { this.audio.pause(); } catch (e) { /* ignore */ } }
      this.busyUntil = 0; this.curPrio = -1;
    },

    // speak(id, {oga}) — returns true if something was spoken
    say(id, vars) {
      if (!this.enabled) return false;
      const line = LINES[id];
      if (!line) return false;
      const now = performance.now();
      const busy = now < this.busyUntil;
      if (busy && line.prio <= this.curPrio) return false;
      if (busy) this.stop();
      const lang = this.lang === 'pcm' ? 'pcm' : 'en';
      let text = line[lang] || line.en;
      if (vars) for (const k of Object.keys(vars)) text = text.replace('{' + k + '}', vars[k]);
      const clipFile = !line.ttsOnly && this.clips && this.clips[lang] && this.clips[lang][id];
      this.curPrio = line.prio;
      if (clipFile) {
        try {
          if (!this.audio) this.audio = new Audio();
          this.audio.src = 'voices/' + lang + '/' + clipFile;
          this.audio.volume = 0.95;
          this.audio.play().catch(() => {});
          this.busyUntil = now + 2200;
          return true;
        } catch (e) { /* fall back to speech */ }
      }
      if (!this.hasTTS) return false;
      try {
        const c = CAST[line.who] || CAST.narrator;
        const u = new SpeechSynthesisUtterance(text.replace(/\{\w+\}/g, ''));
        const voice = (c[2] === 'm' ? this.voices.m : this.voices.f) || this.voices.any;
        if (voice) { u.voice = voice; u.lang = voice.lang; } else u.lang = 'en-NG';
        // If we fell back to the other gender's voice, push pitch further to tell characters apart.
        const swapped = voice && ((c[2] === 'm' && voice === this.voices.f) || (c[2] === 'f' && voice === this.voices.m));
        u.pitch = Math.max(0.1, Math.min(2, c[0] * (swapped ? (c[2] === 'm' ? 0.8 : 1.2) : 1)));
        u.rate = c[1];
        u.volume = 1;
        u.onend = () => { this.busyUntil = 0; this.curPrio = -1; };
        speechSynthesis.speak(u);
        this.busyUntil = now + 600 + text.length * 70;
        return true;
      } catch (e) { return false; }
    },
  };

  window.OWVoice = V;
})();
