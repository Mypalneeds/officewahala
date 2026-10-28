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
    weeklyDone: (txt, r) => `Weekly challenge done: ${txt}! +₦${r}`, weeklyAll: (r) => `All 3 weekly challenges done! Bonus +₦${r}`,
    goldSet: 'All 19 classic badges at Gold! Gold ID frame unlocked and +₦5,000.',
    goldSetProg: (g, n) => `Gold collection: ${g}/${n} classic badges at Gold. Get all ${n} for a gold ID frame and ₦5,000.`,
    rewardTxt: (r) => '₦' + r + '\u00a0reward',
    goldSetDone: 'Gold collection complete. Your ID card has a gold frame.', nextLevel: 'Next', levelsTotal: (n) => `${n} levels`,
    thisWeek: 'this week', paid: 'Paid ✓', daysLeft: (d) => (d === 1 ? 'last day' : d + ' days left'), allBonus: (r) => `all 3 = +₦${r}`,
    weeklyCard: (d, left) => `This week's challenges: ${d}/3 done · ${left === 1 ? 'last day' : left + ' days left'}`,
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
    sticker:   { weight: 0, pts: 0, event: true, color: '#e879f9' },
    // event-only pickups
    cake: { weight: 0, pts: 300, event: true, color: '#ff8fb1' },
    gift: { weight: 0, pts: 400, event: true, color: '#e5484d' },
    rose: { weight: 0, pts: 150, event: true, color: '#ff5d8f' },
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


  const SHOP_ITEMS = [
    { id: 'chair', ico: 'chair', name: 'Ergonomic chair', desc: '+5% walking speed per level', max: 3, price: [600, 1800, 4500] },
    { id: 'stab', ico: 'stabilizer', name: 'Stabilizer', desc: 'Blackouts are 25% shorter per level', max: 2, price: [900, 2700] },
    { id: 'canteen', ico: 'canteen', name: 'Canteen card', desc: 'Lunch packs worth +25 more points per level', max: 2, price: [800, 2400] },
    { id: 'life', ico: 'health', name: 'Health insurance', desc: 'Start every shift with an extra life', max: 1, price: [7000] },
    { id: 'pocket', ico: 'autoreply', name: 'Auto-reply in your pocket', desc: 'Start your next shift holding an Auto-reply. Stack up to 3', max: 3, price: [350, 350, 350], consumable: true },
    { id: 'pos', ico: 'pos', name: 'POS terminal', desc: 'Pulls nearby salary, lunch and data towards you. Level 2 pulls from further away', max: 2, price: [2500, 6000] },
    { id: 'danfo', ico: 'danfo', name: 'Danfo pass', desc: 'Commute delays cost 7 minutes instead of 10 (5 at level 2)', max: 2, price: [1200, 3000] },
    { id: 'coffee', ico: 'coffee', name: 'Strong coffee', desc: 'Walk 20% faster for the first 20 seconds in the office (35s at level 2)', max: 2, price: [1500, 3500] },
    { id: 'sick', ico: 'sick', name: 'Sick leave', desc: 'Out of lives? The doctor signs you back in with 1 life, once per shift. Stack up to 2', max: 2, price: [2500, 2500], consumable: true },
  ];
  const OUTFIT_PRICES = { ankara: 1500, senator: 2500, suit: 3000, jersey: 3000, native: 4000, agbada: 6000, legend: 12000,
    hoodie: 2200, fanjersey: 2800, banker: 3500, kaftan: 3800, isiagu: 5000, babban: 5500, asoebi: 7000, christmas: 4500 };

  // Skin tones are free. Hair, accessories and extras are bought in the staff shop.
  const SKIN_TONES = ['#f1c27d', '#d9a066', '#b9773f', '#8d5524', '#7a4521', '#5c3519', '#3f2312'];
  const LOOKS = [
    { id: 'fade', slot: 'hair', name: 'Fade with part line', price: 800 },
    { id: 'afro', slot: 'hair', name: 'Big afro', price: 1200 },
    { id: 'locs', slot: 'hair', name: 'Locs', price: 1800 },
    { id: 'braids', slot: 'hair', name: 'Braids', price: 1800 },
    { id: 'bald', slot: 'hair', name: 'Clean bald', price: 600 },
    { id: 'hijab', slot: 'hair', name: 'Hijab', price: 1200 },
    { id: 'glasses', slot: 'eyes', name: 'Reading glasses', price: 700 },
    { id: 'shades', slot: 'eyes', name: 'Big boss shades', price: 2500 },
    { id: 'headphones', slot: 'head', name: 'Headphones', price: 1800 },
    { id: 'facecap', slot: 'head', name: 'Face cap', price: 1200 },
    { id: 'backpack', slot: 'back', name: 'Laptop backpack', price: 2000 },
    { id: 'coffeecup', slot: 'hand', name: 'Coffee cup', price: 900 },
    { id: 'phone', slot: 'hand', name: 'Phone in hand', price: 1100 },
    { id: 'goldtag', slot: 'neck', name: 'Gold staff ID', price: 3500 },
  ];
  const LOOK_SLOTS = [['hair', 'Hair'], ['eyes', 'Glasses'], ['head', 'Headwear'], ['back', 'Bag'], ['hand', 'In hand'], ['neck', 'Staff ID']];
  // Job titles show on your ID card and on league boards. Keep in sync with TITLES in netlify/functions/league.mjs.
  const TITLES = [
    { id: 'dodger', name: 'Senior Oga-Dodger', price: 1500 },
    { id: 'latecomer', name: 'Professional Latecomer', price: 2000 },
    { id: 'gist', name: 'Chief Gist Officer', price: 2500 },
    { id: 'wahala', name: 'Head of Wahala', price: 4000 },
    { id: 'vibes', name: 'Director of Vibes', price: 6000 },
    { id: 'smallchops', name: 'Minister of Small Chops', price: 9000 },
    { id: 'ogatrain', name: 'Oga in Training', price: 12000 },
    { id: 'legend', name: 'Office Legend', price: 20000 },
  ];
  const EXTRAS = [
    { id: 'trail', ico: 'trail', name: 'Money rain trail', desc: 'Naira notes fly behind you as you walk', price: 6000 },
    { id: 'gold', ico: 'crown', name: 'Gold name', desc: 'Your name shows in gold on your ID card and on league boards', price: 8000 },
  ];

  // Career mode: a five-day week; goals get harder every week (w = week number)
  const CAREER_DAYS = [
    { key: 'mon', type: 'hour', n: (w) => Math.min(17, 11 + w) },
    { key: 'tue', type: 'lunch', n: (w) => 10 + 4 * (w - 1) },
    { key: 'wed', type: 'tasks', n: (w) => 2 + (w - 1) },
    { key: 'thu', type: 'escapes', n: (w) => 2 + (w - 1) },
    { key: 'fri', type: 'fridays', n: (w) => 2 + Math.floor((w - 1) / 2) },
  ];
  const PROMO_RANKS = ['Senior officer', 'Manager', 'Director', 'General manager', 'MD / CEO'];

  // Badges level up forever: Bronze, Silver, Gold, Platinum, Diamond, then Diamond II, III… (each level pays naira).
  // tiers = goals for the first five levels; after that each level adds the last step again.
  const BADGES = [
    { id: 'first', ico: 'id-badge', name: 'First day at work', desc: (n) => (n === 1 ? 'Finish your first shift' : `Finish ${fmtNum(n)} shifts`), stat: 'games', tiers: [1, 10, 50, 200, 500] },
    { id: 'lunch', ico: 'rice', name: 'Lunch champion', desc: (n) => `Collect ${fmtNum(n)} lunch packs in total`, stat: 'lunch', tiers: [30, 150, 500, 1500, 4000] },
    { id: 'escape10', ico: 'running', name: 'Oga no fit catch me', desc: (n) => `Outrun Oga ${fmtNum(n)} times`, stat: 'escapes', tiers: [10, 40, 120, 350, 900] },
    { id: 'nepa', ico: 'bulb', name: 'NEPA survivor', desc: (n) => (n === 1 ? 'Get through a blackout without a hit' : `Get through ${fmtNum(n)} blackouts without a hit`), stat: 'blackouts', tiers: [1, 10, 40, 120, 300] },
    { id: 'overtime', ico: 'moon', name: 'Overtime', desc: (n) => `Reach level ${n} in one shift`, stat: 'maxLevel', tiers: [10, 13, 16, 20, 25] },
    { id: 'bigboss', ico: 'career', name: 'Big boss energy', desc: (n) => `Score ${fmtNum(n)} in one shift`, stat: 'maxScore', tiers: [5000, 8000, 12000, 18000, 25000] },
    { id: 'legend', ico: 'crown', name: 'Office legend', desc: (n) => `Score ${fmtNum(n)} in one shift`, stat: 'maxScore', tiers: [10000, 15000, 22000, 30000, 40000] },
    { id: 'streak15', ico: 'fire', name: 'On a roll', desc: (n) => `Reach a streak of ${n}`, stat: 'maxStreak', tiers: [15, 25, 40, 60, 90] },
    { id: 'close50', ico: 'sweat', name: 'Close shave', desc: (n) => `${fmtNum(n)} close calls in total`, stat: 'near', tiers: [50, 250, 800, 2500, 6000] },
    { id: 'tgif', ico: 'party', name: 'TGIF', desc: (n) => (n === 1 ? 'Grab a Friday bonus' : `Grab ${fmtNum(n)} Friday bonuses`), stat: 'fridays', tiers: [1, 10, 40, 120, 300] },
    { id: 'marathon', ico: 'stopwatch', name: 'Marathon shift', desc: (n) => `Survive ${fmtTime(n)} in one shift`, stat: 'maxTime', tiers: [180, 300, 420, 600, 900] },
    { id: 'challenger', ico: 'handshake', name: 'Who send you?', desc: (n) => (n === 1 ? "Beat a colleague's challenge" : `Beat ${n} colleagues' challenges`), stat: 'challenges', tiers: [1, 5, 15, 40, 100] },
    { id: 'daily3', ico: 'calendar', name: 'Punctual staff', desc: (n) => `Finish ${fmtNum(n)} daily shifts`, stat: 'dailies', tiers: [3, 10, 30, 100, 250] },
    { id: 'bosskey', ico: 'hide', name: 'Nothing to see here', desc: (n) => (n === 1 ? 'Use the boss key' : `Use the boss key ${n} times`), stat: 'bossKeys', tiers: [1, 5, 20, 50, 120] },
    { id: 'commuter', ico: 'bus', name: 'Lagos commuter', desc: (n) => `Arrive at work on time ${fmtNum(n)} times`, stat: 'ontime', tiers: [5, 25, 80, 200, 500] },
    { id: 'reporter', ico: 'chart', name: 'Report machine', desc: (n) => `Submit ${fmtNum(n)} reports in total`, stat: 'tasks', tiers: [10, 50, 150, 400, 1000] },
    { id: 'promoted', ico: 'scroll', name: 'Promoted!', desc: (n) => (n === 1 ? 'Finish a full career week' : `Finish ${n} career weeks`), stat: 'weeks', tiers: [1, 3, 8, 20, 50] },
    { id: 'shopper', ico: 'bag', name: 'Big spender', desc: (n) => (n === 1 ? 'Buy something in the staff shop' : `Buy ${n} things in the staff shop`), stat: 'buys', tiers: [1, 5, 15, 40, 100] },
    { id: 'eventful', ico: 'masks', name: 'Seen it all', desc: (n) => `Survive ${fmtNum(n)} shift events`, stat: 'events', tiers: [10, 50, 150, 400, 1000] },
    // v6
    { id: 'champion', ico: 'trophy', name: 'League champion', desc: (n) => (n === 1 ? 'Win a league round' : `Win ${n} league rounds`), stat: 'leagueWins', tiers: [1, 3, 8, 20, 50], v6: true },
    { id: 'teamplayer', ico: 'leagues', name: 'Team player', desc: (n) => `Play ${fmtNum(n)} league shifts`, stat: 'leagueShifts', tiers: [5, 25, 80, 200, 500], v6: true },
    { id: 'fashion', ico: 'wardrobe', name: 'Fashion killer', desc: (n) => `Own ${n} looks, outfits or titles`, stat: 'owned', tiers: [3, 8, 15, 25, 35], v6: true },
    { id: 'doctor', ico: 'sick', name: "Doctor's note", desc: (n) => (n === 1 ? 'Get saved by sick leave' : `Get saved by sick leave ${n} times`), stat: 'sickUsed', tiers: [1, 5, 15, 40, 100], v6: true },
    { id: 'dj', ico: 'music', name: 'Office DJ', desc: (n) => (n === 1 ? 'Last a full song (over a minute) in one shift' : `Last over a minute in ${fmtNum(n)} shifts`), stat: 'longShifts', tiers: [1, 10, 40, 120, 300], v6: true },
    { id: 'ghostbuster', ico: 'sparkle', name: 'Ghostbuster', desc: (n) => (n === 1 ? "Beat a colleague's ghost" : `Beat ${n} ghosts`), stat: 'ghostsBeaten', tiers: [1, 5, 20, 50, 120], v6: true },
    { id: 'generous', ico: 'gift', name: 'Generous oga', desc: (n) => (n === 1 ? 'Send a colleague lunch money' : `Send lunch money ${n} times`), stat: 'giftsSent', tiers: [1, 5, 20, 50, 120], v6: true },
    { id: 'gist', ico: 'title', name: 'Office gist', desc: (n) => (n === 1 ? 'Post on a league wall' : `Post ${n} times on league walls`), stat: 'wallPosts', tiers: [1, 10, 40, 120, 300], v6: true },
    { id: 'earner', ico: 'coins', name: 'Salary earner', desc: (n) => `Earn ₦${fmtNum(n)} in salary`, stat: 'earned', tiers: [5000, 25000, 100000, 300000, 1000000], v6: true },
    { id: 'hustler', ico: 'calendar', name: 'Weekly hustler', desc: (n) => `Complete ${n} weekly challenges`, stat: 'weeklies', tiers: [1, 5, 15, 40, 100], v6: true },
    { id: 'missions', ico: 'mission', name: 'Mission control', desc: (n) => `Complete ${fmtNum(n)} mini-missions`, stat: 'missions', tiers: [5, 25, 100, 300, 800], v6: true },
    { id: 'meeting5', ico: 'clock', name: 'Any other business', desc: (n) => (n === 1 ? "Survive Oga's 5pm emergency meeting" : `Survive ${n} emergency meetings`), stat: 'meetings5', tiers: [1, 5, 15, 40, 100], v6: true },
    { id: 'register', ico: 'calendar', name: 'Present, sir!', desc: (n) => `Sign the attendance register ${n} days in a row`, stat: 'attStreak', tiers: [3, 7, 14, 30, 60], v6: true },
    { id: 'stickerbook', ico: 'stapler', name: 'Sticker collector', desc: (n) => `Collect ${fmtNum(n)} sticker envelopes`, stat: 'stickerTotal', tiers: [5, 15, 40, 100, 250], v6: true },
    { id: 'veteran', ico: 'season', name: 'Season veteran', desc: (n) => (n === 1 ? 'Finish a season track' : `Finish ${n} season tracks`), stat: 'seasons', tiers: [1, 2, 4, 8, 12], v6: true },
    { id: 'dodger', ico: 'party', name: 'Contribution dodger', desc: (n) => `Dodge ${n} birthday contribution collectors`, stat: 'bdayDodged', tiers: [5, 25, 80, 200, 500], v6: true },
  ];
  const TIER_NAMES = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];
  const TIER_COLORS = ['#cd7f32', '#b8c2cc', '#f5b301', '#8fd3e8', '#6ee7ff'];
  const tierName = (lv) => (lv <= 0 ? '' : lv <= 5 ? TIER_NAMES[lv - 1] : 'Diamond ' + ['', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][Math.min(9, lv - 5)] + (lv > 14 ? ' +' + (lv - 14) : ''));
  const tierColor = (lv) => TIER_COLORS[Math.max(0, Math.min(4, lv - 1))];
  function tierGoal(b, k) { // goal for level k+1 (k = 0 is Bronze)
    const tt = b.tiers;
    if (k < tt.length) return tt[k];
    const step = tt[tt.length - 1] - tt[tt.length - 2];
    return tt[tt.length - 1] + step * (k - tt.length + 1);
  }
  const tierReward = (k) => (k < 5 ? [150, 400, 900, 2000, 4000][k] : 4000 + 1500 * (k - 4));
  const GOLD_SET = BADGES.filter((b) => !b.v6).map((b) => b.id); // the original 19: all at Gold = gold ID frame + ₦5,000


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
    // v5: staff-shop outfits (bought with naira)
    { id: 'hoodie', name: 'Yaba tech-bro hoodie', buy: true, p: { shirt: '#2d3446', pants: '#1f2937', hoodie: '#3b4459', text: 'YABA', textColor: '#19c37d' } },
    { id: 'fanjersey', name: 'Naija fan jersey', buy: true, p: { shirt: '#ffffff', sleeve: '#008751', pants: '#008751', number: '9', numberColor: '#008751' } },
    { id: 'banker', name: 'Banker suit', buy: true, p: { shirt: '#1d3a6b', pants: '#16294b', suit: true, tie: '#5ab0ff', stripes: true } },
    { id: 'kaftan', name: 'Kaftan', buy: true, p: { shirt: '#7b3f1d', pants: '#7b3f1d', long: true, trim: '#f5d061' } },
    { id: 'isiagu', name: 'Isiagu & red cap', buy: true, p: { shirt: 'pattern:isiagu', pants: '#141414', cap: 'okpu', capColor: '#c8102e' } },
    { id: 'babban', name: 'Babban riga & hula', buy: true, p: { shirt: '#f3efe6', pants: '#f3efe6', robe: '#f3efe6', trim: '#2f8f5b', cap: 'hula' } },
    { id: 'asoebi', name: 'Aso-ebi party', buy: true, p: { shirt: 'pattern:aso', pants: 'pattern:aso', cap: 'gele', capColor: 'pattern:aso' } },
    { id: 'christmas', name: 'Christmas party', buy: true, p: { shirt: '#c62828', sleeve: '#c62828', pants: '#1b5e20', xmas: true, cap: 'santa' } },
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
    upg: Object.assign({ chair: 0, stab: 0, canteen: 0, life: 0, pocket: 0, pos: 0, danfo: 0, coffee: 0, sick: 0 }, store.json('ow_upg', {})),
    owned: new Set(store.json('ow_owned', [])),
    career: Object.assign({ week: 1, day: 0 }, store.json('ow_career', {})),
    leagues: (store.json('ow_leagues', []) || []).filter((l) => l && /^[A-HJ-NP-Z2-9]{6}$/.test(l.code)).slice(0, 5),
    playerId: store.get('ow_pid', ''),
    look: Object.assign({ skin: '', hair: '', eyes: '', head: '', back: '', hand: '', neck: '', trail: false, gold: false, title: '' }, store.json('ow_look', {})),
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
    look() { store.set('ow_look', JSON.stringify(S.look)); },
  };
  const t = (k) => (STR[S.lang][k] !== undefined ? STR[S.lang][k] : STR.en[k]);
  const msgs = () => MESSAGES[S.lang];

  // ---- Leagues v2 words ----
  Object.assign(STR.en, {
    leagueMax: 'You can be in up to 5 leagues.', leagueEmpty: 'No scores yet this round. Press Play to get on the board!',
    lgStarts: (when, left) => `Starts ${when} (in ${left})`, lgEnded: 'Round ended', lgOpen: (left, weekly) => `Open · ${left} left${weekly ? ' (resets Monday)' : ''}`,
    lgWeekly: 'Weekly league', lgTournament: 'Tournament', lgShift: (s) => (s % 60 ? (s / 60).toFixed(1) : s / 60) + '-min shifts', lgNoLimit: 'No time limit',
    lgTries: (n) => (n === 1 ? '1 try' : n + ' tries'), lgTriesAny: 'Unlimited tries', lgTotal: 'Total of all tries', lgBest: 'Best score wins',
    lgSame: 'Same office for everyone', lgNoUpg: 'No shop upgrades', lgUpg: 'Allow shop upgrades', lgCommute: 'Morning commute', lgNoCommute: 'No commute',
    lgKicked: 'The admin removed you from this league.', lgNotYet: 'This league has not started yet.', lgNoTries: 'No tries left this round.',
    lgRank: (r, n, sc) => `You: #${r} of ${n} (${sc})`, lgNoScore: 'You have no score yet', lgTriesLeft: (n) => (n === 1 ? '1 try left' : n + ' tries left'),
    lgLeader: (n, sc) => `Leader: ${n} ${sc}`, lgPlay: 'Play', lgBoard: 'Board', lgPlayFor: 'Play for this league',
    lgType: 'Type', lgWeeklyHelp: 'Runs every week, resets Monday', lgTournamentHelp: 'You pick the start and end time',
    lgStart: 'Starts', lgEnd: 'Ends', lgShiftLen: 'Shift length', lgTriesLabel: 'Tries per round', lgWinner: 'Winner',
    lgBestLong: 'Best single shift', lgTotalLong: 'Total of all shifts added up', lgSameHelp: 'Same obstacles in the same order. Pure skill.',
    lgUpgHelp: 'Off = everyone plays with the same speed and lives', lgCommuteHelp: 'Start each shift with the Lagos road dash',
    lgPrize: 'Prize (optional)', lgPrizeEg: 'e.g. Winner gets lunch on Friday', lgBadCode: 'That code is not valid. It has 6 letters and numbers.',
    lgNeedLeagueName: 'Give your league a name.', lgNeedPin: 'Choose an admin PIN of 4 to 6 digits.',
    lgPlays: (n) => (n === 1 ? '1 shift' : n + ' shifts'), lgBestShort: (b) => 'best ' + b, lgSurvived: (tm, lv, n) => `Survived ${tm} · level ${lv}` + (n > 1 ? ` · ${n} shifts` : ''),
    lgRemove: 'Remove', lgRound: (n) => 'Round ' + n, lgNobody: 'No scores', lgManage: 'Manage league', lgAdminLogin: 'Admin login',
    lgPrizeLine: (p) => 'Prize: ' + p, lgTapAgain: 'Tap again to confirm', lgUnlocked: 'Admin unlocked on this phone.', lgSaved: 'Rules saved.',
    lgEndedOk: 'Round ended. Winners saved to Past winners.', lgNewOk: 'New round started. Everyone\'s tries are reset.', lgRemoved: 'Player removed.',
    lgSubmitting: 'Sending your score to the league…', lgSubmitted: (r, n, sc) => `Rank #${r} of ${n} · your score ${sc}`, lgViewBoard: 'View league board',
    lgStartToast: (n, lim) => `${n}: ` + (lim ? `${lim % 60 ? (lim / 60).toFixed(1) : lim / 60}-minute shift. Go!` : 'this shift counts for the league. Go!'),
    lgTimeUp: 'Time up!', lgTimeUpStamp: 'Time up',
    ghostRace: (n, sc) => `Racing ${n}'s ghost (${sc}). Same office, same obstacles!`, ghostMine: (sc) => `Racing your own best run (${sc}).`,
    ghostOut: (n) => `${n}'s ghost clocked out here`, ghostPassed: (n) => `You passed ${n}'s ghost score!`, ghostBeatMine: 'You beat your own best!',
    ghostYou: 'Your best', ghostBeaten: (n) => `you beat ${n}'s ghost`,
    justNow: 'now', wallEmpty: 'No posts yet. Be the first to talk your talk.',
    giftTo: (n) => `Send ${n} lunch money`, giftSent: (a, n, left) => `Sent ₦${a} to ${n}. You can send ₦${left} more today.`,
    refGot: (from, a) => `${from} joined with your invite! +₦${a}`,
    giftGot: (from, a, lg) => `${from} sent you ₦${a} lunch money (${lg})!`, giftsGot: (n, sum) => `You received ${n} lunch money gifts: +₦${sum}!`,
    rivalPassed: (who, lg, r) => `${who} passed you in ${lg}. You're now #${r}.`, youWon: (lg, n) => `You won round ${n} of ${lg}!`,
    sickBack: 'Sick leave! The doctor signed you back in with 1 life.',
    skinTone: 'Skin tone', skinDefault: 'Default skin tone', hairDefault: 'Your usual hair', wearing: 'Wearing', wear: 'Wear', takeOff: 'Take off',
    turnOn: 'Turn on', turnOff: 'Turn off', useTitle: 'Use title', jobTitles: 'Job titles', shopOnly: 'Staff shop', orBadge: (b) => `Or unlock free with the "${b}" badge`,
    titlesHelp: 'Your title shows on your staff ID and next to your name on league boards.',
  });
  Object.assign(STR.pcm, {
    leagueMax: 'You fit join only 5 leagues.', leagueEmpty: 'No score yet for this round. Press Play make you enter board!',
    lgEnded: 'Round don end', lgOpen: (left, weekly) => `E dey open · ${left} remain${weekly ? ' (e go reset Monday)' : ''}`,
    lgKicked: 'Admin don remove you from this league.', lgNotYet: 'This league never start.', lgNoTries: 'Your tries don finish for this round.',
    lgNoScore: 'You never get score', lgTriesLeft: (n) => (n === 1 ? '1 try remain' : n + ' tries remain'), lgPlayFor: 'Play for this league',
    lgSubmitting: 'We dey send your score go league…', lgTimeUp: 'Time don reach!', lgTimeUpStamp: 'Time up',
    lgStartToast: (n, lim) => `${n}: ` + (lim ? `${lim % 60 ? (lim / 60).toFixed(1) : lim / 60}-minute shift. Oya go!` : 'this shift go count for league. Oya go!'),
  });

  // ---- v6 events words ----
  Object.assign(STR.en, {
    ev_birthday: 'Staff birthday!', ev_birthday_d: 'Colleagues are collecting ₦2,000 for cake. Dodge them!', ev_birthday_end: 'Cake has landed! Grab it.',
    ev_flood: 'Rainy season flood', ev_flood_d: 'Puddles everywhere. They slow you down.',
    ev_mop: 'Cleaner is mopping', ev_mop_d: 'Wet floor! You will slide. Watch the yellow signs.',
    ev_hq: 'Visitor from HQ', ev_hq_d: 'Look busy! Standing still costs points; moving pays extra.',
    ev_genfuel: 'Gen fuel finished', ev_genfuel_d: 'Lights are dying. Grab the jerrycan to restart the generator!',
    ev_owambe: 'Owambe Friday', ev_owambe_d: 'Dancing colleagues block the corridor. Jollof is worth double!',
    ev_netdown: 'Network down', ev_netdown_d: 'IT is rebooting the server. Data bundles are worth nothing for now.', ev_netdown_end: 'Network is back!',
    ev_alertdelay: 'Alert never land', ev_alertdelay_d: 'Salary is pending. Pickups pay half… for now.', ev_alertdelay_end: 'Alert don land! Salary is raining.',
    ev_cob: '4:59pm deadline', ev_cob_d: 'Close of business! Report desks everywhere, each worth triple.',
    ev_harmattan: 'Harmattan haze', ev_harmattan_d: 'Dust everywhere. You can barely see ahead.',
    ev_independence: 'Independence Day!', ev_independence_d: 'Green-white-green! Everything scores double.',
    ev_detty: 'Detty December', ev_detty_d: 'End-of-year bonus! Gift boxes are falling.',
    ev_valentine: "Valentine's Day", ev_valentine_d: 'Roses everywhere, and a colleague is following you with flowers.',
    lookBusy: 'Look busy!', bdayTalk: ['₦2k for cake!', 'Contribute o!', 'Birthday levy!', 'Drop something!'],
    bdayPaid: '-250 contribution', bdayPaidToast: 'You contributed for the cake.', bdayLeave: 'You are on leave. No contribution!',
    danceBump: 'Owambe bump! -50', roseyBump: 'Not now! -50', noNetwork: 'No network', pending: 'pending',
    genOn: 'Gen don start! Lights are back. +200', cakeGot: 'Birthday cake! +300',
    fuelQueue: 'Fuel scarcity!', fuelQueue_d: 'A petrol queue is blocking one lane. Go around it!',
  });
  Object.assign(STR.pcm, {
    ev_birthday: 'Staff birthday!', ev_birthday_d: 'Colleagues dey collect ₦2,000 for cake. Dodge dem!', ev_birthday_end: 'Cake don land! Carry am.',
    ev_flood: 'Rain don fall', ev_flood_d: 'Water full ground. E go slow you down.',
    ev_mop: 'Cleaner dey mop', ev_mop_d: 'Floor wet! You go slide. Watch the yellow sign.',
    ev_hq: 'Oga from HQ dey come', ev_hq_d: 'Form busy! If you stand one place, points go reduce.',
    ev_genfuel: 'Gen fuel don finish', ev_genfuel_d: 'Light dey go. Carry the jerrycan make gen start!',
    ev_owambe: 'Owambe Friday', ev_owambe_d: 'People dey dance for corridor. Jollof na double!',
    ev_netdown: 'Network don go', ev_netdown_d: 'IT dey restart server. Data no get value now.', ev_netdown_end: 'Network don come back!',
    ev_alertdelay: 'Alert never land', ev_alertdelay_d: 'Salary still dey pending. Na half you go get… for now.', ev_alertdelay_end: 'Alert don land! Salary dey rain.',
    ev_cob: '4:59pm deadline', ev_cob_d: 'Close of business! Report desk full everywhere, each one na triple.',
    ev_harmattan: 'Harmattan haze', ev_harmattan_d: 'Dust everywhere. You no fit see far.',
    ev_independence: 'Independence Day!', ev_independence_d: 'Green-white-green! Everything na double.',
    ev_detty: 'Detty December', ev_detty_d: 'End of year bonus! Gift box dey fall.',
    ev_valentine: "Val's Day", ev_valentine_d: 'Rose everywhere, and one colleague dey follow you with flower.',
    lookBusy: 'Form busy!', bdayTalk: ['₦2k for cake!', 'Contribute o!', 'Birthday levy!', 'Drop something!'],
    bdayPaid: '-250 contribution', bdayPaidToast: 'You don contribute for cake.', bdayLeave: 'You dey leave. No contribution!',
    danceBump: 'Owambe don jam you! -50', roseyBump: 'No be now! -50', noNetwork: 'No network', pending: 'pending',
    genOn: 'Gen don start! Light don come. +200', cakeGot: 'Birthday cake! +300',
    fuelQueue: 'Fuel scarcity!', fuelQueue_d: 'Petrol queue don block one lane. Go round am!',
  });


  // ---- v7 words ----
  Object.assign(STR.en, {
    convoyComing: 'Protocol convoy coming through! Clear the road.', gustComing: 'Chopper landing! The wind will push you.',
    meetChip: (s) => `5pm meeting · survive ${s}s`,
    missionNew: (x) => 'Mission: ' + x, missionDone: (r) => `Mission done! +₦${r}`, missionFail: 'Mission missed. Another one is coming.',
    meetBanner: "5:00pm: Oga's emergency meeting!", meetToast: 'Dodge the agenda for 20 seconds. Survive it for +1,000 and ₦500.',
    meetTag: 'EMERGENCY MEETING', meetDone: 'Meeting adjourned! +1,000', meetDoneToast: 'You survived the 5pm meeting! +₦500',
    stickerWord: 'sticker', eotmWord: 'Employee of the month certificate',
    attSigned: (d, r) => `Day ${d} signed! +₦${r}`, attStreakDone: (n) => `Signed for today. ${n}-day streak. See you tomorrow!`,
    attBroke: 'Welcome back! Your streak starts again today.', attStreak: (n) => (n > 1 ? `You're on a ${n}-day streak. Sign in to keep it going.` : 'Sign in every day. Day 7 pays ₦1,000 and a sticker.'),
    dayN: (d) => 'Day ' + d, attGraceOk: 'Missed a day? One missed day is forgiven per week, so your streak survives.', attGraceUsed: "You've used this week's missed-day pass. Don't miss another day!",
    attSeeTomorrow: 'Come back tomorrow', attSign: (r) => `Sign the register: +₦${r}`,
    attCard: (d, r) => `Attendance register: sign for day ${d} (+₦${r})`, attCardDone: (n, r) => `Attendance: ${n}-day streak ✓ · tomorrow +₦${r}`,
    seasonTier: (n) => `Season tier ${n}!`, seasonDone: 'Season track complete!', seasonOf: (m) => 'Season · ' + m,
    seasonMeta: (tier, n, d) => `Tier ${tier} of ${n} · ${d} day${d === 1 ? '' : 's'} left`, seasonHow: 'XP from every shift, mission, meeting and daily sign-in',
    tierN: (n) => 'Tier ' + n, seasonBadge: '+ Season veteran badge', hubOffline: 'This needs the game online (deployed on Netlify).',
    seasonRank: (r) => `You're #${r} this season.`, seasonNoRank: 'Play a shift to get on this month’s board.', seasonEmpty: 'No scores yet this season. Be the first!',
    setDone: (n) => `Sticker set complete: ${n}! +₦3,000`, stickerDup: (n) => `Double: ${n}. +₦50`, stickerNew: (n) => `New sticker: ${n}!`, setComplete: 'complete', rareWord: 'Rare',
    deskEmpty: 'Your desk is empty. Buy a plant or a fan in the staff shop (Desk tab).', deskOf: (n) => `${n}'s desk`,
    deskShopHelp: 'Decorate your desk. Colleagues in your office leagues can see it. Some items are earned, not bought.',
    deskFreeGot: 'Earned', deskOnDesk: 'On your desk', deskFree_promoted: 'Earn it: finish a career week', deskFree_attendance: 'Earn it: 28 days of attendance',
    deskFree_badges: 'Earn it: unlock 5 badges', deskFree_sticker: 'Earn it: collect a sticker',
    pickState: 'Pick your state', statesLastWinner: (n) => `Last week's winner: ${n}`, statesPlayers: (n) => (n === 1 ? '1 player' : n + ' players'),
    statesMine: (st, sum, n) => `This week you've added ${sum} to ${st} over ${n} shift${n === 1 ? '' : 's'}.`, statesSwitchNote: 'Your new state counts from next Monday.',
    statesNone: (st) => `Finish a shift to add your score to ${st}.`, statesPickFirst: 'Pick your state to start adding points.',
    statesAdded: (sc, st) => `+${sc} added to ${st} in State Wars`, statesAdding: (st) => `Adding your score to ${st} in State Wars…`, statesPrompt: 'Pick your state in Settings to join State Wars.',
    inviteText: (u) => `Play Office Wahala with me, the free Nigerian office game! We both get ₦1,000 when you finish your first shift: ${u}`,
    inviteCopied: 'Invite link copied. Send it to a friend!', inviteBonus: (r) => `Invite bonus! +₦${r} for joining with a friend's link.`,
    nudgeBest: (n) => `Only ${n} points from your best. One more shift?`, nudgeGhost: (who, n) => `${n} points from beating ${who}'s ghost`,
    nudgeBadge: (desc, name, tier, r) => `${desc} → ${name} ${tier} (+₦${r})`, nudgeWeekly: (txt, cur, goal, r) => `${txt}: ${cur}/${goal} (+₦${r})`,
    nudgeOffice: (n, name, w) => `${n} more points (or ${w} career week${w === 1 ? '' : 's'}) to unlock ${name}`, nudgeSeason: (xp, tier) => `${xp} XP to season tier ${tier}`,
    nudgeTomorrow: (r) => `Sign the register tomorrow for ₦${r}`,
    bossIs: (b) => 'boss: ' + b, officeHere: "You're working here.", officeOpen: 'Unlocked. Tap to transfer.', officeHereBtn: 'Working here', officeGo: 'Transfer here',
    officeLock: (rank, w, sc, have) => `Unlocks at ${rank}: finish ${w} career week${w === 1 ? '' : 's'}, or earn ${sc} points in total (you have ${have}).`,
    officeMoved: (n) => `Transferred to ${n}!`, officeUnlocked: (n, city) => `New office unlocked: ${n}, ${city}! Change offices from the menu.`,
    officeCount: (n, all) => `${n}/${all} offices`, officeNext: 'Get promoted to unlock more',
    remindNo: "This browser can't show reminders.", remindDenied: 'Reminders are blocked. Allow notifications for this site in your browser settings.',
    remindOn: 'Reminders are on: at most one a day.', remindLimited: 'Reminders are on, but this browser only checks while the game is open. They work best on the installed app on Android (Chrome).',
  });

  const STATS_DEFAULT = { games: 0, lunch: 0, escapes: 0, blackouts: 0, maxLevel: 0, maxScore: 0, maxStreak: 0, near: 0, fridays: 0, maxTime: 0, challenges: 0, dailies: 0, bossKeys: 0, ontime: 0, tasks: 0, weeks: 0, buys: 0, events: 0,
    totalScore: 0, leagueWins: 0, leagueShifts: 0, owned: 0, sickUsed: 0, longShifts: 0, ghostsBeaten: 0, giftsSent: 0, wallPosts: 0, earned: 0, weeklies: 0, bdayDodged: 0, goldSet: 0,
    missions: 0, meetings5: 0, attStreak: 0, stickerTotal: 0, stickers: 0, stickerSets: 0, seasons: 0 };
  const stats = Object.assign({}, STATS_DEFAULT, store.json('ow_stats', {}));
  const unlocked = new Set(store.json('ow_badges', []));             // badges at Bronze or higher (outfits unlock from these)
  const blevels = Object.assign({}, store.json('ow_blevels', {}));     // badge id -> level reached
  for (const id of unlocked) if (!blevels[id]) blevels[id] = 1;
  function saveProgress() { store.set('ow_stats', JSON.stringify(stats)); store.set('ow_badges', JSON.stringify([...unlocked])); store.set('ow_blevels', JSON.stringify(blevels)); }
  const outfitUnlocked = (o) => (!o.unlock && !o.buy) || unlocked.has(o.unlock) || S.owned.has(o.id);
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
    } else if (name === 'isiagu') {
      x.fillStyle = '#c8102e'; x.fillRect(0, 0, 24, 24);
      x.strokeStyle = '#f5d061'; x.lineWidth = 1;
      for (const [px, py] of [[6, 6], [18, 18]]) {
        x.fillStyle = '#141414'; circle(x, px, py, 3.6); x.fill(); circle(x, px, py, 3.6); x.stroke();
      }
      x.fillStyle = '#141414';
      x.fillRect(16.5, 4.5, 3, 3); x.fillRect(4.5, 16.5, 3, 3);
    } else if (name === 'aso') {
      x.fillStyle = '#5b2a86'; x.fillRect(0, 0, 24, 24);
      x.strokeStyle = 'rgba(255,255,255,.22)'; x.lineWidth = 1;
      for (let i = -24; i < 48; i += 6) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + 24, 24); x.stroke(); }
      x.fillStyle = '#f5d061';
      for (const [px, py] of [[6, 6], [18, 18], [18, 6], [6, 18]]) { circle(x, px, py, 1.5); x.fill(); }
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
    if (p.backpack) { c.fillStyle = '#334155'; rr(c, -13, -15, 26, 10, 4); c.fill(); }
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
      c.fillStyle = p.numberColor || '#ffffff';
      c.fillRect(-5, -10, 10, 2);
      c.font = '900 9px system-ui, Arial, sans-serif';
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText(p.number, 0, 1);
    } else if (!p.robe && !p.long && !String(p.shirt).startsWith('pattern:')) {
      c.fillStyle = '#ffffff';
      c.beginPath(); c.moveTo(-6.5, -10); c.lineTo(0, -4); c.lineTo(6.5, -10); c.closePath(); c.fill();
    }
    if (p.stripes) {
      c.strokeStyle = 'rgba(255,255,255,.14)'; c.lineWidth = 0.7;
      c.beginPath(); for (const sx of [-9, -6, 6, 9]) { c.moveTo(sx, -8); c.lineTo(sx, 10); } c.stroke();
    }
    if (p.xmas) {
      c.fillStyle = '#ffffff'; rr(c, -12.5, 7.5, 25, 3.6, 1.8); c.fill();
      c.fillStyle = '#111827'; c.fillRect(-12, 2, 24, 2.4);
      c.fillStyle = '#f5d061'; c.fillRect(-2, 1.6, 4, 3.2);
    }
    if (p.hoodie) {
      c.fillStyle = p.hoodie;
      c.beginPath(); c.ellipse(0, -10.5, 11.5, 4.2, 0, 0, TAU); c.fill();
      c.strokeStyle = '#e2e8f0'; c.lineWidth = 0.9; c.lineCap = 'round';
      c.beginPath(); c.moveTo(-3, -8); c.lineTo(-3.2, -4.5); c.moveTo(3, -8); c.lineTo(3.2, -4.5); c.stroke();
      c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -7, 4.5, 14, 5, 2); c.fill();
      if (p.text) { c.fillStyle = p.textColor || '#fff'; c.font = '900 4.6px system-ui, Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(p.text, 0, 1); }
    }
    if (p.backpack) {
      c.strokeStyle = '#1e293b'; c.lineWidth = 2.4; c.lineCap = 'round';
      c.beginPath(); c.moveTo(-7.5, -10); c.lineTo(-8.5, 6); c.moveTo(7.5, -10); c.lineTo(8.5, 6); c.stroke();
    }
    if (p.tie) {
      c.fillStyle = p.tie;
      c.beginPath(); c.moveTo(0, -5); c.lineTo(-2.6, -1.5); c.lineTo(0, 8); c.lineTo(2.6, -1.5); c.closePath(); c.fill();
    }
    if (p.badge) {
      c.strokeStyle = p.badge; c.lineWidth = 1.2;
      c.beginPath(); c.moveTo(-5, -9); c.lineTo(-6, 2); c.moveTo(5, -9); c.lineTo(-4, 2); c.stroke();
      c.fillStyle = p.badgeCard || '#fff'; rr(c, -9, 1, 7, 8, 1.5); c.fill();
      c.fillStyle = p.badgeCard ? '#7a5200' : '#008751'; c.fillRect(-8, 2.5, 5, 1.8);
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
    if (p.laptop) {
      c.fillStyle = '#334155'; rr(c, -10, 0 + lg * 0.3, 20, 13, 2); c.fill();
      c.fillStyle = '#5ad1ff'; c.fillRect(-8, 2 + lg * 0.3, 16, 9);
      c.fillStyle = '#f8fafc'; c.font = '900 3.6px system-ui, Arial'; c.textAlign = 'center'; c.fillText('</>', 0, 8 + lg * 0.3);
    }
    if (p.coffeecup) {
      const cy = 4 + lg * 0.6;
      c.fillStyle = '#f8fafc'; rr(c, -18, cy, 7, 8, 1.5); c.fill();
      c.fillStyle = '#8b5a2b'; c.fillRect(-18, cy + 2.5, 7, 2.6);
      c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 0.9;
      c.beginPath(); c.moveTo(-15.5, cy - 1); c.quadraticCurveTo(-17, cy - 3.5, -15, cy - 5.5); c.stroke();
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
    if (p.earrings && p.hair !== 'hijab') { c.fillStyle = '#f5b301'; circle(c, -10.3, -15.5, 1.6); c.fill(); circle(c, 10.3, -15.5, 1.6); c.fill(); }
    // hair
    c.fillStyle = p.hairColor || '#141414';
    const hairCap = (h) => { c.beginPath(); c.arc(0, -21, h, Math.PI * 1.02, Math.PI * 1.98); c.closePath(); c.fill(); };
    if (p.hair === 'hijab') {
      c.fillStyle = fillOf(c, p.hijab || '#2f6b5e');
      c.beginPath(); c.arc(0, -22, 13, Math.PI * 0.92, Math.PI * 2.08); c.lineTo(13, -6); c.quadraticCurveTo(0, -1, -13, -6); c.closePath(); c.fill();
      c.fillStyle = p.skin;
      c.beginPath(); c.ellipse(0, -18.5, 8.6, 9.6, 0, 0, TAU); c.fill();
      c.strokeStyle = 'rgba(255,255,255,.18)'; c.lineWidth = 1;
      c.beginPath(); c.arc(0, -19, 10.6, Math.PI * 1.1, Math.PI * 1.9); c.stroke();
    } else if (p.hair === 'bald') {
      c.fillStyle = 'rgba(255,255,255,.22)'; c.beginPath(); c.ellipse(-3.5, -27, 3.4, 1.6, -0.4, 0, TAU); c.fill();
    } else if (p.hair === 'afro' && !p.cap) {
      circle(c, 0, -26, 14.5); c.fill();
      c.fillStyle = p.skin; c.beginPath(); c.ellipse(0, -18, 9.6, 8.6, 0, 0, TAU); c.fill();
    } else if (p.hair === 'locs') {
      hairCap(11.2);
      c.strokeStyle = p.hairColor || '#1c140d'; c.lineWidth = 2.6; c.lineCap = 'round';
      c.beginPath();
      for (const lx of [-10.5, -8.5, 8.5, 10.5]) { c.moveTo(lx, -24); c.lineTo(lx * 1.06, -9 + Math.abs(lx) * 0.2); }
      c.stroke();
      c.strokeStyle = '#f5b301'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-11.5, -12); c.lineTo(-9.5, -12); c.moveTo(9.5, -11); c.lineTo(11.5, -11); c.stroke();
    } else if (p.hair === 'braids') {
      hairCap(11);
      c.strokeStyle = 'rgba(255,255,255,.18)'; c.lineWidth = 0.8;
      c.beginPath(); for (const bx of [-6, -2, 2, 6]) { c.moveTo(bx, -30.5); c.lineTo(bx * 1.2, -22.5); } c.stroke();
      c.fillStyle = p.hairColor || '#141414';
      for (const sd of [-1, 1]) for (let k = 0; k < 4; k++) { circle(c, sd * 11.2, -20 + k * 3.4, 1.9); c.fill(); }
    } else if (p.hair === 'fade') {
      hairCap(10.8);
      c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(-6, -30, 4, 1.2);
      c.fillStyle = 'rgba(141,85,36,.45)'; c.beginPath(); c.arc(0, -21, 10.8, Math.PI * 1.02, Math.PI * 1.1); c.lineTo(-9, -21); c.fill();
    } else if (p.hair === 'puff' && !p.cap) {
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
    } else if (p.cap === 'hardhat') {
      c.fillStyle = p.capColor || '#facc15';
      c.beginPath(); c.arc(0, -25, 11.5, Math.PI, 0); c.fill();
      rr(c, -14, -26, 28, 4, 2); c.fill();
      c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(-1.2, -36, 2.4, 10);
    } else if (p.cap === 'okpu') {
      c.fillStyle = p.capColor || '#c8102e';
      rr(c, -9.5, -37, 19, 11, 2); c.fill();
      c.fillStyle = '#141414'; c.fillRect(-9.5, -33, 19, 1.6); c.fillRect(-9.5, -29.5, 19, 1.6);
    } else if (p.cap === 'hula') {
      c.fillStyle = '#f8f5ee';
      c.beginPath(); c.arc(0, -26, 10.8, Math.PI, 0); c.closePath(); c.fill();
      c.fillStyle = '#2f8f5b';
      for (let k = -2; k <= 2; k++) { circle(c, k * 3.8, -30 + Math.abs(k) * 1.2, 1.1); c.fill(); }
      c.fillRect(-10.5, -27, 21, 1.4);
    } else if (p.cap === 'santa') {
      c.fillStyle = '#c62828';
      c.beginPath(); c.moveTo(-11, -27); c.quadraticCurveTo(0, -46, 12, -38); c.lineTo(10, -27); c.closePath(); c.fill();
      c.fillStyle = '#ffffff'; rr(c, -12, -29, 24, 4.5, 2.2); c.fill(); circle(c, 12.5, -38, 3); c.fill();
    } else if (p.cap === 'gele') {
      c.fillStyle = fillOf(c, p.capColor || '#e0457b');
      c.beginPath(); c.ellipse(0, -28, 13.5, 6.5, 0, Math.PI, 0); c.fill();
      for (let i = -2; i <= 2; i++) {
        c.beginPath(); c.ellipse(i * 4.5, -36 - (2 - Math.abs(i)) * 1.5, 4.2, 7.5, i * 0.35, 0, TAU); c.fill();
      }
      c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 1;
      c.beginPath(); c.moveTo(-12, -27); c.quadraticCurveTo(0, -31, 12, -27); c.stroke();
    }
    if (p.headphones) {
      c.strokeStyle = '#111827'; c.lineWidth = 2.4;
      c.beginPath(); c.arc(0, -21, 12.4, Math.PI * 1.05, Math.PI * 1.95); c.stroke();
      c.fillStyle = '#111827'; rr(c, -14.5, -23.5, 5, 9, 2.2); c.fill(); rr(c, 9.5, -23.5, 5, 9, 2.2); c.fill();
      c.fillStyle = '#19c37d'; c.fillRect(-13.6, -20.5, 3.2, 2.6); c.fillRect(10.4, -20.5, 3.2, 2.6);
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
    if (p.shades && p.mood !== 'cool') {
      c.fillStyle = '#0f172a';
      rr(c, -8.2, -21.8, 7.4, 4.6, 1.8); c.fill(); rr(c, 0.8, -21.8, 7.4, 4.6, 1.8); c.fill();
      c.fillRect(-1, -20.6, 2, 1.2);
      c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(-7, -21, 2.2, 1); c.fillRect(2, -21, 2.2, 1);
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

  function playerParams(charId, outfitId, extra, look) {
    const ch = CHARACTERS[charId] || CHARACTERS.emeka;
    const of = (OUTFITS.find((o) => o.id === outfitId) || OUTFITS[0]).p;
    const L = look || S.look;
    const p = Object.assign({ skin: ch.skin, hair: ch.hair, earrings: ch.earrings, lashes: charId === 'ada' }, of, extra || {});
    if (p.cap === 'gele' && charId !== 'ada') p.cap = 'fila';
    if (L) {
      if (L.skin && SKIN_TONES.includes(L.skin)) p.skin = L.skin;
      if (L.hair) p.hair = L.hair;
      if (L.eyes === 'glasses') p.glasses = true;
      if (L.eyes === 'shades') p.shades = true;
      if (L.head === 'headphones') p.headphones = true;
      if (L.head === 'facecap') { p.cap = 'peak'; p.capColor = '#008751'; }
      if (L.back === 'backpack') p.backpack = true;
      if (L.hand === 'coffeecup') p.coffeecup = true;
      if (L.hand === 'phone') p.phone = true;
      if (L.neck === 'goldtag') { p.badge = '#f5b301'; p.badgeCard = '#f5d061'; }
      if (p.hair === 'hijab') { p.cap = ''; p.hijab = typeof of.shirt === 'string' && of.shirt.startsWith('pattern:') ? of.shirt : '#2f6b5e'; }
      if (p.hair === 'bald' && p.cap === 'gele') p.cap = 'fila';
    }
    return p;
  }

  const SPRITES = {
    player(c, tm, o = {}) {
      drawPerson(c, playerParams(o.char || S.char, o.outfit || S.outfit, {
        walk: o.walk !== undefined ? o.walk : tm * 10, mood: o.mood || 'happy', lookX: o.lookX, lookY: o.lookY, s: o.s || 1,
      }, o.look));
    },
    boss(c, tm, o = {}) {
      const off = o.office || (typeof curOffice === 'function' ? curOffice() : null);
      const b = off ? off.boss : { shirt: '#2b3245', tie: '#d62f3a', pants: '#1b2131', suit: true };
      drawPerson(c, Object.assign({ skin: '#6b3f1f', hair: 'low', sleeve: b.sleeve || b.robe || b.shirt, phone: !b.laptop,
        walk: tm * 9, mood: 'angry', lookX: o.lookX, lookY: o.lookY, s: o.s || 1.28 }, b));
    },
    convoy(c, tm, o = {}) {
      const d = o.dir || 1;
      c.save(); c.scale(d, 1);
      c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(0, 14, 30, 6, 0, 0, TAU); c.fill();
      c.fillStyle = '#0b0f19'; rr(c, -30, -12, 60, 24, 6); c.fill();
      c.fillStyle = '#1f2937'; rr(c, -14, -10, 30, 20, 4); c.fill();
      c.fillStyle = '#64748b'; rr(c, -10, -8, 9, 16, 2); c.fill(); rr(c, 3, -8, 10, 16, 2); c.fill();
      const blink = Math.floor(tm * 8) % 2;
      c.fillStyle = blink ? '#ef4444' : '#3b82f6'; rr(c, -4, -14, 4, 4, 1); c.fill();
      c.fillStyle = blink ? '#3b82f6' : '#ef4444'; rr(c, 1, -14, 4, 4, 1); c.fill();
      c.fillStyle = '#fde68a'; c.fillRect(27, -10, 3, 5); c.fillRect(27, 5, 3, 5);
      c.fillStyle = '#008751'; c.fillRect(-28, -3, 6, 6); c.fillStyle = '#fff'; c.fillRect(-26, -3, 2, 6);
      c.restore();
    },
    queue(c, tm) {
      c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(0, 10, 56, 8, 0, 0, TAU); c.fill();
      c.strokeStyle = '#c9a227'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(-54, -2); c.quadraticCurveTo(0, 6, 54, -2); c.stroke();
      c.fillStyle = '#c9a227'; for (const x of [-54, 54]) { c.fillRect(x - 2, -10, 4, 18); circle(c, x, -11, 3); c.fill(); }
      const cols = ['#e5484d', '#3b82f6', '#22c55e', '#f59e0b'];
      for (let i = 0; i < 4; i++) {
        c.save(); c.translate(-33 + i * 22, -4 + Math.sin(tm * 3 + i) * 1.2); c.scale(0.55, 0.55);
        drawPerson(c, { shirt: cols[i], pants: '#1f2937', skin: ['#8d5524', '#5c3519', '#7a4521', '#a0663a'][i], hair: i % 2 ? 'puff' : 'low', mood: 'worried', walk: 0, lookX: i % 2 ? 1 : -1 });
        c.restore();
      }
      c.fillStyle = '#111827'; rr(c, -24, -30, 48, 12, 6); c.fill();
      c.fillStyle = '#facc15'; c.font = '900 7px system-ui, Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('ATM QUEUE', 0, -23.5);
    },
    hardhat(c) {
      c.fillStyle = '#facc15'; c.beginPath(); c.arc(0, 2, 12, Math.PI, 0); c.fill();
      c.fillStyle = '#eab308'; rr(c, -16, 1, 32, 5, 2.5); c.fill();
      c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.arc(-3, -3, 6, Math.PI * 1.1, Math.PI * 1.5); c.lineTo(-3, -3); c.fill();
      c.fillStyle = '#a16207'; c.fillRect(-1.5, -9, 3, 10);
    },
    standup(c, tm) {
      c.strokeStyle = 'rgba(167,139,250,.55)'; c.lineWidth = 2; c.setLineDash([5, 5]); circle(c, 0, 0, 34); c.stroke(); c.setLineDash([]);
      for (let i = 0; i < 5; i++) {
        const a = (i * TAU) / 5 + tm * 0.3;
        c.save(); c.translate(Math.cos(a) * 24, Math.sin(a) * 20); c.scale(0.5, 0.5);
        drawPerson(c, { shirt: ['#7c3aed', '#0ea5e9', '#f43f5e', '#10b981', '#f59e0b'][i], pants: '#1f2937', skin: ['#8d5524', '#5c3519', '#7a4521', '#a0663a', '#6b3f1f'][i], hair: i % 2 ? 'low' : 'puff', mood: 'happy', walk: 0, lookX: -Math.cos(a), lookY: -Math.sin(a), laptop: i === 0 });
        c.restore();
      }
      c.fillStyle = '#7c3aed'; rr(c, -26, -46, 52, 12, 6); c.fill();
      c.fillStyle = '#fff'; c.font = '900 7px system-ui, Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('STANDUP', 0, -39.5);
    },
    agenda(c, tm) {
      c.fillStyle = '#fffef8'; rr(c, -8, -10, 16, 20, 1.5); c.fill();
      c.strokeStyle = 'rgba(0,0,0,.15)'; c.lineWidth = 0.8; c.stroke();
      c.fillStyle = '#e5484d'; c.fillRect(-6, -8, 12, 3);
      c.fillStyle = '#9aa3b5'; for (let i = 0; i < 4; i++) c.fillRect(-6, -3 + i * 3.2, 12 - (i % 2) * 4, 1.4);
    },
    sticker(c, tm) {
      const pulse = (Math.sin(tm * 6) + 1) / 2;
      c.fillStyle = `rgba(232,121,249,${0.25 + pulse * 0.25})`; circle(c, 0, 0, 18 + pulse * 3); c.fill();
      c.fillStyle = '#fdf4ff'; rr(c, -11, -8, 22, 16, 2); c.fill();
      c.strokeStyle = '#c026d3'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(-11, -8); c.lineTo(0, 1); c.lineTo(11, -8); c.stroke();
      c.fillStyle = '#facc15'; for (const [x, y] of [[-14, -12], [13, -11], [12, 10]]) { c.beginPath(); c.moveTo(x, y - 3); c.lineTo(x + 1, y); c.lineTo(x, y + 3); c.lineTo(x - 1, y); c.closePath(); c.fill(); }
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
    cake(c, tm) {
      c.fillStyle = '#f8e1c4'; rr(c, -16, -4, 32, 16, 3); c.fill();
      c.fillStyle = '#ff8fb1'; rr(c, -16, -8, 32, 7, 3); c.fill();
      c.fillStyle = '#ffffff'; for (let i = 0; i < 5; i++) { circle(c, -12 + i * 6, -3, 1.6); c.fill(); }
      c.fillStyle = '#6b4fd8'; c.fillRect(-1.2, -17, 2.4, 9);
      c.fillStyle = Math.sin(tm * 14) > 0 ? '#ffd34d' : '#ff9a3c'; c.beginPath(); c.ellipse(0, -19, 2.2, 3.4, 0, 0, TAU); c.fill();
      c.fillStyle = '#7a5200'; c.font = '900 6px system-ui, Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('HBD', 0, 5);
    },
    gift(c, tm) {
      c.save(); c.rotate(Math.sin(tm * 3) * 0.1);
      c.fillStyle = '#e5484d'; rr(c, -14, -10, 28, 24, 3); c.fill();
      c.fillStyle = '#f5d061'; c.fillRect(-2.5, -10, 5, 24); c.fillRect(-14, -1, 28, 5);
      c.beginPath(); c.ellipse(-5, -13, 5, 3.2, -0.5, 0, TAU); c.ellipse(5, -13, 5, 3.2, 0.5, 0, TAU); c.fill();
      c.restore();
    },
    rose(c, tm) {
      c.save(); c.rotate(Math.sin(tm * 2.5) * 0.15);
      c.strokeStyle = '#2f8f5b'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(0, -2); c.lineTo(0, 16); c.stroke();
      c.fillStyle = '#2f8f5b'; c.beginPath(); c.ellipse(4, 8, 4, 2, -0.6, 0, TAU); c.fill();
      c.fillStyle = '#e11d48'; circle(c, 0, -8, 8); c.fill();
      c.strokeStyle = '#9f1239'; c.lineWidth = 1.2; c.beginPath(); c.arc(0, -8, 4, 0, Math.PI * 1.4); c.stroke();
      c.restore();
    },
    dancer(c, tm) {
      c.save(); c.rotate(Math.sin(tm * 8) * 0.12);
      drawPerson(c, { shirt: 'pattern:aso', sleeve: 'pattern:aso', pants: 'pattern:aso', skin: '#7a4521', hair: 'low', cap: 'gele', capColor: 'pattern:aso', earrings: true, lashes: true, mood: 'happy', walk: tm * 14, s: 1 });
      c.restore();
      c.fillStyle = '#ffd34d'; c.font = '900 12px system-ui, Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('♪', 18 + Math.sin(tm * 6) * 3, -38); c.fillText('♫', -18, -30 + Math.cos(tm * 5) * 3);
    },
    rosey(c, tm) {
      drawPerson(c, { shirt: '#e11d48', sleeve: '#e11d48', pants: '#1f2937', skin: '#5c3519', hair: 'low', mood: 'happy', walk: tm * 9, s: 1 });
      c.fillStyle = '#e11d48'; for (const [rx, ry] of [[-17, -2], [-14, -7], [-20, -6]]) { circle(c, rx, ry, 3.4); c.fill(); }
      c.fillStyle = '#ff5d8f'; c.font = '900 12px system-ui, Arial, sans-serif'; c.textAlign = 'center'; c.fillText('♥', 16, -36 + Math.sin(tm * 5) * 2);
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
      offices: $('screen-offices'), register: $('screen-register'), desk: $('screen-desk'), season: $('screen-season'), states: $('screen-states'),
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
    G.league = G.mode === 'league' ? LG.run : null;
    const LR = G.league ? G.league.rules : null;
    rng = G.mode === 'daily' ? mulberry32(strHash('office-wahala:' + G.dailyKey))
      : G.league && G.league.seed ? mulberry32(strHash('league:' + G.league.seed)) : Math.random;
    G.limit = LR && LR.shiftSecs ? LR.shiftSecs : 0;
    G.rec = G.league && G.league.seed ? { path: [], acc: 0 } : null;
    G.ghost = null;
    G.timeUp = false;
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
    G.upg = G.mode === 'daily' || (LR && !LR.upgrades) ? {} : S.upg;
    G.lives = CONFIG.START_LIVES + (G.upg.life ? 1 : 0);
    G.phase = (LR ? LR.commute : S.commute) ? 'commute' : 'office';
    G.commute = { t: 0, late: 0, dur: DIFFICULTY.commuteSeconds };
    if (G.phase === 'commute') G.spawnT = 1.0;
    G.event = null; G.lastEvent = null;
    G.eventT = rand(DIFFICULTY.eventEvery[0], DIFFICULTY.eventEvery[1]) * 0.7;
    G.task = null;
    G.taskT = G.mode === 'career' && careerDay().type === 'tasks' ? 6 : rand(DIFFICULTY.taskEvery[0], DIFFICULTY.taskEvery[1]) * 0.7;
    G.held = null; G.calm = 0; G.frozen = 0; G.fade = 0; G.alertT = 0; G.revived = false; G.trailT = 0;
    G.office = G.mode === 'daily' || G.mode === 'league' ? OFFICES[0] : officeById(S.office);
    G.hazT = 8; G.gust = null; G.gustT = 14; G.mission = null; G.missionT = 14; G.meet = null; G.met5 = false; G.stateNote = '';
    G.event2 = null; G.zones = []; G.dim = 0; G.bonusRain = 0; G.idleT = 0; G.stackTried = false;
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
      if (G.state === 'menu' || G.state === 'over') { e.preventDefault(); if (G.state === 'over') replay(); else startGame('normal'); }
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
    const ev = activeEvents().map((e) => e.id).join('+');
    if (force || c.ev !== ev) {
      ui.event.hidden = !ev;
      if (ev) ui.event.firstElementChild.textContent = ev.split('+').map((id) => t('ev_' + id)).join(' + ');
      c.ev = ev;
    }
    if (ev) ui.event.lastElementChild.style.width = clamp((G.event.t / G.event.dur) * 100, 0, 100).toFixed(1) + '%';
    // v7: mini-mission / 5pm meeting chip
    const M = G.mission;
    let mtxt = '';
    if (G.meet) mtxt = t('meetChip')(Math.ceil(Math.max(0, G.meet.t)));
    else if (M) mtxt = M.text + (M.id === 'nohit' ? ' · ' + Math.ceil(Math.max(0, M.t)) + 's' : ' · ' + Math.min(M.have, M.need) + '/' + M.need + ' · ' + Math.ceil(Math.max(0, M.t)) + 's');
    if (force || c.mission !== mtxt) {
      const el = $('hud-mission');
      el.hidden = !mtxt;
      el.innerHTML = mtxt ? ico(G.meet ? 'mission' : M.ico) + ' ' : '';
      if (mtxt) el.appendChild(document.createTextNode(mtxt));
      el.classList.toggle('is-urgent', !!G.meet || (!!M && M.t < 5 && M.id !== 'nohit'));
      c.mission = mtxt;
    }
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
    const lgt = G.league ? G.league.name + (G.limit ? ' · ' + fmtTime(Math.max(0, Math.ceil(G.limit - G.time))) : '') : '';
    if (force || c.lg !== lgt) {
      const el = $('hud-league');
      el.hidden = !lgt;
      if (lgt) { el.innerHTML = ico('leagues'); el.append(lgt); el.classList.toggle('is-low', !!G.limit && G.limit - G.time <= 10); }
      c.lg = lgt;
    }
    const canSkip = G.phase === 'commute' && G.mode !== 'league' && store.get('ow_commuted', '0') === '1';
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
    newRound(mode === 'daily' || mode === 'career' || (mode === 'league' && LG.run) ? mode : 'normal');
    if (G.upg === S.upg && S.upg.pocket > 0) { G.held = 'autoreply'; S.upg.pocket--; saveS.upg(); }
    $('btn-restart').hidden = G.mode === 'league';
    if (Voice) Voice.lang = S.lang;
    keys.clear();
    drag.active = false;
    clearOverlays();
    G.state = 'playing';
    showScreen(null);
    updateHud(true);
    Sound.wake();
    Sound.play('start');
    if (Music) { if (Music.next) Music.next(); if (Music.playSong && G.office && G.office.id !== 'agency' && Math.random() < 0.6) Music.playSong(G.office.song); Music.mode = 'game'; Music.setLevel(1); }
    if (Music && Sound.musicOn) { Music.muffle(false); Music.start('game'); Music.setMode('game'); }
    const coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    G.startedAt = performance.now();
    ADS.seen = new Set(); ADS.views = 0;
    T('game_start', { mode: G.mode, commute: G.phase === 'commute', held: G.held || '', office: G.office ? G.office.id : 'agency' });
    if (G.phase === 'commute') { toast(t('commuteStart'), 'info', 2600); say('commute'); }
    else if (G.mode === 'career') toast(t('days')[S.career.day] + ': ' + t('goalText')(careerDay().type, goalTarget()), 'info', 2800);
    else if (G.mode === 'league') toast(t('lgStartToast')(G.league.name, G.limit), 'info', 2800);
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
    syncNowPlaying();
  }
  function syncNowPlaying() {
    const np = $('now-playing');
    np.hidden = !(Music && Sound.musicOn && Music.songName);
    if (!np.hidden) $('np-name').textContent = Music.songName;
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
    showScreen('menu');
    refreshMenu();
    if (Music && Sound.musicOn) { Music.muffle(false); Music.start('menu'); Music.setMode('menu'); }
  }

  function openSide(name) {
    G.state = name;
    T('screen', { name });
    if (name === 'wardrobe') renderWardrobe();
    if (name === 'settings') syncSettingsUi();
    if (name === 'review') prepareReview();
    if (name === 'shop') renderShop();
    if (name === 'leagues') { renderLeagueHome(); leagueStatus(''); collectGifts(); $('desk-view').hidden = true; }
    if (name === 'offices') renderOffices();
    if (name === 'register') renderRegister();
    if (name === 'desk') renderDesk();
    if (name === 'season') renderSeason();
    if (name === 'states') renderStates();
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
    const offBefore = unlockedIds();
    stats.earned += pay; stats.totalScore += score;
    if (G.time >= 60) stats.longShifts++;
    if (G.mode === 'league') stats.leagueShifts++;
    weeklyShiftDone();
    T('game_over', { mode: G.mode, score, secs: Math.floor(G.time), real: Math.round((performance.now() - (G.startedAt || performance.now())) / 1000),
      level: G.level, cause: G.success ? 'goal' : (G.lastHit || 'unknown'), items: G.collected, streak: G.maxStreak, near: G.nearMisses,
      late: G.commute ? G.commute.late : 0, pay, success: !!G.success });
    if (G.mode === 'career') T('career_day', { day: careerWon ? (S.career.day + 4) % 5 : S.career.day, week: careerWon && S.career.day === 0 ? S.career.week - 1 : S.career.week, success: careerWon });
    $('btn-again').hidden = false;
    if (G.mode === 'league') submitLeagueRun({ score, duration: Math.max(1, Math.floor(G.time)), level: G.level });
    else $('over-league').hidden = true;
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
    G.stampText = G.timeUp ? t('lgTimeUpStamp') : beatOld ? t('newBestStamp') : prevBest === 0 ? t('firstShift') : t('shiftOver');
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
        if (b.tier) sp.firstChild.style.background = tierColor(b.tier);
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
    afterShiftV7({ score, duration: Math.max(1, Math.floor(G.time)), level: G.level });
    checkBadges(false); saveProgress();
    renderNudges(score);
    const newOffices = officeNewlyUnlocked(offBefore);
    if (newOffices.length) setTimeout(() => { toast(t('officeUnlocked')(newOffices[0].name, newOffices[0].city), 'good', 4200, 'office'); confetti(60); }, G.promoPending ? 4200 : 1600);
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
    else if (evIs('netdown') && rng() < 0.4) type = 'network';
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
    const o = { type: 'boss', boss: true, side, phase: 'warn', warn: 1.6, t: 0, r: 22, hr: 19, minD: Infinity, vx: 0, vy: 0, talkT: 0, talk: bossTalkLine() };
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
      .filter(([k, d]) => !d.event && (!d.unlock || G.level >= d.unlock || (k === 'friday' && fri)))
      .map(([k, d]) => [k, (k === 'friday' && G.friday ? d.weight * (fri ? 6 : 2) : d.weight) * (evIs('salary') && money(k) ? 3 : 1)
        * (evIs('owambe') && k === 'lunch' ? 3 : 1) * (evIs('netdown') && k === 'data' ? 0.3 : 1)]);
    let type = force || weighted(options);
    if (!force && G.mode !== 'league' && G.mode !== 'daily' && Math.random() < 0.022) type = 'sticker';
    if (!force && G.mission && G.mission.item && G.mode !== 'league' && G.mode !== 'daily' && Math.random() < 0.35) type = G.mission.item;
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
  /* ---------- Weekly challenges (same three for everyone, new every Monday) ---------- */
  const WEEKLY_POOL = [
    { id: 'oga', per: 'shift', ico: 'running', goals: [3, 4, 5], text: (n) => `Outrun Oga ${n} times in one shift`, val: () => G.run.escapes },
    { id: 'score', per: 'shift', ico: 'trophy', goals: [2500, 4000, 6000], text: (n) => `Score ${fmtNum(n)} in one shift`, val: () => Math.floor(G.scoreF) },
    { id: 'level', per: 'shift', ico: 'moon', goals: [6, 8, 10], text: (n) => `Reach level ${n} in one shift`, val: () => G.level },
    { id: 'lunch', per: 'week', ico: 'rice', stat: 'lunch', goals: [40, 80, 120], text: (n) => `Collect ${n} lunch packs` },
    { id: 'dailies', per: 'week', ico: 'calendar', stat: 'dailies', goals: [2, 3, 4], text: (n) => `Finish ${n} daily shifts` },
    { id: 'tasks', per: 'week', ico: 'chart', stat: 'tasks', goals: [5, 10, 15], text: (n) => `Submit ${n} reports` },
    { id: 'ontime', per: 'week', ico: 'bus', stat: 'ontime', goals: [3, 5, 8], text: (n) => `Arrive on time ${n} times` },
    { id: 'nepa', per: 'week', ico: 'bulb', stat: 'blackouts', goals: [2, 3, 5], text: (n) => `Survive ${n} blackouts without a hit` },
    { id: 'league', per: 'week', ico: 'leagues', stat: 'leagueShifts', goals: [2, 4, 6], text: (n) => `Play ${n} league shifts` },
    { id: 'near', per: 'week', ico: 'sweat', stat: 'near', goals: [40, 80, 120], text: (n) => `Get ${n} close calls` },
    { id: 'events', per: 'week', ico: 'masks', stat: 'events', goals: [5, 10, 15], text: (n) => `Survive ${n} shift events` },
  ];
  const WEEKLY_REWARD = [800, 1500, 2500], WEEKLY_BONUS = 2000;
  function weeklySet(wk) {
    const r = mulberry32(strHash('weekly:' + wk));
    const shiftOnes = WEEKLY_POOL.filter((x) => x.per === 'shift'), weekOnes = WEEKLY_POOL.filter((x) => x.per === 'week');
    const pick = (arr) => arr.splice((r() * arr.length) | 0, 1)[0];
    const a = [pick(shiftOnes.slice()), pick(weekOnes), pick(weekOnes)];
    return a.map((x, i) => ({ ...x, goal: x.goals[i], reward: WEEKLY_REWARD[i] }));
  }
  let WK = null;
  function weeklyState() {
    const wk = weekKeyLocal();
    if (!WK || WK.week !== wk) {
      const saved = store.json('ow_weekly', null);
      if (saved && saved.week === wk) WK = saved;
      else {
        WK = { week: wk, base: {}, best: {}, done: [], bonus: false };
        for (const x of WEEKLY_POOL) if (x.stat) WK.base[x.stat] = stats[x.stat] || 0;
        store.set('ow_weekly', JSON.stringify(WK));
      }
    }
    return WK;
  }
  function weeklyList() {
    const st = weeklyState();
    return weeklySet(st.week).map((c) => {
      const cur = c.per === 'week' ? Math.max(0, (stats[c.stat] || 0) - (st.base[c.stat] || 0)) : st.best[c.id] || 0;
      return { ...c, cur: Math.min(cur, c.goal), done: st.done.includes(c.id) };
    });
  }
  function weeklyShiftDone() {
    const st = weeklyState();
    for (const c of weeklySet(st.week)) if (c.per === 'shift') st.best[c.id] = Math.max(st.best[c.id] || 0, c.val());
    store.set('ow_weekly', JSON.stringify(st));
  }
  function checkWeekly(live) {
    const st = weeklyState();
    let msg = '';
    for (const c of weeklyList()) {
      if (c.done || c.cur < c.goal) continue;
      st.done.push(c.id);
      S.wallet += c.reward; stats.weeklies++;
      msg = t('weeklyDone')(c.text(c.goal), fmtNum(c.reward));
      T('badge', { id: 'weekly_' + c.id, tier: 0 });
    }
    if (!st.bonus && st.done.length >= 3) { st.bonus = true; S.wallet += WEEKLY_BONUS; msg = t('weeklyAll')(fmtNum(WEEKLY_BONUS)); }
    if (msg) {
      saveS.wallet(); store.set('ow_weekly', JSON.stringify(st));
      if (live) setTimeout(() => { if (G.state === 'playing' || G.state === 'over') toast(msg, 'good', 3200, 'calendar'); }, 1200);
      else if (G.newBadges) G.newBadges.push({ id: 'weekly', ico: 'calendar', name: msg, tier: 0 });
    }
  }
  const weekDaysLeft = () => { const d = new Date(Date.now() + 3600e3); return 7 - ((d.getUTCDay() + 6) % 7); };

  function checkBadges(live) {
    let changed = false, best = null, cash = 0;
    stats.owned = S.owned.size;
    for (const b of BADGES) {
      let lv = blevels[b.id] || 0;
      const have = stats[b.stat] || 0;
      while (have >= tierGoal(b, lv)) {
        cash += tierReward(lv);
        lv++;
        const nb = { id: b.id, ico: b.ico, name: b.name + ' · ' + tierName(lv), tier: lv };
        if (G.newBadges) G.newBadges.push(nb);
        T('badge', { id: b.id, tier: lv });
        best = nb;
        changed = true;
      }
      if (lv !== (blevels[b.id] || 0)) { blevels[b.id] = lv; unlocked.add(b.id); }
    }
    if (cash) { S.wallet += cash; saveS.wallet(); }
    if (live && best) {
      toast(t('badge') + best.name + (cash ? ' (+₦' + fmtNum(cash) + ')' : ''), 'badge', 2800, best.ico);
      Sound.play('badge');
    }
    if (!stats.goldSet && GOLD_SET.every((id) => (blevels[id] || 0) >= 3)) {
      stats.goldSet = 1; S.wallet += 5000; saveS.wallet(); changed = true;
      T('badge', { id: 'goldset', tier: 1 });
      setTimeout(() => { toast(t('goldSet'), 'badge', 4000, 'crown'); confetti(60); }, live ? 3000 : 400);
    }
    checkWeekly(live);
    if (changed) { saveProgress(); if (G.state === 'menu') refreshMenu(); }
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
  const ogaLabel = () => (S.ogaName ? 'OGA ' + S.ogaName.toUpperCase() : (G.office || officeById(S.office || 'agency')).boss.title);

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
  function spawnFuelQueue() {
    const lanes = laneXs(), lx = lanes[(rng() * lanes.length) | 0];
    for (let q = 0; q < 4; q++) G.obstacles.push({ type: 'danfo', queue: true, commute: true, t: 0, rot: 0, vr: 0, minD: Infinity, warn: 0, phase: 'move', life: 0, w: 56, h: 92, x: lx, y: -70 - q * 100, vx: 0, vy: ROAD_SPEED });
    banner(t('fuelQueue'), true); toast(t('fuelQueue_d'), 'info', 2400);
    T('event_start', { id: 'fuelqueue', level: 0 });
  }
  function hitCommute(o) {
    const p = G.player;
    const lateStep = [10, 7, 5][Math.min(2, (G.upg && G.upg.danfo) || 0)];
    G.commute.late += lateStep;
    p.invuln = 1.1;
    G.shake = 9; G.flash = 0.15;
    o.hitDone = true;
    toast(String(t('commuteHit')[o.type] || '+10 mins late').replace('+10', '+' + lateStep), 'bad', 1700);
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
    G.obstacles = []; G.zones = [];
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
    if (!c.queueDone && c.t > 4) {
      c.queueDone = true;
      if (rng() < 0.4) spawnFuelQueue();
    }
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

  /* ---------- Shift events (v6: more, more Nigerian, calendar-aware, stack at high levels) ---------- */
  // w = base weight, from = earliest level. Calendar and season boosts are applied in eventWeight().
  const EVENT_DEFS = {
    salary: { w: 1 }, audit: { w: 1 }, travel: { w: 1 }, agm: { w: 1 }, alert: { w: 1 },
    birthday: { w: 1.1, from: 3 }, flood: { w: 0.5, from: 2 }, mop: { w: 0.9, from: 2 }, hq: { w: 1, from: 3 },
    genfuel: { w: 0.9, from: 4 }, owambe: { w: 0.8, from: 3 }, netdown: { w: 0.9, from: 2 }, alertdelay: { w: 0.8, from: 2 },
    cob: { w: 0.9, from: 4 }, harmattan: { w: 0, from: 2 },
    independence: { w: 0, from: 2 }, detty: { w: 0, from: 2 }, valentine: { w: 0, from: 2 },
  };
  const EVENTS = Object.keys(EVENT_DEFS);
  function lagosNow() { const d = new Date(Date.now() + 3600e3); return { m: d.getUTCMonth() + 1, d: d.getUTCDate(), dow: d.getUTCDay(), last: new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate() }; }
  function eventWeight(id) {
    const n = lagosNow();
    let w = EVENT_DEFS[id].w;
    const rainy = n.m >= 4 && n.m <= 10, dry = n.m === 12 || n.m <= 2, payday = n.d >= n.last - 3 || n.d <= 2;
    if (id === 'flood') w = rainy ? 1.6 : 0.25;
    if (id === 'harmattan') w = dry ? 1.4 : 0;
    if (id === 'owambe' && n.dow === 5) w *= 3;
    if (payday && (id === 'salary' || id === 'alertdelay')) w *= 2.5;
    if (id === 'independence' && n.m === 10 && n.d === 1) w = 6;
    if (id === 'detty' && ((n.m === 12) || (n.m === 1 && n.d <= 2))) w = 2.5;
    if (id === 'valentine' && n.m === 2 && n.d >= 13 && n.d <= 15) w = 4;
    return w;
  }
  const activeEvents = () => [G.event, G.event2].filter(Boolean);
  const evIs = (id) => !!((G.event && G.event.id === id) || (G.event2 && G.event2.id === id));
  function startEvent(force, second) {
    const busy = activeEvents().map((e) => e.id);
    const options = EVENTS.filter((e) => !busy.includes(e) && e !== G.lastEvent && G.level >= (EVENT_DEFS[e].from || 2)
      && !(e === 'travel' && G.mode === 'career' && careerDay().type === 'escapes')
      && !(e === 'genfuel' && G.black) && !(second && (e === 'audit' || e === 'genfuel')))
      .map((e) => [e, eventWeight(e)]).filter(([, w]) => w > 0);
    const id = force || (options.length ? weighted(options) : 'salary');
    const ev = { id, t: DIFFICULTY.eventLength, dur: DIFFICULTY.eventLength, k: 0, n: 0 };
    if (second) G.event2 = ev; else G.event = ev;
    G.lastEvent = id;
    T('event_start', { id, level: G.level, stacked: !!second });
    banner(t('ev_' + id), ['audit', 'agm', 'birthday', 'hq', 'genfuel', 'netdown'].includes(id));
    toast(t('ev_' + id + '_d'), 'info', 2600);
    say('ev_' + id);
    Sound.play('level');
    if (id === 'travel') for (const o of G.obstacles) if (o.boss) leaveBoss(o);
    if (id === 'alert') G.alertT = 0.4;
    if (id === 'genfuel') G.dim = 0;
    if (id === 'cob') G.taskT = Math.min(G.taskT, 0.3);
    if (id === 'independence') confetti(60);
    if (id === 'hq') G.idleT = 0;
  }
  function endEvent(slot) {
    const ev = G[slot];
    G[slot] = null;
    stats.events++; G.badgeCheckT = 0;
    if (ev.id === 'birthday') { spawnItem('cake', true); stats.bdayDodged += Math.max(0, ev.k - ev.n); toast(t('ev_birthday_end'), 'good', 2000); }
    else if (ev.id === 'genfuel') { G.dim = 0; }
    else if (ev.id === 'alertdelay') { G.bonusRain = 3; G.alertT = 0.1; toast(t('ev_alertdelay_end'), 'good', 2200); Sound.play('big'); }
    else if (ev.id === 'netdown') toast(t('ev_netdown_end'), 'good', 1800);
    else toast(t('evOver'), 'info', 1600);
    if (slot === 'event' && G.event2) { G.event = G.event2; G.event2 = null; }
    if (!G.event) {
      const quick = G.level >= 6 ? 0.72 : 1;
      G.eventT = rand(DIFFICULTY.eventEvery[0], DIFFICULTY.eventEvery[1]) * quick;
    }
  }
  function tickEvent(ev, dt) {
    const p = G.player;
    ev.t -= dt;
    switch (ev.id) {
      case 'alert':
        G.alertT -= dt;
        if (G.alertT <= 0) { spawnItem(rng() < 0.05 ? 'friday' : 'salary', true); G.alertT = 0.24; }
        break;
      case 'birthday':
        ev.spawnT = (ev.spawnT ?? 0.6) - dt;
        if (ev.spawnT <= 0 && ev.t > 2) { spawnCollector(); ev.spawnT = rand(2.2, 3.2); ev.k++; }
        break;
      case 'flood': case 'mop':
        ev.spawnT = (ev.spawnT ?? 0.3) - dt;
        if (ev.spawnT <= 0 && ev.t > 1.5) { spawnZone(ev.id === 'flood' ? 'puddle' : 'wet'); ev.spawnT = ev.id === 'flood' ? rand(0.7, 1.1) : rand(1.2, 1.8); }
        break;
      case 'hq': {
        const still = Math.hypot(p.vx, p.vy) < 30;
        G.idleT = still ? (G.idleT || 0) + dt : 0;
        if (G.idleT > 0.9) {
          addScore(-30 * dt);
          ev.warnT = (ev.warnT || 0) - dt;
          if (ev.warnT <= 0) { floater(t('lookBusy'), p.x, p.y - 44, '#ffb38a', 15); ev.warnT = 1.2; }
        }
        break;
      }
      case 'genfuel':
        G.dim = Math.min(0.88, (G.dim || 0) + dt * 0.11);
        ev.spawnT = (ev.spawnT ?? 4.5) - dt;
        if (ev.spawnT <= 0 && !G.items.some((i) => i.type === 'fuel')) { spawnItem('fuel'); ev.spawnT = 4; }
        break;
      case 'owambe':
        ev.spawnT = (ev.spawnT ?? 0.5) - dt;
        if (ev.spawnT <= 0 && ev.t > 2) { spawnDancer('dancer'); ev.spawnT = rand(1.6, 2.4); }
        break;
      case 'valentine':
        ev.spawnT = (ev.spawnT ?? 0.8) - dt;
        if (ev.spawnT <= 0 && ev.t > 2) { if (rng() < 0.45) spawnDancer('rosey'); else spawnItem('rose', false); ev.spawnT = rand(0.9, 1.4); }
        break;
      case 'detty':
        ev.spawnT = (ev.spawnT ?? 0.6) - dt;
        if (ev.spawnT <= 0) { spawnItem('gift', false); ev.spawnT = rand(1.0, 1.5); }
        break;
      case 'independence':
        ev.spawnT = (ev.spawnT ?? 2) - dt;
        if (ev.spawnT <= 0) { confetti(18); ev.spawnT = 2.5; }
        break;
      case 'cob':
        if (!G.task) G.taskT = Math.min(G.taskT, 0.5);
        break;
      default:
    }
  }
  function updateEvents(dt) {
    if (G.bonusRain > 0) {
      G.bonusRain -= dt; G.alertT -= dt;
      if (G.alertT <= 0) { spawnItem('salary', true); G.alertT = 0.2; }
    }
    if (G.zones.length) updateZones(dt);
    if (G.event) {
      tickEvent(G.event, dt);
      if (G.event2) { tickEvent(G.event2, dt); if (G.event2.t <= 0) endEvent('event2'); }
      if (G.event && G.event.t <= 0) endEvent('event');
      else if (G.event && !G.event2 && G.level >= 10 && !G.stackTried && G.event.t < G.event.dur - 3) {
        G.stackTried = true;
        if (rng() < (G.level >= 14 ? 0.7 : 0.35)) startEvent(null, true);
      }
    } else if (G.level >= DIFFICULTY.eventFromLevel && !G.black) {
      G.eventT -= dt;
      if (G.eventT <= 0) { G.stackTried = false; startEvent(); }
    }
  }

  // birthday contribution collectors: colleagues with an envelope, take points not lives
  function spawnCollector() {
    const fromLeft = rng() < 0.5;
    const sp = rand(120, 150) * levelMult();
    G.obstacles.push({ type: 'colleague', collector: true, t: 0, rot: 0, vr: 0, minD: Infinity, warn: 0.6, phase: 'move', side: fromLeft ? 'L' : 'R',
      r: 17, hr: 14, x: fromLeft ? FX0 - 30 : FX1 + 30, y: rand(minY() - 40, minY() + 120), speed: sp, vx: fromLeft ? sp : -sp, vy: 0, life: 5.5,
      talk: pickF(t('bdayTalk')) });
  }
  // owambe dancers / valentine roses: bump you back, cost points, never lives
  function spawnDancer(kind) {
    const x = FX0 + 40 + rng() * Math.max(10, FX1 - FX0 - 80);
    G.obstacles.push({ type: kind, bump: true, t: 0, rot: 0, vr: 0, minD: Infinity, warn: 0, phase: 'move', r: 18, hr: 15,
      x, baseX: x, y: -40, vx: 0, vy: floorSpeed() * 1.05 + rand(10, 40), phaseOff: rand(0, TAU) });
  }
  // puddles (flood) and wet floor (cleaner mopping)
  function spawnZone(kind) {
    const w = kind === 'puddle' ? rand(60, 95) : rand(80, 120), h = kind === 'puddle' ? rand(28, 40) : rand(46, 60);
    G.zones.push({ kind, x: FX0 + w / 2 + 6 + rng() * Math.max(10, FX1 - FX0 - w - 12), y: -h, w, h, t: 0 });
  }
  function updateZones(dt) {
    const sp = floorSpeed();
    for (let i = G.zones.length - 1; i >= 0; i--) { const z = G.zones[i]; z.t += dt; z.y += sp * dt; if (z.y - z.h > H + 20) G.zones.splice(i, 1); }
  }
  function zoneAt(x, y) {
    for (const z of G.zones) if (Math.abs(x - z.x) < z.w / 2 && Math.abs(y + 16 - z.y) < z.h / 2) return z;
    return null;
  }
  function bumpPlayer(o) {
    const p = G.player;
    const dx = p.x - o.x, dy = p.y - o.y, d = Math.hypot(dx, dy) || 1;
    p.vx = (dx / d) * 420; p.vy = (dy / d) * 420 + 120;
    p.x += (dx / d) * 18; p.y += (dy / d) * 18 + 10;
    p.invuln = 0.7; G.streak = 0; G.shake = 6;
    addScore(-50);
    floater(o.type === 'rosey' ? t('roseyBump') : t('danceBump'), p.x, p.y - 44, '#ffb3d1', 15);
    Sound.play('near');
    o.hitDone = true;
  }
  function payContribution(o) {
    const p = G.player;
    addScore(-250);
    if (G.event && G.event.id === 'birthday') G.event.n++; else if (G.event2 && G.event2.id === 'birthday') G.event2.n++;
    floater(t('bdayPaid'), p.x, p.y - 44, '#ffb38a', 16);
    toast(t('bdayPaidToast'), 'bad', 1500);
    p.invuln = 0.9; G.shake = 5;
    Sound.play('coin');
    o.hitDone = true; o.life = Math.min(o.life, 0);
  }

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
    if (o.type === 'agenda') {
      o.x += o.vx * dt; o.y += o.vy * dt; o.life -= dt;
      return o.life <= 0 || o.y > H + 40 || o.y < -40 || o.x < FX0 - 40 || o.x > FX1 + 40;
    }
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
      const cob = evIs('cob') ? 3 : 1;
      addScore(300 * cob);
      if (cob > 1) floater('x3', k.x + 30, k.y - 50, '#ffe066', 18);
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
  let SHOPTAB = 'upgrades';
  const ownedKey = (kind, id) => kind + ':' + id;
  const ownsLook = (kind, id) => S.owned.has(ownedKey(kind, id));
  function shopCard(opts) {
    const card = document.createElement('div');
    card.className = 'shop-card' + (opts.cls ? ' ' + opts.cls : '');
    if (opts.preview) {
      const cv = document.createElement('canvas');
      cv.className = 's-preview'; cv.width = 84; cv.height = 96; cv.setAttribute('aria-hidden', 'true');
      card.appendChild(cv);
      requestAnimationFrame(() => drawPortrait(cv, S.char, opts.preview.outfit || S.outfit, false, opts.preview.look || S.look));
    } else {
      const ic = document.createElement('span'); ic.className = 's-ico'; ic.setAttribute('aria-hidden', 'true'); ic.innerHTML = ico(opts.icon || 'gift');
      card.appendChild(ic);
    }
    const nm = document.createElement('span'); nm.className = 's-name'; nm.textContent = opts.name; card.appendChild(nm);
    if (opts.desc) { const d = document.createElement('span'); d.className = 's-desc'; d.textContent = opts.desc; card.appendChild(d); }
    if (opts.level) { const l = document.createElement('span'); l.className = 's-level'; l.textContent = opts.level; card.appendChild(l); }
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn ' + (opts.btnCls || 'btn-gold');
    btn.textContent = opts.btn;
    btn.disabled = !!opts.disabled;
    for (const [k, v] of Object.entries(opts.data || {})) btn.dataset[k] = v;
    card.appendChild(btn);
    return card;
  }
  function sectionTitle(grid, text, icon) {
    const h = document.createElement('h3'); h.className = 'shop-sec';
    h.innerHTML = icon ? ico(icon) : ''; h.append(text);
    grid.appendChild(h);
  }
  function renderShop() {
    $('shop-wallet').textContent = '₦' + fmtNum(S.wallet);
    document.querySelectorAll('.shop-tabs [data-tab]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === SHOPTAB)));
    const grid = $('shop-grid');
    grid.innerHTML = '';
    grid.dataset.tab = SHOPTAB;
    const buyTxt = (p) => 'Buy ₦' + fmtNum(p);
    if (SHOPTAB === 'upgrades') {
      for (const it of SHOP_ITEMS) {
        const lvl = S.upg[it.id] || 0, maxed = lvl >= it.max, price = maxed ? 0 : it.price[lvl];
        grid.appendChild(shopCard({ icon: it.ico, name: it.name, desc: it.desc, cls: maxed ? 'is-max' : '',
          level: it.consumable ? `In pocket: ${lvl}/${it.max}` : `Level ${lvl}/${it.max}`,
          btn: maxed ? (it.consumable ? 'Pocket full' : 'Maxed') : buyTxt(price), btnCls: maxed ? 'btn-ghost' : 'btn-gold',
          disabled: maxed || S.wallet < price, data: { buy: it.id } }));
      }
      return;
    }
    if (SHOPTAB === 'looks') {
      sectionTitle(grid, t('skinTone'), 'palette');
      const sk = document.createElement('div'); sk.className = 'skin-pick span-all'; grid.appendChild(sk); paintSkinPick(sk);
      for (const [slot, label] of LOOK_SLOTS) {
        sectionTitle(grid, label, slot === 'hair' ? 'hair' : slot === 'eyes' ? 'specs' : slot === 'head' ? 'headphones' : slot === 'neck' ? 'id-badge' : slot === 'hand' ? 'coffee' : 'bag');
        if (slot === 'hair') {
          const cur = !S.look.hair;
          grid.appendChild(shopCard({ preview: { look: Object.assign({}, S.look, { hair: '' }) }, name: t('hairDefault'), cls: cur ? 'is-on' : '',
            btn: cur ? t('wearing') : t('wear'), btnCls: cur ? 'btn-ghost' : 'btn-primary', disabled: cur, data: { look: 'hair', id: '' } }));
        }
        for (const L of LOOKS.filter((x) => x.slot === slot)) {
          const own = ownsLook('look', L.id), on = S.look[slot] === L.id;
          grid.appendChild(shopCard({ preview: { look: Object.assign({}, S.look, { [slot]: L.id }) }, name: L.name, cls: on ? 'is-on' : '',
            btn: !own ? buyTxt(L.price) : on ? (slot === 'hair' ? t('wearing') : t('takeOff')) : t('wear'),
            btnCls: !own ? 'btn-gold' : on ? 'btn-ghost' : 'btn-primary', disabled: (!own && S.wallet < L.price) || (own && on && slot === 'hair'),
            data: own ? { look: slot, id: on ? '' : L.id } : { buylook: 'look', id: L.id } }));
        }
      }
      return;
    }
    if (SHOPTAB === 'outfits') {
      for (const o of OUTFITS) {
        const open = outfitUnlocked(o), on = S.outfit === o.id, price = OUTFIT_PRICES[o.id];
        const b = o.unlock ? BADGES.find((x) => x.id === o.unlock) : null;
        grid.appendChild(shopCard({ preview: { outfit: o.id }, name: S.char === 'emeka' && o.nameM ? o.nameM : o.name, cls: on ? 'is-on' : '',
          desc: open ? '' : b ? t('orBadge')(b.name) : '',
          btn: open ? (on ? t('wearing') : t('wear')) : buyTxt(price), btnCls: open ? (on ? 'btn-ghost' : 'btn-primary') : 'btn-gold',
          disabled: open ? on : S.wallet < price, data: open ? { outfit: o.id } : { buyoutfit: o.id } }));
      }
      return;
    }
    if (SHOPTAB === 'desk') {
      const help = document.createElement('p'); help.className = 'setting-help span-all'; help.textContent = t('deskShopHelp'); grid.appendChild(help);
      for (const d of DESK_ITEMS) {
        const own = deskOwned(d);
        if (d.free) {
          grid.appendChild(shopCard({ icon: d.icon || 'desk', name: d.name, desc: own ? t('deskFreeGot') : t('deskFree_' + d.free), cls: own ? 'is-on' : '',
            btn: own ? t('deskOnDesk') : t('locked'), btnCls: 'btn-ghost', disabled: true }));
          continue;
        }
        grid.appendChild(shopCard({ icon: d.icon || 'desk', name: d.name, cls: own ? 'is-on' : '', btn: own ? t('deskOnDesk') : buyTxt(d.price),
          btnCls: own ? 'btn-ghost' : 'btn-gold', disabled: own || S.wallet < d.price, data: own ? {} : { buydesk: d.id } }));
      }
      return;
    }
    // extras
    for (const x of EXTRAS) {
      const own = ownsLook('extra', x.id), on = !!S.look[x.id];
      grid.appendChild(shopCard({ icon: x.ico, name: x.name, desc: x.desc, cls: on ? 'is-on' : '',
        btn: !own ? buyTxt(x.price) : on ? t('turnOff') : t('turnOn'), btnCls: !own ? 'btn-gold' : on ? 'btn-ghost' : 'btn-primary',
        disabled: !own && S.wallet < x.price, data: own ? { extra: x.id } : { buylook: 'extra', id: x.id } }));
    }
    sectionTitle(grid, t('jobTitles'), 'title');
    const help = document.createElement('p'); help.className = 'setting-help span-all'; help.textContent = t('titlesHelp'); grid.appendChild(help);
    for (const ti of TITLES) {
      const own = ownsLook('title', ti.id), on = S.look.title === ti.id;
      grid.appendChild(shopCard({ icon: 'title', name: ti.name, cls: 'is-title' + (on ? ' is-on' : ''),
        btn: !own ? buyTxt(ti.price) : on ? t('takeOff') : t('useTitle'), btnCls: !own ? 'btn-gold' : on ? 'btn-ghost' : 'btn-primary',
        disabled: !own && S.wallet < ti.price, data: own ? { title: on ? '' : ti.id } : { buylook: 'title', id: ti.id } }));
    }
  }
  function paintSkinPick(box) {
    box.innerHTML = '';
    box.setAttribute('role', 'radiogroup');
    const ch = CHARACTERS[S.char] || CHARACTERS.emeka;
    const tones = [['', ch.skin]].concat(SKIN_TONES.filter((x) => x !== ch.skin).map((x) => [x, x]));
    tones.forEach(([v, col], i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'skin-opt'; b.dataset.skin = v;
      b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', String((S.look.skin || '') === v));
      b.setAttribute('aria-label', i === 0 ? t('skinDefault') : t('skinTone') + ' ' + i);
      b.style.background = col;
      box.appendChild(b);
    });
  }
  function setLook(slot, id) {
    S.look[slot] = id;
    saveS.look();
    T('setting', { k: 'look_' + slot, v: id || 'none' });
    afterLookChange();
  }
  function afterLookChange() {
    if (G.state === 'shop') renderShop();
    if (G.state === 'wardrobe') renderWardrobe();
    refreshMenu();
    Sound.play('click');
  }
  function buyLook(kind, id) {
    const item = kind === 'look' ? LOOKS.find((x) => x.id === id) : kind === 'title' ? TITLES.find((x) => x.id === id) : EXTRAS.find((x) => x.id === id);
    if (!item || ownsLook(kind, id)) return;
    if (S.wallet < item.price) { toast(t('cantAfford'), 'info', 2000); return; }
    S.wallet -= item.price; S.owned.add(ownedKey(kind, id));
    saveS.wallet(); saveS.owned();
    stats.buys++; checkBadges(true); saveProgress();
    if (kind === 'look') S.look[item.slot] = id;
    else if (kind === 'title') S.look.title = id;
    else S.look[id] = true;
    saveS.look();
    T('look_buy', { kind, id, price: item.price });
    toast(t('bought') + ' ' + item.name, 'good', 1800);
    afterLookChange();
    Sound.play('coin');
  }
  const myTitle = () => { const ti = TITLES.find((x) => x.id === S.look.title && ownsLook('title', x.id)); return ti ? ti.name : ''; };
  const myFlair = () => ({ gold: !!(S.look.gold && ownsLook('extra', 'gold')), title: myTitle() ? S.look.title : '' });
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
    if (G.state === 'shop') renderShop(); else renderWardrobe();
    refreshMenu();
    toast(t('bought'), 'good', 1800);
    Sound.play('coin');
  }

  /* ---------- Office leagues v2 (Netlify Function) ---------- */
  const LG = { available: false, invite: null, current: null, boards: {}, run: null, pins: {}, confirm: '' };
  function weekKeyLocal(now = Date.now()) {
    const d = new Date(now + 3600 * 1000);
    const day = (d.getUTCDay() + 6) % 7;
    d.setUTCDate(d.getUTCDate() - day + 3);
    const firstThu = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
    const week = 1 + Math.round(((d - firstThu) / 86400000 - 3 + ((firstThu.getUTCDay() + 6) % 7)) / 7);
    return d.getUTCFullYear() + '-W' + String(week).padStart(2, '0');
  }
  function api(path, opts) {
    return fetch(CONFIG.LEAGUE_API + path, Object.assign({ headers: { 'content-type': 'application/json' }, cache: 'no-store' }, opts || {}))
      .then(async (r) => {
        const j = await r.json().catch(() => ({}));
        if (!r.ok) { const e = new Error(j.error || ('Error ' + r.status)); e.status = r.status; throw e; }
        return j;
      });
  }
  const post = (path, body) => api(path, { method: 'POST', body: JSON.stringify(body) });
  function probeLeagues() {
    if (!/^https?:$/.test(location.protocol)) return;
    api('/health').then((j) => {
      if (!j || !j.ok) return;
      LG.available = true;
      $('btn-leagues').hidden = false;
      collectGifts();
      setTimeout(checkRivals, 1500);
      const code = (new URLSearchParams(location.search).get('league') || '').toUpperCase();
      if (/^[A-HJ-NP-Z2-9]{6}$/.test(code) && !S.leagues.some((l) => l.code === code)) {
        api('/' + code).then((b) => { LG.invite = { code, name: b.name }; refreshMenu(); }).catch(() => {});
      }
    }).catch(() => {});
  }
  function leagueStatus(msg, kind) { const el = $('league-status'); el.textContent = msg || ''; el.className = 'lb-status' + (kind ? ' ' + kind : ''); }
  function adminStatus(msg, kind) { const el = $('admin-status'); el.textContent = msg || ''; el.className = 'lb-status' + (kind ? ' ' + kind : ''); }
  function needName() {
    if (S.name) return false;
    const inp = $('league-player');
    saveNameFrom(inp);
    if (S.name) return false;
    renderLeagueHome();
    $('league-name-need').hidden = false;
    leagueStatus(t('leagueNeedName'), 'err');
    inp.focus();
    return true;
  }

  // ----- formatting -----
  function fmtLeft(ms) {
    const m = Math.max(0, Math.round(ms / 60000));
    if (m < 60) return m + 'm';
    const h = Math.floor(m / 60);
    if (h < 48) return h + 'h ' + (m % 60) + 'm';
    return Math.floor(h / 24) + 'd ' + (h % 24) + 'h';
  }
  const fmtWhen = (ts) => new Date(ts).toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
  function roundText(b) {
    const r = b.round, now = Date.now();
    if (!r) return '';
    if (r.status === 'upcoming') return t('lgStarts')(fmtWhen(r.start), fmtLeft(r.start - now));
    if (r.status === 'ended') return t('lgEnded');
    return t('lgOpen')(fmtLeft(r.end - now), b.rules.schedule === 'week');
  }
  function ruleChips(rules) {
    const c = [];
    c.push(rules.schedule === 'week' ? ['daily', t('lgWeekly')] : ['calendar', t('lgTournament')]);
    c.push(['stopwatch', rules.shiftSecs ? t('lgShift')(rules.shiftSecs) : t('lgNoLimit')]);
    c.push(['again', rules.tries ? t('lgTries')(rules.tries) : t('lgTriesAny')]);
    c.push(['trophy', rules.scoring === 'total' ? t('lgTotal') : t('lgBest')]);
    if (rules.sameOffice) c.push(['leagues', t('lgSame')]);
    if (!rules.upgrades) c.push(['lock', t('lgNoUpg')]);
    c.push(['bus', rules.commute ? t('lgCommute') : t('lgNoCommute')]);
    return c;
  }
  function chipsHtml(rules, max) {
    return ruleChips(rules).slice(0, max || 99).map(([i, txt]) => '<li>' + ico(i) + esc(txt) + '</li>').join('');
  }
  function canPlay(b) {
    if (!b || !b.round) return { ok: true, why: '' };
    if (b.me && b.me.kicked) return { ok: false, why: t('lgKicked') };
    if (b.round.status === 'upcoming') return { ok: false, why: t('lgNotYet') };
    if (b.round.status === 'ended') return { ok: false, why: t('lgEnded') };
    if (b.me && b.me.triesLeft === 0) return { ok: false, why: t('lgNoTries') };
    return { ok: true, why: '' };
  }
  function mineText(b) {
    if (!b || !b.me) return '';
    const m = b.me, parts = [];
    if (m.rank) parts.push(t('lgRank')(m.rank, b.players.length, fmtNum(b.rules.scoring === 'total' ? m.total : m.best)));
    else parts.push(t('lgNoScore'));
    if (m.triesLeft !== null && m.triesLeft !== undefined) parts.push(t('lgTriesLeft')(m.triesLeft));
    return parts.join(' · ');
  }
  const fetchBoard = (code) => api('/' + code + '?me=' + encodeURIComponent(S.playerId)).then((b) => { LG.boards[code] = b; return b; });

  // ----- rules form (shared by create + admin) -----
  function toLocalInput(ts) { const d = new Date(ts - new Date(ts).getTimezoneOffset() * 60000); return d.toISOString().slice(0, 16); }
  function renderRulesFields(box, rules) {
    const r = Object.assign({ schedule: 'week', shiftSecs: 0, tries: 0, scoring: 'best', sameOffice: false, upgrades: true, commute: true, prize: '' }, rules || {});
    const id = box.dataset.rules;
    const now = Date.now();
    const start = r.start || Math.ceil(now / 900000) * 900000, end = r.end || start + 2 * 3600 * 1000;
    const opt = (list, cur) => list.map(([v, l]) => `<option value="${v}"${String(v) === String(cur) ? ' selected' : ''}>${esc(l)}</option>`).join('');
    box.innerHTML = `
      <fieldset class="rule-type"><legend>${esc(t('lgType'))}</legend>
        <label><input type="radio" name="${id}-schedule" value="week"${r.schedule === 'week' ? ' checked' : ''}><span><b>${esc(t('lgWeekly'))}</b><small>${esc(t('lgWeeklyHelp'))}</small></span></label>
        <label><input type="radio" name="${id}-schedule" value="custom"${r.schedule === 'custom' ? ' checked' : ''}><span><b>${esc(t('lgTournament'))}</b><small>${esc(t('lgTournamentHelp'))}</small></span></label>
      </fieldset>
      <div class="rule-dates"${r.schedule === 'custom' ? '' : ' hidden'}>
        <label>${esc(t('lgStart'))}<input type="datetime-local" data-r="start" value="${toLocalInput(start)}"></label>
        <label>${esc(t('lgEnd'))}<input type="datetime-local" data-r="end" value="${toLocalInput(end)}"></label>
      </div>
      <div class="rule-grid">
        <label>${esc(t('lgShiftLen'))}<select data-r="shiftSecs">${opt([[0, t('lgNoLimit')], [60, t('lgShift')(60)], [90, t('lgShift')(90)], [120, t('lgShift')(120)], [180, t('lgShift')(180)], [300, t('lgShift')(300)]], r.shiftSecs)}</select></label>
        <label>${esc(t('lgTriesLabel'))}<select data-r="tries">${opt([[0, t('lgTriesAny')], [1, t('lgTries')(1)], [2, t('lgTries')(2)], [3, t('lgTries')(3)], [5, t('lgTries')(5)], [10, t('lgTries')(10)], [20, t('lgTries')(20)]], r.tries)}</select></label>
        <label class="span2">${esc(t('lgWinner'))}<select data-r="scoring">${opt([['best', t('lgBestLong')], ['total', t('lgTotalLong')]], r.scoring)}</select></label>
      </div>
      <div class="rule-checks">
        <label><input type="checkbox" data-r="sameOffice"${r.sameOffice ? ' checked' : ''}><span><b>${esc(t('lgSame'))}</b><small>${esc(t('lgSameHelp'))}</small></span></label>
        <label><input type="checkbox" data-r="upgrades"${r.upgrades ? ' checked' : ''}><span><b>${esc(t('lgUpg'))}</b><small>${esc(t('lgUpgHelp'))}</small></span></label>
        <label><input type="checkbox" data-r="commute"${r.commute ? ' checked' : ''}><span><b>${esc(t('lgCommute'))}</b><small>${esc(t('lgCommuteHelp'))}</small></span></label>
      </div>
      <label>${esc(t('lgPrize'))}<input type="text" data-r="prize" maxlength="80" placeholder="${esc(t('lgPrizeEg'))}" value="${esc(r.prize || '')}"></label>`;
    box.querySelectorAll(`input[name="${id}-schedule"]`).forEach((el) => el.addEventListener('change', () => {
      box.querySelector('.rule-dates').hidden = box.querySelector(`input[name="${id}-schedule"]:checked`).value !== 'custom';
    }));
  }
  function readRules(box) {
    const id = box.dataset.rules;
    const v = (k) => box.querySelector(`[data-r="${k}"]`);
    const r = {
      schedule: box.querySelector(`input[name="${id}-schedule"]:checked`).value,
      shiftSecs: +v('shiftSecs').value, tries: +v('tries').value, scoring: v('scoring').value,
      sameOffice: v('sameOffice').checked, upgrades: v('upgrades').checked, commute: v('commute').checked, prize: v('prize').value.trim(),
    };
    if (r.schedule === 'custom') { r.start = new Date(v('start').value).getTime(); r.end = new Date(v('end').value).getTime(); }
    return r;
  }

  // ----- my leagues -----
  function leagueCard(l) {
    const b = LG.boards[l.code];
    const li = document.createElement('li');
    li.className = 'league-card';
    li.dataset.code = l.code;
    const cp = canPlay(b);
    const leader = b && b.players && b.players[0];
    li.innerHTML = `
      <div class="lc-head"><strong class="lc-name"></strong><span class="lc-code">${esc(l.code)}</span></div>
      <p class="lc-round ${b && b.round ? 'is-' + b.round.status : ''}">${b ? esc(roundText(b)) : esc(t('leagueLoading'))}</p>
      ${b && b.rules ? '<ul class="rule-chips is-small">' + chipsHtml(b.rules, 4) + '</ul>' : ''}
      ${b && b.rules && b.rules.prize ? '<p class="lc-prize">' + ico('trophy') + esc(b.rules.prize) + '</p>' : ''}
      <p class="lc-mine">${esc(mineText(b))}${leader ? ' · ' + esc(t('lgLeader')(leader.name, fmtNum(leader.score))) : ''}</p>
      <div class="lc-actions">
        <button class="btn btn-primary btn-small" type="button" data-play="${esc(l.code)}"${cp.ok ? '' : ' disabled'}>${ico('play')}<span>${esc(t('lgPlay'))}</span></button>
        <button class="btn btn-ghost btn-small" type="button" data-board="${esc(l.code)}">${ico('trophy')}<span>${esc(t('lgBoard'))}</span></button>
      </div>
      ${!cp.ok && b ? '<p class="lc-why">' + esc(cp.why) + '</p>' : ''}`;
    li.querySelector('.lc-name').textContent = (b && b.name) || l.name;
    return li;
  }
  function paintLeagueList() {
    const list = $('league-list');
    list.innerHTML = '';
    for (const l of S.leagues) list.appendChild(leagueCard(l));
    $('league-none').hidden = S.leagues.length > 0;
  }
  function renderLeagueHome() {
    LG.current = null;
    $('league-home').hidden = false;
    $('league-board').hidden = true;
    $('league-name-need').hidden = !!S.name;
    $('league-player').value = S.name;
    const box = document.querySelector('[data-rules="create"]');
    if (!box.firstElementChild) renderRulesFields(box, null);
    $('league-create-box').open = !S.leagues.length && $('league-create-box').open;
    paintLeagueList();
    for (const l of S.leagues) {
      fetchBoard(l.code).then((b) => {
        if (b.name !== l.name) { l.name = b.name; saveS.leagues(); }
        if (!$('league-home').hidden) paintLeagueList();
      }).catch((e) => { if (e.status === 404) { LG.boards[l.code] = null; } });
    }
  }
  async function joinLeague(code, silent) {
    code = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!/^[A-HJ-NP-Z2-9]{6}$/.test(code)) { leagueStatus(t('lgBadCode'), 'err'); return false; }
    if (S.leagues.some((l) => l.code === code)) { leagueStatus(t('leagueAlready'), 'err'); openLeagueBoard(code); return true; }
    if (S.leagues.length >= 5) { leagueStatus(t('leagueMax'), 'err'); return false; }
    if (needName()) return false;
    try {
      const b = await fetchBoard(code);
      S.leagues.push({ code, name: b.name }); saveS.leagues();
      T('league_join');
      if (!silent) toast(t('leagueJoined')(b.name), 'good', 2000);
      $('league-code').value = '';
      openLeagueBoard(code);
      return true;
    } catch (e) { leagueStatus(e.message || t('leagueOffline'), 'err'); return false; }
  }
  async function createLeague() {
    const name = $('league-new').value.trim();
    const pin = $('league-pin').value.trim();
    if (S.leagues.length >= 5) { leagueStatus(t('leagueMax'), 'err'); return; }
    if (needName()) return;
    if (name.length < 2) { leagueStatus(t('lgNeedLeagueName'), 'err'); $('league-new').focus(); return; }
    if (!/^\d{4,6}$/.test(pin)) { leagueStatus(t('lgNeedPin'), 'err'); $('league-pin').focus(); return; }
    const rules = readRules(document.querySelector('[data-rules="create"]'));
    leagueStatus(t('leagueLoading'));
    try {
      const r = await post('', { name, playerId: S.playerId, pin, rules });
      S.leagues.push({ code: r.code, name: r.name }); saveS.leagues();
      T('league_create', { schedule: r.rules.schedule, tries: r.rules.tries, shift: r.rules.shiftSecs });
      toast(t('leagueCreated')(r.code), 'good', 2600);
      $('league-new').value = ''; $('league-pin').value = '';
      $('league-create-box').open = false;
      leagueStatus('');
      openLeagueBoard(r.code);
    } catch (e) { leagueStatus(e.message || t('leagueOffline'), 'err'); }
  }

  // ----- one league -----
  function paintBoard(b) {
    const code = b.code;
    $('lb-name').textContent = b.name;
    $('lb-code').textContent = code;
    $('lb-round').textContent = roundText(b);
    $('lb-round').className = 'is-' + b.round.status;
    $('lb-prize').hidden = !b.rules.prize;
    if (b.rules.prize) $('lb-prize').innerHTML = ico('trophy') + '<span></span>', $('lb-prize').lastChild.textContent = b.rules.prize;
    $('lb-rules').innerHTML = chipsHtml(b.rules);
    const cp = canPlay(b);
    $('btn-league-play').disabled = !cp.ok;
    $('btn-league-play').lastElementChild.textContent = t('lgPlayFor');
    $('lb-mine').textContent = cp.ok ? mineText(b) : cp.why + (mineText(b) ? ' · ' + mineText(b) : '');
    const admin = !b.legacy && (b.me && b.me.isOwner || LG.pins[code]);
    const rows = $('league-rows');
    rows.innerHTML = '';
    for (const r of b.players) {
      const li = document.createElement('li');
      if (b.me && r.pid === b.me.pid) li.className = 'is-me';
      const n = document.createElement('span'); n.className = 'n' + (r.gold ? ' is-gold' : ''); n.textContent = r.name;
      if (r.gold) n.insertAdjacentHTML('afterbegin', ico('crown') + ' ');
      if (r.title) { const ti = document.createElement('small'); ti.className = 'ttl'; ti.textContent = r.title; n.appendChild(ti); }
      const s = document.createElement('span'); s.className = 's'; s.textContent = fmtNum(r.score);
      const tt = document.createElement('span'); tt.className = 't';
      tt.textContent = (b.rules.scoring === 'total' ? t('lgPlays')(r.plays) + ' · ' + t('lgBestShort')(fmtNum(r.best)) : t('lgSurvived')(fmtTime(r.duration || 0), r.level || 1, r.plays));
      li.append(n, s, tt);
      if (!b.legacy && b.me && r.pid !== b.me.pid && !b.me.kicked) {
        const gb = document.createElement('button');
        gb.type = 'button'; gb.className = 'gift-btn' + (admin ? ' with-kick' : ''); gb.dataset.gift = r.pid; gb.dataset.name = r.name;
        gb.setAttribute('aria-label', t('giftTo')(r.name)); gb.innerHTML = ico('lunch-money');
        li.appendChild(gb);
        const db = document.createElement('button');
        db.type = 'button'; db.className = 'desk-btn' + (admin ? ' with-kick' : ''); db.dataset.desk = r.pid; db.dataset.name = r.name;
        db.setAttribute('aria-label', t('deskOf')(r.name)); db.innerHTML = ico('desk');
        li.appendChild(db);
      }
      if (admin && !(b.me && r.pid === b.me.pid)) {
        const k = document.createElement('button');
        k.type = 'button'; k.className = 'kick-btn'; k.dataset.kick = r.pid; k.setAttribute('aria-label', t('lgRemove') + ' ' + r.name);
        k.innerHTML = ico('close');
        li.appendChild(k);
      }
      rows.appendChild(li);
    }
    $('league-board-status').textContent = b.players.length ? '' : (b.round.status === 'upcoming' ? t('lgNotYet') : t('leagueEmpty'));
    $('lb-wall-box').hidden = !!b.legacy;
    if (!b.legacy) paintWall(b.wall);
    const h = b.history || [];
    $('lb-history-box').hidden = !h.length;
    $('lb-history').innerHTML = h.map((x) => `<li><span class="h-round">${esc(t('lgRound')(x.n))} · ${esc(new Date(x.end).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }))}</span>` +
      (x.winners.length ? x.winners.map((w, i) => `<span class="h-win h-${i + 1}">${i === 0 ? ico('crown') : ''}${esc(w.name)} <b>${fmtNum(w.score)}</b></span>`).join('') : `<span class="h-win">${esc(t('lgNobody'))}</span>`) + '</li>').join('');
    $('btn-league-admin').hidden = !!b.legacy;
    $('btn-league-admin').lastElementChild.textContent = admin ? t('lgManage') : t('lgAdminLogin');
  }
  async function openLeagueBoard(code, keepAdmin) {
    LG.current = code;
    LG.confirm = '';
    $('league-home').hidden = true;
    $('league-board').hidden = false;
    if (!keepAdmin) $('league-admin').hidden = true;
    const l = S.leagues.find((x) => x.code === code);
    const cached = LG.boards[code];
    if (cached) paintBoard(cached);
    else {
      $('lb-name').textContent = l ? l.name : code; $('lb-code').textContent = code; $('lb-round').textContent = '';
      $('lb-prize').hidden = true; $('lb-rules').innerHTML = ''; $('league-rows').innerHTML = ''; $('lb-mine').textContent = ''; $('lb-history-box').hidden = true;
      $('league-board-status').textContent = t('leagueLoading');
    }
    try {
      const b = await fetchBoard(code);
      if (LG.current !== code) return;
      paintBoard(b);
    } catch (e) { if (LG.current === code) $('league-board-status').textContent = e.message || t('leagueOffline'); }
  }
  async function inviteLeague() {
    T('share', { kind: 'league' });
    const code = LG.current;
    const b = LG.boards[code];
    const l = S.leagues.find((x) => x.code === code);
    const base = shareBase();
    let url = '';
    if (base) { try { const u = new URL(base); u.search = ''; u.searchParams.set('league', code); url = u.toString(); } catch (e) { url = ''; } }
    let text = t('leagueInviteText')(b ? b.name : l ? l.name : code, code, url);
    if (b && b.rules && b.rules.prize) text += '\n' + t('lgPrizeLine')(b.rules.prize);
    if (navigator.share) { try { await navigator.share({ title: CONFIG.TITLE, text }); return; } catch (e) { if (e && e.name === 'AbortError') return; } }
    const ok = await copyText(text);
    toast(ok ? t('leagueCopied') : text, 'good', 2600);
  }
  function leaveLeague() {
    if (LG.confirm !== 'leave') { LG.confirm = 'leave'; $('btn-league-leave').lastElementChild.textContent = t('lgTapAgain'); return; }
    LG.confirm = '';
    $('btn-league-leave').lastElementChild.textContent = t('leave_league') || 'Leave league';
    S.leagues = S.leagues.filter((l) => l.code !== LG.current);
    saveS.leagues();
    renderLeagueHome();
    leagueStatus(t('leagueLeft'), 'ok');
  }

  // ----- admin -----
  function adminBody(action, extra) { return Object.assign({ playerId: S.playerId, pin: LG.pins[LG.current] || '', action }, extra || {}); }
  function openAdmin() {
    const b = LG.boards[LG.current];
    if (!b || b.legacy) return;
    const box = $('league-admin');
    box.hidden = !box.hidden;
    adminStatus('');
    if (box.hidden) return;
    const owner = (b.me && b.me.isOwner) || LG.pins[LG.current];
    $('admin-pin-form').hidden = !!owner;
    $('admin-form').hidden = !owner;
    if (owner) fillAdmin(b);
    else $('admin-pin').focus();
    T('league_admin', { action: 'open' });
    setTimeout(() => box.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30);
  }
  function fillAdmin(b) {
    $('admin-name').value = b.name;
    renderRulesFields(document.querySelector('[data-rules="admin"]'), b.rules);
    $('btn-admin-end').disabled = b.round.status === 'ended';
    $('btn-admin-end').lastElementChild.textContent = t('end_round') || 'End round now';
    $('btn-admin-new').lastElementChild.textContent = t('new_round') || 'Start new round';
  }
  async function adminUnlock(e) {
    e.preventDefault();
    const pin = $('admin-pin').value.trim();
    if (!/^\d{4,6}$/.test(pin)) { adminStatus(t('lgNeedPin'), 'err'); return; }
    try {
      await post('/' + LG.current + '/admin', { playerId: S.playerId, pin, action: 'check' });
      LG.pins[LG.current] = pin;
      $('admin-pin').value = '';
      $('admin-pin-form').hidden = true;
      $('admin-form').hidden = false;
      const b = await fetchBoard(LG.current);
      paintBoard(b); fillAdmin(b);
      adminStatus(t('lgUnlocked'), 'ok');
    } catch (err) { adminStatus(err.message, 'err'); }
  }
  async function adminSave(e) {
    e.preventDefault();
    const rules = readRules(document.querySelector('[data-rules="admin"]'));
    adminStatus(t('leagueLoading'));
    try {
      const r = await post('/' + LG.current + '/admin', adminBody('rules', { name: $('admin-name').value.trim(), rules }));
      T('league_admin', { action: 'rules' });
      const b = await fetchBoard(LG.current);
      const l = S.leagues.find((x) => x.code === LG.current); if (l) { l.name = b.name; saveS.leagues(); }
      paintBoard(b); fillAdmin(b);
      adminStatus(r.note || t('lgSaved'), 'ok');
    } catch (err) { adminStatus(err.message, 'err'); }
  }
  async function adminAction(action) {
    const btn = action === 'end' ? $('btn-admin-end') : $('btn-admin-new');
    if (LG.confirm !== action) { LG.confirm = action; btn.lastElementChild.textContent = t('lgTapAgain'); return; }
    LG.confirm = '';
    const extra = {};
    if (action === 'new') {
      const r = readRules(document.querySelector('[data-rules="admin"]'));
      if (r.schedule === 'custom') { extra.start = r.start; extra.end = r.end; }
    }
    try {
      await post('/' + LG.current + '/admin', adminBody(action, extra));
      T('league_admin', { action });
      const b = await fetchBoard(LG.current);
      paintBoard(b); fillAdmin(b);
      adminStatus(action === 'end' ? t('lgEndedOk') : t('lgNewOk'), 'ok');
    } catch (err) { adminStatus(err.message, 'err'); fillAdmin(LG.boards[LG.current]); }
  }
  async function kickPlayer(pid, btn) {
    if (LG.confirm !== 'kick:' + pid) { LG.confirm = 'kick:' + pid; btn.classList.add('is-armed'); btn.title = t('lgTapAgain'); return; }
    LG.confirm = '';
    try {
      await post('/' + LG.current + '/admin', adminBody('kick', { pid }));
      T('league_admin', { action: 'kick' });
      paintBoard(await fetchBoard(LG.current));
      adminStatus(t('lgRemoved'), 'ok');
    } catch (err) { adminStatus(err.message, 'err'); }
  }

  // ----- playing for a league -----
  async function playLeague(code) {
    if (!S.name) {
      if (G.state !== 'leagues') openSide('leagues');
      needName();
      return;
    }
    const st = G.state === 'leagues' ? leagueStatus : (m, k) => toast(m, k === 'err' ? 'bad' : 'info', 2600);
    st(t('leagueLoading'));
    try {
      const r = await post('/' + code + '/start', Object.assign({ playerId: S.playerId, name: S.name }, myFlair()));
      const b = LG.boards[code];
      LG.run = { code, name: b ? b.name : (S.leagues.find((l) => l.code === code) || {}).name || code, runId: r.runId, seed: r.seed, rules: r.rules, triesLeft: r.triesLeft, end: r.round && r.round.end };
      if (G.state === 'leagues') leagueStatus('');
      T('league_play', { shift: r.rules.shiftSecs, tries: r.rules.tries });
      startGame('league');
      if (r.rules.sameOffice) ghostLoad(code);
    } catch (e) {
      st(e.message || t('leagueOffline'), 'err');
      if (LG.boards[code]) fetchBoard(code).then(() => { if (G.state === 'leagues') { if (LG.current) paintBoard(LG.boards[code]); else paintLeagueList(); } }).catch(() => {});
    }
  }
  async function submitLeagueRun(run) {
    const L = G.league;
    const box = $('over-league');
    if (!L) { box.hidden = true; return; }
    box.hidden = false;
    box.className = 'over-league';
    box.innerHTML = '<strong></strong><span class="ol-msg"></span><div class="ol-actions"></div>';
    box.firstChild.textContent = L.name;
    const msg = box.querySelector('.ol-msg');
    msg.textContent = t('lgSubmitting');
    $('btn-again').hidden = false;
    try {
      const ghost = ghostEncode();
      const r = await post('/' + L.code + '/score', Object.assign({ playerId: S.playerId, name: S.name, score: run.score, duration: run.duration, level: run.level, runId: L.runId }, myFlair(), ghost ? { ghost } : {}));
      msg.textContent = t('lgSubmitted')(r.rank, r.players, fmtNum(L.rules.scoring === 'total' ? r.total : r.best)) + (r.triesLeft !== null && r.triesLeft !== undefined ? ' · ' + t('lgTriesLeft')(r.triesLeft) : '');
      const gh = G.ghost;
      if (gh && !gh.mine && run.score > gh.score) { stats.ghostsBeaten++; checkBadges(true); saveProgress(); msg.textContent += ' · ' + t('ghostBeaten')(gh.name); }
      box.classList.add(r.rank === 1 ? 'is-first' : 'is-ok');
      L.triesLeft = r.triesLeft;
      if (r.triesLeft === 0) $('btn-again').hidden = true;
      LG.boards[L.code] = null;
    } catch (e) {
      msg.textContent = e.message || t('leagueOffline');
      box.classList.add('is-err');
    }
    const a = box.querySelector('.ol-actions');
    const vb = document.createElement('button');
    vb.type = 'button'; vb.className = 'btn btn-ghost btn-small'; vb.innerHTML = ico('trophy') + '<span></span>'; vb.lastChild.textContent = t('lgViewBoard');
    vb.addEventListener('click', () => { openSide('leagues'); openLeagueBoard(L.code); });
    a.appendChild(vb);
  }
  function replay() {
    if (G.mode === 'league' && G.league) playLeague(G.league.code);
    else startGame(G.mode);
  }

  // ----- v6 social: ghost runs, office wall, lunch money, rival alerts -----
  const WALL_LINES = ['Who send you?', 'Abeg slow down o!', 'Na me be MD now.', 'See as you dey shake!', 'Oga don catch you!',
    'This board na my own.', 'I dey come for your position.', 'Small small, I go pass you.', 'Share the jollof!', 'Lunch break don finish o.',
    'Make una stop dey form busy!', 'Who get extra tries? Asking for a friend.', 'NEPA no fit stop me today.', 'Congrats, you try!',
    'Respect the leader.', 'Rematch tomorrow!', 'The prize na my own this week.', 'My data finish, I go come back.', 'Na God dey give promotion.', 'Good game everybody!'];
  const REACTS = [['clap', 'clap'], ['laugh', 'laugh'], ['fire', 'fire'], ['heart', 'heart']];
  const GHOST_STEP = 0.2;
  function ghostRecordTick(dt) {
    const r = G.rec;
    r.acc += dt;
    while (r.acc >= GHOST_STEP) {
      r.acc -= GHOST_STEP;
      if (r.path.length > 22000) return;
      const p = G.player;
      r.path.push(clamp(Math.round(((p.x - FX0) / (FX1 - FX0)) * 255), 0, 255), clamp(Math.round((p.y / H) * 255), 0, 255));
    }
  }
  function ghostEncode() {
    if (!G.rec || !G.rec.path.length) return '';
    let bin = '';
    for (const v of G.rec.path) bin += String.fromCharCode(v);
    return btoa(bin);
  }
  function ghostLoad(code) {
    api('/' + code + '/ghost?me=' + encodeURIComponent(S.playerId)).then((g) => {
      if (!g || g.none || !G.league || G.league.code !== code || G.state === 'menu') return;
      const raw = atob(g.path), a = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i++) a[i] = raw.charCodeAt(i);
      G.ghost = { name: g.name, score: g.score, mine: g.mine, a, step: g.step || GHOST_STEP, t: G.rec ? G.rec.path.length / 2 * GHOST_STEP : 0, passed: false, out: false };
      toast(g.mine ? t('ghostMine')(fmtNum(g.score)) : t('ghostRace')(g.name, fmtNum(g.score)), 'info', 2600, 'ghost');
    }).catch(() => {});
  }
  function ghostPos() {
    const g = G.ghost;
    const n = g.a.length / 2, f = g.t / g.step, i = Math.floor(f);
    if (i >= n - 1) return null;
    const k = f - i;
    const x0 = g.a[i * 2], y0 = g.a[i * 2 + 1], x1 = g.a[i * 2 + 2], y1 = g.a[i * 2 + 3];
    return { x: FX0 + ((x0 + (x1 - x0) * k) / 255) * (FX1 - FX0), y: ((y0 + (y1 - y0) * k) / 255) * H, vx: (x1 - x0) };
  }
  function ghostTick(dt) {
    const g = G.ghost;
    g.t += dt;
    if (!g.out && !ghostPos()) { g.out = true; if (!g.mine) floater(t('ghostOut')(g.name), G.player.x, G.player.y - 60, '#c4b5fd', 14); }
    if (!g.passed && G.scoreF > g.score) {
      g.passed = true;
      toast(g.mine ? t('ghostBeatMine') : t('ghostPassed')(g.name), 'good', 2200, 'ghost');
      Sound.play('big');
    }
  }
  function drawGhost(c, tm) {
    const pos = ghostPos();
    if (!pos) return;
    c.save();
    c.globalAlpha = 0.38;
    c.translate(pos.x, pos.y);
    drawPerson(c, { shirt: '#c4b5fd', sleeve: '#c4b5fd', pants: '#a78bfa', skin: '#ddd6fe', hair: 'low', hairColor: '#7c3aed', mood: 'happy', walk: tm * 10, s: 1 });
    c.restore();
    c.save(); c.globalAlpha = 0.85;
    drawTag(c, pos.x, pos.y - 46, G.ghost.mine ? t('ghostYou') : G.ghost.name, '#7c3aed', '#fff');
    c.restore();
  }

  // office wall
  const timeAgo = (ts) => { const m = Math.max(0, Math.round((Date.now() - ts) / 60000)); return m < 1 ? t('justNow') : m < 60 ? m + 'm' : m < 1440 ? Math.round(m / 60) + 'h' : Math.round(m / 1440) + 'd'; };
  function paintWall(posts) {
    const ul = $('wall-posts');
    ul.innerHTML = '';
    if (!posts || !posts.length) { ul.innerHTML = '<li class="wall-empty">' + esc(t('wallEmpty')) + '</li>'; return; }
    for (const p of posts) {
      const li = document.createElement('li');
      li.className = 'wall-post is-' + p.kind;
      const head = document.createElement('div'); head.className = 'wp-head';
      head.innerHTML = p.kind === 'gift' ? ico('lunch-money') : p.kind === 'auto' ? ico('trophy') : '';
      const nm = document.createElement('strong'); nm.textContent = p.kind === 'line' ? p.name : '';
      const tm = document.createElement('small'); tm.textContent = timeAgo(p.t);
      head.append(nm, tm);
      const body = document.createElement('p'); body.className = 'wp-text';
      body.textContent = p.kind === 'line' ? (WALL_LINES[p.line] || '') : p.text;
      const rx = document.createElement('div'); rx.className = 'wp-reacts';
      for (const [k, icn] of REACTS) {
        const b = document.createElement('button');
        b.type = 'button'; b.dataset.post = p.id; b.dataset.emoji = k; b.setAttribute('aria-label', k);
        b.innerHTML = ico(icn) + (p.reacts && p.reacts[k] ? '<span>' + p.reacts[k] + '</span>' : '');
        rx.appendChild(b);
      }
      li.append(head, body, rx);
      ul.appendChild(li);
    }
  }
  function toggleWallLines() {
    const box = $('wall-lines');
    if (!box.firstElementChild) box.innerHTML = WALL_LINES.map((l, i) => `<button type="button" class="wall-line" data-line="${i}">${esc(l)}</button>`).join('');
    box.hidden = !box.hidden;
  }
  async function postWall(line) {
    if (!S.name) { $('wall-status').textContent = t('leagueNeedName'); return; }
    $('wall-status').textContent = '';
    try {
      const r = await post('/' + LG.current + '/wall', { playerId: S.playerId, name: S.name, line });
      $('wall-lines').hidden = true;
      stats.wallPosts++; G.badgeCheckT = 0; checkBadges(true); saveProgress();
      T('league_admin', { action: 'wall' });
      paintWall(r.wall);
      if (LG.boards[LG.current]) LG.boards[LG.current].wall = r.wall;
    } catch (e) { $('wall-status').textContent = e.message; }
  }
  async function reactWall(postId, emoji) {
    try {
      const r = await post('/' + LG.current + '/react', { playerId: S.playerId, post: postId, emoji });
      paintWall(r.wall);
    } catch (e) { $('wall-status').textContent = e.message; }
  }

  // lunch money
  let giftTarget = null;
  function openGift(pid, name) {
    giftTarget = { pid, name };
    $('gift-to').textContent = t('giftTo')(name);
    $('gift-box').hidden = false;
    $('gift-box').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  async function sendGift(amount) {
    if (!giftTarget) return;
    if (S.wallet < amount) { toast(t('cantAfford'), 'info', 2000); return; }
    try {
      const r = await post('/' + LG.current + '/gift', { playerId: S.playerId, name: S.name, to: giftTarget.pid, amount });
      S.wallet -= amount; saveS.wallet();
      stats.giftsSent++; G.badgeCheckT = 0; checkBadges(true); saveProgress();
      T('league_admin', { action: 'gift', amount });
      toast(t('giftSent')(fmtNum(amount), giftTarget.name, fmtNum(r.leftToday)), 'good', 2600, 'lunch-money');
      $('gift-box').hidden = true; giftTarget = null;
      paintBoard(await fetchBoard(LG.current));
    } catch (e) { toast(e.message, 'bad', 2600); }
  }
  function collectGifts() {
    if (!LG.available) return;
    api('/gifts?me=' + encodeURIComponent(S.playerId)).then((r) => {
      if (!r.gifts || !r.gifts.length) return;
      let sum = 0;
      for (const g of r.gifts) sum += g.amount;
      S.wallet += sum; saveS.wallet(); refreshMenu();
      const g = r.gifts[0];
      const refs = r.gifts.filter((x) => x.kind === 'referral');
      if (refs.length) { stats.invitesJoined = (stats.invitesJoined || 0) + refs.length; saveProgress(); }
      const msg = r.gifts.length === 1 && g.kind === 'referral' ? t('refGot')(g.from, fmtNum(g.amount))
        : r.gifts.length === 1 ? t('giftGot')(g.from, fmtNum(g.amount), g.league) : t('giftsGot')(r.gifts.length, fmtNum(sum));
      toast(msg, 'good', 3600, refs.length ? 'invite2' : 'lunch-money');
      Sound.play('coin');
    }).catch(() => {});
  }

  // rival alerts + league wins (on opening the game)
  async function checkRivals() {
    if (!LG.available || !S.leagues.length) return;
    const ranks = store.json('ow_lgranks', {}) || {};
    const wins = new Set(store.json('ow_lgwins', []) || []);
    const alerts = [];
    for (const l of S.leagues) {
      try {
        const b = await fetchBoard(l.code);
        const me = b.me || {};
        const prev = ranks[l.code];
        if (me.rank && prev && prev.rank && me.rank > prev.rank && prev.round === b.round.n) {
          const above = b.players[me.rank - 2];
          alerts.push(t('rivalPassed')(above ? above.name : '?', b.name, me.rank));
        }
        ranks[l.code] = { rank: me.rank || 0, round: b.round.n };
        for (const h of b.history || []) {
          const key = l.code + ':' + h.n;
          const w0 = h.winners[0];
          if (!wins.has(key) && w0 && (w0.pid ? w0.pid === me.pid : w0.name === S.name)) { wins.add(key); stats.leagueWins++; alerts.push(t('youWon')(b.name, h.n)); }
        }
      } catch (e) { /* offline */ }
    }
    store.set('ow_lgranks', JSON.stringify(ranks));
    store.set('ow_lgwins', JSON.stringify([...wins]));
    checkBadges(true); saveProgress();
    alerts.slice(0, 2).forEach((a, i) => setTimeout(() => { if (G.state === 'menu' || G.state === 'leagues') toast(a, 'info', 3600, 'bell'); }, 1200 + i * 3800));
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
      if (o.convoy) SPRITES.convoy(c, o.t, { dir: -dir }); else SPRITES.driver(c, o.t, { lookX: -dir });
      c.restore();
      drawTag(c, o.x, o.y - 50, o.convoy ? 'PROTOCOL' : "MD'S DRIVER", o.convoy ? '#1e3a8a' : '#111827', '#fff');
      speech(c, o.convoy ? (msgs() === MESSAGES.pcm ? 'Clear road for Oga!' : 'Clear the road!') : msgs() === MESSAGES.pcm ? 'Comot for road!' : 'Make way!', o.x, o.y - 60);
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

  /* ==================== v7: offices, missions, 5pm meeting, attendance, seasons, stickers, desk, State Wars, invites, reminders ==================== */
  const pickR = (arr) => arr[(Math.random() * arr.length) | 0];
  function weightedR(entries) { let tot = 0; for (const [, w] of entries) tot += w; let r = Math.random() * tot; for (const [k, w] of entries) { r -= w; if (r <= 0) return k; } return entries[entries.length - 1][0]; }
  const lagosToday = () => new Date(Date.now() + 3600e3).toISOString().slice(0, 10);
  const lagosMonth = () => new Date(Date.now() + 3600e3).toISOString().slice(0, 7);
  const dayDiff = (a, b) => Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 86400000);

  /* ---------- Offices: each promotion transfers you to a new workplace ---------- */
  const OFFICES = [
    { id: 'agency', name: 'Lagos ad agency', city: 'Ikeja, Lagos', weeks: 0, score: 0, song: 'Office Amapiano', rank: 'Intern',
      wall: '#0c1424', floor: '#16223a', line: '#1c2b48', runner: '0,135,81', edge: '#25345a', accent: '#19c37d',
      decor: ['desk', 'window', 'plant', 'water', 'door', 'cabinet', 'copier', 'desk', 'meetingroom', 'window', 'adscreen', 'adscreen'], doors: ["MD'S OFFICE", 'HR'],
      boss: { title: 'OGA', shirt: '#2b3245', tie: '#d62f3a', pants: '#1b2131', suit: true }, talk: null, hazard: null, skyline: 'lagos',
      blurb: 'Where it all started: Oga, quick meetings and NEPA.' },
    { id: 'bank', name: 'Bank HQ', city: 'Marina, Lagos Island', weeks: 1, score: 30000, song: 'Highlife Lunch Break', rank: 'Senior officer',
      wall: '#08181c', floor: '#15303a', line: '#1d424e', runner: '245,179,1', edge: '#24474f', accent: '#f5b301',
      decor: ['atm', 'window', 'teller', 'plant', 'door', 'vault', 'desk', 'teller', 'window', 'adscreen'], doors: ['BRANCH MANAGER', 'CUSTOMER SERVICE'],
      boss: { title: 'BRANCH MANAGER', shirt: '#14213d', tie: '#f5b301', pants: '#0f1830', suit: true, glasses: true },
      talk: ['Where is the reconciliation?', 'Target! Target!', 'Customers are waiting!', 'See me in my office.', 'Balance your till!'],
      hazard: 'queue', skyline: 'marina', blurb: 'ATM queues block the hall. The branch manager wants targets.' },
    { id: 'ministry', name: 'Federal ministry', city: 'Central Area, Abuja', weeks: 2, score: 100000, song: 'Owambe Saturday', rank: 'Manager',
      wall: '#11160a', floor: '#262e16', line: '#323c1f', runner: '0,135,81', edge: '#3a4526', accent: '#8bd17c',
      decor: ['flag', 'filestack', 'window', 'desk', 'door', 'filestack', 'plant', 'cabinet', 'flag', 'adscreen'], doors: ['HON. DIRECTOR', 'REGISTRY'],
      boss: { title: 'HON. DIRECTOR', shirt: '#f1ead6', robe: '#f1ead6', trim: '#008751', cap: 'fila', capColor: '#5b2a86', pants: '#f1ead6' },
      talk: ['Come back tomorrow!', 'Where is your memo?', 'Protocol!', 'The file is with Oga.', 'Minute it to me.'],
      hazard: 'convoy', skyline: 'abuja', blurb: 'Protocol convoys tear through the corridor. Files never move.' },
    { id: 'oil', name: 'Oil & gas company', city: 'Trans Amadi, Port Harcourt', weeks: 3, score: 250000, song: 'Lagos Traffic', rank: 'Director',
      wall: '#170f04', floor: '#2b2214', line: '#3a2e1c', runner: '255,138,61', edge: '#4a3a22', accent: '#fb923c',
      decor: ['pipes', 'safety', 'window', 'desk', 'door', 'pipes', 'hardhatrack', 'cabinet', 'window', 'adscreen'], doors: ['SITE OFFICE', 'HSE'],
      boss: { title: 'SITE SUPERVISOR', shirt: '#f97316', sleeve: '#f97316', pants: '#1e3a8a', cap: 'hardhat', capColor: '#facc15' },
      talk: ['Where is your PPE?', 'Safety first!', 'Permit to work?', 'Chopper is landing!', 'Toolbox meeting now!'],
      hazard: 'hardhat', gust: true, skyline: 'ph', blurb: 'Hard hats fall from the racks and the helipad wind pushes you sideways.' },
    { id: 'startup', name: 'Tech startup', city: 'Yaba, Lagos', weeks: 4, score: 500000, song: 'TGIF Piano', rank: 'MD / CEO',
      wall: '#0f0a1c', floor: '#1f1638', line: '#2b2050', runner: '124,58,237', edge: '#352a5c', accent: '#a78bfa',
      decor: ['beanbag', 'whiteboard', 'window', 'desk', 'door', 'plant', 'beanbag', 'desk', 'whiteboard', 'adscreen'], doors: ['CEO (CHIEF EVERYTHING)', 'SERVER ROOM'],
      boss: { title: 'CTO', shirt: '#1f2937', pants: '#111827', hoodie: '#374151', glasses: true, laptop: true },
      talk: ['The server is down!', 'Ship it today!', 'Quick standup?', 'Investors are coming!', 'Who pushed to main?'],
      hazard: 'standup', skyline: 'yaba', blurb: 'Surprise standups block the floor. The CTO wants it shipped yesterday.' },
  ];
  const officeById = (id) => OFFICES.find((o) => o.id === id) || OFFICES[0];
  const officeUnlocked = (o) => o.weeks === 0 || stats.weeks >= o.weeks || (stats.totalScore || 0) >= o.score;
  S.office = store.get('ow_office', 'agency');
  if (!officeUnlocked(officeById(S.office))) S.office = 'agency';
  const curOffice = () => G.office || officeById(S.office);
  const carpetCache = {};
  function carpetFor(off) {
    if (carpetCache[off.id]) return carpetCache[off.id];
    const cv = document.createElement('canvas'); cv.width = 64; cv.height = 64;
    const x = cv.getContext('2d');
    x.fillStyle = off.floor; x.fillRect(0, 0, 64, 64);
    const r = mulberry32(7);
    for (let i = 0; i < 260; i++) { x.fillStyle = r() > 0.5 ? 'rgba(255,255,255,.035)' : 'rgba(0,0,0,.08)'; x.fillRect(r() * 64, r() * 64, 1.2, 1.2); }
    x.strokeStyle = off.line; x.lineWidth = 2; x.strokeRect(1, 1, 62, 62);
    x.fillStyle = 'rgba(255,255,255,.025)'; x.fillRect(2, 2, 30, 30); x.fillRect(32, 32, 30, 30);
    if (off.id === 'bank') { x.fillStyle = 'rgba(245,179,1,.05)'; x.fillRect(0, 31, 64, 2); x.fillRect(31, 0, 2, 64); }
    if (off.id === 'startup') { x.fillStyle = 'rgba(167,139,250,.06)'; for (let i = 0; i < 64; i += 16) x.fillRect(i, 0, 1, 64); }
    carpetCache[off.id] = ctx.createPattern(cv, 'repeat');
    return carpetCache[off.id];
  }
  function bossTalkLine() { const off = curOffice(); return S.lang !== 'pcm' && off.talk ? pickF(off.talk) : pickF(msgs().bossTalk); }
  function officeNewlyUnlocked(before) { return OFFICES.filter((o) => officeUnlocked(o) && !before.includes(o.id)); }
  const unlockedIds = () => OFFICES.filter(officeUnlocked).map((o) => o.id);

  // extra decor for the new offices
  function drawDecorV7(c, kind, side, tm) {
    switch (kind) {
      case 'atm':
        c.fillStyle = '#334155'; rr(c, -14, -24, 28, 46, 4); c.fill();
        c.fillStyle = '#0ea5e9'; rr(c, -10, -18, 20, 13, 2); c.fill();
        c.fillStyle = '#f5b301'; c.fillRect(-14, -24, 28, 5);
        c.fillStyle = '#cbd5e1'; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) c.fillRect(-7 + i * 5, 0 + j * 5, 3.5, 3.5);
        c.fillStyle = '#111827'; c.fillRect(-8, 17, 16, 2);
        return true;
      case 'teller':
        c.fillStyle = '#5b3a22'; rr(c, -28, -6, 56, 26, 3); c.fill();
        c.fillStyle = 'rgba(160,220,255,.25)'; c.fillRect(-26, -26, 52, 20);
        c.strokeStyle = 'rgba(160,220,255,.5)'; c.lineWidth = 1; c.strokeRect(-26, -26, 52, 20);
        c.fillStyle = '#f5b301'; c.font = '800 6px system-ui, Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('TELLER ' + (1 + ((Math.abs(side) * 3) | 0)), 0, 4);
        return true;
      case 'vault':
        c.fillStyle = '#6b7280'; circle(c, 0, 0, 22); c.fill();
        c.fillStyle = '#9ca3af'; circle(c, 0, 0, 16); c.fill();
        c.strokeStyle = '#374151'; c.lineWidth = 2.5;
        for (let i = 0; i < 3; i++) { const a = tm * 0.4 + (i * TAU) / 3; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a) * 13, Math.sin(a) * 13); c.stroke(); }
        c.fillStyle = '#374151'; circle(c, 0, 0, 4); c.fill();
        return true;
      case 'flag': {
        c.fillStyle = '#9ca3af'; c.fillRect(-1.5, -30, 3, 54);
        const wv = Math.sin(tm * 3) * 2;
        for (let i = 0; i < 3; i++) { c.fillStyle = i === 1 ? '#ffffff' : '#008751'; c.beginPath(); c.moveTo(1.5 + i * 8, -28 + (i ? wv * (i / 2) : 0)); c.lineTo(9.5 + i * 8, -28 + wv * ((i + 1) / 2)); c.lineTo(9.5 + i * 8, -12 + wv * ((i + 1) / 2)); c.lineTo(1.5 + i * 8, -12 + (i ? wv * (i / 2) : 0)); c.closePath(); c.fill(); }
        c.fillStyle = '#4b5563'; rr(c, -8, 22, 16, 5, 2); c.fill();
        return true;
      }
      case 'filestack':
        for (let i = 0; i < 6; i++) { c.fillStyle = i % 2 ? '#d6b98c' : '#c9a66b'; rr(c, -14 + (i % 2), 18 - i * 6, 28, 6, 1); c.fill(); }
        c.fillStyle = '#e5484d'; c.fillRect(-14, -12, 10, 3);
        c.fillStyle = '#fff'; c.font = '800 5px system-ui, Arial, sans-serif'; c.textAlign = 'center'; c.fillText('PENDING', 0, -20);
        return true;
      case 'pipes':
        c.strokeStyle = '#9ca3af'; c.lineWidth = 7; c.lineCap = 'round';
        c.beginPath(); c.moveTo(-20, -26); c.lineTo(-20, 10); c.quadraticCurveTo(-20, 22, -8, 22); c.lineTo(20, 22); c.stroke();
        c.strokeStyle = '#fb923c'; c.lineWidth = 7; c.beginPath(); c.moveTo(4, -26); c.lineTo(4, 4); c.stroke();
        c.fillStyle = '#ef4444'; circle(c, 4, -6, 6); c.fill(); c.fillStyle = '#fff'; c.fillRect(1, -7, 6, 2);
        return true;
      case 'safety':
        c.fillStyle = '#facc15'; rr(c, -18, -24, 36, 40, 3); c.fill();
        c.fillStyle = '#111827'; c.font = '900 7px system-ui, Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText('SAFETY', 0, -14); c.fillText('FIRST', 0, -5);
        c.beginPath(); c.moveTo(0, 2); c.lineTo(8, 13); c.lineTo(-8, 13); c.closePath(); c.fill();
        c.fillStyle = '#facc15'; c.fillRect(-1, 6, 2, 4);
        return true;
      case 'hardhatrack':
        c.fillStyle = '#4b5563'; c.fillRect(-20, -4, 40, 3); c.fillRect(-20, 14, 40, 3);
        for (let i = 0; i < 3; i++) { c.fillStyle = ['#facc15', '#ffffff', '#fb923c'][i]; c.beginPath(); c.arc(-12 + i * 12, -5, 5.5, Math.PI, 0); c.fill(); c.fillRect(-18 + i * 12, -6, 12, 2); }
        for (let i = 0; i < 3; i++) { c.fillStyle = ['#fb923c', '#facc15', '#ffffff'][i]; c.beginPath(); c.arc(-12 + i * 12, 13, 5.5, Math.PI, 0); c.fill(); c.fillRect(-18 + i * 12, 12, 12, 2); }
        return true;
      case 'beanbag':
        c.fillStyle = ['#ec4899', '#22c55e', '#f59e0b'][Math.abs(side * 7 | 0) % 3];
        c.beginPath(); c.ellipse(0, 6, 20, 15, 0, 0, TAU); c.fill();
        c.fillStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.ellipse(-5, 0, 9, 6, -0.4, 0, TAU); c.fill();
        return true;
      case 'whiteboard':
        c.fillStyle = '#e5e7eb'; rr(c, -26, -22, 52, 36, 2); c.fill();
        c.strokeStyle = '#6b7280'; c.lineWidth = 2; c.strokeRect(-26, -22, 52, 36);
        c.strokeStyle = '#7c3aed'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(-20, 6); c.lineTo(-10, -2); c.lineTo(0, 2); c.lineTo(10, -10); c.lineTo(18, -14); c.stroke();
        c.fillStyle = '#ef4444'; c.font = '800 5.5px system-ui, Arial, sans-serif'; c.textAlign = 'left'; c.fillText('SHIP IT!!', -22, -15);
        c.fillStyle = '#6b7280'; c.fillRect(-12, 14, 3, 10); c.fillRect(9, 14, 3, 10);
        return true;
    }
    return false;
  }
  // landmarks in the window, per city
  function drawSkylineLandmark(c, kind, day) {
    const dark = day ? 'rgba(20,32,58,.8)' : '#0a1024';
    c.fillStyle = dark;
    if (kind === 'abuja') { // dome + a rock
      c.beginPath(); c.ellipse(-8, 26, 14, 16, 0, Math.PI, 0); c.fill();
      c.beginPath(); c.arc(10, 14, 6, Math.PI, 0); c.fill(); c.fillRect(4, 14, 12, 12); c.fillRect(9.2, 4, 1.6, 4);
    } else if (kind === 'ph') { // flare stack
      c.fillRect(8, -2, 4, 28);
      c.fillStyle = 'rgba(255,140,40,.9)'; c.beginPath(); c.ellipse(10, -6, 3.5, 6, 0, 0, TAU); c.fill();
      c.fillStyle = 'rgba(255,220,120,.9)'; c.beginPath(); c.ellipse(10, -4, 1.6, 3, 0, 0, TAU); c.fill();
    } else if (kind === 'marina') { // tall towers
      c.fillRect(-18, -12, 9, 38); c.fillRect(-6, -20, 8, 46); c.fillRect(6, -8, 10, 34);
    } else if (kind === 'yaba') { // crane
      c.fillRect(-14, -14, 2.5, 40); c.fillRect(-20, -14, 30, 2);
      c.strokeStyle = dark; c.lineWidth = 1; c.beginPath(); c.moveTo(6, -12); c.lineTo(6, 2); c.stroke();
    }
  }

  /* ---------- Office hazards ---------- */
  function spawnHazard() {
    const off = curOffice();
    const m = levelMult();
    if (off.hazard === 'queue') {
      const w = 96 + Math.random() * 30;
      G.obstacles.push({ type: 'queue', t: 0, rot: 0, vr: 0, minD: Infinity, warn: 0, phase: 'move', w, h: 26, r: 0, hr: 0,
        x: FX0 + w / 2 + 8 + Math.random() * Math.max(10, FX1 - FX0 - w - 16), y: -30, vx: 0, vy: floorSpeed() * 1.05, life: 0 });
    } else if (off.hazard === 'convoy') {
      const o = { type: 'driver', convoy: true, t: 0, phase: 'warn', wt: 1.2, passes: 1, side: Math.random() < 0.5 ? 'L' : 'R', r: 20, hr: 16, minD: Infinity, vx: 0, vy: 0, rot: 0, vr: 0 };
      driverRow(o);
      G.obstacles.push(o);
      toast(t('convoyComing'), 'bad', 1600);
      Sound.play('warn');
    } else if (off.hazard === 'hardhat') {
      const r = 13;
      G.obstacles.push({ type: 'hardhat', t: 0, rot: rand(-0.4, 0.4), vr: rand(-3, 3), minD: Infinity, warn: 0, phase: 'move', r, hr: r * 0.82,
        x: FX0 + r + 6 + Math.random() * (FX1 - FX0 - 2 * (r + 6)), y: -30, vx: 0, vy: rand(220, 290) * m, life: 0 });
    } else if (off.hazard === 'standup') {
      G.obstacles.push({ type: 'standup', t: 0, rot: 0, vr: 0, minD: Infinity, warn: 0, phase: 'move', r: 36, hr: 30,
        x: FX0 + 50 + Math.random() * Math.max(10, FX1 - FX0 - 100), y: -50, vx: 0, vy: floorSpeed() * 1.05, life: 0 });
    }
  }
  function tickHazards(dt) {
    const off = curOffice();
    if (!off.hazard || G.level < 2 || G.meet) return;
    G.hazT -= dt;
    if (G.hazT <= 0) { spawnHazard(); G.hazT = rand(9, 14) * Math.max(0.55, 1 - G.level * 0.03); }
    if (off.gust && G.level >= 3) {
      if (G.gust) {
        G.gust.t -= dt;
        if (G.gust.warn > 0) G.gust.warn -= dt;
        else { const p = G.player; p.x = clamp(p.x + G.gust.dir * 95 * dt, FX0 + p.r, FX1 - p.r); }
        if (G.gust.t <= 0) G.gust = null;
      } else {
        G.gustT = (G.gustT ?? 14) - dt;
        if (G.gustT <= 0) { G.gust = { t: 3.2, warn: 0.8, dir: Math.random() < 0.5 ? -1 : 1 }; G.gustT = rand(14, 22); toast(t('gustComing'), 'info', 1500); }
      }
    }
  }
  function drawGust(c, tm) {
    if (!G.gust) return;
    c.save();
    c.strokeStyle = G.gust.warn > 0 ? 'rgba(255,255,255,.18)' : 'rgba(255,255,255,.4)'; c.lineWidth = 2;
    for (let i = 0; i < 14; i++) {
      const y = (i * 53 + tm * 40) % H, x = (((i * 97 + tm * 600 * G.gust.dir) % (FX1 - FX0)) + (FX1 - FX0)) % (FX1 - FX0) + FX0;
      c.beginPath(); c.moveTo(x, y); c.lineTo(x + 34 * G.gust.dir, y); c.stroke();
    }
    c.restore();
  }

  /* ---------- Mini-missions inside a shift ---------- */
  const MISSIONS = [
    { id: 'data', item: 'data', need: [2, 3], time: 16, text: (n) => `Grab ${n} data bundles`, ico: 'mission' },
    { id: 'lunch', item: 'lunch', need: [3, 4], time: 16, text: (n) => `Grab ${n} lunch packs`, ico: 'rice' },
    { id: 'salary', item: 'salary', need: [2, 3], time: 16, text: (n) => `Grab ${n} salary notes`, ico: 'coins' },
    { id: 'nohit', need: [12, 16], time: 0, text: (n) => `Don't get hit for ${n} seconds`, ico: 'health' },
    { id: 'close', need: [2, 3], time: 20, text: (n) => `Get ${n} close calls`, ico: 'sweat' },
    { id: 'streak', need: [6, 8], time: 20, text: (n) => `Reach a streak of ${n}`, ico: 'fire' },
  ];
  function startMission() {
    const def = pickR(MISSIONS);
    const hard = G.level >= 6 ? 1 : 0;
    const need = def.need[hard];
    G.mission = { id: def.id, item: def.item, need, have: 0, t: def.id === 'nohit' ? need : def.time, dur: def.id === 'nohit' ? need : def.time,
      text: def.text(need), reward: 80 + hard * 70, ico: def.ico };
    toast(t('missionNew')(G.mission.text), 'info', 2400, 'mission');
    Sound.play('power');
    T('mission', { id: def.id, phase: 'start' });
  }
  function missionProgress(kind, item) {
    const M = G.mission;
    if (!M || M.done) return;
    if (kind === 'item' && M.item === item) M.have++;
    else if (kind === 'close' && M.id === 'close') M.have++;
    else if (kind === 'hit' && M.id === 'nohit') { endMission(false); return; }
    if (M.id === 'streak') M.have = Math.max(M.have, G.streak);
    if (M.id !== 'nohit' && M.have >= M.need) endMission(true);
  }
  function endMission(ok) {
    const M = G.mission;
    if (!M) return;
    G.mission = null;
    G.missionT = rand(20, 30);
    if (ok) {
      addScore(150); S.wallet += M.reward; saveS.wallet(); stats.missions = (stats.missions || 0) + 1; G.run.missions = (G.run.missions || 0) + 1;
      seasonXp(30, true);
      floater('+150 · +₦' + M.reward, G.player.x, G.player.y - 56, '#ffe066', 15);
      toast(t('missionDone')(fmtNum(M.reward)), 'good', 1800, 'mission');
      Sound.play('badge'); confetti(20); G.badgeCheckT = 0;
    } else if (G.state === 'playing') toast(t('missionFail'), 'info', 1400);
    T('mission', { id: M.id, phase: ok ? 'done' : 'fail' });
  }
  function tickMission(dt) {
    if (G.meet) return;
    const M = G.mission;
    if (M) {
      M.t -= dt;
      if (M.id === 'streak') M.have = Math.max(M.have, G.streak);
      if (M.id === 'nohit') M.have = Math.floor(M.dur - Math.max(0, M.t));
      if (M.t <= 0) endMission(M.id === 'nohit' || M.have >= M.need);
      else if (M.id === 'streak' && M.have >= M.need) endMission(true);
    } else {
      G.missionT -= dt;
      if (G.missionT <= 0 && !G.black) startMission();
    }
  }

  /* ---------- 5pm: Oga's emergency meeting ---------- */
  function startMeeting() {
    G.met5 = true;
    for (const o of G.obstacles) if (o.boss) leaveBoss(o);
    G.meet = { t: 20, dur: 20, throwT: 1.6, wave: 0 };
    if (G.mission) { G.mission = null; G.missionT = 25; }
    banner(t('meetBanner'), true);
    toast(t('meetToast'), 'bad', 2200);
    say('boss_coming');
    Sound.play('warn');
    T('meeting5', { phase: 'start', level: G.level });
  }
  function meetPos() { return { x: (FX0 + FX1) / 2, y: HUD_SPACE + 150 }; }
  function throwAgenda() {
    const M = G.meet, b = meetPos(), p = G.player;
    const sp = 150 + Math.min(80, G.level * 4);
    const kind = M.wave % 3;
    const shots = [];
    if (kind === 0) { const a0 = Math.atan2(p.y - b.y, p.x - b.x); for (let i = -2; i <= 2; i++) shots.push(a0 + i * 0.22); }
    else if (kind === 1) { const n = 10, off = M.wave * 0.3; for (let i = 0; i < n; i++) { const a = off + (i * TAU) / n; if (Math.sin(a) > -0.2) shots.push(a); } }
    else { const a0 = Math.atan2(p.y - b.y, p.x - b.x); shots.push(a0 - 0.1, a0 + 0.1); }
    for (const a of shots) G.obstacles.push({ type: 'agenda', t: 0, x: b.x, y: b.y + 10, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 6, r: 11, hr: 9, minD: Infinity, rot: a, vr: 4, phase: 'move', warn: 0 });
    M.wave++;
    Sound.play('near');
  }
  function tickMeeting(dt) {
    if (!G.meet) {
      if (!G.met5 && G.phase === 'office' && officeClock(G.time).hour >= 17 && !G.black) startMeeting();
      return;
    }
    const M = G.meet;
    M.t -= dt; M.throwT -= dt;
    if (M.throwT <= 0 && M.t > 1.2) { throwAgenda(); M.throwT = Math.max(0.75, 1.5 - M.wave * 0.05); }
    if (M.t <= 0) {
      G.meet = null;
      addScore(1000); S.wallet += 500; saveS.wallet(); stats.meetings5 = (stats.meetings5 || 0) + 1; G.badgeCheckT = 0;
      seasonXp(60, true);
      banner(t('meetDone'));
      toast(t('meetDoneToast'), 'good', 2400, 'trophy');
      Sound.play('big'); confetti(60);
      G.bossT = Math.max(G.bossT, 8);
      T('meeting5', { phase: 'done', level: G.level });
    }
  }
  function drawMeeting(c, tm) {
    if (!G.meet) return;
    const b = meetPos();
    c.save();
    c.fillStyle = 'rgba(10,16,32,.35)'; c.fillRect(FX0, b.y - 60, FX1 - FX0, 96);
    c.translate(b.x, b.y);
    SPRITES.boss(c, tm, { lookX: (G.player.x - b.x) / 120, lookY: 1, s: 1.15 });
    c.restore();
    c.fillStyle = '#6b4a2f'; rr(c, b.x - 70, b.y + 8, 140, 22, 6); c.fill();
    c.fillStyle = '#f5f5f0'; for (let i = 0; i < 4; i++) c.fillRect(b.x - 56 + i * 30, b.y + 12, 16, 10);
    drawTag(c, b.x, b.y - 52, t('meetTag'), '#e5484d', '#fff');
    speech(c, pickBy(['Any other business?', 'Next item on the agenda!', 'Who is taking minutes?', 'This meeting will be brief…'], Math.floor(tm / 2.2)), b.x, b.y - 64);
    const k = clamp(G.meet.t / G.meet.dur, 0, 1);
    c.fillStyle = 'rgba(255,255,255,.15)'; rr(c, b.x - 60, b.y + 38, 120, 6, 3); c.fill();
    c.fillStyle = '#f5b301'; rr(c, b.x - 60, b.y + 38, 120 * k, 6, 3); c.fill();
  }
  const pickBy = (arr, i) => arr[((i % arr.length) + arr.length) % arr.length];

  /* ---------- Attendance register (daily reward; one missed day forgiven) ---------- */
  const ATT_REWARDS = [100, 200, 300, 400, 500, 700, 1000];
  const ATT = Object.assign({ last: '', streak: 0, grace: true, best: 0, cycles: 0, total: 0 }, store.json('ow_att', {}));
  const saveAtt = () => store.set('ow_att', JSON.stringify(ATT));
  function attPreview() {
    const today = lagosToday();
    if (ATT.last === today) return { signed: true, streak: ATT.streak, day: ((ATT.streak - 1) % 7) + 1 };
    const gap = ATT.last ? dayDiff(ATT.last, today) : 99;
    const keep = gap === 1 || (gap === 2 && ATT.grace);
    const streak = keep ? ATT.streak + 1 : 1;
    return { signed: false, streak, day: ((streak - 1) % 7) + 1, usesGrace: gap === 2 && ATT.grace, broke: !keep && ATT.streak > 1 };
  }
  function signRegister() {
    const pv = attPreview();
    if (pv.signed) return;
    ATT.streak = pv.streak; ATT.last = lagosToday(); ATT.total++;
    if (pv.usesGrace) ATT.grace = false;
    ATT.best = Math.max(ATT.best, ATT.streak);
    let cash = ATT_REWARDS[pv.day - 1];
    let extra = '';
    if (pv.day === 7) {
      ATT.grace = true; ATT.cycles++;
      const st = grantSticker(true); if (st) extra = ' + ' + t('stickerWord') + ': ' + st.name;
      if (ATT.cycles % 4 === 0 && !S.owned.has('desk:eotm')) { S.owned.add('desk:eotm'); saveS.owned(); extra += ' + ' + t('eotmWord'); }
    }
    S.wallet += cash; saveS.wallet(); saveAtt();
    stats.attStreak = Math.max(stats.attStreak || 0, ATT.streak); G.badgeCheckT = 0; checkBadges(false); saveProgress();
    seasonXp(50, false);
    T('attendance', { day: pv.day, streak: ATT.streak });
    toast(t('attSigned')(pv.day, fmtNum(cash)) + extra, 'good', 3200, 'calendar');
    Sound.play('coin'); confetti(30);
    renderRegister(); refreshMenu();
    syncReminderConfig();
  }
  function renderRegister() {
    const pv = attPreview();
    $('register-streak').textContent = pv.signed ? t('attStreakDone')(ATT.streak) : pv.broke ? t('attBroke') : t('attStreak')(pv.streak);
    const ol = $('register-days'); ol.innerHTML = '';
    for (let d = 1; d <= 7; d++) {
      const li = document.createElement('li');
      const done = pv.signed ? d <= pv.day : d < pv.day;
      li.className = (done ? 'is-done' : '') + (!pv.signed && d === pv.day ? ' is-today' : '') + (d === 7 ? ' is-big' : '');
      li.innerHTML = `<small>${t('dayN')(d)}</small><strong>₦${fmtNum(ATT_REWARDS[d - 1])}</strong>` + (d === 7 ? `<span class="rg-extra">${ico('stapler')} ${esc(t('stickerWord'))}</span>` : '') + (done ? ico('check-circle', 'rg-tick') : '');
      ol.appendChild(li);
    }
    $('register-note').textContent = ATT.grace ? t('attGraceOk') : t('attGraceUsed');
    $('btn-sign').disabled = pv.signed;
    $('btn-sign').lastElementChild.textContent = pv.signed ? t('attSeeTomorrow') : t('attSign')(fmtNum(ATT_REWARDS[pv.day - 1]));
  }

  /* ---------- Seasons: a free monthly reward track ---------- */
  const SEASON_NAMES = ['New Year Resolution', 'Love & Wahala', 'Q1 Deadline', 'Easter Break', "Workers' Day", 'Democracy Day', 'Mid-Year Appraisal',
    'Rainy Season', 'Ember Months', 'Independence', 'Year-End Targets', 'Detty December'];
  const SEASON_TIER_XP = 300;
  const SEASON_REWARDS = [{ cash: 300 }, { sticker: 1 }, { cash: 500 }, { cash: 600 }, { sticker: 1 }, { cash: 800 }, { cash: 1000 }, { sticker: 1 }, { cash: 1200 }, { cash: 1500 }, { sticker: 1 }, { cash: 3000, final: true }];
  let SEASON = Object.assign({ key: '', xp: 0, tier: 0 }, store.json('ow_season', {}));
  function seasonCheckRoll() { const k = lagosMonth(); if (SEASON.key !== k) { SEASON = { key: k, xp: 0, tier: 0 }; store.set('ow_season', JSON.stringify(SEASON)); } }
  const seasonName = (k) => SEASON_NAMES[(+String(k || lagosMonth()).slice(5, 7) || 1) - 1];
  function seasonXp(n, live) {
    seasonCheckRoll();
    SEASON.xp += Math.max(0, Math.round(n));
    const msgs2 = [];
    while (SEASON.tier < SEASON_REWARDS.length && SEASON.xp >= (SEASON.tier + 1) * SEASON_TIER_XP) {
      const r = SEASON_REWARDS[SEASON.tier];
      SEASON.tier++;
      if (r.cash) { S.wallet += r.cash; saveS.wallet(); }
      let txt = t('seasonTier')(SEASON.tier) + (r.cash ? ' +₦' + fmtNum(r.cash) : '');
      if (r.sticker) { const st = grantSticker(false); if (st) txt += ' + ' + t('stickerWord') + ': ' + st.name; }
      if (r.final) { stats.seasons = (stats.seasons || 0) + 1; G.badgeCheckT = 0; txt += ' · ' + t('seasonDone'); }
      msgs2.push(txt);
      T('season_tier', { tier: SEASON.tier });
    }
    store.set('ow_season', JSON.stringify(SEASON));
    if (msgs2.length) setTimeout(() => toast(msgs2[msgs2.length - 1], 'good', 3000, 'season'), live ? 600 : 1800);
  }
  function renderSeason() {
    seasonCheckRoll();
    const end = new Date(Date.parse(SEASON.key + '-01T00:00:00Z')); end.setUTCMonth(end.getUTCMonth() + 1);
    const daysLeft = Math.max(1, Math.ceil((end - (Date.now() + 3600e3)) / 86400000));
    const max = SEASON_REWARDS.length * SEASON_TIER_XP;
    $('season-hero').innerHTML = `<div class="sh-name">${ico('season')}<span><small>${esc(t('seasonOf')(new Date(Date.parse(SEASON.key + '-15T00:00:00Z')).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })))}</small><strong>${esc(seasonName(SEASON.key))}</strong></span></div>` +
      `<p class="sh-meta">${esc(t('seasonMeta')(SEASON.tier, SEASON_REWARDS.length, daysLeft))}</p><div class="sh-bar"><i style="width:${Math.min(100, (SEASON.xp / max) * 100)}%"></i></div><p class="sh-xp">${fmtNum(SEASON.xp)} / ${fmtNum(max)} XP · ${esc(t('seasonHow'))}</p>`;
    const ol = $('season-track'); ol.innerHTML = '';
    SEASON_REWARDS.forEach((r, i) => {
      const li = document.createElement('li');
      li.className = i < SEASON.tier ? 'is-done' : i === SEASON.tier ? 'is-next' : '';
      li.innerHTML = `<small>${t('tierN')(i + 1)}</small>${ico(r.sticker ? 'stapler' : r.final ? 'trophy' : 'coins')}<strong>${r.sticker ? esc(t('stickerWord')) : '₦' + fmtNum(r.cash)}</strong>${r.final ? '<span>' + esc(t('seasonBadge')) + '</span>' : ''}`;
      ol.appendChild(li);
    });
    const st = $('season-status'); st.textContent = '';
    const board = $('season-board'); board.innerHTML = '';
    if (!HUB.available) { st.textContent = t('hubOffline'); return; }
    st.textContent = t('leagueLoading');
    hubApi('/season?me=' + encodeURIComponent(S.playerId)).then((j) => {
      st.textContent = j.top.length ? (j.rank ? t('seasonRank')(j.rank) : t('seasonNoRank')) : t('seasonEmpty');
      for (const r of j.top) {
        const li = document.createElement('li'); if (r.me) li.className = 'is-me';
        const n = document.createElement('span'); n.className = 'n'; n.textContent = r.name + (r.state && STATES[r.state] ? ' · ' + STATES[r.state] : '');
        const s2 = document.createElement('span'); s2.className = 's'; s2.textContent = fmtNum(r.score);
        li.append(n, s2); board.appendChild(li);
      }
    }).catch((e) => { st.textContent = e.message; });
  }

  /* ---------- Stickers: collectible sets ---------- */
  const STICKER_SETS = [
    { id: 'lagos', name: 'Lagos life', color: '#f5b301', items: [['danfo', 'Yellow danfo', 'danfo'], ['okada', 'Okada', 'okada'], ['keke', 'Keke NAPEP', 'keke'], ['suya', 'Suya spot', 'suya'], ['agbero', 'Agbero', 'agbero', 1], ['bridge', 'Third Mainland Bridge', 'bridge', 1]] },
    { id: 'office', name: 'Office life', color: '#5ab0ff', items: [['stapler', 'Stapler', 'stapler'], ['bill', 'NEPA bill', 'bill'], ['gen', '"I better pass my neighbour"', 'generator', 1], ['flask', 'Tea flask', 'coffee'], ['file', 'File jacket', 'folder'], ['idcard', 'Staff ID', 'idcard']] },
    { id: 'food', name: 'Chop life', color: '#ff8a3c', items: [['jollof', 'Party jollof', 'rice'], ['puff', 'Puff-puff', 'puff'], ['pepper', 'Pepper soup', 'pepper', 1], ['chinchin', 'Chin chin', 'chinchin'], ['zobo', 'Zobo', 'zobo'], ['boli', 'Boli & groundnut', 'boli', 1]] },
    { id: 'party', name: 'Owambe', color: '#e879f9', items: [['dj', 'DJ on the mix', 'headphones'], ['gele', 'Gele', 'crown', 1], ['asoebi', 'Aso-ebi', 'wardrobe'], ['spray', 'Money spray', 'spray', 1], ['cake', 'Celebration cake', 'cake'], ['drum', 'Talking drum', 'drum']] },
  ];
  const STICKERS = STICKER_SETS.flatMap((s) => s.items.map(([id, name, icon, rare]) => ({ id, name, icon, rare: !!rare, set: s.id, color: s.color })));
  const MYSTICK = Object.assign({}, store.json('ow_stickers', {}));
  const saveStickers = () => store.set('ow_stickers', JSON.stringify(MYSTICK));
  function grantSticker(guaranteeNew) {
    const pool = STICKERS.map((s) => [s.id, (MYSTICK[s.id] ? (guaranteeNew ? 0.0001 : 1) : 3) * (s.rare ? 0.35 : 1)]);
    const id = weightedR(pool);
    const st = STICKERS.find((s) => s.id === id);
    const dup = !!MYSTICK[id];
    MYSTICK[id] = (MYSTICK[id] || 0) + 1;
    saveStickers();
    if (dup) { S.wallet += 50; saveS.wallet(); }
    stats.stickers = Object.keys(MYSTICK).length; G.badgeCheckT = 0;
    if (!S.owned.has('desk:stickers')) { S.owned.add('desk:stickers'); saveS.owned(); }
    const set = STICKER_SETS.find((s) => s.id === st.set);
    if (!dup && set.items.every(([sid]) => MYSTICK[sid])) {
      S.wallet += 3000; saveS.wallet(); stats.stickerSets = (stats.stickerSets || 0) + 1;
      setTimeout(() => { toast(t('setDone')(set.name), 'good', 3200, 'stapler'); confetti(50); }, 1500);
    }
    T('sticker', { id, dup });
    return Object.assign({ dup }, st);
  }
  function collectSticker(it) {
    const st = grantSticker(false);
    floater((st.dup ? '+₦50 · ' : '') + st.name, it.x, it.y - 12, st.color, 15);
    toast((st.dup ? t('stickerDup') : t('stickerNew'))(st.name), 'good', 2000, st.icon);
    Sound.play('badge');
  }
  function renderAlbum() {
    const box = $('album'); box.innerHTML = '';
    $('album-count').textContent = Object.keys(MYSTICK).length + ' / ' + STICKERS.length;
    for (const set of STICKER_SETS) {
      const sec = document.createElement('div'); sec.className = 'album-set';
      const done = set.items.every(([sid]) => MYSTICK[sid]);
      sec.innerHTML = `<h4>${esc(set.name)} <small>${set.items.filter(([sid]) => MYSTICK[sid]).length}/6${done ? ' · ' + esc(t('setComplete')) : ''}</small></h4>`;
      const grid = document.createElement('div'); grid.className = 'album-grid';
      for (const [sid, name, icon, rare] of set.items) {
        const got = MYSTICK[sid] || 0;
        const d = document.createElement('div'); d.className = 'sticker' + (got ? '' : ' is-missing') + (rare ? ' is-rare' : '');
        d.style.setProperty('--sc', set.color);
        d.innerHTML = `<span class="st-disc">${got ? ico(icon) : '?'}</span><small>${got ? esc(name) : esc(rare ? t('rareWord') : '???')}</small>${got > 1 ? '<b>×' + got + '</b>' : ''}`;
        grid.appendChild(d);
      }
      sec.appendChild(grid); box.appendChild(sec);
    }
  }

  /* ---------- Your desk ---------- */
  const DESK_ITEMS = [
    { id: 'plant', icon: 'plant', name: 'Office plant', price: 800 }, { id: 'fan', icon: 'fan', name: 'Standing fan', price: 1500 }, { id: 'gen', icon: 'generator', name: '"I better pass my neighbour" generator', price: 4000 },
    { id: 'laptop', icon: 'laptop', name: 'Laptop', price: 2500 }, { id: 'flag', icon: 'flag', name: 'Desk flag', price: 600 }, { id: 'clock', icon: 'clock', name: 'Wall clock', price: 700 },
    { id: 'flask', icon: 'coffee', name: 'Tea flask', price: 500 }, { id: 'radio', icon: 'radio', name: 'Radio', price: 1200 }, { id: 'lamp', icon: 'bulb', name: 'Desk lamp', price: 900 },
    { id: 'phone2', icon: 'phone', name: 'Office landline', price: 700 }, { id: 'calendar', icon: 'calendar', name: 'Wall calendar', price: 400 }, { id: 'mug', icon: 'mug', name: '"World\'s best Oga" mug', price: 600 },
    { id: 'letter', icon: 'frame', name: 'Framed promotion letter', free: 'promoted' }, { id: 'eotm', icon: 'medal', name: 'Employee of the month', free: 'attendance' },
    { id: 'trophies', icon: 'trophy', name: 'Badge shelf', free: 'badges' }, { id: 'stickers', icon: 'stapler', name: 'Sticker board', free: 'sticker' },
  ];
  const deskFreeOk = (d) => (d.free === 'promoted' ? stats.weeks > 0 : d.free === 'badges' ? unlocked.size >= 5 : d.free === 'attendance' ? S.owned.has('desk:eotm') : d.free === 'sticker' ? Object.keys(MYSTICK).length > 0 : false);
  const deskOwned = (d) => S.owned.has('desk:' + d.id) || (d.free && deskFreeOk(d));
  let DESK = Object.assign({ hide: [] }, store.json('ow_desk', {}));
  const deskShown = () => DESK_ITEMS.filter((d) => deskOwned(d) && !DESK.hide.includes(d.id)).map((d) => d.id);
  function deskData() {
    return { items: deskShown(), badges: Object.values(blevels).reduce((n, v) => n + v, 0), stickers: Object.keys(MYSTICK).length, streak: ATT.streak,
      office: S.office, title: myTitle(), name: S.name || t('newStaff'), own: true };
  }
  function drawDeskScene(cv, d) {
    const r = Math.min(window.devicePixelRatio || 1, 2);
    const w = 360, h = 240;
    cv.width = w * r; cv.height = h * r;
    const c = cv.getContext('2d');
    c.setTransform(r, 0, 0, r, 0, 0);
    const off = officeById(d.office);
    const has = (id) => d.items.includes(id);
    // wall + floor
    c.fillStyle = off.wall; c.fillRect(0, 0, w, h);
    c.fillStyle = mix(off.floor, '#000000', 0.15); c.fillRect(0, 170, w, 70);
    c.fillStyle = 'rgba(255,255,255,.04)'; for (let x = 0; x < w; x += 40) c.fillRect(x, 170, 1, 70);
    // window
    c.fillStyle = '#3a4a6b'; rr(c, 22, 18, 96, 74, 5); c.fill();
    const g = c.createLinearGradient(0, 22, 0, 88); g.addColorStop(0, '#8ecfff'); g.addColorStop(1, '#e3f3ff'); c.fillStyle = g; c.fillRect(26, 22, 88, 66);
    c.save(); c.translate(70, 56); for (let i = 0; i < 7; i++) { c.fillStyle = 'rgba(20,32,58,.7)'; const bh = 12 + hash(i + 3) * 24; c.fillRect(-44 + i * 12.6, 32 - bh, 9, bh); } drawSkylineLandmark(c, off.skyline, true); c.restore();
    c.fillStyle = '#3a4a6b'; c.fillRect(68.5, 22, 3, 66); c.fillRect(26, 53.5, 88, 3);
    // wall items
    if (has('clock')) { c.fillStyle = '#f8fafc'; circle(c, 150, 40, 15); c.fill(); c.strokeStyle = '#111827'; c.lineWidth = 2; c.stroke(); c.beginPath(); c.moveTo(150, 40); c.lineTo(150, 31); c.moveTo(150, 40); c.lineTo(157, 43); c.stroke(); }
    if (has('calendar')) { c.fillStyle = '#fff'; rr(c, 178, 22, 30, 36, 2); c.fill(); c.fillStyle = '#e5484d'; c.fillRect(178, 22, 30, 9); c.fillStyle = '#17203a'; c.font = '900 13px system-ui, Arial'; c.textAlign = 'center'; c.fillText(String(new Date().getDate()), 193, 50); }
    if (has('letter')) { c.fillStyle = '#7a4f2c'; rr(c, 222, 16, 40, 50, 3); c.fill(); c.fillStyle = '#fffef8'; c.fillRect(226, 20, 32, 42); c.fillStyle = '#008751'; c.fillRect(226, 20, 32, 4); c.fillStyle = '#9aa3b5'; for (let i = 0; i < 5; i++) c.fillRect(230, 30 + i * 6, 24 - (i % 2) * 6, 2); }
    if (has('eotm')) { c.fillStyle = '#c98d00'; rr(c, 274, 16, 44, 52, 3); c.fill(); c.fillStyle = '#fff8dc'; c.fillRect(278, 20, 36, 44); c.fillStyle = '#c98d00'; c.font = '900 6px system-ui, Arial'; c.textAlign = 'center'; c.fillText('EMPLOYEE', 296, 30); c.fillText('OF THE', 296, 38); c.fillText('MONTH', 296, 46); circle(c, 296, 56, 4); c.fill(); }
    if (has('stickers')) { c.fillStyle = '#b45309'; rr(c, 150, 66, 66, 40, 3); c.fill(); c.fillStyle = '#d6a96a'; c.fillRect(153, 69, 60, 34); const n = Math.min(12, d.stickers || 0); const cols = ['#f5b301', '#5ab0ff', '#ff8a3c', '#e879f9']; for (let i = 0; i < n; i++) { c.fillStyle = cols[i % 4]; circle(c, 160 + (i % 6) * 9.6, 77 + Math.floor(i / 6) * 14, 4); c.fill(); } }
    if (has('trophies')) {
      c.fillStyle = '#5b3a22'; c.fillRect(232, 98, 96, 5);
      const n = Math.min(5, 1 + Math.floor((d.badges || 0) / 8));
      for (let i = 0; i < n; i++) { const col = ['#cd7f32', '#b8c2cc', '#f5b301', '#8fd3e8', '#6ee7ff'][i]; c.fillStyle = col; c.fillRect(240 + i * 18, 90, 8, 8); c.beginPath(); c.arc(244 + i * 18, 84, 6, 0, Math.PI); c.fill(); c.fillRect(242 + i * 18, 86, 4, 6); }
    }
    // desk
    c.fillStyle = '#7a4f2c'; rr(c, 60, 150, 240, 16, 4); c.fill();
    c.fillStyle = '#5b3a22'; c.fillRect(72, 166, 10, 50); c.fillRect(278, 166, 10, 50); c.fillRect(196, 166, 80, 40);
    c.fillStyle = '#6d4729'; for (let i = 0; i < 3; i++) rr(c, 200, 170 + i * 12, 72, 9, 2), c.fill();
    // person sitting behind desk
    c.save(); c.translate(180, 150); c.scale(1.6, 1.6);
    if (d.own) drawPerson(c, Object.assign(playerParams(S.char, S.outfit, { walk: 0, mood: 'happy', lookY: 0.4 }), { s: 1 }));
    else drawPerson(c, { shirt: off.accent, pants: '#24314f', skin: '#7a4521', hair: 'low', walk: 0, mood: 'happy', badge: '#fff', lookY: 0.4 });
    c.restore();
    c.fillStyle = '#7a4f2c'; rr(c, 60, 150, 240, 16, 4); c.fill(); c.fillStyle = '#8a5a33'; rr(c, 60, 150, 240, 4, 2); c.fill();
    // desk-top items
    if (has('laptop')) { c.fillStyle = '#334155'; rr(c, 196, 128, 46, 24, 2); c.fill(); c.fillStyle = '#5ad1ff'; c.fillRect(199, 131, 40, 18); c.fillStyle = '#94a3b8'; rr(c, 190, 150, 58, 4, 2); c.fill(); }
    if (has('lamp')) { c.strokeStyle = '#111827'; c.lineWidth = 3; c.beginPath(); c.moveTo(262, 150); c.lineTo(270, 120); c.lineTo(286, 116); c.stroke(); c.fillStyle = '#f5b301'; c.beginPath(); c.moveTo(280, 112); c.lineTo(296, 112); c.lineTo(290, 124); c.lineTo(282, 124); c.closePath(); c.fill(); c.fillStyle = 'rgba(255,230,150,.18)'; c.beginPath(); c.moveTo(282, 124); c.lineTo(290, 124); c.lineTo(300, 150); c.lineTo(268, 150); c.closePath(); c.fill(); }
    if (has('flask')) { c.fillStyle = '#e5484d'; rr(c, 92, 120, 14, 30, 4); c.fill(); c.fillStyle = '#fff'; c.fillRect(92, 130, 14, 4); c.fillStyle = '#111827'; rr(c, 94, 116, 10, 5, 2); c.fill(); }
    if (has('mug')) { c.fillStyle = '#fff'; rr(c, 112, 134, 14, 16, 2); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath(); c.arc(127, 142, 4, -1.2, 1.2); c.stroke(); c.fillStyle = '#008751'; c.font = '900 5px system-ui'; c.textAlign = 'center'; c.fillText('OGA', 119, 144); }
    if (has('flag')) { c.fillStyle = '#9ca3af'; c.fillRect(140, 126, 2, 24); c.fillStyle = '#008751'; c.fillRect(142, 126, 6, 12); c.fillStyle = '#fff'; c.fillRect(148, 126, 6, 12); c.fillStyle = '#008751'; c.fillRect(154, 126, 6, 12); }
    if (has('radio')) { c.fillStyle = '#7c2d12'; rr(c, 72, 132, 18, 18, 3); c.fill(); c.fillStyle = '#fdba74'; circle(c, 81, 141, 5); c.fill(); c.strokeStyle = '#111827'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(86, 132); c.lineTo(92, 118); c.stroke(); }
    if (has('phone2')) { c.fillStyle = '#111827'; rr(c, 250, 140, 18, 10, 3); c.fill(); rr(c, 248, 135, 22, 5, 2); c.fill(); }
    // floor items
    if (has('plant')) { c.fillStyle = '#9a5b2e'; rr(c, 18, 196, 26, 26, 4); c.fill(); c.fillStyle = '#1f8a4c'; circle(c, 31, 180, 18); c.fill(); circle(c, 20, 190, 10); c.fill(); circle(c, 42, 188, 10); c.fill(); }
    if (has('fan')) { c.fillStyle = '#9ca3af'; c.fillRect(326, 168, 3, 50); rr(c, 316, 216, 22, 5, 2); c.fill(); c.strokeStyle = '#cbd5e1'; c.lineWidth = 2; circle(c, 327, 160, 14); c.stroke(); c.fillStyle = '#e2e8f0'; for (let i = 0; i < 3; i++) { const a = performance.now() / 120 + (i * TAU) / 3; c.beginPath(); c.ellipse(327 + Math.cos(a) * 6, 160 + Math.sin(a) * 6, 6, 3, a, 0, TAU); c.fill(); } }
    if (has('gen')) { c.fillStyle = '#e5484d'; rr(c, 300, 196, 50, 30, 4); c.fill(); c.fillStyle = '#111827'; rr(c, 304, 200, 20, 14, 2); c.fill(); c.fillStyle = '#facc15'; c.font = '900 4.6px system-ui'; c.textAlign = 'center'; c.fillText('I BETTER PASS', 325, 221); c.fillText('MY NEIGHBOUR', 325, 226); }
    // name plate
    c.fillStyle = '#17203a'; rr(c, 120, 154, 120, 12, 2); c.fill();
    c.fillStyle = '#f5d061'; c.font = '800 7px system-ui, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText((d.name || '').toUpperCase() + (d.title ? ' · ' + d.title.toUpperCase() : ''), 180, 160.5, 116);
    c.textBaseline = 'alphabetic';
    // office + streak tag
    c.fillStyle = 'rgba(0,0,0,.45)'; rr(c, 8, 226, 200, 11, 5); c.fill();
    c.fillStyle = '#fff'; c.font = '700 6.5px system-ui, Arial'; c.textAlign = 'left';
    c.fillText(off.name + ' · ' + off.city + (d.streak ? ' · ' + d.streak + '-day attendance' : ''), 13, 233.5);
  }
  function renderDesk() {
    drawDeskScene($('desk-canvas'), deskData());
    const box = $('desk-items'); box.innerHTML = '';
    for (const d of DESK_ITEMS) {
      if (!deskOwned(d)) continue;
      const on = !DESK.hide.includes(d.id);
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'desk-chip' + (on ? ' is-on' : ''); b.dataset.desk = d.id; b.setAttribute('aria-pressed', String(on));
      b.textContent = d.name;
      box.appendChild(b);
    }
    if (!box.firstChild) box.innerHTML = '<p class="setting-help">' + esc(t('deskEmpty')) + '</p>';
    renderAlbum();
  }
  let deskPushT = 0;
  function pushDesk() {
    clearTimeout(deskPushT);
    if (!HUB.available || !S.name || !S.leagues.length) return;
    deskPushT = setTimeout(() => { hubPost('/desk', { playerId: S.playerId, name: S.name, desk: deskData() }).catch(() => {}); }, 1200);
  }
  async function viewDesk(pid, name) {
    const box = $('desk-view');
    box.hidden = false;
    $('desk-view-name').textContent = t('deskOf')(name);
    const cv = $('desk-view-canvas');
    const c = cv.getContext('2d'); c.clearRect(0, 0, cv.width, cv.height);
    try {
      const j = await hubApi('/desk/' + pid);
      drawDeskScene(cv, Object.assign({}, j.desk, { name: j.name, own: false }));
      T('desk', { action: 'view' });
    } catch (e) { $('desk-view-name').textContent = e.message; }
    box.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  /* ---------- Community hub (State Wars, seasons, invites, desks) ---------- */
  const HUB = { available: false };
  const STATES = { ab: 'Abia', ad: 'Adamawa', ak: 'Akwa Ibom', an: 'Anambra', ba: 'Bauchi', by: 'Bayelsa', be: 'Benue', bo: 'Borno', cr: 'Cross River',
    de: 'Delta', eb: 'Ebonyi', ed: 'Edo', ek: 'Ekiti', en: 'Enugu', fc: 'FCT Abuja', go: 'Gombe', im: 'Imo', ji: 'Jigawa', kd: 'Kaduna',
    kn: 'Kano', kt: 'Katsina', ke: 'Kebbi', ko: 'Kogi', kw: 'Kwara', la: 'Lagos', na: 'Nasarawa', ni: 'Niger', og: 'Ogun', on: 'Ondo',
    os: 'Osun', oy: 'Oyo', pl: 'Plateau', ri: 'Rivers', so: 'Sokoto', ta: 'Taraba', yo: 'Yobe', za: 'Zamfara' };
  S.state = STATES[store.get('ow_state', '')] ? store.get('ow_state', '') : '';
  const HUB_API = CONFIG.LEAGUE_API.replace(/league$/, 'hub');
  function hubApi(path, opts) {
    return fetch(HUB_API + path, Object.assign({ headers: { 'content-type': 'application/json' }, cache: 'no-store' }, opts || {}))
      .then(async (r) => { const j = await r.json().catch(() => ({})); if (!r.ok) { const e = new Error(j.error || ('Error ' + r.status)); e.status = r.status; throw e; } return j; });
  }
  const hubPost = (path, body) => hubApi(path, { method: 'POST', body: JSON.stringify(body) });
  function probeHub() {
    if (!/^https?:$/.test(location.protocol)) return;
    hubApi('/health').then((j) => {
      if (!j || !j.ok) return;
      HUB.available = true;
      for (const id of ['btn-season', 'btn-states', 'btn-invite']) $(id).hidden = false;
      claimReferralLater();
      pushDesk();
      refreshMenu();
    }).catch(() => {});
  }
  function fillStateSelect(sel) {
    sel.innerHTML = `<option value="">${esc(t('pickState'))}</option>` + Object.entries(STATES).sort((a, b) => a[1].localeCompare(b[1])).map(([id, n]) => `<option value="${id}"${id === S.state ? ' selected' : ''}>${esc(n)}</option>`).join('');
  }
  function setState(id) {
    S.state = STATES[id] ? id : '';
    store.set('ow_state', S.state);
    T('statewar', { action: 'pick', state: S.state });
    for (const sel of [$('set-state'), $('states-pick')]) if (sel) sel.value = S.state;
    if (G.state === 'states') renderStates();
    refreshMenu();
  }
  let statesSort = 'total';
  function renderStates() {
    fillStateSelect($('states-pick'));
    const list = $('states-list'), st = $('states-status');
    list.innerHTML = ''; st.textContent = t('leagueLoading');
    if (!HUB.available) { st.textContent = t('hubOffline'); return; }
    hubApi('/states?me=' + encodeURIComponent(S.playerId)).then((j) => {
      st.textContent = j.lastWinner ? t('statesLastWinner')(j.lastWinner.name) : '';
      const rows = j.states.slice().sort((a, b) => (statesSort === 'avg' ? b.avg - a.avg : b.total - a.total) || a.name.localeCompare(b.name));
      const max = Math.max(1, ...rows.map((r) => (statesSort === 'avg' ? r.avg : r.total)));
      rows.forEach((r, i) => {
        const v = statesSort === 'avg' ? r.avg : r.total;
        const li = document.createElement('li');
        li.className = (r.id === (j.me && j.me.state || S.state) ? 'is-me' : '') + (i < 3 && v > 0 ? ' is-top' : '');
        li.innerHTML = `<span class="sw-rank">${i + 1}</span><span class="sw-name">${esc(r.name)}</span><span class="sw-bar"><i style="width:${(v / max) * 100}%"></i></span><span class="sw-n">${fmtNum(v)}</span><small>${esc(t('statesPlayers')(r.players))}</small>`;
        list.appendChild(li);
      });
      const me = j.me;
      $('states-me').textContent = me ? t('statesMine')(STATES[me.state], fmtNum(me.sum), me.shifts) + (S.state && me.state !== S.state ? ' ' + t('statesSwitchNote') : '')
        : S.state ? t('statesNone')(STATES[S.state]) : t('statesPickFirst');
    }).catch((e) => { st.textContent = e.message; });
  }
  async function myPid() {
    if (S.pid) return S.pid;
    try { const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('pid:' + S.playerId)); S.pid = [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 12); } catch (e) { S.pid = ''; }
    return S.pid;
  }
  async function inviteFriend() {
    const pid = await myPid();
    const base = shareBase();
    let url = base;
    try { const u = new URL(base); u.search = ''; if (pid) u.searchParams.set('ref', pid); url = u.toString(); } catch (e) { /* keep base */ }
    const text = t('inviteText')(url);
    T('invite', { action: 'share' });
    if (navigator.share) { try { await navigator.share({ title: CONFIG.TITLE, text }); return; } catch (e) { if (e && e.name === 'AbortError') return; } }
    const ok = await copyText(text);
    toast(ok ? t('inviteCopied') : text, 'good', 2800, 'invite2');
  }
  // remember an invite link on first visit; claim after the first finished shift
  (() => {
    const ref = (new URLSearchParams(location.search).get('ref') || '').toLowerCase();
    if (/^[0-9a-f]{12}$/.test(ref) && !store.get('ow_ref', '') && stats.games === 0) store.set('ow_ref', ref);
  })();
  function claimReferralLater() {
    const ref = store.get('ow_ref', '');
    if (!ref || ref === 'done' || !HUB.available || stats.games < 1) return;
    hubPost('/referral', { playerId: S.playerId, name: S.name, ref }).then((j) => {
      store.set('ow_ref', 'done');
      S.wallet += j.bonus; saveS.wallet(); refreshMenu();
      toast(t('inviteBonus')(fmtNum(j.bonus)), 'good', 3200, 'invite2');
      T('invite', { action: 'claimed' });
    }).catch((e) => { if (e.status === 409 || e.status === 400) store.set('ow_ref', 'done'); });
  }

  /* ---------- After every shift: State Wars, season board, season XP ---------- */
  function afterShiftV7(run) {
    seasonXp(Math.min(500, run.score / 20), false);
    if (run.duration >= 60) stats.longShifts = (stats.longShifts || 0) + 1;
    if (!HUB.available || run.score <= 0) return;
    if (S.state) hubPost('/state', { playerId: S.playerId, state: S.state, score: run.score, duration: run.duration, level: run.level })
      .then((j) => { if (j.counted) { G.stateNote = t('statesAdded')(fmtNum(run.score), STATES[j.state]); const el = $('over-nudges'); const li = el.querySelector('.is-state'); if (li) li.lastElementChild.textContent = G.stateNote; } }).catch(() => {});
    if (S.name) hubPost('/season', { playerId: S.playerId, name: S.name, state: S.state, score: run.score, duration: run.duration, level: run.level }).catch(() => {});
    claimReferralLater();
    pushDesk();
  }

  /* ---------- "One more shift": the nearest goals on the appraisal ---------- */
  function nudges(score) {
    const out = [];
    const add = (pri, ico_, text, k, cls) => out.push({ pri, ico: ico_, text, k: clamp(k, 0, 1), cls: cls || '' });
    const best = G.bestAtStart;
    if (best > 0 && score < best && score >= best * 0.55) add(10 + (score / best) * 10, 'trophy', t('nudgeBest')(fmtNum(best - score)), score / best);
    const gh = G.ghost;
    if (gh && !gh.passed && score >= gh.score * 0.5) add(18, 'ghost', t('nudgeGhost')(gh.mine ? t('ghostYou') : gh.name, fmtNum(gh.score - score)), score / gh.score);
    let bb = null;
    for (const b of BADGES) {
      const lv = blevels[b.id] || 0, goal = tierGoal(b, lv), have = Math.min(stats[b.stat] || 0, goal);
      const prev = lv ? tierGoal(b, lv - 1) : 0;
      const k = (have - prev) / Math.max(1, goal - prev);
      if (k < 1 && (!bb || k > bb.k)) bb = { b, lv, goal, have, k };
    }
    if (bb && bb.k > 0.25) add(8 + bb.k * 10, bb.b.ico, t('nudgeBadge')(bb.b.desc(bb.goal), bb.b.name, tierName(bb.lv + 1), fmtNum(tierReward(bb.lv))), bb.k);
    const wk = weeklyList().filter((c) => !c.done).sort((a, b) => b.cur / b.goal - a.cur / a.goal)[0];
    if (wk && wk.cur > 0) add(9 + (wk.cur / wk.goal) * 8, 'calendar', t('nudgeWeekly')(wk.text(wk.goal), fmtNum(wk.cur), fmtNum(wk.goal), fmtNum(wk.reward)), wk.cur / wk.goal);
    const nextOff = OFFICES.find((o) => !officeUnlocked(o));
    if (nextOff) add(6 + ((stats.totalScore || 0) / nextOff.score) * 6, 'office', t('nudgeOffice')(fmtNum(Math.max(0, nextOff.score - (stats.totalScore || 0))), nextOff.name, nextOff.weeks), (stats.totalScore || 0) / nextOff.score);
    const sx = SEASON.tier < SEASON_REWARDS.length ? (SEASON.tier + 1) * SEASON_TIER_XP - SEASON.xp : 0;
    if (sx > 0) add(5, 'season', t('nudgeSeason')(fmtNum(sx), SEASON.tier + 1), 1 - sx / SEASON_TIER_XP);
    const pv = attPreview();
    if (pv.signed) add(4, 'calendar', t('nudgeTomorrow')(fmtNum(ATT_REWARDS[pv.day % 7])), pv.day / 7);
    out.sort((a, b) => b.pri - a.pri);
    const top = out.slice(0, 3);
    if (HUB.available && S.state) top.push({ ico: 'map', text: t('statesAdding')(STATES[S.state]), k: -1, cls: 'is-state' });
    else if (HUB.available && !S.state) top.push({ ico: 'map', text: t('statesPrompt'), k: -1, cls: 'is-state' });
    return top;
  }
  function renderNudges(score) {
    const ul = $('over-nudges');
    const list = nudges(score);
    ul.hidden = !list.length;
    ul.innerHTML = '';
    for (const n of list) {
      const li = document.createElement('li');
      li.className = n.cls;
      li.innerHTML = ico(n.ico) + '<span></span>' + (n.k >= 0 ? `<i class="nd-bar"><b style="width:${Math.round(n.k * 100)}%"></b></i>` : '');
      li.querySelector('span').textContent = n.text;
      ul.appendChild(li);
    }
  }

  /* ---------- Offices screen ---------- */
  function renderOffices() {
    const box = $('office-list'); box.innerHTML = '';
    for (const o of OFFICES) {
      const open = officeUnlocked(o), on = S.office === o.id;
      const card = document.createElement('div');
      card.className = 'office-opt' + (on ? ' is-on' : '') + (open ? '' : ' is-locked');
      card.style.setProperty('--oc', o.accent); card.style.setProperty('--ow', o.wall); card.style.setProperty('--of', o.floor);
      const cv = document.createElement('canvas'); cv.width = 72; cv.height = 84; cv.className = 'office-boss';
      card.appendChild(cv);
      const body = document.createElement('div'); body.className = 'office-body';
      body.innerHTML = `<strong></strong><small class="oc-city"></small><p class="oc-blurb"></p><p class="oc-meta"></p>`;
      body.querySelector('strong').textContent = o.name;
      body.querySelector('.oc-city').textContent = o.city + ' · ' + t('bossIs')(o.boss.title === 'OGA' ? 'Oga' : o.boss.title.toLowerCase().replace(/(^|\s)\S/g, (m) => m.toUpperCase()));
      body.querySelector('.oc-blurb').textContent = o.blurb;
      body.querySelector('.oc-meta').textContent = open ? (on ? t('officeHere') : t('officeOpen')) : t('officeLock')(o.rank, o.weeks, fmtNum(o.score), fmtNum(stats.totalScore || 0));
      card.appendChild(body);
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'btn ' + (on ? 'btn-ghost' : 'btn-primary') + ' btn-small'; b.dataset.office = o.id;
      b.disabled = !open || on;
      b.innerHTML = ico(open ? (on ? 'check' : 'office') : 'lock') + '<span></span>';
      b.lastChild.textContent = on ? t('officeHereBtn') : open ? t('officeGo') : t('locked');
      card.appendChild(b);
      box.appendChild(card);
      const c = cv.getContext('2d'); const r = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = 72 * r; cv.height = 84 * r; c.setTransform(r, 0, 0, r, 0, 0);
      c.fillStyle = o.floor; c.fillRect(0, 0, 72, 84);
      c.translate(36, 52); SPRITES.boss(c, 0, { s: 1.05, lookY: 0.3, office: o });
    }
  }
  function setOffice(id) {
    const o = officeById(id);
    if (!officeUnlocked(o)) return;
    S.office = o.id; store.set('ow_office', o.id);
    T('setting', { k: 'office', v: o.id });
    renderOffices(); refreshMenu(); pushDesk();
    toast(t('officeMoved')(o.name), 'good', 1800, 'office');
    Sound.play('click');
  }

  /* ---------- Reminders: local, opt-in, installed app only (no sign-up, nothing stored on a server) ---------- */
  S.reminders = store.get('ow_remind', '0') === '1';
  async function syncReminderConfig() {
    if (!('caches' in window)) return;
    try {
      const c = await caches.open('ow-config');
      const cfg = { on: S.reminders, playerId: S.playerId, api: new URL(CONFIG.LEAGUE_API, location.href).href, leagues: S.leagues.map((l) => l.code),
        ranks: store.json('ow_lgranks', {}), attLast: ATT.last, attDayNext: attPreview().signed ? 0 : ATT_REWARDS[attPreview().day - 1], name: S.name,
        weekly: weekKeyLocal(), lastNote: (await c.match('/__ow_config').then((r) => (r ? r.json() : {})).catch(() => ({}))).lastNote || '' };
      await c.put('/__ow_config', new Response(JSON.stringify(cfg), { headers: { 'content-type': 'application/json' } }));
    } catch (e) { /* ignore */ }
  }
  async function setReminders(on) {
    const help = $('reminders-help');
    if (on) {
      if (!('Notification' in window) || !('serviceWorker' in navigator)) { help.textContent = t('remindNo'); on = false; }
      else {
        const perm = await Notification.requestPermission().catch(() => 'denied');
        if (perm !== 'granted') { help.textContent = t('remindDenied'); on = false; }
        else {
          try {
            const reg = await navigator.serviceWorker.ready;
            if (reg.periodicSync) { await reg.periodicSync.register('ow-reminders', { minInterval: 12 * 3600 * 1000 }); help.textContent = t('remindOn'); }
            else help.textContent = t('remindLimited');
          } catch (e) { help.textContent = t('remindLimited'); }
        }
      }
    } else {
      try { const reg = await navigator.serviceWorker.ready; if (reg.periodicSync) await reg.periodicSync.unregister('ow-reminders'); } catch (e) { /* ignore */ }
    }
    S.reminders = on;
    store.set('ow_remind', on ? '1' : '0');
    T('setting', { k: 'reminders', v: on ? 'on' : 'off' });
    syncSettingsUi();
    syncReminderConfig();
  }

  /* ==================== Update ==================== */
  function updatePlayer(dt) {
    const p = G.player;
    let ax = 0, ay = 0;
    if (keys.has('L')) ax -= 1;
    if (keys.has('R')) ax += 1;
    if (keys.has('U')) ay -= 1;
    if (keys.has('D')) ay += 1;
    const coffeeT = [0, 20, 35][Math.min(2, (G.upg && G.upg.coffee) || 0)];
    const zone = G.zones && G.zones.length ? zoneAt(p.x, p.y) : null;
    const slip = zone && zone.kind === 'wet';
    const spd = CONFIG.PLAYER_SPEED * (p.fuel > 0 ? 1.45 : 1) * (1 + 0.05 * ((G.upg && G.upg.chair) || 0)) * (G.phase === 'office' && G.time < coffeeT ? 1.2 : 1) * (zone && zone.kind === 'puddle' ? 0.55 : 1);
    if (zone && Math.hypot(p.vx, p.vy) > 40 && Math.random() < (hiQ() ? 0.5 : 0.2)) G.particles.push({ x: p.x + frand(-10, 10), y: p.y + 18, vx: frand(-50, 50), vy: frand(-70, -20), life: 0.4, max: 0.4, color: '#9fd8ff', size: frand(2, 3.5) });
    if (S.look.trail && G.state === 'playing' && Math.hypot(p.vx, p.vy) > 60) {
      G.trailT = (G.trailT || 0) - (1 / 60);
      if (G.trailT <= 0) { G.trailT = hiQ() ? 0.09 : 0.2; if (G.particles.length < 300) G.particles.push({ x: p.x + frand(-8, 8), y: p.y + 16, vx: frand(-30, 30), vy: frand(10, 50), life: 0.7, max: 0.7, color: '#7fd18b', size: 3, text: '₦' }); }
    }
    if (ax || ay) {
      const len = Math.hypot(ax, ay);
      const tvx = (ax / len) * spd, tvy = (ay / len) * spd;
      const k = Math.min(1, dt * (slip ? 2.2 : 16));
      p.vx += (tvx - p.vx) * k; p.vy += (tvy - p.vy) * k;
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.tx = p.x; p.ty = p.y;
    } else if (drag.used) {
      const dx = p.tx - p.x, dy = p.ty - p.y;
      const dist = Math.hypot(dx, dy);
      const maxStep = spd * (slip ? 1.1 : 2.4) * dt;
      if (slip) { p.x += p.vx * 0.5 * dt; p.y += p.vy * 0.5 * dt; }
      if (dist > 0.01) {
        const st = Math.min(dist, maxStep);
        p.vx = (dx / dist) * st / dt; p.vy = (dy / dist) * st / dt;
        p.x += (dx / dist) * st; p.y += (dy / dist) * st;
      } else { p.vx = 0; p.vy = 0; }
    } else {
      const k = Math.min(1, dt * (slip ? 1.2 : 12));
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
    G.lastHit = o.type === 'boss' ? 'oga' : o.convoy ? 'convoy' : o.type;
    missionProgress('hit');
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
    if (G.lives <= 0 && !G.revived && G.upg === S.upg && S.upg.sick > 0) {
      G.revived = true; S.upg.sick--; saveS.upg(); stats.sickUsed++; G.badgeCheckT = 0;
      G.lives = 1; p.invuln = 2.6; G.flash = 0;
      T('powerup_use', { id: 'sick' });
      setTimeout(() => { if (G.state === 'playing') { toast(t('sickBack'), 'good', 2600); confetti(24); } }, 250);
      return;
    }
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
        case 'dancer': case 'rosey':
          o.y += o.vy * dt;
          o.x = clamp(o.baseX + Math.sin(o.t * 2.6 + o.phaseOff) * 34, FX0 + 24, FX1 - 24);
          break;
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
          if (o.talkT <= 0) { o.talk = bossTalkLine(); o.talkT = 2.2; }
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
        const hit = o.type === 'printer' || o.type === 'danfo' || o.type === 'queue' ? collidesRect(o, p) : collidesCircle(o, p);
        if (hit) {
          if (o.commute) {
            if (p.invuln <= 0) hitCommute(o);
          } else if (o.bump) {
            if (p.leave > 0) { bonk(o); remove = true; } else if (p.invuln <= 0) bumpPlayer(o);
          } else if (o.collector) {
            if (p.leave > 0) { toast(t('bdayLeave'), 'good', 1400); o.hitDone = true; o.life = 0; } else if (p.invuln <= 0) payContribution(o);
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
          missionProgress('close');
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
      const posL = (G.upg && G.upg.pos) || 0;
      if (posL && G.state === 'playing' && ITEMS[it.type] && ITEMS[it.type].pts > 0) {
        const dx = p.x - it.x, dy = p.y - it.y, d = Math.hypot(dx, dy), reach = posL > 1 ? 120 : 75;
        if (d < reach && d > 1) { const pull = (posL > 1 ? 420 : 300) * dt; it.x += (dx / d) * pull; it.y += (dy / d) * pull; }
      }
      if (it.y > H + 40) { G.items.splice(i, 1); continue; }
      if (G.state !== 'playing') continue;
      if (Math.hypot(it.x - p.x, it.y - p.y) < it.r + p.r + 6) {
        G.items.splice(i, 1);
        collect(it);
      }
    }
  }

  function collect(it) {
    if (it.type === 'sticker') { G.collected++; stats.stickerTotal = (stats.stickerTotal || 0) + 1; collectSticker(it); return; }
    const d = ITEMS[it.type];
    const p = G.player;
    missionProgress('item', it.type);
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
      let evMult = evIs('independence') ? 2 : 1, evNote = '';
      if (evIs('owambe') && it.type === 'lunch') evMult *= 2;
      if (evIs('netdown') && it.type === 'data') { evMult = 0; evNote = t('noNetwork'); }
      if (evIs('alertdelay') && it.type === 'salary') { evMult *= 0.5; evNote = t('pending'); }
      const pts = G.frozen > 0 && it.type !== 'friday' ? 0 : Math.round((d.pts + (it.type === 'lunch' ? 25 * ((G.upg && G.upg.canteen) || 0) : 0)) * mult * evMult);
      addScore(pts);
      if (evNote && !pts) floater(evNote, it.x, it.y - 10, '#c7d2fe', 15);
      else if (evNote) floater('+' + pts + ' ' + evNote, it.x, it.y - 10, '#c7d2fe', 15);
      else if (pts === 0) floater(t('frozenPick'), it.x, it.y - 10, '#7fe0ff', 15);
      else if (!evNote) floater('+' + pts + (mult > 1 ? ' (x' + mult + ')' : ''), it.x, it.y - 10, d.color, it.type === 'friday' ? 20 : 16);
    }
    if (d.power === 'leave') { p.leave = d.dur; p.invuln = 0; toast(t('leave'), 'good', 1800); Sound.play('power'); say('leave'); }
    else if (d.power === 'fuel') {
      p.fuel = d.dur; Sound.play('power');
      const slot = G.event && G.event.id === 'genfuel' ? 'event' : G.event2 && G.event2.id === 'genfuel' ? 'event2' : '';
      if (slot) { addScore(200); floater('+200', p.x, p.y - 50, '#ffd34d', 16); G[slot].t = 0; G.dim = 0; toast(t('genOn'), 'good', 2000); }
      else toast(t('fuel'), 'good', 1600);
    }
    else if (d.event) { Sound.play('big'); confetti(it.type === 'cake' ? 30 : 8); if (it.type === 'cake') toast(t('cakeGot'), 'good', 1600); }
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
    const inCommute = G.state === 'playing' && G.phase === 'commute';
    if (inCommute) {
      updateCommute(dt);
      updateHud(false);
      perf.sample(dt);
    }
    if (G.state === 'playing') {
      if (G.rec) ghostRecordTick(dt);
      if (G.ghost) ghostTick(dt);
    }
    if (inCommute) { /* handled above */ } else if (G.state === 'playing') {
      G.time += dt;
      if (G.limit && G.time >= G.limit) {
        G.time = G.limit; G.timeUp = true; G.lastHit = 'timeup';
        if (G.black) endBlackout(true);
        if (Music) Music.stop(0.6);
        banner(t('lgTimeUp'));
        gameOver();
        return;
      }
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
      addScore(DIFFICULTY.survivalPerSecond * Math.min(G.level, 25) * dt * (evIs('audit') ? 2 : 1) * (evIs('independence') ? 2 : 1) * (evIs('hq') ? (G.idleT > 0.9 ? 0 : 1.5) : 1));
      G.scroll += floorSpeed() * dt;

      updatePlayer(dt);
      tickMeeting(dt);
      if (G.meet) { G.spawnT = Math.max(G.spawnT, 0.6); G.bossT = Math.max(G.bossT, 3); G.blackT = Math.max(G.blackT, 3); G.eventT = Math.max(G.eventT || 0, 3); }
      tickHazards(dt);
      tickMission(dt);

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
        { const dl = curOffice().doors[((x * 7 + y) | 0) % 2 ? 0 : 1]; c.font = (dl.length > 12 ? '800 4.8px' : '800 6.5px') + ' system-ui, Arial, sans-serif'; c.fillText(dl, 0, -34.5, 30); }
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
      default:
        drawDecorV7(c, kind, side, tm);
        break;
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
        if (curOffice().skyline !== 'lagos') drawSkylineLandmark(c, curOffice().skyline, day);
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
    const OFF = curOffice();
    c.fillStyle = OFF.wall;
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
      c.fillStyle = OFF.edge;
      c.fillRect(FX0 - 6, 0, 6, H); c.fillRect(FX1, 0, 6, H);
    }
    // carpet floor (scrolling texture)
    const TILE = 64;
    const off = G.scroll % TILE;
    const cx = (FX0 + FX1) / 2;
    const CARPET = OFF.id === 'agency' ? carpetPat : carpetFor(OFF);
    if (CARPET) {
      c.save();
      c.beginPath(); c.rect(FX0, 0, FX1 - FX0, H); c.clip();
      const ox = cx % TILE;
      c.translate(ox, off);
      c.fillStyle = CARPET;
      c.fillRect(FX0 - ox - TILE, -TILE, FX1 - FX0 + TILE * 2, H + TILE * 2);
      c.restore();
    } else {
      c.fillStyle = COLORS.floor; c.fillRect(FX0, 0, FX1 - FX0, H);
    }
    // centre walkway runner
    c.fillStyle = `rgba(${OFF.runner},.12)`;
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
      const DEC = OFF.decor || WALL_DECOR;
      const kl = DEC[Math.floor(hash(id * 1.37) * DEC.length)];
      const kr = DEC[Math.floor(hash(id * 2.91 + 9) * DEC.length)];
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

  function drawZones(c, tm) {
    for (const z of G.zones) {
      c.save(); c.translate(z.x, z.y);
      if (z.kind === 'puddle') {
        c.fillStyle = 'rgba(70,140,210,.55)'; c.beginPath(); c.ellipse(0, 0, z.w / 2, z.h / 2, 0, 0, TAU); c.fill();
        c.strokeStyle = 'rgba(200,230,255,.6)'; c.lineWidth = 1.5;
        const r = ((tm * 0.9 + z.x * 0.01) % 1);
        c.beginPath(); c.ellipse(0, 0, (z.w / 2) * r, (z.h / 2) * r, 0, 0, TAU); c.stroke();
      } else {
        c.fillStyle = 'rgba(180,225,255,.35)'; rr(c, -z.w / 2, -z.h / 2, z.w, z.h, 10); c.fill();
        c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(-z.w / 2 + 8, -z.h / 2 + 6, z.w * 0.5, 2.5);
        // yellow caution sign
        c.fillStyle = '#facc15'; c.beginPath(); c.moveTo(z.w / 2 - 14, -z.h / 2 - 14); c.lineTo(z.w / 2 - 2, -z.h / 2 + 8); c.lineTo(z.w / 2 - 26, -z.h / 2 + 8); c.closePath(); c.fill();
        c.fillStyle = '#111827'; c.font = '900 10px system-ui, Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('!', z.w / 2 - 14, -z.h / 2 + 1);
      }
      c.restore();
    }
  }
  function drawEventOverlay(c, tm) {
    if (evIs('flood')) {
      c.strokeStyle = 'rgba(170,200,255,.35)'; c.lineWidth = 1.2;
      c.beginPath();
      for (let i = 0; i < (hiQ() ? 70 : 30); i++) {
        const x = (i * 97.3 + tm * 60) % (W + 40) - 20, y = (i * 53.7 + tm * 620) % (H + 40) - 20;
        c.moveTo(x, y); c.lineTo(x - 4, y + 14);
      }
      c.stroke();
      c.fillStyle = 'rgba(40,70,110,.12)'; c.fillRect(0, 0, W, H);
    }
    if (evIs('harmattan')) {
      const p = G.player;
      const g = c.createRadialGradient(p.x, p.y, 60, p.x, p.y, Math.max(W, H) * 0.55);
      g.addColorStop(0, 'rgba(214,190,150,0)'); g.addColorStop(0.45, 'rgba(214,190,150,.45)'); g.addColorStop(1, 'rgba(214,190,150,.78)');
      c.fillStyle = g; c.fillRect(0, 0, W, H);
    }
    if (evIs('independence')) {
      c.fillStyle = 'rgba(0,135,81,.85)'; c.fillRect(0, 0, 6, H); c.fillRect(W - 6, 0, 6, H);
      c.fillStyle = 'rgba(255,255,255,.85)'; c.fillRect(6, 0, 4, H); c.fillRect(W - 10, 0, 4, H);
    }
    if (evIs('hq')) {
      const x = FX1 - 34, y = 96;
      c.save(); c.translate(x, y);
      drawPerson(c, { shirt: '#111827', sleeve: '#111827', pants: '#111827', suit: true, tie: '#5ab0ff', skin: '#f1c27d', hair: 'low', hairColor: '#7a4b22', glasses: true, papers: true, mood: 'angry', walk: 0, lookX: -0.6, s: 0.95 });
      c.restore();
      drawTag(c, x, y - 52, 'HQ', '#111827', '#fff');
      if (G.idleT > 0.9) speech(c, t('lookBusy'), x - 10, y - 64);
    }
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
      if (G.zones && G.zones.length) drawZones(c, tm);
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
          if (o.collector) { c.fillStyle = '#fff7d6'; rr(c, 8, -4, 14, 10, 1.5); c.fill(); c.strokeStyle = '#b45309'; c.lineWidth = 1; c.beginPath(); c.moveTo(8, -4); c.lineTo(15, 2); c.lineTo(22, -4); c.stroke(); }
          c.restore();
          if (o.life > 0) speech(c, G.calm > 0 ? t('thanks') : o.talk, o.x, o.y - 34);
          continue;
        }
        c.rotate(o.rot || 0);
        SPRITES[o.type](c, o.t);
        c.restore();
      }
      if (G.ghost) drawGhost(c, tm);
      if (G.meet) drawMeeting(c, tm);
      if (G.gust) drawGust(c, tm);
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
    else if (playingish && G.dim > 0.01) drawDarkness(c, G.dim);
    if (playingish && G.phase !== 'commute') drawEventOverlay(c, tm);
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

  function drawPortrait(cv, charId, outfitId, zoomed, look) {
    const r = Math.min(window.devicePixelRatio || 1, 3);
    // remember the CSS size once, so redrawing while hidden doesn't grow the canvas
    if (!cv.dataset.w) { cv.dataset.w = cv.clientWidth || parseInt(cv.getAttribute('width'), 10) || 64; cv.dataset.h = cv.clientHeight || parseInt(cv.getAttribute('height'), 10) || 76; }
    const w = cv.clientWidth || +cv.dataset.w;
    const h = cv.clientHeight || +cv.dataset.h;
    cv.width = Math.round(w * r); cv.height = Math.round(h * r);
    const c = cv.getContext('2d');
    c.setTransform(r, 0, 0, r, 0, 0);
    c.clearRect(0, 0, w, h);
    c.save();
    if (zoomed) {
      // zoom out a little for tall hair and hats so they aren't cropped
      const pp = playerParams(charId, outfitId, {}, look);
      const tall = pp.cap === 'gele' || pp.cap === 'santa' ? 1.3 : pp.cap || pp.hair === 'afro' || pp.hair === 'puff' ? 1.16 : 1;
      const s = h / (46 * tall);
      c.translate(w / 2, h * 0.5 + 22 * s + (tall - 1) * h * 0.32);
      SPRITES.player(c, 0, { char: charId, outfit: outfitId, walk: 0, mood: 'happy', s, lookY: 0.2, look });
    } else {
      const s = h / 80;
      c.translate(w / 2, h * 0.62);
      SPRITES.player(c, 0, { char: charId, outfit: outfitId, walk: 0, mood: 'happy', s, lookY: 0.2, look });
    }
    c.restore();
  }

  function refreshMenu() {
    ui.menuBest.textContent = fmtNum(G.best);
    ui.menuName.textContent = S.name || t('newStaff');
    const ri = Math.max(RANKS.findIndex((r) => r[1] === rankFor(G.best)), stats.weeks > 0 ? Math.min(RANKS.length - 1, stats.weeks + 1) : 0);
    ui.menuRank.textContent = myTitle() || RANKS[ri][1];
    ui.menuName.classList.toggle('is-gold', myFlair().gold);
    ui.menuBadges.textContent = unlocked.size + '/' + BADGES.length;
    const wl = weeklyList(), wd = wl.filter((c) => c.done).length;
    $('weekly-card-text').textContent = t('weeklyCard')(wd, weekDaysLeft());
    { const off = officeById(S.office); $('office-name').textContent = off.name + ' · ' + off.city.split(',').pop().trim();
      const nOpen = unlockedIds().length; $('office-more').textContent = t('officeCount')(nOpen, OFFICES.length);
      $('office-card').style.setProperty('--oc', off.accent);
      const pv = attPreview(); $('att-card-text').textContent = pv.signed ? t('attCardDone')(ATT.streak, fmtNum(ATT_REWARDS[pv.day % 7])) : t('attCard')(pv.day, fmtNum(ATT_REWARDS[pv.day - 1]));
      $('att-card').classList.toggle('is-ready', !pv.signed); }
    $('weekly-dots').innerHTML = wl.map((c) => '<i class="' + (c.done ? 'on' : '') + '"></i>').join('');
    ui.idPhoto.classList.toggle('is-gold-frame', !!stats.goldSet);
    $('menu-wallet').textContent = '₦' + fmtNum(S.wallet);
    $('career-sub').textContent = t('careerSub')(S.career.week, t('days')[S.career.day]) + ': ' + t('goalText')(careerDay().type, goalTarget());
    const inv = LG.invite;
    $('invite-card').hidden = !inv;
    if (inv) $('invite-text').innerHTML = t('leagueInvite')(esc(inv.name));
    ui.fridayNote.hidden = !isFridayNow();
    const db = dailyBest();
    ui.dailySub.textContent = db > 0 ? t('dailyBest')(fmtNum(db)) : t('dailyNone');
    drawPortrait(ui.idPhoto, S.char, S.outfit, true);
    const c = G.challenge;
    ui.challengeCard.hidden = !c;
    if (c) ui.challengeText.innerHTML = t('challengeCard')(c.by, fmtNum(c.score), c.daily);
  }

  function renderWardrobe() {
    paintSkinPick($('skin-pick'));
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
        hint.innerHTML = ico(o.buy ? 'shop' : 'lock'); hint.append(' ' + (b ? b.desc(tierGoal(b, 0)) : o.buy ? t('shopOnly') : t('locked')));
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
    renderWeekly();
    const list = $('badge-list');
    list.innerHTML = '';
    let levels = 0;
    const sorted = BADGES.slice().sort((a, b) => (blevels[b.id] || 0) - (blevels[a.id] || 0));
    for (const b of sorted) {
      const lv = blevels[b.id] || 0;
      levels += lv;
      const next = tierGoal(b, lv), prev = lv ? tierGoal(b, lv - 1) : 0, have = stats[b.stat] || 0;
      const li = document.createElement('li');
      if (lv) li.className = 'is-got';
      li.innerHTML = '<span class="b-ico" aria-hidden="true"></span><span class="b-main"><span class="b-name"></span> <span class="b-tier"></span><span class="b-desc"></span><span class="b-bar"><i></i></span></span><span class="b-prog"></span>';
      const ic = li.querySelector('.b-ico');
      ic.innerHTML = ico(b.ico) + (lv > 1 ? '<b>' + lv + '</b>' : '');
      if (lv) ic.style.background = tierColor(lv);
      li.querySelector('.b-name').textContent = b.name;
      const tr = li.querySelector('.b-tier');
      tr.textContent = lv ? tierName(lv) : t('locked');
      if (lv) tr.style.color = lv >= 3 ? '#7a5200' : '#4a5570';
      li.querySelector('.b-desc').textContent = (lv ? t('nextLevel') + ': ' : '') + b.desc(next) + ' · ' + t('rewardTxt')(fmtNum(tierReward(lv)));
      li.querySelector('.b-bar i').style.width = clamp(((have - prev) / Math.max(1, next - prev)) * 100, 0, 100).toFixed(1) + '%';
      li.querySelector('.b-prog').textContent = fmtNum(Math.min(have, next)) + ' / ' + fmtNum(next);
      list.appendChild(li);
    }
    $('badge-count').textContent = unlocked.size + ' / ' + BADGES.length + ' · ' + t('levelsTotal')(levels);
    const g = GOLD_SET.filter((id) => (blevels[id] || 0) >= 3).length;
    $('goldset-line').innerHTML = ico('crown') + ' ';
    $('goldset-line').append(stats.goldSet ? t('goldSetDone') : t('goldSetProg')(g, GOLD_SET.length));
    $('goldset-line').classList.toggle('is-done', !!stats.goldSet);
  }
  function renderWeekly() {
    const list = $('weekly-list');
    list.innerHTML = '';
    const items = weeklyList();
    for (const c of items) {
      const li = document.createElement('li');
      if (c.done) li.className = 'is-done';
      li.innerHTML = '<span class="w-ico" aria-hidden="true"></span><span class="w-main"><span class="w-text"></span><span class="b-bar"><i></i></span></span><span class="w-reward"></span>';
      li.querySelector('.w-ico').innerHTML = ico(c.done ? 'check' : c.ico);
      li.querySelector('.w-text').textContent = c.text(c.goal) + (c.per === 'week' ? ' ' + t('thisWeek') : '');
      li.querySelector('.b-bar i').style.width = ((c.cur / c.goal) * 100).toFixed(1) + '%';
      li.querySelector('.w-reward').textContent = c.done ? t('paid') : (c.per === 'week' ? fmtNum(c.cur) + '/' + fmtNum(c.goal) + ' · ' : '') + '₦' + fmtNum(c.reward);
      list.appendChild(li);
    }
    const st = weeklyState();
    $('weekly-left').textContent = t('daysLeft')(weekDaysLeft()) + (st.bonus ? '' : ' · ' + t('allBonus')(fmtNum(WEEKLY_BONUS)));
  }

  function syncSettingsUi() {
    $('set-name').value = S.name;
    const val = { sound: Sound.sfxOn ? 'on' : 'off', music: Sound.musicOn ? 'on' : 'off', lang: S.lang, gfx: S.gfx, voices: S.voices ? 'on' : 'off', commute: S.commute ? 'on' : 'off',
      stats: window.OWTrack && window.OWTrack.isOn() ? 'on' : 'off', reminders: S.reminders ? 'on' : 'off' };
    fillStateSelect($('set-state'));
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
  $('btn-next-song').addEventListener('click', () => { if (Music && Music.next) { Music.next(); syncNowPlaying(); T('setting', { k: 'next_song', v: Music.songName }); } });
  $('btn-again').addEventListener('click', () => { saveNameFrom(ui.playerName); replay(); });
  $('btn-restart').addEventListener('click', () => replay());
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
      case 'reminders': setReminders(v === 'on'); break;
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
  $('office-card').addEventListener('click', () => openSide('offices'));
  $('office-list').addEventListener('click', (e) => { const b = e.target.closest('[data-office]'); if (b && !b.disabled) setOffice(b.dataset.office); });
  $('att-card').addEventListener('click', () => openSide('register'));
  $('btn-sign').addEventListener('click', signRegister);
  $('btn-desk').addEventListener('click', () => openSide('desk'));
  $('desk-items').addEventListener('click', (e) => {
    const b = e.target.closest('[data-desk]'); if (!b) return;
    const id = b.dataset.desk;
    DESK.hide = DESK.hide.includes(id) ? DESK.hide.filter((x) => x !== id) : DESK.hide.concat(id);
    store.set('ow_desk', JSON.stringify(DESK)); renderDesk(); pushDesk(); T('desk', { action: 'toggle', id });
  });
  $('btn-season').addEventListener('click', () => openSide('season'));
  $('btn-states').addEventListener('click', () => openSide('states'));
  $('btn-invite').addEventListener('click', inviteFriend);
  $('states-pick').addEventListener('change', (e) => setState(e.target.value));
  $('set-state').addEventListener('change', (e) => setState(e.target.value));
  $('states-sort').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    statesSort = b.dataset.v;
    $('states-sort').querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    renderStates();
  });
  $('btn-use').addEventListener('click', (e) => { useHeld(); e.currentTarget.blur(); });
  $('btn-skip').addEventListener('click', (e) => { arrive(true); e.currentTarget.blur(); });
  $('shop-grid').addEventListener('click', (e) => {
    const sk = e.target.closest('[data-skin]');
    if (sk) { setLook('skin', sk.dataset.skin); return; }
    const b = e.target.closest('button');
    if (!b || b.disabled) return;
    const d = b.dataset;
    if (d.buy) buyItem(d.buy);
    else if (d.buylook) buyLook(d.buylook, d.id);
    else if (d.buyoutfit) buyOutfit(d.buyoutfit);
    else if (d.look !== undefined) setLook(d.look, d.id || '');
    else if (d.outfit) { S.outfit = d.outfit; store.set('ow_outfit', d.outfit); T('setting', { k: 'outfit', v: d.outfit }); afterLookChange(); }
    else if (d.extra) setLook(d.extra, !S.look[d.extra]);
    else if (d.title !== undefined) setLook('title', d.title);
    else if (d.buydesk) {
      const it = DESK_ITEMS.find((x) => x.id === d.buydesk);
      if (!it || deskOwned(it)) return;
      if (S.wallet < it.price) { toast(t('cantAfford'), 'info', 2000); return; }
      S.wallet -= it.price; S.owned.add('desk:' + it.id); saveS.wallet(); saveS.owned();
      stats.buys++; checkBadges(true); saveProgress();
      T('look_buy', { kind: 'desk', id: it.id, price: it.price });
      toast(t('bought') + ' ' + it.name, 'good', 1800, 'desk'); Sound.play('coin');
      renderShop(); refreshMenu(); pushDesk();
    }
  });
  document.querySelectorAll('.shop-tabs [data-tab]').forEach((b) => b.addEventListener('click', () => { SHOPTAB = b.dataset.tab; T('shop_tab', { tab: SHOPTAB }); renderShop(); $('shop-grid').scrollIntoView({ block: 'nearest' }); }));
  $('skin-pick').addEventListener('click', (e) => { const sk = e.target.closest('[data-skin]'); if (sk) setLook('skin', sk.dataset.skin); });
  $('weekly-card').addEventListener('click', () => { openSide('wardrobe'); setTimeout(() => $('weekly-title').scrollIntoView({ block: 'start' }), 60); });
  $('btn-wardrobe-shop').addEventListener('click', () => { SHOPTAB = 'looks'; openSide('shop'); });
  $('league-create').addEventListener('submit', (e) => { e.preventDefault(); createLeague(); });
  $('league-join').addEventListener('submit', (e) => { e.preventDefault(); joinLeague($('league-code').value); });
  $('league-list').addEventListener('click', (e) => {
    const p = e.target.closest('[data-play]'); if (p) { playLeague(p.dataset.play); return; }
    const b = e.target.closest('[data-board]'); if (b) { openLeagueBoard(b.dataset.board); return; }
    const c = e.target.closest('.league-card'); if (c && !e.target.closest('button')) openLeagueBoard(c.dataset.code);
  });
  $('btn-league-play').addEventListener('click', () => playLeague(LG.current));
  $('btn-league-admin').addEventListener('click', openAdmin);
  $('admin-pin-form').addEventListener('submit', adminUnlock);
  $('admin-form').addEventListener('submit', adminSave);
  $('btn-admin-end').addEventListener('click', () => adminAction('end'));
  $('btn-admin-new').addEventListener('click', () => adminAction('new'));
  $('league-rows').addEventListener('click', (e) => {
    const k = e.target.closest('[data-kick]'); if (k) { kickPlayer(k.dataset.kick, k); return; }
    const g = e.target.closest('[data-gift]'); if (g) { openGift(g.dataset.gift, g.dataset.name); return; }
    const dk = e.target.closest('[data-desk]'); if (dk) viewDesk(dk.dataset.desk, dk.dataset.name);
  });
  $('desk-view-close').addEventListener('click', () => { $('desk-view').hidden = true; });
  $('btn-wall-post').addEventListener('click', toggleWallLines);
  $('wall-lines').addEventListener('click', (e) => { const b = e.target.closest('[data-line]'); if (b) postWall(+b.dataset.line); });
  $('wall-posts').addEventListener('click', (e) => { const b = e.target.closest('[data-emoji]'); if (b) reactWall(b.dataset.post, b.dataset.emoji); });
  document.querySelectorAll('#gift-box [data-amount]').forEach((b) => b.addEventListener('click', () => sendGift(+b.dataset.amount)));
  $('gift-cancel').addEventListener('click', () => { $('gift-box').hidden = true; giftTarget = null; });
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
  probeHub();
  seasonCheckRoll();
  syncReminderConfig();
  setTimeout(() => { if (G.state === 'menu' && stats.games > 0 && !attPreview().signed && !new URLSearchParams(location.search).has('debug')) openSide('register'); }, 900);
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
      G, S, stats, unlocked, blevels, checkBadges, weeklyList, startEvent, endEvent, EVENT_DEFS, eventWeight, spawnFuelQueue, ghostEncode, collectGifts, checkRivals, CONFIG, DIFFICULTY, step, render, spawnBoss, spawnItem, spawnObstacle, startBlackout,
      startGame, pauseGame, resumeGame, toMenu, spawnOga, spawnDriver, spawnHR, spawnAunty, useHeld, arrive,
      renderShop, buyItem, buyLook, setLook, LOOKS, OUTFITS, TITLES, SKIN_TONES, drawPortrait, LG, playLeague, openLeagueBoard, renderLeagueHome, ADS, setAds, pickAd, T, Voice, careerDay, goalTarget, isRude, weekKeyLocal, makePromoImage, openPromo, shareText, challengeUrl, makeShareImage, openBossKey, closeBossKey,
      SPRITES, officeClock, setQuality, get quality() { return quality; }, Sound, Music,
      OFFICES, officeUnlocked, setOffice, renderOffices, curOffice, spawnHazard, startMission, endMission, missionProgress, startMeeting, MISSIONS,
      attPreview, signRegister, renderRegister, get ATT() { return ATT; }, seasonXp, renderSeason, get SEASON() { return SEASON; }, grantSticker, STICKERS, MYSTICK, renderAlbum,
      DESK_ITEMS, deskData, renderDesk, viewDesk, HUB, setState, renderStates, myPid, inviteFriend, nudges, renderNudges, setReminders, syncReminderConfig,
    };
  }
})();
