/* ===== Priatelia a správy ===== */
let FR = null, FC = null; const FCA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const FR_ON = () => SUPA_ON() && !!AUTH && DATA.settings.friends !== false;
const fcode = p => { if (!p.fc) { p.fc = Array.from({ length: 6 }, () => FCA[Math.floor(Math.random() * FCA.length)]).join(''); } return p.fc; };
async function sb(method, path, body, prefer) {
  const t = await supaToken(); const r = await fetch(SUPA.url + '/rest/v1/' + path, { method, headers: { ...lbHdr(t), 'content-type': 'application/json', ...(prefer ? { Prefer: prefer } : {}) }, body: body ? JSON.stringify(body) : undefined });
  if (!r.ok) { let j = {}; try { j = await r.json(); } catch (e) { } throw { status: r.status, code: j.code, message: j.message }; }
  const tx = await r.text(); return tx ? JSON.parse(tx) : null;
}
function tStats(p) {
  let q = 0, c = 0, d = 0; for (let i = 0; i < 7; i++) { const x = p.days[daysAgo(i)]; if (x) { d++; q += x.q || 0; c += x.c || 0; } }
  const weak = ALL_TOPICS.filter(t => p.topics[t.id]?.total >= 5 && p.topics[t.id].correct / p.topics[t.id].total < .7).sort((a, b) => p.topics[a.id].correct / p.topics[a.id].total - p.topics[b.id].correct / p.topics[b.id].total).slice(0, 2).map(t => t.name);
  return { acc: p.stats.answered ? Math.round(p.stats.correct / p.stats.answered * 100) : null, wq: q, wacc: q ? Math.round(c / q * 100) : null, wd: d, weak, last: (p.log[0] || {}).t || 0 };
}
let CLST = null; function clsPush() { if (!(SUPA_ON() && AUTH) || !DATA.profiles.some(p => (p.cls || []).length)) return; clearTimeout(CLST); CLST = setTimeout(() => playersPush().catch(() => { }), 4000); }
async function playersPush() {
  const w = weekId(); const rows = DATA.profiles.map(p => ({ user_id: AUTH.uid, pid: String(p.id), code: fcode(p), name: String(p.name).slice(0, 14), grade: p.grade, av: p.av, stats: Object.assign({ lvl: levelInfo(p.xp).L, n: p.wk && p.wk.w === w ? p.wk.n || 0 : 0, st: (p.streak && p.streak.count) || 0 }, tStats(p)), updated_at: new Date().toISOString() }));
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
  if (UI.view === 'friends' || (UI.view === 'duel' && D && D.st === 'lobby')) render(null); else { const nb = $('.nav [data-v="me"]'); if (nb && FR.total > 0 && !nb.querySelector('.dot')) nb.insertAdjacentHTML('beforeend', '<span class="dot"></span>'); }
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
  const wrap = (body, tabs = '') => `${topbar('nav-me')}<main class="view pop-in"><div><h1 style="font-size:2rem">🤝 Priatelia</h1></div>${tabs}${body}</main>${nav('friends')}`;
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
AFTER.me = () => { if (typeof SUPA_ON === 'function' && SUPA_ON() && AUTH) frFresh(30000); };
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
  if (!FC || FC.sending) return; if (kind === 'text' && !DATA.settings.msgOk) { toast('Písanie musí povoliť rodič.'); return; } body = String(body || '').trim().slice(0, 200); if (!body) return; FC.sending = true; const me = P();
  try { await sb('POST', 'messages', { from_code: me.fc, to_code: FC.code, kind, body }, 'return=minimal'); sfx('pop'); if (FC.ws) FC.ws.say('new', {}); if (kind === 'text') inboxSend(FC.code, 'msg', { from: me.fc }); FC.sending = false; await fcLoad(); }
  catch (e) { FC.sending = false; toast('Správu sa nepodarilo odoslať.'); }
}
function fcClose() { if (!FC) return; clearInterval(FC.poll); if (FC.ws) { clearInterval(FC.ws._hb); try { FC.ws.onerror = null; FC.ws.close(); } catch (e) { } } FC = null; }
VIEWS.fchat = pr => {
  const f = (FR && FR.list || []).find(x => x.code === pr.code) || { code: pr.code, name: 'Priateľ', grade: '' };
  return `<header class="top"><button class="iconbtn press" data-a="nav" data-v="friends" aria-label="Späť">←</button><span class="headbub" style="width:44px;height:44px">${frAv(f.av)}</span><div class="who"><b>${esc(f.name)}</b><span class="muted b" style="font-size:.8rem">${f.grade ? f.grade + '. ročník' : ''}</span></div><button class="iconbtn press" data-a="fc-duel" aria-label="Vyzvať na súboj">⚔️</button><button class="iconbtn press" data-a="fc-menu" aria-label="Viac">⋯</button></header>
  <main class="view nonav fchat"><div class="fmsgs" id="fmsgs">${FC && FC.code === pr.code ? fcBubbles() : '<div class="typing" style="margin:14px auto"><i></i><i></i><i></i></div>'}</div>
  <div class="fcbar">${!DATA.settings.msgOk ? `<div class="fclock"><span>🔒</span><div><b>Písanie ešte nie je povolené</b><small>Požiadaj rodiča, nech ti ho zapne v rodičovskom účte. Súboj môžeš poslať aj tak ⚔️</small></div></div>` : `<div class="fcrow">${FC_PRESETS.map((t, i) => `<button class="chip" data-a="fc-say" data-i="${i}">${t}</button>`).join('')}</div><div class="fcrow">${FC_EMOJI.map((t, i) => `<button class="chip emo1" data-a="fc-emo" data-i="${i}">${t}</button>`).join('')}</div>${DATA.settings.freeChat ? `<div class="fraddrow"><input class="field" id="fctext" maxlength="200" placeholder="Napíš správu…" autocomplete="off"><button class="btn primary small" data-a="fc-text">Poslať</button></div>` : '<p class="muted b" style="font-size:.76rem;text-align:center;margin:0">Vlastné správy môže zapnúť rodič v rodičovskom účte.</p>'}`}</div></main>`;
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
