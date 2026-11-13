/* ===== Všeobecný prehľad: príroda, svet, angličtina ===== */
const lines = s => () => s.trim().split('\n').map(l => l.trim().split('|'));
const MES = ['január', 'február', 'marec', 'apríl', 'máj', 'jún', 'júl', 'august', 'september', 'október', 'november', 'december'];
const DNI = ['pondelok', 'utorok', 'streda', 'štvrtok', 'piatok', 'sobota', 'nedeľa'];
const KRAJE = [['Bratislavského', 'Bratislava'], ['Trnavského', 'Trnava'], ['Trenčianskeho', 'Trenčín'], ['Nitrianskeho', 'Nitra'], ['Žilinského', 'Žilina'], ['Banskobystrického', 'Banská Bystrica'], ['Prešovského', 'Prešov'], ['Košického', 'Košice']];

const PRV = [
  /* 1. ročník */
  { id: 'p1-obdobia', g: 1, type: 'qa', name: 'Ročné obdobia', icon: '🍂', items: lines(`
    V ktorom ročnom období padá sneh a stavajú sa snehuliaci?|v zime|v lete;na jar;na jeseň
    Kedy kvitnú snežienky a vracajú sa vtáky z teplých krajín?|na jar|v lete;na jeseň;v zime
    Kedy sú letné prázdniny?|v lete|v zime;na jar;na jeseň
    Kedy padá zo stromov farebné lístie?|na jeseň|na jar;v lete;v zime
    Koľko ročných období má rok?|4|2;3;12
    Ktoré ročné obdobie nasleduje po zime?|jar|leto;jeseň;zima
    Ktoré ročné obdobie nasleduje po lete?|jeseň|jar;zima;leto
    Kedy zbierame gaštany a púšťame šarkany?|na jeseň|na jar;v lete;v zime
    V ktorom ročnom období sú Vianoce?|v zime|v lete;na jar;na jeseň
    Čo si oblečieme, keď mrzne?|teplú bundu a čiapku|plavky;tričko a šortky;sandále
    Kedy sa najviac kúpeme v jazere?|v lete|v zime;na jeseň;na jar`) },
  { id: 'p1-telo', g: 1, type: 'qa', name: 'Moje telo a zdravie', icon: '🖐️', items: lines(`
    Čím vidíme?|očami|ušami;nosom;rukami
    Čím počujeme?|ušami|očami;nosom;jazykom
    Čím cítime vôňu kvetov?|nosom|ušami;očami;lakťom
    Čím cítime, či je jedlo sladké alebo slané?|jazykom|ušami;nosom;kolenom
    Koľko prstov máme na jednej ruke?|5|4;6;10
    Koľko prstov máme na oboch rukách spolu?|10|5;8;12
    Kedy si umývame ruky?|pred jedlom a po použití WC|len v nedeľu;nikdy;len keď prší
    Ako často si čistíme zuby?|ráno a večer|raz za týždeň;len v nedeľu;nikdy
    Ktorá časť tela je medzi hlavou a trupom?|krk|koleno;lakeť;členok
    Kde máme koleno?|na nohe|na ruke;na hlave;na chrbte
    Čo je zdravé na desiatu?|jablko a chlieb|čipsy;cukríky;limonáda`) },
  { id: 'p1-mlad', g: 1, type: 'qa', name: 'Zvieratá a ich mláďatá', icon: '🐣', items: lines(`
    Ako sa volá mláďa kravy?|teľa|žriebä;jahňa;šteňa
    Ako sa volá mláďa koňa?|žriebä|teľa;kozľa;prasiatko
    Ako sa volá mláďa ovce?|jahňa|teľa;šteňa;kozľa
    Ako sa volá mláďa psa?|šteňa|mačiatko;teľa;žriebä
    Ako sa volá mláďa mačky?|mačiatko|šteňa;kuriatko;jahňa
    Ako sa volá mláďa sliepky?|kuriatko|káčatko;húsa;mačiatko
    Ako sa volá mláďa kačice?|káčatko|kuriatko;húsa;teľa
    Ako sa volá mláďa kozy?|kozľa|jahňa;teľa;žriebä
    Ako sa volá mláďa medveďa?|medvieďa|líšťa;šteňa;teľa
    Ako sa volá mláďa líšky?|líšťa|medvieďa;mačiatko;jahňa
    Ako sa volá mláďa husi?|húsa|káčatko;kuriatko;kozľa`) },
  { id: 'p1-ovocie', g: 1, type: 'cat', name: 'Ovocie alebo zelenina?', icon: '🍎', prompt: '{x} je…', choices: ['ovocie', 'zelenina'], items: '🍎 jablko|ovocie,🍐 hruška|ovocie,🍒 čerešňa|ovocie,🍓 jahoda|ovocie,🍌 banán|ovocie,🍊 pomaranč|ovocie,🍑 broskyňa|ovocie,🍇 hrozno|ovocie,🍋 citrón|ovocie,🥕 mrkva|zelenina,🥔 zemiak|zelenina,🥒 uhorka|zelenina,🥬 kapusta|zelenina,🧅 cibuľa|zelenina,🫑 paprika|zelenina,🧄 cesnak|zelenina,🌽 kukurica|zelenina', ex: 'Ovocie je väčšinou sladké a rastie na stromoch a kríkoch. Zelenina rastie najčastejšie v záhradke.' },
  { id: 'p1-cesta', g: 1, type: 'qa', name: 'Bezpečne na ceste', icon: '🚦', items: lines(`
    Na akú farbu na semafore smieme prejsť cez cestu?|zelenú|červenú;oranžovú;žltú
    Čo znamená červená farba na semafore pre chodcov?|stoj, nesmieš ísť|choď rýchlo;môžeš bežať;nič
    Kde prechádzame cez cestu, keď nie je semafor?|na priechode pre chodcov|kdekoľvek;za zákrutou;medzi autami
    Kam sa pozrieme ako prvé pred prechodom cez cestu?|vľavo|vpravo;hore;dozadu
    Čo nosíme na hlave, keď jazdíme na bicykli?|prilbu|šiltovku;slúchadlá;nič
    Čo nám pomôže, aby nás vodiči videli v tme?|reflexná vesta alebo pásik|čierna bunda;slnečné okuliare;dáždnik
    Kde sa môžeme hrať s loptou?|na ihrisku|na ceste;na parkovisku;pri železnici
    Akým číslom voláme záchranku?|155|158;150;199
    Akým číslom voláme hasičov?|150|155;158;199
    Akým číslom voláme políciu?|158|150;155;199
    Aké je jednotné číslo tiesňového volania v celej Európe?|112|155;911;100`) },
  { id: 'p1-farby', g: 1, type: 'vocab', name: 'Angličtina: farby', icon: '🎨', items: lines(`
    red|červená|🔴
    blue|modrá|🔵
    green|zelená|🟢
    yellow|žltá|🟡
    orange|oranžová|🟠
    purple|fialová|🟣
    black|čierna|⚫
    white|biela|⚪
    brown|hnedá|🟤
    pink|ružová|🌸`) },
  { id: 'p1-cisla', g: 1, type: 'vocab', name: 'Angličtina: čísla 1–10', icon: '🔢', items: lines(`
    one|jeden
    two|dva
    three|tri
    four|štyri
    five|päť
    six|šesť
    seven|sedem
    eight|osem
    nine|deväť
    ten|desať`) },

  /* 2. ročník */
  { id: 'p2-kalendar', g: 2, name: 'Dni a mesiace', icon: '📅', gen() {
    const t = R(0, 3);
    if (t === 0) { const i = R(0, 10); return { q: `Ktorý mesiac je hneď po mesiaci ${MES[i]}?`, a: MES[i + 1], w: shuffle(MES.filter(x => x !== MES[i + 1] && x !== MES[i])).slice(0, 3), ex: MES.join(', ') }; }
    if (t === 1) { const i = R(0, 5); return { q: `Ktorý deň je hneď po dni ${DNI[i]}?`, a: DNI[i + 1], w: shuffle(DNI.filter(x => x !== DNI[i + 1] && x !== DNI[i])).slice(0, 3), ex: DNI.join(', ') }; }
    if (t === 2) return { ...pick([{ q: 'Koľko mesiacov má rok?', a: 12 }, { q: 'Koľko dní má týždeň?', a: 7 }, { q: 'Koľko dní má február, keď nie je priestupný rok?', a: 28 }]) };
    return { ...pick([{ q: 'V ktorom mesiaci sú Vianoce?', a: 'december', w: ['jún', 'marec', 'september'] }, { q: 'V ktorom mesiaci začína školský rok?', a: 'september', w: ['január', 'máj', 'júl'] }, { q: 'Ktoré dni sú víkend?', a: 'sobota a nedeľa', w: ['pondelok a utorok', 'piatok a pondelok', 'streda a štvrtok'] }, { q: 'V ktorom mesiaci začína jar?', a: 'marec', w: ['jún', 'december', 'september'] }]) };
  } },
  { id: 'p2-zvierata', g: 2, type: 'cat', name: 'Domáce a voľne žijúce zvieratá', icon: '🐄', prompt: '{x} je…', choices: ['domáce zviera', 'voľne žijúce zviera'], items: '🐄 krava|domáce zviera,🐴 kôň|domáce zviera,🐑 ovca|domáce zviera,🐐 koza|domáce zviera,🐔 sliepka|domáce zviera,🐷 prasa|domáce zviera,🐶 pes|domáce zviera,🐱 mačka|domáce zviera,🪿 hus|domáce zviera,🐺 vlk|voľne žijúce zviera,🦊 líška|voľne žijúce zviera,🐻 medveď|voľne žijúce zviera,🦌 jeleň|voľne žijúce zviera,🐗 diviak|voľne žijúce zviera,🦔 jež|voľne žijúce zviera,🐿️ veverička|voľne žijúce zviera,🦉 sova|voľne žijúce zviera', ex: 'Domáce zvieratá chová človek. Voľne žijúce žijú v prírode samé.' },
  { id: 'p2-rastliny', g: 2, type: 'qa', name: 'Rastliny', icon: '🌱', items: lines(`
    Ktorá časť rastliny saje vodu zo zeme?|koreň|list;kvet;plod
    Ktorá časť rastliny nesie listy a kvety?|stonka|koreň;semeno;plod
    Z ktorej časti rastliny vznikne plod?|z kvetu|z koreňa;zo stonky;z listu
    Čo potrebuje rastlina, aby rástla?|vodu, svetlo a vzduch|len tmu;len cukor;nič
    Čo je ukryté v plode?|semená|korene;kamene;listy
    Ktorý strom má ihličie?|smrek|dub;breza;lipa
    Ktorý strom má listy a na jeseň ich zhadzuje?|dub|smrek;borovica;jedľa
    Na ktorom strome rastú žalude?|na dube|na smreku;na breze;na jabloni
    Ktorý kvet kvitne medzi prvými na jar?|snežienka|slnečnica;ruža;mak
    Lieska je…|ker|strom;bylina;huba`) },
  { id: 'p2-povolania', g: 2, type: 'qa', name: 'Povolania', icon: '👩‍🚒', items: lines(`
    Kto lieči chorých ľudí?|lekár|pekár;murár;kaderník
    Kto pečie chlieb a rožky?|pekár|lekár;pilot;záhradník
    Kto hasí požiare?|hasič|kuchár;učiteľ;čašník
    Kto lieči choré zvieratá?|veterinár|zubár;predavač;šofér
    Kto stavia domy?|murár|pilot;kaderník;knihovník
    Kto strihá vlasy?|kaderník|krajčír;murár;poštár
    Kto riadi lietadlo?|pilot|kapitán lode;rušňovodič;taxikár
    Kto nosí listy a balíky?|poštár|pekár;hasič;lekár
    Kto šije oblečenie?|krajčír|kováč;stolár;pilot
    Kto vyrába nábytok z dreva?|stolár|krajčír;kaderník;lekár
    Kto nám pomôže, keď nás bolí zub?|zubár|kuchár;hasič;poštár`) },
  { id: 'p2-voda', g: 2, type: 'qa', name: 'Voda a počasie', icon: '🌦️', items: lines(`
    Čo vznikne, keď voda zamrzne?|ľad|para;rosa;hmla
    Čo vznikne, keď vodu zohrejeme až do varu?|para|ľad;sneh;kameň
    Čo sa stane s ľadom na teplom mieste?|roztopí sa|zväčší sa;zmení sa na kameň;nič
    Čo padá z oblakov v zime?|sneh|lístie;piesok;kamienky
    Čo vidíme na oblohe, keď po daždi zasvieti slnko?|dúhu|hviezdy;mesiac;hmlu
    Čím meriame teplotu vzduchu?|teplomerom|pravítkom;váhou;hodinami
    Kde je voda slaná?|v mori|v potoku;v studni;v daždi
    Čo nám ukazuje, odkiaľ fúka vietor?|veterník (vlajka)|teplomer;hodiny;dáždnik`) },
  { id: 'p2-zvieratka', g: 2, type: 'vocab', name: 'Angličtina: zvieratá', icon: '🐶', items: lines(`
    dog|pes|🐶
    cat|mačka|🐱
    cow|krava|🐄
    horse|kôň|🐴
    pig|prasa|🐷
    sheep|ovca|🐑
    duck|kačica|🦆
    bird|vták|🐦
    fish|ryba|🐟
    mouse|myš|🐭
    rabbit|zajac|🐰
    lion|lev|🦁
    elephant|slon|🐘
    monkey|opica|🐵
    bear|medveď|🐻`) },
  { id: 'p2-jedlo', g: 2, type: 'vocab', name: 'Angličtina: jedlo', icon: '🍎', items: lines(`
    apple|jablko|🍎
    banana|banán|🍌
    bread|chlieb|🍞
    milk|mlieko|🥛
    egg|vajce|🥚
    cheese|syr|🧀
    water|voda|💧
    cake|koláč|🍰
    ice cream|zmrzlina|🍦
    carrot|mrkva|🥕
    soup|polievka|🍲
    juice|džús|🧃`) },
  { id: 'p2-rodina', g: 2, type: 'vocab', name: 'Angličtina: rodina', icon: '👪', items: lines(`
    mother|mama|👩
    father|otec|👨
    sister|sestra|👧
    brother|brat|👦
    grandmother|babka|👵
    grandfather|dedko|👴
    baby|bábätko|👶
    family|rodina|👪
    friend|kamarát|🤝`) },

  /* 3. ročník */
  { id: 'p3-zivocichy', g: 3, type: 'cat', name: 'Skupiny živočíchov', icon: '🦎', prompt: '{x} patrí medzi…', choices: ['cicavce', 'vtáky', 'ryby', 'plazy', 'obojživelníky', 'hmyz'], items: '🐶 pes|cicavce,🐬 delfín|cicavce,🦇 netopier|cicavce,🐋 veľryba|cicavce,🦔 jež|cicavce,🐦 vrabec|vtáky,🦉 sova|vtáky,🐧 tučniak|vtáky,🦩 plameniak|vtáky,🐟 kapor|ryby,🦈 žralok|ryby,🐠 pstruh|ryby,🦎 jašterica|plazy,🐍 užovka|plazy,🐢 korytnačka|plazy,🐊 krokodíl|plazy,🐸 žaba|obojživelníky,🦎 mlok|obojživelníky,🐝 včela|hmyz,🦋 motýľ|hmyz,🐜 mravec|hmyz,🐞 lienka|hmyz', ex: 'Cicavce kŕmia mláďatá mliekom. Vtáky majú perie. Ryby dýchajú žiabrami. Plazy majú šupiny. Obojživelníky žijú na suchu aj vo vode. Hmyz má 6 nôh.' },
  { id: 'p3-les', g: 3, type: 'qa', name: 'Les a jeho obyvatelia', icon: '🌲', items: lines(`
    Ktorý strom je ihličnatý?|smrek|dub;buk;breza
    Ktorý ihličnatý strom zhadzuje ihličie na zimu?|smrekovec|smrek;jedľa;borovica
    Ktorá huba je smrteľne jedovatá?|muchotrávka zelená|hríb dubový;kuriatko;bedľa vysoká
    Ktorý vták vyďobáva zo stromov škodcov?|ďateľ|vrabec;holub;sýkorka
    Čo robí medveď v zime?|spí zimným spánkom|odletí do teplých krajín;stavia hniezdo;behá po lese
    Ktorý živočích sa na zimu ukladá na zimný spánok?|jež|líška;zajac;jeleň
    Ktorý vták odlieta na zimu do teplých krajín?|lastovička|vrabec;sýkorka;straka
    Ako sa volá les, v ktorom rastú listnaté aj ihličnaté stromy?|zmiešaný les|ihličnatý les;prales;park
    Kto sa stará o les?|lesník|rybár;baník;pilot
    Čo v lese nesmieme robiť?|zakladať oheň a odhadzovať odpadky|pozorovať zvieratá;chodiť po chodníku;počúvať vtáky
    Ktorý strom je listnatý?|buk|smrek;borovica;jedľa
    Ktoré zviera v lese spí celú zimu?|jazvec|srna;líška;diviak
    Ako voláme mladú srnu?|srnča|teľa;žriebä;šteňa
    Ktorý vták búcha zobákom do stromov?|ďateľ|sova;vrabec;bocian
    Prečo je les dôležitý?|vyrába kyslík a je domovom zvierat|robí hluk;je len na drevo;nie je dôležitý
    Ako voláme les, kde rastú ihličnaté aj listnaté stromy?|zmiešaný les|ihličnatý les;dažďový prales;park`) },
  { id: 'p3-voda', g: 3, type: 'qa', name: 'Voda a jej skupenstvá', icon: '💧', items: lines(`
    V akom skupenstve je ľad?|v pevnom|v kvapalnom;v plynnom;v žiadnom
    V akom skupenstve je voda v pohári?|v kvapalnom|v pevnom;v plynnom;v kamennom
    V akom skupenstve je vodná para?|v plynnom|v pevnom;v kvapalnom;v ľadovom
    Pri akej teplote voda vrie?|100 °C|0 °C;50 °C;10 °C
    Pri akej teplote voda zamŕza?|0 °C|100 °C;20 °C;50 °C
    Ako sa volá zmena vody na paru?|vyparovanie|topenie;tuhnutie;mrznutie
    Ako sa volá zmena ľadu na vodu?|topenie|vyparovanie;varenie;tuhnutie
    Kde je na Zemi najviac vody?|v moriach a oceánoch|v riekach;v jazerách;v oblakoch
    Akú vodu môžeme piť?|pitnú vodu z vodovodu|morskú vodu;vodu z mláky;vodu z rieky
    Ako sa volá zmena vody na ľad?|tuhnutie (mrznutie)|topenie;vyparovanie;var
    Čo vzniká, keď sa vodná para ochladí na studenom skle?|kvapky vody|ľad hneď;piesok;dym
    Prečo sa mláky po daždi stratia?|voda sa vyparí|voda zmrzne;voda zhorí;vypijú ju vtáky
    Ako voláme kolobeh vody v prírode?|obeh vody|reťazec vody;kruh ohňa;ročné obdobie`) },
  { id: 'p3-materialy', g: 3, type: 'qa', name: 'Materiály a triedenie odpadu', icon: '♻️', items: lines(`
    Čo priťahuje magnet?|železný klinec|drevená ceruzka;plastová lyžica;sklený pohár
    Z čoho sa vyrába papier?|z dreva|zo skla;z kameňa;z plastu
    Z čoho sa vyrába sklo?|z piesku|z dreva;z vlny;z mlieka
    Ktorý materiál je priehľadný?|sklo|drevo;železo;kameň
    Ktorý materiál pláva na vode?|drevo|železo;kameň;sklo
    Do akého kontajnera patrí plastová fľaša?|do žltého|do modrého;do zeleného;do hnedého
    Do akého kontajnera patria staré noviny?|do modrého|do žltého;do zeleného;do hnedého
    Do akého kontajnera patria sklenené poháre?|do zeleného|do modrého;do žltého;do hnedého
    Ktorý materiál je prírodný?|vlna|plast;polystyrén;nylon
    Prečo triedime odpad?|aby sme chránili prírodu|aby bolo viac odpadu;pre zábavu;netreba ho triediť`) },
  { id: 'p3-mapa', g: 3, type: 'qa', name: 'Svetové strany a mapa', icon: '🧭', items: lines(`
    Na ktorej svetovej strane vychádza Slnko?|na východe|na západe;na severe;na juhu
    Na ktorej svetovej strane zapadá Slnko?|na západe|na východe;na severe;na juhu
    Ktorá svetová strana je na mape hore?|sever|juh;východ;západ
    Ktorá svetová strana je na mape dole?|juh|sever;východ;západ
    Ktorá svetová strana je na mape vpravo?|východ|západ;sever;juh
    Čo ukazuje smer na sever?|kompas|teplomer;váha;ďalekohľad
    Ako sa volá zmenšený model Zeme v tvare gule?|glóbus|mapa;atlas;kompas
    Ako sa volá kniha máp?|atlas|glóbus;slovník;kalendár
    Akou farbou sa na mape kreslia rieky a jazerá?|modrou|zelenou;hnedou;červenou
    Akou farbou sa na mape kreslia nížiny?|zelenou|hnedou;modrou;bielou
    Akou farbou sa na mape kreslia vysoké hory?|hnedou|zelenou;modrou;žltou`) },
  { id: 'p3-obec', g: 3, type: 'qa', name: 'Moja obec a Slovensko', icon: '🏘️', items: lines(`
    Kto stojí na čele obce?|starosta|primátor;prezident;riaditeľ
    Kto stojí na čele mesta?|primátor|starosta;kráľ;učiteľ
    Kde si môžeme požičať knihy?|v knižnici|v lekárni;v pekárni;v banke
    Kde si kúpime lieky?|v lekárni|v knižnici;v pekárni;na pošte
    Kde si pozrieme staré veci z histórie?|v múzeu|v obchode;na štadióne;v kine
    Aké je hlavné mesto Slovenska?|Bratislava|Košice;Žilina;Nitra
    Ktoré je druhé najväčšie mesto Slovenska?|Košice|Prešov;Trnava;Martin
    Aké farby má slovenská vlajka?|biela, modrá, červená|červená, zelená, biela;žltá, modrá;čierna, žltá, červená
    Ako sa volá slovenská hymna?|Nad Tatrou sa blýska|Tancuj, tancuj;Kto za pravdu horí;Hej, Slováci
    Ako sa volá hlavné mesto Slovenska?|Bratislava|Košice;Žilina;Nitra
    Kde nám pomôžu, keď sme chorí?|u lekára|v knižnici;na pošte;v kine
    Kam pošleme list alebo balík?|na poštu|do lekárne;do školy;do obchodu s obuvou
    Ktoré číslo voláme v núdzi (jednotné európske)?|112|111;123;999
    Kto hasí požiare?|hasiči|policajti;lekári;poštári
    Ako sa volá najväčší vrch Slovenska?|Gerlachovský štít|Kriváň;Lomnický štít;Chopok
    Ktorá rieka preteká Bratislavou?|Dunaj|Váh;Hron;Morava`) },
  { id: 'p3-skola', g: 3, type: 'vocab', name: 'Angličtina: v škole', icon: '🎒', items: lines(`
    pen|pero|🖊️
    pencil|ceruzka|✏️
    book|kniha|📕
    school bag|školská taška|🎒
    ruler|pravítko|📏
    scissors|nožnice|✂️
    chair|stolička|🪑
    teacher|učiteľ|🧑‍🏫
    crayon|pastelka|🖍️
    school|škola|🏫`) },
  { id: 'p3-telo', g: 3, type: 'vocab', name: 'Angličtina: telo', icon: '👂', items: lines(`
    head|hlava|🙂
    eye|oko|👁️
    ear|ucho|👂
    nose|nos|👃
    mouth|ústa|👄
    hand|ruka|✋
    leg|noha|🦵
    foot|chodidlo|🦶
    tooth|zub|🦷
    hair|vlasy|💇`) },
  { id: 'p3-dni', g: 3, type: 'vocab', name: 'Angličtina: dni v týždni', icon: '📆', items: lines(`
    Monday|pondelok
    Tuesday|utorok
    Wednesday|streda
    Thursday|štvrtok
    Friday|piatok
    Saturday|sobota
    Sunday|nedeľa`) },

  /* 4. ročník */
  { id: 'p4-vesmir', g: 4, type: 'qa', name: 'Vesmír', icon: '🪐', items: lines(`
    Čo je Slnko?|hviezda|planéta;mesiac;kométa
    Koľko planét má slnečná sústava?|8|9;7;12
    Ktorá planéta je najbližšie k Slnku?|Merkúr|Zem;Mars;Neptún
    Ktorá planéta je najväčšia?|Jupiter|Zem;Mars;Venuša
    Ktorej planéte hovoríme Červená planéta?|Mars|Jupiter;Venuša;Saturn
    Ktorá planéta má najznámejšie prstence?|Saturn|Merkúr;Zem;Mars
    Za aký čas obehne Zem okolo Slnka?|za 1 rok|za 1 deň;za 1 týždeň;za 1 mesiac
    Za aký čas sa Zem otočí okolo svojej osi?|za 24 hodín|za 1 rok;za 1 hodinu;za 1 týždeň
    Čo je Mesiac?|prirodzená družica Zeme|hviezda;planéta;malé Slnko
    Prečo sa strieda deň a noc?|lebo sa Zem otáča okolo svojej osi|lebo Slnko zhasína;lebo Mesiac zakrýva Slnko;lebo prší
    Kto bol prvý človek na Mesiaci?|Neil Armstrong|Jurij Gagarin;Ivan Bella;Isaac Newton
    Kto bol prvý Slovák vo vesmíre?|Ivan Bella|Milan Rastislav Štefánik;Neil Armstrong;Jozef Murgaš`) },
  { id: 'p4-telo', g: 4, type: 'qa', name: 'Ľudské telo', icon: '❤️', items: lines(`
    Ktorý orgán pumpuje krv do celého tela?|srdce|pľúca;žalúdok;mozog
    Ktorým orgánom dýchame?|pľúcami|srdcom;žalúdkom;obličkami
    Ktorý orgán riadi celé telo?|mozog|srdce;pečeň;žalúdok
    Čo tvorí oporu tela?|kostra|koža;krv;vlasy
    Ktorý orgán je na tele najväčší?|koža|srdce;pečeň;pľúca
    Koľko zubov má dospelý človek?|32|20;28;40
    Koľko mliečnych zubov má dieťa?|20|32;10;26
    Kde sa trávi potrava?|v žalúdku a črevách|v pľúcach;v srdci;v mozgu
    Čo chráni mozog?|lebka|rebrá;chrbtica;koleno
    Čo chráni srdce a pľúca?|rebrá|lebka;panva;stehenná kosť
    Ktorý zmysel nám dáva koža?|hmat|zrak;sluch;čuch`) },
  { id: 'p4-priroda', g: 4, type: 'qa', name: 'Potravové reťazce', icon: '🦊', items: lines(`
    Čo je na začiatku potravového reťazca?|zelená rastlina|vlk;orol;človek
    Ktorý živočích je bylinožravec?|zajac|vlk;líška;sova
    Ktorý živočích je mäsožravec?|vlk|krava;zajac;srna
    Ktorý živočích je všežravec?|diviak|krava;srna;zajac
    Čím sa živí sova?|myšami a hrabošmi|trávou;ovocím;semenami
    Ktorý živočích stavia na rieke hrádze?|bobor|krt;jež;veverička
    Kde žije pstruh?|v čistých horských potokoch|v púšti;v mori;v lese
    Kto rozkladá opadané lístie na pôdu?|dážďovky a huby|vtáky;ryby;srny
    Prečo sú včely dôležité?|opeľujú rastliny|dávajú mlieko;chránia les pred ohňom;čistia vodu
    Kto je všežravec?|medveď|krava;zajac;srna
    Doplň reťazec: tráva → zajac → ?|líška|kapusta;slimák;veverička
    Doplň reťazec: list → húsenica → ?|sýkorka|vlk;srna;ryba
    Prečo sú dôležité huby a dážďovky?|rozkladajú odumreté zvyšky|robia hluk;jedia vlkov;svietia v noci
    Čo by sa stalo, keby zmizli všetky rastliny?|živočíchy by nemali potravu|nič by sa nestalo;vlky by narástli;bolo by viac jedla
    Ako voláme živočícha, ktorý loví iné živočíchy?|dravec (predátor)|bylinožravec;rozkladač;výrobca
    Ktorý živočích zjedá rastliny v rybníku?|slimák|štuka;volavka;vydra`) },
  { id: 'p4-slovensko', g: 4, type: 'qa', name: 'Príroda Slovenska', icon: '🏔️', items: lines(`
    Ktorý je najvyšší vrch Slovenska?|Gerlachovský štít|Kriváň;Lomnický štít;Rysy
    Aký vysoký je Gerlachovský štít?|asi 2 655 m|asi 1 000 m;asi 5 000 m;asi 850 m
    Ktorá rieka je najdlhšia na Slovensku?|Váh|Hron;Nitra;Ipeľ
    Ktorá veľká rieka tečie cez Bratislavu?|Dunaj|Váh;Hron;Hornád
    V ktorom pohorí leží Štrbské pleso?|vo Vysokých Tatrách|v Pieninách;v Malých Karpatoch;v Malej Fatre
    Ktorá nížina je na Slovensku najväčšia?|Podunajská nížina|Záhorská nížina;Východoslovenská nížina;Turčianska kotlina
    Ktorý vrch vo Vysokých Tatrách je symbolom Slovákov?|Kriváň|Sitno;Ďumbier;Chopok
    Kde sa po rieke Dunajec splavuje na pltiach?|v Pieninách|v Tatrách;na Záhorí;v Slovenskom raji
    Ako sa volá známa ľadová jaskyňa na Slovensku?|Dobšinská ľadová jaskyňa|Domica;Jasovská jaskyňa;Ochtinská aragonitová jaskyňa
    Ktorý národný park je známy roklinami s rebríkmi?|Slovenský raj|Pieniny;Poloniny;Muránska planina`) },
  { id: 'p4-kraje', g: 4, name: 'Kraje a krajské mestá', icon: '🗺️', gen() {
    if (Math.random() < .15) return { q: 'Koľko krajov má Slovensko?', a: 8 };
    const [k, m] = pick(KRAJE); return { q: `Ktoré mesto je sídlom ${k} kraja?`, a: m, w: shuffle(KRAJE.filter(x => x[1] !== m)).slice(0, 3).map(x => x[1]), ex: `${cap(m)} je krajské mesto.` };
  }, pex: () => shuffle(KRAJE).slice(0, 6).map(([k, m]) => [k.replace(/ého$/, 'ý').replace(/eho$/, 'y') + ' kraj', m]) },
  { id: 'p4-susedia', g: 4, type: 'qa', name: 'Susedia Slovenska', icon: '🧭', items: lines(`
    S koľkými štátmi susedí Slovensko?|s piatimi|s troma;so štyrmi;so siedmimi
    Ktorý štát susedí so Slovenskom na severe?|Poľsko|Maďarsko;Rakúsko;Nemecko
    Ktorý štát susedí so Slovenskom na juhu?|Maďarsko|Poľsko;Česko;Ukrajina
    Ktorý štát susedí so Slovenskom na východe?|Ukrajina|Česko;Rakúsko;Poľsko
    Ktorý štát susedí so Slovenskom na západe?|Česko|Ukrajina;Poľsko;Maďarsko
    Ktorý štát susedí so Slovenskom na juhozápade?|Rakúsko|Ukrajina;Poľsko;Rumunsko
    Aké je hlavné mesto Česka?|Praha|Brno;Viedeň;Varšava
    Aké je hlavné mesto Poľska?|Varšava|Krakov;Praha;Budapešť
    Aké je hlavné mesto Maďarska?|Budapešť|Viedeň;Debrecín;Praha
    Aké je hlavné mesto Rakúska?|Viedeň|Salzburg;Budapešť;Mníchov
    Aké je hlavné mesto Ukrajiny?|Kyjev|Ľvov;Užhorod;Varšava`) },
  { id: 'p4-historia', g: 4, type: 'qa', name: 'História a symboly', icon: '🏰', items: lines(`
    Ako sa volala ríša našich predkov v 9. storočí?|Veľká Morava|Rímska ríša;Uhorsko;Rakúsko
    Kto bol najslávnejší panovník Veľkej Moravy?|Svätopluk|Mária Terézia;Karol IV.;Matej Korvín
    Ktorí vierozvestovia prišli na Veľkú Moravu v roku 863?|Konštantín (Cyril) a Metod|Štúr a Hurban;Bernolák a Hollý;Juraj a Martin
    Ako sa volalo písmo, ktoré vytvoril Konštantín?|hlaholika|latinka;azbuka;runy
    Kto uzákonil spisovnú slovenčinu v roku 1843?|Ľudovít Štúr|Juraj Jánošík;Svätopluk;Milan Rastislav Štefánik
    Ktorá panovníčka zaviedla povinnú školskú dochádzku?|Mária Terézia|Alžbeta (Sisi);Kleopatra;Mária Antoinetta
    Ktorý Slovák bol astronóm, generál a letec?|Milan Rastislav Štefánik|Ján Kollár;Ľudovít Štúr;Pavol Országh Hviezdoslav
    Kedy vznikla samostatná Slovenská republika?|1. januára 1993|1. mája 2004;28. októbra 1918;5. júla 863
    V ktorom roku vstúpilo Slovensko do Európskej únie?|2004|1993;2009;1989
    Od ktorého roku platíme na Slovensku eurom?|2009|2004;1993;2000
    Čo je na štátnom znaku Slovenska?|biely dvojkríž na modrom trojvrší|zlatý lev;čierny orol;biely kôň`) },
  { id: 'p4-cisla', g: 4, type: 'vocab', name: 'Angličtina: čísla do 100', icon: '💯', items: lines(`
    eleven|jedenásť
    twelve|dvanásť
    thirteen|trinásť
    fifteen|pätnásť
    eighteen|osemnásť
    twenty|dvadsať
    thirty|tridsať
    forty|štyridsať
    fifty|päťdesiat
    one hundred|sto`) },
  { id: 'p4-pocasie', g: 4, type: 'vocab', name: 'Angličtina: počasie a obdobia', icon: '☀️', items: lines(`
    sun|slnko|☀️
    rain|dážď|🌧️
    snow|sneh|❄️
    wind|vietor|🌬️
    cloud|oblak|☁️
    rainbow|dúha|🌈
    spring|jar|🌱
    summer|leto|🏖️
    autumn|jeseň|🍂
    winter|zima|⛄`) },
  { id: 'p4-slovesa', g: 4, type: 'vocab', name: 'Angličtina: čo robíme', icon: '🏃', items: lines(`
    run|behať|🏃
    jump|skákať|🤸
    swim|plávať|🏊
    read|čítať|📖
    write|písať|✍️
    sing|spievať|🎤
    dance|tancovať|💃
    sleep|spať|😴
    eat|jesť|🍽️
    drink|piť|🥤
    play|hrať sa|⚽
    draw|kresliť|🎨`) },
  { id: 'p4-frazy', g: 4, type: 'vocab', name: 'Angličtina: frázy', icon: '💬', items: lines(`
    Hello!|Ahoj!|👋
    Good morning!|Dobré ráno!|🌅
    How are you?|Ako sa máš?|🙂
    I'm fine, thank you.|Mám sa dobre, ďakujem.
    What's your name?|Ako sa voláš?
    My name is Tom.|Volám sa Tom.
    How old are you?|Koľko máš rokov?
    Thank you!|Ďakujem!|🙏
    Please.|Prosím.
    Goodbye!|Dovidenia!|👋`) }
];

SUBJECTS.prv = { name: 'Prehľad', short: 'Prehľad', icon: '🌍', topics: PRV };
for (const t of PRV) { const x = { ...t, s: 'prv' }; ALL_TOPICS.push(x); TOPIC[t.id] = x; }
