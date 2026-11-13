/* ===== Predmety v Prehľade: prvouka, prírodoveda, vlastiveda, angličtina, informatika, etika ===== */
const AREA_DEF = { prvouka: { i: '🌱', n: 'Prvouka' }, prir: { i: '🔬', n: 'Prírodoveda' }, vlast: { i: '🗺️', n: 'Vlastiveda' }, anj: { i: '🇬🇧', n: 'Angličtina' }, info: { i: '💻', n: 'Informatika' }, etika: { i: '💛', n: 'Etika a náboženstvo' } };
const areasFor = g => g <= 2 ? ['prvouka', 'anj', 'etika'] : ['prir', 'vlast', 'anj', 'info', 'etika'];
const areaOf = (t, g) => { const a = (TOPIC[t.id] && TOPIC[t.id].area) || t.area || 'bio'; if (a === 'bio' || a === 'geo') return g <= 2 ? 'prvouka' : a === 'bio' ? 'prir' : 'vlast'; return a; };
const U3_PRV = [
  { id: 'i3-pocitac', g: 3, type: 'qa', area: 'info', name: 'Počítač a jeho časti', icon: '🖥️', ex: 'Klávesnica a myš slúžia na zadávanie, monitor a reproduktory nám niečo ukazujú alebo hrajú.', items: lines(`
    Čím píšeme písmená do počítača?|klávesnicou|monitorom;reproduktorom;tlačiarňou
    Na čom vidíme obraz z počítača?|na monitore|na klávesnici;na myši;na kábli
    Čo nám vytlačí obrázok na papier?|tlačiareň|myš;monitor;slúchadlá
    Čím klikáme a hýbeme šípkou na obrazovke?|myšou|tlačiarňou;reproduktorom;mikrofónom
    Cez čo počujeme zvuk z počítača?|cez reproduktory|cez klávesnicu;cez monitor;cez myš
    Do čoho hovoríme, keď nás má počítač počuť?|do mikrofónu|do tlačiarne;do myši;do monitora
    Ako sa volá malý počítač, ktorý nosíme vo vrecku?|mobil|tlačiareň;skener;router
    Čo urobíme na konci práce s počítačom?|správne ho vypneme|vytrhneme kábel;polejeme ho vodou;necháme ho celú noc zapnutý`) },
  { id: 'i3-postup', g: 3, type: 'qa', area: 'info', name: 'Postupy krok za krokom', icon: '🧩', ex: 'Algoritmus je presný postup krokov v správnom poradí.', items: lines(`
    Čo urobíme ako prvé, keď si chceme umyť ruky?|pustíme vodu|utrieme si ruky;zatvoríme vodu;odídeme
    Čo urobíme ako posledné pri čistení zubov?|vypláchneme si ústa|nanesieme pastu;vezmeme kefku;otvoríme pastu
    Robot ide 2 kroky dopredu a potom 2 kroky dozadu. Kde skončí?|tam, kde začal|o 4 kroky ďalej;o 2 kroky ďalej;vľavo
    Ako sa volá presný postup krokov v správnom poradí?|algoritmus|hádanka;rozprávka;náhoda
    Čo urobíme, keď v postupe nájdeme chybu?|opravíme ju|nič;začneme plakať;vymažeme všetko
    Robot otočený na sever sa otočí doprava. Kam sa pozerá?|na východ|na juh;na západ;stále na sever
    Opakuj 3-krát: tlesknúť. Koľkokrát tlesneš?|3|1;2;6
    Čo musí byť v recepte na palacinky skôr?|zmiešať cesto|zjesť palacinku;posypať cukrom;umyť riad`) },
  { id: 'i4-bezpecne', g: 4, type: 'qa', area: 'info', name: 'Bezpečne na internete', icon: '🛡️', ex: 'Heslo, adresu a fotky nikomu cudziemu neposielame. Keď niečo nepríjemné, povieme to dospelému.', items: lines(`
    Komu môžeš povedať svoje heslo?|rodičom|kamarátovi zo hry;cudziemu človeku;všetkým v triede
    Neznámy človek v hre chce tvoju adresu. Čo urobíš?|nepoviem ju a poviem to rodičom|poviem mu ju;pošlem fotku domu;stretnem sa s ním
    Aké heslo je najbezpečnejšie?|Mrkva7!Slon|1234;heslo;moje meno
    Čo urobíš, keď ti niekto na internete píše zlé veci?|poviem to dospelému|odpíšem mu zlé veci;nikomu nepoviem;dám mu heslo
    Môže byť všetko na internete pravda?|nie, treba to overiť|áno, vždy;áno, ak je to video;áno, ak je tam obrázok
    Čo je lepšie poslať do skupiny so spolužiakmi?|milú správu|fotku cudzieho človeka bez dovolenia;posmešný obrázok;heslo
    Prečo sa nemáme stretávať s ľuďmi z internetu bez rodičov?|nevieme, kto naozaj sú|lebo je to nuda;lebo prší;lebo to nejde
    Čo urobíš, keď vyskočí okno „Vyhral si mobil!“?|nekliknem a zavriem ho|kliknem;napíšem tam adresu;zavolám kamarátom`) },
  { id: 'i4-kod', g: 4, name: 'Tajné kódy', icon: '🔐', area: 'info', gen() { const W = ['MAMA', 'LES', 'PES', 'DOM', 'SLON', 'ROBOT', 'KOD', 'MAPA']; const w = pick(W); const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; const sh = c => A[(A.indexOf(c) + 1) % 26]; const enc = [...w].map(sh).join(''); const wr = shuffle(W.filter(x => x !== w && x.length === w.length)).slice(0, 2); const w2 = [...w].reverse().join(''); return { q: `Každé písmeno je posunuté o jedno ďalej v abecede (A→B). Čo znamená „${enc}“?`, a: w, w: [...new Set([...wr, w2 !== w ? w2 : 'NIC', [...w].map(c => A[(A.indexOf(c) + 2) % 26]).join('')])].filter(x => x !== w).slice(0, 3), ex: `Každé písmeno vrátime o jedno späť: ${enc} → ${w}.` }; } },
  { id: 'p4-planety', g: 4, type: 'qa', area: 'bio', name: 'Slnečná sústava', icon: '🪐', ex: 'Okolo Slnka obieha 8 planét: Merkúr, Venuša, Zem, Mars, Jupiter, Saturn, Urán, Neptún.', items: lines(`
    Koľko planét obieha okolo Slnka?|8|5;10;12
    Ktorá planéta je najbližšie k Slnku?|Merkúr|Zem;Neptún;Mars
    Ktorá planéta je najväčšia?|Jupiter|Zem;Merkúr;Mars
    Ktorá planéta má výrazné prstence?|Saturn|Mars;Venuša;Zem
    Ktorej planéte hovoríme červená planéta?|Mars|Jupiter;Urán;Merkúr
    Na ktorej planéte žijeme?|na Zemi|na Marse;na Venuši;na Saturne
    Čo obieha okolo Zeme?|Mesiac|Slnko;Mars;Jupiter
    Za aký čas obehne Zem okolo Slnka?|za 1 rok|za 1 deň;za 1 týždeň;za 1 hodinu
    Prečo sa strieda deň a noc?|Zem sa otáča okolo svojej osi|Slnko zhasína;Mesiac zakryje Slnko;mraky zakryjú Slnko
    Čo je Slnko?|hviezda|planéta;mesiac;kométa`) },
  { id: 'e1-kamarat', g: 1, type: 'qa', area: 'etika', name: 'Dobrý kamarát', icon: '🤝', items: lines(`
    Kamarát spadol a plače. Čo urobíš?|pomôžem mu a utíšim ho|zasmejem sa;odídem;nič
    Čo povieme, keď nám niekto pomôže?|ďakujem|nič;choď preč;nechcem
    Čo povieme, keď niekomu ublížime?|prepáč|je mi to jedno;dobre ti tak;nič
    Spolužiak nemá s kým hrať. Čo urobíš?|zavolám ho hrať sa|budem sa mu smiať;nevšímam si ho;ujdem
    Ako sa správame, keď sa s niekým hráme?|striedame sa a delíme sa|berieme všetky hračky;kričíme;podvádzame
    Čo urobíme, keď sa pohádame?|porozprávame sa a udobríme sa|bijeme sa;nikdy sa nerozprávame;ohovárame ho`) },
  { id: 'e2-pocity', g: 2, type: 'qa', area: 'etika', name: 'Moje pocity', icon: '😊', ex: 'Všetky pocity sú v poriadku. Dôležité je povedať o nich a nikomu neubližovať.', items: lines(`
    Ako sa cítime, keď dostaneme darček?|radostne|smutne;nahnevane;vystrašene
    Čo môžeme urobiť, keď sme nahnevaní?|zhlboka sa nadýchnuť a upokojiť sa|udrieť niekoho;rozbiť hračku;kričať na všetkých
    Čo pomáha, keď sme smutní?|porozprávať sa s niekým blízkym|byť celý deň sám;nič nejesť;hnevať sa na všetkých
    Ako spoznáme, že je kamarát smutný?|je ticho a nesmeje sa|skáče od radosti;smeje sa;spieva
    Čo urobíme, keď sa bojíme?|povieme to rodičom alebo učiteľovi|schováme sa navždy;nikomu nič;utečieme z domu
    Je v poriadku niekedy plakať?|áno|nie, nikdy;len v noci;len dospelí`) },
  { id: 'e3-sviatky', g: 3, type: 'qa', area: 'etika', name: 'Sviatky a tradície', icon: '🎄', items: lines(`
    Kedy oslavujeme Vianoce?|v decembri|v júli;v marci;v septembri
    Čo zdobíme na Vianoce?|stromček|vajíčka;tekvicu;šarkana
    Kedy maľujeme vajíčka?|na Veľkú noc|na Vianoce;na Silvestra;na Deň matiek
    Ktorý deň je posledný v roku?|Silvester|Nový rok;Štedrý deň;Veľká noc
    Komu dávame darček na Deň matiek?|mame|učiteľke z inej školy;susedovmu psovi;nikomu
    Čo robíme na Štedrý večer?|stretneme sa s rodinou pri večeri|ideme do školy;maľujeme vajíčka;púšťame šarkana`) },
  { id: 'e4-spolu', g: 4, type: 'qa', area: 'etika', name: 'Žijeme spolu', icon: '🌍', items: lines(`
    Čo znamená byť tolerantný?|rešpektovať, že sú ľudia rôzni|smiať sa z iných;nehrať sa s inými;myslieť si, že mám vždy pravdu
    Spolužiak je nový a nikoho nepozná. Čo urobíš?|predstavím sa a ukážem mu školu|nevšímam si ho;posmievam sa mu;ohováram ho
    Čo je ohováranie?|hovoriť o niekom zlé veci za jeho chrbtom|pochváliť niekoho;pomôcť niekomu;požičať pero
    Ako môžeme pomôcť starším ľuďom?|pustiť ich sednúť v autobuse|predbehnúť ich;kričať na nich;nevšímať si ich
    Čo urobíš, keď vidíš, že niekomu ubližujú?|poviem to dospelému a pomôžem|pridám sa;nahrávam to;utečiem a nikomu nič
    Prečo triedime odpad?|aby sme chránili prírodu|aby bolo viac košov;lebo je to zábavné;nemusíme ho triediť`) }
];
for (const t of U3_PRV) { PRV.push(t); const x = { ...t, s: 'prv' }; ALL_TOPICS.push(x); TOPIC[t.id] = x; }
