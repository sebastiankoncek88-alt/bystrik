/* ===== Režim učiteľa ===== */
let TC = null; // { loading, classes:[], sel, members:[], err }
const clsCode = () => Array.from({ length: 6 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('');
async function tcLoad() {
  try { const cl = await sb('GET', 'classes?select=code,name,created_at&owner=eq.' + AUTH.uid + '&order=created_at.desc'); TC = { classes: cl, sel: TC && TC.sel, members: [] };
    if (TC.sel) { const mem = await sb('GET', 'class_members?select=player_code,joined_at&class_code=eq.' + TC.sel); const codes = mem.map(m => m.player_code); TC.members = codes.length ? await sb('GET', 'players?select=code,name,grade,av,stats,updated_at&code=in.(' + codes.join(',') + ')') : []; }
  } catch (e) { TC = { err: e && e.status === 404 ? 'missing' : 'net', classes: [] }; }
  if (UI.view === 'teacher') render(null);
}
VIEWS.teacher = () => {
  const back = `<header class="top"><button class="iconbtn press" data-a="tc-back" aria-label="Späť">←</button><div class="who"><b>🏫 Režim učiteľa</b><span class="muted b" style="font-size:.8rem">Trieda a pokrok žiakov</span></div></header>`;
  const wrap = b => `${back}<main class="view nonav tcv">${b}</main>`;
  if (!(SUPA_ON() && AUTH)) return wrap('<section class="card pcard"><p class="b">Režim učiteľa funguje po prihlásení e-mailom.</p></section>');
  if (!TC) { TC = { loading: true }; setTimeout(tcLoad, 0); }
  if (TC.loading) return wrap('<div class="typing" style="margin:30px auto"><i></i><i></i><i></i></div>');
  if (TC.err === 'missing') return wrap('<section class="card pcard"><b>Už čoskoro</b><p class="muted b">Triedy ešte nie sú v databáze zapnuté.</p></section>');
  if (TC.err) return wrap('<section class="card pcard"><p class="muted b">Nepodarilo sa načítať. Skontrolujte internet.</p><button class="btn small" data-a="tc-reload">Skúsiť znova</button></section>');
  if (TC.sel) {
    const c = TC.classes.find(x => x.code === TC.sel) || { name: 'Trieda', code: TC.sel }; const ms = (TC.members || []).slice().sort((a, b) => ((b.stats || {}).wq || 0) - ((a.stats || {}).wq || 0));
    const avg = k => { const v = ms.map(m => (m.stats || {})[k]).filter(x => x != null); return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : null; };
    const act = ms.filter(m => (m.stats || {}).wd > 0).length; const weakAll = {}; ms.forEach(m => ((m.stats || {}).weak || []).forEach(w => weakAll[w] = (weakAll[w] || 0) + 1)); const tw = Object.entries(weakAll).sort((a, b) => b[1] - a[1]).slice(0, 3);
    return wrap(`<button class="btn small" data-a="tc-sel" data-c="" style="align-self:flex-start">← Moje triedy</button>
    <section class="card pcard tchead"><span class="eyebrow">Trieda</span><h2 style="margin:0;font-family:var(--f-display)">${esc(c.name)}</h2><p class="muted b" style="margin:4px 0;font-size:.85rem">Žiaci sa pridajú v apke: <b>Ja → Moja trieda</b> a zadajú tento kód:</p><div class="duelcode sm">${c.code.split('').map(x => `<i>${x}</i>`).join('')}</div><button class="btn small" data-a="tc-copy" data-c="${c.code}">📋 Skopírovať kód</button></section>
    <div class="ptiles"><div class="card ptile"><b>${ms.length}</b><span>žiakov</span></div><div class="card ptile"><b>${act}</b><span>aktívnych tento týždeň</span></div><div class="card ptile"><b>${avg('wacc') == null ? '–' : avg('wacc') + ' %'}</b><span>priemerná úspešnosť (7 dní)</span></div><div class="card ptile"><b>${ms.reduce((a, m) => a + ((m.stats || {}).wq || 0), 0)}</b><span>odpovedí spolu (7 dní)</span></div></div>
    ${tw.length ? `<section class="card pcard"><span class="eyebrow">🔁 Trieda potrebuje precvičiť</span>${tw.map(([n, k]) => `<div class="statrow"><span>${esc(n)}</span><b>${k} ${plural(k, 'žiak', 'žiaci', 'žiakov')}</b></div>`).join('')}</section>` : ''}
    <section class="card pcard"><span class="eyebrow">👧 Žiaci (zoradení podľa aktivity)</span>${ms.length ? ms.map(m => { const st = m.stats || {}; const ago = st.last ? Math.floor((Date.now() - st.last) / DAYMS) : null; return `<div class="tcrow"><span class="frav">${frAv(m.av)}</span><span class="grow"><b>${esc(m.name)}</b><small>${m.grade}. roč. · Lv ${st.lvl || 1} · 🔥 ${st.st || 0} · ${ago == null ? 'ešte neaktívny' : ago === 0 ? 'dnes aktívny' : 'naposledy pred ' + ago + ' d'}</small>${(st.weak || []).length ? `<small class="tcweak">🔁 ${st.weak.map(esc).join(', ')}</small>` : ''}</span><span class="tcnum"><b style="color:${st.wacc == null ? 'var(--muted)' : st.wacc >= 75 ? 'var(--good)' : st.wacc >= 55 ? '#C98A00' : 'var(--bad)'}">${st.wacc == null ? '–' : st.wacc + ' %'}</b><small>${st.wq || 0} odp. / ${st.wd || 0} d</small></span><button class="iconbtn sm" data-a="tc-kick" data-p="${m.code}" aria-label="Odstrániť z triedy">✕</button></div>`; }).join('') : '<p class="muted b">Zatiaľ sa nikto nepridal. Dajte žiakom kód triedy.</p>'}</section>
    <button class="btn small" data-a="tc-reload">🔄 Obnoviť</button><button class="btn small bad" data-a="tc-delcls" data-c="${c.code}">🗑️ Zrušiť triedu</button>`);
  }
  return wrap(`<section class="card pcard"><span class="eyebrow">🏫 Pre učiteľov a krúžky</span><p class="b" style="font-size:.9rem;margin:4px 0">Vytvorte triedu, dajte žiakom kód a uvidíte, kto sa učí, s akou úspešnosťou a čo trieda potrebuje precvičiť. Žiaci vidia len názov triedy, nie ostatných spolužiakov.</p>
  <div class="fraddrow"><input class="field" id="tcname" maxlength="30" placeholder="Napr. 2.B – ZŠ Hlavná"><button class="btn primary small" data-a="tc-new">Vytvoriť</button></div></section>
  ${TC.classes.length ? `<section class="card pcard"><span class="eyebrow">Moje triedy</span><div class="pslist">${TC.classes.map(c => `<button class="psrow press" data-a="tc-sel" data-c="${c.code}"><span class="psi">🏫</span><span class="grow"><b>${esc(c.name)}</b><small>kód ${c.code}</small></span><span class="pcgo">›</span></button>`).join('')}</div></section>` : '<p class="muted b" style="text-align:center">Zatiaľ nemáte žiadnu triedu.</p>'}`);
};
/* žiak: moja trieda */
let MYCLS = null;
async function myClsLoad(p) { try { const codes = p.cls || []; MYCLS = { pid: p.id, list: codes.length ? await sb('GET', 'classes?select=code,name&code=in.(' + codes.join(',') + ')') : [] }; } catch (e) { MYCLS = { pid: p.id, list: [], err: 1 }; } if (UI.view === 'me') render(null); }
function myClsCard(p) {
  if (!(SUPA_ON() && AUTH)) return '';
  if (!MYCLS || MYCLS.pid !== p.id) { MYCLS = { pid: p.id, list: null }; setTimeout(() => myClsLoad(p), 0); }
  const l = MYCLS.list || [];
  return `<section class="card myclass"><div class="sec"><h2>🏫 Moja trieda</h2></div>${l.length ? l.map(c => `<div class="statrow"><span>✅ ${esc(c.name)}</span><button class="chip" data-a="cls-leave" data-c="${c.code}">Odísť</button></div>`).join('') : `<p class="muted b" style="font-size:.85rem;margin:0">Ak ti pani učiteľka dala kód triedy, zadaj ho sem. Uvidí, ako sa ti darí.</p>`}<div class="fraddrow"><input class="field" id="clscode" maxlength="6" autocapitalize="characters" autocomplete="off" placeholder="Kód triedy"><button class="btn primary small" data-a="cls-join">Pridať sa</button></div></section>`;
}
async function deleteAccount() {
  const online = typeof SUPA_ON === 'function' && SUPA_ON() && AUTH;
  if (online) {
    let full = false; try { await sb('POST', 'rpc/delete_me', {}); full = true; } catch (e) { }
    if (!full) { const codes = DATA.profiles.map(p => p.fc).filter(Boolean); const uid = AUTH.uid; const tryDel = async q => { try { await sb('DELETE', q); } catch (e) { } };
      if (codes.length) { const c = codes.join(','); await tryDel('messages?from_code=in.(' + c + ')'); await tryDel('friends?my_code=in.(' + c + ')'); }
      await tryDel('scores?user_id=eq.' + uid); await tryDel('players?user_id=eq.' + uid); await tryDel('saves?user_id=eq.' + uid); }
    try { fetch(SUPA.url + '/auth/v1/logout', { method: 'POST', headers: { apikey: SUPA.key, Authorization: 'Bearer ' + AUTH.at } }).catch(() => { }); } catch (e) { }
    setAuth(null); DBREF = null;
  }
  try { Object.keys(localStorage).filter(k => k.startsWith('bystrik')).forEach(k => localStorage.removeItem(k)); } catch (e) { }
  resetData(); PARENT_OK = false; DELACC = 0; toast('Účet a všetky údaje sú zmazané.'); go(online ? 'login' : 'onboard', {}, 'u');
}
function delCard() {
  return `<section class="card pcard delcard"><span class="eyebrow">📄 Ochrana súkromia</span><p class="muted b" style="font-size:.85rem;margin:4px 0">Aké údaje apka ukladá a aké máte práva.</p><button class="btn small" data-a="nav" data-v="privacy">Zobraziť zásady</button>
  <span class="eyebrow" style="margin-top:12px;display:block">🗑️ Zmazať celý účet</span>${DELACC ? `<p class="b" style="font-size:.88rem;margin:4px 0">Zmaže sa e-mailový účet, všetky deti, pokrok, priatelia, správy aj rebríček. <b>Nedá sa to vrátiť.</b> Pre potvrdenie napíšte <b>ZMAZAŤ</b>.</p><input class="field" id="delconf" autocomplete="off" placeholder="ZMAZAŤ"><div class="rowbtns" style="margin-top:8px"><button class="btn" data-a="del-no">Zrušiť</button><button class="btn bad" data-a="del-yes">Zmazať navždy</button></div>` : `<p class="muted b" style="font-size:.85rem;margin:4px 0">Odstráni účet a všetky údaje zo servera aj z tohto zariadenia.</p><button class="btn small bad" data-a="del-ask">Zmazať účet…</button>`}</section>`;
}
function pmsgCard(p) {
  if (!(typeof SUPA_ON === 'function' && SUPA_ON() && AUTH)) return '<section class="card pcard"><p class="muted b" style="padding:6px 0">Správy uvidíte po prihlásení e-mailom (Účet a AI).</p></section>';
  if (!p.fc) return '<section class="card pcard"><p class="muted b" style="padding:6px 0">Dieťa zatiaľ nemá žiadnych priateľov.</p></section>';
  if (!PM || PM.pid !== p.id) { PM = { pid: p.id, loading: true }; setTimeout(() => pmLoad(p), 0); }
  if (PM.loading) return '<section class="card pcard"><div class="typing" style="margin:10px auto"><i></i><i></i><i></i></div></section>';
  if (PM.err) return `<section class="card pcard"><p class="muted b">Nepodarilo sa načítať správy.</p><button class="btn small" data-a="pm-reload">Skúsiť znova</button></section>`;
  const st = `<p class="b" style="margin:0 0 6px;font-size:.88rem">${DATA.settings.msgOk ? '✅ Písanie je povolené' : '🔒 Písanie je vypnuté (zapnete v Pravidlá pre dieťa)'}</p>`;
  if (!PM.friends.length) return `<section class="card pcard">${st}<p class="muted b">Dieťa zatiaľ nemá žiadnych priateľov.</p></section>`;
  const rows = PM.friends.map(f => { const n = PM.msgs.filter(m => m.from_code === f.code || m.to_code === f.code).length; return `<button class="psrow press ${PM.sel === f.code ? 'on' : ''}" data-a="pm-open" data-c="${f.code}"><span class="psi">${frAv(f.av)}</span><span class="grow"><b>${esc(f.name)}</b><small>${f.grade ? f.grade + '. ročník · ' : ''}${n} ${plural(n, 'správa', 'správy', 'správ')}</small></span><span class="pcgo">${PM.sel === f.code ? '⌄' : '›'}</span></button>`; }).join('');
  let hist = '';
  if (PM.sel) { const f = PM.friends.find(x => x.code === PM.sel) || { name: 'Priateľ' }; const ms = PM.msgs.filter(m => m.from_code === PM.sel || m.to_code === PM.sel).slice().reverse();
    hist = `<div class="pmhist"><span class="eyebrow">${esc(p.name)} ↔ ${esc(f.name)}</span>${ms.length ? ms.map(m => { const mine = m.from_code === p.fc; return `<div class="fmsg ${mine ? 'me' : ''}"><span>${m.kind === 'duel' ? '⚔️ Výzva na súboj' : esc(m.body || '')}</span><time>${mine ? esc(p.name) : esc(f.name)} · ${fmtTime(new Date(m.created_at).getTime())}</time></div>`; }).join('') : '<p class="muted b">Zatiaľ žiadne správy.</p>'}</div>`; }
  return `<section class="card pcard">${st}<div class="pslist">${rows}</div>${hist}<button class="btn small" data-a="pm-reload" style="margin-top:8px">🔄 Obnoviť</button></section>`;
}
async function pmLoad(p) {
  try {
    const [a, b] = await Promise.all([sb('GET', 'friends?select=friend_code&my_code=eq.' + p.fc), sb('GET', 'friends?select=my_code&friend_code=eq.' + p.fc)]);
    const mine = a.map(x => x.friend_code), theirs = b.map(x => x.my_code); const codes = [...new Set([...mine, ...theirs])].filter(c => c !== p.fc && /^[A-Z0-9]{6}$/.test(c));
    const pl = codes.length ? await sb('GET', 'players?select=code,name,grade,av&code=in.(' + codes.join(',') + ')') : [];
    const msgs = codes.length ? await sb('GET', `messages?select=id,from_code,to_code,kind,body,created_at&or=(from_code.eq.${p.fc},to_code.eq.${p.fc})&order=id.desc&limit=1000`) : [];
    PM = { pid: p.id, friends: codes.map(c => pl.find(x => x.code === c) || { code: c, name: 'Hráč' }), msgs, sel: PM && PM.sel };
  } catch (e) { PM = { pid: p.id, err: true }; }
  if (UI.view === 'parent') render(null);
}
