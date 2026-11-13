/* ===== Ďalšie učivo ===== */
function toRoman(n) { const m = [[50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]; let s = ''; for (const [v, r] of m) while (n >= v) { s += r; n -= v; } return s; }
const MORE_MATH = [
  { id: 'm1-viac', g: 1, name: 'O koľko viac?', icon: '⚖️', gen() { const [n1] = pick(KIDS); const [n2] = pick(KIDS.filter(k => k[0] !== n1)); const N = pick(NOUNS); const a = R(4, 12), b = R(1, a - 1); return { q: `${n1} má ${a} ${plural(a, N[0], N[1], N[2])}, ${n2} má ${b}. O koľko má ${n1} viac?`, a: a - b, ex: `${a} − ${b} = ${a - b}` }; } },
  { id: 'm1-slniečka', g: 1, name: 'Peniaze do 20 €', icon: '💶', gen() { const v = []; let sum = 0; while (v.length < 4) { const c = pick([1, 2, 5, 10]); if (sum + c > 20) break; v.push(c); sum += c; } if (v.length < 2) { v.length = 0; v.push(5, 2); sum = 7; } v.sort((a, b) => b - a); return { q: 'Koľko eur je spolu?', html: coinHtml(v), a: sum, speak: `Mám ${v.join(' eur, ')} eur. Koľko eur je spolu?` }; } },
  { id: 'm2-rady', g: 2, name: 'Číselné rady', icon: '🔢', gen() { const d = pick([2, 3, 5, 10]); const up = Math.random() < .7; const s = up ? R(0, 40) : R(4 * d, 90); const t = [0, 1, 2, 3].map(i => up ? s + i * d : s - i * d); return { q: 'Ktoré číslo pokračuje v rade?', html: `<div class="bigeq small">${t.slice(0, 3).join(', ')}, <span class="slot">?</span></div>`, a: t[3], speak: `${t.slice(0, 3).join(', ')}. Ktoré číslo nasleduje?`, ex: `Rad ${up ? 'rastie' : 'klesá'} vždy o ${d}.` }; } },
  { id: 'm2-cas', g: 2, name: 'Hodiny, dni, týždne', icon: '⏰', gen() { return { ...pick([{ q: '1 hodina = ? minút', a: 60 }, { q: 'Pol hodiny = ? minút', a: 30 }, { q: 'Štvrť hodiny = ? minút', a: 15 }, { q: '2 hodiny = ? minút', a: 120 }, { q: '1 deň = ? hodín', a: 24 }, { q: '1 týždeň = ? dní', a: 7 }, { q: '2 týždne = ? dní', a: 14 }, { q: '1 rok = ? mesiacov', a: 12 }, { q: '1 minúta = ? sekúnd', a: 60 }]) }; } },
  { id: 'm3-poradie', g: 3, name: 'Poradie počtových výkonov', icon: '🧠', gen() { const t = R(0, 3), a = R(2, 20), b = R(2, 9), c = R(2, 9); if (t === 0) return { q: `${a} + ${b} · ${c} = ?`, a: a + b * c, ex: `Najprv násobíme: ${b} · ${c} = ${b * c}, potom ${a} + ${b * c} = ${a + b * c}` }; if (t === 1) { const x = b * c + R(0, 20); return { q: `${x} − ${b} · ${c} = ?`, a: x - b * c, ex: `Najprv násobíme: ${b} · ${c} = ${b * c}, potom ${x} − ${b * c} = ${x - b * c}` }; } if (t === 2) return { q: `(${a} + ${b}) · ${c} = ?`, a: (a + b) * c, ex: `Najprv zátvorka: ${a} + ${b} = ${a + b}, potom · ${c} = ${(a + b) * c}` }; return { q: `${b} · ${c} + ${a} = ?`, a: b * c + a, ex: `Najprv násobíme: ${b} · ${c} = ${b * c}, potom + ${a} = ${b * c + a}` }; } },
  { id: 'm3-geometria', g: 3, type: 'qa', name: 'Čiary a telesá', icon: '📐', items: lines(`
    Ako sa volá rovná čiara, ktorá má začiatok aj koniec?|úsečka|priamka;polpriamka;kružnica
    Ako sa volá rovná čiara, ktorá nemá začiatok ani koniec?|priamka|úsečka;polpriamka;kruh
    Koľko strán má trojuholník?|3|4;5;6
    Koľko vrcholov má štvorec?|4|3;5;6
    Čím rysujeme kružnicu?|kružidlom|pravítkom;uhlomerom;gumou
    Koľko stien má kocka?|6|4;8;12
    Koľko hrán má kocka?|12|6;8;10
    Koľko vrcholov má kocka?|8|6;4;12
    Ktoré teleso sa kotúľa a nemá žiadne hrany?|guľa|kocka;kváder;ihlan
    Akú jednotku používame na meranie dĺžky úsečky v zošite?|centimeter|kilogram;liter;hodina`) },
  { id: 'm4-rimske', g: 4, name: 'Rímske číslice', icon: '🏛️', gen() { const n = R(1, 60); if (Math.random() < .5) return { q: `Aké číslo je zapísané rímskymi číslicami ${toRoman(n)}?`, a: n, ex: 'I = 1, V = 5, X = 10, L = 50. Menšia číslica pred väčšou sa odčíta (IV = 4).' }; const a = toRoman(n); const w = new Set([toRoman(n + 1), toRoman(Math.max(1, n - 1)), toRoman(n + 10 > 60 ? n - 10 : n + 10), a.split('').reverse().join('')]); w.delete(a); return { q: `Ako sa zapíše číslo ${n} rímskymi číslicami?`, a, w: [...w].slice(0, 3), ex: 'I = 1, V = 5, X = 10, L = 50' }; } },
  { id: 'm4-neznama', g: 4, name: 'Nájdi neznáme číslo', icon: '🔍', gen() { const t = R(0, 3); if (t === 0) { const a = R(10, 90), b = R(10, 90); return { q: `□ + ${a} = ${a + b}`, a: b, ex: `${a + b} − ${a} = ${b}` }; } if (t === 1) { const a = R(10, 60), b = R(5, 40); return { q: `□ − ${b} = ${a}`, a: a + b, ex: `${a} + ${b} = ${a + b}` }; } if (t === 2) { const a = R(2, 10), b = R(2, 10); return { q: `□ · ${a} = ${a * b}`, a: b, ex: `${a * b} : ${a} = ${b}` }; } const a = R(2, 10), b = R(2, 10); return { q: `${a * b} : □ = ${b}`, a: a, ex: `${a * b} : ${b} = ${a}` }; } },
  { id: 'm4-obsah', g: 4, name: 'Obsah obdĺžnika', icon: '🟩', gen() { if (Math.random() < .4) { const a = R(2, 12); return { q: 'Aký je obsah štvorca (v cm²)?', html: rectSvg(a, a, 'cm'), a: a * a, speak: `Štvorec má stranu ${a} centimetrov. Aký je jeho obsah?`, ex: `S = a · a = ${a} · ${a} = ${a * a} cm²` }; } const a = R(3, 15), b = R(2, a - 1); return { q: 'Aký je obsah obdĺžnika (v cm²)?', html: rectSvg(a, b, 'cm'), a: a * b, speak: `Obdĺžnik má strany ${a} a ${b} centimetrov. Aký je jeho obsah?`, ex: `S = a · b = ${a} · ${b} = ${a * b} cm²` }; } }
];
const MORE_SJL = [
  { id: 's1-nepatri', g: 1, type: 'qa', name: 'Čo nepatrí medzi ostatné?', icon: '🙈', items: lines(`
    Ktoré slovo nepatrí medzi ostatné?|auto|jablko;hruška;slivka
    Ktoré slovo nepatrí medzi ostatné?|stolička|pes;mačka;krava
    Ktoré slovo nepatrí medzi ostatné?|pes|červená;modrá;zelená
    Ktoré slovo nepatrí medzi ostatné?|mrkva|tričko;sukňa;čiapka
    Ktoré slovo nepatrí medzi ostatné?|lopta|vlak;autobus;lietadlo
    Ktoré slovo nepatrí medzi ostatné?|jar|pondelok;utorok;streda
    Ktoré slovo nepatrí medzi ostatné?|mačka|stôl;posteľ;skriňa
    Ktoré slovo nepatrí medzi ostatné?|ruža|lyžica;vidlička;nôž`) },
  { id: 's1-spoj', g: 1, name: 'Spoj slabiky do slova', icon: '🧩', gen() { const s = pick(SYL.filter(x => x.includes('-'))); const n = s.split('-').length; const w = s.replace(/-/g, ''); const others = shuffle(SYL.filter(x => x !== s && x.split('-').length === n)).slice(0, 3).map(x => x.replace(/-/g, '')); return { q: 'Aké slovo vznikne zo slabík?', html: `<div class="bigeq small">${s.toUpperCase().split('-').join(' + ')}</div>`, speak: `Spoj slabiky ${s.split('-').join(', ')}. Aké slovo vznikne?`, a: w, w: others, ex: `${s.toUpperCase().replace(/-/g, ' – ')} = ${w}` }; } },
  { id: 's2-dtnl', g: 2, type: 'qa', name: 'de, te, ne, le, di, ti, ni, li', icon: '🔈', items: lines(`
    Ktoré slovo je napísané správne?|deti|ďeti;dety|V slabikách de, te, ne, le, di, ti, ni, li čítame mäkko, ale mäkčeň nepíšeme.
    Ktoré slovo je napísané správne?|ticho|ťicho;tycho|V slabikách de, te, ne, le, di, ti, ni, li čítame mäkko, ale mäkčeň nepíšeme.
    Ktoré slovo je napísané správne?|nitka|ňitka;nytka|V slabikách de, te, ne, le, di, ti, ni, li čítame mäkko, ale mäkčeň nepíšeme.
    Ktoré slovo je napísané správne?|lipa|ľipa;lypa|V slabikách de, te, ne, le, di, ti, ni, li čítame mäkko, ale mäkčeň nepíšeme.
    Ktoré slovo je napísané správne?|teta|ťeta;tieta|V slabikách de, te, ne, le, di, ti, ni, li čítame mäkko, ale mäkčeň nepíšeme.
    Ktoré slovo je napísané správne?|divadlo|ďivadlo;dyvadlo|V slabikách de, te, ne, le, di, ti, ni, li čítame mäkko, ale mäkčeň nepíšeme.
    Ktoré slovo je napísané správne?|nikto|ňikto;nykto|V slabikách de, te, ne, le, di, ti, ni, li čítame mäkko, ale mäkčeň nepíšeme.
    Ktoré slovo je napísané správne?|lietadlo|ľietadlo;lyetadlo|V slabikách de, te, ne, le, di, ti, ni, li čítame mäkko, ale mäkčeň nepíšeme.
    Ktoré slovo je napísané správne?|nebo|ňebo;nébo|V slabikách de, te, ne, le, di, ti, ni, li čítame mäkko, ale mäkčeň nepíšeme.
    Ktoré slovo je napísané správne?|leto|ľeto;léto|V slabikách de, te, ne, le, di, ti, ni, li čítame mäkko, ale mäkčeň nepíšeme.`) },
  { id: 's2-zdrob', g: 2, type: 'qa', name: 'Zdrobneniny', icon: '🐣', items: lines(`
    Zdrobnenina slova „dom“ je…|domček|domy;domisko;domov
    Zdrobnenina slova „mačka“ je…|mačička|mačky;mačisko;mačací
    Zdrobnenina slova „strom“ je…|stromček|stromy;stromisko;stromoradie
    Zdrobnenina slova „kniha“ je…|knižka|knihy;knihovník;knižnica
    Zdrobnenina slova „ruka“ je…|rúčka|ruky;ručný;rukáv
    Zdrobnenina slova „stôl“ je…|stolík|stoly;stolár;stolička
    Zdrobnenina slova „lopta“ je…|loptička|lopty;loptár;lopata
    Zdrobnenina slova „vták“ je…|vtáčik|vtáky;vtáčí;vtáčnik
    Zdrobnenina slova „slnko“ je…|slniečko|slnečný;slnká;slnečnica
    Zdrobnenina slova „kvet“ je…|kvietok|kvety;kvetináč;kvitnúť`) },
  { id: 's3-spodob', g: 3, type: 'qa', name: 'Píšeme inak, ako počujeme', icon: '👂', items: lines(`
    Vyslovujeme [chliep]. Ako to správne napíšeme?|chlieb|chliep;chlijeb|Pomôže iný tvar: chleby. Počujeme p, ale píšeme b.
    Vyslovujeme [hat]. Ako to správne napíšeme?|had|hat;hád|Pomôže iný tvar: hady. Počujeme t, ale píšeme d.
    Vyslovujeme [dup]. Ako to správne napíšeme?|dub|dup;dúb|Pomôže iný tvar: duby. Počujeme p, ale píšeme b.
    Vyslovujeme [zup]. Ako to správne napíšeme?|zub|zup;zúb|Pomôže iný tvar: zuby. Počujeme p, ale píšeme b.
    Vyslovujeme [hrip]. Ako to správne napíšeme?|hríb|hríp;hrib|Pomôže iný tvar: hríby. Počujeme p, ale píšeme b.
    Vyslovujeme [mrás]. Ako to správne napíšeme?|mráz|mrás;mraz|Pomôže iný tvar: mrazy. Počujeme s, ale píšeme z.
    Vyslovujeme [hrat]. Ako to správne napíšeme?|hrad|hrat;hrád|Pomôže iný tvar: hrady. Počujeme t, ale píšeme d.
    Vyslovujeme [loť]. Ako to správne napíšeme?|loď|loť;lod|Pomôže iný tvar: lode. Počujeme ť, ale píšeme ď.
    Vyslovujeme [nôš]. Ako to správne napíšeme?|nôž|nôš;noš|Pomôže iný tvar: nože. Počujeme š, ale píšeme ž.
    Vyslovujeme [lef]. Ako to správne napíšeme?|lev|lef;léf|Pomôže iný tvar: levy. Počujeme f, ale píšeme v.
    Vyslovujeme [nóš]. Ako to správne napíšeme?|nôž|nóš;noš|Pomôže iný tvar: nože. Počujeme š, ale píšeme ž.
    Vyslovujeme [hat] (plaz). Ako to napíšeme v slove hadík?|hadík|hatík;hádik|Pomôže tvar had – hady. Píšeme d.
    Vyslovujeme [obet]. Ako to správne napíšeme?|obed|obet;óbed|Pomôže iný tvar: obedy. Počujeme t, ale píšeme d.`) },
  { id: 's3-nadradene', g: 3, type: 'qa', name: 'Nadradené slová', icon: '🗂️', items: lines(`
    Ktoré slovo je nadradené slovám jablko, hruška, slivka?|ovocie|zelenina;strom;záhrada
    Ktoré slovo je nadradené slovám mrkva, cibuľa, kapusta?|zelenina|ovocie;kvety;jedlo z mäsa
    Ktoré slovo je nadradené slovám pes, mačka, krava?|zvieratá|vtáky;ryby;hmyz
    Ktoré slovo je nadradené slovám ruža, tulipán, snežienka?|kvety|stromy;kríky;huby
    Ktoré slovo je nadradené slovám stôl, stolička, skriňa?|nábytok|riad;náradie;hračky
    Ktoré slovo je nadradené slovám auto, vlak, autobus?|dopravné prostriedky|hračky;budovy;stroje v kuchyni
    Ktoré slovo je nadradené slovám tričko, sukňa, nohavice?|oblečenie|obuv;šperky;nábytok
    Ktoré slovo je nadradené slovám hrnček, tanier, miska?|riad|nábytok;náradie;oblečenie
    Ktoré slovo je nadradené slovám ruža, tulipán, sedmokráska?|kvety|stromy;huby;zelenina
    Ktoré slovo je nadradené slovám vrabec, sýkorka, ďateľ?|vtáky|ryby;hmyz;cicavce
    Ktoré slovo je nadradené slovám stolička, stôl, skriňa?|nábytok|riad;náradie;hračky
    Ktoré slovo je nadradené slovám tričko, sveter, nohavice?|oblečenie|obuv;nábytok;riad
    Ktoré slovo je nadradené slovám auto, autobus, vlak?|dopravné prostriedky|budovy;nástroje;zvieratá
    Ktoré slovo je nadradené slovám hrnček, tanier, misa?|riad|nábytok;oblečenie;hračky
    Ktoré slovo je podradené slovu „hudobné nástroje“?|husle|lopta;kladivo;tanier
    Ktoré slovo je podradené slovu „ovocie“?|čerešňa|mrkva;zemiak;cibuľa`) },
  { id: 's4-cas', g: 4, type: 'cat', name: 'Slovesný čas', icon: '⏳', prompt: 'Sloveso „{x}“ je v…', choices: ['minulom čase', 'prítomnom čase', 'budúcom čase'], items: 'skákal|minulom čase,čítala|minulom čase,bežali|minulom čase,napísal|minulom čase,spievali|minulom čase,píše|prítomnom čase,beží|prítomnom čase,kreslíme|prítomnom čase,spí|prítomnom čase,varí|prítomnom čase,budem čítať|budúcom čase,pôjdeme|budúcom čase,budú hrať|budúcom čase,prídem|budúcom čase,budeš spať|budúcom čase', ex: 'Minulý čas: čo robil? Prítomný: čo robí? Budúci: čo bude robiť?' },
  { id: 's4-a', g: 4, type: 'qa', name: 'Kedy píšeme ä', icon: '🅰️', items: lines(`
    Ktoré slovo je napísané správne?|mäso|maso;méso|Ä píšeme len po perných spoluhláskach b, m, p, v.
    Ktoré slovo je napísané správne?|päta|pata;péta|Ä píšeme len po perných spoluhláskach b, m, p, v.
    Ktoré slovo je napísané správne?|mäkký|makký;mekký|Ä píšeme len po perných spoluhláskach b, m, p, v.
    Ktoré slovo je napísané správne?|päť|pať;peť|Ä píšeme len po perných spoluhláskach b, m, p, v.
    Ktoré slovo je napísané správne?|väčší|vačší;večší|Ä píšeme len po perných spoluhláskach b, m, p, v.
    Ktoré slovo je napísané správne?|zväčšiť|zvačšiť;zvečšiť|Ä píšeme len po perných spoluhláskach b, m, p, v.
    Ktoré slovo je napísané správne?|omáčka|omäčka;omečka|Po č nepíšeme ä, píšeme á.
    Ktoré slovo je napísané správne?|pamäť|pameť;pamať|Ä píšeme len po perných spoluhláskach b, m, p, v.
    Ktoré slovo je napísané správne?|tráva|träva;tréva|Po r nepíšeme ä.`) }
];
for (const t of MORE_MATH) { MATH.push(t); const x = { ...t, s: 'mat' }; ALL_TOPICS.push(x); TOPIC[t.id] = x; }
for (const t of MORE_SJL) { SJL.push(t); const x = { ...t, s: 'sjl' }; ALL_TOPICS.push(x); TOPIC[t.id] = x; }

/* Oblasti Prehľadu */
const AREAS = { bio: { i: '🌿', n: 'Príroda' }, geo: { i: '🗺️', n: 'Slovensko a svet' }, anj: { i: '🇬🇧', n: 'Angličtina' } };
const AREA_OF = { 'p1-obdobia': 'bio', 'p1-telo': 'bio', 'p1-mlad': 'bio', 'p1-ovocie': 'bio', 'p1-cesta': 'geo', 'p2-kalendar': 'geo', 'p2-zvierata': 'bio', 'p2-rastliny': 'bio', 'p2-povolania': 'geo', 'p2-voda': 'bio', 'p3-zivocichy': 'bio', 'p3-les': 'bio', 'p3-voda': 'bio', 'p3-materialy': 'bio', 'p3-mapa': 'geo', 'p3-obec': 'geo', 'p4-vesmir': 'bio', 'p4-telo': 'bio', 'p4-priroda': 'bio', 'p4-slovensko': 'geo', 'p4-kraje': 'geo', 'p4-susedia': 'geo', 'p4-historia': 'geo' };
for (const t of PRV) { const a = t.type === 'vocab' ? 'anj' : (AREA_OF[t.id] || 'bio'); t.area = a; TOPIC[t.id].area = a; }
