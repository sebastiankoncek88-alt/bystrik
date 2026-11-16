/* ===== Bystrík – sprievodca na každej obrazovke (nedá sa zavrieť, reaguje na dieťa) ===== */
const BUDDY_MS = { wink: 1500, wave: 1900, smile: 1600, happy: 900, cheer: 2000, sad: 2300, cry: 2800, yawn: 1500, love: 2200, think: 2200, surprise: 1300, spin: 1000, dance: 2600, peek: 1300, hop: 1200, wiggle: 1300, nod: 1300, shy: 1900, laugh: 1800 };
const BUDDY_ALIAS = { happy: 'bhappy', cheer: 'cheer', spin: 'bspin', dance: 'bdance', hop: 'bhop', wiggle: 'bwiggle', peek: 'bpeek', yawn: 'byawn' };
const BUDDY_IDLE = ['wink', 'wave', 'smile', 'peek', 'wiggle', 'hop', 'nod', 'shy', 'think', 'love'];
const BUDDY_TAP = [['Ahoj! 👋', 'wave'], ['Poď sa učiť! 📚', 'hop'], ['Si šikovný! ⭐', 'wink'], ['Hihi, to šteklí! 😄', 'laugh'], ['Ja som Bystrík! 🧸', 'smile'], ['Dáme kvíz? 🎯', 'nod'], ['Mám ťa rád! 💛', 'love'], ['Ešte jednu úlohu? 💪', 'cheer'], ['Juchú! 🎉', 'spin'], ['Hmm, čo sa naučíme? 🤔', 'think'], ['Tancujeme! 🎶', 'dance'], ['Ojoj, šteklíš ma! 🙈', 'shy']];
const BUDDY_OK = ['Super! ⭐', 'Výborne! 🎉', 'Paráda! 👏', 'Si hviezda! 🌟', 'Presne tak! ✅', 'Wow! 😮'];
const BUDDY_BAD = ['Nevadí, skúsime ďalšiu 💪', 'To nič, učíme sa 🧸', 'Skoro! Nabudúce to dáš 🙂'];
let BUDDYT = null, BUDDYBT = null, BUDDYLAST = Date.now(), BUDDYSLEEP = false, BUDDYBAD = 0, BUDDYVIEW = '', BUDDYSAY = 0;
function buddyEl() {
  let b = document.getElementById('buddy'); if (b) return b;
  b = document.createElement('div'); b.id = 'buddy'; b.setAttribute('role', 'button'); b.setAttribute('aria-label', 'Bystrík, ťukni naňho');
  b.innerHTML = `<span class="bdbub" hidden></span>${bearSvg('buddyb')}`;
  /* doplnky pre nálady: slzy, zzz, otáznik, výkričník, žmurknutie, smutné ústa, srdiečka */
  const head = b.querySelector('.b-head'); if (head) head.insertAdjacentHTML('beforeend', `<g class="bx">
    <path class="bx-wink" d="M73.5 51 Q80 44 86.5 51" stroke="#2E1A14" stroke-width="3.4" fill="none" stroke-linecap="round"/>
    <path class="bx-sad" d="M52 74 Q60 67.5 68 74" stroke="#3A2430" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <g class="bx-laugh"><path d="M50.5 68 Q60 65.5 69.5 68 Q68.5 81 60 81 Q51.5 81 50.5 68Z" fill="#7A2335" stroke="#3A2430" stroke-width="1.8"/><path d="M53.5 76.5 Q60 72.5 66.5 76.5 Q64 80.2 60 80.2 Q56 80.2 53.5 76.5Z" fill="#FF8FA6"/></g>
    <path class="bx-tear t1" d="M36 58 q-3 6 0 8 q3 -2 0 -8z" fill="#6EC3FF" stroke="#2F86C9" stroke-width=".8"/>
    <path class="bx-tear t2" d="M84 58 q-3 6 0 8 q3 -2 0 -8z" fill="#6EC3FF" stroke="#2F86C9" stroke-width=".8"/>
    <text class="bx-z" x="92" y="22" font-size="16" font-weight="900" fill="#7A6CF0">z</text><text class="bx-z z2" x="102" y="10" font-size="12" font-weight="900" fill="#7A6CF0">z</text>
    <text class="bx-q" x="98" y="22" font-size="26" font-weight="900" fill="#4C7BF0">?</text>
    <text class="bx-ex" x="98" y="22" font-size="26" font-weight="900" fill="#FF5A5A">!</text>
    <path class="bx-heart h1" d="M100 40 c-1.6-2.6-5.6-1.5-5 1.5 .5 2.4 5 5 5 5 s4.5-2.6 5-5 c.6-3-3.4-4.1-5-1.5z" fill="#FF5C8A"/>
    <path class="bx-heart h2" d="M18 34 c-1.3-2-4.4-1.2-4 1.2 .4 1.9 4 4 4 4 s3.6-2.1 4-4 c.4-2.4-2.7-3.2-4-1.2z" fill="#FF8FB0"/>
  </g>`);
  b.addEventListener('click', buddyTap);
  document.body.appendChild(b); return b;
}
function buddyBubble(txt, ms = 2400) { const b = buddyEl(), s = b.querySelector('.bdbub'); if (!txt) return; s.textContent = txt; s.hidden = false; s.style.animation = 'none'; void s.offsetWidth; s.style.animation = ''; clearTimeout(BUDDYBT); BUDDYBT = setTimeout(() => { s.hidden = true; }, ms); try { if (typeof emoWalk === 'function') emoWalk(s); } catch (e) { } }
/* nálada: wink, wave, smile, happy, cheer, sad, cry, yawn, love, think, surprise, spin, dance, peek, hop, wiggle, nod, shy, laugh */
function buddyMood(m, txt) {
  const b = buddyEl(), svg = b.querySelector('svg'); if (!svg) return;
  const all = [...Object.keys(BUDDY_MS).map(k => 'bd-' + k), ...Object.values(BUDDY_ALIAS)]; svg.classList.remove(...all); void svg.getBoundingClientRect();
  const cls = ['bd-' + m]; if (BUDDY_ALIAS[m]) cls.push(BUDDY_ALIAS[m]); svg.classList.add(...cls); if (txt) buddyBubble(txt);
  clearTimeout(BUDDYT); BUDDYT = setTimeout(() => svg.classList.remove(...cls), BUDDY_MS[m] || 1500);
}
function buddySleep(on) { const svg = buddyEl().querySelector('svg'); BUDDYSLEEP = on; if (svg) svg.classList.toggle('bd-sleep', on); }
function buddyTap(e) {
  e.stopPropagation(); BUDDYLAST = Date.now();
  if (BUDDYSLEEP) { buddySleep(false); buddyMood('surprise', 'Ááá, som hore! 😳'); sfx('pop'); return; }
  const [t, m] = pick(BUDDY_TAP); buddyMood(m, t); sfx('pop'); buzz(10);
  if (Date.now() - BUDDYSAY > 2500) { BUDDYSAY = Date.now(); try { say(t.replace(/\p{Extended_Pictographic}|️|‍/gu, '').trim()); } catch (er) { } }
}
function buddyAnswer(ok) {
  BUDDYLAST = Date.now(); if (BUDDYSLEEP) buddySleep(false);
  if (ok) { BUDDYBAD = 0; buddyMood(pick(['happy', 'cheer', 'wink', 'spin', 'love', 'hop', 'laugh']), Math.random() < .45 ? pick(BUDDY_OK) : ''); }
  else { BUDDYBAD++; buddyMood(BUDDYBAD >= 2 ? 'cry' : 'sad', Math.random() < .6 ? pick(BUDDY_BAD) : ''); }
}
/* po každom vykreslení: pozícia podľa obrazovky, pozdrav pri zmene obrazovky, nočný spánok */
function buddySync() {
  const b = buddyEl(); const hasNav = !!document.querySelector('nav.nav');
  document.documentElement.classList.toggle('bd-top', !hasNav);
  b.classList.toggle('bd-nohit', ['game', 'write', 'pexeso', 'match', 'sort'].includes(UI.view));
  if (typeof nightOn === 'function' && nightOn()) { if (!BUDDYSLEEP) buddySleep(true); }
  else if (BUDDYSLEEP && Date.now() - BUDDYLAST < 60000) buddySleep(false);
  if (UI.view !== BUDDYVIEW) {
    const v = UI.view; BUDDYVIEW = v;
    const greet = { shop: ['love', 'Pozri, aké pekné veci! 👕'], wardrobe: ['shy', 'Sluší ti to! ✨'], board: ['cheer', 'Poďme na stupne víťazov! 🏆'], games: ['dance', 'Hráme sa! 🎮'], learn: ['nod', 'Čo sa dnes naučíme? 📚'], rewards: ['wink', 'Pozri, čo môžeš získať! 🎁'] }[v];
    if (greet && Math.random() < .55) setTimeout(() => buddyMood(greet[0], greet[1]), 500);
    else if (v === 'result' && UI.params) setTimeout(() => { const s = UI.params.stars; buddyMood(s >= 3 ? 'dance' : s >= 2 ? 'cheer' : s >= 1 ? 'smile' : 'sad', s >= 3 ? 'Dokonalé! 🏆' : s >= 1 ? 'Dobrá práca! 👏' : 'Nabudúce to dáme! 💪'); }, 700);
    else if (Math.random() < .3) setTimeout(() => buddyMood('wave'), 400);
  }
}
/* nečinnosť: občas sa pohne, po 30 s zíva alebo premýšľa, po 90 s zaspí */
setInterval(() => {
  if (document.hidden || !document.getElementById('buddy') || document.querySelector('.over')) return;
  const idle = Date.now() - BUDDYLAST;
  if (BUDDYSLEEP) return;
  if (idle > 90000) { buddySleep(true); return; }
  if (idle > 30000 && Math.random() < .5) { buddyMood(Math.random() < .6 ? 'yawn' : 'think'); return; }
  if (Math.random() < (document.documentElement.classList.contains('lite') ? .25 : .55)) buddyMood(pick(BUDDY_IDLE));
}, 7000);
['pointerdown', 'keydown'].forEach(ev => document.addEventListener(ev, () => { BUDDYLAST = Date.now(); if (BUDDYSLEEP && !(typeof nightOn === 'function' && nightOn())) { buddySleep(false); buddyMood('surprise'); } }, { capture: true, passive: true }));
