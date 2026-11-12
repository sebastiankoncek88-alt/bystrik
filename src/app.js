/* ===== Stav a ukladanie ===== */
const KEY = 'bystrik.v1';
let DATA = { profiles: [], current: null, settings: {}, parent: { pin: null }, t: 0 };
const CHAT_ON = () => !!(DATA.settings.chat && ((window.claude && window.claude.use) || getApiKey()));
const COIN = '<svg class="ci" viewBox="0 0 40 40" aria-hidden="true"><use href="#coin"/></svg>';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function normalize() {
  DATA.settings = Object.assign({ sound: true, voice: true, calc: true, chat: true, gameLimit: 0, theme: 'auto', lb: true, friends: true, freeChat: false }, DATA.settings || {});
  if (!DATA.settings.glimFree) { if (DATA.settings.gameLimit === 2) DATA.settings.gameLimit = 0; DATA.settings.glimFree = 1; }
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
function applyTheme() { try { const de = document.documentElement; de.classList.add('thx'); clearTimeout(applyTheme.t); applyTheme.t = setTimeout(() => de.classList.remove('thx'), 520); } catch (e) { } setTimeout(applyPageBg, 0); const t = DATA.settings.theme; if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t; else if (document.documentElement.dataset.theme && THEME_SET) delete document.documentElement.dataset.theme; THEME_SET = t !== 'auto'; }
let THEME_SET = false;
function load() { try { const s = localStorage.getItem(KEY); if (s) DATA = Object.assign(DATA, JSON.parse(s)); } catch (e) { } normalize(); }
function save() { DATA.t = Date.now(); try { localStorage.setItem(KEY, JSON.stringify(DATA)); } catch (e) { } queueSync(); if (typeof lbPush === 'function') lbPush(); }
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
/* AI na webe: vlastný kľúč rodiča (uložený len v tomto zariadení, nie v zálohe) */
const API_KEY_LS = 'bystrik.apikey';
function getApiKey() { try { return localStorage.getItem(API_KEY_LS) || ''; } catch (e) { return ''; } }
function setApiKey(k) { try { if (k) localStorage.setItem(API_KEY_LS, k); else localStorage.removeItem(API_KEY_LS); } catch (e) { } SAMPLE = null; }
function blobB64(b) { return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1]); r.onerror = rej; r.readAsDataURL(b); }); }
function apiSample(key) {
  const call = async (input, opts = {}) => {
    const messages = typeof input === 'string' ? [{ role: 'user', content: input }] : input.map(m => ({ role: m.role, content: m.content }));
    if (opts.images && opts.images.length) { const last = messages[messages.length - 1]; const imgs = await Promise.all(opts.images.map(async b => ({ type: 'image', source: { type: 'base64', media_type: b.type && b.type.startsWith('image/') ? b.type : 'image/jpeg', data: await blobB64(b) } }))); last.content = [...imgs, { type: 'text', text: String(last.content) }]; }
    let res;
    try {
      res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2026-10-21', 'anthropic-beta': 'server-side-fallback-2026-07-01', 'anthropic-dangerous-direct-browser-access': 'true' }, body: JSON.stringify({ model: 'claude-opus-5-5', max_tokens: opts.max || 4000, output_config: { effort: opts.effort || 'low' }, fallbacks: 'default', messages }) });
    } catch (e) { throw { code: 'network', message: 'Bez pripojenia na internet.' }; }
    if (!res.ok) { let msg = ''; try { msg = (await res.json()).error.message; } catch (e) { } throw { code: res.status === 401 || res.status === 403 ? 'not_granted' : res.status === 429 ? 'rate_limited' : res.status === 400 && /credit|balance/i.test(msg) ? 'no_credit' : 'api_error', message: msg || 'HTTP ' + res.status }; }
    const j = await res.json();
    if (j.stop_reason === 'refusal') throw { code: 'refused', message: 'refusal' };
    const text = (j.content || []).filter(b => b.type === 'text').map(b => b.text).join('').trim();
    if (opts.onText) { try { opts.onText({ text, delta: text }); } catch (e) { } }
    return { text };
  };
  call.json = async (input, opts = {}) => { const { text } = await call(input, { ...opts, effort: 'medium', max: 10000 }); const t = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, ''); const a = t.indexOf('{'), b = t.lastIndexOf('}'); try { return JSON.parse(a >= 0 && b > a ? t.slice(a, b + 1) : t); } catch (e) { throw { code: 'invalid_json', text }; } };
  call.limits = async () => ({ images: { max: 5 } });
  return call;
}
/* Google Gemini (bezplatný kľúč z aistudio.google.com) */
let GEM_OK = null;
function geminiSample(key) {
  const MODELS = ['gemini-flash-latest', 'gemini-3.8-flash', 'gemini-flash-lite-latest', 'gemini-3.5-flash-lite'];
  const call = async (input, opts = {}) => {
    const msgs = typeof input === 'string' ? [{ role: 'user', content: input }] : input.map(m => ({ role: m.role, content: m.content }));
    const contents = msgs.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: String(m.content) }] }));
    if (opts.images && opts.images.length) { const last = contents[contents.length - 1]; const imgs = await Promise.all(opts.images.map(async b => ({ inline_data: { mime_type: b.type && b.type.startsWith('image/') ? b.type : 'image/jpeg', data: await blobB64(b) } }))); last.parts = [...imgs, ...last.parts]; }
    const body = { contents, generationConfig: { maxOutputTokens: opts.max || 4000, ...(opts.asJson ? { responseMimeType: 'application/json' } : {}) } };
    const list = GEM_OK ? [GEM_OK, ...MODELS.filter(m => m !== GEM_OK)] : MODELS;
    let lastErr = null;
    for (const model of list) {
      let res;
      try { res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent', { method: 'POST', headers: { 'content-type': 'application/json', 'x-goog-api-key': key }, body: JSON.stringify(body) }); }
      catch (e) { throw { code: 'network', message: 'Bez pripojenia na internet.' }; }
      if (!res.ok) {
        let msg = ''; try { msg = (await res.json()).error.message || ''; } catch (e) { }
        if (/api key|API_KEY/i.test(msg) || res.status === 401) throw { code: 'not_granted', message: msg };
        lastErr = { code: res.status === 429 ? 'rate_limited' : 'api_error', message: msg || 'HTTP ' + res.status };
        if (res.status === 404 || res.status === 429 || res.status === 403 || res.status >= 500) continue;
        throw lastErr;
      }
      const j = await res.json(); GEM_OK = model;
      const c = (j.candidates || [])[0];
      if (!c || c.finishReason === 'SAFETY' || c.finishReason === 'PROHIBITED_CONTENT' || (j.promptFeedback && j.promptFeedback.blockReason)) throw { code: 'refused', message: 'refusal' };
      const text = ((c.content && c.content.parts) || []).filter(x => !x.thought).map(x => x.text || '').join('').trim();
      if (opts.onText) { try { opts.onText({ text, delta: text }); } catch (e) { } }
      return { text };
    }
    throw lastErr || { code: 'api_error', message: 'chyba' };
  };
  call.json = async (input, opts = {}) => { const { text } = await call(input, { ...opts, asJson: true, max: 10000 }); const t = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, ''); const a = t.indexOf('{'), b = t.lastIndexOf('}'); try { return JSON.parse(a >= 0 && b > a ? t.slice(a, b + 1) : t); } catch (e) { throw { code: 'invalid_json', text }; } };
  call.limits = async () => ({ images: { max: 5 } });
  return call;
}
function keySample(k) { return k.startsWith('sk-ant-') ? apiSample(k) : geminiSample(k); }
function getSample() { if (!SAMPLE) SAMPLE = (window.claude && window.claude.use) ? window.claude.use('sample').catch(() => null) : Promise.resolve(getApiKey() ? keySample(getApiKey()) : null); return SAMPLE; }

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
/* Vlastný zvuk Bystríka: mäkké „drevené“ tóny (marimba) a zvučka */
function mar(f, when = 0, vol = .15, d = .45) { tone(f, d, 'sine', vol, when); tone(f * 4, d * .16, 'sine', vol * .3, when); tone(f * 2.01, d * .38, 'triangle', vol * .1, when); }
const JINGLE = [[392, 0], [659, .13], [587, .26], [784, .46]];
const SFX = {
  tap: () => mar(880, 0, .05, .08), pop: () => mar(587, 0, .1, .16),
  ok: () => { mar(659, 0, .14, .3); mar(784, .09, .14, .42); },
  no: () => { mar(220, 0, .12, .32); mar(196, .12, .12, .45); }, flip: () => mar(523, 0, .08, .14),
  match: () => [587, 659, 784].forEach((f, i) => mar(f, i * .08, .12, .3)),
  jingle: () => { JINGLE.forEach(([f, t]) => mar(f, t, .15, .5)); [523, 659, 784].forEach(f => mar(f, .72, .09, .9)); tone(131, .7, 'sine', .1, .72); },
  level: () => { JINGLE.forEach(([f, t]) => mar(f, t, .15, .5)); [1046, 1318, 1568].forEach((f, i) => mar(f, .66 + i * .1, .11, .6)); tone(131, .9, 'sine', .1, .66); },
  star: i => mar([659, 784, 988][i] || 659 + i * 150, 0, .13, .35), tick: () => tone(1200, .03, 'sine', .03),
  whoosh: () => tone(200, .25, 'sine', .06, 0, 1200), gift: () => [392, 523, 659, 784, 1046].forEach((f, i) => mar(f, i * .07, .12, .35)),
  balloon: () => { mar(988, 0, .08, .1); tone(700, .07, 'sine', .05, 0, 240); }, coin: () => { mar(1175, 0, .07, .15); mar(1568, .07, .07, .32); }
};
let JINGLED = false;
document.addEventListener('pointerdown', () => { if (JINGLED) return; JINGLED = true; setTimeout(() => sfx('jingle'), 60); }, true);
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
const unlocked = (it, p) => (!it.lvl || levelInfo(p.xp).L >= it.lvl) && (!it.streak || (p.streak.best || 0) >= it.streak) && (!it.price || (p.owned || []).includes(it.sid)) && (!it.lb || (p.owned || []).includes('lb:' + it.id));
const lockLabel = it => it.lb ? `Rebríček: ${it.lb}. miesto` : it.price ? `Obchod 🪙 ${it.price}` : it.lvl ? `Level ${it.lvl}` : `Séria ${it.streak} dní`;
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
  if (cat === 'pet' || cat === 'sticker') return `<span>${it.e || '🚫'}</span>`;
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
const weekId = () => { const d = new Date(); d.setDate(d.getDate() - (d.getDay() + 6) % 7); return dkey(d); };
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
function logAct(k, id, c, n) { const p = P(); if (k !== 'gift' && k !== 'ptask') { const wk = weekId(); if (!p.wk || p.wk.w !== wk) p.wk = { w: wk, xp: 0 }; p.wk.n = (p.wk.n || 0) + 1; const dd = p.days[today()] || (p.days[today()] = { q: 0, c: 0 }); dd.n = (dd.n || 0) + 1; } p.log.unshift({ t: Date.now(), k, id, c, n }); if (p.log.length > 300) p.log.length = 300; }
function countDay(ok) { const p = P(); const d = p.days[today()] || (p.days[today()] = { q: 0, c: 0 }); d.q++; if (ok) d.c++; }
const DR = [{ xp: 20, i: '⭐' }, { xp: 25, i: '⭐' }, { xp: 30, i: '💎' }, { xp: 40, i: '⭐' }, { xp: 50, i: '💎' }, { xp: 60, i: '🎁' }, { xp: 100, i: '👑' }];
const drReady = p => p.dailyReward.last !== today();
const drNextDay = p => p.dailyReward.last === daysAgo(1) ? (p.dailyReward.day % 7) + 1 : 1;
let PENDING = [];
function gain(p, n) { const wk = weekId(); if (!p.wk || p.wk.w !== wk) p.wk = { w: wk, xp: 0 }; p.wk.xp += n; p.xp += n; p.coins = (p.coins || 0) + Math.max(1, Math.round(n / 5)); }
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
  if (typeof PARENT_OK !== 'undefined' && PARENT_OK && !['parent', 'psetup', 'pin', 'remote', 'onboard'].includes(view)) PARENT_OK = false;
  try { if (typeof REC !== 'undefined' && REC && REC.mr && REC.mr.state !== 'inactive' && view !== 'read') { REC.mr.onstop = null; REC.mr.stop(); REC.stream && REC.stream.getTracks().forEach(t => t.stop()); if (typeof RD !== 'undefined' && RD) RD.recording = false; } } catch (e) { }
  if (view !== 'fchat' && typeof fcClose === 'function') fcClose();
  if (GUIDE && !GUIDE.nav) GUIDE = null;
  clearTimers(); closeSheet(); clearTut(); $$('.fb,.peek,.peekbub,.over').forEach(e => e.remove());
  try { speechSynthesis.cancel(); } catch (e) { }
  UI.view = view; UI.params = params; render(dir); window.scrollTo(0, 0);
}
const NAV_ORDER = ['home', 'learn', 'games', 'friends', 'shop', 'wardrobe']; let LASTVIEW = null;
function ghostOut(dir) {
  try { const old = document.querySelector('#app .view'); if (!old || matchMedia('(prefers-reduced-motion: reduce)').matches) return; $$('.vghost').forEach(e => e.remove());
    const r = old.getBoundingClientRect(); const g = old.cloneNode(true); g.querySelectorAll('[id]').forEach(e => e.removeAttribute('id')); g.querySelectorAll('[data-a]').forEach(e => e.removeAttribute('data-a'));
    g.className = 'view vghost out-' + dir; g.style.cssText = `position:fixed;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;margin:0;z-index:15;pointer-events:none;overflow:hidden`;
    document.body.appendChild(g); setTimeout(() => g.remove(), 340);
  } catch (e) { }
}
function render(dir) {
  const app = $('#app');
  if (dir) { const a = NAV_ORDER.indexOf(LASTVIEW), b = NAV_ORDER.indexOf(UI.view); if (a >= 0 && b >= 0 && a !== b) dir = b > a ? 'r' : 'l'; ghostOut(dir); LASTVIEW = UI.view; }
  app.innerHTML = VIEWS[UI.view](UI.params);
  const v = app.querySelector('.view'); if (v && dir) v.classList.add('enter-' + dir);
  AFTER[UI.view] && AFTER[UI.view]();
  applyRoom();
  if (!['quiz', 'cards', 'pexeso', 'match', 'sort', 'game', 'result', 'onboard'].includes(UI.view)) setTimeout(flushPending, 350);
}
let LASTCOINS = -1;
function topbar(back) {
  const p = P(); const li = levelInfo(p.xp); setTimeout(() => { LASTCOINS = p.coins || 0; }, 0);
  const left = back ? `<button class="iconbtn press" data-a="${back}" aria-label="Späť">←</button>` : `<button class="headbub press" data-a="nav" data-v="wardrobe" aria-label="Môj avatar">${avatarSvg(p.av, { crop: 'head' })}</button>`;
  return `<header class="top">${left}<div class="who"><b>${esc(p.name)}</b><div class="xpbar" title="${li.cur} / ${li.need} bodov"><i style="width:${li.pct}%"></i></div></div><button class="lvl press" data-a="nav" data-v="rewards" aria-label="Level ${li.L}, otvoriť odmeny">Lv ${li.L}</button><button class="lvl coinchip press ${(p.coins || 0) > LASTCOINS && LASTCOINS >= 0 ? 'bump' : ''}" data-a="nav" data-v="shop" aria-label="Slniečka: ${p.coins || 0}, otvoriť obchod">${COIN} ${p.coins || 0}</button><button class="iconbtn press" data-a="nav" data-v="settings" aria-label="Nastavenia" style="position:relative">⚙️${needBackup() ? '<span class="blinkdot" style="position:absolute;top:-4px;right:-4px;margin:0"></span>' : ''}</button></header>`;
}
function nav(on) {
  const p = P(); const d = ensureDay(p); const claimable = d.tasks.some(id => { const T = TASKS.find(x => x.id === id); return !d.claimed.includes(id) && (d.cnt[T.k] || 0) >= T.t; }) || drReady(p);
  const fresh = (p.seenRewards || 1) < levelInfo(p.xp).L;
  const b = (v, i, n, dot) => `<button class="${on === v ? 'on' : ''}" data-a="nav" data-v="${v}"><span class="ni">${i}</span>${n}${dot ? '<span class="dot"></span>' : ''}</button>`;
  return `<nav class="nav"><div class="in">${b('home', '🏠', 'Domov', claimable && on !== 'home')}${b('learn', '📚', 'Učenie')}${b('games', '🎮', 'Hry')}${b('friends', '🤝', 'Priatelia', !!(FR && FR.total > 0) && on !== 'friends')}${b('shop', '🛍️', 'Obchod')}${b('wardrobe', '👕', 'Šatník', fresh)}</div></nav>`;
}
const bearSvg = (cls = 'owl') => `<svg class="bear ${cls}" viewBox="0 0 120 120" aria-hidden="true"><ellipse class="b-shadow" cx="60" cy="115.5" rx="30" ry="4" fill="#000" opacity=".12"/><g class="b-all"><g class="b-feet"><ellipse cx="43" cy="109" rx="11" ry="7.5" fill="url(#bfur2)"/><ellipse cx="77" cy="109" rx="11" ry="7.5" fill="url(#bfur2)"/><ellipse cx="43" cy="110.5" rx="5.2" ry="3.4" fill="#FFE3C2"/><ellipse cx="77" cy="110.5" rx="5.2" ry="3.4" fill="#FFE3C2"/><circle cx="37.5" cy="105.5" r="1.5" fill="#FFE3C2"/><circle cx="43" cy="104.3" r="1.5" fill="#FFE3C2"/><circle cx="48.5" cy="105.5" r="1.5" fill="#FFE3C2"/><circle cx="71.5" cy="105.5" r="1.5" fill="#FFE3C2"/><circle cx="77" cy="104.3" r="1.5" fill="#FFE3C2"/><circle cx="82.5" cy="105.5" r="1.5" fill="#FFE3C2"/></g><g class="b-body"><ellipse cx="60" cy="92" rx="27" ry="21.5" fill="url(#bfur)"/><ellipse cx="60" cy="96" rx="16.5" ry="14" fill="url(#bbelly)"/><path d="M53 99 q7 5 14 0" stroke="#EBC79C" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".7"/></g><g class="b-arm-l"><ellipse cx="34" cy="89" rx="8" ry="12.5" fill="url(#bfur2)" transform="rotate(24 34 89)"/><ellipse cx="30.6" cy="96.5" rx="3.6" ry="2.6" fill="#FFE3C2" opacity=".85" transform="rotate(24 30.6 96.5)"/></g><g class="b-arm-r"><ellipse cx="86" cy="89" rx="8" ry="12.5" fill="url(#bfur2)" transform="rotate(-24 86 89)"/><ellipse cx="89.4" cy="96.5" rx="3.6" ry="2.6" fill="#FFE3C2" opacity=".85" transform="rotate(-24 89.4 96.5)"/></g><g class="b-head"><g class="b-ear-l"><circle cx="29" cy="23" r="13.5" fill="url(#bfur2)"/><circle cx="29.5" cy="24" r="7.6" fill="url(#bear)"/></g><g class="b-ear-r"><circle cx="91" cy="23" r="13.5" fill="url(#bfur2)"/><circle cx="90.5" cy="24" r="7.6" fill="url(#bear)"/></g><ellipse cx="60" cy="50" rx="38" ry="35.5" fill="url(#bfur)"/><ellipse cx="45" cy="29" rx="17" ry="8" fill="#fff" opacity=".16" transform="rotate(-18 45 29)"/><path d="M55 15.5 q3 -6 6.5 -1 q3 -4.5 5 1" stroke="#B9753F" stroke-width="2.4" fill="none" stroke-linecap="round"/><ellipse cx="60" cy="63" rx="18.5" ry="14" fill="url(#bbelly)"/><path d="M39.5 35.5 q5.5 -4 11 -1.6" stroke="#8A5226" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".75"/><path d="M69.5 33.9 q5.5 -2.4 11 1.6" stroke="#8A5226" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".75"/><g class="b-eyes"><ellipse cx="45.5" cy="46" rx="6.6" ry="7.4" fill="#33221E"/><ellipse cx="74.5" cy="46" rx="6.6" ry="7.4" fill="#33221E"/><ellipse cx="45.5" cy="48.6" rx="4.2" ry="3.4" fill="#7A4A2E" opacity=".75"/><ellipse cx="74.5" cy="48.6" rx="4.2" ry="3.4" fill="#7A4A2E" opacity=".75"/><circle cx="47.9" cy="43" r="2.7" fill="#fff"/><circle cx="76.9" cy="43" r="2.7" fill="#fff"/><circle cx="43.3" cy="49.3" r="1.2" fill="#fff" opacity=".9"/><circle cx="72.3" cy="49.3" r="1.2" fill="#fff" opacity=".9"/></g><g class="b-happyeyes"><path d="M39.5 47.5 Q45.5 39.5 51.5 47.5 M68.5 47.5 Q74.5 39.5 80.5 47.5" stroke="#33221E" stroke-width="3.4" fill="none" stroke-linecap="round"/></g><ellipse class="b-cheek" cx="34.5" cy="59" rx="6.8" ry="4.4" fill="url(#bcheek)"/><ellipse class="b-cheek" cx="85.5" cy="59" rx="6.8" ry="4.4" fill="url(#bcheek)"/><path class="b-nose" d="M52.8 55.2 Q60 50.6 67.2 55.2 Q67.6 59.4 60 62.6 Q52.4 59.4 52.8 55.2 Z" fill="#3A2622"/><ellipse cx="57.6" cy="55.3" rx="2.6" ry="1.3" fill="#fff" opacity=".55"/><path class="b-smile" d="M60 62.6 V66 M52 67 Q56 72.4 60 67.4 Q64 72.4 68 67" stroke="#3A2622" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><g class="b-mouth"><path d="M53.5 65.5 Q60 63.5 66.5 65.5 Q66 75 60 75 Q54 75 53.5 65.5 Z" fill="#7A2335"/><ellipse cx="60" cy="72.2" rx="3.6" ry="2.2" fill="#FF8FA6"/></g></g><g class="b-bow"><path d="M60 84.5 L46.5 77.5 Q44.5 84.5 46.5 91.5 Z" fill="url(#bbow)"/><path d="M60 84.5 L73.5 77.5 Q75.5 84.5 73.5 91.5 Z" fill="url(#bbow)"/><path d="M49 80.5 q-1 4 0 8" stroke="#fff" stroke-width="1.2" fill="none" stroke-linecap="round" opacity=".45"/><rect x="56.2" y="80.6" width="7.6" height="7.8" rx="2.6" fill="#FFC94D" stroke="#E8A200" stroke-width=".8"/></g></g><g class="b-sparks"><path d="M12 40 l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#FFC94D"/><path d="M104 30 l1.6 4 4 1.6-4 1.6-1.6 4-1.6-4-4-1.6 4-1.6z" fill="#FF8FA3"/><path d="M108 76 l1.4 3.4 3.4 1.4-3.4 1.4-1.4 3.4-1.4-3.4-3.4-1.4 3.4-1.4z" fill="#86E3C9"/></g></svg>`;
const owlSvg = bearSvg;
const TIPS = ['Učenie nájdeš dole v lište pod 📚.', 'Za slniečka si v obchode kúpiš nové veci!', 'Každá správna odpoveď ťa posunie k novej odmene!', 'Splň dnešné úlohy a vyzdvihni si body!', 'Kartičky pomáhajú zapamätať si učivo.', 'V spájačke spájaš, čo k sebe patrí.', 'Chyba nevadí. Aj z nej sa učíš!', 'Keď niečomu nerozumieš, opýtaj sa ma v chate.', 'Uč sa každý deň a séria porastie! 🔥'];
const starStr = n => `<span class="stars" aria-label="${n} z 3 hviezd">${[0, 1, 2].map(i => i < n ? '⭐' : '<span style="opacity:.25">⭐</span>').join('')}</span>`;
function topicStat(p, id) { return p.topics[id] || (p.topics[id] = { stars: 0, best: 0, correct: 0, total: 0, played: 0 }); }
const MODES = {
  quiz: { i: '❓', n: 'Kvíz', d: '10 otázok, vyber správnu odpoveď. Za dobré výsledky dostaneš hviezdy.' },
  cards: { i: '🃏', n: 'Kartičky', d: 'Pozri sa na kartičku, skús si odpoveď a otoč ju. Takto sa učivo zapamätá.' },
  match: { i: '🔗', n: 'Spájačka', d: 'Spoj, čo k sebe patrí. Pri skupinách slov ich roztrieďuješ do košíkov.' },
  pex: { i: '🧩', n: 'Pexeso', d: 'Otáčaj kartičky a hľadaj dvojice, ktoré k sebe patria.' },
  time: { i: '⏱️', n: 'Na čas', d: 'Koľko správnych odpovedí stihneš za 60 sekúnd?' },
  test: { i: '📝', n: 'Test', d: 'Skutočný test: 10 otázok bez pomôcok a bez nápovedy. Správne odpovede a vysvetlenia uvidíš až na konci.' }
};
const AVAIL = {};
function avail(t) {
  if (!AVAIL[t.id]) { let pairs = !!t.pex; for (let i = 0; i < 3 && !pairs; i++) pairs = !!pexesoPairs(t); AVAIL[t.id] = { pairs, match: pairs || t.type === 'cat' }; }
  return AVAIL[t.id];
}
const modeOk = (t, m) => m === 'pex' ? avail(t).pairs : m === 'match' ? avail(t).match : true;

/* ===== Vlastné pozadie ===== */
const PAGE_BG = [['auto', 'Základná', '', ''], ['ruzova', 'Ružová', '#FFE4EE', '#3A1B33'], ['modra', 'Modrá', '#DFEBFF', '#152242'], ['matova', 'Mätová', '#D8F5E9', '#12302A'], ['fialova', 'Fialová', '#EAE2FF', '#2A1D4A'], ['zlta', 'Žltá', '#FFF2C7', '#30280F'], ['broskyna', 'Broskyňová', '#FFE5D4', '#33211A'], ['siva', 'Sivá', '#EEF0F5', '#1A1C25'], ['biela', 'Biela', '#FFFFFF', '#FFFFFF', 'light'], ['kremova', 'Krémová', '#FBF3E1', '#FBF3E1', 'light'], ['cierna', 'Čierna', '#000000', '#000000', 'dark'], ['tyrkys', 'Tyrkysová', '#D2F3F1', '#0F2E2E'], ['levandula', 'Levanduľová', '#E9E4F7', '#241F3A'], ['koral', 'Koralová', '#FFD9D2', '#3A1C1C'], ['limetka', 'Limetková', '#EAF7C8', '#25300F'], ['zapad', 'Západ slnka', 'linear-gradient(160deg,#FFE1B8,#FFC4DD)', 'linear-gradient(160deg,#3A2416,#3A1B33)'], ['ocean', 'Oceán', 'linear-gradient(160deg,#CFF6F1,#D5E2FF)', 'linear-gradient(160deg,#0F2E2E,#1A2148)'], ['cukrik', 'Cukrík', 'linear-gradient(160deg,#FFE0F0,#E2DEFF)', 'linear-gradient(160deg,#3A1B33,#241C4A)'], ['les', 'Les', 'linear-gradient(160deg,#EAF7C8,#CDF1E6)', 'linear-gradient(160deg,#25300F,#10302E)'], ['duha', 'Dúha', 'linear-gradient(135deg,#FFE0E6,#FFF1C7,#DDF6E6,#DCE8FF,#EDE2FF)', 'linear-gradient(135deg,#3A1B26,#33280F,#12301F,#152242,#2A1D4A)']];
function applyPageBg() { const c = PAGE_BG.find(x => x[0] === (DATA.settings.bgc || 'auto')) || PAGE_BG[0]; const st = document.documentElement.style; if (c[0] === 'cierna') { st.setProperty('--topoc', '#fff'); st.setProperty('--topoo', '.14'); } else { st.removeProperty('--topoc'); st.removeProperty('--topoo'); } if (c[0] === 'auto') { st.removeProperty('--pg'); return; } st.setProperty('--pg', isDark() ? c[3] : c[2]); }
const isDark = () => { const t = document.documentElement.dataset.theme; return t === 'dark' || (t !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches); };
function applyRoom() {
  const p = P(); const on = false; applyPageBg();
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
  return `${topbar('room-back')}<main class="view"><h1 style="font-size:2rem">Moje pozadie</h1><p class="muted b">Navrhni si vlastné pozadie: vyber farby, vzor a nalep nálepky. Ukáže sa za tvojou postavičkou.</p><div id="dsgn" style="display:flex;flex-direction:column;gap:12px">${designerHTML()}</div><button class="btn primary block" data-a="room-back">Hotovo</button></main>`;
};

/* ===== Pohľady ===== */
const VIEWS = {}, AFTER = {};
VIEWS.learn = () => {
  const p = P(); const dd = p.dailyDone === today();
  const card = k => { const ts = SUBJECTS[k].topics.filter(t => t.g === p.grade); const st = ts.reduce((a, t) => a + (p.topics[t.id]?.stars || 0), 0); const max = ts.length * 3; const d = { mat: ['1+2', 'Počty, násobilka, geometria, slovné úlohy', '➗'], sjl: ['Aa', 'Písmená, y/i, vybrané slová, slovné druhy', '✏️'], prv: ['🌍', '🌿 Príroda · 🗺️ Slovensko a svet · 🇬🇧 Angličtina', '🔭'] }[k]; return `<button class="card lsubj ${k} press" data-a="subject" data-s="${k}"><span class="big">${d[0]}</span><span class="lt"><b>${SUBJECTS[k].name}</b><span>${d[1]}</span><span class="pbar"><i style="width:${max ? st / max * 100 : 0}%"></i></span><small>⭐ ${st} / ${max} hviezd · ${ts.length} tém</small></span><span class="deco">${d[2]}</span></button>`; };
  return `${topbar()}<main class="view pop-in"><div><h1 style="font-size:2rem">Učenie</h1><p class="muted b">Vyber si predmet. Učivo je pre ${p.grade}. ročník, iný ročník si vyberieš v predmete.</p></div>${card('mat')}${card('sjl')}${card('prv')}
  ${reviewCard(p)}
  <div class="sec"><h2>Ďalšie učenie</h2></div>
  <div class="tiles2 ltiles"><button class="card tile2 press" data-a="nav" data-v="reads"><span class="i">📖</span><b>Čítanka</b><span>Čítaj príbehy nahlas</span></button><button class="card tile2 press" data-a="nav" data-v="write"><span class="i">✍️</span><b>${p.grade <= 1 ? 'Moje prvé čiary' : 'Písanie'}</b><span>${p.grade <= 1 ? 'Obťahuj čiary, tvary a písmená' : 'Píš prstom písmená a čísla'}</span></button><button class="card tile2 press" data-a="nav" data-v="dict"><span class="i">✏️</span><b>Diktát</b><span>Počúvaj a píš bez chýb</span></button><button class="card tile2 press" data-a="daily"><span class="i">${dd ? '✅' : '🎯'}</span><b>Denná výzva</b><span>${dd ? 'Dnes splnená' : 'Mix otázok · +50 bodov'}</span></button><button class="card tile2 press" data-a="nav" data-v="notes"><span class="i">📸</span><b>Moje poznámky</b><span>Odfoť zošit, dostaneš kvíz</span></button><button class="card tile2 press aitile" data-a="nav" data-v="chat"><span class="i">🧸</span><b>AI Bystrík</b><span>${CHAT_ON() ? 'Opýtaj sa, čomu nerozumieš' : 'Treba zapnúť v rodičovskom účte'}</span></button></div>
  ${homeBoard(p)}</main>${nav('learn')}`;
};
/* --- obchod --- */
let SHOPCAT = 'all', SHOPSEL = null;
const SHOPCATS = [['all', 'Všetko'], ['top', '👕 Oblečenie'], ['shoes', '👟 Topánky'], ['acc', '🎩 Doplnky']];
function shopItems(p) { const out = []; for (const c of ['top', 'shoes', 'acc']) for (const it of CATALOG[c]) if (it.price && (!it.g || it.g === p.av.gender)) out.push([c, it]); return out.sort((a, b) => a[1].price - b[1].price); }
const SHOP_DAYS = 2, DAYMS = 86400000;
function shopPeriod() { const d = new Date(); return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAYMS / SHOP_DAYS); }
function shopMs() { const d = new Date(); const now = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds()); return Math.max(0, (shopPeriod() + 1) * SHOP_DAYS * DAYMS - now); }
function cdHTML() { let t = Math.floor(shopMs() / 1000); const dd = Math.floor(t / 86400); t %= 86400; const hh = Math.floor(t / 3600); t %= 3600; const mm = Math.floor(t / 60), ss = t % 60; const b = (v, l) => `<span class="cdb"><b>${String(v).padStart(2, '0')}</b><small>${l}</small></span>`; return b(dd, plural(dd, 'deň', 'dni', 'dní')) + b(hh, 'hod') + b(mm, 'min') + b(ss, 'sek'); }
AFTER.shop = () => { TIMERS.push(setInterval(() => { const e = $('#shopcd'); if (!e) return; if (shopMs() <= 0) return render(null); e.innerHTML = cdHTML(); const s = e.querySelector('.cdb:last-child b'); if (s) { s.classList.remove('tick'); void s.offsetWidth; s.classList.add('tick'); } }, 1000)); };
function shopLeft() { const d = new Date(); const now = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes()); const ms = (shopPeriod() + 1) * SHOP_DAYS * DAYMS - now; const h = Math.max(1, Math.ceil(ms / 3600000)); return h >= 24 ? `${Math.floor(h / 24)} ${plural(Math.floor(h / 24), 'deň', 'dni', 'dní')} a ${h % 24} h` : `${h} h`; }
function shopPremium(p) { const rnd = seeded('prem' + shopPeriod() + p.id); return shopItems(p).filter(([, it]) => it.price >= 200 && !p.owned.includes(it.sid)).sort(() => rnd() - .5).slice(0, 2); }
function shopOffer(p) {
  const rnd = seeded('shop' + shopPeriod() + p.id); const all = shopItems(p).filter(([, it]) => it.price < 200 && !p.owned.includes(it.sid)).sort(() => rnd() - .5);
  const out = []; for (const c of ['top', 'shoes', 'acc']) { const x = all.find(([cc]) => cc === c); if (x) out.push(x); }
  for (const x of all) { if (out.length >= 6) break; if (!out.includes(x)) out.push(x); }
  return out.sort((a, b) => a[1].price - b[1].price);
}
VIEWS.shop = () => {
  const p = P(); const list = shopOffer(p); const prem = shopPremium(p);
  const itemCard = ([c, it], i) => { const own = p.owned.includes(it.sid); const worn = p.av[c] === it.id; const can = (p.coins || 0) >= it.price; const sel = SHOPSEL === it.sid; const pr = it.price >= 200; return `<div class="card shopitem ${own ? 'own' : ''} ${pr ? 'premium' : ''}" style="animation:popUp .4s ${i * 35}ms backwards">${pr ? '<span class="prem">👑 PRÉMIUM</span>' : ''}<span class="th">${itemThumb(c, it, p.av)}</span><b>${it.n}</b>${own ? (worn ? '<span class="tag">Máš to oblečené ✓</span>' : `<button class="btn small good" data-a="shop-wear" data-c="${c}" data-i="${it.id}">Obliecť</button>`) : sel ? `<button class="btn small primary" data-a="buy" data-c="${c}" data-i="${it.id}">Áno, kúpiť!</button>` : `<button class="btn small ${can ? 'sun' : ''}" data-a="buy-ask" data-c="${c}" data-i="${it.id}" ${can ? '' : 'aria-disabled="true"'}>${COIN} ${it.price}</button>`}${!own && !can ? `<span class="muted b" style="font-size:.75rem">Chýba ${it.price - (p.coins || 0)}</span>` : ''}</div>`; };
  return `${topbar()}<main class="view"><section class="card shophead"><span class="coinbig">${COIN}</span><div><span class="eyebrow">Tvoje slniečka</span><b>${p.coins || 0}</b><span class="muted b" style="font-size:.85rem;display:block">Slniečka získaš za každú správnu odpoveď, hry, úlohy a čítanie.</span></div></section>
  <section class="card shoptimer"><div class="sthead"><span class="hourglass">⏳</span><div><b>Nový tovar o:</b><span class="muted b" style="display:block;font-size:.8rem">Ponuka sa mení každé ${SHOP_DAYS} dni. Čo si kúpiš, nájdeš v šatníku.</span></div></div><div class="cd" id="shopcd">${cdHTML()}</div></section><p class="muted b" style="font-size:.82rem">Slniečka sa nekupujú za peniaze, získaš ich učením.</p>
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
      : MIC_BLOCKED ? `${window.claude && window.claude.use ? '' : '<button class="btn primary block recbtn" data-a="mic-retry">🎤 Skúsiť mikrofón znova</button>'}<button class="btn ${window.claude && window.claude.use ? 'primary' : ''} block" data-a="dikt-open">🎙️ Nahrať cez diktafón</button><button class="btn block" data-a="rec-pick">📂 Pridať hotovú nahrávku</button><button class="linkbtn" data-a="rd-done">Prečítal(a) som bez nahrávky</button>`
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
  { h: 'Ahoj, som Bystrík! 🧸', t: 'Ukážem ti, kde čo nájdeš. Trvá to len minútku.', v: 'home' },
  { h: 'Toto si ty', t: 'Keď na seba ťukneš, zamávaš. Vzhľad si zmeníš v šatníku.', v: 'home', f: '.stage' },
  { h: 'Denná odmena', t: 'Každý deň ťa tu v časti Dnes čaká darček. Stačí naň ťuknúť.', v: 'home', f: '.drcard' },
  { h: 'Dnešné úlohy', t: 'Tri úlohy na dnes. Za splnené dostaneš body a slniečka.', v: 'home', f: '.tasks' },
  { h: 'Predmety', t: 'Tu sa učíš matematiku, slovenčinu a prehľad.', v: 'home', f: '.subjects' },
  { h: 'Ďalšie učenie', t: 'Čítanka, písanie prstom, denná výzva a tvoje poznámky.', v: 'learn', f: '.ltiles' },
  { h: 'Hry a súboj', t: 'Minihry na oddych a súboj s kamarátom.', v: 'games', f: '.gamelist' },
  { h: 'Priatelia', t: 'Pridaj si kamaráta jeho kódom a píšte si.', v: 'home', f: '.nav [data-v="friends"]' },
  { h: 'Slniečka a obchod', t: 'Za slniečka si kúpiš nové oblečenie.', v: 'home', f: '.coinchip' },
  { h: 'Šatník', t: 'Tu sa oblečieš a zmeníš si účes.', v: 'home', f: '.nav [data-v="wardrobe"]' },
  { h: 'Pre rodičov', t: 'V nastaveniach hore je Rodičovský účet. Rodičia tam vidia, ako sa ti darí.', v: 'settings', f: '.parentcard' },
  { h: 'Hotovo! 🚀', t: 'Poďme sa spolu učiť. Návod nájdeš kedykoľvek v nastaveniach.', v: 'home' }
];
const PGUIDE = [
  { h: 'Rodičia, toto je pre vás 👋', t: 'Vytvorte si rodičovský účet. Uvidíte v ňom, ako sa dieťaťu darí, a nastavíte pravidlá. Ukážem vám, kde je.', v: 'home' },
  { h: 'Krok 1: Nastavenia', t: 'Ťuknite hore na ozubené koliesko. Tlačidlo Ďalej vás tam vezme.', v: 'home', f: '.top [data-v="settings"]' },
  { h: 'Krok 2: Rodičovský účet', t: 'Je to táto karta úplne hore. Zadáte meno, denný cieľ a PIN, aby sa sem nedostali deti.', v: 'settings', f: '.parentcard', go: 'Vytvoriť účet →' }
];
function endPGuide() { clearTut(); DATA.pguideSeen = 1; save(); if (!DATA.parent.pin) { sfx('tap'); PSEL = DATA.current; PTAB = 'over'; go('parent', {}, 'f'); } }
function parentNeedCard() { if (DATA.parent && DATA.parent.pin) return ''; return `<button class="card pneed press" data-a="pguide"><span class="ic">👨‍👩‍👧</span><span><b>Rodičia: vytvorte si účet</b><span class="b" style="font-size:.9rem">Trvá to minútu. Ťuknite a prevediem vás.</span></span><em>!</em></button>`; }
function a2hsCard() { if ((window.claude && window.claude.use) || isStandalone() || DATA.a2hsHide) return ''; const ios = /iphone|ipad|ipod/i.test(navigator.userAgent); return `<div class="card a2card"><span class="ic">📲</span><span><b>Daj si Bystríka na plochu</b><span class="b" style="font-size:.86rem">${A2HS ? 'Bude mať vlastnú ikonku a otvorí sa na celú obrazovku.' : ios ? 'V Safari ťukni dole na Zdieľať a zvoľ „Pridať na plochu“.' : 'V ponuke prehliadača ⋮ zvoľ „Pridať na plochu“ alebo „Inštalovať aplikáciu“.'}</span>${A2HS ? '<button class="btn small primary" data-a="install" style="margin-top:6px">📲 Pridať na plochu</button>' : ''}</span><button class="tutx" data-a="a2hs-hide" aria-label="Skryť">✕</button></div>`; }
const PTOUR = [
  { h: 'Vitajte v rodičovskom účte', t: 'Krátko vám ukážem, čo tu nájdete. Sú to štyri časti v spodnej lište.', pt: 'over' },
  { h: 'Spodná lišta', t: 'Prehľad, Zadať úlohu, Čítanka a Nastavenia. Prepínate ich dole.', pt: 'over', f: '.pnav' },
  { h: 'Týždenný prehľad', t: 'Koľko dní sa dieťa učilo, úspešnosť a tip, čo skúsiť tento týždeň.', pt: 'over', f: '.weekcard' },
  { h: 'Podrobnosti', t: 'Ďalšie údaje sú zbalené. Ťuknutím na riadok ho rozbalíte.', pt: 'over', f: '.pacc' },
  { h: 'Úlohy pre dieťa', t: 'Vyberte tému a odmenu. Keď dieťa úlohu splní, slniečka dostane samo.', pt: 'tasks', f: '.ptform' },
  { h: 'Čítanie', t: 'Tu si vypočujete nahrávky z čítanky, ohodnotíte ich a dieťa odmeníte.', pt: 'read', f: '.pcard' },
  { h: 'Nastavenia', t: 'Ročník, čo je povolené, pripomienka, priatelia, účet aj PIN. Každá skupina sa rozbalí ťuknutím.', pt: 'set', f: '.pacc' },
  { h: 'Späť k dieťaťu', t: 'Šípkou vľavo hore účet zamknete a vrátite telefón dieťaťu.', pt: 'over', f: '.top .iconbtn' }
];
let GUIDE = null;
function showGuide(steps, i, end) {
  const st = steps[i];
  if (st.v && UI.view !== st.v) { GUIDE = { steps, end, cur: st.t, nav: true }; go(st.v, {}, 'f'); return setTimeout(() => showGuide(steps, i, end), 380); }
  if (st.pt && UI.view === 'parent' && PTAB !== st.pt) { PTAB = st.pt; render(null); scrollTo(0, 0); }
  clearTut(); GUIDE = { steps, end, cur: (st.h ? st.h + '. ' : '') + st.t, i };
  const el = st.f ? $(st.f) : null; const fixed = el && (el.closest('.nav') || el.closest('.top'));
  if (el) { el.classList.add('tutfocus'); if (!fixed) el.scrollIntoView({ behavior: 'auto', block: 'center' }); }
  const w = document.createElement('div'); w.className = 'tutsheet coach'; const last = i + 1 >= steps.length;
  w.innerHTML = `<div class="in"><div class="tuthead"><span class="tutstep">${i + 1} / ${steps.length}</span><div class="tutbar"><i style="width:${(i + 1) / steps.length * 100}%"></i></div><button class="tutx" data-a="tut-skip" aria-label="Preskočiť návod">Preskočiť ✕</button></div><div class="tutrow">${st.e && !st.h ? `<span class="tutemoji">${st.e}</span>` : `<span class="tutbear">${owlSvg('')}</span>`}<div class="tuttxt">${st.h ? `<b>${st.h}</b>` : ''}<p>${st.t}</p></div><button class="iconbtn press tutsay" data-a="tut-say" aria-label="Prečítaj znova">🔊</button></div><div class="rowbtns" style="grid-template-columns:${i ? '1fr 2fr' : '1fr'}">${i ? `<button class="btn" data-a="tut-next" data-i="${i - 1}">← Späť</button>` : ''}<button class="btn primary" data-a="tut-next" data-i="${i + 1}">${last ? (st.go || 'Rozumiem! 👍') : 'Ďalej →'}</button></div></div>`;
  document.body.appendChild(w);
  const place = () => { if (!el) { w.classList.add('mid'); return; } const r = el.getBoundingClientRect(); const h = w.offsetHeight; const below = innerHeight - r.bottom, above = r.top; w.classList.remove('mid'); if (below >= h + 24 || below >= above) { w.style.top = Math.min(innerHeight - h - 10, r.bottom + 18) + 'px'; w.style.bottom = 'auto'; w.classList.add('pup'); } else { w.style.top = Math.max(10, r.top - h - 18) + 'px'; w.style.bottom = 'auto'; w.classList.add('pdown'); } const ar = w.querySelector('.tutarrow') || w.appendChild(Object.assign(document.createElement('i'), { className: 'tutarrow' })); const wr = w.getBoundingClientRect(); ar.style.left = Math.max(26, Math.min(wr.width - 26, r.left + r.width / 2 - wr.left)) + 'px'; };
  place(); setTimeout(place, 60); say(GUIDE.cur); sfx('pop');
}
function endPTour() { clearTut(); DATA.parent.tour = 1; save(); PTAB = 'over'; if (UI.view === 'parent') render(null); toast('Návod nájdete znova v Nastaveniach rodičovského účtu.'); }
function endTour() { clearTut(); const p = P(); if (p) { p.tourDone = true; save(); } if (UI.view !== 'home') go('home', {}, 'b'); confetti(120, .3); if (!(DATA.parent && DATA.parent.pin) && !DATA.pguideSeen) setTimeout(() => { if (UI.view === 'home' && !GUIDE) showGuide(PGUIDE, 0, endPGuide); }, 1600); }
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
function wavRecorder(stream) {
  const AC2 = window.AudioContext || window.webkitAudioContext; const ctx = new AC2(); const src = ctx.createMediaStreamSource(stream); const node = ctx.createScriptProcessor(4096, 1, 1); const mute = ctx.createGain(); mute.gain.value = 0; const chunks = []; let len = 0;
  node.onaudioprocess = e => { const d = e.inputBuffer.getChannelData(0); chunks.push(new Float32Array(d)); len += d.length; }; src.connect(node); node.connect(mute); mute.connect(ctx.destination); if (ctx.state === 'suspended') ctx.resume();
  const rec = { state: 'recording', mimeType: 'audio/wav', onstop: null, stop() { if (rec.state === 'inactive') return; rec.state = 'inactive'; try { node.disconnect(); src.disconnect(); } catch (e) { }
      const rate = ctx.sampleRate, step = Math.max(1, Math.round(rate / 16000)), outRate = Math.round(rate / step); const n = Math.floor(len / step); const buf = new ArrayBuffer(44 + n * 2); const v = new DataView(buf); const W = (o, t) => { for (let k = 0; k < t.length; k++) v.setUint8(o + k, t.charCodeAt(k)); };
      W(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); W(8, 'WAVE'); W(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, outRate, true); v.setUint32(28, outRate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); W(36, 'data'); v.setUint32(40, n * 2, true);
      let o = 44, ci = 0, off = 0; for (let k = 0; k < n; k++) { let idx = k * step - off; while (ci < chunks.length && idx >= chunks[ci].length) { off += chunks[ci].length; idx -= chunks[ci].length; ci++; } const x = ci < chunks.length ? Math.max(-1, Math.min(1, chunks[ci][idx])) : 0; v.setInt16(o, x < 0 ? x * 0x8000 : x * 0x7FFF, true); o += 2; }
      try { ctx.close(); } catch (e) { } rec.blob = new Blob([buf], { type: 'audio/wav' }); rec.onstop && rec.onstop(); } };
  return rec;
}
async function recStart() {
  const inClaude = !!(window.claude && window.claude.use);
  try { speechSynthesis.cancel(); } catch (e) { }
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { MICERR = 'no mediaDevices'; MIC_BLOCKED = true; render(null); return inClaude ? openDiktafon() : micHelp('nosupport'); }
  try {
    let stream; try { stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }); } catch (e1) { if (e1 && (e1.name === 'NotAllowedError' || e1.name === 'SecurityError' || e1.name === 'PermissionDeniedError')) throw e1; stream = await navigator.mediaDevices.getUserMedia({ audio: true }); }
    const done = blob => { stream.getTracks().forEach(t => t.stop()); gotRecording(blob); };
    let mr = null, own = false;
    if (window.MediaRecorder) { try { mr = new MediaRecorder(stream); } catch (e) { mr = null; } }
    if (mr) { REC = { mr, chunks: [], stream, t0: Date.now() }; mr.ondataavailable = e => { if (e.data && e.data.size) REC.chunks.push(e.data); }; mr.onstop = () => { const blob = new Blob(REC.chunks, { type: mr.mimeType || 'audio/webm' }); if (!blob.size && !own) { toast('Nahrávka je prázdna. Skús to ešte raz a hovor hlasnejšie.'); } done(blob); }; try { mr.start(250); } catch (e) { mr = null; } }
    if (!mr) { own = true; const wr = wavRecorder(stream); REC = { mr: wr, chunks: [], stream, t0: Date.now() }; wr.onstop = () => done(wr.blob); }
    MIC_BLOCKED = false; RD.recording = true; render(null); sfx('pop');
    TIMERS.push(setInterval(() => { const e = $('#rectime'); if (e && REC) e.textContent = Math.round((Date.now() - REC.t0) / 1000) + ' s'; }, 500));
  } catch (e) {
    MICERR = String((e && e.name) || '') + (e && e.message ? ': ' + String(e.message).slice(0, 60) : '');
    MIC_BLOCKED = true; render(null);
    if (inClaude) return openDiktafon();
    micHelp(e && (e.name === 'NotAllowedError' || e.name === 'SecurityError' || e.name === 'PermissionDeniedError') ? 'denied' : e && (e.name === 'NotFoundError' || e.name === 'DevicesNotFoundError') ? 'nomic' : e && e.name === 'NotReadableError' ? 'busy' : 'other');
  }
}
let MICERR = '';
function micHelp(kind) {
  closeSheet(); sfx('no'); const inapp = /FBAN|FBAV|FB_IAB|Instagram|Messenger|TikTok|musical_ly|Snapchat|Line\/|wv\)/i.test(navigator.userAgent); if (inapp && kind !== 'denied') kind = 'inapp';
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent), android = /Android/.test(navigator.userAgent);
  const txt = {
    denied: ['🔒 Mikrofón je zablokovaný', 'Telefón si zapamätal, že táto stránka nesmie používať mikrofón. Povoľte ho takto:', ios ? ['V Safari ťuknite vľavo hore na <b>aA</b> (alebo ikonu vedľa adresy).', 'Vyberte <b>Nastavenia webovej stránky</b>.', 'Pri <b>Mikrofón</b> zvoľte <b>Povoliť</b>.', 'Ak to nepomôže: Nastavenia telefónu → Safari → Mikrofón → Povoliť.'] : android ? ['V Chrome ťuknite vedľa adresy na ikonu <b>🔒</b> (alebo ⓘ).', 'Ťuknite na <b>Povolenia</b> alebo <b>Nastavenia stránky</b>.', 'Pri <b>Mikrofón</b> zvoľte <b>Povoliť</b>.', 'Ak to nepomôže: Nastavenia telefónu → Aplikácie → Chrome → Povolenia → Mikrofón → Povoliť.'] : ['Ťuknite na ikonu <b>🔒</b> vedľa adresy stránky.', 'Pri <b>Mikrofón</b> zvoľte <b>Povoliť</b>.', 'Obnovte stránku.']],
    nomic: ['🎤 Nenašiel sa mikrofón', 'Zariadenie nemá zapojený alebo zapnutý mikrofón.', ['Skontrolujte, či máte mikrofón alebo slúchadlá s mikrofónom.', 'Potom to skúste znova.']],
    busy: ['🎤 Mikrofón práve používa iná aplikácia', 'Napríklad hovor, nahrávanie alebo iná stránka.', ['Zavrite ostatné aplikácie, ktoré nahrávajú.', 'Potom to skúste znova.']],
    inapp: ['🎤 Tu sa nahrávať nedá', 'Apka je otvorená vnútri inej aplikácie (napríklad Messenger, Instagram alebo TikTok). Tá mikrofón nepovolí.', ['Ťuknite hore na <b>⋮</b> alebo <b>⋯</b>.', 'Zvoľte <b>Otvoriť v prehliadači</b> (Chrome alebo Safari).', 'Tam sa prihláste a nahrávanie pôjde.']],
    nosupport: ['🎤 Tento prehliadač nevie nahrávať', 'Skúste otvoriť apku v inom prehliadači.', [ios ? 'Na iPhone použite Safari (aktuálnu verziu).' : 'Použite Google Chrome (aktuálnu verziu).']],
    other: ['🎤 Mikrofón sa nepodarilo zapnúť', 'Skúste to ešte raz. Ak to nepôjde, zatvorte a znova otvorte prehliadač.', ['Skontrolujte, či má prehliadač povolený mikrofón v nastaveniach telefónu.']]
  }[kind];
  const w = document.createElement('div'); w.id = 'sheetwrap';
  w.innerHTML = `<div class="scrim" data-a="close-sheet"></div><div class="sheet" role="dialog" aria-label="Pomoc s mikrofónom"><div class="grab"></div><h2>${txt[0]}</h2><p class="muted b" style="font-size:.9rem;margin-bottom:10px">${txt[1]}</p><div class="dsteps">${txt[2].map((t, i) => `<div><span>${i + 1}</span><p>${t}</p></div>`).join('')}</div><button class="btn primary block" style="margin-top:12px" data-a="mic-retry">🔁 Skúsiť znova</button><button class="btn block" style="margin-top:10px" data-a="dikt-open">🎙️ Radšej cez diktafón</button><p class="muted b" style="font-size:.78rem;margin-top:8px;text-align:center">Tip: toto okno je pre rodiča. Dieťa môže zatiaľ text prečítať a ťuknúť „Prečítal(a) som bez nahrávky“.</p><p class="muted" style="font-size:.7rem;text-align:center;opacity:.7">Kód pre podporu: ${kind}${MICERR ? ' · ' + esc(MICERR) : ''}${window.isSecureContext === false ? ' · nezabezpečené' : ''}</p></div>`;
  document.body.appendChild(w);
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
const OB_HELLO = 'Ahoj! Ja som medvedík Bystrík. Spolu sa budeme učiť matiku, slovinu aj veci zo sveta. Za učenie dostaneš body, slniečka a nové oblečenie. Poďme na to!';
VIEWS.onboard = () => {
  const s = OB.step; const dots = `<div class="dots">${[0, 1, 2, 3, 4, 5, 6].map(i => `<i class="${i === s ? 'on' : ''}"></i>`).join('')}</div>`;
  let body = '';
  if (s === 0) body = `<div style="display:grid;place-items:center">${owlSvg()}</div><h1 style="font-size:2.4rem;text-align:center">Ahoj! Ja som medvedík Bystrík.</h1><p class="muted b" style="text-align:center">Spolu sa naučíme matiku a slovinu. Za každý level dostaneš nové oblečenie, topánky, účesy a ďalšie odmeny pre svoju postavičku.</p><button class="btn primary block" data-a="ob-next">Poďme na to!</button>${DATA.profiles.length ? '<button class="btn block" data-a="nav" data-v="profiles">Už mám hráča</button>' : ''}`;
  if (s === 1) body = `<span class="eyebrow">${OB.edit ? 'Úvodné nastavenie · ' : ''}Krok 1 z 6</span><h1 style="font-size:2rem">Ako sa voláš?</h1><input class="field" id="ob-name" maxlength="16" autocomplete="off" placeholder="Tvoje meno" value="${esc(OB.name)}"><button class="btn primary block" data-a="ob-name">Ďalej</button>`;
  if (s === 2) body = `<span class="eyebrow">Krok 2 z 6</span><h1 style="font-size:2rem">Si dievča alebo chlapec?</h1><div class="pickg">${['d', 'c'].map(g => `<button class="card press ${OB.gender === g ? 'on' : ''}" data-a="ob-g" data-g="${g}">${avatarSvg(defaultAvatar(g), { cls: 'idle', noBg: true, noPet: true })}${g === 'd' ? 'Dievča' : 'Chlapec'}</button>`).join('')}</div>`;
  if (s === 3) body = `<span class="eyebrow">Krok 3 z 6</span><h1 style="font-size:2rem">Do ktorej triedy chodíš?</h1><div class="grades">${[1, 2, 3, 4].map(g => `<button class="card press gr${g} ${OB.grade === g ? 'on' : ''}" data-a="ob-grade" data-g="${g}"><span class="gre">${['🐣', '🐥', '🦊', '🦁'][g - 1]}</span><b>${g}.</b>ročník</button>`).join('')}</div>`;
  if (s === 4) body = `<span class="eyebrow">Krok 4 z 6</span><h1 style="font-size:2rem">Vyber si zvieratko</h1><p class="muted b">Bude ťa sprevádzať v šatníku a na obrázkoch.</p><div class="petpick pop-in">${CATALOG.pet.filter(x => (!x.g || x.g === OB.gender) && (OB.edit ? unlocked(x, P()) : (!x.lvl && !x.streak && !x.price))).map(x => `<button class="card press ${OB.av.pet === x.id ? 'on' : ''}" data-a="ob-pet" data-i="${x.id}">${x.e}<span>${x.n}</span></button>`).join('')}</div><label class="b" for="ob-petname">Ako sa bude volať?</label><input class="field" id="ob-petname" maxlength="14" autocomplete="off" placeholder="Meno zvieratka" value="${esc(OB.av.petName || petName(OB.av))}"><button class="btn primary block" data-a="ob-pet-next">Ďalej</button><p class="muted b" style="font-size:.9rem">Ďalšie zvieratká, napríklad pandu, líštičku alebo dráčika, si odomkneš neskôr.</p>`;
  if (s === 5) body = `<span class="eyebrow">Krok 5 z 6</span><h1 style="font-size:2rem">Aký účes sa ti páči?</h1><div class="card" style="display:grid;grid-template-columns:120px 1fr;gap:10px;align-items:center;padding:8px"><div id="ob-fig">${avatarSvg(OB.av, { cls: 'idle' })}</div><div class="items" style="grid-template-columns:repeat(2,1fr)">${CATALOG.hair.filter(h => h.g === OB.gender && (OB.edit ? unlocked(h, P()) : !h.lvl)).map(h => `<button class="item press ${OB.av.hair === h.id ? 'on' : ''}" data-a="ob-hair" data-i="${h.id}">${itemThumb('hair', h, OB.av)}<span class="lab">${h.n}</span></button>`).join('')}</div></div><p class="muted b">Farby vlasov aj oblečenia si neskôr zmeníš v šatníku. Každý kúsok môže mať inú farbu.</p><button class="btn primary block" data-a="ob-to-room">Ďalej</button>`;
  if (s === 6) { DS = { room: OB.room, av: OB.av, sel: null, tab: 'stk', lockP: OB.edit ? P() : { xp: 0, streak: { best: 0 } }, save: null }; body = `<span class="eyebrow">${OB.edit ? 'Úvodné nastavenie · ' : ''}Krok 6 z 6</span><h1 style="font-size:2rem">Navrhni si pozadie</h1><p class="muted b">Vyber farby a nalep nálepky. Bude za tvojou postavičkou aj za celou apkou.</p><div id="dsgn" style="display:flex;flex-direction:column;gap:12px">${designerHTML()}</div><button class="btn primary block" data-a="ob-done">${OB.edit ? 'Uložiť zmeny' : 'Hotovo, začíname!'}</button>`; }
  if (s === 0) body = `<div class="obhero"><div class="floaties" aria-hidden="true">${['📚', '✏️', '⭐', '🎨', '🔢', '🅰️', '🌍', '🎈', '🧩', '🏆'].map((e, i) => `<span style="left:${(i * 11 + 4) % 92}%;animation-delay:-${i * 1.1}s;animation-duration:${7 + (i % 4)}s">${e}</span>`).join('')}</div><button class="herobear" data-a="ob-say" aria-label="Medvedík Bystrík">${owlSvg('')}<span class="wavehand">👋</span><span class="herobub">Ťukni na mňa!</span></button><h1 class="logo" aria-label="Bystrík">${'Bystrík'.split('').map((c, i) => `<span style="animation-delay:${.25 + i * .08}s">${c}</span>`).join('')}</h1><p class="tagline">Hravé učenie pre 1. až 4. ročník</p><div class="feat">${[['🔢', 'Matika'], ['📝', 'Slovina'], ['🌍', 'Prehľad'], ['🎮', 'Hry'], ['👕', 'Šatník'], ['🏆', 'Odmeny']].map(([e, n], i) => `<span style="animation-delay:${.85 + i * .08}s">${e} ${n}</span>`).join('')}</div></div><button class="btn primary block glowbtn" data-a="ob-next">Poďme na to! 🚀</button>${DATA.profiles.length ? '<button class="btn block" data-a="nav" data-v="profiles">👥 Už mám hráča</button>' : ''}`;
  else { body = body.replace(/<span class="eyebrow">[^<]*(?:<[^>]*>[^<]*)*?<\/span><h1[^>]*>.*?<\/h1>/, ''); body = `<div class="obtop"><div class="obprog"><i style="width:${(s > 4 ? s - 1 : s) / 5 * 100}%"></i></div><span class="eyebrow">${OB.edit ? 'Úvodné nastavenie · ' : ''}Krok ${s > 4 ? s - 1 : s} z 5</span></div><div class="obsay"><button class="obbear" data-a="ob-say" aria-label="Prečítaj znova">${owlSvg('')}</button><div class="bub">${OB_T[s]}</div></div>` + body; }
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
    <div class="nameplate">${esc(p.name)}<small>${title(li.L)}</small>${pet.e ? `<small>${pet.e} ${esc(petName(p.av))}</small>` : ''}</div></section>`;
  const wk = ['Po', 'Ut', 'St', 'Št', 'Pi', 'So', 'Ne']; const now = new Date(); const dow = (now.getDay() + 6) % 7;
  const week = wk.map((n, i) => { const dd = new Date(); dd.setDate(now.getDate() - dow + i); const k = dkey(dd); const on = !!p.days[k]; return `<span><i class="${on ? 'on' : ''} ${i === dow ? 'today' : ''}" style="animation-delay:${i * 50}ms">${on ? '🔥' : ''}</i>${n}</span>`; }).join('');
  const nextStreak = streakRewards(p.av.gender).find(([, it]) => it.streak > (p.streak.best || 0));
  const streak = `<section class="card streak"><div class="row1"><span class="flame">🔥</span><div style="flex:1"><b class="n">${p.streak.count} ${plural(p.streak.count, 'deň', 'dni', 'dní')} po sebe</b><div class="muted b" style="font-size:.88rem">${p.streak.last === today() ? 'Dnes máš splnené. Príď aj zajtra!' : 'Dnes sa ešte uč, nech séria nevyhasne!'}</div></div></div><div class="week">${week}</div>${nextStreak ? `<div class="b" style="font-size:.88rem">🎁 Pri sérii ${nextStreak[1].streak} dní získaš: ${rewardName(...nextStreak)}</div>` : ''}</section>`;
  const tasks = d.tasks.map(id => { const T = TASKS.find(x => x.id === id); const c = Math.min(T.t, d.cnt[T.k] || 0); const done = c >= T.t, cl = d.claimed.includes(id); return `<div class="task ${cl ? 'done' : ''}"><span class="ck">${cl ? '✓' : T.i}</span><div class="tt">${T.n}<div class="tb"><i style="width:${c / T.t * 100}%"></i></div></div>${cl ? '<span class="xp">Hotovo</span>' : done ? `<button class="claim press" data-a="claim" data-id="${id}">+${T.xp} 🎁</button>` : `<span class="xp">${c}/${T.t}</span>`}</div>`; }).join('');
  const allCl = d.tasks.every(id => d.claimed.includes(id));
  const taskCard = `<section class="card tasks"><div class="sec"><h2>Dnešné úlohy</h2><span class="eyebrow">${d.claimed.length}/3</span></div>${tasks}${allCl && !d.bonus ? `<button class="btn sun block press" data-a="claim-bonus">Všetko splnené! Otvor truhlicu +50 🎁</button>` : allCl ? '<p class="b muted">Super! Zajtra budú nové úlohy.</p>' : '<p class="muted b" style="font-size:.85rem">Keď splníš všetky tri, dostaneš truhlicu s bonusom.</p>'}</section>`;
  const subj = k => { const ts = SUBJECTS[k].topics.filter(t => t.g === p.grade); const st = ts.reduce((s, t) => s + (p.topics[t.id]?.stars || 0), 0); const max = ts.length * 3; return `<button class="card subj ${k} press" data-a="subject" data-s="${k}"><span class="big">${k === 'mat' ? '1+2' : k === 'sjl' ? 'Aa' : '🌍'}</span><h3>${SUBJECTS[k].name}</h3><span class="muted b" style="font-size:.85rem">⭐ ${st} / ${max} hviezd</span><span class="pbar"><i style="width:${max ? st / max * 100 : 0}%"></i></span><span class="deco">${k === 'mat' ? '➗' : k === 'sjl' ? '✏️' : '🔭'}</span></button>`; };
  const dd = p.dailyDone === today();
  const quick = `<div class="quickrow"><button class="card qk press" data-a="rtab-go" data-t="streak"><span class="qi">🔥</span><b>${p.streak.count} ${plural(p.streak.count, 'deň', 'dni', 'dní')}</b><small>${p.streak.last === today() ? 'séria drží' : 'uč sa dnes'}</small></button><button class="card qk press" data-a="nav" data-v="rewards"><span class="qi">🏆</span><b>Odmeny</b><small>Level ${li.L}</small></button><button class="card qk press" data-a="nav" data-v="board"><span class="qi">🥇</span><b>Rebríček</b><small>top 20</small></button><button class="card qk press" data-a="${DATA.parent && DATA.parent.pin ? 'parent-open' : 'pguide'}"><span class="qi">👨‍👩‍👧</span><b>Rodičia</b><small>${DATA.parent && DATA.parent.pin ? 'účet s PIN' : 'vytvoriť účet'}</small></button></div><div class="card tipcard">${owlSvg('')}<p>${pick(TIPS)}</p></div>`;
  return `${topbar()}<main class="view pop-in">${stage}${quick}${parentNeedCard()}${a2hsCard()}
  <div class="sec"><h2>Dnes</h2><span class="eyebrow">${p.grade}. ročník</span></div>
  ${drReady(p) ? `<button class="card drcard press" data-a="dreward"><span class="ic">🎁</span><span><b>Denná odmena čaká!</b><span class="b" style="font-size:.9rem">Ťukni a vyzdvihni si dnešný darček.</span></span><em>!</em></button>` : ''}
  ${reviewCard(p)}
  <button class="card daily press ${dd ? 'done' : ''}" data-a="daily"><span class="ic">${dd ? '✅' : '🎯'}</span><span><b>${dd ? 'Denná výzva splnená!' : 'Denná výzva'}</b><span class="b" style="font-size:.9rem">${dd ? 'Môžeš si ju zahrať znova, len tak pre radosť.' : 'Opakovanie toho, čo si nedávno precvičoval(a), a ľahké otázky o svete · +50 bodov'}</span></span></button>
  ${ptaskCard(p)}${taskCard}
  <div style="display:flex;flex-direction:column;gap:8px"><div class="sec"><h2>Učenie</h2><span class="eyebrow">${p.grade}. ročník</span></div><div class="subjects">${subj('mat')}${subj('sjl')}${subj('prv')}</div><p class="muted b" style="font-size:.85rem">Prehľad: príroda, Slovensko a svet okolo nás a angličtina.</p></div>
  ${homeBoard(p)}
  ${streak}
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
let NOTE = { busy: false, err: '', preview: '' };
function noteTopic(n) { const t = { id: 'note-' + n.id, g: 0, s: 'prv', type: 'qa', name: n.title, icon: '📸', items: () => n.qs.map(x => [x.q, x.a, x.w.join(';'), x.ex || '']) }; TOPIC[t.id] = t; return t; }
function registerNotes() { DATA.profiles.forEach(p => (p.notes || []).forEach(noteTopic)); }
VIEWS.notes = () => {
  const p = P(); const on = CHAT_ON();
  return `${topbar('learn-back')}<main class="view"><div class="nhead"><span class="nb">${bearSvg(NOTE.busy ? '' : 'cheer')}</span><div><h1 style="font-size:1.8rem">Moje poznámky</h1><p class="muted b" style="font-size:.9rem">Odfoť si poznámky zo zošita. Bystrík ich zhrnie do bodov a spraví z nich kvíz alebo test.</p></div></div>
  ${on ? `<div class="nbtns"><button class="btn primary" data-a="note-cam" ${NOTE.busy ? 'disabled' : ''}>📸 Odfotiť poznámky</button><button class="btn" data-a="note-pick" ${NOTE.busy ? 'disabled' : ''}>🖼️ Vybrať fotku</button></div><input type="file" id="notecam" accept="image/*" capture="environment" hidden><input type="file" id="notepick" accept="image/*" hidden>` : `<section class="card" style="padding:14px"><b>🧸 Táto funkcia potrebuje Bystríka (umelú inteligenciu).</b><p class="muted b" style="font-size:.88rem;margin-top:6px">Popros rodičov: ⚙️ → Rodičovský účet → „Zapnúť AI“. Je to zadarmo a návod ich prevedie.</p></section>`}
  ${NOTE.busy ? `<section class="card nbusy">${NOTE.preview ? `<img src="${NOTE.preview}" alt="Fotka poznámok">` : ''}<div><b>Bystrík číta tvoje poznámky…</b><span class="typing"><i></i><i></i><i></i></span><span class="muted b" style="font-size:.82rem">Môže to trvať chvíľku.</span></div></section>` : ''}
  ${NOTE.err ? `<section class="card" style="padding:12px;background:var(--bad-soft)"><b>😕 ${esc(NOTE.err)}</b></section>` : ''}
  ${(p.notes || []).map(n => `<section class="card notecard"><div class="sec"><h2>📸 ${esc(n.title)}</h2><span class="eyebrow">${fmtTime(n.t)}</span></div><ul>${n.summary.map(x => `<li>${esc(x)}</li>`).join('')}</ul><div class="nbtns"><button class="btn small primary" data-a="note-quiz" data-id="${n.id}">❓ Kvíz</button><button class="btn small" data-a="note-test" data-id="${n.id}">📝 Test</button><button class="btn small" data-a="note-del" data-id="${n.id}" aria-label="Vymazať">🗑️</button></div></section>`).join('') || (NOTE.busy ? '' : '<p class="muted b" style="text-align:center">Zatiaľ nemáš žiadne poznámky. Odfoť si prvé! 📒</p>')}
  </main>${nav('learn')}`;
};
AFTER.notes = () => { ['notecam', 'notepick'].forEach(id => { const f = $('#' + id); if (f) f.addEventListener('change', () => { const file = f.files && f.files[0]; if (file) processNote(file); }); }); };
async function shrinkImage(file) {
  try { const url = URL.createObjectURL(file); const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; }); const k = Math.min(1, 1600 / Math.max(img.width, img.height)); const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url); return await new Promise(r => c.toBlob(r, 'image/jpeg', .85)); } catch (e) { return file; }
}
async function processNote(file) {
  const p = P(); NOTE = { busy: true, err: '', preview: '' }; try { NOTE.preview = URL.createObjectURL(file); } catch (e) { } render(null); scrollTo({ top: 0, behavior: 'smooth' });
  const fail = msg => { NOTE = { busy: false, err: msg, preview: '' }; if (UI.view === 'notes') render(null); sfx('no'); };
  const sample = await getSample(); if (!sample) return fail('Bystrík teraz nemôže čítať fotky. Funguje to v Claude alebo keď rodič zadá AI kľúč v rodičovskom účte.');
  try { const lim = await sample.limits(); if (!lim || !lim.images) return fail('Na tomto mieste sa fotky nedajú poslať Bystríkovi.'); } catch (e) { return fail('Na tomto mieste sa fotky nedajú poslať Bystríkovi.'); }
  const blob = await shrinkImage(file);
  const prompt = `Na fotke sú školské poznámky dieťaťa na 1. stupni ZŠ na Slovensku (${p.grade}. ročník). Prečítaj ich a odpovedz IBA jedným JSON objektom v tomto tvare:
{"title":"krátky názov témy (max 4 slová)","summary":["bod 1","bod 2"],"questions":[{"q":"otázka","a":"správna odpoveď","w":["zlá 1","zlá 2","zlá 3"],"ex":"krátke vysvetlenie pre dieťa"}]}
Pravidlá: všetko po slovensky, jednoducho a primerane veku. summary má 3 až 7 krátkych bodov. questions má 6 až 8 otázok, ktoré vychádzajú LEN z poznámok, odpovede sú krátke (najviac 5 slov), w obsahuje 3 rôzne nesprávne odpovede. Ak na fotke nie sú čitateľné školské poznámky, odpovedz {"error":"krátke vysvetlenie po slovensky"}.`;
  try {
    const r = await sample.json(prompt, { images: [blob], cache: false });
    if (!r || r.error) return fail(r && r.error ? String(r.error) : 'Poznámky sa nepodarilo prečítať. Skús fotku spraviť ostrejšie a pri dobrom svetle.');
    const qs = (Array.isArray(r.questions) ? r.questions : []).map(x => ({ q: String(x.q || '').trim(), a: String(x.a || '').trim(), w: [...new Set((Array.isArray(x.w) ? x.w : []).map(y => String(y).trim()).filter(y => y && y !== String(x.a || '').trim()))].slice(0, 3), ex: String(x.ex || '').trim() })).filter(x => x.q && x.a && x.w.length >= 2).slice(0, 8);
    const summary = (Array.isArray(r.summary) ? r.summary : []).map(x => String(x).trim()).filter(Boolean).slice(0, 8);
    if (qs.length < 3 || !summary.length) return fail('Z tejto fotky sa nedal spraviť kvíz. Skús odfotiť viac textu.');
    const n = { id: Date.now().toString(36), t: Date.now(), title: String(r.title || 'Moje poznámky').slice(0, 40), summary, qs };
    p.notes = [n, ...(p.notes || [])].slice(0, 10); noteTopic(n); p.stats.chat++; save();
    NOTE = { busy: false, err: '', preview: '' }; if (UI.view === 'notes') render(null); sfx('level'); confetti(120); say('Hotovo! Tvoje poznámky som zhrnul do bodov a pripravil som ti kvíz.');
  } catch (e) { fail(e && e.code === 'rate_limited' ? 'Bystrík si musí chvíľu oddýchnuť. Skús to o pár minút.' : e && e.code === 'not_granted' ? 'Bystrík nemá povolenie. Popros rodičov.' : 'Poznámky sa nepodarilo spracovať. Skús to znova.'); }
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
  if (m === 'quiz' || m === 'time' || m === 'test') return startQuiz([id], m, back);
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
function startQuiz(topicIds, mode, back, opts = {}) {
  Q = { topicIds, mode, back, i: 0, total: opts.total || 10, seq: opts.seq || null, fixed: opts.fixed || null, correct: 0, combo: 0, seen: new Set(), xp: 0, cur: null, input: '', answered: false, left: 60, tlog: [] };
  nextQ(); go('quiz', {}, 'u');
  if (mode === 'time') TIMERS.push(setInterval(() => { Q.left--; const el = $('.timer'); if (el) { el.textContent = Q.left + ' s'; el.classList.toggle('low', Q.left <= 10); } if (Q.left <= 10 && Q.left > 0) sfx('tick'); if (Q.left <= 0) { clearTimers(); finishQuiz(); } }, 1000));
}
const REV_STEPS = [1, 3, 7];
const dayStart = (n = 0) => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime() + n * DAYMS; };
const reviewDue = p => (p.review || []).filter(x => x.due <= dayStart(0));
function reviewNote(p, q, ok) {
  p.review = p.review || []; const k = q.text + '|' + q.answer; const i = p.review.findIndex(x => x.k === k); const it = p.review[i];
  if (Q.mode === 'review') { if (!it) return; if (ok) { it.lvl++; if (it.lvl >= REV_STEPS.length) p.review.splice(i, 1); else it.due = dayStart(REV_STEPS[it.lvl]); } else { it.lvl = 0; it.due = dayStart(1); } return; }
  if (ok || !q.options || q.options.length < 2 || (q.html && q.html.length > 700)) return;
  if (it) { it.lvl = 0; it.due = dayStart(1); return; }
  p.review.push({ k, id: q.topic, s: q.s, text: q.text, html: q.html || '', speak: q.speak || q.text, answer: q.answer, full: q.full || '', ex: q.ex || '', options: q.options.slice(0, 6), lvl: 0, due: dayStart(1) });
  if (p.review.length > 80) p.review.shift();
}
function startReview() { const p = P(); const due = shuffle(reviewDue(p)).slice(0, 10); if (!due.length) { toast('Dnes nemáš nič na opakovanie. 🎉'); return; } startQuiz(['review'], 'review', { v: 'home', p: {} }, { total: due.length, fixed: due }); }
function reviewCard(p) {
  const n = reviewDue(p).length; const all = (p.review || []).length; if (!n && !all) return '';
  if (!n) { const next = Math.min(...p.review.map(x => x.due)); const d = Math.max(1, Math.round((next - dayStart(0)) / DAYMS)); return `<div class="card revcard off"><span class="ic">🧠</span><span><b>Opakovanie</b><span class="b" style="font-size:.9rem">Dnes nič. Ďalšie otázky sa vrátia ${d === 1 ? 'zajtra' : 'o ' + d + ' ' + plural(d, 'deň', 'dni', 'dní')}.</span></span></div>`; }
  return `<button class="card revcard press" data-a="review"><span class="ic">🧠</span><span><b>Opakovanie: ${n} ${plural(n, 'otázka', 'otázky', 'otázok')}</b><span class="b" style="font-size:.9rem">Vrátili sa otázky, ktoré sa ti minule nepodarili. Skús ich znova!</span></span><em>${n}</em></button>`;
}
function nextQ() {
  if (Q.fixed) { const it = Q.fixed[Q.i % Q.fixed.length]; Q.cur = { text: it.text, html: it.html || '', speak: it.speak || it.text, answer: it.answer, full: it.full || '', ex: it.ex || '', options: shuffle(it.options.slice()), key: it.k, topic: it.id, s: it.s || 'mat' }; Q.answered = false; Q.input = ''; return; }
  const t = TOPIC[Q.seq ? Q.seq[Q.i % Q.seq.length] : pick(Q.topicIds)]; let q;
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
  const need = Q && Q.cur && Q.mode !== 'test' && (Q.cur.s === 'mat' || Q.cur.s === 'sjl') && !String(Q.cur.topic).startsWith('note-'); let pk = $('.peek');
  if (pk && need && pk.dataset.s !== Q.cur.s) { pk.dataset.s = Q.cur.s; }
  if (need && !pk) {
    pk = document.createElement('button'); pk.className = 'peek peekbear'; pk.dataset.a = 'calc'; pk.dataset.s = Q.cur.s; pk.setAttribute('aria-label', 'Medvedík Bystrík s pomôckami'); pk.innerHTML = bearSvg(''); document.body.appendChild(pk);
    if (!Q.peekHint) { Q.peekHint = true; peekSay(DATA.settings.calc ? (Q.cur.s === 'mat' ? 'Ťukni na mňa: mám kalkulačku a tabuľky!' : 'Ťukni na mňa, mám pre teba pomôcky!') : 'Držím ti palce!', 3400); }
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
  if (Q.mode === 'test') {
    const ts = topicStat(p, q.topic); ts.total++; p.stats.answered++; countDay(ok); bump(q.s);
    if (ok) { ts.correct++; p.stats.correct++; Q.correct++; bump('correct'); Q.xp += 12; }
    Q.tlog.push({ t: q.text, a: q.full || q.answer, g: q.input ? fmt(String(val)) : String(val), ok, ex: q.ex || '', id: q.topic }); reviewNote(p, q, ok);
    sfx('tap'); if (q.input) $('#padshow').classList.add('picked'); else { const o = $('#opts'); if (o) o.classList.add('locked'); if (el) el.classList.add('picked'); }
    TIMERS.push(setTimeout(() => { Q.i++; if (Q.i >= Q.total) return finishQuiz(); nextQ(); renderQ(); }, 450)); return;
  }
  const ts = topicStat(p, q.topic); ts.total++; p.stats.answered++; countDay(ok); bump(q.s);
  if (Q.mode !== 'time') reviewNote(p, q, ok);
  if (Q.mode !== 'time') Q.tlog.push({ t: q.text, a: q.full || q.answer, g: q.input ? fmt(String(val)) : String(val), ok, ex: q.ex || '', id: q.topic });
  if (ok) { ts.correct++; p.stats.correct++; Q.correct++; Q.combo++; bump('correct'); let g = (Q.mode === 'time' ? 8 : 10) + (Q.combo >= 3 ? 2 : 0); if (q.calcUsed) g = Math.max(1, Math.round(g / 2)); Q.xp += g; sfx('ok'); buzz(15); floatXp(el, '+' + g + (q.calcUsed ? ' 🧮' : '')); burst(el); setMood('happy'); const pk = $('.peek'); if (pk) { pk.classList.remove('happy'); void pk.offsetWidth; pk.classList.add('happy'); if (Math.random() < .5) peekSay(pick(PRAISE)); } if (Q.combo >= 3 && Q.combo % 3 === 0) confetti(40, .55); }
  else { Q.combo = 0; sfx('no'); buzz([30, 40, 30]); setMood('sad'); }
  const cb = $('#combo'); if (cb) { cb.textContent = Q.combo >= 2 ? '🔥' + Q.combo : ''; if (ok && Q.combo >= 2) { cb.classList.remove('pop'); void cb.offsetWidth; cb.classList.add('pop'); } }
  if (q.sayAfter || q.speakLang) setTimeout(() => say(q.sayAfter || q.speak, 'en-GB'), 350);
  if (q.input) $('#padshow').classList.add(ok ? 'right' : 'wrong');
  else { const opts = $('#opts'); opts.classList.add('locked'); opts.querySelectorAll('.opt').forEach(b => { const v = q.options[+b.dataset.i]; if (v === q.answer) b.classList.add('right'); else if (b === el) b.classList.add('wrong'); else b.classList.add('dim'); }); }
  if (Q.mode === 'time') { TIMERS.push(setTimeout(() => { if (!Q || Q.left <= 0 || UI.view !== 'quiz') return; Q.i++; nextQ(); renderQ(); }, ok ? 450 : 1100)); return; }
  const fb = document.createElement('div'); fb.className = 'fb ' + (ok ? 'ok' : 'no'); fb.id = 'fb';
  const fem = p.av && p.av.gender === 'd'; const bsay = ok ? pick([`Super, si ${fem ? 'šikovná' : 'šikovný'}!`, 'Výborne, ide ti to!', `Paráda, si ${fem ? 'jednotka' : 'jednotka'}!`, 'Presne tak, len tak ďalej!', `Bravo, ${fem ? 'zvládla' : 'zvládol'} si to!`]) : pick(['Nevadí, skús to znova!', 'Nič sa nedeje, nabudúce to dáš!', 'Nevadí, chybami sa učíme!', 'Skoro! Skúsime to ešte raz.']);
  if (!(q.sayAfter || q.speakLang)) setTimeout(() => say(bsay), 200);
  fb.innerHTML = `<div class="in"><div class="fbtop"><span class="fbbear">${bearSvg(ok ? 'cheer' : 'comfort')}</span><div class="fbbub"><h3>${ok ? '✓' : '✗'} ${bsay}</h3></div></div>${ok && q.calcUsed ? '<p class="muted">🧮 Použil(a) si kalkulačku, preto len polovica bodov.</p>' : ''}${!ok && !q.ex ? `<p class="muted">💡 Zapamätaj si správnu odpoveď. Nabudúce to už budeš vedieť!</p>` : ''}${!ok ? `<p>Správna odpoveď: <b>${esc(q.full || q.answer)}</b></p>` : ''}${q.ex && (!ok || q.full) ? `<p class="muted">${esc(q.ex)}</p>` : ''}<div id="explain"></div><div class="rowbtns" style="grid-template-columns:${!ok && CHAT_ON() ? '1fr 1fr' : '1fr'}">${!ok && CHAT_ON() ? '<button class="btn lilac" data-a="explain">🧸 Vysvetli mi to</button>' : ''}<button class="btn ${ok ? 'good' : 'primary'}" data-a="next">${Q.i + 1 >= Q.total ? 'Výsledok' : 'Ďalej'}</button></div></div>`;
  document.body.appendChild(fb);
}
function nextStep() { const fb = $('#fb'); if (fb) fb.remove(); Q.i++; if (Q.i >= Q.total) return finishQuiz(); nextQ(); renderQ(); sfx('tap'); }
function finishQuiz() {
  const fb = $('#fb'); if (fb) fb.remove(); clearTimers();
  const p = P(); const before = p.xp; let bonus = 0, stars = 0;
  if (Q.mode === 'review') { const f = Q.correct / Q.total; stars = f >= 1 ? 3 : f >= .8 ? 2 : f >= .5 ? 1 : 0; bump('quizzes'); logAct('review', null, Q.correct, Q.total); }
  else if (Q.mode === 'quiz' || Q.mode === 'daily' || Q.mode === 'test') {
    stars = Q.correct >= 10 ? 3 : Q.correct >= 8 ? 2 : Q.correct >= 5 ? 1 : 0; p.stats.quizzes++; bump('quizzes'); if (stars === 3) bump('stars3');
    if (Q.correct === 10) { p.stats.perfect++; bonus += 30; }
    if (Q.mode === 'quiz' || Q.mode === 'test') { const ts = topicStat(p, Q.topicIds[0]); ts.played++; ts.best = Math.max(ts.best, Q.correct); ts.stars = Math.max(ts.stars, stars); logAct('quiz', Q.topicIds[0], Q.correct, Q.total); checkPTasks(p, Q.topicIds[0], stars); }
    else { if (p.dailyDone !== today()) { p.dailyDone = today(); p.stats.daily++; bonus += 50; } bump('daily'); logAct('daily', null, Q.correct, Q.total); }
  } else { p.stats.bestTime = Math.max(p.stats.bestTime, Q.correct); const ts = topicStat(p, Q.topicIds[0]); ts.time = Math.max(ts.time || 0, Q.correct); bump('time'); logAct('time', Q.topicIds[0], Q.correct, Q.i + 1); }
  gain(p, Q.xp + bonus); touchStreak(p); checkBadges(p); save();
  go('result', { tlog: Q.tlog, kind: Q.mode, correct: Q.correct, total: Q.mode === 'time' ? Q.i + (Q.answered ? 1 : 0) : Q.total, stars, xp: Q.xp + bonus, bonus, before, after: p.xp, retry: Q.topicIds, back: Q.back }, 'u');
}
async function explainQ() {
  const q = Q.cur; const box = $('#explain'); const btn = $('[data-a="explain"]'); if (btn) btn.remove();
  box.innerHTML = `<div class="explain">${owlSvg('')}<span id="extext"><span class="typing"><i></i><i></i><i></i></span></span></div>`;
  const sample = await getSample();
  if (!sample) { $('#extext').textContent = 'Bystrík teraz nemôže odpovedať. Chat funguje, keď je apka otvorená v Claude alebo keď rodič zadá AI kľúč v rodičovskom účte.'; return; }
  const p = P(); const prompt = `${tutorIntro(p)}\n\nDieťa práve odpovedalo nesprávne na úlohu z predmetu ${SUBJECTS[q.s].name}.\nÚloha: ${q.text}${q.speak && q.speak !== q.text ? ' (' + q.speak + ')' : ''}\nSprávna odpoveď: ${q.full || q.answer}\nDoplňujúce vysvetlenie: ${q.ex || '-'}\n\nVysvetli dieťaťu krátko (3–4 vety) a jednoducho, prečo je správna odpoveď práve táto a ako na to nabudúce príde. Povzbuď ho.`;
  try { p.stats.chat++; await sample(prompt, { cache: false, onText: ({ text }) => { const e = $('#extext'); if (e) e.textContent = text; } }); save(); }
  catch (e) { const el = $('#extext'); if (el) el.textContent = e && e.code === 'rate_limited' ? 'Bystrík si musí chvíľu oddýchnuť. Skús to o chvíľu.' : 'Teraz sa to nepodarilo. Skús to neskôr.'; }
}

/* --- diktát --- */
const DICT = {
  1: ['mama', 'oco', 'dom', 'pes', 'les', 'lopta', 'ruka', 'noha', 'oko', 'ryba', 'auto', 'vlak', 'koza', 'kino', 'voda', 'mapa', 'sova', 'zima', 'leto', 'mesto'],
  2: ['mačka', 'škola', 'žaba', 'čaj', 'ďateľ', 'ťava', 'koláč', 'ľad', 'dážď', 'kôň', 'stôl', 'nôž', 'mäso', 'päť', 'deväť', 'lúka', 'ruža', 'hruška', 'čerešňa', 'učiteľ', 'Mama varí čaj.', 'Pes má búdu.'],
  3: ['bývať', 'bystrý', 'myš', 'mydlo', 'mlyn', 'pýtať sa', 'pýcha', 'rýchly', 'syn', 'syr', 'výlet', 'vysoký', 'jazyk', 'kobyla', 'Mama pečie koláč.', 'V lese rastú huby.', 'Sýkorka sedí na strome.', 'Myš sa bojí mačky.', 'Babka býva na dedine.', 'Na výlet ideme vlakom.'],
  4: ['Babička býva v malom dome.', 'Na výlete sme videli vysoký hrad.', 'Bystrý žiak rýchlo počíta.', 'V zime si obliekam teplý kabát.', 'Môj brat rád číta knihy.', 'Na lúke kvitnú biele margaréty.', 'Dnes je pekný slnečný deň.', 'Sýkorky a vrabce lietajú k rybníku.', 'Pri mlyne tečie čistý potok.', 'Učiteľka nám prečítala zaujímavý príbeh.', 'Rytier býval vo vysokej veži.', 'Mamička umyla riad a utrela stôl.']
};
let DK = null;
const dkNorm = t => String(t || '').trim().replace(/\s+/g, ' ').replace(/[.!?]+$/, '').toLowerCase();
const dkPlain = t => dkNorm(t).normalize('NFD').replace(/[̀-ͯ]/g, '');
function dkSay(slow) { if (!DK) return; const t = DK.list[DK.i]; try { speechSynthesis.cancel(); if (!VOICES.length) loadVoices(); const u = new SpeechSynthesisUtterance(t); const v = pickVoice('sk-SK'); if (v) { u.voice = v; u.lang = v.lang; } else u.lang = 'sk-SK'; u.rate = slow ? .5 : .78; u.pitch = 1.02; speechSynthesis.speak(u); } catch (e) { } }
function dkStart() { const p = P(); DK = { list: shuffle(DICT[p.grade] || DICT[1]).slice(0, 6), i: 0, ok: 0, done: null, peeks: 0, tries: 0 }; }
VIEWS.dict = () => {
  if (!DK || DK.i >= DK.list.length) dkStart(); const t = DK.list[DK.i]; const hasVoice = 'speechSynthesis' in window; const res = DK.done;
  const diff = () => { const a = [...res.typed], b = [...t]; return b.map((c, i) => `<i class="${(a[i] || '').toLowerCase() === c.toLowerCase() ? 'ok' : 'bad'}">${c === ' ' ? '&nbsp;' : esc(c)}</i>`).join(''); };
  return `${topbar('learn-back')}<main class="view nonav dictv"><div><h1 style="font-size:1.8rem">✏️ Diktát</h1><p class="muted b">Vypočuj si, čo Bystrík hovorí, a napíš to. Pozor na mäkčene a dĺžne!</p></div>
  <div class="wprog">${DK.list.map((_, i) => `<i class="${i < DK.i ? 'done' : i === DK.i ? 'on' : ''}">${i < DK.i ? '✓' : i + 1}</i>`).join('')}</div>
  <section class="card dictbox"><div class="dictbear">${bearSvg('')}</div>${hasVoice ? `<div class="rowbtns" style="grid-template-columns:3fr 2fr;width:100%"><button class="btn primary" data-a="dk-say">🔊 Vypočuť</button><button class="btn" data-a="dk-slow">🐢 Pomaly</button></div>` : '<p class="b">Tento telefón nevie čítať nahlas. Použi „Ukáž na chvíľu“.</p>'}
  <div class="dictpeek" id="dkpeek"></div>
  ${res ? `<div class="dictres ${res.ok ? 'ok' : 'no'}"><b>${res.ok ? '✅ Správne!' : res.near ? '❌ Skoro! Pozor na mäkčene a dĺžne.' : '❌ Pozri sa, ako sa to píše:'}</b><div class="dictdiff">${diff()}</div>${res.ok ? '' : `<small>Ty: ${esc(res.typed) || '(nič)'}</small>`}</div><button class="btn primary block" data-a="dk-next">${DK.i + 1 >= DK.list.length ? 'Výsledok' : 'Ďalej →'}</button>`
    : `<input class="field dictin" id="dkin" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" lang="sk" placeholder="Sem napíš, čo počuješ"><div class="rowbtns" style="grid-template-columns:1fr 2fr;width:100%"><button class="btn" data-a="dk-peek">👀 Ukáž</button><button class="btn primary" data-a="dk-check">✓ Skontrolovať</button></div><p class="muted b" style="font-size:.8rem;margin:0">Dlhé a mäkké písmená nájdeš na klávesnici, keď písmeno podržíš.</p>`}</section></main>`;
};
AFTER.dict = () => { if (DK && !DK.done) { if (!DK.spoken) { DK.spoken = true; setTimeout(() => dkSay(false), 450); } const el = $('#dkin'); if (el) el.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); ACT['dk-check'](); } }); } };
function dkFinish() { const p = P(); const before = p.xp; const xp = DK.ok * 8 + 6; gain(p, xp); logAct('dict', null, DK.ok, DK.list.length); touchStreak(p); checkBadges(p); save(); const r = { kind: 'dict', correct: DK.ok, total: DK.list.length, xp, bonus: 0, before, after: p.xp, back: { v: 'learn', p: {} } }; DK = null; go('result', r, 'u'); }
/* --- písanie prstom --- */
const WSHAPES = { v: ['Zvislá čiara', '│'], h: ['Ležatá čiara', '─'], d: ['Šikmá čiara', '╱'], z: ['Zúbky', '⩘'], w: ['Vlnka', '∿'], u: ['Kopčeky', '∩'], l: ['Slučky', '∞'], o: ['Kruh', '◯'], s: ['Štvorec', '□'], t: ['Trojuholník', '△'] };
const wLabel = ch => ch[0] === '~' ? WSHAPES[ch[1]][0] : ch, wMini = ch => ch[0] === '~' ? WSHAPES[ch[1]][1] : ch;
const WSETS = { lines: ['Moje prvé čiary', Object.keys(WSHAPES).map(k => '~' + k)], num: ['Čísla', '0123456789'], big: ['Veľké písmená', 'ABCDEFGHIJKLMNOPRSTUVZ'], small: ['Malé písmená', 'abcdefghijklmnoprstuvz'] };
let W = null;
function writeStart(set) { const p = P(); set = set || (W && W.set) || (p.grade <= 1 ? 'lines' : 'big'); W = { set, list: shuffle(Array.isArray(WSETS[set][1]) ? WSETS[set][1].slice() : WSETS[set][1].split('')).slice(0, 6), i: 0, ok: 0, tries: 0, drawn: false, busy: false }; }
VIEWS.write = () => {
  if (!W || W.i >= W.list.length) writeStart();
  return `${topbar('learn-back')}<main class="view nonav writev"><div><h1 style="font-size:1.8rem">Písanie prstom</h1><p class="muted b">Obtiahni prstom čiaru, tvar, písmeno alebo číslo. Snaž sa ostať na sivej predlohe.</p></div>
  <div class="chips">${Object.entries(WSETS).map(([k, v]) => `<button class="chip ${W.set === k ? 'on' : ''}" data-a="write-set" data-s="${k}">${v[0]}</button>`).join('')}</div>
  <div class="wprog">${W.list.map((ch, i) => `<i class="${i < W.i ? 'done' : i === W.i ? 'on' : ''}">${i < W.i ? '✓' : wMini(ch)}</i>`).join('')}</div>
  <section class="card wbox"><div class="wwrap"><canvas id="wguide" width="340" height="340"></canvas><canvas id="wdraw" width="340" height="340"></canvas></div><p class="wmsg" id="wmsg">${W.list[W.i][0] === '~' ? 'Obtiahni' : 'Napíš'}: <b>${wLabel(W.list[W.i])}</b></p></section>
  <div class="rowbtns" style="grid-template-columns:1fr 2fr"><button class="btn" data-a="write-clear">🧽 Zmazať</button><button class="btn primary" data-a="write-done">✓ Hotovo</button></div></main>`;
};
const WFONT = '700 250px Lexend, Nunito, system-ui, sans-serif';
function wShape(ctx, k) {
  ctx.beginPath();
  if (k === 'v') { ctx.moveTo(170, 60); ctx.lineTo(170, 280); } else if (k === 'h') { ctx.moveTo(60, 170); ctx.lineTo(280, 170); } else if (k === 'd') { ctx.moveTo(80, 270); ctx.lineTo(260, 70); }
  else if (k === 'z') { ctx.moveTo(50, 230); ctx.lineTo(110, 110); ctx.lineTo(170, 230); ctx.lineTo(230, 110); ctx.lineTo(290, 230); }
  else if (k === 'w') { ctx.moveTo(40, 170); ctx.quadraticCurveTo(85, 70, 130, 170); ctx.quadraticCurveTo(175, 270, 220, 170); ctx.quadraticCurveTo(265, 70, 310, 170); }
  else if (k === 'u') { ctx.moveTo(50, 245); ctx.quadraticCurveTo(110, 40, 170, 245); ctx.quadraticCurveTo(230, 40, 290, 245); }
  else if (k === 'l') { ctx.moveTo(50, 235); ctx.bezierCurveTo(95, 235, 150, 65, 110, 65); ctx.bezierCurveTo(70, 65, 115, 235, 170, 235); ctx.bezierCurveTo(215, 235, 270, 65, 230, 65); ctx.bezierCurveTo(190, 65, 235, 235, 290, 235); }
  else if (k === 'o') { ctx.arc(170, 170, 100, 0, Math.PI * 2); } else if (k === 's') { ctx.rect(80, 80, 180, 180); } else { ctx.moveTo(170, 70); ctx.lineTo(280, 260); ctx.lineTo(60, 260); ctx.closePath(); }
}
function wGlyph(ctx, ch, fill) { if (ch[0] === '~') { ctx.lineCap = 'round'; ctx.lineJoin = 'round'; wShape(ctx, ch[1]); if (fill) { const lw = ctx.lineWidth, ss = ctx.strokeStyle; ctx.lineWidth = 38; ctx.strokeStyle = ctx.fillStyle; ctx.stroke(); ctx.lineWidth = lw; ctx.strokeStyle = ss; } else ctx.stroke(); return; } ctx.font = WFONT; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; const m = ctx.measureText(ch); const h = (m.actualBoundingBoxAscent || 180) + (m.actualBoundingBoxDescent || 0); const y = 170 + h / 2 - (m.actualBoundingBoxDescent || 0); if (fill) ctx.fillText(ch, 170, y); else ctx.strokeText(ch, 170, y); }
function wDrawGuide() { const g = $('#wguide'); if (!g) return; const c = g.getContext('2d'); c.clearRect(0, 0, 340, 340); const ink = getComputedStyle(document.documentElement).getPropertyValue('--ink').trim() || '#333'; c.globalAlpha = .13; c.fillStyle = ink; wGlyph(c, W.list[W.i], true); c.globalAlpha = .45; c.strokeStyle = ink; c.lineWidth = 2.5; c.setLineDash([7, 7]); wGlyph(c, W.list[W.i], false); c.setLineDash([]); c.globalAlpha = 1; }
function wScore() {
  const d = $('#wdraw'); const m = document.createElement('canvas'); m.width = m.height = 340; const mc = m.getContext('2d'); mc.fillStyle = '#000'; mc.lineWidth = 16; mc.lineJoin = 'round'; mc.strokeStyle = '#000'; wGlyph(mc, W.list[W.i], true); wGlyph(mc, W.list[W.i], false);
  const A = mc.getImageData(0, 0, 340, 340).data, B = d.getContext('2d').getImageData(0, 0, 340, 340).data; let mask = 0, user = 0, both = 0;
  for (let i = 3; i < A.length; i += 16) { const a = A[i] > 60, b = B[i] > 60; if (a) mask++; if (b) user++; if (a && b) both++; }
  return { recall: mask ? both / mask : 0, prec: user ? both / user : 0, user };
}
AFTER.write = () => {
  const d = $('#wdraw'); if (!d) return; const paint = () => wDrawGuide(); paint(); try { document.fonts.load(WFONT).then(paint); } catch (e) { }
  const c = d.getContext('2d'); c.lineCap = 'round'; c.lineJoin = 'round'; c.lineWidth = 30; c.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#E8456B';
  let on = false, lx = 0, ly = 0; const pos = e => { const r = d.getBoundingClientRect(); return [(e.clientX - r.left) * 340 / r.width, (e.clientY - r.top) * 340 / r.height]; };
  d.addEventListener('pointerdown', e => { if (W.busy) return; e.preventDefault(); on = true; try { d.setPointerCapture(e.pointerId); } catch (x) { } [lx, ly] = pos(e); c.beginPath(); c.arc(lx, ly, 15, 0, 7); c.fillStyle = c.strokeStyle; c.fill(); W.drawn = true; });
  d.addEventListener('pointermove', e => { if (!on) return; e.preventDefault(); const [x, y] = pos(e); c.beginPath(); c.moveTo(lx, ly); c.lineTo(x, y); c.stroke(); lx = x; ly = y; });
  const up = () => { on = false; }; d.addEventListener('pointerup', up); d.addEventListener('pointercancel', up);
};
function writeFinish() { const p = P(); const before = p.xp; const xp = W.ok * 5 + 5; gain(p, xp); logAct('write', null, W.ok, W.list.length); touchStreak(p); checkBadges(p); save(); const r = { kind: 'write', correct: W.ok, total: W.list.length, xp, bonus: 0, before, after: p.xp, back: { v: 'learn', p: {} } }; W.i = W.list.length; go('result', r, 'u'); }
/* --- vyhodnotenie kvízu --- */
function evalHTML(r) {
  if (!r.tlog || !r.tlog.length || !['quiz', 'daily', 'test', 'review'].includes(r.kind)) return '';
  const good = r.tlog.filter(x => x.ok), bad = r.tlog.filter(x => !x.ok);
  const byT = {}; bad.forEach(x => { if (x.id && TOPIC[x.id]) byT[x.id] = (byT[x.id] || 0) + 1; }); const rep = Object.entries(byT).sort((a, b) => b[1] - a[1]);
  const line = x => `<div class="tl ${x.ok ? 'ok' : 'no'}"><b>${x.ok ? '✅' : '❌'} ${esc(x.t)}</b>${x.ok ? `<span>Tvoja odpoveď: ${esc(x.g)}</span>` : `<span>Tvoja odpoveď: <s>${esc(x.g)}</s></span><span>Správne: <b>${esc(x.a)}</b></span>${x.ex ? `<span class="muted">💡 ${esc(x.ex)}</span>` : ''}`}</div>`;
  return `<section class="card tlog"><h2>📋 Vyhodnotenie</h2><div class="evsum"><div class="ok"><b>${good.length}</b><span>správne</span></div><div class="no"><b>${bad.length}</b><span>${plural(bad.length, 'chyba', 'chyby', 'chýb')}</span></div></div>
  ${rep.length ? `<div class="evrep"><h3>🔁 Toto si zopakuj</h3>${rep.map(([id, n]) => `<div class="evt"><span>${TOPIC[id].icon || '📘'} ${esc(TOPIC[id].name)}</span><small>${n} ${plural(n, 'chyba', 'chyby', 'chýb')}</small></div>`).join('')}<button class="btn primary block" data-a="ev-practice">💪 Precvičiť chyby</button></div>` : bad.length ? '' : `<p class="b" style="color:var(--good)">🌟 Bez jedinej chyby. Nič netreba opakovať!</p>`}
  ${bad.length ? `<h3>❌ Čo sa nepodarilo</h3>${bad.map(line).join('')}` : ''}
  ${good.length ? `<details class="evok"><summary>✅ Čo si ${P() && P().av.gender === 'd' ? 'vedela' : 'vedel'} (${good.length})</summary>${good.map(line).join('')}</details>` : ''}</section>`;
}
/* --- výsledok --- */
VIEWS.result = r => {
  const p = P(); const b = levelInfo(r.before);
  const big = (e, h, s = '') => `<div style="font-size:4rem;line-height:1;animation:boing .6s">${e}</div><h1>${h}</h1>${s}`;
  const head = r.kind === 'time' ? big('⏱️', `${r.correct} správnych za minútu!`, `<div class="score muted">Najlepší výsledok: ${p.stats.bestTime}</div>`)
    : r.kind === 'cards' ? big('🃏', 'Všetky kartičky zvládnuté!')
      : r.kind === 'pex' ? big('🧩', 'Pexeso hotové!', `<div class="score">Počet ťahov: ${r.moves}</div>`)
        : r.kind === 'match' ? big('🔗', r.sort ? 'Všetko roztriedené!' : 'Všetko pospájané!', `<div class="score">${r.sort ? `Správne: ${r.correct} z ${r.total}` : `Chyby: ${r.mistakes}`}</div>`)
          : r.kind === 'dict' ? big('✏️', r.correct === r.total ? 'Diktát bez chyby!' : 'Diktát hotový!', `<div class="score">Správne: ${r.correct} z ${r.total}</div>`)
          : r.kind === 'write' ? big('✍️', 'Pekne napísané!', `<div class="score">Na prvý pokus: ${r.correct} z ${r.total}</div>`)
          : r.kind === 'read' ? big('📖', 'Výborne si čítal(a)!', `<div class="score">Otázky: ${r.correct} z ${r.total} správne</div>`)
          : r.kind === 'game' ? big(GAMES[r.game].i, `${r.score} ${plural(r.score, 'bod', 'body', 'bodov')}!`, `<div class="score muted">Najlepšie: ${p.best[r.game] || 0}</div>`)
            : `<div class="bigstars">${[0, 1, 2].map(i => `<span class="${i < r.stars ? '' : 'off'}" style="animation-delay:${300 + i * 300}ms">⭐</span>`).join('')}</div><h1>${r.stars === 3 ? 'Dokonalé!' : r.stars === 2 ? 'Výborne!' : r.stars === 1 ? 'Dobrá práca!' : 'Ide to, trénuj ďalej!'}</h1><div class="score">${r.correct} z ${r.total} správne</div>`;
  const good = r.kind === 'quiz' || r.kind === 'daily' || r.kind === 'test' || r.kind === 'review' ? r.stars >= 2 : true; const bsay = good ? pick(['Si úžasný!', 'Paráda, len tak ďalej!', 'Som na teba hrdý!', 'Výborne si to zvládol!']) : pick(['Nevadí, nabudúce to bude lepšie!', 'Skús to ešte raz, dáš to!', 'Každý sa učí, aj ja!']);
  return `<main class="view nonav" style="justify-content:center"><div class="resbear ${good ? 'cheer' : 'comfort'}">${bearSvg(good ? 'cheer' : 'comfort')}<span class="rbub">${bsay}</span></div><section class="card result">${head}<div class="xpgain">+<span id="xpc">0</span> bodov · +${Math.max(1, Math.round(r.xp / 5))} ${COIN}${r.bonus ? ` <span class="muted" style="font-size:1rem">(bonus ${r.bonus})</span>` : ''}</div><div style="width:100%"><div style="display:flex;justify-content:space-between;font-weight:800"><span>Level <span id="lvn">${b.L}</span></span><span class="muted" id="lvt">${b.cur} / ${b.need}</span></div><div class="xpbar" style="height:18px"><i id="xpb" style="width:${b.pct}%"></i></div></div><div class="rowbtns"><button class="btn primary" data-a="res-back">✓ Hotovo</button><button class="btn" data-a="res-again">🔁 Skúsiť znova</button></div></section>${evalHTML(r)}</main>`;
};
AFTER.result = () => {
  const r = UI.params; const a = levelInfo(r.after), b = levelInfo(r.before);
  if (r.kind === 'quiz' || r.kind === 'daily' || r.kind === 'test' || r.kind === 'review') { for (let i = 0; i < r.stars; i++) setTimeout(() => sfx('star', i), 300 + i * 300); if (r.stars === 3) setTimeout(() => confetti(140), 1100); } else setTimeout(() => confetti(90), 300);
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
  mole: { i: '🐹', n: 'Chyť škrečka', d: 'Škrečky vykúkajú z norčiek. Ťukni len na tie so správnou odpoveďou.', bg: 'var(--mint-soft)', cost: 150 },
  word: { i: '🔤', n: 'Poskladaj slovo', d: 'Pozri sa na obrázok a ťukaj písmená v správnom poradí.', bg: 'var(--lilac-soft)' },
  frog: { i: '🐸', n: 'Žabka cez rybník', d: 'Skáč po leknách so správnou odpoveďou a dostaň žabku na druhý breh.', bg: 'var(--c-mat-soft)', cost: 180 },
  order: { i: '🔢', n: 'Zoraď čísla', d: 'Ťukaj čísla od najmenšieho po najväčšie, čo najrýchlejšie.', bg: 'var(--sun-soft)', cost: 120 },
  simon: { i: '🧠', n: 'Pamätaj si', d: 'Sleduj, v akom poradí sa rozsvietia farby, a zopakuj to.', bg: 'var(--lilac-soft)', cost: 150 },
  race: { i: '🏎️', n: 'Počtové preteky', d: 'Každá správna odpoveď posunie tvoje auto. Predbehni súpera do cieľa!', bg: 'var(--bad-soft)', cost: 200 }
};
const DIFF = { me: { n: 'Mega easy', e: '🐣', sp: 1.9, ql: 0, xp: .5 }, e: { n: 'Easy', e: '🙂', sp: 1.25, ql: 10, xp: 1 }, h: { n: 'Hard', e: '🔥', sp: .72, ql: 5, xp: 1.5 }, i: { n: 'Impossible', e: '💀', sp: .45, ql: 2.6, xp: 2 } };
const DF = () => DIFF[(GM && GM.d) || 'e'];
function pickDiff(k) {
  const p = P(); const last = (p.gdiff || {})[k] || 'e'; const g = GAMES[k]; sfx('whoosh');
  const w = document.createElement('div'); w.className = 'over';
  w.innerHTML = `<div class="card box diffbox"><div style="font-size:3.2rem;line-height:1">${g.i}</div><h2>${g.n}</h2><p class="muted b">Vyber si obtiažnosť</p><div class="diffs">${Object.entries(DIFF).map(([d, x]) => `<button class="diff press d-${d} ${d === last ? 'on' : ''}" data-a="gdiff" data-g="${k}" data-d="${d}"><span class="de">${x.e}</span><b>${x.n}</b><small>${x.xp === 1 ? 'normálne body' : x.xp < 1 ? 'polovica bodov' : '×' + x.xp + ' bodov'}</small></button>`).join('')}</div><button class="btn block" data-a="ov-close">Zrušiť</button></div>`;
  document.body.appendChild(w);
}
function qTimer(onOut, k = 1) {
  if (GM.qt) clearTimeout(GM.qt); const lim = DF().ql * k; const bar = $('#qbar'); if (!lim) { if (bar) bar.parentNode.style.display = 'none'; return; }
  if (bar) { bar.style.transition = 'none'; bar.style.width = '100%'; void bar.offsetWidth; bar.style.transition = `width ${lim}s linear`; bar.style.width = '0%'; }
  GM.qt = setTimeout(() => { if (!GM.ended) onOut(); }, lim * 1000); TIMERS.push(GM.qt);
}
function tfResolve(ok, el) { if (GM.qt) clearTimeout(GM.qt); GM.lock = true; gHit(ok, el); if (GM.ended) return; const c = $('#tfcard'); c.style.background = ok ? 'var(--good-soft)' : 'var(--bad-soft)'; $('#tfex').textContent = ok ? '✓ ' + pick(PRAISE) : '✗ ' + GM.st.ex; TIMERS.push(setTimeout(() => { if (GM.ended) return; GM.lock = false; GM.st = makeStatement(GM.g); c.style.background = ''; c.textContent = GM.st.text; c.classList.remove('enter'); void c.offsetWidth; c.classList.add('enter'); $('#tfex').innerHTML = '&nbsp;'; qTimer(tfOut); }, ok ? 500 : 1300)); }
function tfOut() { if (GM.lock) return; tfResolve(false, $('#tfcard')); }
function frogOut() { if (GM.busy) return; GM.busy = true; const fr = $('#frog'); if (fr) fr.classList.add('splash'); gHit(false, fr); const ex = $('.deckinfo'); if (ex) ex.textContent = '⏰ Čas vypršal! Správne bolo: ' + GM.fq.answer; setTimeout(() => { if (GM.ended) return; GM.fq = frogQ(GM.g); GM.busy = false; const w = $('#fwrap'); if (w) w.innerHTML = frogHTML(); qTimer(frogOut); }, 1300); }
const WORDS = [['🐱', 'MAČKA'], ['🐶', 'PES'], ['🏠', 'DOM'], ['🌞', 'SLNKO'], ['🍎', 'JABLKO'], ['🚗', 'AUTO'], ['🐟', 'RYBA'], ['🌳', 'STROM'], ['📚', 'KNIHA'], ['🐻', 'MEDVEĎ'], ['⭐', 'HVIEZDA'], ['🚂', 'VLAK'], ['🧀', 'SYR'], ['🥛', 'MLIEKO'], ['🐸', 'ŽABA'], ['🌙', 'MESIAC'], ['🎈', 'BALÓN'], ['🦋', 'MOTÝĽ'], ['🍓', 'JAHODA'], ['🐝', 'VČELA'], ['🏫', 'ŠKOLA'], ['✏️', 'CERUZKA'], ['🌈', 'DÚHA'], ['🐘', 'SLON'], ['🦊', 'LÍŠKA'], ['🍞', 'CHLIEB'], ['🥕', 'MRKVA'], ['🐭', 'MYŠ'], ['❄️', 'SNEH'], ['🐴', 'KÔŇ'], ['🌹', 'RUŽA'], ['🔑', 'KĽÚČ'], ['👑', 'KORUNA'], ['🍰', 'TORTA'], ['🚲', 'BICYKEL'], ['🐢', 'KORYTNAČKA'], ['🦉', 'SOVA'], ['🌧️', 'DÁŽĎ'], ['🍐', 'HRUŠKA'], ['🥚', 'VAJCE']];
function wordNext() {
  const g = GM.g; const max = g <= 1 ? 4 : g === 2 ? 5 : g === 3 ? 7 : 10; const pool = WORDS.filter(w => [...w[1]].length <= max && [...w[1]].length >= (g >= 3 ? 4 : 3) && !(GM.wseen || []).includes(w[1]));
  const w = pick(pool.length ? pool : WORDS.filter(x => [...x[1]].length <= max)); GM.wseen = [...(GM.wseen || []), w[1]].slice(-14); const L = [...w[1]];
  const extra = g >= 3 ? shuffle([...'AEIOUKLMNPRSTVZ'].filter(c => !L.includes(c))).slice(0, DF().sp < 1 ? 3 : 2) : [];
  GM.w = { e: w[0], word: L, tiles: shuffle([...L, ...extra]).map((c, i) => ({ c, i, used: false })), pos: 0 };
}
function wordHTML() { const w = GM.w; return `<section class="card wordbox"><div class="wemo">${w.e}</div><div class="wslots">${w.word.map((c, i) => `<i class="${i < w.pos ? 'ok' : i === w.pos ? 'cur' : ''}">${i < w.pos ? c : ''}</i>`).join('')}</div></section><div class="wtiles">${w.tiles.map(t => `<button class="wtile press ${t.used ? 'used' : ''}" data-a="wl" data-i="${t.i}" ${t.used ? 'disabled' : ''}>${t.c}</button>`).join('')}</div><p class="deckinfo" id="wordinfo">Ťukaj písmená v správnom poradí.</p>`; }
function wordOut() { if (!GM || GM.ended || GM.busy) return; GM.busy = true; gHit(false, $('.wordbox')); const el = $('#wordinfo'); if (el) el.textContent = '⏰ Čas vypršal! Bolo to: ' + GM.w.word.join(''); setTimeout(() => { if (!GM || GM.ended) return; GM.busy = false; wordNext(); const b = $('#wordwrap'); if (b) b.innerHTML = wordHTML(); qTimer(wordOut, 2.4); }, 1300); }
const gameLocked = (p, k) => !!(GAMES[k] && GAMES[k].cost) && !(p.gown || []).includes(k);
/* Zoraď čísla */
function orderNext() { const g = GM.g; const n = g <= 1 ? 6 : g === 2 ? 8 : 9; const max = g <= 1 ? 20 : g === 2 ? 100 : g === 3 ? 1000 : 10000; const st = new Set(); while (st.size < n) st.add(R(g >= 3 ? 10 : 1, max)); const v = [...st]; GM.o = { vals: shuffle(v.slice()), sorted: v.slice().sort((a, b) => a - b), pos: 0 }; }
function orderHTML() { const o = GM.o; return `<div class="target">Ťukaj od <b>najmenšieho</b> po <b>najväčšie</b></div><div class="ordgrid" id="ordgrid">${o.vals.map(v => `<button class="ordt press" data-a="ord" data-v="${v}">${fmt(v)}</button>`).join('')}</div><p class="deckinfo" id="ordinfo">Začni najmenším číslom.</p>`; }
function orderOut() { if (!GM || GM.ended || GM.busy) return; GM.busy = true; gHit(false, $('#ordgrid')); const e = $('#ordinfo'); if (e) e.textContent = '⏰ Čas vypršal! Správne: ' + GM.o.sorted.map(x => fmt(x)).join(' < '); setTimeout(() => { if (!GM || GM.ended) return; GM.busy = false; orderNext(); const b = $('#ordwrap'); if (b) b.innerHTML = orderHTML(); qTimer(orderOut, 3); }, 1600); }
/* Pamätaj si */
const SIMC = ['#E8456B', '#4C86F7', '#F8BD3A', '#22B573'], SIMF = [392, 494, 587, 740];
function simonLit(i, ms) { const el = $('#simon [data-i="' + i + '"]'); if (!el) return; el.classList.add('lit'); try { if (DATA.settings.sound) mar(SIMF[i], 0, .16, .35); } catch (e) { } setTimeout(() => el.classList.remove('lit'), ms); }
function simonPlay() { if (!GM || GM.ended) return; GM.lockIn = true; GM.in = 0; const info = $('#simoninfo'); if (info) info.textContent = '👀 Pozeraj sa…'; const step = Math.max(320, 620 * DF().sp); GM.seq.forEach((c, k) => TIMERS.push(setTimeout(() => simonLit(c, step * .6), 400 + k * step))); TIMERS.push(setTimeout(() => { if (!GM || GM.ended) return; GM.lockIn = false; const i2 = $('#simoninfo'); if (i2) i2.textContent = '👉 Teraz ty! (' + GM.seq.length + ' ' + plural(GM.seq.length, 'farba', 'farby', 'farieb') + ')'; }, 400 + GM.seq.length * step)); }
/* Počtové preteky */
function raceDraw(full) { if (full) { const q = $('#raceq'); if (q) q.innerHTML = `<div class="target">${esc(GM.rq.text)}</div><div class="opts" style="grid-template-columns:repeat(3,1fr)">${GM.rq.opts.map((o, i) => `<button class="card opt press" data-a="race-ans" data-i="${i}">${esc(o)}</button>`).join('')}</div>`; } const a = $('#carme'), b = $('#carbot'); if (a) a.style.left = (GM.pos * 8.4) + '%'; if (b) b.style.left = (GM.bot * 8.4) + '%'; }
function frogQ(g) {
  const ts = ALL_TOPICS.filter(t => t.g === g && t.s === 'mat' && t.gen); const ts2 = ts.length ? ts : ALL_TOPICS.filter(t => t.g <= g && t.s === 'mat' && t.gen);
  for (let k = 0; k < 30; k++) { try { const q = makeQuestion(pick(ts2)); if (q.html || !q.options || q.options.length < 3 || q.text.length > 60 || q.options.some(o => String(o).length > 9)) continue; const w = shuffle(q.options.filter(o => o !== q.answer)).slice(0, 2); return { text: q.text, answer: q.answer, opts: shuffle([q.answer, ...w]) }; } catch (e) { } }
  const a = R(2, 9), b = R(2, 9); return { text: `${a} + ${b} = ?`, answer: String(a + b), opts: shuffle([a + b, a + b + 1, a + b - 2].map(String)) };
}
function frogHTML() { const st = GM.step % 5; return `<div class="target" id="fq">${esc(GM.fq.text)}</div><div class="pond" id="pond"><div class="shore far">🌳 🏡 🌳</div><div class="fprog">${Array.from({ length: 5 }, (_, i) => `<i class="${i < st ? 'on' : ''}"></i>`).join('')}</div><div class="pads">${GM.fq.opts.map((o, i) => `<button class="lily press" data-a="frog" data-i="${i}"><span>${esc(o)}</span></button>`).join('')}</div><div class="frog" id="frog">🐸</div><div class="shore near"></div></div><p class="deckinfo">Ťukni na leknín so správnou odpoveďou! Breh: ${GM.shores} 🏡</p>`; }
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
VIEWS.games = () => { const p = P(); return `${topbar()}<main class="view"><h1 style="font-size:2rem">Minihry</h1><p class="muted b">Krátke hry na 45 sekúnd podľa tvojho ročníka. Za každú hru dostaneš body na level.</p>${DATA.settings.gameLimit ? `<section class="card gleft ${gamesLeft(p) ? '' : 'none'}"><span style="font-size:1.8rem">${gamesLeft(p) ? '🎟️' : '🌙'}</span><div><b>${gamesLeft(p) ? `Dnes môžeš hrať ešte ${gamesLeft(p)}×` : 'Na dnes už žiadne hry'}</b><span class="muted b" style="display:block;font-size:.85rem">${gamesLeft(p) ? `Denne môžeš hrať ${DATA.settings.gameLimit}× spolu. Potom sa uč 📚` : 'Zajtra sa hry znova odomknú. Zatiaľ sa môžeš učiť.'}</span></div></section>` : ''}${RT_ON() ? `<div class="tiles2"><button class="card tile2 press duelt" data-a="nav" data-v="duel"><span class="i">⚔️</span><b>Súboj s kamarátom</b><span>Kto vie viac? Hrajte naraz na dvoch zariadeniach</span></button><button class="card tile2 press boardt" data-a="nav" data-v="board"><span class="i">🏆</span><b>Rebríček</b><span>Kto získal tento týždeň najviac bodov</span></button></div>` : ''}<div class="gamelist pop-in">${Object.entries(GAMES).map(([k, g]) => `<button class="card gcard press ${gamesLeft(p) ? '' : 'glock'} ${gameLocked(p, k) ? 'gbuy' : ''}" data-a="game" data-g="${k}"><span class="gi" style="background:${g.bg}">${g.i}</span><span><b>${g.n}</b><span>${g.d}</span>${gameLocked(p, k) ? `<span class="gprice">🔒 Odomknúť za ${COIN} ${g.cost}</span>` : `<span style="color:var(--accent)">🏆 Najlepšie: ${p.best[k] || 0}</span>`}</span></button>`).join('')}</div></main>${nav('games')}`; };
let GM = null;
function gamesToday(p) { return p.gp && p.gp.d === today() ? p.gp.n : 0; }
function gamesLeft(p) { const L = DATA.settings.gameLimit; return L ? Math.max(0, L - gamesToday(p)) : Infinity; }
function gameLimitMsg() { const p = P(); sfx('no'); buzz([30, 40, 30]); const w = document.createElement('div'); w.className = 'over'; w.innerHTML = `<div class="card box"><div style="font-size:4rem;line-height:1">🌙</div><h2>Na dnes stačilo hier!</h2><p class="b muted">Dnes si už zahral(a) ${DATA.settings.gameLimit} ${plural(DATA.settings.gameLimit, 'minihru', 'minihry', 'miníhier')}. Zajtra môžeš znova. Zatiaľ sa môžeš učiť a zbierať slniečka 📚</p><button class="btn primary block" data-a="ov-learn">📚 Ísť sa učiť</button><button class="btn block" data-a="ov-close">OK</button></div>`; document.body.appendChild(w); }
function startGame(k, d) { const pp = P(); if (!d) return pickDiff(k); pp.gdiff = pp.gdiff || {}; pp.gdiff[k] = d; if (gamesLeft(pp) <= 0) return gameLimitMsg(); pp.gp = { d: today(), n: gamesToday(pp) + 1 }; save(); const g = pp.grade; GM = { k, g, d, score: 0, lives: 3, left: 45, combo: 0 }; if (k === 'balloons') { GM.target = balloonTarget(g); GM.hits = 0; } if (k === 'rain') GM.setup = rainSetup(g); if (k === 'tf') GM.st = makeStatement(g); if (k === 'mole') GM.rule = moleRule(g); if (k === 'word') { GM.left = 60; wordNext(); } if (k === 'order') { GM.left = 60; orderNext(); } if (k === 'simon') { GM.left = 90; GM.seq = [R(0, 3), R(0, 3)]; GM.in = 0; GM.lockIn = true; } if (k === 'race') { GM.left = 75; GM.pos = 0; GM.bot = 0; GM.rq = frogQ(g); } if (k === 'frog') { GM.step = 0; GM.shores = 0; GM.fq = frogQ(g); GM.left = 60; } go('game', {}, 'u'); }
VIEWS.game = () => {
  const head = `<div class="qtop"><button class="iconbtn press" data-a="quit-game" aria-label="Ukončiť">✕</button><span class="hearts" id="hearts">${'❤️'.repeat(GM.lives)}${'🤍'.repeat(3 - GM.lives)}</span><div style="flex:1"></div><span class="timer dtag">${DF().e}</span><span class="timer" id="gscore">⭐ ${GM.score}</span><span class="timer" id="gtime">${GM.left} s</span></div>`;
  if (GM.k === 'balloons') return `<main class="view nonav">${head}<div class="target" id="gtarget">Praskni balóny s výsledkom <b>${GM.target}</b></div><div class="gamearea" id="garea"></div></main>`;
  if (GM.k === 'rain') return `<main class="view nonav">${head}<div class="target">${GM.setup.title}<div class="hint">${GM.setup.hint}</div></div><div class="gamearea rain" id="garea"></div></main>`;
  if (GM.k === 'mole') return `<main class="view nonav">${head}<div class="target">${GM.rule.t}</div><div class="holes" id="holes">${Array.from({ length: 9 }, (_, i) => `<div class="hole"><button class="mole" data-a="mole" data-i="${i}" id="mole${i}" aria-label="Škrečok"><span class="mface">🐹</span><span class="mlab"></span></button><span class="dirt"></span></div>`).join('')}</div><p class="deckinfo">Ťukni rýchlo, kým sa škrečok schová!</p></main>`;
  const qb = '<div class="qbarw"><i id="qbar"></i></div>';
  if (GM.k === 'frog') return `<main class="view nonav">${head}${qb}<div id="fwrap">${frogHTML()}</div></main>`;
  if (GM.k === 'order') return `<main class="view nonav">${head}<div class="qbarw"><i id="qbar"></i></div><div id="ordwrap" style="display:flex;flex-direction:column;gap:12px">${orderHTML()}</div></main>`;
  if (GM.k === 'simon') return `<main class="view nonav">${head}<p class="deckinfo" id="simoninfo">👀 Pozeraj sa…</p><div class="simon" id="simon">${SIMC.map((c, i) => `<button class="spad" data-a="simon-pad" data-i="${i}" style="--c:${c}" aria-label="Farba ${i + 1}"></button>`).join('')}</div><p class="deckinfo">Každé kolo pribudne jedna farba.</p></main>`;
  if (GM.k === 'race') return `<main class="view nonav">${head}<section class="card track"><div class="lane"><span class="car" id="carme" style="left:${GM.pos * 8.4}%">🏎️</span><i>🏁</i><small>Ty</small></div><div class="lane"><span class="car" id="carbot" style="left:${GM.bot * 8.4}%">🚙</span><i>🏁</i><small>Súper</small></div></section><div id="raceq" style="display:flex;flex-direction:column;gap:12px"></div></main>`;
  if (GM.k === 'word') return `<main class="view nonav">${head}${qb}<div id="wordwrap" style="display:flex;flex-direction:column;gap:14px">${wordHTML()}</div></main>`;
  return `<main class="view nonav">${head}${qb}<p class="deckinfo">Je to pravda?</p><section class="card tfcard enter" id="tfcard">${esc(GM.st.text)}</section><div class="tfbtns"><button class="yes press" data-a="tf" data-v="1" aria-label="Pravda">✓</button><button class="no press" data-a="tf" data-v="0" aria-label="Nepravda">✗</button></div><p class="deckinfo" id="tfex">&nbsp;</p></main>`;
};
AFTER.game = () => {
  TIMERS.push(setInterval(() => { GM.left--; const t = $('#gtime'); if (t) { t.textContent = GM.left + ' s'; t.classList.toggle('low', GM.left <= 10); } if (GM.left <= 0) endGame(); }, 1000));
  const area = $('#garea');
  const BC = ['#FFB3CF', '#9CC9FF', '#B8E35A', '#FFD84D', '#C9B5FF', '#86E3C9', '#FF9F45'];
  if (GM.k === 'balloons') TIMERS.push(setInterval(() => {
    const good = Math.random() < .45; const e = balloonExpr(GM.g, GM.target, good);
    const b = document.createElement('button'); b.className = 'balloon'; b.dataset.a = 'balloon'; b.dataset.v = e.good ? GM.target : 'x'; b.textContent = e.text;
    b.style.left = R(2, 72) + '%'; b.style.background = pick(BC); b.style.animationDuration = ((GM.g >= 3 ? 7 : 6.2) + Math.random() * 1.5) * DF().sp + 's';
    b.addEventListener('animationend', () => b.remove()); area.appendChild(b);
  }, 850 * Math.min(1.5, DF().sp)));
  if (GM.k === 'mole') TIMERS.push(setInterval(() => {
    const free = [...Array(9).keys()].filter(i => !$('#mole' + i).classList.contains('up')); if (!free.length) return;
    const i = pick(free); const m = $('#mole' + i); const it = GM.rule.gen();
    m.querySelector('.mlab').textContent = it.x; m.dataset.good = it.good ? 1 : 0; m.classList.remove('hit', 'miss'); m.classList.add('up');
    const stay = Math.max(1100, 1900 - GM.g * 150) * DF().sp;
    TIMERS.push(setTimeout(() => m.classList.remove('up'), stay));
  }, Math.max(600, 950 - GM.g * 70) * DF().sp));
  if (GM.k === 'rain') TIMERS.push(setInterval(() => {
    const it = GM.setup.item(); const d = document.createElement('button'); d.className = 'drop'; d.dataset.a = 'drop'; d.dataset.good = it.good ? 1 : 0; d.textContent = it.text;
    d.style.left = R(2, 62) + '%'; d.style.animationDuration = (5 + Math.random() * 1.8) * DF().sp + 's'; d.addEventListener('animationend', () => d.remove()); area.appendChild(d);
  }, 950 * Math.min(1.5, DF().sp)));
  if (GM.k === 'tf') qTimer(tfOut);
  if (GM.k === 'frog') qTimer(frogOut);
  if (GM.k === 'word') qTimer(wordOut, 2.4);
  if (GM.k === 'order') qTimer(orderOut, 3);
  if (GM.k === 'simon') TIMERS.push(setTimeout(simonPlay, 500));
  if (GM.k === 'race') { raceDraw(true); TIMERS.push(setInterval(() => { if (!GM || GM.ended || GM.busy) return; GM.bot++; raceDraw(false); if (GM.bot >= 10) { GM.busy = true; gHit(false, $('#carbot')); toast('Súper bol rýchlejší. Skús to znova!'); if (GM.ended) return; TIMERS.push(setTimeout(() => { if (!GM || GM.ended) return; GM.pos = 0; GM.bot = 0; GM.busy = false; raceDraw(true); }, 1100)); } }, Math.max(1300, 3000 * DF().sp))); }
};
function gHit(ok, el) {
  const s = $('#gscore');
  if (ok) { GM.score++; GM.combo++; sfx(GM.k === 'balloons' ? 'balloon' : 'ok'); buzz(10); floatXp(el, '+1'); burst(el, 16); }
  else { GM.lives--; GM.combo = 0; sfx('no'); buzz([30, 40, 30]); const h = $('#hearts'); if (h) { h.textContent = '❤️'.repeat(Math.max(0, GM.lives)) + '🤍'.repeat(3 - Math.max(0, GM.lives)); h.style.animation = 'none'; void h.offsetWidth; h.style.animation = 'shake .45s'; } }
  if (s) s.textContent = '⭐ ' + GM.score;
  if (GM.lives <= 0) endGame();
}
function endGame() {
  if (!GM || GM.ended) return; GM.ended = true; clearTimers(); const p = P(); const before = p.xp; const g = Math.round(Math.min(80, 10 + GM.score * 4) * DF().xp);
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
  else html = (WCAT === 'pet' && itemOf('pet', p.av.pet).e ? `<section class="card colorbox"><b>Meno zvieratka</b><div style="display:flex;gap:8px"><input class="field" id="petname" maxlength="14" style="font-size:1.15rem;padding:8px 12px" value="${esc(petName(p.av))}"><button class="btn small" data-a="petname">Uložiť</button></div></section>` : '') + `<div class="items">${list.map((it, i) => { const u = unlocked(it, p); return `<button class="item press ${p.av[WCAT] === it.id ? 'on' : ''} ${u ? '' : 'lock'}" data-a="wear" data-i="${it.id}" style="animation:popin .35s ${i * 30}ms backwards cubic-bezier(.3,1.6,.5,1)">${itemThumb(WCAT, it, p.av)}${u ? '' : `<span class="lk"><b>🔒</b>${lockLabel(it)}</span>`}<span class="lab">${it.n || ''}</span></button>`; }).join('')}</div>`;
  const slots = COLOR_SLOTS[WCAT];
  if (slots && !(WCAT === 'acc' && p.av.acc === 'nic') && !(WCAT === 'bgp' && p.av.bgp === 'vesmir')) {
    html += `<section class="card colorbox">${slots.map(([slot, label, pal]) => { const curr = slot === 'bg' ? p.av.bg : p.av.col[slot]; return `<b>${label}</b><div class="swatches">${pal.filter(it => !it.g || it.g === p.av.gender).map(it => { const u = unlocked(it, p); return `<button class="sw press ${curr === it.id ? 'on' : ''} ${u ? '' : 'lock'} ${it.c === 'RAINBOW' ? 'rb' : ''}" style="background:${it.c}" data-a="color" data-s="${slot}" data-i="${it.id}" aria-label="${it.n || 'farba'}${u ? '' : ', ' + lockLabel(it)}"></button>`; }).join('')}</div>`; }).join('')}</section>`;
  }
  return html;
}
function refreshWard(jump) { const p = P(); $('#wfig').innerHTML = roomHTML(p.room) + avatarSvg(p.av, { cls: 'idle' + (jump ? ' jump' : ''), noBg: true }); const sc = scrollY; $('#witems').innerHTML = wardItems(); scrollTo(0, sc); const hb = $('.headbub'); if (hb) hb.innerHTML = avatarSvg(p.av, { crop: 'head' }); }
function wear(id) {
  const p = P(); const it = itemOf(WCAT, id);
  if (!unlocked(it, p)) { sfx('no'); toast(it.price ? `🛍️ Kúp si to v obchode za ${it.price} slniečok` : `🔒 Odomkneš: ${lockLabel(it)}`); const el = $(`[data-a="wear"][data-i="${id}"]`); if (el) { el.style.animation = 'none'; void el.offsetWidth; el.style.animation = 'shake .45s'; } return; }
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
  else body = `<p class="muted b" style="font-size:.88rem">Každý úspech má 3 medaily: 🥉 bronz, 🥈 striebro a 🥇 zlato. Za každú medailu dostaneš slniečka!</p><div class="achlist pop-in">${ACH.map(a => { const t = achTier(p, a); const v = a.m(p) || 0; const next = a.t[t]; const prev = t ? a.t[t - 1] : 0; const pct = next ? Math.min(100, (v - prev) / (next - prev) * 100) : 100; return `<div class="card ach ${t ? 't' + t : 'off'}"><span class="ai">${a.i}</span><div class="ab"><b>${a.n}</b><span>${a.d}${next ? `: ${v} / ${next}` : ': všetko splnené!'}</span><div class="pbar"><i style="width:${pct}%"></i></div></div><span class="amed">${MEDAL.map((m, k) => `<i class="${k < t ? 'on' : ''}">${m}</i>`).join('')}</span></div>`; }).join('')}</div>`;
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
  if (DATA.settings.chat && !CHAT_ON()) return `${topbar('home')}<main class="view"><section class="card duelbox">${bearSvg('')}<h2>AI Bystrík ešte spí</h2><p class="muted b">Aby vedel odpovedať na otázky, musí ho rodič raz zapnúť. Je to zadarmo a trvá to asi 2 minúty.</p><div class="gethow" style="text-align:left;width:100%;box-sizing:border-box"><b>Pre rodiča</b><p>1. Otvorte <b>Rodičovský účet</b>.<br>2. Záložka <b>Nastavenia</b> → <b>Účet a AI</b>.<br>3. Ťuknite na <b>Zapnúť AI s návodom</b>.</p></div><button class="btn primary block" data-a="parent-open">👨‍👩‍👧 Otvoriť rodičovský účet</button></section></main>${nav('')}`;
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
  if (!sample) return finish('Teraz ti nemôžem odpovedať. Chat funguje, keď je apka otvorená v Claude alebo keď rodič zadá AI kľúč v rodičovskom účte.');
  const hist = CHAT.msgs.slice(0, -1).slice(-9);
  const msgs = [{ role: 'user', content: tutorIntro(p) + '\n\nZačni rozhovor.' }, { role: 'assistant', content: `Ahoj ${p.name}! Som Bystrík. Na čo sa chceš opýtať?` }];
  hist.forEach(m => { if (m.t) msgs.push({ role: m.r === 'me' ? 'user' : 'assistant', content: m.t }); });
  try { p.stats.chat++; checkBadges(p); save(); const res = await sample(msgs, { cache: false, onText: ({ text }) => { CHAT.msgs[CHAT.msgs.length - 1].t = text; const e = $('#lastbot'); if (e) e.textContent = text; } }); finish(res.text); }
  catch (e) { finish(e && e.code === 'rate_limited' ? 'Musím si chvíľu oddýchnuť. Skús to o pár minút. 🧸' : e && e.code === 'not_granted' ? 'Chat nie je povolený. Popros rodičov, nech ho povolia.' : (e && e.text) || 'Niečo sa pokazilo. Skús to znova.'); }
}

/* --- kalkulačka --- */
let CALC = { cur: '0', acc: null, op: null, fresh: true, hist: '' };
const HELP_TABS = { mat: [['calc', '🧮 Kalkulačka'], ['nasob', '✖️ Násobilka'], ['jedn', '📏 Jednotky']], sjl: [['abc', '🔤 Abeceda'], ['hlasky', '🗣️ Hlásky'], ['vybrane', '🐂 Vybrané slová'], ['druhy', '🏷️ Slovné druhy'], ['vety', '💬 Vety']] };
let HELPTAB = { mat: 'calc', sjl: 'vybrane' };
const VYBRANE = { B: 'by, aby, byť, bydlisko, obyvateľ, byt, bystrý, bylina, kobyla, býk, Bytča', M: 'my, mykať, myslieť, mýliť sa, hmyz, myš, hlemýžď, mydlo, myť, mýto, žmýkať, priemysel, Myjava', P: 'pýcha, pýtať sa, pykať, kopyto, zapýriť sa, pysk, prepych', R: 'ryba, rýchly, ryť, rýpať, rytier, ryšavý, rys, hrýzť, kryť, skrývať, rýdzi, ryža, rýľ, korýtko, Torysa', S: 'syn, sýty, sýkorka, syr, syčať, sychravý, usychať, sypať, sypký', V: 'vy, vysoký, výskať, výr, vydra, vyť, zvykať, vyžla, vyhňa, vy- (predpona)', Z: 'nazývať (pozývať, vyzývať), jazyk, ozývať sa, prezývka', L: 'lyko, lýtko, lyže, plyn, plytký, plytvať, blyšťať sa, lysý, mlyn, slýchať, pomaly, splývať, lykožrút' };
function helpBody(s, t) {
  if (t === 'calc') return `<div class="calcshow" id="calcshow"><small id="calchist">${CALC.hist}</small><span id="calccur">${fmtCalc(CALC.cur)}</span></div><div class="keys c4 ckeys">${['7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '−', 'C', '0', '=', '+'].map(k => `<button class="key ${'÷×−+'.includes(k) ? 'op' : k === '=' ? 'eq' : k === 'C' ? 'del' : ''}" data-a="ck" data-k="${k}">${k}</button>`).join('')}</div>`;
  if (t === 'nasob') return `<div class="htable nasob"><span class="hh">·</span>${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => `<span class="hh">${i}</span>`).join('')}${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(r => `<span class="hh">${r}</span>${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(c => `<span class="${r === c ? 'sq' : ''}">${r * c}</span>`).join('')}`).join('')}</div><p class="hnote">Nájdi riadok a stĺpec. Kde sa stretnú, je výsledok. Napríklad 7 · 8 = 56.</p>`;
  if (t === 'jedn') return `<div class="hcards">${[['📏 Dĺžka', '1 cm = 10 mm<br>1 dm = 10 cm<br>1 m = 100 cm<br>1 km = 1 000 m'], ['⚖️ Hmotnosť', '1 kg = 1 000 g<br>1 t = 1 000 kg'], ['🥛 Objem', '1 l = 10 dl<br>1 l = 1 000 ml'], ['⏰ Čas', '1 min = 60 s<br>1 h = 60 min<br>1 deň = 24 h<br>1 týždeň = 7 dní'], ['💶 Peniaze', '1 € = 100 centov'], ['🟦 Obvod', 'štvorec: 4 · a<br>obdĺžnik: 2 · (a + b)']].map(([h, b]) => `<div><b>${h}</b><span>${b}</span></div>`).join('')}</div>`;
  if (t === 'abc') return `<div class="abcgrid">${'a á ä b c č d ď dz dž e é f g h ch i í j k l ĺ ľ m n ň o ó ô p q r ŕ s š t ť u ú v w x y ý z ž'.split(' ').map(x => `<span>${x}</span>`).join('')}</div><p class="hnote">Slovenská abeceda má 46 písmen. CH je jedno písmeno a je za H.</p>`;
  if (t === 'hlasky') return `<div class="hcards"><div><b>Samohlásky</b><span>a, á, ä, e, é, i, í, o, ó, u, ú, y, ý</span></div><div><b>Dvojhlásky</b><span>ia, ie, iu, ô</span></div><div class="h-t"><b>Tvrdé spoluhlásky → y, ý</b><span>d, t, n, l, g, h, ch, k</span></div><div class="h-m"><b>Mäkké spoluhlásky → i, í</b><span>ď, ť, ň, ľ, c, dz, j, ž, š, č, dž</span></div><div class="h-o"><b>Obojaké spoluhlásky</b><span>b, m, p, r, s, v, z, f<br>y len vo vybraných slovách</span></div><div><b>Rytmický zákon</b><span>Dve dlhé slabiky nesmú ísť za sebou: krásny, nie krásný.</span></div></div>`;
  if (t === 'vybrane') return `<div class="vybr">${Object.entries(VYBRANE).map(([k, v]) => `<div><b>${k}</b><span>${v}</span></div>`).join('')}</div><p class="hnote">Y píšeme aj v slovách príbuzných, napríklad rybár, rybník (od ryba).</p>`;
  if (t === 'druhy') return `<div class="hcards">${[['Podstatné meno', 'kto? čo?', 'mama, pes, škola'], ['Prídavné meno', 'aký? aká? aké? čí?', 'veselý, zelená'], ['Zámeno', 'zastupuje meno', 'ja, ty, on, my'], ['Číslovka', 'koľko? koľký?', 'päť, prvý, dvaja'], ['Sloveso', 'čo robí?', 'beží, píše, spí'], ['Príslovka', 'ako? kde? kedy?', 'rýchlo, doma, zajtra'], ['Predložka', 'stojí pred menom', 'na, v, pod, za'], ['Spojka', 'spája slová', 'a, ale, aby']].map(([n, q, e]) => `<div><b>${n}</b><span><i>${q}</i><br>${e}</span></div>`).join('')}</div>`;
  if (t === 'vety') return `<div class="hcards">${[['Oznamovacia', 'Niečo oznamuje.', 'Vonku prší.', '.'], ['Opytovacia', 'Pýta sa.', 'Kedy prídeš?', '?'], ['Rozkazovacia', 'Rozkazuje alebo prosí.', 'Zatvor dvere!', '!'], ['Želacia', 'Niečo si želá.', 'Keby už bolo leto!', '!']].map(([n, d, e, z]) => `<div><b>${n} <span class="zn">${z}</span></b><span>${d}<br><i>${e}</i></span></div>`).join('')}</div><p class="hnote">Veta začína veľkým písmenom a končí znamienkom.</p>`;
  return '';
}
function openHelp(s) {
  closeSheet(); sfx('whoosh'); const tabs = HELP_TABS[s] || HELP_TABS.mat; const t = HELPTAB[s] || tabs[0][0];
  const w = document.createElement('div'); w.id = 'sheetwrap';
  w.innerHTML = `<div class="calcdock helpdock" role="dialog" aria-label="Pomôcky od Bystríka"><div class="calchead"><span class="hb">${bearSvg('')}<span>Pomôcky od Bystríka</span></span><button class="iconbtn press" data-a="close-sheet" aria-label="Zavrieť pomôcky">✕</button></div><div class="chips htabs">${tabs.map(([k, n]) => `<button class="chip ${k === t ? 'on' : ''}" data-a="help-tab" data-s="${s}" data-t="${k}">${n}</button>`).join('')}</div><div class="hbody" id="hbody">${helpBody(s, t)}</div></div>`;
  document.body.appendChild(w); document.body.classList.add('calcopen'); scrollTo({ top: 0, behavior: 'smooth' });
}
function openCalc() {
  if (!DATA.settings.calc) { peekSay('Pomôcky vypli rodičia. Zvládneš to aj bez nich! 💪', 2400); sfx('tap'); return; }
  const pk = $('.peek'); const subj = (Q && Q.cur && Q.cur.s) || (pk && pk.dataset.s) || 'mat'; return openHelp(subj === 'sjl' ? 'sjl' : 'mat');
  closeSheet(); sfx('whoosh'); const pet = itemOf('pet', P().av.pet);
  const w = document.createElement('div'); w.id = 'sheetwrap';
  w.innerHTML = `<div class="calcdock" role="dialog" aria-label="Kalkulačka"><div class="calchead"><span>${pet.e} Kalkulačka od ${esc(petName(P().av))}</span><button class="iconbtn press" data-a="close-sheet" aria-label="Zavrieť kalkulačku">✕</button></div><div class="calcshow" id="calcshow"><small id="calchist">${CALC.hist}</small><span id="calccur">${fmtCalc(CALC.cur)}</span></div><div class="keys c4 ckeys">${['7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '−', 'C', '0', '=', '+'].map(k => `<button class="key ${'÷×−+'.includes(k) ? 'op' : k === '=' ? 'eq' : k === 'C' ? 'del' : ''}" data-a="ck" data-k="${k}">${k}</button>`).join('')}</div></div>`;
  document.body.appendChild(w); document.body.classList.add('calcopen'); scrollTo({ top: 0, behavior: 'smooth' });
}
const fmtCalc = s => s === 'Chyba' ? s : (s.includes('.') ? s.replace('-', '−').replace('.', ',') : (s.startsWith('-') ? '−' + fmt(s.slice(1)) : fmt(s)));
function calcKey(k) {
  if (Q && UI.view === 'quiz' && Q.cur && !Q.answered && !Q.cur.calcUsed) { Q.cur.calcUsed = true; peekSay('S kalkulačkou dostaneš za tento príklad polovicu bodov.', 2600); }
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
  return `${topbar('home')}<main class="view setv"><h1 style="font-size:2rem">Nastavenia</h1><button class="card parentcard press ${DATA.parentSeen ? '' : 'blink'}" data-a="parent-open"><span class="pci">👨‍👩‍👧</span><span class="grow"><span class="eyebrow">Pre rodičov</span><b>Rodičovský účet${needBackup() ? ' <span class="blinkdot" title="Uložte si zálohu"></span>' : ''}</b><small>Pokrok dieťaťa, úlohy, čítanie a nastavenia. Chráni ho PIN kód.</small></span><span class="pcgo">›</span></button><h3 class="pgroup">👤 Môj profil</h3><section class="card" style="padding:6px 14px"><div class="list">${typeof SUPA_ON === 'function' && SUPA_ON() && AUTH ? `<div class="row" style="flex-direction:column;align-items:flex-start;gap:2px"><span>🔑 Prihlásený účet</span><small class="muted" style="font-weight:700;word-break:break-all">${esc(AUTH.email || '')} · odhlásiť sa dá v rodičovskom účte</small></div>` : ''}<button class="row" data-a="edit-prof"><span class="grow">✏️ Úvodné nastavenie<small class="muted" style="display:block;font-weight:700;font-size:.82rem">Meno, dievča/chlapec, ročník, zvieratko a účes. Body a odmeny zostanú.</small></span><span>›</span></button><button class="row" data-a="nav" data-v="profiles"><span class="grow">👥 Zmeniť hráča alebo pridať nového</span><span>›</span></button><button class="row" data-a="nav" data-v="room"><span class="grow">🖼️ Pozadie za postavičkou</span><span>›</span></button></div></section><h3 class="pgroup">🔊 Zvuk a hlas</h3><section class="card" style="padding:6px 14px"><div class="list">${tg('sound', '🔊 Zvuky')}${tg('voice', '🗣️ Čítanie otázok nahlas')}<div class="row" style="flex-direction:column;align-items:flex-start;gap:6px"><span>${sv === 'sk' ? '✅ Slovenský hlas je v telefóne' : sv === 'cs' ? '⚠️ Slovenský hlas chýba, číta sa českým hlasom' : '⚠️ Slovenský hlas v telefóne chýba'}</span>${sv !== 'sk' ? '<small class="muted" style="font-weight:700">Aby hlas správne čítal mäkčene a dĺžne, nainštalujte slovenský hlas. Android: Nastavenia → Prevod textu na reč → Google → Inštalovať hlasové údaje → Slovenčina. iPhone: Nastavenia → Prístupnosť → Hovorený obsah → Hlasy → Slovenčina.</small>' : ''}<button class="btn small" data-a="voice-test">🔊 Vyskúšať hlas</button></div></div></section><h3 class="pgroup">🎨 Vzhľad</h3><section class="card" style="padding:6px 14px"><div class="list"><div class="row" style="flex-direction:column;align-items:flex-start;gap:6px"><span>🌗 Vzhľad apky</span><div class="seg" style="width:100%">${[['auto', '🔄 Automaticky'], ['light', '☀️ Svetlý'], ['dark', '🌙 Tmavý']].map(([k, n]) => `<button class="${DATA.settings.theme === k ? 'on' : ''}" data-a="theme" data-t="${k}">${n}</button>`).join('')}</div></div><div class="row" style="flex-direction:column;align-items:flex-start;gap:8px"><span>🎨 Farba pozadia apky</span><div class="swatches">${PAGE_BG.map(c => `<button class="sw press ${(DATA.settings.bgc || 'auto') === c[0] ? 'on' : ''} ${c[0] === 'auto' ? 'swauto' : ''}" style="background:${c[0] === 'auto' ? 'var(--bg)' : c[2]};${c[0] === 'cierna' ? 'border-color:#888' : ''}" data-a="set-bg" data-c="${c[0]}" aria-label="${c[1]}" title="${c[1]}"></button>`).join('')}</div></div></div></section><h3 class="pgroup">🧸 Pomoc</h3><section class="card" style="padding:6px 14px"><div class="list"><button class="row" data-a="tour-again"><span class="grow">🧸 Ukáž mi znova návod</span><span>›</span></button></div></section>${installCard()}</main>${nav('')}`;
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
  else if (PIN.mode === 'confirm') { if (PIN.val === PIN.first) { DATA.parent.pin = PIN.val; save(); PARENT_OK = true; toast('PIN uložený ✓'); go('parent', {}, 'f'); if (!DATA.parent.tour) setTimeout(() => { if (UI.view === 'parent' && !GUIDE) showGuide(PTOUR, 0, endPTour); }, 900); } else { PIN.mode = 'create'; PIN.val = ''; bad('PIN sa nezhoduje, skúste znova'); setTimeout(() => render(null), 500); } }
  else { if (PIN.val === DATA.parent.pin) { PARENT_OK = true; sfx('ok'); go('parent', {}, 'f'); if (!DATA.parent.tour) setTimeout(() => { if (UI.view === 'parent' && !GUIDE) showGuide(PTOUR, 0, endPTour); }, 700); } else bad('Nesprávny PIN'); }
}
function parentReads(p) {
  if (!p.readings.length) return `<section class="card pcard"><span class="eyebrow">📖 Čítanie – text a nahrávky</span><p class="muted b" style="padding:8px 0">Zatiaľ žiadne nahrávky. Dieťa ich nahrá v Čítanke. Nahrávky sa ukladajú len v tomto zariadení.</p></section>`;
  const ids = []; p.readings.forEach(x => { if (!ids.includes(x.r)) ids.push(x.r); });
  return `<section class="card pcard"><span class="eyebrow">📖 Čítanie – text a nahrávky</span><p class="muted b" style="font-size:.85rem;padding:4px 0">Pri každom texte vidíte presne to, čo dieťa čítalo, a pod tým jeho čítania a nahrávky. Vypočujte si ich, ohodnoťte a za pekné čítanie dieťa odmeňte (+5 bodov za každé čítanie, slniečka sa takto nedávajú). Dieťa uvidí hodnotenie v Čítanke.</p>${ids.map(rid => { const r = READ[rid]; const recs = p.readings.filter(x => x.r === rid); return `<div class="ptext"><b style="font-family:var(--f-display);font-size:1.1rem">${r ? r.icon + ' ' + r.title : 'Text'} <span class="muted" style="font-size:.85rem">${r ? r.g + '. ročník' : ''}</span></b><div class="ptextbody">${r ? esc(r.text) : ''}</div>${recs.map((x, i) => `<div class="prec"><span class="b">${x.noAudio ? '✅ Prečítal(a) nahlas, bez nahrávky' : '🎙️ Nahrávka'} · ${fmtTime(x.t)}</span>${x.noAudio ? '' : `<div id="aud-${x.id}"><button class="btn small" data-a="play-rec" data-id="${x.id}">▶️ Vypočuť</button></div>`}<div class="chips" style="padding:0">${[3, 2, 1].map(k => `<button class="chip ${x.rating === k ? 'on' : ''}" data-a="rate-rec" data-id="${x.id}" data-r="${k}">${RATE[k]}</button>`).join('')}<button class="chip" data-a="del-rec" data-id="${x.id}" aria-label="Vymazať nahrávku">🗑️</button></div>${x.rewarded ? '<span class="b" style="color:var(--good);font-size:.85rem">🎁 Odmenené +5 bodov</span>' : `<button class="btn small primary" data-a="reward-rec" data-id="${x.id}">🎁 Odmeniť za čítanie (+5 bodov)</button>`}</div>`).join('')}</div>`; }).join('')}</section>`;
}
function checkPTasks(p, id, stars) {
  (p.ptasks || []).forEach(t => { if (!t.done && t.topic === id && stars >= t.stars) { t.done = Date.now(); p.coins = (p.coins || 0) + t.coins; p.log.unshift({ t: Date.now(), k: 'ptask', id, c: t.coins, n: t.stars }); setTimeout(() => achPop({ i: '📋', n: 'Úloha od rodiča splnená!', d: TOPIC[id].name, t: [t.coins] }, 0, t.coins), 1200); } });
}
const ONLINE = () => typeof SUPA_ON === 'function' && SUPA_ON() && !!AUTH;
const needBackup = () => !(typeof SUPA_ON === 'function' && SUPA_ON() && AUTH) && DATA.profiles.some(p => p.xp > 0) && (!DATA.backupAt || Date.now() - DATA.backupAt > 7 * DAYMS);
let RESTORE = false;
/* Návod na AI kľúč */
let AIG = 0;
const AIG_STEPS = [
  { t: 'Zapneme Bystríkovi mozog! 🧠', say: 'Ahoj! Pomôžem vám zapnúť moju umelú inteligenciu. Je to zadarmo a zaberie to asi dve minúty.', body: () => `<div class="aigpic"><div class="aigfree"><b>0 €</b><span>bez karty</span></div><div class="aigfree"><b>2 min</b><span>raz na zariadenie</span></div></div><p>Potrebujete len <b>Google účet</b> (ten istý ako na Gmail alebo YouTube).</p>` },
  { t: '1. Otvorte Google AI Studio', say: 'Ťuknite na tlačidlo Otvoriť Google AI Studio a prihláste sa svojím Google účtom. Ak sa niečo spýta, potvrďte podmienky.', body: () => `<a class="btn primary" href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">🌐 Otvoriť Google AI Studio</a><div class="aigmock"><div class="mbar">aistudio.google.com</div><div class="mrow"><span class="mlogo">Google AI Studio</span></div><p class="mtxt">Prihláste sa Google účtom a ak treba, odsúhlaste podmienky (<b>I agree / Continue</b>).</p></div><p class="muted">Otvorí sa v novej karte. Potom sa sem vráťte.</p>` },
  { t: '2. Vytvorte kľúč', say: 'Vpravo hore ťuknite na Create API key. Ak už tam kľúč v zozname máte, tento krok preskočte.', body: () => `<div class="aigmock"><div class="mbar">API Keys</div><div class="mrow" style="justify-content:flex-end"><span class="mbtn pulse">🔑 Create API key</span></div><div class="mrow mlist"><span>…abcd<br><small>Default Gemini API Key</small></span><span class="mfree">Free tier</span></div></div><p>Ťuknite na <b>Create API key</b>. Ak už kľúč v zozname vidíte, pokračujte ďalej.</p><p class="aigwarn">⚠️ Na <b>Set up billing</b> neklikajte, zadarmo to stačí.</p>` },
  { t: '3. Skopírujte kľúč', say: 'Pri kľúči ťuknite na ikonku dvoch štvorčekov. Tým sa kľúč skopíruje.', body: () => `<div class="aigmock"><div class="mbar">API Keys</div><div class="mrow mlist"><span>…abcd<br><small>Default Gemini API Key</small></span><span class="mico pulse">⧉</span><span class="mico">$</span><span class="mico">⋮</span></div></div><p>Pri kľúči ťuknite na ikonku <b>dvoch štvorčekov ⧉</b> (Copy). Na telefóne môže byť skrytá pod <b>⋮</b>.</p>` },
  { t: '4. Vložte kľúč sem', say: 'Vráťte sa sem a ťuknite na Vložiť. Potom na Uložiť a vyskúšať. Hotovo!', body: () => `<input class="field" id="aigkey" type="password" autocomplete="off" placeholder="Sem vložte kľúč" style="font-size:1rem;padding:12px;text-align:left"><div class="rowbtns" style="grid-template-columns:1fr 1fr"><button class="btn" data-a="aig-paste">📋 Vložiť</button><button class="btn primary" data-a="aig-save">✅ Uložiť a vyskúšať</button></div><p class="muted" id="aigmsg">Kľúč zostane len v tomto zariadení. Nikomu ho neposielajte.</p>` }
];
function aiGuide(i) {
  AIG = Math.max(0, Math.min(AIG_STEPS.length - 1, i)); const st = AIG_STEPS[AIG];
  let o = $('#aigover'); if (!o) { o = document.createElement('div'); o.className = 'over aigover'; o.id = 'aigover'; document.body.appendChild(o); }
  o.innerHTML = `<div class="box card aigbox"><div class="aighead">${bearSvg('talking')}<div class="aigdots">${AIG_STEPS.map((_, k) => `<i class="${k === AIG ? 'on' : k < AIG ? 'done' : ''}"></i>`).join('')}</div><button class="iconbtn press" data-a="aig-close" aria-label="Zavrieť">✕</button></div><h2>${st.t}</h2><div class="aigbody">${st.body()}</div><div class="rowbtns" style="grid-template-columns:${AIG ? '1fr 2fr' : '1fr'}">${AIG ? '<button class="btn" data-a="aig-go" data-i="-1">← Späť</button>' : ''}${AIG < AIG_STEPS.length - 1 ? `<button class="btn primary" data-a="aig-go" data-i="1">${AIG ? 'Hotovo, ďalej →' : 'Poďme na to →'}</button>` : ''}</div></div>`;
  try { say(st.say); } catch (e) { }
  setTimeout(() => { const b = $('#aigover .bear'); if (b) b.classList.remove('talking'); }, Math.min(6000, st.say.length * 70));
}
async function readClip() { try { return ((await navigator.clipboard.readText()) || '').trim(); } catch (e) { return ''; } }
function aiCard() {
  if (window.claude && window.claude.use) return '';
  const has = !!getApiKey();
  return `<section class="card pcard aicard"><span class="eyebrow">🧸 Bystrík (AI) na webe</span>${has ? '<p class="b" style="color:var(--good);font-size:.9rem;padding:4px 0">✅ AI kľúč je uložený. Chat, „Vysvetli mi to“ a Moje poznámky fungujú.</p>' : '<p class="b" style="font-size:.9rem;padding:4px 0">Zapnite chat s Bystríkom, vysvetľovanie chýb a čítanie poznámok z fotiek.</p>'}
  ${has ? '' : '<button class="btn primary aiguidebtn" data-a="ai-guide">▶️ Zapnúť AI s návodom</button><p class="muted b" style="font-size:.8rem;text-align:center;margin:6px 0 10px">Zadarmo · bez platobnej karty · asi 2 minúty</p>'}
  <input class="field" id="aikey" type="password" autocomplete="off" placeholder="${has ? '•••••••• (uložený)' : 'Sem vložte kľúč'}" style="font-size:1rem;padding:10px 12px;text-align:left">
  <div class="bkbtns" style="margin-top:8px"><button class="btn small" data-a="ai-paste">📋 Vložiť</button><button class="btn small primary" data-a="ai-save">💾 Uložiť</button>${has ? '<button class="btn small" data-a="ai-test">🔎 Otestovať</button><button class="btn small" data-a="ai-link">📲 Odkaz pre ďalší telefón</button><button class="btn small" data-a="ai-del">🗑️ Odstrániť</button>' : ''}</div>
  <p class="muted b" style="font-size:.78rem">Kľúč zostane len v tomto zariadení a nie je v zálohe. S bezplatným kľúčom Google má Bystrík denný limit otázok. Google môže otázky z bezplatnej verzie použiť na zlepšovanie svojej AI, preto deti nech nepíšu osobné údaje. Kto má prístup k tomuto telefónu, môže kľúč používať.</p></section>`;
}
function backupCard() {
  const nb = needBackup(); const inClaude = !!(window.claude && window.claude.use);
  return `<section class="card pcard backup ${nb ? 'blink' : ''}"><span class="eyebrow">☁️ Ulož si postup</span>${nb ? '<p class="b" style="color:var(--bad);font-size:.9rem;padding:4px 0">⚠️ Zatiaľ nemáte zálohu. Ak sa vymažú údaje prehliadača alebo prejdete na iný telefón, deti by prišli o levely, slniečka a oblečenie.</p>' : (DATA.backupAt ? `<p class="b" style="color:var(--good);font-size:.9rem;padding:4px 0">✅ Posledná záloha: ${fmtTime(DATA.backupAt)}</p>` : '<p class="muted b" style="font-size:.9rem;padding:4px 0">Zatiaľ nemáte zálohu.</p>')}
  ${typeof SUPA_ON === 'function' && SUPA_ON() && AUTH ? '<p class="b" style="color:var(--good);font-size:.9rem;padding:4px 0">✅ Ste prihlásení, postup sa ukladá online sám. Záloha je len poistka navyše.</p>' : ''}
  <div class="bkinfo"><div><b>Čo je záloha?</b><p>Kópia celého postupu: všetci hráči, levely, slniečka, oblečenie a nastavenia. Má podobu dlhého kódu alebo súboru. Nahrávky čítania v nej nie sú.</p></div><div><b>Kde sa uloží?</b><p>Len tam, kam si ju uložíte vy, napríklad do e-mailu, poznámok alebo ako súbor. Apka ju sama nikam neposiela.</p></div><div><b>Kedy sa zíde?</b><p>Pri novom telefóne alebo keď sa vymažú údaje prehliadača. Bez zálohy${typeof SUPA_ON === 'function' && SUPA_ON() && AUTH ? ' a bez prihlásenia' : ''} by sa postup stratil.</p></div><div><b>Ako ju obnovím?</b><p>Tu ťuknite na „Obnoviť zo zálohy“ a vložte uložený kód${inClaude ? '' : ' alebo vyberte súbor'}. Postup v tomto zariadení sa nahradí tým zo zálohy.</p></div></div>
  <div class="bkbtns"><button class="btn small primary" data-a="bk-copy">📋 Skopírovať kód zálohy</button>${inClaude ? '' : '<button class="btn small" data-a="bk-file">💾 Stiahnuť súbor</button>'}<button class="btn small" data-a="bk-restore">📥 Obnoviť zo zálohy</button></div>
  <textarea id="bkcode" class="bkcode" readonly hidden></textarea>
  ${RESTORE ? `<div class="bkrestore"><b>Vložte kód zálohy${inClaude ? '' : ' alebo vyberte súbor'}:</b><textarea id="bkin" class="bkcode" placeholder="Sem vložte kód…"></textarea>${inClaude ? '' : '<input type="file" id="bkfile" accept=".txt,.json,text/plain,application/json">'}<p class="muted b" style="font-size:.8rem">Pozor: obnovenie nahradí všetkých hráčov na tomto zariadení.</p><div class="rowbtns"><button class="btn" data-a="bk-cancel">Zrušiť</button><button class="btn primary" data-a="bk-apply">Obnoviť</button></div></div>` : ''}</section>`;
}
async function makeBackup() {
  const json = JSON.stringify({ app: 'bystrik', v: 1, t: Date.now(), data: { ...DATA, t: undefined } });
  try { if (window.CompressionStream) { const cs = new Blob([json]).stream().pipeThrough(new CompressionStream('gzip')); const buf = new Uint8Array(await new Response(cs).arrayBuffer()); let bin = ''; for (let i = 0; i < buf.length; i += 8192) bin += String.fromCharCode.apply(null, buf.subarray(i, i + 8192)); return 'BYS1:' + btoa(bin); } } catch (e) { }
  return 'BYS0:' + btoa(unescape(encodeURIComponent(json)));
}
async function readBackup(code) {
  code = (code || '').trim().replace(/\s+/g, '');
  if (code.startsWith('{')) return JSON.parse(code);
  if (code.startsWith('BYS0:')) return JSON.parse(decodeURIComponent(escape(atob(code.slice(5)))));
  if (code.startsWith('BYS1:')) { const bin = atob(code.slice(5)); const buf = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i); const ds = new Blob([buf]).stream().pipeThrough(new DecompressionStream('gzip')); return JSON.parse(await new Response(ds).text()); }
  throw new Error('bad');
}
function dailySeq(p) {
  const since = Date.now() - 4 * DAYMS; const recent = [];
  for (const l of p.log) { if (l.t < since) break; if (l.id && TOPIC[l.id] && TOPIC[l.id].g > 0 && !recent.includes(l.id)) recent.push(l.id); if (recent.length >= 3) break; }
  const grade = ALL_TOPICS.filter(t => t.g === p.grade).map(t => t.id);
  const base = recent.length ? recent : shuffle(grade).slice(0, 3);
  const seq = [];
  for (let i = 0; i < 5; i++) seq.push(base[i % base.length]);
  for (let i = 0; i < 3; i++) seq.push('gk');
  for (let i = 0; i < 2; i++) seq.push(pick(grade));
  return shuffle(seq);
}
function giftsToday(p) { const t = today(); return (p.log || []).filter(l => l.k === 'gift' && dkey(new Date(l.t)) === t).length; }
let VIEWDATA = null, PSEL_SAVED = null;
VIEWS.remote = () => { const saved = DATA, ok = PARENT_OK; DATA = VIEWDATA; PARENT_OK = true; if (!DATA.profiles.find(x => x.id === PSEL)) PSEL = DATA.current || (DATA.profiles[0] && DATA.profiles[0].id); let html; try { html = VIEWS.parent(); } finally { DATA = saved; PARENT_OK = ok; } return `<div class="remotebar">👀 Len na pozretie: postup z iného zariadenia (záloha z ${fmtTime(VIEWDATA._at || Date.now())})<button class="btn small" data-a="remote-close">Zavrieť</button></div><div class="readonly">${html}</div>`; };
const KIND = { 'game-order': 'Minihra Zoraď čísla', 'game-simon': 'Minihra Pamätaj si', 'game-race': 'Minihra Počtové preteky', rread: 'Odmena od rodiča za čítanie', dict: 'Diktát', 'game-word': 'Minihra Poskladaj slovo', 'game-frog': 'Minihra Žabka', review: 'Opakovanie chýb', write: 'Písanie prstom', duel: 'Súboj', test: 'Test', ptask: 'Splnená úloha od rodiča', gift: 'Odmena od rodiča', 'game-mole': 'Minihra Chyť škrečka', read: 'Čítanka – nahrávka', readq: 'Čítanka – otázky', quiz: 'Kvíz', time: 'Na čas', daily: 'Denná výzva', cards: 'Kartičky', pex: 'Pexeso', match: 'Spájačka', sort: 'Triedička', 'game-balloons': 'Minihra Balóny', 'game-rain': 'Minihra Slovný dážď', 'game-tf': 'Minihra Pravda či nie' };
function fmtTime(t) { const d = new Date(t); const k = dkey(d); const hm = `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`; return k === today() ? `dnes ${hm}` : k === daysAgo(1) ? `včera ${hm}` : `${d.getDate()}. ${d.getMonth() + 1}. ${hm}`; }
let PTAB = 'over'; let PS = null; const PACC = {};
let PLOCKT = null; const plockArm = () => { clearTimeout(PLOCKT); if (typeof PARENT_OK !== 'undefined' && PARENT_OK) PLOCKT = setTimeout(() => { if (PARENT_OK && ['parent', 'remote'].includes(UI.view)) { PARENT_OK = false; go(P() ? 'home' : 'profiles', {}, 'b'); toast('🔒 Rodičovský účet sa sám zamkol.'); } }, 180000); };
['pointerdown', 'keydown'].forEach(ev => document.addEventListener(ev, plockArm, true));
document.addEventListener('visibilitychange', () => { if (document.hidden && typeof PARENT_OK !== 'undefined' && PARENT_OK && ['parent', 'remote'].includes(UI.view)) { PARENT_OK = false; go(P() ? 'home' : 'profiles', {}, 'b'); } });
function paccWrap(html, tab, openFirst) {
  const parts = html.split('<h3 class="pgroup">'); let out = parts[0];
  parts.slice(1).forEach((part, n) => { const e = part.indexOf('</h3>'); const title = part.slice(0, e); let rest = part.slice(e + 5); let sub = ''; const m = rest.match(/^<p class="pgsub">([^<]*)<\/p>/); if (m) { sub = m[1]; rest = rest.slice(m[0].length); } const k = tab + n; const todo = rest.includes('backup blink'); const open = k in PACC ? PACC[k] : (todo || (openFirst && n === 0)); out += `<details class="pacc ${todo ? 'todo' : ''}" data-k="${k}" ${open ? 'open' : ''}><summary><span class="pt">${title}${todo ? ' <span class="blinkdot"></span>' : ''}${sub ? `<small>${todo ? '👉 Tu treba uložiť zálohu postupu' : sub}</small>` : ''}</span><i>›</i></summary><div class="paccb">${rest}</div></details>`; });
  return out;
}
document.addEventListener('toggle', e => { const d = e.target; if (d && d.matches && d.matches('details.pacc')) PACC[d.dataset.k] = d.open; }, true);
const PROLES = [['mama', '👩 Mama'], ['otec', '👨 Otec'], ['stary', '🧓 Starý rodič'], ['ine', '🙂 Iné']];
VIEWS.psetup = () => {
  if (!PS) PS = { step: 0, name: DATA.parent.name || '', role: DATA.parent.role || 'mama', goal: DATA.parent.goal || 2, edit: !!DATA.parent.pin };
  const dots = `<div class="aigdots" style="max-width:160px;margin:0 auto">${[0, 1, 2].map(i => `<i class="${i === PS.step ? 'on' : i < PS.step ? 'done' : ''}"></i>`).join('')}</div>`;
  const body = PS.step === 0 ? `<h1 class="logintitle">Účet pre rodiča</h1><p class="muted b" style="text-align:center">Tu uvidíte, ako sa dieťaťu darí, a nastavíte mu úlohy, odmeny a pravidlá. Zaberie to minútu.</p><section class="card loginbox"><label class="lbl" for="psname">Ako vás máme oslovovať?</label><input class="field" id="psname" maxlength="20" autocomplete="given-name" placeholder="Vaše meno" value="${esc(PS.name)}"><span class="lbl">Kto ste pre dieťa?</span><div class="chips" style="flex-wrap:wrap">${PROLES.map(([k, n]) => `<button class="chip ${PS.role === k ? 'on' : ''}" data-a="ps-role" data-r="${k}">${n}</button>`).join('')}</div><p class="loginmsg" id="psmsg"></p><button class="btn primary block" data-a="ps-next">Pokračovať →</button></section>`
    : PS.step === 1 ? `<h1 class="logintitle">Denný cieľ</h1><p class="muted b" style="text-align:center">Koľko zadaní denne je pre dieťa akurát? Zadanie je jeden kvíz, hra, čítanie alebo písanie. Cieľ uvidíte v týždennom prehľade.</p><section class="card loginbox"><div class="goalgrid">${[[1, 'Pohodový', '1 zadanie'], [2, 'Akurát', '2 zadania'], [3, 'Usilovný', '3 zadania'], [5, 'Šampión', '5 zadaní']].map(([n, t, d]) => `<button class="goal press ${PS.goal === n ? 'on' : ''}" data-a="ps-goal" data-n="${n}"><b>${t}</b><span>${d} denne</span></button>`).join('')}</div><button class="btn primary block" data-a="ps-next">Pokračovať →</button></section>`
      : `<h1 class="logintitle">${PS.edit ? 'Uložené!' : 'Ešte PIN'}</h1><p class="muted b" style="text-align:center">${PS.edit ? 'Údaje sú zmenené.' : `Ďakujeme, ${esc(PS.name)}. Posledný krok: 4-miestny PIN, aby sa do rodičovskej časti nedostali deti.`}</p><section class="card loginbox"><div class="pssum"><div><span>Meno</span><b>${esc(PS.name)}</b></div><div><span>Kto ste</span><b>${(PROLES.find(x => x[0] === PS.role) || PROLES[0])[1]}</b></div><div><span>Denný cieľ</span><b>${PS.goal} ${plural(PS.goal, 'zadanie', 'zadania', 'zadaní')}</b></div>${typeof AUTH !== 'undefined' && AUTH && AUTH.email ? `<div><span>E-mail</span><b style="word-break:break-all">${esc(AUTH.email)}</b></div>` : ''}</div><button class="btn primary block" data-a="ps-done">${PS.edit ? 'Hotovo' : '🔐 Vytvoriť PIN'}</button></section>`;
  return `<main class="view nonav loginv"><button class="iconbtn press" data-a="ps-back" aria-label="Späť" style="align-self:flex-start">←</button><div class="loginbear" style="width:110px;height:110px">${bearSvg('')}</div>${dots}${body}</main>`;
};
VIEWS.parent = () => {
  if (!PARENT_OK && !DATA.parent.pin && !DATA.parent.name) { UI.view = 'psetup'; return VIEWS.psetup(); }
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
  const T_over = () => `${weekCard(p)}<h3 class="pgroup">📊 Čísla a graf</h3><p class="pgsub">Úspešnosť, séria, slniečka, odpovede za 7 dní</p><div class="ptiles"><div class="card ptile"><b>${acc} %</b><span>úspešnosť odpovedí</span></div><div class="card ptile"><b>${p.stats.correct}</b><span>správnych z ${p.stats.answered}</span></div><div class="card ptile"><b>🔥 ${p.streak.count}</b><span>dní po sebe (najviac ${p.streak.best || 0})</span></div><div class="card ptile"><b>${active30}</b><span>aktívnych dní za 30 dní</span></div><div class="card ptile"><b>${COIN} ${p.coins || 0}</b><span>slniečok, ${p.owned.length} vecí kúpených v obchode</span></div><div class="card ptile"><b>📖 ${p.readings.length}</b><span>nahrávok čítania (${p.readings.filter(x => !x.rating).length} čaká na vypočutie)</span></div></div>
  <section class="card pcard"><span class="eyebrow">Odpovede za posledných 7 dní</span><div class="chart">${days.map(d => `<div class="bar"><i style="height:${d.v / mx * 100}%;${d.v ? '' : 'background:var(--line)'}"><em>${d.v || ''}</em></i>${d.n}</div>`).join('')}</div></section>
  <h3 class="pgroup">📚 Na čom pracuje a čo precvičiť</h3><p class="pgsub">Posledné témy, silné a slabé miesta</p><section class="card pcard"><span class="eyebrow">Na čom teraz pracuje</span>${recentIds.length ? recentIds.map(id => { const t = TOPIC[id]; const s = p.topics[id]; const last = p.log.find(l => l.id === id); return `<div class="statrow"><span>${t.icon} ${t.name} <span class="muted">(${SUBJECTS[t.s].name}, ${t.g}. r.)</span></span><b>${s && s.total ? Math.round(s.correct / s.total * 100) + ' %' : '–'}</b><small>Naposledy ${fmtTime(last.t)} · ${KIND[last.k] || last.k} · hviezdy: ${s?.stars || 0}/3</small></div>`; }).join('') : '<p class="muted b" style="padding:8px 0">Zatiaľ žiadna aktivita.</p>'}</section>
  <section class="card pcard"><span class="eyebrow">Darí sa</span>${strong.length ? strong.map(topicLine).join('') : '<p class="muted b" style="padding:8px 0">Zobrazí sa, keď bude mať v téme aspoň 5 odpovedí s úspešnosťou nad 80 %.</p>'}</section>
  <section class="card pcard"><span class="eyebrow">Treba precvičiť</span>${weak.length ? weak.map(topicLine).join('') : '<p class="muted b" style="padding:8px 0">Zatiaľ nič. Témy s úspešnosťou pod 70 % sa zobrazia tu.</p>'}</section><h3 class="pgroup">⭐ Pokrok v predmetoch</h3><p class="pgsub">Hviezdy podľa ročníkov</p><section class="card pcard"><span class="eyebrow">Matematika – hviezdy podľa ročníkov</span>${subjProg('mat')}<span class="eyebrow">Slovenčina – hviezdy podľa ročníkov</span>${subjProg('sjl')}<span class="eyebrow">Prehľad (príroda, svet, angličtina) – hviezdy podľa ročníkov</span>${subjProg('prv')}</section>
  <h3 class="pgroup">🕑 História aktivít</h3><p class="pgsub">Posledných 15 záznamov</p><section class="card pcard"><span class="eyebrow">História aktivít</span>${p.log.slice(0, 15).map(l => `<div class="statrow"><span>${KIND[l.k] || l.k}${l.id && TOPIC[l.id] ? ' · ' + TOPIC[l.id].name : ''}</span><b>${l.k === 'rread' ? '+' + l.c + ' bodov' : l.k === 'gift' || l.k === 'ptask' ? '+' + l.c + ' slniečok' : l.k.startsWith('game') ? l.c + ' b.' : l.k === 'pex' ? l.n + ' ťahov' : `${l.c}/${l.n}`}</b><small>${fmtTime(l.t)}</small></div>`).join('') || '<p class="muted b" style="padding:8px 0">Zatiaľ prázdne.</p>'}</section>`;
  const T_tasks = () => `<section class="card pcard"><span class="eyebrow">📋 Úlohy pre dieťa</span><p class="muted b" style="font-size:.85rem;padding:4px 0">Vyberte tému a koľko hviezd má dieťa v kvíze získať. Keď to splní, apka mu automaticky pridá slniečka.</p>
  <div class="ptform"><label>Téma<select id="pt-topic">${['mat', 'sjl', 'prv'].map(k => `<optgroup label="${SUBJECTS[k].name}">${SUBJECTS[k].topics.filter(t => t.g === p.grade).map(t => `<option value="${t.id}">${t.name}</option>`).join('')}</optgroup>`).join('')}</select></label><label>Hviezdy<select id="pt-stars"><option value="1">⭐ aspoň 5 z 10</option><option value="2" selected>⭐⭐ aspoň 8 z 10</option><option value="3">⭐⭐⭐ 10 z 10</option></select></label><label>Odmena<select id="pt-coins">${[5, 10, 15, 20].map(n => `<option value="${n}" ${n === 10 ? 'selected' : ''}>${n} slniečok</option>`).join('')}</select></label><button class="btn primary small" data-a="pt-add">➕ Zadať úlohu</button></div>
  ${(p.ptasks || []).slice(0, 8).map(t => TOPIC[t.topic] ? `<div class="statrow"><span>${t.done ? '✅' : '⏳'} ${TOPIC[t.topic].name} · ${'⭐'.repeat(t.stars)}</span><b>${t.done ? 'splnené' : `<button class="chip" data-a="pt-del" data-id="${t.id}">Zrušiť</button>`}</b><small>+${t.coins} slniečok${t.done ? ' · ' + fmtTime(t.done) : ''}</small></div>` : '').join('')}</section>
`;
  const T_read = () => parentReads(p);
  const T_set = () => `<h3 class="pgroup">👧 Dieťa a profily</h3><p class="pgsub">Ročník, pridanie ďalšieho dieťaťa</p><section class="card pcard"><span class="eyebrow">Ročník dieťaťa</span><div class="chips" style="padding:6px 0">${[1, 2, 3, 4].map(g => `<button class="chip ${p.grade === g ? 'on' : ''}" data-a="p-grade" data-g="${g}">${g}. ročník</button>`).join('')}</div></section><section class="card" style="padding:6px 14px"><div class="list"><button class="row" data-a="new-prof"><span class="grow">➕ Pridať ďalšie dieťa</span><span>›</span></button></div></section><h3 class="pgroup">🎛️ Pravidlá pre dieťa</h3><p class="pgsub">Hry, pomôcky, priatelia, AI a zvuk</p><section class="card" style="padding:6px 14px"><div class="list"><div class="row" style="flex-direction:column;align-items:flex-start;gap:6px"><span>🎮 Minihry denne</span><small class="muted" style="font-weight:700">Koľkokrát za deň môže dieťa hrať minihry (spolu). Dnes už hralo ${gamesToday(p)}×.</small><div class="chips" style="padding:0">${[1, 2, 3, 5, 0].map(n => `<button class="chip ${DATA.settings.gameLimit === n ? 'on' : ''}" data-a="p-glimit" data-n="${n}">${n ? n + '×' : 'Bez limitu'}</button>`).join('')}</div></div>${tg('calc', '🧸 Pomôcky od Bystríka', 'Kalkulačka a násobilka pri matematike, tabuľky pri slovenčine. Dieťa ich otvorí ťuknutím na medvedíka.')}</div></section><section class="card" style="padding:6px 14px"><span class="eyebrow" style="display:block;margin:8px 0 0">👫 Priatelia a rebríček</span><div class="list">${tg('friends', '👫 Priatelia a správy', 'Dieťa si pridá priateľa kódom a posiela mu hotové vety a smajlíky.')}${tg('freeChat', '✍️ Vlastné správy priateľom', 'Zapnuté: dieťa môže písať vlastný text. Vypnuté: len hotové vety.')}${tg('lb', '🏆 Zobrazovať v rebríčku', 'Meno dieťaťa, ročník a body za týždeň uvidia ostatní prihlásení hráči.')}</div></section><section class="card" style="padding:6px 14px"><span class="eyebrow" style="display:block;margin:8px 0 0">🧸 AI a zvuk</span><div class="list">${tg('chat', '🧸 Chat s Bystríkom', 'AI pomocník vysvetľuje učivo. Na webe ho najprv zapnite nižšie v časti „Účet a AI“.')}${tg('sound', '🔊 Zvuky')}${tg('voice', '🗣️ Čítanie otázok nahlas')}</div></section><h3 class="pgroup">⏰ Pripomienka</h3><p class="pgsub">Denné upozornenie v kalendári</p>${UI.view === 'remote' ? '' : remindCard()}<h3 class="pgroup">🧸 Účet a AI</h3><p class="pgsub">Prihlásenie a chat s Bystríkom</p>${accCard()}${aiCard()}${ONLINE() ? '' : `<h3 class="pgroup">☁️ Záloha a iné zariadenie</h3><p class="pgsub">Uloženie a prenos postupu</p>${backupCard()}${UI.view === 'remote' ? '' : `<section class="card pcard"><span class="eyebrow">👀 Pozrieť postup z iného zariadenia</span><p class="muted b" style="font-size:.85rem;padding:4px 0">Na telefóne dieťaťa otvorte Rodičovský účet → „Skopírovať kód zálohy“ a pošlite si ho. Tu ho vložte a uvidíte, čo dieťa robilo. Nič sa tým tu neprepíše.</p><textarea id="rmcode" class="bkcode" placeholder="Sem vložte kód…"></textarea><button class="btn small primary" data-a="remote-open">👀 Zobraziť postup</button></section>`}`}<h3 class="pgroup">🔐 Bezpečnosť a údaje</h3><p class="pgsub">Údaje rodiča, PIN, návod, vymazanie profilu</p><section class="card" style="padding:6px 14px"><div class="list"><button class="row" data-a="ptour"><span class="grow">🧸 Návod pre rodičov</span><span>›</span></button><button class="row" data-a="ps-edit"><span class="grow">✏️ Údaje rodiča<small class="muted" style="display:block;font-weight:700;font-size:.82rem">${DATA.parent.name ? esc(DATA.parent.name) + ' · ' : ''}cieľ ${DATA.parent.goal || 2} ${plural(DATA.parent.goal || 2, 'zadanie', 'zadania', 'zadaní')} denne</small></span><span>›</span></button><button class="row" data-a="pin-change"><span class="grow">🔑 Zmeniť PIN</span><span>›</span></button></div></section><section class="card" style="padding:12px 14px;display:flex;flex-direction:column;gap:10px">${PDEL ? `<b>Naozaj vymazať profil ${esc(p.name)} so všetkým pokrokom?</b><div class="rowbtns"><button class="btn" data-a="pdel-no">Nie</button><button class="btn primary" data-a="pdel-yes">Áno, vymazať</button></div>` : '<button class="btn block" data-a="pdel-ask">🗑️ Vymazať tento profil</button>'}</section>`;
  return `<header class="top"><button class="iconbtn press" data-a="parent-lock" aria-label="Späť k dieťaťu">←</button><div class="who"><b>Rodičovský účet</b><span class="muted b" style="font-size:.82rem">${DATA.parent.name ? `Vitajte, ${esc(DATA.parent.name)}` : 'Prehľad pokroku detí'}</span></div></header><main class="view pview">
  ${DATA.profiles.length > 1 ? `<div class="chips">${DATA.profiles.map(x => `<button class="chip ${x.id === p.id ? 'on' : ''}" data-a="psel" data-id="${x.id}">${esc(x.name)}</button>`).join('')}</div>` : ''}
  <section class="card" style="display:flex;align-items:center;gap:12px;padding:12px"><span class="headbub" style="width:64px;height:64px">${avatarSvg(p.av, { crop: 'head' })}</span><div style="flex:1;min-width:0"><b style="font-family:var(--f-display);font-size:1.4rem">${esc(p.name)}</b><div class="muted b">${p.grade}. ročník · Level ${li.L} (${title(li.L)})</div></div></section>
  
  ${PTAB === 'tasks' ? T_tasks() : PTAB === 'read' ? T_read() : PTAB === 'set' ? paccWrap(T_set(), 'set', true) : paccWrap(T_over(), 'over', false)}
  <button class="btn block" data-a="parent-lock">🔒 Zamknúť a vrátiť sa k dieťaťu</button></main><nav class="nav pnav" aria-label="Sekcie rodičovského účtu"><div class="in">${[['over', '📊', 'Prehľad', 0], ['tasks', '📋', 'Zadať úlohu', 0], ['read', '📖', 'Čítanka', p.readings.filter(x => !x.rating).length], ['set', '⚙️', 'Nastavenia', needBackup() ? -1 : 0]].map(([k, i, n, c]) => `<button class="${PTAB === k ? 'on' : ''}" data-a="ptab" data-t="${k}"><span class="ni">${i}</span>${n}${c > 0 ? `<em class="pbadge">${c}</em>` : c < 0 ? '<span class="dot"></span>' : ''}</button>`).join('')}</div></nav>`;
};

/* ===== Akcie ===== */
const ACT = {
  nav: d => { sfx('tap'); if (d.v === 'profiles') return go('profiles', {}, 'b'); go(d.v, {}, d.v === 'home' ? 'b' : 'f'); },
  home: () => { sfx('tap'); go('home', {}, 'b'); },
  'learn-back': () => { sfx('tap'); go('learn', {}, 'b'); },
  wave: () => { const a = $('.stage .avatar, #wfig .avatar'); if (a) { a.classList.remove('waving', 'dance'); void a.offsetWidth; a.classList.add(Math.random() < .5 ? 'waving' : 'dance'); sfx('pop'); } },
  'ob-say': () => { say(OB.step > 0 ? OB_T[OB.step] : OB_HELLO); const b = $('.herobub'); if (b) b.remove(); },
  'ob-next': () => { sfx('tap'); OB.step = 1; go('onboard', {}, 'f'); },
  'ob-back': () => { sfx('tap'); if (OB.edit && OB.step <= 1) return go('settings', {}, 'b'); OB.step = OB.step === 5 ? 3 : OB.step - 1; go('onboard', {}, 'b'); },
  'ob-name': () => { const v = ($('#ob-name').value || '').trim(); if (!v) { toast('Napíš svoje meno 🙂'); return; } OB.name = v; sfx('tap'); OB.step = 2; go('onboard', {}, 'f'); },
  'ob-g': d => { if (OB.gender !== d.g || !OB.edit) { const keep = OB.edit ? { col: OB.av.col, bg: OB.av.bg, bgp: OB.av.bgp, skin: OB.av.skin, pet: OB.av.pet, petName: OB.av.petName } : {}; OB.av = { ...defaultAvatar(d.g), ...keep }; if (!OB.edit) OB.room = defaultRoom(d.g); } OB.gender = d.g; sfx('pop'); $$('.pickg button').forEach(b => b.classList.toggle('on', b.dataset.g === d.g)); OB.step = 3; setTimeout(() => go('onboard', {}, 'f'), 220); },
  'ob-grade': d => { OB.grade = +d.g; sfx('pop'); $$('.grades button').forEach(b => b.classList.toggle('on', b.dataset.g === d.g)); OB.step = 5; setTimeout(() => go('onboard', {}, 'f'), 220); },
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
  daily: () => { const p = P(); sfx('tap'); const seq = dailySeq(p); startQuiz([...new Set(seq)], 'daily', { v: 'home', p: {} }, { seq }); },
  ans: (d, el) => answer(Q.cur.options[+d.i], el),
  key: (d, el) => { if (Q.answered) return; const k = d.k; sfx('tap'); if (k === 'del') Q.input = Q.input.slice(0, -1); else if (k === 'ok') { if (Q.input) answer(Q.input, el); return; } else if (Q.input.length < 7) Q.input += k; $('#padshow').innerHTML = Q.input ? fmt(Q.input) : '&nbsp;'; },
  next: () => nextStep(), explain: () => explainQ(), speak: () => say(Q.cur.speak, Q.cur.speakLang),
  calc: () => openCalc(), ck: d => calcKey(d.k),
  'help-tab': d => { HELPTAB[d.s] = d.t; sfx('tap'); $$('.htabs .chip').forEach(c => c.classList.toggle('on', c.dataset.t === d.t)); const b = $('#hbody'); if (b) b.innerHTML = helpBody(d.s, d.t); },
  quit: () => { const b = Q.back; Q = null; go(b.v, b.p, 'b'); },
  'quit-mode': () => { const b = (UI.view === 'cards' ? CD : UI.view === 'pexeso' ? PX : UI.view === 'match' ? MT : ST).back; go(b.v, b.p, 'b'); },
  flip: () => { $('#flip').classList.toggle('on'); sfx('flip'); },
  'card-say': (d, el, e) => { e.stopPropagation(); say(CD.deck[0].speak, 'en-GB'); },
  'card-yes': () => cardAnswer(true), 'card-no': () => cardAnswer(false),
  tile: d => tileTap(+d.i), 'm-pick': d => mPick(d.s, +d.i), bin: (d, el) => binTap(+d.i, el),
  game: d => { sfx('tap'); const p = P(); if (gameLocked(p, d.g)) { const g = GAMES[d.g]; const can = (p.coins || 0) >= g.cost; const w = document.createElement('div'); w.className = 'over'; w.innerHTML = `<div class="card box"><div style="font-size:4rem;line-height:1">${g.i}</div><h2>${g.n}</h2><p class="muted b">${g.d}</p><p class="b">Odomknutie stojí ${COIN} ${g.cost}. Máš ${COIN} ${p.coins || 0}.</p>${can ? `<button class="btn primary block" data-a="game-buy" data-g="${d.g}">🔓 Odomknúť hru</button>` : `<p class="b" style="color:var(--bad)">Chýba ti ešte ${g.cost - (p.coins || 0)} slniečok. Uč sa a zbieraj!</p><button class="btn primary block" data-a="ov-learn">📚 Ísť sa učiť</button>`}<button class="btn block" data-a="ov-close">Zrušiť</button></div>`; document.body.appendChild(w); return; } startGame(d.g); },
  'game-buy': d => { const p = P(); const g = GAMES[d.g]; if (!g || !gameLocked(p, d.g) || (p.coins || 0) < g.cost) return; p.coins -= g.cost; p.gown = [...(p.gown || []), d.g]; save(); $$('.over').forEach(e => e.remove()); sfx('level'); try { confetti(100, .35); } catch (e) { } toast('🔓 Hra ' + g.n + ' je odomknutá!'); render(null); },
  'ord': (d, el) => { if (!GM || GM.ended || GM.busy) return; const o = GM.o; const v = +el.dataset.v; if (v === o.sorted[o.pos]) { o.pos++; el.classList.add('done'); el.disabled = true; sfx('pop'); buzz(8); if (o.pos >= o.sorted.length) { GM.busy = true; if (GM.qt) clearTimeout(GM.qt); gHit(true, $('#ordgrid')); if (o.sorted.length >= 8) { GM.score++; const sc = $('#gscore'); if (sc) sc.textContent = '⭐ ' + GM.score; } setTimeout(() => { if (!GM || GM.ended) return; GM.busy = false; orderNext(); const b = $('#ordwrap'); if (b) b.innerHTML = orderHTML(); qTimer(orderOut, 3); }, 600); } } else { el.classList.remove('bad'); void el.offsetWidth; el.classList.add('bad'); gHit(false, el); } },
  'simon-pad': (d, el) => { if (!GM || GM.ended || GM.lockIn) return; const i = +el.dataset.i; simonLit(i, 220); if (i === GM.seq[GM.in]) { GM.in++; if (GM.in >= GM.seq.length) { GM.lockIn = true; gHit(true, $('#simon')); GM.seq.push(R(0, 3)); GM.in = 0; TIMERS.push(setTimeout(simonPlay, 900)); } } else { GM.lockIn = true; gHit(false, $('#simon')); GM.in = 0; const el2 = $('#simoninfo'); if (el2) el2.textContent = 'Ups! Pozri sa ešte raz.'; if (!GM.ended) TIMERS.push(setTimeout(simonPlay, 1100)); } },
  'race-ans': (d, el) => { if (!GM || GM.ended || GM.busy) return; const ok = GM.rq.opts[+el.dataset.i] === GM.rq.answer; if (ok) { GM.pos++; gHit(true, el); if (GM.pos >= 10) { GM.busy = true; GM.score += 5; const sc = $('#gscore'); if (sc) sc.textContent = '⭐ ' + GM.score; sfx('level'); try { confetti(80, .3); } catch (e) { } toast('🏁 Vyhral(a) si preteky! +5 ⭐'); TIMERS.push(setTimeout(() => { if (!GM || GM.ended) return; GM.pos = 0; GM.bot = 0; GM.busy = false; GM.rq = frogQ(GM.g); raceDraw(true); }, 1200)); return; } } else gHit(false, el); if (GM.ended) return; GM.rq = frogQ(GM.g); raceDraw(true); },
  wl: (d, el) => {
    if (!GM || GM.ended || GM.busy) return; const w = GM.w; const t = w.tiles.find(x => x.i === +el.dataset.i); if (!t || t.used) return;
    if (t.c === w.word[w.pos]) { t.used = true; w.pos++; sfx('pop'); buzz(8);
      if (w.pos >= w.word.length) { GM.busy = true; if (GM.qt) clearTimeout(GM.qt); const b = $('#wordwrap'); if (b) b.innerHTML = wordHTML(); gHit(true, $('.wslots')); GM.score += w.word.length >= 6 ? 1 : 0; const sc = $('#gscore'); if (sc) sc.textContent = '⭐ ' + GM.score; try { say(w.word.join('').toLowerCase()); } catch (e) { } setTimeout(() => { if (!GM || GM.ended) return; GM.busy = false; wordNext(); const b2 = $('#wordwrap'); if (b2) b2.innerHTML = wordHTML(); qTimer(wordOut, 2.4); }, 800); }
      else { const b = $('#wordwrap'); if (b) b.innerHTML = wordHTML(); } }
    else { el.classList.remove('bad'); void el.offsetWidth; el.classList.add('bad'); gHit(false, el); }
  },
  frog: (d, el) => {
    if (GM.ended || GM.busy) return; GM.busy = true; if (GM.qt) clearTimeout(GM.qt); const ok = GM.fq.opts[+el.dataset.i] === GM.fq.answer; const fr = $('#frog'); const pond = $('#pond');
    const pr = pond.getBoundingClientRect(), r = el.getBoundingClientRect(), f = fr.getBoundingClientRect();
    fr.style.transform = `translate(${r.left + r.width / 2 - (f.left + f.width / 2)}px, ${r.top + r.height / 2 - (f.top + f.height / 2)}px)`; fr.classList.add('jump'); sfx('whoosh');
    setTimeout(() => {
      if (ok) { el.classList.add('good'); gHit(true, el); GM.step++; if (GM.step % 5 === 0) { GM.shores++; GM.score += 3; const s2 = $('#gscore'); if (s2) s2.textContent = '⭐ ' + GM.score; try { confetti(70, .3); } catch (e) { } sfx('coin'); toast('🏡 Žabka je na brehu! +3 ⭐'); } }
      else { el.classList.add('sink'); fr.classList.add('splash'); gHit(false, el); const ex = $('.deckinfo'); if (ex) ex.textContent = 'Správne bolo: ' + GM.fq.answer; }
      setTimeout(() => { if (GM.ended) return; GM.fq = frogQ(GM.g); GM.busy = false; const w = $('#fwrap'); if (w) w.innerHTML = frogHTML(); qTimer(frogOut); }, ok ? 450 : 1100);
    }, 380);
  },
  mole: (d, el) => { if (GM.ended || !el.classList.contains('up') || el.classList.contains('hit')) return; const ok = el.dataset.good === '1'; el.classList.add(ok ? 'hit' : 'miss'); setTimeout(() => el.classList.remove('up'), 250); gHit(ok, el); },
  'quit-game': () => { GM.ended = true; go('games', {}, 'b'); },
  balloon: (d, el) => { if (GM.ended || el.classList.contains('popped')) return; const ok = d.v !== 'x' && d.v !== 'old' && +d.v === GM.target; el.classList.add('popped'); setTimeout(() => el.remove(), 300); gHit(ok, el); if (ok && ++GM.hits % 4 === 0) { GM.target = balloonTarget(GM.g); const t = $('#gtarget'); if (t) { t.innerHTML = `Nové číslo! Praskni balóny s výsledkom <b>${GM.target}</b>`; t.style.animation = 'none'; void t.offsetWidth; t.style.animation = 'yay .5s'; } $$('.balloon').forEach(b => { if (b.dataset.v !== 'x') b.dataset.v = 'old'; }); } },
  drop: (d, el) => { if (GM.ended || el.classList.contains('popped')) return; const ok = d.good === '1'; el.style.background = ok ? 'var(--good)' : 'var(--bad)'; el.style.color = '#fff'; el.classList.add('popped'); setTimeout(() => el.remove(), 300); gHit(ok, el); },
  tf: (d, el) => { if (GM.ended || GM.lock) return; tfResolve((d.v === '1') === GM.st.truth, el); },
  'gdiff': d => { $$('.over').forEach(e => e.remove()); sfx('tap'); startGame(d.g, d.d); },
  'res-back': () => { const r = UI.params; go(r.back.v, r.back.p, 'b'); },
  'res-again': () => { const r = UI.params; if (r.kind === 'read') return go('reads', {}, 'b'); if (r.kind === 'review') { if (reviewDue(P()).length) return startReview(); return go('home', {}, 'b'); } if (r.kind === 'write') return go('write', {}, 'b'); if (r.kind === 'dict') return go('dict', {}, 'b'); if (r.kind === 'game') return startGame(r.game, (P().gdiff || {})[r.game]); if (r.kind === 'test' || r.kind === 'quiz' || r.kind === 'time' || r.kind === 'daily') return startQuiz(r.retry, r.kind, r.back); startMode(r.retry[0]); },
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
  'parent-open': () => { sfx('tap'); if (PARENT_OK && !DATA.parent.tour) setTimeout(() => { if (UI.view === 'parent' && !GUIDE) showGuide(PTOUR, 0, endPTour); }, 700); if (!DATA.parentSeen) { DATA.parentSeen = 1; save(); } PSEL = DATA.current; PTAB = 'over'; go('parent', {}, 'f'); },
  'parent-lock': () => { PARENT_OK = false; PDEL = false; go(P() ? 'home' : 'profiles', {}, 'b'); },
  'pin-back': () => go(P() ? 'settings' : 'profiles', {}, 'b'),
  pk: d => pinKey(d.k),
  'pin-change': () => { PARENT_OK = false; PIN = { mode: 'create', val: '', first: '' }; UI.view = 'pin'; render('f'); },
  psel: d => { PSEL = d.id; PDEL = false; render(null); },
  'p-grade': d => { const p = DATA.profiles.find(x => x.id === PSEL); p.grade = +d.g; save(); toast(`Ročník: ${d.g}.`); render(null); },
  'bk-copy': async (d, el) => { const code = await makeBackup(); const ta = $('#bkcode'); ta.value = code; ta.hidden = false; let ok = false; try { await navigator.clipboard.writeText(code); ok = true; } catch (e) { ta.focus(); ta.select(); } DATA.backupAt = Date.now(); save(); toast(ok ? 'Kód zálohy je skopírovaný ✓ Uložte si ho, napríklad do e-mailu.' : 'Kód je označený. Skopírujte ho a uložte si ho.'); sfx('coin'); burst(el, 24); setTimeout(() => { const card = $('.backup'); if (card) { card.classList.remove('blink'); } }, 50); },
  'bk-file': async () => { const code = await makeBackup(); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([code], { type: 'text/plain' })); const d = new Date(); a.download = `bystrik-zaloha-${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}.txt`; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000); DATA.backupAt = Date.now(); save(); toast('Súbor so zálohou sa sťahuje ✓'); render(null); },
  'bk-restore': () => { RESTORE = true; render(null); setTimeout(() => { const f = $('#bkfile'); if (f) f.addEventListener('change', async () => { const file = f.files && f.files[0]; if (file) $('#bkin').value = await file.text(); }); const b = $('.bkrestore'); if (b) b.scrollIntoView({ block: 'center' }); }, 50); },
  'bk-cancel': () => { RESTORE = false; render(null); },
  'bk-apply': async () => { try { const o = await readBackup($('#bkin').value); const data = o.data || o; if (!data || !Array.isArray(data.profiles)) throw new Error('bad'); DATA = Object.assign({ profiles: [], current: null }, data); normalize(); DATA.backupAt = Date.now(); if (!P()) DATA.current = DATA.profiles[0] ? DATA.profiles[0].id : null; save(); RESTORE = false; PSEL = DATA.current; toast(`Obnovené ✓ Hráči: ${DATA.profiles.map(p => p.name).join(', ')}`); sfx('level'); confetti(120); render(null); } catch (e) { sfx('no'); toast('Tento kód zálohy sa nedá prečítať. Skontrolujte, či je celý.'); } },
  'ai-save': () => { const v = ($('#aikey').value || '').trim(); if (!v) { toast('Najprv vložte AI kľúč.'); return; } if (v.length < 20 || /\s/.test(v)) { toast('Kľúč vyzerá neúplne. Skopírujte ho znova.'); return; } setApiKey(v); sfx('coin'); toast('AI kľúč uložený ✓ Bystrík teraz funguje aj na webe.'); render(null); },
  'ai-link': async () => { const u = location.origin + location.pathname + '#k=' + encodeURIComponent(getApiKey()); try { if (navigator.share) { await navigator.share({ title: 'Bystrík', url: u }); return; } } catch (e) { return; } try { await navigator.clipboard.writeText(u); toast('Odkaz skopírovaný. Pošlite si ho do druhého telefónu a otvorte. Nikomu inému ho nedávajte.'); } catch (e) { prompt('Skopírujte odkaz:', u); } },
  'ai-guide': () => { sfx('whoosh'); aiGuide(0); },
  'aig-go': (d, el) => { sfx('tap'); aiGuide(AIG + (+el.dataset.i)); },
  'aig-close': () => { try { speechSynthesis.cancel(); } catch (e) { } const o = $('#aigover'); if (o) o.remove(); },
  'aig-paste': async () => { const t = await readClip(); if (t) { $('#aigkey').value = t; sfx('pop'); } else toast('Ťuknite do políčka, podržte prst a zvoľte „Prilepiť“.'); },
  'ai-paste': async () => { const t = await readClip(); if (t) { $('#aikey').value = t; sfx('pop'); } else toast('Ťuknite do políčka, podržte prst a zvoľte „Prilepiť“.'); },
  'aig-save': async (d, el) => {
    const v = ($('#aigkey').value || '').trim(); const msg = $('#aigmsg');
    if (v.length < 20 || /\s/.test(v)) { msg.textContent = '❗ Kľúč vyzerá neúplne. Vráťte sa o krok a skopírujte ho znova.'; sfx('no'); return; }
    el.disabled = true; el.textContent = '⏳ Skúšam…'; setApiKey(v);
    try { const s2 = await getSample(); const r = await s2('Odpovedz po slovensky jednou krátkou veselou vetou: pozdrav dieťa.', { cache: false });
      const o = $('#aigover'); o.innerHTML = `<div class="box card aigbox">${bearSvg('cheer')}<h2>Hurá, funguje to! 🎉</h2><p class="b">Bystrík hovorí: „${esc(r.text.slice(0, 120))}“</p><p class="muted">Teraz funguje chat, „Vysvetli mi to“ aj Moje poznámky. Na ďalšie zariadenie: Rodičovský účet → 📲 Odkaz pre ďalší telefón.</p><button class="btn primary" data-a="aig-close">Super!</button></div>`; sfx('coin'); try { confetti && confetti(); } catch (e) { } render(null);
    } catch (e) {
      if (e && e.code === 'not_granted') { setApiKey(''); msg.textContent = '❌ Tento kľúč nefunguje. Skopírujte ho znova (celý).'; }
      else msg.textContent = e && (e.code === 'rate_limited' || /high demand|503/i.test(e.message || '')) ? '✅ Kľúč je uložený. Google je teraz preťažený, skúste Bystríka o chvíľu.' : '⚠️ Kľúč je uložený, ale test sa nepodaril: ' + ((e && e.message) || 'chyba');
      el.disabled = false; el.textContent = '✅ Uložiť a vyskúšať'; sfx('no');
    }
  },
  'auth-mode': d => { LOGIN.email = ($('#aemail') || {}).value || ''; LOGIN.mode = d.m; LOGIN.msg = ''; LOGIN.ok = false; sfx('tap'); render(null); },
  'auth-go': async () => {
    if (LOGIN.busy) return; const email = ($('#aemail').value || '').trim().toLowerCase(), pass = $('#apass').value || ''; LOGIN.email = email;
    const fail = m => { LOGIN.busy = false; LOGIN.ok = false; LOGIN.msg = m; sfx('no'); render(null); };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return fail('Zadajte platný e-mail.');
    if (pass.length < 6) return fail('Heslo musí mať aspoň 6 znakov.');
    LOGIN.busy = true; LOGIN.msg = ''; render(null);
    try {
      const j = LOGIN.mode === 'in' ? await supaAuth('token?grant_type=password', { email, password: pass }) : await supaAuth('signup', { email, password: pass });
      if (!j.access_token) { LOGIN.mode = 'in'; return fail('Poslali sme vám e-mail. Potvrďte ho odkazom a potom sa prihláste.'); }
      setAuth(authFrom(j));
    } catch (e) { return fail(authErr(e)); }
    try { await supaSync(); } catch (e) { DBREF = SUPADB; toast('Postup sa zatiaľ nepodarilo načítať. Skúsime to neskôr.'); }
    LOGIN = { mode: 'in', busy: false, msg: '' }; sfx('coin'); boot();
  },
  'auth-link': async () => {
    if (LOGIN.busy) return; const email = ($('#aemail').value || '').trim().toLowerCase(); LOGIN.email = email; LOGIN.ok = false;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { LOGIN.msg = 'Najprv hore napíšte svoj e-mail.'; sfx('no'); return render(null); }
    LOGIN.busy = true; LOGIN.msg = ''; render(null);
    try { await supaAuth('otp?redirect_to=' + encodeURIComponent(location.origin + location.pathname), { email, create_user: true }); LOGIN.ok = true; LOGIN.msg = 'Poslali sme vám e-mail. Otvorte ho na tomto zariadení a kliknite na odkaz. Pozrite aj spam.'; }
    catch (e) { LOGIN.msg = /rate|429/i.test((e.message || '') + (e.code || '') + (e.status || '')) ? 'Teraz sa nedá poslať ďalší e-mail. Skúste to neskôr alebo použite heslo.' : authErr(e); }
    LOGIN.busy = false; render(null);
  },
  'auth-forgot': async () => {
    if (LOGIN.busy) return; const email = ($('#aemail').value || '').trim().toLowerCase(); LOGIN.email = email; LOGIN.ok = false;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { LOGIN.msg = 'Najprv hore napíšte svoj e-mail.'; sfx('no'); return render(null); }
    LOGIN.busy = true; LOGIN.msg = ''; render(null);
    try { await supaAuth('recover?redirect_to=' + encodeURIComponent(location.origin + location.pathname), { email }); LOGIN.ok = true; LOGIN.msg = 'Ak účet existuje, poslali sme naň e-mail s odkazom na nové heslo. Pozrite aj spam.'; }
    catch (e) { LOGIN.msg = /rate|429/i.test((e.message || '') + (e.code || '') + (e.status || '')) ? 'Teraz sa nedá poslať ďalší e-mail. Skúste to o hodinu.' : authErr(e); }
    LOGIN.busy = false; render(null);
  },
  'auth-newpass': async () => {
    if (LOGIN.busy || !RECOVER) return; const pass = $('#npass').value || '';
    if (pass.length < 6) { LOGIN.msg = 'Heslo musí mať aspoň 6 znakov.'; sfx('no'); return render(null); }
    LOGIN.busy = true; LOGIN.msg = ''; render(null);
    try {
      const r = await fetch(SUPA.url + '/auth/v1/user', { method: 'PUT', headers: { apikey: SUPA.key, Authorization: 'Bearer ' + RECOVER.at, 'content-type': 'application/json' }, body: JSON.stringify({ password: pass }) });
      const j = await r.json().catch(() => ({})); if (!r.ok) throw { message: j.msg || j.message || ('HTTP ' + r.status), code: j.error_code || '' };
      setAuth({ at: RECOVER.at, rt: RECOVER.rt, exp: RECOVER.exp, uid: j.id, email: j.email }); RECOVER = null;
    } catch (e) { LOGIN.busy = false; LOGIN.msg = /same_password|different/i.test((e.message || '') + (e.code || '')) ? 'Nové heslo musí byť iné ako staré.' : /expired|invalid|JWT|401|403/i.test((e.message || '') + (e.code || '')) ? 'Odkaz už neplatí. Požiadajte o nový.' : authErr(e); sfx('no'); return render(null); }
    try { await supaSync(); } catch (e) { DBREF = SUPADB; }
    LOGIN = { mode: 'in', busy: false, msg: '' }; sfx('coin'); toast('Heslo je zmenené ✓'); boot();
  },
  'auth-newpass-cancel': () => { RECOVER = null; LOGIN = { mode: 'in', busy: false, msg: '' }; boot(); },
  'auth-out': async (d, el) => {
    el.disabled = true; el.textContent = '⏳ Ukladám…';
    try { clearTimeout(syncT); if (DATA.profiles.length) await SUPADB.set({ json: JSON.stringify(DATA), t: DATA.t }); } catch (e) { toast('Bez internetu sa nedá odhlásiť, postup by sa neuložil.'); return render(null); }
    try { fetch(SUPA.url + '/auth/v1/logout', { method: 'POST', headers: { apikey: SUPA.key, Authorization: 'Bearer ' + AUTH.at } }).catch(() => { }); } catch (e) { }
    setAuth(null); DBREF = null; try { localStorage.removeItem('bystrik.owner'); } catch (e) { } resetData(); PARENT_OK = false; go('login', {}, 'u');
  },
  'ptab': d => { PTAB = d.t; sfx('tap'); render(null); scrollTo({ top: 0 }); const td = $('.pacc.todo'); if (td) setTimeout(() => td.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150); },
  'set-bg': d => { DATA.settings.bgc = d.c; const c = PAGE_BG.find(x => x[0] === d.c); if (c && c[4]) { DATA.settings.theme = c[4]; applyTheme(); } save(); applyPageBg(); sfx('pop'); render(null); if (c && c[4]) toast(c[4] === 'dark' ? 'Čierne pozadie zapína tmavý režim 🌙' : 'Toto pozadie zapína svetlý režim ☀️'); },
  'ev-practice': () => { const r = UI.params; const ids = [...new Set((r.tlog || []).filter(x => !x.ok && x.id && TOPIC[x.id]).map(x => x.id))]; if (!ids.length) return; sfx('tap'); startQuiz(ids, 'quiz', r.back || { v: 'home', p: {} }, ids.length > 1 ? { seq: Array.from({ length: 10 }, (_, i) => ids[i % ids.length]) } : {}); },
  'review': () => { sfx('tap'); startReview(); },
  'remind-t': d => { DATA.settings.remind = d.t; save(); sfx('tap'); render(null); },
  'remind-add': () => {
    const t = DATA.settings.remind || '17:00'; const [hh, mm] = t.split(':'); const d = new Date(); const z = n => String(n).padStart(2, '0'); const day = `${d.getFullYear()}${z(d.getMonth() + 1)}${z(d.getDate())}`; const url = location.origin + location.pathname;
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Bystrik//SK', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT', 'UID:bystrik-ucenie-' + day + '@bystrik', 'DTSTAMP:' + day + 'T000000Z', 'DTSTART:' + day + 'T' + hh + mm + '00', 'DURATION:PT15M', 'RRULE:FREQ=DAILY', 'SUMMARY:Bystrík: čas na učenie 🧸', 'DESCRIPTION:Desať minút s Bystríkom. Otvor apku: ' + url, 'URL:' + url, 'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:Bystrík čaká! Poď sa učiť 🧸', 'TRIGGER:PT0M', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' })); a.download = 'bystrik-pripomienka.ics'; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000); toast('Súbor stiahnutý. Otvorte ho a potvrďte pridanie do kalendára.');
  },
  'learn-back': () => { try { speechSynthesis.cancel(); } catch (e) { } go('learn', {}, 'b'); },
  'dk-say': () => { sfx('tap'); dkSay(false); }, 'dk-slow': () => { sfx('tap'); dkSay(true); },
  'dk-peek': () => { const el = $('#dkpeek'); if (!el || !DK) return; DK.peeks++; DK.peeked = true; el.textContent = DK.list[DK.i]; el.classList.add('on'); sfx('pop'); setTimeout(() => { el.classList.remove('on'); el.textContent = ''; }, DK.list[DK.i].length > 12 ? 3500 : 2200); },
  'dk-check': () => { if (!DK || DK.done) return; const typed = ($('#dkin').value || '').trim(); if (!typed) { toast('Najprv napíš, čo počuješ.'); sfx('no'); return; } const t = DK.list[DK.i]; const ok = dkNorm(typed) === dkNorm(t); const near = !ok && dkPlain(typed) === dkPlain(t); if (ok) { if (!DK.peeked) DK.ok++; sfx('ok'); try { burst($('.dictbox'), 18); } catch (e) { } } else sfx('no'); const p = P(); p.stats.answered++; if (ok) p.stats.correct++; countDay(ok); DK.done = { ok, near, typed }; render(null); },
  'dk-next': () => { if (!DK) return; DK.i++; DK.done = null; DK.peeked = false; DK.spoken = false; if (DK.i >= DK.list.length) return dkFinish(); render(null); },
  'write-set': d => { sfx('tap'); writeStart(d.s); render(null); },
  'write-clear': () => { const d = $('#wdraw'); if (d) d.getContext('2d').clearRect(0, 0, 340, 340); W.drawn = false; sfx('tap'); },
  'write-done': () => {
    if (W.busy) return; const msg = $('#wmsg'); if (!W.drawn) { msg.textContent = 'Najprv písmeno obtiahni prstom. ✍️'; sfx('no'); return; }
    const sc = wScore(); const good = sc.recall >= .5 && sc.prec >= .55;
    if (good) { W.busy = true; if (!W.tries) W.ok++; W.tries = 0; sfx('ok'); buzz(15); try { burst($('#wdraw'), 18); } catch (e) { } msg.innerHTML = '✅ <b>' + pick(['Krásne!', 'Výborne!', 'Paráda!', 'Presne tak!']) + '</b>'; setTimeout(() => { W.i++; W.busy = false; W.drawn = false; if (W.i >= W.list.length) return writeFinish(); render(null); }, 850); }
    else { W.tries++; sfx('no'); msg.innerHTML = sc.recall < .5 ? 'Skús obtiahnuť <b>celé</b> písmeno.' : 'Skús ostať viac <b>na predlohe</b>.'; if (W.tries >= 3) { msg.innerHTML += ' Nevadí, ideme ďalej.'; W.busy = true; setTimeout(() => { W.i++; W.tries = 0; W.busy = false; W.drawn = false; if (W.i >= W.list.length) return writeFinish(); render(null); }, 1100); } else { const d = $('#wdraw'); setTimeout(() => { d.getContext('2d').clearRect(0, 0, 340, 340); W.drawn = false; }, 700); } }
  },
  'games-back': () => go('games', {}, 'b'),
  'duel-create': () => { sfx('tap'); duelCreate(); render(null); },
  'duel-join': () => { const code = ($('#dcode').value || '').replace(/\D/g, ''); if (code.length !== 4) { D.err = 'Zadaj 4-miestny kód od kamaráta.'; sfx('no'); return render(null); } sfx('tap'); duelJoin(code); render(null); },
  'duel-ans': (d, el) => {
    if (!D || D.st !== 'play' || D.lock) return; D.lock = true; const q = D.qs[D.i]; const ok = q.o[+el.dataset.i] === q.a; if (ok) { D.s++; sfx('ok'); } else sfx('no');
    $$('#dopts .opt').forEach(b => { const v = q.o[+b.dataset.i]; b.classList.add(v === q.a ? 'right' : b === el ? 'wrong' : 'dim'); }); D.ws.say('prog', { i: D.i + 1, s: D.s });
    setTimeout(() => { if (!D) return; D.lock = false; D.i++; if (D.i >= 8) { D.mdone = { s: D.s, ms: Date.now() - D.t0 }; const send = () => D && D.ws && D.ws.say('done', D.mdone); send(); D.rep = setInterval(send, 2000); D.st = 'waitend'; D.to = setTimeout(() => duelMaybeEnd(true), 60000); render(null); duelMaybeEnd(); } else render(null); }, ok ? 500 : 900);
  },
  'duel-quit': () => { if (D && D.ws) D.ws.say('bye', {}); duelClose(); D = null; go('games', {}, 'b'); },
  'duel-again': () => { if (D && D.ws) D.ws.say('bye', {}); duelClose(); D = { st: 'lobby' }; render(null); },
  'lbtab': d => { LBTAB = d.t; sfx('tap'); render(null); },
  'ps-role': d => { PS.name = ($('#psname') || {}).value || PS.name; PS.role = d.r; sfx('tap'); render(null); },
  'ps-goal': d => { PS.goal = +d.n; sfx('tap'); render(null); },
  'ps-next': () => { if (PS.step === 0) { PS.name = ($('#psname').value || '').trim(); if (PS.name.length < 2) { $('#psmsg').textContent = 'Napíšte svoje meno.'; sfx('no'); return; } } PS.step++; sfx('tap'); if (PS.step === 2) { DATA.parent.name = PS.name; DATA.parent.role = PS.role; DATA.parent.goal = PS.goal; save(); } render('f'); },
  'ps-back': () => { if (PS && PS.step > 0) { PS.step--; return render('b'); } const ed = PS && PS.edit; PS = null; go(ed ? 'parent' : (P() ? 'settings' : 'profiles'), {}, 'b'); },
  'ps-done': () => { const ed = PS.edit; PS = null; sfx('ok'); go('parent', {}, 'f'); if (ed) toast('Údaje rodiča uložené ✓'); },
  'ps-edit': () => { PS = { step: 0, name: DATA.parent.name || '', role: DATA.parent.role || 'mama', goal: DATA.parent.goal || 2, edit: true }; go('psetup', {}, 'f'); },
  'getapp-web': () => { try { localStorage.setItem('bystrik.web', '1'); } catch (e) { } boot(); },
  'getapp-install': async () => { if (!A2HS) return; try { A2HS.prompt(); const r = await A2HS.userChoice; if (r && r.outcome === 'accepted') { try { localStorage.setItem('bystrik.web', '1'); } catch (e) { } toast('Bystrík je na ploche 🎉 Otvor ho odtiaľ.'); boot(); return; } } catch (e) { } render(null); },
  'install': async () => { if (!A2HS) return; try { A2HS.prompt(); const r = await A2HS.userChoice; if (r && r.outcome === 'accepted') toast('Bystrík je na ploche 🎉'); } catch (e) { } A2HS = null; render(null); },
  'fr-copy': async () => { const c = P().fc || ''; try { await navigator.clipboard.writeText(c); toast('Kód skopírovaný: ' + c); } catch (e) { toast('Tvoj kód: ' + c); } },
  'fr-add': async (d, el) => {
    const me = P(); const code = ($('#frcode').value || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); const say = (m, ok) => { FR = { ...(FR || {}), msg: m, ok: !!ok }; render(null); };
    if (code.length !== 6) return say('Kód má 6 znakov.'); if (code === me.fc) return say('To je tvoj vlastný kód. 🙂'); if ((FR && FR.list || []).some(f => f.code === code)) return say('Tohto priateľa už máš.'); if ((FR && FR.out || []).some(f => f.code === code)) return say('Žiadosť si už poslal(a). Čaká na potvrdenie.');
    el.disabled = true;
    try { const f = await sb('GET', 'players?select=code,name&code=eq.' + code); if (!f.length) return say('Taký kód neexistuje. Skontroluj ho.'); const wasInc = (FR && FR.inc || []).some(x => x.code === code); me.fblock = (me.fblock || []).filter(c => c !== code); await sb('POST', 'friends', { my_code: me.fc, friend_code: code }, 'resolution=ignore-duplicates,return=minimal'); save(); sfx('gift'); inboxSend(code, wasInc ? 'facc' : 'freq', { from: me.fc, name: me.name }); FR = { ...(FR || {}), msg: wasInc ? f[0].name + ' je teraz tvoj priateľ! 🎉' : 'Žiadosť odoslaná. Počkaj, kým ju ' + f[0].name + ' prijme.', ok: true, at: 0, loading: false }; toast(FR.msg); FTAB = wasInc ? 'friends' : 'req'; await frLoad(); }
    catch (e) { say(e && e.status === 404 ? 'Priatelia ešte nie sú zapnutí.' : 'Nepodarilo sa. Skús to znova.'); }
  },
  'fr-accept': async (d, el) => { const me = P(); el.disabled = true; try { await sb('POST', 'friends', { my_code: me.fc, friend_code: d.c }, 'resolution=ignore-duplicates,return=minimal'); sfx('gift'); try { confetti(60, .4); } catch (e) { } inboxSend(d.c, 'facc', { from: me.fc, name: me.name }); const f = (FR.inc || []).find(x => x.code === d.c); FR = { ...FR, msg: (f ? f.name : 'Kamarát') + ' je teraz tvoj priateľ! 🎉', ok: true, at: 0, loading: false }; toast(FR.msg); FTAB = 'friends'; await frLoad(); } catch (e) { toast('Nepodarilo sa. Skús to znova.'); render(null); } },
  'fr-reject': d => { const me = P(); me.fblock = [...new Set([...(me.fblock || []), d.c])]; save(); sfx('tap'); if (FR) { FR.inc = (FR.inc || []).filter(x => x.code !== d.c); FR.total = Math.max(0, FR.total - 1); FR.msg = ''; } render(null); },
  'fr-cancel': async d => { const me = P(); try { await sb('DELETE', `friends?my_code=eq.${me.fc}&friend_code=eq.${d.c}`); } catch (e) { } if (FR) { FR.out = (FR.out || []).filter(x => x.code !== d.c); FR.msg = ''; } sfx('tap'); render(null); },
  'fr-open': d => { sfx('tap'); go('fchat', { code: d.c }, 'f'); },
  'ftab': d => { FTAB = d.t; if (FR) FR.msg = ''; sfx('tap'); render(null); },
  'duel-invite-go': d => { go('duel', {}, 'u'); setTimeout(() => ACT['duel-invite']({ c: d.c }), 350); },
  'fr-menu': d => { const f = (FR && FR.list || []).find(x => x.code === d.c); const w = document.createElement('div'); w.className = 'over'; w.innerHTML = `<div class="card box"><h2>${esc(f ? f.name : 'Priateľ')}</h2><p class="muted b">Ak priateľa odstrániš, zmizne zo zoznamu a jeho správy sa ti prestanú zobrazovať.</p><button class="btn block" data-a="fr-remove" data-c="${d.c}">🚫 Odstrániť priateľa</button><button class="btn primary block" data-a="ov-close">Zrušiť</button></div>`; document.body.appendChild(w); },
  'fc-say': d => fcSend('text', FC_PRESETS[+d.i]),
  'fc-emo': d => fcSend('text', FC_EMOJI[+d.i]),
  'fc-text': () => { const tx = $('#fctext'); if (!tx) return; const v = tx.value; tx.value = ''; fcSend('text', v); },
  'fc-duel': async () => { if (!FC) return; const to = FC.code; const me = P(); const code = duelCreate(); D.inv = ((FR && FR.list || []).find(f => f.code === to) || {}).name || ''; await fcSend('duel', code); inboxSend(to, 'invite', { from: me.fc, name: me.name, code }); go('duel', {}, 'u'); },
  'fc-join': d => { const code = String(d.c || '').replace(/\D/g, ''); if (code.length !== 4) return; $$('.over').forEach(e => e.remove()); sfx('tap'); duelJoin(code); go('duel', {}, 'u'); },
  'duel-invite': async d => { const me = P(); const f = (FR && FR.list || []).find(x => x.code === d.c); if (!f) return; sfx('tap'); const code = duelCreate(); D.inv = f.name; render(null); try { await sb('POST', 'messages', { from_code: me.fc, to_code: f.code, kind: 'duel', body: code }, 'return=minimal'); } catch (e) { } inboxSend(f.code, 'invite', { from: me.fc, name: me.name, code }); },
  'fc-menu': () => { if (FC) return ACT['fr-menu']({ c: FC.code }); const w = document.createElement('div'); w.className = 'over'; w.innerHTML = `<div class="card box"><h2>Priateľ</h2><p class="muted b">Ak priateľa odstrániš, zmizne zo zoznamu a jeho správy sa ti prestanú zobrazovať.</p><button class="btn block" data-a="fr-remove">🚫 Odstrániť priateľa</button><button class="btn primary block" data-a="ov-close">Zrušiť</button></div>`; document.body.appendChild(w); },
  'fr-remove': async d => { const code = (d && d.c) || (FC && FC.code); if (!code) return; const me = P(); me.fblock = [...new Set([...(me.fblock || []), code])]; save(); try { await sb('DELETE', `friends?my_code=eq.${me.fc}&friend_code=eq.${code}`); } catch (e) { } $$('.over').forEach(e => e.remove()); if (FR) FR.at = 0; go('friends', {}, 'b'); toast('Priateľ odstránený.'); },
  'ai-del': () => { setApiKey(''); toast('AI kľúč odstránený.'); render(null); },
  'ai-test': async (d, el) => { el.disabled = true; el.textContent = '⏳ Testujem…'; try { const s2 = await getSample(); const r = await s2('Odpovedz po slovensky jednou krátkou vetou: pozdrav dieťa.', { cache: false }); toast('✅ Funguje! Bystrík hovorí: ' + r.text.slice(0, 80)); } catch (e) { toast(e && e.code === 'not_granted' ? '❌ Kľúč nie je platný. Skontrolujte ho.' : e && e.code === 'no_credit' ? '❌ Na účte chýba kredit (Billing).' : e && e.code === 'rate_limited' ? '⏳ Dnešný limit je minutý alebo príliš veľa požiadaviek. Skúste neskôr.' : '❌ Nepodarilo sa: ' + ((e && e.message) || 'chyba')); } render(null); },
  'pt-add': () => { const p = DATA.profiles.find(x => x.id === PSEL); p.ptasks = p.ptasks || []; if (p.ptasks.filter(t => !t.done).length >= 3) { toast('Naraz môžu byť najviac 3 aktívne úlohy.'); return; } p.ptasks.unshift({ id: 'pt' + Date.now().toString(36), topic: $('#pt-topic').value, stars: +$('#pt-stars').value, coins: +$('#pt-coins').value, t: Date.now(), done: 0 }); if (p.ptasks.length > 20) p.ptasks.length = 20; save(); sfx('pop'); toast('Úloha zadaná ✓ Dieťa ju uvidí na domovskej obrazovke.'); render(null); },
  'pt-del': d => { const p = DATA.profiles.find(x => x.id === PSEL); p.ptasks = (p.ptasks || []).filter(t => t.id !== d.id); save(); render(null); },
  'pt-go': d => { sfx('tap'); const t = TOPIC[d.id]; startQuiz([d.id], 'quiz', { v: 'home', p: {} }); },
  'remote-open': async () => { try { const o = await readBackup($('#rmcode').value); const data = o.data || o; if (!data || !Array.isArray(data.profiles) || !data.profiles.length) throw new Error('bad'); VIEWDATA = JSON.parse(JSON.stringify(data)); VIEWDATA._at = o.t || Date.now(); const saved = DATA; DATA = VIEWDATA; try { DATA.profiles.forEach(migrate); } finally { DATA = saved; } PSEL_SAVED = PSEL; PSEL = VIEWDATA.current; go('remote', {}, 'f'); } catch (e) { sfx('no'); toast('Tento kód sa nedá prečítať. Skontrolujte, či je celý.'); } },
  'remote-close': () => { VIEWDATA = null; PSEL = PSEL_SAVED || DATA.current; go('parent', {}, 'b'); },
  'p-glimit': d => { DATA.settings.gameLimit = +d.n; save(); sfx('tap'); toast(+d.n ? `Minihry: ${d.n}× za deň ✓` : 'Minihry bez limitu ✓'); render(null); },
  'ov-learn': () => { const o = $('.over'); if (o) o.parentNode.removeChild(o); go('learn', {}, 'f'); },
  'p-gift': (d, el) => { const p = DATA.profiles.find(x => x.id === PSEL); if (giftsToday(p) >= 2 || ![5, 10, 15, 20].includes(+d.n)) { sfx('no'); toast('Dnes ste už odmenili 2×. Skúste zajtra.'); return; } p.coins = (p.coins || 0) + (+d.n); p.log.unshift({ t: Date.now(), k: 'gift', id: null, c: +d.n, n: 0 }); save(); burst(el, 30); sfx('coin'); toast(`Dieťa dostalo ${d.n} slniečok 🎁`); render(null); },
  'voice-test': () => say('Ahoj! Čítam mäkčene, dĺžne aj vety. Ďakujem, že sa učíš. Výborne!'),
  'pdel-ask': () => { PDEL = true; render(null); }, 'pdel-no': () => { PDEL = false; render(null); },
  'pdel-yes': () => { DATA.profiles = DATA.profiles.filter(p => p.id !== PSEL); if (DATA.current === PSEL) DATA.current = DATA.profiles[0]?.id || null; PSEL = DATA.current; PDEL = false; save(); if (!DATA.profiles.length) { PARENT_OK = false; return boot(); } render(null); },
  ask: d => askBot(d.q),
  'note-cam': () => { const f = $('#notecam'); if (f) f.click(); }, 'note-pick': () => { const f = $('#notepick'); if (f) f.click(); },
  'note-quiz': d => { const n = (P().notes || []).find(x => x.id === d.id); if (!n) return; noteTopic(n); startQuiz(['note-' + n.id], 'quiz', { v: 'notes', p: {} }, { total: Math.min(10, n.qs.length) }); },
  'note-test': d => { const n = (P().notes || []).find(x => x.id === d.id); if (!n) return; noteTopic(n); startQuiz(['note-' + n.id], 'test', { v: 'notes', p: {} }, { total: Math.min(10, n.qs.length) }); },
  'note-del': d => { const p = P(); p.notes = (p.notes || []).filter(x => x.id !== d.id); save(); render(null); },
  parea: d => { PAREA = d.k; sfx('tap'); render(null); },
  theme: d => { const bc = PAGE_BG.find(x => x[0] === DATA.settings.bgc); if (bc && bc[4] && bc[4] !== d.t) DATA.settings.bgc = 'auto'; DATA.settings.theme = d.t; save(); applyTheme(); sfx('pop'); render(null); },
  'tour-again': () => { go('home', {}, 'b'); setTimeout(() => showGuide(TOUR, 0, endTour), 700); },
  shopcat: d => { SHOPCAT = d.c; SHOPSEL = null; sfx('tap'); render(null); },
  'buy-ask': d => { const p = P(); const it = itemOf(d.c, d.i); if ((p.coins || 0) < it.price) { sfx('no'); toast(`Chýba ti ešte ${it.price - (p.coins || 0)} slniečok. Uč sa a zbieraj! 🪙`); return; } SHOPSEL = it.sid; sfx('tap'); render(null); },
  buy: (d, el) => { const p = P(); const it = itemOf(d.c, d.i); if ((p.coins || 0) < it.price || p.owned.includes(it.sid)) return; p.coins -= it.price; p.owned.push(it.sid); SHOPSEL = null; save(); sfx('gift'); buzz([30, 40, 30]); burst(el, 40); confetti(90, .4); toast(`Kúpené: ${it.n}! 🎉`); render(null); },
  'shop-wear': d => { const p = P(); p.av[d.c] = d.i; if (d.c === 'top' && false) { } save(); sfx('pop'); toast('Oblečené ✓'); render(null); },
  'rd-grade': d => { RDG = +d.g; sfx('tap'); render(null); },
  'rd-open': d => { RD = { id: d.id, opts: {}, ans: {}, correct: 0 }; sfx('tap'); go('read', {}, 'f'); },
  'rd-back': () => { if (REC && RD.recording) { try { REC.mr.stop(); } catch (e) { } } RD = null; go('reads', {}, 'b'); },
  'rd-say': () => say(READ[RD.id].text),
  'tut-say': () => { if (GUIDE) say(GUIDE.cur); }, 'tut-open': () => showTut(0), 'tut-skip': () => { const g = GUIDE; GUIDE = null; (g ? g.end : endTut)(); }, 'tut-next': d => { const i = +d.i; const g = GUIDE || { steps: TUT, end: endTut }; if (i >= g.steps.length) { GUIDE = null; g.end(); } else showGuide(g.steps, i, g.end); },
  'pguide': () => { sfx('tap'); go('home', {}, 'f'); setTimeout(() => showGuide(PGUIDE, 0, endPGuide), 350); },
  'a2hs-hide': () => { DATA.a2hsHide = 1; save(); render(null); },
  'ptour': () => { PTAB = 'over'; render(null); scrollTo(0, 0); setTimeout(() => showGuide(PTOUR, 0, endPTour), 250); },
  'rec-start': () => recStart(), 'dikt-open': () => openDiktafon(), 'mic-retry': () => { closeSheet(); MIC_BLOCKED = false; render(null); recStart(); },
  'rec-pick': () => { closeSheet(); const f = $('#recfile'); if (f) f.click(); },
  'rec-stop': () => { if (REC && REC.mr.state !== 'inactive') REC.mr.stop(); },
  'rec-again': () => { RD.blobUrl = null; RD.blob = null; RD.saved = false; render(null); if (!MIC_BLOCKED) recStart(); },
  'rd-done': (d, el) => { const p = P(); p.readings.unshift({ id: 'rd' + Date.now().toString(36), r: RD.id, t: Date.now(), rating: null, noAudio: true }); if (p.readings.length > 60) p.readings.length = 60; RD.done = true; if (!RD.recXp) { RD.recXp = true; gain(p, 20); floatXp(el, '+20'); } burst(el, 40); logAct('read', null, 1, 1); touchStreak(p); save(); sfx('coin'); render(null); },
  'rec-save': async (d, el) => { const p = P(); const id = 'rec' + Date.now().toString(36); try { await idbOp('readwrite', st => st.put({ id, pid: p.id, r: RD.id, t: Date.now(), blob: RD.blob })); p.readings.unshift({ id, r: RD.id, t: Date.now(), rating: null }); if (p.readings.length > 60) p.readings.length = 60; RD.saved = true; if (!RD.recXp) { RD.recXp = true; gain(p, 20); floatXp(el, '+20'); } logAct('read', null, 1, 1); touchStreak(p); save(); sfx('coin'); burst(el); toast('Nahrávka uložená. Rodič si ju vypočuje 🎧'); render(null); } catch (e) { toast('Nahrávku sa nepodarilo uložiť v tomto prehliadači.'); } },
  'rd-ans': (d, el) => { const qi = +d.q; if (RD.ans[qi] !== undefined) return; const [, a] = READ[RD.id].q[qi].split('|'); RD.ans[qi] = d.o; const ok = d.o === a; const p = P(); p.stats.answered++; countDay(ok); if (ok) { RD.correct++; p.stats.correct++; bump('correct'); sfx('ok'); burst(el); } else sfx('no'); save(); render(null); },
  'rd-finish': (d, el) => { const p = P(); const before = p.xp; const g = 10 + RD.correct * 10; gain(p, g); logAct('readq', null, RD.correct, READ[RD.id].q.length); touchStreak(p); checkBadges(p); save(); go('result', { kind: 'read', correct: RD.correct, total: READ[RD.id].q.length, xp: g, bonus: 0, before, after: p.xp, back: { v: 'reads', p: {} } }, 'u'); },
  'play-rec': async d => { const box = $('#aud-' + d.id); if (!box) return; try { const o = await idbOp('readonly', st => st.get(d.id)); if (!o) { box.innerHTML = '<span class="muted b">Nahrávka je uložená v inom zariadení alebo bola vymazaná.</span>'; return; } box.innerHTML = `<audio controls autoplay src="${URL.createObjectURL(o.blob)}" style="width:100%"></audio>`; } catch (e) { box.innerHTML = '<span class="muted b">Nahrávku sa nepodarilo načítať.</span>'; } },
  'reward-rec': d => { const p = DATA.profiles.find(x => x.id === PSEL); const r = p && p.readings.find(x => x.id === d.id); if (!r || r.rewarded) return; r.rewarded = true; p.xp += 5; p.log.unshift({ t: Date.now(), k: 'rread', id: null, c: 5, n: 0 }); save(); sfx('ok'); toast('🎁 Odmena pridaná: +5 bodov'); render(null); },
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
/* ===== Prihlásenie e-mailom (Supabase) – len na webe ===== */
const SUPA = { url: 'https://nxxltcpjdvoxomogzwaj.supabase.co', key: 'sb_publishable_49nPt0wrOCp04qyhoJbn2g_M1BriXDQ' };
const SUPA_ON = () => !!(SUPA.url && SUPA.key && !(window.claude && window.claude.use));
let AUTH = null; try { AUTH = JSON.parse(localStorage.getItem('bystrik.auth') || 'null'); } catch (e) { }
let LOGIN = { mode: 'in', busy: false, msg: '' };
let RECOVER = null, MAGIC = null;
try { if (SUPA_ON() && /access_token=/.test(location.hash) && !/type=recovery/.test(location.hash)) { const q = new URLSearchParams(location.hash.slice(1)); MAGIC = { at: q.get('access_token'), rt: q.get('refresh_token'), exp: Date.now() + (+q.get('expires_in') || 3600) * 1000 }; history.replaceState(null, '', location.pathname + location.search); } } catch (e) { }
try { if (SUPA_ON() && /type=recovery/.test(location.hash) && /access_token=/.test(location.hash)) { const q = new URLSearchParams(location.hash.slice(1)); RECOVER = { at: q.get('access_token'), rt: q.get('refresh_token'), exp: Date.now() + (+q.get('expires_in') || 3600) * 1000 }; history.replaceState(null, '', location.pathname + location.search); } else if (SUPA_ON() && /error_code=/.test(location.hash)) { LOGIN.msg = 'Odkaz na obnovu hesla už neplatí. Požiadajte o nový.'; history.replaceState(null, '', location.pathname + location.search); } } catch (e) { }
function setAuth(a) { AUTH = a; try { if (a) localStorage.setItem('bystrik.auth', JSON.stringify(a)); else localStorage.removeItem('bystrik.auth'); } catch (e) { } }
async function supaAuth(path, body) {
  let r; try { r = await fetch(SUPA.url + '/auth/v1/' + path, { method: 'POST', headers: { apikey: SUPA.key, 'content-type': 'application/json' }, body: JSON.stringify(body) }); } catch (e) { throw { net: true, message: 'Bez pripojenia na internet.' }; }
  let j = {}; try { j = await r.json(); } catch (e) { }
  if (!r.ok) throw { status: r.status, code: j.error_code || '', message: j.msg || j.error_description || j.message || ('HTTP ' + r.status) };
  return j;
}
const authFrom = j => ({ at: j.access_token, rt: j.refresh_token, exp: Date.now() + (j.expires_in || 3600) * 1000, uid: j.user.id, email: j.user.email });
async function supaToken() {
  if (!AUTH) throw { message: 'no auth' };
  if (AUTH.exp < Date.now() + 60000) { try { setAuth(authFrom(await supaAuth('token?grant_type=refresh_token', { refresh_token: AUTH.rt }))); } catch (e) { if (!e.net) { setAuth(null); DBREF = null; go('login', {}, 'u'); } throw e; } }
  return AUTH.at;
}
const SUPADB = {
  async get() { const t = await supaToken(); const r = await fetch(SUPA.url + '/rest/v1/saves?select=data&user_id=eq.' + AUTH.uid, { headers: { apikey: SUPA.key, Authorization: 'Bearer ' + t } }); if (!r.ok) throw { message: 'HTTP ' + r.status }; const a = await r.json(); return { exists: !!a.length, data: () => a[0].data }; },
  async set(v, keep) { const t = await supaToken(); const r = await fetch(SUPA.url + '/rest/v1/saves?on_conflict=user_id', { method: 'POST', keepalive: !!keep, headers: { apikey: SUPA.key, Authorization: 'Bearer ' + t, 'content-type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify({ user_id: AUTH.uid, data: v, updated_at: new Date().toISOString() }) }); if (!r.ok) throw { message: 'HTTP ' + r.status }; }
};
function resetData() { DATA = { profiles: [], current: null, settings: {}, parent: { pin: null }, t: 0 }; normalize(); try { localStorage.setItem(KEY, JSON.stringify(DATA)); } catch (e) { } }
async function supaSync() {
  let owner = null; try { owner = localStorage.getItem('bystrik.owner'); } catch (e) { }
  const foreign = !!owner && owner !== AUTH.uid; let changed = false;
  const snap = await SUPADB.get(); const r = snap.exists ? snap.data() : null;
  if (r && typeof r.json === 'string' && (foreign || r.t > DATA.t || !DATA.profiles.length)) { DATA = Object.assign({ profiles: [], current: null }, JSON.parse(r.json)); normalize(); try { localStorage.setItem(KEY, JSON.stringify(DATA)); } catch (e) { } changed = true; }
  else if (foreign) { resetData(); changed = true; }
  DBREF = SUPADB; try { localStorage.setItem('bystrik.owner', AUTH.uid); } catch (e) { }
  if (!changed && DATA.profiles.length) queueSync();
  return changed;
}
function authErr(e) {
  const m = ((e && e.message) || '') + ' ' + ((e && e.code) || '');
  if (e && e.net) return 'Bez pripojenia na internet. Skúste to znova.';
  if (/invalid.*credentials|invalid_credentials/i.test(m)) return 'Nesprávny e-mail alebo heslo.';
  if (/already registered|user_already_exists/i.test(m)) return 'Účet s týmto e-mailom už existuje. Prihláste sa.';
  if (/not confirmed/i.test(m)) return 'Najprv potvrďte e-mail odkazom, ktorý vám prišiel do pošty.';
  if (/password/i.test(m)) return 'Heslo musí mať aspoň 6 znakov.';
  if (/email|valid/i.test(m)) return 'Skontrolujte e-mailovú adresu.';
  if (/rate|429/i.test(m)) return 'Príliš veľa pokusov. Skúste to o chvíľu.';
  return 'Nepodarilo sa: ' + ((e && e.message) || 'chyba');
}
VIEWS.login = () => `<main class="view nonav loginv"><div class="loginbear">${bearSvg('')}</div><h1 class="logintitle">${LOGIN.mode === 'in' ? 'Vitaj späť!' : 'Vytvor si účet'}</h1><p class="muted b" style="text-align:center">${LOGIN.mode === 'in' ? 'Prihláste sa e-mailom rodiča. Postup sa uloží a nájdete ho na každom zariadení.' : 'Stačí e-mail rodiča a heslo. Je to zadarmo.'}</p>
<section class="card loginbox"><div class="seg" role="tablist"><button class="${LOGIN.mode === 'in' ? 'on' : ''}" data-a="auth-mode" data-m="in">Prihlásiť sa</button><button class="${LOGIN.mode === 'up' ? 'on' : ''}" data-a="auth-mode" data-m="up">Nový účet</button></div>
<label class="lbl" for="aemail">E-mail</label><input class="field" id="aemail" type="email" inputmode="email" autocomplete="email" autocapitalize="off" placeholder="rodic@email.sk" value="${esc(LOGIN.email || '')}">
<label class="lbl" for="apass">Heslo${LOGIN.mode === 'up' ? ' (aspoň 6 znakov)' : ''}</label><input class="field" id="apass" type="password" autocomplete="${LOGIN.mode === 'in' ? 'current-password' : 'new-password'}" placeholder="••••••">
<p class="loginmsg ${LOGIN.ok ? 'ok' : ''}" id="amsg">${esc(LOGIN.msg)}</p>
<button class="btn primary block" data-a="auth-go" ${LOGIN.busy ? 'disabled' : ''}>${LOGIN.busy ? '⏳ Chvíľku…' : LOGIN.mode === 'in' ? '➡️ Prihlásiť sa' : '✨ Vytvoriť účet'}</button>${LOGIN.mode === 'in' ? '<button class="linkbtn" data-a="auth-forgot">Zabudli ste heslo?</button>' : ''}<div class="duelor" style="text-align:center">alebo</div><button class="btn block" data-a="auth-link" ${LOGIN.busy ? 'disabled' : ''}>✉️ Prihlásiť sa odkazom z e-mailu</button><p class="muted b" style="font-size:.78rem;text-align:center;margin:0">Bez hesla: pošleme vám e-mail a stačí kliknúť na odkaz.</p></section>
<p class="muted b" style="text-align:center;font-size:.8rem">E-mail slúži len na prihlásenie. Nikomu ho nedávame a neposielame reklamu.</p></main>`;
VIEWS.newpass = () => `<main class="view nonav loginv"><div class="loginbear">${bearSvg('')}</div><h1 class="logintitle">Nové heslo</h1><p class="muted b" style="text-align:center">Zadajte nové heslo k svojmu účtu.</p>
<section class="card loginbox"><label class="lbl" for="npass">Nové heslo (aspoň 6 znakov)</label><input class="field" id="npass" type="password" autocomplete="new-password" placeholder="••••••"><p class="loginmsg" id="amsg">${esc(LOGIN.msg)}</p><button class="btn primary block" data-a="auth-newpass" ${LOGIN.busy ? 'disabled' : ''}>${LOGIN.busy ? '⏳ Chvíľku…' : '💾 Uložiť heslo'}</button><button class="linkbtn" data-a="auth-newpass-cancel">Zrušiť</button></section></main>`;
function weekCard(p) {
  const span = (a, b) => { let q = 0, c = 0, days = 0; for (let i = a; i < b; i++) { const d = p.days[daysAgo(i)]; if (d) { days++; q += d.q || 0; c += d.c || 0; } } return { q, c, days, acc: q ? Math.round(c / q * 100) : null }; };
  const w = span(0, 7), o = span(7, 14); const since = Date.now() - 7 * DAYMS;
  const ids = [...new Set(p.log.filter(l => l.t >= since && l.id && TOPIC[l.id]).map(l => l.id))];
  const tA = ALL_TOPICS.filter(t => p.topics[t.id]?.total >= 5).map(t => ({ t, pct: Math.round(p.topics[t.id].correct / p.topics[t.id].total * 100) }));
  const weak = tA.filter(x => x.pct < 70).sort((a, b) => a.pct - b.pct).slice(0, 3), strong = tA.filter(x => x.pct >= 85 && ids.includes(x.t.id)).slice(0, 3);
  const due = reviewDue(p).length; const diff = w.acc != null && o.acc != null ? w.acc - o.acc : null;
  const tip = !w.days ? 'Tento týždeň sa dieťa ešte neučilo. Skúste si spolu sadnúť na 10 minút, najlepšie každý deň v rovnakom čase.' : w.days < 3 ? 'Pomôže krátko, ale častejšie: 10 minút denne dá viac ako hodina raz za týždeň. Skúste pripomienku v Nastaveniach.' : weak.length ? `Skúste spolu tému „${weak[0].t.name}“. Nech vám dieťa nahlas vysvetlí, ako na odpoveď prišlo.` : due ? `Čaká ${due} ${plural(due, 'otázka', 'otázky', 'otázok')} na zopakovanie. Stačí päť minút na domovskej obrazovke.` : 'Ide to výborne. Pochváľte dieťa a skúste pridať ťažší režim: Test alebo Na čas.';
  return `<section class="card pcard weekcard"><span class="eyebrow">📅 Tento týždeň (posledných 7 dní)</span><div class="wkgrid"><div><b>${w.days}/7</b><span>dní s učením</span></div><div><b>${w.q}</b><span>odpovedí${o.q ? ` (minule ${o.q})` : ''}</span></div><div><b>${(() => { const g = DATA.parent.goal || 2; let n = 0; for (let i = 0; i < 7; i++) { const d = p.days[daysAgo(i)]; if (d && (d.n || 0) >= g) n++; } return n; })()}/7</b><span>dní so splneným cieľom</span></div><div><b>${w.acc == null ? '–' : w.acc + ' %'}</b><span>úspešnosť${diff != null && diff !== 0 ? ` <i class="${diff > 0 ? 'up' : 'dn'}">${diff > 0 ? '▲' : '▼'} ${Math.abs(diff)}</i>` : ''}</span></div></div>
  ${strong.length ? `<p class="wkline"><b>💪 Darí sa:</b> ${strong.map(x => esc(x.t.name)).join(', ')}</p>` : ''}${weak.length ? `<p class="wkline"><b>🔁 Precvičiť:</b> ${weak.map(x => `${esc(x.t.name)} (${x.pct} %)`).join(', ')}</p>` : ''}<p class="wkline"><b>🧠 Opakovanie chýb:</b> ${(p.review || []).length ? `${(p.review || []).length} ${plural((p.review || []).length, 'otázka', 'otázky', 'otázok')} v zásobníku, dnes čaká ${due}` : 'žiadne chyby na opakovanie'}</p><div class="wktip"><b>💡 Tip na tento týždeň</b><p>${tip}</p></div></section>`;
}
/* Pripomienka na učenie – opakovaná udalosť do kalendára telefónu */
function remindCard() {
  const inClaude = !!(window.claude && window.claude.use); const t = DATA.settings.remind || '17:00';
  return `<section class="card pcard"><span class="eyebrow">⏰ Pripomienka na učenie</span><p class="muted b" style="font-size:.85rem;padding:4px 0">Vyberte čas a pridajte si do kalendára v telefóne udalosť, ktorá sa opakuje každý deň. Telefón vás upozorní aj vtedy, keď je apka zatvorená.</p><div class="chips" style="padding:4px 0">${['15:00', '16:00', '17:00', '18:00', '19:00'].map(x => `<button class="chip ${t === x ? 'on' : ''}" data-a="remind-t" data-t="${x}">${x}</button>`).join('')}</div>${inClaude ? '<p class="b" style="font-size:.85rem">V tejto verzii sa súbor nedá stiahnuť. Nastavte si v telefóne budík alebo otvorte apku na webe.</p>' : `<div class="bkbtns"><button class="btn small primary" data-a="remind-add">📅 Pridať do kalendára (${t})</button></div><p class="muted b" style="font-size:.78rem">Stiahne sa malý súbor. Otvorte ho a potvrďte pridanie do kalendára. Zrušíte ju vymazaním udalosti v kalendári.</p>`}</section>`;
}
let A2HS = null; window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); A2HS = e; if (UI.view === 'settings' || UI.view === 'getapp' || UI.view === 'home') render(null); });
window.addEventListener('appinstalled', () => { try { localStorage.setItem('bystrik.web', '1'); } catch (e) { } if (UI.view === 'getapp') boot(); });
const isStandalone = () => { try { return matchMedia('(display-mode: standalone)').matches || navigator.standalone === true; } catch (e) { return false; } };
function installCard() {
  if ((window.claude && window.claude.use) || isStandalone()) return '';
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  return `<section class="card instcard"><span class="pci">📲</span><div class="grow"><b>Pridať apku na plochu</b><small>${A2HS ? 'Bystrík bude mať vlastnú ikonku a otvorí sa na celú obrazovku ako bežná apka.' : ios ? 'V Safari ťuknite dole na Zdieľať (štvorček so šípkou) a zvoľte „Pridať na plochu“.' : 'V prehliadači otvorte ponuku ⋮ a zvoľte „Pridať na plochu“ alebo „Inštalovať aplikáciu“.'}</small>${A2HS ? '<button class="btn small primary" data-a="install">📲 Nainštalovať</button>' : ''}</div></section>`;
}
function accCard() {
  if (!SUPA_ON() || !AUTH) return '';
  return `<section class="card pcard"><span class="eyebrow">👤 Účet</span><p class="b" style="padding:4px 0;word-break:break-all">Prihlásený: ${esc(AUTH.email || '')}</p><p class="muted b" style="font-size:.82rem;padding-bottom:8px">Postup sa ukladá online. Na inom zariadení sa stačí prihlásiť tým istým e-mailom.</p><div class="bkbtns"><button class="btn small" data-a="auth-out">🚪 Odhlásiť sa</button></div></section>`;
}
document.addEventListener('visibilitychange', () => { if (document.hidden && DBREF === SUPADB && AUTH && DATA.profiles.length) { clearTimeout(syncT); SUPADB.set({ json: JSON.stringify(DATA), t: DATA.t }, true).catch(() => { }); } });
/* ===== Súboj (naživo cez Supabase Realtime) a rebríček ===== */
const RT_ON = () => !!(SUPA.url && SUPA.key && !(window.claude && window.claude.use));
let D = null; var lbT = null; let LB = null; const LBK = 1000000;
const lbRow = x => ({ ...x, n: Math.floor((x.xp || 0) / LBK), pts: (x.xp || 0) % LBK });
function duelWs(code, onMsg, onReady) {
  const ws = new WebSocket(SUPA.url.replace(/^http/, 'ws') + '/realtime/v1/websocket?apikey=' + SUPA.key + '&vsn=1.0.0'); const topic = 'realtime:bystrik-duel-' + code; let ref = 1;
  ws.onopen = () => ws.send(JSON.stringify({ topic, event: 'phx_join', payload: { config: { broadcast: { self: false, ack: false }, presence: { key: '' }, private: false } }, ref: String(ref++) }));
  ws.onmessage = e => { let m; try { m = JSON.parse(e.data); } catch (x) { return; } if (m.event === 'phx_reply' && m.topic === topic && m.payload && m.payload.status === 'ok' && !ws._rdy) { ws._rdy = true; onReady && onReady(); } else if (m.event === 'broadcast' && m.payload) onMsg(m.payload.event, m.payload.payload || {}); };
  ws.onerror = () => { if (D && D.ws === ws && D.st !== 'done') { duelClose(); D = { st: 'lobby', err: 'Spojenie sa nepodarilo. Skontroluj internet a skús to znova.' }; if (UI.view === 'duel') render(null); } };
  ws._hb = setInterval(() => { try { ws.send(JSON.stringify({ topic: 'phoenix', event: 'heartbeat', payload: {}, ref: String(ref++) })); } catch (e) { } }, 25000);
  ws.say = (event, payload) => { try { if (ws.readyState === 1) ws.send(JSON.stringify({ topic, event: 'broadcast', payload: { type: 'broadcast', event, payload }, ref: String(ref++) })); } catch (e) { } };
  return ws;
}
function duelClose() { if (!D) return; clearInterval(D.tick); clearInterval(D.rep); clearTimeout(D.to); if (D.ws) { clearInterval(D.ws._hb); try { D.ws.onerror = null; D.ws.close(); } catch (e) { } } }
function duelQs(g) { const ts = ALL_TOPICS.filter(t => t.g === g && (t.s === 'mat' || t.s === 'sjl')); const out = []; let guard = 0; while (out.length < 8 && guard++ < 300) { try { const q = makeQuestion(pick(ts)); if (!q.options || q.options.length < 3 || (q.html && q.html.length > 400) || q.text.length > 90 || out.some(x => x.t === q.text)) continue; const w = shuffle(q.options.filter(o => o !== q.answer)).slice(0, 3); out.push({ t: q.text, h: q.html || '', a: q.answer, o: shuffle([q.answer, ...w]) }); } catch (e) { } } return out; }
function duelMsg(ev, pl) {
  if (!D) return;
  if (ev === 'join' && D.host) { if (D.opp && D.opp.id !== pl.id) return; D.opp = { id: pl.id, name: String(pl.name || 'Súper').slice(0, 14) }; if (!D.qs) D.qs = duelQs(P().grade); D.ws.say('start', { qs: D.qs, host: D.me, to: pl.id }); if (D.st === 'wait') duelBegin(); }
  else if (ev === 'start' && !D.host && pl.to === D.id && D.st === 'joining') { clearInterval(D.tick); clearTimeout(D.to); D.qs = pl.qs; D.opp = { name: String(pl.host || 'Súper').slice(0, 14) }; duelBegin(); }
  else if (ev === 'prog') { D.oi = pl.i; D.os = pl.s; const b = $('#obar'); if (b) b.style.width = (D.oi / 8 * 100) + '%'; const n = $('#oscore'); if (n) n.textContent = D.os; }
  else if (ev === 'done') { D.oi = 8; D.os = pl.s; D.odone = { s: pl.s, ms: pl.ms }; const b = $('#obar'); if (b) b.style.width = '100%'; duelMaybeEnd(); }
  else if (ev === 'bye') { D.oleft = true; if (D.st === 'play' || D.st === 'count') toast('Súper odišiel zo súboja.'); duelMaybeEnd(); }
}
function duelBegin() { D.st = 'count'; D.i = 0; D.s = 0; D.oi = 0; D.os = 0; D.n = 3; sfx('gift'); render(null); D.tick = setInterval(() => { D.n--; if (D.n <= 0) { clearInterval(D.tick); D.st = 'play'; D.t0 = Date.now(); render(null); } else { const e = $('#dcount'); if (e) e.textContent = D.n; sfx('tick'); } }, 900); }
function duelMaybeEnd(force) {
  if (!D || D.st === 'done' || !D.mdone) return; if (!(D.odone || D.oleft || force)) return;
  clearInterval(D.rep); clearTimeout(D.to); const o = D.odone; D.win = !o ? 1 : D.mdone.s > o.s ? 1 : D.mdone.s < o.s ? -1 : D.mdone.ms < o.ms ? 1 : D.mdone.ms > o.ms ? -1 : 0;
  D.st = 'done'; const p = P(); D.xp = D.mdone.s * 5 + (D.win > 0 ? 20 : 5); gain(p, D.xp); p.stats.games++; logAct('duel', null, D.mdone.s, 8); touchStreak(p); checkBadges(p); save(); if (D.win > 0) { sfx('level'); try { confetti(120, .35); } catch (e) { } } else sfx('ok'); render(null);
}
VIEWS.duel = () => {
  if (!D) D = { st: 'lobby' }; const head = `<div class="qtop"><button class="iconbtn press" data-a="duel-quit" aria-label="Ukončiť">✕</button><b style="font-family:var(--f-display);font-size:1.3rem;flex:1">⚔️ Súboj</b></div>`;
  if (D.st === 'lobby') return `<main class="view nonav">${head}<section class="card duelbox">${bearSvg('')}<h2>Vyzvi kamaráta!</h2><p class="muted b">Jeden z vás vytvorí súboj a povie druhému kód. Potom obaja odpovedáte na tých istých 8 otázok. Vyhrá ten, kto má viac správnych, pri rovnosti ten rýchlejší.</p>${D.err ? `<p class="loginmsg">${esc(D.err)}</p>` : ''}${FR_ON() && FR && FR.list && FR.list.length ? `<div class="invbox"><b>Pozvi priateľa</b>${FR.list.map(f => `<div class="frrow"><span class="frav">${frAv(f.av)}</span><span class="nm">${esc(f.name)}<small>${f.grade}. ročník</small></span><button class="btn small primary" data-a="duel-invite" data-c="${f.code}">⚔️ Pozvať</button></div>`).join('')}</div><div class="duelor">alebo cez kód</div>` : ''}<button class="btn ${FR_ON() && FR && FR.list && FR.list.length ? '' : 'primary'} block" data-a="duel-create">➕ Vytvoriť súboj s kódom</button><div class="duelor">alebo</div><input class="field" id="dcode" inputmode="numeric" maxlength="4" placeholder="Kód od kamaráta" style="text-align:center;font-size:1.6rem;letter-spacing:.2em"><button class="btn block" data-a="duel-join">🔑 Pripojiť sa</button></section></main>`;
  if (D.st === 'wait') return `<main class="view nonav">${head}<section class="card duelbox">${D.inv ? `<p class="b">📨 Pozvánka odoslaná: ${esc(D.inv)}</p><p class="muted b">Keď ju prijme, súboj sa začne sám. Alebo mu povedz kód:</p>` : '<p class="muted b">Povedz kamarátovi tento kód:</p>'}<div class="duelcode">${D.code.split('').map(x => `<i>${x}</i>`).join('')}</div><p class="b">Kamarát v apke otvorí Hry → Súboj a zadá ho.</p><div class="typing" style="margin:8px auto"><i></i><i></i><i></i></div><p class="muted b">Čakám na súpera…</p></section></main>`;
  if (D.st === 'joining') return `<main class="view nonav">${head}<section class="card duelbox"><div class="typing" style="margin:8px auto"><i></i><i></i><i></i></div><p class="b">Pripájam sa k súboju ${esc(D.code)}…</p></section></main>`;
  const bars = `<div class="duelbars"><div><span>${esc(D.me)} <b id="mscore">${D.s || 0}</b></span><div class="dbar me"><i id="mbar" style="width:${(D.i || 0) / 8 * 100}%"></i></div></div><div><span>${esc(D.opp ? D.opp.name : 'Súper')} <b id="oscore">${D.os || 0}</b></span><div class="dbar"><i id="obar" style="width:${(D.oi || 0) / 8 * 100}%"></i></div></div></div>`;
  if (D.st === 'count') return `<main class="view nonav">${head}${bars}<section class="card duelbox"><p class="b">${esc(D.me)} proti ${esc(D.opp.name)}</p><div class="duelcount" id="dcount">${D.n}</div><p class="muted b">Priprav sa!</p></section></main>`;
  if (D.st === 'play') { const q = D.qs[D.i]; return `<main class="view nonav">${head}${bars}<section class="card qcard enter"><div class="eyebrow">Otázka ${D.i + 1} z 8</div>${q.h || ''}<h2 style="font-size:1.5rem">${esc(q.t)}</h2></section><div class="opts" id="dopts">${q.o.map((o, i) => `<button class="card opt press" data-a="duel-ans" data-i="${i}">${esc(o)}</button>`).join('')}</div></main>`; }
  if (D.st === 'waitend') return `<main class="view nonav">${head}${bars}<section class="card duelbox">${bearSvg('')}<h2>Hotovo! ${D.s} z 8</h2><div class="typing" style="margin:8px auto"><i></i><i></i><i></i></div><p class="muted b">Čakám, kým dokončí súper…</p></section></main>`;
  const o = D.odone; return `<main class="view nonav">${head}<section class="card duelbox">${bearSvg(D.win >= 0 ? 'cheer' : 'comfort')}<h1>${D.win > 0 ? (P().av.gender === 'd' ? '🏆 Vyhrala si!' : '🏆 Vyhral si!') : D.win < 0 ? 'Tentoraz vyhral súper' : '🤝 Remíza!'}</h1><div class="duelres"><div class="${D.win >= 0 ? 'w' : ''}"><span>${esc(D.me)}</span><b>${D.mdone.s}</b><small>${(D.mdone.ms / 1000).toFixed(1)} s</small></div><div class="${D.win <= 0 && o ? 'w' : ''}"><span>${esc(D.opp.name)}</span><b>${o ? o.s : '–'}</b><small>${o ? (o.ms / 1000).toFixed(1) + ' s' : 'nedokončil'}</small></div></div><div class="xpgain">+${D.xp} bodov</div><div class="rowbtns"><button class="btn primary" data-a="duel-quit">✓ Hotovo</button><button class="btn" data-a="duel-again">🔁 Ďalší súboj</button></div></section></main>`;
};
const LB_PRIZE = [['sampion', 300], ['vavrin', 200], ['bronz', 100]];
let LBTAB = 'n', LBAW = false;
const lbHdr = t => ({ apikey: SUPA.key, Authorization: 'Bearer ' + t });
function lbPush() {
  if (!(SUPA_ON() && AUTH) || DATA.settings.lb === false) return; clearTimeout(lbT);
  lbT = setTimeout(async () => { try { const w = weekId(); const now = new Date().toISOString(); const rows = []; DATA.profiles.forEach(p => { const k = p.wk && p.wk.w === w ? p.wk : { xp: 0, n: 0 }; const base = { user_id: AUTH.uid, name: String(p.name).slice(0, 14), grade: p.grade, week: w, updated_at: now }; rows.push({ ...base, pid: String(p.id), xp: Math.min(2000, k.n || 0) * LBK + Math.min(LBK - 1, k.xp || 0) }); rows.push({ ...base, pid: p.id + '#s', xp: Math.min(9999, (p.streak && p.streak.count) || 0) }); }); if (!rows.length) return; const t = await supaToken(); await fetch(SUPA.url + '/rest/v1/scores?on_conflict=user_id,pid,week', { method: 'POST', headers: { ...lbHdr(t), 'content-type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(rows) }); if (DATA.settings.friends !== false && DATA.profiles.every(p => p.fc)) playersPush().catch(() => { }); } catch (e) { } }, 4000);
}
function lbParse(raw) { const st = {}; raw.forEach(x => { if (String(x.pid).endsWith('#s')) st[x.user_id + '|' + String(x.pid).slice(0, -2)] = x.xp || 0; }); return raw.filter(x => !String(x.pid).endsWith('#s')).map(x => ({ ...lbRow(x), st: st[x.user_id + '|' + x.pid] || 0 })); }
async function lbFetch(w) { const t = await supaToken(); const r = await fetch(SUPA.url + '/rest/v1/scores?select=user_id,pid,name,grade,xp&week=eq.' + w + '&order=xp.desc&limit=600', { headers: lbHdr(t) }); if (!r.ok) throw { status: r.status }; return lbParse(await r.json()); }
async function lbLoad() {
  if (LB && LB.loading) return; const prev = LB; LB = { loading: true, rows: prev && prev.rows, at: Date.now() }; let out;
  try { if (!(SUPA_ON() && AUTH)) throw { off: true }; out = { rows: await lbFetch(weekId()) }; }
  catch (e) { out = { err: e && e.off ? 'off' : e && e.status === 404 ? 'missing' : 'net' }; }
  out.at = Date.now(); LB = out;
  if (UI.view === 'board') render(null); else if (UI.view === 'home' || UI.view === 'learn') { const el = $('#homelb'); if (el) el.outerHTML = homeBoard(P()); }
  if (!LBAW && out.rows) { LBAW = true; lbAwards(); }
}
function lbFresh() { if (!LB || (!LB.loading && Date.now() - (LB.at || 0) > 20000)) lbLoad(); }
const lbSort = { n: (a, b) => b.n - a.n || b.pts - a.pts, s: (a, b) => b.st - a.st || b.n - a.n, x: (a, b) => b.pts - a.pts || b.n - a.n };
function lbLocal(p) { const w = weekId(); return DATA.profiles.map(x => ({ name: x.name, grade: x.grade, n: x.wk && x.wk.w === w ? x.wk.n || 0 : 0, pts: x.wk && x.wk.w === w ? x.wk.xp || 0 : 0, st: (x.streak && x.streak.count) || 0, mine: true, me: x.id === p.id })); }
function lbRows(p, tab = 'n') { const rows = LB && LB.rows ? LB.rows.map(x => ({ ...x, mine: !!AUTH && x.user_id === AUTH.uid, me: !!AUTH && x.user_id === AUTH.uid && x.pid === String(p.id) })) : lbLocal(p); return rows.sort(lbSort[tab]); }
const lbMedal = i => ['🥇', '🥈', '🥉'][i] || (i + 1) + '.';
const lbVal = (x, tab) => tab === 's' ? [x.st, plural(x.st, 'deň', 'dni', 'dní')] : tab === 'x' ? [x.pts, plural(x.pts, 'bod', 'body', 'bodov')] : [x.n, plural(x.n, 'zadanie', 'zadania', 'zadaní')];
const lbLine = (x, i, tab = 'n') => { const [v, u] = lbVal(x, tab); return `<div class="lbrow ${x.me ? 'me' : x.mine ? 'mine' : ''}"><span class="rk">${lbMedal(i)}</span><span class="nm">${esc(x.name)}<small>${x.grade}. ročník${tab === 'n' ? ' · ' + x.pts + ' bodov' : tab === 's' ? ' · ' + x.n + ' zadaní' : ' · séria ' + x.st}</small></span><b>${v}<small>${u}</small></b></div>`; };
function homeBoard(p) {
  const rows = lbRows(p); const mi = rows.findIndex(x => x.me); const top = rows.slice(0, 3); const mine = p.wk && p.wk.w === weekId() ? p.wk.n || 0 : 0;
  return `<button class="card homelb press" id="homelb" data-a="nav" data-v="board"><div class="sec"><h2>🏆 Rebríček týždňa</h2><span class="eyebrow">Všetko ›</span></div>${top.length ? top.map((x, i) => lbLine(x, i)).join('') : '<p class="muted b" style="padding:6px 0">Zatiaľ nikto. Sprav prvé zadanie a budeš na čele!</p>'}${mi > 2 ? `<div class="lbgap">⋯</div>${lbLine(rows[mi], mi)}` : ''}<p class="muted b" style="font-size:.84rem;padding-top:6px">${mi < 0 ? `Ty máš tento týždeň ${mine} ${plural(mine, 'zadanie', 'zadania', 'zadaní')}. Sprav kvíz alebo hru a dostaneš sa do rebríčka.` : mi === 0 ? 'Si na 1. mieste, udrž si ho do nedele a získaš Korunu šampióna! 👑' : (() => { const need = rows[mi - 1].n - rows[mi].n + 1; return `Si na ${mi + 1}. mieste. Na ${mi}. miesto ti ${plural(need, 'chýba', 'chýbajú', 'chýba')} ${need} ${plural(need, 'zadanie', 'zadania', 'zadaní')}.`; })()}</p></button>`;
}
/* odmeny pre prvých troch za minulý týždeň (podľa zadaní) */
const prevWeekId = () => { const d = new Date(); d.setDate(d.getDate() - 7 - (d.getDay() + 6) % 7); return dkey(d); };
async function lbAwards() {
  try {
    if (!(SUPA_ON() && AUTH)) return; const pw = prevWeekId(); const todo = DATA.profiles.filter(p => p.lbChecked !== pw); if (!todo.length) return;
    const rows = (await lbFetch(pw)).sort(lbSort.n); const wins = [];
    todo.forEach(p => { p.lbChecked = pw; const r = rows.findIndex(x => x.user_id === AUTH.uid && x.pid === String(p.id)); if (r < 0 || r > 2 || !rows[r].n) return; const [item, coins] = LB_PRIZE[r]; p.owned = p.owned || []; const had = p.owned.includes('lb:' + item); if (!had) p.owned.push('lb:' + item); const c = coins + (had ? 50 : 0); p.coins = (p.coins || 0) + c; p.lbWins = (p.lbWins || 0) + 1; p.log.unshift({ t: Date.now(), k: 'gift', id: null, c, n: 0 }); wins.push({ p, r, item, c, had }); });
    save(); const w = wins.find(x => x.p.id === DATA.current) || wins[0]; if (!w) return;
    const it = itemOf('acc', w.item); const o = document.createElement('div'); o.className = 'over';
    o.innerHTML = `<div class="card box">${bearSvg('cheer')}<h2>${lbMedal(w.r)} ${w.r + 1}. miesto v rebríčku!</h2><p class="b">${esc(w.p.name)}, minulý týždeň ${w.p.av.gender === 'd' ? 'si patrila' : 'si patril'} medzi troch najlepších.</p><div class="lbprize"><span class="pth">${itemThumb('acc', it, w.p.av)}</span><div><b>${it.n}</b><small>${w.had ? 'Už ju máš, preto slniečka navyše' : 'Vzácny doplnok, v obchode ho nekúpiš'}</small><b>+${w.c} ${COIN}</b></div></div><button class="btn primary block" data-a="ov-close">Paráda!</button></div>`;
    document.body.appendChild(o); sfx('level'); try { confetti(160, .3); } catch (e) { } if (UI.view === 'home' || UI.view === 'board') render(null);
  } catch (e) { }
}
VIEWS.board = () => {
  const p = P(); const rows = lbRows(p, LBTAB); const first = !LB || (LB.loading && !LB.rows); const top = rows.slice(0, 20); const mi = rows.findIndex(x => x.me);
  const note = LB && LB.err ? `<p class="muted b" style="font-size:.88rem;padding:4px 0">${LB.err === 'net' ? 'Spoločný rebríček sa nepodarilo načítať. Zatiaľ vidíš hráčov z tohto zariadenia.' : LB.err === 'missing' ? 'Spoločný rebríček ešte nie je zapnutý. Zatiaľ vidíš hráčov z tohto zariadenia.' : 'Spoločný rebríček uvidíš po prihlásení. Zatiaľ vidíš hráčov z tohto zariadenia.'}</p>` : '';
  const body = first ? '<div class="typing" style="margin:14px auto"><i></i><i></i><i></i></div>' : note + (top.length ? top.map((x, i) => lbLine(x, i, LBTAB)).join('') + (mi >= 20 ? `<div class="lbgap">⋯</div>${lbLine(rows[mi], mi, LBTAB)}` : '') : '<p class="muted b" style="padding:10px 0">Tento týždeň ešte nikto nič nesplnil. Buď prvý!</p>');
  const left = 7 - (new Date().getDay() + 6) % 7; const desc = { n: 'Kto tento týždeň splnil najviac zadaní: každý dokončený kvíz, hra, čítanie, písanie aj súboj.', s: 'Kto sa učí najviac dní po sebe bez prestávky.', x: 'Kto tento týždeň nazbieral najviac bodov.' }[LBTAB];
  return `${topbar('home')}<main class="view pop-in"><div><h1 style="font-size:2rem">🏆 Rebríček</h1><p class="muted b">Top 20 hráčov. Do rebríčka sa dostaneš sám, stačí byť prihlásený.</p></div>
  <div class="seg lbseg">${[['n', '✅ Zadania'], ['s', '🔥 Séria'], ['x', '⭐ Body']].map(([k, n]) => `<button class="${LBTAB === k ? 'on' : ''}" data-a="lbtab" data-t="${k}">${n}</button>`).join('')}</div><p class="muted b" style="font-size:.88rem;margin-top:-6px">${desc}</p>
  <section class="card lb">${body}</section>
  <section class="card lbprizes"><div class="sec"><h2>🎁 Odmeny pre troch najlepších</h2><span class="eyebrow">ešte ${left} ${plural(left, 'deň', 'dni', 'dní')}</span></div><p class="muted b" style="font-size:.86rem">Kto je v nedeľu večer v rebríčku <b>Zadania</b> na 1. až 3. mieste, dostane v pondelok vzácny doplnok. V obchode sa kúpiť nedá.</p><div class="lbpz">${LB_PRIZE.map(([id, c], i) => { const it = itemOf('acc', id); return `<div class="pz p${i + 1}"><span class="pth">${itemThumb('acc', it, p.av)}</span><b>${lbMedal(i)} ${it.n}</b><small>+${c} slniečok</small></div>`; }).join('')}</div></section>
  <p class="muted b" style="font-size:.8rem">V rebríčku je len meno, ročník a výsledky. Rodič ho vie vypnúť v rodičovskom účte.</p></main>${nav('')}`;
};
AFTER.board = () => lbFresh();
AFTER.duel = () => { if (FR_ON()) frFresh(20000); };
const _afterLearn = AFTER.learn; AFTER.learn = () => { _afterLearn && _afterLearn(); lbFresh(); };
const _afterHome = AFTER.home; AFTER.home = () => { _afterHome && _afterHome(); lbFresh(); if (FR_ON()) { frFresh(60000); inboxStart(); } };
function duelCreate() { const p = P(); if (D) duelClose(); D = { st: 'wait', host: true, code: String(R(1000, 9999)), me: String(p.name).slice(0, 14), id: Math.random().toString(36).slice(2, 10) }; D.ws = duelWs(D.code, duelMsg); return D.code; }
function duelJoin(code) { const p = P(); if (D) duelClose(); D = { st: 'joining', host: false, code, me: String(p.name).slice(0, 14), id: Math.random().toString(36).slice(2, 10) }; D.ws = duelWs(code, duelMsg, () => { const hi = () => D && D.ws && D.ws.say('join', { id: D.id, name: D.me }); hi(); D.tick = setInterval(hi, 1000); }); D.to = setTimeout(() => { if (D && D.st === 'joining') { duelClose(); D = { st: 'lobby', err: 'Súboj s týmto kódom sa nenašiel. Skontroluj kód.' }; if (UI.view === 'duel') render(null); } }, 15000); }
/* ===== Priatelia a správy ===== */
let FR = null, FC = null; const FCA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const FR_ON = () => SUPA_ON() && !!AUTH && DATA.settings.friends !== false;
const fcode = p => { if (!p.fc) { p.fc = Array.from({ length: 6 }, () => FCA[Math.floor(Math.random() * FCA.length)]).join(''); } return p.fc; };
async function sb(method, path, body, prefer) {
  const t = await supaToken(); const r = await fetch(SUPA.url + '/rest/v1/' + path, { method, headers: { ...lbHdr(t), 'content-type': 'application/json', ...(prefer ? { Prefer: prefer } : {}) }, body: body ? JSON.stringify(body) : undefined });
  if (!r.ok) { let j = {}; try { j = await r.json(); } catch (e) { } throw { status: r.status, code: j.code, message: j.message }; }
  const tx = await r.text(); return tx ? JSON.parse(tx) : null;
}
async function playersPush() {
  const w = weekId(); const rows = DATA.profiles.map(p => ({ user_id: AUTH.uid, pid: String(p.id), code: fcode(p), name: String(p.name).slice(0, 14), grade: p.grade, av: p.av, stats: { lvl: levelInfo(p.xp).L, n: p.wk && p.wk.w === w ? p.wk.n || 0 : 0, st: (p.streak && p.streak.count) || 0 }, updated_at: new Date().toISOString() }));
  try { await sb('POST', 'players?on_conflict=user_id,pid', rows, 'resolution=merge-duplicates,return=minimal'); }
  catch (e) { if (e.code === '23505') { DATA.profiles.forEach(p => { p.fc = ''; fcode(p); }); await sb('POST', 'players?on_conflict=user_id,pid', DATA.profiles.map((p, i) => ({ ...rows[i], code: p.fc })), 'resolution=merge-duplicates,return=minimal'); } else throw e; }
}
async function frLoad() {
  if (FR && FR.loading) return; const prev = FR; FR = { loading: true, list: prev && prev.list, inc: (prev && prev.inc) || [], out: (prev && prev.out) || [], unread: (prev && prev.unread) || {}, total: (prev && prev.total) || 0, at: Date.now() }; let out;
  try {
    if (!(SUPA_ON() && AUTH)) throw { off: true }; if (DATA.settings.friends === false) throw { disabled: true };
    const me = P(); const had = !!me.fc; await playersPush(); if (!had) save();
    const [a, b] = await Promise.all([sb('GET', 'friends?select=friend_code&my_code=eq.' + me.fc), sb('GET', 'friends?select=my_code&friend_code=eq.' + me.fc)]);
    const ok = c => c !== me.fc && /^[A-Z0-9]{6}$/.test(c); const blocked = me.fblock || []; const mine = [...new Set(a.map(x => x.friend_code))].filter(ok), theirs = [...new Set(b.map(x => x.my_code))].filter(ok);
    const mutual = mine.filter(c => theirs.includes(c)), incC = theirs.filter(c => !mine.includes(c) && !blocked.includes(c)), outC = mine.filter(c => !theirs.includes(c));
    const all = [...new Set([...mutual, ...incC, ...outC])]; const pl = all.length ? await sb('GET', 'players?select=code,name,grade,av,stats&code=in.(' + all.join(',') + ')') : []; const by = c => pl.find(x => x.code === c) || { code: c, name: 'Hráč', grade: '' };
    const unread = {}, last = {}; let total = 0; if (mutual.length) { const ms = await sb('GET', `messages?select=id,from_code,to_code,kind,body,created_at&or=(from_code.eq.${me.fc},to_code.eq.${me.fc})&order=id.desc&limit=300`); const seen = me.fread || {}; ms.forEach(m => { const peer = m.from_code === me.fc ? m.to_code : m.from_code; if (!mutual.includes(peer)) return; if (!last[peer]) last[peer] = m; if (m.to_code === me.fc && m.id > (seen[peer] || 0)) { unread[peer] = (unread[peer] || 0) + 1; total++; } }); }
    out = { list: mutual.map(by).sort((x, y) => String(x.name).localeCompare(String(y.name), 'sk')), inc: incC.map(by), out: outC.map(by), unread, last, total: total + incC.length };
  } catch (e) { out = { err: e && e.off ? 'off' : e && e.disabled ? 'disabled' : e && e.status === 404 ? 'missing' : 'net', list: [], inc: [], out: [], unread: {}, total: 0 }; }
  out.at = Date.now(); if (prev && prev.msg) { out.msg = prev.msg; out.ok = prev.ok; } FR = out; inboxStart();
  if (UI.view === 'friends' || (UI.view === 'duel' && D && D.st === 'lobby')) render(null); else { const nb = $('.nav [data-v="friends"]'); if (nb && FR.total > 0 && !nb.querySelector('.dot')) nb.insertAdjacentHTML('beforeend', '<span class="dot"></span>'); }
}
function frFresh(ms = 30000) { if (!FR || (!FR.loading && Date.now() - (FR.at || 0) > ms)) frLoad(); }
const frAv = av => { try { return avatarSvg(av, { crop: 'head' }); } catch (e) { return ''; } };
/* živé upozornenia: pozvánky do hry, žiadosti a správy */
let INBOX = null;
function wsDone(ws) { if (!ws) return; clearInterval(ws._hb); try { ws.onerror = null; ws.close(); } catch (e) { } }
function inboxStart() { try { if (!FR_ON()) return; const me = P(); if (!me || !me.fc) return; if (INBOX && INBOX.code === me.fc && INBOX.ws.readyState <= 1) return; if (INBOX) wsDone(INBOX.ws); INBOX = { code: me.fc, ws: duelWs('inbox-' + me.fc, inboxMsg) }; } catch (e) { } }
function inboxSend(code, ev, payload) { try { const ws = duelWs('inbox-' + code, () => { }, () => { ws.say(ev, payload); setTimeout(() => wsDone(ws), 900); }); setTimeout(() => wsDone(ws), 8000); } catch (e) { } }
function inboxMsg(ev, pl) {
  const me = P(); if (!me || !pl || pl.from === me.fc) return; const friend = FR && FR.list && FR.list.find(f => f.code === pl.from);
  if (ev === 'invite') { if (!friend || ['quiz', 'game', 'duel', 'cards', 'pexeso', 'match', 'sort'].includes(UI.view)) return; $$('.over.invite').forEach(e => e.remove()); const o = document.createElement('div'); o.className = 'over invite'; o.innerHTML = `<div class="card box"><span class="frav" style="width:84px;height:84px">${frAv(friend.av)}</span><h2>⚔️ ${esc(friend.name)} ťa pozýva na súboj!</h2><p class="muted b">8 otázok, vyhrá ten, kto ich má viac správne.</p><div class="rowbtns" style="width:100%"><button class="btn" data-a="ov-close">Teraz nie</button><button class="btn primary" data-a="fc-join" data-c="${esc(String(pl.code))}">Prijať</button></div></div>`; document.body.appendChild(o); sfx('gift'); buzz([40, 60, 40]); setTimeout(() => o.remove(), 60000); }
  else if (ev === 'msg') { if (!friend) return; if (!(UI.view === 'fchat' && FC && FC.code === pl.from)) { sfx('pop'); toast('💬 ' + friend.name + ' ti napísal(a).'); if (FR) FR.at = 0; frFresh(0); } }
  else if (ev === 'freq') { FTAB = 'req'; if (FR) FR.at = 0; frFresh(0); sfx('pop'); toast('👋 Máš novú žiadosť o priateľstvo.'); }
  else if (ev === 'facc') { if (FR) { FR.at = 0; FR.msg = ''; } frFresh(0); sfx('gift'); toast('🎉 ' + String(pl.name || 'Kamarát').slice(0, 14) + ' prijal(a) tvoju žiadosť.'); }
}
let FTAB = 'chats';
VIEWS.friends = () => {
  const p = P(); const st = FR || { loading: true, list: [] };
  const wrap = (body, tabs = '') => `${topbar()}<main class="view pop-in"><div><h1 style="font-size:2rem">🤝 Priatelia</h1></div>${tabs}${body}</main>${nav('friends')}`;
  if (st.err === 'off') return wrap(`<section class="card duelbox">${bearSvg('')}<h2>Najprv sa prihlás</h2><p class="muted b">Priatelia fungujú len na webe po prihlásení e-mailom rodiča.</p></section>`);
  if (st.err === 'disabled') return wrap(`<section class="card duelbox">${bearSvg('comfort')}<h2>Priatelia sú vypnutí</h2><p class="muted b">Zapnúť ich môže rodič v rodičovskom účte.</p></section>`);
  if (st.err === 'missing') return wrap(`<section class="card duelbox">${bearSvg('')}<h2>Už čoskoro</h2><p class="muted b">Priatelia ešte nie sú v apke zapnutí.</p></section>`);
  const list = st.list || [], inc = st.inc || [], out = st.out || [], last = st.last || {}; const unreadAll = Object.values(st.unread || {}).reduce((a, b) => a + b, 0);
  const who = f => `<span class="frav">${frAv(f.av)}</span><span class="nm">${esc(f.name)}<small>${f.grade ? f.grade + '. ročník' : ''}</small></span>`;
  const tabs = `<div class="seg ftabs">${[['chats', '💬', 'Chaty', unreadAll], ['friends', '🤝', 'Priatelia', 0], ['req', '👋', 'Žiadosti', inc.length], ['add', '➕', 'Pridať', 0]].map(([k, e, n, c]) => `<button class="${FTAB === k ? 'on' : ''}" data-a="ftab" data-t="${k}"><span>${e}</span>${n}${c ? `<em>${c}</em>` : ''}</button>`).join('')}</div>`;
  const loading = st.loading && !st.list ? '<div class="typing" style="margin:14px auto"><i></i><i></i><i></i></div>' : ''; const neterr = st.err === 'net' ? '<p class="muted b">Nepodarilo sa načítať. Skontroluj internet.</p>' : '';
  const prev = f => { const m = last[f.code]; if (!m) return 'Zatiaľ žiadna správa. Pozdrav ho! 👋'; const mine = m.from_code === p.fc; return (mine ? 'Ty: ' : '') + (m.kind === 'duel' ? '⚔️ Výzva na súboj' : esc(String(m.body || '').slice(0, 40))); };
  let body;
  if (FTAB === 'chats') { const srt = list.slice().sort((a, b) => ((last[b.code] || {}).id || 0) - ((last[a.code] || {}).id || 0)); body = loading || (srt.length ? `<section class="card lb">${srt.map(f => `<button class="frrow press" data-a="fr-open" data-c="${f.code}"><span class="frav">${frAv(f.av)}</span><span class="nm">${esc(f.name)}<small class="${st.unread && st.unread[f.code] ? 'unr' : ''}">${prev(f)}</small></span>${st.unread && st.unread[f.code] ? `<em>${st.unread[f.code]}</em>` : last[f.code] ? `<small class="ftime">${fmtTime(new Date(last[f.code].created_at).getTime())}</small>` : '<span class="pcgo">›</span>'}</button>`).join('')}</section>` : `<section class="card duelbox">${bearSvg('')}<p class="b">Zatiaľ nemáš žiadne chaty.</p><p class="muted b">Najprv si pridaj priateľa. Keď prijme tvoju žiadosť, môžete si písať.</p><button class="btn primary block" data-a="ftab" data-t="add">➕ Pridať priateľa</button></section>`); }
  else if (FTAB === 'friends') body = loading || (list.length ? `<section class="card lb"><div class="sec"><h2>Moji priatelia</h2><span class="eyebrow">${list.length}</span></div>${list.map(f => `<div class="frrow"><span class="frav">${frAv(f.av)}</span><span class="nm">${esc(f.name)}<small>${f.grade}. ročník · Level ${(f.stats && f.stats.lvl) || 1}</small><small>✅ ${(f.stats && f.stats.n) || 0} · 🔥 ${(f.stats && f.stats.st) || 0}</small></span><button class="iconbtn press" data-a="fr-open" data-c="${f.code}" aria-label="Napísať">💬</button><button class="iconbtn press" data-a="duel-invite-go" data-c="${f.code}" aria-label="Vyzvať na súboj">⚔️</button><button class="iconbtn press" data-a="fr-menu" data-c="${f.code}" aria-label="Viac">⋯</button></div>`).join('')}</section>` : `<section class="card duelbox">${bearSvg('')}<p class="b">Zatiaľ tu nikto nie je.</p><p class="muted b">Pošli kamarátovi žiadosť jeho kódom.</p><button class="btn primary block" data-a="ftab" data-t="add">➕ Pridať priateľa</button></section>`);
  else if (FTAB === 'req') body = `${inc.length ? `<section class="card lb freq"><div class="sec"><h2>Prišli ti</h2><span class="eyebrow">${inc.length}</span></div>${inc.map(f => `<div class="frrow">${who(f)}<button class="btn small" data-a="fr-reject" data-c="${f.code}">Nie</button><button class="btn small primary" data-a="fr-accept" data-c="${f.code}">Prijať</button></div>`).join('')}</section>` : ''}${out.length ? `<section class="card lb"><div class="sec"><h2>⏳ Čaká na potvrdenie</h2><span class="eyebrow">${out.length}</span></div>${out.map(f => `<div class="frrow">${who(f)}<button class="btn small" data-a="fr-cancel" data-c="${f.code}">Zrušiť</button></div>`).join('')}</section>` : ''}${!inc.length && !out.length ? `<section class="card duelbox">${bearSvg('')}<p class="b">Žiadne žiadosti.</p><p class="muted b">Keď ti niekto pošle žiadosť o priateľstvo, uvidíš ju tu.</p></section>` : ''}`;
  else body = `<section class="card frme"><span class="eyebrow">Tvoj kód</span><div class="duelcode sm">${(p.fc || '······').split('').map(x => `<i>${x}</i>`).join('')}</div><p class="muted b" style="font-size:.86rem;text-align:center;margin:0">Povedz ho kamarátovi, alebo zadaj jeho kód nižšie.</p><button class="btn small" data-a="fr-copy">📋 Skopírovať kód</button></section>
  <section class="card fradd"><b>Poslať žiadosť o priateľstvo</b><div class="fraddrow"><input class="field" id="frcode" maxlength="6" autocapitalize="characters" autocomplete="off" placeholder="Kód kamaráta"><button class="btn primary small" data-a="fr-add">Poslať</button></div><p class="loginmsg ${st.ok ? 'ok' : ''}" id="frmsg">${esc(st.msg || '')}</p><div class="dsteps"><div><span>1</span><p>Kamarát ti povie svoj 6-miestny kód.</p></div><div><span>2</span><p>Zadáš ho sem a pošleš žiadosť.</p></div><div><span>3</span><p>Keď ju prijme, nájdeš ho v záložke Priatelia a môžete si písať.</p></div></div></section>`;
  return wrap(neterr + body, tabs);
};
AFTER.friends = () => frFresh(8000);
const FC_PRESETS = ['Ahoj! 👋', 'Ako sa máš?', 'Dobre 🙂', 'Poď sa učiť! 📚', 'Dáme súboj? ⚔️', 'Gratulujem! 🎉', 'Si super! ⭐', 'Ďakujem 💛', 'Koľko máš zadaní?', 'Haha 😄', 'Áno', 'Nie', 'Musím ísť, čau!', 'Dobrú noc 🌙'];
const FC_EMOJI = ['😀', '😂', '🥳', '😎', '🤔', '😴', '👍', '👏', '💪', '❤️', '⭐', '🔥', '🧸', '🎉'];
function fcBubbles() {
  const me = P(); if (!FC.msgs) return '<div class="typing" style="margin:14px auto"><i></i><i></i><i></i></div>'; if (!FC.msgs.length) return `<p class="muted b" style="text-align:center;padding:20px 0">Zatiaľ žiadne správy. Pozdrav kamaráta! 👋</p>`;
  return FC.msgs.map(m => { const mine = m.from_code === me.fc; const t = new Date(m.created_at).getTime(); if (m.kind === 'duel') { const fresh = Date.now() - t < 10 * 60000; return `<div class="fmsg ${mine ? 'me' : ''} duel"><span>⚔️ ${mine ? 'Vyzval(a) si kamaráta na súboj.' : 'Vyzýva ťa na súboj!'}</span>${!mine && fresh ? `<button class="btn small primary" data-a="fc-join" data-c="${esc(m.body)}">Prijať súboj</button>` : !mine ? '<small>Výzva už vypršala</small>' : ''}<small>${fmtTime(t)}</small></div>`; } return `<div class="fmsg ${mine ? 'me' : ''}"><span>${esc(m.body)}</span><small>${fmtTime(t)}</small></div>`; }).join('');
}
async function fcLoad() {
  if (!FC || FC.busy) return; FC.busy = true; const me = P(); const A = me.fc, B = FC.code;
  try { const ms = await sb('GET', `messages?select=id,from_code,to_code,kind,body,created_at&or=(and(from_code.eq.${A},to_code.eq.${B}),and(from_code.eq.${B},to_code.eq.${A}))&order=id.desc&limit=60`); if (!FC) return; const last = ms.length ? ms[0].id : 0; const changed = !FC.msgs || last !== FC.last; FC.msgs = ms.reverse(); FC.last = last; me.fread = me.fread || {}; if (last > (me.fread[B] || 0)) { me.fread[B] = last; save(); } if (FR && FR.unread && FR.unread[B]) { FR.total = Math.max(0, FR.total - FR.unread[B]); delete FR.unread[B]; } if (changed && UI.view === 'fchat') { const el = $('#fmsgs'); if (el) { el.innerHTML = fcBubbles(); el.scrollTop = el.scrollHeight; } } }
  catch (e) { const el = $('#fmsgs'); if (el && FC && !FC.msgs) el.innerHTML = '<p class="muted b" style="text-align:center;padding:20px 0">Správy sa nepodarilo načítať.</p>'; }
  if (FC) FC.busy = false;
}
async function fcSend(kind, body) {
  if (!FC || FC.sending) return; body = String(body || '').trim().slice(0, 200); if (!body) return; FC.sending = true; const me = P();
  try { await sb('POST', 'messages', { from_code: me.fc, to_code: FC.code, kind, body }, 'return=minimal'); sfx('pop'); if (FC.ws) FC.ws.say('new', {}); if (kind === 'text') inboxSend(FC.code, 'msg', { from: me.fc }); FC.sending = false; await fcLoad(); }
  catch (e) { FC.sending = false; toast('Správu sa nepodarilo odoslať.'); }
}
function fcClose() { if (!FC) return; clearInterval(FC.poll); if (FC.ws) { clearInterval(FC.ws._hb); try { FC.ws.onerror = null; FC.ws.close(); } catch (e) { } } FC = null; }
VIEWS.fchat = pr => {
  const f = (FR && FR.list || []).find(x => x.code === pr.code) || { code: pr.code, name: 'Priateľ', grade: '' };
  return `<header class="top"><button class="iconbtn press" data-a="nav" data-v="friends" aria-label="Späť">←</button><span class="headbub" style="width:44px;height:44px">${frAv(f.av)}</span><div class="who"><b>${esc(f.name)}</b><span class="muted b" style="font-size:.8rem">${f.grade ? f.grade + '. ročník' : ''}</span></div><button class="iconbtn press" data-a="fc-duel" aria-label="Vyzvať na súboj">⚔️</button><button class="iconbtn press" data-a="fc-menu" aria-label="Viac">⋯</button></header>
  <main class="view nonav fchat"><div class="fmsgs" id="fmsgs">${FC && FC.code === pr.code ? fcBubbles() : '<div class="typing" style="margin:14px auto"><i></i><i></i><i></i></div>'}</div>
  <div class="fcbar"><div class="fcrow">${FC_PRESETS.map((t, i) => `<button class="chip" data-a="fc-say" data-i="${i}">${t}</button>`).join('')}</div><div class="fcrow">${FC_EMOJI.map((t, i) => `<button class="chip emo1" data-a="fc-emo" data-i="${i}">${t}</button>`).join('')}</div>${DATA.settings.freeChat ? `<div class="fraddrow"><input class="field" id="fctext" maxlength="200" placeholder="Napíš správu…" autocomplete="off"><button class="btn primary small" data-a="fc-text">Poslať</button></div>` : '<p class="muted b" style="font-size:.76rem;text-align:center;margin:0">Vlastné správy môže zapnúť rodič v rodičovskom účte.</p>'}</div></main>`;
};
AFTER.fchat = () => { const code = UI.params.code; if (!FC || FC.code !== code) { fcClose(); const me = P(); FC = { code, msgs: null, last: 0 }; FC.ws = duelWs('chat-' + [me.fc, code].sort().join('-'), ev => { if (ev === 'new') fcLoad(); }); FC.poll = setInterval(fcLoad, 6000); fcLoad(); } else { const el = $('#fmsgs'); if (el) el.scrollTop = el.scrollHeight; } const tx = $('#fctext'); if (tx) tx.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); const v = tx.value; tx.value = ''; fcSend('text', v); } }); };
const WEBOK = () => { try { return localStorage.getItem('bystrik.web') === '1'; } catch (e) { return true; } };
VIEWS.getapp = () => { const ios = /iphone|ipad|ipod/i.test(navigator.userAgent); return `<main class="view nonav loginv"><div class="loginbear" style="width:170px;height:170px">${bearSvg('')}</div><h1 class="logintitle">Stiahni si Bystríka</h1><p class="muted b" style="text-align:center">Hravé učenie pre 1. až 4. ročník. Apka je zadarmo a na ploche funguje na celú obrazovku.</p><section class="card loginbox"><div class="getlist"><div><span>📲</span><p>Vlastná ikonka na ploche</p></div><div><span>⚡</span><p>Rýchlejšie spustenie a celá obrazovka</p></div><div><span>🧸</span><p>Postup sa uloží do tvojho účtu</p></div></div>${A2HS ? '<button class="btn primary block" data-a="getapp-install">📲 Stiahnuť apku</button>' : ios ? '<div class="gethow"><b>Na iPhone a iPade</b><p>1. Otvor túto stránku v Safari.<br>2. Ťukni dole na <b>Zdieľať</b> (štvorček so šípkou).<br>3. Zvoľ <b>Pridať na plochu</b>.</p></div>' : '<div class="gethow"><b>Ako ju stiahnuť</b><p>1. Otvor ponuku prehliadača <b>⋮</b> vpravo hore.<br>2. Zvoľ <b>Inštalovať aplikáciu</b> alebo <b>Pridať na plochu</b>.</p></div>'}<button class="linkbtn" data-a="getapp-web">Pokračovať v prehliadači</button></section></main>`; };
function boot() {
  if (!(window.claude && window.claude.use) && typeof EMO_BASE !== 'undefined' && !isStandalone() && !WEBOK() && !RECOVER) return go('getapp', {}, 'u');
  if (SUPA_ON() && RECOVER) return go('newpass', {}, 'u');
  if (SUPA_ON() && !AUTH) return go('login', {}, 'u');
  if (!DATA.profiles.length) { OB = { step: 0, name: '', gender: 'd', grade: 1, av: defaultAvatar('d'), room: defaultRoom('d') }; return go('onboard', {}, 'u'); }
  if (!P()) return go('profiles', {}, 'u');
  go('home', { wave: true }, 'u');
}
load(); applyTheme(); registerNotes();
try { const m = location.hash.match(/[#&]k=([^&]+)/); if (m && !(window.claude && window.claude.use)) { setApiKey(decodeURIComponent(m[1])); history.replaceState(null, '', location.pathname + location.search); setTimeout(() => toast('🧸 AI kľúč uložený. Bystrík teraz vie odpovedať!'), 900); } } catch (e) { }
if (MAGIC) { (async () => { try { const r = await fetch(SUPA.url + '/auth/v1/user', { headers: { apikey: SUPA.key, Authorization: 'Bearer ' + MAGIC.at } }); const j = await r.json(); if (!r.ok || !j.id) throw 0; setAuth({ at: MAGIC.at, rt: MAGIC.rt, exp: MAGIC.exp, uid: j.id, email: j.email }); try { await supaSync(); } catch (e) { DBREF = SUPADB; } toast('Prihlásenie úspešné ✓'); } catch (e) { LOGIN.msg = 'Odkaz už neplatí. Požiadajte o nový.'; } MAGIC = null; boot(); })(); }
boot();
if (SUPA_ON() && AUTH) supaSync().then(ch => { if (ch && !['quiz', 'cards', 'pexeso', 'match', 'sort', 'game', 'chat'].includes(UI.view)) boot(); }).catch(() => { DBREF = SUPADB; });
setTimeout(initDb, 0);
