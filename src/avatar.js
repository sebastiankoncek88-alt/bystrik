/* ===== Avatar – farby ===== */
const SKIN = ['#FFE3C7', '#F7CBA4', '#E6AC80', '#C98A5C', '#94603F', '#62402B'];
const PAL = [
  { id: 'ruzova', n: 'Ružová', c: '#FFB3CF' }, { id: 'cervena', n: 'Červená', c: '#FF5A5F' }, { id: 'oranzova', n: 'Oranžová', c: '#FF9F45' }, { id: 'zlta', n: 'Žltá', c: '#FFD84D' },
  { id: 'limetkova', n: 'Limetková', c: '#B8E35A' }, { id: 'zelena', n: 'Zelená', c: '#3CC47C' }, { id: 'mata', n: 'Mätová', c: '#86E3C9' }, { id: 'tyrkys', n: 'Tyrkysová', c: '#2EC4D6' },
  { id: 'svmodra', n: 'Svetlomodrá', c: '#9CC9FF' }, { id: 'modra', n: 'Modrá', c: '#4D8DFF' }, { id: 'tmmodra', n: 'Tmavomodrá', c: '#2C3566' }, { id: 'levandula', n: 'Levanduľová', c: '#C9B5FF' },
  { id: 'fialova', n: 'Fialová', c: '#9B6BFF' }, { id: 'hneda', n: 'Hnedá', c: '#9A6B4B' }, { id: 'bezova', n: 'Béžová', c: '#EAD5B7' }, { id: 'siva', n: 'Sivá', c: '#9AA3B8' },
  { id: 'cierna', n: 'Čierna', c: '#2A2A35' }, { id: 'biela', n: 'Biela', c: '#FFFFFF' },
  { id: 'zlata', n: 'Zlatá', c: '#F2B705', lvl: 16 }, { id: 'duha', n: 'Dúhová', c: 'RAINBOW', streak: 5, g: 'd' }, { id: 'neon', n: 'Neónová', c: '#3BE36A', streak: 5, g: 'c' }
];
const HAIRC = [
  { id: 'hneda', n: 'Hnedé', c: '#6B4226' }, { id: 'tmhneda', n: 'Tmavohnedé', c: '#3E2A1E' }, { id: 'cierna', n: 'Čierne', c: '#2B2230' }, { id: 'blond', n: 'Blond', c: '#E8C468' }, { id: 'svblond', n: 'Svetlé blond', c: '#F5E3A6' }, { id: 'rysava', n: 'Ryšavé', c: '#C8582B' },
  { id: 'ruzova', n: 'Ružové', c: '#FF7EB6', lvl: 5 }, { id: 'modra', n: 'Modré', c: '#4D8DFF', lvl: 6 }, { id: 'fialova', n: 'Fialové', c: '#9B6BFF', lvl: 8 }, { id: 'zelena', n: 'Zelené', c: '#2FC08A', lvl: 10 },
  { id: 'mata', n: 'Mätové', c: '#7FE0C6', lvl: 12 }, { id: 'strieborna', n: 'Strieborné', c: '#C9CED9', lvl: 14 }, { id: 'duha', n: 'Dúhové', c: 'RAINBOW', streak: 5, g: 'd' }, { id: 'ohnive', n: 'Ohnivé', c: '#FF4A1C', streak: 5, g: 'c' }
];
const BGC = ['#CFE4FF', '#FFE1C9', '#D9F5E3', '#FFE0EC', '#E9E0FF', '#FFF2B8', '#D4F4F7', '#F3F3F7'].map((c, i) => ({ id: 'g' + i, c }));

/* ===== Katalóg ===== */
const CATALOG = {
  hair: [
    { id: 'kratke', n: 'Krátke', g: 'c' }, { id: 'strapate', n: 'Strapaté', g: 'c' }, { id: 'jezko', n: 'Ježko', g: 'c' }, { id: 'patka', n: 'S patkou', g: 'c' }, { id: 'miska', n: 'Mikádo', g: 'c' }, { id: 'vlnkyk', n: 'Vlnité', g: 'c' },
    { id: 'bokom', n: 'Ofina nabok', g: 'c' }, { id: 'afro', n: 'Afro', g: 'c' }, { id: 'kucery', n: 'Kučery', g: 'c', lvl: 3 }, { id: 'surfer', n: 'Dlhšie', g: 'c', lvl: 6 }, { id: 'cirok', n: 'Čírka', g: 'c', lvl: 9 }, { id: 'samuraj', n: 'Samurajský drdol', g: 'c', lvl: 13 },
    { id: 'dlhe', n: 'Dlhé rovné', g: 'd' }, { id: 'vlny', n: 'Dlhé vlnité', g: 'd' }, { id: 'vrkoce', n: 'Copíky', g: 'd' }, { id: 'chvost', n: 'Chvost', g: 'd' }, { id: 'ofina', n: 'Mikádo', g: 'd' }, { id: 'drdol', n: 'Drdol', g: 'd' },
    { id: 'pixie', n: 'Krátke s ofinou', g: 'd' }, { id: 'bocny', n: 'Chvost nabok', g: 'd' }, { id: 'dva', n: 'Dva drdoly', g: 'd', lvl: 3 }, { id: 'vrkoc', n: 'Vrkoč', g: 'd', lvl: 4 }, { id: 'kuceryd', n: 'Dlhé kučery', g: 'd', lvl: 7 }, { id: 'vysoky', n: 'Vysoký chvost', g: 'd', lvl: 13 }, { id: 'venec', n: 'Venček z vrkoča', g: 'd', lvl: 16 }, { id: 'princ', n: 'Princeznovský', g: 'd', lvl: 19 }
  ],
  eyes: [{ id: 'bodky', n: 'Bodky' }, { id: 'velke', n: 'Veľké' }, { id: 'stastne', n: 'Šťastné', lvl: 2 }, { id: 'mrk', n: 'Žmurk', lvl: 6 }, { id: 'hviezdy', n: 'Hviezdičky', lvl: 11 }, { id: 'srdce', n: 'Srdiečka', lvl: 13 }],
  mouth: [{ id: 'usmev', n: 'Úsmev' }, { id: 'smiech', n: 'Smiech' }, { id: 'o', n: 'Údiv', lvl: 3 }, { id: 'jazyk', n: 'Jazýček', lvl: 5 }, { id: 'zuby', n: 'Zúbky', lvl: 8 }],
  top: [
    { id: 'tricko', n: 'Tričko' }, { id: 'pruhy', n: 'Pruhované' }, { id: 'hviezda', n: 'S hviezdou' }, { id: 'mikina', n: 'Mikina' }, { id: 'sveter', n: 'Sveter' }, { id: 'saty', n: 'Šaty' },
    { id: 'kosela', n: 'Košeľa', lvl: 4 }, { id: 'dres', n: 'Dres', lvl: 6 }, { id: 'bunda', n: 'Bunda', lvl: 7 }, { id: 'super', n: 'Superhrdina', lvl: 10 }, { id: 'princezna', n: 'Plesové šaty', lvl: 12, g: 'd' }, { id: 'rytier', n: 'Rytier', lvl: 12, g: 'c' }, { id: 'kuzelnik', n: 'Kúzelník', lvl: 14 }, { id: 'astronaut', n: 'Astronaut', lvl: 19 },
    { id: 'overal', n: 'Montérky' }, { id: 'pyzamo', n: 'Pyžamo s hviezdami', price: 80 }, { id: 'ninja', n: 'Ninja', price: 250 }, { id: 'kral', n: 'Kráľovský plášť', price: 350 }, { id: 'tdino', n: 'Tričko s dinom', price: 50 }, { id: 'tsrdce', n: 'Tričko so srdcom', price: 50 }, { id: 'tfutbal', n: 'Futbalové tričko', price: 60 }, { id: 'traketa', n: 'Tričko s raketou', price: 60 }, { id: 'tjednorozec', n: 'Tričko s jednorožcom', price: 70 }
  ],
  bottom: [{ id: 'nohavice', n: 'Nohavice' }, { id: 'riflove', n: 'Rifle' }, { id: 'kratasy', n: 'Kraťasy' }, { id: 'sukna', n: 'Sukňa' }, { id: 'leginy', n: 'Legíny' }, { id: 'teplaky', n: 'Tepláky', lvl: 3 }, { id: 'tutu', n: 'Tutu sukňa', lvl: 9, g: 'd' }, { id: 'kapsace', n: 'Kapsáče', lvl: 9, g: 'c' }],
  shoes: [{ id: 'tenisky', n: 'Tenisky' }, { id: 'balerinky', n: 'Balerínky' }, { id: 'cizmy', n: 'Čižmy', lvl: 2 }, { id: 'sandale', n: 'Sandále', lvl: 5 }, { id: 'kopacky', n: 'Kopačky', lvl: 7 }, { id: 'gumaky', n: 'Gumáky', lvl: 9 }, { id: 'svietiace', n: 'Svietiace tenisky', lvl: 11 }, { id: 'korcule', n: 'Kolieskové korčule', lvl: 17 }, { id: 'clogy', n: 'Gumené šľapky' }, { id: 'kovbojky', n: 'Kovbojské čižmy', lvl: 14 }, { id: 'papuce', n: 'Zajačie papuče', price: 70 }, { id: 'zlate', n: 'Zlaté tenisky', price: 250 }, { id: 'raketove', n: 'Raketové topánky', price: 300 }, { id: 'hviezdne', n: 'Hviezdne tenisky', price: 80 }],
  acc: [{ id: 'nic', n: 'Nič' }, { id: 'celenka', n: 'Čelenka' }, { id: 'siltovka', n: 'Šiltovka' }, { id: 'okuliare', n: 'Okuliare' }, { id: 'masla', n: 'Mašľa', lvl: 2, g: 'd' }, { id: 'helma', n: 'Cyklistická prilba', lvl: 2, g: 'c' }, { id: 'kvet', n: 'Kvietok', lvl: 3, g: 'd' }, { id: 'kapitan', n: 'Kapitánska čiapka', lvl: 3, g: 'c' }, { id: 'usi', n: 'Mačacie ušká', streak: 3, g: 'd' }, { id: 'satka', n: 'Pirátska šatka', streak: 3, g: 'c' }, { id: 'klobuk', n: 'Letný klobúk', lvl: 5 }, { id: 'sluchadla', n: 'Slúchadlá', lvl: 8 }, { id: 'slnecne', n: 'Slnečné okuliare', lvl: 9 }, { id: 'party', n: 'Párty klobúčik', lvl: 10 }, { id: 'carodej', n: 'Čarodejný klobúk', lvl: 13 }, { id: 'korunka', n: 'Korunka', lvl: 15 }, { id: 'cepicka', n: 'Zimná čiapka', price: 50 }, { id: 'svatoziara', n: 'Svätožiara', price: 250 }, { id: 'kridla', n: 'Anjelské krídla', price: 300 }, { id: 'diamant', n: 'Diamantová koruna', price: 400 }, { id: 'okusrdce', n: 'Srdiečkové okuliare', price: 70 }, { id: 'roh', n: 'Jednorožcový roh', price: 100, g: 'd' }, { id: 'kovboj', n: 'Kovbojský klobúk', price: 100, g: 'c' }],
  pet: [
    { id: 'nic', n: 'Žiadne' }, { id: 'medved', n: 'Macko', e: '🐻' }, { id: 'pes', n: 'Psík', e: '🐶' }, { id: 'macka', n: 'Mačička', e: '🐱' }, { id: 'zajac', n: 'Zajko', e: '🐰' }, { id: 'skrecok', n: 'Škrečok', e: '🐹' }, { id: 'zaba', n: 'Žabka', e: '🐸' },
    { id: 'panda', n: 'Panda', e: '🐼', lvl: 4 }, { id: 'koala', n: 'Koala', e: '🐨', lvl: 6 }, { id: 'liska', n: 'Líštička', e: '🦊', streak: 7 }, { id: 'opica', n: 'Opička', e: '🐵', lvl: 8 }, { id: 'tiger', n: 'Tigrík', e: '🐯', lvl: 10 },
    { id: 'sova', n: 'Sovička', e: '🦉', lvl: 12 }, { id: 'lev', n: 'Levík', e: '🦁', lvl: 14 }, { id: 'dino', n: 'Dino', e: '🦖', lvl: 16 }, { id: 'tucniak', n: 'Tučniak', e: '🐧', lvl: 18 }, { id: 'drak', n: 'Dráčik', e: '🐲', lvl: 20 }, { id: 'jednorozec', n: 'Jednorožec', e: '🦄', streak: 21, g: 'd' }, { id: 'motyl', n: 'Motýlik', e: '🦋', lvl: 3 }, { id: 'korytnacka', n: 'Korytnačka', e: '🐢', lvl: 5 }, { id: 'jezko', n: 'Ježko', e: '🦔', lvl: 7 }, { id: 'papagaj', n: 'Papagáj', e: '🦜', lvl: 9 }, { id: 'chobotnica', n: 'Chobotnička', e: '🐙', lvl: 11 }, { id: 'delfin', n: 'Delfín', e: '🐬', lvl: 13 }, { id: 'zirafa', n: 'Žirafa', e: '🦒', lvl: 15 }, { id: 'plameniak', n: 'Plameniak', e: '🦩', lvl: 17 }, { id: 'dinosaurus', n: 'Brontosaurus', e: '🦕', lvl: 19 }, { id: 'pav', n: 'Páv', e: '🦚', lvl: 20 }, { id: 'velryba', n: 'Veľryba', e: '🐳', lvl: 20 }, { id: 'zralok', n: 'Žralok', e: '🦈', streak: 21, g: 'c' }
  ],
  bgp: [{ id: 'nic', n: 'Jednofarebné' }, { id: 'bodky', n: 'Bodky' }, { id: 'pruhy', n: 'Pruhy' }, { id: 'hviezdy', n: 'Hviezdičky' }, { id: 'srdce', n: 'Srdiečka' }, { id: 'kvety', n: 'Kvietky' }, { id: 'oblaky', n: 'Obláčiky' }, { id: 'duha', n: 'Dúha' }, { id: 'vesmir', n: 'Vesmír' }],
  skin: SKIN.map((c, i) => ({ id: 'k' + i, c })),
  bg: BGC
};
const CAT_LABEL = { hair: 'Vlasy', eyes: 'Oči', mouth: 'Ústa', skin: 'Pleť', top: 'Vrch', bottom: 'Spodok', shoes: 'Topánky', acc: 'Doplnky', pet: 'Zvieratko', bgp: 'Pozadie', bg: 'Farba pozadia' };
const COLOR_SLOTS = { hair: [['hair', 'Farba vlasov', HAIRC]], top: [['top', 'Hlavná farba', PAL], ['top2', 'Druhá farba', PAL]], bottom: [['bottom', 'Hlavná farba', PAL], ['bottom2', 'Druhá farba', PAL]], shoes: [['shoes', 'Hlavná farba', PAL], ['shoes2', 'Druhá farba', PAL]], acc: [['acc', 'Hlavná farba', PAL], ['acc2', 'Druhá farba', PAL]], bgp: [['bg', 'Farba pozadia', BGC]] };

function defaultAvatar(g) {
  const d = g === 'd';
  return {
    gender: g, skin: 'k0', hair: d ? 'dlhe' : 'kratke', eyes: d ? 'velke' : 'bodky', mouth: 'usmev',
    top: 'tricko', bottom: d ? 'sukna' : 'nohavice', shoes: d ? 'balerinky' : 'tenisky', acc: 'nic', pet: 'nic', bg: d ? 'g3' : 'g0', bgp: 'bodky',
    col: d ? { hair: 'hneda', top: 'ruzova', top2: 'biela', bottom: 'fialova', bottom2: 'levandula', shoes: 'cervena', shoes2: 'biela', acc: 'ruzova', acc2: 'zlta' }
      : { hair: 'hneda', top: 'modra', top2: 'biela', bottom: 'tmmodra', bottom2: 'svmodra', shoes: 'biela', shoes2: 'cervena', acc: 'cervena', acc2: 'biela' }
  };
}
const itemOf = (cat, id) => CATALOG[cat].find(x => x.id === id) || CATALOG[cat][0];
function shade(hex, f) {
  if (!hex || hex[0] !== '#') return '#7a4fd6';
  const n = parseInt(hex.slice(1), 16); const r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const m = v => Math.max(0, Math.min(255, Math.round(f < 0 ? v * (1 + f) : v + (255 - v) * f)));
  return '#' + [m(r), m(g), m(b)].map(v => v.toString(16).padStart(2, '0')).join('');
}
let AVID = 0;

/* opts: {crop:'head'|'acc'|'top'|'bottom'|'shoes', mood, cls, noBg} */
function avatarSvg(av, opts = {}) {
  const id = 'a' + (++AVID);
  const col = av.col || {};
  const pc = (k, list = PAL) => { const it = list.find(x => x.id === col[k]) || list[0]; return it.c === 'RAINBOW' ? `url(#G${id})` : it.c; };
  const dk = (c, f = -.22) => c.startsWith('url') ? '#6B4FD6' : shade(c, f);
  const skin = itemOf('skin', av.skin).c, skinD = shade(skin, -.14);
  const hc = pc('hair', HAIRC), hcD = dk(hc, -.2);
  const tc = pc('top'), t2 = pc('top2'), tcD = dk(tc), bc = pc('bottom'), b2 = pc('bottom2'), bcD = dk(bc), sc = pc('shoes'), s2 = pc('shoes2'), ac = pc('acc'), a2 = pc('acc2');
  const ink = '#2A2440';
  const top = av.top, dress = top === 'saty' || top === 'princezna';
  const longSleeve = ['mikina', 'kosela', 'super', 'kuzelnik', 'sveter', 'bunda', 'astronaut', 'rytier', 'pyzamo', 'ninja', 'kral'].includes(top);
  let mouth = av.mouth, eyes = av.eyes;
  if (opts.mood === 'happy') { mouth = 'smiech'; if (eyes === 'bodky') eyes = 'stastne'; }
  if (opts.mood === 'sad') mouth = 'o';

  let s = `<defs><linearGradient id="G${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FF6A8A"/><stop offset=".33" stop-color="#FFC23C"/><stop offset=".66" stop-color="#2FC08A"/><stop offset="1" stop-color="#6B7BFF"/></linearGradient><clipPath id="T${id}"><path d="M66 142 Q100 128 134 142 L138 212 H62 Z"/></clipPath><clipPath id="L${id}"><path d="M76 196 H124 L124 282 H102 L100 214 L98 282 H76 Z"/></clipPath>${bgPatternDef(av, id)}</defs>`;
  if (!opts.noBg) s += bgLayer(av, id);

  if (top === 'kral') s += `<path d="M66 144 L36 276 Q100 294 164 276 L134 144 Z" fill="${tc}"/><path d="M36 276 Q100 294 164 276" stroke="#fff" stroke-width="8" fill="none"/>`;
  if (av.acc === 'kridla') s += `<g class="wings"><path d="M84 156 C40 120 6 140 14 186 C30 176 46 182 60 196 C66 180 76 170 88 168Z" fill="#fff" stroke="${ac}" stroke-width="3"/><path d="M116 156 C160 120 194 140 186 186 C170 176 154 182 140 196 C134 180 124 170 112 168Z" fill="#fff" stroke="${ac}" stroke-width="3"/><path d="M30 160 Q50 160 70 176 M170 160 Q150 160 130 176" stroke="${a2}" stroke-width="3" fill="none"/></g>`;
  if (top === 'super') s += `<path d="M70 144 L44 268 Q100 284 156 268 L130 144 Z" fill="${t2}"/>`;
  if (top === 'kuzelnik') s += `<path d="M68 144 L40 272 Q100 290 160 272 L132 144 Z" fill="${tcD}"/>${[[62, 230], [140, 250], [120, 268], [80, 262]].map(([x, y]) => `<text x="${x}" y="${y}" font-size="10" fill="${t2}">★</text>`).join('')}`;
  s += `<g transform="translate(12 3) scale(.88)">${hairBack(av.hair, hc, hcD)}</g>`;

  s += `<rect x="80" y="200" width="18" height="84" rx="8" fill="${skin}"/><rect x="102" y="200" width="18" height="84" rx="8" fill="${skin}"/>`;
  if (top === 'astronaut') s += `<path d="M76 196 H124 L124 284 H102 L100 214 L98 284 H76 Z" fill="#EEF1F8"/><rect x="76" y="250" width="22" height="6" fill="${t2}"/><rect x="102" y="250" width="22" height="6" fill="${t2}"/>`;
  else if (!dress) s += bottomSvg(av.bottom, bc, b2, bcD, id);
  else if (top === 'saty') s += `<path d="M70 196 H130 L144 250 Q100 260 56 250 Z" fill="${tc}"/><path d="M58 244 Q100 256 142 244" stroke="${t2}" stroke-width="5" fill="none"/>`;
  else s += `<path d="M72 192 H128 L156 270 Q100 286 44 270 Z" fill="${tc}"/><path d="M60 258 Q100 272 140 258" stroke="${t2}" stroke-width="4" fill="none"/><g fill="#fff" class="spark"><circle cx="80" cy="230" r="2.5"/><circle cx="118" cy="246" r="2"/><circle cx="100" cy="218" r="2"/><circle cx="132" cy="226" r="2.5"/><circle cx="70" cy="256" r="2"/></g>`;
  s += shoesSvg(top === 'astronaut' ? 'astro' : av.shoes, sc, s2);

  const torsoFill = top === 'astronaut' ? '#EEF1F8' : top === 'rytier' ? '#C9CED9' : top === 'ninja' ? '#2A2A35' : tc;
  s += `<path d="M66 142 Q100 128 134 142 L138 212 H62 Z" fill="${torsoFill}"/>`;
  s += topDetail(top, tc, t2, tcD, id);
  const sleeve = top === 'astronaut' ? '#EEF1F8' : top === 'rytier' ? '#AEB4C2' : top === 'ninja' ? '#2A2A35' : (top === 'dres' ? t2 : tc);
  const arm = side => {
    const x1 = side < 0 ? 70 : 130, x2 = side < 0 ? 54 : 146;
    return `<g${side > 0 ? ' class="wave"' : ''}><path d="M${x1} 148 L${x2} 204" stroke="${skin}" stroke-width="15" stroke-linecap="round"/><path d="M${x1} 148 L${longSleeve ? x2 + (side < 0 ? 1 : -1) : (x1 + x2) / 2} ${longSleeve ? 196 : 172}" stroke="${sleeve}" stroke-width="18" stroke-linecap="round"/>${top === 'tricko' ? `<path d="M${(x1 + x2) / 2 - 8} ${174} l16 -2" stroke="${t2}" stroke-width="4" stroke-linecap="round"/>` : ''}<circle cx="${x2}" cy="208" r="9" fill="${top === 'astronaut' ? '#EEF1F8' : skin}"/></g>`;
  };
  s += arm(-1) + arm(1);
  s += `<rect x="91" y="118" width="18" height="22" rx="7" fill="${skinD}"/>`;
  if (top === 'kosela') s += `<path d="M88 136 L100 150 L94 156 L82 142 Z M112 136 L100 150 L106 156 L118 142 Z" fill="${t2}" stroke="${tcD}" stroke-width="1.5"/>`;
  if (top === 'mikina') s += `<path d="M76 140 Q100 126 124 140 L118 150 Q100 140 82 150 Z" fill="${t2}"/>`;
  if (top === 'bunda') s += `<path d="M80 138 L100 150 L120 138 L124 146 L100 160 L76 146Z" fill="${tcD}"/>`;

  s += `<g transform="translate(12 3) scale(.88)" class="head">`;
  if (av.acc === 'usi') s += `<path d="M56 60 L62 18 L90 44 Z M144 60 L138 18 L110 44 Z" fill="${ac}"/><path d="M64 50 L66 30 L80 44Z M136 50 L134 30 L120 44Z" fill="${a2}"/>`;
  s += `<circle cx="51" cy="96" r="11" fill="${skin}"/><circle cx="149" cy="96" r="11" fill="${skin}"/>`;
  s += `<ellipse cx="100" cy="90" rx="50" ry="52" fill="${skin}"/>`;
  s += `<ellipse cx="70" cy="113" rx="9" ry="5.5" fill="#FF7F9B" opacity=".4"/><ellipse cx="130" cy="113" rx="9" ry="5.5" fill="#FF7F9B" opacity=".4"/>`;
  s += `<path d="M96 104 Q100 109 104 104" stroke="${skinD}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  s += `<g class="eyes">${eyesSvg(eyes, ink, av.gender)}</g>`;
  s += mouthSvg(mouth, ink);
  s += hairFront(av.hair, hc, hcD);
  if (top === 'astronaut' && opts.crop !== 'head') s += `<circle cx="100" cy="88" r="70" fill="rgba(180,220,255,.22)" stroke="#EEF1F8" stroke-width="7"/><path d="M58 50 Q70 32 92 26" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" opacity=".8"/>`;
  else s += accSvg(av.acc, ac, a2, ink);
  s += `</g>`;

  const pet = itemOf('pet', av.pet);
  if (pet.e && !opts.crop && !opts.noPet) s += `<g class="pet"><ellipse cx="166" cy="296" rx="20" ry="5" fill="#000" opacity=".12"/><text x="166" y="291" font-size="38" text-anchor="middle">${pet.e}</text></g>`;

  const vb = { head: '32 10 136 136', acc: '28 -16 144 144', top: '30 110 140 140', bottom: '40 175 120 120', shoes: '62 264 76 42' }[opts.crop] || '0 0 200 310';
  return `<svg class="avatar ${opts.cls || ''}" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="avatar">${s}</svg>`;
}

/* --- pozadie --- */
function bgPatternDef(av, id) {
  const c = itemOf('bg', av.bg).c, d = shade(c, -.12), w = 'rgba(255,255,255,.75)';
  const p = av.bgp || 'nic';
  const P = (sz, body) => `<pattern id="P${id}" width="${sz}" height="${sz}" patternUnits="userSpaceOnUse">${body}</pattern>`;
  switch (p) {
    case 'bodky': return P(24, `<circle cx="6" cy="6" r="3.5" fill="${d}"/><circle cx="18" cy="18" r="3.5" fill="${w}"/>`);
    case 'pruhy': return P(28, `<rect width="14" height="28" fill="${d}" opacity=".55"/>`).replace('patternUnits', 'patternTransform="rotate(30)" patternUnits');
    case 'hviezdy': return P(40, `<text x="6" y="16" font-size="13" fill="${w}">★</text><text x="24" y="36" font-size="10" fill="${d}">★</text>`);
    case 'srdce': return P(36, `<text x="4" y="15" font-size="12" fill="${d}">♥</text><text x="22" y="33" font-size="10" fill="${w}">♥</text>`);
    case 'kvety': return P(44, `<g transform="translate(12 12)">${[0, 72, 144, 216, 288].map(r => `<ellipse cy="-5" rx="3.5" ry="5" fill="${w}" transform="rotate(${r})"/>`).join('')}<circle r="3" fill="#FFD84D"/></g><circle cx="34" cy="34" r="3" fill="${d}"/>`);
    case 'oblaky': return P(70, `<g fill="${w}"><circle cx="16" cy="20" r="8"/><circle cx="26" cy="16" r="10"/><circle cx="36" cy="21" r="7"/><rect x="16" y="20" width="20" height="8"/></g><g fill="${w}" opacity=".6"><circle cx="50" cy="52" r="6"/><circle cx="58" cy="49" r="8"/><circle cx="65" cy="53" r="5"/></g>`);
    default: return '';
  }
}
function bgLayer(av, id) {
  const c = itemOf('bg', av.bg).c, p = av.bgp || 'nic';
  if (p === 'vesmir') { let st = ''; for (let i = 0; i < 40; i++) st += `<circle cx="${(i * 53) % 200}" cy="${(i * 97) % 310}" r="${i % 5 ? 1.2 : 2.4}" fill="#fff" opacity="${.4 + (i % 3) * .2}"/>`; return `<rect x="-20" y="-20" width="240" height="360" fill="#1B1F4B"/>${st}<circle cx="34" cy="40" r="16" fill="#FFB3CF"/><ellipse cx="34" cy="40" rx="26" ry="5" fill="none" stroke="#FFD84D" stroke-width="2.5"/><circle cx="100" cy="300" r="70" fill="#000" opacity=".15"/>`; }
  if (p === 'duha') return `<rect x="-20" y="-20" width="240" height="360" fill="${c}"/>${['#FF8FA3', '#FFC27A', '#FFE680', '#9EE6A8', '#9CC9FF', '#C9B5FF'].map((k, i) => `<circle cx="100" cy="330" r="${250 - i * 16}" fill="none" stroke="${k}" stroke-width="16" opacity=".75"/>`).join('')}<circle cx="100" cy="300" r="70" fill="#000" opacity=".06"/>`;
  return `<rect x="-20" y="-20" width="240" height="360" fill="${c}"/>${p !== 'nic' ? `<rect x="-20" y="-20" width="240" height="360" fill="url(#P${id})"/>` : ''}<circle cx="100" cy="300" r="70" fill="#000" opacity=".06"/>`;
}

/* --- vlasy --- */
function hairBack(h, c, d) {
  switch (h) {
    case 'dlhe': case 'princ': return `<path d="M46 92 C40 8 160 8 154 92 L160 176 Q100 192 40 176 Z" fill="${c}"/>`;
    case 'vlny': return `<path d="M46 92 C40 8 160 8 154 92 C164 112 150 128 162 146 C172 164 150 176 156 190 Q100 204 44 190 C50 176 28 164 38 146 C50 128 36 112 46 92Z" fill="${c}"/>`;
    case 'kuceryd': { let o = `<path d="M46 92 C40 8 160 8 154 92 L156 170 Q100 184 44 170 Z" fill="${c}"/>`; for (let y = 100; y <= 176; y += 19) o += `<circle cx="42" cy="${y}" r="13" fill="${c}"/><circle cx="158" cy="${y}" r="13" fill="${c}"/>`; return o + `<circle cx="70" cy="178" r="12" fill="${c}"/><circle cx="100" cy="182" r="12" fill="${c}"/><circle cx="130" cy="178" r="12" fill="${c}"/>`; }
    case 'ofina': return `<path d="M46 92 C40 8 160 8 154 92 L156 136 Q100 146 44 136 Z" fill="${c}"/>`;
    case 'surfer': return `<path d="M46 92 C40 8 160 8 154 92 L156 134 Q148 144 140 136 L140 112 L60 112 L60 136 Q52 144 44 134 Z" fill="${c}"/>`;
    case 'vrkoce': return `<g fill="${c}"><path d="M44 96 Q22 120 30 160 Q36 176 44 160 Q40 128 58 108Z"/><path d="M156 96 Q178 120 170 160 Q164 176 156 160 Q160 128 142 108Z"/></g><circle cx="38" cy="164" r="6" fill="#FF6A8A"/><circle cx="162" cy="164" r="6" fill="#FF6A8A"/>`;
    case 'vrkoc': { let o = `<path d="M46 92 C40 8 160 8 154 92 L150 120 L50 120 Z" fill="${c}"/>`; for (let i = 0; i < 6; i++) o += `<ellipse cx="${146 + (i % 2 ? 4 : -4)}" cy="${118 + i * 14}" rx="11" ry="9" fill="${i % 2 ? d : c}"/>`; return o + `<circle cx="146" cy="204" r="5" fill="#FF6A8A"/>`; }
    case 'afro': return `<circle cx="100" cy="72" r="66" fill="${c}"/>`;
    case 'samuraj': return `<circle cx="100" cy="30" r="17" fill="${c}"/><rect x="88" y="40" width="24" height="6" rx="3" fill="${d}"/>`;
    case 'bocny': return `<path d="M56 62 Q12 84 28 150 Q34 172 46 160 Q38 120 66 90Z" fill="${c}"/><circle cx="52" cy="76" r="7" fill="#FF6A8A"/>`;
    case 'vysoky': return `<path d="M96 18 Q168 8 162 86 Q158 132 140 152 Q150 100 116 40Z" fill="${c}"/><circle cx="102" cy="22" r="8" fill="#FFC23C"/>`;
    case 'venec': return `<path d="M46 92 C40 8 160 8 154 92 L156 150 Q100 162 44 150 Z" fill="${c}"/>`;
    case 'chvost': return `<path d="M140 52 Q186 66 176 130 Q172 150 160 160 Q166 120 146 84Z" fill="${c}"/>`;
    case 'drdol': return `<circle cx="100" cy="30" r="22" fill="${c}"/>`;
    case 'dva': return `<circle cx="58" cy="40" r="20" fill="${c}"/><circle cx="142" cy="40" r="20" fill="${c}"/>`;
    default: return '';
  }
}
function hairFront(h, c, d) {
  const longFront = `<path d="M48 92 C44 12 156 12 152 92 C148 66 122 54 100 56 C78 54 52 66 48 92Z" fill="${c}"/><path d="M100 56 Q96 70 84 76" stroke="${d}" stroke-width="3" fill="none" opacity=".5"/>`;
  switch (h) {
    case 'kratke': return `<path d="M49 88 C46 42 78 32 102 33 C130 34 154 48 151 88 C143 70 128 60 112 62 C96 64 80 58 72 66 C62 72 54 78 49 88Z" fill="${c}"/>`;
    case 'strapate': return `<path d="M49 86 L44 60 L62 64 L58 40 L78 52 L84 28 L98 46 L110 26 L118 48 L138 34 L136 56 L156 54 L151 86 C140 68 120 62 100 64 C80 62 60 68 49 86Z" fill="${c}"/>`;
    case 'afro': { let o = ''; for (let i = 0; i <= 12; i++) { const a = Math.PI * 1.05 + i * Math.PI * .9 / 12; o += `<circle cx="${(100 + 50 * Math.cos(a)).toFixed(1)}" cy="${(82 + 40 * Math.sin(a)).toFixed(1)}" r="14" fill="${c}"/>`; } return o; }
    case 'bokom': return `<path d="M48 90 C44 14 150 12 152 88 C146 70 132 62 118 64 C100 68 78 66 62 70 C54 76 50 82 48 90Z" fill="${c}"/><path d="M96 46 Q136 52 150 94 Q132 74 104 68Z" fill="${c}"/><path d="M70 50 Q100 40 136 56" stroke="${d}" stroke-width="3" fill="none" opacity=".45"/>`;
    case 'samuraj': return `<path d="M49 88 C44 12 156 12 151 88 C143 70 128 60 112 62 C96 64 80 58 72 66 C62 72 54 78 49 88Z" fill="${c}"/>`;
    case 'pixie': return `<path d="M48 96 C42 12 158 12 152 96 C150 80 146 72 138 68 C120 76 96 60 80 70 C66 74 54 82 48 96Z" fill="${c}"/><path d="M80 70 Q96 56 116 60" stroke="${d}" stroke-width="3" fill="none" opacity=".5"/><circle cx="136" cy="62" r="5" fill="#FF6A8A"/><circle cx="144" cy="70" r="4" fill="#FFC23C"/>`;
    case 'bocny': case 'vysoky': return `<path d="M48 92 C44 12 156 12 152 92 C148 66 122 54 100 56 C78 54 52 66 48 92Z" fill="${c}"/>`;
    case 'venec': { let o = `<path d="M48 92 C44 12 156 12 152 92 C148 66 122 54 100 56 C78 54 52 66 48 92Z" fill="${c}"/>`; for (let i = 0; i <= 10; i++) { const a = Math.PI + .25 + i * (Math.PI - .5) / 10; o += `<ellipse cx="${(100 + 50 * Math.cos(a)).toFixed(1)}" cy="${(82 + 40 * Math.sin(a)).toFixed(1)}" rx="9" ry="7" fill="${i % 2 ? d : c}" stroke="${d}" stroke-width="1"/>`; } return o + `<circle cx="140" cy="58" r="5" fill="#FF9EC4"/><circle cx="60" cy="58" r="5" fill="#FFF"/>`; }
    case 'jezko': return `<path d="M52 84 C50 44 76 36 100 36 C124 36 150 44 148 84 C140 66 122 58 100 58 C78 58 60 66 52 84Z" fill="${c}"/><g fill="${d}" opacity=".35">${[64, 76, 88, 100, 112, 124, 136].map((x, i) => `<circle cx="${x}" cy="${46 + Math.abs(3 - i) * 2}" r="1.6"/>`).join('')}</g>`;
    case 'patka': return `<path d="M49 86 C46 44 80 30 108 34 C136 38 154 54 151 86 C146 70 136 62 124 58 C110 54 84 52 66 64 C58 70 52 78 49 86Z" fill="${c}"/><path d="M62 62 Q88 38 132 48" stroke="${d}" stroke-width="3" fill="none" opacity=".5"/>`;
    case 'vlnkyk': return `<path d="M49 88 C44 44 80 32 102 33 C130 34 156 48 151 88 Q146 74 138 76 Q132 62 120 66 Q110 56 100 64 Q90 56 80 66 Q70 60 64 74 Q56 72 49 88Z" fill="${c}"/>`;
    case 'miska': return `<path d="M47 96 C40 10 160 10 153 96 L146 96 L144 74 Q100 66 56 74 L54 96 Z" fill="${c}"/>`;
    case 'surfer': return `<path d="M48 94 C44 12 156 12 152 94 C146 72 130 60 112 66 C100 56 84 60 76 68 C64 70 52 80 48 94Z" fill="${c}"/>`;
    case 'dlhe': case 'vlny': case 'vrkoce': case 'vrkoc': return longFront;
    case 'princ': return longFront + `<path d="M62 42 L68 18 L80 34 L92 12 L104 32 L118 14 L126 34 L138 20 L140 46 Z" fill="${c}" stroke="${d}" stroke-width="2"/>`;
    case 'kuceryd': case 'kucery': {
      let o = `<path d="M50 90 C44 12 156 12 150 90 C140 72 120 66 100 66 C80 66 60 72 50 90Z" fill="${c}"/>`;
      for (let i = 0; i <= 10; i++) { const a = Math.PI + i * Math.PI / 10; o += `<circle cx="${(100 + 54 * Math.cos(a)).toFixed(1)}" cy="${(84 + 48 * Math.sin(a)).toFixed(1)}" r="16" fill="${c}"/>`; }
      return o + `<circle cx="48" cy="100" r="12" fill="${c}"/><circle cx="152" cy="100" r="12" fill="${c}"/>`;
    }
    case 'ofina': return `<path d="M48 90 C44 12 156 12 152 90 C150 78 146 72 140 70 L60 70 C54 72 50 78 48 90Z" fill="${c}"/>`;
    case 'chvost': return `<path d="M49 88 C44 12 156 12 151 88 C142 66 124 58 106 60 C88 60 70 62 60 70 C54 74 50 80 49 88Z" fill="${c}"/><circle cx="146" cy="60" r="6" fill="#FFC23C"/>`;
    case 'drdol': case 'dva': return `<path d="M49 88 C44 12 156 12 151 88 C142 66 124 58 100 58 C76 58 58 66 49 88Z" fill="${c}"/>` + (h === 'drdol' ? `<rect x="88" y="44" width="24" height="7" rx="3" fill="#FF6A8A"/>` : '');
    case 'cirok': return `<path d="M86 72 C84 40 90 14 100 6 C110 14 116 40 114 72 Z" fill="${c}"/><path d="M60 70 Q100 52 140 70" stroke="${c}" stroke-width="6" opacity=".35" fill="none"/>`;
    default: return '';
  }
}

/* --- tvár --- */
function eyesSvg(e, ink, g) {
  const lash = g === 'd' ? `<path d="M70 88 L66 84 M74 86 L72 81 M130 88 L134 84 M126 86 L128 81" stroke="${ink}" stroke-width="2.5" stroke-linecap="round"/>` : '';
  switch (e) {
    case 'velke': return `<g><ellipse cx="82" cy="96" rx="11" ry="12.5" fill="#fff"/><circle cx="83" cy="97" r="7.5" fill="#5A3B2A"/><circle cx="83" cy="97" r="4" fill="${ink}"/><circle cx="86" cy="94" r="2.6" fill="#fff"/></g><g><ellipse cx="118" cy="96" rx="11" ry="12.5" fill="#fff"/><circle cx="119" cy="97" r="7.5" fill="#5A3B2A"/><circle cx="119" cy="97" r="4" fill="${ink}"/><circle cx="122" cy="94" r="2.6" fill="#fff"/></g>${lash}`;
    case 'stastne': return `<path d="M73 99 Q82 88 91 99 M109 99 Q118 88 127 99" stroke="${ink}" stroke-width="4.5" fill="none" stroke-linecap="round"/>${lash}`;
    case 'mrk': return `<circle cx="82" cy="96" r="6.5" fill="${ink}"/><circle cx="84" cy="94" r="2" fill="#fff"/><path d="M110 97 Q118 102 127 97" stroke="${ink}" stroke-width="4.5" fill="none" stroke-linecap="round"/>${lash}`;
    case 'hviezdy': { const st = (cx, cy) => { let p = ''; for (let i = 0; i < 10; i++) { const r = i % 2 ? 4.5 : 11, a = -Math.PI / 2 + i * Math.PI / 5; p += `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)} `; } return `<polygon points="${p}" fill="#FFC23C" stroke="${ink}" stroke-width="2" stroke-linejoin="round"/>`; }; return st(82, 96) + st(118, 96); }
    case 'srdce': { const h = (x, y) => `<path d="M${x} ${y + 9} C${x - 14} ${y} ${x - 8} ${y - 10} ${x} ${y - 3} C${x + 8} ${y - 10} ${x + 14} ${y} ${x} ${y + 9}Z" fill="#F0475A" stroke="${ink}" stroke-width="2"/>`; return h(82, 96) + h(118, 96); }
    default: return `<circle cx="82" cy="96" r="6.5" fill="${ink}"/><circle cx="118" cy="96" r="6.5" fill="${ink}"/><circle cx="84" cy="94" r="2" fill="#fff"/><circle cx="120" cy="94" r="2" fill="#fff"/>${lash}`;
  }
}
function mouthSvg(m, ink) {
  switch (m) {
    case 'smiech': return `<path d="M84 114 Q100 138 116 114 Z" fill="#8A2A3E"/><path d="M92 126 Q100 121 108 126 Q100 134 92 126Z" fill="#FF8FA6"/>`;
    case 'o': return `<ellipse cx="100" cy="121" rx="6.5" ry="8" fill="#8A2A3E"/>`;
    case 'jazyk': return `<path d="M87 116 Q100 127 113 116" stroke="${ink}" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M95 121 Q100 134 107 121 Z" fill="#FF7A93"/>`;
    case 'zuby': return `<path d="M85 114 Q100 132 115 114 Z" fill="#8A2A3E"/><rect x="93" y="114" width="6.5" height="7" rx="1.5" fill="#fff"/><rect x="100.5" y="114" width="6.5" height="7" rx="1.5" fill="#fff"/>`;
    default: return `<path d="M86 115 Q100 128 114 115" stroke="${ink}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  }
}
function accSvg(a, c, c2, ink) {
  switch (a) {
    case 'okuliare': return `<g stroke="${c}" stroke-width="4.5" fill="rgba(255,255,255,.18)"><circle cx="82" cy="96" r="15"/><circle cx="118" cy="96" r="15"/></g><path d="M97 95 Q100 92 103 95" stroke="${c}" stroke-width="4" fill="none"/>`;
    case 'slnecne': return `<g fill="#1E2240" stroke="${c}" stroke-width="3.5"><rect x="64" y="86" width="32" height="20" rx="8"/><rect x="104" y="86" width="32" height="20" rx="8"/></g><path d="M96 94 H104" stroke="${c}" stroke-width="4"/><path d="M70 92 L78 92 M110 92 L118 92" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/>`;
    case 'siltovka': return `<path d="M48 74 C48 26 152 26 152 74 Z" fill="${c}"/><path d="M100 70 L176 68 Q182 80 162 82 L100 80 Z" fill="${c2}"/><circle cx="100" cy="30" r="5" fill="${c2}"/>`;
    case 'celenka': return `<path d="M50 70 C56 34 144 34 150 70" stroke="${c}" stroke-width="9" fill="none" stroke-linecap="round"/><g fill="${c2}">${[64, 82, 100, 118, 136].map((x, i) => `<circle cx="${x}" cy="${[56, 45, 41, 45, 56][i]}" r="3"/>`).join('')}</g>`;
    case 'korunka': return `<path d="M64 52 L70 18 L86 38 L100 10 L114 38 L130 18 L136 52 Z" fill="#F7C531" stroke="#C99511" stroke-width="3" stroke-linejoin="round"/><circle cx="100" cy="40" r="5" fill="${c}"/><circle cx="80" cy="44" r="3.5" fill="${c2}"/><circle cx="120" cy="44" r="3.5" fill="${c2}"/>`;
    case 'masla': return `<g transform="translate(134 50) rotate(15)"><path d="M0 0 L-18 -12 L-18 12 Z M0 0 L18 -12 L18 12Z" fill="${c}" stroke="${shade(c, -.25)}" stroke-width="2" stroke-linejoin="round"/><circle r="6" fill="${c2}" stroke="${shade(c, -.25)}" stroke-width="2"/></g>`;
    case 'sluchadla': return `<path d="M46 96 C40 22 160 22 154 96" stroke="${c2}" stroke-width="9" fill="none"/><rect x="36" y="82" width="20" height="30" rx="9" fill="${c}"/><rect x="144" y="82" width="20" height="30" rx="9" fill="${c}"/>`;
    case 'carodej': return `<path d="M54 64 L104 -18 L146 64 Z" fill="${c}"/><ellipse cx="100" cy="64" rx="60" ry="10" fill="${shade(c, -.2)}"/><path d="M60 52 L140 52" stroke="${c2}" stroke-width="6"/><text x="100" y="30" font-size="18" text-anchor="middle" fill="${c2}">★</text>`;
    case 'kvet': return `<g transform="translate(138 52)">${[0, 72, 144, 216, 288].map(r => `<ellipse cx="0" cy="-9" rx="6" ry="9" fill="${c}" transform="rotate(${r})"/>`).join('')}<circle r="6" fill="${c2}"/></g>`;
    case 'party': return `<path d="M82 46 L100 0 L118 46 Z" fill="${c}"/><path d="M90 26 L110 26 M86 36 L114 36" stroke="${c2}" stroke-width="4"/><circle cx="100" cy="2" r="7" fill="${c2}"/>`;
    case 'svatoziara': return `<ellipse cx="100" cy="12" rx="38" ry="10" fill="none" stroke="#FFE27A" stroke-width="8" class="halo"/><ellipse cx="100" cy="12" rx="38" ry="10" fill="none" stroke="#F2B705" stroke-width="2.5"/>`;
    case 'kridla': return '';
    case 'diamant': return `<path d="M60 54 L66 14 L84 36 L100 4 L116 36 L134 14 L140 54 Z" fill="#DCE9FF" stroke="#8FB3FF" stroke-width="3" stroke-linejoin="round"/><path d="M60 54 H140" stroke="#F2B705" stroke-width="7"/><g class="spark2"><path d="M100 30 L106 40 L100 50 L94 40Z" fill="${c}" stroke="#fff" stroke-width="1.5"/><path d="M78 40 L82 46 L78 52 L74 46Z" fill="${c2}"/><path d="M122 40 L126 46 L122 52 L118 46Z" fill="${c2}"/></g>`;
    case 'cepicka': return `<path d="M50 74 C50 20 150 20 150 74 Z" fill="${c}"/><rect x="47" y="62" width="106" height="15" rx="7" fill="${c2}"/><circle cx="100" cy="20" r="12" fill="${c2}"/>`;
    case 'okusrdce': { const h = x => `<path d="M${x} 108 C${x - 20} 96 ${x - 14} 80 ${x} 89 C${x + 14} 80 ${x + 20} 96 ${x} 108Z" fill="${c}" fill-opacity=".55" stroke="${c}" stroke-width="3.5"/>`; return h(82) + h(118) + `<path d="M96 92 Q100 89 104 92" stroke="${c}" stroke-width="3.5" fill="none"/>`; }
    case 'roh': return `<path d="M50 72 C56 34 144 34 150 72" stroke="${c}" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M91 42 L100 0 L109 42 Z" fill="#FFD84D" stroke="#E0A800" stroke-width="2" stroke-linejoin="round"/><path d="M93 33 L107 29 M95 23 L105 20 M97 13 L103 11" stroke="#E0A800" stroke-width="2"/><circle cx="72" cy="50" r="5" fill="${c2}"/><circle cx="128" cy="50" r="5" fill="${c2}"/>`;
    case 'kovboj': return `<ellipse cx="100" cy="62" rx="80" ry="12" fill="${c}"/><path d="M62 62 C58 18 80 12 100 26 C120 12 142 18 138 62 Z" fill="${c}"/><path d="M63 52 H137" stroke="${c2}" stroke-width="6"/><path d="M28 60 Q40 52 60 60 M140 60 Q160 52 172 60" stroke="${shade(c, -.25)}" stroke-width="3" fill="none"/>`;
    case 'helma': return `<path d="M44 78 C44 18 156 18 156 78 Z" fill="${c}"/><path d="M72 36 L78 72 M100 28 V72 M128 36 L122 72" stroke="${c2}" stroke-width="6" stroke-linecap="round"/><path d="M44 78 H156" stroke="${shade(c, -.25)}" stroke-width="7" stroke-linecap="round"/>`;
    case 'satka': return `<path d="M48 74 C58 50 142 50 152 74 L152 86 C140 66 60 66 48 86Z" fill="${c}"/><path d="M150 76 L174 66 L168 84 Z M150 80 L170 96 L158 100 Z" fill="${c}"/><g fill="${c2}"><circle cx="76" cy="66" r="3"/><circle cx="100" cy="61" r="3"/><circle cx="124" cy="66" r="3"/></g>`;
    case 'kapitan': return `<path d="M50 66 C50 26 150 26 150 66 Z" fill="#fff" stroke="#C9CED9" stroke-width="2"/><rect x="49" y="58" width="102" height="11" fill="${c}"/><path d="M58 69 Q100 86 142 69 L140 77 Q100 94 60 77Z" fill="#2A2440"/><circle cx="100" cy="46" r="7" fill="${c2}"/>`;
    case 'klobuk': return `<ellipse cx="100" cy="58" rx="74" ry="14" fill="${c}"/><path d="M62 58 C62 18 138 18 138 58 Z" fill="${c}"/><path d="M63 50 H137" stroke="${c2}" stroke-width="7"/>`;
    default: return '';
  }
}
function bottomSvg(b, c, c2, d, id) {
  const pants = `<path d="M76 196 H124 L124 282 H102 L100 214 L98 282 H76 Z" fill="${c}"/>`;
  switch (b) {
    case 'kratasy': return `<path d="M76 196 H124 L126 240 H102 L100 214 L98 240 H74 Z" fill="${c}"/><path d="M76 232 H98 M102 232 H125" stroke="${c2}" stroke-width="4"/>`;
    case 'sukna': return `<path d="M76 196 H124 L138 246 Q100 254 62 246 Z" fill="${c}"/><path d="M90 200 L84 248 M110 200 L116 248" stroke="${d}" stroke-width="2.5" opacity=".6"/><path d="M64 244 Q100 252 136 244" stroke="${c2}" stroke-width="4" fill="none"/>`;
    case 'tutu': return `<path d="M76 196 H124 L156 240 Q100 254 44 240 Z" fill="${c2}" opacity=".9"/><path d="M76 196 H124 L150 232 Q140 240 130 234 Q120 244 110 236 Q100 246 90 236 Q80 244 70 234 Q60 240 50 232 Z" fill="${c}"/>`;
    case 'riflove': return pants + `<path d="M88 206 V280 M112 206 V280" stroke="${c2}" stroke-width="2" stroke-dasharray="4 3"/><rect x="76" y="196" width="48" height="8" fill="${d}"/>`;
    case 'teplaky': return pants + `<path d="M79 200 V270 M121 200 V270" stroke="${c2}" stroke-width="4"/><rect x="76" y="270" width="22" height="10" rx="3" fill="${d}"/><rect x="102" y="270" width="22" height="10" rx="3" fill="${d}"/>`;
    case 'kapsace': return pants + `<rect x="76" y="196" width="48" height="8" fill="${d}"/><rect x="77" y="234" width="16" height="18" rx="3" fill="${c2}"/><rect x="107" y="234" width="16" height="18" rx="3" fill="${c2}"/><path d="M77 240 H93 M107 240 H123" stroke="${d}" stroke-width="2"/>`;
    case 'leginy': return `<path d="M77 196 H123 L122 282 H102 L100 214 L98 282 H78 Z" fill="${c}"/><g clip-path="url(#L${id})" fill="${c2}">${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<circle cx="${80 + (i % 2) * 10 + (i > 3 ? 22 : 0)}" cy="${212 + (i % 4) * 18}" r="3"/>`).join('')}</g>`;
    default: return pants + `<rect x="76" y="196" width="48" height="8" fill="${c2}"/>`;
  }
}
function shoesSvg(sh, c, c2) {
  const L = 'M71 296 Q70 280 84 279 H99 V297 H73 Q71 297 71 296Z', R2 = 'M129 296 Q130 280 116 279 H101 V297 H127 Q129 297 129 296Z';
  const both = (fill, extra = '') => `<path d="${L}" fill="${fill}" ${extra}/><path d="${R2}" fill="${fill}" ${extra}/>`;
  switch (sh) {
    case 'astro': return both('#C9CED9');
    case 'balerinky': return both(c) + `<circle cx="90" cy="284" r="3.5" fill="${c2}"/><circle cx="110" cy="284" r="3.5" fill="${c2}"/>`;
    case 'cizmy': return `<path d="M78 252 H99 V297 H71 Q70 282 78 278Z" fill="${c}"/><path d="M122 252 H101 V297 H129 Q130 282 122 278Z" fill="${c}"/><rect x="77" y="252" width="22" height="8" fill="${c2}"/><rect x="101" y="252" width="22" height="8" fill="${c2}"/>`;
    case 'gumaky': return `<path d="M78 248 H99 V297 H71 Q70 282 78 278Z" fill="${c}"/><path d="M122 248 H101 V297 H129 Q130 282 122 278Z" fill="${c}"/><g fill="${c2}">${[[84, 260], [92, 274], [80, 286], [108, 262], [116, 276], [120, 288]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3"/>`).join('')}</g>`;
    case 'sandale': return both('#C98A5C', 'opacity=".3"') + `<g stroke="${c}" stroke-width="4"><path d="M76 286 H99 M78 280 L96 292 M101 286 H124 M122 280 L104 292"/></g><rect x="70" y="294" width="30" height="4" rx="2" fill="${c2}"/><rect x="100" y="294" width="30" height="4" rx="2" fill="${c2}"/>`;
    case 'kopacky': return both(c) + `<path d="M80 286 L96 286 M104 286 L120 286" stroke="${c2}" stroke-width="3"/><g fill="#fff">${[74, 82, 90, 110, 118, 126].map(x => `<rect x="${x - 2}" y="297" width="4" height="4" rx="1"/>`).join('')}</g>`;
    case 'papuce': return both(c) + `<g fill="${c}" stroke="#fff" stroke-width="1.5"><ellipse cx="80" cy="272" rx="4" ry="9"/><ellipse cx="90" cy="272" rx="4" ry="9"/><ellipse cx="110" cy="272" rx="4" ry="9"/><ellipse cx="120" cy="272" rx="4" ry="9"/></g><g fill="#2A2440"><circle cx="81" cy="287" r="1.8"/><circle cx="89" cy="287" r="1.8"/><circle cx="111" cy="287" r="1.8"/><circle cx="119" cy="287" r="1.8"/></g><circle cx="85" cy="291" r="2" fill="${c2}"/><circle cx="115" cy="291" r="2" fill="${c2}"/>`;
    case 'hviezdne': return both(c, 'stroke="#C9CED9" stroke-width="1.2"') + `<text x="86" y="293" font-size="12" text-anchor="middle" fill="${c2}">★</text><text x="114" y="293" font-size="12" text-anchor="middle" fill="${c2}">★</text><rect x="71" y="294" width="29" height="4" rx="2" fill="#fff"/><rect x="100" y="294" width="29" height="4" rx="2" fill="#fff"/>`;
    case 'clogy': return both(c) + `<g fill="${c2}">${[78, 86, 94, 106, 114, 122].map(x => `<circle cx="${x}" cy="285" r="2"/>`).join('')}</g><path d="M76 290 H98 M102 290 H124" stroke="${shade(c, -.25)}" stroke-width="2"/>`;
    case 'kovbojky': return `<path d="M77 250 H99 V297 H71 Q70 282 78 278Z" fill="${c}"/><path d="M123 250 H101 V297 H129 Q130 282 122 278Z" fill="${c}"/><text x="88" y="272" font-size="12" text-anchor="middle" fill="${c2}">★</text><text x="112" y="272" font-size="12" text-anchor="middle" fill="${c2}">★</text><rect x="70" y="295" width="30" height="4" fill="#5A3A20"/><rect x="100" y="295" width="30" height="4" fill="#5A3A20"/>`;
    case 'zlate': return `<g class="glow">${both('#F2B705', 'stroke="#C99511" stroke-width="1.5"')}</g><path d="M80 286 L92 284 M108 284 L120 286" stroke="#fff" stroke-width="3" stroke-linecap="round"/><rect x="71" y="294" width="29" height="4" rx="2" fill="#fff"/><rect x="100" y="294" width="29" height="4" rx="2" fill="#fff"/><text x="78" y="282" font-size="8" fill="#fff">✦</text><text x="118" y="282" font-size="8" fill="#fff">✦</text>`;
    case 'raketove': return both(c) + `<rect x="72" y="292" width="27" height="6" rx="2" fill="#9AA3B8"/><rect x="101" y="292" width="27" height="6" rx="2" fill="#9AA3B8"/><g class="flame"><path d="M78 298 Q85 316 92 298Z" fill="#FFB020"/><path d="M108 298 Q115 316 122 298Z" fill="#FFB020"/><path d="M82 298 Q85 308 88 298Z" fill="#FF5A2A"/><path d="M112 298 Q115 308 118 298Z" fill="#FF5A2A"/></g><path d="M80 284 L94 284" stroke="${c2}" stroke-width="3"/><path d="M106 284 L120 284" stroke="${c2}" stroke-width="3"/>`;
    case 'svietiace': return `<g class="glow">${both(c)}<rect x="71" y="293" width="29" height="5" rx="2" fill="${c2}"/><rect x="100" y="293" width="29" height="5" rx="2" fill="${c2}"/></g>`;
    case 'korcule': return both(c) + `<g fill="${c2}" stroke="#2A2440" stroke-width="1.5" class="wheels">${[76, 92, 108, 124].map(x => `<circle cx="${x}" cy="302" r="5"/>`).join('')}</g>`;
    default: return both(c, 'stroke="#C9CED9" stroke-width="1.2"') + `<path d="M80 286 L92 284 M108 284 L120 286" stroke="${c2}" stroke-width="3.5" stroke-linecap="round"/><rect x="71" y="294" width="29" height="4" rx="2" fill="#fff"/><rect x="100" y="294" width="29" height="4" rx="2" fill="#fff"/>`;
  }
}
function topDetail(t, c, c2, d, id) {
  switch (t) {
    case 'pruhy': return `<g clip-path="url(#T${id})" fill="${c2}">${[150, 166, 182, 198].map(y => `<rect x="50" y="${y}" width="100" height="7"/>`).join('')}</g>`;
    case 'hviezda': return `<text x="100" y="190" font-size="34" text-anchor="middle" fill="${c2}">★</text><path d="M86 140 Q100 152 114 140" stroke="${d}" stroke-width="3.5" fill="none"/>`;
    case 'mikina': return `<path d="M82 180 H118 L114 200 H86 Z" fill="${c2}"/><path d="M95 146 V166 M105 146 V166" stroke="${c2}" stroke-width="2.5" stroke-linecap="round"/>`;
    case 'sveter': return `<path d="M100 186 C86 176 88 162 98 166 Q100 168 102 166 C112 162 114 176 100 186Z" fill="${c2}"/><rect x="62" y="204" width="76" height="8" fill="${d}"/><g clip-path="url(#T${id})"><path d="M60 150 L70 156 L80 150 L90 156 L100 150 L110 156 L120 150 L130 156 L140 150" stroke="${c2}" stroke-width="3" fill="none"/></g>`;
    case 'bunda': return `<path d="M100 150 V212" stroke="${c2}" stroke-width="3"/><rect x="72" y="182" width="18" height="12" rx="3" fill="${c2}"/><rect x="110" y="182" width="18" height="12" rx="3" fill="${c2}"/>`;
    case 'kosela': return `<g fill="${d}"><circle cx="100" cy="164" r="2.5"/><circle cx="100" cy="180" r="2.5"/><circle cx="100" cy="196" r="2.5"/></g><path d="M100 150 V210" stroke="${d}" stroke-width="1.5"/>`;
    case 'dres': return `<text x="100" y="192" font-size="34" font-weight="800" text-anchor="middle" fill="${c2}" font-family="Baloo 2, sans-serif">10</text>`;
    case 'super': return `<circle cx="100" cy="174" r="17" fill="#FFD84D" stroke="${c2}" stroke-width="3"/><path d="M104 160 L92 177 H100 L96 190 L109 172 H101 L106 160Z" fill="${c2}"/>`;
    case 'saty': return `<path d="M84 140 Q100 154 116 140" stroke="${c2}" stroke-width="3" fill="none"/><rect x="66" y="190" width="68" height="8" fill="${c2}"/>`;
    case 'princezna': return `<path d="M80 142 Q100 160 120 142" stroke="${c2}" stroke-width="3" fill="none"/><circle cx="100" cy="156" r="4" fill="${c2}"/><rect x="68" y="186" width="64" height="7" fill="${c2}"/>`;
    case 'kuzelnik': return `<path d="M100 140 V210" stroke="${c2}" stroke-width="3"/><text x="86" y="182" font-size="14" fill="${c2}">★</text><text x="106" y="200" font-size="10" fill="${c2}">★</text>`;
    case 'tdino': case 'tsrdce': case 'tfutbal': case 'traketa': case 'tjednorozec': return `<path d="M86 140 Q100 152 114 140" stroke="${c2}" stroke-width="4" fill="none"/><text x="100" y="194" font-size="30" text-anchor="middle">${{ tdino: '🦖', tsrdce: '❤️', tfutbal: '⚽', traketa: '🚀', tjednorozec: '🦄' }[t]}</text>`;
    case 'overal': return `<rect x="76" y="168" width="48" height="44" rx="4" fill="${c2}"/><path d="M80 170 L74 142 M120 170 L126 142" stroke="${c2}" stroke-width="7" stroke-linecap="round"/><circle cx="82" cy="172" r="3" fill="#FFD84D"/><circle cx="118" cy="172" r="3" fill="#FFD84D"/><rect x="90" y="182" width="20" height="12" rx="2" fill="${shade(c2 || '#4D8DFF', -.2)}"/>`;
    case 'pyzamo': return `<g fill="${c2}" font-size="11"><text x="74" y="166">★</text><text x="110" y="160">★</text><text x="92" y="188">★</text><text x="120" y="200">★</text><text x="70" y="204">★</text></g><path d="M100 146 V210" stroke="${d}" stroke-width="1.5" stroke-dasharray="3 5"/>`;
    case 'ninja': return `<rect x="62" y="186" width="76" height="9" fill="${c2}"/><path d="M128 190 L142 206 M132 190 L144 200" stroke="${c2}" stroke-width="5" stroke-linecap="round"/><path d="M80 142 L100 172 L120 142" stroke="#45455A" stroke-width="4" fill="none"/>`;
    case 'kral': return `<path d="M72 142 Q100 160 128 142 L126 156 Q100 172 74 156Z" fill="#fff"/><g fill="#2A2A35"><circle cx="86" cy="152" r="1.6"/><circle cx="100" cy="160" r="1.6"/><circle cx="114" cy="152" r="1.6"/></g><path d="M80 164 Q100 186 120 164" stroke="#F2B705" stroke-width="3" fill="none"/><circle cx="100" cy="182" r="6" fill="#F2B705" stroke="#C99511" stroke-width="2"/><circle cx="100" cy="182" r="2.5" fill="${c2}"/>`;
    case 'rytier': return `<path d="M70 160 H130 M68 184 H132" stroke="#9AA1B2" stroke-width="3"/><path d="M88 156 H112 V180 Q112 194 100 200 Q88 194 88 180 Z" fill="${c}" stroke="#2A2440" stroke-width="2"/><path d="M100 162 V194 M91 174 H109" stroke="${c2}" stroke-width="4"/>`;
    case 'astronaut': return `<rect x="84" y="160" width="32" height="24" rx="5" fill="${c}"/><circle cx="92" cy="172" r="3" fill="#FF5A5F"/><circle cx="102" cy="172" r="3" fill="#FFD84D"/><circle cx="111" cy="172" r="3" fill="${c2}"/>`;
    default: return `<path d="M86 140 Q100 152 114 140" stroke="${c2}" stroke-width="4" fill="none"/>`;
  }
}

/* ===== Vlastné pozadie (izba) ===== */
const THEMES = [
  { id: 'pastel', n: 'Pastelky', c: ['#FFE6F1', '#E7F0FF', '#E3FAF0'] }, { id: 'ruzova', n: 'Cukrová vata', c: ['#FFE3EF', '#FFD1E3', '#F3E1FF'] },
  { id: 'nebo', n: 'Nebo', c: ['#DDF0FF', '#C9E3FF', '#E8F7FF'] }, { id: 'mata', n: 'Mätová', c: ['#DFFBF0', '#CBF3E2', '#EAFBE0'] },
  { id: 'slnko', n: 'Slniečko', c: ['#FFF6CC', '#FFE6A8', '#FFDCC8'] }, { id: 'levandula', n: 'Levanduľa', c: ['#EEE6FF', '#DED0FF', '#F7E8FF'] },
  { id: 'more', n: 'More', c: ['#CFF3FF', '#B5E4F5', '#D6FFF2'] }, { id: 'les', n: 'Les', c: ['#E4F6D8', '#C9E9BA', '#F2F8DA'] },
  { id: 'zapad', n: 'Západ slnka', c: ['#FFD9C4', '#FFC5D8', '#E3CBFF'] }, { id: 'broskyna', n: 'Broskyňa', c: ['#FFE9DA', '#FFD7C2', '#FFF0E0'] },
  { id: 'citron', n: 'Citrónová', c: ['#FFFBD1', '#FFF1A8', '#F1FFC9'] }, { id: 'malina', n: 'Malinová', c: ['#FFD6E5', '#FFC2D9', '#FFE3F0'] },
  { id: 'jahoda', n: 'Jahodová', c: ['#FFE0E0', '#FFC9CF', '#E9FFDF'] }, { id: 'ocean', n: 'Oceán', c: ['#C9E8FF', '#A9D8F5', '#BFF3F0'] },
  { id: 'aurora', n: 'Polárna žiara', c: ['#D9FFF0', '#CDEBFF', '#E6D6FF'] }, { id: 'pust', n: 'Púšť', c: ['#FFF0D6', '#FFE2B8', '#FFD7C2'] },
  { id: 'cukriky', n: 'Cukríky', c: ['#FFD6F0', '#FFF5C2', '#CCF0FF'] }, { id: 'oblacik', n: 'Obláčik', c: ['#F2F5FA', '#E3EAF5', '#F6F0FF'] },
  { id: 'leto', n: 'Leto', c: ['#FFF3B8', '#C9F5EE', '#B8E8FF'] }, { id: 'mentol', n: 'Mentol', c: ['#E0FFF8', '#C8F5EA', '#E6F7FF'] },
  { id: 'noc', n: 'Hviezdna noc', c: ['#2B3270', '#3B2C6E', '#1E2450'], dark: true, lvl: 6 },
  { id: 'duha', n: 'Dúha', c: ['#FFD1DC', '#FFE7B8', '#FFF6B8', '#C9F2D9', '#CFE3FF', '#E4D4FF'], lvl: 8 },
  { id: 'vesmir', n: 'Vesmír', c: ['#2A2266', '#1B1F4B', '#0F1A3A'], dark: true, streak: 14 }
];
const PATS = [{ id: 'nic', n: 'Bez vzoru' }, { id: 'bodky', n: 'Bodky' }, { id: 'pruhy', n: 'Pásiky' }, { id: 'kocky', n: 'Kocky' }, { id: 'vlnky', n: 'Vlnky' }, { id: 'mriezka', n: 'Mriežka' }, { id: 'diamanty', n: 'Diamanty' }, { id: 'bubliny', n: 'Bublinky' }, { id: 'luce', n: 'Lúče' }, { id: 'konfety', n: 'Konfety' }, { id: 'phviezdy', n: 'Hviezdičky' }, { id: 'psrdce', n: 'Srdiečka' }, { id: 'pkvety', n: 'Kvietky' }, { id: 'plabky', n: 'Labky' }, { id: 'pcikcak', n: 'Cik-cak' }, { id: 'ptrojuh', n: 'Trojuholníky' }, { id: 'pmesiac', n: 'Mesiačiky' }, { id: 'pduhy', n: 'Dúhy' }, { id: 'pnotky', n: 'Nôtky' }, { id: 'pvlocky', n: 'Snehové vločky' }];
const STICKERS = [
  ...'😀,😍,😎,🦄,🐱,🐶,🐰,🐻,🐼,🦊,🐸,🐠,🦋,🐞,🐝,🦖,🌳,🌲,🌸,🌻,🌼,🌷,🍄,⭐,🌙,☀️,☁️,❄️,❤️,💜,🎈,🎀,🍭,🍦,🧁,🍓,🍉,⚽,🏀,🎵,🎨,✏️,📚,🚗,🚲,🏠,🏰,🪐,🐬,🐢,🦒,🍀,🌵,🍎,🎁,🧸,🦩,🍩,🎃,⛄,🐧,🦁,🍕,🎂,🎸,🏝️,🌊'.split(',').map(e => ({ e, n: e })),
  { e: '🌈', n: 'Dúha', lvl: 3 }, { e: '👑', n: 'Korunka', lvl: 5 }, { e: '🚀', n: 'Raketa', lvl: 7 }, { e: '💎', n: 'Diamant', lvl: 9 }, { e: '🐉', n: 'Drak', lvl: 12 }, { e: '🏆', n: 'Pohár', lvl: 15 }, { e: '🎆', n: 'Ohňostroj', streak: 7 }
];
function defaultRoom(g) { return { theme: g === 'd' ? 'ruzova' : 'nebo', pat: 'bodky', page: true, stickers: [{ e: '⭐', x: 16, y: 14, s: 1, r: -10 }, { e: g === 'd' ? '🌸' : '⚽', x: 84, y: 20, s: 1, r: 12 }, { e: '☁️', x: 20, y: 44, s: 1.2, r: 0 }, { e: g === 'd' ? '🦄' : '🦖', x: 82, y: 62, s: 1.1, r: 6 }] }; }
const themeOf = id => THEMES.find(t => t.id === id) || THEMES[0];
function themeBg(id, dark) { const t = themeOf(id); const c = dark && !t.dark ? t.c.map(x => shade(x, -.62)) : t.c; return `linear-gradient(165deg,${c.join(',')})`; }
function roomHTML(r, sel = null, dark = false) { return `<div class="roombg" style="background:${themeBg(r.theme, dark)}"><div class="pat pat-${r.pat}${themeOf(r.theme).dark ? ' onDark' : ''}"></div>${r.stickers.map((s, i) => `<span class="stk ${sel === i ? 'sel' : ''}" data-i="${i}" style="left:${s.x}%;top:${s.y}%;--s:${s.s};--r:${s.r}deg">${s.e}</span>`).join('')}</div>`; }
const petName = av => av.petName || itemOf('pet', av.pet).n;

for (const [cat, list] of Object.entries(CATALOG)) for (const it of list) if (it.price) it.sid = cat + ':' + it.id;
