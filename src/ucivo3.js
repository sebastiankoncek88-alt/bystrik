/* ===== Predmety v Prehľade: prvouka, prírodoveda, vlastiveda, angličtina, informatika, etika ===== */
const AREA_DEF = { prvouka: { i: '🌱', n: 'Prvouka' }, prir: { i: '🔬', n: 'Prírodoveda' }, vlast: { i: '🗺️', n: 'Vlastiveda' }, anj: { i: '🇬🇧', n: 'Angličtina' }, info: { i: '💻', n: 'Informatika' }, etika: { i: '💛', n: 'Etika' } };
let areasFor = g => g <= 2 ? ['prvouka', 'anj', 'etika'] : ['prir', 'vlast', 'anj', 'info', 'etika'];
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
    Čo urobíme na konci práce s počítačom?|správne ho vypneme|vytrhneme kábel;polejeme ho vodou;necháme ho celú noc zapnutý
    Ktorá časť počítača ukazuje obraz?|monitor|klávesnica;myš;tlačiareň
    Čo urobí tlačiareň?|vytlačí dokument na papier|zahrá hudbu;odfotí nás;nabije mobil
    Na čo slúži myš?|na ukazovanie a klikanie|na tlač;na počúvanie hudby;na kreslenie fixkou
    Ako správne vypneme počítač?|cez ponuku Vypnúť|vytiahneme kábel;zatvoríme monitor rukou;udrieme do neho
    Čo je súbor?|uložená práca v počítači, napr. obrázok alebo text|kus nábytku;káblik;druh myši`) },
  { id: 'i3-postup', g: 3, type: 'qa', area: 'info', name: 'Postupy krok za krokom', icon: '🧩', ex: 'Algoritmus je presný postup krokov v správnom poradí.', items: lines(`
    Čo urobíme ako prvé, keď si chceme umyť ruky?|pustíme vodu|utrieme si ruky;zatvoríme vodu;odídeme
    Čo urobíme ako posledné pri čistení zubov?|vypláchneme si ústa|nanesieme pastu;vezmeme kefku;otvoríme pastu
    Robot ide 2 kroky dopredu a potom 2 kroky dozadu. Kde skončí?|tam, kde začal|o 4 kroky ďalej;o 2 kroky ďalej;vľavo
    Ako sa volá presný postup krokov v správnom poradí?|algoritmus|hádanka;rozprávka;náhoda
    Čo urobíme, keď v postupe nájdeme chybu?|opravíme ju|nič;začneme plakať;vymažeme všetko
    Robot otočený na sever sa otočí doprava. Kam sa pozerá?|na východ|na juh;na západ;stále na sever
    Opakuj 3-krát: tlesknúť. Koľkokrát tlesneš?|3|1;2;6
    Čo musí byť v recepte na palacinky skôr?|zmiešať cesto|zjesť palacinku;posypať cukrom;umyť riad
    Robot ide 3 kroky dopredu a 1 dozadu. O koľko krokov je ďalej?|o 2|o 4;o 3;o 1
    Čo je algoritmus?|presný postup krokov|druh počítača;hra na schovávačku;pieseň
    Pri varení čaju: čo urobíme pred zaliatím vrecúška?|zovrieme vodu|vypijeme čaj;umyjeme hrnček po pití;pridáme cukor po vypití
    Čo sa stane, ak v postupe vymeníme poradie krokov?|výsledok môže byť zlý|nič sa nestane nikdy;vždy to bude lepšie;postup zmizne
    Robot otočí doprava 4-krát. Kam sa pozerá?|tam, kam na začiatku|doľava;dozadu;doprava
    Čo je opakovanie (cyklus) v programe?|keď sa niektoré kroky robia viackrát|keď program skončí;keď sa vypne počítač;chyba v programe`) },
  { id: 'i4-bezpecne', g: 4, type: 'qa', area: 'info', name: 'Bezpečne na internete', icon: '🛡️', ex: 'Heslo, adresu a fotky nikomu cudziemu neposielame. Keď niečo nepríjemné, povieme to dospelému.', items: lines(`
    Komu môžeš povedať svoje heslo?|rodičom|kamarátovi zo hry;cudziemu človeku;všetkým v triede
    Neznámy človek v hre chce tvoju adresu. Čo urobíš?|nepoviem ju a poviem to rodičom|poviem mu ju;pošlem fotku domu;stretnem sa s ním
    Aké heslo je najbezpečnejšie?|Mrkva7!Slon|1234;heslo;moje meno
    Čo urobíš, keď ti niekto na internete píše zlé veci?|poviem to dospelému|odpíšem mu zlé veci;nikomu nepoviem;dám mu heslo
    Môže byť všetko na internete pravda?|nie, treba to overiť|áno, vždy;áno, ak je to video;áno, ak je tam obrázok
    Čo je lepšie poslať do skupiny so spolužiakmi?|milú správu|fotku cudzieho človeka bez dovolenia;posmešný obrázok;heslo
    Prečo sa nemáme stretávať s ľuďmi z internetu bez rodičov?|nevieme, kto naozaj sú|lebo je to nuda;lebo prší;lebo to nejde
    Čo urobíš, keď vyskočí okno „Vyhral si mobil!“?|nekliknem a zavriem ho|kliknem;napíšem tam adresu;zavolám kamarátom
    Čo urobíš, keď ti niekto online píše škaredé veci?|poviem to rodičom a zablokujem ho|odpíšem mu ešte horšie;nikomu nepoviem;pošlem mu fotku
    Môžeš veriť všetkému, čo je na internete?|nie, treba to overiť|áno, všetko je pravda;áno, ak je to farebné;áno, ak to má veľa lajkov
    Čo nikdy nedávame na internet?|adresu a telefónne číslo|obľúbenú farbu;kresbu zvieratka;názov obľúbenej rozprávky
    Prišla ti správa „Vyhral si mobil, klikni sem“. Čo urobíš?|nekliknem a ukážem ju rodičom|hneď kliknem;pošlem heslo;napíšem adresu
    Ako dlho je dobré byť denne pri obrazovke?|primerane, s prestávkami|celý deň bez prestávky;celú noc;čím dlhšie, tým lepšie
    Čo je kyberšikana?|ubližovanie cez internet alebo mobil|hra s kockami;počítačová myš;oprava počítača`) },
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
    Čo je Slnko?|hviezda|planéta;mesiac;kométa
    Ktorá planéta sa volá aj červená?|Mars|Venuša;Jupiter;Urán
    Koľko planét má naša slnečná sústava?|8|9;7;12
    Čo je Mesiac?|prirodzená družica Zeme|planéta;hviezda;kométa`) },
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
    Čo robíme na Štedrý večer?|stretneme sa s rodinou pri večeri|ideme do školy;maľujeme vajíčka;púšťame šarkana
    Čo zapaľujeme na adventnom venci?|sviečky|prskavky;lampáše;ohník
    Ktorý sviatok je 1. januára?|Nový rok|Vianoce;Veľká noc;Deň detí
    Kedy je Deň detí?|1. júna|24. decembra;1. januára;6. decembra
    Čo robíme na Veľkonočný pondelok podľa tradície?|oblievame a šibeme|zdobíme stromček;púšťame ohňostroj;spievame koledy
    Čo sú koledy?|piesne, ktoré spievame na Vianoce|veľkonočné vajíčka;druh koláča;hra s loptou
    Čo pečieme pred Vianocami?|medovníky|pizzu;chlieb na grile;tortu na Deň detí`) },
  { id: 'e4-spolu', g: 4, type: 'qa', area: 'etika', name: 'Žijeme spolu', icon: '🌍', items: lines(`
    Čo znamená byť tolerantný?|rešpektovať, že sú ľudia rôzni|smiať sa z iných;nehrať sa s inými;myslieť si, že mám vždy pravdu
    Spolužiak je nový a nikoho nepozná. Čo urobíš?|predstavím sa a ukážem mu školu|nevšímam si ho;posmievam sa mu;ohováram ho
    Čo je ohováranie?|hovoriť o niekom zlé veci za jeho chrbtom|pochváliť niekoho;pomôcť niekomu;požičať pero
    Ako môžeme pomôcť starším ľuďom?|pustiť ich sednúť v autobuse|predbehnúť ich;kričať na nich;nevšímať si ich
    Čo urobíš, keď vidíš, že niekomu ubližujú?|poviem to dospelému a pomôžem|pridám sa;nahrávam to;utečiem a nikomu nič
    Prečo triedime odpad?|aby sme chránili prírodu|aby bolo viac košov;lebo je to zábavné;nemusíme ho triediť
    Čo znamená tolerancia?|rešpektujeme, že ľudia sú rôzni|všetci musia byť rovnakí;smejeme sa inakosti;nevšímame si nikoho
    Spolužiak hovorí iným jazykom. Ako sa zachováš?|pomôžem mu a skúsim sa dohovoriť|budem sa mu smiať;budem ho ignorovať;poviem mu, nech odíde
    Čo je šikanovanie?|keď niekto opakovane ubližuje slabšiemu|keď sa spolu hráme;keď si požičiame pero;keď sa učíme
    Kto má v rodine povinnosti?|všetci podľa svojich síl|len mama;len otec;nikto
    Čo je dobrovoľníctvo?|pomoc druhým bez nároku na peniaze|práca za veľký plat;nakupovanie;sledovanie televízie`) }
];
for (const t of U3_PRV) { PRV.push(t); const x = { ...t, s: 'prv' }; ALL_TOPICS.push(x); TOPIC[t.id] = x; }
/* ===== Etika a náboženstvo zvlášť, viac tém ===== */
AREA_DEF.etika = { i: '💛', n: 'Etika' }; AREA_DEF.nab = { i: '⛪', n: 'Náboženstvo' };
const _areasFor0 = areasFor;
areasFor = g => [..._areasFor0(g), 'nab'];
TOPIC['e3-sviatky'].area = 'nab'; { const t = PRV.find(x => x.id === 'e3-sviatky'); if (t) t.area = 'nab'; }
const U4_PRV = [
  { id: 'e1-slusnost', g: 1, type: 'qa', area: 'etika', name: 'Čarovné slovíčka', icon: '🪄', ex: 'Prosím, ďakujem, prepáč a pozdrav sú čarovné slovíčka, ktoré robia svet krajším.', items: lines(`
    Čo povieme, keď niečo chceme?|prosím|daj;hneď;chcem to
    Čo povieme, keď vojdeme do triedy?|dobrý deň|nič;čau, všetci;haló
    Čo povieme pri odchode?|dovidenia|nič;hej;choď
    Kamarát ti požičal pastelku. Čo povieš?|ďakujem|konečne;nič;daj ešte
    Omylom si do niekoho vrazil. Čo povieš?|prepáč|pozeraj sa;nič;ty si na vine
    Ako hovoríme s dospelými, ktorých dobre nepoznáme?|vykáme im|kričíme;tykáme im;nehovoríme`) },
  { id: 'e2-rodina', g: 2, type: 'qa', area: 'etika', name: 'Pomáham doma', icon: '🏡', items: lines(`
    Ako môžeš pomôcť doma?|upratať si hračky|rozhádzať veci;nič nerobiť;hnevať sa
    Mama varí obed. Čo môžeš urobiť?|prestrieť stôl|pýtať sladkosti;kričať;pustiť hudbu nahlas
    Čo urobíš, keď je tvoj súrodenec smutný?|spýtam sa, čo sa stalo|zasmejem sa;vezmem mu hračku;odídem
    Starý otec zle vidí. Ako mu pomôžeš?|prečítam mu, čo potrebuje|schovám mu okuliare;nič;smejem sa
    Prečo je dobré pomáhať doma?|lebo sme rodina a máme sa radi|lebo musíme;za peniaze;aby sme sa chválili
    Čo urobíme po jedle?|odnesieme tanier|necháme ho na stole;hodíme ho;schováme ho pod stôl`) },
  { id: 'e3-pravda', g: 3, type: 'qa', area: 'etika', name: 'Pravda a dôvera', icon: '🤞', items: lines(`
    Omylom si rozbil vázu. Čo urobíš?|poviem pravdu|schovám črepy;poviem, že to bol pes;nič
    Prečo je dôležité hovoriť pravdu?|aby nám ostatní dôverovali|aby sme sa vyhli práci;nie je to dôležité;aby sme vyhrali
    Kamarát ti povedal tajomstvo. Čo urobíš?|nechám si ho pre seba|poviem ho všetkým;napíšem ho na tabuľu;vysmejem ho
    Kedy tajomstvo povedať dospelému?|keď niekomu hrozí nebezpečenstvo|nikdy;vždy hneď;keď sa nudím
    Našiel si na chodbe peňaženku. Čo urobíš?|odnesiem ju učiteľke|nechám si ju;vyhodím ju;minie sa na sladkosti
    Čo znamená sľúbiť niečo?|že to naozaj urobíme|že to možno urobíme;že to nikdy neurobíme;nič
    Našiel si na chodbe cudziu peňaženku. Čo urobíš?|odovzdám ju učiteľke alebo vrátnikovi|nechám si ju;vyhodím ju;miniem peniaze
    Čo je klamstvo?|keď vedome nehovoríme pravdu|keď sa pomýlime pri počítaní;keď spievame;keď mlčíme pri čítaní
    Ako získaš späť dôveru, keď si klamal?|priznám sa a budem hovoriť pravdu|budem klamať ďalej;ospravedlním sa a hneď zas zaklamem;nebudem s nikým hovoriť
    Mama sa pýta, či máš urobené úlohy, a nemáš. Čo povieš?|pravdu a hneď ich urobím|že áno;že žiadne neboli;nič
    Je v poriadku sľúbiť niečo a potom to nesplniť?|nie, sľuby máme dodržiavať|áno, vždy;áno, ak sa nám nechce;áno, ak to nikto nevie
    Kamarát odpisuje na teste a chce, aby si mlčal. Čo je správne?|neklamať a nepomáhať podvádzať|dať mu všetky odpovede;klamať učiteľke;odpísať tiež`) },
  { id: 'e4-priroda', g: 4, type: 'qa', area: 'etika', name: 'Chránime prírodu', icon: '🌳', items: lines(`
    Kam patrí plastová fľaša?|do žltého kontajnera na plasty|do lesa;do potoka;do papiera
    Kam patrí papier a noviny?|do modrého kontajnera|do skla;do lesa;do bio odpadu
    Čo ušetrí vodu?|zastaviť vodu pri čistení zubov|nechať vodu tiecť;kúpať sa trikrát denne;umývať auto každý deň
    Čo urobíme s odpadkami na výlete?|odnesieme ich so sebou|necháme ich v lese;hodíme do potoka;zakopeme ich
    Prečo zhasíname svetlo, keď odchádzame?|šetríme energiu|aby bola tma;lebo je to zábava;nie je to potrebné
    Ako pomôžeme vtáčikom v zime?|dáme im do kŕmidla semienka|chytíme ich;dáme im čokoládu;nič
    Kam patria šupky z ovocia?|do bio odpadu (hnedý kontajner)|do skla;do plastov;do papiera
    Kam patrí sklenená fľaša?|do zeleného kontajnera na sklo|do papiera;do lesa;do bio odpadu
    Čo ušetrí elektrinu?|zhasnúť svetlo, keď odchádzam|nechať svietiť všade;nechať zapnutý televízor;otvoriť chladničku dokorán
    Prečo nezbierame chránené kvety?|aby nevyhynuli|lebo smrdia;lebo sú pichľavé;lebo sú drahé
    Ako sa správame v lese?|nekričíme a nehádžeme odpadky|lámeme stromy;zakladáme oheň kdekoľvek;plašíme zvieratá
    Čo znamená recyklácia?|zo starého odpadu sa vyrobí nová vec|odpad sa zakope;odpad sa hodí do rieky;odpad sa spáli doma`) },
  { id: 'n1-stvorenie', g: 1, type: 'qa', area: 'nab', name: 'Svet okolo nás je dar', icon: '🌈', ex: 'Podľa Biblie Boh stvoril svet: svetlo, vodu, zem, rastliny, zvieratá a človeka.', items: lines(`
    Kto podľa Biblie stvoril svet?|Boh|kráľ;čarodejník;človek
    Ako sa volali prví ľudia podľa Biblie?|Adam a Eva|Peter a Pavol;Jana a Ján;Mária a Jozef
    Za čo môžeme ďakovať každý deň?|za rodinu, jedlo a priateľov|za nič;len za darčeky;len za hračky
    Čo je modlitba?|rozhovor s Bohom|hra;pieseň o zvieratách;domáca úloha
    Ako sa staráme o svet, ktorý sme dostali?|chránime prírodu a zvieratá|ničíme stromy;hádžeme odpadky;trápime zvieratá
    Čo nám hovorí prikázanie lásky?|mať rád Boha a ľudí okolo seba|mať rád len seba;nehovoriť s nikým;hnevať sa`) },
  { id: 'n2-noe', g: 2, type: 'qa', area: 'nab', name: 'Biblické príbehy', icon: '🕊️', items: lines(`
    Kto postavil veľkú loď, archu?|Noe|Mojžiš;Dávid;Jonáš
    Čo vzal Noe do archy?|zvieratá po pároch|len psov;len ryby;nič
    Čo sa objavilo na oblohe po potope?|dúha|mesiac;kométa;sneh
    Kto porazil obra Goliáša?|Dávid|Noe;Abrahám;Jozef
    Koho prehltla veľká ryba?|Jonáša|Mojžiša;Dávida;Noeho
    Kto previedol ľudí cez more?|Mojžiš|Dávid;Jonáš;Noe`) },
  { id: 'n3-jezis', g: 3, type: 'qa', area: 'nab', name: 'Ježišov život', icon: '⭐', items: lines(`
    V ktorom meste sa podľa Biblie narodil Ježiš?|v Betleheme|v Ríme;v Bratislave;v Paríži
    Ako sa volala Ježišova mama?|Mária|Eva;Sára;Anna
    Čo viedlo mudrcov k Ježišovi?|hviezda|mapa;vták;rieka
    Kde podľa príbehu ležal malý Ježiš?|v jasliach|v posteli;na tróne;v lodi
    Ako sa volali Ježišovi najbližší priatelia?|apoštoli|rytieri;vojaci;kráľovia
    Ktorý sviatok pripomína narodenie Ježiša?|Vianoce|Veľká noc;Silvester;Deň detí
    V ktorom meste sa narodil Ježiš?|v Betleheme|v Ríme;v Bratislave;v Nazarete
    Kto sa prišiel pokloniť malému Ježišovi s darmi?|traja králi (mudrci)|rytieri;rybári;vojaci
    V akom meste Ježiš vyrastal?|v Nazarete|v Betleheme;v Egypte;v Ríme
    Ako voláme dvanástich Ježišových priateľov?|apoštoli|anjeli;proroci;králi
    Ktorý sviatok slávime na pamiatku Ježišovho zmŕtvychvstania?|Veľkú noc|Vianoce;Turíce;Dušičky`) },
  { id: 'n4-svati', g: 4, type: 'qa', area: 'nab', name: 'Svätci a Slovensko', icon: '📜', ex: 'Cyril a Metod prišli na Veľkú Moravu v roku 863 a priniesli písmo hlaholiku.', items: lines(`
    Kto priniesol našim predkom písmo?|Cyril a Metod|Mikuláš a Martin;Peter a Pavol;Juraj a Jakub
    Ako sa volalo písmo, ktoré vytvoril Konštantín (Cyril)?|hlaholika|latinka;azbuka;runy
    Kedy prišli Cyril a Metod na Veľkú Moravu?|v roku 863|v roku 1993;v roku 1200;v roku 100
    Kto nosí deťom darčeky 6. decembra?|svätý Mikuláš|svätý Martin;Ježiško;Dedo Mráz
    Kto podľa legendy rozdelil plášť s chudobným?|svätý Martin|svätý Mikuláš;svätý Juraj;svätý Peter
    Kedy oslavujeme sviatok Cyrila a Metoda?|5. júla|1. januára;24. decembra;1. mája
    Ktorý svätec je patrónom Slovenska spolu s Cyrilom a Metodom?|Sedembolestná Panna Mária|svätý Mikuláš;svätý Martin;svätý Valentín
    Kedy si pripomíname sviatok Cyrila a Metoda?|5. júla|24. decembra;1. mája;6. januára
    Kto bol knieža Pribina?|vládca, za ktorého bol v Nitre posvätený kostol|kráľ z rozprávky;pápež;astronaut
    Ktorý svätý delil svoj plášť so žobrákom?|svätý Martin|svätý Juraj;svätý Peter;svätý Pavol
    Kto je patrónom detí a rozdáva darčeky 6. decembra?|svätý Mikuláš|svätý Martin;svätý Štefan;svätý Ján
    Ako sa volal žiak Cyrila a Metoda, ktorý pokračoval v ich diele?|Gorazd|Pribina;Svätopluk;Rastislav`) }
];
for (const t of U4_PRV) { PRV.push(t); const x = { ...t, s: 'prv' }; ALL_TOPICS.push(x); TOPIC[t.id] = x; }
const U5_PRV = [
  { id: 'e3-trieda', g: 3, type: 'qa', area: 'etika', name: 'Naša trieda', icon: '🏫', items: lines(`
    Čo robíme, keď chce niekto v triede hovoriť?|počúvame ho|skáčeme mu do reči;smejeme sa;odídeme
    Spolužiak niečomu nerozumie. Čo urobíš?|vysvetlím mu to|posmievam sa mu;nevšímam si ho;poviem, že je hlúpy
    Ako sa rozhodneme, keď sa nevieme dohodnúť?|vypočujeme každého a hlasujeme|vyhrá najsilnejší;nerobíme nič;hádame sa
    Čo je dobré pravidlo v triede?|nikomu neubližujeme|kto kričí, má pravdu;berieme si cudzie veci;nepočúvame
    Ako ukážeš, že si niekoho vážiš?|pozorne ho počúvam|otočím sa chrbtom;smejem sa mu;skáčem mu do reči
    Spolužiak je v triede nový. Čo urobíš?|privítam ho a ukážem mu školu|budem sa mu vyhýbať;posmievam sa mu;nevšímam si ho
    Ako sa správame, keď niekto prehrá v hre?|povzbudíme ho|vysmejeme ho;chválime sa;odídeme
    Čo je spolupráca?|keď spolu robíme na jednej úlohe|keď všetko robí jeden;keď sa hádame;keď súťažíme proti sebe
    Ako riešime hádku so spolužiakom?|pokojne sa porozprávame|bijeme sa;kričíme;urazíme sa navždy
    Komu povieš, keď niekto v triede ubližuje inému?|pani učiteľke|nikomu;len tomu, kto ubližuje;smejem sa
    Čo znamená ospravedlniť sa?|priznať chybu a povedať prepáč|robiť sa, že nič;obviniť iného;utiecť`) },
  { id: 'n1-mikulas', g: 1, type: 'qa', area: 'nab', name: 'Mikuláš a Vianoce', icon: '🎅', items: lines(`
    Kedy prichádza svätý Mikuláš?|6. decembra|24. decembra;1. januára;1. júna
    Kam nám Mikuláš dáva sladkosti?|do čižmičky|do kufra;do školskej tašky;do chladničky
    Čo je advent?|čas čakania na Vianoce|letné prázdniny;športová hra;názov mesta
    Koľko sviečok má adventný veniec?|4|2;7;10
    Kedy je Štedrý deň?|24. decembra|6. decembra;31. decembra;1. novembra`) },
  { id: 'n2-velkanoc', g: 2, type: 'qa', area: 'nab', name: 'Veľká noc', icon: '🐣', items: lines(`
    V ktorom ročnom období je Veľká noc?|na jar|v lete;na jeseň;v zime
    Čo pripomína Veľká noc kresťanom?|Ježišovo zmŕtvychvstanie|narodenie Ježiša;príchod Mikuláša;koniec roka
    Čo maľujeme na Veľkú noc?|vajíčka|tekvice;stromček;lampióny
    Aký zvyk poznáme na Veľkonočný pondelok?|oblievačku|púšťanie šarkanov;sánkovanie;ohňostroj
    Ktorý symbol patrí k Veľkej noci?|baránok|sob;snehuliak;tekvica`) }
];
for (const t of U5_PRV) { PRV.push(t); const x = { ...t, s: 'prv' }; ALL_TOPICS.push(x); TOPIC[t.id] = x; }
{ const t = { id: 'n4-podob', g: 4, type: 'qa', area: 'nab', name: 'Podobenstvá', icon: '📖', ex: 'Podobenstvo je krátky príbeh, ktorý nás učí niečo dôležité.', items: lines(`
    Čo je podobenstvo?|krátky príbeh s ponaučením|pieseň;básnička o zvieratách;modlitba
    Kto pomohol zranenému mužovi pri ceste?|milosrdný Samaritán|kňaz;vojak;kráľ
    Čo nás učí príbeh o milosrdnom Samaritánovi?|pomáhať každému, kto to potrebuje|pomáhať len kamarátom;nikomu nepomáhať;utekať
    Ako sa otec zachoval k márnotratnému synovi, keď sa vrátil?|odpustil mu a tešil sa|vyhnal ho;nevšímal si ho;hneval sa navždy
    Čo nás učí príbeh o márnotratnom synovi?|odpúšťať|nikdy neodpustiť;utiecť z domu;hádať sa
    Čo hľadal pastier, ktorý nechal 99 oviec?|jednu stratenú ovcu|zlato;nový dom;stratenú kozu
    Čo nás učí podobenstvo o stratenej ovečke?|každý je dôležitý|ovce sú hlúpe;netreba hľadať;stačí mať veľa
    Čo urobil otec, keď sa vrátil márnotratný syn?|s radosťou ho prijal|vyhnal ho;nevšímal si ho;potrestal ho
    Čo nás učí podobenstvo o márnotratnom synovi?|odpúšťať|nikdy sa nevracať;byť lakomý;hnevať sa
    Kde zasiate zrno najlepšie vyrástlo?|v dobrej zemi|na ceste;medzi tŕním;na skale
    Čo urobil múdry staviteľ?|postavil dom na skale|postavil dom na piesku;nepostavil nič;postavil dom vo vode
    Čo nás učí podobenstvo o horčičnom zrnku?|aj z malého môže vyrásť niečo veľké|malé veci sú zbytočné;zrná sa nedajú jesť;treba kupovať veľké semená`) };
  PRV.push(t); const x = { ...t, s: 'prv' }; ALL_TOPICS.push(x); TOPIC[t.id] = x; }
