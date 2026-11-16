/* ===== Bystrík – reakcie: v kvíze animuje medvedíka dole (peekbear), inde zábavné fakty v hornom pruhu ===== */
const BUDDY_MS = { wink: 1500, wave: 1900, smile: 1600, happy: 900, cheer: 2000, sad: 2300, cry: 2800, yawn: 1500, love: 2200, think: 2200, surprise: 1300, spin: 1000, dance: 2600, peek: 1300, hop: 1200, wiggle: 1300, nod: 1300, shy: 1900, laugh: 1800 };
const BUDDY_ALIAS = { happy: 'bhappy', cheer: 'cheer', spin: 'bspin', dance: 'bdance', hop: 'bhop', wiggle: 'bwiggle', peek: 'bpeek', yawn: 'byawn' };
const BUDDY_IDLE = ['wink', 'wave', 'smile', 'peek', 'wiggle', 'hop', 'nod', 'shy', 'think', 'love'];
const BUDDY_TAP = [['Ahoj! 👋', 'wave'], ['Poď sa učiť! 📚', 'hop'], ['Si šikovný! ⭐', 'wink'], ['Hihi, to šteklí! 😄', 'laugh'], ['Ja som Bystrík! 🧸', 'smile'], ['Dáme kvíz? 🎯', 'nod'], ['Mám ťa rád! 💛', 'love'], ['Ešte jednu úlohu? 💪', 'cheer'], ['Juchú! 🎉', 'spin'], ['Hmm, čo sa naučíme? 🤔', 'think'], ['Tancujeme! 🎶', 'dance'], ['Ojoj, šteklíš ma! 🙈', 'shy']];
const BUDDY_OK = ['Super! ⭐', 'Výborne! 🎉', 'Paráda! 👏', 'Si hviezda! 🌟', 'Presne tak! ✅', 'Wow! 😮'];
const BUDDY_BAD = ['Nevadí, skúsime ďalšiu 💪', 'To nič, učíme sa 🧸', 'Skoro! Nabudúce to dáš 🙂'];
let BUDDYT = null, BUDDYBT = null, BUDDYLAST = Date.now(), BUDDYBAD = 0, BUDDYVIEW = '', BUDDYSAY = 0;
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

/* doplnky pre nálady (slzy, zzz, ?, !, žmurk, smutné ústa, srdiečka) do ľubovoľného medvedíka */
function buddyDecorate(svg) { if (!svg || svg.querySelector('.bx')) return; const head = svg.querySelector('.b-head'); if (head) head.insertAdjacentHTML('beforeend', DECO); }
const DECO = `<g class="bx">
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
  </g>`;
const buddyTarget = () => $('.peekbear svg');
let BUDDYCLS = [];
/* nálada na medvedíkovi v kvíze; text do jeho bubliny */
function buddyMood(m, txt) {
  const svg = buddyTarget(); if (!svg) return false; buddyDecorate(svg);
  svg.classList.remove(...BUDDYCLS); void svg.getBoundingClientRect();
  BUDDYCLS = ['bd-' + m]; if (BUDDY_ALIAS[m]) BUDDYCLS.push(BUDDY_ALIAS[m]); svg.classList.add(...BUDDYCLS);
  if (txt) peekSay(txt, Math.max(1800, txt.length * 70));
  clearTimeout(BUDDYT); BUDDYT = setTimeout(() => svg.classList.remove(...BUDDYCLS), BUDDY_MS[m] || 1500); return true;
}
function buddySayTxt(t) { if (Date.now() - BUDDYSAY < 2500) return; BUDDYSAY = Date.now(); try { say(t.replace(/\p{Extended_Pictographic}|️|‍/gu, '').trim()); } catch (er) { } }
/* zábavný fakt v hornom pruhu s Bystríkom */
let BUDDYFACT = Date.now();
function buddyFact(speak) { BUDDYFACT = Date.now(); const f = pick(BUDDY_FACTS); try { hint('💡 Vedel si? ' + f, !speak); } catch (e) { } }
let BUDDYOK = 0;
function buddyAnswer(ok) {
  if (ok) { BUDDYBAD = 0; BUDDYOK++; if (BUDDYOK % 3 === 0) buddyMood(pick(['dance', 'spin', 'cheer']), BUDDYOK + ' správne za sebou! 🔥'); else buddyMood(pick(['happy', 'wink', 'love', 'hop', 'laugh']), Math.random() < .4 ? pick(BUDDY_OK) : ''); }
  else { BUDDYOK = 0; BUDDYBAD++; buddyMood(BUDDYBAD >= 2 ? 'cry' : 'sad', pick(BUDDY_BAD)); }
}
const BUDDY_QUIET = ['quiz', 'game', 'write', 'reads', 'dict', 'pexeso', 'match', 'sort', 'cards', 'parent', 'pin', 'login', 'onboard', 'getapp', 'remote', 'teacher'];
function buddySync() {
  if (UI.view === BUDDYVIEW) return; const v = UI.view; BUDDYVIEW = v; if (v !== 'quiz') BUDDYOK = 0;
  if (v === 'quiz') setTimeout(() => buddyMood('wave'), 600);
  else if (v === 'result' && UI.params && UI.params.stars >= 1 && Date.now() - BUDDYFACT > 90000 && Math.random() < .5) setTimeout(() => { if (!$('.over')) buddyFact(false); }, 3500);
}
/* raz za čas zábavný fakt (nie v kvíze, hrách, čítaní ani u rodiča) */
setInterval(() => { if (document.hidden || $('.over') || BUDDY_QUIET.includes(UI.view)) return; if (Date.now() - BUDDYFACT > 180000) buddyFact(false); }, 15000);
