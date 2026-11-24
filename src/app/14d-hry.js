/* Hry bez učenia: Pexeso a Skákajúci Bystrík + celoobrazovkové odomknutie hry kľúčom */
const PEX_E = ['🐻', '🦊', '🐸', '🐼', '🦄', '🐙', '🍓', '🍉', '🚀', '⚽', '🌈', '🎈', '🐢', '🦋', '🍩', '🎁'];
function pexNew() { const n = { me: 4, e: 6, h: 8, i: 8 }[GM.d] || 6; const em = shuffle(PEX_E.slice()).slice(0, n); GM.pc = shuffle([...em, ...em]).map(e => ({ e, o: 0, ok: 0 })); GM.pf = []; GM.lockIn = false; }
function pexHTML() { const n = GM.pc.length; return `<div class="pexgrid c${n > 12 ? 4 : n > 8 ? 4 : 4}" id="pexgrid">${GM.pc.map((c, i) => `<button class="pexc ${c.o || c.ok ? 'open' : ''} ${c.ok ? 'ok' : ''}" data-a="pex" data-i="${i}" aria-label="${c.o || c.ok ? c.e : 'Karta'}"><span class="pin"><span class="pfr">${c.e}</span><span class="pbk">🐾</span></span></button>`).join('')}</div>`; }
function pexDraw() { const w = $('#pexwrap'); if (w) w.innerHTML = pexHTML(); }
function pexTap(i) {
  if (!GM || GM.ended || GM.lockIn) return; const c = GM.pc[i]; if (!c || c.o || c.ok) return;
  c.o = 1; GM.pf.push(i); sfx('tap'); const el = $(`#pexgrid [data-i="${i}"]`); if (el) el.classList.add('open');
  if (GM.pf.length < 2) return; const [a, b] = GM.pf; GM.pf = [];
  if (GM.pc[a].e === GM.pc[b].e) { GM.pc[a].ok = GM.pc[b].ok = 1; setTimeout(() => { $$(`#pexgrid [data-i="${a}"], #pexgrid [data-i="${b}"]`).forEach(x => x.classList.add('ok')); gHit(true, el); if (GM.pc.every(x => x.ok)) { GM.score += 2; const s = $('#gscore'); if (s) s.textContent = '⭐ ' + GM.score; hint('Všetky páry! +2 ⭐ Ideme ďalej!', true); try { confetti(60, .4); } catch (e) { } GM.lockIn = true; setTimeout(() => { if (!GM || GM.ended) return; pexNew(); pexDraw(); }, 1100); } }, 260); }
  else { GM.lockIn = true; setTimeout(() => { GM.pc[a].o = GM.pc[b].o = 0; $$(`#pexgrid [data-i="${a}"], #pexgrid [data-i="${b}"]`).forEach(x => x.classList.remove('open')); GM.lockIn = false; }, 850); }
}
/* Skákajúci Bystrík */
function jumpSpawn() {
  const area = $('#jarea'); if (!area || !GM || GM.ended) return; const star = Math.random() < .3;
  const o = document.createElement('span'); o.className = 'jobs' + (star ? ' star' : ''); o.textContent = star ? '⭐' : pick(['🌵', '🪨', '🦔', '🍄', '🪵']); o.dataset.k = star ? 's' : 'o';
  o.style.animationDuration = (2.6 * DF().sp) + 's'; o.addEventListener('animationend', () => o.remove()); area.appendChild(o);
}
function jumpTick() {
  if (!GM || GM.ended) return; const b = $('#jbear'); if (!b) return; const br = b.getBoundingClientRect(); const bx1 = br.left + br.width * .34, bx2 = br.right - br.width * .34, bBot = br.bottom - br.height * .08, bTop = br.top + br.height * .2;
  $$('#jarea .jobs').forEach(o => { if (o.dataset.done) return; const r = o.getBoundingClientRect(); const cx = r.left + r.width / 2;
    const overlap = r.right - 6 > bx1 && r.left + 6 < bx2;
    if (o.dataset.k === 's') { if (overlap && r.bottom > bTop && r.top < bBot) { o.dataset.done = 1; o.classList.add('got'); gHit(true, o); } else if (cx < bx1 - 30) o.dataset.done = 1; return; }
    if (overlap && bBot > r.top + 18) { o.dataset.done = 1; o.classList.add('hit'); b.classList.add('ouch'); setTimeout(() => b.classList.remove('ouch'), 500); gHit(false, o); }
    else if (cx < bx1 - 4) { o.dataset.done = 1; GM.score++; const s = $('#gscore'); if (s) s.textContent = '⭐ ' + GM.score; sfx('pop'); } });
}
function jumpGo() { if (!GM || GM.ended) return; const b = $('#jbear'); if (!b || b.classList.contains('up')) return; b.classList.add('up'); sfx('whoosh'); setTimeout(() => b.classList.remove('up'), 800); }
function newGameView() {
  if (GM.k === 'pexeso') return `<p class="deckinfo">Nájdi dvojice rovnakých obrázkov 🃏</p><div id="pexwrap">${pexHTML()}</div>`;
  if (GM.k === 'jump') return `<section class="jarea" id="jarea" data-a="jump" role="button" aria-label="Skoč"><i class="jsky"></i><span class="jcloud c1">☁️</span><span class="jcloud c2">☁️</span><i class="jground"></i><div class="jbear" id="jbear">${bearSvg('')}</div></section><p class="deckinfo">Ťukni kdekoľvek a Bystrík preskočí prekážku. Zbieraj ⭐!</p>`;
  return '';
}
function newGameStart(k) { if (k === 'pexeso') { GM.left = 90; pexNew(); } if (k === 'jump') { GM.left = 60; } }
function newGameAfter() {
  if (GM.k === 'jump') { (GM.jT || []).forEach(x => { clearTimeout(x); clearInterval(x); }); const J = GM.jT = []; const sp = DF().sp; const loop = () => { if (!GM || GM.ended || UI.view !== 'game') return; jumpSpawn(); const x = setTimeout(loop, (1100 + Math.random() * 1100) * sp); J.push(x); TIMERS.push(x); }; const a = setTimeout(loop, 800), b = setInterval(jumpTick, 40); J.push(a, b); TIMERS.push(a, b); }
}
ACT.pex = d => pexTap(+d.i);
ACT.jump = () => jumpGo();
/* odomknutie hry: kľúč priletí, otočí sa v zámke, zámok sa otvorí a odpadne, hra vyskočí */
function unlockAnim(k) {
  const g = GAMES[k]; const ix = Object.keys(GAMES).indexOf(k); const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) { toast('🔓 Hra ' + g.n + ' je odomknutá!'); JUSTUNL = null; return; }
  const o = document.createElement('div'); o.className = 'unlfs'; o.style.setProperty('--bg', LUNABG[ix % LUNABG.length]);
  o.innerHTML = `<i class="unlrays" aria-hidden="true"></i><div class="unlstage"><span class="unlgame">${g.i}</span><svg class="unllock" viewBox="0 0 120 130" aria-hidden="true"><g class="ushk"><path d="M36 60 V40 a24 24 0 0 1 48 0 V60" fill="none" stroke="#C99511" stroke-width="12" stroke-linecap="round"/></g><rect x="22" y="56" width="76" height="62" rx="14" fill="#F8BD3A" stroke="#C99511" stroke-width="4"/><rect x="30" y="62" width="60" height="10" rx="5" fill="#FFE08A" opacity=".7"/><circle cx="60" cy="84" r="8" fill="#7A5300"/><rect x="56.5" y="86" width="7" height="16" rx="3.5" fill="#7A5300"/></svg><span class="unlkey">🗝️</span></div><h2 class="unlt">Odomknuté!</h2><p class="unls">${esc(g.n)}</p><button class="btn primary unlplay" data-a="unl-play" data-g="${k}">▶ Hrať</button><button class="unlx" data-a="unl-close">Neskôr</button>`;
  document.body.appendChild(o); sfx('whoosh');
  setTimeout(() => { sfx('tap'); o.classList.add('turn'); }, 900);
  setTimeout(() => { sfx('coin'); o.classList.add('open'); }, 1500);
  setTimeout(() => { sfx('level'); o.classList.add('done'); try { confetti(140, .35); } catch (e) { } say('Hra ' + g.n + ' je odomknutá!'); }, 2100);
}
ACT['unl-close'] = () => { $$('.unlfs').forEach(e => e.remove()); JUSTUNL = null; };
ACT['unl-play'] = d => { $$('.unlfs').forEach(e => e.remove()); JUSTUNL = null; startGame(d.g); };
