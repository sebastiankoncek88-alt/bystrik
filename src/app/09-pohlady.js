/* ===== Pohľady ===== */
const VIEWS = {}, AFTER = {};
const segTabs = on => `<div class="segtabs" role="tablist"><button class="${on === 'learn' ? 'on' : ''}" role="tab" aria-selected="${on === 'learn'}" data-a="nav" data-v="learn">📚 Predmety</button><button class="${on === 'games' ? 'on' : ''}" role="tab" aria-selected="${on === 'games'}" data-a="nav" data-v="games">🎮 Hry</button></div>`;
function lastTopicRow(p) {
  const l = (p.log || []).find(x => x.id && TOPIC[x.id] && !String(x.id).startsWith('note-')); if (!l) return '';
  const tp = TOPIC[l.id], st = p.topics[l.id] || {};
  return `<div class="lcont"><span class="lqh">Pokračuj, kde si skončil${p.av.gender === 'd' ? 'a' : ''}</span><button class="lcrow press" data-a="topic" data-id="${tp.id}"><span class="lci" style="background:var(--c-${tp.s}-soft)">${tp.icon}</span><span class="grow"><b>${esc(tp.name)}</b><small>${SUBJECTS[tp.s].short || SUBJECTS[tp.s].name} · ${starStr(st.stars || 0)}</small></span><span class="lcgo" aria-label="Pokračovať">▶</span></button></div>`;
}
VIEWS.learn = () => {
  const p = P(); const dd = p.dailyDone === today();
  const card = k => { const ts = SUBJECTS[k].topics.filter(t => t.g === p.grade); const st = ts.reduce((a, t) => a + (p.topics[t.id]?.stars || 0), 0); const max = ts.length * 3; const d = { mat: ['1+2', 'Počty, násobilka, geometria, slovné úlohy', '➗'], sjl: ['Aa', 'Písmená, y/i, vybrané slová, slovné druhy', '✏️'], prv: ['🌍', p.grade <= 2 ? '🌱 Prvouka · 🇬🇧 Angličtina · 💛 Etika · ⛪ Náboženstvo' : '🔬 Prírodoveda · 🗺️ Vlastiveda · 🇬🇧 Angličtina · 💻 Informatika · 💛 Etika · ⛪ Náboženstvo', '🔭'] }[k]; const ms = ts.filter(t => (p.topics[t.id] || {}).stars >= 3).length; return `<button class="card lsubj ${k} press" data-a="subject" data-s="${k}"><span class="big">${d[0]}</span><span class="lt"><b>${SUBJECTS[k].name}</b><span class="pbar"><i style="width:${max ? st / max * 100 : 0}%"></i></span><small>${k === 'prv' ? (p.grade <= 2 ? 'Prvouka, angličtina, etika' : 'Prírodoveda, vlastiveda, angličtina') : `${ms} z ${ts.length} tém zvládnutých`}</small></span><span class="lchev" aria-hidden="true">›</span></button>`; };
  return `<main class="view pop-in notop"><div class="lhead"><h1 style="font-size:2rem">Učenie</h1><span class="lgrade">${p.grade}. ročník</span></div>${segTabs('learn')}${card('mat')}${card('sjl')}${card('prv')}<div class="helpers2"><button class="h2ai press" data-a="nav" data-v="chat"><span class="hnew">✨ NOVÉ</span><b>Bystrík AI</b><small>${CHAT_ON() ? 'Spýtaj sa na čokoľvek' : 'Zapne rodič'}</small><span class="hbear">${bearSvg('')}</span></button><button class="h2notes press" data-a="nav" data-v="notes"><span class="hpaper" aria-hidden="true"><i></i><i></i><i></i></span><span class="hcam" aria-hidden="true">📷</span><b>Moje poznámky</b><small>Odfoť zošit, Bystrík ťa vyskúša</small></button></div>${lastTopicRow(p)}${dayTopicsCard(p)}
  ${reviewCard(p)}
  <div class="lquick ltiles"><span class="lqh">Ďalšie učenie</span><div class="lqrow">${[['reads', '📖', 'Čítanka', '#E3F0FF'], ['write', '✍️', p.grade <= 1 ? 'Prvé čiary' : 'Písanie', '#FFE3EC'], ['dict', '✏️', 'Diktát', '#E5F4EC'], ['daily', dd ? '✅' : '🎯', 'Výzva', '#FFF2C7']].map(([v, i, n, bg]) => `<button class="lq press" ${v === 'daily' ? 'data-a="daily"' : `data-a="nav" data-v="${v}"`}><span style="background:${bg}">${i}</span>${n}</button>`).join('')}</div></div></main>${nav('learn')}`;
};
/* --- obchod --- */
let SHOPCAT = 'all', SHOPSEL = null;
const SHOPCATS = [['all', 'Všetko'], ['top', '👕 Vrch'], ['bottom', '👖 Spodok'], ['shoes', '👟 Topánky'], ['acc', '🎩 Doplnky']];
function shopItems(p) { const out = []; for (const c of ['top', 'bottom', 'shoes', 'acc']) for (const it of CATALOG[c]) if (it.price && (!it.g || it.g === p.av.gender)) out.push([c, it]); return out.sort((a, b) => a[1].price - b[1].price); }
const SHOP_DAYS = 1, DAYMS = 86400000;
function shopPeriod() { const d = new Date(); return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAYMS / SHOP_DAYS); }
function shopMs() { const d = new Date(); const now = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds()); return Math.max(0, (shopPeriod() + 1) * SHOP_DAYS * DAYMS - now); }
function cdHTML() { let t = Math.floor(shopMs() / 1000); const dd = Math.floor(t / 86400); t %= 86400; const hh = Math.floor(t / 3600); t %= 3600; const mm = Math.floor(t / 60), ss = t % 60; const b = (v, l) => `<span class="cdb"><b>${String(v).padStart(2, '0')}</b><small>${l}</small></span>`; return b(dd, plural(dd, 'deň', 'dni', 'dní')) + b(hh, 'hod') + b(mm, 'min') + b(ss, 'sek'); }
function shopHMS() { let s = Math.floor(shopMs() / 1000); const h = Math.floor(s / 3600); s %= 3600; const m = Math.floor(s / 60); s %= 60; return [h, m, s].map(x => String(x).padStart(2, '0')).join(':'); }
AFTER.shop = () => { TIMERS.push(setInterval(() => { const e = $('#shopcd2'); if (e) e.textContent = shopHMS(); }, 1000)); TIMERS.push(setInterval(() => { const e = $('#shopcd'); if (!e) return; if (shopMs() <= 0) return render(null); e.innerHTML = cdHTML(); const s = e.querySelector('.cdb:last-child b'); if (s) { s.classList.remove('tick'); void s.offsetWidth; s.classList.add('tick'); } }, 1000)); };
function shopLeft() { const d = new Date(); const now = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes()); const ms = (shopPeriod() + 1) * SHOP_DAYS * DAYMS - now; const h = Math.max(1, Math.ceil(ms / 3600000)); return h >= 24 ? `${Math.floor(h / 24)} ${plural(Math.floor(h / 24), 'deň', 'dni', 'dní')} a ${h % 24} h` : `${h} h`; }
function shopPremium(p) { const rnd = seeded('prem' + shopPeriod() + p.id); return shopItems(p).filter(([, it]) => it.price >= 200).sort(() => rnd() - .5).slice(0, 4); }
function shopOffer(p) {
  const rnd = seeded('shop' + shopPeriod() + p.id); const all = shopItems(p).filter(([, it]) => it.price < 200).sort(() => rnd() - .5);
  const out = []; for (const c of ['top', 'bottom', 'shoes', 'acc']) { const x = all.find(([cc]) => cc === c); if (x) out.push(x); }
  for (const x of all) { if (out.length >= 12) break; if (!out.includes(x)) out.push(x); }
  return out.sort((a, b) => a[1].price - b[1].price);
}
const wsTabs = on => `<div class="wstabs"><button class="card wst press ${on === 'w' ? 'on' : ''}" data-a="nav" data-v="wardrobe"><span class="wsi">👕</span><b>Šatník</b><small>moje veci</small></button><button class="card wst wshop press ${on === 's' ? 'on' : ''}" data-a="nav" data-v="shop"><span class="wsi">🛍️</span><b>Obchod</b><small>${COIN} ${(P().coins || 0)} · nové veci</small>${on === 's' ? '' : '<em class="wsnew">NOVÉ</em>'}</button></div>`;
function dealHero(p, x) {
  if (!x) return ''; const [c, it] = x; const own = p.owned.includes(it.sid); const av = { ...p.av, [c]: it.id };
  return `<section class="deal2"><i class="dshine" aria-hidden="true"></i><div class="dinfo"><span class="dtag">PONUKA DŇA · ešte ${shopLeft()}</span><b>${esc(it.n)}</b><span class="dprice">${own ? '✓ Už máš' : COIN + ' ' + it.price}</span><button class="dbtn press" data-a="shop-prev" data-c="${c}" data-i="${it.id}">👀 Vyskúšať</button></div><div class="dfig">${avatarSvg(av, { cls: 'idle', noBg: true, noPet: true })}</div></section>`;
}
VIEWS.shop = () => {
  const p = P(); const list = shopOffer(p); const prem = shopPremium(p); const all = [...prem, ...list];
  const sel = all.find(([, it]) => it.sid === SHOPSEL);
  const state = it => p.owned.includes(it.sid) ? 'own' : (p.coins || 0) >= it.price ? 'can' : 'lock';
  const fil = arr => SHOPCAT === 'all' ? arr : arr.filter(([c]) => c === SHOPCAT);
  const RT = { common: 'BEŽNÉ', rare: 'VZÁCNE', epic: 'EPICKÉ', leg: 'LEGENDA' };
  const card = ([c, it], i) => { const st = state(it), worn = p.av[c] === it.id, r = rarity(it); return `<button class="sh2item press st-${st} r-${r} ${SHOPSEL === it.sid ? 'sel' : ''}" data-a="shop-prev" data-c="${c}" data-i="${it.id}" style="--rc:${RARE[r].c};animation-delay:${Math.min(i, 12) * 40}ms" aria-label="${esc(it.n)}, ${st === 'own' ? 'kúpené' : it.price + ' slniečok'}"><span class="sh2tag">${RT[r]}</span>${worn ? '<span class="sh2worn" aria-hidden="true">✓</span>' : ''}<span class="sh2th">${itemThumb(c, it, p.av)}</span><b>${esc(it.n)}</b><span class="sh2price">${st === 'own' ? 'Mám ✓' : `${COIN} ${it.price}`}</span></button>`; };
  const items = [...fil(prem), ...fil(list)];
  const keys = p.keys || 0;
  const sheet = sel ? (() => { const [c, it] = sel; const st = state(it), worn = p.av[c] === it.id, r = rarity(it); const av = { ...p.av, [c]: it.id }; if (c === 'bottom' && ['saty', 'princezna', 'astronaut'].includes(av.top)) av.top = 'tricko';
    return `<div class="sh2scrim" data-a="shop-prev-x"></div><section class="sh2sheet" id="shopprev" role="dialog" aria-label="Skúšobná kabínka"><div class="grab"></div><div class="sh2stage" style="--rc:${RARE[r].c}"><i class="sh2rays" aria-hidden="true"></i><div class="spfig">${avatarSvg(av, { cls: 'idle', noBg: true, mood: 'happy' })}</div><span class="sh2rar">${RARE[r].n}</span></div><b class="sh2name">${esc(it.n)}</b><p class="sh2say">${st === 'own' ? (worn ? 'Máš to na sebe. Pristane ti! 😎' : 'Túto vec už máš. Obleč si ju!') : st === 'can' ? 'Takto by si vyzeral' + (p.av.gender === 'd' ? 'a' : '') + '. Páči sa ti?' : `Chýba ti ešte ${COIN} ${it.price - (p.coins || 0)}. Uč sa a zbieraj!`}</p><div class="sh2btns">${st === 'own' ? (worn ? '<span class="tag">Oblečené ✓</span>' : `<button class="btn primary block" data-a="shop-wear" data-c="${c}" data-i="${it.id}">👕 Obliecť</button>`) : st === 'can' ? `<button class="btn primary block" data-a="buy" data-c="${c}" data-i="${it.id}">Kúpiť za ${COIN} ${it.price}</button>` : `<button class="btn block" data-a="go-start">▶ Ísť zbierať slniečka</button>`}<button class="btn block" data-a="shop-prev-x">Zavrieť</button></div></section>`; })() : '';
  return `${topbar('back-me')}<main class="view sh2">${wsTabs('s')}
  ${dealHero(p, prem[0])}
  ${learnedToday(p) ? '' : (shopLockSay(), `<button class="sh2lock press" data-a="go-start"><span>📚</span><b>Kupovať môžeš po dnešnom učení</b><em>Učiť sa ▶</em></button>`)}
  <div class="sh2bar"><div class="sh2wallet"><span class="sh2coin">${COIN}</span><b>${p.coins || 0}</b><small>slniečok</small></div><div class="sh2timer"><small>Nová ponuka o</small><b id="shopcd2">${shopHMS()}</b></div></div>
  <div class="sh2cats">${SHOPCATS.map(([k, n]) => `<button class="${SHOPCAT === k ? 'on' : ''}" data-a="shopcat" data-c="${k}">${n}</button>`).join('')}</div>
  <div class="sh2grid">${items.length ? items.map(card).join('') : '<p class="b muted">V tejto kategórii dnes nič nie je. Pozri sa zajtra!</p>'}</div>

  <p class="sh2tip">👀 Ťukni na vec a vyskúšaš si ju v kabínke ešte pred kúpou.</p>${sheet}</main>${nav('shop')}`;
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
  const recUI = RD.blobUrl ? `<div class="dk done"><div class="dkhead"><span>🎙️</span>Tvoja nahrávka</div><div class="dkplay"><button class="dkpb press" data-a="dk-play" aria-label="Prehrať nahrávku"><svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path id="dkico" d="M7 4l13 8-13 8z" fill="currentColor"/></svg></button><div class="dkbar"><i id="dkprog"></i></div><span id="dkdur">${RD.dur ? fmtDur(RD.dur) : '0:00'}</span></div><audio id="dkaud" src="${RD.blobUrl}" preload="metadata"></audio>${RD.saved ? `<div class="dksent"><span>${RD.cloud ? '📨' : '✅'}</span><b>${RD.cloud ? 'Poslané do rodičovského účtu!' : 'Uložené pre rodiča'}</b><small>${RD.cloud ? 'Rodič si ju vypočuje aj na svojom telefóne.' : 'Rodič si ju vypočuje na tomto telefóne.'}</small></div>` : `<div class="rowbtns"><button class="btn" data-a="rec-again">🔁 Znova</button><button class="btn good" data-a="rec-save" ${RD.sending ? 'disabled' : ''}>${RD.sending ? 'Posielam…' : '📨 Poslať rodičovi'}</button></div>`}</div>`
    : RD.recording ? `<div class="dk on"><div class="dkhead"><span class="dklive"></span>Nahrávam</div><div class="dktime" id="rectime">0:00</div><canvas id="recviz" class="dkviz" aria-hidden="true"></canvas><button class="dkrec stop press" data-a="rec-stop" aria-label="Zastaviť nahrávanie"><span class="sq"></span></button><small class="dkhint">Čítaj pomaly a nahlas. Keď dočítaš, ťukni na štvorček.</small></div>`
      : RD.done ? `<div class="readdone">✅ Prečítané! Výborne.</div>`
      : MIC_BLOCKED ? `${window.claude && window.claude.use ? '' : '<button class="btn primary block recbtn" data-a="mic-retry">🎤 Skúsiť mikrofón znova</button>'}<button class="btn ${window.claude && window.claude.use ? 'primary' : ''} block" data-a="dikt-open">🎙️ Nahrať cez diktafón</button><button class="btn block" data-a="rec-pick">📂 Pridať hotovú nahrávku</button>`
      : `<div class="dk"><div class="dkhead"><span>🎙️</span>Bystríkov diktafón</div><button class="dkrec press" data-a="rec-start" aria-label="Začať nahrávať"><span class="dot"></span></button><small class="dkhint">Ťukni na červené tlačidlo a čítaj nahlas. Nahrávka pôjde rodičovi.</small></div>`;
  const qs = r.q.map((x, qi) => { const [qq, a, w] = x.split('|'); const opts = RD.opts[qi] || (RD.opts[qi] = shuffle([a, ...w.split(';')])); const ans = RD.ans[qi]; return `<div class="rq"><b>${qi + 1}. ${qq}</b><div class="opts one">${opts.map(o => `<button class="opt long ${ans !== undefined ? (o === a ? 'right' : (o === ans ? 'wrong' : 'dim')) : ''}" data-a="rd-ans" data-q="${qi}" data-o="${esc(o)}" ${ans !== undefined ? 'disabled' : ''}>${esc(o)}</button>`).join('')}</div></div>`; }).join('');
  return `<main class="view nonav"><div class="qtop"><button class="iconbtn press" data-a="rd-back" aria-label="Späť">←</button><div style="flex:1;font-family:var(--f-display);font-weight:800;font-size:1.2rem">${r.icon} ${r.title}</div><button class="iconbtn press" data-a="tut-open" aria-label="Návod">❓</button><button class="iconbtn press" data-a="rd-say" aria-label="Prečítať nahlas">🔊</button></div>
  <section class="card readtext g${r.g} ${RD.recording ? 'reading' : ''}">${RD.recording ? (() => { let k = 0; return r.text.replace(/(<[^>]+>)|([^\s<]+)/g, (m, tag, w) => tag ? tag : `<span class="rw" style="animation-delay:${(k++ * .45).toFixed(2)}s">${w}</span>`); })() : r.text}</section>
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
  { h: 'Toto si ty a ja', t: 'Keď na mňa ťukneš, vyskočím. Na seba ťukni a prezlečieš sa.', v: 'home', f: '.hero2' },
  { h: 'Dnešný batôžtek', t: 'Každý deň ti zbalím tri veci. Keď ich vybalíš, čaká ťa odmena.', v: 'home', f: '.bag2' },
  { h: 'Jedno veľké tlačidlo', t: 'Keď nevieš, čo robiť, ťukni sem. Vždy ťa pošle na to správne.', v: 'home', f: '.bigplay' },
  { h: 'Predmety', t: 'Tu sa učíš matematiku, slovenčinu a prehľad. V predmete je úľ, ktorý napĺňaš medom.', v: 'learn', f: '.lsubj' },
  { h: 'Moji pomocníci', t: 'Bystrík AI odpovie na otázku a z fotky zošita ti spravím kvíz.', v: 'learn', f: '.helpers2' },
  { h: 'Lunapark', t: 'Hore sa prepneš na Hry. Minihry na oddych a súboj s kamarátom.', v: 'games', f: '.lunahead' },
  { h: 'Slniečka', t: 'Za správne odpovede, hry aj úlohy dostaneš slniečka. Tu vidíš, koľko ich máš.', v: 'home', f: '.coinchip' },
  { h: 'Ja', t: 'Ťukni dole na Ja. Je tam tvoj pokrok, šatník a priatelia.', v: 'home', f: '.nav [data-v="me"]', tap: 1 },
  { h: 'Tvoj šatník', t: 'Tu sa prezlečieš a za slniečka si kúpiš nové veci. Ťukni na Šatník.', v: 'me', f: '.jaobl', tap: 1 },
  { h: 'Obchod', t: 'Za slniečka si kúpiš nové oblečenie. Ťukni na Obchod.', v: 'wardrobe', f: '.wshop', tap: 1 },
  { h: 'Vyskúšaj si niečo', t: 'Ťukni na túto vec a uvidíš, ako by ti pristala.', v: 'shop', f: '.sh2item', tap: 1 },
  { h: 'Skúšobná kabínka', t: 'Takto by si v nej vyzeral(a). Keď máš dosť slniečok, ťukneš na Kúpiť. Ponuka sa mení každý deň o polnoci.', v: 'shop', f: '#shopprev' },
  { h: 'Rodičovský účet', t: 'Teraz ti ukážem, kde je účet pre rodičov. Ťukni dole na Ja a potom na ozubené koliesko.', v: 'home', f: '.nav [data-v="me"]', tap: 1 },
  { h: 'Nastavenia', t: 'Ťukni na ozubené koliesko.', v: 'me', f: '.jagear', tap: 1 },
  { h: 'Toto je pre rodičov', t: 'Rodičovský účet si musia vytvoriť mama alebo ocko. Uvidia v ňom, ako sa ti darí, môžu ti zadať úlohu a nastaviť pravidlá. Ukáž im toto miesto!', v: 'settings', f: '.parentcard' },
  { h: 'Hotovo! 🚀', t: 'Poďme sa spolu učiť. Návod nájdeš kedykoľvek v nastaveniach.', v: 'home' }
];
const PGUIDE = [
  { h: 'Rodičia, toto je pre vás 👋', t: 'Vytvorte si rodičovský účet. Uvidíte v ňom, ako sa dieťaťu darí, a nastavíte pravidlá. Ukážem vám, kde je.', v: 'home' },
  { h: 'Krok 1: Nastavenia', t: 'Ťuknite hore na ozubené koliesko. Tlačidlo Ďalej vás tam vezme.', v: 'home', f: '.top [data-v="settings"]' },
  { h: 'Krok 2: Rodičovský účet', t: 'Je to táto karta úplne hore. Zadáte meno, denný cieľ a PIN, aby sa sem nedostali deti.', v: 'settings', f: '.parentcard', go: 'Vytvoriť účet →' }
];
function endPGuide() { clearTut(); DATA.pguideSeen = 1; save(); if (!DATA.parent.pin) { sfx('tap'); PSEL = DATA.current; PTAB = 'over'; go('parent', {}, 'f'); } }
function pathNodes(p, d) { return [{ e: '🎁', n: 'Odmena', done: !drReady(p) }, { e: '🎯', n: 'Výzva', done: p.dailyDone === today() }, ...d.tasks.map((id, k) => { const T = TASKS.find(x => x.id === id); return { e: T.i, n: 'Úloha ' + (k + 1), done: d.claimed.includes(id) }; }), { e: '🏆', n: 'Truhlica', done: !!d.bonus }]; }
/* ohňostroj raz za deň, keď je celá Dnešná cesta hotová (až keď nie je otvorené žiadne okno) */
function pathFireworks() { try { if (UI.view !== 'home' || document.querySelector('.over,#sheetwrap')) return; const p = P(); if (!p || p.fwDay === today()) return; if (!pathNodes(p, ensureDay(p)).every(x => x.done)) return; p.fwDay = today(); save(); setTimeout(() => { fireworks(); hint('Hurá! Dnešná cesta je celá hotová. Si šampión! 🎆'); }, 400); } catch (e) { } }
function todayPath(p, d) {
  const nodes = pathNodes(p, d);
  const cur = nodes.findIndex(x => !x.done); const all = cur < 0; const X = k => 30 + k * 56, Y = k => (k % 2 ? 50 : 80); const doneN = nodes.filter(x => x.done).length;
  const path = nodes.map((_, k) => (k ? 'L' : 'M') + X(k) + ' ' + Y(k)).join(' ');
  const bx = all ? X(nodes.length - 1) : X(cur), by = all ? Y(nodes.length - 1) : Y(cur);
  return `<section class="card pathcard"><div class="sec"><h2>🗺️ Dnešná cesta</h2><span class="eyebrow">${doneN}/${nodes.length}</span></div><div class="pathwrap"><svg viewBox="0 0 340 118" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><defs><linearGradient id="psky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--c-mat-soft)"/><stop offset="1" stop-color="var(--paper2)"/></linearGradient></defs><rect width="340" height="118" rx="16" fill="url(#psky)"/><circle cx="302" cy="24" r="13" fill="#FFD23F"/><g fill="#fff" opacity=".85"><ellipse cx="70" cy="22" rx="20" ry="7"/><ellipse cx="84" cy="17" rx="12" ry="7"/><ellipse cx="210" cy="16" rx="16" ry="6"/></g><path d="M0 92 Q60 60 120 86 T240 82 T340 76 V118 H0Z" fill="var(--c-prv-soft)"/><path d="M0 104 Q80 84 170 102 T340 96 V118 H0Z" fill="color-mix(in srgb,var(--c-prv) 35%,var(--c-prv-soft))"/><path d="${path}" fill="none" stroke="var(--paper)" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><path d="${path}" fill="none" stroke="var(--edge)" stroke-width="2.5" stroke-dasharray="2 7" stroke-linecap="round" stroke-linejoin="round" opacity=".55"/>${nodes.map((x, k) => `<g transform="translate(${X(k)} ${Y(k)})"><circle r="15" fill="${x.done ? 'var(--good)' : k === cur ? 'var(--sun)' : 'var(--paper)'}" stroke="var(--edge)" stroke-width="2.5"/>${x.done ? '<path d="M-6 0 l4 4.5 l8 -9" stroke="#fff" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' : `<text y="6" text-anchor="middle" font-size="16">${x.e}</text>`}</g>`).join('')}</svg><span class="pathbear ${all ? 'win' : ''}" style="left:${bx / 340 * 100}%;top:${by / 118 * 100}%">${bearSvg(all ? 'cheer' : '')}</span></div><p class="muted b" style="font-size:.86rem;margin:0">${all ? 'Dnes máš všetko splnené. Bystrík je na teba hrdý! 🎉' : 'Ďalšia zastávka: <b style="color:var(--ink)">' + nodes[cur].n + '</b>. Bystrík ide s tebou.'}</p></section>`;
}
