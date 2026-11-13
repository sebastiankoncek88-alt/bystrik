/* ===== Pohľady ===== */
const VIEWS = {}, AFTER = {};
VIEWS.learn = () => {
  const p = P(); const dd = p.dailyDone === today();
  const card = k => { const ts = SUBJECTS[k].topics.filter(t => t.g === p.grade); const st = ts.reduce((a, t) => a + (p.topics[t.id]?.stars || 0), 0); const max = ts.length * 3; const d = { mat: ['1+2', 'Počty, násobilka, geometria, slovné úlohy', '➗'], sjl: ['Aa', 'Písmená, y/i, vybrané slová, slovné druhy', '✏️'], prv: ['🌍', p.grade <= 2 ? '🌱 Prvouka · 🇬🇧 Angličtina · 💛 Etika · ⛪ Náboženstvo' : '🔬 Prírodoveda · 🗺️ Vlastiveda · 🇬🇧 Angličtina · 💻 Informatika · 💛 Etika · ⛪ Náboženstvo', '🔭'] }[k]; return `<button class="card lsubj ${k} press" data-a="subject" data-s="${k}"><span class="big">${d[0]}</span><span class="lt"><b>${SUBJECTS[k].name}</b><span>${d[1]}</span><span class="pbar"><i style="width:${max ? st / max * 100 : 0}%"></i></span><small>⭐ ${st} / ${max} hviezd · ${ts.length} tém</small></span><span class="deco">${d[2]}</span></button>`; };
  return `${topbar()}<main class="view pop-in"><div><h1 style="font-size:2rem">Učenie</h1><p class="muted b">Vyber si predmet. Učivo je pre ${p.grade}. ročník, iný ročník si vyberieš v predmete.</p></div>${card('mat')}${card('sjl')}${card('prv')}
  ${reviewCard(p)}
  <div class="sec"><h2>Ďalšie učenie</h2></div>
  <div class="tiles2 ltiles"><button class="card tile2 press" data-a="nav" data-v="reads"><span class="i">📖</span><b>Čítanka</b><span>Čítaj príbehy nahlas</span></button><button class="card tile2 press" data-a="nav" data-v="write"><span class="i">✍️</span><b>${p.grade <= 1 ? 'Moje prvé čiary' : 'Písanie'}</b><span>${p.grade <= 1 ? 'Obťahuj čiary, tvary a písmená' : 'Píš prstom písmená a čísla'}</span></button><button class="card tile2 press" data-a="nav" data-v="dict"><span class="i">✏️</span><b>Diktát</b><span>Počúvaj a píš bez chýb</span></button><button class="card tile2 press" data-a="daily"><span class="i">${dd ? '✅' : '🎯'}</span><b>Denná výzva</b><span>${dd ? 'Dnes splnená' : 'Mix otázok · +50 bodov'}</span></button><button class="card tile2 press" data-a="nav" data-v="notes"><span class="i">📸</span><b>Moje poznámky</b><span>Odfoť zošit, dostaneš kvíz</span></button><button class="card tile2 press aitile" data-a="nav" data-v="chat"><span class="i">🧸</span><b>AI Bystrík</b><span>${CHAT_ON() ? 'Opýtaj sa, čomu nerozumieš' : 'Treba zapnúť v rodičovskom účte'}</span></button></div>
  ${homeBoard(p)}</main>${nav('learn')}`;
};
/* --- obchod --- */
let SHOPCAT = 'all', SHOPSEL = null;
const SHOPCATS = [['all', 'Všetko'], ['top', '👕 Vrch'], ['bottom', '👖 Spodok'], ['shoes', '👟 Topánky'], ['acc', '🎩 Doplnky']];
function shopItems(p) { const out = []; for (const c of ['top', 'bottom', 'shoes', 'acc']) for (const it of CATALOG[c]) if (it.price && (!it.g || it.g === p.av.gender)) out.push([c, it]); return out.sort((a, b) => a[1].price - b[1].price); }
const SHOP_DAYS = 1, DAYMS = 86400000;
function shopPeriod() { const d = new Date(); return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAYMS / SHOP_DAYS); }
function shopMs() { const d = new Date(); const now = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds()); return Math.max(0, (shopPeriod() + 1) * SHOP_DAYS * DAYMS - now); }
function cdHTML() { let t = Math.floor(shopMs() / 1000); const dd = Math.floor(t / 86400); t %= 86400; const hh = Math.floor(t / 3600); t %= 3600; const mm = Math.floor(t / 60), ss = t % 60; const b = (v, l) => `<span class="cdb"><b>${String(v).padStart(2, '0')}</b><small>${l}</small></span>`; return b(dd, plural(dd, 'deň', 'dni', 'dní')) + b(hh, 'hod') + b(mm, 'min') + b(ss, 'sek'); }
AFTER.shop = () => { TIMERS.push(setInterval(() => { const e = $('#shopcd'); if (!e) return; if (shopMs() <= 0) return render(null); e.innerHTML = cdHTML(); const s = e.querySelector('.cdb:last-child b'); if (s) { s.classList.remove('tick'); void s.offsetWidth; s.classList.add('tick'); } }, 1000)); };
function shopLeft() { const d = new Date(); const now = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes()); const ms = (shopPeriod() + 1) * SHOP_DAYS * DAYMS - now; const h = Math.max(1, Math.ceil(ms / 3600000)); return h >= 24 ? `${Math.floor(h / 24)} ${plural(Math.floor(h / 24), 'deň', 'dni', 'dní')} a ${h % 24} h` : `${h} h`; }
function shopPremium(p) { const rnd = seeded('prem' + shopPeriod() + p.id); return shopItems(p).filter(([, it]) => it.price >= 200).sort(() => rnd() - .5).slice(0, 4); }
function shopOffer(p) {
  const rnd = seeded('shop' + shopPeriod() + p.id); const all = shopItems(p).filter(([, it]) => it.price < 200).sort(() => rnd() - .5);
  const out = []; for (const c of ['top', 'bottom', 'shoes', 'acc']) { const x = all.find(([cc]) => cc === c); if (x) out.push(x); }
  for (const x of all) { if (out.length >= 12) break; if (!out.includes(x)) out.push(x); }
  return out.sort((a, b) => a[1].price - b[1].price);
}
const wsTabs = on => `<div class="wstabs"><button class="card wst press ${on === 'w' ? 'on' : ''}" data-a="nav" data-v="wardrobe"><span class="wsi">👕</span><b>Šatník</b><small>moje veci</small></button><button class="card wst wshop press ${on === 's' ? 'on' : ''}" data-a="nav" data-v="shop"><span class="wsi">🛍️</span><b>Obchod</b><small>${COIN} ${(P().coins || 0)} · nové veci</small>${on === 's' ? '' : '<em class="wsnew">NOVÉ</em>'}</button></div>`;
VIEWS.shop = () => {
  const p = P(); const list = shopOffer(p); const prem = shopPremium(p); const all = [...prem, ...list];
  const sel = all.find(([, it]) => it.sid === SHOPSEL);
  const state = it => p.owned.includes(it.sid) ? 'own' : (p.coins || 0) >= it.price ? 'can' : 'lock';
  const itemCard = ([c, it], i) => { const st = state(it); const worn = p.av[c] === it.id; const pr = it.price >= 200; return `<div class="card shopitem st-${st} ${pr ? 'premium' : ''} ${SHOPSEL === it.sid ? 'sel' : ''}" style="animation:popUp .35s ${i * 25}ms backwards">${pr ? '<span class="prem">👑 PRÉMIUM</span>' : ''}<span class="stbadge">${st === 'own' ? '✓ Kúpené' : st === 'lock' ? '🔒' : ''}</span><button class="th thbtn" data-a="shop-prev" data-c="${c}" data-i="${it.id}" aria-label="Vyskúšať ${esc(it.n)}">${itemThumb(c, it, p.av)}</button><b>${it.n}</b>${st === 'own' ? (worn ? '<span class="tag">Oblečené ✓</span>' : `<button class="btn small good" data-a="shop-wear" data-c="${c}" data-i="${it.id}">Obliecť</button>`) : `<button class="btn small ${st === 'can' ? 'sun' : ''}" data-a="shop-prev" data-c="${c}" data-i="${it.id}">${COIN} ${it.price}</button>`}${st === 'lock' ? `<span class="muted b" style="font-size:.72rem">Chýba ${it.price - (p.coins || 0)}</span>` : ''}</div>`; };
  const prevAv = sel ? { ...p.av, [sel[0]]: sel[1].id, ...(sel[0] === 'top' && ['saty', 'princezna'].includes(sel[1].id) ? {} : {}) } : null;
  const prev = sel ? (() => { const [c, it] = sel; const st = state(it); return `<section class="card shopprev" id="shopprev"><div class="spfig">${avatarSvg(prevAv, { cls: 'idle' })}</div><div class="spinfo"><span class="eyebrow">Skúšobná kabínka</span><b>${it.n}</b><span class="muted b" style="font-size:.84rem">${st === 'own' ? (p.av[c] === it.id ? 'Máš ju na sebe. Pristane ti! 😎' : 'Túto vec už máš.') : st === 'can' ? 'Takto by si vyzeral(a). Páči sa ti?' : `Chýba ti ešte ${COIN} ${it.price - (p.coins || 0)}. Uč sa a zbieraj!`}</span><div class="bkbtns" style="margin-top:6px">${st === 'own' ? (p.av[c] === it.id ? '<span class="tag">Oblečené ✓</span>' : `<button class="btn small good" data-a="shop-wear" data-c="${c}" data-i="${it.id}">Obliecť</button>`) : st === 'can' ? `<button class="btn small primary" data-a="buy" data-c="${c}" data-i="${it.id}">Kúpiť za ${COIN} ${it.price}</button>` : ''}<button class="btn small" data-a="shop-prev-x">Zavrieť</button></div></div></section>`; })() : '';
  const fil = arr => SHOPCAT === 'all' ? arr : arr.filter(([c]) => c === SHOPCAT);
  return `${topbar()}<main class="view">${wsTabs('s')}${learnedToday(p) ? '' : `<section class="card shoplock"><span>📚</span><div><b>Nakupovať môžeš po dnešnom učení</b><small>Pozrieť si veci a vyskúšať ich v kabínke môžeš hneď. Kúpiť alebo otvoriť truhlu až keď sa dnes niečo naučíš.</small><button class="btn primary small" data-a="go-start">▶ Učiť sa teraz</button></div></section>`}<section class="card shophead"><span class="coinbig">${COIN}</span><div><span class="eyebrow">Tvoje slniečka</span><b>${p.coins || 0}</b><span class="muted b" style="font-size:.85rem;display:block">Slniečka získaš za každú správnu odpoveď, hry, úlohy a čítanie.</span></div></section>
  <section class="card mystery"><button class="mychest press ${(p.keys || 0) > 0 ? '' : 'nokey'}" data-a="mystery" aria-label="Otvoriť truhlu odmien"><i class="cbody"></i><i class="clid"></i><b>${(p.keys || 0) > 0 ? '🔑' : '?'}</b></button><div class="myinfo"><span class="eyebrow">Odmena za učenie</span><b>Truhla odmien</b><small>Otvoríš ju kľúčom 🔑. Kľúč dostaneš za splnenú dennú cestu (všetky 3 úlohy) alebo za test aspoň na 2 hviezdy. V truhle je 1 vec, ktorú ešte nemáš.</small><div class="myodds">${Object.values(RARE).map(r => `<span style="--rc:${r.c}">${r.n} ${r.p} %</span>`).join('')}</div><button class="btn sun small" data-a="mystery" ${(p.keys || 0) > 0 ? '' : 'aria-disabled="true"'}>${(p.keys || 0) > 0 ? `Otvoriť kľúčom 🔑 (máš ${p.keys})` : 'Zatiaľ nemáš kľúč 🔑'}</button></div></section>
  <section class="card shoptimer"><div class="sthead"><span class="hourglass">⏳</span><div><b>Nová ponuka o:</b><span class="muted b" style="display:block;font-size:.8rem">Ponuka sa mení raz za 24 hodín, vždy o polnoci. Dovtedy ostáva rovnaká.</span></div></div><div class="cd" id="shopcd">${cdHTML()}</div></section>
  <div class="shoplegend"><span><i class="lg can"></i>Môžeš kúpiť</span><span><i class="lg lock"></i>Zatiaľ zamknuté</span><span><i class="lg own"></i>Kúpené</span></div>
  <div class="chips">${SHOPCATS.map(([k, n]) => `<button class="chip ${SHOPCAT === k ? 'on' : ''}" data-a="shopcat" data-c="${k}">${n}</button>`).join('')}</div>
  ${prev}
  ${fil(prem).length ? `<div class="sec"><h2>👑 Prémiová ponuka</h2><span class="eyebrow">od 200</span></div><div class="shopgrid">${fil(prem).map(itemCard).join('')}</div><div class="sec"><h2>Bežná ponuka</h2></div>` : ''}
  <div class="shopgrid">${fil(list).length ? fil(list).map(itemCard).join('') : '<p class="b muted">V tejto kategórii dnes nič nie je. Pozri sa zajtra!</p>'}</div><p class="muted b" style="font-size:.8rem">Ťukni na vec a vyskúšaš si ju na postavičke ešte pred kúpou.</p></main>${nav('shop')}`;
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
  { h: 'Denná odmena', t: 'Každý deň ťa tu čaká darček. Siedmy deň v rade je najväčší.', v: 'home', f: '#drcard' },
  { h: 'Dnešné úlohy', t: 'Tri úlohy na dnes. Za splnené dostaneš body a slniečka.', v: 'home', f: '.tasks' },
  { h: 'Predmety', t: 'Tu sa učíš matematiku, slovenčinu a prehľad.', v: 'home', f: '.subjects' },
  { h: 'Ďalšie učenie', t: 'Čítanka, písanie prstom, denná výzva a tvoje poznámky.', v: 'learn', f: '.ltiles' },
  { h: 'Hry a súboj', t: 'Minihry na oddych a súboj s kamarátom.', v: 'games', f: '.gamelist' },
  { h: 'Ja', t: 'Tu je tvoj pokrok, čo už vieš, čo zopakovať a tvoji priatelia.', v: 'home', f: '.nav [data-v="me"]' },
  { h: 'Slniečka', t: 'Za každú správnu odpoveď, hru aj úlohu dostaneš slniečka. Tu vidíš, koľko ich máš.', v: 'home', f: '.coinchip' },
  { h: 'Poďme do šatníka', t: 'Ťukni dole na Šatník.', v: 'home', f: '.nav [data-v="wardrobe"]', tap: 1 },
  { h: 'Tvoj šatník', t: 'Tu sa prezlečieš do vecí, ktoré už máš, a nastavíš im farby.', v: 'wardrobe', f: '.wardstage' },
  { h: 'Obchod', t: 'Za slniečka si kúpiš nové oblečenie. Ťukni na Obchod.', v: 'wardrobe', f: '.wshop', tap: 1 },
  { h: 'Vyskúšaj si niečo', t: 'Ťukni na túto vec a uvidíš, ako by ti pristala.', v: 'shop', f: '.shopitem .thbtn', tap: 1 },
  { h: 'Skúšobná kabínka', t: 'Takto by si v nej vyzeral(a). Keď máš dosť slniečok, ťukneš na Kúpiť. Ponuka sa mení každý deň o polnoci.', v: 'shop', f: '#shopprev' },
  { h: 'Rodičovský účet', t: 'Teraz ti ukážem, kde je účet pre rodičov. Ťukni hore na ozubené koliesko.', v: 'home', f: '.top [data-v="settings"]', tap: 1 },
  { h: 'Toto je pre rodičov', t: 'Rodičovský účet si musia vytvoriť mama alebo ocko. Uvidia v ňom, ako sa ti darí, môžu ti zadať úlohu a nastaviť pravidlá. Ukáž im toto miesto!', v: 'settings', f: '.parentcard' },
  { h: 'Hotovo! 🚀', t: 'Poďme sa spolu učiť. Návod nájdeš kedykoľvek v nastaveniach.', v: 'home' }
];
const PGUIDE = [
  { h: 'Rodičia, toto je pre vás 👋', t: 'Vytvorte si rodičovský účet. Uvidíte v ňom, ako sa dieťaťu darí, a nastavíte pravidlá. Ukážem vám, kde je.', v: 'home' },
  { h: 'Krok 1: Nastavenia', t: 'Ťuknite hore na ozubené koliesko. Tlačidlo Ďalej vás tam vezme.', v: 'home', f: '.top [data-v="settings"]' },
  { h: 'Krok 2: Rodičovský účet', t: 'Je to táto karta úplne hore. Zadáte meno, denný cieľ a PIN, aby sa sem nedostali deti.', v: 'settings', f: '.parentcard', go: 'Vytvoriť účet →' }
];
function endPGuide() { clearTut(); DATA.pguideSeen = 1; save(); if (!DATA.parent.pin) { sfx('tap'); PSEL = DATA.current; PTAB = 'over'; go('parent', {}, 'f'); } }
function todayPath(p, d) {
  const nodes = [{ e: '🎁', n: 'Odmena', done: !drReady(p) }, { e: '🎯', n: 'Výzva', done: p.dailyDone === today() }, ...d.tasks.map((id, k) => { const T = TASKS.find(x => x.id === id); return { e: T.i, n: 'Úloha ' + (k + 1), done: d.claimed.includes(id) }; }), { e: '🏆', n: 'Truhlica', done: !!d.bonus }];
  const cur = nodes.findIndex(x => !x.done); const all = cur < 0; const X = k => 30 + k * 56, Y = k => (k % 2 ? 50 : 80); const doneN = nodes.filter(x => x.done).length;
  const path = nodes.map((_, k) => (k ? 'L' : 'M') + X(k) + ' ' + Y(k)).join(' ');
  const bx = all ? X(nodes.length - 1) : X(cur), by = all ? Y(nodes.length - 1) : Y(cur);
  return `<section class="card pathcard"><div class="sec"><h2>🗺️ Dnešná cesta</h2><span class="eyebrow">${doneN}/${nodes.length}</span></div><div class="pathwrap"><svg viewBox="0 0 340 118" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><defs><linearGradient id="psky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--c-mat-soft)"/><stop offset="1" stop-color="var(--paper2)"/></linearGradient></defs><rect width="340" height="118" rx="16" fill="url(#psky)"/><circle cx="302" cy="24" r="13" fill="#FFD23F"/><g fill="#fff" opacity=".85"><ellipse cx="70" cy="22" rx="20" ry="7"/><ellipse cx="84" cy="17" rx="12" ry="7"/><ellipse cx="210" cy="16" rx="16" ry="6"/></g><path d="M0 92 Q60 60 120 86 T240 82 T340 76 V118 H0Z" fill="var(--c-prv-soft)"/><path d="M0 104 Q80 84 170 102 T340 96 V118 H0Z" fill="color-mix(in srgb,var(--c-prv) 35%,var(--c-prv-soft))"/><path d="${path}" fill="none" stroke="var(--paper)" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><path d="${path}" fill="none" stroke="var(--edge)" stroke-width="2.5" stroke-dasharray="2 7" stroke-linecap="round" stroke-linejoin="round" opacity=".55"/>${nodes.map((x, k) => `<g transform="translate(${X(k)} ${Y(k)})"><circle r="15" fill="${x.done ? 'var(--good)' : k === cur ? 'var(--sun)' : 'var(--paper)'}" stroke="var(--edge)" stroke-width="2.5"/>${x.done ? '<path d="M-6 0 l4 4.5 l8 -9" stroke="#fff" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' : `<text y="6" text-anchor="middle" font-size="16">${x.e}</text>`}</g>`).join('')}</svg><span class="pathbear ${all ? 'win' : ''}" style="left:${bx / 340 * 100}%;top:${by / 118 * 100}%">${bearSvg(all ? 'cheer' : '')}</span></div><p class="muted b" style="font-size:.86rem;margin:0">${all ? 'Dnes máš všetko splnené. Bystrík je na teba hrdý! 🎉' : 'Ďalšia zastávka: <b style="color:var(--ink)">' + nodes[cur].n + '</b>. Bystrík ide s tebou.'}</p></section>`;
}
