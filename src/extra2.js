/* ===== Ďalšie učivo 2 ===== */
const ORD = ['prvé', 'druhé', 'tretie', 'štvrté', 'piate'];
const MATH3 = [
  { id: 'm1-dj', g: 1, name: 'Desiatky a jednotky', icon: '🧱', gen() { const n = R(10, 20); const j = n - 10; const f = (d, k) => `${d} ${plural(d, 'desiatka', 'desiatky', 'desiatok')} a ${k} ${plural(k, 'jednotka', 'jednotky', 'jednotiek')}`; return { q: `Koľko desiatok a jednotiek má číslo ${n}?`, a: f(n === 20 ? 2 : 1, n === 20 ? 0 : j), w: [...new Set([f(j, 1), f(1, j + 1), f(0, n)])].filter(x => x !== f(n === 20 ? 2 : 1, n === 20 ? 0 : j)).slice(0, 3), ex: 'D = desiatky, J = jednotky. Napríklad 14 = 1 desiatka a 4 jednotky.' }; } },
  { id: 'm1-parne', g: 1, name: 'Párne a nepárne', icon: '👫', gen() { const n = R(1, 20); return { q: `Je číslo ${n} párne alebo nepárne?`, a: n % 2 ? 'nepárne' : 'párne', w: [n % 2 ? 'párne' : 'nepárne'], ex: 'Párne čísla sa dajú rozdeliť na dve rovnaké skupiny: 2, 4, 6, 8, 10…' }; } },
  { id: 'm1-poradie', g: 1, name: 'Na ktorom mieste?', icon: '🏁', gen() { const e = shuffle(['🐸', '🐶', '🐱', '🐰', '🐻', '🦊', '🐼']).slice(0, 5); const i = R(0, 4); return { q: `Na ktorom mieste je ${e[i]}? (počítaj zľava)`, html: `<div class="countgrid" style="max-width:none">${e.map(x => `<span>${x}</span>`).join('')}</div>`, a: ORD[i], w: shuffle(ORD.filter((_, k) => k !== i)).slice(0, 3), speak: `Na ktorom mieste je zvieratko? Počítaj zľava.`, ex: `Počítame zľava: prvé, druhé, tretie… ${e[i]} je ${ORD[i]}.` }; } },
  { id: 'm2-dj', g: 2, name: 'Desiatky a jednotky do 100', icon: '🧱', gen() { const d = R(1, 9), j = R(0, 9), n = d * 10 + j; return Math.random() < .5 ? { q: `Koľko desiatok má číslo ${n}?`, a: d, ex: `${n} = ${d} desiatok a ${j} jednotiek` } : { q: `${d} ${plural(d, 'desiatka', 'desiatky', 'desiatok')} a ${j} ${plural(j, 'jednotka', 'jednotky', 'jednotiek')}. Aké je to číslo?`, a: n, ex: `${d} desiatok = ${d * 10}, plus ${j} = ${n}` }; } },
  { id: 'm2-porov', g: 2, name: 'Porovnávanie do 100', icon: '⚖️', gen() { let a = R(10, 99), b = Math.random() < .2 ? a : R(10, 99); let L = String(a), Rr = String(b); if (Math.random() < .4) { const x = R(1, Math.min(9, a - 1)); L = `${a - x} + ${x}`; } const s = a > b ? '>' : a < b ? '<' : '='; return { q: 'Ktorý znak patrí do krúžku?', html: `<div class="bigeq small">${L} <span class="slot">?</span> ${Rr}</div>`, a: s, w: ['<', '>', '='].filter(x => x !== s), speak: `${L} a ${Rr}. Ktorý znak patrí medzi ne?`, ex: `${a} ${s} ${b}` }; } },
  { id: 'm2-utvary', g: 2, type: 'qa', name: 'Útvary a ich strany', icon: '🔷', ex: 'Spočítaj strany alebo rohy útvaru prstom.', items: lines(`
    Koľko strán má štvorec?|4|3;5;6
    Koľko strán má trojuholník?|3|4;2;5
    Koľko vrcholov má obdĺžnik?|4|3;5;8
    Ktorý útvar nemá žiadne rohy?|kruh|štvorec;trojuholník;obdĺžnik
    Ktorý útvar má všetky strany rovnako dlhé?|štvorec|obdĺžnik;kruh;ovál
    Čím meriame dĺžku úsečky?|pravítkom|váhou;hodinami;teplomerom
    Koľko strán má päťuholník?|5|4;6;3
    Aký tvar má slniečko?|kruh|štvorec;trojuholník;obdĺžnik`) },
  { id: 'm3-nasob10', g: 3, name: 'Násobenie a delenie 10 a 100', icon: '🔟', gen() { const t = R(0, 3); if (t === 0) { const a = R(2, 99); return { q: `${a} · 10 = ?`, a: a * 10, ex: 'Pri násobení 10 pripíšeme jednu nulu.' }; } if (t === 1) { const a = R(2, 9); return { q: `${a} · 100 = ?`, a: a * 100, ex: 'Pri násobení 100 pripíšeme dve nuly.' }; } if (t === 2) { const a = R(2, 99) * 10; return { q: `${a} : 10 = ?`, a: a / 10, ex: 'Pri delení 10 škrtneme jednu nulu.' }; } const a = R(2, 9) * 100; return { q: `${a} : 100 = ?`, a: a / 100, ex: 'Pri delení 100 škrtneme dve nuly.' }; } },
  { id: 'm3-porov', g: 3, name: 'Porovnávanie do 1 000', icon: '⚖️', gen() { const a = R(100, 999); const b = Math.random() < .15 ? a : (Math.random() < .5 ? a + pick([-100, -10, -1, 1, 10, 100]) : R(100, 999)); const bb = Math.max(100, Math.min(999, b)); const s = a > bb ? '>' : a < bb ? '<' : '='; return { q: 'Ktorý znak patrí do krúžku?', html: `<div class="bigeq small">${a} <span class="slot">?</span> ${bb}</div>`, a: s, w: ['<', '>', '='].filter(x => x !== s), speak: `${a} a ${bb}. Ktorý znak patrí medzi ne?`, ex: 'Porovnávame najprv stovky, potom desiatky a nakoniec jednotky.' }; } },
  { id: 'm3-trvanie', g: 3, name: 'Ako dlho to trvá?', icon: '⏱️', gen() { const h = R(7, 17); const m1 = pick([0, 15, 30]); const d = pick([15, 30, 45, 60, 90]); const tm = h * 60 + m1 + d; const f = t => `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`; if (Math.random() < .5) return { q: `Začiatok o ${f(h * 60 + m1)}, koniec o ${f(tm)}. Koľko minút to trvalo?`, a: d, ex: `Od ${f(h * 60 + m1)} do ${f(tm)} je ${d} minút.` }; const a = f(tm); const w = [...new Set([f(tm + 15), f(tm - 15), f(tm + 60), f(h * 60 + m1 + 30)])].filter(x => x !== a).slice(0, 3); return { q: `Film začal o ${f(h * 60 + m1)} a trval ${d} minút. Kedy skončil?`, a, w, ex: `${f(h * 60 + m1)} + ${d} min = ${a}` }; } },
  { id: 'm4-delenie', g: 4, name: 'Písomné delenie', icon: '➗', gen() { const d = R(2, 9), q = R(12, 99); return { q: `${d * q} : ${d} = ?`, a: q, ex: `Skúška: ${q} · ${d} = ${d * q}` }; } },
  { id: 'm4-zaokr', g: 4, name: 'Zaokrúhľovanie veľkých čísel', icon: '🎯', gen() { const n = R(1001, 99999); const k = pick([10, 100, 1000]); const a = Math.round(n / k) * k; const w = [...new Set([a + k, a - k, Math.floor(n / k) * k === a ? Math.ceil(n / k) * k : Math.floor(n / k) * k])].filter(x => x !== a && x > 0).slice(0, 3); while (w.length < 3) w.push(a + k * (w.length + 2)); return { q: `Zaokrúhli číslo ${fmt(n)} na ${{ 10: 'desiatky', 100: 'stovky', 1000: 'tisícky' }[k]}.`, a: fmt(a), w: w.map(fmt), ex: 'Pozri sa na číslicu napravo od miesta, na ktoré zaokrúhľuješ: 0–4 nadol, 5–9 nahor.' }; } },
  { id: 'm4-dvakroky', g: 4, name: 'Slovné úlohy na dva kroky', icon: '🧾', gen() { const [n, f] = pick(KIDS); const t = R(0, 2); if (t === 0) { const c = R(3, 15), k = R(2, 5), a = c * k + R(5, 40); return { q: `${n} ${f ? 'mala' : 'mal'} ${a} €. ${f ? 'Kúpila' : 'Kúpil'} si ${k} knihy po ${c} €. Koľko eur ${f ? 'jej' : 'mu'} zostalo?`, a: a - c * k, ex: `${k} · ${c} = ${c * k}, potom ${a} − ${c * k} = ${a - c * k}` }; } if (t === 1) { const r = R(3, 9), p = R(4, 12), m = R(2, r * p - 1); return { q: `V sále je ${r} radov po ${p} stoličiek. Obsadených je ${m}. Koľko stoličiek je voľných?`, a: r * p - m, ex: `${r} · ${p} = ${r * p}, potom ${r * p} − ${m} = ${r * p - m}` }; } const a = R(20, 60), b = R(10, 40), d = R(2, 4); const s = (a + b) - ((a + b) % d); return { q: `V košíku je ${a} jabĺk a ${s - a} hrušiek. Ovocie rozdelíme rovnako do ${d} misiek. Koľko kusov bude v jednej miske?`, a: s / d, ex: `${a} + ${s - a} = ${s}, potom ${s} : ${d} = ${s / d}` }; } }
];
const SJL3 = [
  { id: 's1-rymy', g: 1, type: 'qa', name: 'Rýmy', icon: '🎵', ex: 'Rýmujú sa slová, ktoré na konci znejú rovnako: pes – les.', items: lines(`
    Čo sa rýmuje so slovom „pes“?|les|mačka;dom;ruka
    Čo sa rýmuje so slovom „dom“?|hrom|pes;lopta;stôl
    Čo sa rýmuje so slovom „mačka“?|kačka|myš;stromček;pes
    Čo sa rýmuje so slovom „ryba“?|chyba|voda;more;sova
    Čo sa rýmuje so slovom „hora“?|nora|kopec;les;skala
    Čo sa rýmuje so slovom „kvet“?|svet|lúka;tráva;ruža
    Čo sa rýmuje so slovom „vlak“?|mrak|auto;koľaj;stanica
    Čo sa rýmuje so slovom „mak“?|rak|chlieb;kvet;pole
    Čo sa rýmuje so slovom „žaba“?|baba|jazero;mucha;potok
    Čo sa rýmuje so slovom „myška“?|šiška|mačka;syr;diera`) },
  { id: 's1-veta', g: 1, type: 'qa', name: 'Správne napísaná veta', icon: '✏️', ex: 'Veta začína veľkým písmenom a končí bodkou, otáznikom alebo výkričníkom.', items: lines(`
    Ktorá veta je napísaná správne?|Mama varí obed.|mama varí obed.;Mama varí obed
    Ktorá veta je napísaná správne?|Pes beží.|pes beží.;Pes beží
    Ktorá veta je napísaná správne?|Ema má loptu.|ema má loptu.;Ema má loptu
    Ktorá veta je napísaná správne?|Kde je mačka?|kde je mačka?;Kde je mačka.
    Ktorá veta je napísaná správne?|Ideme do školy.|ideme do školy.;Ideme do školy
    Ktorá veta je napísaná správne?|Tomáš píše.|tomáš píše.;Tomáš píše`) },
  { id: 's2-dvojhlasky', g: 2, type: 'fill', name: 'Doplň dvojhlásku', icon: '🔠', choices: ['ia', 'ie', 'iu', 'ô'], items: () => lines(`
    k_ň|ô|kôň
    st_l|ô|stôl
    n_ž|ô|nôž
    v_ňa|ô|vôňa
    m_sto|ie|miesto
    l_tadlo|ie|lietadlo
    b_ly|ie|biely
    ml_ko|ie|mlieko
    pr_teľ|ia|priateľ
    č_pka|ia|čiapka
    ľud_|ia|ľudia
    pát_|ia|pátia`)().filter(x => x[0] !== 'pát_'), ex: 'Dvojhlásky sú ia, ie, iu, ô.' },
  { id: 's2-slabiky', g: 2, type: 'qa', name: 'Delenie slov na slabiky', icon: '✂️', ex: 'Slovo si vytlieskaj. Každá slabika má samohlásku alebo dvojhlásku.', items: () => lines(`
    Ktoré delenie na slabiky je správne?|la-vi-ca|lav-i-ca;la-vic-a
    Ktoré delenie na slabiky je správne?|ja-ho-da|jah-o-da;ja-hod-a
    Ktoré delenie na slabiky je správne?|čo-ko-lá-da|čok-o-lá-da;čo-kol-á-da
    Ktoré delenie na slabiky je správne?|pa-pa-gáj|pap-a-gáj;pa-pag-áj
    Ktoré delenie na slabiky je správne?|te-le-ví-zor|tel-e-ví-zor;te-lev-í-zor
    Ktoré delenie na slabiky je správne?|po-mo-ranč|pom-o-ranč;po-mor-anč
    Ktoré delenie na slabiky je správne?|ko-le-so|kol-e-so;ko-les-o
    Ktoré delenie na slabiky je správne?|ba-bič-ka|bab-ič-ka;ba-bi-čka`)().filter(x => !x[1].includes('po-mo')) },
  { id: 's3-pribuzne', g: 3, type: 'qa', name: 'Príbuzné slová', icon: '🌳', items: lines(`
    Ktoré slovo je príbuzné so slovom „ryba“?|rybár|rýchly;rytier;ryža
    Ktoré slovo je príbuzné so slovom „syn“?|synovec|sýkorka;syr;sypať
    Ktoré slovo je príbuzné so slovom „býk“?|býčok|byt;bylina;bystrý
    Ktoré slovo je príbuzné so slovom „syr“?|syrový|syn;sýty;syčať
    Ktoré slovo je príbuzné so slovom „mydlo“?|mydlový|myš;mýliť;myslieť
    Ktoré slovo je príbuzné so slovom „jazyk“?|jazykový|jazero;jahoda;jaskyňa
    Ktoré slovo je príbuzné so slovom „vysoký“?|výška|vydra;výr;vyť
    Ktoré slovo je príbuzné so slovom „kobyla“?|kobylka|kopyto;kolobežka;koberec`), ex: 'Príbuzné slová majú spoločný základ, preto sa píšu s rovnakým y.' },
  { id: 's3-spravne', g: 3, name: 'Ktoré slovo je správne?', icon: '🔍', gen() { const [, , w] = pick(vyb(['b', 'm', 'p', 'r', 's', 'v', 'z'])); const v = spellVariants(w); return { q: 'Ktoré slovo je napísané správne?', a: w, w: v.filter(x => x !== w), ex: `Správne je ${w}. Po obojakej spoluhláske píšeme y len vo vybraných a príbuzných slovách.` }; } },
  { id: 's4-osoba', g: 4, type: 'cat', name: 'Osoba slovies', icon: '🙋', prompt: 'Sloveso „{x}“ je v…', choices: ['1. osobe', '2. osobe', '3. osobe'], items: 'píšem|1. osobe,čítame|1. osobe,spievam|1. osobe,skáčeme|1. osobe,beháš|2. osobe,píšeš|2. osobe,čítate|2. osobe,kreslíte|2. osobe,píše|3. osobe,behá|3. osobe,čítajú|3. osobe,skáču|3. osobe,spí|3. osobe', ex: '1. osoba: ja, my. 2. osoba: ty, vy. 3. osoba: on, ona, ono, oni.' },
  { id: 's4-vlastne', g: 4, type: 'cat', name: 'Vlastné a všeobecné mená', icon: '🏙️', prompt: '„{x}“ je…', choices: ['vlastné podstatné meno', 'všeobecné podstatné meno'], items: 'Bratislava|vlastné podstatné meno,Dunaj|vlastné podstatné meno,Peter|vlastné podstatné meno,Tatry|vlastné podstatné meno,Slovensko|vlastné podstatné meno,Bodka (meno psa)|vlastné podstatné meno,Košice|vlastné podstatné meno,mesto|všeobecné podstatné meno,rieka|všeobecné podstatné meno,chlapec|všeobecné podstatné meno,hory|všeobecné podstatné meno,krajina|všeobecné podstatné meno,pes|všeobecné podstatné meno,škola|všeobecné podstatné meno', ex: 'Vlastné mená (mená ľudí, zvierat, miest, riek, hôr) píšeme s veľkým začiatočným písmenom.' }
];
for (const t of MATH3) { MATH.push(t); const x = { ...t, s: 'mat' }; ALL_TOPICS.push(x); TOPIC[t.id] = x; }
for (const t of SJL3) { SJL.push(t); const x = { ...t, s: 'sjl' }; ALL_TOPICS.push(x); TOPIC[t.id] = x; }

/* ===== Všeobecný prehľad do dennej výzvy (ľahké otázky) ===== */
const GK = { id: 'gk', g: 0, s: 'prv', type: 'qa', name: 'Svet okolo nás', icon: '🌈', items: lines(`
    Koľko nôh má slon?|4|2;6;8
    Koľko nôh má pavúk?|8|6;4;10
    Koľko nôh má mravec?|6|4;8;2
    Koľko nôh má sliepka?|2|4;6;3
    Ktoré zviera má dlhý chobot?|slon|žirafa;kôň;medveď
    Ktoré zviera má najdlhší krk?|žirafa|slon;zebra;tiger
    Ktoré zviera mňaučí?|mačka|pes;krava;koza
    Čo nám dáva krava?|mlieko|vajcia;med;vlnu
    Čo nám dávajú včely?|med|mlieko;vajcia;vlnu
    Koľko kolies má bicykel?|2|3;4;1
    Koľko kolies má auto?|4|2;3;6
    Akej farby je zrelý banán?|žltý|modrý;fialový;čierny
    Akej farby je tráva?|zelená|červená;modrá;žltá
    Kde žijú ryby?|vo vode|na strome;v piesku;v oblakoch
    Čo potrebujeme, keď prší?|dáždnik|slnečné okuliare;plavky;sánky
    Koľko hodín má jeden deň?|24|12;10;60
    Ktorý mesiac je v roku prvý?|január|marec;december;september
    Ktorý vták nevie lietať a žije v Antarktíde?|tučniak|orol;vrabec;lastovička
    Z čoho rastie strom?|zo semienka|z kameňa;z piesku;z ľadu
    Čo svieti na oblohe cez deň?|Slnko|Mesiac;hviezdy;lampa
    Koľko dní má týždeň?|7|5;10;12
    Kto lieči choré zvieratá?|veterinár|pekár;pilot;krajčír
    Čo robí medveď v zime?|spí|pláva;opeľuje kvety;odletí
    Ktoré ovocie je červené a rastie na kríčku pri zemi?|jahoda|banán;citrón;slivka`) };
TOPIC.gk = GK;
