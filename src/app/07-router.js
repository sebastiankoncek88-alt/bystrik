/* ===== Router ===== */
let UI = { view: 'home', params: {} };
let TIMERS = [];
function clearTimers() { TIMERS.forEach(t => { clearInterval(t); clearTimeout(t); }); TIMERS = []; }
function go(view, params = {}, dir = 'f') {
  if (typeof PARENT_OK !== 'undefined' && PARENT_OK && !['parent', 'psetup', 'pin', 'remote', 'onboard', 'teacher', 'privacy'].includes(view)) PARENT_OK = false;
  try { if (typeof REC !== 'undefined' && REC && REC.mr && REC.mr.state !== 'inactive' && view !== 'read') { REC.mr.onstop = null; REC.mr.stop(); REC.stream && REC.stream.getTracks().forEach(t => t.stop()); if (typeof RD !== 'undefined' && RD) RD.recording = false; } } catch (e) { }
  if (view !== 'fchat' && typeof fcClose === 'function') fcClose();
  if (GUIDE && !GUIDE.nav) GUIDE = null;
  clearTimers(); closeSheet(); clearTut(); $$('.fb,.peek,.peekbub,.over').forEach(e => e.remove());
  try { speechSynthesis.cancel(); } catch (e) { }
  UI.view = view; UI.params = params; render(dir); window.scrollTo(0, 0);
}
const NAV_ORDER = ['home', 'learn', 'games', 'friends', 'shop', 'wardrobe']; let LASTVIEW = null;
/* svietiaca bublina v spodnom menu – plynulo preskočí na novú záložku */
let NAVX = null;
function navPill() {
  const inn = $('.nav .in'); if (!inn) { NAVX = null; return; } const on = inn.querySelector('button.on'); if (!on) return;
  const pill = document.createElement('i'); pill.className = 'navpill'; inn.prepend(pill); const to = { l: on.offsetLeft, w: on.offsetWidth, nav: inn.closest('.pnav') ? 'p' : 'c' };
  const set = x => { pill.style.left = x.l + 'px'; pill.style.width = x.w + 'px'; };
  if (NAVX && NAVX.nav === to.nav && (NAVX.l !== to.l)) { set(NAVX); void pill.offsetWidth; pill.classList.add('go'); requestAnimationFrame(() => set(to)); } else set(to);
  NAVX = to;
}
function ghostOut(dir) {
  try { const old = document.querySelector('#app .view'); if (!old || matchMedia('(prefers-reduced-motion: reduce)').matches) return; $$('.vghost').forEach(e => e.remove());
    const r = old.getBoundingClientRect(); const vis = [...old.children].map(c => { const q = c.getBoundingClientRect(); return q.bottom > -40 && q.top < innerHeight + 40; }); const g = old.cloneNode(true); [...g.children].forEach((c, i) => { if (!vis[i]) c.style.visibility = 'hidden'; if (!vis[i]) c.replaceChildren(); }); g.querySelectorAll('[filter]').forEach(e => e.removeAttribute('filter')); g.querySelectorAll('[id]').forEach(e => e.removeAttribute('id')); g.querySelectorAll('[data-a]').forEach(e => e.removeAttribute('data-a'));
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
  applyRoom(); navPill(); if (CHG) setTimeout(chgStep, 260); if (nightOn() !== LASTNIGHT) applyTheme(true);
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
  if (on === 'shop') on = 'wardrobe'; if (on === 'friends' || on === 'board') on = 'me';
  const b = (v, i, n, dot) => `<button class="${on === v ? 'on' : ''}" data-a="nav" data-v="${v}"><span class="ni">${i}</span>${n}${dot ? '<span class="dot"></span>' : ''}</button>`;
  return `<nav class="nav"><div class="in">${b('home', '🏠', 'Domov', claimable && on !== 'home')}${b('learn', '📚', 'Učenie')}${b('games', '🎮', 'Hry')}${b('wardrobe', '👕', 'Šatník', fresh)}${b('me', '🙋', 'Ja', !!(FR && FR.total > 0) && on !== 'me')}</div></nav>`;
}
const bearSvg = (cls = 'owl') => `<svg class="bear ${cls}" viewBox="0 0 120 120" aria-hidden="true"><ellipse class="b-shadow" cx="60" cy="117" rx="27" ry="3.4" fill="#000" opacity=".14"/><g class="b-all"><g class="b-feet"><ellipse cx="47" cy="111.5" rx="10.5" ry="6.4" fill="url(#bfur2)" stroke="#5E3A18" stroke-width="1.6"/><ellipse cx="73" cy="111.5" rx="10.5" ry="6.4" fill="url(#bfur2)" stroke="#5E3A18" stroke-width="1.6"/><ellipse cx="47" cy="113" rx="4.6" ry="2.8" fill="#F2D3A8"/><ellipse cx="73" cy="113" rx="4.6" ry="2.8" fill="#F2D3A8"/><g fill="#F2D3A8"><circle cx="42" cy="109" r="1.5"/><circle cx="47" cy="108" r="1.6"/><circle cx="52" cy="109" r="1.5"/><circle cx="68" cy="109" r="1.5"/><circle cx="73" cy="108" r="1.6"/><circle cx="78" cy="109" r="1.5"/></g></g><g class="b-body"><path d="M37 98 Q37 81 60 81 Q83 81 83 98 Q83 115 60 115 Q37 115 37 98Z" fill="url(#bfur)" stroke="#5E3A18" stroke-width="1.8"/><ellipse cx="60" cy="101.5" rx="13.5" ry="10.5" fill="url(#bbelly)"/><path d="M60 99 c-1.5-2.3-5-1.3-4.4 1.3 .5 2.1 4.4 4.4 4.4 4.4 s3.9-2.3 4.4-4.4 c.6-2.6-2.9-3.6-4.4-1.3z" fill="#FF8FA6" opacity=".9"/></g><g class="b-arm-l"><ellipse cx="39.5" cy="96" rx="6.6" ry="9.6" fill="url(#bfur2)" stroke="#5E3A18" stroke-width="1.6" transform="rotate(24 39.5 96)"/><ellipse cx="36.6" cy="102.4" rx="3.2" ry="2.6" fill="#F2D3A8" transform="rotate(24 36.6 102.4)"/></g><g class="b-arm-r"><ellipse cx="80.5" cy="96" rx="6.6" ry="9.6" fill="url(#bfur2)" stroke="#5E3A18" stroke-width="1.6" transform="rotate(-24 80.5 96)"/><ellipse cx="83.4" cy="102.4" rx="3.2" ry="2.6" fill="#F2D3A8" transform="rotate(-24 83.4 102.4)"/></g><g class="b-bow"><path d="M38 82 Q60 92 82 82 L83 89 Q60 99.5 37 89Z" fill="url(#bbow)" stroke="#167A5C" stroke-width="1.3" stroke-linejoin="round"/><path d="M67 90 L77 88.5 L79 104 L73.5 100.5 L69.5 105Z" fill="url(#bbow)" stroke="#167A5C" stroke-width="1.3" stroke-linejoin="round"/><circle cx="45" cy="87.5" r="1.4" fill="#fff" opacity=".7"/><circle cx="53" cy="90.5" r="1.4" fill="#fff" opacity=".7"/><circle cx="62" cy="91" r="1.4" fill="#fff" opacity=".7"/><circle cx="73" cy="95" r="1.3" fill="#fff" opacity=".7"/></g><g class="b-head"><g class="b-ear-l"><circle cx="25" cy="20" r="13" fill="url(#bfur2)" stroke="#5E3A18" stroke-width="1.8"/><circle cx="25.6" cy="21" r="7.4" fill="url(#bear)"/></g><g class="b-ear-r"><circle cx="95" cy="20" r="13" fill="url(#bfur2)" stroke="#5E3A18" stroke-width="1.8"/><circle cx="94.4" cy="21" r="7.4" fill="url(#bear)"/></g><path d="M13 53 C13 26 34 12 60 12 C86 12 107 26 107 53 C107 75 89 89 60 89 C31 89 13 75 13 53Z" fill="url(#bfur)" stroke="#5E3A18" stroke-width="2"/><g class="b-tuft"></g><ellipse cx="38" cy="27" rx="14" ry="6" fill="#fff" opacity=".32" transform="rotate(-20 38 27)"/><ellipse cx="86" cy="30" rx="5" ry="2.6" fill="#fff" opacity=".22" transform="rotate(25 86 30)"/><ellipse cx="60" cy="67" rx="19" ry="14.5" fill="url(#bsnout)" stroke="#C9A27A" stroke-width="1"/><ellipse cx="54" cy="61" rx="7" ry="3" fill="#fff" opacity=".45"/><g class="b-brows"><path d="M34.5 38 Q40 35.2 45.5 37.6" stroke="#7A4410" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M74.5 37.6 Q80 35.2 85.5 38" stroke="#7A4410" stroke-width="2.4" fill="none" stroke-linecap="round"/></g><g class="b-eyes"><ellipse cx="40" cy="50" rx="6.4" ry="7.6" fill="url(#beye)"/><ellipse cx="80" cy="50" rx="6.4" ry="7.6" fill="url(#beye)"/><g class="b-look"><ellipse cx="42.2" cy="46.8" rx="2.8" ry="3.1" fill="#fff"/><ellipse cx="82.2" cy="46.8" rx="2.8" ry="3.1" fill="#fff"/><circle cx="37.8" cy="53.4" r="1.3" fill="#fff" opacity=".9"/><circle cx="77.8" cy="53.4" r="1.3" fill="#fff" opacity=".9"/></g></g><g class="b-happyeyes"><path d="M33.5 52 Q40 43.5 46.5 52 M73.5 52 Q80 43.5 86.5 52" stroke="#2E1A14" stroke-width="3.4" fill="none" stroke-linecap="round"/></g><ellipse class="b-cheek" cx="27" cy="62" rx="7.4" ry="4.6" fill="url(#bcheek)"/><ellipse class="b-cheek" cx="93" cy="62" rx="7.4" ry="4.6" fill="url(#bcheek)"/><path class="b-nose" d="M52 59.5 Q60 55 68 59.5 Q67.4 65 60 66.6 Q52.6 65 52 59.5Z" fill="#2E1A14"/><ellipse cx="57" cy="59" rx="3" ry="1.4" fill="#fff" opacity=".6"/><g class="b-smile"><path d="M60 66.6 Q60 72 55 72.6 Q51.6 72.6 51 69.6 M60 66.6 Q60 72 65 72.6 Q68.4 72.6 69 69.6" stroke="#3A2430" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M57 72 Q60 77.4 63 72 Q60 73.2 57 72Z" fill="#FF7F9A" stroke="#3A2430" stroke-width="1.2" stroke-linejoin="round"/></g><g class="b-mouth"><ellipse cx="60" cy="73" rx="5" ry="4.4" fill="#7A2335" stroke="#3A2430" stroke-width="1.4"/><ellipse cx="60" cy="75" rx="3" ry="1.8" fill="#FF8FA6"/></g></g></g><g class="b-sparks"><path d="M10 40 l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#FFC94D"/><path d="M108 28 l1.6 4 4 1.6-4 1.6-1.6 4-1.6-4-4-1.6 4-1.6z" fill="#FF8FA3"/><path d="M110 78 l1.4 3.4 3.4 1.4-3.4 1.4-1.4 3.4-1.4-3.4-3.4-1.4 3.4-1.4z" fill="#86E3C9"/></g><g class="b-hearts"><path d="M104 54 c-1.4-2.2-4.8-1.3-4.3 1.3 .4 2 4.3 4.3 4.3 4.3 s3.9-2.3 4.3-4.3 c.5-2.6-2.9-3.5-4.3-1.3z" fill="#FF6F91"/><path d="M14 72 c-1.1-1.7-3.7-1-3.3 1 .3 1.6 3.3 3.3 3.3 3.3 s3-1.7 3.3-3.3 c.4-2-2.2-2.7-3.3-1z" fill="#FF8FA6"/></g></svg>`;
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

