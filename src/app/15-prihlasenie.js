/* ===== Prihlásenie e-mailom (Supabase) – len na webe ===== */
const SUPA = { url: 'https://nxxltcpjdvoxomogzwaj.supabase.co', key: 'sb_publishable_49nPt0wrOCp04qyhoJbn2g_M1BriXDQ' };
const SUPA_ON = () => !!(SUPA.url && SUPA.key && !(window.claude && window.claude.use));
let AUTH = null; try { AUTH = JSON.parse(localStorage.getItem('bystrik.auth') || 'null'); } catch (e) { }
let LOGIN = { mode: 'in', busy: false, msg: '' };
let RECOVER = null, MAGIC = null;
try { if (SUPA_ON() && /access_token=/.test(location.hash) && !/type=recovery/.test(location.hash)) { const q = new URLSearchParams(location.hash.slice(1)); MAGIC = { at: q.get('access_token'), rt: q.get('refresh_token'), exp: Date.now() + (+q.get('expires_in') || 3600) * 1000 }; history.replaceState(null, '', location.pathname + location.search); } } catch (e) { }
try { if (SUPA_ON() && /type=recovery/.test(location.hash) && /access_token=/.test(location.hash)) { const q = new URLSearchParams(location.hash.slice(1)); RECOVER = { at: q.get('access_token'), rt: q.get('refresh_token'), exp: Date.now() + (+q.get('expires_in') || 3600) * 1000 }; history.replaceState(null, '', location.pathname + location.search); } else if (SUPA_ON() && /error_code=/.test(location.hash)) { LOGIN.msg = 'Odkaz na obnovu hesla už neplatí. Požiadajte o nový.'; history.replaceState(null, '', location.pathname + location.search); } } catch (e) { }
try { LOGIN.email = localStorage.getItem('bystrik.lastEmail') || ''; } catch (e) { }
function setAuth(a) { AUTH = a; try { if (a && a.email) localStorage.setItem('bystrik.lastEmail', a.email); if (a) localStorage.setItem('bystrik.auth', JSON.stringify(a)); else localStorage.removeItem('bystrik.auth'); } catch (e) { } }
async function supaAuth(path, body) {
  let r; try { r = await fetch(SUPA.url + '/auth/v1/' + path, { method: 'POST', headers: { apikey: SUPA.key, 'content-type': 'application/json' }, body: JSON.stringify(body) }); } catch (e) { throw { net: true, message: 'Bez pripojenia na internet.' }; }
  let j = {}; try { j = await r.json(); } catch (e) { }
  if (!r.ok) throw { status: r.status, code: j.error_code || '', message: j.msg || j.error_description || j.message || ('HTTP ' + r.status) };
  return j;
}
const authFrom = j => ({ at: j.access_token, rt: j.refresh_token, exp: Date.now() + (j.expires_in || 3600) * 1000, uid: j.user.id, email: j.user.email });
/* obnova prihlásenia: len jedna naraz (inak Supabase označí refresh token za použitý a odhlási), pri chybe servera sa neodhlasuje */
let REFRESHING = null;
async function supaToken() {
  if (!AUTH) throw { message: 'no auth' };
  if (AUTH.exp > Date.now() + 60000) return AUTH.at;
  if (!REFRESHING) REFRESHING = (async () => {
    try { setAuth(authFrom(await supaAuth('token?grant_type=refresh_token', { refresh_token: AUTH.rt }))); }
    catch (e) {
      let saved = null; try { saved = JSON.parse(localStorage.getItem('bystrik.auth') || 'null'); } catch (x) { }
      if (saved && saved.rt && saved.rt !== AUTH.rt) { AUTH = saved; if (AUTH.exp > Date.now() + 60000) return; }
      const dead = !e.net && (e.status === 400 || e.status === 401 || e.status === 403) && /refresh|grant|token|session|not.?found/i.test((e.message || '') + ' ' + (e.code || ''));
      if (dead) { setAuth(null); DBREF = null; go('login', {}, 'u'); }
      throw e;
    } finally { setTimeout(() => { REFRESHING = null; }, 0); }
  })();
  await REFRESHING; if (!AUTH) throw { message: 'no auth' }; return AUTH.at;
}
document.addEventListener('visibilitychange', () => { if (!document.hidden && AUTH && typeof SUPA_ON === 'function' && SUPA_ON()) supaToken().catch(() => { }); });
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
const PRIV_V = '13. 11. 2026';
VIEWS.privacy = () => { const back = !(typeof AUTH !== 'undefined' && AUTH) && SUPA_ON() ? 'priv-back-login' : 'priv-back'; return `<header class="top"><button class="iconbtn press" data-a="${back}" aria-label="Späť">←</button><div class="who"><b>Ochrana súkromia</b><span class="muted b" style="font-size:.8rem">platné od ${PRIV_V}</span></div></header><main class="view nonav privv"><section class="card pcard privtext">
<h2>🔐 Zásady ochrany súkromia</h2><p>Bystrík je vzdelávacia apka pre deti 1.–4. ročníka. Účet zakladá a spravuje <b>rodič alebo zákonný zástupca</b>. Pri deťoch mladších ako 16 rokov spracúvame údaje len so súhlasom rodiča (GDPR čl. 8, zákon č. 18/2018 Z. z.).</p>
<h3>Aké údaje ukladáme</h3><ul><li><b>E-mail rodiča a heslo</b> – na prihlásenie (heslo je uložené zašifrované).</li><li><b>Profil dieťaťa</b> – prezývka, ročník, postavička, pokrok v učení, slniečka a odmeny.</li><li><b>Priatelia a správy</b> – ak ich rodič zapne: kód priateľa a správy medzi deťmi. Rodič vidí celú históriu.</li><li><b>Rebríček</b> – prezývka, ročník a body za týždeň, ak ho rodič nechá zapnutý.</li></ul>
<h3>Čo neukladáme</h3><ul><li>Nahrávky hlasu ani fotky poznámok neodchádzajú na náš server. Spracujú sa len v zariadení (fotku poznámok spracuje AI, ak ju rodič zapne).</li><li>Nepoužívame reklamy ani sledovacie nástroje tretích strán a údaje nepredávame.</li><li>Kľúč pre AI ostáva len v tomto zariadení.</li></ul>
<h3>Kde sú údaje</h3><p>Údaje sú uložené v databázovej službe Supabase a v tomto zariadení. Prenos je šifrovaný (HTTPS). AI odpovede zabezpečuje Google Gemini alebo Anthropic Claude – dostanú len text otázky, nie meno dieťaťa ani e-mail.</p>
<h3>Vaše práva</h3><ul><li>Kedykoľvek si môžete údaje pozrieť, opraviť alebo stiahnuť (Rodičovský účet → Záloha).</li><li>Účet môžete <b>úplne zmazať</b> v Rodičovský účet → Nastavenia → Bezpečnosť a údaje.</li><li>Máte právo podať sťažnosť na Úrad na ochranu osobných údajov SR (dataprotection.gov.sk).</li></ul>
<h3>Bezpečnosť detí</h3><p>Písanie priateľom je predvolene vypnuté. Zapnúť ho môže len rodič za PIN kódom a vidí všetky správy. Priateľa si dieťa pridá len kódom, ktorý mu niekto osobne povie.</p>
</section></main>`; };
VIEWS.login = () => `<main class="view nonav loginv"><div class="loginbear">${bearSvg('')}</div><h1 class="logintitle">${LOGIN.mode === 'in' ? 'Vitaj späť!' : 'Vytvor si účet'}</h1><p class="muted b" style="text-align:center">${LOGIN.mode === 'in' ? 'Prihláste sa e-mailom rodiča. Postup sa uloží a nájdete ho na každom zariadení.' : 'Stačí e-mail rodiča a heslo. Je to zadarmo.'}</p>
<section class="card loginbox"><div class="seg" role="tablist"><button class="${LOGIN.mode === 'in' ? 'on' : ''}" data-a="auth-mode" data-m="in">Prihlásiť sa</button><button class="${LOGIN.mode === 'up' ? 'on' : ''}" data-a="auth-mode" data-m="up">Nový účet</button></div>
<label class="lbl" for="aemail">E-mail</label><input class="field" id="aemail" type="email" inputmode="email" autocomplete="email" autocapitalize="off" placeholder="rodic@email.sk" value="${esc(LOGIN.email || '')}">
<label class="lbl" for="apass">Heslo${LOGIN.mode === 'up' ? ' (aspoň 6 znakov)' : ''}</label><input class="field" id="apass" type="password" autocomplete="${LOGIN.mode === 'in' ? 'current-password' : 'new-password'}" placeholder="••••••">
${LOGIN.mode === 'up' ? `<label class="consent"><input type="checkbox" id="aconsent" ${LOGIN.consent ? 'checked' : ''}><span>Som rodič (zákonný zástupca) a súhlasím so <button type="button" class="linkbtn" data-a="nav" data-v="privacy">zásadami ochrany súkromia</button>.</span></label>` : ''}<p class="loginmsg ${LOGIN.ok ? 'ok' : ''}" id="amsg">${esc(LOGIN.msg)}</p>
<button class="btn primary block" data-a="auth-go" ${LOGIN.busy ? 'disabled' : ''}>${LOGIN.busy ? '⏳ Chvíľku…' : LOGIN.mode === 'in' ? '➡️ Prihlásiť sa' : '✨ Vytvoriť účet'}</button>${LOGIN.mode === 'in' ? '<button class="linkbtn" data-a="auth-forgot">Zabudli ste heslo?</button>' : ''}<div class="duelor" style="text-align:center">alebo</div><button class="btn block" data-a="auth-link" ${LOGIN.busy ? 'disabled' : ''}>✉️ Prihlásiť sa odkazom z e-mailu</button><p class="muted b" style="font-size:.78rem;text-align:center;margin:0">Bez hesla: pošleme vám e-mail a stačí kliknúť na odkaz.</p></section>
<p class="muted b" style="text-align:center;font-size:.8rem">E-mail slúži len na prihlásenie. Nikomu ho nedávame a neposielame reklamu.</p></main>`;
VIEWS.newpass = () => `<main class="view nonav loginv"><div class="loginbear">${bearSvg('')}</div><h1 class="logintitle">Nové heslo</h1><p class="muted b" style="text-align:center">Zadajte nové heslo k svojmu účtu.</p>
<section class="card loginbox"><label class="lbl" for="npass">Nové heslo (aspoň 6 znakov)</label><input class="field" id="npass" type="password" autocomplete="new-password" placeholder="••••••"><p class="loginmsg" id="amsg">${esc(LOGIN.msg)}</p><button class="btn primary block" data-a="auth-newpass" ${LOGIN.busy ? 'disabled' : ''}>${LOGIN.busy ? '⏳ Chvíľku…' : '💾 Uložiť heslo'}</button><button class="linkbtn" data-a="auth-newpass-cancel">Zrušiť</button></section></main>`;
function wkText(p) {
  let q = 0, c = 0, d = 0; for (let i = 0; i < 7; i++) { const x = p.days[daysAgo(i)]; if (x) { d++; q += x.q || 0; c += x.c || 0; } }
  const since = Date.now() - 7 * DAYMS; const ids = [...new Set(p.log.filter(l => l.t >= since && l.id && TOPIC[l.id]).map(l => l.id))].slice(0, 5);
  const weak = ALL_TOPICS.filter(t => p.topics[t.id]?.total >= 5 && p.topics[t.id].correct / p.topics[t.id].total < .7).slice(0, 3);
  return `🧸 Bystrík – týždenný prehľad (${p.name}, ${p.grade}. ročník)\n\n📅 Dni s učením: ${d}/7\n✍️ Odpovede: ${q}\n🎯 Úspešnosť: ${q ? Math.round(c / q * 100) + ' %' : '–'}\n🔥 Séria: ${p.streak.count} ${plural(p.streak.count, 'deň', 'dni', 'dní')}\n⭐ Level: ${levelInfo(p.xp).L}\n${ids.length ? `\n📚 Učil(a) sa: ${ids.map(id => TOPIC[id].name).join(', ')}` : ''}${weak.length ? `\n🔁 Treba precvičiť: ${weak.map(t => t.name).join(', ')}` : ''}\n\nhttps://sebastiankoncek88-alt.github.io/bystrik/`;
}
function weekCard(p) {
  const span = (a, b) => { let q = 0, c = 0, days = 0; for (let i = a; i < b; i++) { const d = p.days[daysAgo(i)]; if (d) { days++; q += d.q || 0; c += d.c || 0; } } return { q, c, days, acc: q ? Math.round(c / q * 100) : null }; };
  const w = span(0, 7), o = span(7, 14); const since = Date.now() - 7 * DAYMS;
  const ids = [...new Set(p.log.filter(l => l.t >= since && l.id && TOPIC[l.id]).map(l => l.id))];
  const tA = ALL_TOPICS.filter(t => p.topics[t.id]?.total >= 5).map(t => ({ t, pct: Math.round(p.topics[t.id].correct / p.topics[t.id].total * 100) }));
  const weak = tA.filter(x => x.pct < 70).sort((a, b) => a.pct - b.pct).slice(0, 3), strong = tA.filter(x => x.pct >= 85 && ids.includes(x.t.id)).slice(0, 3);
  const due = reviewDue(p).length; const diff = w.acc != null && o.acc != null ? w.acc - o.acc : null;
  const tip = !w.days ? 'Tento týždeň sa dieťa ešte neučilo. Skúste si spolu sadnúť na 10 minút, najlepšie každý deň v rovnakom čase.' : w.days < 3 ? 'Pomôže krátko, ale častejšie: 10 minút denne dá viac ako hodina raz za týždeň. Skúste pripomienku v Nastaveniach.' : weak.length ? `Skúste spolu tému „${weak[0].t.name}“. Nech vám dieťa nahlas vysvetlí, ako na odpoveď prišlo.` : due ? `Čaká ${due} ${plural(due, 'otázka', 'otázky', 'otázok')} na zopakovanie. Stačí päť minút na domovskej obrazovke.` : 'Ide to výborne. Pochváľte dieťa a skúste pridať ťažší režim: Test alebo Na čas.';
  return `<section class="card pcard weekcard"><span class="eyebrow">📅 Tento týždeň (posledných 7 dní)</span><div class="wkgrid"><div><b>${w.days}/7</b><span>dní s učením</span></div><div><b>${w.q}</b><span>odpovedí${o.q ? ` (minule ${o.q})` : ''}</span></div><div><b>${(() => { const g = DATA.parent.goal || 2; let n = 0; for (let i = 0; i < 7; i++) { const d = p.days[daysAgo(i)]; if (d && (d.n || 0) >= g) n++; } return n; })()}/7</b><span>dní so splneným cieľom</span></div><div><b>${w.acc == null ? '–' : w.acc + ' %'}</b><span>úspešnosť${diff != null && diff !== 0 ? ` <i class="${diff > 0 ? 'up' : 'dn'}">${diff > 0 ? '▲' : '▼'} ${Math.abs(diff)}</i>` : ''}</span></div></div>
  ${strong.length ? `<p class="wkline"><b>💪 Darí sa:</b> ${strong.map(x => esc(x.t.name)).join(', ')}</p>` : ''}${weak.length ? `<p class="wkline"><b>🔁 Precvičiť:</b> ${weak.map(x => `${esc(x.t.name)} (${x.pct} %)`).join(', ')}</p>` : ''}<p class="wkline"><b>🧠 Opakovanie chýb:</b> ${(p.review || []).length ? `${(p.review || []).length} ${plural((p.review || []).length, 'otázka', 'otázky', 'otázok')} v zásobníku, dnes čaká ${due}` : 'žiadne chyby na opakovanie'}</p><div class="wktip"><b>💡 Tip na tento týždeň</b><p>${tip}</p></div><button class="btn small" data-a="wk-share" style="margin-top:8px">📤 Poslať týždenný report (druhému rodičovi, babke…)</button></section>`;
}
/* Pripomienka na učenie – opakovaná udalosť do kalendára telefónu */
function remindCard() {
  const inClaude = !!(window.claude && window.claude.use); const t = DATA.settings.remind || '17:00';
  return `<section class="card pcard"><span class="eyebrow">⏰ Pripomienka na učenie</span><p class="muted b" style="font-size:.85rem;padding:4px 0">Vyberte čas a pridajte si do kalendára v telefóne udalosť, ktorá sa opakuje každý deň. Telefón vás upozorní aj vtedy, keď je apka zatvorená.</p><div class="chips" style="padding:4px 0">${['15:00', '16:00', '17:00', '18:00', '19:00'].map(x => `<button class="chip ${t === x ? 'on' : ''}" data-a="remind-t" data-t="${x}">${x}</button>`).join('')}</div>${inClaude ? '<p class="b" style="font-size:.85rem">V tejto verzii sa súbor nedá stiahnuť. Nastavte si v telefóne budík alebo otvorte apku na webe.</p>' : `<div class="bkbtns"><button class="btn small primary" data-a="remind-add">📅 Pridať do kalendára (${t})</button></div><p class="muted b" style="font-size:.78rem">Stiahne sa malý súbor. Otvorte ho a potvrďte pridanie do kalendára. Zrušíte ju vymazaním udalosti v kalendári.</p>`}</section>`;
}
let A2HS = null; window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); A2HS = e; if (UI.view === 'settings' || UI.view === 'getapp' || UI.view === 'home') render(null); });
window.addEventListener('appinstalled', () => { try { localStorage.setItem('bystrik.web', '1'); } catch (e) { } if (UI.view === 'getapp') boot(); });
const isStandalone = () => { try { return matchMedia('(display-mode: standalone)').matches || navigator.standalone === true; } catch (e) { return false; } };
function mailCard() {
  const inClaude = !!(window.claude && window.claude.use);
  if (inClaude) return `<h3 class="pgroup">📧 E-mail účet</h3><section class="card mailcard"><span class="pci">📧</span><div class="grow"><b>Prihlásiť e-mail</b><small>Prihlásenie e-mailom funguje vo webovej verzii apky. Tam sa postup ukladá online a máš priateľov aj rebríček.</small><a class="btn small primary" href="https://sebastiankoncek88-alt.github.io/bystrik/" target="_blank" rel="noopener" style="text-decoration:none">🌐 Otvoriť a prihlásiť sa</a></div></section>`;
  if (typeof SUPA_ON !== 'function' || !SUPA_ON()) return '';
  if (!AUTH) return `<h3 class="pgroup">📧 E-mail účet</h3><section class="card mailcard"><span class="pci">📧</span><div class="grow"><b>Prihlásiť e-mail</b><small>Po prihlásení sa postup ukladá online a nájdeš ho na každom zariadení.</small><button class="btn small primary" data-a="auth-login">➡️ Prihlásiť sa e-mailom</button></div></section>`;
  return `<h3 class="pgroup">📧 E-mail účet</h3><section class="card mailcard ok"><span class="pci">✅</span><div class="grow"><b>E-mail je prihlásený</b><small style="word-break:break-all;color:var(--ink);font-weight:800">${esc(AUTH.email || '')}</small><small>Postup sa ukladá online sám. Zmena e-mailu a hesla, iný alebo nový účet a odhlásenie sú v rodičovskom účte.</small><button class="btn small primary" data-a="mail-manage">⚙️ Zmeniť e-mail alebo účet</button></div></section>`;
}
function a2Plat() { const u = navigator.userAgent; const ios = /iphone|ipad|ipod/i.test(u) || (/Macintosh/.test(u) && navigator.maxTouchPoints > 1); if (/FBAN|FBAV|FB_IAB|Instagram|Messenger|Line\/|TikTok/i.test(u)) return 'inapp'; if (ios) return /CriOS|FxiOS|EdgiOS/.test(u) ? 'iosother' : 'ios'; if (/SamsungBrowser/.test(u)) return 'samsung'; if (/Android/i.test(u) && /Firefox/.test(u)) return 'firefox'; if (/Android/i.test(u)) return 'android'; return 'pc'; }
function a2Guide() {
  closeSheet(); const pl = a2Plat();
  const G = {
    ios: ['iPhone / iPad (Safari)', ['Ťukni na <b>Zdieľať</b> ⬆️ v spodnej lište. (V novom iOS najprv ťukni na <b>⋯</b> vpravo dole.)', 'Posuň sa nižšie a zvoľ <b>Pridať na plochu</b> ➕.', 'Vpravo hore ťukni na <b>Pridať</b>.', 'Hotovo! Bystrík je na ploche medzi apkami 🧸']],
    iosother: ['iPhone / iPad', ['Ťukni na <b>Zdieľať</b> ⬆️ vpravo hore v adresnom riadku.', 'Zvoľ <b>Pridať na plochu</b> ➕.', 'Ťukni na <b>Pridať</b>.', 'Ak to tam nie je, otvor odkaz v <b>Safari</b> a skús to tam.']],
    android: ['Android (Chrome)', ['Ťukni na <b>⋮</b> vpravo hore.', 'Zvoľ <b>Pridať na plochu</b> alebo <b>Inštalovať aplikáciu</b>.', 'Potvrď <b>Inštalovať</b>.', 'Hotovo! Bystrík je na ploche 🧸']],
    samsung: ['Samsung Internet', ['Ťukni na <b>☰</b> vpravo dole.', 'Zvoľ <b>Pridať stránku do</b> → <b>Domovská obrazovka</b>.', 'Potvrď <b>Pridať</b>.', 'Hotovo! Bystrík je na ploche 🧸']],
    firefox: ['Android (Firefox)', ['Ťukni na <b>⋮</b>.', 'Zvoľ <b>Pridať na plochu</b> alebo <b>Inštalovať</b>.', 'Potvrď <b>Pridať</b>.', 'Hotovo! Bystrík je na ploche 🧸']],
    inapp: ['Najprv otvor v prehliadači', ['Toto je prehliadač v inej apke (Messenger, Facebook…), tu sa na plochu pridať nedá.', 'Skopíruj odkaz tlačidlom nižšie.', 'Otvor <b>Safari</b> (iPhone) alebo <b>Chrome</b> (Android) a odkaz vlož.', 'Potom znova ťukni na <b>Ako na to?</b>']],
    pc: ['Počítač (Chrome / Edge)', ['V adresnom riadku vpravo klikni na ikonu <b>Inštalovať</b> 🖥️.', 'Alebo v ponuke <b>⋮</b> / <b>⋯</b> zvoľ <b>Inštalovať</b> (Chrome: Prenášanie, ukladanie a zdieľanie).', 'Potvrď <b>Inštalovať</b>.', 'Na mobile otvor tento odkaz v telefóne 📱']]
  }[pl];
  const w = document.createElement('div'); w.id = 'sheetwrap';
  w.innerHTML = `<div class="scrim" data-a="close-sheet"></div><div class="sheet" role="dialog" aria-label="Pridať na plochu"><div class="grab"></div><h2>📲 Bystrík na plochu</h2><p class="muted b" style="font-size:.9rem;margin-bottom:10px">${G[0]}</p><div class="dsteps">${G[1].map((t, i) => `<div><span>${i + 1}</span><p>${t}</p></div>`).join('')}</div>${A2HS ? '<button class="btn primary block" style="margin-top:12px" data-a="install">📲 Pridať na plochu</button>' : ''}<button class="btn block" style="margin-top:10px" data-a="a2copy">🔗 Skopírovať odkaz</button><button class="btn block" style="margin-top:10px" data-a="close-sheet">Rozumiem</button></div>`;
  document.body.appendChild(w);
}
let A2TAB = null;
const A2T = {
  ios: [['Otvor Bystríka v <b>Safari</b> a ťukni na <b>Zdieľať</b> ⬆️ dole. Na novom iOS najprv <b>⋯</b> vpravo dole.', 'share'], ['Posuň ponuku nižšie a ťukni na <b>Pridať na plochu</b>.', 'list'], ['Nechaj zapnuté <b>Otvoriť ako webovú aplikáciu</b> a ťukni na <b>Pridať</b>.', 'add'], ['Hotovo! Bystrík je na ploche a otvára sa na celú obrazovku.', 'home']],
  android: [['Otvor Bystríka v <b>Chrome</b> a ťukni na <b>⋮</b> vpravo hore.', 'dots'], ['Zvoľ <b>Pridať na plochu</b> alebo <b>Inštalovať aplikáciu</b>.', 'amenu'], ['Potvrď <b>Inštalovať</b>.', 'ainst'], ['Hotovo! Bystrík je na ploche a otvára sa na celú obrazovku.', 'home']],
  pc: [['Otvor Bystríka v <b>Chrome</b> alebo <b>Edge</b>.', 'pcbar'], ['V adresnom riadku vpravo klikni na ikonu <b>Inštalovať</b> (alebo ponuka ⋮ → Inštalovať).', 'pcinst'], ['Potvrď <b>Inštalovať</b>, zaškrtni odkaz na ploche.', 'ainst'], ['Hotovo! Bystrík má vlastné okno a ikonu.', 'home']]
};
function a2Mock(k) {
  const bar = (inner, top) => `<div class="mk-bar ${top ? 'top' : ''}">${inner}</div>`, hl = t => `<i class="mk-hl">${t}</i>`, page = '<div class="mk-page"><i></i><i></i><i style="width:60%"></i></div>';
  const ic = '<span class="mk-app me">🧸</span>';
  const M = {
    share: `${bar('<span>bystrik</span>', 1)}${page}${bar(`<span>‹</span><span>›</span>${hl('⬆️')}<span>📖</span><span>⧉</span>`)}`,
    list: `${page}<div class="mk-sheet"><div class="mk-row">📋 Kopírovať</div><div class="mk-row">🔖 Pridať záložku</div>${hl('<span class="mk-row">➕ Pridať na plochu</span>')}<div class="mk-row">🖨️ Tlačiť</div></div>`,
    add: `<div class="mk-dlg"><div class="mk-dh"><span>Zrušiť</span><b>Na plochu</b>${hl('Pridať')}</div><div class="mk-drow">${ic}<span>Bystrík</span></div><div class="mk-drow mkswr"><span>Otvoriť ako webovú apku</span><i class="mk-sw"></i></div></div>`,
    home: `<div class="mk-home"><span class="mk-app">📷</span><span class="mk-app">💬</span><span class="mk-app">🎵</span><span class="mk-app">🗺️</span><span class="mk-app">☀️</span>${ic}<span class="mk-app">📅</span><span class="mk-app">⚙️</span></div><b class="mk-lbl">Bystrík</b>`,
    dots: `${bar(`<span>🏠</span><span class="mk-url">bystrik</span>${hl('⋮')}`, 1)}${page}`,
    amenu: `${bar('<span class="mk-url">bystrik</span><span>⋮</span>', 1)}<div class="mk-menu"><div class="mk-row">🆕 Nová karta</div><div class="mk-row">📜 História</div>${hl('<span class="mk-row">📲 Pridať na plochu</span>')}<div class="mk-row">⚙️ Nastavenia</div></div>`,
    ainst: `${page}<div class="mk-dlg mid"><div class="mk-drow">${ic}<b>Inštalovať aplikáciu?</b></div><div class="mk-btns"><span>Zrušiť</span>${hl('Inštalovať')}</div></div>`,
    pcbar: `<div class="mk-pc">${bar('<span>‹ ›</span><span class="mk-url">sebastiankoncek88-alt.github.io/bystrik</span><span>⋮</span>', 1)}${page}</div>`,
    pcinst: `<div class="mk-pc">${bar(`<span>‹ ›</span><span class="mk-url">…/bystrik</span>${hl('🖥️⬇')}<span>⋮</span>`, 1)}${page}</div>`
  };
  return `<div class="mk ${k.startsWith('pc') ? 'wide' : ''}">${M[k]}</div>`;
}
function pinstCard() {
  if (isStandalone()) return `<section class="card pcard"><p class="b" style="margin:4px 0">✅ Bystrík je na tomto zariadení už pridaný na plochu.</p></section>`;
  const pl = a2Plat(), def = /^ios/.test(pl) ? 'ios' : /android|samsung|firefox/.test(pl) ? 'android' : pl === 'pc' ? 'pc' : 'ios'; const t = A2TAB || def;
  return `<section class="card pcard"><p class="b" style="font-size:.88rem;margin:2px 0 8px">Bystrík bude mať vlastnú ikonku a otvorí sa na celú obrazovku ako bežná apka. Pridajte si ho aj do telefónu dieťaťa.</p><div class="chips" style="padding:0 0 8px">${[['ios', '🍎 iPhone'], ['android', '🤖 Android'], ['pc', '💻 Počítač']].map(([k, n]) => `<button class="chip ${t === k ? 'on' : ''}" data-a="a2tab" data-t="${k}">${n}</button>`).join('')}</div><p class="muted b" style="font-size:.76rem;margin:0 0 4px;text-align:right">posuň do strany ➜</p><div class="a2tut">${A2T[t].map(([txt, m], i) => `<div class="a2step">${a2Mock(m)}<div class="a2txt"><span>${i + 1}</span><p>${txt}</p></div></div>`).join('')}</div>${A2HS ? '<button class="btn primary block" style="margin-top:10px" data-a="install">📲 Pridať na plochu teraz</button>' : ''}<button class="btn small block" style="margin-top:10px" data-a="a2copy">🔗 Skopírovať odkaz na Bystríka</button></section>`;
}
function installCard() {
  if ((window.claude && window.claude.use) || isStandalone()) return '';
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  return `<section class="card instcard"><span class="pci">📲</span><div class="grow"><b>Pridať apku na plochu</b><small>Bystrík bude mať vlastnú ikonku a otvorí sa na celú obrazovku ako bežná apka.</small>${A2HS ? '<button class="btn small primary" data-a="install">📲 Nainštalovať</button>' : '<button class="btn small primary" data-a="a2guide">📲 Ako na to?</button>'}</div></section>`;
}
