/* ===== Stav a ukladanie ===== */
const KEY = 'bystrik.v1';
let DATA = { profiles: [], current: null, settings: {}, parent: { pin: null }, t: 0 };
const CHAT_ON = () => !!(DATA.settings.chat && ((window.claude && window.claude.use) || getApiKey()));
const COIN = '<svg class="ci" viewBox="0 0 40 40" aria-hidden="true"><use href="#coin"/></svg>';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function normalize() {
  DATA.settings = Object.assign({ sound: true, voice: true, calc: true, chat: true, gameLimit: 0, theme: 'auto', lb: false, friends: true, freeChat: false, msgOk: false }, DATA.settings || {});
  if (DATA.settings.lite === undefined) DATA.settings.lite = !!(navigator.deviceMemory && navigator.deviceMemory <= 2);
  if (!DATA.lbOpt) { DATA.settings.lb = false; DATA.lbOpt = 1; } /* rebríček len so súhlasom rodiča */
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
  p.av.pet = 'nic'; if (WCAT === 'pet') WCAT = 'hair';
  if (!p.room) p.room = defaultRoom(p.av.gender); p.room.stickers = p.room.stickers || [];
}
/* keď Bystrík spí, celá appka prejde do nočného režimu */
function nightOn() { const p = (DATA.profiles || []).find(x => x.id === DATA.current); return !!(p && p.bear && p.bear.asleep); }
let LASTNIGHT = null;
function applyTheme(slow) {
  const run = () => { LASTNIGHT = nightOn(); document.documentElement.classList.toggle('bnight', LASTNIGHT); document.documentElement.classList.toggle('lite', !!DATA.settings.lite); applyPageBg(); const t = LASTNIGHT ? 'dark' : DATA.settings.theme; if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t; else if (document.documentElement.dataset.theme && THEME_SET) delete document.documentElement.dataset.theme; THEME_SET = t !== 'auto'; };
  /* plynulý prechod: prehliadač prelína dve snímky obrazovky (lacné), inak krátky prechod farieb */
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (slow && !reduce && document.startViewTransition) { document.documentElement.classList.add('vtslow'); const vt = document.startViewTransition(run); vt.finished.finally(() => document.documentElement.classList.remove('vtslow')); return; }
  try { const de = document.documentElement; de.classList.add('thx'); clearTimeout(applyTheme.t); applyTheme.t = setTimeout(() => de.classList.remove('thx'), 520); } catch (e) { } run();
}
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
    const j = await res.json(); try { LAST_USAGE = ((j.usage && j.usage.input_tokens) || 0) + ((j.usage && j.usage.output_tokens) || 0) || null; } catch (e) { }
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
      const j = await res.json(); GEM_OK = model; try { LAST_USAGE = (j.usageMetadata && j.usageMetadata.totalTokenCount) || null; } catch (e) { }
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
