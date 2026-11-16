/* ===== Bystrík – sprievodca: na mobile sa vysunie z okraja (najmä v témach), na širokej obrazovke je stále vidno ===== */
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
const BUDDY_FACTS = [
  'Chobotnica má tri srdcia a modrú krv.', 'Medvede vedia vyliezť na strom aj zabehnúť rýchlejšie ako človek.', 'Slimák môže spať aj tri roky.', 'Včela navštívi za deň stovky kvetov.', 'Žirafa má rovnako veľa krčných stavcov ako človek, len sú oveľa dlhšie.',
  'Ťava má v hrbe tuk, nie vodu.', 'Mravec unesie oveľa viac, ako sám váži.', 'Delfíny spia tak, že jedna polovica mozgu odpočíva.', 'Pštros má oko väčšie ako svoj mozog.', 'Kolibrík vie letieť aj dozadu.',
  'Slnko je hviezda a Zem okolo neho obehne za jeden rok.', 'Na Mesiaci sú stopy astronautov, lebo tam nefúka vietor.', 'Mesiac je od Zeme taký ďaleko, že by sme k nemu autom išli niekoľko mesiacov.', 'Na Venuši je deň dlhší ako rok.', 'Saturn by plával vo vode, keby bola dosť veľká vaňa, je ľahší ako voda.',
  'Najvyšší vrch Slovenska je Gerlachovský štít.', 'Dunaj tečie cez desať krajín.', 'Na Slovensku je viac ako šesťtisíc jaskýň.', 'Bratislava leží pri hraniciach s Rakúskom aj Maďarskom.', 'Slovenská vlajka má farby bielu, modrú a červenú.',
  'Najmenšie číslo, ktoré je párne aj prvočíslo, je dva.', 'Nula bola vymyslená oveľa neskôr ako ostatné čísla.', 'Keď sčítaš všetky čísla od jedna do desať, dostaneš päťdesiatpäť.', 'Každé číslo vynásobené nulou je nula.', 'Hodiny majú dvanásť čísel, ale deň má dvadsaťštyri hodín.',
  'Človek má v tele viac ako dvesto kostí.', 'Srdce bije aj vtedy, keď spíš.', 'Najsilnejší sval na tele je žuvací sval.', 'Bábätká majú viac kostí ako dospelí, niektoré sa neskôr spoja.', 'Odtlačok prsta má každý človek iný.',
  'Dúha má sedem farieb.', 'Blesk je teplejší ako povrch Slnka.', 'Voda môže byť ľad, voda aj para.', 'Najväčší oceán na Zemi je Tichý oceán.', 'Snehová vločka má šesť ramien.',
  'Slovo „Bystrík“ znamená niekoho bystrého a šikovného, ako si ty!', 'Slovenská abeceda má viac písmen ako anglická.', 'Najdlhšie slovenské slová majú aj viac ako dvadsať písmen.', 'Anglické slovo „hello“ znamená ahoj.', 'Po anglicky medveď je „bear“.',
  'Strom vie žiť aj stovky rokov.', 'Z jedného semienka môže vyrásť obrovský dub.', 'Rastliny potrebujú svetlo, vodu a vzduch.', 'Ihličnaté stromy sú zelené aj v zime, okrem smrekovca.', 'Huby nie sú rastliny ani zvieratá, sú samostatná skupina.',
  'Mačky spia väčšinu dňa.', 'Psy cítia vône oveľa lepšie ako ľudia.', 'Sova vie otočiť hlavu skoro dookola.', 'Motýle ochutnávajú nohami.', 'Žaba pije vodu cez kožu.'
];
function buddyBubble(txt, ms) { const b = buddyEl(), s = b.querySelector('.bdbub'); if (!txt) return; ms = ms || Math.max(2400, txt.length * 70); s.textContent = txt; s.hidden = false; s.style.animation = 'none'; void s.offsetWidth; s.style.animation = ''; clearTimeout(BUDDYBT); BUDDYBT = setTimeout(() => { s.hidden = true; }, ms); try { if (typeof emoWalk === 'function') emoWalk(s); } catch (e) { } buddyShow(ms + 600); }
const buddyWide = () => matchMedia('(min-width: 900px) and (hover: hover)').matches;
let BUDDYHT = null;
/* vysunutie z okraja; na širokej obrazovke ostáva */
function buddyShow(ms = 3000) { const b = buddyEl(); b.classList.add('bd-show'); clearTimeout(BUDDYHT); if (!buddyWide()) BUDDYHT = setTimeout(() => { if (!b.matches(':hover')) b.classList.remove('bd-show'); }, ms); }
/* nálada: wink, wave, smile, happy, cheer, sad, cry, yawn, love, think, surprise, spin, dance, peek, hop, wiggle, nod, shy, laugh */
function buddyMood(m, txt) {
  const b = buddyEl(), svg = b.querySelector('svg'); if (!svg) return;
  const all = [...Object.keys(BUDDY_MS).map(k => 'bd-' + k), ...Object.values(BUDDY_ALIAS)]; svg.classList.remove(...all); void svg.getBoundingClientRect();
  const cls = ['bd-' + m]; if (BUDDY_ALIAS[m]) cls.push(BUDDY_ALIAS[m]); setTimeout(() => svg.classList.add(...cls), 260); if (txt) buddyBubble(txt);
  buddyShow((BUDDY_MS[m] || 1500) + 1800);
  clearTimeout(BUDDYT); BUDDYT = setTimeout(() => svg.classList.remove(...cls), (BUDDY_MS[m] || 1500) + 260);
}
function buddySleep(on) { const svg = buddyEl().querySelector('svg'); BUDDYSLEEP = on; if (svg) svg.classList.toggle('bd-sleep', on); }
function buddySayTxt(t) { if (Date.now() - BUDDYSAY < 2500) return; BUDDYSAY = Date.now(); try { say(t.replace(/\p{Extended_Pictographic}|️|‍/gu, '').trim()); } catch (er) { } }
/* zábavný fakt: Bystrík sa vysunie, povie ho a prečíta nahlas */
function buddyFact(speak = true) { const f = pick(BUDDY_FACTS); buddyMood('think', '💡 Vedel si? ' + f); if (speak) buddySayTxt('Vedel si? ' + f); BUDDYFACT = Date.now(); }
let BUDDYFACT = Date.now();
function buddyTap(e) {
  e.stopPropagation(); BUDDYLAST = Date.now();
  if (BUDDYSLEEP) { buddySleep(false); buddyMood('surprise', 'Ááá, som hore! 😳'); sfx('pop'); return; }
  sfx('pop'); buzz(10);
  if (Math.random() < .45) return buddyFact(true);
  const [t, m] = pick(BUDDY_TAP); buddyMood(m, t); buddySayTxt(t);
}
let BUDDYOK = 0;
function buddyAnswer(ok) {
  BUDDYLAST = Date.now(); if (BUDDYSLEEP) buddySleep(false);
  if (ok) { BUDDYBAD = 0; BUDDYOK++; if (BUDDYOK % 3 === 0) buddyMood(pick(['dance', 'spin', 'cheer']), BUDDYOK + ' správne za sebou! 🔥'); else if (Math.random() < .5) buddyMood(pick(['happy', 'wink', 'love', 'hop', 'laugh']), Math.random() < .5 ? pick(BUDDY_OK) : ''); }
  else { BUDDYOK = 0; BUDDYBAD++; buddyMood(BUDDYBAD >= 2 ? 'cry' : 'sad', pick(BUDDY_BAD)); }
}
const BUDDY_LEARN = ['quiz', 'subject', 'learn', 'cards', 'result', 'reads', 'dict'];
/* po každom vykreslení: na širokej obrazovke stále vidno, pozdrav v témach, nočný spánok */
function buddySync() {
  const b = buddyEl(); const wide = buddyWide(); b.classList.toggle('bd-pin', wide); if (wide) b.classList.add('bd-show');
  b.classList.toggle('bd-nohit', ['game', 'write', 'pexeso', 'match', 'sort'].includes(UI.view));
  document.documentElement.classList.toggle('bd-nonav', !document.querySelector('nav.nav'));
  if (typeof nightOn === 'function' && nightOn()) { if (!BUDDYSLEEP) buddySleep(true); } else if (BUDDYSLEEP && Date.now() - BUDDYLAST < 60000) buddySleep(false);
  if (UI.view !== BUDDYVIEW) {
    const v = UI.view; BUDDYVIEW = v; if (v !== 'quiz') BUDDYOK = 0;
    if (v === 'subject' && Math.random() < .6) setTimeout(() => buddyMood('wave', pick(['Vyber si tému, idem s tebou! 📚', 'Témy dňa majú dvojnásobné body! 🌟', 'Za zvládnutú tému je odmena! 🎁'])), 600);
    else if (v === 'quiz') setTimeout(() => buddyMood('nod', pick(['Ideme na to! 💪', 'Verím ti! ⭐', 'Čítaj pozorne 👀'])), 500);
    else if (v === 'result' && UI.params) setTimeout(() => { const s = UI.params.stars; buddyMood(s >= 3 ? 'dance' : s >= 2 ? 'cheer' : s >= 1 ? 'smile' : 'sad', s >= 3 ? 'Dokonalé! 🏆' : s >= 1 ? 'Dobrá práca! 👏' : 'Nabudúce to dáme! 💪'); if (s >= 1 && Math.random() < .5) setTimeout(() => buddyFact(false), 3800); }, 900);
    else if (BUDDY_LEARN.includes(v) && Date.now() - BUDDYFACT > 60000 && Math.random() < .5) setTimeout(() => buddyFact(false), 1200);
    else if (wide && Math.random() < .3) setTimeout(() => buddyMood('wave'), 400);
  }
}
/* občas sa sám objaví: na širokej obrazovke sa hýbe, na mobile raz za čas vykukne so zábavným faktom */
setInterval(() => {
  if (document.hidden || !document.getElementById('buddy') || document.querySelector('.over')) return;
  const idle = Date.now() - BUDDYLAST, wide = buddyWide(), quiet = ['quiz', 'game', 'write', 'reads', 'dict', 'pexeso', 'match', 'sort'].includes(UI.view);
  if (BUDDYSLEEP) return;
  if (wide) { if (idle > 90000) { buddySleep(true); return; } if (idle > 30000 && Math.random() < .5) { buddyMood(Math.random() < .6 ? 'yawn' : 'think'); return; } if (Math.random() < .5) buddyMood(pick(BUDDY_IDLE)); }
  if (!quiet && Date.now() - BUDDYFACT > 150000 && idle < 60000) { buddyFact(Date.now() - BUDDYSAY > 180000); return; }
  if (!wide && !quiet && Math.random() < .06) buddyMood(pick(['peek', 'wave', 'wink']));
}, 8000);
['pointerdown', 'keydown'].forEach(ev => document.addEventListener(ev, () => { BUDDYLAST = Date.now(); if (BUDDYSLEEP && !(typeof nightOn === 'function' && nightOn())) { buddySleep(false); if (buddyWide()) buddyMood('surprise'); } }, { capture: true, passive: true }));
