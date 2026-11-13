/* ===== Súboj (naživo cez Supabase Realtime) a rebríček ===== */
const RT_ON = () => !!(SUPA.url && SUPA.key && !(window.claude && window.claude.use));
let WAVEN = 0, BTAP = 0; let D = null; var lbT = null; let LB = null; const LBK = 1000000;
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
const LB_PRIZE = [['sampion', 60], ['vavrin', 40], ['bronz', 25]];
let LBTAB = 'd', LBAW = false; const LB_IDLE = 5;
const lbHdr = t => ({ apikey: SUPA.key, Authorization: 'Bearer ' + t });
function lbPush() {
  if (SUPA_ON() && AUTH && DATA.settings.lb === false && !DATA.lbDel) { DATA.lbDel = 1; supaToken().then(t => fetch(SUPA.url + '/rest/v1/scores?user_id=eq.' + AUTH.uid, { method: 'DELETE', headers: lbHdr(t) })).catch(() => { DATA.lbDel = 0; }); }
  if (!(SUPA_ON() && AUTH) || DATA.settings.lb === false) return; clearTimeout(lbT);
  lbT = setTimeout(async () => { try { const w = weekId(), d = today(); const now = new Date().toISOString(); const rows = []; DATA.profiles.forEach(p => { const k = p.wk && p.wk.w === w ? p.wk : { xp: 0, n: 0 }; const dy = p.dy && p.dy.d === d ? p.dy : { xp: 0, n: 0 }; const base = { user_id: AUTH.uid, name: String(p.name).slice(0, 14), grade: p.grade, week: w, updated_at: now }; rows.push({ ...base, pid: String(p.id), xp: Math.min(2000, k.n || 0) * LBK + Math.min(LBK - 1, k.xp || 0) }); rows.push({ ...base, pid: p.id + '#s', xp: Math.min(9999, (p.streak && p.streak.count) || 0) }); rows.push({ ...base, week: d, pid: p.id + '#d', xp: Math.min(2000, dy.n || 0) * LBK + Math.min(LBK - 1, dy.xp || 0) }); }); if (!rows.length) return; const t = await supaToken(); await fetch(SUPA.url + '/rest/v1/scores?on_conflict=user_id,pid,week', { method: 'POST', headers: { ...lbHdr(t), 'content-type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(rows) }); if (DATA.settings.friends !== false && DATA.profiles.every(p => p.fc)) playersPush().catch(() => { }); } catch (e) { } }, 4000);
}
/* kto LB_IDLE dní neotvoril apku, z rebríčka vypadne; po ďalšej aktivite sa vráti (updated_at sa obnoví) */
const lbSince = () => encodeURIComponent(new Date(Date.now() - LB_IDLE * 864e5).toISOString());
async function lbGet(q) { const t = await supaToken(); const r = await fetch(SUPA.url + '/rest/v1/scores?' + q, { headers: lbHdr(t) }); if (!r.ok) throw { status: r.status }; return r.json(); }
const lbSuf = (x, s) => String(x.pid).endsWith(s);
function lbParse(raw) { const st = {}; raw.forEach(x => { if (lbSuf(x, '#s')) st[x.user_id + '|' + String(x.pid).slice(0, -2)] = x.xp || 0; }); return raw.filter(x => !lbSuf(x, '#s') && !lbSuf(x, '#d')).map(x => ({ ...lbRow(x), st: st[x.user_id + '|' + x.pid] || 0 })); }
async function lbFetch(w) { return lbParse(await lbGet('select=user_id,pid,name,grade,xp&week=eq.' + w + '&updated_at=gte.' + lbSince() + '&order=xp.desc&limit=600')); }
async function lbFetchDay(d) {
  const [day, pres] = await Promise.all([lbGet('select=user_id,pid,name,grade,xp&week=eq.' + d + '&pid=like.*%23d&order=xp.desc&limit=600'), lbGet('select=user_id,pid,name,grade,xp,updated_at&pid=like.*%23s&updated_at=gte.' + lbSince() + '&order=updated_at.desc&limit=800')]);
  const m = new Map(); const key = x => x.user_id + '|' + String(x.pid).slice(0, -2);
  pres.forEach(x => { const k = key(x); if (!m.has(k)) m.set(k, { user_id: x.user_id, pid: String(x.pid).slice(0, -2), name: x.name, grade: x.grade, n: 0, pts: 0, st: x.xp || 0 }); });
  day.forEach(x => { const k = key(x), r = lbRow(x); const o = m.get(k) || { user_id: x.user_id, pid: String(x.pid).slice(0, -2), name: x.name, grade: x.grade, st: 0 }; o.n = r.n; o.pts = r.pts; m.set(k, o); });
  return [...m.values()];
}
async function lbLoad() {
  if (LB && LB.loading) return; const prev = LB; LB = { loading: true, rows: prev && prev.rows, day: prev && prev.day, at: Date.now() }; let out;
  try { if (!(SUPA_ON() && AUTH)) throw { off: true }; const [rows, day] = await Promise.all([lbFetch(weekId()), lbFetchDay(today())]); out = { rows, day, d: today() }; }
  catch (e) { out = { err: e && e.off ? 'off' : e && e.status === 404 ? 'missing' : 'net' }; }
  out.at = Date.now(); LB = out;
  if (UI.view === 'board') render(null); else if (UI.view === 'home' || UI.view === 'learn') { const el = $('#homelb'); if (el) el.outerHTML = homeBoard(P()); }
  if (!LBAW && out.rows) { LBAW = true; lbAwards(); }
}
function lbFresh() { if (!LB || (!LB.loading && (Date.now() - (LB.at || 0) > 20000 || (LB.d && LB.d !== today())))) lbLoad(); }
const lbSort = { d: (a, b) => b.n - a.n || b.pts - a.pts || b.st - a.st, n: (a, b) => b.n - a.n || b.pts - a.pts, s: (a, b) => b.st - a.st || b.n - a.n, x: (a, b) => b.pts - a.pts || b.n - a.n };
const lbActive = x => x.id === DATA.current || Array.from({ length: LB_IDLE }, (_, i) => x.days[daysAgo(i)]).some(Boolean);
function lbLocal(p, tab) { const w = weekId(), d = today(); return DATA.profiles.filter(lbActive).map(x => { const dy = x.dy && x.dy.d === d ? x.dy : null, wk = x.wk && x.wk.w === w ? x.wk : null; return { name: x.name, grade: x.grade, pid: String(x.id), n: tab === 'n' ? (wk ? wk.n || 0 : 0) : dy ? dy.n : 0, pts: tab === 'n' ? (wk ? wk.xp || 0 : 0) : dy ? dy.xp : 0, st: (x.streak && x.streak.count) || 0, mine: true, me: x.id === p.id }; }); }
function lbRows(p, tab = 'd') { const src = LB && (tab === 'n' ? LB.rows : LB.day); const rows = src ? src.map(x => ({ ...x, mine: !!AUTH && x.user_id === AUTH.uid, me: !!AUTH && x.user_id === AUTH.uid && x.pid === String(p.id) })) : lbLocal(p, tab); return rows.sort(lbSort[tab] || lbSort.d); }
const lbMedal = i => ['🥇', '🥈', '🥉'][i] || (i + 1) + '.';
const lbVal = (x, tab) => tab === 's' ? [x.st, plural(x.st, 'deň', 'dni', 'dní')] : tab === 'x' ? [x.pts, plural(x.pts, 'bod', 'body', 'bodov')] : [x.n, plural(x.n, 'zadanie', 'zadania', 'zadaní')];
const lbLine = (x, i, tab = 'd') => { const [v, u] = lbVal(x, tab); return `<div class="lbrow ${x.me ? 'me' : x.mine ? 'mine' : ''}"><span class="rk">${lbMedal(i)}</span><span class="lbav">${lbAv(x)}</span><span class="nm">${esc(x.name)}<small>${x.grade}. ročník${tab !== 's' ? ' · ' + x.pts + ' bodov' : ' · ' + x.n + ' zadaní dnes'}</small></span><b>${v}<small>${u}</small></b></div>`; };
const LBC = ['#FF8FA3', '#7EB6FF', '#5FD3A0', '#FFB45C', '#B9A0FF', '#4FC9D9', '#F27EC0', '#9BD15C'];
function lbAv(x) { const own = x.mine && DATA.profiles.find(q => String(q.id) === String(x.pid)); if (own) return avatarSvg(own.av, { crop: 'head' }); let h = 0; for (const c of String(x.name)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return `<span class="lbini" style="background:${LBC[h % LBC.length]}">${esc(String(x.name).trim().charAt(0).toUpperCase() || '?')}</span>`; }
/* stupne víťazov: 2. – 1. – 3. */
function podium(rows, tab, small) {
  return `<div class="podium ${small ? 'sm' : ''}">${[1, 0, 2].map(i => { const x = rows[i]; if (!x || !(tab === 's' ? x.st : x.n)) return `<div class="pd pd${i + 1} empty"><div class="pdwho"><span class="pdav"><span class="lbini q">?</span></span><b>voľné</b></div><div class="pdstep"><span>${i + 1}</span></div></div>`; const [v, u] = lbVal(x, tab); return `<div class="pd pd${i + 1} ${x.me ? 'me' : ''}"><div class="pdwho">${i === 0 ? '<span class="pdcrown">👑</span>' : ''}<span class="pdav">${lbAv(x)}</span><b>${esc(x.name)}</b><small>${v} ${u}</small></div><div class="pdstep"><span>${i + 1}</span></div></div>`; }).join('')}</div>`;
}
const untilMidnight = () => { const n = new Date(), m = new Date(n); m.setHours(24, 0, 0, 0); const min = Math.max(1, Math.round((m - n) / 60000)); return min >= 60 ? `${Math.floor(min / 60)} h ${min % 60} min` : `${min} min`; };
function homeBoard(p) {
  const rows = lbRows(p, 'd'); const mi = rows.findIndex(x => x.me); const mine = p.dy && p.dy.d === today() ? p.dy.n : 0;
  return `<button class="card homelb press" id="homelb" data-a="nav" data-v="board"><div class="sec"><h2>🏆 Rebríček dňa</h2><span class="eyebrow">Všetko ›</span></div>${podium(rows, 'd', true)}${mi > 2 ? lbLine(rows[mi], mi) : ''}<p class="muted b" style="font-size:.84rem;padding-top:6px">${!rows.length || mi < 0 || !mine ? `Dnes máš ${mine} ${plural(mine, 'zadanie', 'zadania', 'zadaní')}. Sprav kvíz alebo hru a vyskoč na stupne víťazov!` : mi === 0 ? 'Si na 1. mieste! Udrž si ho do polnoci a zajtra dostaneš odmenu. 👑' : (() => { const need = rows[mi - 1].n - rows[mi].n + 1; return `Si na ${mi + 1}. mieste. Na ${mi}. miesto ti ${plural(need, 'chýba', 'chýbajú', 'chýba')} ${need} ${plural(need, 'zadanie', 'zadania', 'zadaní')}.`; })()}</p></button>`;
}
/* odmeny pre prvých troch za včerajšok (denné kolo podľa zadaní) */
async function lbAwards() {
  try {
    if (!(SUPA_ON() && AUTH)) return; const pd = daysAgo(1); const todo = DATA.profiles.filter(p => p.lbDay !== pd); if (!todo.length) return;
    const rows = (await lbGet('select=user_id,pid,name,grade,xp&week=eq.' + pd + '&pid=like.*%23d&order=xp.desc&limit=20')).map(x => ({ ...lbRow(x), pid: String(x.pid).slice(0, -2) })).sort(lbSort.d); const wins = [];
    todo.forEach(p => { p.lbDay = pd; const r = rows.findIndex(x => x.user_id === AUTH.uid && x.pid === String(p.id)); if (r < 0 || r > 2 || !rows[r].n) return; const [item, coins] = LB_PRIZE[r]; p.owned = p.owned || []; const had = p.owned.includes('lb:' + item); if (!had) p.owned.push('lb:' + item); const c = coins + (had ? 20 : 0); p.coins = (p.coins || 0) + c; p.lbWins = (p.lbWins || 0) + 1; p.log.unshift({ t: Date.now(), k: 'gift', id: null, c, n: 0 }); wins.push({ p, r, item, c, had }); });
    save(); const w = wins.find(x => x.p.id === DATA.current) || wins[0]; if (!w) return;
    const it = itemOf('acc', w.item); const o = document.createElement('div'); o.className = 'over';
    o.innerHTML = `<div class="card box">${bearSvg('cheer')}<h2>${lbMedal(w.r)} ${w.r + 1}. miesto v rebríčku!</h2><p class="b">${esc(w.p.name)}, včera ${w.p.av.gender === 'd' ? 'si stála' : 'si stál'} na stupňoch víťazov.</p><div class="lbprize"><span class="pth">${itemThumb('acc', it, w.p.av)}</span><div><b>${it.n}</b><small>${w.had ? 'Už ju máš, preto slniečka navyše' : 'Vzácny doplnok, v obchode ho nekúpiš'}</small><b>+${w.c} ${COIN}</b></div></div><button class="btn primary block" data-a="ov-close">Paráda!</button></div>`;
    document.body.appendChild(o); sfx('level'); try { confetti(160, .3); } catch (e) { } if (UI.view === 'home' || UI.view === 'board') render(null);
  } catch (e) { }
}
VIEWS.board = () => {
  const p = P(); const rows = lbRows(p, LBTAB); const first = !LB || (LB.loading && !LB.rows); const LBN = 23; const rest = rows.slice(3, LBN); const mi = rows.findIndex(x => x.me);
  const note = LB && LB.err ? `<p class="muted b" style="font-size:.88rem;padding:4px 0">${LB.err === 'net' ? 'Spoločný rebríček sa nepodarilo načítať. Zatiaľ vidíš hráčov z tohto zariadenia.' : LB.err === 'missing' ? 'Spoločný rebríček ešte nie je zapnutý. Zatiaľ vidíš hráčov z tohto zariadenia.' : 'Spoločný rebríček uvidíš po prihlásení. Zatiaľ vidíš hráčov z tohto zariadenia.'}</p>` : '';
  const list = first ? '<div class="typing" style="margin:14px auto"><i></i><i></i><i></i></div>' : note + rest.map((x, i) => lbLine(x, i + 3, LBTAB)).join('') + Array.from({ length: Math.max(0, LBN - 3 - rest.length) }, (_, k) => `<div class="lbrow empty"><span class="rk">${rest.length + k + 4}.</span><span class="lbav"><span class="lbini q">?</span></span><span class="nm">voľné miesto<small>môžeš tu byť ty</small></span></div>`).join('') + (mi >= LBN ? `<div class="lbgap">⋯</div>${lbLine(rows[mi], mi, LBTAB)}` : '');
  const desc = { d: 'Kto dnes splnil najviac zadaní. Každý deň o polnoci začína nové kolo.', n: 'Kto tento týždeň splnil najviac zadaní: kvízy, hry, čítanie, písanie aj súboje.', s: 'Kto sa učí najviac dní po sebe bez prestávky.' }[LBTAB];
  return `${topbar('home')}<main class="view pop-in"><div><h1 style="font-size:2rem">🏆 Rebríček</h1><p class="muted b">Kto ${LB_IDLE} dní neotvorí Bystríka, z rebríčka zmizne. Stačí sa znova učiť a vráti sa.</p></div>${DATA.settings.lb === false ? `<section class="card lboff"><span>🔒</span><div><b>Ty sa v spoločnom rebríčku nezobrazuješ</b><small>Rodič to vypol v nastaveniach (Rodičovský účet → Nastavenia → Pravidlá pre dieťa).</small></div></section>` : ''}
  <div class="seg lbseg">${[['d', '📅 Dnes'], ['n', '🗓️ Týždeň'], ['s', '🔥 Séria']].map(([k, n]) => `<button class="${LBTAB === k ? 'on' : ''}" data-a="lbtab" data-t="${k}">${n}</button>`).join('')}</div><p class="muted b" style="font-size:.88rem;margin-top:-6px">${desc}</p>
  <section class="card lbstage">${first ? '' : podium(rows, LBTAB)}</section>
  <section class="card lb">${list}</section>
  <section class="card lbprizes"><div class="sec"><h2>🎁 Denné odmeny</h2><span class="eyebrow">nové kolo o ${untilMidnight()}</span></div><p class="muted b" style="font-size:.86rem">Kto je o polnoci v rebríčku <b>Dnes</b> na 1. až 3. mieste, dostane ráno vzácny doplnok (v obchode sa kúpiť nedá) a slniečka.</p><div class="lbpz">${LB_PRIZE.map(([id, c], i) => { const it = itemOf('acc', id); return `<div class="pz p${i + 1}"><span class="pth">${itemThumb('acc', it, p.av)}</span><b>${lbMedal(i)} ${it.n}</b><small>+${c} slniečok</small></div>`; }).join('')}</div></section>
  <p class="muted b" style="font-size:.8rem">V rebríčku je len meno, ročník a výsledky. Rodič ho vie vypnúť v rodičovskom účte.</p></main>${nav('')}`;
};
AFTER.board = () => lbFresh();
AFTER.duel = () => { if (FR_ON()) frFresh(20000); };
const _afterLearn = AFTER.learn; AFTER.learn = () => { _afterLearn && _afterLearn(); lbFresh(); };
const _afterHome = AFTER.home; AFTER.home = () => { _afterHome && _afterHome(); lbFresh(); bearIdleStart(); if (FR_ON()) { frFresh(60000); inboxStart(); } };
function duelCreate() { const p = P(); if (D) duelClose(); D = { st: 'wait', host: true, code: String(R(1000, 9999)), me: String(p.name).slice(0, 14), id: Math.random().toString(36).slice(2, 10) }; D.ws = duelWs(D.code, duelMsg); return D.code; }
function duelJoin(code) { const p = P(); if (D) duelClose(); D = { st: 'joining', host: false, code, me: String(p.name).slice(0, 14), id: Math.random().toString(36).slice(2, 10) }; D.ws = duelWs(code, duelMsg, () => { const hi = () => D && D.ws && D.ws.say('join', { id: D.id, name: D.me }); hi(); D.tick = setInterval(hi, 1000); }); D.to = setTimeout(() => { if (D && D.st === 'joining') { duelClose(); D = { st: 'lobby', err: 'Súboj s týmto kódom sa nenašiel. Skontroluj kód.' }; if (UI.view === 'duel') render(null); } }, 15000); }
