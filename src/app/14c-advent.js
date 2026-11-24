/* Adventný stromček: zapne sa sám 1. 12. (celý december). Ukážka: localStorage bystrik.advday = číslo dňa. */
const ADV_ORN = ['⛄', '🔔', '🍪', '🦌', '⭐', '🎅', '🧦', '🍭', '🕯️', '🎁', '🧸', '💡', '❄️', '🎀', '🍬', '🔴', '🧤', '🟢', '🐧', '🟡', '🍫', '🛷', '🔵', '🌟'];
const ADV_GAMES = { 3: ['rocket', '🛷', 'Santove sane', 'Hra · leť so saňami ku hviezdam'], 8: ['balloons', '🎈', 'Vianočné gule', 'Hra · praskni správne gule'], 12: ['simon', '💡', 'Svetielka', 'Hra · zopakuj, ako svietia'], 16: ['fish', '🎣', 'Ľadový rybárik', 'Hra · chyť správnu rybku'], 20: ['run', '🦌', 'Sobí beh', 'Hra · beh zasneženým lesom'] };
const ADV_D6 = { 1: 'n1-mikulas', 3: 'e3-sviatky', 4: 'n4-svati' };
let ADVG = null, ADVNEW = -1;
function advDay() { let o = null; try { o = localStorage.getItem('bystrik.advday'); } catch (e) { } if (o) return Math.max(0, Math.min(31, +o || 0)); const d = new Date(); return d.getMonth() === 11 ? d.getDate() : 0; }
const ADV_ON = () => advDay() > 0;
const advOpen = () => Math.min(24, advDay());
function advState(p) { const y = new Date().getFullYear(); if (!p.adv || p.adv.y !== y) p.adv = { y, done: {}, orn: [], pend: [] }; return p.adv; }
const ADVPLAN = {};
function advPlan(g) {
  if (ADVPLAN[g]) return ADVPLAN[g];
  const cm = (t, s) => CURR[t.id] == null ? (s === 'prv' ? 0 : 3) : CURR[t.id];
  const pool = s => (SUBJECTS[s] ? SUBJECTS[s].topics : []).filter(t => t.g === g && cm(t, s) <= 3 && !SEASONAL[t.id] && t.id !== ADV_D6[g] && TOPIC[t.id] && modeOk(TOPIC[t.id], 'quiz')).sort((a, b) => cm(a, s) - cm(b, s)).map(t => t.id).filter((id, i, a) => a.indexOf(id) === i);
  const L = { mat: pool('mat'), sjl: pool('sjl'), prv: pool('prv') }, ix = { mat: 0, sjl: 0, prv: 0 }, rot = ['mat', 'sjl', 'prv']; let r = 0;
  const next = () => { for (let k = 0; k < 3; k++) { const s = rot[(r + k) % 3]; if (L[s].length) { r = (r + k + 1) % 3; const id = L[s][ix[s] % L[s].length]; ix[s]++; return id; } } return null; };
  const out = [null];
  for (let d = 1; d <= 24; d++) {
    if (d === 24) out.push({ k: 'mix' });
    else if (ADV_GAMES[d]) out.push({ k: 'game', g: ADV_GAMES[d] });
    else if (d === 6 && ADV_D6[g] && TOPIC[ADV_D6[g]]) out.push({ k: 'topic', id: ADV_D6[g] });
    else { const id = next(); out.push(id ? { k: 'topic', id } : { k: 'game', g: ADV_GAMES[12] }); }
  }
  return (ADVPLAN[g] = out);
}
function advInfo(g, d) { const it = advPlan(g)[d]; if (!it) return { i: '🎄', n: '', s: '' };
  if (it.k === 'mix') return { i: '🌟', n: 'Veľký vianočný kvíz', s: 'Mix z celého decembra' };
  if (it.k === 'game') return { i: it.g[1], n: it.g[2], s: it.g[3] };
  const t = TOPIC[it.id]; return { i: t.icon, n: t.name, s: (SUBJECTS[t.s] || {}).name || '' }; }
/* ktorý otvorený, ešte nesplnený deň patrí téme (pre označenie v úli a započítanie) */
function advDayOf(p, id) { if (!ADV_ON()) return 0; const st = advState(p), pl = advPlan(p.grade); for (let d = advOpen(); d >= 1; d--) if (!st.done[d] && pl[d] && pl[d].k === 'topic' && pl[d].id === id) return d; return 0; }
function advTodo(p) { const st = advState(p), o = advOpen(); if (!st.done[o]) return o; for (let d = 1; d <= o; d++) if (!st.done[d]) return d; return 0; }
function advStart(d) {
  const p = P(), st = advState(p); if (!ADV_ON()) return;
  if (d > advOpen()) { hint(`Toto okienko sa otvorí ${d}. decembra. Bystrík sa už teší!`); sfx('no'); return; }
  if (st.done[d]) { hint('Hotovo! Táto ozdoba už je tvoja.'); return; }
  const it = advPlan(p.grade)[d]; const back = { v: 'advent', p: {} }; sfx('tap');
  if (it.k === 'game') { ADVG = { d, t: Date.now() }; return startGame(it.g[0]); }
  if (it.k === 'mix') { const ids = advPlan(p.grade).filter(x => x && x.k === 'topic').map(x => x.id); startQuiz(shuffle(ids.slice()).slice(0, 8), 'quiz', back, { total: 10 }); Q.adv = d; return; }
  startQuiz([it.id], 'quiz', back); Q.adv = d;
}
function advQuizDone(p) { if (!ADV_ON() || !Q || !Q.total) return; const d = Q.adv || (Q.topicIds.length === 1 ? advDayOf(p, Q.topicIds[0]) : 0); if (!d || advState(p).done[d]) return;
  if (Q.correct / Q.total >= .6) advGrant(p, d); else setTimeout(() => hint('Skoro! Na vianočnú ozdobu treba aspoň 3 z 5. Skús to ešte raz!'), 1600); }
function advGameDone(p, gm) { const a = gm.adv; if (!a || !ADV_ON() || advState(p).done[a.d]) return; if (gm.score >= 3) advGrant(p, a.d); else setTimeout(() => hint('Skoro! Na ozdobu treba aspoň 3 body. Skús to ešte raz!'), 1600); }
function advGrant(p, d) { const st = advState(p); st.done[d] = Date.now(); st.pend.push(ADV_ORN[d - 1]); save(); setTimeout(() => advPopup(ADV_ORN[d - 1], 0), 3000); }
function advPopup(e, n) {
  if (document.querySelector('.over') || (typeof PENDING !== 'undefined' && PENDING.length) || UI.view === 'quiz' || UI.view === 'game') { if (n < 60) setTimeout(() => advPopup(e, n + 1), 900); return; }
  const o = document.createElement('div'); o.className = 'over advover';
  o.innerHTML = `<div class="card box advbox"><i class="advsnow" aria-hidden="true"></i><span class="advbig">${e}</span><h2>Získal(a) si ozdobu!</h2><p class="b muted">Zaves ju na svoj stromček, kam chceš.</p><button class="btn primary block" data-a="adv-hang">🎄 Zavesiť na stromček</button><button class="btn block" data-a="ov-close">Neskôr</button></div>`;
  document.body.appendChild(o); sfx('level'); try { confetti(90, .35); } catch (x) { } say('Získal si vianočnú ozdobu! Zaves ju na stromček.');
}
/* stromček (SVG 360 × 400) */
const ADV_S = 1.2, ADV_TY = 334 - 70 * 1.2;
function advOnTree(x, y) { const lx = (x - 180) / ADV_S, ly = (y - ADV_TY) / ADV_S; if (ly < -150 || ly > 56) return false; const w = ly < -80 ? (ly + 170) / 90 * 70 : ly < -10 ? (ly + 80) / 70 * 56 + 40 : (ly + 10) / 66 * 60 + 58; return Math.abs(lx) <= w - 6; }
function advTreeSvg(st, id) {
  const n = st.orn.length; let g = `<g transform="translate(180 ${ADV_TY}) scale(${ADV_S})"><rect x="-12" y="40" width="24" height="30" rx="4" fill="#8A4519"/><path d="M0 -170 L70 -80 L40 -80 L96 -10 L58 -10 L118 58 L-118 58 L-58 -10 L-96 -10 L-40 -80 L-70 -80Z" fill="#1F8A5B"/><path d="M0 -170 L70 -80 L40 -80 L96 -10 L58 -10 L118 58 L0 58Z" fill="#11603D" opacity=".35"/><path d="M-64 -82 Q0 -64 64 -82 M-90 -12 Q0 12 90 -12 M-112 56 Q0 82 112 56" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".9"/>`;
  if (n >= 8) g += '<path d="M-48 -110 Q0 -92 40 -112 M-74 -44 Q0 -20 74 -46 M-98 20 Q0 46 100 18" fill="none" stroke="#FFC233" stroke-width="3" stroke-dasharray="2 6" stroke-linecap="round"/>';
  if (n >= 3) { const c = ['#FFE27A', '#FF8A9B', '#8FE3FF', '#B9FFB0']; [[-56, -70, 56, -70, 8], [-84, 0, 84, 0, 11], [-104, 66, 104, 66, 13]].forEach((r, ri) => { for (let i = 0; i <= r[4]; i++) { const x = r[0] + (r[2] - r[0]) * i / r[4], y = r[1] + Math.sin(i / r[4] * Math.PI) * 14; g += `<circle class="advbulb" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.5" fill="${c[(i + ri) % 4]}" style="animation-delay:${(i % 4) * .3}s"/>`; } }); }
  g += `<text x="0" y="-152" font-size="42" text-anchor="middle" opacity="${n >= 24 ? 1 : .18}">🌟</text></g>`;
  const pres = n >= 15 ? '<text x="236" y="378" font-size="30">🎁</text><text x="270" y="384" font-size="24">🎁</text><text x="104" y="382" font-size="26">🎁</text>' : '';
  const orn = st.orn.map((o, ix) => `<g class="advorn ${ix === ADVNEW ? 'new' : ''}"><line x1="${o.x}" y1="${o.y - 15}" x2="${o.x}" y2="${o.y - 7}" stroke="#FFE27A" stroke-width="1.5"/><text x="${o.x}" y="${o.y + 9}" font-size="22" text-anchor="middle">${o.e}</text></g>`).join('');
  return `<svg ${id ? `id="${id}"` : ''} class="advsvg" viewBox="0 0 360 400" role="img" aria-label="Vianočný stromček, ${n} ozdôb"><defs><radialGradient id="advglow" cx=".5" cy=".55" r=".55"><stop offset="0" stop-color="#FFE9A8" stop-opacity=".35"/><stop offset="1" stop-color="#FFE9A8" stop-opacity="0"/></radialGradient></defs><ellipse cx="180" cy="230" rx="170" ry="190" fill="url(#advglow)"/><ellipse cx="180" cy="388" rx="160" ry="16" fill="#fff" opacity=".85"/>${g}${pres}${orn}</svg>`;
}
const advNext = n => [[3, 'Svetielka'], [8, 'Zlatá reťaz'], [15, 'Darčeky'], [24, 'Zlatá hviezda']].find(x => n < x[0]);
function advCard(p) {
  if (!ADV_ON()) return ''; const st = advState(p), n = st.orn.length, td = advTodo(p), pend = st.pend.length; const inf = td ? advInfo(p.grade, td) : null;
  return `<section class="card advcard press" data-a="nav" data-v="advent"><i class="advlights" aria-hidden="true">${'<b></b>'.repeat(9)}</i><div class="advmini">${advTreeSvg(st)}</div><div class="advtx"><span class="eyebrow">🎄 Môj stromček · ${n}/24</span>${pend ? `<b>Máš ozdobu ${st.pend[0]}!</b><small>Ťukni a zaves ju na stromček.</small><span class="btn small primary advpulse">🎄 Zavesiť</span>` : td ? `<b>${inf.i} ${esc(inf.n)}</b><small>${td === advOpen() ? 'Dnešná vianočná téma' : 'Doháňaš ' + td + '. december'} · odmena ${ADV_ORN[td - 1]}</small><button class="btn small primary" data-a="adv-start" data-d="${td}">▶ Hrať</button>` : `<b>Dnes je hotovo! ✓</b><small>${advOpen() < 24 ? 'Zajtra čaká ďalšia ozdoba.' : 'Stromček je hotový. Veselé Vianoce!'}</small>`}</div></section>`;
}
function advStrip(p) { if (!ADV_ON()) return ''; const st = advState(p), n = Object.keys(st.done).length, td = advTodo(p); return `<button class="card advstrip press" data-a="nav" data-v="advent"><i class="advlights" aria-hidden="true">${'<b></b>'.repeat(9)}</i><span class="advsi">🎄</span><span class="grow"><b>Vianočné témy ${n}/24</b><small>${td ? 'Dnes: ' + esc(advInfo(p.grade, td).n) : 'Dnes máš hotovo ✓'}</small></span><span class="advso">${td ? ADV_ORN[td - 1] : '✓'}</span></button>`; }
VIEWS.advent = () => {
  const p = P(), st = advState(p), n = st.orn.length, o = advOpen(), nx = advNext(n);
  const days = []; for (let d = 1; d <= 24; d++) { const inf = advInfo(p.grade, d), done = !!st.done[d], lock = d > o, now = d === o && !done;
    days.push(`<button class="advday ${done ? 'done' : lock ? 'lock' : now ? 'now' : 'miss'}" data-a="adv-start" data-d="${d}" aria-label="${d}. december, ${esc(inf.n)}${done ? ', hotovo' : lock ? ', zatiaľ zamknuté' : ''}"><span class="add">${d}</span><span class="adi">${lock ? '🔒' : done ? ADV_ORN[d - 1] : inf.i}</span><small>${lock ? '' : esc(inf.n)}</small></button>`); }
  return `${topbar('home')}<main class="view advview"><section class="advstage ${n >= 24 ? 'party' : ''}"><i class="advsky" aria-hidden="true"></i><div class="advhd"><b>🎄 Môj stromček</b><span>${n} ${plural(n, 'ozdoba', 'ozdoby', 'ozdôb')} · ${nx ? nx[1] + ' pri ' + nx[0] : 'hotovo! 🎉'}</span></div>${advTreeSvg(st, 'advsvg')}<span class="advbear">${bearSvg('')}</span>${st.pend.length ? `<div class="advhand" id="advhand" role="button" aria-label="Ozdoba, potiahni ju na stromček">${st.pend[0]}</div><p class="advtip">👆 Potiahni ozdobu na stromček, alebo ťukni na miesto na stromčeku.</p>` : `<p class="advtip">${n ? 'Krásny stromček! Za ďalšiu tému dostaneš novú ozdobu.' : 'Stromček je zatiaľ prázdny. Splň vianočnú tému a získaj prvú ozdobu!'}</p>`}</section>
  <h3 class="pgroup">📅 Vianočné témy</h3><div class="advgrid">${days.join('')}</div><p class="muted b" style="font-size:.82rem;text-align:center">Každý deň sa otvorí nové okienko. Zmeškané môžeš dobehnúť.</p></main>${nav('home')}`;
};
function advHang(x, y) {
  const p = P(), st = advState(p); if (!st.pend.length) return false;
  if (!advOnTree(x, y)) { hint('Daj ozdobu priamo na stromček. 🎄'); sfx('no'); return false; }
  const e = st.pend.shift(); st.orn.push({ e, x: Math.round(x), y: Math.round(y) }); ADVNEW = st.orn.length - 1; save(); sfx('pop'); try { sfx('chest'); } catch (er) { }
  const n = st.orn.length; render(null); setTimeout(() => { ADVNEW = -1; }, 1200);
  const ms = { 3: 'Stromček sa rozsvietil! Pribudli svetielka. ✨', 8: 'Pribudla zlatá reťaz! 🌟', 15: 'Pod stromčekom sú darčeky! 🎁', 24: 'Zlatá hviezda! Veselé Vianoce! 🎄' }[n];
  if (ms) { setTimeout(() => hint(ms), 500); try { confetti(120, .3); } catch (er) { } if (n === 24) try { fireworks(); } catch (er) { } }
  return true;
}
AFTER.advent = () => {
  const sv = $('#advsvg'); if (!sv) return; const toSvg = (x, y) => { const pt = sv.createSVGPoint(); pt.x = x; pt.y = y; return pt.matrixTransform(sv.getScreenCTM().inverse()); };
  sv.addEventListener('click', e => { if (!advState(P()).pend.length) return; const q = toSvg(e.clientX, e.clientY); advHang(q.x, q.y); });
  const h = $('#advhand'); if (!h) return; let sx = 0, sy = 0, drag = false;
  h.addEventListener('pointerdown', e => { drag = true; try { h.setPointerCapture(e.pointerId); } catch (er) { } sx = e.clientX; sy = e.clientY; h.classList.add('drag'); e.preventDefault(); });
  h.addEventListener('pointermove', e => { if (drag) h.style.transform = `translate(${e.clientX - sx}px,${e.clientY - sy}px) scale(1.2)`; });
  const up = () => { if (!drag) return; drag = false; h.classList.remove('drag'); const r = h.getBoundingClientRect(); const q = toSvg(r.left + r.width / 2, r.top + r.height / 2); if (!advHang(q.x, q.y)) h.style.transform = ''; };
  h.addEventListener('pointerup', up); h.addEventListener('pointercancel', () => { drag = false; h.style.transform = ''; h.classList.remove('drag'); });
};
ACT['adv-start'] = d => advStart(+d.d);
ACT['adv-hang'] = () => { document.querySelectorAll('.over').forEach(e => e.remove()); go('advent', {}, 'f'); };
