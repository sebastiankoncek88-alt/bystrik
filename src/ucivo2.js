/* ===== Doplnené učivo pre 2. ročník ===== */
const u2near = (a, d = 3) => { const o = new Set(); let g = 0; while (o.size < 3 && g++ < 80) { const x = a + R(-d, d); if (x !== a && x >= 0) o.add(x); } return [...o]; };
const U2_HL = [['dom', 3], ['mama', 4], ['ryba', 4], ['slon', 4], ['auto', 4], ['lopta', 5], ['koza', 4], ['vlak', 4], ['strom', 5], ['ruka', 4], ['okno', 4], ['kniha', 5], ['pes', 3], ['les', 3], ['mesto', 5], ['zebra', 5], ['banán', 5], ['mrkva', 5], ['sova', 4], ['kvet', 4], ['tráva', 5], ['oblak', 5]];
const U2_END = [['Ako sa voláš', '?'], ['Dnes je pekne', '.'], ['Pozor, ide auto', '!'], ['Kde bývaš', '?'], ['Mama varí obed', '.'], ['Hurá, vyhrali sme', '!'], ['Koľko máš rokov', '?'], ['V lese rastú huby', '.'], ['Poď rýchlo sem', '!'], ['Máš rád zmrzlinu', '?'], ['Zajtra ideme na výlet', '.'], ['Kto je tam', '?'], ['Jaj, to bolí', '!'], ['Pes šteká na dvore', '.'], ['Prečo plačeš', '?'], ['Stoj', '!']];
const U2_MATH = [
  { id: 'm2-zaokr', g: 2, name: 'Zaokrúhľovanie na desiatky', icon: '🎯', gen() { let n; do { n = R(11, 98); } while (n % 10 === 0); const a = Math.round(n / 10) * 10; const o = new Set([Math.floor(n / 10) * 10, Math.ceil(n / 10) * 10, a + 10, a - 10]); o.delete(a); return { q: `Zaokrúhli číslo ${n} na desiatky.`, a, w: [...o].filter(x => x >= 0).slice(0, 3), ex: `Pozeráme na jednotky. ${n % 10 >= 5 ? '5 a viac zaokrúhľujeme nahor' : 'Menej ako 5 zaokrúhľujeme nadol'}: ${n} → ${a}.` }; } },
  { id: 'm2-dvoj', g: 2, name: 'Dvojnásobok a polovica', icon: '✌️', gen() { if (Math.random() < .5) { const n = R(2, 25); return { q: `Aký je dvojnásobok čísla ${n}?`, a: n * 2, w: u2near(n * 2, 4), ex: `Dvojnásobok znamená dvakrát toľko: ${n} + ${n} = ${n * 2}.` }; } const n = R(2, 25) * 2; return { q: `Aká je polovica čísla ${n}?`, a: n / 2, w: u2near(n / 2, 3), ex: `Polovica znamená rozdeliť na dve rovnaké časti: ${n / 2} + ${n / 2} = ${n}.` }; } },
  { id: 'm2-retaz', g: 2, name: 'Tri čísla za sebou', icon: '🔗', gen() { const a = R(10, 50), b = R(5, 30), c = R(2, Math.min(20, a + b - 1)); const r = a + b - c; return { q: `${a} + ${b} − ${c} = ?`, a: r, w: u2near(r, 5), ex: `Postupne zľava: ${a} + ${b} = ${a + b}, potom ${a + b} − ${c} = ${r}.` }; } },
  { id: 'm2-neznamy', g: 2, name: 'Nájdi chýbajúce číslo', icon: '❓', gen() { const b = R(20, 99), a = R(5, b - 3); return Math.random() < .5 ? { q: `${a} + ? = ${b}`, a: b - a, w: u2near(b - a, 5), ex: `Od výsledku odčítame známe číslo: ${b} − ${a} = ${b - a}.` } : { q: `${b} − ? = ${a}`, a: b - a, w: u2near(b - a, 5), ex: `${b} − ${b - a} = ${a}. Chýbajúce číslo je ${b - a}.` }; } },
  { id: 'm2-parne', g: 2, name: 'Párne a nepárne do 100', icon: '👫', gen() { const n = R(10, 100); return { q: `Je číslo ${n} párne alebo nepárne?`, a: n % 2 ? 'nepárne' : 'párne', w: [n % 2 ? 'párne' : 'nepárne'], ex: 'Rozhoduje posledná číslica. Párne končia na 0, 2, 4, 6, 8.' }; } },
  { id: 'm2-desat', g: 2, name: 'O 10 viac, o 10 menej', icon: '🔟', gen() { const n = R(12, 89); const up = Math.random() < .5; const a = up ? n + 10 : n - 10; return { q: `Ktoré číslo je o 10 ${up ? 'väčšie' : 'menšie'} ako ${n}?`, a, w: [up ? n + 1 : n - 1, up ? n - 10 : n + 10, up ? n + 20 : n - 20].filter(x => x >= 0 && x !== a), ex: `Mení sa len počet desiatok: ${n} ${up ? '+' : '−'} 10 = ${a}.` }; } },
  { id: 'm2-dlzka', g: 2, name: 'Centimetre a metre', icon: '📏', gen() { const k = R(0, 2); if (k === 0) { const m = R(1, 9); return { q: `Koľko centimetrov je ${m} m?`, a: m * 100, w: [m * 10, m * 1000, m * 100 + 10], ex: `1 m = 100 cm, takže ${m} m = ${m * 100} cm.` }; } if (k === 1) { const c = R(1, 9) * 100; return { q: `Koľko metrov je ${c} cm?`, a: c / 100, w: u2near(c / 100, 3), ex: `100 cm = 1 m, takže ${c} cm = ${c / 100} m.` }; } const a = R(10, 60), b = R(10, 39); return { q: `Stuha má ${a} cm. Druhá má ${b} cm. Koľko cm majú spolu?`, a: a + b, w: u2near(a + b, 5), ex: `${a} cm + ${b} cm = ${a + b} cm.` }; } }
];
const U2_SJL = [
  { id: 's2-makke', g: 2, type: 'qa', name: 'Po mäkkej spoluhláske i/í', icon: '🪶', ex: 'Po mäkkých spoluhláskach (č, dž, š, ž, c, dz, j, ď, ť, ň, ľ) píšeme mäkké i, í.', items: lines(`
    Ktoré slovo je napísané správne?|čistý|čystý;čýstý;čysty
    Ktoré slovo je napísané správne?|život|žyvot;živod;žyvod
    Ktoré slovo je napísané správne?|šiška|šyška;šiškä;šýška
    Ktoré slovo je napísané správne?|cibuľa|cybuľa;cíbuľa;cýbuľa
    Ktoré slovo je napísané správne?|číslo|čýslo;číslou;čyslo
    Ktoré slovo je napísané správne?|žirafa|žyrafa;žírafa;žýrafa
    Ktoré slovo je napísané správne?|šípka|šýpka;šypka;šipká
    Ktoré slovo je napísané správne?|cirkus|cyrkus;církus;cýrkus
    Ktoré slovo je napísané správne?|jahoda|yahoda;jahóda;jáhoda
    Ktoré slovo je napísané správne?|čiapka|čyapka;čiápka;čýapka
    Ktoré slovo je napísané správne?|žiak|žyak;žýak;žiák
    Ktoré slovo je napísané správne?|šiť|šyť;šýť;šit
    Ktoré slovo je napísané správne?|cítiť|cýtiť;cítyť;cýtyť
    Ktoré slovo je napísané správne?|jazero|yazero;jazéro;jázero`) },
  { id: 's2-tvrde', g: 2, type: 'qa', name: 'Po tvrdej spoluhláske y/ý', icon: '🪨', ex: 'Po tvrdých spoluhláskach (h, ch, k, g, d, t, n, l) píšeme tvrdé y, ý.', items: lines(`
    Ktoré slovo je napísané správne?|hory|hori;hóry;horí
    Ktoré slovo je napísané správne?|chyba|chiba;chíba;hyba
    Ktoré slovo je napísané správne?|kytica|kitica;kytyca;kitaca
    Ktoré slovo je napísané správne?|dym|dim;dím;dimy
    Ktoré slovo je napísané správne?|gymnastika|gimnastika;gymnastyka;gimnastyka
    Ktoré slovo je napísané správne?|hýbať|híbať;hibať;hybať
    Ktoré slovo je napísané správne?|chytiť|chitiť;chytyť;chitať
    Ktoré slovo je napísané správne?|tyč|tič;týč;tíč
    Ktoré slovo je napísané správne?|kyslý|kislý;kyzlý;kizlý
    Ktoré slovo je napísané správne?|dýchať|díchať;dychať;dichať
    Ktoré slovo je napísané správne?|hydina|hidina;hydyna;hidyna
    Ktoré slovo je napísané správne?|nohy|nohi;nóhy;nohí
    Ktoré slovo je napísané správne?|rukavice a ruky|rukavice a ruki;rukavyce a ruky;rukavyce a ruki
    Ktoré slovo je napísané správne?|hymna|himna;hímna;hymná`) },
  { id: 's2-vlastne', g: 2, type: 'qa', name: 'Veľké písmeno v menách', icon: '🏙️', ex: 'Mená ľudí, zvierat, miest, riek a štátov píšeme s veľkým písmenom.', items: lines(`
    Ktoré slovo píšeme s veľkým písmenom?|Bratislava|mesto;dedina;ulica
    Ktoré slovo píšeme s veľkým písmenom?|Dunaj|rieka;potok;voda
    Ktoré slovo píšeme s veľkým písmenom?|Peter|chlapec;brat;žiak
    Ktoré slovo píšeme s veľkým písmenom?|Slovensko|štát;krajina;vlasť
    Ktoré slovo píšeme s veľkým písmenom?|Tatry|hory;kopec;les
    Ktoré slovo píšeme s veľkým písmenom?|Zuzana|dievča;sestra;kamarátka
    Ktoré slovo píšeme s veľkým písmenom?|Košice|námestie;mesto;park
    Ktoré slovo píšeme s veľkým písmenom?|Dunčo|pes;šteňa;zviera
    Ktoré slovo píšeme s veľkým písmenom?|Váh|rieka;most;breh
    Ktoré slovo píšeme s veľkým písmenom?|Európa|svetadiel;mapa;zem
    Ktorá veta je napísaná správne?|Bývam v Nitre.|bývam v nitre.;Bývam v nitre.;bývam v Nitre.
    Ktorá veta je napísaná správne?|Môj pes sa volá Rex.|Môj pes sa volá rex.;môj pes sa volá Rex.;Môj Pes sa volá rex.
    Ktorá veta je napísaná správne?|Eva a Adam idú do školy.|eva a adam idú do školy.;Eva a adam idú do školy.;Eva a Adam idú do Školy.
    Ktorá veta je napísaná správne?|Cez Trenčín tečie Váh.|Cez trenčín tečie váh.;cez Trenčín tečie Váh.;Cez Trenčín tečie váh.`) },
  { id: 's2-koniec', g: 2, name: 'Bodka, otáznik, výkričník', icon: '❗', gen() { const [t, a] = pick(U2_END); return { q: 'Aké znamienko patrí na koniec vety?', html: `<div class="bigeq small">${t}<span class="slot">_</span></div>`, a, w: ['.', '?', '!'].filter(x => x !== a), speak: `Aké znamienko patrí na koniec vety: ${t}`, ex: 'Bodka: oznamujeme. Otáznik: pýtame sa. Výkričník: zvolanie alebo rozkaz.' }; } },
  { id: 's2-hlasky', g: 2, name: 'Koľko hlások má slovo?', icon: '🔡', gen() { const [w, n] = pick(U2_HL); const o = new Set(); while (o.size < 3) { const x = n + R(-2, 2); if (x !== n && x > 0) o.add(x); } return { q: `Koľko hlások má slovo „${w}“?`, a: n, w: [...o], speak: `Koľko hlások má slovo ${w}?`, ex: `Hlásky: ${[...w].join(' – ')}. Spolu ${n}.` }; } },
  { id: 's2-o', g: 2, type: 'qa', name: 'Kedy píšeme ô', icon: '🐴', ex: 'Dvojhlásku „uo“ píšeme ako ô: kôň, stôl, nôž, môj.', items: lines(`
    Ktoré slovo je napísané správne?|kôň|kuoň;koň;kóň
    Ktoré slovo je napísané správne?|stôl|stuol;stol;stól
    Ktoré slovo je napísané správne?|nôž|nuož;nož;nóž
    Ktoré slovo je napísané správne?|môj|muoj;moj;mój
    Ktoré slovo je napísané správne?|vôňa|vuoňa;voňa;vóňa
    Ktoré slovo je napísané správne?|kôš|kuoš;koš;kóš
    Ktoré slovo je napísané správne?|pôda|puoda;poda;póda
    Ktoré slovo je napísané správne?|môžem|muožem;možem;móžem
    Ktoré slovo je napísané správne?|kôra|kuora;kora;kóra
    Ktoré slovo je napísané správne?|vôl|vuol;vol;vól`) }
];
const U2_PRV = [
  { id: 'p2-doprava', g: 2, type: 'cat', area: 'geo', name: 'Dopravné prostriedky', icon: '🚆', choices: ['po zemi', 'po vode', 'vo vzduchu'], prompt: 'Kde sa pohybuje {x}?', ex: 'Autá a vlaky jazdia po zemi, lode plávajú po vode, lietadlá lietajú vo vzduchu.', items: lines(`
    auto|po zemi
    vlak|po zemi
    autobus|po zemi
    bicykel|po zemi
    električka|po zemi
    loď|po vode
    čln|po vode
    ponorka|po vode
    plachetnica|po vode
    lietadlo|vo vzduchu
    vrtuľník|vo vzduchu
    balón|vo vzduchu
    raketa|vo vzduchu`) },
  { id: 'p2-stromy', g: 2, type: 'cat', area: 'bio', name: 'Listnaté a ihličnaté stromy', icon: '🌲', choices: ['listnatý', 'ihličnatý'], prompt: 'Aký strom je {x}?', ex: 'Listnaté stromy majú listy a na jeseň ich zhadzujú. Ihličnaté majú ihličie.', items: lines(`
    dub|listnatý
    buk|listnatý
    lipa|listnatý
    breza|listnatý
    javor|listnatý
    gaštan|listnatý
    jabloň|listnatý
    smrek|ihličnatý
    jedľa|ihličnatý
    borovica|ihličnatý
    smrekovec|ihličnatý`) },
  { id: 'p2-zdravie', g: 2, type: 'qa', area: 'bio', name: 'Zdravé jedlo a pohyb', icon: '🥗', items: lines(`
    Čo je zdravšie na desiatu?|jablko|čokoláda;čipsy;cukríky
    Čo by sme mali piť najčastejšie?|vodu|sladkú limonádu;kolu;energetický nápoj
    Koľkokrát denne máme jesť ovocie a zeleninu?|viackrát|nikdy;raz za týždeň;len v nedeľu
    Čo robí naše kosti silnými?|mlieko a mliečne výrobky|cukríky;hranolky;žuvačky
    Prečo si umývame ruky pred jedlom?|aby sme zmyli bacily|aby boli studené;aby voňali;aby sa leskli
    Čo pomáha telu, aby bolo zdravé?|pohyb na čerstvom vzduchu|celý deň pri tablete;málo spánku;veľa sladkostí
    Koľko hodín spánku potrebuje školák?|asi 10|asi 4;asi 2;asi 6
    Čo si dáme na hlavu pri bicyklovaní?|prilbu|šiltovku;kapucňu;nič
    Kto nám lieči zuby?|zubár|pekár;poštár;hasič
    Čo robíme, keď kýchame?|zakryjeme si ústa|kýchame na kamaráta;nič;utekáme preč`) },
  { id: 'p2-obec', g: 2, type: 'qa', area: 'geo', name: 'Kde bývam', icon: '🏡', items: lines(`
    Čo všetko patrí do adresy?|ulica, číslo domu a obec|farba domu;meno psa;počet okien
    Kto riadi obec alebo mesto?|starosta alebo primátor|učiteľ;lekár;šofér
    Kam ideme, keď chceme poslať list?|na poštu|do lekárne;do knižnice;na stanicu
    Kam ideme, keď sme chorí?|k lekárovi|do kina;do obchodu;na ihrisko
    Kde si požičiame knihy?|v knižnici|v pekárni;v lekárni;na pošte
    Kde kúpime lieky?|v lekárni|na pošte;v knižnici;v škole
    Ktoré číslo voláme v núdzi?|112|100;555;999
    Kto hasí požiare?|hasiči|poštári;pekári;kuchári
    Čo je väčšie?|mesto|dedina;ulica;dom
    Ako sa volá naša krajina?|Slovensko|Európa;Bratislava;Tatry`) },
  { id: 'p2-oblecenie', g: 2, type: 'vocab', area: 'anj', name: 'Angličtina: oblečenie', icon: '👕', items: lines(`
    T-shirt|tričko|👕
    trousers|nohavice|👖
    dress|šaty|👗
    shoes|topánky|👟
    hat|klobúk|👒
    socks|ponožky|🧦
    jacket|bunda|🧥
    scarf|šál|🧣
    gloves|rukavice|🧤
    skirt|sukňa|🎀`) },
  { id: 'p2-dom', g: 2, type: 'vocab', area: 'anj', name: 'Angličtina: doma', icon: '🏠', items: lines(`
    house|dom|🏠
    door|dvere|🚪
    window|okno|🪟
    bed|posteľ|🛏️
    chair|stolička|🪑
    table|stôl|🍽️
    kitchen|kuchyňa|🍳
    bathroom|kúpeľňa|🛁
    garden|záhrada|🌷
    lamp|lampa|💡`) }
];
for (const t of U2_MATH) { MATH.push(t); const x = { ...t, s: 'mat' }; ALL_TOPICS.push(x); TOPIC[t.id] = x; }
for (const t of U2_SJL) { SJL.push(t); const x = { ...t, s: 'sjl' }; ALL_TOPICS.push(x); TOPIC[t.id] = x; }
for (const t of U2_PRV) { PRV.push(t); const x = { ...t, s: 'prv' }; ALL_TOPICS.push(x); TOPIC[t.id] = x; }
