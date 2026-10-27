/* ==========================================================
   OFFICE WAHALA — a Nigerian office arcade game
   Vanilla JavaScript + HTML Canvas. No dependencies.
   Built by Mmadubuko Micheal, CEO, Analaize Limited
   (www.analaize.com.ng). MIT License.
   ========================================================== */
(() => {
  'use strict';

  /* ==================== CONFIG (edit me) ==================== */
  const CONFIG = {
    TITLE: 'Office Wahala',

    // Public URL of your deployed game. Used in share messages and challenge links.
    SHARE_URL: 'https://officewahala.netlify.app',

    // Optional global leaderboard (Supabase). Leave both empty for local-only
    // personal bests. The anon key is designed to be public; security comes from
    // the SQL in supabase/schema.sql. NEVER paste a service_role key here.
    SUPABASE_URL: '',
    SUPABASE_ANON_KEY: '',

    // Optional: licensed music files to play instead of the generated soundtrack,
    // e.g. ['music/track1.mp3', 'music/track2.mp3']. Only use tracks you have a
    // licence for. Leave empty to use the original generated Afrobeats groove.
    MUSIC_TRACKS: [],

    // Office Leagues API (Netlify Function in netlify/functions/league.mjs).
    // The Leagues button only appears when this endpoint answers.
    LEAGUE_API: 'api/league',

    // Developer credit (shown on the share image)
    CREDIT: 'Built by Analaize Limited · analaize.com.ng',

    START_LIVES: 3,
    MAX_LIVES: 5,
    LEVEL_SECONDS: 20,      // a new level every N seconds (= one office hour)
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
    blackoutFromLevel: 3,   // NEPA starts taking light at this level
    blackoutEvery: [32, 50],// seconds between blackouts
    blackoutLength: 7,      // seconds of darkness
    eventFromLevel: 2,      // shift events (Salary week, Audit, AGM day…) from this level
    eventEvery: [38, 55],   // seconds between events
    eventLength: 15,        // seconds each event lasts
    taskFromLevel: 2,       // glowing "submit report" desks from this level
    taskEvery: [22, 34],    // seconds between report desks
    taskSeconds: 3,         // seconds to stand on a desk
    commuteSeconds: 15,     // length of the morning commute
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

  /* ==================== Words (English + Pidgin) ==================== */
  const MESSAGES = {
    en: {
      ambient: [
        'We are a family here.', 'Abeg, let me breathe!', 'Kindly do the needful.', 'Please revert ASAP.',
        'Per my last email…', 'Send me the soft copy.', 'Who ate my jollof in the office fridge?',
        'Up NEPA! Light is back.', 'Let us take this offline.', 'Traffic on Third Mainland was madness today.',
        'Is the AC working or is it just me?', 'Who approved this leave?', 'Please CC me on that mail.',
        'Can you join this call quickly?', 'Salary will land soon. Hold on.', 'Just one small task.',
      ],
      hit: {
        file: 'Falling files! Who arranged this cabinet?', task: 'Please revert ASAP.',
        meeting: 'Are you available for a quick meeting?', deadline: 'This deadline was yesterday o!',
        network: 'Network don disappear!', printer: 'Printer jam! Again!',
        colleague: 'Just one small task…', boss: 'Oga caught you! Kindly do the needful.',
      },
      bossTalk: ['Come here!', 'Quick one…', 'Do the needful!', 'Where is the report?', 'My office. Now.'],
      colleagueTalk: ['One small task', 'Abeg help me', 'Quick favour…'],
      over: [
        { max: 499, text: 'You did not reach lunch break. Oga is already asking for you.' },
        { max: 1499, text: 'You survived till 10am. Small small, you will get there.' },
        { max: 2999, text: 'Lunch break survivor. Oga is impressed… slightly.' },
        { max: 5999, text: 'Closing time champion. Salary has entered!' },
        { max: 9999, text: 'Employee of the month. They will give you more work now.' },
        { max: Infinity, text: 'Legend of the office. HR wants to frame your photo.' },
      ],
      newBest: 'New personal best! Promotion loading…',
    },
    pcm: {
      ambient: [
        'We be family for here o.', 'Abeg, make I breathe!', 'Do the needful sharp sharp.', 'Revert ASAP abeg.',
        'As I talk for my last email…', 'Send me the soft copy.', 'Who chop my jollof for office fridge?',
        'Up NEPA! Light don come.', 'Make we discuss am later.', 'Third Mainland traffic na wa today.',
        'This AC dey work at all?', 'Who approve this leave?', 'CC me for that mail o.',
        'You fit join this call quick?', 'Salary go soon land. Hold body.', 'Na just one small task.',
      ],
      hit: {
        file: 'Files don fall! Who arrange this cabinet?', task: 'Revert ASAP o!',
        meeting: 'You get small time for meeting?', deadline: 'This deadline na yesterday!',
        network: 'Network don disappear!', printer: 'Printer don jam again!',
        colleague: 'Na just one small task…', boss: 'Oga don catch you! Do the needful.',
      },
      bossTalk: ['Come here!', 'Quick one…', 'Do the needful!', 'Where the report?', 'My office. Now now.'],
      colleagueTalk: ['One small task', 'Abeg help me', 'Small favour…'],
      over: [
        { max: 499, text: 'You no reach lunch break. Oga don dey find you.' },
        { max: 1499, text: 'You last reach 10am. Small small, you go reach.' },
        { max: 2999, text: 'Lunch break survivor. Oga dey impressed… small.' },
        { max: 5999, text: 'Closing time champion. Salary don enter!' },
        { max: 9999, text: 'Employee of the month. Dem go give you more work now.' },
        { max: Infinity, text: 'Office legend. HR wan frame your picture.' },
      ],
      newBest: 'New personal best! Promotion dey load…',
    },
  };

  const STR = {
    en: {
      clockIn: 'Arrow keys or WASD to move. Clock in!', clockInTouch: 'Drag anywhere to move. Clock in!',
      dailyStart: 'Daily shift: same office for everyone today.',
      boss: 'Oga is coming!', level: 'Level', nepaOff: 'NEPA took light!', nepaBanner: 'NEPA took light!',
      nepaOn: 'Up NEPA! Light is back.', nepaBonus: 'Survived the blackout! +150', escaped: 'Escaped Oga! +100',
      leaveBoss: 'Who approved this leave?!', copied: 'Challenge copied. Paste it in your office group chat!',
      copyFail: 'Could not copy automatically. Your score: ', badge: 'Badge unlocked: ', targetBeat: 'Challenge beaten!',
      target: 'Beat', autoLow: 'Switched to low graphics for smoother play.',
      deadlines: 'Deadlines incoming. Shift!', printers: 'Printers on the loose. Watch the sides!',
      colleague: 'Your colleague has "one small task" for you…',
      imgSaved: 'Image saved. Post it on your WhatsApp Status!', imgFail: 'Could not create the image on this device.',
      salary: 'Salary has entered!', fuel: 'Gen fuel! Speed boost', leave: 'Leave approved! Nothing can touch you',
      tgif: 'TGIF! Friday bonus +500', life: '+1 life', lives2: '-2 lives', life1: '-1 life', close: 'Close one! +10',
      onLeave: 'On leave!', streak: 'Streak', newStaff: 'New staff', colleagueAnon: 'A colleague',
      challengeCard: (by, s, daily) => `<b>${by}</b> scored <b>${s}</b>${daily ? ' on today\'s daily shift' : ''} and challenged you. Can you beat it?`,
      challengeWon: (by, d) => `You beat ${by} by ${d} points!`, challengeLost: (by, d) => `${by} is still ahead by ${d} points. Try again.`,
      shareText: (tm, s, daily) => `I survived ${tm} of Office Wahala${daily ? ' (daily shift)' : ''} and scored ${s} points! Can you beat my score? 🇳🇬`,
      shareBeat: (by, x) => ` I just beat ${by}'s ${x}.`,
      dailyBest: (s) => `Today's best: ${s}`, dailyNone: 'Same office for everyone today',
      reviewThanks: 'Thank you! Your review has been sent to the developer.',
      reviewFail: 'Could not send from here. Use the WhatsApp link below instead.', reviewNeed: 'Write a short review first.',
      reviewSending: 'Sending…', firstShift: 'First shift', shiftOver: 'Shift over', newBestStamp: 'New best',
      newBadges: 'New badges this shift', locked: 'Locked', nextDay: 'next day',
    },
    pcm: {
      clockIn: 'Use arrow keys or WASD waka. Clock in!', clockInTouch: 'Drag anywhere make you waka. Clock in!',
      dailyStart: 'Daily shift: everybody dey play the same office today.',
      boss: 'Oga dey come!', level: 'Level', nepaOff: 'NEPA don take light!', nepaBanner: 'NEPA don take light!',
      nepaOn: 'Up NEPA! Light don come back.', nepaBonus: 'You survive the blackout! +150', escaped: 'You don run pass Oga! +100',
      leaveBoss: 'Who approve this leave?!', copied: 'Challenge don copy. Paste am for your office group!',
      copyFail: 'E no fit copy. Your score na ', badge: 'New badge: ', targetBeat: 'You don beat the challenge!',
      target: 'Beat', autoLow: 'We don switch to low graphics make e no dey hang.',
      deadlines: 'Deadline dey come. Shift!', printers: 'Printer don dey run anyhow. Watch your side!',
      colleague: 'Your colleague get "one small task" for you…',
      imgSaved: 'Picture don save. Post am for your WhatsApp Status!', imgFail: 'E no fit make the picture for this phone.',
      salary: 'Salary don enter!', fuel: 'Gen fuel! You go fast', leave: 'Leave don approve! Nothing fit touch you',
      tgif: 'TGIF! Friday bonus +500', life: '+1 life', lives2: '-2 lives', life1: '-1 life', close: 'E remain small! +10',
      onLeave: 'I dey leave!', streak: 'Streak', newStaff: 'New staff', colleagueAnon: 'One colleague',
      challengeCard: (by, s, daily) => `<b>${by}</b> score <b>${s}</b>${daily ? ' for today daily shift' : ''} and e dey challenge you. You fit beat am?`,
      challengeWon: (by, d) => `You don beat ${by} with ${d} points!`, challengeLost: (by, d) => `${by} still dey lead with ${d} points. Try again.`,
      shareText: (tm, s, daily) => `I last ${tm} for Office Wahala${daily ? ' (daily shift)' : ''} and I score ${s} points! You fit beat me? 🇳🇬`,
      shareBeat: (by, x) => ` I don beat ${by} ${x}.`,
      dailyBest: (s) => `Your best today: ${s}`, dailyNone: 'Everybody dey play the same office today',
      reviewThanks: 'Thank you! Your review don reach the developer.',
      reviewFail: 'E no fit send from here. Use the WhatsApp link for down.', reviewNeed: 'Write small review first.',
      reviewSending: 'E dey send…', firstShift: 'First shift', shiftOver: 'Shift don end', newBestStamp: 'New best',
      newBadges: 'New badges for this shift', locked: 'E never open', nextDay: 'next day',
    },
  };

  // Pidgin for elements marked data-i18n in index.html (English is read from the page itself).
  const UI_PCM = {
    hud_score: 'Score', hud_clock: 'Office time', hud_level: 'Level', hud_daily: 'Daily shift',
    pu_leave: 'I dey leave', pu_fuel: 'Gen fuel', staff_id: 'Staff ID',
    subtitle: 'Dodge your oga. Pack your salary. Survive the wahala.',
    challenge_clear: 'Comot this challenge', play: 'Clock in make we start', daily: 'Today daily shift',
    name_label: 'Name', position: 'Position', best: 'Your best', badges: 'Badges',
    friday_note: 'Na Friday! TGIF bonus go show pass today.',
    nav_wardrobe: 'Cloth &amp; badges', nav_settings: 'Settings', nav_review: 'Drop review', nav_board: 'Leaderboard', nav_install: 'Install am',
    ios_install: 'To install for iPhone: press Share, then “Add to Home Screen”. E go work without data.',
    howto: 'How to play', on_computer: 'For computer', or: 'or', to_move: 'to waka', k_pause: 'pause', k_start: 'start',
    k_sound: 'sound', k_boss: 'hide from oga', on_phone: 'For phone',
    phone_how: 'Put one finger anywhere for screen come drag am. Your worker go follow your finger.',
    grab: 'Pack these ones', dodge: 'Dodge these ones', i_salary: 'Salary', i_data: 'Data', i_lunch: 'Lunch money',
    i_leave: 'Leave approval: nothing fit touch you', i_fuel: 'Gen fuel: you go fast, and e go give you light when NEPA take light',
    i_friday: 'Friday bonus +500, e rare, and e go give you one life back',
    o_boss: 'Oga. E go cost you two lives. Run pass am, collect +100', o_meeting: '"Quick" meeting',
    o_task: 'Urgent task and files wey dey fall', o_deadline: 'Last-minute deadline', o_network: 'Network wey don disappear',
    o_printer: 'Printer wey dey run anyhow', o_colleague: 'That colleague with "one small task"',
    tip: 'Pack five things one after the other without hit to build streak. From level 3, NEPA fit take light: stay where you fit see until light come back.',
    free_line: 'E free. No sign-up. E go work without data once you install am.', contact_dev: 'Call the developer:',
    pause_title: 'I don comot small', pause_body: 'Abeg, make I breathe. I go soon come back.',
    resume: 'Continue', restart: 'Start am again', bosskey_btn: 'Boss key: hide the game', main_menu: 'Go back to menu',
    over_title: 'How you take do for work', time_survived: 'How long you last', clocked_out: 'You close by',
    items: 'Things wey you pack', streak_long: 'Longest streak', close_calls: 'Close shave',
    your_name: 'Your name (e go show for challenge)', lb_submit: 'Send am to leaderboard', again: 'Play am again',
    share: 'Challenge colleague', save_image: 'Save picture', wardrobe_title: 'Cloth &amp; badges', done: 'I don finish',
    character: 'Character', outfits: 'Cloth', sound_fx: 'Sound effects', music: 'Music', language: 'Language', graphics: 'Graphics',
    gfx_help: 'Auto go switch to Low if your phone begin hang. Low dey save battery.',
    review_title: 'Suggestion box', close: 'Close am',
    review_intro: 'Tell the developer wetin you think. Bug, idea, or new wahala wey you want make we add, everything welcome.',
    rating: 'How many stars?', review_name: 'Your name (no be by force)', review_msg: 'Your review', review_send: 'Send review',
    review_wa: 'Or send am for WhatsApp', board_title: 'Notice board: top survivors', back: 'Go back',
  };

  Object.assign(STR.en, {
    commuteStart: 'Morning commute! Reach the office before 8:00.',
    commuteHit: { okada: 'Okada nearly jammed you! +10 mins late', danfo: 'Danfo blocked the road! +10 mins late', keke: 'Keke napep! +10 mins late', agbero: 'Agbero: "Owo da?" +10 mins late', pothole: 'Pothole! +10 mins late' },
    late: (m) => `You're ${m} minutes late! Oga saw you. -1 life`, early: 'On time! Early bird bonus +100', clockedIn: 'Clocked in!',
    ev_salary: 'Salary week', ev_audit: 'Audit', ev_travel: 'Oga is travelling', ev_agm: 'AGM day', ev_alert: 'Bank alert!',
    ev_salary_d: 'Money everywhere!', ev_audit_d: 'No pickups. Survival points x2', ev_travel_d: 'No Oga, but colleagues bring double work',
    ev_agm_d: 'Every meeting is compulsory', ev_alert_d: 'Gold is raining. Grab it!', evOver: 'Event over. Back to normal wahala.',
    bossNamed: (n) => `Oga ${n} is coming!`, driverComing: "MD's driver is coming through!", hrComing: 'HR is here with queries!',
    auntyComing: 'Aunty from Accounts is looking for you…', frozen: 'Aunty Accounts froze your salary!', frozenPick: 'Frozen!',
    query: 'You got a query!', auntyMiss: 'Not today, Aunty!', taskSpawn: 'A report is waiting. Stand on the glowing desk!',
    taskDone: 'Report submitted! +300', taskLabel: 'Submit report',
    held_autoreply: 'Auto-reply', held_fakecall: 'Fake call', held_puffpuff: 'Puff-puff',
    heldGot: (n) => `${n} saved for later. Tap Use or press E!`,
    used_autoreply: 'Out of office! Everything cleared.', used_fakecall: '"Sir, MD is calling you!" Oga left.', used_puffpuff: 'Puff-puff for everybody! Colleagues stop chasing.',
    thanks: 'Thank you o!', pay: (n) => `₦${n}`, bought: 'Bought!', cantAfford: 'Not enough money yet. Work another shift!',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], daysShort: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    careerSub: (w, d) => `Week ${w} · ${d}`,
    goalText: (type, n) => ({ hour: `Survive till ${((n + 11) % 12) + 1}:00${n >= 12 ? 'pm' : 'am'}`, lunch: `Collect ${n} lunch packs`, tasks: `Submit ${n} reports`, escapes: `Outrun Oga ${n} times`, fridays: `Grab ${n} TGIF bonuses` })[type],
    goalChip: (type, cur, n) => ({ hour: `Goal: ${cur}`, lunch: `Lunch ${cur}/${n}`, tasks: `Reports ${cur}/${n}`, escapes: `Escapes ${cur}/${n}`, fridays: `TGIF ${cur}/${n}` })[type],
    goalDone: 'Goal done! Clocking out…', goalMissed: (d, txt) => `${d} goal missed: ${txt}. Try again!`,
    dayDone: (d, b) => `${d} complete! Bonus ₦${b}. Next day unlocked.`, dayStamp: 'Day complete',
    promoBody: (rank, w) => `Following your outstanding performance in week ${w}, dodging Oga, surviving NEPA and submitting reports under pressure, management is pleased to promote you to the position of ${rank}, with immediate effect. Your new salary will be paid as soon as Oga remembers.`,
    leagueCreated: (c) => `League created! Code: ${c}`, leagueJoined: (n) => `You joined ${n}!`, leagueNeedName: 'Add your name first.',
    leagueMax: 'You can be in up to 3 leagues.', leagueInvite: (n) => `You've been invited to join the office league <b>${n}</b>.`,
    leagueInviteText: (n, c, u) => `Join our Office Wahala league "${n}"! Code: ${c} ${u}`, leagueEmpty: 'No scores yet this week. Play a shift to get on the board!',
    leagueOffline: 'Could not reach the league server. Check your connection.', leagueLeft: 'You left the league.', leagueAlready: 'You are already in that league.',
    leagueCopied: 'Invite copied. Paste it in your office group chat!', leagueLoading: 'Loading…',
    ogaBad: 'Choose a friendlier name for your Oga.', ogaSaved: 'Saved. Only on this device; never shared.',
    lateChip: (m) => `${m} min late`,
  });
  Object.assign(STR.pcm, {
    commuteStart: 'Morning commute! Reach office before 8:00.',
    commuteHit: { okada: 'Okada nearly jam you! +10 mins late', danfo: 'Danfo don block road! +10 mins late', keke: 'Keke napep! +10 mins late', agbero: 'Agbero: "Owo da?" +10 mins late', pothole: 'Gutter for road! +10 mins late' },
    late: (m) => `You late ${m} minutes! Oga don see you. -1 life`, early: 'You reach on time! Early bird +100', clockedIn: 'You don clock in!',
    ev_salary: 'Salary week', ev_audit: 'Audit', ev_travel: 'Oga don travel', ev_agm: 'AGM day', ev_alert: 'Alert don land!',
    ev_salary_d: 'Money full everywhere!', ev_audit_d: 'No touch anything. Survival points x2', ev_travel_d: 'No Oga, but colleague work don double',
    ev_agm_d: 'Every meeting na by force', ev_alert_d: 'Gold dey rain. Pack am!', evOver: 'Event don end. Normal wahala don return.',
    bossNamed: (n) => `Oga ${n} dey come!`, driverComing: 'MD driver dey pass! Comot for road!', hrComing: 'HR don come with query!',
    auntyComing: 'Aunty for Accounts dey find you…', frozen: 'Aunty Accounts don freeze your salary!', frozenPick: 'E don freeze!',
    query: 'You don collect query!', auntyMiss: 'No be today, Aunty!', taskSpawn: 'Report dey wait. Stand for the desk wey dey shine!',
    taskDone: 'Report don submit! +300', taskLabel: 'Submit report',
    heldGot: (n) => `${n} dey your pocket. Press Use or E!`,
    used_autoreply: 'I no dey office! Everything don clear.', used_fakecall: '"Sir, MD dey call you!" Oga don waka.', used_puffpuff: 'Puff-puff for everybody! Colleague don stop to pursue you.',
    thanks: 'Thank you o!', bought: 'You don buy am!', cantAfford: 'Money never reach. Work another shift!',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    goalText: (type, n) => ({ hour: `Last reach ${((n + 11) % 12) + 1}:00${n >= 12 ? 'pm' : 'am'}`, lunch: `Pack ${n} lunch`, tasks: `Submit ${n} reports`, escapes: `Run pass Oga ${n} times`, fridays: `Pack ${n} TGIF bonus`})[type],
    goalDone: 'Goal don complete! You fit clock out…', goalMissed: (d, txt) => `${d} goal no complete: ${txt}. Try again!`,
    dayDone: (d, b) => `${d} don finish! Bonus ₦${b}. Next day don open.`, dayStamp: 'Day don finish',
    promoBody: (rank, w) => `Because of how you take do well for week ${w}, you dodge Oga, survive NEPA, and submit report under pressure, management happy to promote you to ${rank}, starting today. Your new salary go enter once Oga remember.`,
    leagueCreated: (c) => `League don create! Code: ${c}`, leagueJoined: (n) => `You don join ${n}!`, leagueNeedName: 'Put your name first.',
    leagueMax: 'You fit join only 3 leagues.', leagueInvite: (n) => `Dem invite you to join office league <b>${n}</b>.`,
    leagueInviteText: (n, c, u) => `Join our Office Wahala league "${n}"! Code: ${c} ${u}`, leagueEmpty: 'Nobody don score this week. Play make you enter the board!',
    leagueOffline: 'E no fit reach the league server. Check your network.', leagueLeft: 'You don comot from the league.', leagueAlready: 'You don already join that league.',
    leagueCopied: 'Invite don copy. Paste am for your office group!',
    ogaBad: 'Choose better name for your Oga.', ogaSaved: 'E don save. E dey only this phone.',
  });
  Object.assign(UI_PCM, {
    frozen: 'Salary don freeze', skip_commute: 'Skip commute', join_league: 'Join league', not_now: 'No be now',
    career: 'Career mode', wallet: 'Wallet', nav_shop: 'Shop &amp; upgrades', nav_leagues: 'Office leagues', k_use: 'use power-up',
    i_held: 'Power-up wey you fit keep: auto-reply, fake call, puff-puff. Press Use or E',
    i_task: 'Desk wey dey shine: stand there 3 seconds to submit report, +300',
    o_driver: 'MD driver: e go run pass, watch the warning', o_hr: 'HR madam: her query letter go follow you', o_aunty: 'Aunty for Accounts: e go freeze your salary',
    voices: 'Voices', commute_set: 'Morning commute', oga_name: 'Name your Oga', oga_help: 'E dey only this phone. We no dey share am.',
    shop_title: 'Staff shop', shop_intro: 'Every shift dey pay salary: one naira for every 5 points. Upgrades no dey work for daily shift, make e fair.',
    leagues_intro: 'Your office own private weekly scoreboard. Create one, share the code with your colleagues, your best score every week go show. E dey reset every Monday.',
    your_name_short: 'Your name', create_league: 'Create league', create: 'Create', join_code: 'Join with code', join: 'Join',
    all_leagues: 'All my leagues', code: 'Code', this_week: 'This week', invite: 'Invite colleagues', leave_league: 'Comot from league',
    stats_set: 'Anonymous stats', stats_help: 'E dey help us improve the game. No cookies, no names.',
    promo_title: 'Promotion letter', share_promo: 'Share letter', promo_ok: 'Next week', salary_paid: 'Salary wey dem pay',
  });

  /* ==================== Game tables ==================== */
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
    lunch:  { weight: 40, pts: 50, color: '#ff9a3c' },
    salary: { weight: 26, pts: 100, color: '#f5b301' },
    data:   { weight: 24, pts: 75, color: '#5ad1ff' },
    fuel:   { weight: 6, pts: 0, power: 'fuel', dur: 5, color: '#ffd34d' },
    leave:  { weight: 4.5, pts: 0, power: 'leave', dur: 5, color: '#3ee08f' },
    friday: { weight: 1.6, pts: 500, unlock: 3, color: '#ffe066' },
    // keep-for-later power-ups (one slot; tap Use or press E)
    autoreply: { weight: 1.6, pts: 0, held: true, unlock: 2, color: '#7cc4ff' },
    fakecall:  { weight: 1.6, pts: 0, held: true, unlock: 2, color: '#ff8fb1' },
    puffpuff:  { weight: 1.6, pts: 0, held: true, unlock: 2, color: '#ffc46b' },
  };

  // Morning commute hazards (Lagos road)
  const COMMUTE_OBS = {
    okada:   { weight: 4, r: 15, speed: [300, 380] },
    keke:    { weight: 3, r: 17, speed: [220, 280] },
    danfo:   { weight: 2, w: 56, h: 92, speed: [170, 215] },
    agbero:  { weight: 2, r: 16, speed: [110, 150] },
    pothole: { weight: 3, r: 18 },
  };

  // Bosses: who can show up, from which level
  const BOSS_TYPES = { oga: { unlock: 2, weight: 4 }, driver: { unlock: 3, weight: 3 }, hr: { unlock: 4, weight: 2.5 }, aunty: { unlock: 5, weight: 2.5 } };

  const EVENTS = ['salary', 'audit', 'travel', 'agm', 'alert'];

  const SHOP_ITEMS = [
    { id: 'chair', ico: 'chair', name: 'Ergonomic chair', desc: '+5% walking speed per level', max: 3, price: [600, 1800, 4500] },
    { id: 'stab', ico: 'stabilizer', name: 'Stabilizer', desc: 'Blackouts are 25% shorter per level', max: 2, price: [900, 2700] },
    { id: 'canteen', ico: 'canteen', name: 'Canteen card', desc: 'Lunch packs worth +25 more points per level', max: 2, price: [800, 2400] },
    { id: 'life', ico: 'health', name: 'Health insurance', desc: 'Start every shift with an extra life', max: 1, price: [7000] },
    { id: 'pocket', ico: 'autoreply', name: 'Auto-reply in your pocket', desc: 'Start your next shift holding an Auto-reply. Stack up to 3', max: 3, price: [350, 350, 350], consumable: true },
  ];
  const OUTFIT_PRICES = { ankara: 1500, senator: 2500, suit: 3000, jersey: 3000, native: 4000, agbada: 6000, legend: 12000 };

  // Career mode: a five-day week; goals get harder every week (w = week number)
  const CAREER_DAYS = [
    { key: 'mon', type: 'hour', n: (w) => Math.min(17, 11 + w) },
    { key: 'tue', type: 'lunch', n: (w) => 10 + 4 * (w - 1) },
    { key: 'wed', type: 'tasks', n: (w) => 2 + (w - 1) },
    { key: 'thu', type: 'escapes', n: (w) => 2 + (w - 1) },
    { key: 'fri', type: 'fridays', n: (w) => 2 + Math.floor((w - 1) / 2) },
  ];
  const PROMO_RANKS = ['Senior officer', 'Manager', 'Director', 'General manager', 'MD / CEO'];

  const BADGES = [
    { id: 'first', ico: 'id-badge', name: 'First day at work', desc: 'Finish your first shift', stat: 'games', goal: 1 },
    { id: 'lunch', ico: 'rice', name: 'Lunch champion', desc: 'Collect 30 lunch packs in total', stat: 'lunch', goal: 30 },
    { id: 'escape10', ico: 'running', name: 'Oga no fit catch me', desc: 'Outrun Oga 10 times', stat: 'escapes', goal: 10 },
    { id: 'nepa', ico: 'bulb', name: 'NEPA survivor', desc: 'Get through a blackout without a hit', stat: 'blackouts', goal: 1 },
    { id: 'overtime', ico: 'moon', name: 'Overtime', desc: 'Work past 5pm (reach level 10)', stat: 'maxLevel', goal: 10 },
    { id: 'bigboss', ico: 'career', name: 'Big boss energy', desc: 'Score 5,000 in one shift', stat: 'maxScore', goal: 5000 },
    { id: 'legend', ico: 'crown', name: 'Office legend', desc: 'Score 10,000 in one shift', stat: 'maxScore', goal: 10000 },
    { id: 'streak15', ico: 'fire', name: 'On a roll', desc: 'Reach a streak of 15', stat: 'maxStreak', goal: 15 },
    { id: 'close50', ico: 'sweat', name: 'Close shave', desc: '50 close calls in total', stat: 'near', goal: 50 },
    { id: 'tgif', ico: 'party', name: 'TGIF', desc: 'Grab a Friday bonus', stat: 'fridays', goal: 1 },
    { id: 'marathon', ico: 'stopwatch', name: 'Marathon shift', desc: 'Survive 3 minutes in one shift', stat: 'maxTime', goal: 180 },
    { id: 'challenger', ico: 'handshake', name: 'Who send you?', desc: "Beat a colleague's challenge", stat: 'challenges', goal: 1 },
    { id: 'daily3', ico: 'calendar', name: 'Punctual staff', desc: 'Finish 3 daily shifts', stat: 'dailies', goal: 3 },
    { id: 'bosskey', ico: 'hide', name: 'Nothing to see here', desc: 'Use the boss key', stat: 'bossKeys', goal: 1 },
    { id: 'commuter', ico: 'bus', name: 'Lagos commuter', desc: 'Arrive at work on time 5 times', stat: 'ontime', goal: 5 },
    { id: 'reporter', ico: 'chart', name: 'Report machine', desc: 'Submit 10 reports in total', stat: 'tasks', goal: 10 },
    { id: 'promoted', ico: 'scroll', name: 'Promoted!', desc: 'Finish a full career week', stat: 'weeks', goal: 1 },
    { id: 'shopper', ico: 'bag', name: 'Big spender', desc: 'Buy something in the staff shop', stat: 'buys', goal: 1 },
    { id: 'eventful', ico: 'masks', name: 'Seen it all', desc: 'Survive 10 shift events', stat: 'events', goal: 10 },
  ];

  const CHARACTERS = {
    emeka: { name: 'Emeka', skin: '#8d5524', hair: 'low' },
    ada: { name: 'Adaeze', skin: '#7a4521', hair: 'puff', earrings: true },
  };

  const OUTFITS = [
    { id: 'standard', name: 'Office green', unlock: null, p: { shirt: '#00a35f', pants: '#24314f', tie: '#f5b301', badge: '#ffffff' } },
    { id: 'ankara', name: 'Ankara Friday', unlock: 'tgif', p: { shirt: 'pattern:ankara', pants: '#2a2238', badge: '#ffffff' } },
    { id: 'senator', name: 'Senator', unlock: 'escape10', p: { shirt: '#efe6d2', pants: '#efe6d2', long: true, trim: '#8a6d3b' } },
    { id: 'suit', name: 'Corporate suit', unlock: 'overtime', p: { shirt: '#1c2233', pants: '#141a28', suit: true, tie: '#d62f3a' } },
    { id: 'jersey', name: 'Match-day jersey', unlock: 'streak15', p: { shirt: '#0aa04f', sleeve: '#ffffff', pants: '#ffffff', number: '10' } },
    { id: 'agbada', name: 'Agbada & fila', unlock: 'bigboss', p: { shirt: '#2d5bd1', pants: '#2d5bd1', robe: '#2d5bd1', trim: '#f5d061', cap: 'fila', capColor: '#1e3f99' } },
    { id: 'native', name: 'Gele & iro', nameM: 'Native & fila', unlock: 'nepa', p: { shirt: 'pattern:ankara2', pants: 'pattern:ankara2', cap: 'gele', capColor: '#e0457b' } },
    { id: 'legend', name: 'Gold legend', unlock: 'legend', p: { shirt: '#f5b301', pants: '#17203a', suit: true, tie: '#008751', glow: true } },
  ];

  const RANKS = [
    [0, 'Intern'], [500, 'Junior officer'], [1500, 'Senior officer'], [3000, 'Manager'], [6000, 'Director'], [10000, 'MD / CEO'],
  ];

  /* ==================== Helpers ==================== */
  const TAU = Math.PI * 2;
  const $ = (id) => document.getElementById(id);
  // Font Awesome icon from the sprite in index.html (see tools/build-icons.mjs)
  const ico = (name, cls) => `<svg class="ico${cls ? ' ' + cls : ''}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  // Draw a sprite icon on a canvas (paths read once from index.html)
  const iconPaths = {};
  function drawIcon(c, name, x, y, size) {
    let ip = iconPaths[name];
    if (ip === undefined) {
      const sym = document.getElementById('i-' + name);
      ip = iconPaths[name] = sym ? { vb: sym.getAttribute('viewBox').split(' ').map(Number), p: [...sym.querySelectorAll('path')].map((el) => new Path2D(el.getAttribute('d'))) } : null;
    }
    if (!ip) return;
    const [, , w, h] = ip.vb, k = size / Math.max(w, h);
    c.save(); c.translate(x - (w * k) / 2, y - (h * k) / 2); c.scale(k, k);
    for (const p of ip.p) c.fill(p);
    c.restore();
  }
  let rng = Math.random;                         // gameplay randomness (seeded on daily shifts)
  const rand = (a, b) => a + rng() * (b - a);
  const frand = (a, b) => a + Math.random() * (b - a);   // cosmetic randomness
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const pickF = (arr) => arr[(Math.random() * arr.length) | 0];
  const lerp = (a, b, k) => a + (b - a) * k;
  const DEBUG = /[?&]debug\b/.test(location.search);

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let x = a;
      x = Math.imul(x ^ (x >>> 15), x | 1);
      x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
      return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
  }
  function strHash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function todayKey() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  const isFridayNow = () => new Date().getDay() === 5;

  function weighted(entries) {
    let total = 0;
    for (const [, w] of entries) total += w;
    let r = rng() * total;
    for (const [k, w] of entries) { r -= w; if (r <= 0) return k; }
    return entries[entries.length - 1][0];
  }

  function fmtTime(sec) {
    const s = Math.max(0, Math.floor(sec));
    const m = Math.floor(s / 60);
    return String(m).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  }
  const fmtNum = (n) => Math.max(0, Math.floor(n)).toLocaleString('en-NG');
  const cleanName = (s) => String(s || '').replace(/[^A-Za-z0-9 _.\-]/g, '').replace(/\s+/g, ' ').trim().slice(0, 20);

  function officeClock(time) {
    const mins = 8 * 60 + (time / CONFIG.LEVEL_SECONDS) * 60;
    const dayMins = mins % (24 * 60);
    const h24 = Math.floor(dayMins / 60);
    const m = Math.floor(dayMins % 60);
    const ap = h24 >= 12 ? 'pm' : 'am';
    const h12 = ((h24 + 11) % 12) + 1;
    return { text: h12 + ':' + String(m).padStart(2, '0'), ap, hour: mins / 60, overtime: mins >= 17 * 60, nextDay: mins >= 24 * 60 };
  }

  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, String(v)); } catch (e) { /* storage unavailable */ } },
    json(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
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
  function hexToRgb(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function mix(a, b, k) { const A = hexToRgb(a), B = hexToRgb(b); return `rgb(${Math.round(lerp(A[0], B[0], k))},${Math.round(lerp(A[1], B[1], k))},${Math.round(lerp(A[2], B[2], k))})`; }

  /* ==================== Settings & progress ==================== */
  const S = {
    lang: store.get('ow_lang', 'en') === 'pcm' ? 'pcm' : 'en',
    gfx: ['auto', 'high', 'low'].includes(store.get('ow_gfx', 'auto')) ? store.get('ow_gfx', 'auto') : 'auto',
    name: cleanName(store.get('ow_name', '')),
    char: store.get('ow_char', 'emeka') === 'ada' ? 'ada' : 'emeka',
    outfit: store.get('ow_outfit', 'standard'),
    voices: store.get('ow_voices', '0') === '1',
    commute: store.get('ow_commute', '1') !== '0',
    ogaName: '',
    wallet: Math.max(0, parseInt(store.get('ow_wallet', '0'), 10) || 0),
    upg: Object.assign({ chair: 0, stab: 0, canteen: 0, life: 0, pocket: 0 }, store.json('ow_upg', {})),
    owned: new Set(store.json('ow_owned', [])),
    career: Object.assign({ week: 1, day: 0 }, store.json('ow_career', {})),
    leagues: (store.json('ow_leagues', []) || []).filter((l) => l && /^[A-HJ-NP-Z2-9]{6}$/.test(l.code)).slice(0, 3),
    playerId: store.get('ow_pid', ''),
  };
  if (!/^[a-z0-9]{12,40}$/.test(S.playerId)) {
    S.playerId = Array.from({ length: 20 }, () => 'abcdefghijklmnopqrstuvwxyz0123456789'[(Math.random() * 36) | 0]).join('');
    store.set('ow_pid', S.playerId);
  }
  const saveS = {
    wallet() { store.set('ow_wallet', S.wallet); },
    upg() { store.set('ow_upg', JSON.stringify(S.upg)); },
    owned() { store.set('ow_owned', JSON.stringify([...S.owned])); },
    career() { store.set('ow_career', JSON.stringify(S.career)); },
    leagues() { store.set('ow_leagues', JSON.stringify(S.leagues)); },
  };
  const t = (k) => (STR[S.lang][k] !== undefined ? STR[S.lang][k] : STR.en[k]);
  const msgs = () => MESSAGES[S.lang];

  const STATS_DEFAULT = { games: 0, lunch: 0, escapes: 0, blackouts: 0, maxLevel: 0, maxScore: 0, maxStreak: 0, near: 0, fridays: 0, maxTime: 0, challenges: 0, dailies: 0, bossKeys: 0, ontime: 0, tasks: 0, weeks: 0, buys: 0, events: 0 };
  const stats = Object.assign({}, STATS_DEFAULT, store.json('ow_stats', {}));
  const unlocked = new Set(store.json('ow_badges', []));
  function saveProgress() { store.set('ow_stats', JSON.stringify(stats)); store.set('ow_badges', JSON.stringify([...unlocked])); }
  const outfitUnlocked = (o) => !o.unlock || unlocked.has(o.unlock) || S.owned.has(o.id);
  if (!OUTFITS.some((o) => o.id === S.outfit && outfitUnlocked(o))) S.outfit = 'standard';

  let quality = S.gfx === 'low' ? 'low' : 'high';
  const hiQ = () => quality === 'high';

  /* ==================== Audio: effects + music ==================== */
  const Music = window.OWMusic || null;
  const Sound = {
    ctx: null,
    master: null,
    sfx: null,
    sfxOn: store.get('ow_muted', '1') === '0',
    musicOn: store.get('ow_music', '0') === '1',
    ensure() {
      if (this.ctx) return true;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      try {
        this.ctx = new AC();
        this.master = this.ctx.createGain();
        this.master.gain.value = 0.35;
        this.master.connect(this.ctx.destination);
        this.sfx = this.ctx.createGain();
        this.sfx.connect(this.master);
        if (Music) Music.init(this.ctx, this.master, CONFIG.MUSIC_TRACKS);
        return true;
      } catch (e) { this.ctx = null; return false; }
    },
    wake() {
      if ((this.sfxOn || this.musicOn) && this.ensure() && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      if (Music) Music.on = this.musicOn && !!this.ctx;
      const V = window.OWVoice;
      if (V) { V.init(); V.enabled = S.voices; V.lang = S.lang; }
    },
    setSfx(on) { this.sfxOn = on; store.set('ow_muted', on ? '0' : '1'); this.wake(); },
    setMusic(on) {
      this.musicOn = on; store.set('ow_music', on ? '1' : '0'); this.wake();
      if (!Music || !this.ctx) return;
      if (on) { Music.start(G.state === 'playing' ? 'game' : 'menu'); Music.setMode(G.state === 'playing' ? 'game' : 'menu'); }
      else Music.stop();
    },
    anyOn() { return this.sfxOn || this.musicOn || S.voices; },
    tone(freq, dur, type = 'square', vol = 0.3, slideTo = 0, delay = 0) {
      if (!this.sfxOn || !this.ctx) return;
      const t0 = this.ctx.currentTime + delay;
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, t0);
      if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(vol, t0 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g); g.connect(this.sfx);
      o.start(t0); o.stop(t0 + dur + 0.02);
    },
    noise(dur, vol = 0.25) {
      if (!this.sfxOn || !this.ctx) return;
      const len = Math.floor(this.ctx.sampleRate * dur);
      const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const src = this.ctx.createBufferSource();
      const g = this.ctx.createGain();
      g.gain.value = vol;
      src.buffer = buf; src.connect(g); g.connect(this.sfx);
      src.start();
    },
    play(name) {
      if (!this.sfxOn || !this.ctx) return;
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
        case 'powerdown': this.tone(440, 0.6, 'sawtooth', 0.16, 55); this.noise(0.12, 0.15); break;
        case 'powerup': this.tone(80, 0.5, 'sawtooth', 0.12, 320); this.tone(660, 0.12, 'triangle', 0.15, 0, 0.45); break;
        case 'badge': [659, 880, 1319].forEach((f, i) => this.tone(f, 0.18, 'triangle', 0.2, 0, i * 0.1)); break;
      }
    },
  };

  /* ==================== Sprites ==================== */
  const patternCache = new WeakMap();
  const PATTERN_TILES = {};
  function makeTile(name) {
    const tc = document.createElement('canvas');
    tc.width = 24; tc.height = 24;
    const x = tc.getContext('2d');
    if (name === 'ankara') {
      x.fillStyle = '#f07c1e'; x.fillRect(0, 0, 24, 24);
      x.fillStyle = '#0f8b8d'; circle(x, 6, 6, 5); x.fill(); circle(x, 18, 18, 5); x.fill();
      x.fillStyle = '#ffd23f'; circle(x, 6, 6, 2.2); x.fill(); circle(x, 18, 18, 2.2); x.fill();
      x.fillStyle = '#2b1a10';
      x.beginPath(); x.moveTo(18, 2); x.lineTo(22, 6); x.lineTo(18, 10); x.lineTo(14, 6); x.closePath(); x.fill();
      x.beginPath(); x.moveTo(6, 14); x.lineTo(10, 18); x.lineTo(6, 22); x.lineTo(2, 18); x.closePath(); x.fill();
    } else {
      x.fillStyle = '#6c2bb3'; x.fillRect(0, 0, 24, 24);
      x.strokeStyle = '#ffcf3f'; x.lineWidth = 2;
      for (const [px, py] of [[12, 12], [0, 0], [24, 24], [24, 0], [0, 24]]) { circle(x, px, py, 6.5); x.stroke(); }
      x.fillStyle = '#19c37d'; circle(x, 12, 12, 2.5); x.fill();
    }
    return tc;
  }
  function fillOf(c, v) {
    if (typeof v !== 'string' || !v.startsWith('pattern:')) return v;
    const name = v.slice(8);
    let m = patternCache.get(c);
    if (!m) { m = {}; patternCache.set(c, m); }
    if (!m[name]) {
      if (!PATTERN_TILES[name]) PATTERN_TILES[name] = makeTile(name);
      m[name] = c.createPattern(PATTERN_TILES[name], 'repeat');
    }
    return m[name];
  }

  function drawPerson(c, p) {
    const s = p.s || 1;
    const w = p.walk || 0;
    const lg = Math.sin(w) * 3;
    c.save();
    c.scale(s, s);
    if (p.glow) { c.fillStyle = 'rgba(245,179,1,.18)'; circle(c, 0, -2, 30); c.fill(); }
    // shadow
    c.fillStyle = 'rgba(0,0,0,.3)';
    c.beginPath(); c.ellipse(0, 23, 15, 5, 0, 0, TAU); c.fill();
    // legs + shoes
    c.fillStyle = fillOf(c, p.pants || '#26324f');
    rr(c, -9, 7, 7, 14 + lg, 3); c.fill();
    rr(c, 2, 7, 7, 14 - lg, 3); c.fill();
    c.fillStyle = '#111827';
    rr(c, -10, 19 + lg, 9, 4, 2); c.fill();
    rr(c, 1, 19 - lg, 9, 4, 2); c.fill();
    // arms
    c.fillStyle = fillOf(c, p.sleeve || p.robe || p.shirt);
    rr(c, -17.5, -7 + lg * 0.6, 6, 16, 3); c.fill();
    rr(c, 11.5, -7 - lg * 0.6, 6, 16, 3); c.fill();
    c.fillStyle = p.skin;
    circle(c, -14.5, 9 + lg * 0.6, 3.2); c.fill();
    circle(c, 14.5, 9 - lg * 0.6, 3.2); c.fill();
    // body
    c.fillStyle = fillOf(c, p.shirt);
    if (p.robe) {
      c.beginPath();
      c.moveTo(-14, -10); c.lineTo(14, -10); c.lineTo(23, 15); c.quadraticCurveTo(0, 19, -23, 15); c.closePath(); c.fill();
      c.strokeStyle = p.trim; c.lineWidth = 1.6;
      c.beginPath(); c.arc(0, -10, 6, 0, Math.PI); c.stroke();
      c.beginPath(); c.moveTo(0, -4); c.lineTo(0, 8); c.moveTo(-3, 2); c.lineTo(3, 2); c.moveTo(-2, 6); c.lineTo(2, 6); c.stroke();
    } else if (p.long) {
      rr(c, -12, -10, 24, 27, 6); c.fill();
      c.strokeStyle = p.trim; c.lineWidth = 1.3;
      c.beginPath(); c.moveTo(0, -9); c.lineTo(0, 14); c.moveTo(-2.5, -6); c.lineTo(2.5, -6); c.moveTo(-2.5, -2); c.lineTo(2.5, -2); c.stroke();
      c.beginPath(); c.arc(0, -10, 4, 0, Math.PI); c.stroke();
    } else {
      rr(c, -12, -10, 24, 21, 7); c.fill();
    }
    if (p.suit) {
      c.fillStyle = '#ffffff';
      c.beginPath(); c.moveTo(-4, -10); c.lineTo(0, 0); c.lineTo(4, -10); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(255,255,255,.18)'; c.lineWidth = 1.2;
      c.beginPath(); c.moveTo(-6, -9); c.lineTo(-1, 6); c.moveTo(6, -9); c.lineTo(1, 6); c.stroke();
    } else if (p.number) {
      c.fillStyle = '#ffffff';
      c.fillRect(-5, -10, 10, 2);
      c.font = '900 9px system-ui, Arial, sans-serif';
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText(p.number, 0, 1);
    } else if (!p.robe && !p.long && !String(p.shirt).startsWith('pattern:')) {
      c.fillStyle = '#ffffff';
      c.beginPath(); c.moveTo(-6.5, -10); c.lineTo(0, -4); c.lineTo(6.5, -10); c.closePath(); c.fill();
    }
    if (p.tie) {
      c.fillStyle = p.tie;
      c.beginPath(); c.moveTo(0, -5); c.lineTo(-2.6, -1.5); c.lineTo(0, 8); c.lineTo(2.6, -1.5); c.closePath(); c.fill();
    }
    if (p.badge) {
      c.strokeStyle = p.badge; c.lineWidth = 1.2;
      c.beginPath(); c.moveTo(-5, -9); c.lineTo(-6, 2); c.moveTo(5, -9); c.lineTo(-4, 2); c.stroke();
      c.fillStyle = '#fff'; rr(c, -9, 1, 7, 8, 1.5); c.fill();
      c.fillStyle = '#008751'; c.fillRect(-8, 2.5, 5, 1.8);
    }
    if (p.papers) {
      for (let i = 0; i < 4; i++) {
        c.fillStyle = '#f5f5f0';
        rr(c, -10 + i * 0.6, -3 - i * 3, 20, 5, 1); c.fill();
        c.strokeStyle = 'rgba(0,0,0,.12)'; c.lineWidth = 0.8; c.stroke();
      }
    }
    if (p.towel) {
      c.strokeStyle = p.towel; c.lineWidth = 3.2; c.lineCap = 'round';
      c.beginPath(); c.moveTo(-10, -9); c.quadraticCurveTo(-2, -2, 8, -9); c.stroke();
      c.beginPath(); c.moveTo(8, -9); c.lineTo(9, 4); c.stroke();
    }
    if (p.calc) {
      c.fillStyle = '#2d3748'; rr(c, -15, 1 + lg * 0.6, 9, 12, 1.5); c.fill();
      c.fillStyle = '#9be7a5'; c.fillRect(-13.5, 2.5 + lg * 0.6, 6, 3);
      c.fillStyle = '#e2e8f0'; for (let i = 0; i < 3; i++) c.fillRect(-13.5 + i * 2.2, 7 + lg * 0.6, 1.4, 1.4);
    }
    if (p.keys) {
      c.strokeStyle = '#f5b301'; c.lineWidth = 1.2; circle(c, 15, 12 - lg * 0.6, 2.4); c.stroke();
      c.fillStyle = '#cbd5e1'; c.fillRect(16, 13 - lg * 0.6, 4, 1.6);
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
    if (p.earrings) { c.fillStyle = '#f5b301'; circle(c, -10.3, -15.5, 1.6); c.fill(); circle(c, 10.3, -15.5, 1.6); c.fill(); }
    // hair
    c.fillStyle = p.hairColor || '#141414';
    if (p.hair === 'puff' && !p.cap) {
      circle(c, 0, -31, 7.5); c.fill();
      c.beginPath(); c.arc(0, -21, 11, Math.PI * 1.02, Math.PI * 1.98); c.closePath(); c.fill();
      c.fillStyle = '#f5b301'; c.fillRect(-4, -26, 8, 2.2);
    } else if (!p.cap || p.cap === 'fila' || p.cap === 'peak') {
      c.beginPath(); c.arc(0, -21, 10.8, Math.PI * 1.02, Math.PI * 1.98); c.closePath(); c.fill();
    }
    // headwear
    if (p.cap === 'fila') {
      c.fillStyle = fillOf(c, p.capColor || '#1e3f99');
      c.beginPath();
      c.moveTo(-10.5, -26); c.lineTo(10.5, -26); c.lineTo(12, -32); c.quadraticCurveTo(2, -40, -11, -33); c.closePath(); c.fill();
      c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(-10, -27.5, 20, 1.5);
    } else if (p.cap === 'peak') {
      c.fillStyle = p.capColor || '#1f2937';
      c.beginPath(); c.arc(0, -24, 10.6, Math.PI, 0); c.closePath(); c.fill();
      rr(c, -12, -25, 24, 3.5, 1.5); c.fill();
      c.fillStyle = '#f5b301'; c.fillRect(-2.5, -31, 5, 3);
    } else if (p.cap === 'gele') {
      c.fillStyle = fillOf(c, p.capColor || '#e0457b');
      c.beginPath(); c.ellipse(0, -28, 13.5, 6.5, 0, Math.PI, 0); c.fill();
      for (let i = -2; i <= 2; i++) {
        c.beginPath(); c.ellipse(i * 4.5, -36 - (2 - Math.abs(i)) * 1.5, 4.2, 7.5, i * 0.35, 0, TAU); c.fill();
      }
      c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 1;
      c.beginPath(); c.moveTo(-12, -27); c.quadraticCurveTo(0, -31, 12, -27); c.stroke();
    }
    // face
    const lx = clamp(p.lookX || 0, -1, 1) * 1.3;
    const ly = clamp(p.lookY || 0, -1, 1) * 1;
    c.fillStyle = '#fff';
    c.beginPath(); c.ellipse(-3.9, -19, 2.7, 3, 0, 0, TAU); c.ellipse(3.9, -19, 2.7, 3, 0, 0, TAU); c.fill();
    c.fillStyle = '#111';
    circle(c, -3.9 + lx, -18.7 + ly, 1.4); c.fill();
    circle(c, 3.9 + lx, -18.7 + ly, 1.4); c.fill();
    if (p.glasses) {
      c.strokeStyle = '#1f2937'; c.lineWidth = 1.2;
      circle(c, -3.9, -19, 3.4); c.stroke(); circle(c, 3.9, -19, 3.4); c.stroke();
      c.beginPath(); c.moveTo(-0.6, -19.4); c.lineTo(0.6, -19.4); c.stroke();
    }
    if (p.lashes) {
      c.strokeStyle = '#111'; c.lineWidth = 1;
      c.beginPath(); c.moveTo(-6.6, -21.5); c.lineTo(-7.8, -22.6); c.moveTo(6.6, -21.5); c.lineTo(7.8, -22.6); c.stroke();
    }
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

  function playerParams(charId, outfitId, extra) {
    const ch = CHARACTERS[charId] || CHARACTERS.emeka;
    const of = (OUTFITS.find((o) => o.id === outfitId) || OUTFITS[0]).p;
    const p = Object.assign({ skin: ch.skin, hair: ch.hair, earrings: ch.earrings, lashes: charId === 'ada' }, of, extra || {});
    if (p.cap === 'gele' && charId !== 'ada') p.cap = 'fila';
    return p;
  }

  const SPRITES = {
    player(c, tm, o = {}) {
      drawPerson(c, playerParams(o.char || S.char, o.outfit || S.outfit, {
        walk: o.walk !== undefined ? o.walk : tm * 10, mood: o.mood || 'happy', lookX: o.lookX, lookY: o.lookY, s: o.s || 1,
      }));
    },
    boss(c, tm, o = {}) {
      drawPerson(c, {
        shirt: '#2b3245', sleeve: '#2b3245', suit: true, skin: '#6b3f1f', hair: 'low', tie: '#d62f3a',
        pants: '#1b2131', walk: tm * 9, mood: 'angry', phone: true, lookX: o.lookX, lookY: o.lookY, s: o.s || 1.28,
      });
    },
    colleague(c, tm, o = {}) {
      drawPerson(c, { shirt: '#7a5af8', skin: '#a0663a', hair: 'low', hairColor: '#2b1a10', pants: '#2d2f3e', walk: tm * 8, mood: 'happy', papers: true, s: o.s || 1 });
    },
    file(c) {
      c.fillStyle = '#c98f2e'; rr(c, -15, -12, 12, 6, 2); c.fill();
      c.fillStyle = '#e9b44c'; rr(c, -15, -9, 30, 21, 3); c.fill();
      c.fillStyle = '#fff'; c.fillRect(-12, -11, 24, 4);
      c.fillStyle = 'rgba(0,0,0,.15)'; c.fillRect(-15, -1, 30, 1.5);
    },
    task(c) {
      c.fillStyle = '#ffffff'; rr(c, -13, -16, 26, 32, 3); c.fill();
      c.fillStyle = '#cbd2e0';
      for (let i = 0; i < 4; i++) c.fillRect(-9, -11 + i * 5, i === 3 ? 10 : 18, 2);
      c.save(); c.rotate(-0.28);
      c.strokeStyle = COLORS.red; c.lineWidth = 2; rr(c, -15, 4, 30, 11, 2); c.stroke();
      c.fillStyle = COLORS.red; c.font = '900 8px system-ui, Arial, sans-serif';
      c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('URGENT', 0, 9.8);
      c.restore();
    },
    meeting(c) {
      c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -41, -14, 84, 32, 9); c.fill();
      c.fillStyle = '#ffffff'; rr(c, -42, -16, 84, 32, 9); c.fill();
      c.fillStyle = '#fff'; rr(c, -37, -10, 18, 19, 3); c.fill();
      c.strokeStyle = '#d0d5e0'; c.lineWidth = 1; c.stroke();
      c.fillStyle = COLORS.red; rr(c, -37, -10, 18, 6, 3); c.fill(); c.fillRect(-37, -6, 18, 2);
      c.fillStyle = COLORS.ink; c.font = '900 9px system-ui, Arial, sans-serif';
      c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('9', -28, 3);
      c.textAlign = 'left'; c.font = '800 8.5px system-ui, Arial, sans-serif';
      c.fillText('Quick meeting?', -15, -4, 54);
      c.fillStyle = '#6b7590'; c.font = '600 7px system-ui, Arial, sans-serif';
      c.fillText('Starts now, 3hrs', -15, 6, 54);
    },
    deadline(c, tm) {
      c.save(); c.rotate(Math.sin(tm * 40) * 0.12);
      c.fillStyle = '#b91c1c'; circle(c, -9, -12, 5); c.fill(); circle(c, 9, -12, 5); c.fill();
      c.fillStyle = COLORS.red; circle(c, 0, 0, 15); c.fill();
      c.fillStyle = '#fff'; circle(c, 0, 0, 11); c.fill();
      c.strokeStyle = COLORS.ink; c.lineWidth = 2; c.lineCap = 'round';
      c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -8); c.moveTo(0, 0); c.lineTo(5, 3); c.stroke();
      c.fillStyle = '#7f1d1d'; c.fillRect(-8, 13, 3, 4); c.fillRect(5, 13, 3, 4);
      c.restore();
    },
    network(c, tm) {
      const pulse = (Math.sin(tm * 6) + 1) / 2;
      c.strokeStyle = `rgba(229,72,77,${0.25 + pulse * 0.35})`; c.lineWidth = 2;
      circle(c, 0, 0, 19 + pulse * 3); c.stroke();
      c.fillStyle = '#1f2937'; circle(c, 0, 0, 16); c.fill();
      c.strokeStyle = '#6b7280'; c.lineWidth = 2.4; c.lineCap = 'round';
      for (let i = 1; i <= 3; i++) { c.beginPath(); c.arc(0, 7, i * 4.2, Math.PI * 1.25, Math.PI * 1.75); c.stroke(); }
      c.fillStyle = '#6b7280'; circle(c, 0, 7, 1.8); c.fill();
      c.strokeStyle = COLORS.red; c.lineWidth = 3;
      c.beginPath(); c.moveTo(4, -2); c.lineTo(12, 6); c.moveTo(12, -2); c.lineTo(4, 6); c.stroke();
    },
    printer(c, tm) {
      c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(0, 22, 28, 6, 0, 0, TAU); c.fill();
      c.fillStyle = '#ffffff';
      c.save(); c.translate(0, -14 + Math.sin(tm * 14) * 1.5); rr(c, -14, -10, 28, 12, 1); c.fill(); c.restore();
      c.fillStyle = '#c6ccd8'; rr(c, -27, -14, 54, 18, 5); c.fill();
      c.fillStyle = '#e4e8ef'; rr(c, -27, -2, 54, 22, 5); c.fill();
      c.fillStyle = '#8f98aa'; rr(c, -18, 6, 36, 5, 2); c.fill();
      c.fillStyle = Math.sin(tm * 10) > 0 ? COLORS.red : '#7f1d1d'; circle(c, 20, -6, 2.6); c.fill();
      c.fillStyle = COLORS.ink; c.font = '900 7px system-ui, Arial, sans-serif';
      c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('PAPER JAM', -3, -7);
    },
    salary(c, tm) {
      c.save(); c.rotate(Math.sin(tm * 3) * 0.12);
      c.fillStyle = '#0d7a45'; rr(c, -18, -11, 36, 22, 3); c.fill();
      c.strokeStyle = COLORS.gold; c.lineWidth = 2; rr(c, -15, -8, 30, 16, 2); c.stroke();
      c.fillStyle = '#fff'; c.font = '900 13px system-ui, Arial, sans-serif';
      c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('₦', 0, 1);
      c.fillStyle = COLORS.gold; circle(c, -11, 0, 2); c.fill(); circle(c, 11, 0, 2); c.fill();
      c.restore();
    },
    lunch(c) {
      c.fillStyle = '#f6f6f2';
      c.beginPath(); c.moveTo(-15, -2); c.lineTo(15, -2); c.lineTo(12, 12); c.lineTo(-12, 12); c.closePath(); c.fill();
      c.strokeStyle = '#d9d9d0'; c.lineWidth = 1; c.stroke();
      c.fillStyle = '#e2571e'; c.beginPath(); c.ellipse(0, -3, 14, 5, 0, Math.PI, 0); c.fill();
      c.fillStyle = '#f08a3e';
      for (let i = 0; i < 6; i++) { circle(c, -9 + i * 3.6, -4 - (i % 2) * 2, 1.4); c.fill(); }
      c.fillStyle = '#f2c14e'; c.beginPath(); c.ellipse(-6, -6, 4, 2, -0.4, 0, TAU); c.fill();
      c.fillStyle = '#9a4f1f'; c.beginPath(); c.ellipse(6, -7, 4, 3, 0.3, 0, TAU); c.fill();
      c.fillStyle = '#ffffff';
      c.save(); c.translate(0, -8); c.rotate(-0.15);
      c.beginPath(); c.moveTo(-15, 0); c.lineTo(15, 0); c.lineTo(12, -9); c.lineTo(-12, -9); c.closePath(); c.fill();
      c.strokeStyle = '#d9d9d0'; c.stroke();
      c.restore();
    },
    data(c) {
      c.fillStyle = '#0f172a'; rr(c, -10, -16, 20, 32, 4); c.fill();
      c.fillStyle = '#1d4ed8'; rr(c, -8, -13, 16, 24, 2); c.fill();
      c.fillStyle = '#fff';
      for (let i = 0; i < 4; i++) c.fillRect(-6 + i * 3.4, -4 - i * 2.5, 2.4, 3 + i * 2.5);
      c.font = '900 7px system-ui, Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('2GB', 0, 6);
      c.fillStyle = '#334155'; c.fillRect(-3, 13, 6, 1.5);
    },
    leave(c) {
      c.fillStyle = '#e8f8ef'; rr(c, -13, -16, 26, 32, 3); c.fill();
      c.strokeStyle = COLORS.green; c.lineWidth = 2; c.stroke();
      c.fillStyle = COLORS.green; c.font = '900 7px system-ui, Arial, sans-serif';
      c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('LEAVE', 0, -9);
      c.strokeStyle = COLORS.green; c.lineWidth = 3.2; c.lineCap = 'round'; c.lineJoin = 'round';
      c.beginPath(); c.moveTo(-6, 3); c.lineTo(-1, 8); c.lineTo(7, -2); c.stroke();
    },
    fuel(c) {
      c.fillStyle = '#f2c14e'; rr(c, -12, -10, 24, 26, 4); c.fill();
      c.fillStyle = '#d39b16'; rr(c, -8, -16, 12, 7, 3); c.fill();
      c.fillStyle = '#f2c14e'; rr(c, -5, -14, 6, 4, 2); c.fill();
      c.fillStyle = '#9b6b00'; rr(c, 6, -16, 5, 8, 2); c.fill();
      c.strokeStyle = '#d39b16'; c.lineWidth = 1.6;
      c.beginPath(); c.moveTo(-8, -4); c.lineTo(8, 12); c.moveTo(8, -4); c.lineTo(-8, 12); c.stroke();
    },
    friday(c, tm) {
      c.save(); c.rotate(tm * 1.6);
      c.fillStyle = '#ffd23f';
      c.beginPath();
      for (let i = 0; i < 10; i++) { const a = (i / 10) * TAU - Math.PI / 2; const r = i % 2 ? 8.5 : 19; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
      c.closePath(); c.fill();
      c.strokeStyle = '#f59e0b'; c.lineWidth = 1.5; c.stroke();
      c.restore();
      c.fillStyle = COLORS.ink; c.font = '900 7.5px system-ui, Arial, sans-serif';
      c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('TGIF', 0, 1);
    },
  };

  Object.assign(SPRITES, {
    driver(c, tm, o = {}) {
      drawPerson(c, { shirt: '#f4f6fa', sleeve: '#f4f6fa', pants: '#151a26', skin: '#5c3519', hair: 'low', cap: 'peak', capColor: '#111827', keys: true, mood: o.mood || 'angry', walk: tm * 16, lookX: o.lookX, s: o.s || 1.1 });
    },
    hr(c, tm, o = {}) {
      drawPerson(c, { shirt: '#b0306a', sleeve: '#b0306a', pants: '#2a2238', skin: '#7a4521', hair: 'puff', earrings: true, lashes: true, glasses: true, papers: true, mood: 'angry', walk: tm * 6, lookX: o.lookX, lookY: o.lookY, s: o.s || 1.15 });
    },
    aunty(c, tm, o = {}) {
      drawPerson(c, { shirt: 'pattern:ankara', pants: 'pattern:ankara', skin: '#8a4f24', hair: 'low', cap: 'gele', capColor: '#d62f3a', earrings: true, lashes: true, glasses: true, calc: true, mood: o.mood || 'angry', walk: tm * 7, lookX: o.lookX, lookY: o.lookY, s: o.s || 1.12 });
    },
    agbero(c, tm, o = {}) {
      drawPerson(c, { shirt: '#e9e6dc', sleeve: '#4d2a12', skin: '#4d2a12', pants: '#3b4a2f', hair: 'low', towel: '#d62f3a', mood: 'angry', walk: tm * 9, s: o.s || 1 });
    },
    okada(c, tm) {
      c.fillStyle = 'rgba(0,0,0,.32)'; c.beginPath(); c.ellipse(0, 26, 15, 5, 0, 0, TAU); c.fill();
      // wheel + fork
      c.fillStyle = '#111827'; rr(c, -4, 12, 8, 16, 4); c.fill();
      c.fillStyle = '#9ca3af'; c.fillRect(-6, 8, 2, 8); c.fillRect(4, 8, 2, 8);
      // body + headlight
      c.fillStyle = '#c62828'; rr(c, -9, 2, 18, 10, 4); c.fill();
      c.fillStyle = '#fff8c4'; circle(c, 0, 7, 3.6); c.fill();
      c.fillStyle = 'rgba(255,248,196,.25)'; circle(c, 0, 14, 10); c.fill();
      // handlebar
      c.strokeStyle = '#374151'; c.lineWidth = 2.4; c.lineCap = 'round';
      c.beginPath(); c.moveTo(-15, -1); c.lineTo(15, -1); c.stroke();
      // rider (helmetless, of course)
      c.save(); c.translate(0, -8); c.scale(0.78, 0.78);
      drawPerson(c, { shirt: '#1e88e5', skin: '#5c3519', hair: 'low', pants: '#1f2937', mood: 'happy', walk: 0 });
      c.restore();
    },
    keke(c, tm) {
      c.fillStyle = 'rgba(0,0,0,.32)'; c.beginPath(); c.ellipse(0, 24, 20, 6, 0, 0, TAU); c.fill();
      c.fillStyle = '#111827'; rr(c, -4, 14, 8, 12, 4); c.fill();
      c.fillStyle = '#f2c230'; rr(c, -18, -20, 36, 38, 9); c.fill();
      c.fillStyle = '#1f9d55'; c.fillRect(-18, 4, 36, 5);
      c.fillStyle = 'rgba(160,210,255,.85)'; rr(c, -13, -14, 26, 14, 4); c.fill();
      c.fillStyle = '#111'; circle(c, -3, -6, 3); c.fill();
      c.fillStyle = '#fff8c4'; circle(c, 0, 13, 2.8); c.fill();
      c.fillStyle = '#111'; c.font = '900 6px system-ui, Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('NO SHAKING', 0, -17);
    },
    danfo(c, tm) {
      c.fillStyle = 'rgba(0,0,0,.35)'; rr(c, -27, -40, 58, 92, 8); c.fill();
      c.fillStyle = '#f5c400'; rr(c, -28, -46, 56, 92, 9); c.fill();
      c.fillStyle = '#111'; c.fillRect(-28, -6, 56, 4); c.fillRect(-28, 4, 56, 4);
      c.fillStyle = 'rgba(160,210,255,.85)'; rr(c, -23, -40, 46, 26, 5); c.fill();
      c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.moveTo(-21, -38); c.lineTo(-8, -38); c.lineTo(-21, -22); c.closePath(); c.fill();
      c.fillStyle = '#111'; circle(c, -8, -26, 4); c.fill(); circle(c, 9, -27, 4); c.fill();
      c.fillStyle = '#fff8c4'; circle(c, -20, 30, 4); c.fill(); circle(c, 20, 30, 4); c.fill();
      c.fillStyle = '#222'; rr(c, -14, 26, 28, 9, 2); c.fill();
      c.fillStyle = '#fff'; c.font = '900 5.5px system-ui, Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('OSHODI-OBALENDE', 0, 30.6, 26);
      c.fillStyle = '#111'; c.font = '900 7px system-ui, Arial, sans-serif';
      c.fillText('NO KING AS GOD', 0, 15, 50);
    },
    pothole(c) {
      c.fillStyle = '#4a3a2a'; c.beginPath(); c.ellipse(0, 0, 21, 12, 0, 0, TAU); c.fill();
      c.fillStyle = '#1b1d24'; c.beginPath(); c.ellipse(0, 1, 17, 9, 0, 0, TAU); c.fill();
      c.fillStyle = 'rgba(120,170,220,.45)'; c.beginPath(); c.ellipse(-3, 2, 10, 4.5, -0.1, 0, TAU); c.fill();
      c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(-7, 0, 5, 1.2);
    },
    query(c, tm) {
      c.fillStyle = '#ffffff'; rr(c, -13, -9, 26, 18, 2); c.fill();
      c.strokeStyle = '#cbd2e0'; c.lineWidth = 1;
      c.beginPath(); c.moveTo(-13, -9); c.lineTo(0, 2); c.lineTo(13, -9); c.stroke();
      c.save(); c.rotate(-0.25);
      c.strokeStyle = COLORS.red; c.lineWidth = 1.6; rr(c, -11, 0, 22, 8, 1.5); c.stroke();
      c.fillStyle = COLORS.red; c.font = '900 6.5px system-ui, Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('QUERY', 0, 4.2);
      c.restore();
    },
    taskdesk(c, tm) {
      c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(0, 16, 30, 7, 0, 0, TAU); c.fill();
      c.fillStyle = '#7a4f2c'; rr(c, -28, -6, 56, 22, 4); c.fill();
      c.fillStyle = '#8a5a33'; rr(c, -28, -6, 56, 4, 2); c.fill();
      c.fillStyle = '#9aa3b5'; rr(c, -13, -16, 26, 16, 2); c.fill();
      c.fillStyle = '#e8f6ef'; rr(c, -11, -14.5, 22, 12, 1.5); c.fill();
      c.fillStyle = COLORS.green;
      for (let i = 0; i < 4; i++) c.fillRect(-8 + i * 4.5, -5 - i * 2, 3, 3 + i * 2);
      c.fillStyle = '#f5f5f0'; c.fillRect(16, -4, 8, 10);
    },
    autoreply(c, tm) {
      c.fillStyle = '#e8f1ff'; rr(c, -15, -11, 30, 22, 3); c.fill();
      c.strokeStyle = '#3b82f6'; c.lineWidth = 2; c.stroke();
      c.beginPath(); c.moveTo(-15, -11); c.lineTo(0, 1); c.lineTo(15, -11); c.stroke();
      c.fillStyle = '#1d4ed8'; c.font = '900 8px system-ui, Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('OOO', 0, 6);
    },
    fakecall(c, tm) {
      c.fillStyle = '#0f172a'; rr(c, -9, -15, 18, 30, 4); c.fill();
      c.fillStyle = '#22c55e'; rr(c, -7, -12, 14, 22, 2); c.fill();
      c.fillStyle = '#fff'; c.font = '900 6px system-ui, Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('MD', 0, -4); drawIcon(c, 'phone', 0, 4, 7);
      c.strokeStyle = '#ff8fb1'; c.lineWidth = 2; c.lineCap = 'round';
      const k = (Math.sin(tm * 10) + 1) / 2;
      c.globalAlpha = 0.5 + k * 0.5;
      c.beginPath(); c.arc(0, -2, 15, -0.6, 0.6); c.stroke(); c.beginPath(); c.arc(0, -2, 15, Math.PI - 0.6, Math.PI + 0.6); c.stroke();
      c.globalAlpha = 1;
    },
    puffpuff(c) {
      c.fillStyle = '#d9b382'; c.beginPath(); c.moveTo(-14, -6); c.lineTo(14, -6); c.lineTo(11, 14); c.lineTo(-11, 14); c.closePath(); c.fill();
      c.fillStyle = '#c49a66'; c.fillRect(-14, -6, 28, 3);
      for (const [x, y] of [[-7, -9], [0, -12], [7, -9], [-3, -4], [4, -5]]) {
        c.fillStyle = '#c96f1e'; circle(c, x, y, 5); c.fill();
        c.fillStyle = 'rgba(255,255,255,.55)'; circle(c, x - 1.5, y - 1.5, 1.4); c.fill();
      }
    },
  });

  /* ==================== DOM ==================== */
  const canvas = $('game');
  const ctx = canvas.getContext('2d');
  const ui = {
    hud: $('hud'), score: $('hud-score'), clock: $('hud-clock'), level: $('hud-level'), lives: $('hud-lives'),
    best: $('hud-best'), target: $('hud-target'), daily: $('hud-daily'), streak: $('hud-streak'), puLeave: $('pu-leave'), puFuel: $('pu-fuel'),
    toast: $('toast'), banner: $('banner'),
    screens: {
      menu: $('screen-menu'), pause: $('screen-pause'), over: $('screen-over'), board: $('screen-board'),
      wardrobe: $('screen-wardrobe'), settings: $('screen-settings'), review: $('screen-review'),
      shop: $('screen-shop'), leagues: $('screen-leagues'), promo: $('screen-promo'),
    },
    excel: $('screen-excel'),
    menuBest: $('menu-best'), menuName: $('menu-name'), menuRank: $('menu-rank'), menuBadges: $('menu-badges'),
    idPhoto: $('id-photo'), fridayNote: $('friday-note'), dailySub: $('daily-sub'),
    challengeCard: $('challenge-card'), challengeText: $('challenge-text'),
    overScore: $('over-score'), overTime: $('over-time'), overClock: $('over-clock'), overBest: $('over-best'),
    overItems: $('over-items'), overNear: $('over-near'), overStreak: $('over-streak'), overMsg: $('over-message'),
    overStamp: $('over-stamp'), overChallenge: $('over-challenge'), overBadges: $('over-badges'), playerName: $('player-name'),
    lbForm: $('lb-form'), lbSubmit: $('lb-submit'), lbStatus: $('lb-status'),
    boardList: $('board-list'), boardStatus: $('board-status'),
    muteHud: $('btn-mute-hud'),
    event: $('hud-event'), goal: $('hud-goal'), frozen: $('hud-frozen'), skip: $('btn-skip'),
  };

  /* ==================== World / sizing ==================== */
  let W = 360, H = 720, scale = 1, dpr = 1;
  let FX0 = 0, FX1 = 360;                 // corridor (playfield) extents
  const MAX_CORRIDOR = 820;
  const HUD_SPACE = 70;
  const minX = () => FX0 + 20;
  const maxX = () => FX1 - 20;
  const minY = () => Math.max(HUD_SPACE + 30, H * 0.3);
  const maxY = () => H - 34;

  // pre-rendered graphics
  let carpetPat = null, lightSprite = null, vignette = null;
  const darkC = document.createElement('canvas');
  const darkX = darkC.getContext('2d');

  function buildGraphics() {
    const carpet = document.createElement('canvas');
    carpet.width = 64; carpet.height = 64;
    const x = carpet.getContext('2d');
    x.fillStyle = COLORS.floor; x.fillRect(0, 0, 64, 64);
    const r = mulberry32(7);
    for (let i = 0; i < 260; i++) {
      x.fillStyle = r() > 0.5 ? 'rgba(255,255,255,.035)' : 'rgba(0,0,0,.08)';
      x.fillRect(r() * 64, r() * 64, 1.2, 1.2);
    }
    x.strokeStyle = COLORS.floorLine; x.lineWidth = 2;
    x.strokeRect(1, 1, 62, 62);
    x.fillStyle = 'rgba(255,255,255,.025)'; x.fillRect(2, 2, 30, 30); x.fillRect(32, 32, 30, 30);
    carpetPat = ctx.createPattern(carpet, 'repeat');
    lightSprite = document.createElement('canvas');
    lightSprite.width = lightSprite.height = 128;
    const l = lightSprite.getContext('2d');
    const g = l.createRadialGradient(64, 64, 4, 64, 64, 64);
    g.addColorStop(0, 'rgba(255,244,214,.9)'); g.addColorStop(1, 'rgba(255,244,214,0)');
    l.fillStyle = g; l.fillRect(0, 0, 128, 128);
    vignette = document.createElement('canvas');
    vignette.width = vignette.height = 128;
    const v = vignette.getContext('2d');
    const vg = v.createRadialGradient(64, 64, 34, 64, 64, 92);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(3,6,14,.55)');
    v.fillStyle = vg; v.fillRect(0, 0, 128, 128);
  }

  function resize() {
    const cw = Math.max(1, window.innerWidth);
    const ch = Math.max(1, window.innerHeight);
    dpr = Math.min(window.devicePixelRatio || 1, hiQ() ? 2.5 : 1.25);
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

  /* ==================== Game state ==================== */
  const G = {
    state: 'menu',
    best: parseInt(store.get('ow_best', '0'), 10) || 0,
    t: 0,
    player: null,
    mode: 'normal',
    dailyKey: todayKey(),
    challenge: null,
  };

  function newRound(mode) {
    G.mode = mode || 'normal';
    G.dailyKey = todayKey();
    rng = G.mode === 'daily' ? mulberry32(strHash('office-wahala:' + G.dailyKey)) : Math.random;
    G.friday = isFridayNow();
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
    G.blackT = rand(DIFFICULTY.blackoutEvery[0] * 0.6, DIFFICULTY.blackoutEvery[1] * 0.6);
    G.black = null;
    G.msgT = frand(7, 12);
    G.scroll = 0;
    G.shake = 0;
    G.flash = 0;
    G.dyingT = 0;
    G.obstacles = [];
    G.items = [];
    G.particles = [];
    G.floaters = [];
    G.bestAtStart = G.mode === 'daily' ? dailyBest() : G.best;
    G.beatBestLive = false;
    G.challengeBeaten = false;
    G.newBadges = [];
    G.lastHit = '';
    G.lastMsg = '';
    G.player = {
      x: (FX0 + FX1) / 2, y: H * 0.78, vx: 0, vy: 0, tx: 0, ty: 0, r: 15,
      invuln: 0, leave: 0, fuel: 0, walk: 0,
    };
    G.player.tx = G.player.x; G.player.ty = G.player.y;
    G.hudCache = {};
    G.submitted = false;
    G.badgeCheckT = 1;
    G.shareBlob = null;
    G.upg = G.mode === 'daily' ? {} : S.upg;
    G.lives = CONFIG.START_LIVES + (G.upg.life ? 1 : 0);
    G.phase = S.commute ? 'commute' : 'office';
    G.commute = { t: 0, late: 0, dur: DIFFICULTY.commuteSeconds };
    if (G.phase === 'commute') G.spawnT = 1.0;
    G.event = null; G.lastEvent = null;
    G.eventT = rand(DIFFICULTY.eventEvery[0], DIFFICULTY.eventEvery[1]) * 0.7;
    G.task = null;
    G.taskT = G.mode === 'career' && careerDay().type === 'tasks' ? 6 : rand(DIFFICULTY.taskEvery[0], DIFFICULTY.taskEvery[1]) * 0.7;
    G.held = null; G.calm = 0; G.frozen = 0; G.fade = 0; G.alertT = 0;
    G.run = { lunch: 0, tasks: 0, escapes: 0, fridays: 0 };
    G.goalDone = false; G.goalEndT = 0; G.success = false; G.promoPending = null;
    if (G.mode === 'career' && careerDay().type === 'escapes') G.bossT = 8;
    G.friday = isFridayNow() || (G.mode === 'career' && careerDay().type === 'fridays');
    perf.reset();
  }

  const levelMult = () => Math.min(DIFFICULTY.speedMax, 1 + DIFFICULTY.speedPerLevel * (G.level - 1));
  const streakMult = () => 1 + Math.min(4, Math.floor(G.streak / 5)) * 0.5;
  const dailyBest = () => parseInt(store.get('ow_daily_' + todayKey(), '0'), 10) || 0;
  const activeTarget = () => {
    const c = G.challenge;
    if (!c) return null;
    if (c.daily && (G.mode !== 'daily' || c.d !== G.dailyKey)) return null;
    if (!c.daily && G.mode === 'daily') return null;
    return c;
  };

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
  const SIDE_SCREENS = ['wardrobe', 'settings', 'review', 'shop', 'leagues'];

  window.addEventListener('keydown', (e) => {
    if (isTyping(e)) return;
    if (!ui.excel.hidden) {
      if (e.code === 'KeyB' || e.code === 'Escape') { e.preventDefault(); closeBossKey(); }
      return;
    }
    const dir = KEYMAP[e.code];
    if (dir) {
      if (G.state === 'playing') { keys.add(dir); drag.used = false; e.preventDefault(); }
      return;
    }
    const onButton = e.target && (e.target.tagName === 'BUTTON' || e.target.tagName === 'SUMMARY' || e.target.tagName === 'A');
    if (e.code === 'KeyE') {
      if (G.state === 'playing' && !e.repeat) useHeld();
    } else if (e.code === 'KeyB') {
      if (!e.repeat) openBossKey();
    } else if (e.code === 'Space') {
      if (onButton && G.state !== 'playing') return;
      if (G.state === 'playing' || G.state === 'paused') {
        e.preventDefault();
        if (e.repeat) return;
        G.state === 'playing' ? pauseGame() : resumeGame();
      }
    } else if (e.code === 'Enter' || e.code === 'NumpadEnter') {
      if (onButton || e.repeat) return;
      if (G.state === 'menu' || G.state === 'over') { e.preventDefault(); startGame(G.state === 'over' ? G.mode : 'normal'); }
      else if (G.state === 'paused') { e.preventDefault(); resumeGame(); }
      else if (G.state === 'board') { e.preventDefault(); closeBoard(); }
    } else if (e.code === 'Escape' || e.code === 'KeyP') {
      if (G.state === 'playing') pauseGame();
      else if (G.state === 'paused') resumeGame();
      else if (G.state === 'board') closeBoard();
      else if (SIDE_SCREENS.includes(G.state) && e.code === 'Escape') toMenu();
    } else if (e.code === 'KeyM') {
      toggleAllSound();
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
  document.addEventListener('touchmove', (e) => {
    if ((G.state === 'playing' || G.state === 'dying') && e.cancelable) e.preventDefault();
  }, { passive: false });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (G.state === 'playing') pauseGame();
      if (Music) Music.stop(0.1);
      if (Voice) Voice.stop();
    } else if (Music && Sound.musicOn && G.state !== 'playing' && G.state !== 'paused' && ui.excel.hidden) {
      Music.start('menu'); Music.setMode('menu');
    }
  });
  window.addEventListener('blur', () => { keys.clear(); if (G.state === 'playing') pauseGame(); });
  window.addEventListener('resize', () => { resize(); drawIcons(); });
  window.addEventListener('orientationchange', () => setTimeout(resize, 120));

  /* ==================== UI: toast / banner / HUD ==================== */
  let toastTimer = 0;
  function toast(text, kind = 'info', ms = 2200, icon) {
    ui.toast.textContent = text;
    if (icon) ui.toast.insertAdjacentHTML('afterbegin', ico(icon));
    ui.toast.className = 'toast is-on is-' + kind;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { ui.toast.className = 'toast'; }, ms);
  }
  let bannerTimer = 0;
  function banner(text, warn = false) {
    ui.banner.textContent = text;
    ui.banner.className = 'banner';
    void ui.banner.offsetWidth;
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
    const ck = G.phase === 'commute' ? commuteClock() : officeClock(G.time);
    const cks = ck.text + ck.ap;
    if (force || c.clock !== cks) {
      ui.clock.innerHTML = ck.text + '<small>' + ck.ap + '</small>';
      ui.clock.classList.toggle('is-overtime', ck.overtime);
      c.clock = cks;
    }
    if (force || c.level !== G.level) { ui.level.textContent = G.level; c.level = G.level; }
    if (force || c.lives !== G.lives) {
      const slots = Math.min(CONFIG.MAX_LIVES, Math.max(CONFIG.START_LIVES, G.lives));
      let html = '';
      for (let i = 0; i < slots; i++) html += HEART(i < G.lives);
      ui.lives.innerHTML = html;
      ui.lives.setAttribute('aria-label', 'Lives: ' + G.lives);
      c.lives = G.lives;
    }
    const beat = score > G.bestAtStart && G.bestAtStart > 0;
    const bestShown = Math.max(G.bestAtStart, score);
    if (force || c.best !== bestShown || c.beat !== beat) {
      ui.best.textContent = (beat ? 'New best! ' : 'Best ') + fmtNum(bestShown);
      ui.best.classList.toggle('is-beaten', beat);
      c.best = bestShown; c.beat = beat;
    }
    const tg = activeTarget();
    const tgs = tg ? (G.challengeBeaten ? 'won' : tg.score) : '';
    if (force || c.target !== tgs) {
      ui.target.hidden = !tg;
      if (tg) {
        ui.target.textContent = G.challengeBeaten ? '✓ ' + tg.by : t('target') + ' ' + tg.by + ': ' + fmtNum(tg.score);
        ui.target.classList.toggle('is-beaten', G.challengeBeaten);
      }
      c.target = tgs;
    }
    if (force || c.daily !== G.mode) { ui.daily.hidden = G.mode !== 'daily'; c.daily = G.mode; }
    const mult = streakMult();
    const sk = G.streak >= 2 ? G.streak + '|' + mult : '';
    if (force || c.streak !== sk) {
      ui.streak.hidden = !sk;
      if (sk) ui.streak.textContent = t('streak') + ' ' + G.streak + (mult > 1 ? ' · x' + mult : '');
      c.streak = sk;
    }
    // shift event
    const ev = G.event ? G.event.id : '';
    if (force || c.ev !== ev) {
      ui.event.hidden = !ev;
      if (ev) ui.event.firstElementChild.textContent = t('ev_' + ev);
      c.ev = ev;
    }
    if (ev) ui.event.lastElementChild.style.width = clamp((G.event.t / G.event.dur) * 100, 0, 100).toFixed(1) + '%';
    // goal / commute status
    let gtxt = '';
    if (G.phase === 'commute') gtxt = G.commute.late > 0 ? t('lateChip')(G.commute.late) : '✓ 8:00';
    else if (G.mode === 'career') gtxt = (G.goalDone ? '✓ ' : '') + t('daysShort')[S.career.day] + ': ' + goalChipText();
    if (force || c.goal !== gtxt) {
      ui.goal.hidden = !gtxt;
      ui.goal.textContent = gtxt;
      ui.goal.classList.toggle('is-done', G.goalDone || (G.phase === 'commute' && G.commute.late === 0));
      c.goal = gtxt;
    }
    const fr = G.frozen > 0;
    if (force || c.fr !== fr) { ui.frozen.hidden = !fr; c.fr = fr; }
    const canSkip = G.phase === 'commute' && store.get('ow_commuted', '0') === '1';
    if (force || c.skip !== canSkip) { ui.skip.hidden = !canSkip; c.skip = canSkip; }
    updateUseBtn();
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
    if (name !== null) $('btn-use').hidden = true;
    if (name) {
      const el = ui.screens[name];
      const focusEl = el.querySelector('.btn-primary');
      if (focusEl) setTimeout(() => { try { focusEl.focus({ preventScroll: true }); } catch (e) { focusEl.focus(); } }, 30);
    }
  }

  function startGame(mode) {
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    store.set('ow_played', '1');
    resize();
    newRound(mode === 'daily' || mode === 'career' ? mode : 'normal');
    if (G.mode !== 'daily' && S.upg.pocket > 0) { G.held = 'autoreply'; S.upg.pocket--; saveS.upg(); }
    if (Voice) Voice.lang = S.lang;
    keys.clear();
    drag.active = false;
    clearOverlays();
    G.state = 'playing';
    showScreen(null);
    updateHud(true);
    Sound.wake();
    Sound.play('start');
    if (Music && Sound.musicOn) { Music.setLevel(1); Music.muffle(false); Music.start('game'); Music.setMode('game'); }
    const coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    G.startedAt = performance.now();
    ADS.seen = new Set(); ADS.views = 0;
    T('game_start', { mode: G.mode, commute: G.phase === 'commute', held: G.held || '' });
    if (G.phase === 'commute') { toast(t('commuteStart'), 'info', 2600); say('commute'); }
    else if (G.mode === 'career') toast(t('days')[S.career.day] + ': ' + t('goalText')(careerDay().type, goalTarget()), 'info', 2800);
    else toast(G.mode === 'daily' ? t('dailyStart') : coarse ? t('clockInTouch') : t('clockIn'), 'info', 2400);
    lastFrame = performance.now();
  }

  function pauseGame() {
    if (G.state !== 'playing') return;
    G.state = 'paused';
    keys.clear();
    drag.active = false;
    if (Music) Music.stop(0.2);
    if (Voice) Voice.stop();
    showScreen('pause');
  }

  function resumeGame() {
    if (G.state !== 'paused') return;
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    G.state = 'playing';
    showScreen(null);
    Sound.wake();
    if (Music && Sound.musicOn) { Music.start('game'); Music.setMode('game'); }
    lastFrame = performance.now();
  }

  function toMenu() {
    refreshSponsor(true);
    if (G.black) endBlackout(true);
    if (Voice) Voice.stop();
    G.state = 'menu';
    keys.clear();
    clearOverlays();
    refreshMenu();
    showScreen('menu');
    if (Music && Sound.musicOn) { Music.muffle(false); Music.start('menu'); Music.setMode('menu'); }
  }

  function openSide(name) {
    G.state = name;
    T('screen', { name });
    if (name === 'wardrobe') renderWardrobe();
    if (name === 'settings') syncSettingsUi();
    if (name === 'review') prepareReview();
    if (name === 'shop') renderShop();
    if (name === 'leagues') { renderLeagueHome(); leagueStatus(''); }
    showScreen(name);
  }

  function die() {
    G.state = 'dying';
    G.dyingT = 0.9;
    keys.clear();
    drag.active = false;
    if (G.black) endBlackout(true);
    if (Music) Music.stop(0.7);
  }

  function gameOver() {
    G.state = 'over';
    const score = Math.floor(G.scoreF);
    const prevBest = G.bestAtStart;
    const isBest = score > prevBest;
    if (G.mode === 'daily') {
      if (score > dailyBest()) store.set('ow_daily_' + G.dailyKey, score);
      stats.dailies++;
    }
    if (score > G.best) { G.best = score; store.set('ow_best', score); }
    // salary + career
    let pay = Math.floor(score / 5);
    let careerMsg = '', careerWon = false;
    if (G.mode === 'career') {
      const di = S.career.day, w = S.career.week, dname = t('days')[di];
      if (G.success) {
        const bonus = (200 + 100 * di) * w;
        pay += bonus;
        careerWon = true;
        careerMsg = t('dayDone')(dname, fmtNum(bonus));
        if (di === 4) { G.promoPending = { week: w, rank: PROMO_RANKS[Math.min(w - 1, PROMO_RANKS.length - 1)] }; S.career = { week: w + 1, day: 0 }; stats.weeks++; }
        else S.career = { week: w, day: di + 1 };
        saveS.career();
      } else {
        const d = careerDay();
        const prog = d.type === 'hour' ? (() => { const k = officeClock(G.time); return k.text + k.ap; })() : (G.run[d.type] || 0) + '/' + goalTarget();
        careerMsg = t('goalMissed')(dname, t('goalText')(d.type, goalTarget()) + ' (' + prog + ')');
      }
    }
    S.wallet += pay;
    saveS.wallet();
    T('game_over', { mode: G.mode, score, secs: Math.floor(G.time), real: Math.round((performance.now() - (G.startedAt || performance.now())) / 1000),
      level: G.level, cause: G.success ? 'goal' : (G.lastHit || 'unknown'), items: G.collected, streak: G.maxStreak, near: G.nearMisses,
      late: G.commute ? G.commute.late : 0, pay, success: !!G.success });
    if (G.mode === 'career') T('career_day', { day: careerWon ? (S.career.day + 4) % 5 : S.career.day, week: careerWon && S.career.day === 0 ? S.career.week - 1 : S.career.week, success: careerWon });
    recordWeekBest(score, Math.max(1, Math.floor(G.time)), G.level);
    submitLeagues({ score, duration: Math.max(1, Math.floor(G.time)), level: G.level });
    stats.games++;
    liveStats();
    checkBadges(false);
    saveProgress();

    clearOverlays();
    ui.overScore.textContent = fmtNum(score);
    ui.overTime.textContent = fmtTime(G.time);
    const ck = officeClock(G.time);
    ui.overClock.textContent = ck.text + ck.ap + (ck.nextDay ? ' (' + t('nextDay') + ')' : '');
    ui.overBest.textContent = fmtNum(G.mode === 'daily' ? dailyBest() : G.best);
    ui.overItems.textContent = G.collected;
    ui.overStreak.textContent = G.maxStreak;
    ui.overNear.textContent = G.nearMisses;
    const m = msgs();
    const tier = m.over.find((x) => score <= x.max) || m.over[m.over.length - 1];
    const beatOld = isBest && prevBest > 0;
    G.verdict = beatOld ? m.newBest + ' ' + tier.text : tier.text;
    ui.overMsg.textContent = G.verdict;
    G.stampText = beatOld ? t('newBestStamp') : prevBest === 0 ? t('firstShift') : t('shiftOver');
    if (careerWon) G.stampText = t('dayStamp');
    ui.overStamp.textContent = G.stampText;
    ui.overStamp.classList.toggle('is-best', beatOld || careerWon);
    $('over-pay').textContent = '₦' + fmtNum(pay);
    const og = $('over-goal');
    og.hidden = !careerMsg;
    og.textContent = careerMsg;
    og.classList.toggle('is-won', careerWon);
    ui.overStamp.style.animation = 'none'; void ui.overStamp.offsetWidth; ui.overStamp.style.animation = '';

    const tg = activeTarget();
    ui.overChallenge.hidden = !tg;
    if (tg) {
      const diff = score - tg.score;
      ui.overChallenge.textContent = diff > 0 ? t('challengeWon')(tg.by, fmtNum(diff)) : t('challengeLost')(tg.by, fmtNum(-diff || 1));
      ui.overChallenge.classList.toggle('is-won', diff > 0);
    }
    if (G.newBadges.length) {
      ui.overBadges.hidden = false;
      ui.overBadges.innerHTML = '';
      const st = document.createElement('strong'); st.textContent = t('newBadges');
      ui.overBadges.append(st);
      G.newBadges.forEach((b, i) => {
        const sp = document.createElement('span'); sp.className = 'ob-badge';
        sp.innerHTML = ico(b.ico); sp.append(b.name);
        ui.overBadges.append(sp);
      });
    } else ui.overBadges.hidden = true;

    ui.playerName.value = S.name;
    if (LB.enabled) {
      ui.lbForm.hidden = score <= 0;
      ui.lbStatus.textContent = '';
      ui.lbStatus.className = 'lb-status';
      ui.lbSubmit.disabled = false;
    }
    Sound.play('over');
    if (Voice) { Voice.stop(); say(beatOld ? 'new_best' : careerWon ? 'goal_done' : 'game_over'); }
    showScreen('over');
    showOverSponsor();
    if (G.promoPending) setTimeout(() => { if (G.state === 'over') openPromo(); }, 1300);
    refreshMenu();
    makeShareImage().then((b) => { G.shareBlob = b; }).catch(() => { G.shareBlob = null; });
    if (Music && Sound.musicOn) setTimeout(() => { if (G.state === 'over') { Music.muffle(false); Music.start('menu'); Music.setMode('menu'); } }, 1600);
  }

  /* ==================== Spawning ==================== */
  function spawnInterval() {
    const base = Math.max(DIFFICULTY.spawnMin, DIFFICULTY.spawnBase * Math.pow(DIFFICULTY.spawnDecay, G.level - 1));
    const widthFactor = clamp(520 / (FX1 - FX0), 0.6, 1.15);
    return base * widthFactor * (evIs('agm') ? 0.8 : 1);
  }

  function spawnObstacle() {
    const options = Object.entries(OBSTACLES).filter(([, d]) => G.level >= d.unlock).map(([k, d]) => [k, d.weight]);
    let type = weighted(options);
    if (evIs('agm') && rng() < 0.75) type = 'meeting';
    else if (evIs('travel') && rng() < 0.35) type = 'colleague';
    const d = OBSTACLES[type];
    const m = levelMult();
    const sp = rand(d.speed[0], d.speed[1]) * m;
    const o = { type, t: 0, rot: rand(-0.4, 0.4), vr: rand(-2.5, 2.5), minD: Infinity, warn: 0, phase: 'move', life: 0 };
    if (type === 'printer') {
      const fromLeft = rng() < 0.5;
      o.w = d.w; o.h = d.h;
      o.y = clamp(G.player.y + rand(-70, 70), minY(), maxY());
      o.x = fromLeft ? FX0 - 40 : FX1 + 40;
      o.vx = fromLeft ? sp : -sp; o.vy = 0;
      o.warn = 0.85; o.side = fromLeft ? 'L' : 'R';
      o.rot = 0; o.vr = 0;
    } else if (type === 'colleague') {
      const fromLeft = rng() < 0.5;
      o.r = d.r; o.hr = d.r * 0.8;
      o.x = fromLeft ? FX0 - 30 : FX1 + 30;
      o.y = rand(minY() - 60, minY() + 60);
      o.speed = sp; o.vx = fromLeft ? sp : -sp; o.vy = 0;
      o.warn = 0.85; o.side = fromLeft ? 'L' : 'R';
      o.life = 6.5; o.rot = 0; o.vr = 0;
      o.talk = pickF(msgs().colleagueTalk);
    } else {
      o.r = d.r; o.hr = d.r * 0.82;
      o.x = FX0 + d.r + 6 + rng() * (FX1 - FX0 - 2 * (d.r + 6));
      o.y = -d.r - 20;
      o.vx = 0; o.vy = sp;
      if (type === 'meeting') { o.baseX = clamp(o.x, FX0 + 50, FX1 - 50); o.phaseOff = rand(0, TAU); o.rot = 0; o.vr = 0; }
      if (type === 'deadline') { o.vx = (rng() < 0.5 ? -1 : 1) * rand(60, 110) * m; o.rot = 0; o.vr = 0; }
      if (type === 'network') { o.rot = 0; o.vr = 0; }
      if (type === 'task') { o.vr *= 0.4; }
    }
    G.obstacles.push(o);
  }

  function spawnOga() {
    const p = G.player;
    const side = ['L', 'R', 'T'][(rng() * 3) | 0];
    const o = { type: 'boss', boss: true, side, phase: 'warn', warn: 1.6, t: 0, r: 22, hr: 19, minD: Infinity, vx: 0, vy: 0, talkT: 0, talk: pickF(msgs().bossTalk) };
    if (side === 'L') { o.x = FX0 - 40; o.y = clamp(p.y, minY(), maxY()); }
    else if (side === 'R') { o.x = FX1 + 40; o.y = clamp(p.y, minY(), maxY()); }
    else { o.x = clamp(p.x, FX0 + 40, FX1 - 40); o.y = -40; }
    o.speed = Math.min(CONFIG.PLAYER_SPEED * 0.9, CONFIG.PLAYER_SPEED * (0.7 + 0.02 * G.level));
    o.chase = 5.5 + Math.min(4, G.level * 0.25);
    G.obstacles.push(o);
    banner(S.ogaName ? t('bossNamed')(S.ogaName) : t('boss'), true);
    say(S.ogaName ? 'boss_name' : 'boss_coming', { oga: S.ogaName });
    Sound.play('warn');
    if (Music) Music.fill();
  }

  function spawnItem(force, fast) {
    if (!force && evIs('audit')) return;
    const fri = G.mode === 'career' && careerDay().type === 'fridays';
    const money = (k) => k === 'salary' || k === 'lunch' || k === 'data';
    const options = Object.entries(ITEMS)
      .filter(([k, d]) => !d.unlock || G.level >= d.unlock || (k === 'friday' && fri))
      .map(([k, d]) => [k, (k === 'friday' && G.friday ? d.weight * (fri ? 6 : 2) : d.weight) * (evIs('salary') && money(k) ? 3 : 1)]);
    const type = force || weighted(options);
    const r = 15;
    G.items.push({
      type, r,
      x: FX0 + r + 10 + rng() * (FX1 - FX0 - 2 * (r + 10)), y: -r - 20,
      vy: fast ? rand(210, 260) : rand(120, 165) * (0.85 + 0.15 * levelMult()),
      t: rand(0, 3), wob: rand(0, TAU),
    });
  }

  /* ==================== NEPA blackout ==================== */
  function startBlackout() {
    G.black = { t: (DIFFICULTY.blackoutLength + Math.min(3, G.level * 0.15)) * (1 - 0.25 * ((G.upg && G.upg.stab) || 0)), age: 0, hit: false };
    say('nepa_off');
    banner(t('nepaBanner'), true);
    toast(t('nepaOff'), 'bad', 2000);
    Sound.play('powerdown');
    if (Music) Music.muffle(true);
  }
  function endBlackout(silent) {
    const b = G.black;
    G.black = null;
    if (Music) Music.muffle(false);
    if (silent || !b) return;
    T('blackout', { survived: !b.hit, level: G.level });
    Sound.play('powerup');
    say('nepa_on');
    if (!b.hit) {
      addScore(150);
      stats.blackouts++;
      G.badgeCheckT = 0;
      floater(t('nepaBonus'), G.player.x, G.player.y - 56, '#ffe066', 15);
      toast(t('nepaOn') + ' +150', 'good', 2000);
      confetti(24);
    } else toast(t('nepaOn'), 'good', 1800);
  }
  function blackoutAmount() {
    const b = G.black;
    if (!b) return 0;
    if (b.age < 0.7) return Math.floor(b.age * 14) % 2 === 0 ? 0.25 : 1; // flicker
    if (b.t < 0.5) return Math.max(0, b.t / 0.5);
    return 1;
  }

  /* ==================== Effects ==================== */
  function burst(x, y, color, n = 14, speed = 160, text) {
    const count = hiQ() ? n : Math.ceil(n / 2);
    for (let i = 0; i < count; i++) {
      if (G.particles.length > 320) G.particles.shift();
      const a = frand(0, TAU), s = frand(speed * 0.3, speed);
      G.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 40, life: frand(0.4, 0.8), max: 0.8, color, size: frand(2, 4.5), text: text && i % 4 === 0 ? text : null });
    }
  }
  const CONFETTI = ['#008751', '#ffffff', '#f5b301', '#19c37d', '#e5484d'];
  function confetti(n = 40) {
    const count = hiQ() ? n : Math.ceil(n / 3);
    for (let i = 0; i < count; i++) {
      if (G.particles.length > 320) G.particles.shift();
      G.particles.push({
        conf: true, x: frand(FX0, FX1), y: frand(-60, 40), vx: frand(-40, 40), vy: frand(60, 160),
        life: frand(1.6, 2.6), max: 2.6, color: pickF(CONFETTI), size: frand(4, 7), rot: frand(0, TAU), vr: frand(-8, 8),
      });
    }
  }
  function floater(text, x, y, color = '#fff', size = 15) {
    if (G.floaters.length > 40) G.floaters.shift();
    G.floaters.push({ text, x: clamp(x, FX0 + 60, FX1 - 60), y, life: 1.1, max: 1.1, color, size });
  }

  /* ==================== Badges ==================== */
  function checkBadges(live) {
    let changed = false;
    for (const b of BADGES) {
      if (unlocked.has(b.id)) continue;
      if ((stats[b.stat] || 0) >= b.goal) {
        unlocked.add(b.id);
        if (G.newBadges) G.newBadges.push(b);
        T('badge', { id: b.id });
        changed = true;
        if (live) {
          toast(t('badge') + b.name, 'badge', 2600, b.ico);
          Sound.play('badge');
        }
      }
    }
    if (changed) saveProgress();
  }
  function liveStats() {
    stats.maxLevel = Math.max(stats.maxLevel, G.level);
    stats.maxStreak = Math.max(stats.maxStreak, G.maxStreak);
    stats.maxTime = Math.max(stats.maxTime, Math.floor(G.time));
    stats.maxScore = Math.max(stats.maxScore, Math.floor(G.scoreF));
  }

  /* ==================== v3 systems ==================== */
  const Voice = window.OWVoice || null;
  function say(id, vars) { if (Voice && S.voices) Voice.say(id, vars); }
  const esc = (s) => String(s).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);

  // Name filter (same lists as the league server)
  const BAD_SUBSTR = ['fuck', 'shit', 'bitch', 'cunt', 'pussy', 'nigger', 'nigga', 'whore', 'slut', 'bastard', 'asshole',
    'ashawo', 'olosho', 'werey', 'oloriburuku', 'kpekus', 'gbola', 'oloshi'];
  const BAD_WORDS = ['dick', 'prick', 'rape', 'ode', 'toto', 'mumu', 'dindin', 'ass', 'sex'];
  function isRude(s) {
    const low = String(s || '').toLowerCase();
    const flat = low.replace(/0/g, 'o').replace(/1/g, 'i').replace(/3/g, 'e').replace(/[^a-z]/g, '');
    if (BAD_SUBSTR.some((w) => flat.includes(w))) return true;
    return low.replace(/0/g, 'o').replace(/1/g, 'i').split(/[^a-z]+/).some((w) => BAD_WORDS.includes(w));
  }
  (() => { const n = cleanName(store.get('ow_oga', '')).slice(0, 16); S.ogaName = isRude(n) ? '' : n; })();
  const ogaLabel = () => (S.ogaName ? 'OGA ' + S.ogaName.toUpperCase() : 'OGA');

  const floorSpeed = () => 55 + 6 * Math.min(G.level, 20);
  const ROAD_SPEED = 170;
  function laneXs() {
    const w = FX1 - FX0 - 24;
    const n = Math.max(3, Math.min(6, Math.floor(w / 105)));
    const lw = w / n;
    return Array.from({ length: n }, (_, i) => FX0 + 12 + lw * (i + 0.5));
  }

  /* ---------- Morning commute ---------- */
  function spawnCommuteObstacle() {
    const type = weighted(Object.entries(COMMUTE_OBS).map(([k, d]) => [k, d.weight]));
    const d = COMMUTE_OBS[type];
    const prog = clamp(G.commute.t / G.commute.dur, 0, 1);
    const m = 1 + prog * 0.25;
    const lanes = laneXs();
    const lx = lanes[(rng() * lanes.length) | 0] + rand(-10, 10);
    const o = { type, t: 0, rot: 0, vr: 0, minD: Infinity, warn: 0, phase: 'move', life: 0, commute: true };
    if (type === 'danfo') { o.w = d.w; o.h = d.h; o.x = lx; o.y = -70; o.vx = 0; o.vy = rand(d.speed[0], d.speed[1]) * m; }
    else if (type === 'agbero') {
      const fromLeft = rng() < 0.5;
      o.r = d.r; o.hr = d.r * 0.8;
      o.x = fromLeft ? FX0 - 30 : FX1 + 30;
      o.y = rand(minY() - 30, maxY() - 60);
      o.vx = (fromLeft ? 1 : -1) * rand(d.speed[0], d.speed[1]); o.vy = 0;
      o.warn = 0.7; o.side = fromLeft ? 'L' : 'R';
    } else if (type === 'pothole') { o.r = d.r; o.hr = d.r * 0.65; o.x = lx; o.y = -30; o.vx = 0; o.vy = ROAD_SPEED; }
    else { o.r = d.r; o.hr = d.r * 0.8; o.x = lx; o.y = -40; o.vx = 0; o.vy = rand(d.speed[0], d.speed[1]) * m; }
    G.obstacles.push(o);
  }
  function hitCommute(o) {
    const p = G.player;
    G.commute.late += 10;
    p.invuln = 1.1;
    G.shake = 9; G.flash = 0.15;
    o.hitDone = true;
    toast(t('commuteHit')[o.type] || '+10 mins late', 'bad', 1700);
    if (o.type === 'agbero') say('agbero'); else if (o.type === 'okada') say('okada');
    Sound.play('hit');
    burst(p.x, p.y, COLORS.gold, 12, 170);
    floater('+10 min', p.x, p.y - 40, '#ffb38a', 15);
    if (navigator.vibrate) { try { navigator.vibrate(50); } catch (e) { /* ignore */ } }
  }
  function commuteClock() {
    const c = G.commute;
    const mins = 7 * 60 + 45 + Math.min(1, c.t / c.dur) * 15 + c.late;
    const h = Math.floor(mins / 60), m = Math.floor(mins % 60);
    return { text: (((h + 11) % 12) + 1) + ':' + String(m).padStart(2, '0'), ap: h >= 12 ? 'pm' : 'am', overtime: c.late > 0, hour: mins / 60 };
  }
  function arrive(skipped) {
    if (G.phase !== 'commute') return;
    const late = G.commute.late;
    G.phase = 'office';
    T('commute_end', { late, skipped: !!skipped });
    G.obstacles = [];
    G.time = 0;
    G.spawnT = DIFFICULTY.graceSeconds + 0.6;
    G.itemT = 1.4;
    G.fade = 0.5;
    G.hudCache = {};
    $('btn-skip').hidden = true;
    store.set('ow_commuted', '1');
    if (!skipped) {
      if (late > 0) { G.lives = Math.max(1, G.lives - 1); toast(t('late')(late), 'bad', 2800); say('late'); G.flash = 0.2; }
      else { addScore(100); stats.ontime++; G.badgeCheckT = 0; toast(t('early'), 'good', 2400); say('early'); confetti(30); }
    }
    banner(t('clockedIn'));
    Sound.play('level');
  }
  function updateCommute(dt) {
    const c = G.commute;
    c.t += dt;
    G.scroll += ROAD_SPEED * dt;
    updatePlayer(dt);
    G.spawnT -= dt;
    if (G.spawnT <= 0) {
      spawnCommuteObstacle();
      G.spawnT = Math.max(0.42, 0.85 - c.t * 0.02) * rand(0.75, 1.25) * clamp(520 / (FX1 - FX0), 0.65, 1.15);
    }
    updateObstacles(dt);
    updateParticles(dt);
    addScore(3 * dt);
    if (c.t >= c.dur && G.state === 'playing') arrive(false);
  }

  /* ---------- Shift events ---------- */
  function startEvent(force) {
    const options = EVENTS.filter((e) => e !== G.lastEvent && !(e === 'travel' && G.mode === 'career' && careerDay().type === 'escapes'));
    const id = force || options[(rng() * options.length) | 0];
    G.event = { id, t: DIFFICULTY.eventLength, dur: DIFFICULTY.eventLength };
    G.lastEvent = id;
    T('event_start', { id, level: G.level });
    banner(t('ev_' + id), id === 'audit' || id === 'agm');
    toast(t('ev_' + id + '_d'), 'info', 2600);
    say('ev_' + id);
    Sound.play('level');
    if (id === 'travel') for (const o of G.obstacles) if (o.boss) leaveBoss(o);
    if (id === 'alert') G.alertT = 0.4;
  }
  function updateEvents(dt) {
    if (G.event) {
      G.event.t -= dt;
      if (G.event.id === 'alert') {
        G.alertT -= dt;
        if (G.alertT <= 0) { spawnItem(rng() < 0.05 ? 'friday' : 'salary', true); G.alertT = 0.24; }
      }
      if (G.event.t <= 0) {
        stats.events++; G.badgeCheckT = 0;
        G.event = null;
        G.eventT = rand(DIFFICULTY.eventEvery[0], DIFFICULTY.eventEvery[1]);
        toast(t('evOver'), 'info', 1600);
      }
    } else if (G.level >= DIFFICULTY.eventFromLevel && !G.black) {
      G.eventT -= dt;
      if (G.eventT <= 0) startEvent();
    }
  }
  const evIs = (id) => !!(G.event && G.event.id === id);

  /* ---------- Bosses ---------- */
  function pickBoss() {
    if (evIs('travel')) return null;
    if (G.mode === 'career' && careerDay().type === 'escapes') return 'oga';
    const opts = Object.entries(BOSS_TYPES).filter(([, b]) => G.level >= b.unlock).map(([k, b]) => [k, b.weight]);
    return opts.length ? weighted(opts) : null;
  }
  function spawnBoss() {
    if (G.obstacles.some((o) => o.boss)) return;
    const k = pickBoss();
    if (!k) return;
    ({ oga: spawnOga, driver: spawnDriver, hr: spawnHR, aunty: spawnAunty })[k]();
    T('boss', { type: k, level: G.level });
  }
  function leaveBoss(o) {
    if (o.type === 'driver') { o.phase = 'leave'; return; }
    o.phase = 'leave';
    o.hitDone = true;
  }
  function driverRow(o) {
    const p = G.player;
    o.y = clamp(p.y + rand(-20, 20), minY(), maxY());
    o.x = o.side === 'L' ? FX0 - 50 : FX1 + 50;
    o.hitDone = false;
    o.minD = Infinity;
  }
  function spawnDriver() {
    const o = { type: 'driver', boss: true, t: 0, phase: 'warn', wt: 1.1, passes: 2, side: rng() < 0.5 ? 'L' : 'R', r: 18, hr: 15, minD: Infinity, vx: 0, vy: 0, rot: 0, vr: 0 };
    driverRow(o);
    G.obstacles.push(o);
    toast(t('driverComing'), 'bad', 1800);
    say('driver');
    Sound.play('warn');
  }
  function spawnHR() {
    const o = { type: 'hr', boss: true, t: 0, phase: 'enter', x: (FX0 + FX1) / 2, y: -50, ty: Math.max(HUD_SPACE + 60, minY() - 64),
      life: 9, throwT: 1.1, r: 18, hr: 15, minD: Infinity, vx: 0, vy: 0, rot: 0, vr: 0, hitDone: true };
    G.obstacles.push(o);
    toast(t('hrComing'), 'bad', 1800);
    say('hr');
    Sound.play('warn');
  }
  function spawnQuery(h) {
    const p = G.player;
    const a = Math.atan2(p.y - h.y, p.x - h.x);
    const sp = 150 + G.level * 4;
    G.obstacles.push({ type: 'query', t: 0, x: h.x, y: h.y + 16, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, speed: sp, life: 4.5, r: 12, hr: 10, minD: Infinity, rot: 0, vr: 0, phase: 'move', warn: 0 });
  }
  function spawnAunty() {
    const fromLeft = rng() < 0.5;
    const o = { type: 'aunty', boss: true, t: 0, phase: 'chase', x: fromLeft ? FX0 - 30 : FX1 + 30, y: rand(minY(), maxY()), speed: CONFIG.PLAYER_SPEED * 0.6,
      vx: 0, vy: 0, life: 8, r: 18, hr: 15, minD: Infinity, rot: 0, vr: 0, warn: 0.8, side: fromLeft ? 'L' : 'R' };
    G.obstacles.push(o);
    toast(t('auntyComing'), 'bad', 1800);
    say('aunty');
    Sound.play('warn');
  }
  // movement for the new obstacle types; returns true when the obstacle should be removed
  function updateNewObstacle(o, dt) {
    const p = G.player;
    switch (o.type) {
      case 'driver':
        if (o.phase === 'warn') {
          o.wt -= dt;
          if (o.wt <= 0) { o.phase = 'dash'; o.vx = (o.side === 'L' ? 1 : -1) * Math.min(720, 560 + G.level * 8); }
        } else if (o.phase === 'dash') {
          o.x += o.vx * dt;
          if ((o.vx > 0 && o.x > FX1 + 60) || (o.vx < 0 && o.x < FX0 - 60)) {
            o.passes--;
            if (o.passes > 0 && G.state === 'playing') { o.side = o.side === 'L' ? 'R' : 'L'; o.phase = 'warn'; o.wt = 0.85; driverRow(o); }
            else return true;
          }
        } else return true;
        return false;
      case 'hr':
        if (o.phase === 'enter') { o.y += 160 * dt; if (o.y >= o.ty) { o.y = o.ty; o.phase = 'work'; } }
        else if (o.phase === 'work') {
          o.life -= dt;
          o.x = (FX0 + FX1) / 2 + Math.sin(o.t * 0.9) * ((FX1 - FX0) / 2 - 50);
          o.throwT -= dt;
          if (o.throwT <= 0 && G.calm <= 0 && G.state === 'playing') { spawnQuery(o); o.throwT = Math.max(0.8, 1.5 - G.level * 0.03); }
          if (o.life <= 0) o.phase = 'leave';
        } else { o.y -= 180 * dt; if (o.y < -70) return true; }
        return false;
      case 'query': {
        o.life -= dt;
        const want = Math.atan2(p.y - o.y, p.x - o.x);
        let cur = Math.atan2(o.vy, o.vx);
        let d = want - cur;
        while (d > Math.PI) d -= TAU;
        while (d < -Math.PI) d += TAU;
        cur += clamp(d, -1.5 * dt, 1.5 * dt);
        o.vx = Math.cos(cur) * o.speed; o.vy = Math.sin(cur) * o.speed;
        o.x += o.vx * dt; o.y += o.vy * dt;
        o.rot = Math.sin(o.t * 8) * 0.15;
        return o.life <= 0 || o.y > H + 40 || o.y < -60 || o.x < FX0 - 40 || o.x > FX1 + 40;
      }
      case 'aunty':
        if (o.phase === 'chase') {
          o.life -= dt;
          if (G.calm > 0) { o.vx *= 0.97; o.vy += (90 - o.vy) * Math.min(1, dt * 2); }
          else {
            const dx = p.x - o.x, dy = p.y - o.y;
            const d = Math.hypot(dx, dy) || 1;
            const k = Math.min(1, dt * 1.8);
            o.vx += ((dx / d) * o.speed - o.vx) * k;
            o.vy += ((dy / d) * o.speed - o.vy) * k;
          }
          if (o.life <= 0) o.phase = 'leave';
        } else {
          const dir = o.x < (FX0 + FX1) / 2 ? -1 : 1;
          o.vx += (dir * o.speed * 1.4 - o.vx) * Math.min(1, dt * 3);
          o.vy *= 0.95;
          if (o.x < FX0 - 70 || o.x > FX1 + 70) return true;
        }
        o.x += o.vx * dt; o.y += o.vy * dt;
        return false;
      case 'agbero':
        o.x += o.vx * dt;
        o.y += ROAD_SPEED * 0.3 * dt;
        return (o.vx > 0 && o.x > FX1 + 50) || (o.vx < 0 && o.x < FX0 - 50) || o.y > H + 50;
    }
    return null; // not a new type
  }
  const bossActive = (o) => (o.type === 'boss' ? o.phase === 'chase' : o.type === 'driver' ? o.phase === 'dash' : o.type === 'aunty' ? o.phase === 'chase' : o.type !== 'hr');
  function freezeSalary(o) {
    G.frozen = 6;
    o.phase = 'leave'; o.hitDone = true;
    toast(t('frozen'), 'bad', 2000);
    say('aunty_freeze');
    Sound.play('powerdown');
    floater(t('frozenPick'), G.player.x, G.player.y - 44, '#7fe0ff', 16);
    G.shake = 6;
  }

  /* ---------- Report desks (quick tasks) ---------- */
  function updateTask(dt) {
    const careerWed = G.mode === 'career' && careerDay().type === 'tasks';
    if (!G.task) {
      if (G.level >= (careerWed ? 1 : DIFFICULTY.taskFromLevel)) {
        G.taskT -= dt;
        if (G.taskT <= 0) {
          G.task = { x: FX0 + 70 + rng() * Math.max(10, FX1 - FX0 - 140), y: -40, prog: 0, t: 0, on: false };
          G.taskT = careerWed ? rand(12, 18) : rand(DIFFICULTY.taskEvery[0], DIFFICULTY.taskEvery[1]);
          toast(t('taskSpawn'), 'info', 2000);
        }
      }
      return;
    }
    const k = G.task;
    k.t += dt;
    k.y += floorSpeed() * 0.9 * dt;
    const p = G.player;
    k.on = Math.hypot(p.x - k.x, p.y - k.y) < 42;
    if (k.on) k.prog += dt / DIFFICULTY.taskSeconds; else k.prog = Math.max(0, k.prog - dt * 0.5);
    if (k.prog >= 1) {
      addScore(300);
      stats.tasks++; G.run.tasks++; G.badgeCheckT = 0;
      T('task_done', { level: G.level });
      floater(t('taskDone'), k.x, k.y - 34, '#7df0b5', 16);
      say('report_done');
      Sound.play('big');
      burst(k.x, k.y, COLORS.greenBright, 22, 200);
      G.task = null;
      return;
    }
    if (k.y > H + 60) G.task = null;
  }

  /* ---------- Keep-for-later power-ups ---------- */
  const heldName = (h) => STR.en['held_' + h] || h;
  function useHeld() {
    if (!G.held || G.state !== 'playing') return;
    const h = G.held;
    G.held = null;
    T('powerup_use', { id: h, level: G.level });
    if (h === 'autoreply') {
      let n = 0;
      for (let i = G.obstacles.length - 1; i >= 0; i--) {
        const o = G.obstacles[i];
        if (o.boss) continue;
        burst(o.x, o.y, '#7cc4ff', 8, 150);
        G.obstacles.splice(i, 1);
        n++;
      }
      addScore(5 * n);
      toast(t('used_autoreply'), 'good', 2000);
      say('use_autoreply');
      G.fade = 0.25;
    } else if (h === 'fakecall') {
      for (const o of G.obstacles) if (o.boss) leaveBoss(o);
      G.bossT = Math.max(G.bossT, 10);
      toast(t('used_fakecall'), 'good', 2200);
      say('use_fakecall');
    } else if (h === 'puffpuff') {
      G.calm = 8;
      toast(t('used_puffpuff'), 'good', 2200);
      say('use_puffpuff');
    }
    Sound.play('power');
    updateUseBtn();
  }
  function updateUseBtn() {
    const b = $('btn-use');
    const show = !!G.held && G.state === 'playing';
    if (b.hidden === show) b.hidden = !show;
    if (show && b.dataset.held !== G.held) {
      b.dataset.held = G.held;
      $('use-label').textContent = heldName(G.held);
      const cv = $('use-icon');
      const r = Math.min(window.devicePixelRatio || 1, 3);
      cv.width = 40 * r; cv.height = 40 * r;
      const c = cv.getContext('2d');
      c.setTransform(r, 0, 0, r, 0, 0);
      c.clearRect(0, 0, 40, 40);
      c.translate(20, 20); c.scale(1.05, 1.05);
      SPRITES[G.held](c, 0.3);
    }
    if (!show) b.dataset.held = '';
  }

  /* ---------- Career mode ---------- */
  const careerDay = () => CAREER_DAYS[S.career.day] || CAREER_DAYS[0];
  const goalTarget = () => careerDay().n(S.career.week);
  function goalMet() {
    const d = careerDay();
    if (d.type === 'hour') return officeClock(G.time).hour >= goalTarget();
    return (G.run[d.type] || 0) >= goalTarget();
  }
  function goalChipText() {
    const d = careerDay();
    if (d.type === 'hour') return t('goalText')('hour', goalTarget());
    return (t('goalChip') || STR.en.goalChip)(d.type, G.run[d.type] || 0, goalTarget());
  }
  function checkGoal(dt) {
    if (G.mode !== 'career' || G.phase !== 'office') return;
    if (!G.goalDone && goalMet()) {
      G.goalDone = true;
      G.goalEndT = 1.8;
      G.player.invuln = 99;
      banner(t('goalDone'));
      say('goal_done');
      confetti(60);
      Sound.play('badge');
    }
    if (G.goalDone) {
      G.goalEndT -= dt;
      if (G.goalEndT <= 0 && G.state === 'playing') { G.success = true; if (G.black) endBlackout(true); if (Music) Music.stop(0.6); gameOver(); }
    }
  }
  function openPromo() {
    const pr = G.promoPending;
    if (!pr) return;
    $('promo-name').textContent = S.name || t('newStaff');
    $('promo-ref').textContent = new Date().getFullYear() + '/' + String(pr.week).padStart(3, '0');
    $('promo-body').textContent = t('promoBody')(pr.rank, pr.week);
    G.state = 'promo';
    T('promotion', { week: pr.week });
    showScreen('promo');
    say('promoted');
    confetti(80);
    Sound.play('badge');
  }
  function makePromoImage() {
    return new Promise((resolve, reject) => {
      try {
        const pr = G.promoPending || { week: Math.max(1, S.career.week - 1), rank: PROMO_RANKS[Math.min(S.career.week - 2, 4)] || PROMO_RANKS[0] };
        const Wc = 1080, Hc = 1350;
        const cv = document.createElement('canvas'); cv.width = Wc; cv.height = Hc;
        const c = cv.getContext('2d');
        const DISPLAY = 'Impact, "Arial Black", system-ui, sans-serif';
        c.fillStyle = '#0d1526'; c.fillRect(0, 0, Wc, Hc);
        c.save(); c.translate(Wc / 2, Hc / 2); c.rotate(-0.02);
        c.fillStyle = 'rgba(0,0,0,.4)'; c.fillRect(-440, -585, 900, 1180);
        c.fillStyle = '#fffef8'; c.fillRect(-450, -600, 900, 1180);
        c.fillStyle = '#008751'; c.fillRect(-450, -600, 900, 18);
        c.textAlign = 'left'; c.textBaseline = 'alphabetic';
        c.fillStyle = '#008751'; c.fillRect(-390, -540, 26, 40); c.fillStyle = '#fff'; c.fillRect(-364, -540, 26, 40); c.fillStyle = '#008751'; c.fillRect(-338, -540, 26, 40);
        c.fillStyle = '#17203a'; c.font = '800 36px system-ui, Arial, sans-serif'; c.fillText('Wahala & Sons Ltd.', -290, -515);
        c.fillStyle = '#55607a'; c.font = '600 26px system-ui, Arial, sans-serif'; c.fillText('Human Resources Department', -290, -480);
        c.fillStyle = '#17203a'; c.fillRect(-390, -455, 780, 4);
        c.font = `900 64px ${DISPLAY}`; c.fillText('LETTER OF PROMOTION', -390, -365, 780);
        c.fillStyle = '#f5b301'; c.fillRect(-390, -350, 520, 6);
        c.fillStyle = '#17203a'; c.font = '400 34px Georgia, serif';
        c.fillText('Dear ' + (S.name || 'Staff') + ',', -390, -280);
        const lines = wrapText(c, t('promoBody')(pr.rank, pr.week), 780);
        lines.forEach((ln, i) => c.fillText(ln, -390, -220 + i * 50));
        const yy = -220 + lines.length * 50 + 50;
        c.fillText('Yours faithfully,', -390, yy);
        c.fillStyle = '#1b3a8a'; c.font = 'italic 64px "Brush Script MT", "Segoe Script", cursive'; c.fillText('Oga', -390, yy + 80);
        c.fillStyle = '#55607a'; c.font = '600 26px system-ui, Arial, sans-serif'; c.fillText('Managing Director', -390, yy + 118);
        // stamp
        c.save(); c.translate(250, yy + 40); c.rotate(-0.25);
        c.strokeStyle = '#008751'; c.lineWidth = 7; c.beginPath(); c.arc(0, 0, 105, 0, TAU); c.stroke();
        c.lineWidth = 3; c.beginPath(); c.arc(0, 0, 88, 0, TAU); c.stroke();
        c.fillStyle = '#008751'; c.textAlign = 'center'; c.font = `900 38px ${DISPLAY}`; c.fillText('APPROVED', 0, 0);
        c.font = '800 22px system-ui, Arial, sans-serif'; c.fillText('WEEK ' + pr.week, 0, 34);
        c.restore();
        c.restore();
        c.textAlign = 'center';
        c.fillStyle = '#f5b301'; c.font = '800 34px system-ui, Arial, sans-serif';
        const base = shareBase();
        c.fillText('Office Wahala' + (base ? ' · ' + base.replace(/^https?:\/\//, '').replace(/\/$/, '') : ''), Wc / 2, Hc - 24);
        cv.toBlob((b) => (b ? resolve(b) : reject(new Error('no blob'))), 'image/png');
      } catch (e) { reject(e); }
    });
  }
  async function sharePromo() {
    T('share', { kind: 'promotion' });
    try {
      const blob = await makePromoImage();
      const file = new File([blob], 'office-wahala-promotion.png', { type: 'image/png' });
      const base = shareBase();
      const text = (S.lang === 'pcm' ? 'Dem don promote me for Office Wahala! 🇳🇬 ' : 'I just got promoted in Office Wahala! 🇳🇬 ') + (base || '');
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try { await navigator.share({ files: [file], text, title: CONFIG.TITLE }); return; } catch (e) { if (e && e.name === 'AbortError') return; }
      }
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = 'office-wahala-promotion.png';
      document.body.appendChild(a); a.click();
      setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
      toast(t('imgSaved'), 'good', 2400);
    } catch (e) { toast(t('imgFail'), 'info', 2400); }
  }

  /* ---------- Staff shop ---------- */
  function renderShop() {
    $('shop-wallet').textContent = '₦' + fmtNum(S.wallet);
    const grid = $('shop-grid');
    grid.innerHTML = '';
    for (const it of SHOP_ITEMS) {
      const lvl = S.upg[it.id] || 0;
      const maxed = lvl >= it.max;
      const price = maxed ? 0 : it.price[lvl];
      const card = document.createElement('div');
      card.className = 'shop-card' + (maxed ? ' is-max' : '');
      card.innerHTML = '<span class="s-ico" aria-hidden="true"></span><span class="s-name"></span><span class="s-desc"></span><span class="s-level"></span>';
      card.querySelector('.s-ico').innerHTML = ico(it.ico);
      card.querySelector('.s-name').textContent = it.name;
      card.querySelector('.s-desc').textContent = it.desc;
      card.querySelector('.s-level').textContent = it.consumable ? `In pocket: ${lvl}/${it.max}` : `Level ${lvl}/${it.max}`;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn ' + (maxed ? 'btn-ghost' : 'btn-gold');
      btn.dataset.buy = it.id;
      btn.textContent = maxed ? (it.consumable ? 'Pocket full' : 'Maxed') : 'Buy ₦' + fmtNum(price);
      btn.disabled = maxed || S.wallet < price;
      card.appendChild(btn);
      grid.appendChild(card);
    }
  }
  function buyItem(id) {
    const it = SHOP_ITEMS.find((x) => x.id === id);
    if (!it) return;
    const lvl = S.upg[id] || 0;
    if (lvl >= it.max) return;
    const price = it.price[lvl];
    if (S.wallet < price) { toast(t('cantAfford'), 'info', 2000); return; }
    S.wallet -= price; S.upg[id] = lvl + 1;
    saveS.wallet(); saveS.upg();
    stats.buys++; checkBadges(true); saveProgress();
    T('shop_buy', { id, price, level: S.upg[id] });
    renderShop();
    toast(t('bought') + ' ' + it.name, 'good', 1800);
    Sound.play('coin');
  }
  function buyOutfit(id) {
    const price = OUTFIT_PRICES[id];
    if (!price || S.owned.has(id)) return;
    if (S.wallet < price) { toast(t('cantAfford'), 'info', 2000); return; }
    S.wallet -= price; S.owned.add(id);
    saveS.wallet(); saveS.owned();
    stats.buys++; checkBadges(true); saveProgress();
    S.outfit = id; store.set('ow_outfit', id);
    T('outfit_buy', { id, price });
    renderWardrobe();
    toast(t('bought'), 'good', 1800);
    Sound.play('coin');
  }

  /* ---------- Office leagues (Netlify Function) ---------- */
  const LG = { available: false, invite: null, current: null };
  function weekKeyLocal(now = Date.now()) {
    const d = new Date(now + 3600 * 1000);
    const day = (d.getUTCDay() + 6) % 7;
    d.setUTCDate(d.getUTCDate() - day + 3);
    const firstThu = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
    const week = 1 + Math.round(((d - firstThu) / 86400000 - 3 + ((firstThu.getUTCDay() + 6) % 7)) / 7);
    return d.getUTCFullYear() + '-W' + String(week).padStart(2, '0');
  }
  function api(path, opts) {
    return fetch(CONFIG.LEAGUE_API + path, Object.assign({ headers: { 'content-type': 'application/json' } }, opts || {}))
      .then(async (r) => {
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j.error || ('Error ' + r.status));
        return j;
      });
  }
  function probeLeagues() {
    if (!/^https?:$/.test(location.protocol)) return;
    api('/health').then((j) => {
      if (!j || !j.ok) return;
      LG.available = true;
      $('btn-leagues').hidden = false;
      const code = (new URLSearchParams(location.search).get('league') || '').toUpperCase();
      if (/^[A-HJ-NP-Z2-9]{6}$/.test(code) && !S.leagues.some((l) => l.code === code)) {
        api('/' + code).then((b) => { LG.invite = { code, name: b.name }; refreshMenu(); }).catch(() => {});
      }
    }).catch(() => {});
  }
  function recordWeekBest(score, duration, level) {
    const wk = weekKeyLocal();
    const wb = store.json('ow_weekbest', null);
    if (!wb || wb.week !== wk || score > wb.score) store.set('ow_weekbest', JSON.stringify({ week: wk, score, duration, level }));
  }
  function postScore(code, run) {
    return api('/' + code + '/score', { method: 'POST', body: JSON.stringify({ playerId: S.playerId, name: S.name, score: run.score, duration: run.duration, level: run.level }) });
  }
  async function submitLeagues(run) {
    if (!LG.available || !S.name || !S.leagues.length || run.score <= 0) return;
    for (const l of S.leagues) { try { await postScore(l.code, run); } catch (e) { /* keep playing */ } }
  }
  function leagueStatus(msg, kind) { const el = $('league-status'); el.textContent = msg || ''; el.className = 'lb-status' + (kind ? ' ' + kind : ''); }
  function needName() {
    if (S.name) return false;
    const inp = $('league-player');
    saveNameFrom(inp);
    if (S.name) return false;
    $('league-name-need').hidden = false;
    leagueStatus(t('leagueNeedName'), 'err');
    inp.focus();
    return true;
  }
  function renderLeagueHome() {
    $('league-home').hidden = false;
    $('league-board').hidden = true;
    $('league-name-need').hidden = !!S.name;
    $('league-player').value = S.name;
    const list = $('league-list');
    list.innerHTML = '';
    for (const l of S.leagues) {
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.type = 'button'; b.dataset.code = l.code;
      const n = document.createElement('span'); n.textContent = l.name;
      const c = document.createElement('small'); c.textContent = l.code;
      b.append(n, c); li.appendChild(b); list.appendChild(li);
    }
  }
  async function joinLeague(code, silent) {
    code = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!/^[A-HJ-NP-Z2-9]{6}$/.test(code)) { leagueStatus('That code is not valid. It has 6 letters and numbers.', 'err'); return false; }
    if (S.leagues.some((l) => l.code === code)) { leagueStatus(t('leagueAlready'), 'err'); openLeagueBoard(code); return true; }
    if (S.leagues.length >= 3) { leagueStatus(t('leagueMax'), 'err'); return false; }
    if (needName()) return false;
    try {
      const b = await api('/' + code);
      S.leagues.push({ code, name: b.name }); saveS.leagues();
      T('league_join');
      const wb = store.json('ow_weekbest', null);
      if (wb && wb.week === weekKeyLocal() && wb.score > 0) await postScore(code, wb).catch(() => {});
      if (!silent) toast(t('leagueJoined')(b.name), 'good', 2000);
      openLeagueBoard(code);
      return true;
    } catch (e) { leagueStatus(e.message || t('leagueOffline'), 'err'); return false; }
  }
  async function createLeague(name) {
    if (S.leagues.length >= 3) { leagueStatus(t('leagueMax'), 'err'); return; }
    if (needName()) return;
    try {
      const r = await api('', { method: 'POST', body: JSON.stringify({ name, playerId: S.playerId }) });
      S.leagues.push({ code: r.code, name: r.name }); saveS.leagues();
      T('league_create');
      const wb = store.json('ow_weekbest', null);
      if (wb && wb.week === weekKeyLocal() && wb.score > 0) await postScore(r.code, wb).catch(() => {});
      toast(t('leagueCreated')(r.code), 'good', 2600);
      $('league-new').value = '';
      openLeagueBoard(r.code);
    } catch (e) { leagueStatus(e.message || t('leagueOffline'), 'err'); }
  }
  async function openLeagueBoard(code) {
    LG.current = code;
    $('league-home').hidden = true;
    $('league-board').hidden = false;
    const l = S.leagues.find((x) => x.code === code);
    $('lb-name').textContent = l ? l.name : code;
    $('lb-code').textContent = code;
    const rows = $('league-rows');
    rows.innerHTML = '';
    const st = $('league-board-status');
    st.textContent = t('leagueLoading') || 'Loading…';
    try {
      const b = await api('/' + code);
      if (LG.current !== code) return;
      $('lb-name').textContent = b.name;
      st.textContent = b.players.length ? '' : t('leagueEmpty');
      for (const r of b.players) {
        const li = document.createElement('li');
        if (r.name === S.name) li.className = 'is-me';
        const n = document.createElement('span'); n.className = 'n'; n.textContent = r.name;
        const s = document.createElement('span'); s.className = 's'; s.textContent = fmtNum(r.score);
        const tt = document.createElement('span'); tt.className = 't'; tt.textContent = 'Survived ' + fmtTime(r.duration) + ' · level ' + r.level;
        li.append(n, s, tt);
        rows.appendChild(li);
      }
    } catch (e) { st.textContent = e.message || t('leagueOffline'); }
  }
  async function inviteLeague() {
    T('share', { kind: 'league' });
    const code = LG.current;
    const l = S.leagues.find((x) => x.code === code);
    const base = shareBase();
    let url = '';
    if (base) { try { const u = new URL(base); u.search = ''; u.searchParams.set('league', code); url = u.toString(); } catch (e) { url = ''; } }
    const text = t('leagueInviteText')(l ? l.name : code, code, url);
    if (navigator.share) { try { await navigator.share({ title: CONFIG.TITLE, text }); return; } catch (e) { if (e && e.name === 'AbortError') return; } }
    const ok = await copyText(text);
    toast(ok ? t('leagueCopied') : text, 'good', 2600);
  }
  function leaveLeague() {
    S.leagues = S.leagues.filter((l) => l.code !== LG.current);
    saveS.leagues();
    renderLeagueHome();
    leagueStatus(t('leagueLeft'), 'ok');
  }

  /* ---------- Analytics helper ---------- */
  function T(name, props) { try { if (window.OWTrack) window.OWTrack(name, props); } catch (e) { /* never break the game */ } }

  /* ---------- Sponsor billboards ---------- */
  const ADS = { list: [], imgs: {}, seen: new Set(), views: 0, menuAd: null, overAd: null };
  const AD_HEX = /^#[0-9a-f]{6}$/i;
  function setAds(cfg) {
    if (!cfg || !Array.isArray(cfg.ads)) return;
    ADS.list = cfg.ads.filter((a) => a && a.id && a.brand).slice(0, 30).map((a) => ({
      id: String(a.id).slice(0, 40), brand: String(a.brand).slice(0, 40), headline: String(a.headline || '').slice(0, 60), sub: String(a.sub || '').slice(0, 40),
      url: /^https:\/\//.test(a.url || '') ? a.url : '', image: /^https:\/\//.test(a.image || '') ? a.image : '',
      bg: AD_HEX.test(a.bg) ? a.bg : '#0d1526', fg: AD_HEX.test(a.fg) ? a.fg : '#ffffff', accent: AD_HEX.test(a.accent) ? a.accent : '#f5b301',
      weight: Math.max(1, Math.min(10, +a.weight || 1)), where: Array.isArray(a.where) && a.where.length ? a.where : ['road', 'office', 'menu'],
      start: a.start || '', end: a.end || '',
    }));
    for (const a of ADS.list) {
      if (a.image && !ADS.imgs[a.image]) { const im = new Image(); im.decoding = 'async'; im.src = a.image; ADS.imgs[a.image] = im; }
    }
  }
  const adActive = (a) => { const d = todayKey(); return (!a.start || d >= a.start) && (!a.end || d <= a.end); };
  function pickAd(where, seed) {
    const l = ADS.list.filter((a) => a.where.includes(where) && adActive(a));
    if (!l.length) return null;
    let r = seed * l.reduce((n, a) => n + a.weight, 0);
    for (const a of l) { r -= a.weight; if (r <= 0) return a; }
    return l[l.length - 1];
  }
  function loadAds() {
    const cached = store.json('ow_ads', null);
    if (cached) setAds(cached);
    if (!/^https?:$/.test(location.protocol)) return;
    fetch('api/ads', { cache: 'no-cache' })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => { if (j && Array.isArray(j.ads)) { setAds(j); store.set('ow_ads', JSON.stringify(j)); if (G.state === 'menu') refreshSponsor(true); } })
      .catch(() => {});
  }
  function adSeen(ad, where, key) {
    if (G.state !== 'playing' || ADS.seen.has(key) || ADS.views >= 40) return;
    ADS.seen.add(key);
    ADS.views++;
    T('ad_view', { id: ad.id, where });
  }
  function styleSponsor(el, ad) {
    el.style.setProperty('--sp-bg', ad.bg);
    el.style.setProperty('--sp-fg', ad.fg);
    el.style.setProperty('--sp-accent', ad.accent);
  }
  function refreshSponsor(repick) {
    if (repick || !ADS.menuAd) ADS.menuAd = pickAd('menu', Math.random());
    const ad = ADS.menuAd;
    const card = $('sponsor-card');
    card.hidden = !ad;
    if (!ad) return;
    styleSponsor(card.querySelector('.sponsor-body'), ad);
    $('sponsor-brand').textContent = ad.brand;
    $('sponsor-text').textContent = [ad.headline, ad.sub].filter(Boolean).join(' · ');
    $('sponsor-link').href = ad.url || '#';
    if (repick) T('ad_view', { id: ad.id, where: 'menu' });
  }
  function showOverSponsor() {
    const ad = (ADS.overAd = pickAd('menu', Math.random()));
    const el = $('over-sponsor');
    el.hidden = !ad;
    if (!ad) return;
    styleSponsor(el, ad);
    el.innerHTML = 'Shift sponsored by <b>' + esc(ad.brand) + '</b>' + (ad.headline ? ' · ' + esc(ad.headline) : '');
    el.href = ad.url || '#';
    T('ad_view', { id: ad.id, where: 'appraisal' });
  }
  function drawBillboard(c, x, y, w, h, ad, small) {
    c.save();
    c.translate(x, y);
    if (!small) {
      c.fillStyle = '#374151';
      c.fillRect(-w * 0.32, h / 2, 4, 16); c.fillRect(w * 0.32 - 4, h / 2, 4, 16);
      c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.ellipse(0, h / 2 + 17, w * 0.42, 4, 0, 0, TAU); c.fill();
    }
    c.fillStyle = '#1f2937'; rr(c, -w / 2 - 3, -h / 2 - 3, w + 6, h + 6, small ? 3 : 4); c.fill();
    c.fillStyle = ad.bg; rr(c, -w / 2, -h / 2, w, h, 2); c.fill();
    const im = ad.image && ADS.imgs[ad.image];
    if (im && im.complete && im.naturalWidth) {
      c.save(); c.beginPath(); c.rect(-w / 2, -h / 2, w, h); c.clip();
      const s = Math.max(w / im.naturalWidth, h / im.naturalHeight);
      c.drawImage(im, -im.naturalWidth * s / 2, -im.naturalHeight * s / 2, im.naturalWidth * s, im.naturalHeight * s);
      c.restore();
    } else {
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillStyle = ad.accent;
      c.font = `900 ${Math.round(h * 0.22)}px system-ui, Arial, sans-serif`;
      c.fillText(ad.brand, 0, -h * 0.26, w - 8);
      c.fillStyle = ad.fg;
      c.font = `700 ${Math.max(5, Math.round(h * 0.145))}px system-ui, Arial, sans-serif`;
      const lines = wrapText(c, ad.headline || '', w - 10).slice(0, 2);
      lines.forEach((ln, i) => c.fillText(ln, 0, (lines.length === 1 ? 0.02 : -0.06 + i * 0.17) * h, w - 8));
      if (ad.sub) {
        c.globalAlpha = 0.85;
        c.font = `800 ${Math.max(5, Math.round(h * 0.125))}px system-ui, Arial, sans-serif`;
        c.fillText(ad.sub, 0, h * 0.34, w - 8);
        c.globalAlpha = 1;
      }
    }
    if (!small) {
      c.fillStyle = 'rgba(255,240,180,.9)'; circle(c, -w * 0.3, -h / 2 - 5, 2); c.fill(); circle(c, w * 0.3, -h / 2 - 5, 2); c.fill();
    }
    c.fillStyle = 'rgba(0,0,0,.45)'; rr(c, w / 2 - 15, -h / 2 + 2, 13, 8, 2); c.fill();
    c.fillStyle = '#fff'; c.font = '800 5.5px system-ui, Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('AD', w / 2 - 8.5, -h / 2 + 6.3);
    c.restore();
  }

  /* ---------- Commute background ---------- */
  function drawRoad(c, tm) {
    c.fillStyle = '#2a2f37'; c.fillRect(0, 0, W, H);
    const off = G.scroll;
    // roadside city on wide screens
    if (FX0 > 24) {
      const SEG = 140;
      const o2 = off % SEG, base = Math.floor(off / SEG);
      for (let k = -1; k <= Math.ceil(H / SEG) + 1; k++) {
        const y = k * SEG + o2, id = k - base;
        for (const side of [-1, 1]) {
          const edge = side < 0 ? FX0 - 26 : FX1 + 26;
          for (let j = 0; j < 4; j++) {
            const x = edge + side * (40 + j * 92);
            if (x < -60 || x > W + 60) continue;
            const hsh = hash(id * 7.3 + j * 3.1 + side);
            const bw = 70, bh = 90 + hsh * 30;
            c.fillStyle = ['#5c6b8a', '#8a6d5c', '#6b8a72', '#8a5c6b', '#7a7f8c'][Math.floor(hsh * 5)];
            c.fillRect(x - bw / 2, y - bh / 2, bw, bh);
            c.fillStyle = 'rgba(255,230,160,.55)';
            for (let wy = 0; wy < 3; wy++) for (let wx = 0; wx < 3; wx++) if (hash(id + wx * 5 + wy * 11 + j) > 0.35) c.fillRect(x - 26 + wx * 20, y - bh / 2 + 14 + wy * 26, 12, 14);
          }
        }
      }
    }
    // sidewalks
    c.fillStyle = '#b9b2a4';
    c.fillRect(FX0 - 24, 0, 24, H); c.fillRect(FX1, 0, 24, H);
    // asphalt
    c.fillStyle = '#3b4049'; c.fillRect(FX0, 0, FX1 - FX0, H);
    c.fillStyle = 'rgba(255,255,255,.025)';
    for (let i = 0; i < 40; i++) c.fillRect(FX0 + hash(i * 3.7) * (FX1 - FX0), ((hash(i * 1.9) * H + off) % H), 3, 3);
    // kerb stripes
    const KS = 28, ko = off % (KS * 2);
    for (let y = ko - KS * 2; y < H; y += KS * 2) {
      c.fillStyle = '#f5c400'; c.fillRect(FX0, y, 8, KS); c.fillRect(FX1 - 8, y, 8, KS);
      c.fillStyle = '#111'; c.fillRect(FX0, y + KS, 8, KS); c.fillRect(FX1 - 8, y + KS, 8, KS);
    }
    // BRT lane (left) and lane dashes
    const lanes = laneXs();
    const lw = lanes.length > 1 ? lanes[1] - lanes[0] : 100;
    c.fillStyle = 'rgba(214,47,58,.16)'; c.fillRect(FX0 + 8, 0, lw + 4, H);
    c.fillStyle = 'rgba(255,255,255,.35)'; c.font = '900 16px system-ui, Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    const by = ((off * 1) % 420) - 60;
    for (let y = by; y < H + 60; y += 420) c.fillText('BRT ONLY', lanes[0], y);
    c.fillStyle = 'rgba(255,255,255,.75)';
    for (let i = 1; i < lanes.length; i++) {
      const x = (lanes[i - 1] + lanes[i]) / 2;
      for (let y = (off % 60) - 60; y < H; y += 60) c.fillRect(x - 2, y, 4, 30);
    }
    // sponsor billboards along the road
    if (ADS.list.length) {
      const SEGA = 290, ao = off % SEGA, abase = Math.floor(off / SEGA);
      const bw = Math.min(124, Math.max(92, (FX1 - FX0) * 0.34)), bh = bw * 0.56;
      for (let k = -1; k <= Math.ceil(H / SEGA) + 1; k++) {
        const y = k * SEGA + ao - 40, id = k - abase;
        const ad = pickAd('road', hash(id * 4.17 + 2.3));
        if (!ad) continue;
        const left = ((id % 2) + 2) % 2 === 0;
        const roomOut = FX0 > bw + 40;
        const x = left ? (roomOut ? FX0 - bw / 2 - 30 : FX0 + bw / 2 - 2) : (roomOut ? FX1 + bw / 2 + 30 : FX1 - bw / 2 + 2);
        drawBillboard(c, x, y, bw, bh, ad);
        if (y > 40 && y < H - 40) adSeen(ad, 'road', 'r' + id);
      }
    }
    // street lamps on the kerbs
    for (let y = (off % 260) - 260; y < H + 40; y += 260) {
      for (const x of [FX0 - 12, FX1 + 12]) {
        c.fillStyle = '#4b5563'; circle(c, x, y, 5); c.fill();
        c.fillStyle = 'rgba(255,220,140,.12)'; circle(c, x, y, 26); c.fill();
      }
    }
    const g = c.createLinearGradient(0, 0, 0, 160);
    g.addColorStop(0, 'rgba(8,13,26,.75)'); g.addColorStop(1, 'rgba(8,13,26,0)');
    c.fillStyle = g; c.fillRect(0, 0, W, 160);
  }
  function drawTaskDesk(c, k, tm) {
    const pulse = (Math.sin(tm * 5) + 1) / 2;
    c.save();
    c.translate(k.x, k.y);
    if (hiQ()) {
      const g = c.createRadialGradient(0, 0, 8, 0, 0, 52);
      g.addColorStop(0, `rgba(245,179,1,${0.28 + pulse * 0.18})`); g.addColorStop(1, 'rgba(245,179,1,0)');
      c.fillStyle = g; circle(c, 0, 0, 52); c.fill();
    }
    c.strokeStyle = `rgba(245,179,1,${0.55 + pulse * 0.4})`; c.lineWidth = 3; c.setLineDash([7, 6]);
    circle(c, 0, 4, 38); c.stroke(); c.setLineDash([]);
    SPRITES.taskdesk(c, tm);
    if (k.prog > 0) {
      c.strokeStyle = COLORS.greenBright; c.lineWidth = 6; c.lineCap = 'round';
      c.beginPath(); c.arc(0, 4, 38, -Math.PI / 2, -Math.PI / 2 + TAU * Math.min(1, k.prog)); c.stroke();
    }
    c.restore();
  }
  function drawTaskLabel(c, k) {
    if (!k.on) drawTag(c, k.x, k.y - 36, t('taskLabel'), COLORS.gold);
    else drawTag(c, k.x, k.y - 58, Math.round(k.prog * 100) + '%', COLORS.greenBright, '#fff');
  }
  function drawNewBoss(c, o, p, tm) {
    if (o.type === 'driver') {
      if (o.phase === 'warn') {
        const pulse = (Math.sin(tm * 18) + 1) / 2;
        c.fillStyle = `rgba(229,72,77,${0.12 + pulse * 0.14})`;
        c.fillRect(FX0, o.y - 24, FX1 - FX0, 48);
        c.strokeStyle = `rgba(229,72,77,${0.5 + pulse * 0.4})`; c.lineWidth = 2; c.setLineDash([10, 8]);
        c.beginPath(); c.moveTo(FX0, o.y - 24); c.lineTo(FX1, o.y - 24); c.moveTo(FX0, o.y + 24); c.lineTo(FX1, o.y + 24); c.stroke();
        c.setLineDash([]);
        drawWarning(c, { side: o.side, y: o.y, x: o.x, boss: true }, tm);
        return;
      }
      if (o.phase !== 'dash') return;
      c.save(); c.translate(o.x, o.y);
      c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 2;
      const dir = o.vx > 0 ? -1 : 1;
      for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(dir * 22, -14 + i * 9); c.lineTo(dir * (46 + i * 6), -14 + i * 9); c.stroke(); }
      SPRITES.driver(c, o.t, { lookX: -dir });
      c.restore();
      drawTag(c, o.x, o.y - 50, "MD'S DRIVER", '#111827', '#fff');
      speech(c, msgs() === MESSAGES.pcm ? 'Comot for road!' : 'Make way!', o.x, o.y - 60);
      return;
    }
    c.save(); c.translate(o.x, o.y);
    if (o.type === 'hr') {
      SPRITES.hr(c, o.t, { lookX: (p.x - o.x) / 120, lookY: 1 });
      c.restore();
      drawTag(c, o.x, o.y - 52, 'HR', '#b0306a', '#fff');
      if (o.phase === 'work') speech(c, G.calm > 0 ? t('thanks') : 'Query!', o.x, o.y - 62);
    } else if (o.type === 'aunty') {
      SPRITES.aunty(c, o.t, { lookX: (p.x - o.x) / 120, lookY: (p.y - o.y) / 120, mood: G.calm > 0 ? 'happy' : 'angry' });
      c.restore();
      drawTag(c, o.x, o.y - 60, 'ACCOUNTS', '#d62f3a', '#fff');
      if (o.phase === 'chase') speech(c, G.calm > 0 ? t('thanks') : (S.lang === 'pcm' ? 'Who approve am?' : 'Who approved this?'), o.x, o.y - 70);
    } else if (o.type === 'agbero') {
      SPRITES.agbero(c, o.t);
      c.restore();
      if (!o.hitDone) speech(c, 'Owo da?', o.x, o.y - 34);
    } else c.restore();
  }
  function drawTag(c, x, y, text, bg, fg) {
    c.font = '900 9px system-ui, Arial, sans-serif';
    const w = Math.max(32, c.measureText(text).width + 12);
    c.fillStyle = bg; rr(c, x - w / 2, y - 7, w, 14, 7); c.fill();
    c.fillStyle = fg || COLORS.ink; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(text, x, y + 0.5);
  }

  /* ==================== Update ==================== */
  function updatePlayer(dt) {
    const p = G.player;
    let ax = 0, ay = 0;
    if (keys.has('L')) ax -= 1;
    if (keys.has('R')) ax += 1;
    if (keys.has('U')) ay -= 1;
    if (keys.has('D')) ay += 1;
    const spd = CONFIG.PLAYER_SPEED * (p.fuel > 0 ? 1.45 : 1) * (1 + 0.05 * ((G.upg && G.upg.chair) || 0));
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
        const st = Math.min(dist, maxStep);
        p.vx = (dx / dist) * st / dt; p.vy = (dy / dist) * st / dt;
        p.x += (dx / dist) * st; p.y += (dy / dist) * st;
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
    if (p.fuel > 0 && moving > 40 && Math.random() < (hiQ() ? 0.6 : 0.25)) {
      G.particles.push({ x: p.x + frand(-6, 6), y: p.y + 20, vx: frand(-20, 20), vy: frand(20, 60), life: 0.35, max: 0.35, color: '#ffd34d', size: frand(2, 4) });
    }
    p.invuln = Math.max(0, p.invuln - dt);
    p.leave = Math.max(0, p.leave - dt);
    p.fuel = Math.max(0, p.fuel - dt);
  }

  function hurt(o) {
    const p = G.player;
    const dmg = o.type === 'boss' ? 2 : 1;
    G.lives = Math.max(0, G.lives - dmg);
    G.lastHit = o.type === 'boss' ? 'oga' : o.type;
    G.streak = 0;
    p.invuln = 1.6;
    G.shake = o.type === 'boss' ? 18 : 11;
    G.flash = 0.25;
    if (G.black) G.black.hit = true;
    burst(p.x, p.y, COLORS.red, 18, 200);
    floater(dmg > 1 ? t('lives2') : t('life1'), p.x, p.y - 40, '#ff8a8e', 16);
    toast(msgs().hit[o.type] || (o.type === 'query' ? t('query') : o.type === 'driver' ? t('driverComing') : 'Wahala!'), 'bad', 1800);
    if (o.type === 'boss') say('boss_caught');
    Sound.play('hit');
    if (navigator.vibrate) { try { navigator.vibrate(o.type === 'boss' ? [60, 40, 90] : 60); } catch (e) { /* ignore */ } }
    if (G.lives <= 0) die();
  }

  function addScore(pts) { G.scoreF = Math.max(0, G.scoreF + pts); }

  function bonk(o) {
    addScore(25);
    burst(o.x, o.y, COLORS.greenBright, 10, 160);
    floater('+25 ' + t('onLeave'), o.x, o.y - 20, '#7df0b5', 13);
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

      const nr = updateNewObstacle(o, dt);
      if (nr !== null) remove = nr;
      else switch (o.type) {
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
          if (o.life > 0 && G.calm <= 0) {
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
          if (o.talkT <= 0) { o.talk = pickF(msgs().bossTalk); o.talkT = 2.2; }
          if (o.phase === 'chase') {
            o.chase -= dt;
            const dx = p.x - o.x, dy = p.y - o.y;
            const d = Math.hypot(dx, dy) || 1;
            const k = Math.min(1, dt * 2.2);
            o.vx += ((dx / d) * o.speed - o.vx) * k;
            o.vy += ((dy / d) * o.speed - o.vy) * k;
            if (o.chase <= 0) {
              o.phase = 'leave';
              if (!o.hitDone && G.state === 'playing') {
                addScore(100);
                stats.escapes++;
                G.run.escapes++;
                say('boss_escaped');
                G.badgeCheckT = 0;
                floater(t('escaped'), p.x, p.y - 56, '#ffe066', 15);
                Sound.play('big');
              }
            }
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

      if (!['printer', 'colleague', 'boss', 'driver', 'hr', 'aunty', 'agbero', 'query'].includes(o.type) && o.y > H + 50) remove = true;

      const active = !o.hitDone && (!o.boss || bossActive(o));
      if (!remove && active && G.state === 'playing') {
        const hit = o.type === 'printer' || o.type === 'danfo' ? collidesRect(o, p) : collidesCircle(o, p);
        if (hit) {
          if (o.commute) {
            if (p.invuln <= 0) hitCommute(o);
          } else if (p.leave > 0 && o.type === 'aunty') {
            toast(t('auntyMiss'), 'good', 1600); o.phase = 'leave'; o.hitDone = true;
          } else if (p.leave > 0 && o.type === 'driver') {
            o.hitDone = true;
          } else if (p.invuln <= 0 && o.type === 'aunty') {
            freezeSalary(o);
          } else if (p.leave > 0) {
            if (o.type === 'boss') {
              toast(t('leaveBoss'), 'good', 1800);
              addScore(50); floater('+50', o.x, o.y - 40, '#7df0b5', 15);
              o.phase = 'leave'; o.hitDone = true;
              burst(o.x, o.y, COLORS.greenBright, 16, 200);
            } else { bonk(o); remove = true; }
          } else if (p.invuln <= 0) {
            hurt(o);
            if (o.type === 'boss') { o.phase = 'leave'; o.hitDone = true; }
            else if (o.type === 'driver') o.hitDone = true;
            else { burst(o.x, o.y, '#ffffff', 8, 120); remove = true; }
          }
        }
      }

      if (remove) {
        if (!o.hitDone && o.minD < 18 && o.minD > -1 && G.state === 'playing' && p.invuln <= 0) {
          addScore(10);
          G.nearMisses++;
          stats.near++;
          floater(t('close'), p.x, p.y - 44, '#c7d2fe', 13);
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
    if (d.held) {
      G.collected++; G.streak++; G.maxStreak = Math.max(G.maxStreak, G.streak);
      G.held = it.type;
      T('powerup_pick', { id: it.type });
      updateUseBtn();
      toast(t('heldGot')(heldName(it.type)), 'good', 2000);
      Sound.play('power');
      burst(it.x, it.y, d.color, 14, 170);
      return;
    }
    G.collected++;
    G.streak++;
    G.maxStreak = Math.max(G.maxStreak, G.streak);
    const mult = streakMult();
    if (d.pts) {
      const pts = G.frozen > 0 && it.type !== 'friday' ? 0 : Math.round((d.pts + (it.type === 'lunch' ? 25 * ((G.upg && G.upg.canteen) || 0) : 0)) * mult);
      addScore(pts);
      if (pts === 0) floater(t('frozenPick'), it.x, it.y - 10, '#7fe0ff', 15);
      else floater('+' + pts + (mult > 1 ? ' (x' + mult + ')' : ''), it.x, it.y - 10, d.color, it.type === 'friday' ? 20 : 16);
    }
    if (d.power === 'leave') { p.leave = d.dur; p.invuln = 0; toast(t('leave'), 'good', 1800); Sound.play('power'); say('leave'); }
    else if (d.power === 'fuel') { p.fuel = d.dur; toast(t('fuel'), 'good', 1600); Sound.play('power'); }
    else if (it.type === 'friday') {
      if (G.lives < CONFIG.MAX_LIVES) { G.lives++; floater(t('life'), p.x, p.y - 50, '#ff8a8e', 15); }
      stats.fridays++;
      G.run.fridays++;
      say('tgif');
      G.badgeCheckT = 0;
      toast(t('tgif'), 'good', 1800);
      Sound.play('big');
      confetti(30);
    } else if (it.type === 'salary') {
      if (Math.random() < 0.45) { toast(t('salary'), 'good', 1400); say('salary'); }
      Sound.play('coin');
    } else {
      if (it.type === 'lunch') { stats.lunch++; G.run.lunch++; }
      Sound.play('coin');
    }
    const money = it.type === 'salary' || it.type === 'lunch' || it.type === 'friday';
    burst(it.x, it.y, d.color, it.type === 'friday' ? 26 : 14, 170, money ? '₦' : null);
    if (G.streak > 0 && G.streak % 5 === 0) {
      const bonus = Math.min(250, 25 * (G.streak / 5));
      addScore(bonus);
      floater(t('streak') + ' ' + G.streak + '! +' + bonus, p.x, p.y - 62, '#ffe066', 17);
      if (G.streak % 10 === 0) say('streak');
      Sound.play('big');
    }
  }

  function updateParticles(dt) {
    for (let i = G.particles.length - 1; i >= 0; i--) {
      const q = G.particles[i];
      q.life -= dt;
      if (q.life <= 0) { G.particles.splice(i, 1); continue; }
      if (q.conf) { q.vy += 30 * dt; q.vx += Math.sin(q.life * 6) * 30 * dt; q.rot += q.vr * dt; }
      else q.vy += 260 * dt;
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
    if (G.state === 'playing' && G.phase === 'commute') {
      updateCommute(dt);
      updateHud(false);
      perf.sample(dt);
    } else if (G.state === 'playing') {
      G.time += dt;
      const newLevel = 1 + Math.floor(G.time / CONFIG.LEVEL_SECONDS);
      if (newLevel > G.level) {
        G.level = newLevel;
        banner(t('level') + ' ' + G.level);
        Sound.play('level');
        confetti(36);
        if (Music) Music.setLevel(G.level);
        say('level');
        if (G.level <= 12 || G.level % 5 === 0) T('level_up', { level: G.level, mode: G.mode });
        const later = (k) => setTimeout(() => G.state === 'playing' && toast(t(k), 'info'), 1600);
        if (G.level === OBSTACLES.deadline.unlock) later('deadlines');
        if (G.level === OBSTACLES.printer.unlock) later('printers');
        if (G.level === OBSTACLES.colleague.unlock) later('colleague');
      }
      addScore(DIFFICULTY.survivalPerSecond * Math.min(G.level, 25) * dt * (evIs('audit') ? 2 : 1));
      G.scroll += floorSpeed() * dt;

      updatePlayer(dt);

      G.spawnT -= dt;
      if (G.spawnT <= 0) { spawnObstacle(); G.spawnT = spawnInterval() * rand(0.7, 1.3); }
      G.itemT -= dt;
      if (G.itemT <= 0) { spawnItem(); G.itemT = rand(DIFFICULTY.itemEvery[0], DIFFICULTY.itemEvery[1]) * (evIs('salary') ? 0.4 : 1); }
      const careerThu = G.mode === 'career' && careerDay().type === 'escapes';
      if (G.level >= DIFFICULTY.bossFromLevel || careerThu) {
        G.bossT -= dt;
        if (G.bossT <= 0) {
          if (G.black || evIs('travel') || G.obstacles.some((o) => o.boss)) G.bossT = 3;
          else { spawnBoss(); G.bossT = careerThu ? rand(14, 20) : rand(DIFFICULTY.bossEvery[0], DIFFICULTY.bossEvery[1]) * Math.max(0.6, 1 - G.level * 0.02); }
        }
      }
      if (G.level >= DIFFICULTY.blackoutFromLevel) {
        if (G.black) {
          G.black.age += dt; G.black.t -= dt;
          if (G.black.t <= 0) endBlackout(false);
        } else {
          G.blackT -= dt;
          if (G.blackT <= 0) {
            if (G.event || G.obstacles.some((o) => o.boss)) G.blackT = 2;
            else { startBlackout(); G.blackT = rand(DIFFICULTY.blackoutEvery[0], DIFFICULTY.blackoutEvery[1]); }
          }
        }
      }
      G.msgT -= dt;
      if (G.msgT <= 0) {
        let m = pickF(msgs().ambient);
        if (m === G.lastMsg) m = pickF(msgs().ambient);
        G.lastMsg = m;
        if (!G.black && !G.event) {
          if (S.voices && Voice && Math.random() < 0.6) {
            const id = 'a' + (1 + ((Math.random() * 8) | 0));
            const line = Voice.LINES[id];
            toast(line[S.lang] || line.en, 'info', 2200);
            say(id);
          } else toast(m, 'info', 2200);
        }
        G.msgT = frand(9, 16);
      }
      updateObstacles(dt);
      updateItems(dt);
      updateParticles(dt);
      updateEvents(dt);
      updateTask(dt);
      G.calm = Math.max(0, G.calm - dt);
      G.frozen = Math.max(0, G.frozen - dt);
      checkGoal(dt);

      // live progress: target, new best, badges
      if (G.state === 'playing') {
        const score = Math.floor(G.scoreF);
        const tg = activeTarget();
        if (tg && !G.challengeBeaten && score > tg.score) {
          G.challengeBeaten = true;
          stats.challenges++;
          G.badgeCheckT = 0;
          banner(t('targetBeat'));
          Sound.play('badge');
          confetti(50);
        }
        if (!G.beatBestLive && G.bestAtStart > 0 && score > G.bestAtStart) {
          G.beatBestLive = true;
          confetti(40);
          Sound.play('big');
        }
        G.badgeCheckT -= dt;
        if (G.badgeCheckT <= 0) { liveStats(); checkBadges(true); G.badgeCheckT = 1; }
      }

      updateHud(false);
      perf.sample(dt);
    } else if (G.state === 'dying') {
      G.dyingT -= dt;
      updateObstacles(dt * 0.25);
      updateParticles(dt);
      updateHud(false);
      if (G.dyingT <= 0) gameOver();
    } else if (G.state !== 'paused') {
      G.scroll += 40 * dt;
      if (G.particles && G.particles.length) updateParticles(dt);
    }
    G.shake *= Math.exp(-dt * 9);
    G.flash = Math.max(0, (G.flash || 0) - dt);
    G.fade = Math.max(0, (G.fade || 0) - dt * 1.5);
  }

  /* ==================== Render ==================== */
  // sky colours through the day: [hour, top, bottom]
  const SKY = [
    [7, '#ffb88a', '#ffe2b8'], [9, '#8ecfff', '#e3f3ff'], [13, '#4aa8f0', '#bfe4ff'],
    [16, '#ffae5c', '#ffe0a8'], [18, '#e85d4a', '#5a3d8a'], [19.5, '#0b1636', '#24346a'], [30, '#0b1636', '#24346a'],
  ];
  function skyAt(hour) {
    const h = hour % 24 < 7 ? 20 : hour % 24;
    for (let i = 0; i < SKY.length - 1; i++) {
      const a = SKY[i], b = SKY[i + 1];
      if (h >= a[0] && h < b[0]) { const k = (h - a[0]) / (b[0] - a[0]); return [mix(a[1], b[1], k), mix(a[2], b[2], k), h]; }
    }
    return [SKY[5][1], SKY[5][2], h];
  }
  // office tint overlay through the day
  function tintAt(hour) {
    const h = hour % 24 < 7 ? 20 : hour % 24;
    if (h < 10) return ['255,207,122', Math.max(0, 0.05 * (1 - (h - 8) / 2))];
    if (h < 15) return null;
    if (h < 18) return ['255,138,61', 0.07 * ((h - 15) / 3)];
    if (h < 19.5) return ['40,30,110', 0.08 + 0.12 * ((h - 18) / 1.5)];
    return ['10,22,70', 0.22];
  }
  let frameSky = ['#8ecfff', '#e3f3ff', 9];
  let frameNight = 0;

  function drawDecor(c, kind, x, y, side, tm, id) {
    c.save();
    c.translate(x, y);
    switch (kind) {
      case 'desk': {
        c.fillStyle = '#26324d'; circle(c, side * -6, 30, 11); c.fill();
        c.fillStyle = '#7a4f2c'; rr(c, -26, -8, 52, 30, 4); c.fill();
        c.fillStyle = '#8a5a33'; rr(c, -26, -8, 52, 4, 2); c.fill();
        c.fillStyle = '#9aa3b5'; rr(c, -12, 0, 24, 14, 2); c.fill();
        c.fillStyle = '#5ad1ff'; c.globalAlpha = 0.75 + Math.sin(tm * 2 + x) * 0.1; rr(c, -10, 1.5, 20, 10, 1.5); c.fill(); c.globalAlpha = 1;
        if (frameNight > 0.3 && hiQ()) { c.fillStyle = `rgba(90,209,255,${0.12 * frameNight})`; circle(c, 0, 6, 22); c.fill(); }
        c.fillStyle = '#f5f5f0'; c.fillRect(14, 2, 8, 10);
        c.fillStyle = '#b45309'; circle(c, -19, 6, 3.5); c.fill();
        break;
      }
      case 'plant':
        c.fillStyle = '#9a5b2e'; rr(c, -9, 4, 18, 16, 3); c.fill();
        c.fillStyle = '#1f8a4c'; circle(c, 0, -4, 11); c.fill(); circle(c, -8, 2, 7); c.fill(); circle(c, 8, 1, 7); c.fill();
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
      case 'adscreen': {
        const ad = pickAd('office', hash((id || 0) * 3.31 + side * 7.7));
        if (!ad) { c.fillStyle = '#2b3550'; rr(c, -26, -16, 52, 32, 3); c.fill(); break; }
        c.restore();
        drawBillboard(c, x, y, 54, 32, ad, true);
        c.save(); c.translate(x, y);
        if (y > 60 && y < H - 30) adSeen(ad, 'office', 'o' + id + ':' + side);
        break;
      }
      case 'copier':
        c.fillStyle = '#c6ccd8'; rr(c, -16, -16, 32, 32, 4); c.fill();
        c.fillStyle = '#e4e8ef'; rr(c, -14, -14, 28, 10, 2); c.fill();
        c.fillStyle = '#19c37d'; circle(c, 9, 6, 2); c.fill();
        break;
      case 'window': {
        // window onto the Lagos skyline; the sky follows the office clock
        c.fillStyle = '#3a4a6b'; rr(c, -26, -30, 52, 60, 4); c.fill();
        const g = c.createLinearGradient(0, -26, 0, 26);
        g.addColorStop(0, frameSky[0]); g.addColorStop(1, frameSky[1]);
        c.fillStyle = g; c.fillRect(-22, -26, 44, 52);
        const h = frameSky[2];
        const day = h < 19;
        const sunY = day ? lerp(-18, 22, Math.min(1, Math.abs(h - 12.5) / 6.5)) : -16;
        c.fillStyle = day ? 'rgba(255,240,180,.95)' : 'rgba(240,240,255,.9)';
        circle(c, 10, sunY, day ? 5 : 3.5); c.fill();
        const seed = Math.floor(side * 3 + 11);
        for (let i = 0; i < 6; i++) {
          const bh = 10 + hash(seed + i) * 26, bw = 6 + hash(seed + i * 3) * 4;
          c.fillStyle = day ? 'rgba(20,32,58,.75)' : '#0a1024';
          c.fillRect(-22 + i * 7.4, 26 - bh, bw, bh);
          if (h >= 18.5) {
            c.fillStyle = 'rgba(255,214,120,.85)';
            for (let j = 0; j < 3; j++) if (hash(seed + i * 7 + j) > 0.45) c.fillRect(-21 + i * 7.4 + 1.5, 26 - bh + 3 + j * 6, 2, 2);
          }
        }
        c.fillStyle = '#3a4a6b'; c.fillRect(-1.5, -26, 3, 52); c.fillRect(-22, -1.5, 44, 3);
        c.fillStyle = 'rgba(255,255,255,.12)';
        c.beginPath(); c.moveTo(-20, -24); c.lineTo(-8, -24); c.lineTo(-20, -8); c.closePath(); c.fill();
        break;
      }
    }
    c.restore();
  }

  const WALL_DECOR = ['desk', 'window', 'plant', 'water', 'door', 'cabinet', 'copier', 'desk', 'meetingroom', 'window', 'adscreen', 'adscreen'];
  function drawBackground(c, tm, hour) {
    frameSky = skyAt(hour);
    const h = frameSky[2];
    frameNight = clamp((h - 17.5) / 2, 0, 1);
    c.fillStyle = COLORS.wall;
    c.fillRect(0, 0, W, H);
    if (FX0 > 20) {
      const SEGB = 110;
      const offB = G.scroll % SEGB;
      const baseB = Math.floor(G.scroll / SEGB);
      c.globalAlpha = 0.5;
      for (let k = -1; k <= Math.ceil(H / SEGB) + 1; k++) {
        const y = k * SEGB + offB;
        const id = k - baseB;
        for (let x = FX0 - 70; x > -40; x -= 90) drawDecor(c, hash(id * 3.1 + x) > 0.85 ? 'plant' : 'desk', x, y, 0, tm);
        for (let x = FX1 + 70; x < W + 40; x += 90) drawDecor(c, hash(id * 5.7 + x) > 0.85 ? 'plant' : 'desk', x, y, 0, tm);
      }
      c.globalAlpha = 1;
      c.fillStyle = '#25345a';
      c.fillRect(FX0 - 6, 0, 6, H); c.fillRect(FX1, 0, 6, H);
    }
    // carpet floor (scrolling texture)
    const TILE = 64;
    const off = G.scroll % TILE;
    const cx = (FX0 + FX1) / 2;
    if (carpetPat) {
      c.save();
      c.beginPath(); c.rect(FX0, 0, FX1 - FX0, H); c.clip();
      const ox = cx % TILE;
      c.translate(ox, off);
      c.fillStyle = carpetPat;
      c.fillRect(FX0 - ox - TILE, -TILE, FX1 - FX0 + TILE * 2, H + TILE * 2);
      c.restore();
    } else {
      c.fillStyle = COLORS.floor; c.fillRect(FX0, 0, FX1 - FX0, H);
    }
    // centre walkway runner
    c.fillStyle = 'rgba(0,135,81,.12)';
    c.fillRect(cx - 40, 0, 80, H);
    c.fillStyle = 'rgba(245,179,1,.10)';
    c.fillRect(cx - 42, 0, 2, H); c.fillRect(cx + 40, 0, 2, H);
    c.fillStyle = 'rgba(255,255,255,.035)';
    for (let y = (G.scroll % 48) - 48; y < H; y += 48) c.fillRect(cx - 2, y, 4, 22);
    // ceiling light pools
    if (hiQ() && lightSprite) {
      const LS = 230;
      const lo = G.scroll % LS;
      c.globalAlpha = 0.06 + frameNight * 0.1;
      for (let y = lo - LS; y < H + LS; y += LS) c.drawImage(lightSprite, cx - 130, y - 130, 260, 260);
      c.globalAlpha = 1;
    }
    // wall decor along both corridor edges
    const SEG = 150;
    const segOff = G.scroll % SEG;
    const base = Math.floor(G.scroll / SEG);
    for (let k = -1; k <= Math.ceil(H / SEG) + 1; k++) {
      const y = k * SEG + segOff;
      const id = k - base;
      const kl = WALL_DECOR[Math.floor(hash(id * 1.37) * WALL_DECOR.length)];
      const kr = WALL_DECOR[Math.floor(hash(id * 2.91 + 9) * WALL_DECOR.length)];
      drawDecor(c, kl, FX0 + (kl === 'meetingroom' ? 32 : 28), y, -1, tm, id);
      drawDecor(c, kr, FX1 - (kr === 'meetingroom' ? 32 : 28), y + 70, 1, tm, id);
    }
    const g = c.createLinearGradient(0, 0, 0, 160);
    g.addColorStop(0, 'rgba(8,13,26,.85)');
    g.addColorStop(1, 'rgba(8,13,26,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, W, 160);
  }

  function drawWarning(c, o, tm) {
    const pulse = (Math.sin(tm * 18) + 1) / 2;
    let x, y, ang;
    if (o.side === 'L') { x = FX0 + 16; y = o.y; ang = Math.PI; }
    else if (o.side === 'R') { x = FX1 - 16; y = o.y; ang = 0; }
    else { x = o.x; y = HUD_SPACE + 34; ang = -Math.PI / 2; }
    c.save();
    c.translate(x, y);
    c.globalAlpha = 0.55 + pulse * 0.45;
    c.fillStyle = o.boss ? COLORS.red : COLORS.gold;
    circle(c, 0, 0, 15); c.fill();
    c.fillStyle = '#fff';
    c.font = '900 18px system-ui, Arial, sans-serif';
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('!', 0, 1);
    c.rotate(ang);
    c.fillStyle = o.boss ? COLORS.red : COLORS.gold;
    c.beginPath(); c.moveTo(19, 0); c.lineTo(27, -7); c.lineTo(27, 7); c.closePath(); c.fill();
    c.restore();
  }

  function speech(c, text, x, y, color = '#fff', ink = COLORS.ink) {
    c.font = '800 10px system-ui, Arial, sans-serif';
    const w = c.measureText(text).width + 14;
    const bx = clamp(x - w / 2, FX0 + 4, FX1 - w - 4);
    const tipX = clamp(x, bx + 8, bx + w - 8);
    c.fillStyle = color;
    rr(c, bx, y - 22, w, 18, 8); c.fill();
    c.beginPath(); c.moveTo(tipX - 4, y - 5); c.lineTo(tipX + 4, y - 5); c.lineTo(tipX, y + 1); c.closePath(); c.fill();
    c.fillStyle = ink;
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(text, bx + w / 2, y - 13);
  }

  function drawGlow(c, x, y, r, color, tm) {
    if (!hiQ()) return;
    const g = c.createRadialGradient(x, y, 2, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    c.globalAlpha = 0.35 + Math.sin(tm * 5) * 0.1;
    c.fillStyle = g;
    circle(c, x, y, r); c.fill();
    c.globalAlpha = 1;
  }

  function drawDarkness(c, amount) {
    const dw = Math.max(1, Math.ceil(W / 2)), dh = Math.max(1, Math.ceil(H / 2));
    if (darkC.width !== dw || darkC.height !== dh) { darkC.width = dw; darkC.height = dh; }
    const d = darkX;
    d.setTransform(1, 0, 0, 1, 0, 0);
    d.globalCompositeOperation = 'source-over';
    d.clearRect(0, 0, dw, dh);
    d.fillStyle = `rgba(2,5,12,${0.92 * amount})`;
    d.fillRect(0, 0, dw, dh);
    d.globalCompositeOperation = 'destination-out';
    const hole = (x, y, r, a) => {
      const g = d.createRadialGradient(x / 2, y / 2, 0, x / 2, y / 2, r / 2);
      g.addColorStop(0, `rgba(0,0,0,${a})`);
      g.addColorStop(0.5, `rgba(0,0,0,${a})`);
      g.addColorStop(0.8, `rgba(0,0,0,${a * 0.6})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      d.fillStyle = g;
      d.beginPath(); d.arc(x / 2, y / 2, r / 2, 0, TAU); d.fill();
    };
    const p = G.player;
    // radius in world units; a torch-like pool around the worker, bigger with generator fuel
    const r = (p.fuel > 0 ? 190 : 125) + Math.sin(G.t * 9) * 3;
    hole(p.x, p.y - 6, r, 1);
    for (const it of G.items) hole(it.x, it.y, 46, 0.8);
    if (G.task) hole(G.task.x, G.task.y, 70, 0.9);
    for (const o of G.obstacles) if (o.type === 'network') hole(o.x, o.y, 40, 0.55);
    d.globalCompositeOperation = 'source-over';
    c.drawImage(darkC, 0, 0, W, H);
  }

  function render() {
    const c = ctx;
    const tm = G.t;
    const playingish = G.player && (G.state === 'playing' || G.state === 'paused' || G.state === 'dying' || G.state === 'over' || (G.state === 'board' && boardReturn === 'over'));
    const hour = playingish ? (G.phase === 'commute' ? 7.8 : officeClock(G.time || 0).hour) : 8 + ((tm / 6) % 12);
    c.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
    c.save();
    if (G.shake > 0.3) c.translate(frand(-G.shake, G.shake), frand(-G.shake, G.shake));
    if (playingish && G.phase === 'commute') drawRoad(c, tm); else drawBackground(c, tm, hour);

    if (playingish) {
      const p = G.player;
      if (G.task) drawTaskDesk(c, G.task, tm);
      for (const it of G.items) {
        drawGlow(c, it.x, it.y, 30, ITEMS[it.type].color, tm + it.wob);
        c.save(); c.translate(it.x, it.y + Math.sin(it.t * 4) * 2); SPRITES[it.type](c, it.t); c.restore();
      }
      let bossNear = false;
      for (const o of G.obstacles) {
        if (o.warn > 0 && (o.type !== 'boss' || o.phase === 'warn')) continue;
        if (o.type === 'driver' || o.type === 'hr' || o.type === 'aunty' || o.type === 'agbero') {
          drawNewBoss(c, o, p, tm);
          if (o.boss && o.phase !== 'warn') bossNear = true;
          continue;
        }
        c.save();
        c.translate(o.x, o.y);
        if (o.type === 'boss') {
          bossNear = true;
          SPRITES.boss(c, o.t, { lookX: (p.x - o.x) / 120, lookY: (p.y - o.y) / 120 });
          c.restore();
          c.save();
          drawTag(c, o.x, o.y - 57, ogaLabel(), COLORS.gold);
          if (o.phase === 'chase') speech(c, o.talk, o.x, o.y - 68);
          c.restore();
          continue;
        }
        if (o.type === 'colleague') {
          SPRITES.colleague(c, o.t);
          c.restore();
          if (o.life > 0) speech(c, G.calm > 0 ? t('thanks') : o.talk, o.x, o.y - 34);
          continue;
        }
        c.rotate(o.rot || 0);
        SPRITES[o.type](c, o.t);
        c.restore();
      }
      // player
      const blink = p.invuln > 0 && Math.floor(p.invuln * 10) % 2 === 0;
      if (p.leave > 0) {
        c.strokeStyle = `rgba(62,224,143,${0.5 + Math.sin(tm * 10) * 0.25})`;
        c.lineWidth = 3;
        circle(c, p.x, p.y - 2, 30 + Math.sin(tm * 6) * 2); c.stroke();
      }
      if (G.state !== 'dying' || Math.floor(G.dyingT * 12) % 2 === 0) {
        c.save();
        c.globalAlpha = blink ? 0.35 : 1;
        c.translate(p.x, p.y);
        c.rotate(clamp(p.vx / 1600, -0.12, 0.12));
        const mood = G.state === 'dying' ? 'worried' : p.leave > 0 ? 'cool' : bossNear || G.black ? 'worried' : 'happy';
        SPRITES.player(c, tm, { walk: p.walk, mood, lookX: p.vx / CONFIG.PLAYER_SPEED, lookY: p.vy / CONFIG.PLAYER_SPEED - 0.4 });
        c.restore();
        if (p.leave > 0) speech(c, t('onLeave'), p.x, p.y - 36, '#3ee08f');
      }
    } else {
      // attract mode: the worker strolling up the corridor
      const x = (FX0 + FX1) / 2 + Math.sin(tm * 0.7) * Math.min(120, (FX1 - FX0) * 0.3);
      c.save(); c.translate(x, H * 0.82); SPRITES.player(c, tm, { walk: tm * 10, mood: 'happy', lookY: -0.5 }); c.restore();
    }
    // particles (also used for menu-time confetti)
    if (G.particles) {
      for (const q of G.particles) {
        c.globalAlpha = clamp((q.life / q.max) * (q.conf ? 2 : 1), 0, 1);
        c.fillStyle = q.color;
        if (q.text) {
          c.font = '900 13px system-ui, Arial, sans-serif';
          c.textAlign = 'center'; c.textBaseline = 'middle';
          c.fillText(q.text, q.x, q.y);
        } else if (q.conf) {
          c.save(); c.translate(q.x, q.y); c.rotate(q.rot);
          c.fillRect(-q.size / 2, -q.size / 4, q.size, q.size / 2);
          c.restore();
        } else {
          c.fillRect(q.x - q.size / 2, q.y - q.size / 2, q.size, q.size);
        }
      }
      c.globalAlpha = 1;
    }
    c.restore();

    // time-of-day lighting
    const tint = tintAt(hour);
    if (tint && tint[1] > 0.001) { c.fillStyle = `rgba(${tint[0]},${tint[1]})`; c.fillRect(0, 0, W, H); }
    if (playingish && G.black) drawDarkness(c, blackoutAmount());
    if (playingish) {
      if (G.task) drawTaskLabel(c, G.task);
      for (const o of G.obstacles) if (o.warn > 0 && (o.type !== 'boss' || o.phase === 'warn')) drawWarning(c, o, tm);
      for (const f of G.floaters) {
        c.globalAlpha = clamp((f.life / f.max) * 1.6, 0, 1);
        c.font = `900 ${f.size}px system-ui, Arial, sans-serif`;
        c.textAlign = 'center'; c.textBaseline = 'middle';
        c.lineWidth = 4; c.strokeStyle = 'rgba(8,13,26,.85)'; c.lineJoin = 'round';
        c.strokeText(f.text, f.x, f.y);
        c.fillStyle = f.color;
        c.fillText(f.text, f.x, f.y);
      }
      c.globalAlpha = 1;
    }
    if (hiQ() && vignette) c.drawImage(vignette, 0, 0, W, H);
    if (G.fade > 0) { c.fillStyle = `rgba(255,255,255,${Math.min(0.85, G.fade)})`; c.fillRect(0, 0, W, H); }
    if (G.flash > 0) {
      c.fillStyle = `rgba(229,72,77,${G.flash * 0.9})`;
      c.fillRect(0, 0, W, H);
    }
  }

  /* ==================== Main loop + auto graphics ==================== */
  let rawDt = 0.016;
  // Auto graphics: drop to Low only after two back-to-back slow windows (~5s of
  // sustained frames under ~38fps). One-off stutters (tab switches, GC) are ignored.
  const perf = {
    acc: 0, n: 0, played: 0, bad: 0,
    reset() { this.acc = 0; this.n = 0; this.played = 0; this.bad = 0; },
    sample(dt) {
      if (S.gfx !== 'auto' || quality === 'low') return;
      this.played += dt;
      if (this.played < 3) return;           // ignore warm-up
      if (rawDt > 0.1) return;               // ignore one-off stalls
      this.acc += rawDt; this.n++;
      if (this.n >= 150) {
        const avg = this.acc / this.n;
        this.acc = 0; this.n = 0;
        this.bad = avg > 0.026 ? this.bad + 1 : 0;
        if (this.bad >= 2) { setQuality('low'); toast(t('autoLow'), 'info', 2400); }
      }
    },
  };
  function setQuality(q) { quality = q; resize(); }

  let lastFrame = performance.now();
  function frame(now) {
    let dt = (now - lastFrame) / 1000;
    lastFrame = now;
    if (!(dt > 0)) dt = 0;
    rawDt = dt;
    dt = Math.min(dt, 0.05);
    const steps = dt > 1 / 50 ? 2 : 1;
    for (let i = 0; i < steps; i++) step(dt / steps);
    render();
    requestAnimationFrame(frame);
  }

  /* ==================== Sharing, challenges, share image ==================== */
  function shareBase() {
    if (CONFIG.SHARE_URL) return CONFIG.SHARE_URL;
    const { protocol, hostname } = location;
    const local = !hostname || hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]' || hostname.endsWith('.local') || /^192\.168\.|^10\./.test(hostname);
    if ((protocol === 'https:' || protocol === 'http:') && !local) return location.origin + location.pathname;
    return '';
  }
  function challengeUrl() {
    const base = shareBase();
    if (!base) return '';
    try {
      const u = new URL(base);
      u.search = '';
      u.searchParams.set('beat', String(Math.floor(G.scoreF)));
      if (S.name) u.searchParams.set('by', S.name);
      if (G.mode === 'daily') { u.searchParams.set('mode', 'daily'); u.searchParams.set('d', G.dailyKey); }
      return u.toString();
    } catch (e) { return base; }
  }
  function shareText() {
    let s = t('shareText')(fmtTime(G.time), fmtNum(G.scoreF), G.mode === 'daily');
    const tg = activeTarget();
    if (tg && G.challengeBeaten) s += t('shareBeat')(tg.by, fmtNum(tg.score));
    return s;
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
    saveNameFrom(ui.playerName);
    const url = challengeUrl();
    const text = shareText();
    const full = url ? text + ' ' + url : text;
    if (navigator.share) {
      try {
        const file = G.shareBlob ? new File([G.shareBlob], 'office-wahala-score.png', { type: 'image/png' }) : null;
        if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], text: full, title: CONFIG.TITLE });
          T('share', { kind: 'challenge', via: 'native-image', score: Math.floor(G.scoreF) });
          return;
        }
        const data = url ? { title: CONFIG.TITLE, text, url } : { title: CONFIG.TITLE, text };
        if (!navigator.canShare || navigator.canShare(data)) { await navigator.share(data); T('share', { kind: 'challenge', via: 'native', score: Math.floor(G.scoreF) }); return; }
      } catch (e) { if (e && e.name === 'AbortError') return; }
    }
    const ok = await copyText(full);
    if (ok) T('share', { kind: 'challenge', via: 'copy', score: Math.floor(G.scoreF) });
    toast(ok ? t('copied') : t('copyFail') + fmtNum(G.scoreF), ok ? 'good' : 'info', 2600);
  }

  function wrapText(c, text, maxW) {
    const words = text.split(' ');
    const lines = [];
    let line = '';
    for (const w of words) {
      const test = line ? line + ' ' + w : w;
      if (c.measureText(test).width > maxW && line) { lines.push(line); line = w; } else line = test;
    }
    if (line) lines.push(line);
    return lines;
  }

  function makeShareImage() {
    return new Promise((resolve, reject) => {
      try {
        const Wc = 1080, Hc = 1920;
        const cv = document.createElement('canvas');
        cv.width = Wc; cv.height = Hc;
        const c = cv.getContext('2d');
        const DISPLAY = 'Impact, "Arial Black", "Arial Narrow Bold", system-ui, sans-serif';
        // background: office carpet
        c.fillStyle = '#0d1526'; c.fillRect(0, 0, Wc, Hc);
        c.strokeStyle = '#17233e'; c.lineWidth = 4;
        for (let x = 0; x < Wc; x += 120) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, Hc); c.stroke(); }
        for (let y = 0; y < Hc; y += 120) { c.beginPath(); c.moveTo(0, y); c.lineTo(Wc, y); c.stroke(); }
        const glow = c.createRadialGradient(Wc / 2, 600, 40, Wc / 2, 600, 520);
        glow.addColorStop(0, 'rgba(0,135,81,.35)'); glow.addColorStop(1, 'rgba(0,135,81,0)');
        c.fillStyle = glow; c.fillRect(0, 0, Wc, 1200);
        // flag stripe
        c.fillStyle = '#008751'; c.fillRect(0, 0, Wc / 3, 22); c.fillRect((Wc * 2) / 3, 0, Wc / 3, 22);
        c.fillStyle = '#ffffff'; c.fillRect(Wc / 3, 0, Wc / 3, 22);
        // title
        c.textAlign = 'center'; c.textBaseline = 'alphabetic';
        c.font = `900 110px ${DISPLAY}`; c.fillStyle = '#ffffff';
        c.fillText('OFFICE', Wc / 2, 200);
        c.save(); c.translate(Wc / 2, 380); c.rotate(-0.04);
        c.font = `900 210px ${DISPLAY}`;
        c.fillStyle = '#17203a'; c.fillText('WAHALA', 14, 14);
        c.fillStyle = '#f5b301'; c.fillText('WAHALA', 7, 7);
        c.fillStyle = '#008751'; c.fillText('WAHALA', 0, 0);
        c.restore();
        // worker
        c.save(); c.translate(Wc / 2, 566);
        SPRITES.player(c, 0.4, { walk: 0.6, mood: G.newBadges && G.newBadges.length ? 'cool' : 'happy', s: 4.6, lookY: 0.2 });
        c.restore();
        // appraisal card
        const x0 = 90, y0 = 708, cw = 900;
        c.font = '800 40px system-ui, Arial, sans-serif';
        const nLines = Math.min(3, wrapText(c, G.verdict || '', cw - 112).length);
        const chh = 804 + nLines * 52;
        c.fillStyle = 'rgba(0,0,0,.35)'; rr(c, x0 + 10, y0 + 18, cw, chh, 44); c.fill();
        c.fillStyle = '#fbfaf6'; rr(c, x0, y0, cw, chh, 44); c.fill();
        c.textAlign = 'left';
        c.fillStyle = '#55607a'; c.font = '700 30px system-ui, Arial, sans-serif';
        c.fillText('Wahala & Sons Ltd.', x0 + 56, y0 + 80);
        c.fillStyle = '#17203a'; c.font = `900 60px ${DISPLAY}`;
        c.fillText('PERFORMANCE APPRAISAL', x0 + 56, y0 + 152, cw - 112);
        c.fillRect(x0 + 56, y0 + 178, cw - 112, 6);
        // stamp
        c.save(); c.translate(x0 + cw - 150, y0 + 6); c.rotate(0.1);
        const best = G.stampText === t('newBestStamp');
        c.strokeStyle = best ? '#008751' : '#e5484d'; c.fillStyle = c.strokeStyle; c.lineWidth = 6;
        c.fillStyle = '#fbfaf6'; rr(c, -130, -38, 260, 76, 14); c.fill();
        c.fillStyle = c.strokeStyle; c.stroke();
        c.font = `900 36px ${DISPLAY}`; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText(String(G.stampText || '').toUpperCase(), 0, 2, 236);
        c.restore();
        // verdict
        c.textAlign = 'left'; c.textBaseline = 'alphabetic';
        c.fillStyle = '#17203a'; c.font = '800 40px system-ui, Arial, sans-serif';
        const lines = wrapText(c, G.verdict || '', cw - 112).slice(0, 3);
        lines.forEach((ln, i) => c.fillText(ln, x0 + 56, y0 + 252 + i * 52));
        // score block
        const sy = y0 + 270 + lines.length * 52;
        c.fillStyle = '#17203a'; rr(c, x0 + 56, sy, cw - 112, 220, 26); c.fill();
        c.fillStyle = '#aab3c8'; c.font = '700 32px system-ui, Arial, sans-serif';
        c.fillText(G.mode === 'daily' ? 'Score · daily shift' : G.mode === 'career' ? 'Score · career, ' + STR.en.days[S.career.day] : 'Score', x0 + 96, sy + 58);
        c.fillStyle = '#f5b301'; c.font = `900 150px ${DISPLAY}`;
        c.fillText(fmtNum(G.scoreF), x0 + 92, sy + 192, cw - 190);
        // stats
        const ck = officeClock(G.time);
        const cells = [
          ['Time survived', fmtTime(G.time)], ['Clocked out', ck.text + ck.ap],
          ['Level reached', String(G.level)], ['Longest streak', String(G.maxStreak)],
        ];
        cells.forEach((cell, i) => {
          const cx = x0 + 56 + (i % 2) * ((cw - 112) / 2 + 8);
          const cy = sy + 246 + Math.floor(i / 2) * 124;
          c.fillStyle = '#f0f1f4'; rr(c, cx, cy, (cw - 112) / 2 - 8, 110, 20); c.fill();
          c.fillStyle = '#55607a'; c.font = '600 28px system-ui, Arial, sans-serif'; c.fillText(cell[0], cx + 26, cy + 42);
          c.fillStyle = '#17203a'; c.font = '800 44px system-ui, Arial, sans-serif'; c.fillText(cell[1], cx + 26, cy + 92);
        });
        // footer
        c.textAlign = 'center';
        c.fillStyle = '#ffffff'; c.font = `900 76px ${DISPLAY}`;
        c.fillText('CAN YOU BEAT ME?', Wc / 2, 1750);
        const base = shareBase();
        const host = base ? base.replace(/^https?:\/\//, '').replace(/\/$/, '') : '';
        c.fillStyle = '#f5b301'; c.font = '800 44px system-ui, Arial, sans-serif';
        if (host) c.fillText('Play free: ' + host, Wc / 2, 1820);
        c.fillStyle = '#8f9bb8'; c.font = '600 28px system-ui, Arial, sans-serif';
        c.fillText(CONFIG.CREDIT, Wc / 2, 1880);
        cv.toBlob((b) => (b ? resolve(b) : reject(new Error('no blob'))), 'image/png');
      } catch (e) { reject(e); }
    });
  }

  async function saveImage() {
    try {
      const blob = G.shareBlob || (await makeShareImage());
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'office-wahala-' + Math.floor(G.scoreF) + '.png';
      T('share', { kind: 'image' });
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
      toast(t('imgSaved'), 'good', 2400);
    } catch (e) { toast(t('imgFail'), 'info', 2400); }
  }

  function readChallenge() {
    try {
      const q = new URLSearchParams(location.search);
      const beat = parseInt(q.get('beat') || '', 10);
      if (!(beat > 0) || beat > 5000000) return null;
      const by = cleanName(q.get('by')) || t('colleagueAnon');
      const daily = q.get('mode') === 'daily';
      const d = (q.get('d') || '').replace(/[^0-9-]/g, '').slice(0, 10);
      return { score: beat, by, daily, d };
    } catch (e) { return null; }
  }
  function clearChallenge() {
    G.challenge = null;
    try { history.replaceState(null, '', location.pathname + (DEBUG ? '?debug' : '')); } catch (e) { /* ignore */ }
    refreshMenu();
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
    saveNameFrom(ui.playerName);
    if (!S.name) { ui.lbStatus.textContent = 'Type your name above first.'; ui.lbStatus.className = 'lb-status err'; ui.playerName.focus(); return; }
    ui.lbSubmit.disabled = true;
    ui.lbStatus.textContent = 'Submitting…'; ui.lbStatus.className = 'lb-status';
    try {
      await LB.rpc('submit_score', { p_name: S.name, p_score: Math.floor(G.scoreF), p_duration: Math.max(1, Math.floor(G.time)), p_level: G.level });
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

  /* ==================== Boss key (fake spreadsheet) ==================== */
  let excelReturn = null;
  let realTitle = document.title;
  let sheetBuilt = false;
  function buildSheet() {
    if (sheetBuilt) return;
    sheetBuilt = true;
    const cols = ['', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const regions = ['Lagos', 'Abuja', 'Port Harcourt', 'Kano', 'Ibadan', 'Enugu', 'Kaduna', 'Benin City', 'Owerri', 'Jos', 'Warri'];
    const status = ['On track', 'Pending approval', 'Revert ASAP', 'On track', 'Kindly do the needful', 'Done', 'Awaiting soft copy'];
    const r = mulberry32(42);
    let html = '<thead><tr>' + cols.map((c) => '<th>' + c + '</th>').join('') + '</tr></thead><tbody>';
    const row = (n, cells, cls) => '<tr><th>' + n + '</th>' + cells.map((c, i) => '<td class="' + ((cls && cls[i]) || '') + '">' + c + '</td>').join('') + '</tr>';
    html += row(1, ['Growth target', '12%', '', '', '', '', '', ''], ['hdr', 'num']);
    html += row(2, ['Region', 'Q1 (₦m)', 'Q2 (₦m)', 'Q3 (₦m)', 'Variance', 'Q3 total', 'Owner', 'Status'], ['hdr', 'hdr', 'hdr', 'hdr', 'hdr', 'hdr', 'hdr', 'hdr']);
    let tot = 0;
    regions.forEach((reg, i) => {
      const q1 = 40 + r() * 160, q2 = q1 * (0.9 + r() * 0.25), q3 = q2 * (0.88 + r() * 0.3);
      const v = ((q3 - q2) / q2) * 100;
      tot += q3;
      html += row(i + 3, [reg, q1.toFixed(1), q2.toFixed(1), q3.toFixed(1), (v >= 0 ? '+' : '') + v.toFixed(1) + '%', (q3 * 1.12).toFixed(1), ['A. Okafor', 'B. Bello', 'C. Adeyemi', 'D. Musa', 'E. Eze'][i % 5], status[i % status.length]],
        ['', 'num', 'num', 'num', 'num' + (v < 0 ? ' neg' : ''), 'num', '', '']);
    });
    html += row(14, ['Total', '', '', '', '', (tot * 1.12).toFixed(1), '', ''], ['hdr', '', '', '', '', 'num sel', '', '']);
    for (let i = 15; i <= 45; i++) html += row(i, ['', '', '', '', '', '', '', '']);
    html += '</tbody>';
    $('sheet-grid').innerHTML = html;
  }
  function openBossKey() {
    if (!ui.excel.hidden || G.state === 'dying') return;
    if (G.state === 'playing') pauseGame();
    excelReturn = G.state;
    T('boss_key', { from: G.state });
    buildSheet();
    realTitle = document.title;
    document.title = 'Q3_Revenue_Report_FINAL_v7.xlsx';
    ui.excel.hidden = false;
    if (Music) Music.stop(0.05);
    if (Voice) Voice.stop();
    stats.bossKeys++;
    checkBadges(false);
    saveProgress();
    setTimeout(() => { try { $('btn-excel-close').focus({ preventScroll: true }); } catch (e) { /* ignore */ } }, 30);
  }
  function closeBossKey() {
    if (ui.excel.hidden) return;
    ui.excel.hidden = true;
    document.title = realTitle;
    if (G.state === 'menu') refreshMenu();
    if (Music && Sound.musicOn && G.state !== 'paused') { Music.start(G.state === 'playing' ? 'game' : 'menu'); }
    excelReturn = null;
  }

  /* ==================== Menu, wardrobe, settings ==================== */
  function rankFor(score) { let r = RANKS[0][1]; for (const [min, name] of RANKS) if (score >= min) r = name; return r; }

  function drawPortrait(cv, charId, outfitId, zoomed) {
    const r = Math.min(window.devicePixelRatio || 1, 3);
    const w = cv.clientWidth || parseInt(cv.getAttribute('width'), 10) || 64;
    const h = cv.clientHeight || parseInt(cv.getAttribute('height'), 10) || 76;
    cv.width = Math.round(w * r); cv.height = Math.round(h * r);
    const c = cv.getContext('2d');
    c.setTransform(r, 0, 0, r, 0, 0);
    c.clearRect(0, 0, w, h);
    c.save();
    if (zoomed) {
      const s = h / 46;
      c.translate(w / 2, h * 0.5 + 22 * s);
      SPRITES.player(c, 0, { char: charId, outfit: outfitId, walk: 0, mood: 'happy', s, lookY: 0.2 });
    } else {
      const s = h / 76;
      c.translate(w / 2, h * 0.6);
      SPRITES.player(c, 0, { char: charId, outfit: outfitId, walk: 0, mood: 'happy', s, lookY: 0.2 });
    }
    c.restore();
  }

  function refreshMenu() {
    ui.menuBest.textContent = fmtNum(G.best);
    ui.menuName.textContent = S.name || t('newStaff');
    const ri = Math.max(RANKS.findIndex((r) => r[1] === rankFor(G.best)), stats.weeks > 0 ? Math.min(RANKS.length - 1, stats.weeks + 1) : 0);
    ui.menuRank.textContent = RANKS[ri][1];
    ui.menuBadges.textContent = unlocked.size + '/' + BADGES.length;
    $('menu-wallet').textContent = '₦' + fmtNum(S.wallet);
    $('career-sub').textContent = t('careerSub')(S.career.week, t('days')[S.career.day]) + ': ' + t('goalText')(careerDay().type, goalTarget());
    const inv = LG.invite;
    $('invite-card').hidden = !inv;
    if (inv) $('invite-text').innerHTML = t('leagueInvite')(esc(inv.name));
    ui.fridayNote.hidden = !isFridayNow();
    const db = dailyBest();
    ui.dailySub.textContent = db > 0 ? t('dailyBest')(fmtNum(db)) : t('dailyNone');
    if (ui.screens.menu.classList.contains('is-active')) drawPortrait(ui.idPhoto, S.char, S.outfit, true);
    const c = G.challenge;
    ui.challengeCard.hidden = !c;
    if (c) ui.challengeText.innerHTML = t('challengeCard')(c.by, fmtNum(c.score), c.daily);
  }

  function renderWardrobe() {
    document.querySelectorAll('.char-opt').forEach((b) => {
      b.setAttribute('aria-checked', String(b.dataset.char === S.char));
      drawPortrait(b.querySelector('canvas'), b.dataset.char, S.outfit, false);
    });
    const grid = $('outfit-grid');
    grid.innerHTML = '';
    for (const o of OUTFITS) {
      const open = outfitUnlocked(o);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'outfit-opt' + (open ? '' : ' is-locked');
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', String(o.id === S.outfit));
      btn.dataset.outfit = o.id;
      const cv = document.createElement('canvas');
      cv.width = 72; cv.height = 84;
      const label = document.createElement('span'); label.textContent = S.char === 'emeka' && o.nameM ? o.nameM : o.name;
      const hint = document.createElement('small');
      if (!open) {
        const b = BADGES.find((x) => x.id === o.unlock);
        hint.innerHTML = ico('lock'); hint.append(' ' + (b ? b.desc : t('locked')));
        btn.setAttribute('aria-disabled', 'true');
      }
      btn.append(cv, label, hint);
      const cell = document.createElement('div');
      cell.className = 'outfit-cell';
      cell.appendChild(btn);
      if (!open && OUTFIT_PRICES[o.id]) {
        const buy = document.createElement('button');
        buy.type = 'button'; buy.className = 'btn-buy'; buy.dataset.buy = o.id;
        buy.textContent = 'Buy ₦' + fmtNum(OUTFIT_PRICES[o.id]);
        buy.disabled = S.wallet < OUTFIT_PRICES[o.id];
        cell.appendChild(buy);
      }
      grid.appendChild(cell);
      drawPortrait(cv, S.char, o.id, false);
    }
    const list = $('badge-list');
    list.innerHTML = '';
    for (const b of BADGES) {
      const got = unlocked.has(b.id);
      const li = document.createElement('li');
      if (got) li.className = 'is-got';
      const prog = Math.min(b.goal, stats[b.stat] || 0);
      li.innerHTML = '<span class="b-ico" aria-hidden="true"></span><span><span class="b-name"></span><br><span class="b-desc"></span></span><span class="b-prog"></span>';
      li.querySelector('.b-ico').innerHTML = ico(b.ico);
      li.querySelector('.b-name').textContent = b.name;
      li.querySelector('.b-desc').textContent = b.desc;
      if (got) li.querySelector('.b-prog').innerHTML = ico('check-circle'); else li.querySelector('.b-prog').textContent = b.goal > 1 ? fmtNum(prog) + ' / ' + fmtNum(b.goal) : '';
      list.appendChild(li);
    }
    $('badge-count').textContent = unlocked.size + ' / ' + BADGES.length;
  }

  function syncSettingsUi() {
    $('set-name').value = S.name;
    const val = { sound: Sound.sfxOn ? 'on' : 'off', music: Sound.musicOn ? 'on' : 'off', lang: S.lang, gfx: S.gfx, voices: S.voices ? 'on' : 'off', commute: S.commute ? 'on' : 'off',
      stats: window.OWTrack && window.OWTrack.isOn() ? 'on' : 'off' };
    $('set-oga').value = S.ogaName;
    if (Voice) { Voice.init(); $('voice-info').textContent = 'Voice: ' + Voice.describe(); }
    document.querySelectorAll('.seg').forEach((seg) => {
      seg.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === val[seg.dataset.setting])));
    });
  }

  function saveNameFrom(input) {
    const n = cleanName(input.value);
    input.value = n;
    if (n !== S.name) { S.name = n; store.set('ow_name', n); }
  }

  function applyLang() {
    document.documentElement.lang = S.lang === 'pcm' ? 'pcm' : 'en';
    if (Voice) Voice.lang = S.lang;
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      if (el.dataset.en === undefined) el.dataset.en = el.innerHTML;
      const k = el.dataset.i18n;
      el.innerHTML = S.lang === 'pcm' && UI_PCM[k] ? UI_PCM[k] : el.dataset.en;
    });
    refreshMenu();
  }

  function syncMuteUi() {
    const on = Sound.anyOn();
    ui.muteHud.setAttribute('aria-pressed', String(on));
    ui.muteHud.setAttribute('aria-label', on ? 'Turn sound off' : 'Turn sound on');
  }
  function toggleAllSound() {
    const turnOn = !Sound.anyOn();
    S.voices = turnOn; store.set('ow_voices', turnOn ? '1' : '0');
    if (!turnOn && Voice) Voice.stop();
    Sound.setSfx(turnOn);
    Sound.setMusic(turnOn);
    syncMuteUi();
    syncSettingsUi();
    Sound.play('click');
  }

  /* ==================== Review box (Netlify Forms + WhatsApp fallback) ==================== */
  const reviewForm = $('review-form');
  const reviewStatus = $('review-status');
  function updateWaLink() {
    const msg = $('review-message').value.trim();
    const rating = (reviewForm.querySelector('input[name="rating"]:checked') || {}).value;
    const name = $('review-name').value.trim();
    const text = 'Office Wahala review' + (rating ? ' (' + '★'.repeat(+rating) + ')' : '') + (name ? ' from ' + name : '') + ':\n' + (msg || '');
    $('review-wa').href = 'https://wa.me/2347066459689?text=' + encodeURIComponent(text);
  }
  function prepareReview() {
    $('review-best').value = String(G.best);
    if (!$('review-name').value && S.name) $('review-name').value = S.name;
    reviewStatus.textContent = '';
    reviewStatus.className = 'lb-status';
    updateWaLink();
  }
  reviewForm.addEventListener('input', updateWaLink);
  reviewForm.addEventListener('change', updateWaLink);
  reviewForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = $('review-message').value.trim();
    if (!msg) { reviewStatus.textContent = t('reviewNeed'); reviewStatus.className = 'lb-status err'; $('review-message').focus(); return; }
    if (reviewForm.querySelector('input[name="bot-field"]').value) return;
    const btn = $('review-submit');
    btn.disabled = true;
    reviewStatus.textContent = t('reviewSending'); reviewStatus.className = 'lb-status';
    try {
      const body = new URLSearchParams(new FormData(reviewForm)).toString();
      const res = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
      if (!res.ok) throw new Error('status ' + res.status);
      reviewStatus.textContent = t('reviewThanks'); reviewStatus.className = 'lb-status ok';
      T('review_submit', { rating: +((reviewForm.querySelector('input[name="rating"]:checked') || {}).value || 0) });
      reviewForm.reset();
      prepareReview();
      reviewStatus.textContent = t('reviewThanks'); reviewStatus.className = 'lb-status ok';
    } catch (err) {
      reviewStatus.textContent = t('reviewFail'); reviewStatus.className = 'lb-status err';
    } finally { btn.disabled = false; }
  });

  /* ==================== Install + offline (PWA) ==================== */
  let installEvt = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    installEvt = e;
    $('btn-install').hidden = false;
    T('install_prompt');
  });
  window.addEventListener('appinstalled', () => { $('btn-install').hidden = true; installEvt = null; T('install_done'); });
  $('btn-install').addEventListener('click', async () => {
    if (!installEvt) return;
    T('install_click');
    installEvt.prompt();
    try { await installEvt.userChoice; } catch (e) { /* ignore */ }
    installEvt = null;
    $('btn-install').hidden = true;
  });
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const standalone = window.navigator.standalone || (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
  $('ios-install').hidden = !(isIOS && !standalone);
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
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
      const fit = { boss: 0.42, colleague: 0.5, meeting: 0.34, printer: 0.48, driver: 0.46, hr: 0.44, aunty: 0.4, taskdesk: 0.46 }[kind] || 0.72;
      if (['boss', 'colleague', 'driver', 'hr', 'aunty'].includes(kind)) c.translate(0, kind === 'aunty' ? 5 : 3);
      c.scale(fit, fit);
      if (kind === 'boss') SPRITES.boss(c, 0, { s: 1.28 });
      else SPRITES[kind](c, 0.3);
      c.restore();
    });
    if (G.state === 'menu') refreshMenu();
  }

  /* ==================== Wire up ==================== */
  $('btn-play').addEventListener('click', () => startGame('normal'));
  $('btn-daily').addEventListener('click', () => startGame('daily'));
  $('btn-again').addEventListener('click', () => { saveNameFrom(ui.playerName); startGame(G.mode); });
  $('btn-restart').addEventListener('click', () => startGame(G.mode));
  $('btn-resume').addEventListener('click', resumeGame);
  $('btn-pause').addEventListener('click', () => { if (G.state === 'playing') pauseGame(); else if (G.state === 'paused') resumeGame(); });
  $('btn-menu-pause').addEventListener('click', toMenu);
  $('btn-menu-over').addEventListener('click', () => { saveNameFrom(ui.playerName); toMenu(); });
  $('btn-share').addEventListener('click', shareScore);
  $('btn-save-image').addEventListener('click', saveImage);
  $('btn-bosskey').addEventListener('click', openBossKey);
  $('btn-excel-close').addEventListener('click', closeBossKey);
  $('btn-challenge-clear').addEventListener('click', clearChallenge);
  $('btn-wardrobe').addEventListener('click', () => openSide('wardrobe'));
  $('btn-settings').addEventListener('click', () => openSide('settings'));
  $('btn-review').addEventListener('click', () => openSide('review'));
  document.querySelectorAll('.js-back').forEach((b) => b.addEventListener('click', toMenu));
  ui.muteHud.addEventListener('click', (e) => { toggleAllSound(); e.currentTarget.blur(); });
  ui.playerName.addEventListener('change', () => saveNameFrom(ui.playerName));
  $('set-name').addEventListener('change', (e) => { saveNameFrom(e.target); refreshMenu(); });
  $('btn-board-back').addEventListener('click', closeBoard);
  ui.lbForm.addEventListener('submit', submitScore);
  if (LB.enabled) {
    $('btn-board-menu').hidden = false;
    $('btn-board-over').hidden = false;
    $('btn-board-menu').addEventListener('click', () => openBoard('menu'));
    $('btn-board-over').addEventListener('click', () => openBoard('over'));
  }

  document.querySelectorAll('.char-opt').forEach((b) => b.addEventListener('click', () => {
    S.char = b.dataset.char; store.set('ow_char', S.char); renderWardrobe(); Sound.play('click');
  }));
  $('outfit-grid').addEventListener('click', (e) => {
    const buy = e.target.closest('.btn-buy');
    if (buy) { buyOutfit(buy.dataset.buy); return; }
    const b = e.target.closest('.outfit-opt');
    if (!b || b.classList.contains('is-locked')) return;
    S.outfit = b.dataset.outfit; store.set('ow_outfit', S.outfit); renderWardrobe();
    Sound.play('click');
  });
  document.querySelectorAll('.seg').forEach((seg) => seg.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    const v = b.dataset.v;
    if (seg.dataset.setting !== 'stats') T('setting', { k: seg.dataset.setting, v });
    switch (seg.dataset.setting) {
      case 'stats':
        if (window.OWTrack) { if (v === 'on') { window.OWTrack.setEnabled(true); T('setting', { k: 'stats', v: 'on' }); } else { T('setting', { k: 'stats', v: 'off' }); window.OWTrack.flush(); window.OWTrack.setEnabled(false); } }
        break;
      case 'sound': Sound.setSfx(v === 'on'); Sound.play('click'); break;
      case 'music': Sound.setMusic(v === 'on'); break;
      case 'lang': S.lang = v; store.set('ow_lang', v); applyLang(); break;
      case 'voices':
        S.voices = v === 'on'; store.set('ow_voices', S.voices ? '1' : '0');
        Sound.wake();
        if (S.voices) say('boss_coming');
        else if (Voice) Voice.stop();
        break;
      case 'commute': S.commute = v === 'on'; store.set('ow_commute', S.commute ? '1' : '0'); break;
      case 'gfx': S.gfx = v; store.set('ow_gfx', v); setQuality(v === 'low' ? 'low' : 'high'); perf.reset(); break;
    }
    syncSettingsUi();
    syncMuteUi();
  }));

  const howto = $('howto');
  if (store.get('ow_played', '0') === '1' && window.innerHeight < 900) howto.open = false;

  $('btn-career').addEventListener('click', () => startGame('career'));
  $('btn-shop').addEventListener('click', () => openSide('shop'));
  $('btn-leagues').addEventListener('click', () => openSide('leagues'));
  $('btn-use').addEventListener('click', (e) => { useHeld(); e.currentTarget.blur(); });
  $('btn-skip').addEventListener('click', (e) => { arrive(true); e.currentTarget.blur(); });
  $('shop-grid').addEventListener('click', (e) => { const b = e.target.closest('[data-buy]'); if (b && !b.disabled) buyItem(b.dataset.buy); });
  $('league-create').addEventListener('submit', (e) => { e.preventDefault(); createLeague($('league-new').value.trim()); });
  $('league-join').addEventListener('submit', (e) => { e.preventDefault(); joinLeague($('league-code').value); });
  $('league-list').addEventListener('click', (e) => { const b = e.target.closest('[data-code]'); if (b) openLeagueBoard(b.dataset.code); });
  $('league-player').addEventListener('change', (e) => { saveNameFrom(e.target); refreshMenu(); });
  $('btn-league-back').addEventListener('click', renderLeagueHome);
  $('btn-league-invite').addEventListener('click', inviteLeague);
  $('btn-league-leave').addEventListener('click', leaveLeague);
  $('btn-invite-join').addEventListener('click', () => {
    const inv = LG.invite;
    LG.invite = null;
    openSide('leagues');
    if (inv) joinLeague(inv.code);
  });
  $('btn-invite-dismiss').addEventListener('click', () => { LG.invite = null; refreshMenu(); });
  $('btn-promo-share').addEventListener('click', sharePromo);
  $('btn-promo-ok').addEventListener('click', () => { G.promoPending = null; G.state = 'over'; showScreen('over'); refreshMenu(); });
  $('set-oga').addEventListener('change', (e) => {
    const n = cleanName(e.target.value).slice(0, 16);
    const help = $('oga-help');
    if (n && isRude(n)) { help.textContent = t('ogaBad'); help.classList.add('err'); e.target.value = S.ogaName; return; }
    S.ogaName = n; store.set('ow_oga', n); e.target.value = n;
    help.textContent = t('ogaSaved'); help.classList.remove('err');
  });

  $('sponsor-link').addEventListener('click', (e) => {
    const ad = ADS.menuAd;
    if (!ad) return;
    T('ad_click', { id: ad.id, where: 'menu' });
    if (!ad.url) e.preventDefault();
  });
  $('over-sponsor').addEventListener('click', (e) => {
    const ad = ADS.overAd;
    if (!ad) return;
    T('ad_click', { id: ad.id, where: 'appraisal' });
    if (!ad.url) e.preventDefault();
  });

  /* ==================== Boot ==================== */
  G.challenge = readChallenge();
  if (G.challenge) T('challenge_open', { score: G.challenge.score, daily: G.challenge.daily });
  probeLeagues();
  loadAds();
  if (Voice) { Voice.init(); Voice.lang = S.lang; Voice.enabled = S.voices; }
  buildGraphics();
  syncMuteUi();
  resize();
  newRound('normal');
  G.state = 'menu';
  applyLang();
  drawIcons();
  requestAnimationFrame((n) => { lastFrame = n; requestAnimationFrame(frame); });
  // start the menu groove on the first tap if music is on
  const firstGesture = () => {
    Sound.wake();
    if (Music && Sound.musicOn && G.state !== 'playing' && ui.excel.hidden) { Music.start('menu'); Music.setMode(G.state === 'playing' ? 'game' : 'menu'); }
    window.removeEventListener('pointerdown', firstGesture, true);
    window.removeEventListener('keydown', firstGesture, true);
  };
  window.addEventListener('pointerdown', firstGesture, true);
  window.addEventListener('keydown', firstGesture, true);

  if (DEBUG) {
    window.__OW = {
      G, S, stats, unlocked, CONFIG, DIFFICULTY, step, render, spawnBoss, spawnItem, spawnObstacle, startBlackout,
      startGame, pauseGame, resumeGame, toMenu, spawnOga, spawnDriver, spawnHR, spawnAunty, startEvent, useHeld, arrive,
      renderShop, buyItem, LG, ADS, setAds, pickAd, T, Voice, careerDay, goalTarget, isRude, weekKeyLocal, makePromoImage, openPromo, shareText, challengeUrl, makeShareImage, openBossKey, closeBossKey,
      SPRITES, officeClock, setQuality, get quality() { return quality; }, Sound, Music,
    };
  }
})();
