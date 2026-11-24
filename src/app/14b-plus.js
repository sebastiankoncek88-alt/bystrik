/* ===== Bystrík Plus (len pre rodiča; dieťa nikdy nevidí ponuku na platenie) ===== */
/* Stripe Payment Links – verejné odkazy z Stripe Dashboard → Payment links. Kým sú prázdne, tlačidlá ukážu „čoskoro“. */
const PLUS_CFG = { month: '', year: '', teacher: '', portal: '' };
const PLUS_PRICE = { month: '3,99 €', year: '29,99 €', teacher: '49 €', trial: 7 };
const FREE_KIDS = 2, PLUS_KIDS = 5;
let PLUS = null; try { PLUS = JSON.parse(localStorage.getItem('bystrik.plus') || 'null'); } catch (e) { }
let ADMIN = false; try { ADMIN = localStorage.getItem('bystrik.admin') === '1'; } catch (e) { }
const isPlus = () => ADMIN || !!(PLUS && ['active', 'trialing'].includes(PLUS.status) && (!PLUS.until || new Date(PLUS.until).getTime() > Date.now()));
/* kým nie sú spustené platby, Plus výhody sú pre všetkých zadarmo (nič sa nezamkne) */
const plusFree = () => !PLUS_CFG.month && !PLUS_CFG.year;
const hasPlus = () => isPlus() || plusFree();
async function plusLoad() {
  if (!SUPA_ON() || !AUTH || !AUTH.uid) return; try { await plusLoad0(); } finally { setTimeout(giftCheck, 600); setTimeout(coinGiftCheck, 900); }
}
async function plusLoad0() {
  try { const a = await sb('POST', 'rpc/am_admin', {}); ADMIN = a === true; try { localStorage.setItem('bystrik.admin', ADMIN ? '1' : '0'); } catch (e) { } } catch (e) { /* funkcia ešte nie je */ }
  try { const r = await sb('GET', 'plus?select=status,plan,current_period_end&user_id=eq.' + AUTH.uid); const x = r && r[0]; PLUS = x ? { status: x.status, plan: x.plan, until: x.current_period_end, at: Date.now() } : null; try { localStorage.setItem('bystrik.plus', JSON.stringify(PLUS)); } catch (e) { } } catch (e) { /* tabuľka ešte neexistuje alebo offline */ }
}
/* Darované Plus: raz sa ukáže celoobrazovkové otvorenie darčeka */
function giftCheck() {
  if (!PLUS || PLUS.plan !== 'gift' || PLUS.status !== 'active' || (PLUS.until && new Date(PLUS.until) < new Date())) return;
  let seen = ''; try { seen = localStorage.getItem('bystrik.giftSeen') || ''; } catch (e) { } if (seen === String(PLUS.until)) return;
  if (document.querySelector('.over,.giftfs') || ['quiz', 'game', 'pin', 'login', 'onboard', 'onboard2'].includes(UI.view)) { setTimeout(giftCheck, 4000); return; }
  giftReveal();
}
function giftReveal() {
  const days = PLUS && PLUS.until ? (new Date(PLUS.until) - Date.now()) / 864e5 : 9999; const len = days > 3000 ? 'navždy' : days > 300 ? 'na celý rok' : days > 25 ? 'na mesiac' : 'na ' + Math.max(1, Math.round(days)) + ' dní';
  const w = document.createElement('div'); w.className = 'giftfs'; w.setAttribute('role', 'dialog'); w.setAttribute('aria-label', 'Darček: Bystrík Plus');
  w.innerHTML = `<i class="gfrays" aria-hidden="true"></i><i class="gfstars" aria-hidden="true"></i>
  <div class="gfstage"><p class="gfhint">Máš darček! 🎁</p><button class="gfbox" id="gfbox" aria-label="Otvoriť darček"><span class="gflid"><i class="gfbow"></i></span><span class="gfbody"></span></button><p class="gftap">Ťukni a otvor ho</p></div>
  <div class="gfopen" hidden><div class="gfbear">${bearSvg('hidle')}<span class="gfcrown">👑</span></div><h1 class="gflogo">Bystrík <em>Plus</em></h1><p class="gftxt">Niekto ti daroval Bystrík Plus <b>${len}</b>!</p>
  <ul class="gfl"><li>📖 Čítanka s Bystríkom, ktorý počúva</li><li>⚔️ Súboj a 🎧 Diktát</li><li>📋 Úlohy od rodiča a podrobný prehľad</li></ul><button class="btn primary block bigplay gfok" id="gfok">Super, ďakujem! ⭐</button></div>`;
  document.body.appendChild(w); try { sfx('pop'); } catch (e) { }
  const done = () => { try { localStorage.setItem('bystrik.giftSeen', String(PLUS.until)); } catch (e) { } w.classList.add('out'); setTimeout(() => { w.remove(); try { render(null); } catch (e) { } }, 450); };
  let opened = false; const open = () => { if (opened) return; opened = true; const box = w.querySelector('#gfbox'); box.classList.add('opening'); try { sfx('chest'); } catch (e) { try { sfx('level'); } catch (x) { } }
    setTimeout(() => { w.classList.add('opened'); w.querySelector('.gfstage').hidden = true; w.querySelector('.gfopen').hidden = false; try { sfx('level'); confetti(160, .45); } catch (e) { } try { say('Hurá! Dostal si darček. Bystrík Plus!'); } catch (e) { } setTimeout(() => { try { confetti(90, .3); } catch (e) { } }, 900); }, 900); };
  w.querySelector('#gfbox').addEventListener('click', open); w.querySelector('#gfok').addEventListener('click', done);
}
function plusLink(k) { const u = PLUS_CFG[k]; if (!u) return ''; const q = new URLSearchParams(); if (AUTH && AUTH.uid) q.set('client_reference_id', AUTH.uid); if (AUTH && AUTH.email) q.set('prefilled_email', AUTH.email); return u + (u.includes('?') ? '&' : '?') + q.toString(); }
const PLUS_FEAT = [
  ['🧸', 'AI Bystrík bez kľúča', 'Vysvetlí chybu, odpovie na otázku a dá sa s ním rozprávať hlasom.', 'soon'],
  ['📧', 'Týždenný e-mail', 'Každý týždeň súhrn: čo dieťa robilo a čo precvičiť.', 'soon'],
  ['🖨️', 'Pracovné listy na tlač', 'Vygenerované zo slabých tém dieťaťa, s kľúčom správnych odpovedí.', 'ws'],
  ['🗣️', 'Bystrík vypočuje čítanie', 'Ukáže plynulosť a chyby pri čítaní nahlas.', 'soon'],
  ['👨‍👩‍👧‍👦', `Až ${PLUS_KIDS} detí v jednom účte`, `Zadarmo ${FREE_KIDS} deti. Synchronizácia na všetkých zariadeniach rodiny.`, 'kids'],
  ['👕', 'Mesačná kolekcia oblečenia', 'Nové veci pre postavičku aj Bystríka. Len vzhľad, bez výhody v rebríčku.', 'soon'],
  ['🎮', 'Nové hry v lunaparku', 'Každý mesiac nová hra s učivom.', 'soon'],
  ['📚', 'Viac učiva', 'Logika, angličtina navyše a príprava na previerky pre 1.–4. ročník.', 'soon'],
  ['🏠', 'Nové veci do Bystríkovho domčeka', 'Nábytok, hračky a čiapky pre medvedíka.', 'soon'],
  ['🎧', 'Nahrávky čítania na každom zariadení', 'Dieťa pošle nahrávku a vy si ju vypočujete aj na svojom telefóne.', 'rec'],
  ['📊', 'Podrobný prehľad', 'Grafy, silné a slabé témy, pokrok v predmetoch a história učenia.', 'stats'],
  ['📸', 'Moje poznámky', 'Dieťa odfotí zošit a Bystrík z neho spraví kvíz.', 'notes'],
  ['📋', 'Úlohy a učivo zo školy', 'Zadávajte dieťaťu úlohy s odmenou a nastavte, čo sa práve učí v škole.', 'tasks'],
  ['📖', 'Čítanka s nahrávaním', 'Príbehy na čítanie nahlas pre 1.–4. ročník, nahrávky a hodnotenie od rodiča.', 'reads'],
  ['⚔️', 'Súboj s kamarátom', 'Dve deti, rovnaké otázky, kto bude rýchlejší a presnejší.', 'duel'],
  ['🎧', 'Diktát', 'Bystrík diktuje slová a vety, dieťa ich píše.', 'dict'],
  ['⏰', 'Pripomienka učenia', 'Každý deň v zvolený čas pripomenie, že je čas na Bystríka.', 'remind'],
  ['📤', 'Týždenný report', 'Pošlite súhrn týždňa druhému rodičovi alebo babke.', 'report'],
  ['🏫', 'Režim učiteľa a trieda', 'Trieda, kód pre žiakov a prehľad celej triedy.', 'teacher']
];
/* karta v rodičovskom účte */
function plusCard() {
  if (window.claude && window.claude.use) return `<section class="card pcard"><p class="b" style="margin:4px 0">Bystrík Plus sa dá aktivovať vo webovej verzii apky.</p></section>`;
  const on = isPlus(), any = PLUS_CFG.month || PLUS_CFG.year;
  const feats = PLUS_FEAT.map(([i, n, d, k]) => `<div class="plf"><span class="pli">${i}</span><span class="grow"><b>${n}${k === 'soon' ? ' <em class="plsoon">čoskoro</em>' : ''}</b><small>${d}</small></span></div>`).join('');
  if (on && (ADMIN || !PLUS)) return `<section class="card pcard plcard on"><div class="plhead"><span class="plbadge">⭐ Plus</span><b>Bystrík Plus je aktívny</b><small>Moderátorský účet · všetko zadarmo</small></div>${feats}</section>`;
  if (on) return `<section class="card pcard plcard on"><div class="plhead"><span class="plbadge">⭐ Plus</span><b>Bystrík Plus je aktívny</b><small>${PLUS.status === 'trialing' ? 'Skúšobné obdobie' : PLUS.plan === 'year' ? 'Ročné predplatné' : 'Mesačné predplatné'}${PLUS.until ? ' · do ' + new Date(PLUS.until).toLocaleDateString('sk-SK') : ''}</small></div>${feats}<div class="rowbtns">${PLUS_CFG.portal ? `<a class="btn small" href="${PLUS_CFG.portal}" target="_blank" rel="noopener" style="text-decoration:none">⚙️ Spravovať predplatné</a>` : ''}<button class="btn small" data-a="plus-refresh">🔄 Obnoviť stav</button></div></section>`;
  return `<section class="card pcard plcard"><div class="plhead"><span class="plbadge">⭐ Plus</span><b>Bystrík Plus</b><small>Celé učenie ostáva zadarmo. Plus pridáva veci pre rodičov a podporuje ďalší vývoj Bystríka.</small></div>${feats}
  <div class="plprices"><a class="plprice ${PLUS_CFG.year ? '' : 'off'}" ${PLUS_CFG.year ? `href="${plusLink('year')}" target="_blank" rel="noopener"` : 'data-a="plus-soon"'}><em>výhodnejšie</em><b>${PLUS_PRICE.year}</b><small>ročne · ${(29.99 / 12).toFixed(2).replace('.', ',')} € mesačne</small></a><a class="plprice ${PLUS_CFG.month ? '' : 'off'}" ${PLUS_CFG.month ? `href="${plusLink('month')}" target="_blank" rel="noopener"` : 'data-a="plus-soon"'}><b>${PLUS_PRICE.month}</b><small>mesačne</small></a></div>
  <p class="muted b" style="font-size:.8rem;margin:6px 0 0;text-align:center">${any ? `Prvých ${PLUS_PRICE.trial} dní zadarmo. Zrušiť sa dá kedykoľvek.` : 'Platby spúšťame čoskoro. Dovtedy sú pracovné listy a viac detí zadarmo. 🧸'}</p>
  ${PLUS_CFG.teacher ? `<a class="btn small block" style="margin-top:8px;text-decoration:none" href="${plusLink('teacher')}" target="_blank" rel="noopener">🏫 Licencia pre triedu · ${PLUS_PRICE.teacher} ročne</a>` : ''}
  ${AUTH ? '<button class="linkbtn" data-a="plus-refresh" style="margin-top:4px">Už som zaplatil(a) – obnoviť stav</button>' : '<p class="muted b" style="font-size:.78rem;text-align:center">Na aktiváciu sa najprv prihláste e-mailom (Účet a AI).</p>'}</section>`;
}
/* otvorí Plus kartu v rodičovských nastaveniach (len z rodičovskej časti) */
function plusOpen() { if (UI.view !== 'parent') return; PTAB = 'set'; PSET_WANT = 'Bystrík Plus'; render(null); scrollTo({ top: 0 }); }
/* ---- Moderátor: panel (štatistiky, používatelia, darovanie Plus) ---- */
let MODP = { tab: 'users', users: null, stats: null, q: '', loading: 0, err: '' };
async function modPanelLoad() { if (!ADMIN || MODP.loading) return; MODP.loading = 1; MODP.err = '';
  try { const [u, s] = await Promise.all([sb('POST', 'rpc/admin_users', {}), sb('POST', 'rpc/admin_stats', {})]); MODP.users = u || []; MODP.stats = s || {}; } catch (e) { MODP.users = MODP.users || []; MODP.err = 'Zoznam sa nepodarilo načítať. Spustili ste SQL „moderátor 2“?'; }
  MODP.loading = 0; if (UI.view === 'parent') render(null); }
function modPanel() {
  if (!ADMIN) return ''; if (MODP.users == null && !MODP.loading) setTimeout(modPanelLoad, 0);
  const s = MODP.stats || {}; const tile = (v, n, e) => `<div class="mtile"><span>${e}</span><b>${v == null ? '…' : v}</b><small>${n}</small></div>`;
  const tabs = [['users', '👥 Používatelia'], ['gift', '🎁 Darovať Plus'], ['coins', '☀️ Slniečka']].map(([k, n]) => `<button class="${MODP.tab === k ? 'on' : ''}" data-a="modp-tab" data-t="${k}">${n}</button>`).join('');
  let body = '';
  if (MODP.tab === 'users') {
    const q = MODP.q.trim().toLowerCase(); const L = (MODP.users || []).filter(u => !q || (u.email || '').toLowerCase().includes(q));
    const d = x => x ? new Date(x).toLocaleDateString('sk-SK') : '–';
    const badge = u => { const act = u.plus_status === 'active' || u.plus_status === 'trialing'; const live = act && (!u.plus_until || new Date(u.plus_until) > new Date()); return live ? (u.plus_plan === 'gift' ? '<em class="mb g">🎁 darované</em>' : '<em class="mb p">⭐ Plus</em>') : '<em class="mb">zadarmo</em>'; };
    body = `<input class="field" id="modq" type="search" placeholder="Hľadať e-mail…" value="${esc(MODP.q)}" style="width:100%;box-sizing:border-box" oninput="window.bysModQ(this)">
    <p class="muted b" style="margin:6px 0;font-size:.8rem">${MODP.users == null ? 'Načítavam…' : `${L.length} z ${(MODP.users || []).length} rodičov`}</p>
    <div class="mulist">${L.slice(0, 200).map(u => { const gifted = u.plus_plan === 'gift' && u.plus_status === 'active'; return `<div class="murow"><div class="grow"><b>${esc(u.email || '(bez e-mailu)')}</b><small>Registrácia ${d(u.created_at)} · naposledy ${d(u.last_sign_in_at)}</small></div>${badge(u)}<button class="btn small" data-a="${gifted ? 'mod-revoke' : 'modp-gift'}" data-e="${esc(u.email || '')}">${gifted ? 'Zrušiť' : '🎁 Rok'}</button></div>`; }).join('')}</div>`;
  } else if (MODP.tab === 'coins') {
    const kid = DATA.profiles.find(x => x.id === MODP.kid) || P(); MODP.kid = kid.id;
    body = `<p class="b" style="margin:4px 0 8px">Pridaj slniečka dieťaťu v tomto zariadení.</p>
    <div class="mkids">${DATA.profiles.map(x => `<button class="${x.id === kid.id ? 'on' : ''}" data-a="modp-kid" data-id="${x.id}"><span>${avatarSvg(x.av, { crop: 'head' })}</span><b>${esc(x.name)}</b><small>${COIN} ${x.coins || 0}</small></button>`).join('')}</div>
    <div class="mcoins">${[100, 500, 1000, 5000].map(n => `<button class="btn" data-a="modp-coins" data-n="${n}">+${n} ${COIN}</button>`).join('')}</div>
    <div class="mcust"><input class="field" id="modcoins" type="number" inputmode="numeric" min="1" max="100000" placeholder="Vlastný počet"><button class="btn primary" data-a="modp-coins" data-n="custom">Pridať</button></div>
    <button class="linkbtn" data-a="modp-coins" data-n="reset" style="margin-top:6px">Nastaviť na 0</button>
    <h4 style="margin:16px 0 4px;font-family:var(--f-display)">📧 Poslať na iný účet</h4><p class="muted b" style="font-size:.8rem;margin:0 0 6px">Napíšte e-mail rodiča. Slniečka dostane jeho dieťa pri najbližšom otvorení Bystríka.</p>
    <input class="field" id="modcmail" type="email" autocomplete="off" placeholder="email@rodica.sk" style="width:100%;box-sizing:border-box;margin-bottom:8px"><div class="mcust"><input class="field" id="modcamt" type="number" inputmode="numeric" min="1" max="100000" placeholder="Počet slniečok"><button class="btn primary" data-a="modp-send">Poslať</button></div><p class="b" id="modcmsg" style="font-size:.85rem;margin:6px 0 0"></p>`;
  } else body = modCard(true);
  return `<section class="card pcard modcard"><span class="eyebrow">🛡️ Moderátorský účet · máš všetko zadarmo</span>
  <div class="mtiles">${tile(s.users, 'rodičov', '👨‍👩‍👧')}${tile(s.active7, 'aktívnych za 7 dní', '🔥')}${tile(s.new7, 'nových za 7 dní', '✨')}${tile(s.plus, 'platí Plus', '⭐')}${tile(s.gifts, 'darované Plus', '🎁')}</div>
  <div class="mtabs">${tabs}</div>${MODP.err ? `<p class="b" style="color:var(--bad)">${esc(MODP.err)}</p>` : ''}${body}
  <button class="linkbtn" data-a="modp-refresh">↻ Obnoviť</button></section>`;
}
window.bysModQ = el => { MODP.q = el.value; clearTimeout(window._mq); window._mq = setTimeout(() => { const ps = el.selectionStart; render(null); const i = document.getElementById('modq'); if (i) { i.focus(); try { i.setSelectionRange(ps, ps); } catch (e) { } } }, 350); };
ACT['modp-tab'] = d => { MODP.tab = d.t; render(null); };
ACT['modp-kid'] = d => { MODP.kid = d.id; render(null); };
ACT['modp-coins'] = d => { if (!ADMIN) return; const kid = DATA.profiles.find(x => x.id === MODP.kid) || P(); let n;
  if (d.n === 'reset') { kid.coins = 0; save(); toast(`${esc(kid.name)}: 0 slniečok`); render(null); return; }
  if (d.n === 'custom') { n = Math.floor(+(($('#modcoins') || {}).value || 0)); if (!(n > 0 && n <= 100000)) { toast('Napíšte počet od 1 do 100 000'); return; } } else n = +d.n;
  kid.coins = (kid.coins || 0) + n; save(); try { sfx('coin'); } catch (e) { } toast(`☀️ +${n} slniečok pre ${kid.name}`); render(null); };
ACT['modp-refresh'] = () => { MODP.users = null; MODP.stats = null; MOD.list = null; render(null); };
ACT['modp-gift'] = async d => { if (!d.e) return; try { const r = await sb('POST', 'rpc/grant_plus', { target_email: d.e, days: 365 }); toast(r === 'ok' ? `🎁 Plus na rok pre ${d.e}` : 'Účet sa nenašiel'); } catch (x) { toast('Nepodarilo sa'); } MODP.users = null; MODP.stats = null; MOD.list = null; render(null); };

/* ---- Moderátor: darovanie Plus ---- */
let MOD = { list: null, busy: false, msg: '' };
function modCard(inPanel) {
  if (!ADMIN) return ''; if (MOD.list == null && !MOD.loading) { MOD.loading = 1; setTimeout(() => modLoad().finally(() => { MOD.loading = 0; }), 0); }
  const rows = MOD.list == null ? '<p class="muted b" style="margin:0">Načítavam…</p>' : MOD.list.length ? MOD.list.map(g => `<div class="modrow"><span class="grow"><b>${esc(g.email)}</b><small>${g.status === 'active' ? 'do ' + new Date(g.until).toLocaleDateString('sk-SK') : 'zrušené'}</small></span>${g.status === 'active' ? `<button class="btn small" data-a="mod-revoke" data-e="${esc(g.email)}">Zrušiť</button>` : ''}</div>`).join('') : '<p class="muted b" style="margin:0">Zatiaľ si nikomu Plus nedaroval.</p>';
  return `<div class="modgift"><p class="b" style="margin:4px 0 8px">Daruj Bystrík Plus inému rodičovi. Napíš e-mail, ktorým sa prihlasuje v Bystríkovi.</p>
  <input class="field" id="modmail" type="email" inputmode="email" autocapitalize="off" autocomplete="off" placeholder="rodic@email.sk" style="width:100%;box-sizing:border-box">
  <div class="moddays" role="group" aria-label="Na ako dlho">${[[30, '1 mesiac'], [365, '1 rok'], [36500, 'Navždy']].map(([d, n], i) => `<button class="${(MOD.days || 365) === d ? 'on' : ''}" data-a="mod-days" data-d="${d}">${n}</button>`).join('')}</div>
  <button class="btn primary block" data-a="mod-grant" ${MOD.busy ? 'disabled' : ''}>🎁 Darovať Plus</button>${MOD.msg ? `<p class="b" style="margin:6px 0 0">${esc(MOD.msg)}</p>` : ''}
  <span class="eyebrow" style="margin-top:12px">Darované</span><div class="modlist">${rows}</div></div>`;
}
async function modLoad() { if (!ADMIN) return; try { MOD.list = await sb('POST', 'rpc/list_gifts', {}) || []; } catch (e) { MOD.list = []; MOD.msg = 'Zoznam sa nepodarilo načítať. Spustili ste SQL pre moderátora?'; } if (UI.view === 'parent') render(null); }
ACT['mod-days'] = d => { MOD.days = +d.d; render(null); };
ACT['mod-grant'] = async () => { const e = ($('#modmail') || {}).value || ''; if (!/^\S+@\S+\.\S+$/.test(e.trim())) { toast('Napíšte platný e-mail'); return; } MOD.busy = true; MOD.msg = ''; render(null);
  try { const r = await sb('POST', 'rpc/grant_plus', { target_email: e.trim(), days: MOD.days || 365 }); MOD.msg = r === 'ok' ? `✓ Plus darovaný pre ${e.trim()}.` : 'Taký účet v Bystríkovi nie je. Rodič sa musí najprv prihlásiť e-mailom.'; } catch (x) { MOD.msg = 'Nepodarilo sa. Skontrolujte pripojenie alebo SQL pre moderátora.'; }
  MOD.busy = false; MOD.list = null; MODP.users = null; MODP.stats = null; render(null); modLoad(); };
ACT['mod-revoke'] = async d => { try { await sb('POST', 'rpc/revoke_plus', { target_email: d.e }); toast('Plus zrušený'); } catch (x) { toast('Nepodarilo sa zrušiť'); } MOD.list = null; MODP.users = null; MODP.stats = null; render(null); modLoad(); };

/* viditeľná ponuka Plus */
const PLUS_SHOW = () => !isPlus() && !(window.claude && window.claude.use);
function plusBanner() { if (!PLUS_SHOW()) return ''; return `<button class="plban press" data-a="plus-open"><i class="lurays" aria-hidden="true"></i><span class="plbi">⭐</span><span class="grow"><b>Bystrík Plus</b><small>${PLUS_CFG.month || PLUS_CFG.year ? `${PLUS_PRICE.trial} dní zadarmo · od ${(29.99 / 12).toFixed(2).replace('.', ',')} € mesačne` : 'Čítanka, úlohy, súboj, diktát a ďalšie'}</small></span><em>Pozrieť ›</em></button>`; }
/* dieťa vidí len „pre rodičov“ bez ceny – ťuk otvorí rodičovský PIN */
function plusKidBanner(ja) { if (!PLUS_SHOW()) return ''; return `<button class="plban kid ${ja ? 'ja' : ''} press" data-a="plus-parent"><i class="lurays" aria-hidden="true"></i><span class="plbi">⭐</span><span class="grow"><b>Bystrík Plus</b><small>Čítanka, súboj, diktát a ďalšie · ukáž rodičovi</small></span><em>›</em></button>`; }
ACT['plus-parent'] = () => { ACT['parent-open'](); PTAB = 'set'; PSET_WANT = 'Bystrík Plus'; render(null); };
/* občas po ťuknutí v rodičovskom účte ukáže okno s Plus (max raz za 2 dni, raz za spustenie) */
let PLUS_NUDGED = false;
function plusNudge() {
  if (PLUS_NUDGED || !PLUS_SHOW() || UI.view !== 'parent' || !PARENT_OK || document.getElementById('sheetwrap') || (typeof GUIDE !== 'undefined' && GUIDE)) return;
  if (Date.now() - (DATA.plusNudge || 0) < 2 * 864e5 || Math.random() > .25) return;
  PLUS_NUDGED = true; DATA.plusNudge = Date.now(); save();
  const top = PLUS_FEAT.filter(f => f[3] !== 'soon').slice(0, 5).map(([i, n]) => `<li><span>${i}</span>${n}</li>`).join('');
  const w = document.createElement('div'); w.id = 'sheetwrap';
  w.innerHTML = `<div class="scrim" data-a="close-sheet"></div><div class="sheet plnudge" role="dialog" aria-label="Bystrík Plus"><div class="plnh"><i class="lurays" aria-hidden="true"></i>${bearSvg('love')}<div><b>Bystrík Plus</b><small>${PLUS_CFG.month || PLUS_CFG.year ? `Prvých ${PLUS_PRICE.trial} dní zadarmo` : 'Zatiaľ všetko zadarmo – vyskúšajte'}</small></div></div><ul>${top}</ul><button class="btn primary block bigplay" data-a="plus-go">⭐ Pozrieť Bystrík Plus</button><button class="linkbtn" data-a="close-sheet">Teraz nie</button></div>`;
  document.body.appendChild(w); sfx('pop');
}
ACT['plus-go'] = () => { closeSheet(); plusOpen(); };
document.addEventListener('click', e => { if (UI.view === 'parent' && e.target.closest('[data-a]') && !e.target.closest('#sheetwrap')) setTimeout(plusNudge, 600); }, true);
/* dieťa: zamknutá časť – bez ceny a bez ponuky, len „zapína rodič“ */
VIEWS.plusk = ({ w }) => `${topbar('home')}<main class="view"><section class="card pluskid">${bearSvg('wink')}<span class="pkstar">⭐</span><h2>${esc(w || 'Táto časť')}</h2><p class="b">Túto časť zapína rodič v rodičovskom účte. Ukáž mu ju! 🙂</p><button class="btn primary block" data-a="nav" data-v="learn">Späť k učeniu</button></section></main>${nav('learn')}`;
function plusLockCard(what, desc) { return `<section class="card pcard plock"><span class="plk">⭐</span><div class="grow"><b>${what}</b><small>${desc}</small></div><button class="btn small primary" data-a="plus-need" data-w="${what}">Bystrík Plus</button></section>`; }
ACT['plus-need'] = d => plusNeed(d.w || 'Táto funkcia');
function plusNeed(what) { toast(`⭐ ${what} je v Bystrík Plus`); plusOpen(); }

/* ---- pracovné listy na tlač ---- */
function wsTopics(p) {
  const acc = ALL_TOPICS.filter(t => t.g === p.grade && p.topics[t.id] && p.topics[t.id].total >= 3).map(t => ({ t, pct: p.topics[t.id].correct / p.topics[t.id].total })).sort((a, b) => a.pct - b.pct);
  let ids = acc.filter(x => x.pct < .8).slice(0, 4).map(x => x.t.id);
  if (ids.length < 2) ids = ids.concat(shuffle(ALL_TOPICS.filter(t => t.g === p.grade && !ids.includes(t.id) && (t.s === 'mat' || t.s === 'sjl'))).slice(0, 3 - ids.length).map(t => t.id));
  return ids;
}
function wsQuestions(ids, n) {
  const out = [], seen = new Set();
  for (let k = 0; out.length < n && k < n * 8; k++) { const t = TOPIC[ids[k % ids.length]]; let q; try { q = makeQuestion(t, 'quiz'); } catch (e) { continue; } if (!q || seen.has(q.key) || q.html || !q.text) continue; seen.add(q.key); out.push({ t, q }); }
  return out;
}
function wsPrint(ids) {
  const p = P(); if (!hasPlus()) return plusNeed('Pracovný list');
  ids = ids && ids.length ? ids : wsTopics(p); let qs = wsQuestions(ids, 12); if (qs.length < 6) { ids = ids.concat(shuffle(ALL_TOPICS.filter(t => t.g === p.grade && !ids.includes(t.id))).slice(0, 4).map(t => t.id)); qs = wsQuestions(ids, 12); } if (!qs.length) { toast('Na pracovný list zatiaľ nie sú otázky.'); return; }
  const L = 'ABCDEF';
  const body = qs.map(({ q }, i) => `<li><div class="wsq">${q.html ? q.html : esc(q.text)}</div>${q.options && q.options.length ? `<div class="wso">${q.options.map((o, j) => `<span>☐ ${L[j]}) ${esc(String(o))}</span>`).join('')}</div>` : '<div class="wsline"></div>'}</li>`).join('');
  const key = qs.map(({ q }, i) => { const j = q.options ? q.options.findIndex(o => String(o) === String(q.answer)) : -1; return `${i + 1}. ${j >= 0 ? L[j] + ') ' : ''}${esc(String(q.answer))}`; }).join(' · ');
  let w = $('#wsprint'); if (w) w.remove(); w = document.createElement('div'); w.id = 'wsprint';
  w.innerHTML = `<div class="wshead"><b>🧸 Bystrík · Pracovný list</b><span>Meno: ${esc(p.name)} · ${p.grade}. ročník · ${new Date().toLocaleDateString('sk-SK')}</span><small>Témy: ${[...new Set(qs.map(x => x.t.name))].map(esc).join(', ')}</small></div><ol class="wslist">${body}</ol><div class="wskey"><b>Kľúč pre rodiča:</b> ${key}</div>`;
  document.body.appendChild(w); document.documentElement.classList.add('wsmode');
  const done = () => { document.documentElement.classList.remove('wsmode'); w.remove(); window.removeEventListener('afterprint', done); };
  window.addEventListener('afterprint', done); setTimeout(() => { try { window.print(); } catch (e) { done(); } }, 150);
}
function wsCard(p) {
  const ids = wsTopics(p);
  return `<section class="card pcard"><span class="eyebrow">🖨️ Pracovný list na tlač ${isPlus() ? '' : plusFree() ? '<em class="plsoon">zatiaľ zadarmo</em>' : '<em class="plsoon">⭐ Plus</em>'}</span><p class="b" style="font-size:.86rem;margin:4px 0 8px">12 úloh zo slabších tém (${ids.map(id => esc(TOPIC[id].name)).join(', ')}) a kľúč správnych odpovedí. Vytlačíte alebo uložíte ako PDF.</p><button class="btn small primary" data-a="ws-print">🖨️ Vytvoriť pracovný list</button></section>`;
}

Object.assign(ACT, {
  'plus-refresh': async () => { await plusLoad(); render(null); toast(isPlus() ? '⭐ Bystrík Plus je aktívny' : 'Plus zatiaľ nie je aktívny. Ak ste práve zaplatili, skúste o chvíľu.'); },
  'plus-soon': () => toast('Platby spúšťame čoskoro 🧸'),
  'plus-open': () => plusOpen(),
  'ws-print': () => wsPrint()
});
/* návrat zo Stripe: ?plus=ok */
try { if (/[?&]plus=ok/.test(location.search)) { history.replaceState(null, '', location.pathname); setTimeout(async () => { await plusLoad(); if (isPlus()) { toast('⭐ Ďakujeme! Bystrík Plus je aktívny.'); confetti(120); } }, 1500); } } catch (e) { }
setTimeout(() => { if (AUTH) plusLoad(); }, 2500);

/* výber verzie po prihlásení rodiča (raz): Zadarmo alebo Plus */
const PLAN_FREE = ['Všetko učivo pre 1.–4. ročník', 'Všetky hry v lunaparku', 'Šatník, obchod a Bystríkov domček', 'Rebríček a priatelia', 'Rodič: týždenný graf a pravidlá pre dieťa'];
const PLAN_PLUS = ['📖 Čítanka s nahrávaním', '📋 Úlohy pre dieťa a učivo zo školy', '📊 Podrobný prehľad a história', '⚔️ Súboj s kamarátom a 🎧 Diktát', '📸 Moje poznámky a 🖨️ pracovné listy', '⏰ Pripomienka a 📤 týždenný report', `👨‍👩‍👧‍👦 Až ${PLUS_KIDS} detí`, '🧸 AI Bystrík bez kľúča (čoskoro)'];
VIEWS.plan = () => `<main class="view nonav planv"><div class="planhead">${bearSvg('cheer')}<h1>Vyberte si Bystríka</h1><p class="muted b">Kedykoľvek to zmeníte v rodičovskom účte.</p></div>
<section class="card plancard free"><div class="plt"><b>Zadarmo</b><span class="plp">0 €</span></div><ul>${PLAN_FREE.map(x => `<li>${x}</li>`).join('')}</ul><button class="btn block" data-a="plan-free">Pokračovať zadarmo</button></section>
<section class="card plancard plus"><span class="plbadge">⭐ Odporúčame</span><div class="plt"><b>Bystrík Plus</b><span class="plp">${PLUS_PRICE.month}<small> / mesiac</small></span></div><p class="pltrial">Prvých ${PLUS_PRICE.trial} dní zadarmo · zrušíte kedykoľvek</p><p class="plinc">Všetko zo Zadarmo a k tomu:</p><ul>${PLAN_PLUS.map(x => `<li>${x}</li>`).join('')}</ul><button class="btn primary block" data-a="plan-plus" data-k="month">Vyskúšať ${PLUS_PRICE.trial} dní zadarmo</button><button class="linkbtn plyear" data-a="plan-plus" data-k="year">alebo ročne ${PLUS_PRICE.year} (ušetríte 37 %)</button></section>
<p class="muted b" style="text-align:center;font-size:.78rem">Platbu spracúva Stripe. Ponuku vidí len rodič, dieťa nikdy.</p></main>`;
Object.assign(ACT, {
  'plan-free': () => { DATA.planChosen = 'free'; save(); sfx('tap'); boot(); },
  'plan-plus': d => { const u = plusLink(d.k || 'month'); DATA.planChosen = 'plus'; save(); if (u) { sfx('tap'); location.href = u; return; } toast('Bystrík Plus spúšťame čoskoro. Dovtedy máte všetky funkcie zadarmo. 🎉'); sfx('coin'); boot(); }
});

ACT['modp-send'] = async () => { if (!ADMIN) return; const e = (($('#modcmail') || {}).value || '').trim(), n = Math.floor(+(($('#modcamt') || {}).value || 0)), m = $('#modcmsg');
  const msg = t => { if (m) m.textContent = t; };
  if (!/^\S+@\S+\.\S+$/.test(e)) return msg('Napíšte platný e-mail.'); if (!(n > 0 && n <= 100000)) return msg('Počet od 1 do 100 000.');
  msg('⏳ Posielam…'); try { const r = await sb('POST', 'rpc/admin_give_coins', { target_email: e, amount: n }); msg(r === 'ok' ? `✓ ${n} slniečok poslaných pre ${e}.` : r === 'none' ? 'Taký účet v Bystríkovi nie je.' : 'Nepodarilo sa.'); } catch (x) { msg('Nepodarilo sa. Spustili ste SQL 2026-11-slniecka.sql?'); } };
/* darované slniečka od moderátora: vyzdvihnú sa pri načítaní */
async function coinGiftCheck() { try { if (!(SUPA_ON() && AUTH)) return; const n = await sb('POST', 'rpc/claim_coins', {}); if (!(n > 0)) return; const p = P(); if (!p) return; p.coins = (p.coins || 0) + n; p.log.unshift({ t: Date.now(), k: 'gift', id: null, c: n, n: 0 }); save();
  const show = k => { if (document.querySelector('.over') || ['quiz', 'game', 'login', 'onboard'].includes(UI.view)) { if (k < 40) setTimeout(() => show(k + 1), 1000); return; } const o = document.createElement('div'); o.className = 'over'; o.innerHTML = `<div class="card box">${bearSvg('cheer')}<h2>🎁 Darček!</h2><p class="b">Bystrík ti posiela slniečka.</p><div style="font:900 2.6rem var(--f-display)">+${n} ${COIN}</div><button class="btn primary block" data-a="ov-close">Paráda!</button></div>`; document.body.appendChild(o); sfx('level'); try { confetti(140, .3); } catch (e) { } say('Darček! Dostal si ' + n + ' slniečok.'); if (['home', 'me', 'shop'].includes(UI.view)) render(null); };
  show(0); } catch (e) { } }
