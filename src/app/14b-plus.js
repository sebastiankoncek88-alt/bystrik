/* ===== Bystrík Plus (len pre rodiča; dieťa nikdy nevidí ponuku na platenie) ===== */
/* Stripe Payment Links – verejné odkazy z Stripe Dashboard → Payment links. Kým sú prázdne, tlačidlá ukážu „čoskoro“. */
const PLUS_CFG = { month: '', year: '', teacher: '', portal: '' };
const PLUS_PRICE = { month: '3,99 €', year: '29,99 €', teacher: '49 €', trial: 7 };
const FREE_KIDS = 2, PLUS_KIDS = 5;
let PLUS = null; try { PLUS = JSON.parse(localStorage.getItem('bystrik.plus') || 'null'); } catch (e) { }
const isPlus = () => !!(PLUS && ['active', 'trialing'].includes(PLUS.status) && (!PLUS.until || new Date(PLUS.until).getTime() > Date.now()));
/* kým nie sú spustené platby, Plus výhody sú pre všetkých zadarmo (nič sa nezamkne) */
const plusFree = () => !PLUS_CFG.month && !PLUS_CFG.year;
const hasPlus = () => isPlus() || plusFree();
async function plusLoad() {
  if (!SUPA_ON() || !AUTH || !AUTH.uid) return;
  try { const r = await sb('GET', 'plus?select=status,plan,current_period_end&user_id=eq.' + AUTH.uid); const x = r && r[0]; PLUS = x ? { status: x.status, plan: x.plan, until: x.current_period_end, at: Date.now() } : null; try { localStorage.setItem('bystrik.plus', JSON.stringify(PLUS)); } catch (e) { } } catch (e) { /* tabuľka ešte neexistuje alebo offline */ }
}
function plusLink(k) { const u = PLUS_CFG[k]; if (!u) return ''; const q = new URLSearchParams(); if (AUTH && AUTH.uid) q.set('client_reference_id', AUTH.uid); if (AUTH && AUTH.email) q.set('prefilled_email', AUTH.email); return u + (u.includes('?') ? '&' : '?') + q.toString(); }
const PLUS_FEAT = [
  ['🧸', 'AI Bystrík bez kľúča', 'Vysvetlí chybu, odpovie na otázku a dá sa s ním rozprávať hlasom.', 'soon'],
  ['📧', 'Týždenný e-mail', 'Každý týždeň súhrn: čo dieťa robilo a čo precvičiť.', 'soon'],
  ['🖨️', 'Pracovné listy na tlač', 'Vygenerované zo slabých tém dieťaťa, s kľúčom správnych odpovedí.', 'ws'],
  ['📖', 'Čítanka s hodnotením', 'Bystrík vypočuje čítanie a ukáže plynulosť a chyby.', 'soon'],
  ['👨‍👩‍👧‍👦', `Až ${PLUS_KIDS} detí v jednom účte`, `Zadarmo ${FREE_KIDS} deti. Synchronizácia na všetkých zariadeniach rodiny.`, 'kids'],
  ['👕', 'Mesačná kolekcia oblečenia', 'Nové veci pre postavičku aj Bystríka. Len vzhľad, bez výhody v rebríčku.', 'soon'],
  ['🎮', 'Nové hry v lunaparku', 'Raketa, Rybárik, Pekáreň a ďalšie hry s učivom každý mesiac.', 'soon'],
  ['📚', 'Viac učiva', 'Logika, angličtina navyše a príprava na previerky pre 1.–4. ročník.', 'soon'],
  ['🏝️', 'Nové svety izby a doplnky pre Bystríka', 'Vesmír, more, hrad, čiapky a pelech pre medvedíka.', 'soon'],
  ['🎧', 'Nahrávky čítania na každom zariadení', 'Dieťa pošle nahrávku a vy si ju vypočujete aj na svojom telefóne.', 'rec'],
  ['📊', 'Podrobný prehľad', 'Grafy, silné a slabé témy, pokrok v predmetoch a história učenia.', 'stats'],
  ['📸', 'Moje poznámky', 'Dieťa odfotí zošit a Bystrík z neho spraví kvíz.', 'notes'],
  ['⏰', 'Rozvrh a pripomienky', 'Nastavte čas na učenie, Bystrík sa sám pripomenie.', 'soon'],
  ['🏫', 'Licencia pre triedu', 'Pre učiteľov: celá trieda a export výsledkov žiakov.', 'soon']
];
/* karta v rodičovskom účte */
function plusCard() {
  if (window.claude && window.claude.use) return `<section class="card pcard"><p class="b" style="margin:4px 0">Bystrík Plus sa dá aktivovať vo webovej verzii apky.</p></section>`;
  const on = isPlus(), any = PLUS_CFG.month || PLUS_CFG.year;
  const feats = PLUS_FEAT.map(([i, n, d, k]) => `<div class="plf"><span class="pli">${i}</span><span class="grow"><b>${n}${k === 'soon' ? ' <em class="plsoon">čoskoro</em>' : ''}</b><small>${d}</small></span></div>`).join('');
  if (on) return `<section class="card pcard plcard on"><div class="plhead"><span class="plbadge">⭐ Plus</span><b>Bystrík Plus je aktívny</b><small>${PLUS.status === 'trialing' ? 'Skúšobné obdobie' : PLUS.plan === 'year' ? 'Ročné predplatné' : 'Mesačné predplatné'}${PLUS.until ? ' · do ' + new Date(PLUS.until).toLocaleDateString('sk-SK') : ''}</small></div>${feats}<div class="rowbtns">${PLUS_CFG.portal ? `<a class="btn small" href="${PLUS_CFG.portal}" target="_blank" rel="noopener" style="text-decoration:none">⚙️ Spravovať predplatné</a>` : ''}<button class="btn small" data-a="plus-refresh">🔄 Obnoviť stav</button></div></section>`;
  return `<section class="card pcard plcard"><div class="plhead"><span class="plbadge">⭐ Plus</span><b>Bystrík Plus</b><small>Celé učenie ostáva zadarmo. Plus pridáva veci pre rodičov a podporuje ďalší vývoj Bystríka.</small></div>${feats}
  <div class="plprices"><a class="plprice ${PLUS_CFG.year ? '' : 'off'}" ${PLUS_CFG.year ? `href="${plusLink('year')}" target="_blank" rel="noopener"` : 'data-a="plus-soon"'}><em>výhodnejšie</em><b>${PLUS_PRICE.year}</b><small>ročne · ${(29.99 / 12).toFixed(2).replace('.', ',')} € mesačne</small></a><a class="plprice ${PLUS_CFG.month ? '' : 'off'}" ${PLUS_CFG.month ? `href="${plusLink('month')}" target="_blank" rel="noopener"` : 'data-a="plus-soon"'}><b>${PLUS_PRICE.month}</b><small>mesačne</small></a></div>
  <p class="muted b" style="font-size:.8rem;margin:6px 0 0;text-align:center">${any ? `Prvých ${PLUS_PRICE.trial} dní zadarmo. Zrušiť sa dá kedykoľvek.` : 'Platby spúšťame čoskoro. Dovtedy sú pracovné listy a viac detí zadarmo. 🧸'}</p>
  ${PLUS_CFG.teacher ? `<a class="btn small block" style="margin-top:8px;text-decoration:none" href="${plusLink('teacher')}" target="_blank" rel="noopener">🏫 Licencia pre triedu · ${PLUS_PRICE.teacher} ročne</a>` : ''}
  ${AUTH ? '<button class="linkbtn" data-a="plus-refresh" style="margin-top:4px">Už som zaplatil(a) – obnoviť stav</button>' : '<p class="muted b" style="font-size:.78rem;text-align:center">Na aktiváciu sa najprv prihláste e-mailom (Účet a AI).</p>'}</section>`;
}
/* otvorí Plus kartu v rodičovských nastaveniach (len z rodičovskej časti) */
function plusOpen() { if (UI.view !== 'parent') return; PTAB = 'set'; PSET_WANT = 'Bystrík Plus'; render(null); scrollTo({ top: 0 }); }
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
