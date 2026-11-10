/* ===== Stav a ukladanie ===== */
const KEY = 'bystrik.v1';
let DATA = { profiles: [], current: null, settings: {}, parent: { pin: null }, t: 0 };
const CHAT_ON = () => !!(DATA.settings.chat && window.claude && window.claude.use);
const COIN = '<svg class="ci" viewBox="0 0 40 40" aria-hidden="true"><use href="#coin"/></svg>';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function normalize() {
  DATA.settings = Object.assign({ sound: true, voice: true, calc: true, chat: true, gameLimit: 2, theme: 'auto' }, DATA.settings || {});
  DATA.parent = DATA.parent || { pin: null };
  DATA.profiles.forEach(migrate);
}
function migrate(p) {
  const g = p.av && p.av.gender === 'd' ? 'd' : 'c'; const d = defaultAvatar(g); const old = p.av || {};
  const has = (cat, id) => CATALOG[cat].some(x => x.id === id);
  if (!old.col) p.av = { ...d, skin: has('skin', old.skin) ? old.skin : d.skin, eyes: has('eyes', old.eyes) ? old.eyes : d.eyes, mouth: has('mouth', old.mouth) ? old.mouth : d.mouth, top: has('top', old.top) ? old.top : d.top, bottom: has('bottom', old.bottom) ? old.bottom : d.bottom, shoes: has('shoes', old.shoes) ? old.shoes : d.shoes, acc: has('acc', old.acc) ? old.acc : 'nic', pet: has('pet', old.pet) ? old.pet : d.pet };
  const h = CATALOG.hair.find(x => x.id === p.av.hair); if (!h || h.g !== p.av.gender) p.av.hair = d.hair;
  if (!has('bg', p.av.bg)) p.av.bg = d.bg; if (!has('bgp', p.av.bgp)) p.av.bgp = 'bodky';
  p.av.col = Object.assign({}, d.col, p.av.col || {});
  p.log = p.log || []; p.days = p.days || {}; p.best = p.best || {}; p.mode = p.mode || { mat: 'quiz', sjl: 'quiz' };
  p.dailyReward = p.dailyReward || { last: '', day: 0 }; p.streak = Object.assign({ last: '', count: 0, best: 0 }, p.streak || {});
  p.stats = Object.assign({ correct: 0, answered: 0, quizzes: 0, perfect: 0, cards: 0, pexeso: 0, bestTime: 0, style: 0, daily: 0, games: 0, match: 0, chat: 0, tasks: 0 }, p.stats || {});
  p.topics = p.topics || {}; p.badges = p.badges || [];
  p.coins = p.coins || 0; p.owned = p.owned || []; p.readings = p.readings || [];
  if (!p.room) p.room = defaultRoom(p.av.gender); p.room.stickers = p.room.stickers || [];
}
function applyTheme() { const t = DATA.settings.theme; if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t; else if (document.documentElement.dataset.theme && THEME_SET) delete document.documentElement.dataset.theme; THEME_SET = t !== 'auto'; }
let THEME_SET = false;
function load() { try { const s = localStorage.getItem(KEY); if (s) DATA = Object.assign(DATA, JSON.parse(s)); } catch (e) { } normalize(); }
function save() { DATA.t = Date.now(); try { localStorage.setItem(KEY, JSON.stringify(DATA)); } catch (e) { } queueSync(); }
const P = () => DATA.profiles.find(p => p.id === DATA.current);

let DBREF = null, syncT = null;
function queueSync() { if (!DBREF) return; clearTimeout(syncT); syncT = setTimeout(() => { DBREF.set({ json: JSON.stringify(DATA), t: DATA.t }).catch(() => { }); }, 2500); }
async function initDb() {
  try {
    if (!window.claude || !window.claude.use) return;
    const [db, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
    if (!db || !user) return;
    const uid = await user.id(); if (!uid) return;
    DBREF = db.doc(`data/users/${uid}/bystrik/save`);
    const snap = await DBREF.get(); const r = snap.exists ? snap.data() : null;
    if (r && r.t > DATA.t && typeof r.json === 'string') {
      DATA = Object.assign({ profiles: [], current: null }, JSON.parse(r.json)); normalize();
      try { localStorage.setItem(KEY, JSON.stringify(DATA)); } catch (e) { }
      if (!['quiz', 'cards', 'pexeso', 'match', 'sort', 'game', 'chat'].includes(UI.view)) boot();
    } else if (DATA.profiles.length) queueSync();
  } catch (e) { }
}
let SAMPLE = null;
function getSample() { if (!SAMPLE) SAMPLE = (window.claude && window.claude.use) ? window.claude.use('sample').catch(() => null) : Promise.resolve(null); return SAMPLE; }

/* ===== Zvuky, hlas ===== */
let AC = null;
function ac() { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { } } if (AC && AC.state === 'suspended') AC.resume(); return AC; }
function tone(f, d, type = 'sine', vol = .14, when = 0, slide) {
  const a = ac(); if (!a) return; const t = a.currentTime + when;
  const o = a.createOscillator(), g = a.createGain(); o.type = type; o.frequency.setValueAtTime(f, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + d);
  g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .012); g.gain.exponentialRampToValueAtTime(.0001, t + d);
  o.connect(g).connect(a.destination); o.start(t); o.stop(t + d + .03);
}
const SFX = {
  tap: () => tone(620, .06, 'triangle', .07), pop: () => tone(320, .09, 'sine', .14, 0, 980),
  ok: () => { tone(660, .12, 'triangle', .15); tone(990, .2, 'triangle', .15, .1); },
  no: () => tone(240, .28, 'sawtooth', .05, 0, 150), flip: () => tone(380, .14, 'sine', .08, 0, 900),
  match: () => [523, 659, 784].forEach((f, i) => tone(f, .16, 'triangle', .12, i * .07)),
  level: () => [523, 659, 784, 1046, 784, 1046, 1318].forEach((f, i) => tone(f, .2, 'square', .05, i * .11)),
  star: i => tone(700 + i * 220, .22, 'triangle', .13), tick: () => tone(1200, .03, 'square', .03),
  whoosh: () => tone(200, .25, 'sine', .06, 0, 1200), gift: () => [392, 523, 659, 784, 1046].forEach((f, i) => tone(f, .14, 'triangle', .12, i * .06)),
  balloon: () => tone(900, .08, 'square', .06, 0, 200), coin: () => { tone(988, .08, 'square', .05); tone(1318, .2, 'square', .05, .08); }
};
function sfx(n, a) { if (!DATA.settings.sound) return; try { SFX[n](a); } catch (e) { } }
function buzz(ms) { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) { } }
let VOICES = [];
function loadVoices() { try { VOICES = speechSynthesis.getVoices() || []; } catch (e) { } }
if ('speechSynthesis' in window) { loadVoices(); try { speechSynthesis.addEventListener('voiceschanged', loadVoices); } catch (e) { } }
function pickVoice(lang) { const l = lang.slice(0, 2).toLowerCase(); const by = x => VOICES.filter(v => (v.lang || '').toLowerCase().replace('_', '-').startsWith(x)); const list = by(l); const best = list.find(v => /google|natural|enhanced|premium|laura/i.test(v.name)) || list[0]; return best || (l === 'sk' ? by('cs')[0] : null); }
const slovakVoice = () => { loadVoices(); const v = pickVoice('sk-SK'); return v ? ((v.lang || '').toLowerCase().startsWith('sk') ? 'sk' : 'cs') : null; };
function say(text, lang = 'sk-SK') {
  if (!DATA.settings.voice || !('speechSynthesis' in window)) return;
  try {
    speechSynthesis.cancel(); if (!VOICES.length) loadVoices();
    let t = text;
    if (lang === 'sk-SK') t = t.replace(/ · /g, ' krát ').replace(/ : /g, ' delené ').replace(/ − /g, ' mínus ').replace(/ \+ /g, ' plus ').replace(/ = \?/g, ' sa rovná koľko?').replace(/_/g, ' ').replace(/[„“"]/g, '');
    const v = pickVoice(lang);
    const parts = t.match(/[^.!?…]+[.!?…]*/g) || [t];
    const us = [];
    parts.forEach(seg => { const x = seg.trim(); if (!x) return; const u = new SpeechSynthesisUtterance(x); if (v) { u.voice = v; u.lang = v.lang; } else u.lang = lang; u.rate = lang === 'sk-SK' ? .85 : .8; u.pitch = 1.05; us.push(u); });
    const talk = on => document.querySelectorAll('.obbear,.tutbear,.herobear').forEach(e => e.classList.toggle('talking', on));
    if (us.length) { us[0].onstart = () => talk(true); const last = us[us.length - 1]; last.onend = last.onerror = () => talk(false); }
    us.forEach(u => speechSynthesis.speak(u));
  } catch (e) { }
}
function sayOld(text, lang = 'sk-SK') {
  if (!DATA.settings.voice || !('speechSynthesis' in window)) return;
  try {
    speechSynthesis.cancel();
    const t = text.replace(/ · /g, ' krát ').replace(/ : /g, ' delené ').replace(/ − /g, ' mínus ').replace(/ \+ /g, ' plus ').replace(/ = \?/g, ' sa rovná koľko?').replace(/_/g, ' ');
    const u = new SpeechSynthesisUtterance(lang === 'sk-SK' ? t : text); u.lang = lang; u.rate = .9;
    const v = speechSynthesis.getVoices().find(v => (v.lang || '').toLowerCase().startsWith(lang.slice(0, 2))); if (v) u.voice = v;
    speechSynthesis.speak(u);
  } catch (e) { }
}

/* ===== Efekty ===== */
const fx = { c: null, ctx: null, parts: [], run: false };
function confetti(n = 120, y = .35) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const c = fx.c || (fx.c = $('#fx')); fx.ctx = fx.ctx || c.getContext('2d');
  c.width = innerWidth * devicePixelRatio; c.height = innerHeight * devicePixelRatio;
  const cols = ['#FF7A59', '#FFC94D', '#4C86F7', '#22B573', '#F25C8B', '#9C7CF4', '#86E3C9'];
  for (let i = 0; i < n; i++) fx.parts.push({ x: innerWidth / 2, y: innerHeight * y, vx: (Math.random() - .5) * 14, vy: -Math.random() * 13 - 4, r: Math.random() * 6 + 4, c: pick(cols), a: Math.random() * 6, va: (Math.random() - .5) * .4, life: 0, round: Math.random() < .3 });
  if (!fx.run) { fx.run = true; requestAnimationFrame(tickFx); }
}
function tickFx() {
  const { ctx, c } = fx; ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0); ctx.clearRect(0, 0, c.width, c.height);
  fx.parts = fx.parts.filter(p => p.life < 170 && p.y < innerHeight + 40);
  for (const p of fx.parts) { p.life++; p.vy += .35; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.a += p.va; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = p.c; if (p.round) { ctx.beginPath(); ctx.arc(0, 0, p.r / 2, 0, 7); ctx.fill(); } else ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); ctx.restore(); }
  if (fx.parts.length) requestAnimationFrame(tickFx); else { fx.run = false; ctx.clearRect(0, 0, c.width, c.height); }
}
function burst(el, n = 26) {
  if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return; const r = el.getBoundingClientRect();
  const c = fx.c || (fx.c = $('#fx')); fx.ctx = fx.ctx || c.getContext('2d'); c.width = innerWidth * devicePixelRatio; c.height = innerHeight * devicePixelRatio;
  const cols = ['#FF7A59', '#FFC94D', '#4C86F7', '#22B573', '#F25C8B', '#9C7CF4', '#86E3C9'];
  for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, v = 3 + Math.random() * 6; fx.parts.push({ x: r.left + r.width / 2, y: r.top + r.height / 2, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 4, r: Math.random() * 5 + 4, c: pick(cols), a: Math.random() * 6, va: (Math.random() - .5) * .4, life: 60, round: Math.random() < .4 }); }
  if (!fx.run) { fx.run = true; requestAnimationFrame(tickFx); }
}
function toast(msg) { const d = document.createElement('div'); d.className = 'tst'; d.textContent = msg; $('#toast').appendChild(d); setTimeout(() => d.remove(), 2900); }
function floatXp(el, txt) { if (!el) return; const r = el.getBoundingClientRect(); const d = document.createElement('div'); d.className = 'floatxp'; d.textContent = txt; d.style.left = (r.left + r.width / 2 - 20) + 'px'; d.style.top = (r.top - 6) + 'px'; document.body.appendChild(d); setTimeout(() => d.remove(), 1000); }

/* ===== Levely, odmeny ===== */
const need = L => 60 + 30 * (L - 1);
function levelInfo(xp) { let L = 1, r = xp; while (r >= need(L)) { r -= need(L); L++; } return { L, cur: r, need: need(L), pct: Math.round(r / need(L) * 100) }; }
const TITLES = ['Zvedavé vajíčko', 'Malý bystrík', 'Šikovná hlávka', 'Pátrač', 'Objaviteľ', 'Vynálezca', 'Majster slov', 'Kráľ čísel', 'Profesor', 'Génius', 'Legenda'];
const title = L => TITLES[Math.min(TITLES.length - 1, Math.floor(L / 2))];
const unlocked = (it, p) => (!it.lvl || levelInfo(p.xp).L >= it.lvl) && (!it.streak || (p.streak.best || 0) >= it.streak) && (!it.price || (p.owned || []).includes(it.sid));
const lockLabel = it => it.price ? `Obchod 🪙 ${it.price}` : it.lvl ? `Level ${it.lvl}` : `Séria ${it.streak} dní`;
const REW_CATS = ['hair', 'top', 'bottom', 'shoes', 'acc', 'eyes', 'mouth', 'pet'];
function allRewardItems(g) {
  const out = [];
  for (const c of REW_CATS) for (const it of CATALOG[c]) if ((it.lvl || it.streak) && (!it.g || it.g === g)) out.push([c, it]);
  for (const it of HAIRC) if ((it.lvl || it.streak) && (!it.g || it.g === g)) out.push(['hairColor', it]);
  for (const it of PAL) if ((it.lvl || it.streak) && (!it.g || it.g === g)) out.push(['color', it]);
  for (const it of THEMES) if (it.lvl || it.streak) out.push(['theme', it]);
  for (const it of STICKERS) if (it.lvl || it.streak) out.push(['sticker', it]);
  return out;
}
const rewardsAt = (L, g) => allRewardItems(g).filter(([, it]) => it.lvl === L);
const streakRewards = g => allRewardItems(g).filter(([, it]) => it.streak).sort((a, b) => a[1].streak - b[1].streak);
function rewardName(c, it) { if (c === 'theme') return `Pozadie: ${it.n}`; if (c === 'sticker') return `Nálepka: ${it.n}`; if (c === 'hairColor') return `${it.n} vlasy`; if (c === 'color') return `${it.n} farba`; if (c === 'bgp') return `Pozadie: ${it.n}`; return it.n; }
function itemThumb(cat, it, av) {
  if (cat === 'pet' || cat === 'sticker') return `<span>${it.e}</span>`;
  if (cat === 'theme') return `<span style="display:block;width:100%;height:100%;background:${themeBg(it.id)}"></span>`;
  if (cat === 'hairColor' || cat === 'color') return `<span class="sw ${it.c === 'RAINBOW' ? 'rb' : ''}" style="display:block;width:62%;background:${it.c}"></span>`;
  if (cat === 'skin' || cat === 'bg') return `<span class="sw" style="display:block;width:62%;background:${it.c}"></span>`;
  if (cat === 'bgp') { const a = { ...av, bgp: it.id }; const id = 'bp' + (++AVID); return `<svg viewBox="40 60 120 120">${'<defs>' + bgPatternDef(a, id) + '</defs>' + bgLayer(a, id)}</svg>`; }
  const a = { ...av, [cat]: it.id };
  if (cat === 'bottom' && ['saty', 'princezna', 'astronaut'].includes(a.top)) a.top = 'tricko';
  if (cat !== 'top' && a.top === 'astronaut') a.top = 'tricko';
  const crop = { hair: 'head', eyes: 'head', mouth: 'head', acc: 'acc', top: 'top', bottom: 'bottom', shoes: 'shoes' }[cat];
  return avatarSvg(a, { crop, noBg: true });
}

/* ===== Odznaky ===== */
const starsIn = (p, k) => Object.entries(p.topics).filter(([id]) => TOPIC[id] && TOPIC[id].s === k).reduce((a, [, v]) => a + (v.stars || 0), 0);
const ACH = [
  { id: 'spravne', i: '✔️', n: 'Šikovná hlávka', d: 'Správne odpovede', m: p => p.stats.correct, t: [50, 250, 1000] },
  { id: 'kvizy', i: '❓', n: 'Kvízový majster', d: 'Dokončené kvízy', m: p => p.stats.quizzes, t: [5, 25, 100] },
  { id: 'perfekt', i: '💎', n: 'Bez chyby', d: 'Kvízy na 10 z 10', m: p => p.stats.perfect, t: [1, 5, 20] },
  { id: 'seria', i: '🔥', n: 'Vytrvalec', d: 'Dni po sebe', m: p => p.streak.best || 0, t: [3, 7, 30] },
  { id: 'hviezdy', i: '⭐', n: 'Zberateľ hviezd', d: 'Hviezdy spolu', m: p => Object.values(p.topics).reduce((a, v) => a + (v.stars || 0), 0), t: [10, 50, 150] },
  { id: 'matika', i: '🔢', n: 'Matikár', d: 'Hviezdy z matematiky', m: p => starsIn(p, 'mat'), t: [10, 40, 90] },
  { id: 'slovina', i: '📝', n: 'Slovinár', d: 'Hviezdy zo slovenčiny', m: p => starsIn(p, 'sjl'), t: [10, 40, 90] },
  { id: 'prehlad', i: '🌍', n: 'Objaviteľ sveta', d: 'Hviezdy z prehľadu', m: p => starsIn(p, 'prv'), t: [10, 40, 90] },
  { id: 'citanie', i: '📖', n: 'Čitateľ', d: 'Prečítané texty', m: p => (p.readings || []).length, t: [1, 10, 30] },
  { id: 'karty', i: '🃏', n: 'Kartičkár', d: 'Zvládnuté kartičky', m: p => p.stats.cards, t: [30, 150, 500] },
  { id: 'spajacky', i: '🔗', n: 'Spájač', d: 'Spájačky a pexesá', m: p => p.stats.match + p.stats.pexeso, t: [5, 25, 75] },
  { id: 'hry', i: '🎮', n: 'Hráč', d: 'Odohrané minihry', m: p => p.stats.games, t: [5, 25, 75] },
  { id: 'rychlik', i: '⚡', n: 'Bleskový', d: 'Najviac správnych za minútu', m: p => p.stats.bestTime, t: [10, 15, 20] },
  { id: 'ulohy', i: '✅', n: 'Plnič úloh', d: 'Splnené denné úlohy', m: p => p.stats.tasks, t: [5, 30, 100] },
  { id: 'denne', i: '🎯', n: 'Denný hrdina', d: 'Splnené denné výzvy', m: p => p.stats.daily, t: [3, 15, 50] },
  { id: 'level', i: '👑', n: 'Na vrchole', d: 'Dosiahnutý level', m: p => levelInfo(p.xp).L, t: [5, 10, 20] },
  { id: 'moda', i: '👗', n: 'Módny návrhár', d: 'Zmeny v šatníku', m: p => p.stats.style, t: [15, 60, 200] },
  { id: 'nakupy', i: '🛍️', n: 'Zberateľ', d: 'Veci kúpené v obchode', m: p => (p.owned || []).length, t: [1, 5, 15] }
];
const MEDAL = ['🥉', '🥈', '🥇'], ACH_COINS = [10, 25, 50];
function achTier(p, a) { const v = a.m(p) || 0; let t = 0; a.t.forEach((x, i) => { if (v >= x) t = i + 1; }); return t; }
function checkBadges(p) {
  p.ach = p.ach || {}; const got = [];
  for (const a of ACH) { const t = achTier(p, a); const was = p.ach[a.id] || 0; if (t > was) { for (let k = was; k < t; k++) { p.coins = (p.coins || 0) + ACH_COINS[k]; got.push([a, k]); } p.ach[a.id] = t; } }
  got.forEach(([a, k], i) => setTimeout(() => achPop(a, k), 900 + i * 3700));
}
function achPop(a, k, custom) {
  const d = document.createElement('div'); d.className = 'achpop'; d.innerHTML = custom ? `<span class="am">🎉</span><div><span class="eyebrow">Výborne!</span><b>${a.i} ${a.n}</b><span>${a.d} · +${custom} ${COIN}</span></div>` : `<span class="am">${MEDAL[k]}</span><div><span class="eyebrow">Nový úspech!</span><b>${a.i} ${a.n}</b><span>${a.d}: ${a.t[k]} · +${ACH_COINS[k]} ${COIN}</span></div>`;
  document.body.appendChild(d); sfx('level'); buzz([20, 40, 20]); confetti(70, .12); setTimeout(() => d.classList.add('out'), 3000); setTimeout(() => d.remove(), 3600);
}

/* ===== Dni, séria, úlohy, denné odmeny ===== */
const dkey = d => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
const today = () => dkey(new Date());
const daysAgo = n => { const d = new Date(); d.setDate(d.getDate() - n); return dkey(d); };
function touchStreak(p) {
  const t = today(); if (p.streak.last === t) return;
  const before = p.streak.best || 0;
  p.streak.count = p.streak.last === daysAgo(1) ? p.streak.count + 1 : 1; p.streak.last = t; p.streak.best = Math.max(before, p.streak.count);
  if (p.streak.count > 1) setTimeout(() => { toast(`🔥 Séria ${p.streak.count} dní po sebe!`); sfx('coin'); }, 400);
  const fresh = streakRewards(p.av.gender).filter(([, it]) => it.streak > before && it.streak <= p.streak.best);
  if (fresh.length) PENDING.push({ title: `Séria ${p.streak.best} dní!`, sub: 'Za to, že sa učíš každý deň, máš darček:', rw: fresh, num: '🔥' });
}
const TASKS = [
  { id: 'q1', n: 'Dokonči 1 kvíz', k: 'quizzes', t: 1, xp: 20, i: '❓' }, { id: 'q2', n: 'Dokonči 2 kvízy', k: 'quizzes', t: 2, xp: 35, i: '❓' },
  { id: 'c15', n: 'Odpovedz správne na 15 otázok', k: 'correct', t: 15, xp: 30, i: '✔️' }, { id: 'c30', n: 'Odpovedz správne na 30 otázok', k: 'correct', t: 30, xp: 45, i: '✔️' },
  { id: 'g1', n: 'Zahraj si minihru', k: 'games', t: 1, xp: 20, i: '🎮' }, { id: 'g2', n: 'Zahraj si 2 minihry', k: 'games', t: 2, xp: 30, i: '🎮' },
  { id: 'k10', n: 'Prejdi 10 kartičiek', k: 'cards', t: 10, xp: 25, i: '🃏' }, { id: 'm1', n: 'Dokonči spájačku alebo pexeso', k: 'match', t: 1, xp: 25, i: '🔗' },
  { id: 's3', n: 'Získaj 3 hviezdy v kvíze', k: 'stars3', t: 1, xp: 40, i: '⭐' }, { id: 'd1', n: 'Splň dennú výzvu', k: 'daily', t: 1, xp: 30, i: '🎯' },
  { id: 'mat', n: 'Vyrieš 10 príkladov z matiky', k: 'mat', t: 10, xp: 25, i: '🔢' }, { id: 'sjl', n: 'Odpovedz na 10 otázok zo slovenčiny', k: 'sjl', t: 10, xp: 25, i: '📝' },
  { id: 't1', n: 'Zahraj si výzvu na čas', k: 'time', t: 1, xp: 20, i: '⏱️' }
];
function seeded(str) { let h = 2166136261; for (const c of str) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return () => { h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; }; }
function ensureDay(p) {
  const t = today(); if (p.day && p.day.date === t) return p.day;
  const rnd = seeded(t + p.id); const pool = TASKS.slice().sort(() => rnd() - .5); const picked = [], keys = new Set();
  for (const x of pool) { if (keys.has(x.k)) continue; if (x.k === 'games' && DATA.settings.gameLimit && x.t > DATA.settings.gameLimit) continue; keys.add(x.k); picked.push(x.id); if (picked.length === 3) break; }
  p.day = { date: t, cnt: {}, tasks: picked, claimed: [], bonus: false }; return p.day;
}
function bump(k, n = 1) {
  const p = P(); const d = ensureDay(p);
  const before = d.tasks.filter(id => { const T = TASKS.find(x => x.id === id); return (d.cnt[T.k] || 0) >= T.t; });
  d.cnt[k] = (d.cnt[k] || 0) + n;
  d.tasks.forEach(id => { const T = TASKS.find(x => x.id === id); if (!before.includes(id) && (d.cnt[T.k] || 0) >= T.t) setTimeout(() => { toast(`✅ Úloha splnená: ${T.n}`); sfx('coin'); }, 300); });
}
function logAct(k, id, c, n) { const p = P(); p.log.unshift({ t: Date.now(), k, id, c, n }); if (p.log.length > 300) p.log.length = 300; }
function countDay(ok) { const p = P(); const d = p.days[today()] || (p.days[today()] = { q: 0, c: 0 }); d.q++; if (ok) d.c++; }
const DR = [{ xp: 20, i: '⭐' }, { xp: 25, i: '⭐' }, { xp: 30, i: '💎' }, { xp: 40, i: '⭐' }, { xp: 50, i: '💎' }, { xp: 60, i: '🎁' }, { xp: 100, i: '👑' }];
const drReady = p => p.dailyReward.last !== today();
const drNextDay = p => p.dailyReward.last === daysAgo(1) ? (p.dailyReward.day % 7) + 1 : 1;
let PENDING = [];
function gain(p, n) { p.xp += n; p.coins = (p.coins || 0) + Math.max(1, Math.round(n / 5)); }
function addXp(n) { const p = P(); const a = levelInfo(p.xp).L; gain(p, n); const b = levelInfo(p.xp).L; return { from: a, to: b }; }
function flushPending() { if ($('.over')) return; const x = PENDING.shift(); if (x) showRewardOverlay(x); }
function coinFly(el, k = 6) {
  const to = $('.coinchip'); if (!el || !to || matchMedia('(prefers-reduced-motion: reduce)').matches) return; const a = el.getBoundingClientRect(), b = to.getBoundingClientRect();
  for (let i = 0; i < k; i++) { const c = document.createElement('span'); c.className = 'flycoin'; c.innerHTML = COIN; c.style.left = (a.left + a.width / 2 - 12) + 'px'; c.style.top = (a.top + a.height / 2 - 12) + 'px'; document.body.appendChild(c); const dx = b.left + b.width / 2 - a.left - a.width / 2, dy = b.top + b.height / 2 - a.top - a.height / 2; const mx = (Math.random() - .5) * 120; c.animate([{ transform: 'translate(0,0) scale(.6)', opacity: 0 }, { transform: `translate(${mx}px,${-60 - Math.random() * 40}px) scale(1.2)`, opacity: 1, offset: .35 }, { transform: `translate(${dx}px,${dy}px) scale(.7)`, opacity: 1 }], { duration: 900 + i * 90, easing: 'cubic-bezier(.5,0,.4,1)' }).onfinish = () => { c.remove(); to.classList.remove('bump'); void to.offsetWidth; to.classList.add('bump'); }; }
}
function grant(n, el) { const r = addXp(n); floatXp(el, '+' + n); coinFly(el); sfx('coin'); save(); if (r.to > r.from) queueLevelUp(r.from, r.to); flushPending(); }
function queueLevelUp(from, to) { const g = P().av.gender; const rw = []; for (let L = from + 1; L <= to; L++) rw.push(...rewardsAt(L, g)); PENDING.push({ title: title(to), sub: rw.length ? 'Máš darček! Ťukni naň.' : 'Len tak ďalej!', rw, num: to, level: true }); }

/* ===== Router ===== */
let UI = { view: 'home', params: {} };
let TIMERS = [];
function clearTimers() { TIMERS.forEach(t => { clearInterval(t); clearTimeout(t); }); TIMERS = []; }
function go(view, params = {}, dir = 'f') {
  clearTimers(); closeSheet(); clearTut(); $$('.fb,.peek,.peekbub,.over').forEach(e => e.remove());
  try { speechSynthesis.cancel(); } catch (e) { }
  UI.view = view; UI.params = params; render(dir); window.scrollTo(0, 0);
}
function render(dir) {
  const app = $('#app'); app.innerHTML = VIEWS[UI.view](UI.params);
  const v = app.querySelector('.view'); if (v && dir) v.classList.add('enter-' + dir);
  AFTER[UI.view] && AFTER[UI.view]();
  applyRoom();
  if (!['quiz', 'cards', 'pexeso', 'match', 'sort', 'game', 'result', 'onboard'].includes(UI.view)) setTimeout(flushPending, 350);
}
let LASTCOINS = -1;
function topbar(back) {
  const p = P(); const li = levelInfo(p.xp); setTimeout(() => { LASTCOINS = p.coins || 0; }, 0);
  const left = back ? `<button class="iconbtn press" data-a="${back}" aria-label="Späť">←</button>` : `<button class="headbub press" data-a="nav" data-v="wardrobe" aria-label="Môj avatar">${avatarSvg(p.av, { crop: 'head' })}</button>`;
  return `<header class="top">${left}<div class="who"><b>${esc(p.name)}</b><div class="xpbar" title="${li.cur} / ${li.need} bodov"><i style="width:${li.pct}%"></i></div></div><button class="lvl press" data-a="nav" data-v="rewards" aria-label="Level ${li.L}, otvoriť odmeny">Lv ${li.L}</button><button class="lvl coinchip press ${(p.coins || 0) > LASTCOINS && LASTCOINS >= 0 ? 'bump' : ''}" data-a="nav" data-v="shop" aria-label="Mince: ${p.coins || 0}, otvoriť obchod">${COIN} ${p.coins || 0}</button><button class="iconbtn press" data-a="nav" data-v="settings" aria-label="Nastavenia">⚙️</button></header>`;
}
function nav(on) {
  const p = P(); const d = ensureDay(p); const claimable = d.tasks.some(id => { const T = TASKS.find(x => x.id === id); return !d.claimed.includes(id) && (d.cnt[T.k] || 0) >= T.t; }) || drReady(p);
  const fresh = (p.seenRewards || 1) < levelInfo(p.xp).L;
  const b = (v, i, n, dot) => `<button class="${on === v ? 'on' : ''}" data-a="nav" data-v="${v}"><span class="ni">${i}</span>${n}${dot ? '<span class="dot"></span>' : ''}</button>`;
  return `<nav class="nav"><div class="in">${b('home', '🏠', 'Domov', claimable && on !== 'home')}${b('learn', '📚', 'Učenie')}${b('games', '🎮', 'Hry')}${b('shop', '🛍️', 'Obchod')}${b('wardrobe', '👕', 'Šatník', fresh)}</div></nav>`;
}
const bearSvg = (cls = 'owl') => `<svg class="bear ${cls}" viewBox="0 0 120 120" aria-hidden="true"><ellipse class="b-shadow" cx="60" cy="115" rx="30" ry="4" fill="#000" opacity=".1"/><g class="b-all"><g class="b-feet"><ellipse cx="44" cy="110" rx="9" ry="6" fill="#B07448"/><ellipse cx="76" cy="110" rx="9" ry="6" fill="#B07448"/><ellipse cx="44" cy="111" rx="4" ry="2.6" fill="#F3D3AE"/><ellipse cx="76" cy="111" rx="4" ry="2.6" fill="#F3D3AE"/></g><g class="b-body"><ellipse cx="60" cy="93" rx="27" ry="21" fill="#C98A5C"/><ellipse cx="60" cy="97" rx="16" ry="13" fill="#F3D3AE"/></g><g class="b-head"><g class="b-ear-l"><circle cx="30" cy="24" r="13" fill="#C98A5C"/><circle cx="30" cy="24" r="7" fill="#F3B8C4"/></g><g class="b-ear-r"><circle cx="90" cy="24" r="13" fill="#C98A5C"/><circle cx="90" cy="24" r="7" fill="#F3B8C4"/></g><circle cx="60" cy="50" r="36" fill="#C98A5C"/><path d="M36 30 Q46 22 56 26" stroke="#B07448" stroke-width="3" fill="none" stroke-linecap="round" opacity=".5"/><ellipse cx="60" cy="62" rx="17" ry="13" fill="#F3D3AE"/><g class="b-eyes"><circle cx="46" cy="44" r="5.2" fill="#3A2A2A"/><circle cx="74" cy="44" r="5.2" fill="#3A2A2A"/><circle cx="47.8" cy="42.2" r="1.8" fill="#fff"/><circle cx="75.8" cy="42.2" r="1.8" fill="#fff"/></g><g class="b-happyeyes"><path d="M41 45 Q46 39 51 45 M69 45 Q74 39 79 45" stroke="#3A2A2A" stroke-width="3" fill="none" stroke-linecap="round"/></g><ellipse class="b-cheek" cx="37" cy="58" rx="6" ry="3.5" fill="#FF8FA3" opacity=".6"/><ellipse class="b-cheek" cx="83" cy="58" rx="6" ry="3.5" fill="#FF8FA3" opacity=".6"/><ellipse class="b-nose" cx="60" cy="56" rx="7" ry="5" fill="#3A2A2A"/><ellipse cx="58" cy="54.5" rx="2.2" ry="1.3" fill="#fff" opacity=".6"/><path class="b-smile" d="M60 61 V65 M53 67 Q60 73 67 67" stroke="#3A2A2A" stroke-width="2.6" fill="none" stroke-linecap="round"/><g class="b-mouth"><ellipse cx="60" cy="68" rx="5.5" ry="4.5" fill="#7A2335"/><ellipse cx="60" cy="70.5" rx="3.2" ry="1.8" fill="#FF8FA6"/></g></g><g class="b-arm-l"><ellipse cx="35" cy="90" rx="7.5" ry="12" fill="#B07448" transform="rotate(25 35 90)"/></g><g class="b-arm-r"><ellipse cx="85" cy="90" rx="7.5" ry="12" fill="#B07448" transform="rotate(-25 85 90)"/></g><g class="b-bow"><path d="M49 85 L60 91 L71 85 L71 78 L60 85 L49 78 Z" fill="#FF7A59" stroke="#E05A3A" stroke-width="1"/><circle cx="60" cy="84.5" r="3.6" fill="#FFC94D"/></g></g><g class="b-sparks"><path d="M12 40 l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#FFC94D"/><path d="M104 30 l1.6 4 4 1.6-4 1.6-1.6 4-1.6-4-4-1.6 4-1.6z" fill="#FF8FA3"/><path d="M108 76 l1.4 3.4 3.4 1.4-3.4 1.4-1.4 3.4-1.4-3.4-3.4-1.4 3.4-1.4z" fill="#86E3C9"/></g></svg>`;
const owlSvg = bearSvg;
const TIPS = ['Učenie nájdeš dole v lište pod 📚.', 'Za mince si v obchode kúpiš nové veci!', 'Každá správna odpoveď ťa posunie k novej odmene!', 'Splň dnešné úlohy a vyzdvihni si body!', 'Kartičky pomáhajú zapamätať si učivo.', 'V spájačke spájaš, čo k sebe patrí.', 'Chyba nevadí. Aj z nej sa učíš!', 'Keď niečomu nerozumieš, opýtaj sa ma v chate.', 'Uč sa každý deň a séria porastie! 🔥'];
const starStr = n => `<span class="stars" aria-label="${n} z 3 hviezd">${[0, 1, 2].map(i => i < n ? '⭐' : '<span style="opacity:.25">⭐</span>').join('')}</span>`;
function topicStat(p, id) { return p.topics[id] || (p.topics[id] = { stars: 0, best: 0, correct: 0, total: 0, played: 0 }); }
const MODES = {
  quiz: { i: '❓', n: 'Kvíz', d: '10 otázok, vyber správnu odpoveď. Za dobré výsledky dostaneš hviezdy.' },
  cards: { i: '🃏', n: 'Kartičky', d: 'Pozri sa na kartičku, skús si odpoveď a otoč ju. Takto sa učivo zapamätá.' },
  match: { i: '🔗', n: 'Spájačka', d: 'Spoj, čo k sebe patrí. Pri skupinách slov ich roztrieďuješ do košíkov.' },
  pex: { i: '🧩', n: 'Pexeso', d: 'Otáčaj kartičky a hľadaj dvojice, ktoré k sebe patria.' },
  time: { i: '⏱️', n: 'Na čas', d: 'Koľko správnych odpovedí stihneš za 60 sekúnd?' }
};
const AVAIL = {};
function avail(t) {
  if (!AVAIL[t.id]) { let pairs = !!t.pex; for (let i = 0; i < 3 && !pairs; i++) pairs = !!pexesoPairs(t); AVAIL[t.id] = { pairs, match: pairs || t.type === 'cat' }; }
  return AVAIL[t.id];
}
const modeOk = (t, m) => m === 'pex' ? avail(t).pairs : m === 'match' ? avail(t).match : true;

/* ===== Vlastné pozadie ===== */
const isDark = () => { const t = document.documentElement.dataset.theme; return t === 'dark' || (t !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches); };
function applyRoom() {
  const p = P(); const on = !!(p && p.room && p.room.page && UI.view !== 'onboard'); const bl = $('.blobs'); if (bl) bl.hidden = on;
  let pb = $('#pagebg');
  if (!on) { if (pb) pb.remove(); document.documentElement.classList.remove('fdark'); return; }
  if (!pb) { pb = document.createElement('div'); pb.id = 'pagebg'; document.body.prepend(pb); }
  pb.innerHTML = roomHTML(p.room, null, isDark()); document.documentElement.classList.toggle('fdark', !!themeOf(p.room.theme).dark);
}
try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => applyRoom()); } catch (e) { }
let DS = null, DRAG = null;
function designerHTML() {
  const r = DS.room, lp = DS.lockP;
  const tools = DS.sel !== null && r.stickers[DS.sel] ? `<div class="stktools"><button class="btn" data-a="ds-tool" data-t="minus">➖ Menšia</button><button class="btn" data-a="ds-tool" data-t="plus">➕ Väčšia</button><button class="btn" data-a="ds-tool" data-t="rot">↻ Otočiť</button><button class="btn" data-a="ds-tool" data-t="del">🗑️ Zmazať</button></div>` : `<p class="deckinfo">Ťukni na nálepku dole a pridá sa do obrázka. Potom ju prstom posuň, kam chceš. Ťuknutím na nálepku v obrázku ju vyberieš.</p>`;
  const tab = DS.tab; let grid;
  if (tab === 'stk') grid = `<div class="stkpal">${STICKERS.map((it, i) => { const u = unlocked(it, lp); return `<button class="press ${u ? '' : 'lockb'}" data-a="ds-add" data-i="${i}" aria-label="Nálepka ${it.n}${u ? '' : ', ' + lockLabel(it)}">${it.e}</button>`; }).join('')}</div><p class="muted b" style="font-size:.82rem">Nálepky so zámkom odomkneš za level alebo sériu. Najviac ${16} nálepiek.</p>`;
  else if (tab === 'col') grid = `<div class="themes">${THEMES.map(t => { const u = unlocked(t, lp); return `<button class="press ${r.theme === t.id ? 'on' : ''} ${u ? '' : 'lockb'} ${t.dark ? 'dk' : ''}" style="background:${themeBg(t.id)}" data-a="ds-theme" data-i="${t.id}">${t.n}</button>`; }).join('')}</div>`;
  else grid = `<div class="themes">${PATS.map(pt => `<button class="press ${r.pat === pt.id ? 'on' : ''} ${themeOf(r.theme).dark ? 'dk' : ''}" style="background:${themeBg(r.theme)}" data-a="ds-pat" data-i="${pt.id}"><span class="pat pat-${pt.id}" style="position:absolute;inset:0"></span><span style="position:relative">${pt.n}</span></button>`).join('')}</div>`;
  return `<div class="designer" id="designer" data-a="ds-desel">${roomHTML(r, DS.sel)}<div class="dfig">${avatarSvg(DS.av, { noBg: true, cls: 'idle' })}</div></div>${tools}<div class="seg"><button class="${tab === 'stk' ? 'on' : ''}" data-a="ds-tab" data-t="stk">⭐ Nálepky</button><button class="${tab === 'col' ? 'on' : ''}" data-a="ds-tab" data-t="col">🎨 Farby</button><button class="${tab === 'pat' ? 'on' : ''}" data-a="ds-tab" data-t="pat">🔲 Vzor</button></div>${grid}`;
}
function dsRefresh() { const b = $('#dsgn'); if (b) b.innerHTML = designerHTML(); DS.save && DS.save(); }
document.addEventListener('pointerdown', e => {
  const st = e.target.closest('.designer .stk'); if (!st || !DS) return; e.preventDefault();
  DS.sel = +st.dataset.i; DRAG = { i: DS.sel, el: st, box: st.closest('.designer').getBoundingClientRect() };
  try { st.setPointerCapture(e.pointerId); } catch (_) { }
  $$('.designer .stk').forEach(x => x.classList.toggle('sel', x === st)); sfx('tap');
  const tl = $('#dsgn .stktools, #dsgn .deckinfo'); if (tl) { const tmp = document.createElement('div'); const sel = DS.sel; tmp.innerHTML = designerHTML(); const nt = tmp.querySelector('.stktools'); if (nt) tl.replaceWith(nt); DS.sel = sel; }
});
document.addEventListener('pointermove', e => {
  if (!DRAG) return; const { box, el, i } = DRAG; const s = DS.room.stickers[i]; if (!s) return;
  s.x = +Math.max(3, Math.min(97, (e.clientX - box.left) / box.width * 100)).toFixed(1); s.y = +Math.max(3, Math.min(97, (e.clientY - box.top) / box.height * 100)).toFixed(1);
  el.style.left = s.x + '%'; el.style.top = s.y + '%'; DRAG.moved = true;
});
document.addEventListener('pointerup', () => { if (DRAG) { DRAG = null; DS.save && DS.save(); } });
const lockProfile = () => (OB && UI.view === 'onboard' && !OB.edit) ? { xp: 0, streak: { best: 0 } } : P();
function roomView() {
  const p = P(); DS = { room: p.room, av: p.av, sel: null, tab: DS && DS.tab || 'stk', lockP: p, save: () => { save(); applyRoom(); } };
  return `${topbar('room-back')}<main class="view"><h1 style="font-size:2rem">Moje pozadie</h1><p class="muted b">Navrhni si vlastné pozadie: vyber farby, vzor a nalep nálepky. Ukáže sa za tvojou postavičkou aj za celou apkou.</p><div id="dsgn" style="display:flex;flex-direction:column;gap:12px">${designerHTML()}</div><section class="card" style="padding:4px 14px"><button class="row" data-a="room-page"><span class="grow">Použiť aj ako pozadie celej apky</span><span class="toggle ${p.room.page ? 'on' : ''}"></span></button></section><button class="btn primary block" data-a="room-back">Hotovo</button></main>`;
};

/* ===== Pohľady ===== */
const VIEWS = {}, AFTER = {};
VIEWS.learn = () => {
  const p = P(); const dd = p.dailyDone === today();
  const card = k => { const ts = SUBJECTS[k].topics.filter(t => t.g === p.grade); const st = ts.reduce((a, t) => a + (p.topics[t.id]?.stars || 0), 0); const max = ts.length * 3; const d = { mat: ['1+2', 'Počty, násobilka, geometria, slovné úlohy', '➗'], sjl: ['Aa', 'Písmená, y/i, vybrané slová, slovné druhy', '✏️'], prv: ['🌍', '🌿 Príroda · 🗺️ Slovensko a svet · 🇬🇧 Angličtina', '🔭'] }[k]; return `<button class="card lsubj ${k} press" data-a="subject" data-s="${k}"><span class="big">${d[0]}</span><span class="lt"><b>${SUBJECTS[k].name}</b><span>${d[1]}</span><span class="pbar"><i style="width:${max ? st / max * 100 : 0}%"></i></span><small>⭐ ${st} / ${max} hviezd · ${ts.length} tém</small></span><span class="deco">${d[2]}</span></button>`; };
  return `${topbar()}<main class="view pop-in"><div><h1 style="font-size:2rem">Učenie</h1><p class="muted b">Vyber si predmet. Učivo je pre ${p.grade}. ročník, iný ročník si vyberieš v predmete.</p></div>${card('mat')}${card('sjl')}${card('prv')}
  <button class="card readcard press" data-a="nav" data-v="reads"><span class="ic">📖</span><span><b>Čítanka</b><span class="b" style="font-size:.9rem">Prečítaj príbeh nahlas a odpovedz na otázky</span></span></button>
  <button class="card daily press ${dd ? 'done' : ''}" data-a="daily"><span class="ic">${dd ? '✅' : '🎯'}</span><span><b>${dd ? 'Denná výzva splnená!' : 'Denná výzva'}</b><span class="b" style="font-size:.9rem">${dd ? 'Môžeš si ju zahrať znova.' : '10 otázok zo všetkých predmetov · +50 bodov'}</span></span></button></main>${nav('learn')}`;
};
/* --- obchod --- */
let SHOPCAT = 'all', SHOPSEL = null;
const SHOPCATS = [['all', 'Všetko'], ['top', '👕 Oblečenie'], ['shoes', '👟 Topánky'], ['acc', '🎩 Doplnky'], ['pet', '🐾 Zvieratká']];
function shopItems(p) { const out = []; for (const c of ['top', 'shoes', 'acc', 'pet']) for (const it of CATALOG[c]) if (it.price && (!it.g || it.g === p.av.gender)) out.push([c, it]); return out.sort((a, b) => a[1].price - b[1].price); }
const SHOP_DAYS = 2, DAYMS = 86400000;
function shopPeriod() { const d = new Date(); return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAYMS / SHOP_DAYS); }
function shopMs() { const d = new Date(); const now = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds()); return Math.max(0, (shopPeriod() + 1) * SHOP_DAYS * DAYMS - now); }
function cdHTML() { let t = Math.floor(shopMs() / 1000); const dd = Math.floor(t / 86400); t %= 86400; const hh = Math.floor(t / 3600); t %= 3600; const mm = Math.floor(t / 60), ss = t % 60; const b = (v, l) => `<span class="cdb"><b>${String(v).padStart(2, '0')}</b><small>${l}</small></span>`; return b(dd, plural(dd, 'deň', 'dni', 'dní')) + b(hh, 'hod') + b(mm, 'min') + b(ss, 'sek'); }
AFTER.shop = () => { TIMERS.push(setInterval(() => { const e = $('#shopcd'); if (!e) return; if (shopMs() <= 0) return render(null); e.innerHTML = cdHTML(); const s = e.querySelector('.cdb:last-child b'); if (s) { s.classList.remove('tick'); void s.offsetWidth; s.classList.add('tick'); } }, 1000)); };
function shopLeft() { const d = new Date(); const now = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes()); const ms = (shopPeriod() + 1) * SHOP_DAYS * DAYMS - now; const h = Math.max(1, Math.ceil(ms / 3600000)); return h >= 24 ? `${Math.floor(h / 24)} ${plural(Math.floor(h / 24), 'deň', 'dni', 'dní')} a ${h % 24} h` : `${h} h`; }
function shopPremium(p) { const rnd = seeded('prem' + shopPeriod() + p.id); return shopItems(p).filter(([, it]) => it.price >= 200 && !p.owned.includes(it.sid)).sort(() => rnd() - .5).slice(0, 2); }
function shopOffer(p) {
  const rnd = seeded('shop' + shopPeriod() + p.id); const all = shopItems(p).filter(([, it]) => it.price < 200 && !p.owned.includes(it.sid)).sort(() => rnd() - .5);
  const out = []; for (const c of ['top', 'shoes', 'acc', 'pet']) { const x = all.find(([cc]) => cc === c); if (x) out.push(x); }
  for (const x of all) { if (out.length >= 6) break; if (!out.includes(x)) out.push(x); }
  return out.sort((a, b) => a[1].price - b[1].price);
}
VIEWS.shop = () => {
  const p = P(); const list = shopOffer(p); const prem = shopPremium(p);
  const itemCard = ([c, it], i) => { const own = p.owned.includes(it.sid); const worn = p.av[c] === it.id; const can = (p.coins || 0) >= it.price; const sel = SHOPSEL === it.sid; const pr = it.price >= 200; return `<div class="card shopitem ${own ? 'own' : ''} ${pr ? 'premium' : ''}" style="animation:popUp .4s ${i * 35}ms backwards">${pr ? '<span class="prem">👑 PRÉMIUM</span>' : ''}<span class="th">${itemThumb(c, it, p.av)}</span><b>${it.n}</b>${own ? (worn ? '<span class="tag">Máš to oblečené ✓</span>' : `<button class="btn small good" data-a="shop-wear" data-c="${c}" data-i="${it.id}">Obliecť</button>`) : sel ? `<button class="btn small primary" data-a="buy" data-c="${c}" data-i="${it.id}">Áno, kúpiť!</button>` : `<button class="btn small ${can ? 'sun' : ''}" data-a="buy-ask" data-c="${c}" data-i="${it.id}" ${can ? '' : 'aria-disabled="true"'}>${COIN} ${it.price}</button>`}${!own && !can ? `<span class="muted b" style="font-size:.75rem">Chýba ${it.price - (p.coins || 0)}</span>` : ''}</div>`; };
  return `${topbar()}<main class="view"><section class="card shophead"><span class="coinbig">${COIN}</span><div><span class="eyebrow">Tvoje mince</span><b>${p.coins || 0}</b><span class="muted b" style="font-size:.85rem;display:block">Mince získaš za každú správnu odpoveď, hry, úlohy a čítanie.</span></div></section>
  <section class="card shoptimer"><div class="sthead"><span class="hourglass">⏳</span><div><b>Nový tovar o:</b><span class="muted b" style="display:block;font-size:.8rem">Ponuka sa mení každé ${SHOP_DAYS} dni. Čo si kúpiš, nájdeš v šatníku.</span></div></div><div class="cd" id="shopcd">${cdHTML()}</div></section><p class="muted b" style="font-size:.82rem">Mince sa nekupujú za peniaze, získaš ich učením. Rodič ťa môže odmeniť mincami v rodičovskom účte.</p>
  ${prem.length ? `<div class="sec"><h2>👑 Prémiová ponuka</h2><span class="eyebrow">od 200</span></div><div class="shopgrid">${prem.map(itemCard).join('')}</div><div class="sec"><h2>Bežná ponuka</h2></div>` : ''}
  <div class="shopgrid">${list.length ? '' : '<p class="b muted">Všetko z ponuky už máš! Nový tovar príde čoskoro.</p>'}${list.map(([c, it], i) => { const own = p.owned.includes(it.sid); const worn = p.av[c] === it.id; const can = (p.coins || 0) >= it.price; const sel = SHOPSEL === it.sid; return `<div class="card shopitem ${own ? 'own' : ''}" style="animation:popUp .4s ${i * 35}ms backwards"><span class="th">${itemThumb(c, it, p.av)}</span><b>${it.n}</b>${own ? (worn ? '<span class="tag">Máš to oblečené ✓</span>' : `<button class="btn small good" data-a="shop-wear" data-c="${c}" data-i="${it.id}">Obliecť</button>`) : sel ? `<button class="btn small primary" data-a="buy" data-c="${c}" data-i="${it.id}">Áno, kúpiť!</button>` : `<button class="btn small ${can ? 'sun' : ''}" data-a="buy-ask" data-c="${c}" data-i="${it.id}" ${can ? '' : 'aria-disabled="true"'}>${COIN} ${it.price}</button>`}${!own && !can ? `<span class="muted b" style="font-size:.75rem">Chýba ${it.price - (p.coins || 0)} ${COIN}</span>` : ''}</div>`; }).join('')}</div></main>${nav('shop')}`;
};
/* --- čítanka --- */
let RD = null, RDG = null, REC = null;
VIEWS.reads = () => {
  const p = P(); const g = RDG || p.grade;
  return `${topbar('learn-back')}<main class="view"><div style="display:flex;align-items:center;gap:12px"><span style="font-size:3rem">📖</span><div><h1 style="font-size:2rem">Čítanka</h1><p class="muted b" style="font-size:.9rem">Prečítaj si krátky príbeh nahlas, nahraj sa a odpovedz na otázky. Rodič si tvoje čítanie vypočuje.</p></div></div>
  <div class="chips">${[1, 2, 3, 4].map(x => `<button class="chip ${x === g ? 'on' : ''}" data-a="rd-grade" data-g="${x}">${x}. ročník</button>`).join('')}</div>
  <div class="topics">${READS.filter(r => r.g === g).map((r, i) => { const recs = p.readings.filter(x => x.r === r.id); const last = recs[0]; return `<button class="card topic press" data-a="rd-open" data-id="${r.id}" style="animation:popUp .4s ${i * 50}ms backwards"><span class="ti" style="background:var(--sun-soft)">${r.icon}</span><span class="tn">${r.title}<small>${last ? (last.rating ? 'Rodič: ' + RATE[last.rating] : (last.noAudio ? 'Prečítané nahlas ✓' : 'Nahrané, čaká na rodiča')) : 'Ešte neprečítané'}</small></span>${last ? '<span class="go" style="background:var(--good)">✓</span>' : '<span class="go">Čítať</span>'}</button>`; }).join('')}</div></main>${nav('learn')}`;
};
const RATE = { 3: '🌟 Výborne', 2: '🙂 Dobre', 1: '🔁 Ešte trénovať' };
VIEWS.read = () => {
  const r = READ[RD.id];
  const recUI = RD.blobUrl ? `<audio controls src="${RD.blobUrl}" style="width:100%"></audio><div class="rowbtns"><button class="btn" data-a="rec-again">🔁 Nahrať znova</button><button class="btn good" data-a="rec-save" ${RD.saved ? 'disabled' : ''}>${RD.saved ? 'Uložené ✓' : '💾 Uložiť pre rodiča'}</button></div>`
    : RD.recording ? `<button class="btn primary block recbtn on" data-a="rec-stop">⏹️ Zastaviť nahrávanie <span id="rectime">0 s</span></button>`
      : RD.done ? `<div class="readdone">✅ Prečítané! Výborne.</div>`
      : MIC_BLOCKED ? `<button class="btn primary block" data-a="dikt-open">🎙️ Nahrať cez diktafón</button><button class="btn block" data-a="rec-pick">📂 Pridať hotovú nahrávku</button><button class="linkbtn" data-a="rd-done">Prečítal(a) som bez nahrávky</button>`
      : `<button class="btn primary block recbtn" data-a="rec-start">🎤 Nahraj, ako čítaš</button>`;
  const qs = r.q.map((x, qi) => { const [qq, a, w] = x.split('|'); const opts = RD.opts[qi] || (RD.opts[qi] = shuffle([a, ...w.split(';')])); const ans = RD.ans[qi]; return `<div class="rq"><b>${qi + 1}. ${qq}</b><div class="opts one">${opts.map(o => `<button class="opt long ${ans !== undefined ? (o === a ? 'right' : (o === ans ? 'wrong' : 'dim')) : ''}" data-a="rd-ans" data-q="${qi}" data-o="${esc(o)}" ${ans !== undefined ? 'disabled' : ''}>${esc(o)}</button>`).join('')}</div></div>`; }).join('');
  return `<main class="view nonav"><div class="qtop"><button class="iconbtn press" data-a="rd-back" aria-label="Späť">←</button><div style="flex:1;font-family:var(--f-display);font-weight:800;font-size:1.2rem">${r.icon} ${r.title}</div><button class="iconbtn press" data-a="tut-open" aria-label="Návod">❓</button><button class="iconbtn press" data-a="rd-say" aria-label="Prečítať nahlas">🔊</button></div>
  <section class="card readtext g${r.g}">${r.text}</section>
  <section class="card recbox" style="padding:14px;display:flex;flex-direction:column;gap:10px"><b style="font-family:var(--f-display);font-size:1.15rem">1. Prečítaj text nahlas</b><span class="muted b" style="font-size:.85rem">${MIC_BLOCKED ? 'Čítaj pekne nahlas a zreteľne.' : 'Ťukni na mikrofón, prečítaj celý text a potom nahrávanie zastav.'}</span>${recUI}<input type="file" id="recfile" accept="audio/*,.m4a,.mp3,.amr,.3gp,.aac,.wav,.ogg,.opus,.webm" hidden></section>
  <section class="card qbox" style="padding:14px;display:flex;flex-direction:column;gap:14px"><b style="font-family:var(--f-display);font-size:1.15rem">2. Odpovedz na otázky</b>${qs}</section>
  ${Object.keys(RD.ans).length === r.q.length ? `<button class="btn primary block" data-a="rd-finish">Hotovo! Vyzdvihnúť odmenu</button>` : ''}</main>`;
};
const TUT = [
  { e: '👀', t: 'Najprv si text v rámčeku pozorne prečítaj potichu.', f: '.readtext' },
  { e: '🎤', t: 'Potom ťukni na tlačidlo „Nahraj, ako čítaš“ a čítaj text nahlas a zreteľne.', f: '.recbox' },
  { e: '✅', t: 'Keď dočítaš, ťukni na „Zastaviť“ a potom „Uložiť“. Ak sa mikrofón nezapne, ukážem ti, ako sa nahrať diktafónom.', f: '.recbox' },
  { e: '❓', t: 'Nakoniec odpovedz na otázky k textu a vyzdvihni si odmenu!', f: '.qbox' }
];
const TOUR = [
  { e: '🧸', t: 'Ahoj! Som medvedík Bystrík. Ukážem ti, čo všetko tu nájdeš. Ťukni na Ďalej.', f: null },
  { e: '👋', t: 'Toto si ty! Keď na seba ťukneš, zamávaš. Oblečenie si zmeníš v šatníku.', f: '.stage' },
  { e: '🎁', t: 'Tu si každý deň vyzdvihni dennú odmenu.', f: '.float.chest' },
  { e: '✅', t: 'Tu sú dnešné úlohy. Za splnené úlohy dostaneš body a mince.', f: '.tasks' },
  { e: '📚', t: 'Tu sa učíš: matematika, slovenčina, prehľad a čítanka.', f: '.nav [data-v="learn"]' },
  { e: '🎮', t: 'Tu sú minihry. Za deň si môžeš zahrať pár hier.', f: '.nav [data-v="games"]' },
  { e: '🪙', t: 'Toto sú tvoje mince. Za ne si kúpiš nové veci v obchode.', f: '.coinchip' },
  { e: '👕', t: 'V šatníku sa oblečieš a navrhneš si vlastné pozadie.', f: '.nav [data-v="wardrobe"]' },
  { e: '🚀', t: 'Hotovo! Poďme sa spolu učiť. Návod nájdeš kedykoľvek v nastaveniach.', f: null }
];
let GUIDE = null;
function showGuide(steps, i, end) {
  GUIDE = { steps, end }; clearTut(); GUIDE = { steps, end, cur: steps[i].t };
  const st = steps[i]; const el = st.f ? $(st.f) : null; let atTop = false;
  if (el) { el.classList.add('tutfocus'); const r = el.getBoundingClientRect(); if (r.top > innerHeight * .55) atTop = true; if (!el.closest('.nav') && !el.closest('.top')) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); atTop = false; const r2 = el.getBoundingClientRect(); if (r2.top > innerHeight * .5) atTop = true; } }
  const w = document.createElement('div'); w.className = 'tutsheet' + (atTop ? ' attop' : '');
  w.innerHTML = `<div class="in"><div class="dots">${steps.map((_, k) => `<i class="${k === i ? 'on' : ''}"></i>`).join('')}</div><div class="tutrow">${steps === TUT ? `<span class="tutemoji">${st.e}</span>` : `<span class="tutbear">${owlSvg('')}</span>`}<p class="typed">${st.t}</p><button class="iconbtn press tutsay" data-a="tut-say" aria-label="Prečítaj znova">🔊</button></div><div class="rowbtns"><button class="btn" data-a="tut-skip">Preskočiť</button><button class="btn primary" data-a="tut-next" data-i="${i + 1}">${i + 1 < steps.length ? 'Ďalej →' : 'Rozumiem! 👍'}</button></div></div>`;
  document.body.appendChild(w); say(st.t); sfx('pop');
}
function endTour() { clearTut(); const p = P(); if (p) { p.tourDone = true; save(); } confetti(120, .3); }
function clearTut() { document.querySelectorAll('.tutsheet').forEach(e => e.parentNode.removeChild(e)); document.querySelectorAll('.tutfocus').forEach(e => e.classList.remove('tutfocus')); }
function showTut(i = 0) { return showGuide(TUT, i, endTut); }
function showTutOld(i = 0) {
  clearTut();
  const st = TUT[i]; const el = $(st.f); if (el) { el.classList.add('tutfocus'); el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
  const w = document.createElement('div'); w.className = 'tutsheet';
  w.innerHTML = `<div class="in"><div class="dots">${TUT.map((_, k) => `<i class="${k === i ? 'on' : ''}"></i>`).join('')}</div><div class="tutrow"><span class="tutemoji">${st.e}</span><p>${st.t}</p></div><div class="rowbtns"><button class="btn" data-a="tut-skip">Preskočiť</button><button class="btn primary" data-a="tut-next" data-i="${i + 1}">${i + 1 < TUT.length ? 'Ďalej →' : 'Rozumiem! 👍'}</button></div></div>`;
  document.body.appendChild(w); say(st.t); sfx('pop');
}
function endTut() { clearTut(); const p = P(); p.tutRead = true; save(); scrollTo({ top: 0, behavior: 'smooth' }); }
AFTER.read = () => {
  if (!P().tutRead && !RD.tutShown) { RD.tutShown = true; setTimeout(() => showTut(0), 500); } const f = $('#recfile'); if (f) f.addEventListener('change', () => { const file = f.files && f.files[0]; if (file) gotRecording(file); }); };
async function recStart() {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream); REC = { mr, chunks: [], stream, t0: Date.now() };
      mr.ondataavailable = e => { if (e.data && e.data.size) REC.chunks.push(e.data); };
      mr.onstop = () => { stream.getTracks().forEach(t => t.stop()); gotRecording(new Blob(REC.chunks, { type: mr.mimeType || 'audio/webm' })); };
      mr.start(); RD.recording = true; render(null); sfx('pop');
      TIMERS.push(setInterval(() => { const e = $('#rectime'); if (e && REC) e.textContent = Math.round((Date.now() - REC.t0) / 1000) + ' s'; }, 500));
      return;
    } catch (e) { }
  }
  MIC_BLOCKED = true; render(null); openDiktafon();
}
let MIC_BLOCKED = false;
function openDiktafon() {
  closeSheet(); sfx('whoosh');
  const w = document.createElement('div'); w.id = 'sheetwrap';
  w.innerHTML = `<div class="scrim" data-a="close-sheet"></div><div class="sheet" role="dialog" aria-label="Nahrávanie cez diktafón"><div class="grab"></div><h2>🎙️ Nahraj sa diktafónom</h2><p class="muted b" style="font-size:.88rem;margin-bottom:10px">Tu sa mikrofón zapnúť nedá, tak použijeme diktafón v telefóne. Text budeš vidieť celý čas.</p>
  <div class="dsteps"><div><span>1</span><p>Otvor v telefóne aplikáciu <b>Diktafón</b> (môže sa volať aj Záznam zvuku alebo Hlasové poznámky) a ťukni na 🔴 nahrávanie.</p></div><div><span>2</span><p>Vráť sa sem do Bystríka. Diktafón nahráva ďalej. Prečítaj text nahlas.</p></div><div><span>3</span><p>V diktafóne nahrávanie zastav a ulož.</p></div><div><span>4</span><p>Tu ťukni na <b>Pridať nahrávku</b> a vyber ju.</p></div></div>
  <button class="btn primary block" style="margin-top:12px" data-a="rec-pick">📂 Pridať nahrávku</button><button class="btn block" style="margin-top:10px" data-a="close-sheet">Idem čítať</button></div>`;
  document.body.appendChild(w); say('Otvor v telefóne diktafón, zapni nahrávanie, vráť sa sem a prečítaj text nahlas. Potom nahrávku ulož a pridaj ju sem.');
}
function gotRecording(blob) { RD.recording = false; RD.blob = blob; if (RD.blobUrl) URL.revokeObjectURL(RD.blobUrl); RD.blobUrl = URL.createObjectURL(blob); RD.saved = false; render(null); sfx('ok'); }
function idb() { return new Promise((res, rej) => { try { const r = indexedDB.open('bystrik-audio', 1); r.onupgradeneeded = () => r.result.createObjectStore('rec', { keyPath: 'id' }); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); } catch (e) { rej(e); } }); }
async function idbOp(mode, fn) { const db = await idb(); return new Promise((res, rej) => { const tx = db.transaction('rec', mode); const st = tx.objectStore('rec'); const q = fn(st); tx.oncomplete = () => res(q && q.result); tx.onerror = () => rej(tx.error); }); }

VIEWS.room = roomView;

/* --- úvod --- */
let OB = null;
const OB_T = ['', 'Ahoj! Ako sa voláš?', 'Si dievča alebo chlapec?', 'Do ktorej triedy chodíš?', 'Vyber si zvieratko! Bude tvojím kamarátom.', 'Aký účes sa ti páči?', 'Teraz si navrhni pozadie!'];
const OB_HELLO = 'Ahoj! Ja som medvedík Bystrík. Spolu sa budeme učiť matiku, slovinu aj veci zo sveta. Za učenie dostaneš body, mince a nové oblečenie. Poďme na to!';
VIEWS.onboard = () => {
  const s = OB.step; const dots = `<div class="dots">${[0, 1, 2, 3, 4, 5, 6].map(i => `<i class="${i === s ? 'on' : ''}"></i>`).join('')}</div>`;
  let body = '';
  if (s === 0) body = `<div style="display:grid;place-items:center">${owlSvg()}</div><h1 style="font-size:2.4rem;text-align:center">Ahoj! Ja som medvedík Bystrík.</h1><p class="muted b" style="text-align:center">Spolu sa naučíme matiku a slovinu. Za každý level dostaneš nové oblečenie, topánky, účesy a ďalšie odmeny pre svoju postavičku.</p><button class="btn primary block" data-a="ob-next">Poďme na to!</button>${DATA.profiles.length ? '<button class="btn block" data-a="nav" data-v="profiles">Už mám hráča</button>' : ''}`;
  if (s === 1) body = `<span class="eyebrow">${OB.edit ? 'Úvodné nastavenie · ' : ''}Krok 1 z 6</span><h1 style="font-size:2rem">Ako sa voláš?</h1><input class="field" id="ob-name" maxlength="16" autocomplete="off" placeholder="Tvoje meno" value="${esc(OB.name)}"><button class="btn primary block" data-a="ob-name">Ďalej</button>`;
  if (s === 2) body = `<span class="eyebrow">Krok 2 z 6</span><h1 style="font-size:2rem">Si dievča alebo chlapec?</h1><div class="pickg">${['d', 'c'].map(g => `<button class="card press ${OB.gender === g ? 'on' : ''}" data-a="ob-g" data-g="${g}">${avatarSvg(defaultAvatar(g), { cls: 'idle', noBg: true, noPet: true })}${g === 'd' ? 'Dievča' : 'Chlapec'}</button>`).join('')}</div>`;
  if (s === 3) body = `<span class="eyebrow">Krok 3 z 6</span><h1 style="font-size:2rem">Do ktorej triedy chodíš?</h1><div class="grades">${[1, 2, 3, 4].map(g => `<button class="card press gr${g} ${OB.grade === g ? 'on' : ''}" data-a="ob-grade" data-g="${g}"><span class="gre">${['🐣', '🐥', '🦊', '🦁'][g - 1]}</span><b>${g}.</b>ročník</button>`).join('')}</div>`;
  if (s === 4) body = `<span class="eyebrow">Krok 4 z 6</span><h1 style="font-size:2rem">Vyber si zvieratko</h1><p class="muted b">Bude ťa sprevádzať a pri matike ti požičia kalkulačku.</p><div class="petpick pop-in">${CATALOG.pet.filter(x => (!x.g || x.g === OB.gender) && (OB.edit ? unlocked(x, P()) : (!x.lvl && !x.streak && !x.price))).map(x => `<button class="card press ${OB.av.pet === x.id ? 'on' : ''}" data-a="ob-pet" data-i="${x.id}">${x.e}<span>${x.n}</span></button>`).join('')}</div><label class="b" for="ob-petname">Ako sa bude volať?</label><input class="field" id="ob-petname" maxlength="14" autocomplete="off" placeholder="Meno zvieratka" value="${esc(OB.av.petName || petName(OB.av))}"><button class="btn primary block" data-a="ob-pet-next">Ďalej</button><p class="muted b" style="font-size:.9rem">Ďalšie zvieratká, napríklad pandu, líštičku alebo dráčika, si odomkneš neskôr.</p>`;
  if (s === 5) body = `<span class="eyebrow">Krok 5 z 6</span><h1 style="font-size:2rem">Aký účes sa ti páči?</h1><div class="card" style="display:grid;grid-template-columns:120px 1fr;gap:10px;align-items:center;padding:8px"><div id="ob-fig">${avatarSvg(OB.av, { cls: 'idle' })}</div><div class="items" style="grid-template-columns:repeat(2,1fr)">${CATALOG.hair.filter(h => h.g === OB.gender && (OB.edit ? unlocked(h, P()) : !h.lvl)).map(h => `<button class="item press ${OB.av.hair === h.id ? 'on' : ''}" data-a="ob-hair" data-i="${h.id}">${itemThumb('hair', h, OB.av)}<span class="lab">${h.n}</span></button>`).join('')}</div></div><p class="muted b">Farby vlasov aj oblečenia si neskôr zmeníš v šatníku. Každý kúsok môže mať inú farbu.</p><button class="btn primary block" data-a="ob-to-room">Ďalej</button>`;
  if (s === 6) { DS = { room: OB.room, av: OB.av, sel: null, tab: 'stk', lockP: OB.edit ? P() : { xp: 0, streak: { best: 0 } }, save: null }; body = `<span class="eyebrow">${OB.edit ? 'Úvodné nastavenie · ' : ''}Krok 6 z 6</span><h1 style="font-size:2rem">Navrhni si pozadie</h1><p class="muted b">Vyber farby a nalep nálepky. Bude za tvojou postavičkou aj za celou apkou.</p><div id="dsgn" style="display:flex;flex-direction:column;gap:12px">${designerHTML()}</div><button class="btn primary block" data-a="ob-done">${OB.edit ? 'Uložiť zmeny' : 'Hotovo, začíname!'}</button>`; }
  if (s === 0) body = `<div class="obhero"><div class="floaties" aria-hidden="true">${['📚', '✏️', '⭐', '🎨', '🔢', '🅰️', '🌍', '🎈', '🧩', '🏆'].map((e, i) => `<span style="left:${(i * 11 + 4) % 92}%;animation-delay:-${i * 1.1}s;animation-duration:${7 + (i % 4)}s">${e}</span>`).join('')}</div><button class="herobear" data-a="ob-say" aria-label="Medvedík Bystrík">${owlSvg('')}<span class="wavehand">👋</span><span class="herobub">Ťukni na mňa!</span></button><h1 class="logo" aria-label="Bystrík">${'Bystrík'.split('').map((c, i) => `<span style="animation-delay:${.25 + i * .08}s">${c}</span>`).join('')}</h1><p class="tagline">Hravé učenie pre 1. až 4. ročník</p><div class="feat">${[['🔢', 'Matika'], ['📝', 'Slovina'], ['🌍', 'Prehľad'], ['🎮', 'Hry'], ['👕', 'Šatník'], ['🏆', 'Odmeny']].map(([e, n], i) => `<span style="animation-delay:${.85 + i * .08}s">${e} ${n}</span>`).join('')}</div></div><button class="btn primary block glowbtn" data-a="ob-next">Poďme na to! 🚀</button>${DATA.profiles.length ? '<button class="btn block" data-a="nav" data-v="profiles">👥 Už mám hráča</button>' : ''}`;
  else { body = body.replace(/<span class="eyebrow">[^<]*(?:<[^>]*>[^<]*)*?<\/span><h1[^>]*>.*?<\/h1>/, ''); body = `<div class="obtop"><div class="obprog"><i style="width:${s / 6 * 100}%"></i></div><span class="eyebrow">${OB.edit ? 'Úvodné nastavenie · ' : ''}Krok ${s} z 6</span></div><div class="obsay"><button class="obbear" data-a="ob-say" aria-label="Prečítaj znova">${owlSvg('')}</button><div class="bub">${OB_T[s]}</div></div>` + body; }
  return `<main class="view nonav ob ${s === 0 ? 'ob0' : ''}" style="gap:18px">${body}${s > 0 ? '<button class="btn small" style="align-self:center" data-a="ob-back">← Späť</button>' : ''}</main>`;
};
AFTER.onboard = () => { if (OB.step > 0) setTimeout(() => say(OB_T[OB.step]), 250); const i = $('#ob-name'); if (i) { i.focus(); i.addEventListener('keydown', e => { if (e.key === 'Enter') ACT['ob-name'](); }); } };
VIEWS.profiles = () => `<main class="view nonav" style="justify-content:center"><div style="display:grid;place-items:center">${owlSvg()}</div><h1 style="font-size:2rem;text-align:center">Kto sa bude hrať?</h1><div class="profiles pop-in">${DATA.profiles.map(p => `<button class="card prof press" data-a="pick-prof" data-id="${p.id}"><span class="headbub">${avatarSvg(p.av, { crop: 'head' })}</span><b>${esc(p.name)}</b><span class="muted b">${p.grade}. ročník · Lv ${levelInfo(p.xp).L}</span></button>`).join('')}<button class="card prof press" data-a="new-prof" style="justify-content:center"><span style="font-size:3rem">➕</span><b>Nový hráč</b></button></div></main>`;

/* --- lobby --- */
VIEWS.home = () => {
  const p = P(); const li = levelInfo(p.xp); const d = ensureDay(p); const pet = itemOf('pet', p.av.pet);
  let nextL = null; for (let L = li.L + 1; L <= 30; L++) if (rewardsAt(L, p.av.gender).length) { nextL = L; break; }
  const nr = nextL ? rewardsAt(nextL, p.av.gender) : [];
  const toNext = nextL ? (() => { let x = li.need - li.cur; for (let L = li.L + 1; L < nextL; L++) x += need(L); return x; })() : 0;
  const stage = `<section class="card stage"><div class="bgav">${roomHTML(p.room)}</div><div class="fig" data-a="wave">${avatarSvg(p.av, { cls: 'idle', noBg: true })}</div>
    <button class="float chest press ${drReady(p) ? 'ready' : ''}" data-a="dreward"><span class="fi">${drReady(p) ? '🎁' : '✅'}</span>${drReady(p) ? 'Denná odmena' : 'Zajtra ďalšia'}</button>
    <button class="float fire press" data-a="rtab-go" data-t="streak"><span class="fi">🔥</span>${p.streak.count} ${plural(p.streak.count, 'deň', 'dni', 'dní')}</button>
    <div class="float owlb">${owlSvg('')}<span>${pick(TIPS)}</span></div>
    <div class="nameplate">${esc(p.name)}<small>${title(li.L)}</small><small>${pet.e} ${esc(petName(p.av))}</small></div><button class="float press" style="right:12px;top:92px;min-width:0;padding:6px 8px" data-a="nav" data-v="room" aria-label="Upraviť pozadie"><span class="fi" style="font-size:1.4rem">🎨</span></button><button class="float press" style="left:12px;top:92px;min-width:0;padding:6px 8px" data-a="nav" data-v="rewards" aria-label="Odmeny"><span class="fi" style="font-size:1.4rem">🏆</span></button></section>`;
  const wk = ['Po', 'Ut', 'St', 'Št', 'Pi', 'So', 'Ne']; const now = new Date(); const dow = (now.getDay() + 6) % 7;
  const week = wk.map((n, i) => { const dd = new Date(); dd.setDate(now.getDate() - dow + i); const k = dkey(dd); const on = !!p.days[k]; return `<span><i class="${on ? 'on' : ''} ${i === dow ? 'today' : ''}" style="animation-delay:${i * 50}ms">${on ? '🔥' : ''}</i>${n}</span>`; }).join('');
  const nextStreak = streakRewards(p.av.gender).find(([, it]) => it.streak > (p.streak.best || 0));
  const streak = `<section class="card streak"><div class="row1"><span class="flame">🔥</span><div style="flex:1"><b class="n">${p.streak.count} ${plural(p.streak.count, 'deň', 'dni', 'dní')} po sebe</b><div class="muted b" style="font-size:.88rem">${p.streak.last === today() ? 'Dnes máš splnené. Príď aj zajtra!' : 'Dnes sa ešte uč, nech séria nevyhasne!'}</div></div></div><div class="week">${week}</div>${nextStreak ? `<div class="b" style="font-size:.88rem">🎁 Pri sérii ${nextStreak[1].streak} dní získaš: ${rewardName(...nextStreak)}</div>` : ''}</section>`;
  const tasks = d.tasks.map(id => { const T = TASKS.find(x => x.id === id); const c = Math.min(T.t, d.cnt[T.k] || 0); const done = c >= T.t, cl = d.claimed.includes(id); return `<div class="task ${cl ? 'done' : ''}"><span class="ck">${cl ? '✓' : T.i}</span><div class="tt">${T.n}<div class="tb"><i style="width:${c / T.t * 100}%"></i></div></div>${cl ? '<span class="xp">Hotovo</span>' : done ? `<button class="claim press" data-a="claim" data-id="${id}">+${T.xp} 🎁</button>` : `<span class="xp">${c}/${T.t}</span>`}</div>`; }).join('');
  const allCl = d.tasks.every(id => d.claimed.includes(id));
  const taskCard = `<section class="card tasks"><div class="sec"><h2>Dnešné úlohy</h2><span class="eyebrow">${d.claimed.length}/3</span></div>${tasks}${allCl && !d.bonus ? `<button class="btn sun block press" data-a="claim-bonus">Všetko splnené! Otvor truhlicu +50 🎁</button>` : allCl ? '<p class="b muted">Super! Zajtra budú nové úlohy.</p>' : '<p class="muted b" style="font-size:.85rem">Keď splníš všetky tri, dostaneš truhlicu s bonusom.</p>'}</section>`;
  const subj = k => { const ts = SUBJECTS[k].topics.filter(t => t.g === p.grade); const st = ts.reduce((s, t) => s + (p.topics[t.id]?.stars || 0), 0); const max = ts.length * 3; return `<button class="card subj ${k} press" data-a="subject" data-s="${k}"><span class="big">${k === 'mat' ? '1+2' : k === 'sjl' ? 'Aa' : '🌍'}</span><h3>${SUBJECTS[k].name}</h3><span class="muted b" style="font-size:.85rem">⭐ ${st} / ${max} hviezd</span><span class="pbar"><i style="width:${max ? st / max * 100 : 0}%"></i></span><span class="deco">${k === 'mat' ? '➗' : k === 'sjl' ? '✏️' : '🔭'}</span></button>`; };
  const dd = p.dailyDone === today();
  return `${topbar()}<main class="view pop-in">${stage}${ptaskCard(p)}${streak}${taskCard}
  <div style="display:flex;flex-direction:column;gap:8px"><div class="sec"><h2>Učenie</h2><span class="eyebrow">${p.grade}. ročník</span></div><div class="subjects">${subj('mat')}${subj('sjl')}${subj('prv')}</div><p class="muted b" style="font-size:.85rem">Prehľad: príroda, Slovensko a svet okolo nás a angličtina.</p></div>
  <button class="card daily press ${dd ? 'done' : ''}" data-a="daily"><span class="ic">${dd ? '✅' : '🎯'}</span><span><b>${dd ? 'Denná výzva splnená!' : 'Denná výzva'}</b><span class="b" style="font-size:.9rem">${dd ? 'Môžeš si ju zahrať znova, len tak pre radosť.' : '10 otázok zo všetkých predmetov · +50 bodov'}</span></span></button>
  <button class="card readcard press" data-a="nav" data-v="reads"><span class="ic">📖</span><span><b>Čítanka</b><span class="b" style="font-size:.9rem">Krátke príbehy na čítanie nahlas · rodič si ťa vypočuje</span></span></button>
  <div class="tiles2"><button class="card tile2 games press" data-a="nav" data-v="games"><span class="i">🎈</span><b>Minihry</b><span>Balóny, slovný dážď a Pravda či nie</span></button>${CHAT_ON() ? `<button class="card tile2 chat press" data-a="nav" data-v="chat"><span class="i">🧸</span><b>Opýtaj sa Bystríka</b><span>Vysvetlí ti, čomu nerozumieš</span></button>` : `<button class="card tile2 chat press" data-a="nav" data-v="wardrobe"><span class="i">👕</span><b>Šatník</b><span>Obleč si svoju postavičku</span></button>`}</div>
  ${nextL ? `<button class="card next press" data-a="nav" data-v="rewards"><span class="thumb">${itemThumb(nr[0][0], nr[0][1], p.av)}</span><span style="min-width:0"><span class="eyebrow">Ďalšia odmena · level ${nextL}</span><b style="display:block;font-family:var(--f-display);font-size:1.1rem;line-height:1.15">${nr.map(x => rewardName(...x)).join(', ')}</b><span class="muted b" style="font-size:.88rem">Chýba ti ešte ${toNext} bodov</span></span></button>` : ''}
  </main>${nav('home')}`;
};
AFTER.home = () => { if (UI.params.wave) { const f = $('.stage .avatar'); f && f.classList.add('waving'); } };

/* --- predmet --- */
function weekDiploma(p) {
  const since = Date.now() - 7 * DAYMS; const days = Array.from({ length: 7 }, (_, i) => p.days[daysAgo(i)]).filter(Boolean);
  const q = days.reduce((a, d) => a + d.q, 0), c = days.reduce((a, d) => a + d.c, 0); const log = p.log.filter(l => l.t >= since);
  const cnt = {}; log.forEach(l => { if (l.id && TOPIC[l.id]) cnt[l.id] = (cnt[l.id] || 0) + 1; }); const top = Object.entries(cnt).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const reads = (p.readings || []).filter(r => r.t >= since).length, games = log.filter(l => l.k.startsWith('game')).length;
  const praise = q >= 150 ? 'Bol to úžasný týždeň plný učenia! Si skutočný šampión. 🏆' : q >= 60 ? 'Skvelý týždeň! Učíš sa poctivo a ide ti to výborne. 🌟' : q > 0 ? 'Dobrý začiatok! Skús sa učiť trochu každý deň. 💪' : 'Tento týždeň sa ešte len začína. Poď sa učiť a diplom sa naplní! 🧸';
  const d0 = new Date(since), d1 = new Date();
  return `<section class="diploma"><div class="dribbon">📜 TÝŽDENNÝ DIPLOM 📜</div><span class="muted b">${d0.getDate()}. ${d0.getMonth() + 1}. – ${d1.getDate()}. ${d1.getMonth() + 1}. ${d1.getFullYear()}</span><h2>${esc(p.name)}</h2><span class="b">${p.grade}. ročník · Level ${levelInfo(p.xp).L}</span>
  <div class="dstats"><div><b>${c}</b><span>správnych odpovedí</span></div><div><b>${q ? Math.round(c / q * 100) : 0} %</b><span>úspešnosť</span></div><div><b>${days.length}/7</b><span>dní učenia</span></div><div><b>${reads}</b><span>prečítaných textov</span></div></div>
  ${top.length ? `<div class="dtop"><b>Najviac si trénoval(a):</b>${top.map(([id]) => `<span>${TOPIC[id].icon} ${TOPIC[id].name}</span>`).join('')}</div>` : ''}
  <p class="dpraise">${praise}</p><div class="dsign"><span class="dbear">${owlSvg('')}</span><div><b>Medvedík Bystrík</b><span>tvoj učiteľ</span></div><span class="dmedal">${q >= 150 ? '🥇' : q >= 60 ? '🥈' : '🥉'}</span></div></section><p class="muted b" style="font-size:.82rem;text-align:center">Diplom sa každý deň aktualizuje podľa posledných 7 dní.${games ? ` Tento týždeň si odohral(a) ${games} ${plural(games, 'minihru', 'minihry', 'miníhier')}.` : ''}</p>`;
}
function ptaskCard(p) {
  const act = (p.ptasks || []).filter(t => !t.done && TOPIC[t.topic]); if (!act.length) return '';
  return `<section class="card ptasks"><div class="sec"><h2>📋 Úlohy od rodiča</h2></div>${act.map(t => `<div class="task"><span class="ck">${TOPIC[t.topic].icon}</span><div class="tt">Získaj ${'⭐'.repeat(t.stars)} v téme ${TOPIC[t.topic].name}<div class="muted" style="font-size:.78rem">${SUBJECTS[TOPIC[t.topic].s].name} · odmena +${t.coins} ${COIN}</div></div><button class="claim press" data-a="pt-go" data-id="${t.topic}">Ísť na to</button></div>`).join('')}</section>`;
}
let PAREA = 'all';
VIEWS.subject = ({ s, g }) => {
  const p = P(); g = g || p.grade; const S = SUBJECTS[s]; const m = p.mode[s] || 'quiz';
  const ts = S.topics.filter(t => t.g === g).map(t => ({ ...t, s }));
  return `${topbar('learn-back')}<main class="view"><h1 style="font-size:2rem">${S.name}</h1>
  ${s !== 'mat' ? `<button class="card readcard press" data-a="nav" data-v="reads"><span class="ic">📖</span><span><b>Čítanka</b><span class="b" style="font-size:.9rem">Prečítaj príbeh nahlas, nahraj sa a odpovedz na otázky</span></span></button>` : ''}
  <span class="eyebrow">1. Ako sa chceš učiť?</span>
  <div class="modepick" role="radiogroup">${Object.entries(MODES).map(([k, x]) => `<button class="mp press ${k === m ? 'on' : ''}" data-a="mode" data-m="${k}" data-s="${s}" role="radio" aria-checked="${k === m}"><span class="mi">${x.i}</span>${x.n}</button>`).join('')}</div>
  <div class="modehelp"><span style="font-size:1.6rem">${MODES[m].i}</span><span>${MODES[m].d}</span></div>
  <span class="eyebrow">2. Vyber ročník a tému</span>
  <div class="chips">${[1, 2, 3, 4].map(x => `<button class="chip ${x === g ? 'on' : ''}" data-a="grade-chip" data-g="${x}" data-s="${s}">${x}. ročník</button>`).join('')}</div>
  ${s === 'prv' ? `<div class="chips">${[['all', '✨ Všetko'], ...Object.entries(AREAS).map(([k, a]) => [k, a.i + ' ' + a.n])].map(([k, n]) => `<button class="chip ${PAREA === k ? 'on' : ''}" data-a="parea" data-k="${k}">${n}</button>`).join('')}</div>` : ''}
  ${(s === 'prv' ? Object.keys(AREAS).filter(k => PAREA === 'all' || PAREA === k).map(k => [k, ts.filter(t => (TOPIC[t.id].area || 'bio') === k)]) : [[null, ts]]).filter(([, list]) => list.length).map(([k, list]) => `${k ? `<div class="areahead a-${k}"><span>${AREAS[k].i}</span>${AREAS[k].n}</div>` : ''}<div class="topics">${list.map((t, i) => { const st = p.topics[t.id]; const ok = modeOk(t, m); return `<button class="card topic press ${ok ? '' : 'na'}" data-a="topic" data-id="${t.id}" style="animation:popUp .4s ${i * 45}ms backwards"><span class="ti" style="background:var(--c-${s}-soft)">${t.icon}</span><span class="tn">${t.name}<small>${ok ? (st && st.total ? `${Math.round(st.correct / st.total * 100)} % správne` : 'Ešte nevyskúšané') : `${MODES[m].n} tu nie je, vyber iný spôsob`}</small></span>${starStr(st?.stars || 0)}${ok ? '<span class="go">Hrať</span>' : ''}</button>`; }).join('')}</div>`).join('')}</main>${nav('learn')}`;
};
function startMode(id) {
  const t = TOPIC[id]; const p = P(); const m = p.mode[t.s] || 'quiz'; const back = { v: 'subject', p: { s: t.s, g: t.g } };
  if (!modeOk(t, m)) { toast(`${MODES[m].n} v tejto téme nie je. Vyber iný spôsob hore.`); sfx('no'); return; }
  if (m === 'quiz' || m === 'time') return startQuiz([id], m, back);
  if (m === 'cards') { const deck = topicCards(t); CD = { t: id, deck, total: deck.length, known: 0, xp: 0, back }; return go('cards', {}, 'u'); }
  if (m === 'pex') { let pairs = t.pex ? t.pex() : null; for (let k = 0; k < 5 && !pairs; k++) pairs = pexesoPairs(t); const tiles = shuffle(pairs.flatMap(([a, b], i) => [{ v: a, pair: i }, { v: b, pair: i }])); PX = { t: id, tiles, moves: 0, lock: false, back }; return go('pexeso', {}, 'u'); }
  if (m === 'match') {
    if (t.type === 'cat') { const items = shuffle(topicItems(t)).slice(0, 10); ST = { t: id, items, i: 0, correct: 0, back }; return go('sort', {}, 'u'); }
    let pairs = t.pex ? t.pex() : null; for (let k = 0; k < 5 && !pairs; k++) pairs = pexesoPairs(t);
    MT = { t: id, left: shuffle(pairs.map(([a], i) => ({ v: a, pair: i }))), right: shuffle(pairs.map(([, b], i) => ({ v: b, pair: i }))), sel: null, done: {}, mistakes: 0, back }; return go('match', {}, 'u');
  }
}

/* --- kvíz --- */
let Q = null;
function startQuiz(topicIds, mode, back) {
  Q = { topicIds, mode, back, i: 0, total: 10, correct: 0, combo: 0, seen: new Set(), xp: 0, cur: null, input: '', answered: false, left: 60 };
  nextQ(); go('quiz', {}, 'u');
  if (mode === 'time') TIMERS.push(setInterval(() => { Q.left--; const el = $('.timer'); if (el) { el.textContent = Q.left + ' s'; el.classList.toggle('low', Q.left <= 10); } if (Q.left <= 10 && Q.left > 0) sfx('tick'); if (Q.left <= 0) { clearTimers(); finishQuiz(); } }, 1000));
}
function nextQ() {
  const t = TOPIC[pick(Q.topicIds)]; let q;
  for (let k = 0; k < 25; k++) { q = makeQuestion(t, Q.mode === 'time' ? 'time' : 'quiz'); if (!Q.seen.has(q.key)) break; }
  Q.seen.add(q.key); q.topic = t.id; q.s = t.s; Q.cur = q; Q.answered = false; Q.input = '';
}
VIEWS.quiz = () => {
  const p = P();
  const head = `<div class="qtop"><button class="iconbtn press" data-a="quit" aria-label="Ukončiť">✕</button>${Q.mode === 'time' ? `<div class="prog"><i style="width:${Math.min(100, Q.correct * 5)}%"></i></div><span class="timer">${Q.left} s</span>` : `<div class="prog"><i style="width:${Q.i / Q.total * 100}%"></i></div>`}<span class="combo" id="combo">${Q.combo >= 2 ? '🔥' + Q.combo : ''}</span><span class="mini" id="mini">${avatarSvg(p.av, { crop: 'head' })}</span></div>`;
  return `<main class="view nonav peekpad">${head}<div id="qbody">${qBody()}</div></main>`;
};
function qBody() {
  const q = Q.cur; const isEq = !q.html && /^[\d\s +−·:=?]+$/.test(q.text) && q.text.length < 26;
  const speak = 'speechSynthesis' in window && DATA.settings.voice ? `<button class="speak press" data-a="speak" aria-label="Prečítať nahlas">🔊</button>` : '';
  const card = `<section class="card qcard enter">${speak}${q.html}<div class="qtext ${isEq ? 'eq' : ''}">${q.text}</div></section>`;
  let ans;
  if (q.input) ans = `<div class="pad"><div class="padshow" id="padshow">${Q.input || '&nbsp;'}</div><div class="keys">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button class="key" data-a="key" data-k="${n}">${n}</button>`).join('')}<button class="key del" data-a="key" data-k="del" aria-label="Zmazať">⌫</button><button class="key" data-a="key" data-k="0">0</button><button class="key ok" data-a="key" data-k="ok" aria-label="Potvrdiť">✓</button></div></div>`;
  else { const long = q.options.some(o => o.length > 12); ans = `<div class="opts ${q.options.length === 2 || (long && q.options.some(o => o.length > 18)) ? 'one' : ''}" id="opts">${q.options.map((o, i) => `<button class="opt ${long ? 'long' : ''}" data-a="ans" data-i="${i}" style="animation:popUp .35s ${80 + i * 60}ms backwards cubic-bezier(.3,1.6,.5,1)">${esc(o)}</button>`).join('')}</div>`; }
  return `<div style="display:flex;flex-direction:column;gap:16px">${card}${ans}</div>`;
}
function syncPeek() {
  const need = Q && Q.cur && Q.cur.s === 'mat'; let pk = $('.peek');
  if (need && !pk) {
    pk = document.createElement('button'); pk.className = 'peek'; pk.dataset.a = 'calc'; pk.setAttribute('aria-label', 'Zvieratko s kalkulačkou'); pk.textContent = itemOf('pet', P().av.pet).e; document.body.appendChild(pk);
    if (!Q.peekHint) { Q.peekHint = true; peekSay(DATA.settings.calc ? 'Ťukni na mňa, ak potrebuješ kalkulačku!' : 'Držím ti palce!', 3200); }
  } else if (!need && pk) { pk.remove(); $$('.peekbub').forEach(e => e.remove()); }
}
function peekSay(txt, ms = 1600) { $$('.peekbub').forEach(e => e.remove()); if (!$('.peek')) return; const b = document.createElement('div'); b.className = 'peekbub'; b.textContent = txt; document.body.appendChild(b); setTimeout(() => b.remove(), ms); }
function renderQ() { const b = $('#qbody'); if (b) b.innerHTML = qBody(); const pr = $('.prog i'); if (pr && Q.mode !== 'time') pr.style.width = (Q.i / Q.total * 100) + '%'; syncPeek(); }
AFTER.quiz = () => { syncPeek(); if (Q.mode !== 'time' && P().grade === 1 && Q.i === 0) setTimeout(() => say(Q.cur.speak), 400); };
const PRAISE = ['Výborne!', 'Super!', 'Bravo!', 'Paráda!', 'Si jednotka!', 'Presne tak!', 'Skvelé!', 'Wau!'];
const COMFORT = ['Nevadí!', 'Skoro!', 'Nabudúce to dáš!', 'Nevzdávaj sa!'];
function setMood(m) { const mini = $('#mini'); if (!mini) return; mini.innerHTML = avatarSvg(P().av, { crop: 'head', mood: m }); mini.querySelector('svg').classList.add(m === 'happy' ? 'jump' : 'shake'); }
function answer(val, el) {
  if (Q.answered) return; Q.answered = true;
  const q = Q.cur, p = P(); const ok = q.input ? Number(val) === q.raw : val === q.answer;
  const ts = topicStat(p, q.topic); ts.total++; p.stats.answered++; countDay(ok); bump(q.s);
  if (ok) { ts.correct++; p.stats.correct++; Q.correct++; Q.combo++; bump('correct'); const g = (Q.mode === 'time' ? 8 : 10) + (Q.combo >= 3 ? 2 : 0); Q.xp += g; sfx('ok'); buzz(15); floatXp(el, '+' + g); burst(el); setMood('happy'); const pk = $('.peek'); if (pk) { pk.classList.remove('happy'); void pk.offsetWidth; pk.classList.add('happy'); if (Math.random() < .5) peekSay(pick(PRAISE)); } if (Q.combo >= 3 && Q.combo % 3 === 0) confetti(40, .55); }
  else { Q.combo = 0; sfx('no'); buzz([30, 40, 30]); setMood('sad'); }
  const cb = $('#combo'); if (cb) { cb.textContent = Q.combo >= 2 ? '🔥' + Q.combo : ''; if (ok && Q.combo >= 2) { cb.classList.remove('pop'); void cb.offsetWidth; cb.classList.add('pop'); } }
  if (q.sayAfter || q.speakLang) setTimeout(() => say(q.sayAfter || q.speak, 'en-GB'), 350);
  if (q.input) $('#padshow').classList.add(ok ? 'right' : 'wrong');
  else { const opts = $('#opts'); opts.classList.add('locked'); opts.querySelectorAll('.opt').forEach(b => { const v = q.options[+b.dataset.i]; if (v === q.answer) b.classList.add('right'); else if (b === el) b.classList.add('wrong'); else b.classList.add('dim'); }); }
  if (Q.mode === 'time') { TIMERS.push(setTimeout(() => { if (!Q || Q.left <= 0 || UI.view !== 'quiz') return; Q.i++; nextQ(); renderQ(); }, ok ? 450 : 1100)); return; }
  const fb = document.createElement('div'); fb.className = 'fb ' + (ok ? 'ok' : 'no'); fb.id = 'fb';
  fb.innerHTML = `<div class="in"><h3>${ok ? '✓ ' + pick(PRAISE) : '✗ ' + pick(COMFORT)}</h3>${!ok ? `<p>Správna odpoveď: <b>${esc(q.full || q.answer)}</b></p>` : ''}${q.ex && (!ok || q.full) ? `<p class="muted">${esc(q.ex)}</p>` : ''}<div id="explain"></div><div class="rowbtns" style="grid-template-columns:${!ok && CHAT_ON() ? '1fr 1fr' : '1fr'}">${!ok && CHAT_ON() ? '<button class="btn lilac" data-a="explain">🧸 Vysvetli mi to</button>' : ''}<button class="btn ${ok ? 'good' : 'primary'}" data-a="next">${Q.i + 1 >= Q.total ? 'Výsledok' : 'Ďalej'}</button></div></div>`;
  document.body.appendChild(fb);
}
function nextStep() { const fb = $('#fb'); if (fb) fb.remove(); Q.i++; if (Q.i >= Q.total) return finishQuiz(); nextQ(); renderQ(); sfx('tap'); }
function finishQuiz() {
  const fb = $('#fb'); if (fb) fb.remove(); clearTimers();
  const p = P(); const before = p.xp; let bonus = 0, stars = 0;
  if (Q.mode === 'quiz' || Q.mode === 'daily') {
    stars = Q.correct >= 10 ? 3 : Q.correct >= 8 ? 2 : Q.correct >= 5 ? 1 : 0; p.stats.quizzes++; bump('quizzes'); if (stars === 3) bump('stars3');
    if (Q.correct === 10) { p.stats.perfect++; bonus += 30; }
    if (Q.mode === 'quiz') { const ts = topicStat(p, Q.topicIds[0]); ts.played++; ts.best = Math.max(ts.best, Q.correct); ts.stars = Math.max(ts.stars, stars); logAct('quiz', Q.topicIds[0], Q.correct, Q.total); checkPTasks(p, Q.topicIds[0], stars); }
    else { if (p.dailyDone !== today()) { p.dailyDone = today(); p.stats.daily++; bonus += 50; } bump('daily'); logAct('daily', null, Q.correct, Q.total); }
  } else { p.stats.bestTime = Math.max(p.stats.bestTime, Q.correct); const ts = topicStat(p, Q.topicIds[0]); ts.time = Math.max(ts.time || 0, Q.correct); bump('time'); logAct('time', Q.topicIds[0], Q.correct, Q.i + 1); }
  gain(p, Q.xp + bonus); touchStreak(p); checkBadges(p); save();
  go('result', { kind: Q.mode, correct: Q.correct, total: Q.mode === 'time' ? Q.i + (Q.answered ? 1 : 0) : Q.total, stars, xp: Q.xp + bonus, bonus, before, after: p.xp, retry: Q.topicIds, back: Q.back }, 'u');
}
async function explainQ() {
  const q = Q.cur; const box = $('#explain'); const btn = $('[data-a="explain"]'); if (btn) btn.remove();
  box.innerHTML = `<div class="explain">${owlSvg('')}<span id="extext"><span class="typing"><i></i><i></i><i></i></span></span></div>`;
  const sample = await getSample();
  if (!sample) { $('#extext').textContent = 'Bystrík teraz nemôže odpovedať. Chat funguje, keď je apka otvorená v prihlásenom účte Claude.'; return; }
  const p = P(); const prompt = `${tutorIntro(p)}\n\nDieťa práve odpovedalo nesprávne na úlohu z predmetu ${SUBJECTS[q.s].name}.\nÚloha: ${q.text}${q.speak && q.speak !== q.text ? ' (' + q.speak + ')' : ''}\nSprávna odpoveď: ${q.full || q.answer}\nDoplňujúce vysvetlenie: ${q.ex || '-'}\n\nVysvetli dieťaťu krátko (3–4 vety) a jednoducho, prečo je správna odpoveď práve táto a ako na to nabudúce príde. Povzbuď ho.`;
  try { p.stats.chat++; await sample(prompt, { cache: false, onText: ({ text }) => { const e = $('#extext'); if (e) e.textContent = text; } }); save(); }
  catch (e) { const el = $('#extext'); if (el) el.textContent = e && e.code === 'rate_limited' ? 'Bystrík si musí chvíľu oddýchnuť. Skús to o chvíľu.' : 'Teraz sa to nepodarilo. Skús to neskôr.'; }
}

/* --- výsledok --- */
VIEWS.result = r => {
  const p = P(); const b = levelInfo(r.before);
  const big = (e, h, s = '') => `<div style="font-size:4rem;line-height:1;animation:boing .6s">${e}</div><h1>${h}</h1>${s}`;
  const head = r.kind === 'time' ? big('⏱️', `${r.correct} správnych za minútu!`, `<div class="score muted">Najlepší výsledok: ${p.stats.bestTime}</div>`)
    : r.kind === 'cards' ? big('🃏', 'Všetky kartičky zvládnuté!')
      : r.kind === 'pex' ? big('🧩', 'Pexeso hotové!', `<div class="score">Počet ťahov: ${r.moves}</div>`)
        : r.kind === 'match' ? big('🔗', r.sort ? 'Všetko roztriedené!' : 'Všetko pospájané!', `<div class="score">${r.sort ? `Správne: ${r.correct} z ${r.total}` : `Chyby: ${r.mistakes}`}</div>`)
          : r.kind === 'read' ? big('📖', 'Výborne si čítal(a)!', `<div class="score">Otázky: ${r.correct} z ${r.total} správne</div>`)
          : r.kind === 'game' ? big(GAMES[r.game].i, `${r.score} ${plural(r.score, 'bod', 'body', 'bodov')}!`, `<div class="score muted">Najlepšie: ${p.best[r.game] || 0}</div>`)
            : `<div class="bigstars">${[0, 1, 2].map(i => `<span class="${i < r.stars ? '' : 'off'}" style="animation-delay:${300 + i * 300}ms">⭐</span>`).join('')}</div><h1>${r.correct === 10 ? 'Dokonalé!' : r.correct >= 8 ? 'Výborne!' : r.correct >= 5 ? 'Dobrá práca!' : 'Ide to, trénuj ďalej!'}</h1><div class="score">${r.correct} z ${r.total} správne</div>`;
  const good = r.kind === 'quiz' || r.kind === 'daily' ? r.stars >= 2 : true; const bsay = good ? pick(['Si úžasný!', 'Paráda, len tak ďalej!', 'Som na teba hrdý!', 'Výborne si to zvládol!']) : pick(['Nevadí, nabudúce to bude lepšie!', 'Skús to ešte raz, dáš to!', 'Každý sa učí, aj ja!']);
  return `<main class="view nonav" style="justify-content:center"><div class="resbear ${good ? 'cheer' : 'comfort'}">${bearSvg(good ? 'cheer' : 'comfort')}<span class="rbub">${bsay}</span></div><section class="card result">${head}<div class="xpgain">+<span id="xpc">0</span> bodov · +${Math.max(1, Math.round(r.xp / 5))} ${COIN}${r.bonus ? ` <span class="muted" style="font-size:1rem">(bonus ${r.bonus})</span>` : ''}</div><div style="width:100%"><div style="display:flex;justify-content:space-between;font-weight:800"><span>Level <span id="lvn">${b.L}</span></span><span class="muted" id="lvt">${b.cur} / ${b.need}</span></div><div class="xpbar" style="height:18px"><i id="xpb" style="width:${b.pct}%"></i></div></div><div class="rowbtns"><button class="btn primary" data-a="res-back">✓ Hotovo</button><button class="btn" data-a="res-again">🔁 Skúsiť znova</button></div></section></main>`;
};
AFTER.result = () => {
  const r = UI.params; const a = levelInfo(r.after), b = levelInfo(r.before);
  if (r.kind === 'quiz' || r.kind === 'daily') { for (let i = 0; i < r.stars; i++) setTimeout(() => sfx('star', i), 300 + i * 300); if (r.stars === 3) setTimeout(() => confetti(140), 1100); } else setTimeout(() => confetti(90), 300);
  let n = 0; const step = Math.max(1, Math.ceil(r.xp / 30)); const iv = setInterval(() => { n = Math.min(r.xp, n + step); const el = $('#xpc'); if (!el) return clearInterval(iv); el.textContent = n; if (n >= r.xp) clearInterval(iv); }, 30);
  setTimeout(() => {
    const bar = $('#xpb'); if (!bar) return;
    if (a.L > b.L) { bar.style.width = '100%'; setTimeout(() => { $('#lvn').textContent = a.L; bar.style.transition = 'none'; bar.style.width = '0%'; void bar.offsetWidth; bar.style.transition = ''; bar.style.width = a.pct + '%'; $('#lvt').textContent = `${a.cur} / ${a.need}`; queueLevelUp(b.L, a.L); PENDING.unshift(PENDING.pop()); flushPending(); }, 850); }
    else { bar.style.width = a.pct + '%'; $('#lvt').textContent = `${a.cur} / ${a.need}`; setTimeout(flushPending, 900); }
  }, 700);
};
function showRewardOverlay(x) {
  const p = P(); sfx('level'); buzz([40, 60, 40]); confetti(180, .3);
  const w = document.createElement('div'); w.className = 'over';
  w.innerHTML = `<div class="card box"><span class="eyebrow">${x.level ? 'Nový level' : 'Odmena'}</span><div class="num">${x.num}</div><h2>${esc(x.title)}</h2><p class="b">${esc(x.sub)}</p>${x.rw.length ? `<button class="gift" data-a="gift" aria-label="Otvoriť darček">🎁</button><div class="rewards" hidden>${x.rw.map(([c, it], i) => `<div class="rew" style="animation-delay:${i * 120}ms"><span class="th">${itemThumb(c, it, p.av)}</span>${rewardName(c, it)}</div>`).join('')}</div><button class="btn primary block" data-a="ov-wear" hidden>Obliecť sa v šatníku</button>` : ''}<button class="btn block" data-a="ov-close">Super!</button></div>`;
  document.body.appendChild(w);
}

/* --- kartičky --- */
let CD = null;
VIEWS.cards = () => {
  const c = CD.deck[0];
  return `<main class="view nonav"><div class="qtop"><button class="iconbtn press" data-a="quit-mode" aria-label="Ukončiť">✕</button><div class="prog"><i style="width:${CD.known / CD.total * 100}%"></i></div><span class="combo">${CD.known}/${CD.total}</span></div>
  <div class="flip" id="flip" data-a="flip" role="button" tabindex="0" aria-label="Otočiť kartičku"><div class="inner"><div class="card face front">${c.plain ? `<div class="ft ${c.front.length < 10 ? 'huge' : ''}">${c.front}</div>` : c.front}<span class="tap">Ťukni a otoč 👆</span>${c.speakLang ? '<button class="speak press" data-a="card-say" aria-label="Prečítať po anglicky">🔊</button>' : ''}</div><div class="card face back"><span class="eyebrow">Odpoveď</span><div class="ft ${c.back.length < 10 ? 'huge' : ''}">${esc(c.back)}</div></div></div></div>
  <div class="cardnav"><button class="btn" data-a="card-no">🔁 Ešte neviem</button><button class="btn good" data-a="card-yes">✓ Viem to!</button></div><p class="deckinfo">Najprv si odpoveď skús povedať, potom kartičku otoč. Kartičky, ktoré ešte nevieš, sa vrátia na koniec.</p></main>`;
};
function cardAnswer(yes) {
  const f = $('#flip'); if (!f || CD.busy) return; CD.busy = true;
  f.classList.add(yes ? 'flyR' : 'flyL'); sfx(yes ? 'ok' : 'flip');
  setTimeout(() => {
    const c = CD.deck.shift(); const p = P();
    if (yes) { CD.known++; CD.xp += 3; p.stats.cards++; bump('cards'); } else CD.deck.push(c);
    CD.busy = false;
    if (!CD.deck.length) { const before = p.xp; gain(p, CD.xp + 10); logAct('cards', CD.t, CD.known, CD.total); touchStreak(p); checkBadges(p); save(); return go('result', { kind: 'cards', xp: CD.xp + 10, bonus: 10, before, after: p.xp, retry: [CD.t], back: CD.back }, 'u'); }
    render(null); $('#flip .inner').style.animation = 'qin .4s';
  }, 330);
}

/* --- pexeso --- */
let PX = null;
const isEmoji = v => /^\p{Extended_Pictographic}/u.test(v) && v.length <= 4;
VIEWS.pexeso = () => `<main class="view nonav"><div class="qtop"><button class="iconbtn press" data-a="quit-mode" aria-label="Ukončiť">✕</button><div style="flex:1;font-family:var(--f-display);font-weight:800;font-size:1.2rem">Nájdi dvojice</div><span class="timer" id="moves">${PX.moves} ťahov</span></div><div class="pex">${PX.tiles.map((t, i) => `<button class="tile ${t.done ? 'done' : ''} ${t.open ? 'on' : ''}" data-a="tile" data-i="${i}" style="animation:popin .4s ${i * 40}ms backwards cubic-bezier(.3,1.6,.5,1)" aria-label="Kartička ${i + 1}"><span class="inner"><span class="face front">?</span><span class="face back ${isEmoji(t.v) ? 'e' : ''}">${esc(t.v)}</span></span></button>`).join('')}</div><p class="deckinfo">Otoč dve kartičky. Ak k sebe patria, zostanú otočené.</p></main>`;
function tileTap(i) {
  const t = PX.tiles[i]; if (PX.lock || t.done || t.open) return;
  t.open = true; sfx('flip'); $(`.tile[data-i="${i}"]`).classList.add('on');
  const open = PX.tiles.filter(x => x.open && !x.done);
  if (open.length !== 2) return;
  PX.moves++; $('#moves').textContent = PX.moves + ' ťahov'; PX.lock = true; const [a, b] = open;
  if (a.pair === b.pair) TIMERS.push(setTimeout(() => {
    a.done = b.done = true; a.open = b.open = false; sfx('match'); buzz(20); burst($(`.tile[data-i="${i}"]`), 20); $$('.tile').forEach((el, k) => { if (PX.tiles[k].done) el.classList.add('done'); }); PX.lock = false;
    if (PX.tiles.every(x => x.done)) { const p = P(); const before = p.xp; const g = Math.max(20, 70 - PX.moves * 3); gain(p, g); p.stats.pexeso++; bump('match'); logAct('pex', PX.t, PX.tiles.length / 2, PX.moves); touchStreak(p); checkBadges(p); save(); TIMERS.push(setTimeout(() => go('result', { kind: 'pex', moves: PX.moves, xp: g, bonus: 0, before, after: p.xp, retry: [PX.t], back: PX.back }, 'u'), 500)); }
  }, 350));
  else TIMERS.push(setTimeout(() => { a.open = b.open = false; $$('.tile').forEach((el, k) => { if (!PX.tiles[k].open && !PX.tiles[k].done) el.classList.remove('on'); }); PX.lock = false; }, 900));
}

/* --- spájačka --- */
let MT = null; const MCOL = ['#4C86F7', '#F25C8B', '#22B573', '#FF9F45', '#9C7CF4', '#2EC4D6'];
VIEWS.match = () => `<main class="view nonav"><div class="qtop"><button class="iconbtn press" data-a="quit-mode" aria-label="Ukončiť">✕</button><div style="flex:1;font-family:var(--f-display);font-weight:800;font-size:1.2rem">Spoj, čo k sebe patrí</div><span class="timer">${Object.keys(MT.done).length}/${MT.left.length}</span></div><p class="deckinfo" style="text-align:left">Ťukni na kartičku vľavo a potom na jej pár vpravo.</p><div class="match" id="match"><svg class="lines" id="lines"></svg><div class="mcol">${MT.left.map((x, i) => mItem('l', x, i)).join('')}</div><div class="mcol">${MT.right.map((x, i) => mItem('r', x, i)).join('')}</div></div></main>`;
function mItem(side, x, i) { const d = MT.done[x.pair] !== undefined; const col = d ? MCOL[MT.done[x.pair] % MCOL.length] : ''; return `<button class="mi2 ${isEmoji(x.v) ? 'e' : ''} ${d ? 'done' : ''} ${MT.sel && MT.sel.side === side && MT.sel.i === i ? 'sel' : ''}" data-a="m-pick" data-s="${side}" data-i="${i}" id="m${side}${i}" style="${d ? `background:${col}` : `animation:popUp .4s ${i * 50}ms backwards`}">${esc(x.v)}</button>`; }
function drawLines() {
  const box = $('#match'); const svg = $('#lines'); if (!box || !svg) return; const r0 = box.getBoundingClientRect(); let s = '';
  MT.left.forEach((x, i) => { if (MT.done[x.pair] === undefined) return; const j = MT.right.findIndex(y => y.pair === x.pair); const a = $('#ml' + i).getBoundingClientRect(), b = $('#mr' + j).getBoundingClientRect(); const c = MCOL[MT.done[x.pair] % MCOL.length]; const x1 = a.right - r0.left, y1 = a.top + a.height / 2 - r0.top, x2 = b.left - r0.left, y2 = b.top + b.height / 2 - r0.top; s += `<path d="M${x1} ${y1} C${x1 + 24} ${y1} ${x2 - 24} ${y2} ${x2} ${y2}" stroke="${c}" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="${x1}" cy="${y1}" r="6" fill="${c}"/><circle cx="${x2}" cy="${y2}" r="6" fill="${c}"/>`; });
  svg.innerHTML = s;
}
AFTER.match = () => setTimeout(drawLines, 30);
function mPick(side, i) {
  const list = side === 'l' ? MT.left : MT.right; const x = list[i]; if (MT.done[x.pair] !== undefined) return;
  if (!MT.sel || MT.sel.side === side) { MT.sel = { side, i }; sfx('tap'); $$('.mi2').forEach(e => e.classList.remove('sel')); $(`#m${side}${i}`).classList.add('sel'); return; }
  const other = (MT.sel.side === 'l' ? MT.left : MT.right)[MT.sel.i];
  if (other.pair === x.pair) {
    MT.done[x.pair] = Object.keys(MT.done).length; MT.sel = null; sfx('match'); buzz(15); burst($(`#m${side}${i}`), 20);
    $('#app').innerHTML = VIEWS.match(); drawLines();
    if (Object.keys(MT.done).length === MT.left.length) { const p = P(); const before = p.xp; const g = Math.max(15, 45 - MT.mistakes * 4); gain(p, g); p.stats.match++; bump('match'); logAct('match', MT.t, MT.left.length, MT.left.length + MT.mistakes); touchStreak(p); checkBadges(p); save(); confetti(60, .5); TIMERS.push(setTimeout(() => go('result', { kind: 'match', mistakes: MT.mistakes, xp: g, bonus: 0, before, after: p.xp, retry: [MT.t], back: MT.back }, 'u'), 800)); }
  } else { MT.mistakes++; sfx('no'); buzz([20, 30, 20]); const a = $(`#m${side}${i}`), b = $(`#m${MT.sel.side}${MT.sel.i}`); [a, b].forEach(e => { e.classList.remove('bad', 'sel'); void e.offsetWidth; e.classList.add('bad'); }); MT.sel = null; }
}
window.addEventListener('resize', () => { if (UI.view === 'match') drawLines(); if (UI.view === 'rewards') drawRoad(); });

/* --- triedička --- */
let ST = null; const BINC = ['var(--c-mat-soft)', 'var(--c-sjl-soft)', 'var(--mint-soft)', 'var(--sun-soft)', 'var(--lilac-soft)', 'var(--peach-soft)'];
const BINI = ['🧺', '🪣', '📦', '🎒', '🗃️', '👜'];
VIEWS.sort = () => { const t = TOPIC[ST.t]; const [x] = ST.items[ST.i]; return `<main class="view nonav"><div class="qtop"><button class="iconbtn press" data-a="quit-mode" aria-label="Ukončiť">✕</button><div class="prog"><i style="width:${ST.i / ST.items.length * 100}%"></i></div><span class="timer">${ST.correct} ✓</span></div><p class="deckinfo" style="text-align:left">Roztrieď slová do košíkov. Ťukni na správny košík.</p><section class="card sortcard enter" id="sortcard">${esc(x)}</section><div class="bins" style="grid-template-columns:repeat(${t.choices.length > 4 ? 3 : 2},1fr)">${t.choices.map((c, i) => `<button class="bin press" data-a="bin" data-i="${i}" style="background:${BINC[i]};animation:popUp .4s ${i * 60}ms backwards"><span class="bi">${BINI[i]}</span>${c}</button>`).join('')}</div></main>`; };
function binTap(i, el) {
  if (ST.lock) return; ST.lock = true; const t = TOPIC[ST.t]; const [, c] = ST.items[ST.i]; const ok = t.choices[i] === c; const p = P();
  const ts = topicStat(p, ST.t); ts.total++; p.stats.answered++; countDay(ok); bump(t.s);
  if (ok) { ST.correct++; ts.correct++; p.stats.correct++; bump('correct'); sfx('ok'); burst(el); el.classList.add('right'); const card = $('#sortcard'); const a = card.getBoundingClientRect(), b = el.getBoundingClientRect(); card.style.transition = 'transform .4s cubic-bezier(.5,0,.7,1), opacity .4s'; card.style.transform = `translate(${b.left + b.width / 2 - a.left - a.width / 2}px,${b.top - a.top}px) scale(.3)`; card.style.opacity = '0'; }
  else { sfx('no'); el.classList.add('wrong'); const ci = t.choices.indexOf(c); $$('.bin')[ci].classList.add('right'); }
  TIMERS.push(setTimeout(() => {
    ST.lock = false; ST.i++;
    if (ST.i >= ST.items.length) { const before = p.xp; const g = 10 + ST.correct * 4; gain(p, g); p.stats.match++; bump('match'); logAct('sort', ST.t, ST.correct, ST.items.length); touchStreak(p); checkBadges(p); save(); return go('result', { kind: 'match', sort: true, correct: ST.correct, total: ST.items.length, xp: g, bonus: 0, before, after: p.xp, retry: [ST.t], back: ST.back }, 'u'); }
    render(null);
  }, ok ? 650 : 1300));
}

/* --- minihry --- */
const GAMES = {
  balloons: { i: '🎈', n: 'Balónová prestrelka', d: 'Praskni balóny s príkladom, ktorého výsledok je hľadané číslo.', bg: 'var(--c-mat-soft)' },
  rain: { i: '🌧️', n: 'Slovný dážď', d: 'Padajú písmenká a slová. Ťukaj len na tie správne.', bg: 'var(--lilac-soft)' },
  tf: { i: '⚡', n: 'Pravda či nie?', d: 'Je to pravda? Rozhodni sa čo najrýchlejšie.', bg: 'var(--sun-soft)' },
  mole: { i: '🐹', n: 'Chyť škrečka', d: 'Škrečky vykúkajú z norčiek. Ťukni len na tie so správnou odpoveďou.', bg: 'var(--mint-soft)' }
};
function moleRule(g) {
  const nouns = (id, cat) => { const it = topicItems(TOPIC[id]); return () => { const good = Math.random() < .45; const pool = it.filter(x => (x[1] === cat) === good); const [w] = pick(pool); return { x: w, good }; }; };
  const mult = k => ({ t: `Ťukaj na násobky čísla ${k}`, gen: () => { const good = Math.random() < .45; let n; if (good) n = k * R(1, 10); else { do { n = R(2, k * 10); } while (n % k === 0); } return { x: n, good }; } });
  const rules = {
    1: [{ t: 'Ťukaj na čísla väčšie ako 10', gen: () => { const n = R(1, 20); return { x: n, good: n > 10 }; } }, { t: 'Ťukaj na samohlásky', gen: () => { const v = Math.random() < .45; return { x: v ? pick(['A', 'E', 'I', 'O', 'U', 'Y']) : pick(['B', 'K', 'M', 'S', 'T', 'L', 'P', 'R', 'V', 'Z']), good: v }; } }],
    2: [{ t: 'Ťukaj na párne čísla', gen: () => { const n = R(1, 60); return { x: n, good: n % 2 === 0 }; } }, { t: 'Ťukaj na príklady s výsledkom 10', gen: () => { const good = Math.random() < .45; const a = R(0, 10); const b = good ? 10 - a : (() => { let x; do { x = R(0, 10); } while (a + x === 10); return x; })(); return { x: `${a} + ${b}`, good }; } }],
    3: [mult(R(3, 9)), { t: 'Ťukaj na podstatné mená', gen: nouns('s3-druhy', 'podstatné meno') }],
    4: [mult(R(6, 9)), { t: 'Ťukaj na zámená', gen: nouns('s4-druhy', 'zámeno') }]
  };
  return pick(rules[g] || rules[1]);
}
VIEWS.games = () => { const p = P(); return `${topbar()}<main class="view"><h1 style="font-size:2rem">Minihry</h1><p class="muted b">Krátke hry na 45 sekúnd podľa tvojho ročníka. Za každú hru dostaneš body na level.</p>${DATA.settings.gameLimit ? `<section class="card gleft ${gamesLeft(p) ? '' : 'none'}"><span style="font-size:1.8rem">${gamesLeft(p) ? '🎟️' : '🌙'}</span><div><b>${gamesLeft(p) ? `Dnes môžeš hrať ešte ${gamesLeft(p)}×` : 'Na dnes už žiadne hry'}</b><span class="muted b" style="display:block;font-size:.85rem">${gamesLeft(p) ? `Denne môžeš hrať ${DATA.settings.gameLimit}× spolu. Potom sa uč 📚` : 'Zajtra sa hry znova odomknú. Zatiaľ sa môžeš učiť.'}</span></div></section>` : ''}<div class="gamelist pop-in">${Object.entries(GAMES).map(([k, g]) => `<button class="card gcard press ${gamesLeft(p) ? '' : 'glock'}" data-a="game" data-g="${k}"><span class="gi" style="background:${g.bg}">${g.i}</span><span><b>${g.n}</b><span>${g.d}</span><span style="color:var(--accent)">🏆 Najlepšie: ${p.best[k] || 0}</span></span></button>`).join('')}</div></main>${nav('games')}`; };
let GM = null;
function gamesToday(p) { return p.gp && p.gp.d === today() ? p.gp.n : 0; }
function gamesLeft(p) { const L = DATA.settings.gameLimit; return L ? Math.max(0, L - gamesToday(p)) : Infinity; }
function gameLimitMsg() { const p = P(); sfx('no'); buzz([30, 40, 30]); const w = document.createElement('div'); w.className = 'over'; w.innerHTML = `<div class="card box"><div style="font-size:4rem;line-height:1">🌙</div><h2>Na dnes stačilo hier!</h2><p class="b muted">Dnes si už zahral(a) ${DATA.settings.gameLimit} ${plural(DATA.settings.gameLimit, 'minihru', 'minihry', 'miníhier')}. Zajtra môžeš znova. Zatiaľ sa môžeš učiť a zbierať mince 📚</p><button class="btn primary block" data-a="ov-learn">📚 Ísť sa učiť</button><button class="btn block" data-a="ov-close">OK</button></div>`; document.body.appendChild(w); }
function startGame(k) { const pp = P(); if (gamesLeft(pp) <= 0) return gameLimitMsg(); pp.gp = { d: today(), n: gamesToday(pp) + 1 }; save(); const g = pp.grade; GM = { k, g, score: 0, lives: 3, left: 45, combo: 0 }; if (k === 'balloons') { GM.target = balloonTarget(g); GM.hits = 0; } if (k === 'rain') GM.setup = rainSetup(g); if (k === 'tf') GM.st = makeStatement(g); if (k === 'mole') GM.rule = moleRule(g); go('game', {}, 'u'); }
VIEWS.game = () => {
  const head = `<div class="qtop"><button class="iconbtn press" data-a="quit-game" aria-label="Ukončiť">✕</button><span class="hearts" id="hearts">${'❤️'.repeat(GM.lives)}${'🤍'.repeat(3 - GM.lives)}</span><div style="flex:1"></div><span class="timer" id="gscore">⭐ ${GM.score}</span><span class="timer" id="gtime">${GM.left} s</span></div>`;
  if (GM.k === 'balloons') return `<main class="view nonav">${head}<div class="target" id="gtarget">Praskni balóny s výsledkom <b>${GM.target}</b></div><div class="gamearea" id="garea"></div></main>`;
  if (GM.k === 'rain') return `<main class="view nonav">${head}<div class="target">${GM.setup.title}<div class="hint">${GM.setup.hint}</div></div><div class="gamearea rain" id="garea"></div></main>`;
  if (GM.k === 'mole') return `<main class="view nonav">${head}<div class="target">${GM.rule.t}</div><div class="holes" id="holes">${Array.from({ length: 9 }, (_, i) => `<div class="hole"><button class="mole" data-a="mole" data-i="${i}" id="mole${i}" aria-label="Škrečok"><span class="mface">🐹</span><span class="mlab"></span></button><span class="dirt"></span></div>`).join('')}</div><p class="deckinfo">Ťukni rýchlo, kým sa škrečok schová!</p></main>`;
  return `<main class="view nonav">${head}<p class="deckinfo">Je to pravda?</p><section class="card tfcard enter" id="tfcard">${esc(GM.st.text)}</section><div class="tfbtns"><button class="yes press" data-a="tf" data-v="1" aria-label="Pravda">✓</button><button class="no press" data-a="tf" data-v="0" aria-label="Nepravda">✗</button></div><p class="deckinfo" id="tfex">&nbsp;</p></main>`;
};
AFTER.game = () => {
  TIMERS.push(setInterval(() => { GM.left--; const t = $('#gtime'); if (t) { t.textContent = GM.left + ' s'; t.classList.toggle('low', GM.left <= 10); } if (GM.left <= 0) endGame(); }, 1000));
  const area = $('#garea');
  const BC = ['#FFB3CF', '#9CC9FF', '#B8E35A', '#FFD84D', '#C9B5FF', '#86E3C9', '#FF9F45'];
  if (GM.k === 'balloons') TIMERS.push(setInterval(() => {
    const good = Math.random() < .45; const e = balloonExpr(GM.g, GM.target, good);
    const b = document.createElement('button'); b.className = 'balloon'; b.dataset.a = 'balloon'; b.dataset.v = e.good ? GM.target : 'x'; b.textContent = e.text;
    b.style.left = R(2, 72) + '%'; b.style.background = pick(BC); b.style.animationDuration = (GM.g >= 3 ? 7 : 6.2) + Math.random() * 1.5 + 's';
    b.addEventListener('animationend', () => b.remove()); area.appendChild(b);
  }, 850));
  if (GM.k === 'mole') TIMERS.push(setInterval(() => {
    const free = [...Array(9).keys()].filter(i => !$('#mole' + i).classList.contains('up')); if (!free.length) return;
    const i = pick(free); const m = $('#mole' + i); const it = GM.rule.gen();
    m.querySelector('.mlab').textContent = it.x; m.dataset.good = it.good ? 1 : 0; m.classList.remove('hit', 'miss'); m.classList.add('up');
    const stay = Math.max(1100, 1900 - GM.g * 150);
    TIMERS.push(setTimeout(() => m.classList.remove('up'), stay));
  }, Math.max(600, 950 - GM.g * 70)));
  if (GM.k === 'rain') TIMERS.push(setInterval(() => {
    const it = GM.setup.item(); const d = document.createElement('button'); d.className = 'drop'; d.dataset.a = 'drop'; d.dataset.good = it.good ? 1 : 0; d.textContent = it.text;
    d.style.left = R(2, 62) + '%'; d.style.animationDuration = 5 + Math.random() * 1.8 + 's'; d.addEventListener('animationend', () => d.remove()); area.appendChild(d);
  }, 950));
};
function gHit(ok, el) {
  const s = $('#gscore');
  if (ok) { GM.score++; GM.combo++; sfx(GM.k === 'balloons' ? 'balloon' : 'ok'); buzz(10); floatXp(el, '+1'); burst(el, 16); }
  else { GM.lives--; GM.combo = 0; sfx('no'); buzz([30, 40, 30]); const h = $('#hearts'); if (h) { h.textContent = '❤️'.repeat(Math.max(0, GM.lives)) + '🤍'.repeat(3 - Math.max(0, GM.lives)); h.style.animation = 'none'; void h.offsetWidth; h.style.animation = 'shake .45s'; } }
  if (s) s.textContent = '⭐ ' + GM.score;
  if (GM.lives <= 0) endGame();
}
function endGame() {
  if (!GM || GM.ended) return; GM.ended = true; clearTimers(); const p = P(); const before = p.xp; const g = Math.min(80, 10 + GM.score * 4);
  gain(p, g); p.stats.games++; p.best[GM.k] = Math.max(p.best[GM.k] || 0, GM.score); bump('games'); logAct('game-' + GM.k, null, GM.score, 0); touchStreak(p); checkBadges(p); save();
  TIMERS.push(setTimeout(() => go('result', { kind: 'game', game: GM.k, score: GM.score, xp: g, bonus: 0, before, after: p.xp, back: { v: 'games', p: {} } }, 'u'), 400));
}

/* --- šatník --- */
let WCAT = 'hair';
const WCATS = ['hair', 'top', 'bottom', 'shoes', 'acc', 'pet', 'room', 'eyes', 'mouth', 'skin'];
CAT_LABEL.room = 'Pozadie';
VIEWS.wardrobe = () => {
  const p = P(); p.seenRewards = levelInfo(p.xp).L; save();
  return `${topbar()}<main class="view"><section class="card wardstage"><div class="fig" id="wfig" data-a="wave">${roomHTML(p.room)}${avatarSvg(p.av, { cls: 'idle', noBg: true })}</div><div class="info"><span class="eyebrow">Môj šatník</span><h2>${esc(p.name)}</h2><div class="seg" role="radiogroup" aria-label="Postava"><button class="${p.av.gender === 'd' ? 'on' : ''}" data-a="gender" data-g="d">Dievča</button><button class="${p.av.gender === 'c' ? 'on' : ''}" data-a="gender" data-g="c">Chlapec</button></div><span class="muted b" style="font-size:.82rem">Vyber kúsok a pod ním mu nastav farby. Veci so zámkom odomkneš za level alebo sériu.</span></div></section>
  <div class="cats">${WCATS.map(c => `<button class="chip ${c === WCAT ? 'on' : ''}" data-a="wcat" data-c="${c}">${CAT_LABEL[c]}</button>`).join('')}</div><div id="witems">${wardItems()}</div></main>${nav('wardrobe')}`;
};
function wardItems() {
  const p = P();
  if (WCAT === 'room') return `<section class="card colorbox"><div class="roomprev">${roomHTML(p.room)}<div class="dfig">${avatarSvg(p.av, { noBg: true })}</div></div><p class="muted b" style="font-size:.88rem">Pozadie si navrhneš sám: farby, vzor a nálepky ako smajlík, jednorožec, stromček či mačička.</p><button class="btn primary block" data-a="nav" data-v="room">🎨 Navrhnúť pozadie</button></section>`;
  let list = CATALOG[WCAT].filter(it => !it.g || it.g === p.av.gender);
  let html;
  if (WCAT === 'skin') html = `<section class="card colorbox"><b>Farba pleti</b><div class="swatches">${list.map(it => `<button class="sw press ${p.av.skin === it.id ? 'on' : ''}" style="background:${it.c}" data-a="wear" data-i="${it.id}" aria-label="Pleť"></button>`).join('')}</div></section>`;
  else html = (WCAT === 'pet' ? `<section class="card colorbox"><b>Meno zvieratka</b><div style="display:flex;gap:8px"><input class="field" id="petname" maxlength="14" style="font-size:1.15rem;padding:8px 12px" value="${esc(petName(p.av))}"><button class="btn small" data-a="petname">Uložiť</button></div></section>` : '') + `<div class="items">${list.map((it, i) => { const u = unlocked(it, p); return `<button class="item press ${p.av[WCAT] === it.id ? 'on' : ''} ${u ? '' : 'lock'}" data-a="wear" data-i="${it.id}" style="animation:popin .35s ${i * 30}ms backwards cubic-bezier(.3,1.6,.5,1)">${itemThumb(WCAT, it, p.av)}${u ? '' : `<span class="lk"><b>🔒</b>${lockLabel(it)}</span>`}<span class="lab">${it.n || ''}</span></button>`; }).join('')}</div>`;
  const slots = COLOR_SLOTS[WCAT];
  if (slots && !(WCAT === 'acc' && p.av.acc === 'nic') && !(WCAT === 'bgp' && p.av.bgp === 'vesmir')) {
    html += `<section class="card colorbox">${slots.map(([slot, label, pal]) => { const curr = slot === 'bg' ? p.av.bg : p.av.col[slot]; return `<b>${label}</b><div class="swatches">${pal.filter(it => !it.g || it.g === p.av.gender).map(it => { const u = unlocked(it, p); return `<button class="sw press ${curr === it.id ? 'on' : ''} ${u ? '' : 'lock'} ${it.c === 'RAINBOW' ? 'rb' : ''}" style="background:${it.c}" data-a="color" data-s="${slot}" data-i="${it.id}" aria-label="${it.n || 'farba'}${u ? '' : ', ' + lockLabel(it)}"></button>`; }).join('')}</div>`; }).join('')}</section>`;
  }
  return html;
}
function refreshWard(jump) { const p = P(); $('#wfig').innerHTML = roomHTML(p.room) + avatarSvg(p.av, { cls: 'idle' + (jump ? ' jump' : ''), noBg: true }); const sc = scrollY; $('#witems').innerHTML = wardItems(); scrollTo(0, sc); const hb = $('.headbub'); if (hb) hb.innerHTML = avatarSvg(p.av, { crop: 'head' }); }
function wear(id) {
  const p = P(); const it = itemOf(WCAT, id);
  if (!unlocked(it, p)) { sfx('no'); toast(it.price ? `🛍️ Kúp si to v obchode za ${it.price} mincí` : `🔒 Odomkneš: ${lockLabel(it)}`); const el = $(`[data-a="wear"][data-i="${id}"]`); if (el) { el.style.animation = 'none'; void el.offsetWidth; el.style.animation = 'shake .45s'; } return; }
  if (WCAT === 'pet' && p.av.pet !== id && (p.av.petName || '') === '') p.av.petName = '';
  p.av[WCAT] = id; if (WCAT === 'bottom' && ['saty', 'princezna', 'astronaut'].includes(p.av.top)) p.av.top = 'tricko';
  p.stats.style++; checkBadges(p); save(); sfx('pop'); buzz(10); refreshWard(true);
}
function setColor(slot, id) {
  const p = P(); const pal = slot === 'hair' ? HAIRC : slot === 'bg' ? BGC : PAL; const it = pal.find(x => x.id === id);
  if (!unlocked(it, p)) { sfx('no'); toast(`🔒 Odomkneš: ${lockLabel(it)}`); return; }
  if (slot === 'bg') p.av.bg = id; else p.av.col[slot] = id; p.stats.style++; checkBadges(p); save(); sfx('pop'); refreshWard(true);
}

/* --- odmeny --- */
let RTAB = 'road';
VIEWS.rewards = () => {
  const p = P(); const li = levelInfo(p.xp); const L = li.L; let body;
  if (RTAB === 'road') {
    const lv = []; for (let l = 2; l <= 20; l++) { const r = rewardsAt(l, p.av.gender); if (r.length) lv.push([l, r]); }
    const meL = lv.filter(([l]) => l <= L).map(([l]) => l).pop();
    const nextL = lv.find(([l]) => l > L); const toNext = nextL ? (() => { let x = li.need - li.cur; for (let k = L + 1; k < nextL[0]; k++) x += need(k); return x; })() : 0;
    body = `<section class="card" style="padding:14px;display:flex;flex-direction:column;gap:8px;background:var(--sun-soft)"><b style="font-family:var(--f-display);font-size:1.2rem">Si na leveli ${L} · ${title(L)}</b>${nextL ? `<span class="b muted">Ďalšia odmena je na leveli ${nextL[0]}. Chýba ti ${toNext} bodov.</span>` : '<span class="b">Máš všetky odmeny za levely! 👑</span>'}<div class="xpbar" style="height:16px"><i style="width:${li.pct}%"></i></div><span class="muted b" style="font-size:.85rem">Body získaš za každú správnu odpoveď, minihry, úlohy a dennú odmenu.</span></section>
    <div class="road" id="road"><svg class="path" id="roadpath"></svg>${lv.map(([l, r], i) => `<div class="node ${i % 2 ? 'r' : ''} ${l <= L ? 'got' : ''} ${nextL && l === nextL[0] ? 'now' : ''}">${l === meL ? `<span class="me">${avatarSvg(p.av, { crop: 'head' })}</span>` : ''}<span class="ln">${l <= L ? '✓' : `<span><small>LEVEL</small>${l}</span>`}</span><div class="nc"><b>${l <= L ? `Level ${l} · získané` : nextL && l === nextL[0] ? `Level ${l} · už čoskoro!` : 'Level ' + l}</b><div class="ri">${r.map(([c, it]) => `<span class="rt"><span class="t">${itemThumb(c, it, p.av)}</span>${rewardName(c, it)}</span>`).join('')}</div></div></div>`).join('')}</div>`;
  } else if (RTAB === 'streak') {
    const sr = streakRewards(p.av.gender); const dn = drNextDay(p);
    body = `<section class="card streak" style="align-items:center;text-align:center"><span class="flame" style="font-size:4rem">🔥</span><b class="n" style="font-size:2rem">${p.streak.count} ${plural(p.streak.count, 'deň', 'dni', 'dní')} po sebe</b><span class="b muted">Najdlhšia séria: ${p.streak.best || 0}. Séria rastie, keď sa učíš každý deň.</span></section>
    <div class="sec"><h2>Odmeny za sériu</h2></div><div class="road" style="padding:0">${sr.map(([c, it]) => { const got = (p.streak.best || 0) >= it.streak; return `<div class="node ${got ? 'got' : ''}"><span class="ln">${got ? '✓' : `<span><small>DNÍ</small>${it.streak}</span>`}</span><div class="nc"><b>${got ? 'Získané' : `Séria ${it.streak} dní`}</b><div class="ri"><span class="rt"><span class="t">${itemThumb(c, it, p.av)}</span>${rewardName(c, it)}</span></div><div class="pbar" style="margin-top:6px"><i style="width:${Math.min(100, p.streak.count / it.streak * 100)}%;background:var(--accent)"></i></div></div></div>`; }).join('')}</div>
    <div class="sec"><h2>Denná odmena</h2><span class="eyebrow">${drReady(p) ? 'Pripravená!' : 'Zajtra ďalšia'}</span></div><div class="cal">${DR.map((x, i) => `<div class="d ${i + 1 < dn || (!drReady(p) && i + 1 === p.dailyReward.day) ? 'got' : ''} ${drReady(p) && i + 1 === dn ? 'now' : ''} ${i === 6 ? 'big' : ''}"><span class="di">${x.i}</span>${i + 1}. deň<br>+${x.xp}</div>`).join('')}</div>${drReady(p) ? '<button class="btn sun block" data-a="dreward">Vyzdvihnúť dnešnú odmenu</button>' : ''}`;
  } else if (RTAB === 'week') body = weekDiploma(p);
  else body = `<p class="muted b" style="font-size:.88rem">Každý úspech má 3 medaily: 🥉 bronz, 🥈 striebro a 🥇 zlato. Za každú medailu dostaneš mince!</p><div class="achlist pop-in">${ACH.map(a => { const t = achTier(p, a); const v = a.m(p) || 0; const next = a.t[t]; const prev = t ? a.t[t - 1] : 0; const pct = next ? Math.min(100, (v - prev) / (next - prev) * 100) : 100; return `<div class="card ach ${t ? 't' + t : 'off'}"><span class="ai">${a.i}</span><div class="ab"><b>${a.n}</b><span>${a.d}${next ? `: ${v} / ${next}` : ': všetko splnené!'}</span><div class="pbar"><i style="width:${pct}%"></i></div></div><span class="amed">${MEDAL.map((m, k) => `<i class="${k < t ? 'on' : ''}">${m}</i>`).join('')}</span></div>`; }).join('')}</div>`;
  return `${topbar()}<main class="view"><h1 style="font-size:2rem">Odmeny</h1><div class="seg"><button class="${RTAB === 'road' ? 'on' : ''}" data-a="rtab" data-t="road">🗺️ Cesta</button><button class="${RTAB === 'streak' ? 'on' : ''}" data-a="rtab" data-t="streak">🔥 Séria</button><button class="${RTAB === 'week' ? 'on' : ''}" data-a="rtab" data-t="week">📜 Týždeň</button><button class="${RTAB === 'badges' ? 'on' : ''}" data-a="rtab" data-t="badges">🏅 Úspechy</button></div>${body}</main>${nav('rewards')}`;
};
function drawRoad() {
  const road = $('#road'), svg = $('#roadpath'); if (!road || !svg) return; const r0 = road.getBoundingClientRect();
  const pts = $$('#road .ln').map(e => { const r = e.getBoundingClientRect(); return [r.left + r.width / 2 - r0.left, r.top + r.height / 2 - r0.top, e.closest('.node').classList.contains('got')]; });
  let s = ''; for (let i = 1; i < pts.length; i++) { const [x1, y1] = pts[i - 1], [x2, y2, g] = pts[i]; const my = (y1 + y2) / 2; s += `<path d="M${x1} ${y1} C${x1} ${my} ${x2} ${my} ${x2} ${y2}" stroke="${g ? 'var(--good)' : 'var(--line)'}" stroke-width="7" fill="none" stroke-linecap="round" ${g ? '' : 'stroke-dasharray="2 14"'}/>`; }
  svg.innerHTML = s;
}
AFTER.rewards = () => setTimeout(drawRoad, 30);

/* --- denná odmena --- */
function openDailyReward() {
  const p = P(); if (!drReady(p)) { toast('Dnešnú odmenu už máš. Príď zajtra! 🙂'); return; }
  const dn = drNextDay(p);
  const w = document.createElement('div'); w.className = 'over';
  w.innerHTML = `<div class="card box"><span class="eyebrow">Denná odmena</span><h2>${dn}. deň v rade</h2><p class="b muted">Príď každý deň. Na 7. deň ťa čaká veľká odmena!</p><div class="cal">${DR.map((x, i) => `<div class="d ${i + 1 < dn ? 'got' : ''} ${i + 1 === dn ? 'now' : ''} ${i === 6 ? 'big' : ''}"><span class="di">${x.i}</span>${i + 1}. deň<br>+${x.xp}</div>`).join('')}</div><button class="btn sun block" data-a="dr-claim">Vyzdvihnúť +${DR[dn - 1].xp} bodov</button></div>`;
  document.body.appendChild(w); sfx('gift');
}

/* --- chat s Bystríkom --- */
const tutorIntro = p => `Si Bystrík, milý a múdry plyšový medvedík a trpezlivý učiteľ pre dieťa na 1. stupni základnej školy na Slovensku (${p.grade}. ročník). Odpovedaj VŽDY po slovensky, krátko (najviac 5 viet), jednoduchými slovami primeranými veku, láskavo a povzbudivo. Vysvetľuj na príkladoch zo života (jablká, cukríky, hračky). Pri úlohe najprv krátko vysvetli postup, až potom povedz výsledok. Rozprávaj sa len o učení (matematika, slovenčina, príroda, vlastiveda, angličtina a svet okolo nás). Ak sa dieťa pýta na niečo nevhodné alebo mimo učenia, láskavo ho vráť k učeniu. Nikdy sa nepýtaj na osobné údaje (adresa, škola, telefón, heslá). Nepoužívaj nadpisy, tabuľky ani Markdown; emoji môžeš použiť.`;
let CHAT = { msgs: [], busy: false };
const SUGG_PRV = { 1: 'Prečo máme ročné obdobia?', 2: 'Ako sa povie po anglicky pes a mačka?', 3: 'Čo sú obojživelníky?', 4: 'Prečo sa strieda deň a noc?' };
const SUGG = {
  1: ['Ako sa sčítava do 10?', 'Ktoré číslo je väčšie, 8 alebo 12?', 'Ako sa volá útvar s tromi rohmi?', 'Čo sú samohlásky?', 'Ako rozdelím slovo na slabiky?', 'Vymysli mi ľahký príklad do 10'],
  2: ['Ako počítam cez desiatku, napríklad 8 + 5?', 'Ako sa naučím násobiť 2, 3, 4 a 5?', 'Ako zistím, koľko je hodín?', 'Kedy píšem y a kedy i?', 'Čo sú tvrdé a mäkké spoluhlásky?', 'Aké poznáme druhy viet?'],
  3: ['Ako sa naučím malú násobilku?', 'Ako sa zaokrúhľuje na desiatky?', 'Koľko centimetrov má jeden meter?', 'Čo sú vybrané slová po B?', 'Ako spoznám podstatné meno?', 'Vymysli mi slovnú úlohu na násobenie'],
  4: ['Ako sa delí so zvyškom?', 'Ako vypočítam obvod obdĺžnika?', 'Koľko gramov má kilogram?', 'Čo sú vybrané slová po L?', 'Čo je zámeno a čo číslovka?', 'Čo je rytmické krátenie?']
};
VIEWS.chat = () => {
  if (!DATA.settings.chat) return `${topbar('home')}<main class="view"><section class="card" style="padding:18px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:8px">${owlSvg()}<h2>Chat je vypnutý</h2><p class="muted b">Rodičia ho môžu zapnúť v rodičovskom účte.</p></section></main>${nav('')}`;
  return `${topbar('home')}<main class="view"><div style="display:flex;align-items:center;gap:12px"><span style="width:64px;height:64px;flex:none;display:block">${owlSvg('')}</span><div><h1 style="font-size:1.7rem">Opýtaj sa Bystríka</h1><p class="muted b" style="font-size:.9rem">Nerozumieš niečomu z matiky, slovenčiny, prírody alebo angličtiny? Napíš mi! Otázky dole sú pre ${P().grade}. ročník.</p></div></div>
  <div class="chatlog" id="chatlog">${CHAT.msgs.length ? CHAT.msgs.map((m, i) => m.r === 'me' ? `<div class="msg me">${esc(m.t)}</div>` : `<div class="msg bot">${owlSvg('')}<span ${i === CHAT.msgs.length - 1 ? 'id="lastbot"' : ''}>${m.t ? esc(m.t) : '<span class="typing"><i></i><i></i><i></i></span>'}</span></div>`).join('') : `<div class="msg bot">${owlSvg('')}<span>Ahoj, ${esc(P().name)}! Na čo sa chceš opýtať? Môžeš si vybrať aj otázku nižšie. 👇</span></div><div class="sugg">${[...(SUGG[P().grade] || SUGG[1]), SUGG_PRV[P().grade] || SUGG_PRV[1]].map(s => `<button class="press" data-a="ask" data-q="${esc(s)}">${esc(s)}</button>`).join('')}</div>`}</div>
  <form class="chatin" id="chatform"><input id="chatq" maxlength="300" autocomplete="off" placeholder="Napíš otázku…" ${CHAT.busy ? 'disabled' : ''}><button class="btn primary small" type="submit" ${CHAT.busy ? 'disabled' : ''} aria-label="Poslať">➤</button></form></main>${nav('')}`;
};
AFTER.chat = () => { const f = $('#chatform'); if (f) f.addEventListener('submit', e => { e.preventDefault(); const v = $('#chatq').value.trim(); if (v) askBot(v); }); if (CHAT.msgs.length) scrollTo(0, document.body.scrollHeight); };
async function askBot(q) {
  if (CHAT.busy) return; const p = P(); CHAT.busy = true; CHAT.msgs.push({ r: 'me', t: q }, { r: 'bot', t: '' }); render(null); sfx('pop');
  const sample = await getSample();
  const finish = t => { CHAT.msgs[CHAT.msgs.length - 1].t = t; CHAT.busy = false; if (UI.view === 'chat') render(null); };
  if (!sample) return finish('Teraz ti nemôžem odpovedať. Chat funguje, keď je apka otvorená v prihlásenom účte Claude.');
  const hist = CHAT.msgs.slice(0, -1).slice(-9);
  const msgs = [{ role: 'user', content: tutorIntro(p) + '\n\nZačni rozhovor.' }, { role: 'assistant', content: `Ahoj ${p.name}! Som Bystrík. Na čo sa chceš opýtať?` }];
  hist.forEach(m => { if (m.t) msgs.push({ role: m.r === 'me' ? 'user' : 'assistant', content: m.t }); });
  try { p.stats.chat++; checkBadges(p); save(); const res = await sample(msgs, { cache: false, onText: ({ text }) => { CHAT.msgs[CHAT.msgs.length - 1].t = text; const e = $('#lastbot'); if (e) e.textContent = text; } }); finish(res.text); }
  catch (e) { finish(e && e.code === 'rate_limited' ? 'Musím si chvíľu oddýchnuť. Skús to o pár minút. 🧸' : e && e.code === 'not_granted' ? 'Chat nie je povolený. Popros rodičov, nech ho povolia.' : (e && e.text) || 'Niečo sa pokazilo. Skús to znova.'); }
}

/* --- kalkulačka --- */
let CALC = { cur: '0', acc: null, op: null, fresh: true, hist: '' };
function openCalc() {
  if (!DATA.settings.calc) { peekSay('Kalkulačku vypli rodičia. Zvládneš to aj bez nej! 💪', 2400); sfx('tap'); return; }
  closeSheet(); sfx('whoosh'); const pet = itemOf('pet', P().av.pet);
  const w = document.createElement('div'); w.id = 'sheetwrap';
  w.innerHTML = `<div class="calcdock" role="dialog" aria-label="Kalkulačka"><div class="calchead"><span>${pet.e} Kalkulačka od ${esc(petName(P().av))}</span><button class="iconbtn press" data-a="close-sheet" aria-label="Zavrieť kalkulačku">✕</button></div><div class="calcshow" id="calcshow"><small id="calchist">${CALC.hist}</small><span id="calccur">${fmtCalc(CALC.cur)}</span></div><div class="keys c4 ckeys">${['7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '−', 'C', '0', '=', '+'].map(k => `<button class="key ${'÷×−+'.includes(k) ? 'op' : k === '=' ? 'eq' : k === 'C' ? 'del' : ''}" data-a="ck" data-k="${k}">${k}</button>`).join('')}</div></div>`;
  document.body.appendChild(w); document.body.classList.add('calcopen'); scrollTo({ top: 0, behavior: 'smooth' });
}
const fmtCalc = s => s === 'Chyba' ? s : (s.includes('.') ? s.replace('-', '−').replace('.', ',') : (s.startsWith('-') ? '−' + fmt(s.slice(1)) : fmt(s)));
function calcKey(k) {
  const c = CALC; sfx('tap');
  const num = () => parseFloat(c.cur) || 0;
  const comp = (a, op, b) => op === '+' ? a + b : op === '−' ? a - b : op === '×' ? a * b : b === 0 ? NaN : a / b;
  const res = r => isFinite(r) ? String(Math.round(r * 1e8) / 1e8) : 'Chyba';
  if (/\d/.test(k)) { if (c.fresh || c.cur === '0' || c.cur === 'Chyba') { c.cur = k; c.fresh = false; } else if (c.cur.length < 12) c.cur += k; }
  else if (k === 'C') { CALC = { cur: '0', acc: null, op: null, fresh: true, hist: '' }; }
  else if (k === '=') { if (c.op !== null && c.acc !== null) { const r = comp(c.acc, c.op, num()); c.hist = `${fmtCalc(String(c.acc))} ${c.op} ${fmtCalc(c.cur)} =`; c.cur = res(r); c.acc = null; c.op = null; c.fresh = true; } }
  else { if (c.op !== null && !c.fresh) c.cur = res(comp(c.acc, c.op, num())); c.acc = num(); c.op = k; c.fresh = true; c.hist = `${fmtCalc(String(c.acc))} ${k}`; }
  $('#calccur').textContent = fmtCalc(CALC.cur); $('#calchist').textContent = CALC.hist;
}

/* --- nastavenia (dieťa) --- */
VIEWS.settings = () => {
  const tg = (k, n) => `<button class="row" data-a="toggle" data-k="${k}"><span class="grow">${n}</span><span class="toggle ${DATA.settings[k] ? 'on' : ''}"></span></button>`;
  const sv = 'speechSynthesis' in window ? slovakVoice() : null;
  return `${topbar('home')}<main class="view"><h1 style="font-size:2rem">Nastavenia</h1><section class="card" style="padding:6px 14px"><div class="list">${tg('sound', '🔊 Zvuky')}${tg('voice', '🗣️ Čítanie otázok nahlas')}<div class="row" style="flex-direction:column;align-items:flex-start;gap:6px"><span>${sv === 'sk' ? '✅ Slovenský hlas je v telefóne' : sv === 'cs' ? '⚠️ Slovenský hlas chýba, číta sa českým hlasom' : '⚠️ Slovenský hlas v telefóne chýba'}</span>${sv !== 'sk' ? '<small class="muted" style="font-weight:700">Aby hlas správne čítal mäkčene a dĺžne, nainštalujte slovenský hlas. Android: Nastavenia → Prevod textu na reč → Google → Inštalovať hlasové údaje → Slovenčina. iPhone: Nastavenia → Prístupnosť → Hovorený obsah → Hlasy → Slovenčina.</small>' : ''}<button class="btn small" data-a="voice-test">🔊 Vyskúšať hlas</button></div><div class="row" style="flex-direction:column;align-items:flex-start;gap:6px"><span>🌗 Vzhľad apky</span><div class="seg" style="width:100%">${[['auto', '🔄 Automaticky'], ['light', '☀️ Svetlý'], ['dark', '🌙 Tmavý']].map(([k, n]) => `<button class="${DATA.settings.theme === k ? 'on' : ''}" data-a="theme" data-t="${k}">${n}</button>`).join('')}</div></div><button class="row" data-a="tour-again"><span class="grow">🧸 Ukáž mi znova návod</span><span>›</span></button><button class="row" data-a="nav" data-v="room"><span class="grow">🎨 Moje pozadie</span><span>›</span></button><button class="row" data-a="edit-prof"><span class="grow">✏️ Úvodné nastavenie<small class="muted" style="display:block;font-weight:700;font-size:.82rem">Meno, dievča/chlapec, ročník, zvieratko a účes. Body a odmeny zostanú.</small></span><span>›</span></button><button class="row" data-a="nav" data-v="profiles"><span class="grow">👥 Zmeniť hráča alebo pridať nového</span><span>›</span></button><button class="row" data-a="parent-open"><span class="grow">🔒 Rodičovský účet</span><span>›</span></button></div></section><p class="muted b" style="font-size:.88rem">V rodičovskom účte, chránenom PIN kódom, nájdete prehľad pokroku, históriu a ďalšie nastavenia.</p></main>${nav('')}`;
};

/* --- rodičovský účet --- */
let PIN = { mode: 'enter', val: '', first: '' }, PSEL = null, PDEL = false, PARENT_OK = false;
VIEWS.pin = () => {
  const t = { enter: 'Zadajte rodičovský PIN', create: 'Vytvorte si 4-miestny PIN', confirm: 'Zopakujte PIN pre kontrolu' }[PIN.mode];
  return `<main class="view nonav" style="justify-content:center;gap:22px"><button class="iconbtn press" data-a="pin-back" aria-label="Späť" style="align-self:flex-start">←</button><div style="text-align:center;font-size:3rem">🔒</div><h1 style="font-size:1.7rem;text-align:center">${t}</h1><p class="muted b" style="text-align:center;font-size:.9rem">${PIN.mode === 'enter' ? 'Táto časť je len pre rodičov.' : 'PIN chráni prehľad a nastavenia pred deťmi. Zapamätajte si ho.'}</p><div class="pindots" id="pindots">${[0, 1, 2, 3].map(i => `<i class="${i < PIN.val.length ? 'on' : ''}"></i>`).join('')}</div><div class="keys" style="max-width:320px;margin:0 auto;width:100%">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button class="key" data-a="pk" data-k="${n}">${n}</button>`).join('')}<button class="key del" data-a="pk" data-k="del" aria-label="Zmazať">⌫</button><button class="key" data-a="pk" data-k="0">0</button><span></span></div></main>`;
};
function pinKey(k) {
  sfx('tap'); if (k === 'del') PIN.val = PIN.val.slice(0, -1); else if (PIN.val.length < 4) PIN.val += k;
  $$('#pindots i').forEach((e, i) => e.classList.toggle('on', i < PIN.val.length));
  if (PIN.val.length < 4) return;
  const bad = msg => { const d = $('#pindots'); d.classList.remove('bad'); void d.offsetWidth; d.classList.add('bad'); sfx('no'); if (msg) toast(msg); setTimeout(() => { PIN.val = ''; $$('#pindots i').forEach(e => e.classList.remove('on')); }, 450); };
  if (PIN.mode === 'create') { PIN.first = PIN.val; PIN.val = ''; PIN.mode = 'confirm'; setTimeout(() => render(null), 200); }
  else if (PIN.mode === 'confirm') { if (PIN.val === PIN.first) { DATA.parent.pin = PIN.val; save(); PARENT_OK = true; toast('PIN uložený ✓'); go('parent', {}, 'f'); } else { PIN.mode = 'create'; PIN.val = ''; bad('PIN sa nezhoduje, skúste znova'); setTimeout(() => render(null), 500); } }
  else { if (PIN.val === DATA.parent.pin) { PARENT_OK = true; sfx('ok'); go('parent', {}, 'f'); } else bad('Nesprávny PIN'); }
}
function parentReads(p) {
  if (!p.readings.length) return `<section class="card pcard"><span class="eyebrow">📖 Čítanie – text a nahrávky</span><p class="muted b" style="padding:8px 0">Zatiaľ žiadne nahrávky. Dieťa ich nahrá v Čítanke. Nahrávky sa ukladajú len v tomto zariadení.</p></section>`;
  const ids = []; p.readings.forEach(x => { if (!ids.includes(x.r)) ids.push(x.r); });
  return `<section class="card pcard"><span class="eyebrow">📖 Čítanie – text a nahrávky</span><p class="muted b" style="font-size:.85rem;padding:4px 0">Pri každom texte vidíte presne to, čo dieťa čítalo, a pod tým jeho čítania a nahrávky. Vypočujte si ich a ohodnoťte, dieťa uvidí hodnotenie v Čítanke.</p>${ids.map(rid => { const r = READ[rid]; const recs = p.readings.filter(x => x.r === rid); return `<div class="ptext"><b style="font-family:var(--f-display);font-size:1.1rem">${r ? r.icon + ' ' + r.title : 'Text'} <span class="muted" style="font-size:.85rem">${r ? r.g + '. ročník' : ''}</span></b><div class="ptextbody">${r ? esc(r.text) : ''}</div>${recs.map((x, i) => `<div class="prec"><span class="b">${x.noAudio ? '✅ Prečítal(a) nahlas, bez nahrávky' : '🎙️ Nahrávka'} · ${fmtTime(x.t)}</span>${x.noAudio ? '' : `<div id="aud-${x.id}"><button class="btn small" data-a="play-rec" data-id="${x.id}">▶️ Vypočuť</button></div>`}<div class="chips" style="padding:0">${[3, 2, 1].map(k => `<button class="chip ${x.rating === k ? 'on' : ''}" data-a="rate-rec" data-id="${x.id}" data-r="${k}">${RATE[k]}</button>`).join('')}<button class="chip" data-a="del-rec" data-id="${x.id}" aria-label="Vymazať nahrávku">🗑️</button></div></div>`).join('')}</div>`; }).join('')}</section>`;
}
function checkPTasks(p, id, stars) {
  (p.ptasks || []).forEach(t => { if (!t.done && t.topic === id && stars >= t.stars) { t.done = Date.now(); p.coins = (p.coins || 0) + t.coins; p.log.unshift({ t: Date.now(), k: 'ptask', id, c: t.coins, n: t.stars }); setTimeout(() => achPop({ i: '📋', n: 'Úloha od rodiča splnená!', d: TOPIC[id].name, t: [t.coins] }, 0, t.coins), 1200); } });
}
function giftsToday(p) { const t = today(); return (p.log || []).filter(l => l.k === 'gift' && dkey(new Date(l.t)) === t).length; }
const KIND = { ptask: 'Splnená úloha od rodiča', gift: 'Odmena od rodiča', 'game-mole': 'Minihra Chyť škrečka', read: 'Čítanka – nahrávka', readq: 'Čítanka – otázky', quiz: 'Kvíz', time: 'Na čas', daily: 'Denná výzva', cards: 'Kartičky', pex: 'Pexeso', match: 'Spájačka', sort: 'Triedička', 'game-balloons': 'Minihra Balóny', 'game-rain': 'Minihra Slovný dážď', 'game-tf': 'Minihra Pravda či nie' };
function fmtTime(t) { const d = new Date(t); const k = dkey(d); const hm = `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`; return k === today() ? `dnes ${hm}` : k === daysAgo(1) ? `včera ${hm}` : `${d.getDate()}. ${d.getMonth() + 1}. ${hm}`; }
VIEWS.parent = () => {
  if (!PARENT_OK) { PIN = { mode: DATA.parent.pin ? 'enter' : 'create', val: '', first: '' }; UI.view = 'pin'; return VIEWS.pin(); }
  const p = DATA.profiles.find(x => x.id === PSEL) || P(); PSEL = p.id; const li = levelInfo(p.xp);
  const acc = p.stats.answered ? Math.round(p.stats.correct / p.stats.answered * 100) : 0;
  const active30 = Array.from({ length: 30 }, (_, i) => p.days[daysAgo(i)]).filter(Boolean).length;
  const days = Array.from({ length: 7 }, (_, i) => { const k = daysAgo(6 - i); const d = new Date(); d.setDate(d.getDate() - (6 - i)); return { n: ['Ne', 'Po', 'Ut', 'St', 'Št', 'Pi', 'So'][d.getDay()], v: p.days[k]?.q || 0 }; });
  const mx = Math.max(10, ...days.map(d => d.v));
  const recentIds = []; for (const l of p.log) { if (l.id && TOPIC[l.id] && !recentIds.includes(l.id)) recentIds.push(l.id); if (recentIds.length === 5) break; }
  const tAcc = ALL_TOPICS.filter(t => p.topics[t.id]?.total >= 5).map(t => ({ t, pct: Math.round(p.topics[t.id].correct / p.topics[t.id].total * 100), n: p.topics[t.id].total }));
  const strong = tAcc.filter(x => x.pct >= 80).sort((a, b) => b.pct - a.pct).slice(0, 5), weak = tAcc.filter(x => x.pct < 70).sort((a, b) => a.pct - b.pct).slice(0, 5);
  const subjProg = s => [1, 2, 3, 4].map(g => { const ts = SUBJECTS[s].topics.filter(t => t.g === g); const st = ts.reduce((a, t) => a + (p.topics[t.id]?.stars || 0), 0); return `<div class="statrow"><span>${g}. ročník</span><b>${st} / ${ts.length * 3} ⭐</b><span class="meter"><i style="width:${st / (ts.length * 3) * 100}%;background:var(--c-${s})"></i></span></div>`; }).join('');
  const tg = (k, n, d) => `<button class="row" data-a="toggle" data-k="${k}"><span class="grow">${n}${d ? `<small class="muted" style="display:block;font-weight:700;font-size:.82rem">${d}</small>` : ''}</span><span class="toggle ${DATA.settings[k] ? 'on' : ''}"></span></button>`;
  const topicLine = x => `<div class="statrow"><span>${x.t.name} <span class="muted">(${SUBJECTS[x.t.s].name}, ${x.t.g}. r.)</span></span><b style="color:${x.pct < 70 ? 'var(--bad)' : 'var(--good)'}">${x.pct} %</b><small>${x.n} odpovedí</small></div>`;
  return `<header class="top"><button class="iconbtn press" data-a="parent-lock" aria-label="Zamknúť">🔒</button><div class="who"><b>Rodičovský účet</b><span class="muted b" style="font-size:.82rem">Prehľad pokroku detí</span></div></header><main class="view nonav">
  ${DATA.profiles.length > 1 ? `<div class="chips">${DATA.profiles.map(x => `<button class="chip ${x.id === p.id ? 'on' : ''}" data-a="psel" data-id="${x.id}">${esc(x.name)}</button>`).join('')}</div>` : ''}
  <section class="card" style="display:flex;align-items:center;gap:12px;padding:12px"><span class="headbub" style="width:64px;height:64px">${avatarSvg(p.av, { crop: 'head' })}</span><div style="flex:1;min-width:0"><b style="font-family:var(--f-display);font-size:1.4rem">${esc(p.name)}</b><div class="muted b">${p.grade}. ročník · Level ${li.L} (${title(li.L)})</div></div></section>
  <div class="ptiles"><div class="card ptile"><b>${acc} %</b><span>úspešnosť odpovedí</span></div><div class="card ptile"><b>${p.stats.correct}</b><span>správnych z ${p.stats.answered}</span></div><div class="card ptile"><b>🔥 ${p.streak.count}</b><span>dní po sebe (najviac ${p.streak.best || 0})</span></div><div class="card ptile"><b>${active30}</b><span>aktívnych dní za 30 dní</span></div><div class="card ptile"><b>${COIN} ${p.coins || 0}</b><span>mincí, ${p.owned.length} vecí kúpených v obchode</span></div><div class="card ptile"><b>📖 ${p.readings.length}</b><span>nahrávok čítania (${p.readings.filter(x => !x.rating).length} čaká na vypočutie)</span></div></div>
  <section class="card pcard"><span class="eyebrow">Odpovede za posledných 7 dní</span><div class="chart">${days.map(d => `<div class="bar"><i style="height:${d.v / mx * 100}%;${d.v ? '' : 'background:var(--line)'}"><em>${d.v || ''}</em></i>${d.n}</div>`).join('')}</div></section>
  <section class="card pcard"><span class="eyebrow">Na čom teraz pracuje</span>${recentIds.length ? recentIds.map(id => { const t = TOPIC[id]; const s = p.topics[id]; const last = p.log.find(l => l.id === id); return `<div class="statrow"><span>${t.icon} ${t.name} <span class="muted">(${SUBJECTS[t.s].name}, ${t.g}. r.)</span></span><b>${s && s.total ? Math.round(s.correct / s.total * 100) + ' %' : '–'}</b><small>Naposledy ${fmtTime(last.t)} · ${KIND[last.k] || last.k} · hviezdy: ${s?.stars || 0}/3</small></div>`; }).join('') : '<p class="muted b" style="padding:8px 0">Zatiaľ žiadna aktivita.</p>'}</section>
  <section class="card pcard"><span class="eyebrow">Darí sa</span>${strong.length ? strong.map(topicLine).join('') : '<p class="muted b" style="padding:8px 0">Zobrazí sa, keď bude mať v téme aspoň 5 odpovedí s úspešnosťou nad 80 %.</p>'}</section>
  <section class="card pcard"><span class="eyebrow">Treba precvičiť</span>${weak.length ? weak.map(topicLine).join('') : '<p class="muted b" style="padding:8px 0">Zatiaľ nič. Témy s úspešnosťou pod 70 % sa zobrazia tu.</p>'}</section>
  <section class="card pcard"><span class="eyebrow">Matematika – hviezdy podľa ročníkov</span>${subjProg('mat')}<span class="eyebrow">Slovenčina – hviezdy podľa ročníkov</span>${subjProg('sjl')}<span class="eyebrow">Prehľad (príroda, svet, angličtina) – hviezdy podľa ročníkov</span>${subjProg('prv')}</section>
  <section class="card pcard"><span class="eyebrow">História aktivít</span>${p.log.slice(0, 15).map(l => `<div class="statrow"><span>${KIND[l.k] || l.k}${l.id && TOPIC[l.id] ? ' · ' + TOPIC[l.id].name : ''}</span><b>${l.k === 'gift' || l.k === 'ptask' ? '+' + l.c + ' mincí' : l.k.startsWith('game') ? l.c + ' b.' : l.k === 'pex' ? l.n + ' ťahov' : `${l.c}/${l.n}`}</b><small>${fmtTime(l.t)}</small></div>`).join('') || '<p class="muted b" style="padding:8px 0">Zatiaľ prázdne.</p>'}</section>
  <section class="card pcard"><span class="eyebrow">📋 Úlohy pre dieťa</span><p class="muted b" style="font-size:.85rem;padding:4px 0">Vyberte tému a koľko hviezd má dieťa v kvíze získať. Keď to splní, apka mu automaticky pridá mince.</p>
  <div class="ptform"><label>Téma<select id="pt-topic">${['mat', 'sjl', 'prv'].map(k => `<optgroup label="${SUBJECTS[k].name}">${SUBJECTS[k].topics.filter(t => t.g === p.grade).map(t => `<option value="${t.id}">${t.name}</option>`).join('')}</optgroup>`).join('')}</select></label><label>Hviezdy<select id="pt-stars"><option value="1">⭐ aspoň 5 z 10</option><option value="2" selected>⭐⭐ aspoň 8 z 10</option><option value="3">⭐⭐⭐ 10 z 10</option></select></label><label>Odmena<select id="pt-coins">${[5, 10, 15, 20].map(n => `<option value="${n}" ${n === 10 ? 'selected' : ''}>${n} mincí</option>`).join('')}</select></label><button class="btn primary small" data-a="pt-add">➕ Zadať úlohu</button></div>
  ${(p.ptasks || []).slice(0, 8).map(t => TOPIC[t.topic] ? `<div class="statrow"><span>${t.done ? '✅' : '⏳'} ${TOPIC[t.topic].name} · ${'⭐'.repeat(t.stars)}</span><b>${t.done ? 'splnené' : `<button class="chip" data-a="pt-del" data-id="${t.id}">Zrušiť</button>`}</b><small>+${t.coins} mincí${t.done ? ' · ' + fmtTime(t.done) : ''}</small></div>` : '').join('')}</section>
  <section class="card pcard"><span class="eyebrow">🎁 Odmeniť mincami</span><p class="muted b" style="font-size:.85rem;padding:4px 0">Pochváľte dieťa za snahu, domáce úlohy alebo pomoc doma. Mince si minie v obchode. Teraz má ${COIN} ${p.coins || 0}.</p>${(() => { const used = giftsToday(p); const left = 2 - used; return `<div class="chips" style="padding:4px 0 4px">${[5, 10, 15, 20].map(n => `<button class="chip" data-a="p-gift" data-n="${n}" ${left > 0 ? '' : 'disabled style="opacity:.45"'}>+${n} ${COIN}</button>`).join('')}</div><p class="b" style="font-size:.85rem;padding-bottom:8px;color:${left > 0 ? 'var(--muted)' : 'var(--bad)'}">${left > 0 ? `Dnes môžete odmeniť ešte ${left}×.` : 'Dnes ste už odmenili 2×. Ďalšia odmena bude možná zajtra.'}</p>`; })()}</section>
  ${parentReads(p)}
  <section class="card pcard"><span class="eyebrow">Ročník dieťaťa</span><div class="chips" style="padding:6px 0">${[1, 2, 3, 4].map(g => `<button class="chip ${p.grade === g ? 'on' : ''}" data-a="p-grade" data-g="${g}">${g}. ročník</button>`).join('')}</div></section>
  <section class="card" style="padding:6px 14px"><div class="list"><div class="row" style="flex-direction:column;align-items:flex-start;gap:6px"><span>🎮 Minihry denne</span><small class="muted" style="font-weight:700">Koľkokrát za deň môže dieťa hrať minihry (spolu). Dnes už hralo ${gamesToday(p)}×.</small><div class="chips" style="padding:0">${[1, 2, 3, 5, 0].map(n => `<button class="chip ${DATA.settings.gameLimit === n ? 'on' : ''}" data-a="p-glimit" data-n="${n}">${n ? n + '×' : 'Bez limitu'}</button>`).join('')}</div></div>${tg('calc', '🧮 Kalkulačka pri matematike', 'Dieťa ju otvorí ťuknutím na svoje zvieratko.')}${tg('chat', '🧸 Chat s Bystríkom', 'AI pomocník vysvetľuje učivo. Funguje v prihlásenom účte Claude.')}${tg('sound', '🔊 Zvuky')}${tg('voice', '🗣️ Čítanie otázok nahlas')}<button class="row" data-a="pin-change"><span class="grow">🔑 Zmeniť PIN</span><span>›</span></button><button class="row" data-a="new-prof"><span class="grow">➕ Pridať ďalšie dieťa</span><span>›</span></button></div></section>
  <section class="card" style="padding:12px 14px;display:flex;flex-direction:column;gap:10px">${PDEL ? `<b>Naozaj vymazať profil ${esc(p.name)} so všetkým pokrokom?</b><div class="rowbtns"><button class="btn" data-a="pdel-no">Nie</button><button class="btn primary" data-a="pdel-yes">Áno, vymazať</button></div>` : '<button class="btn block" data-a="pdel-ask">🗑️ Vymazať tento profil</button>'}</section>
  <button class="btn primary block" data-a="parent-lock">Zamknúť a vrátiť sa k dieťaťu</button></main>`;
};

/* ===== Akcie ===== */
const ACT = {
  nav: d => { sfx('tap'); if (d.v === 'profiles') return go('profiles', {}, 'b'); go(d.v, {}, d.v === 'home' ? 'b' : 'f'); },
  home: () => { sfx('tap'); go('home', {}, 'b'); },
  'learn-back': () => { sfx('tap'); go('learn', {}, 'b'); },
  wave: () => { const a = $('.stage .avatar, #wfig .avatar'); if (a) { a.classList.remove('waving', 'dance'); void a.offsetWidth; a.classList.add(Math.random() < .5 ? 'waving' : 'dance'); sfx('pop'); } },
  'ob-say': () => { say(OB.step > 0 ? OB_T[OB.step] : OB_HELLO); const b = $('.herobub'); if (b) b.remove(); },
  'ob-next': () => { sfx('tap'); OB.step = 1; go('onboard', {}, 'f'); },
  'ob-back': () => { sfx('tap'); if (OB.edit && OB.step <= 1) return go('settings', {}, 'b'); OB.step--; go('onboard', {}, 'b'); },
  'ob-name': () => { const v = ($('#ob-name').value || '').trim(); if (!v) { toast('Napíš svoje meno 🙂'); return; } OB.name = v; sfx('tap'); OB.step = 2; go('onboard', {}, 'f'); },
  'ob-g': d => { if (OB.gender !== d.g || !OB.edit) { const keep = OB.edit ? { col: OB.av.col, bg: OB.av.bg, bgp: OB.av.bgp, skin: OB.av.skin, pet: OB.av.pet, petName: OB.av.petName } : {}; OB.av = { ...defaultAvatar(d.g), ...keep }; if (!OB.edit) OB.room = defaultRoom(d.g); } OB.gender = d.g; sfx('pop'); $$('.pickg button').forEach(b => b.classList.toggle('on', b.dataset.g === d.g)); OB.step = 3; setTimeout(() => go('onboard', {}, 'f'), 220); },
  'ob-grade': d => { OB.grade = +d.g; sfx('pop'); $$('.grades button').forEach(b => b.classList.toggle('on', b.dataset.g === d.g)); OB.step = 4; setTimeout(() => go('onboard', {}, 'f'), 220); },
  'ob-pet': d => { const inp = $('#ob-petname'); const oldDef = petName({ pet: OB.av.pet }); if (inp && (!inp.value.trim() || inp.value.trim() === oldDef)) inp.value = itemOf('pet', d.i).n; OB.av.pet = d.i; OB.av.petName = ''; sfx('pop'); $$('.petpick button').forEach(b => b.classList.toggle('on', b.dataset.i === d.i)); },
  'ob-pet-next': () => { const v = ($('#ob-petname').value || '').trim(); OB.av.petName = v && v !== itemOf('pet', OB.av.pet).n ? v : ''; sfx('tap'); OB.step = 5; go('onboard', {}, 'f'); },
  'ob-to-room': () => { sfx('tap'); OB.step = 6; go('onboard', {}, 'f'); },
  'ob-hair': d => { OB.av.hair = d.i; sfx('pop'); render(null); const f = $('#ob-fig .avatar'); f && f.classList.add('jump'); },
  'ob-done': () => { if (OB.edit) { const p = P(); p.name = OB.name; p.grade = OB.grade; p.av = { ...OB.av, gender: OB.gender }; p.room = OB.room; save(); sfx('level'); confetti(100); toast('Uložené ✓'); return go('home', { wave: true }, 'u'); } const p = newProfile(OB.name, OB.gender, OB.grade, OB.av); p.room = OB.room || defaultRoom(OB.gender); DATA.profiles.push(p); DATA.current = p.id; PARENT_OK = false; save(); sfx('level'); confetti(150); go('home', { wave: true }, 'u'); setTimeout(() => { if (UI.view === 'home' && !P().tourDone) showGuide(TOUR, 0, endTour); }, 1400); },
  'pick-prof': d => { DATA.current = d.id; save(); sfx('pop'); go('home', { wave: true }, 'f'); },
  'edit-prof': () => { const p = P(); OB = { step: 1, edit: true, name: p.name, gender: p.av.gender, grade: p.grade, av: JSON.parse(JSON.stringify(p.av)), room: JSON.parse(JSON.stringify(p.room)) }; sfx('tap'); go('onboard', {}, 'f'); },
  'new-prof': () => { OB = { step: 1, name: '', gender: 'd', grade: 1, av: defaultAvatar('d'), room: defaultRoom('d') }; go('onboard', {}, 'f'); },
  subject: d => { sfx('tap'); go('subject', { s: d.s }, 'f'); },
  mode: d => { P().mode[d.s] = d.m; save(); sfx('pop'); render(null); },
  'grade-chip': d => { sfx('tap'); UI.params.g = +d.g; render(null); },
  topic: d => { sfx('tap'); startMode(d.id); },
  'close-sheet': () => closeSheet(),
  daily: () => { const g = P().grade; sfx('tap'); startQuiz(ALL_TOPICS.filter(t => t.g === g).map(t => t.id), 'daily', { v: 'home', p: {} }); },
  ans: (d, el) => answer(Q.cur.options[+d.i], el),
  key: (d, el) => { if (Q.answered) return; const k = d.k; sfx('tap'); if (k === 'del') Q.input = Q.input.slice(0, -1); else if (k === 'ok') { if (Q.input) answer(Q.input, el); return; } else if (Q.input.length < 7) Q.input += k; $('#padshow').innerHTML = Q.input ? fmt(Q.input) : '&nbsp;'; },
  next: () => nextStep(), explain: () => explainQ(), speak: () => say(Q.cur.speak, Q.cur.speakLang),
  calc: () => openCalc(), ck: d => calcKey(d.k),
  quit: () => { const b = Q.back; Q = null; go(b.v, b.p, 'b'); },
  'quit-mode': () => { const b = (UI.view === 'cards' ? CD : UI.view === 'pexeso' ? PX : UI.view === 'match' ? MT : ST).back; go(b.v, b.p, 'b'); },
  flip: () => { $('#flip').classList.toggle('on'); sfx('flip'); },
  'card-say': (d, el, e) => { e.stopPropagation(); say(CD.deck[0].speak, 'en-GB'); },
  'card-yes': () => cardAnswer(true), 'card-no': () => cardAnswer(false),
  tile: d => tileTap(+d.i), 'm-pick': d => mPick(d.s, +d.i), bin: (d, el) => binTap(+d.i, el),
  game: d => { sfx('tap'); startGame(d.g); },
  mole: (d, el) => { if (GM.ended || !el.classList.contains('up') || el.classList.contains('hit')) return; const ok = el.dataset.good === '1'; el.classList.add(ok ? 'hit' : 'miss'); setTimeout(() => el.classList.remove('up'), 250); gHit(ok, el); },
  'quit-game': () => { GM.ended = true; go('games', {}, 'b'); },
  balloon: (d, el) => { if (GM.ended || el.classList.contains('popped')) return; const ok = d.v !== 'x' && d.v !== 'old' && +d.v === GM.target; el.classList.add('popped'); setTimeout(() => el.remove(), 300); gHit(ok, el); if (ok && ++GM.hits % 4 === 0) { GM.target = balloonTarget(GM.g); const t = $('#gtarget'); if (t) { t.innerHTML = `Nové číslo! Praskni balóny s výsledkom <b>${GM.target}</b>`; t.style.animation = 'none'; void t.offsetWidth; t.style.animation = 'yay .5s'; } $$('.balloon').forEach(b => { if (b.dataset.v !== 'x') b.dataset.v = 'old'; }); } },
  drop: (d, el) => { if (GM.ended || el.classList.contains('popped')) return; const ok = d.good === '1'; el.style.background = ok ? 'var(--good)' : 'var(--bad)'; el.style.color = '#fff'; el.classList.add('popped'); setTimeout(() => el.remove(), 300); gHit(ok, el); },
  tf: (d, el) => { if (GM.ended || GM.lock) return; const ok = (d.v === '1') === GM.st.truth; GM.lock = true; gHit(ok, el); if (GM.ended) return; const c = $('#tfcard'); c.style.background = ok ? 'var(--good-soft)' : 'var(--bad-soft)'; $('#tfex').textContent = ok ? '✓ ' + pick(PRAISE) : '✗ ' + GM.st.ex; TIMERS.push(setTimeout(() => { if (GM.ended) return; GM.lock = false; GM.st = makeStatement(GM.g); c.style.background = ''; c.textContent = GM.st.text; c.classList.remove('enter'); void c.offsetWidth; c.classList.add('enter'); $('#tfex').innerHTML = '&nbsp;'; }, ok ? 500 : 1300)); },
  'res-back': () => { const r = UI.params; go(r.back.v, r.back.p, 'b'); },
  'res-again': () => { const r = UI.params; if (r.kind === 'read') return go('reads', {}, 'b'); if (r.kind === 'game') return startGame(r.game); if (r.kind === 'quiz' || r.kind === 'time' || r.kind === 'daily') return startQuiz(r.retry, r.kind, r.back); startMode(r.retry[0]); },
  gift: (d, el) => { el.classList.add('open'); sfx('gift'); confetti(80, .4); setTimeout(() => { el.remove(); $('.over .rewards').hidden = false; $('[data-a="ov-wear"]').hidden = false; }, 450); },
  'ov-close': () => { $('.over')?.remove(); setTimeout(flushPending, 200); },
  'ov-wear': () => { $('.over')?.remove(); PENDING = []; go('wardrobe', {}, 'f'); },
  dreward: () => { sfx('tap'); openDailyReward(); },
  'dr-claim': (d, el) => { const p = P(); const dn = drNextDay(p); p.dailyReward = { last: today(), day: dn }; $('.over')?.remove(); confetti(120); touchStreak(p); grant(DR[dn - 1].xp, el); if (UI.view === 'home' || UI.view === 'rewards') render(null); },
  claim: (d, el) => { const p = P(); const dd = ensureDay(p); if (dd.claimed.includes(d.id)) return; dd.claimed.push(d.id); p.stats.tasks++; checkBadges(p); const T = TASKS.find(x => x.id === d.id); confetti(50, .5); grant(T.xp, el); render(null); },
  'claim-bonus': (d, el) => { const p = P(); const dd = ensureDay(p); if (dd.bonus) return; dd.bonus = true; confetti(160); grant(50, el); render(null); },
  'rtab-go': d => { RTAB = d.t; go('rewards', {}, 'f'); },
  wcat: d => { WCAT = d.c; sfx('tap'); $$('.cats .chip').forEach(c => c.classList.toggle('on', c.dataset.c === d.c)); $('#witems').innerHTML = wardItems(); },
  wear: d => wear(d.i), color: d => setColor(d.s, d.i),
  gender: d => { const p = P(); if (p.av.gender === d.g) return; const def = defaultAvatar(d.g); Object.assign(p.av, { gender: d.g, hair: def.hair, eyes: def.eyes }); for (const c of ['top', 'bottom', 'acc', 'pet']) { const it = itemOf(c, p.av[c]); if (it.g && it.g !== d.g) p.av[c] = def[c]; } for (const k of Object.keys(p.av.col)) { const list = k === 'hair' ? HAIRC : PAL; const it = list.find(x => x.id === p.av.col[k]); if (it && it.g && it.g !== d.g) p.av.col[k] = def.col[k]; } save(); sfx('pop'); render(null); $('#wfig .avatar').classList.add('jump'); },
  rtab: d => { RTAB = d.t; sfx('tap'); render(null); },
  toggle: d => { DATA.settings[d.k] = !DATA.settings[d.k]; save(); render(null); sfx('tap'); },
  'parent-open': () => { sfx('tap'); PSEL = DATA.current; go('parent', {}, 'f'); },
  'parent-lock': () => { PARENT_OK = false; PDEL = false; go(P() ? 'home' : 'profiles', {}, 'b'); },
  'pin-back': () => go(P() ? 'settings' : 'profiles', {}, 'b'),
  pk: d => pinKey(d.k),
  'pin-change': () => { PARENT_OK = false; PIN = { mode: 'create', val: '', first: '' }; UI.view = 'pin'; render('f'); },
  psel: d => { PSEL = d.id; PDEL = false; render(null); },
  'p-grade': d => { const p = DATA.profiles.find(x => x.id === PSEL); p.grade = +d.g; save(); toast(`Ročník: ${d.g}.`); render(null); },
  'pt-add': () => { const p = DATA.profiles.find(x => x.id === PSEL); p.ptasks = p.ptasks || []; if (p.ptasks.filter(t => !t.done).length >= 3) { toast('Naraz môžu byť najviac 3 aktívne úlohy.'); return; } p.ptasks.unshift({ id: 'pt' + Date.now().toString(36), topic: $('#pt-topic').value, stars: +$('#pt-stars').value, coins: +$('#pt-coins').value, t: Date.now(), done: 0 }); if (p.ptasks.length > 20) p.ptasks.length = 20; save(); sfx('pop'); toast('Úloha zadaná ✓ Dieťa ju uvidí na domovskej obrazovke.'); render(null); },
  'pt-del': d => { const p = DATA.profiles.find(x => x.id === PSEL); p.ptasks = (p.ptasks || []).filter(t => t.id !== d.id); save(); render(null); },
  'pt-go': d => { sfx('tap'); const t = TOPIC[d.id]; startQuiz([d.id], 'quiz', { v: 'home', p: {} }); },
  'p-glimit': d => { DATA.settings.gameLimit = +d.n; save(); sfx('tap'); toast(+d.n ? `Minihry: ${d.n}× za deň ✓` : 'Minihry bez limitu ✓'); render(null); },
  'ov-learn': () => { const o = $('.over'); if (o) o.parentNode.removeChild(o); go('learn', {}, 'f'); },
  'p-gift': (d, el) => { const p = DATA.profiles.find(x => x.id === PSEL); if (giftsToday(p) >= 2 || ![5, 10, 15, 20].includes(+d.n)) { sfx('no'); toast('Dnes ste už odmenili 2×. Skúste zajtra.'); return; } p.coins = (p.coins || 0) + (+d.n); p.log.unshift({ t: Date.now(), k: 'gift', id: null, c: +d.n, n: 0 }); save(); burst(el, 30); sfx('coin'); toast(`Dieťa dostalo ${d.n} mincí 🎁`); render(null); },
  'voice-test': () => say('Ahoj! Čítam mäkčene, dĺžne aj vety. Ďakujem, že sa učíš. Výborne!'),
  'pdel-ask': () => { PDEL = true; render(null); }, 'pdel-no': () => { PDEL = false; render(null); },
  'pdel-yes': () => { DATA.profiles = DATA.profiles.filter(p => p.id !== PSEL); if (DATA.current === PSEL) DATA.current = DATA.profiles[0]?.id || null; PSEL = DATA.current; PDEL = false; save(); if (!DATA.profiles.length) { PARENT_OK = false; return boot(); } render(null); },
  ask: d => askBot(d.q),
  parea: d => { PAREA = d.k; sfx('tap'); render(null); },
  theme: d => { DATA.settings.theme = d.t; save(); applyTheme(); sfx('pop'); render(null); },
  'tour-again': () => { go('home', {}, 'b'); setTimeout(() => showGuide(TOUR, 0, endTour), 700); },
  shopcat: d => { SHOPCAT = d.c; SHOPSEL = null; sfx('tap'); render(null); },
  'buy-ask': d => { const p = P(); const it = itemOf(d.c, d.i); if ((p.coins || 0) < it.price) { sfx('no'); toast(`Chýba ti ešte ${it.price - (p.coins || 0)} mincí. Uč sa a zbieraj! 🪙`); return; } SHOPSEL = it.sid; sfx('tap'); render(null); },
  buy: (d, el) => { const p = P(); const it = itemOf(d.c, d.i); if ((p.coins || 0) < it.price || p.owned.includes(it.sid)) return; p.coins -= it.price; p.owned.push(it.sid); SHOPSEL = null; save(); sfx('gift'); buzz([30, 40, 30]); burst(el, 40); confetti(90, .4); toast(`Kúpené: ${it.n}! 🎉`); render(null); },
  'shop-wear': d => { const p = P(); p.av[d.c] = d.i; if (d.c === 'top' && false) { } save(); sfx('pop'); toast('Oblečené ✓'); render(null); },
  'rd-grade': d => { RDG = +d.g; sfx('tap'); render(null); },
  'rd-open': d => { RD = { id: d.id, opts: {}, ans: {}, correct: 0 }; sfx('tap'); go('read', {}, 'f'); },
  'rd-back': () => { if (REC && RD.recording) { try { REC.mr.stop(); } catch (e) { } } RD = null; go('reads', {}, 'b'); },
  'rd-say': () => say(READ[RD.id].text),
  'tut-say': () => { if (GUIDE) say(GUIDE.cur); }, 'tut-open': () => showTut(0), 'tut-skip': () => { const g = GUIDE; (g ? g.end : endTut)(); }, 'tut-next': d => { const i = +d.i; const g = GUIDE || { steps: TUT, end: endTut }; if (i >= g.steps.length) g.end(); else showGuide(g.steps, i, g.end); },
  'rec-start': () => recStart(), 'dikt-open': () => openDiktafon(),
  'rec-pick': () => { closeSheet(); const f = $('#recfile'); if (f) f.click(); },
  'rec-stop': () => { if (REC && REC.mr.state !== 'inactive') REC.mr.stop(); },
  'rec-again': () => { RD.blobUrl = null; RD.blob = null; RD.saved = false; render(null); if (!MIC_BLOCKED) recStart(); },
  'rd-done': (d, el) => { const p = P(); p.readings.unshift({ id: 'rd' + Date.now().toString(36), r: RD.id, t: Date.now(), rating: null, noAudio: true }); if (p.readings.length > 60) p.readings.length = 60; RD.done = true; if (!RD.recXp) { RD.recXp = true; gain(p, 20); floatXp(el, '+20'); } burst(el, 40); logAct('read', null, 1, 1); touchStreak(p); save(); sfx('coin'); render(null); },
  'rec-save': async (d, el) => { const p = P(); const id = 'rec' + Date.now().toString(36); try { await idbOp('readwrite', st => st.put({ id, pid: p.id, r: RD.id, t: Date.now(), blob: RD.blob })); p.readings.unshift({ id, r: RD.id, t: Date.now(), rating: null }); if (p.readings.length > 60) p.readings.length = 60; RD.saved = true; if (!RD.recXp) { RD.recXp = true; gain(p, 20); floatXp(el, '+20'); } logAct('read', null, 1, 1); touchStreak(p); save(); sfx('coin'); burst(el); toast('Nahrávka uložená. Rodič si ju vypočuje 🎧'); render(null); } catch (e) { toast('Nahrávku sa nepodarilo uložiť v tomto prehliadači.'); } },
  'rd-ans': (d, el) => { const qi = +d.q; if (RD.ans[qi] !== undefined) return; const [, a] = READ[RD.id].q[qi].split('|'); RD.ans[qi] = d.o; const ok = d.o === a; const p = P(); p.stats.answered++; countDay(ok); if (ok) { RD.correct++; p.stats.correct++; bump('correct'); sfx('ok'); burst(el); } else sfx('no'); save(); render(null); },
  'rd-finish': (d, el) => { const p = P(); const before = p.xp; const g = 10 + RD.correct * 10; gain(p, g); logAct('readq', null, RD.correct, READ[RD.id].q.length); touchStreak(p); checkBadges(p); save(); go('result', { kind: 'read', correct: RD.correct, total: READ[RD.id].q.length, xp: g, bonus: 0, before, after: p.xp, back: { v: 'reads', p: {} } }, 'u'); },
  'play-rec': async d => { const box = $('#aud-' + d.id); if (!box) return; try { const o = await idbOp('readonly', st => st.get(d.id)); if (!o) { box.innerHTML = '<span class="muted b">Nahrávka je uložená v inom zariadení alebo bola vymazaná.</span>'; return; } box.innerHTML = `<audio controls autoplay src="${URL.createObjectURL(o.blob)}" style="width:100%"></audio>`; } catch (e) { box.innerHTML = '<span class="muted b">Nahrávku sa nepodarilo načítať.</span>'; } },
  'rate-rec': d => { const p = DATA.profiles.find(x => x.id === PSEL); const r = p.readings.find(x => x.id === d.id); if (r) { r.rating = +d.r; save(); toast('Hodnotenie uložené ✓'); render(null); } },
  'del-rec': async d => { const p = DATA.profiles.find(x => x.id === PSEL); p.readings = p.readings.filter(x => x.id !== d.id); save(); try { await idbOp('readwrite', st => st.delete(d.id)); } catch (e) { } render(null); },
  'room-back': () => { sfx('tap'); go('wardrobe', {}, 'b'); },
  'room-page': () => { const p = P(); p.room.page = !p.room.page; save(); render(null); sfx('tap'); },
  petname: () => { const p = P(); const v = ($('#petname').value || '').trim(); p.av.petName = v && v !== itemOf('pet', p.av.pet).n ? v : ''; save(); toast(`Tvoje zvieratko sa volá ${petName(p.av)} ✓`); sfx('pop'); },
  'ds-tab': d => { DS.tab = d.t; sfx('tap'); const b = $('#dsgn'); if (b) b.innerHTML = designerHTML(); },
  'ds-add': d => { const it = STICKERS[+d.i]; if (!unlocked(it, DS.lockP)) { sfx('no'); toast(`🔒 Odomkneš: ${lockLabel(it)}`); return; } if (DS.room.stickers.length >= 16) { toast('Viac nálepiek sa už nezmestí. Niektorú zmaž.'); return; } DS.room.stickers.push({ e: it.e, x: R(12, 88), y: R(10, 70), s: 1, r: R(-15, 15) }); DS.sel = DS.room.stickers.length - 1; sfx('pop'); buzz(10); dsRefresh(); const el = $(`#designer .stk[data-i="${DS.sel}"]`); if (el) el.animate([{ transform: 'translate(-50%,-50%) scale(0)' }, { transform: 'translate(-50%,-50%) scale(1.3)' }, { transform: `translate(-50%,-50%) rotate(var(--r)) scale(var(--s))` }], { duration: 450, easing: 'cubic-bezier(.3,1.6,.5,1)' }); },
  'ds-theme': d => { const t = themeOf(d.i); if (!unlocked(t, DS.lockP)) { sfx('no'); toast(`🔒 Odomkneš: ${lockLabel(t)}`); return; } DS.room.theme = d.i; sfx('pop'); dsRefresh(); },
  'ds-pat': d => { DS.room.pat = d.i; sfx('pop'); dsRefresh(); },
  'ds-desel': (d, el, e) => { if (e.target.closest('.stk')) return; if (DS.sel !== null) { DS.sel = null; const b = $('#dsgn'); if (b) b.innerHTML = designerHTML(); } },
  'ds-tool': d => { const s = DS.room.stickers[DS.sel]; if (!s) return; if (d.t === 'plus') s.s = Math.min(2.6, +(s.s + .25).toFixed(2)); if (d.t === 'minus') s.s = Math.max(.5, +(s.s - .25).toFixed(2)); if (d.t === 'rot') s.r = (s.r + 20) % 360; if (d.t === 'del') { DS.room.stickers.splice(DS.sel, 1); DS.sel = null; } sfx('tap'); dsRefresh(); }
};
function newProfile(name, gender, grade, av) { const p = { id: 'p' + Date.now().toString(36), name, grade, av: { ...av, gender }, xp: 0, stats: {}, topics: {}, badges: [], streak: {}, dailyDone: '', created: Date.now() }; migrate(p); return p; }
function closeSheet() { const w = $('#sheetwrap'); if (w) w.remove(); document.body.classList.remove('calcopen'); }
function bearJoy(svg) { if (!svg) return; svg.classList.remove('bhappy'); void svg.getBoundingClientRect(); svg.classList.add('bhappy'); setTimeout(() => svg.classList.remove('bhappy'), 1300); const r = svg.getBoundingClientRect(); for (let i = 0; i < 5; i++) { const h = document.createElement('span'); h.className = 'bheart'; h.textContent = pick(['💛', '💖', '⭐', '✨', '💜']); h.style.left = (r.left + r.width * (.2 + Math.random() * .6)) + 'px'; h.style.top = (r.top + r.height * .3) + 'px'; h.style.setProperty('--dx', ((Math.random() - .5) * 90) + 'px'); h.style.animationDelay = (i * 70) + 'ms'; document.body.appendChild(h); setTimeout(() => h.remove(), 1500); } sfx('pop'); }
document.addEventListener('pointerdown', e => { const bear = e.target.closest('svg.bear'); if (bear) bearJoy(bear); });
document.addEventListener('pointerdown', e => { const b = e.target.closest('.btn,.opt,.key,.chip,.mp,.bin,.mi2'); if (!b || matchMedia('(prefers-reduced-motion: reduce)').matches) return; const r = b.getBoundingClientRect(); const sz = Math.max(r.width, r.height); const sp = document.createElement('span'); sp.className = 'ripple'; sp.style.cssText = `width:${sz}px;height:${sz}px;left:${e.clientX - r.left - sz / 2}px;top:${e.clientY - r.top - sz / 2}px`; b.appendChild(sp); setTimeout(() => sp.remove(), 550); });
document.addEventListener('click', e => { const el = e.target.closest('[data-a]'); if (!el) return; ac(); const f = ACT[el.dataset.a]; if (f) { e.preventDefault(); f(el.dataset, el, e); } });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeSheet(); return; }
  if (UI.view === 'pin' && /^\d$/.test(e.key)) return pinKey(e.key);
  if (UI.view === 'quiz' && Q && !Q.answered && Q.cur.input) { if (/^\d$/.test(e.key)) ACT.key({ k: e.key }); else if (e.key === 'Backspace') ACT.key({ k: 'del' }); else if (e.key === 'Enter') ACT.key({ k: 'ok' }); }
  else if (UI.view === 'quiz' && $('#fb') && e.key === 'Enter') nextStep();
  else if (e.target.id === 'flip' && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); ACT.flip(); }
});
function boot() {
  if (!DATA.profiles.length) { OB = { step: 0, name: '', gender: 'd', grade: 1, av: defaultAvatar('d'), room: defaultRoom('d') }; return go('onboard', {}, 'u'); }
  if (!P()) return go('profiles', {}, 'u');
  go('home', { wave: true }, 'u');
}
load(); applyTheme(); boot();
setTimeout(initDb, 0);
