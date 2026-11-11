/* ===== Doplnené učivo pre 1. ročník ===== */
const U1_NAMES = ['Ema', 'Adam', 'Nina', 'Samo', 'Lea', 'Timo', 'Zuzka', 'Filip'];
const U1_THINGS = [['jabĺk', 'jablká'], ['cukríkov', 'cukríky'], ['guľôčok', 'guľôčky'], ['autíčok', 'autíčka'], ['pasteliek', 'pastelky'], ['balónov', 'balóny'], ['nálepiek', 'nálepky']];
const U1_SYL = [['mama', 2], ['oco', 2], ['pes', 1], ['dom', 1], ['les', 1], ['lopta', 2], ['ryba', 2], ['auto', 2], ['koleso', 3], ['jahoda', 3], ['malina', 3], ['banán', 2], ['škola', 2], ['kamarát', 3], ['čokoláda', 4], ['motýľ', 2], ['korytnačka', 4], ['dúha', 2], ['slon', 1], ['mačka', 2], ['veverička', 4], ['zajac', 2], ['paradajka', 4], ['strom', 1], ['kvet', 1], ['topánka', 3], ['koláč', 2], ['lokomotíva', 5]];
const U1_SENT = ['Mama varí.', 'Pes beží domov.', 'Ema má novú loptu.', 'Dnes svieti slnko.', 'Adam číta.', 'V lese rastú huby.', 'Babka pečie dobrý koláč.', 'Vonku prší.', 'Mačka pije mlieko.', 'Ideme do školy.', 'Oco umýva auto.', 'Na strome sedí malý vtáčik.', 'Mám rád svoju rodinu.', 'Sova spí.'];
const U1_FILL = [['🐱', 'mačka'], ['🐶', 'pes'], ['🏠', 'dom'], ['🐟', 'ryba'], ['🚗', 'auto'], ['🌳', 'strom'], ['📚', 'kniha'], ['🚂', 'vlak'], ['🧀', 'syr'], ['🐸', 'žaba'], ['🎈', 'balón'], ['🐘', 'slon'], ['🌙', 'mesiac'], ['🍎', 'jablko'], ['⚽', 'lopta'], ['🦉', 'sova'], ['🐴', 'kôň'], ['🥕', 'mrkva'], ['🐭', 'myš'], ['🌞', 'slnko']];
const U1_ABC = 'ABCDEFGHIJKLMNOPRSTUVZ';
const u1near = a => { const o = new Set(); let g = 0; while (o.size < 3 && g++ < 60) { const x = a + R(-3, 3); if (x !== a && x >= 0) o.add(x); } return [...o]; };
const U1_MATH = [
  { id: 'm1-rozklad', g: 1, name: 'Rozklad čísla', icon: '🧩', gen() { const n = R(3, 10), a = R(1, n - 1); return { q: `${n} = ${a} + ?`, a: n - a, w: u1near(n - a), ex: `${a} + ${n - a} = ${n}. Číslo ${n} sa dá rozložiť na ${a} a ${n - a}.` }; } },
  { id: 'm1-susedia', g: 1, name: 'Pred, za a medzi', icon: '↔️', gen() { const n = R(2, 18), k = R(0, 2); if (k === 0) return { q: `Ktoré číslo je hneď pred číslom ${n}?`, a: n - 1, w: u1near(n - 1), ex: `Pred číslom ${n} je číslo o jedno menšie: ${n - 1}.` }; if (k === 1) return { q: `Ktoré číslo je hneď za číslom ${n}?`, a: n + 1, w: u1near(n + 1), ex: `Za číslom ${n} je číslo o jedno väčšie: ${n + 1}.` }; return { q: `Ktoré číslo je medzi ${n - 1} a ${n + 1}?`, a: n, w: u1near(n), ex: `Počítaj: ${n - 1}, ${n}, ${n + 1}.` }; } },
  { id: 'm1-tri', g: 1, name: 'Sčítame tri čísla', icon: '➕', gen() { const a = R(1, 5), b = R(1, 5), c = R(1, 5); return { q: `${a} + ${b} + ${c} = ?`, a: a + b + c, w: u1near(a + b + c), ex: `Najprv ${a} + ${b} = ${a + b}, potom ${a + b} + ${c} = ${a + b + c}.` }; } },
  { id: 'm1-najv', g: 1, name: 'Najväčšie a najmenšie', icon: '📏', gen() { const s = new Set(); while (s.size < 3) s.add(R(1, 20)); const v = [...s]; const big = Math.random() < .5; const a = big ? Math.max(...v) : Math.min(...v); return { q: `Ktoré číslo je ${big ? 'najväčšie' : 'najmenšie'}?`, html: `<div class="bigeq small">${v.join('&nbsp;&nbsp;&nbsp;')}</div>`, a: String(a), w: v.filter(x => x !== a).map(String), speak: `Ktoré číslo je ${big ? 'najväčšie' : 'najmenšie'}? ${v.join(', ')}.`, ex: `Zoradené od najmenšieho: ${v.slice().sort((x, y) => x - y).join(', ')}.` }; } },
  { id: 'm1-slovne', g: 1, name: 'Slovné úlohy do 20', icon: '📖', gen() { const nm = pick(U1_NAMES), th = pick(U1_THINGS); if (Math.random() < .5) { const a = R(2, 10), b = R(1, 9); return { q: `${nm} má ${a} ${th[0]}. Dostane ešte ${b}. Koľko ich má spolu?`, a: a + b, w: u1near(a + b), ex: `Pribudlo, preto sčítame: ${a} + ${b} = ${a + b}.` }; } const a = R(5, 18), b = R(1, a - 1); return { q: `${nm} má ${a} ${th[0]}. ${b} rozdá kamarátom. Koľko ich ostane?`, a: a - b, w: u1near(a - b), ex: `Ubudlo, preto odčítame: ${a} − ${b} = ${a - b}.` }; } },
  { id: 'm1-hodiny', g: 1, name: 'Celé hodiny', icon: '🕐', gen() { const h = R(1, 12); const f = x => `${x}:00`; const w = new Set(); while (w.size < 3) { const x = R(1, 12); if (x !== h) w.add(f(x)); } return { q: 'Koľko je hodín?', html: clockSvg(h, 0), a: f(h), w: [...w], ex: 'Keď veľká ručička ukazuje na 12, je celá hodina. Malá ručička ukazuje, ktorá.' }; } }
];
const U1_SJL = [
  { id: 's1-dlhe', g: 1, type: 'qa', name: 'Krátke a dlhé samohlásky', icon: '〰️', ex: 'Dĺžeň je čiarka nad samohláskou. Dlhú samohlásku vyslovujeme dlhšie.', items: lines(`
    Ktoré slovo je napísané správne?|mama|máma;mamá;mámá
    Ktoré slovo je napísané správne?|lúka|luka;luká;lúká
    Ktoré slovo je napísané správne?|káva|kava;kavá;kává
    Ktoré slovo je napísané správne?|ruka|rúka;ruká;rúká
    Ktoré slovo je napísané správne?|múka|muka;muká;múká
    Ktoré slovo je napísané správne?|ráno|rano;ranó;ránó
    Ktoré slovo je napísané správne?|ryba|rýba;rybá;rýbá
    Ktoré slovo je napísané správne?|víla|vila;vilá;vílá
    Ktoré slovo je napísané správne?|noha|nóha;nohá;nóhá
    Ktoré slovo je napísané správne?|máme|mame;mamé;mámé
    Ktoré slovo je napísané správne?|koza|kóza;kozá;kózá
    Ktoré slovo je napísané správne?|dáma|dama;damá;dámá
    Ktoré slovo je napísané správne?|sova|sóva;sová;sóvá
    Ktoré slovo je napísané správne?|váza|vaza;vazá;vázá
    Ktoré slovo je napísané správne?|lopta|lópta;loptá;lóptá
    Ktoré slovo je napísané správne?|dúha|duha;duhá;dúhá`) },
  { id: 's1-makcen', g: 1, type: 'qa', name: 'Písmená s mäkčeňom', icon: '🐸', ex: 'Mäkčeň je háčik nad písmenom: č, š, ž, ď, ť, ň, ľ.', items: lines(`
    Ktoré slovo je napísané správne?|žaba|zaba;saba;šaba
    Ktoré slovo je napísané správne?|čaj|caj;šaj;žaj
    Ktoré slovo je napísané správne?|škola|skola;čkola;žkola
    Ktoré slovo je napísané správne?|mačka|macka;maška;mažka
    Ktoré slovo je napísané správne?|šál|sál;čál;žál
    Ktoré slovo je napísané správne?|žirafa|zirafa;širafa;čirafa
    Ktoré slovo je napísané správne?|šaty|saty;čaty;žaty
    Ktoré slovo je napísané správne?|ruža|ruza;ruša;ruča
    Ktoré slovo je napísané správne?|myš|mys;myž;myč
    Ktoré slovo je napísané správne?|čerešňa|ceresna;čeresna;cerešňa
    Ktoré slovo je napísané správne?|hruška|hruska;hručka;hružka
    Ktoré slovo je napísané správne?|koláč|kolác;koláš;koláž
    Ktoré slovo je napísané správne?|čiapka|ciapka;šiapka;žiapka
    Ktoré slovo je napísané správne?|nôž|nôz;nôš;nôč
    Ktoré slovo je napísané správne?|včela|vcela;všela;vžela
    Ktoré slovo je napísané správne?|šašo|saso;šaso;sašo`) },
  { id: 's1-pocetslabik', g: 1, name: 'Koľko slabík má slovo?', icon: '👏', gen() { const [w, n] = pick(U1_SYL); const o = new Set(); while (o.size < 3) { const x = R(1, 5); if (x !== n) o.add(x); } return { q: `Koľko slabík má slovo „${w}“?`, a: n, w: [...o], speak: `Koľko slabík má slovo ${w}?`, ex: 'Vytlieskaj si slovo. Koľkokrát tleskneš, toľko má slabík.' }; } },
  { id: 's1-slova', g: 1, name: 'Koľko slov má veta?', icon: '🔢', gen() { const s = pick(U1_SENT); const n = s.split(' ').length; const o = new Set(); while (o.size < 3) { const x = R(1, 6); if (x !== n) o.add(x); } return { q: 'Koľko slov má táto veta?', html: `<div class="bigeq small">${s}</div>`, a: n, w: [...o], speak: `Koľko slov má veta: ${s}`, ex: 'Slová sú vo vete oddelené medzerami. Spočítaj ich.' }; } },
  { id: 's1-pary', g: 1, name: 'Veľké a malé písmeno', icon: '🔠', gen() { const c = pick([...U1_ABC]); const big = Math.random() < .5; const a = big ? c.toLowerCase() : c; const w = shuffle([...U1_ABC].filter(x => x !== c)).slice(0, 3).map(x => big ? x.toLowerCase() : x); return { q: `Ktoré ${big ? 'malé' : 'veľké'} písmeno patrí k písmenu „${big ? c : c.toLowerCase()}“?`, a, w, speak: `Ktoré ${big ? 'malé' : 'veľké'} písmeno patrí k tomuto písmenu?`, ex: `${c} a ${c.toLowerCase()} je to isté písmeno, veľké a malé.` }; } },
  { id: 's1-dopln', g: 1, name: 'Ktoré písmeno chýba?', icon: '🧐', gen() { const [e, w] = pick(U1_FILL); const L = [...w]; const i = R(0, L.length - 1); const a = L[i]; const pool = [...'aeioubdklmnprstvz'].filter(x => x !== a && !L.includes(x)); return { q: 'Ktoré písmeno chýba?', html: `<div class="bigemoji" style="font-size:3.6rem">${e}</div><div class="bigword">${L.map((c, k) => k === i ? '<span class="slot">_</span>' : c).join('')}</div>`, a, w: shuffle(pool).slice(0, 3), speak: 'Ktoré písmeno chýba v slove?', ex: `Správne slovo je „${w}“.` }; } }
];
const U1_PRV = [
  { id: 'p1-rodina', g: 1, type: 'qa', area: 'geo', name: 'Moja rodina', icon: '👪', items: lines(`
    Kto je mamina mama?|stará mama|teta;sestra;sesternica
    Kto je ockov otec?|starý otec|ujo;brat;bratranec
    Kto je mamina sestra?|teta|stará mama;sesternica;dcéra
    Kto je ockov brat?|ujo|starý otec;bratranec;syn
    Kto je syn mojich rodičov?|môj brat|môj ujo;môj otec;môj bratranec
    Kto je dcéra mojich rodičov?|moja sestra|moja teta;moja mama;moja sesternica
    Ako sa volajú mama a otec spolu?|rodičia|súrodenci;starí rodičia;susedia
    Ako sa volajú brat a sestra spolu?|súrodenci|rodičia;starí rodičia;kamaráti
    Kto je dieťa mojej tety?|bratranec alebo sesternica|brat alebo sestra;ujo;starý otec
    Čo robíme, keď niekto v rodine potrebuje pomoc?|pomôžeme mu|smejeme sa;odídeme preč;nevšímame si ho`) },
  { id: 'p1-dni', g: 1, type: 'qa', area: 'geo', name: 'Dni v týždni', icon: '📅', ex: 'Pondelok, utorok, streda, štvrtok, piatok, sobota, nedeľa.', items: lines(`
    Ktorý deň je po pondelku?|utorok|streda;nedeľa;piatok
    Ktorý deň je po utorku?|streda|štvrtok;pondelok;sobota
    Ktorý deň je pred piatkom?|štvrtok|sobota;streda;utorok
    Ktorý deň je po piatku?|sobota|nedeľa;štvrtok;pondelok
    Ktorým dňom sa začína týždeň?|pondelkom|nedeľou;sobotou;stredou
    Ktorým dňom sa týždeň končí?|nedeľou|pondelkom;piatkom;sobotou
    Koľko dní má týždeň?|7|5;6;10
    Ktoré dva dni sú víkend?|sobota a nedeľa|piatok a sobota;nedeľa a pondelok;streda a štvrtok
    Ktorý deň je uprostred pracovného týždňa?|streda|pondelok;piatok;sobota
    Koľko dní v týždni chodíme do školy?|5|7;6;4`) },
  { id: 'p1-zmysly', g: 1, type: 'qa', area: 'bio', name: 'Naše zmysly', icon: '👀', ex: 'Máme päť zmyslov: zrak, sluch, čuch, chuť a hmat.', items: lines(`
    Čím vidíme?|očami|ušami;nosom;rukami
    Čím počujeme?|ušami|očami;jazykom;nosom
    Čím cítime vôňu?|nosom|ušami;očami;kolenom
    Čím cítime chuť jedla?|jazykom|nosom;ušami;prstami
    Čím cítime, či je niečo drsné alebo hladké?|kožou na prstoch|očami;ušami;vlasmi
    Koľko zmyslov má človek?|5|2;3;10
    Ktorý zmysel používame, keď počúvame hudbu?|sluch|zrak;chuť;čuch
    Ktorý zmysel používame, keď si prezeráme obrázok?|zrak|sluch;chuť;hmat
    Ktorý zmysel nám povie, že je citrón kyslý?|chuť|zrak;sluch;hmat
    Ktorý zmysel nám povie, že kvet vonia?|čuch|sluch;zrak;hmat`) },
  { id: 'p1-uzitok', g: 1, type: 'qa', area: 'bio', name: 'Čo nám dávajú zvieratá', icon: '🐄', items: lines(`
    Čo nám dáva sliepka?|vajcia|mlieko;med;vlnu
    Čo nám dáva krava?|mlieko|vajcia;med;perie
    Čo nám dáva ovca?|vlnu|vajcia;med;mlieko v škatuli
    Čo nám dávajú včely?|med|vajcia;vlnu;mlieko
    Kto stráži dom?|pes|sliepka;ovca;krava
    Kto chytá myši?|mačka|krava;koza;sliepka
    Z čoho sa robí syr?|z mlieka|z vajec;z medu;z vlny
    Z čoho sa pletie teplý sveter?|z vlny|z mlieka;z medu;z vajec
    Kde bývajú sliepky?|v kuríne|v úli;v búde;v akváriu
    Kde bývajú včely?|v úli|v kuríne;v maštali;v búde`) },
  { id: 'p1-rezim', g: 1, type: 'qa', area: 'geo', name: 'Môj deň', icon: '⏰', items: lines(`
    Kedy raňajkujeme?|ráno|večer;v noci;na obed
    Kedy obedujeme?|na obed|ráno;v noci;večer
    Kedy večeriame?|večer|ráno;na obed;v noci
    Kedy spíme?|v noci|na obed;ráno;popoludní
    Čo robíme ráno po zobudení?|umyjeme sa a oblečieme|ideme spať;večeriame;zhasneme svetlo
    Čo robíme pred jedlom?|umyjeme si ruky|ideme spať;obujeme sa;zapneme televízor
    Čo robíme večer pred spaním?|umyjeme si zuby|ideme do školy;raňajkujeme;obedujeme
    Koľkokrát denne si máme umyť zuby?|aspoň 2-krát|nikdy;raz za týždeň;raz za mesiac
    Čo si pripravíme večer do školy?|školskú tašku|plavky;sánky;stan
    Čo je zdravé robiť každý deň?|hýbať sa a cvičiť|jesť len sladkosti;celý deň sedieť;nespať`) },
  { id: 'p1-pozdravy', g: 1, type: 'vocab', area: 'anj', name: 'Angličtina: pozdravy', icon: '👋', items: lines(`
    hello|ahoj|👋
    good morning|dobré ráno|🌅
    good night|dobrú noc|🌙
    goodbye|dovidenia|🚪
    thank you|ďakujem|🙏
    please|prosím|🤲
    yes|áno|✅
    no|nie|❌
    sorry|prepáč|😔
    friend|kamarát|🤝`) },
  { id: 'p1-hracky', g: 1, type: 'vocab', area: 'anj', name: 'Angličtina: hračky', icon: '🧸', items: lines(`
    ball|lopta|⚽
    doll|bábika|🪆
    car|auto|🚗
    teddy bear|medvedík|🧸
    kite|šarkan|🪁
    book|kniha|📖
    train|vlak|🚂
    robot|robot|🤖
    bike|bicykel|🚲
    puzzle|skladačka|🧩`) }
];
for (const t of U1_MATH) { MATH.push(t); const x = { ...t, s: 'mat' }; ALL_TOPICS.push(x); TOPIC[t.id] = x; }
for (const t of U1_SJL) { SJL.push(t); const x = { ...t, s: 'sjl' }; ALL_TOPICS.push(x); TOPIC[t.id] = x; }
for (const t of U1_PRV) { PRV.push(t); const x = { ...t, s: 'prv' }; ALL_TOPICS.push(x); TOPIC[t.id] = x; }
