/* ===== Bystrík – malý kútik starostlivosti (nie je hlavná úloha) ===== */
const HRS = 3600000;
function bearInit(p) { if (!p.bear) p.bear = { fed: Date.now(), slept: Date.now(), care: Date.now(), honey: 2, asleep: false }; return p.bear; }
function bearMood(p) { const b = bearInit(p); const since = Date.now() - (b.care || 0); if (since > 48 * HRS) return 'sick'; if (b.asleep) return 'sleep'; if (Date.now() - (b.fed || 0) > 20 * HRS) return 'hungry'; if (Date.now() - (b.slept || 0) > 26 * HRS) return 'tired'; return 'happy'; }
const BEAR_TXT = { sick: 'Bystrík je trochu nachladnutý 🤧. Stačí ho nakŕmiť alebo uložiť spať a hneď mu bude lepšie.', sleep: 'Bystrík sladko spí 💤. Zobuď ho, keď sa budeš chcieť učiť.', hungry: 'Bystrík by si dal trochu medu 🍯.', tired: 'Bystrík zíva. Možno by si rád zdriemol.', happy: 'Bystrík má dobrú náladu! Ťukni naňho.' };
const BEAR_PEP = ['Ide ti to skvele! 💪', 'Ešte jedna úloha a dáme si pauzu?', 'Chyby sú v poriadku, z nich sa učíme.', 'Som na teba hrdý!', 'Poďme sa naučiť niečo nové!', 'Pamätáš si, čo sme sa učili včera?'];
const bearEve = () => { const h = new Date().getHours(); return h >= 19 || h < 7; };
const season = () => { const m = new Date().getMonth(); return m === 11 || m < 2 ? 'winter' : m < 5 ? 'spring' : m < 8 ? 'summer' : 'autumn'; };
/* kométa pri sérii správnych odpovedí */
const KEY_MAX = 3; const learnedToday = p => { const d = p.days[today()]; return !!(d && ((d.n || 0) > 0 || (d.q || 0) > 0)); };
const SHOP_LOCK_MSG = 'Najprv sa dnes nauč aspoň jednu vec 📚 Potom môžeš nakupovať.';
function giveKey(p) { if ((p.keys || 0) >= KEY_MAX) return false; p.keys = (p.keys || 0) + 1; return true; }
function mysteryRoll(p) {
  const ex = ['top', 'bottom', 'shoes', 'acc'].flatMap(c => CATALOG[c].filter(it => it.chest && (!it.g || it.g === p.av.gender)).map(it => [c, it]));
  const pool = [...shopItems(p), ...ex].filter(([, it]) => !(p.owned || []).includes(it.sid)); if (!pool.length) return null;
  const r = Math.random() * 100; const order = ['common', 'rare', 'epic', 'leg']; const want = r < 1 ? 'leg' : r < 3 ? 'epic' : r < 10 ? 'rare' : 'common';
  const i = order.indexOf(want); const tryOrder = [want, ...order.slice(0, i).reverse(), ...order.slice(i + 1)];
  for (const t of tryOrder) { const list = pool.filter(([, it]) => rarity(it) === t); if (list.length) { const x = list[Math.floor(Math.random() * list.length)]; return [x[0], x[1], t]; } }
  return null;
}
/* záhadná truhla: napätie (3 ťuknutia), výbuch vo farbe rarity, odhalenie veci */
function openMystery(c, it, rk) {
  const R = RARE[rk], p = P(); const o = document.createElement('div'); o.className = 'over myov r-' + rk; o.style.setProperty('--rc', R.c);
  o.innerHTML = `<div class="mybig"><p class="chtip">Ťukni na truhlu! 👆</p><button class="chest mych shake" aria-label="Otvoriť"><i class="crays"></i><i class="cbody"></i><i class="clid"></i><b class="myq">?</b></button>
  <div class="myres" hidden><div class="myrar">${rk === 'leg' ? '🌟 ' : ''}${R.n.toUpperCase()}${rk === 'leg' ? ' 🌟' : ''}</div><div class="mycard"><span class="th">${itemThumb(c, it, p.av)}</span><b>${esc(it.n)}</b><small>${it.chest ? 'Exkluzívne, len zo záhadnej truhly' : CAT_LABEL[c]}</small></div><div class="myfig"></div><div class="rowbtns"><button class="btn primary" data-a="myst-wear" data-c="${c}" data-i="${it.id}">😎 Obliecť hneď</button><button class="btn" data-a="ov-close">Neskôr</button></div></div></div>`;
  document.body.appendChild(o); sfx('pop');
  const ch = o.querySelector('.mych'), tip = o.querySelector('.chtip'); let started = false, auto;
  const lvl = { common: 0, rare: 1, epic: 2, leg: 3 }[rk];
  const start = () => { if (started) return; started = true; clearTimeout(auto); ch.classList.add('open'); sfx('gift'); buzz(30); const fl = document.createElement('div'); fl.className = 'myflash'; o.appendChild(fl); setTimeout(() => fl.remove(), 900); setTimeout(() => { ch.classList.add('gone'); tip.textContent = 'Točí sa…'; spinReel(o, c, it, rk, () => reveal()); }, 600); };
  const reveal = () => { tip.textContent = lvl >= 2 ? 'NIEČO ÚŽASNÉ!!! 🤯' : 'Wow! 🤩'; const fl = document.createElement('div'); fl.className = 'myflash'; o.appendChild(fl); setTimeout(() => fl.remove(), 900);
    if (lvl >= 2) { const root = document.documentElement; root.classList.remove('fxshake'); void root.offsetWidth; root.classList.add('fxshake'); setTimeout(() => root.classList.remove('fxshake'), 700); buzz([60, 40, 120]); }
    setTimeout(() => { try { confetti(60 + lvl * 60, .35); } catch (e) { } const rl = o.querySelector('.reel'); if (rl) rl.remove(); tip.hidden = true; o.querySelector('.myres').hidden = false; sfx(lvl >= 2 ? 'level' : 'coin'); if (rk === 'leg') { o.querySelector('.mybig').insertAdjacentHTML('beforeend', `<span class="myrain">${'✦★✦★✦★✦★✦★✦★'.match(/./gu).map((e, i) => `<i style="left:${i * 8 + 3}%;animation-delay:${(i % 6) * .25}s">${e}</i>`).join('')}</span>`); } }, 1100); };
  ch.addEventListener('click', start); auto = setTimeout(start, 1600);
}
/* ruleta: pás vecí sa roztočí a zastaví pod šípkou na výhre */
function spinReel(o, c, it, rk, done) {
  const p = P(); const ex = ['top', 'bottom', 'shoes', 'acc'].flatMap(k => CATALOG[k].filter(x => x.chest && (!x.g || x.g === p.av.gender)).map(x => [k, x]));
  const pool = [...shopItems(p), ...ex]; const by = t => pool.filter(([, x]) => rarity(x) === t);
  const pickT = () => { const r = Math.random() * 100; return r < 4 ? 'leg' : r < 12 ? 'epic' : r < 32 ? 'rare' : 'common'; };
  const N = 42, WIN = 36; const tiles = Array.from({ length: N }, (_, i) => { if (i === WIN) return [c, it, rk]; let t = pickT(), l = by(t); if (!l.length) { t = 'common'; l = by(t); } const x = l[Math.floor(Math.random() * l.length)]; return [x[0], x[1], t]; });
  const R = document.createElement('div'); R.className = 'reel'; R.innerHTML = `<i class="reelptr"></i><i class="reelptr b"></i><div class="reelstrip">${tiles.map(([k, x, t]) => `<div class="rt" style="--rc:${RARE[t].c}"><span class="th">${itemThumb(k, x, p.av)}</span><small>${esc(x.n)}</small></div>`).join('')}</div>`;
  o.querySelector('.mych').after(R); const strip = R.querySelector('.reelstrip');
  const TW = 98; const W = R.clientWidth; const target = -(WIN * TW + TW / 2 - W / 2) + (Math.random() * 50 - 25);
  let lastIdx = -1, raf; const tick = () => { const m = new DOMMatrix(getComputedStyle(strip).transform); const idx = Math.floor((-m.m41 + W / 2) / TW); if (idx !== lastIdx) { lastIdx = idx; sfx('tap'); buzz(6); } raf = requestAnimationFrame(tick); };
  requestAnimationFrame(() => { strip.style.transform = `translateX(${target}px)`; raf = requestAnimationFrame(tick); });
  strip.addEventListener('transitionend', () => { cancelAnimationFrame(raf); const win = strip.children[WIN]; win.classList.add('win'); R.classList.add('done'); setTimeout(done, 700); }, { once: true });
}
/* skutočné otočenie postavičky: prikrčí sa, vyskočí, otočí sa (vidno chrbát), dopadne */
function celebrateWear(box, av) {
  if (!box) return; const old = box.innerHTML;
  box.innerHTML = `<div class="cw"><i class="cwbeam"></i><i class="cwshadow"></i><div class="cwturn"><div class="cwf">${avatarSvg(av, { noBg: true })}</div><div class="cwb">${avatarSvg(av, { noBg: true, back: true })}</div></div><i class="cwdust d1"></i><i class="cwdust d2"></i><span class="cwring">${'✨⭐💫✨⭐💫✨⭐'.match(/./gu).map((e, i) => `<i style="--a:${i * 45}deg">${e}</i>`).join('')}</span><i class="cwflash"></i><b class="cwnew">NOVÉ!</b></div>`;
  sfx('pop'); setTimeout(() => sfx('whoosh'), 300); setTimeout(() => { sfx('coin'); buzz([40, 30, 60]); const root = document.documentElement; root.classList.remove('fxshake'); void root.offsetWidth; root.classList.add('fxshake'); setTimeout(() => root.classList.remove('fxshake'), 650); }, 1150);
  setTimeout(() => { if (box.isConnected) box.innerHTML = old; }, 2600);
}
function openChest(n) {
  const o = document.createElement('div'); o.className = 'over chestov'; o.innerHTML = `<div class="chestbox"><p class="chtip">Ťukni na truhlicu!</p><button class="chest shake" aria-label="Otvoriť truhlicu"><i class="crays"></i><i class="cbody"></i><i class="clid"></i><span class="ccoins">${COIN.repeat(6)}</span></button><b class="cplus">+${n} bodov a slniečka${(P().keys || 0) > 0 ? ' · 🔑 kľúč od truhly' : ''}</b><button class="btn primary block chok" data-a="ov-close" hidden>Paráda!</button></div>`;
  document.body.appendChild(o); sfx('pop');
  const ch = o.querySelector('.chest'); let done = false;
  const open = () => { if (done) return; done = true; ch.classList.remove('shake'); ch.classList.add('open'); o.querySelector('.chtip').textContent = 'Wow! 🤩'; sfx('gift'); buzz([30, 40, 60]); setTimeout(() => { confetti(160, .35); grant(n, ch); o.querySelector('.chok').hidden = false; }, 450); setTimeout(() => render(null), 600); };
  ch.addEventListener('click', open); setTimeout(open, 2600);
}
function okWave(el) { if (!el) return; const r = el.getBoundingClientRect(); const w = document.createElement('i'); w.className = 'okwave'; w.style.cssText = `left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px`; document.body.appendChild(w); setTimeout(() => w.remove(), 700); }
function fxFire(n) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { toast(`🔥 Séria ${n} dní po sebe!`); return; }
  const L = document.createElement('div'); L.className = 'fxfire'; L.setAttribute('aria-hidden', 'true');
  L.innerHTML = `<div class="ffl">${Array.from({ length: 14 }, (_, i) => `<i style="left:${i * 7.4}%;--h:${60 + (i * 37) % 50}px;animation-delay:${(i % 5) * .07}s"></i>`).join('')}</div><div class="ffnum"><b>${n}</b><span>${plural(n, 'deň', 'dni', 'dní')} po sebe! 🔥</span></div>`;
  document.body.appendChild(L); buzz([30, 30, 60]); setTimeout(() => L.remove(), 2400);
}
function fxComet(n) {
  const big = n >= 10, root = document.documentElement; const L = document.createElement('div'); L.className = 'fxlayer' + (big ? ' big' : ''); L.setAttribute('aria-hidden', 'true');
  const sparks = Array.from({ length: 16 }, (_, i) => `<b style="--d:${(i * 0.045).toFixed(2)}s;--o:${(i % 4) * 9 - 14}px">${i % 3 ? '✦' : '★'}</b>`).join('');
  L.innerHTML = `<div class="fxflash"></div><div class="fxcomet"><i></i><span class="fxtrail">${sparks}</span></div><div class="fxwave"></div><div class="fxwave w2"></div><div class="fxstreak">${n} v rade! ${big ? '🌈' : '🔥'}</div>`;
  document.body.appendChild(L); sfx('level'); setTimeout(() => sfx('coin'), 380);
  setTimeout(() => { root.classList.remove('fxshake'); void root.offsetWidth; root.classList.add('fxshake'); buzz(big ? [60, 40, 90, 40, 60] : [50, 30, 70]); }, 430);
  setTimeout(() => root.classList.remove('fxshake'), 1100); setTimeout(() => L.remove(), 2000);
  const pk = $('.peekbear svg'); if (pk) { pk.classList.add('cheer'); setTimeout(() => pk.classList.remove('cheer'), 1800); } try { setTimeout(() => confetti(big ? 140 : 70, .3), 450); } catch (e) { }
}
const BEAR_PET = ['Hihi, to šteklí! 🤭', 'Mám ťa rád! 💛', 'Si môj najlepší kamarát!', 'Ešte, ešte! 😊', 'Mňau… teda, chcel som povedať mrmr 🐻'];
function bearStats(b) { const now = Date.now(), cl = v => Math.max(0, Math.min(100, Math.round(v))); return { food: cl(100 - (now - (b.fed || 0)) / (20 * HRS) * 100), energy: b.asleep ? 100 : cl(100 - (now - (b.slept || 0)) / (26 * HRS) * 100), joy: cl(100 - (now - (b.care || 0)) / (48 * HRS) * 100) }; }
const bearLove = b => { const l = b.love || 0; return { lv: 1 + Math.floor(l / 10), pr: l % 10 }; };
function bearCorner(p) {
  const b = bearInit(p); const m = bearMood(p); const h = b.honey || 0; const st = bearStats(b); const lo = bearLove(b);
  const bar = (i, n, v, c) => `<div class="brst"><span>${i}</span><div><small>${n}</small><div class="brbar"><i style="width:${v}%;background:${c}"></i></div></div></div>`;
  return `<section class="card bearroom bm-${m}" id="bearcorner"><div class="brhead"><b>🧸 Bystríkov kútik</b><span class="brlove" title="Priateľstvo">💖 Lv ${lo.lv}<i><b style="width:${lo.pr * 10}%"></b></i></span></div>
  <div class="brscene ${b.asleep ? 'night' : bearEve() ? 'dusk' : ''} ssn-${season()}" id="brscene"><i class="brwin"><b class="brskyd"></b><b class="brskyn"></b><b class="brsun"></b><b class="brmoon"></b><b class="brwstars"></b><b class="brfall">${'<s></s>'.repeat(7)}</b></i>${['spring', 'summer'].includes(season()) ? '<span class="brfly2">🦋</span>' : ''}<i class="brshelf"><span>📚</span><span>🪴</span><span>🏆</span></i><i class="brfloor"></i><i class="brdusk"></i><i class="brdark"></i><i class="brstars"></i><i class="brplinth"></i><i class="brbed"></i>
  <button class="bcfig press" data-a="bear-tap" aria-label="Ťukni na Bystríka">${bearSvg(!b.asleep && (m === 'sick' || m === 'tired') ? 'comfort' : '')}</button><span class="bzz" aria-hidden="true">💤</span>${m === 'sick' ? '<span class="bzz sick" aria-hidden="true">🤧</span>' : ''}
  <div class="brbub" id="brbub">${m === 'happy' && bearEve() ? 'Je večer 🌅 Keď skončíš s učením, ulož ma spať.' : BEAR_TXT[m]}</div><span class="brhoney">🍯 ${h}</span></div>
  <div class="brstats">${bar('🍯', 'Hlad', st.food, 'linear-gradient(90deg,#FFB13C,#FFD45C)')}${bar('⚡', 'Energia', st.energy, 'linear-gradient(90deg,#4C86F7,#7EC8FF)')}${bar('😊', 'Radosť', st.joy, 'linear-gradient(90deg,#F25C8B,#FF9FBF)')}</div>
  <div class="bract"><button class="brb press" data-a="bear-feed" ${h ? '' : 'aria-disabled="true"'}><span>🍯</span>Nakŕmiť</button><button class="brb press" data-a="bear-pet"><span>🤗</span>Pohladkať</button><button class="brb press" data-a="bear-dance"><span>💃</span>Tanec</button><button class="brb press" data-a="bear-sleep"><span>${b.asleep ? '☀️' : '🌙'}</span>${b.asleep ? 'Zobudiť' : 'Spať'}</button><button class="brb press" data-a="bear-rec" aria-label="Podrž a povedz niečo, Bystrík to zopakuje"><span>🎤</span>Zopakuj</button></div>
  <small class="bchint">🍯 Med dostaneš za každé dokončené učenie alebo hru. Za starostlivosť rastie priateľstvo 💖.</small></section>`;
}
let BEARIV = null; const BEAR_IDLE = ['bhappy', 'bwiggle', 'bpeek', 'bhop'];
function bearIdleStart() { clearInterval(BEARIV); BEARIV = setInterval(() => { const fig = $('.bearroom .bcfig svg'), room = $('#bearcorner'); if (!fig || !room) { clearInterval(BEARIV); return; } if (document.hidden || room.classList.contains('busy') || $('#brscene.night') || fig.classList.contains('bdance')) return; const c = pick(BEAR_IDLE); fig.classList.add(c); setTimeout(() => fig.classList.remove(c), 1400); }, 6500); }
function bearSay(t) { const el = $('#brbub'); if (el) { el.textContent = t; el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); } }
function bearLoveUp(p, n) { const b = bearInit(p); const before = bearLove(b).lv; b.love = (b.love || 0) + n; const after = bearLove(b).lv; bearCare(p); const el = $('.brlove'); if (el) el.innerHTML = `💖 Lv ${after}<i><b style="width:${bearLove(b).pr * 10}%"></b></i>`; if (after > before) { toast(`💖 Priateľstvo s Bystríkom: level ${after}!`); sfx('level'); try { confetti(80, .4); } catch (e) { } } }
let BREC = null;
function bearCare(p) { const b = bearInit(p); b.care = Date.now(); save(); }
function parentNeedCard() { if (DATA.parent && DATA.parent.pin) return ''; return `<button class="card pneed press" data-a="pguide"><span class="ic">👨‍👩‍👧</span><span><b>Rodičia: vytvorte si účet</b><span class="b" style="font-size:.9rem">Trvá to minútu. Ťuknite a prevediem vás.</span></span><em>!</em></button>`; }
function a2hsCard() { if ((window.claude && window.claude.use) || isStandalone() || DATA.a2hsHide) return ''; const ios = /iphone|ipad|ipod/i.test(navigator.userAgent); return `<div class="card a2card"><span class="ic">📲</span><span><b>Daj si Bystríka na plochu</b><span class="b" style="font-size:.86rem">${A2HS ? 'Bude mať vlastnú ikonku a otvorí sa na celú obrazovku.' : ios ? 'V Safari ťukni dole na Zdieľať a zvoľ „Pridať na plochu“.' : 'V ponuke prehliadača ⋮ zvoľ „Pridať na plochu“ alebo „Inštalovať aplikáciu“.'}</span>${A2HS ? '<button class="btn small primary" data-a="install" style="margin-top:6px">📲 Pridať na plochu</button>' : ''}</span><button class="tutx" data-a="a2hs-hide" aria-label="Skryť">✕</button></div>`; }
const PTOUR = [
  { h: 'Vitajte v rodičovskom účte', t: 'Krátko vám ukážem, čo tu nájdete. Sú to štyri časti v spodnej lište.', pt: 'over' },
  { h: 'Spodná lišta', t: 'Prehľad, Zadať úlohu, Čítanka a Nastavenia. Prepínate ich dole.', pt: 'over', f: '.pnav' },
  { h: 'Týždenný prehľad', t: 'Koľko dní sa dieťa učilo, úspešnosť a tip, čo skúsiť tento týždeň.', pt: 'over', f: '.weekcard' },
  { h: 'Podrobnosti', t: 'Ďalšie údaje sú zbalené. Ťuknutím na riadok ho rozbalíte.', pt: 'over', f: '.pacc' },
  { h: 'Úlohy pre dieťa', t: 'Vyberte tému a odmenu. Keď dieťa úlohu splní, slniečka dostane samo.', pt: 'tasks', f: '.ptform' },
  { h: 'Čítanie', t: 'Tu si vypočujete nahrávky z čítanky, ohodnotíte ich a dieťa odmeníte.', pt: 'read', f: '.pcard' },
  { h: 'Nastavenia', t: 'Ročník, čo je povolené, pripomienka, priatelia, účet aj PIN. Ťuknite na riadok a otvorí sa.', pt: 'set', f: '.pslist' },
  { h: 'Späť k dieťaťu', t: 'Šípkou vľavo hore účet zamknete a vrátite telefón dieťaťu.', pt: 'over', f: '.top .iconbtn' }
];
/* sprievodca „ako zapnúť chat s Bystríkom“ – neblokuje, len ukazuje, kam ťuknúť */
let CHG = null;
function chgEnd(msg) { CHG = null; document.querySelectorAll('.aigcoach,.tutfinger.aig').forEach(e => e.remove()); document.querySelectorAll('.aigfocus').forEach(e => e.classList.remove('aigfocus', 'tutfocus')); if (msg) toast(msg); }
function chgFind(sel, txt) { const els = [...document.querySelectorAll(sel)]; return txt ? els.find(e => txt.test(e.textContent)) : els[0]; }
function chgStep() {
  if (!CHG) return; document.querySelectorAll('.aigcoach,.tutfinger.aig').forEach(e => e.remove()); document.querySelectorAll('.aigfocus').forEach(e => e.classList.remove('aigfocus', 'tutfocus'));
  if (CHAT_ON()) { chgEnd(); toast('🧸 Hotovo! Bystrík je zobudený a môžeš mu písať.'); sfx('level'); if (UI.view !== 'chat' && !['parent', 'pin', 'psetup'].includes(UI.view)) go('chat'); return; }
  const v = UI.view, off = !DATA.settings.chat; let el = null, h = '', t = '';
  if (v === 'chat') { el = chgFind('[data-a="aig-start"]'); h = 'Krok 1: Rodičovský účet'; t = 'Zavolaj rodiča. Potom ťuknite hore na ozubené koliesko.'; el = chgFind('.top [data-v="settings"]') || el; }
  else if (v === 'settings') { el = chgFind('.parentcard'); h = 'Krok 2: Rodičovský účet'; t = 'Ťuknite na kartu Rodičovský účet. Rodič zadá PIN (alebo si účet vytvorí).'; }
  else if (v === 'pin' || v === 'psetup' || (v === 'parent' && !PARENT_OK)) { h = 'Rodič zadá PIN'; t = 'Toto robí rodič. Ak ešte nemáte účet, vytvorte si ho, trvá to minútku.'; }
  else if (v === 'parent') {
    if (PTAB !== 'set') { el = chgFind('.pnav [data-t="set"]'); h = 'Krok 3: Nastavenia'; t = 'Ťuknite dole na Nastavenia.'; }
    else if (PSET == null) { el = off ? chgFind('[data-a="pset"]', /Pravidlá pre dieťa/) : chgFind('[data-a="pset"]', /Účet a AI/); h = off ? 'Krok 4: Pravidlá' : 'Krok 4: Účet a AI'; t = off ? 'Najprv zapnite chat. Ťuknite na Pravidlá pre dieťa.' : 'Ťuknite na Účet a AI.'; }
    else if (off) { el = chgFind('[data-a="toggle"][data-k="chat"]'); if (el) { h = 'Krok 5: Zapnúť chat'; t = 'Ťuknite na prepínač Chat s Bystríkom.'; } else { el = chgFind('[data-a="pset"][data-i="-1"]'); h = 'Späť'; t = 'Vráťte sa do Nastavení.'; } }
    else { el = chgFind('.aiguidebtn'); if (el) { h = 'Posledný krok'; t = 'Ťuknite na Zapnúť AI s návodom. Prevedie vás krok za krokom, je to zadarmo.'; } else { el = chgFind('[data-a="pset"][data-i="-1"]'); h = 'Späť'; t = 'Vráťte sa do Nastavení a otvorte Účet a AI.'; } }
  } else if (v === 'aiguide' || document.querySelector('.aiwiz')) { chgEnd(); return; }
  else { el = chgFind('.top [data-v="settings"]'); h = 'Rodičovský účet'; t = 'Ťuknite hore na ozubené koliesko.'; }
  const w = document.createElement('div'); w.className = 'aigcoach'; w.innerHTML = `<span class="tutbear">${owlSvg('')}</span><div class="tuttxt"><b>${h}</b><p>${t}</p></div><button class="tutx" data-a="aig-x" aria-label="Zavrieť">✕</button>`; document.body.appendChild(w);
  if (el) {
    const fixed = el.closest('.nav') || el.closest('.top'); el.classList.add('aigfocus', 'tutfocus'); if (!fixed) el.scrollIntoView({ block: 'center' });
    const fg = document.createElement('span'); fg.className = 'tutfinger aig'; fg.textContent = '👆'; document.body.appendChild(fg);
    const pos = () => { const r = el.getBoundingClientRect(); fg.style.left = (r.left + r.width / 2) + 'px'; fg.style.top = (r.top + r.height * .6) + 'px'; w.classList.toggle('attop', r.top > innerHeight / 2); }; pos(); setTimeout(pos, 120);
  }
  say(h + '. ' + t);
}
let GUIDE = null;
function showGuide(steps, i, end) {
  const st = steps[i];
  if (st.v && UI.view !== st.v) { GUIDE = { steps, end, cur: st.t, nav: true }; go(st.v, {}, 'f'); return setTimeout(() => showGuide(steps, i, end), 380); }
  if (st.pt && UI.view === 'parent' && PTAB !== st.pt) { PTAB = st.pt; render(null); scrollTo(0, 0); }
  clearTut(); GUIDE = { steps, end, cur: (st.h ? st.h + '. ' : '') + st.t, i };
  const el = st.f ? $(st.f) : null; const fixed = el && (el.closest('.nav') || el.closest('.top'));
  if (el) { el.classList.add('tutfocus'); if (!fixed) el.scrollIntoView({ behavior: 'auto', block: 'center' }); }
  const tap = st.tap && el; const w = document.createElement('div'); w.className = 'tutsheet coach'; const last = i + 1 >= steps.length;
  w.innerHTML = `<div class="in"><div class="tuthead"><span class="tutstep">${i + 1} / ${steps.length}</span><div class="tutbar"><i style="width:${(i + 1) / steps.length * 100}%"></i></div><button class="tutx" data-a="tut-skip" aria-label="Preskočiť návod">Preskočiť ✕</button></div><div class="tutrow">${st.e && !st.h ? `<span class="tutemoji">${st.e}</span>` : `<span class="tutbear">${owlSvg('')}</span>`}<div class="tuttxt">${st.h ? `<b>${st.h}</b>` : ''}<p>${st.t}</p></div><button class="iconbtn press tutsay" data-a="tut-say" aria-label="Prečítaj znova">🔊</button></div><div class="rowbtns" style="grid-template-columns:${i ? '1fr 2fr' : '1fr'}">${i ? `<button class="btn" data-a="tut-next" data-i="${i - 1}">← Späť</button>` : ''}${tap ? '<div class="tuttap">👆 Ťukni na žiariace miesto</div>' : `<button class="btn primary" data-a="tut-next" data-i="${i + 1}">${last ? (st.go || 'Rozumiem! 👍') : 'Ďalej →'}</button>`}</div></div>`;
  document.body.appendChild(w);
  const place = () => { if (!el) { w.classList.add('mid'); return; } const r = el.getBoundingClientRect(); const h = w.offsetHeight; const below = innerHeight - r.bottom, above = r.top; w.classList.remove('mid'); if (below >= h + 24 || below >= above) { w.style.top = Math.min(innerHeight - h - 10, r.bottom + 18) + 'px'; w.style.bottom = 'auto'; w.classList.add('pup'); } else { w.style.top = Math.max(10, r.top - h - 18) + 'px'; w.style.bottom = 'auto'; w.classList.add('pdown'); } const ar = w.querySelector('.tutarrow') || w.appendChild(Object.assign(document.createElement('i'), { className: 'tutarrow' })); const wr = w.getBoundingClientRect(); ar.style.left = Math.max(26, Math.min(wr.width - 26, r.left + r.width / 2 - wr.left)) + 'px'; };
  place(); setTimeout(place, 60); say(GUIDE.cur); sfx('pop');
  if (tap) {
    const fg = document.createElement('span'); fg.className = 'tutfinger'; fg.textContent = '👆'; document.body.appendChild(fg);
    const pos = () => { const r = el.getBoundingClientRect(); fg.style.left = (r.left + r.width / 2) + 'px'; fg.style.top = (r.top + r.height * .6) + 'px'; }; pos(); setTimeout(pos, 80);
    TUTH = e => { if (e.target.closest('.tutsheet')) return; if (el.contains(e.target)) { if (GUIDE) GUIDE.nav = true; document.removeEventListener('click', TUTH, true); TUTH = null; fg.remove(); sfx('pop'); setTimeout(() => { if (GUIDE && GUIDE.steps === steps) showGuide(steps, i + 1, end); }, 450); return; } e.preventDefault(); e.stopPropagation(); w.classList.remove('nudge'); void w.offsetWidth; w.classList.add('nudge'); };
    document.addEventListener('click', TUTH, true);
  }
}
let TUTH = null;
function endPTour() { clearTut(); DATA.parent.tour = 1; save(); PTAB = 'over'; if (UI.view === 'parent') render(null); toast('Návod nájdete znova v Nastaveniach rodičovského účtu.'); }
function endTour() { clearTut(); const p = P(); if (p) { p.tourDone = true; save(); } if (UI.view !== 'home') go('home', {}, 'b'); confetti(120, .3); if (!(DATA.parent && DATA.parent.pin) && !DATA.pguideSeen) setTimeout(() => { if (UI.view === 'home' && !GUIDE) showGuide(PGUIDE, 0, endPGuide); }, 1600); }
function clearTut() { if (TUTH) { document.removeEventListener('click', TUTH, true); TUTH = null; } document.querySelectorAll('.tutfinger').forEach(e => e.remove()); document.querySelectorAll('.tutsheet').forEach(e => e.parentNode.removeChild(e)); document.querySelectorAll('.tutfocus').forEach(e => e.classList.remove('tutfocus')); }
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
    <div class="nameplate">${esc(p.name)}<small>${title(li.L)}</small></div></section>`;
  const wk = ['Po', 'Ut', 'St', 'Št', 'Pi', 'So', 'Ne']; const now = new Date(); const dow = (now.getDay() + 6) % 7;
  const week = wk.map((n, i) => { const dd = new Date(); dd.setDate(now.getDate() - dow + i); const k = dkey(dd); const on = !!p.days[k]; return `<span><i class="${on ? 'on' : ''} ${i === dow ? 'today' : ''}" style="animation-delay:${i * 50}ms">${on ? '🔥' : ''}</i>${n}</span>`; }).join('');
  const nextStreak = streakRewards(p.av.gender).find(([, it]) => it.streak > (p.streak.best || 0));
  const streak = `<section class="card streak"><div class="row1"><span class="flame">🔥</span><div style="flex:1"><b class="n">${p.streak.count} ${plural(p.streak.count, 'deň', 'dni', 'dní')} po sebe</b><div class="muted b" style="font-size:.88rem">${p.streak.last === today() ? 'Dnes máš splnené. Príď aj zajtra!' : 'Dnes sa ešte uč, nech séria nevyhasne!'}</div></div></div><div class="week">${week}</div>${nextStreak ? `<div class="b" style="font-size:.88rem">🎁 Pri sérii ${nextStreak[1].streak} dní získaš: ${rewardName(...nextStreak)}</div>` : ''}</section>`;
  const tasks = d.tasks.map(id => { const T = TASKS.find(x => x.id === id); const c = Math.min(T.t, d.cnt[T.k] || 0); const done = c >= T.t, cl = d.claimed.includes(id); return `<div class="task ${cl ? 'done' : ''}"><span class="ck">${cl ? '✓' : T.i}</span><div class="tt">${T.n}<div class="tb"><i style="width:${c / T.t * 100}%"></i></div></div>${cl ? '<span class="xp">Hotovo</span>' : done ? `<button class="claim press" data-a="claim" data-id="${id}">+${T.xp} 🎁</button>` : `<span class="xp">${c}/${T.t}</span>`}</div>`; }).join('');
  const allCl = d.tasks.every(id => d.claimed.includes(id));
  const taskCard = `<section class="card tasks"><div class="sec"><h2>Dnešné úlohy</h2><span class="eyebrow">${d.claimed.length}/3</span></div>${tasks}${allCl && !d.bonus ? `<button class="btn sun block press" data-a="claim-bonus">Všetko splnené! Otvor truhlicu +50 🎁</button>` : allCl ? '<p class="b muted">Super! Zajtra budú nové úlohy.</p>' : '<p class="muted b" style="font-size:.85rem">Keď splníš všetky tri, dostaneš truhlicu s bonusom.</p>'}</section>`;
  const subj = k => { const ts = SUBJECTS[k].topics.filter(t => t.g === p.grade); const st = ts.reduce((s, t) => s + (p.topics[t.id]?.stars || 0), 0); const max = ts.length * 3; return `<button class="card subj ${k} press" data-a="subject" data-s="${k}"><span class="big">${k === 'mat' ? '1+2' : k === 'sjl' ? 'Aa' : '🌍'}</span><h3>${SUBJECTS[k].name}</h3><span class="muted b" style="font-size:.85rem">⭐ ${st} / ${max} hviezd</span><span class="pbar"><i style="width:${max ? st / max * 100 : 0}%"></i></span><span class="deco">${k === 'mat' ? '➗' : k === 'sjl' ? '✏️' : '🔭'}</span></button>`; };
  const dd = p.dailyDone === today();
  const quick = `<div class="quickrow"><button class="card qk press" data-a="rtab-go" data-t="streak"><span class="qi">🔥</span><b>${p.streak.count} ${plural(p.streak.count, 'deň', 'dni', 'dní')}</b><small>${p.streak.last === today() ? 'séria drží' : 'uč sa dnes'}</small></button><button class="card qk press" data-a="nav" data-v="rewards"><span class="qi">🏆</span><b>Odmeny</b><small>Level ${li.L}</small></button><button class="card qk press" data-a="nav" data-v="board"><span class="qi">🥇</span><b>Rebríček</b><small>dnešné kolo</small></button><button class="card qk press" data-a="${DATA.parent && DATA.parent.pin ? 'parent-open' : 'pguide'}"><span class="qi">👨‍👩‍👧</span><b>Rodičia</b><small>${DATA.parent && DATA.parent.pin ? 'účet s PIN' : 'vytvoriť účet'}</small></button></div><div class="card tipcard">${owlSvg('')}<p>${pick(TIPS)}</p></div>`;
  return `${topbar()}<main class="view pop-in">${stage}${goCard(p)}${quick}${parentNeedCard()}${a2hsCard()}${todayPath(p, d)}
  <div class="sec"><h2>Dnes</h2><span class="eyebrow">${p.grade}. ročník</span></div>
  ${drCard(p)}
  ${reviewCard(p)}
  <button class="card daily press ${dd ? 'done' : ''}" data-a="daily"><span class="ic">${dd ? '✅' : '🎯'}</span><span><b>${dd ? 'Denná výzva splnená!' : 'Denná výzva'}</b><span class="b" style="font-size:.9rem">${dd ? 'Môžeš si ju zahrať znova, len tak pre radosť.' : 'Opakovanie toho, čo si nedávno precvičoval(a), a ľahké otázky o svete · +50 bodov'}</span></span></button>
  ${ptaskCard(p)}${taskCard}
  <div style="display:flex;flex-direction:column;gap:8px"><div class="sec"><h2>Učenie</h2><span class="eyebrow">${p.grade}. ročník</span></div><div class="subjects">${subj('mat')}${subj('sjl')}${subj('prv')}</div><p class="muted b" style="font-size:.85rem">Prehľad: ${p.grade <= 2 ? 'prvouka, angličtina, etika a náboženstvo' : 'prírodoveda, vlastiveda, angličtina, informatika, etika a náboženstvo'}.</p></div>
  ${bearCorner(p)}
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
  } catch (e) { fail(e && e.code === 'ai_limit' ? AIL_MSG : e && e.code === 'rate_limited' ? 'Bystrík si musí chvíľu oddýchnuť. Skús to o pár minút.' : e && e.code === 'not_granted' ? 'Bystrík nemá povolenie. Popros rodičov.' : 'Poznámky sa nepodarilo spracovať. Skús to znova.'); }
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
  ${s === 'prv' ? `<div class="chips">${[['all', '✨ Všetko'], ...areasFor(g).map(k => [k, AREA_DEF[k].i + ' ' + AREA_DEF[k].n])].map(([k, n]) => `<button class="chip ${PAREA === k ? 'on' : ''}" data-a="parea" data-k="${k}">${n}</button>`).join('')}</div>` : ''}
  ${(s === 'prv' ? areasFor(g).filter(k => PAREA === 'all' || PAREA === k || !areasFor(g).includes(PAREA)).map(k => [k, ts.filter(t => areaOf(t, g) === k)]) : [[null, ts]]).filter(([, list]) => list.length).map(([k, list]) => `${k ? `<div class="areahead a-${k}"><span>${AREA_DEF[k].i}</span>${AREA_DEF[k].n}</div>` : ''}<div class="topics">${list.map((t, i) => { const st = p.topics[t.id]; const ok = modeOk(t, m); return `<button class="card topic press ${ok ? '' : 'na'}" data-a="topic" data-id="${t.id}" style="animation:popUp .4s ${i * 45}ms backwards"><span class="ti" style="background:var(--c-${s}-soft)">${t.icon}</span><span class="tn">${t.name}<small>${ok ? (st && st.total ? `${Math.round(st.correct / st.total * 100)} % správne` : 'Ešte nevyskúšané') : `${MODES[m].n} tu nie je, vyber iný spôsob`}</small></span>${starStr(st?.stars || 0)}${ok ? '<span class="go">Hrať</span>' : ''}</button>`; }).join('')}</div>`).join('')}</main>${nav('learn')}`;
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
function quizCap(ids) { let n = 0; for (const id of ids) { const t = TOPIC[id]; if (!t || t.gen) return 10; try { n += topicItems(t).length; } catch (e) { return 10; } } return Math.max(4, Math.min(10, n)); }
function startQuiz(topicIds, mode, back, opts = {}) {
  Q = { topicIds, mode, back, i: 0, total: opts.total || (mode === 'time' || opts.seq ? 10 : quizCap(topicIds)), seq: opts.seq || null, fixed: opts.fixed || null, correct: 0, combo: 0, seen: new Set(), xp: 0, cur: null, input: '', answered: false, left: 60, tlog: [] };
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
function goPlan(p) {
  const due = reviewDue(p).length; const today0 = today();
  if (due >= 3 && p.goRev !== today0) return { kind: 'rev', n: due, t: 'Najprv zopakujeme chyby', d: `${Math.min(10, due)} ${plural(Math.min(10, due), 'otázka', 'otázky', 'otázok')}, ktoré sa ti minule nepodarili`, e: '🧠' };
  const g = ALL_TOPICS.filter(t => t.g === p.grade); const st = id => p.topics[id] || {};
  const school = p.school && TOPIC[p.school] ? p.school : null;
  const pt = (p.ptasks || []).find(x => !x.done && TOPIC[x.topic]); const ptT = pt ? pt.topic : null;
  const weak = g.filter(t => st(t.id).total >= 3 && st(t.id).correct / st(t.id).total < .7).map(t => t.id);
  const recent = []; for (const l of p.log) { if (l.id && TOPIC[l.id] && TOPIC[l.id].g === p.grade && !recent.includes(l.id)) recent.push(l.id); if (recent.length >= 2) break; }
  const fresh = g.filter(t => !st(t.id).total).map(t => t.id); const newT = fresh.length ? fresh[0] : null;
  const seq = []; const add = (id, n) => { if (id) for (let i = 0; i < n; i++) seq.push(id); };
  add(school, 3); add(ptT, 2); weak.slice(0, 2).forEach(id => add(id, 2)); recent.forEach(id => add(id, 1)); add(newT, 2);
  const pool = g.map(t => t.id); while (seq.length < 10) seq.push(pick(pool)); seq.length = 10;
  const main = TOPIC[school || ptT || weak[0] || newT || seq[0]];
  const parts = [school && '📌 téma zo školy', ptT && '📋 úloha od rodiča', weak.length && '🔁 slabšie témy', newT && '✨ niečo nové'].filter(Boolean);
  return { kind: 'mix', seq: shuffle(seq), t: school ? 'Precvič, čo preberáte v škole' : 'Tvoje dnešné učenie', d: parts.length ? parts.slice(0, 3).join(' · ') : `${main.icon} ${main.name} a ďalšie`, e: main.icon };
}
function goCard(p) {
  const g = goPlan(p); const done = p.goDone === today();
  return `<button class="card gocard press" data-a="go-start"><span class="goplay">▶</span><span class="grow"><span class="eyebrow">${done ? 'Ešte jedno kolo?' : 'Asi 5 minút'}</span><b>Pokračuj</b><small>${g.t}<br>${g.d}</small></span><span class="goe">${g.e}</span></button>`;
}
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
  if (ok) { ts.correct++; p.stats.correct++; Q.correct++; Q.combo++; bump('correct'); let g = (Q.mode === 'time' ? 8 : 10) + (Q.combo >= 3 ? 2 : 0); if (q.calcUsed) g = Math.max(1, Math.round(g / 2)); Q.xp += g; sfx('ok'); buzz(15); floatXp(el, '+' + g + (q.calcUsed ? ' 🧮' : '')); burst(el); okWave(el); setMood('happy'); const pk = $('.peek'); if (pk) { pk.classList.remove('happy'); void pk.offsetWidth; pk.classList.add('happy'); if (Math.random() < .5) peekSay(pick(PRAISE)); } if (Q.combo >= 3 && Q.combo % 3 === 0) confetti(40, .55); }
  else { Q.combo = 0; sfx('no'); buzz([30, 40, 30]); setMood('sad'); }
  if (ok && Q.combo >= 5 && Q.combo % 5 === 0) fxComet(Q.combo); const cb = $('#combo'); if (cb) { cb.textContent = Q.combo >= 2 ? '🔥' + Q.combo : ''; if (ok && Q.combo >= 2) { cb.classList.remove('pop'); void cb.offsetWidth; cb.classList.add('pop'); } }
  if (q.sayAfter || q.speakLang) setTimeout(() => say(q.sayAfter || q.speak, 'en-GB'), 350);
  if (q.input) $('#padshow').classList.add(ok ? 'right' : 'wrong');
  else { const opts = $('#opts'); opts.classList.add('locked'); opts.querySelectorAll('.opt').forEach(b => { const v = q.options[+b.dataset.i]; if (v === q.answer) b.classList.add('right'); else if (b === el) b.classList.add('wrong'); else b.classList.add('dim'); }); }
  if (Q.mode === 'time') { TIMERS.push(setTimeout(() => { if (!Q || Q.left <= 0 || UI.view !== 'quiz') return; Q.i++; nextQ(); renderQ(); }, ok ? 450 : 1100)); return; }
  const fb = document.createElement('div'); fb.className = 'fb ' + (ok ? 'ok' : 'no'); fb.id = 'fb';
  if (q.ex) p.lastEx = { x: String(q.ex).slice(0, 160), t: Date.now() };
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
  else if (Q.mode === 'quiz' || Q.mode === 'daily' || Q.mode === 'test' || Q.mode === 'go') {
    stars = Q.correct >= 10 ? 3 : Q.correct >= 8 ? 2 : Q.correct >= 5 ? 1 : 0; p.stats.quizzes++; bump('quizzes'); if (stars === 3) bump('stars3');
    if (Q.correct === 10) { p.stats.perfect++; bonus += 30; }
    if (Q.mode === 'quiz' || Q.mode === 'test') { const ts = topicStat(p, Q.topicIds[0]); ts.played++; ts.best = Math.max(ts.best, Q.correct); ts.stars = Math.max(ts.stars, stars); logAct('quiz', Q.topicIds[0], Q.correct, Q.total); checkPTasks(p, Q.topicIds[0], stars); }
    else if (Q.mode === 'go') { if (p.goDone !== today()) { p.goDone = today(); bonus += 30; } logAct('go', null, Q.correct, Q.total); }
    else { if (p.dailyDone !== today()) { p.dailyDone = today(); p.stats.daily++; bonus += 50; } bump('daily'); logAct('daily', null, Q.correct, Q.total); }
  } else { p.stats.bestTime = Math.max(p.stats.bestTime, Q.correct); const ts = topicStat(p, Q.topicIds[0]); ts.time = Math.max(ts.time || 0, Q.correct); bump('time'); logAct('time', Q.topicIds[0], Q.correct, Q.i + 1); }
  gain(p, Q.xp + bonus); touchStreak(p); checkBadges(p); save(); clsPush();
  go('result', { tlog: Q.tlog, kind: Q.mode, correct: Q.correct, total: Q.mode === 'time' ? Q.i + (Q.answered ? 1 : 0) : Q.total, stars, xp: Q.xp + bonus, bonus, before, after: p.xp, retry: Q.topicIds, back: Q.back }, 'u');
}
async function explainQ() {
  const q = Q.cur; const box = $('#explain'); const btn = $('[data-a="explain"]'); if (btn) btn.remove();
  box.innerHTML = `<div class="explain">${owlSvg('')}<span id="extext"><span class="typing"><i></i><i></i><i></i></span></span></div>`;
  const sample = await getSample();
  if (!sample) { $('#extext').textContent = 'Bystrík teraz nemôže odpovedať. Chat funguje, keď je apka otvorená v Claude alebo keď rodič zadá AI kľúč v rodičovskom účte.'; return; }
  const p = P(); const prompt = `${tutorIntro(p)}\n\nDieťa práve odpovedalo nesprávne na úlohu z predmetu ${SUBJECTS[q.s].name}.\nÚloha: ${q.text}${q.speak && q.speak !== q.text ? ' (' + q.speak + ')' : ''}\nSprávna odpoveď: ${q.full || q.answer}\nDoplňujúce vysvetlenie: ${q.ex || '-'}\n\nVysvetli dieťaťu krátko (3–4 vety) a jednoducho, prečo je správna odpoveď práve táto a ako na to nabudúce príde. Povzbuď ho.`;
  try { p.stats.chat++; await sample(prompt, { cache: false, onText: ({ text }) => { const e = $('#extext'); if (e) e.textContent = text; } }); save(); }
  catch (e) { const el = $('#extext'); if (el) el.textContent = e && e.code === 'ai_limit' ? AIL_MSG : e && e.code === 'rate_limited' ? 'Bystrík si musí chvíľu oddýchnuť. Skús to o chvíľu.' : 'Teraz sa to nepodarilo. Skús to neskôr.'; }
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
  if (!r.tlog || !r.tlog.length || !['quiz', 'daily', 'go', 'test', 'review'].includes(r.kind)) return '';
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
  const good = r.kind === 'quiz' || r.kind === 'daily' || r.kind === 'go' || r.kind === 'test' || r.kind === 'review' ? r.stars >= 2 : true; const bsay = good ? pick(['Si úžasný!', 'Paráda, len tak ďalej!', 'Som na teba hrdý!', 'Výborne si to zvládol!']) : pick(['Nevadí, nabudúce to bude lepšie!', 'Skús to ešte raz, dáš to!', 'Každý sa učí, aj ja!']);
  return `<main class="view nonav" style="justify-content:center"><div class="resbear ${good ? 'cheer' : 'comfort'}">${bearSvg(good ? 'cheer' : 'comfort')}<span class="rbub">${bsay}</span></div><section class="card result">${head}<div class="xpgain">+<span id="xpc">0</span> bodov · +${Math.max(1, Math.round(r.xp / 5))} ${COIN}${r.bonus ? ` <span class="muted" style="font-size:1rem">(bonus ${r.bonus})</span>` : ''}</div><div style="width:100%"><div style="display:flex;justify-content:space-between;font-weight:800"><span>Level <span id="lvn">${b.L}</span></span><span class="muted" id="lvt">${b.cur} / ${b.need}</span></div><div class="xpbar" style="height:18px"><i id="xpb" style="width:${b.pct}%"></i></div></div><div class="rowbtns"><button class="btn primary" data-a="res-back">✓ Hotovo</button><button class="btn" data-a="res-again">🔁 Skúsiť znova</button></div></section>${evalHTML(r)}</main>`;
};
AFTER.result = () => {
  const r = UI.params; if (r.kind === 'test' && r.stars >= 2) { const p = P(); if (p.keyTest !== today()) { p.keyTest = today(); if (giveKey(p)) { save(); setTimeout(() => { toast('🔑 Za test si dostal(a) kľúč od Truhly odmien (Šatník → Obchod)!'); sfx('coin'); }, 1600); } } } const a = levelInfo(r.after), b = levelInfo(r.before);
  if (r.kind === 'quiz' || r.kind === 'daily' || r.kind === 'go' || r.kind === 'test' || r.kind === 'review') { for (let i = 0; i < r.stars; i++) setTimeout(() => sfx('star', i), 300 + i * 300); if (r.stars === 3) setTimeout(() => confetti(140), 1100); } else setTimeout(() => confetti(90), 300);
  let n = 0; const step = Math.max(1, Math.ceil(r.xp / 30)); const iv = setInterval(() => { n = Math.min(r.xp, n + step); const el = $('#xpc'); if (!el) return clearInterval(iv); el.textContent = n; if (n >= r.xp) clearInterval(iv); }, 30);
  setTimeout(() => {
    const bar = $('#xpb'); if (!bar) return;
    if (a.L > b.L) { bar.style.width = '100%'; setTimeout(() => { $('#lvn').textContent = a.L; bar.style.transition = 'none'; bar.style.width = '0%'; void bar.offsetWidth; bar.style.transition = ''; bar.style.width = a.pct + '%'; $('#lvt').textContent = `${a.cur} / ${a.need}`; queueLevelUp(b.L, a.L); PENDING.unshift(PENDING.pop()); flushPending(); }, 850); }
    else { bar.style.width = a.pct + '%'; $('#lvt').textContent = `${a.cur} / ${a.need}`; setTimeout(flushPending, 900); }
  }, 700);
};
function showRewardOverlay(x) {
  const p = P(); sfx('level'); buzz([40, 60, 40]); if (x.level) setTimeout(() => confetti(180, .3), 950); else confetti(180, .3);
  const w = document.createElement('div'); w.className = 'over';
  w.innerHTML = `<div class="card box"><span class="eyebrow">${x.level ? 'Nový level' : 'Odmena'}</span>${x.level ? `<div class="lvwrap"><span class="lvstars" aria-hidden="true">${Array.from({ length: 14 }, (_, i) => { const a = i / 14 * Math.PI * 2, r = 120 + (i % 3) * 30; return `<i style="--x:${Math.round(Math.cos(a) * r)}px;--y:${Math.round(Math.sin(a) * r)}px;animation-delay:${(i % 5) * 40}ms">${i % 2 ? '⭐' : '✨'}</i>`; }).join('')}</span><div class="num lvnum">${x.num}</div></div>` : `<div class="num">${x.num}</div>`}<h2>${esc(x.title)}</h2><p class="b">${esc(x.sub)}</p>${x.rw.length ? `<button class="gift" data-a="gift" aria-label="Otvoriť darček">🎁</button><div class="rewards" hidden>${x.rw.map(([c, it], i) => `<div class="rew" style="animation-delay:${i * 120}ms"><span class="th">${itemThumb(c, it, p.av)}</span>${rewardName(c, it)}</div>`).join('')}</div><button class="btn primary block" data-a="ov-wear" hidden>Obliecť sa v šatníku</button>` : ''}<button class="btn block" data-a="ov-close">Super!</button></div>`;
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
let JUSTUNL = null;
function unlockAnim(k) {
  const card = document.querySelector(`[data-gk="${k}"]`); const g = GAMES[k]; const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (card) card.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
  sfx('coin'); setTimeout(() => sfx('level'), reduce ? 0 : 700);
  if (reduce || !card) { toast('🔓 Hra ' + g.n + ' je odomknutá!'); setTimeout(() => { JUSTUNL = null; }, 1500); return; }
  setTimeout(() => {
    const r = card.getBoundingClientRect(); const a = document.createElement('div'); a.className = 'unl'; a.setAttribute('aria-hidden', 'true');
    a.style.cssText = `left:${r.left + r.width / 2}px;top:${r.top + r.height / 2}px`;
    a.innerHTML = `<svg viewBox="0 0 120 120"><g class="ushackle"><path d="M38 56 V38 a22 22 0 0 1 44 0 V56" fill="none" stroke="#C99511" stroke-width="11" stroke-linecap="round"/></g><rect x="26" y="52" width="68" height="54" rx="12" fill="#F8BD3A" stroke="#C99511" stroke-width="4"/><circle cx="60" cy="74" r="7" fill="#7A5300"/><rect x="57" y="76" width="6" height="14" rx="3" fill="#7A5300"/><g class="ukey"><circle cx="60" cy="118" r="10" fill="none" stroke="#E8456B" stroke-width="6"/><rect x="57" y="78" width="6" height="32" rx="2" fill="#E8456B"/><rect x="63" y="84" width="8" height="5" rx="1.5" fill="#E8456B"/></g></svg>`;
    document.body.appendChild(a); try { burst(card, 30); } catch (e) { }
    setTimeout(() => { try { confetti(90, .35); } catch (e) { } toast('🔓 Hra ' + g.n + ' je odomknutá!'); }, 1050);
    setTimeout(() => { if (a.parentNode) a.parentNode.removeChild(a); JUSTUNL = null; const c2 = document.querySelector(`[data-gk="${k}"]`); if (c2) c2.classList.remove('gjust'); }, 1700);
  }, 380);
}
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
VIEWS.games = () => { const p = P(); return `${topbar()}<main class="view"><h1 style="font-size:2rem">Minihry</h1><p class="muted b">Krátke hry na 45 sekúnd podľa tvojho ročníka. Za každú hru dostaneš body na level.</p>${DATA.settings.gameLimit ? `<section class="card gleft ${gamesLeft(p) ? '' : 'none'}"><span style="font-size:1.8rem">${gamesLeft(p) ? '🎟️' : '🌙'}</span><div><b>${gamesLeft(p) ? `Dnes môžeš hrať ešte ${gamesLeft(p)}×` : 'Na dnes už žiadne hry'}</b><span class="muted b" style="display:block;font-size:.85rem">${gamesLeft(p) ? `Denne môžeš hrať ${DATA.settings.gameLimit}× spolu. Potom sa uč 📚` : 'Zajtra sa hry znova odomknú. Zatiaľ sa môžeš učiť.'}</span></div></section>` : ''}${RT_ON() ? `<div class="tiles2"><button class="card tile2 press duelt" data-a="nav" data-v="duel"><span class="i">⚔️</span><b>Súboj s kamarátom</b><span>Kto vie viac? Hrajte naraz na dvoch zariadeniach</span></button><button class="card tile2 press boardt" data-a="nav" data-v="board"><span class="i">🏆</span><b>Rebríček</b><span>Kto získal tento týždeň najviac bodov</span></button></div>` : ''}<div class="gamelist pop-in">${Object.entries(GAMES).map(([k, g]) => `<button class="card gcard press ${gamesLeft(p) ? '' : 'glock'} ${gameLocked(p, k) ? 'gbuy' : ''} ${JUSTUNL === k ? 'gjust' : ''}" data-a="game" data-g="${k}" data-gk="${k}" aria-label="${esc(g.n)}${gameLocked(p, k) ? ', zamknuté, odomknutie za ' + g.cost + ' slniečok' : ''}"><span class="gi" style="background:${g.bg}">${g.i}${gameLocked(p, k) ? '<span class="glk" aria-hidden="true">🔒</span>' : ''}</span><span><b>${g.n}</b><span>${g.d}</span>${gameLocked(p, k) ? `<span class="gprice">🔑 Odomkni za ${COIN} ${g.cost}${(p.coins || 0) >= g.cost ? '' : ` · chýba ${g.cost - (p.coins || 0)}`}</span>` : `<span style="color:var(--accent)">🏆 Najlepšie: ${p.best[k] || 0}</span>`}</span></button>`).join('')}</div></main>${nav('games')}`; };
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
const WCATS = ['hair', 'top', 'bottom', 'shoes', 'acc', 'room', 'eyes', 'mouth', 'skin'];
CAT_LABEL.room = 'Pozadie';
VIEWS.wardrobe = () => {
  const p = P(); p.seenRewards = levelInfo(p.xp).L; save();
  return `${topbar()}<main class="view">${wsTabs('w')}<section class="card wardstage"><div class="fig" id="wfig" data-a="wave">${roomHTML(p.room)}${avatarSvg(p.av, { cls: 'idle', noBg: true })}</div><div class="info"><span class="eyebrow">Môj šatník</span><h2>${esc(p.name)}</h2><div class="seg" role="radiogroup" aria-label="Postava"><button class="${p.av.gender === 'd' ? 'on' : ''}" data-a="gender" data-g="d">Dievča</button><button class="${p.av.gender === 'c' ? 'on' : ''}" data-a="gender" data-g="c">Chlapec</button></div><span class="muted b" style="font-size:.82rem">Vyber kúsok a pod ním mu nastav farby. Veci so zámkom odomkneš za level alebo sériu.</span></div></section>
  <div class="cats">${WCATS.map(c => { const l = c === 'room' ? null : CATALOG[c].filter(it => !it.g || it.g === p.av.gender); const u = l ? l.filter(it => unlocked(it, p)).length : 0; return `<button class="chip ${c === WCAT ? 'on' : ''}" data-a="wcat" data-c="${c}">${CAT_LABEL[c] || 'Pozadie'}${l && l.length > 6 ? `<em class="ccount">${u}/${l.length}</em>` : ''}</button>`; }).join('')}</div><div id="witems">${wardItems()}</div></main>${nav('wardrobe')}`;
};
function wardItems() {
  const p = P();
  if (WCAT === 'room') return `<section class="card colorbox"><div class="roomprev">${roomHTML(p.room)}<div class="dfig">${avatarSvg(p.av, { noBg: true })}</div></div><p class="muted b" style="font-size:.88rem">Pozadie si navrhneš sám: farby, vzor a nálepky ako smajlík, jednorožec, stromček či mačička.</p><button class="btn primary block" data-a="nav" data-v="room">🎨 Navrhnúť pozadie</button></section>`;
  let list = CATALOG[WCAT].filter(it => !it.g || it.g === p.av.gender);
  if (WCAT !== 'skin') list = list.map((it, i) => [it, i]).sort((a, b) => (unlocked(b[0], p) - unlocked(a[0], p)) || a[1] - b[1]).map(x => x[0]);
  const nU = list.filter(it => unlocked(it, p)).length;
  let html;
  if (WCAT === 'skin') html = `<section class="card colorbox"><b>Farba pleti</b><div class="swatches">${list.map(it => `<button class="sw press ${p.av.skin === it.id ? 'on' : ''}" style="background:${it.c}" data-a="wear" data-i="${it.id}" aria-label="Pleť"></button>`).join('')}</div></section>`;
  else html = (WCAT === 'pet' && itemOf('pet', p.av.pet).e ? `<section class="card colorbox"><b>Meno zvieratka</b><div style="display:flex;gap:8px"><input class="field" id="petname" maxlength="14" style="font-size:1.15rem;padding:8px 12px" value="${esc(petName(p.av))}"><button class="btn small" data-a="petname">Uložiť</button></div></section>` : '') + `${list.length > 6 ? `<p class="wsum"><b>${nU}</b> z ${list.length} máš odomknutých${nU < list.length ? ' · ďalšie získaš za level, sériu, v obchode alebo v truhle 🎁' : ' · máš všetko! 🏆'}</p>` : ''}<div class="items">${list.map((it, i) => { const u = unlocked(it, p); const rk = (it.price || it.chest) ? rarity(it) : null; return `<button class="item press ${p.av[WCAT] === it.id ? 'on' : ''} ${u ? '' : 'lock'} ${rk ? 'rk rk-' + rk : ''}" ${rk ? `style="--rc:${RARE[rk].c};animation:popin .35s ${Math.min(i, 12) * 30}ms backwards cubic-bezier(.3,1.6,.5,1)"` : `style="animation:popin .35s ${Math.min(i, 12) * 30}ms backwards cubic-bezier(.3,1.6,.5,1)"`} data-a="wear" data-i="${it.id}">${rk && rk !== 'common' ? `<span class="rkdot" title="${RARE[rk].n}">${rk === 'leg' ? '🌟' : rk === 'epic' ? '💜' : '💎'}</span>` : ''}${itemThumb(WCAT, it, p.av)}${u ? '' : `<span class="lk"><b>🔒</b>${lockLabel(it)}</span>`}<span class="lab">${it.n || ''}</span></button>`; }).join('')}</div>`;
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
  p.stats.style++; checkBadges(p); save(); sfx('pop'); buzz(10);
  const tile = $(`#witems [data-a="wear"][data-i="${id}"] svg`), fig = $('#wfig');
  if (tile && fig && !matchMedia('(prefers-reduced-motion: reduce)').matches) { const a = tile.getBoundingClientRect(), b = fig.getBoundingClientRect(); const f = tile.cloneNode(true); f.classList.add('wfly'); f.style.cssText = `left:${a.left}px;top:${a.top}px;width:${a.width}px;height:${a.height}px;--dx:${b.left + b.width / 2 - a.left - a.width / 2}px;--dy:${b.top + b.height / 2 - a.top - a.height / 2}px`; document.body.appendChild(f); setTimeout(() => { f.remove(); refreshWard(true); wardPuff(); }, 380); }
  else refreshWard(true);
}
function wardPuff() { const fig = $('#wfig'); if (!fig) return; const pf = document.createElement('span'); pf.className = 'wpuff'; pf.innerHTML = '<i></i><i></i><i></i><i></i><i></i><i></i><b></b>'; fig.appendChild(pf); setTimeout(() => pf.remove(), 800); }
function setColor(slot, id) {
  const p = P(); const pal = slot === 'hair' ? HAIRC : slot === 'bg' ? BGC : PAL; const it = pal.find(x => x.id === id);
  if (!unlocked(it, p)) { sfx('no'); toast(`🔒 Odomkneš: ${lockLabel(it)}`); return; }
  if (slot === 'bg') p.av.bg = id; else p.av.col[slot] = id; p.stats.style++; checkBadges(p); save(); sfx('pop'); refreshWard(true); wardPuff();
}

/* --- odmeny --- */
let RTAB = 'road';
VIEWS.rewards = () => {
  const p = P(); const li = levelInfo(p.xp); const L = li.L; let body;
  if (RTAB === 'road') {
    const lv = []; for (let l = 2; l <= 20; l++) { const r = rewardsAt(l, p.av.gender); if (r.length) lv.push([l, r]); }
    const meL = lv.filter(([l]) => l <= L).map(([l]) => l).pop();
    const nextL = lv.find(([l]) => l > L); const toNext = nextL ? (() => { let x = li.need - li.cur; for (let k = L + 1; k < nextL[0]; k++) x += need(k); return x; })() : 0;
    const got = lv.filter(([l]) => l <= L).length; const nextI = lv.findIndex(([l]) => l > L);
    const node = ([l, r], i) => { const st = l <= L ? 'got' : i === nextI ? 'now' : 'fut'; const pct = st === 'now' ? Math.max(4, Math.round((1 - toNext / Math.max(1, (() => { let x = 0; for (let k = (lv[i - 1] ? lv[i - 1][0] : 1) + 1; k <= l; k++) x += need(k - 1); return x; })())) * 100)) : 0; return `<li class="mile st-${st} ${i % 2 ? 'r' : 'l'}" aria-label="Level ${l}: ${st === 'got' ? 'získané' : st === 'now' ? 'ďalšia odmena' : 'neskôr'}"><span class="mdot">${st === 'got' ? '✓' : st === 'now' ? '⭐' : '🔒'}<em>${l}</em></span><div class="mcard"><span class="mlv">${st === 'got' ? 'Získané' : st === 'now' ? 'Ďalšia odmena' : 'Level ' + l}</span><div class="mitems">${r.slice(0, 3).map(([c, it]) => `<span class="mit"><span class="t">${itemThumb(c, it, p.av)}</span><small>${rewardName(c, it)}</small></span>`).join('')}${r.length > 3 ? `<span class="mmore">+${r.length - 3}</span>` : ''}</div>${st === 'now' ? `<div class="mprog"><i style="width:${Math.min(100, pct)}%"></i></div><small class="mleft">Chýba ${toNext} bodov</small>` : ''}</div></li>`; };
    body = `<section class="card roadhead"><div class="rhl"><span class="rhme">${avatarSvg(p.av, { crop: 'head' })}</span><div><b>Level ${L} · ${title(L)}</b><small>${nextL ? `Ďalšia odmena na leveli ${nextL[0]}` : 'Máš všetky odmeny za levely! 👑'}</small></div></div><div class="xpbar" style="height:14px"><i style="width:${li.pct}%"></i></div><div class="rhstats"><span><i class="lg own"></i>${got} získané</span><span><i class="lg can"></i>${nextL ? 1 : 0} ďalšia</span><span><i class="lg lock"></i>${lv.length - got - (nextL ? 1 : 0)} neskôr</span></div></section>
    <ol class="miles">${lv.map(node).join('')}</ol><p class="muted b" style="font-size:.82rem;text-align:center">Body získaš za správne odpovede, hry, úlohy a dennú odmenu.</p>`;
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
function drCard(p) {
  const ready = drReady(p); const cur = ready ? drNextDay(p) : (p.dailyReward.day || 1); const next = ready ? cur : (cur % 7) + 1; const nextVal = DR[next - 1];
  const cells = DR.map((x, i) => { const n = i + 1; const got = ready ? n < cur : n <= cur; const now = ready && n === cur; return `<div class="drd ${got ? 'got' : ''} ${now ? 'now' : ''} ${!ready && n === next ? 'next' : ''} ${n === 7 ? 'big' : ''}" aria-label="${n}. deň: ${x.xp} bodov${got ? ', vyzdvihnuté' : now ? ', dnes' : ''}"><span class="di">${got ? '✓' : x.i}</span><b>${n}.</b><small>+${x.xp}</small></div>`; }).join('');
  return `<section class="card drcard2 ${ready ? 'ready' : 'done'}" id="drcard"><div class="drh"><span class="dri">${ready ? '🎁' : '✅'}</span><div class="grow"><b>${ready ? `Denná odmena: ${cur}. deň` : 'Dnešná odmena je tvoja'}</b><small>${ready ? 'Príď každý deň v rade. Na 7. deň je veľká odmena.' : `Zajtra: ${next}. deň · +${nextVal.xp} bodov ${nextVal.i}`}</small></div></div><div class="drrow">${cells}</div>${ready ? `<button class="btn sun block" data-a="dr-claim">🎁 Vyzdvihnúť +${DR[cur - 1].xp} bodov</button>` : ''}</section>`;
}
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
  if (DATA.settings.chat && !CHAT_ON()) return `${topbar('home')}<main class="view"><section class="card duelbox">${bearSvg('')}<h2>AI Bystrík ešte spí</h2><p class="muted b">Aby vedel odpovedať na otázky, musí ho rodič raz zapnúť. Je to zadarmo a trvá to asi 2 minúty.</p><div class="gethow" style="text-align:left;width:100%;box-sizing:border-box"><b>Pre rodiča</b><p>1. Otvorte <b>Rodičovský účet</b>.<br>2. Záložka <b>Nastavenia</b> → <b>Účet a AI</b>.<br>3. Ťuknite na <b>Zapnúť AI s návodom</b>.</p></div><button class="btn primary block" data-a="aig-start">👉 Ukáž mi, kam ťuknúť</button><p class="muted b" style="font-size:.82rem">Zavolaj mamu alebo ocka. Bystrík vám ukáže každý krok.</p></section></main>${nav('')}`;
  if (!DATA.settings.chat) return `${topbar('home')}<main class="view"><section class="card" style="padding:18px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:8px">${owlSvg()}<h2>Chat je vypnutý</h2><p class="muted b">Rodičia ho môžu zapnúť v rodičovskom účte.</p><button class="btn primary block" data-a="aig-start">👉 Ukáž mi, kam ťuknúť</button></section></main>${nav('')}`;
  return `${topbar('home')}<main class="view"><div style="display:flex;align-items:center;gap:12px"><span style="width:64px;height:64px;flex:none;display:block">${owlSvg('')}</span><div><h1 style="font-size:1.7rem">Opýtaj sa Bystríka</h1><p class="muted b" style="font-size:.9rem">Nerozumieš niečomu z matiky, slovenčiny, prírody alebo angličtiny? Napíš mi! Otázky dole sú pre ${P().grade}. ročník.</p></div></div>${aiMeter(true)}
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
  catch (e) { finish(e && e.code === 'ai_limit' ? AIL_MSG : e && e.code === 'rate_limited' ? 'Musím si chvíľu oddýchnuť. Skús to o pár minút. 🧸' : e && e.code === 'not_granted' ? 'Chat nie je povolený. Popros rodičov, nech ho povolia.' : (e && e.text) || 'Niečo sa pokazilo. Skús to znova.'); }
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
  const __html = `${topbar('home')}<main class="view setv"><h1 style="font-size:2rem">Nastavenia</h1><button class="card parentcard press ${DATA.parentSeen ? '' : 'blink'}" data-a="parent-open"><span class="pci">👨‍👩‍👧</span><span class="grow"><span class="eyebrow">Pre rodičov</span><b>Rodičovský účet${needBackup() ? ' <span class="blinkdot" title="Uložte si zálohu"></span>' : ''}</b><small>Pokrok dieťaťa, úlohy, čítanie a nastavenia. Chráni ho PIN kód.</small></span><span class="pcgo">›</span></button>${mailCard()}<h3 class="pgroup">👤 Môj profil</h3><section class="card" style="padding:6px 14px"><div class="list"><button class="row" data-a="edit-prof"><span class="grow">✏️ Úvodné nastavenie<small class="muted" style="display:block;font-weight:700;font-size:.82rem">Meno, dievča/chlapec, ročník a účes. Body a odmeny zostanú.</small></span><span>›</span></button><button class="row" data-a="nav" data-v="profiles"><span class="grow">👥 Zmeniť hráča alebo pridať nového</span><span>›</span></button><button class="row" data-a="nav" data-v="room"><span class="grow">🖼️ Pozadie za postavičkou</span><span>›</span></button></div></section><h3 class="pgroup">🔊 Zvuk a hlas</h3><section class="card" style="padding:6px 14px"><div class="list">${tg('sound', '🔊 Zvuky')}${tg('voice', '🗣️ Čítanie otázok nahlas')}${tg('lite', '🔋 Úsporný režim (menej efektov, pre slabšie telefóny)')}<div class="row" style="flex-direction:column;align-items:flex-start;gap:6px"><span>${sv === 'sk' ? '✅ Slovenský hlas je v telefóne' : sv === 'cs' ? '⚠️ Slovenský hlas chýba, číta sa českým hlasom' : '⚠️ Slovenský hlas v telefóne chýba'}</span>${sv !== 'sk' ? '<small class="muted" style="font-weight:700">Aby hlas správne čítal mäkčene a dĺžne, nainštalujte slovenský hlas. Android: Nastavenia → Prevod textu na reč → Google → Inštalovať hlasové údaje → Slovenčina. iPhone: Nastavenia → Prístupnosť → Hovorený obsah → Hlasy → Slovenčina.</small>' : ''}<button class="btn small" data-a="voice-test">🔊 Vyskúšať hlas</button></div></div></section><h3 class="pgroup">🎨 Vzhľad</h3><section class="card" style="padding:6px 14px"><div class="list"><div class="row" style="flex-direction:column;align-items:flex-start;gap:6px"><span>🌗 Vzhľad apky</span><div class="seg" style="width:100%">${[['auto', '🔄 Automaticky'], ['light', '☀️ Svetlý'], ['dark', '🌙 Tmavý']].map(([k, n]) => `<button class="${DATA.settings.theme === k ? 'on' : ''}" data-a="theme" data-t="${k}">${n}</button>`).join('')}</div></div><div class="row" style="flex-direction:column;align-items:flex-start;gap:8px"><span>🎨 Farba pozadia apky</span><div class="swatches">${PAGE_BG.map(c => `<button class="sw press ${(DATA.settings.bgc || 'auto') === c[0] ? 'on' : ''} ${c[0] === 'auto' ? 'swauto' : ''}" style="background:${c[0] === 'auto' ? 'var(--bg)' : c[2]};${c[0] === 'cierna' ? 'border-color:#888' : ''}" data-a="set-bg" data-c="${c[0]}" aria-label="${c[1]}" title="${c[1]}"></button>`).join('')}</div></div></div></section><h3 class="pgroup">🧸 Pomoc</h3><section class="card" style="padding:6px 14px"><div class="list"><button class="row" data-a="tour-again"><span class="grow">🧸 Ukáž mi znova návod</span><span>›</span></button></div></section>${installCard()}`;
  return csetView(__html) + `</main>${nav('')}`;
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
function aiLimitCard() { const L = aiLimit(); return `<section class="card pcard ailimcard"><span class="eyebrow">⏳ Denný limit AI</span><p class="muted b" style="font-size:.84rem;padding:4px 0">Koľko môže Bystrík denne „premýšľať“. Jedna otázka v chate je asi 300 až 800 tokenov, fotka poznámok asi 2 000. Limit sa obnoví o polnoci.</p>${aiMeter(false)}<div class="chips" style="padding:6px 0;flex-wrap:wrap">${AI_LIMITS.map(n => `<button class="chip ${L === n ? 'on' : ''}" data-a="ai-limit" data-n="${n}">${fmt(n)}</button>`).join('')}</div></section>`; }
function aiCard() {
  if (window.claude && window.claude.use) return aiLimitCard();
  const has = !!getApiKey();
  return `<section class="card pcard aicard"><span class="eyebrow">🧸 Bystrík (AI) na webe</span>${has ? '<p class="b" style="color:var(--good);font-size:.9rem;padding:4px 0">✅ AI kľúč je uložený. Chat, „Vysvetli mi to“ a Moje poznámky fungujú.</p>' : '<p class="b" style="font-size:.9rem;padding:4px 0">Zapnite chat s Bystríkom, vysvetľovanie chýb a čítanie poznámok z fotiek.</p>'}
  ${has ? '' : '<button class="btn primary aiguidebtn" data-a="ai-guide">▶️ Zapnúť AI s návodom</button><p class="muted b" style="font-size:.8rem;text-align:center;margin:6px 0 10px">Zadarmo · bez platobnej karty · asi 2 minúty</p>'}
  <input class="field" id="aikey" type="password" autocomplete="off" placeholder="${has ? '•••••••• (uložený)' : 'Sem vložte kľúč'}" style="font-size:1rem;padding:10px 12px;text-align:left">
  <div class="bkbtns" style="margin-top:8px"><button class="btn small" data-a="ai-paste">📋 Vložiť</button><button class="btn small primary" data-a="ai-save">💾 Uložiť</button>${has ? '<button class="btn small" data-a="ai-test">🔎 Otestovať</button><button class="btn small" data-a="ai-link">📲 Odkaz pre ďalší telefón</button><button class="btn small" data-a="ai-del">🗑️ Odstrániť</button>' : ''}</div>
  <p class="muted b" style="font-size:.78rem">Kľúč zostane len v tomto zariadení a nie je v zálohe. S bezplatným kľúčom Google má Bystrík denný limit otázok. Google môže otázky z bezplatnej verzie použiť na zlepšovanie svojej AI, preto deti nech nepíšu osobné údaje. Kto má prístup k tomuto telefónu, môže kľúč používať.</p></section>${aiLimitCard()}`;
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
const KIND = { go: 'Pokračuj (mix učenia)', 'game-order': 'Minihra Zoraď čísla', 'game-simon': 'Minihra Pamätaj si', 'game-race': 'Minihra Počtové preteky', rread: 'Odmena od rodiča za čítanie', dict: 'Diktát', 'game-word': 'Minihra Poskladaj slovo', 'game-frog': 'Minihra Žabka', review: 'Opakovanie chýb', write: 'Písanie prstom', duel: 'Súboj', test: 'Test', ptask: 'Splnená úloha od rodiča', gift: 'Odmena od rodiča', 'game-mole': 'Minihra Chyť škrečka', read: 'Čítanka – nahrávka', readq: 'Čítanka – otázky', quiz: 'Kvíz', time: 'Na čas', daily: 'Denná výzva', cards: 'Kartičky', pex: 'Pexeso', match: 'Spájačka', sort: 'Triedička', 'game-balloons': 'Minihra Balóny', 'game-rain': 'Minihra Slovný dážď', 'game-tf': 'Minihra Pravda či nie' };
function fmtTime(t) { const d = new Date(t); const k = dkey(d); const hm = `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`; return k === today() ? `dnes ${hm}` : k === daysAgo(1) ? `včera ${hm}` : `${d.getDate()}. ${d.getMonth() + 1}. ${hm}`; }
let PTAB = 'over'; let PS = null; const PACC = {};
let PLOCKT = null; const plockArm = () => { clearTimeout(PLOCKT); if (typeof PARENT_OK !== 'undefined' && PARENT_OK) PLOCKT = setTimeout(() => { if (PARENT_OK && ['parent', 'remote', 'teacher'].includes(UI.view)) { PARENT_OK = false; go(P() ? 'home' : 'profiles', {}, 'b'); toast('🔒 Rodičovský účet sa sám zamkol.'); } }, 180000); };
['pointerdown', 'keydown'].forEach(ev => document.addEventListener(ev, plockArm, true));
document.addEventListener('visibilitychange', () => { if (document.hidden && typeof PARENT_OK !== 'undefined' && PARENT_OK && ['parent', 'remote', 'teacher'].includes(UI.view)) { PARENT_OK = false; go(P() ? 'home' : 'profiles', {}, 'b'); } });
let PSET = null, CSET = null;
