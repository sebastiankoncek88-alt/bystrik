/* ===== Pomocné funkcie ===== */
const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const fmt = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const plural = (n, one, few, many) => n === 1 ? one : (n >= 2 && n <= 4 ? few : many);
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

/* ===== Obrázky do otázok ===== */
function clockSvg(h, m) {
  const ha = (h % 12) * 30 + m * 0.5, ma = m * 6;
  let nums = '';
  for (let i = 1; i <= 12; i++) {
    const a = (i * 30 - 90) * Math.PI / 180;
    nums += `<text x="${60 + 40 * Math.cos(a)}" y="${60 + 40 * Math.sin(a) + 4.5}" text-anchor="middle" font-size="12" font-weight="800" fill="currentColor">${i}</text>`;
  }
  return `<svg class="qsvg" viewBox="0 0 120 120" role="img" aria-label="hodiny"><circle cx="60" cy="60" r="55" fill="var(--paper)" stroke="currentColor" stroke-width="5"/>${nums}<line x1="60" y1="60" x2="60" y2="34" stroke="currentColor" stroke-width="7" stroke-linecap="round" transform="rotate(${ha} 60 60)"/><line x1="60" y1="60" x2="60" y2="18" stroke="var(--accent)" stroke-width="4" stroke-linecap="round" transform="rotate(${ma} 60 60)"/><circle cx="60" cy="60" r="5" fill="currentColor"/></svg>`;
}
function shapeSvg(kind, color) {
  const s = {
    kruh: `<circle cx="60" cy="60" r="44"/>`,
    štvorec: `<rect x="18" y="18" width="84" height="84" rx="4"/>`,
    obdĺžnik: `<rect x="6" y="32" width="108" height="56" rx="4"/>`,
    trojuholník: `<polygon points="60,10 112,104 8,104"/>`
  }[kind];
  return `<svg class="qsvg" viewBox="0 0 120 120" role="img" aria-label="útvar"><g fill="${color}" stroke="currentColor" stroke-width="4" stroke-linejoin="round">${s}</g></svg>`;
}
function rectSvg(a, b, unit) {
  const w = a === b ? 80 : 104, h = a === b ? 80 : 56, x = (130 - w) / 2, y = (110 - h) / 2;
  return `<svg class="qsvg wide" viewBox="0 0 130 110" role="img" aria-label="útvar"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="var(--c-mat-soft)" stroke="currentColor" stroke-width="3"/><text x="65" y="${y - 6}" text-anchor="middle" font-size="12" font-weight="800" fill="currentColor">${a} ${unit}</text><text x="${x + w + 5}" y="${y + h / 2 + 4}" font-size="12" font-weight="800" fill="currentColor">${b}</text></svg>`;
}
const countHtml = (n, e) => `<div class="countgrid">${Array.from({ length: n }, (_, i) => `<span style="animation-delay:${i * 40}ms">${e}</span>`).join('')}</div>`;
const coinHtml = vals => `<div class="coins">${vals.map((v, i) => `<span class="coin c${v}" style="animation-delay:${i * 60}ms">${v}&nbsp;€</span>`).join('')}</div>`;

/* ===== Slovné úlohy ===== */
const KIDS = [['Ema', 1], ['Tomáš', 0], ['Sofia', 1], ['Jakub', 0], ['Nina', 1], ['Matej', 0], ['Lea', 1], ['Samko', 0], ['Natália', 1], ['Adam', 0]];
const NOUNS = [['cukrík', 'cukríky', 'cukríkov'], ['nálepka', 'nálepky', 'nálepiek'], ['guľôčka', 'guľôčky', 'guľôčok'], ['jablko', 'jablká', 'jabĺk'], ['pastelka', 'pastelky', 'pasteliek'], ['kartička', 'kartičky', 'kartičiek'], ['orech', 'orechy', 'orechov']];
function wordProblem(level) {
  const [n, f] = pick(KIDS); const N = pick(NOUNS); const w = k => plural(k, N[0], N[1], N[2]);
  const t = level <= 2 ? R(0, 2) : R(0, 4);
  const max = level <= 2 ? 50 : (level === 3 ? 400 : 3000);
  if (t === 0) { const a = R(3, max), b = R(2, max); return { q: `${n} má ${fmt(a)} ${w(a)}. ${f ? 'Dostala' : 'Dostal'} ešte ${fmt(b)}. Koľko ${N[2]} má teraz?`, a: a + b, ex: `${fmt(a)} + ${fmt(b)} = ${fmt(a + b)}` }; }
  if (t === 1) { const a = R(6, max), b = R(2, a - 1); return { q: `${n} ${f ? 'mala' : 'mal'} ${fmt(a)} ${w(a)}. ${fmt(b)} ${f ? 'rozdala' : 'rozdal'} kamarátom. Koľko ${N[2]} ${f ? 'jej' : 'mu'} zostalo?`, a: a - b, ex: `${fmt(a)} − ${fmt(b)} = ${fmt(a - b)}` }; }
  if (t === 2) { const [m] = pick(KIDS.filter(k => k[0] !== n)); const a = R(3, max), b = R(2, Math.max(3, Math.floor(max / 3))); return { q: `${n} má ${fmt(a)} ${w(a)}. ${m} má o ${fmt(b)} viac. Koľko ${N[2]} má ${m}?`, a: a + b, ex: `„o ${fmt(b)} viac“ znamená sčítať: ${fmt(a)} + ${fmt(b)} = ${fmt(a + b)}` }; }
  if (t === 3) { const a = R(2, 9), b = R(2, level === 4 ? 12 : 9); return { q: `V ${a} krabičkách je po ${b} ${w(b)}. Koľko ${N[2]} je spolu?`, a: a * b, ex: `${a} · ${b} = ${a * b}` }; }
  const b = R(2, 9), c = R(2, level === 4 ? 12 : 9); return { q: `${n} rozdelí ${b * c} ${w(b * c)} rovnako medzi ${b} kamarátov. Koľko dostane každý?`, a: c, ex: `${b * c} : ${b} = ${c}` };
}

/* ===== Matematika – generátory ===== */
const EMO = [['🍎', 'jabĺk'], ['🐞', 'lienok'], ['⭐', 'hviezdičiek'], ['🎈', 'balónov'], ['🐟', 'rybičiek'], ['🌸', 'kvetov'], ['🚗', 'áut'], ['🍓', 'jahôd'], ['🐥', 'kuriatok'], ['⚽', 'lôpt'], ['🐸', 'žabiek'], ['🍌', 'banánov'], ['🦋', 'motýľov'], ['🐝', 'včiel']];
function addSub(max, opts = {}) {
  if (Math.random() < .5) { const a = R(opts.min || 0, max), b = R(0, max - a); return { q: `${fmt(a)} + ${fmt(b)} = ?`, a: a + b }; }
  const a = R(opts.min || 1, max), b = R(0, a); return { q: `${fmt(a)} − ${fmt(b)} = ?`, a: a - b };
}
const DIGIT_PLACES = ['jednotiek', 'desiatok', 'stoviek', 'tisícok', 'desaťtisícok', 'stotisícok'];

const MATH = [
  /* 1. ročník */
  { id: 'm1-pocet', g: 1, name: 'Počítame obrázky', icon: '🍎', gen() { const n = R(1, 12), [e, nm] = pick(EMO); return { q: `Koľko je tu ${nm}?`, html: countHtml(n, e), a: n, ex: `Je tu ${n} ${nm}.` }; } },
  { id: 'm1-do10', g: 1, name: 'Sčítanie a odčítanie do 10', icon: '➕', gen: () => addSub(10) },
  { id: 'm1-doplnanie', g: 1, name: 'Doplň číslo', icon: '🧩', gen() { const s = R(3, 10), a = R(0, s); return Math.random() < .5 ? { q: `${a} + ? = ${s}`, a: s - a, ex: `${a} + ${s - a} = ${s}` } : { q: `${s} − ? = ${a}`, a: s - a, ex: `${s} − ${s - a} = ${a}` }; } },
  { id: 'm1-do20', g: 1, name: 'Počítame do 20', icon: '🔢', gen() { const a = R(0, 9), b = R(0, 9 - a); return Math.random() < .5 ? { q: `${10 + a} + ${b} = ?`, a: 10 + a + b } : { q: `${10 + a + b} − ${b} = ?`, a: 10 + a }; } },
  { id: 'm1-porov', g: 1, name: 'Väčšie, menšie, rovné', icon: '⚖️', gen() { const a = R(0, 20), b = Math.random() < .2 ? a : R(0, 20); const s = a > b ? '>' : a < b ? '<' : '='; return { q: 'Ktorý znak patrí do krúžku?', html: `<div class="bigeq">${a} <span class="slot">?</span> ${b}</div>`, a: s, w: ['<', '>', '='].filter(x => x !== s), speak: `${a} a ${b}. Ktorý znak patrí medzi ne?`, ex: `${a} ${s} ${b}` }; } },
  { id: 'm1-rad', g: 1, name: 'Číselný rad', icon: '🐛', gen() { const t = R(0, 2), n = R(1, 18); if (t === 0) return { q: `Ktoré číslo nasleduje po čísle ${n}?`, a: n + 1 }; if (t === 1) return { q: `Ktoré číslo je tesne pred číslom ${n + 1}?`, a: n }; const s = R(0, 15); return { q: 'Ktoré číslo chýba?', html: `<div class="bigeq">${s}, ${s + 1}, <span class="slot">?</span>, ${s + 3}</div>`, a: s + 2, speak: `${s}, ${s + 1}, niečo, ${s + 3}. Ktoré číslo chýba?` }; } },
  { id: 'm1-utvary', g: 1, name: 'Geometrické útvary', icon: '🔺', gen() { const k = pick(['kruh', 'štvorec', 'obdĺžnik', 'trojuholník']); return { q: 'Ako sa volá tento útvar?', html: shapeSvg(k, pick(['var(--c-mat-soft)', 'var(--c-sjl-soft)', 'var(--sun-soft)'])), a: k, w: ['kruh', 'štvorec', 'obdĺžnik', 'trojuholník'].filter(x => x !== k) }; } },

  /* 2. ročník */
  { id: 'm2-prechod', g: 2, name: 'Cez desiatku do 20', icon: '🚀', gen() { const a = R(3, 9), b = R(11 - a, 9); return Math.random() < .5 ? { q: `${a} + ${b} = ?`, a: a + b, ex: `${a} + ${10 - a} = 10, potom 10 + ${a + b - 10} = ${a + b}` } : { q: `${a + b} − ${b} = ?`, a: a, ex: `${a + b} − ${a + b - 10} = 10, potom 10 − ${10 - a} = ${a}` }; } },
  { id: 'm2-do100', g: 2, name: 'Sčítanie a odčítanie do 100', icon: '💯', gen() { if (Math.random() < .3) { const a = R(1, 9) * 10, b = R(0, (100 - a) / 10) * 10; return { q: `${a} + ${b} = ?`, a: a + b }; } return addSub(100, { min: 10 }); } },
  { id: 'm2-nasob', g: 2, name: 'Násobenie a delenie 2–5', icon: '✖️', gen() { const a = R(2, 5), b = R(0, 10); if (Math.random() < .6 || b === 0) return { q: `${a} · ${b} = ?`, a: a * b }; return { q: `${a * b} : ${a} = ?`, a: b, ex: `${a} · ${b} = ${a * b}, preto ${a * b} : ${a} = ${b}` }; } },
  { id: 'm2-hodiny', g: 2, name: 'Koľko je hodín?', icon: '🕒', gen() { const h = R(1, 12), m = pick([0, 30, 15, 45, 0]); const f = (hh, mm) => `${hh}:${String(mm).padStart(2, '0')}`; const a = f(h, m); const w = new Set([f(h % 12 + 1, m), f(h, (m + 30) % 60), f((h + 10) % 12 + 1, m), f(m === 0 ? 12 : m / 5, h * 5 % 60)]); w.delete(a); return { q: 'Koľko je hodín?', html: clockSvg(h, m), a, w: [...w].slice(0, 3), ex: 'Malá ručička ukazuje hodiny, veľká minúty.' }; } },
  { id: 'm2-peniaze', g: 2, name: 'Peniaze a jednotky', icon: '💶', gen() { const t = R(0, 2); if (t === 0) { const v = Array.from({ length: R(2, 5) }, () => pick([1, 2, 2, 5, 10])).sort((a, b) => b - a); return { q: 'Koľko eur je spolu?', html: coinHtml(v), a: v.reduce((s, x) => s + x, 0), speak: `Mám ${v.join(' eur, ')} eur. Koľko eur je spolu?` }; } if (t === 1) { const k = R(1, 9); return { q: `${k} m = ? cm`, a: k * 100, ex: '1 meter má 100 centimetrov.' }; } const k = R(1, 9); return { q: `${k} € = ? centov`, a: k * 100, ex: '1 euro má 100 centov.' }; } },
  { id: 'm2-slovne', g: 2, name: 'Slovné úlohy', icon: '📖', gen: () => wordProblem(2) },

  /* 3. ročník */
  { id: 'm3-nasobilka', g: 3, name: 'Malá násobilka', icon: '✖️', gen() { const a = R(1, 10), b = R(1, 10); return { q: `${a} · ${b} = ?`, a: a * b }; } },
  { id: 'm3-delenie', g: 3, name: 'Delenie', icon: '➗', gen() { const a = R(1, 10), b = R(1, 10); return { q: `${a * b} : ${a} = ?`, a: b, ex: `${a} · ${b} = ${a * b}` }; } },
  { id: 'm3-do1000', g: 3, name: 'Počítame do 1 000', icon: '🏔️', gen: () => addSub(1000, { min: 100 }) },
  { id: 'm3-rad', g: 3, name: 'Čísla do 10 000', icon: '🏗️', gen() { const n = R(1000, 9999), d = String(n).split('').map(Number); if (Math.random() < .5) { const p = R(0, 3); return { q: `Aká číslica je na mieste ${DIGIT_PLACES[p]} v čísle ${fmt(n)}?`, a: d[3 - p], w: shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter(x => x !== d[3 - p])).slice(0, 3), ex: `${fmt(n)} = ${d[0]} T, ${d[1]} S, ${d[2]} D, ${d[3]} J` }; } return { q: 'Ktoré číslo to je?', html: `<div class="bigeq small">${d[0]} T + ${d[1]} S + ${d[2]} D + ${d[3]} J</div><div class="hint">T – tisícky, S – stovky, D – desiatky, J – jednotky</div>`, a: n, speak: `${d[0]} tisícky, ${d[1]} stovky, ${d[2]} desiatky a ${d[3]} jednotky. Ktoré číslo to je?` }; } },
  { id: 'm3-zaokr', g: 3, name: 'Zaokrúhľovanie', icon: '🎯', gen() { const n = R(101, 999); const ten = Math.random() < .6; const k = ten ? 10 : 100; const a = Math.round(n / k) * k; const w = new Set([a + k, a - k, Math.floor(n / k) * k === a ? Math.ceil(n / k) * k : Math.floor(n / k) * k].filter(x => x !== a && x > 0)); return { q: `Zaokrúhli číslo ${n} na ${ten ? 'desiatky' : 'stovky'}.`, a, w: [...w].slice(0, 3), ex: `Pozri sa na číslicu ${ten ? 'jednotiek' : 'desiatok'}: 0–4 zaokrúhľujeme nadol, 5–9 nahor.` }; } },
  { id: 'm3-dlzka', g: 3, name: 'Jednotky dĺžky', icon: '📏', gen() { const [b, s, f] = pick([['m', 'cm', 100], ['dm', 'cm', 10], ['cm', 'mm', 10], ['km', 'm', 1000], ['m', 'dm', 10]]); const k = R(1, 9); return Math.random() < .65 ? { q: `${k} ${b} = ? ${s}`, a: k * f, ex: `1 ${b} = ${fmt(f)} ${s}` } : { q: `${fmt(k * f)} ${s} = ? ${b}`, a: k, ex: `1 ${b} = ${fmt(f)} ${s}` }; } },
  { id: 'm3-slovne', g: 3, name: 'Slovné úlohy', icon: '📖', gen: () => wordProblem(3) },

  /* 4. ročník */
  { id: 'm4-pisomne', g: 4, name: 'Väčšie čísla a násobenie', icon: '🧮', gen() { const t = R(0, 2); if (t === 0) { const a = R(12, 99), b = R(2, 9); return { q: `${a} · ${b} = ?`, a: a * b }; } if (t === 1) { const a = R(1000, 6000), b = R(100, 3999); return { q: `${fmt(a)} + ${fmt(b)} = ?`, a: a + b }; } const a = R(2000, 9999), b = R(100, a - 100); return { q: `${fmt(a)} − ${fmt(b)} = ?`, a: a - b }; } },
  { id: 'm4-zvysok', g: 4, name: 'Delenie so zvyškom', icon: '🍕', gen() { const d = R(2, 9), q = R(2, 9), r = R(1, d - 1 || 1) % d; const n = d * q + r; const f = (a, b) => `${a} zv. ${b}`; const a = f(q, r); const w = new Set([f(q + 1, r), f(q, (r + 1) % d), f(q - 1, r + d > 9 ? r : r + d), f(q, d)]); w.delete(a); return { q: `${n} : ${d} = ?`, a, w: [...w].slice(0, 3), ex: `${d} · ${q} = ${d * q}, zvyšok ${n} − ${d * q} = ${r}` }; } },
  { id: 'm4-velke', g: 4, name: 'Čísla do milióna', icon: '🌌', gen() { if (Math.random() < .5) { const n = R(10000, 999999), s = String(n), p = R(0, s.length - 1), dg = Number(s[s.length - 1 - p]); return { q: `Aká číslica je na mieste ${DIGIT_PLACES[p]} v čísle ${fmt(n)}?`, a: dg, w: shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter(x => x !== dg)).slice(0, 3) }; } const base = R(100, 990) * 100; const v = shuffle([base, base + R(1, 9) * 10, base - R(1, 9) * 100, base + R(1, 9) * 1000]); const mx = Math.max(...v); return { q: 'Ktoré číslo je najväčšie?', a: fmt(mx), w: v.filter(x => x !== mx).map(fmt) }; } },
  { id: 'm4-jednotky', g: 4, name: 'Hmotnosť, objem a čas', icon: '⚖️', gen() { const [b, s, f] = pick([['kg', 'g', 1000], ['t', 'kg', 1000], ['l', 'ml', 1000], ['l', 'dl', 10], ['h', 'min', 60], ['min', 's', 60]]); const k = R(1, 9); return Math.random() < .7 ? { q: `${k} ${b} = ? ${s}`, a: k * f, ex: `1 ${b} = ${fmt(f)} ${s}` } : { q: `${fmt(k * f)} ${s} = ? ${b}`, a: k, ex: `1 ${b} = ${fmt(f)} ${s}` }; } },
  { id: 'm4-obvod', g: 4, name: 'Obvod štvorca a obdĺžnika', icon: '🟦', gen() { if (Math.random() < .4) { const a = R(2, 15); return { q: 'Aký je obvod štvorca (v cm)?', html: rectSvg(a, a, 'cm'), a: 4 * a, speak: `Štvorec má stranu ${a} centimetrov. Aký je jeho obvod?`, ex: `o = 4 · a = 4 · ${a} = ${4 * a} cm` }; } const a = R(4, 20), b = R(2, a - 1); return { q: 'Aký je obvod obdĺžnika (v cm)?', html: rectSvg(a, b, 'cm'), a: 2 * (a + b), speak: `Obdĺžnik má strany ${a} a ${b} centimetrov. Aký je jeho obvod?`, ex: `o = 2 · (a + b) = 2 · (${a} + ${b}) = ${2 * (a + b)} cm` }; } },
  { id: 'm4-casti', g: 4, name: 'Polovica, tretina, štvrtina', icon: '🍰', gen() { const [nm, d, fr] = pick([['polovica', 2, '½'], ['tretina', 3, '⅓'], ['štvrtina', 4, '¼'], ['pätina', 5, '⅕'], ['desatina', 10, '⅒']]); const k = R(2, 12); return { q: `Koľko je ${nm} (${fr}) z čísla ${d * k}?`, a: k, ex: `${d * k} : ${d} = ${k}` }; } },
  { id: 'm4-slovne', g: 4, name: 'Slovné úlohy', icon: '📖', gen: () => wordProblem(4) }
];

/* ===== Slovenčina ===== */
const ABC_FULL = 'A Á Ä B C Č D Ď DZ DŽ E É F G H CH I Í J K L Ĺ Ľ M N Ň O Ó Ô P Q R Ŕ S Š T Ť U Ú V W X Y Ý Z Ž'.split(' ');
const ABC1 = ['A', 'B', 'C', 'Č', 'D', 'Ď', 'DZ', 'DŽ', 'E', 'F', 'G', 'H', 'CH', 'I', 'J', 'K', 'L', 'Ľ', 'M', 'N', 'Ň', 'O', 'P', 'R', 'S', 'Š', 'T', 'Ť', 'U', 'V', 'Y', 'Z', 'Ž'];
const PICS = '🐱|mačka,🐶|pes,🍎|jablko,🐟|ryba,🌞|slnko,🏠|dom,🚗|auto,🐘|slon,🦉|sova,🐭|myš,🌳|strom,🐻|medveď,🍌|banán,🦆|kačka,🐸|žaba,🐝|včela,🥕|mrkva,⚽|lopta,🐰|zajac,🦊|líška,🐴|kôň,🍐|hruška,🔑|kľúč,🌙|mesiac,🐌|slimák,🚂|vlak,🎈|balón,🐢|korytnačka,🦒|žirafa,🍋|citrón,🐓|kohút,🧀|syr,🥚|vajce,🐑|ovca,🦔|jež,🐍|had,🍇|hrozno,🐞|lienka,🌷|tulipán,🍉|melón,🐧|tučniak,🦁|lev,🐄|krava,☂️|dáždnik,📚|kniha,✏️|ceruzka,🦋|motýľ,🏰|hrad,🍦|zmrzlina,🦀|rak,🍄|hríb,🎁|darček,🐐|koza,⭐|hviezda,🍞|chlieb,🧦|ponožka,👑|koruna,🚲|bicykel,🐿️|veverička,🌹|ruža'.split(',').map(s => s.split('|'));
const firstLetter = w => w.toLowerCase().startsWith('ch') ? 'CH' : w.toLowerCase().startsWith('dz') ? (w[2] === 'ž' ? 'DŽ' : 'DZ') : w[0].toUpperCase();
const SYL = 'ma-ma,o-co,au-to,pes,dom,les,ru-ka,no-ha,la-vi-ca,ko-ru-na,ba-nán,ko-le-so,te-le-fón,ka-ra-me-la,po-ma-ly,pa-ra-daj-ka,te-le-ví-zor,dy-ňa,ry-ba,mo-týľ,ta-ti-no,sto-lič-ka,vlak,syr,kni-ha,ba-bič-ka,ce-ruz-ka,ja-ho-da,ze-mi-ak,slon,ko-za,va-ja-tko,ho-di-ny,pa-pu-ča,ka-pu-sta,čo-ko-lá-da,dra-ka,lo-pa-ta,pi-a-no'.split(',').filter(w => w !== 'va-ja-tko' && w !== 'dra-ka' && w !== 'pi-a-no');

const VYB = {
  b: 'b_k|ý|býk,b_t|y|byt,b_strý|y|bystrý,b_linky|y|bylinky,kob_la|y|kobyla,ob_vateľ|y|obyvateľ,b_dlisko|y|bydlisko,b_cykel|i|bicykel,b_ely|i|biely,b_tka|i|bitka',
  m: 'm_š|y|myš,m_dlo|y|mydlo,hm_z|y|hmyz,m_liť sa|ý|mýliť sa,m_slieť|y|myslieť,m_nca|i|slniečko,m_ska|i|miska,m_lý|i|milý,priat_ľ? |x|x',
  p: 'p_tať sa|ý|pýtať sa,p_cha|ý|pýcha,kop_to|y|kopyto,p_sk|y|pysk,p_lot|i|pilot,p_rát|i|pirát,p_vnica|i|pivnica,p_skor|i|piskor',
  r: 'r_ba|y|ryba,r_chlo|ý|rýchlo,r_s|y|rys,r_ža|y|ryža,r_bník|y|rybník,r_ť|y|ryť,hr_zť|ý|hrýzť,r_bezle|í|ríbezle,r_tier|y|rytier',
  s: 's_r|y|syr,s_n|y|syn,s_korka|ý|sýkorka,s_pať|y|sypať,s_tý|ý|sýty,s_la|i|sila,s_vý|i|sivý,s_rup|i|sirup,s_čať|y|syčať',
  v: 'v_soký|y|vysoký,v_skať|ý|výskať,v_r|ý|výr,v_ť|y|vyť,v_dlička|i|vidlička,v_dieť|i|vidieť,v_hra|ý|výhra,v_no|í|víno',
  z: 'jaz_k|y|jazyk,naz_vať|ý|nazývať,z_ma|i|zima,z_vať|í|zívať,z_mný|i|zimný',
  l: 'l_žica|y|lyžica,l_ko|ý|lýko,l_tko|ý|lýtko,pl_n|y|plyn,pl_tvať|y|plytvať,bl_skať sa|y|blýskať sa,l_ška|í|líška,l_pa|i|lipa,l_st|i|list,bl_zko|í|blízko,l_mon? |x|x'
};
const vyb = keys => keys.flatMap(k => VYB[k].split(',').map(s => s.split('|')).filter(x => x[1] !== 'x'));
const allVyb = () => vyb(['b', 'm', 'p', 'r', 's', 'v', 'z', 'l']);
function spellVariants(word) {
  const i = [...word].findIndex(c => 'yýií'.includes(c));
  const base = word.slice(0, i), rest = word.slice(i + 1);
  return ['y', 'ý', 'i', 'í'].map(c => base + c + rest);
}

const SJL = [
  /* 1. ročník */
  { id: 's1-pismeno', g: 1, name: 'Prvé písmeno', icon: '🔤', gen() { const [e, w] = pick(PICS); const L = firstLetter(w); const L0 = L.length; return { q: 'Na aké písmeno začína toto slovo?', html: `<div class="bigemoji">${e}</div><div class="caption">${'?'.repeat(1)}${w.slice(L0)}</div>`, speak: `${w}. Na aké písmeno začína slovo ${w}?`, a: L, w: shuffle(ABC1.filter(x => x !== L)).slice(0, 3), ex: `${cap(w)} začína na písmeno ${L}.` }; }, pex: () => shuffle(PICS).slice(0, 6).map(([e, w]) => [e, w]) },
  { id: 's1-abeceda', g: 1, name: 'Abeceda', icon: '🅰️', gen() { const A = ABC_FULL; const i = R(0, A.length - 4); const row = A.slice(i, i + 4); const miss = R(1, 3); const a = row[miss]; const w = shuffle(A.filter(x => x !== a && !row.includes(x)).slice(Math.max(0, i - 3), i + 8)).slice(0, 3); return { q: 'Ktoré písmeno chýba v rade?', html: `<div class="abcrow">${row.map((x, k) => k === miss ? '<span class="slot">?</span>' : `<span>${x}</span>`).join('')}</div><div class="hint">Písmená idú za sebou ako v abecede.</div>`, speak: 'Ktoré písmeno chýba v rade? Písmená idú za sebou ako v abecede.', a, w, ex: `V abecede idú za sebou: ${row.join(', ')}.` }; } },
  { id: 's1-slabiky', g: 1, name: 'Slabiky', icon: '👏', gen() { const s = pick(SYL); const n = s.split('-').length; return { q: `Koľko slabík má slovo „${s.replace(/-/g, '')}“?`, a: n, w: [1, 2, 3, 4, 5].filter(x => x !== n).slice(0, 3), ex: `${s.toUpperCase().replace(/-/g, ' – ')} (${n})`, speak: `Koľko slabík má slovo ${s.replace(/-/g, '')}? Vytlieskaj si ho.` }; } },
  { id: 's1-hlasky', g: 1, type: 'cat', name: 'Samohlásky a spoluhlásky', icon: '🗣️', prompt: 'Písmeno {x} je…', choices: ['samohláska', 'spoluhláska'], items: 'A|samohláska,E|samohláska,I|samohláska,O|samohláska,U|samohláska,Y|samohláska,M|spoluhláska,B|spoluhláska,S|spoluhláska,T|spoluhláska,L|spoluhláska,P|spoluhláska,K|spoluhláska,V|spoluhláska,D|spoluhláska,R|spoluhláska,Ž|spoluhláska,N|spoluhláska', ex: 'Samohlásky sú a, e, i, o, u, y (aj dlhé á, é, í, ó, ú, ý).' },
  { id: 's1-velke', g: 1, type: 'qa', name: 'Veľké písmeno', icon: '🔠', items: 'Ktoré slovo píšeme s veľkým písmenom?|Peter|pes;stôl;lopta,Ktoré slovo píšeme s veľkým písmenom?|Bratislava|mesto;ulica;rieka,Ktoré slovo píšeme s veľkým písmenom?|Zuzka|mačka;kniha;lavica,Ktoré slovo píšeme s veľkým písmenom?|Dunaj|voda;more;potok,Ktoré slovo píšeme s veľkým písmenom?|Slovensko|krajina;dedina;hora,Ktoré slovo píšeme s veľkým písmenom?|Tatry|kopec;skala;les,Ktoré slovo píšeme s veľkým písmenom?|Miško|chlapec;kamarát;brat,Ktoré slovo píšeme s veľkým písmenom?|Košice|dom;škola;obchod,Ako píšeme prvé písmeno na začiatku vety?|veľké|malé;tlačené;žiadne,Čo dáme na koniec oznamovacej vety?|bodku|čiarku;otáznik;pomlčku', ex: 'Mená ľudí, zvierat, miest, riek a hôr píšeme s veľkým začiatočným písmenom.' },

  /* 2. ročník */
  { id: 's2-hlasky', g: 2, type: 'cat', name: 'Samohlásky, spoluhlásky, dvojhlásky', icon: '🗣️', prompt: '{x} je…', choices: ['samohláska', 'spoluhláska', 'dvojhláska'], items: 'a|samohláska,é|samohláska,i|samohláska,ó|samohláska,u|samohláska,ý|samohláska,ä|samohláska,ia|dvojhláska,ie|dvojhláska,iu|dvojhláska,ô|dvojhláska,b|spoluhláska,k|spoluhláska,m|spoluhláska,š|spoluhláska,ch|spoluhláska,dž|spoluhláska,r|spoluhláska,ť|spoluhláska', ex: 'Dvojhlásky sú ia, ie, iu, ô.' },
  { id: 's2-spoluhlasky', g: 2, type: 'cat', name: 'Tvrdé, mäkké, obojaké', icon: '🧱', prompt: 'Spoluhláska {x} je…', choices: ['tvrdá', 'mäkká', 'obojaká'], items: 'd|tvrdá,t|tvrdá,n|tvrdá,l|tvrdá,g|tvrdá,h|tvrdá,ch|tvrdá,k|tvrdá,ď|mäkká,ť|mäkká,ň|mäkká,ľ|mäkká,c|mäkká,dz|mäkká,j|mäkká,ž|mäkká,š|mäkká,č|mäkká,dž|mäkká,b|obojaká,m|obojaká,p|obojaká,r|obojaká,s|obojaká,v|obojaká,z|obojaká,f|obojaká', ex: 'Tvrdé: d, t, n, l, g, h, ch, k. Mäkké: ď, ť, ň, ľ, c, dz, j, ž, š, č, dž. Obojaké: b, m, p, r, s, v, z, f.' },
  { id: 's2-yi', g: 2, type: 'fill', name: 'Y alebo I?', icon: '✍️', choices: ['y', 'ý', 'i', 'í'], items: 'k_tica|y|kytica,ch_ba|y|chyba,ch_tať|y|chytať,k_slý|y|kyslý,h_dina|y|hydina,k_vadlo|y|kyvadlo,k_vať|ý|kývať,ch_bať|ý|chýbať,h_bať|ý|hýbať,k_chať|ý|kýchať,č_stý|i|čistý,š_ška|i|šiška,ž_rafa|i|žirafa,c_buľa|i|cibuľa,j_skra|i|iskra?,š_kovný|i|šikovný,č_tanka|í|čítanka,ž_vot|i|život,c_trón|i|citrón,ž_ak|i|žiak,č_apka|i|čiapka,š_dlo|i|šidlo,ž_hľava|i|žihľava', ex: 'Po tvrdých spoluhláskach píšeme y, ý. Po mäkkých spoluhláskach píšeme i, í.' },
  { id: 's2-vety', g: 2, type: 'cat', name: 'Druhy viet', icon: '💬', prompt: 'Aká je to veta? „{x}“', choices: ['oznamovacia', 'opytovacia', 'rozkazovacia', 'želacia'], items: 'Vonku prší.|oznamovacia,Mám nové topánky.|oznamovacia,Mačka spí na gauči.|oznamovacia,Zajtra ideme do kina.|oznamovacia,Kedy prídeš domov?|opytovacia,Kde je moja taška?|opytovacia,Ako sa voláš?|opytovacia,Máš rád zmrzlinu?|opytovacia,Zatvor dvere!|rozkazovacia,Uprac si izbu!|rozkazovacia,Poď sem!|rozkazovacia,Nebehaj po chodbe!|rozkazovacia,Keby už bolo leto!|želacia,Kiežby sme vyhrali!|želacia,Nech sa ti darí!|želacia,Keby som mal psa!|želacia', ex: 'Oznamovacia končí bodkou, opytovacia otáznikom. Rozkazovacia a želacia končia výkričníkom.' },
  { id: 's2-abc', g: 2, name: 'Abecedné poradie', icon: '📚', gen() { const pool = shuffle('auto,banán,cesta,čaj,dom,erb,fazuľa,guma,hrad,chlieb,izba,jahoda,kniha,lopta,mama,noc,oblak,pero,ruka,slon,šál,tráva,ucho,voda,zima,žaba'.split(',')); const used = new Set(), w = []; for (const x of pool) { const f = firstLetter(x); if (!used.has(f)) { used.add(f); w.push(x); } if (w.length === 4) break; } const s = w.slice().sort(new Intl.Collator('sk').compare); return Math.random() < .5 ? { q: 'Ktoré slovo je v abecede prvé?', a: s[0], w: s.slice(1), ex: `Poradie: ${s.join(', ')}` } : { q: 'Ktoré slovo je v abecede posledné?', a: s[3], w: s.slice(0, 3), ex: `Poradie: ${s.join(', ')}` }; } },
  { id: 's2-opak', g: 2, type: 'qa', name: 'Slová opačného významu', icon: '🔄', items: 'Opak slova „veľký“ je…|malý|vysoký;dlhý;silný,Opak slova „deň“ je…|noc|ráno;večer;týždeň,Opak slova „teplý“ je…|studený|horúci;mokrý;mäkký,Opak slova „rýchly“ je…|pomalý|bystrý;silný;veselý,Opak slova „veselý“ je…|smutný|šťastný;milý;zlý,Opak slova „vysoký“ je…|nízky|úzky;krátky;tenký,Opak slova „otvoriť“ je…|zatvoriť|odomknúť;vojsť;zapnúť,Opak slova „hore“ je…|dole|vpredu;vedľa;vnútri,Opak slova „starý“ je…|mladý|múdry;dobrý;malý,Opak slova „plný“ je…|prázdny|ťažký;čistý;mokrý,Opak slova „svetlo“ je…|tma|lampa;slnko;deň,Opak slova „začiatok“ je…|koniec|stred;štart;cesta,Opak slova „tvrdý“ je…|mäkký|ťažký;pevný;silný,Opak slova „smiať sa“ je…|plakať|kričať;spievať;skákať' },

  /* 3. ročník */
  { id: 's3-vybrane-bm', g: 3, type: 'fill', name: 'Vybrané slová po B, M, P', icon: '🐂', choices: ['y', 'ý', 'i', 'í'], items: () => vyb(['b', 'm', 'p']), ex: 'Po obojakých spoluhláskach píšeme y, ý vo vybraných slovách a slovách príbuzných.' },
  { id: 's3-vybrane-rs', g: 3, type: 'fill', name: 'Vybrané slová po R, S, V, Z', icon: '🐟', choices: ['y', 'ý', 'i', 'í'], items: () => vyb(['r', 's', 'v', 'z']), ex: 'Po obojakých spoluhláskach píšeme y, ý vo vybraných slovách a slovách príbuzných.' },
  { id: 's3-druhy', g: 3, type: 'cat', name: 'Slovné druhy', icon: '🏷️', prompt: 'Slovo „{x}“ je…', choices: ['podstatné meno', 'prídavné meno', 'sloveso'], items: 'pes|podstatné meno,škola|podstatné meno,Martin|podstatné meno,jablko|podstatné meno,stolička|podstatné meno,mesto|podstatné meno,les|podstatné meno,žltý|prídavné meno,veselá|prídavné meno,vysoký|prídavné meno,pekné|prídavné meno,rýchly|prídavné meno,drevený|prídavné meno,múdra|prídavné meno,skáče|sloveso,číta|sloveso,beží|sloveso,spievať|sloveso,píše|sloveso,varí|sloveso,spí|sloveso,kreslí|sloveso', ex: 'Podstatné mená: kto? čo? Prídavné mená: aký? aká? aké? Slovesá: čo robí?' },
  { id: 's3-rod', g: 3, type: 'cat', name: 'Rod podstatných mien', icon: '👪', prompt: 'Podstatné meno „{x}“ je rodu…', choices: ['mužského', 'ženského', 'stredného'], items: 'chlapec|mužského,stôl|mužského,strom|mužského,pes|mužského,dedko|mužského,hrad|mužského,dievča|stredného,mesto|stredného,jablko|stredného,mlieko|stredného,more|stredného,kura|stredného,žena|ženského,ruža|ženského,lavica|ženského,kniha|ženského,mačka|ženského,kosť|ženského', ex: 'Ten (mužský rod), tá (ženský rod), to (stredný rod).' },
  { id: 's3-podobne', g: 3, type: 'qa', name: 'Slová podobného významu', icon: '🤝', items: 'Podobný význam ako „pekný“ má…|krásny|škaredý;veľký;smutný,Podobný význam ako „hovoriť“ má…|rozprávať|mlčať;počúvať;spať,Podobný význam ako „bežať“ má…|utekať|stáť;sedieť;ležať,Podobný význam ako „veľký“ má…|obrovský|drobný;malý;nízky,Podobný význam ako „smutný“ má…|zarmútený|veselý;šťastný;rád,Podobný význam ako „múdry“ má…|rozumný|hlúpy;lenivý;tichý,Podobný význam ako „začať“ má…|začínať|skončiť;prestať;zastaviť,Podobný význam ako „rýchlo“ má…|chytro|pomaly;potichu;neskoro,Podobný význam ako „kamarát“ má…|priateľ|nepriateľ;sused;učiteľ,Podobný význam ako „pozerať“ má…|hľadieť|počuť;voňať;chutnať' },

  /* 4. ročník */
  { id: 's4-vybrane-l', g: 4, type: 'fill', name: 'Vybrané slová po L', icon: '🥄', choices: ['y', 'ý', 'i', 'í'], items: () => vyb(['l']), ex: 'Vybrané slová po L: lyže, lyko, lýtko, plyn, plytvať, blýskať sa, mlyn, slýchať…' },
  { id: 's4-vybrane-mix', g: 4, type: 'fill', name: 'Všetky vybrané slová', icon: '🏆', choices: ['y', 'ý', 'i', 'í'], items: allVyb },
  { id: 's4-spravne', g: 4, name: 'Ktoré slovo je správne?', icon: '🔍', gen() { const [, , w] = pick(allVyb()); const v = spellVariants(w); return { q: 'Ktoré slovo je napísané správne?', a: w, w: v.filter(x => x !== w) }; } },
  { id: 's4-druhy', g: 4, type: 'cat', name: 'Slovné druhy', icon: '🏷️', prompt: 'Slovo „{x}“ je…', choices: ['podstatné meno', 'prídavné meno', 'zámeno', 'číslovka', 'sloveso', 'predložka'], items: 'kniha|podstatné meno,Anna|podstatné meno,auto|podstatné meno,zelený|prídavné meno,smutná|prídavné meno,ja|zámeno,ty|zámeno,on|zámeno,my|zámeno,ona|zámeno,päť|číslovka,dvaja|číslovka,prvý|číslovka,sto|číslovka,beží|sloveso,maľuje|sloveso,plávať|sloveso,na|predložka,pod|predložka,v|predložka,za|predložka,pred|predložka', ex: 'Zámená zastupujú mená (ja, ty, on). Číslovky vyjadrujú počet alebo poradie. Predložky stoja pred menami (na, pod, v).' },
  { id: 's4-rytmicky', g: 4, type: 'qa', name: 'Rytmické krátenie', icon: '🥁', items: 'Ktoré slovo je napísané správne?|krásny|krásný;krasný,Ktoré slovo je napísané správne?|múdry|múdrý;mudrý,Ktoré slovo je napísané správne?|biely|bielý;bíely,Ktoré slovo je napísané správne?|vlásky|vláský;vlaský,Ktoré slovo je napísané správne?|chválim|chválím;chvalím,Ktoré slovo je napísané správne?|zúbky|zúbký;zubký,Ktoré slovo je napísané správne?|trávnik|trávník;travník,Ktoré slovo je napísané správne?|mliečny|mliečný;mlíečny,Ktoré slovo je napísané správne?|básnička|básníčka;basníčka,Ktoré slovo je napísané správne?|kvietok|kvíetok;kvietók', ex: 'Rytmický zákon: v slovenčine nesmú ísť za sebou dve dlhé slabiky.' }
];

/* úprava: vyradenie neistých položiek */
SJL.find(t => t.id === 's2-yi').items = SJL.find(t => t.id === 's2-yi').items.split(',').filter(s => !s.includes('?')).join(',');

const SUBJECTS = {
  mat: { name: 'Matematika', short: 'Matika', icon: '🔢', topics: MATH },
  sjl: { name: 'Slovenčina', short: 'Slovina', icon: '📝', topics: SJL }
};
const ALL_TOPICS = [...MATH.map(t => ({ ...t, s: 'mat' })), ...SJL.map(t => ({ ...t, s: 'sjl' }))];
const TOPIC = Object.fromEntries(ALL_TOPICS.map(t => [t.id, t]));

/* ===== Tvorba otázok ===== */
function numOptions(a) {
  const c = new Set(); const d = [1, 2, 10, 3, -1, -2, -10, 5, 4, -3, 20, 100];
  for (const x of shuffle(d)) { const v = a + x; if (v >= 0 && v !== a) c.add(v); if (c.size >= 3) break; }
  return [...c];
}
function topicItems(t) {
  const raw = typeof t.items === 'function' ? t.items() : t.items.split(',').map(s => s.split('|'));
  return raw;
}
function autoEx(q) {
  const m = q.text.replace(/ /g, '').match(/^(\d+) ([+−·:]) (\d+) = \?$/);
  if (m) { const x = +m[1], y = +m[3], r = q.raw; const op = m[2];
    if (op === '+') return y <= 10 && x <= 20 ? `${x} + ${y} = ${r}. Tip: začni pri čísle ${x} a pripočítaj ${y}.` : `${x} + ${y} = ${r}. Tip: sčítaj najprv desiatky, potom jednotky.`;
    if (op === '−') return x <= 20 ? `${x} − ${y} = ${r}. Tip: od ${x} odpočítaj ${y} (môžeš si pomôcť prstami).` : `${x} − ${y} = ${r}. Skúška: ${r} + ${y} = ${x}.`;
    if (op === '·') return `${x} · ${y} = ${r}. Znamená to ${x}-krát ${y}${x <= 5 ? ': ' + Array(x).fill(y).join(' + ') : ''}.`;
    if (op === ':') return `${x} : ${y} = ${r}, lebo ${r} · ${y} = ${x}.`; }
  return '';
}
function makeQuestion(t, mode) {
  let q;
  if (t.gen) {
    const g = t.gen();
    const numeric = typeof g.a === 'number' && !g.w;
    q = { text: g.q, html: g.html || '', speak: g.speak || g.q, answer: String(typeof g.a === 'number' ? fmt(g.a) : g.a), raw: g.a, numeric, ex: g.ex || '' };
    let w = numeric ? numOptions(g.a) : g.w.slice();
    if (!numeric && typeof g.a === 'number' && w.length < 3) w = [...new Set([...w, ...numOptions(g.a)])].filter(x => x !== g.a).slice(0, 3);
    q.options = [g.a, ...w].map(x => typeof x === 'number' ? fmt(x) : String(x));
  } else if (t.type === 'qa') {
    const [qq, a, w, ex] = pick(topicItems(t));
    q = { text: qq, html: '', speak: qq, answer: a, options: [a, ...w.split(';')], ex: ex || t.ex || '' };
  } else if (t.type === 'cat') {
    const [x, c] = pick(topicItems(t));
    const others = shuffle(t.choices.filter(y => y !== c)).slice(0, 3);
    const txt = t.prompt.replace('{x}', x);
    q = { text: txt, html: '', speak: txt, answer: c, options: [c, ...others], keep: t.choices.length <= 4 ? t.choices : null, ex: t.ex || '' };
  } else if (t.type === 'vocab') {
    const items = topicItems(t); const [en, sk, e] = pick(items); const others = shuffle(items.filter(x => x[0] !== en)).slice(0, 3);
    if (Math.random() < .5) q = { text: `Čo znamená „${en}“?`, html: e ? `<div class="bigemoji">${e}</div>` : '', speak: en, speakLang: 'en-GB', answer: sk, options: [sk, ...others.map(x => x[1])], ex: `${en} = ${sk}` };
    else q = { text: `Ako sa po anglicky povie „${sk}“?`, html: '', speak: `Ako sa po anglicky povie ${sk}?`, answer: en, options: [en, ...others.map(x => x[0])], ex: `${sk} = ${en}`, sayAfter: en };
  } else if (t.type === 'fill') {
    const [w, c, full] = pick(topicItems(t));
    q = { text: 'Doplň správne písmeno:', html: `<div class="bigword">${w.replace('_', '<span class="slot">_</span>')}</div>`, speak: 'Doplň správne písmeno.', answer: c, options: t.choices.slice(), keep: t.choices, ex: `Správne: ${full}. ${t.ex || ''}`, full };
  }
  if (!q.ex) q.ex = autoEx(q);
  q.key = q.text + q.html + q.answer;
  q.options = q.keep ? q.keep.slice() : shuffle([...new Set(q.options)]);
  if (q.numeric && mode === 'quiz' && Math.random() < .4) q.input = true;
  return q;
}
function topicCards(t) {
  if (t.gen) {
    const out = [], seen = new Set();
    for (let i = 0; i < 40 && out.length < 10; i++) { const q = makeQuestion(t); if (seen.has(q.key)) continue; seen.add(q.key); out.push({ front: q.html ? q.html + `<div class="cq">${q.text}</div>` : q.text, back: q.answer, plain: !q.html, speak: q.speak }); }
    return out;
  }
  const items = shuffle(topicItems(t)).slice(0, 12);
  if (t.type === 'qa') return items.map(([q, a]) => ({ front: q, back: a, plain: true }));
  if (t.type === 'vocab') return items.map(([en, sk, e]) => ({ front: (e ? e + ' ' : '') + en, back: sk, plain: true, speak: en, speakLang: 'en-GB' }));
  if (t.type === 'cat') return items.map(([x, c]) => ({ front: t.prompt.replace('{x}', x).replace('…', '?'), back: c, plain: true, short: x }));
  if (t.type === 'fill') return items.map(([w, c, f]) => ({ front: w.replace('_', '▢'), back: f, plain: true }));
  return [];
}
function pexesoPairs(t) {
  let cards;
  if (t.type === 'cat') cards = []; else cards = topicCards(t);
  const out = [], backs = new Set(), fronts = new Set();
  for (const c of shuffle(cards)) {
    if (!c.plain) continue;
    const f = c.front.replace(' = ?', '').replace(/^Opak slova „(.+)“ je…$/, 'opak: $1').replace(/^Podobný význam ako „(.+)“ má…$/, 'ako: $1'), b = c.back;
    if (f.length > 24 || b.length > 16 || backs.has(b) || fronts.has(f)) continue;
    backs.add(b); fronts.add(f); out.push([f, b]);
    if (out.length === 6) break;
  }
  return out.length >= 4 ? out : null;
}

/* ===== Pravda / nepravda ===== */
function makeStatement(g) {
  const t = Math.random();
  if (t < .6) {
    let a, b, op, r;
    if (g === 1) { a = R(0, 10); b = R(0, 10 - a); op = Math.random() < .5 ? '+' : '−'; if (op === '−') { const x = a + b; r = x - b; a = x; } else r = a + b; }
    else if (g === 2) { if (Math.random() < .5) { a = R(2, 5); b = R(1, 10); op = '·'; r = a * b; } else { a = R(10, 60); b = R(1, 39); op = '+'; r = a + b; } }
    else if (g === 3) { a = R(2, 10); b = R(2, 10); op = Math.random() < .6 ? '·' : ':'; if (op === ':') { r = b; a = a * b; b = a / r; } else r = a * b; }
    else { a = R(12, 99); b = R(2, 9); op = '·'; r = a * b; }
    const truth = Math.random() < .5; const shown = truth ? r : r + pick([-2, -1, 1, 2, 10]);
    return { text: `${a} ${op} ${b} = ${shown}`, truth: truth || shown === r, ex: `${a} ${op} ${b} = ${r}` };
  }
  if (g <= 2) { const [e, w] = pick(PICS); const L = firstLetter(w); const truth = Math.random() < .5; const shown = truth ? L : pick(ABC1.filter(x => x !== L)); return { text: `${e} začína na písmeno ${shown}`, truth, ex: `${cap(w)} začína na ${L}.` }; }
  const [, , w] = pick(allVyb()); const truth = Math.random() < .5; const shown = truth ? w : pick(spellVariants(w).filter(x => x !== w));
  return { text: `Správne sa píše: „${shown}“`, truth, ex: `Správne: ${w}` };
}
/* ===== Minihry – dáta ===== */
function balloonTarget(g) { const max = [0, 20, 100, 100, 1000][g]; return g <= 2 ? R(6, g === 1 ? 18 : 60) : R(12, g === 3 ? 90 : 400); }
function balloonExpr(g, target, good) {
  const t = good ? target : target + pick([-3, -2, -1, 1, 2, 3, 10]);
  if (t < 0) return balloonExpr(g, target, true);
  if (g >= 3 && Math.random() < .5) { const ds = []; for (let d = 2; d <= 10; d++) if (t % d === 0 && t / d <= (g === 3 ? 10 : 99) && t / d >= 2) ds.push(d); if (ds.length) { const d = pick(ds); return { text: `${d} · ${t / d}`, good: t === target }; } }
  if (Math.random() < .55) { const a = R(0, t); return { text: `${a} + ${t - a}`, good: t === target }; }
  const b = R(1, Math.max(2, Math.floor(t / 2) + 5)); return { text: `${t + b} − ${b}`, good: t === target };
}
function rainSetup(g) {
  if (g === 1) return { title: 'Ťukaj len na samohlásky', hint: 'a, e, i, o, u, y', item: () => { const v = Math.random() < .45; return { text: v ? pick(['A', 'E', 'I', 'O', 'U', 'Y', 'Á', 'Í']) : pick(['B', 'K', 'M', 'S', 'T', 'L', 'P', 'R', 'V', 'Z', 'D', 'N']), good: v }; } };
  const src = g === 2 ? SJL.find(t => t.id === 's2-yi').items.split(',').map(x => x.split('|')) : allVyb();
  return { title: 'Ťukaj len na slová napísané správne', hint: g === 2 ? 'Po tvrdých y, po mäkkých i' : 'Pozor na vybrané slová', item: () => { const [, , w] = pick(src); const v = Math.random() < .5; return { text: v ? w : pick(spellVariants(w).filter(x => x !== w)), good: v }; } };
}
