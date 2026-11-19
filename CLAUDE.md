# Bystrík – poznámky pre Claude

Hravá učebná appka pre 1.–4. ročník ZŠ (SK). Používateľ píše po slovensky, chce KRÁTKE odpovede a priame kroky.
Web: https://sebastiankoncek88-alt.github.io/bystrik/ · Artefakt: https://claude.ai/artifact/7VQhwvFHjH2AopYAwfzzG3

## Štruktúra
- `src/` – zdroj, všetko sa spája do jedného HTML:
  - `head.html` CSS · `app/NN-*.js` logika rozdelená podľa sekcií, build ich spája v poradí čísel (VIEWS.x / AFTER.x, akcie v ACT cez `data-a` v `14-akcie.js`, `go(view,params,dir)`, `render()` v `07-router.js`)
  - `content.js`, `ucivo1-3.js`, `extra*.js`, `prehlad.js` – učivo (témy `{id,g,type:'qa',items:lines(\`otázka|správna|zlá;zlá;zlá\`)}`)
  - `avatar.js` SVG postavička (`opts.back` = zadná strana; exkluzívne veci `chest:1, base, col, aura`; `rarity()`/`RARE`), interiéry `INTS` · `emoji.js` mapa na 3D emoji (`emoji/*.webp` v koreni repa) · `citanka.js`
- `build.sh` → `bystrik.html` (artefakt) · `build_web.sh` → `web/` (GitHub Pages, PWA, `sw.js` cache `bystrik-vN` – pri väčšej zmene zvýšiť)
- `supabase/*.sql` – SQL, ktoré používateľ spúšťa ručne v Supabase SQL Editore

## Súkromie (požiadavka používateľa)
- Do commitov NEPÍSAŤ zmienky o Claude/AI ani odkazy na reláciu; neutrálne správy. Nikde nezverejňovať, ako appka vznikla.
- Web je zminifikovaný (`tools/minify.js` v `build_web.sh`, závislosti `tools/package.json`).

## Nasadenie
1. `./build_web.sh && ./build.sh && node tests/smoke.js` (test musí vypísať OK)
2. skopírovať `web/*`, `src/`, build skripty do repa, commit, `git push origin main` aj `main:gh-pages`
3. publikovať `bystrik.html` do artefaktu (rovnaká URL)
Nové emoji v kóde → doplniť mapu: PNG z `raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/<Name>/3D/<name>_3d.png` → webp 128×128 do `emoji/`, kľúč do `EMO_MAP`.
Testovacie snímky ukladať do scratchpadu (absolútna cesta), nikdy nie do repa. `bystrik.html`, `web/`, `shots/` sú v `.git/info/exclude`.
Artefakt má capabilities: sample (images), db, user, downloads – pri publikovaní ich nemeniť (vynechať `capabilities`).

## Backend
- Supabase (URL + publishable key v `app.js` sú OK verejne). Tabuľky: saves, scores, players, friends, messages, classes, class_members; RPC `delete_me`.
- AI (Gemini/Claude) – kľúč len v zariadení (`bystrik.apikey`), limit tokenov `aiGuard`. NIKDY kľúče do kódu, nikdy nežiadať tajomstvá do chatu.

## Hlavné časti appky
Hlavička `topbar` = avatar + „Ahoj, meno“ + čipy séria/slniečka (`.pill2`, `.coinchip`); koliesko nastavení je v Ja (`.jagear`). Menu (3 záložky, `nav3`, čiarové ikony `NAVIC`, aktívna = oranžová pilulka): Dnes (`heroScene` scéna s postavičkou a Bystríkom, „Dnešný batôžtek“ `homeBag` = 3 veci, jedno hlavné tlačidlo, čipy, kútik, rozbaľovacie „Dnešná cesta a úlohy“ `.hmore`), Učenie (prepínač `segTabs` Predmety | Hry; Hry = view `games`), Ja (fialová hlavička `.jahero` s veľkou postavičkou, tlačidlá Priatelia/Šatník (Izba – pozadie – odstránená z Ja aj Nastavení), level; séria, polica, pokrok %, priatelia, rebríček, trieda). Šatník + Obchod sa otvárajú z Ja (nav ich zvýrazní ako Ja). Postavička v štýle návrhu (Kid): bez obrysu, mäkké prechody (KH vlasy, KG lesk, KS/KL tieň trička, SK pleť), okrúhle ruky, ružové líčka, úsmev čiarou; oblečenie zo šatníka ostáva. Šiltovka má štítok vpredu.
Rodič (PIN): Prehľad, Zadať úlohu (+téma zo školy), Čítanka, Nastavenia (pravidlá, správy dieťaťa + história, režim učiteľa, GDPR/zmazanie účtu).
Písanie priateľom je predvolene vypnuté (`DATA.settings.msgOk`). Úsporný režim `settings.lite` (trieda `html.lite`, bez obrysu postavičky a ťažkých animácií).
- Rebríček: predvolene zapnutý, rodič ho môže vypnúť (`settings.lb`; pri vypnutí sa riadky dieťaťa zmažú). Používateľ nechce, aby rodič musel všetko povoľovať – nové veci dávať predvolene zapnuté s možnosťou vypnúť. Denné kolo (`p.dy`, riadky `pid#d` s week=dátum), záložky Dnes/Týždeň/Séria, stupne víťazov `podium()`, 23 miest; kto 5 dní (`LB_IDLE`) neaktívny, nezobrazí sa; denné odmeny `LB_PRIZE` (`lbAwards`).
- Bystríkov kútik (`bearCorner`): hlad/energia/radosť, priateľstvo `b.love`, pohladkať/tanec; spánok = západ slnka → noc a celá appka v nočnom režime (`nightOn()`, `applyTheme(true)` cez View Transition); večer/ročné obdobia v okne.
- Obchod: nakupovať až po dnešnom učení (`learnedToday`). Truhla odmien a kľúče sú ZRUŠENÉ (používateľ nechce lotériu pre deti): namiesto kľúčov slniečka (odmena za tému 30, test 20, denná odmena 3. deň 20); bývalé truhlicové veci sú v obchode za 900 (`it.legend`). Funkcie `mysteryRoll/openMystery/spinReel` ostali v kóde nepoužité. Po kúpe/obliekaní `celebrateWear` (3D otočenie so zadnou stranou).
- Efekty: `fxComet` (5/10 v rade), `openChest` (truhlica za úlohy), `fireworks()` raz za deň po celej Dnešnej ceste (`pathFireworks`, `p.fwDay`), hviezdy pri leveli; tutoriál `TOUR` má ťukacie kroky (`tap:1`), sprievodca zapnutím chatu `CHG`.

- Upozornenia pre dieťa: `hint(msg)` = toast s Bystríkom + čítanie nahlas (`say`) – prváci nevedia čítať; obyčajný `toast` len pre rodiča/potvrdenia.
- Zvuk: `audioUnlock` pri ťuknutí + `navigator.audioSession.type='playback'` (iPhone tichý režim). Deň/noc: `applyTheme(slow)` nastaví stav hneď, prechod = vrstva `#thfade` (žiadny View Transition – v Safari zlyhával); animácie kútika stoja mimo obrazovky (`bearObs`, `.offs`).
- Pridať na plochu: `a2Guide()` (sheet podľa `a2Plat()`), rodič → Nastavenia → „Apka na ploche“ `pinstCard()` s obrázkovým návodom (`a2Mock`). Ikony `icon-*.png` = smejúci sa Bystrík na krémovom pozadí, názov „Bystrík“.
- Denný cyklus učiva: `dayItems(t)` = každý deň iných ~60 % otázok témy (seed dátum+id, `dayShuffle`); `dayTopics(p)` = 3 Témy dňa (mat/sjl/prv), karta na Učení, v predmete navrchu s odznakom, ×2 body (`isDayTopic`).
- Slniečka: 1 za 10 bodov (zvyšok `p.cf`), počas `p.boost` ×2. Prvé zvládnutie témy na plný počet (`ts.mastered`) → `topicReward`: 40 % oblečenie (≤200, nevlastnené), 40 % 30 slniečok, inak ×2 slniečka na 10 min; okno `showTopicReward` čaká, kým sa uvoľnia iné okná.
- Denná odmena `DR` (7 dní v rade): 15 slniečok, 30 bodov, 20 slniečok, 25 slniečok, ×2 na 15 min, 40 slniečok + 50 bodov, oblečenie (≤250); `drGrant`, okno cez `showTopicReward` s `rw.title`.
- Bystrík reakcie (`src/app/07b-buddy.js`): ŽIADNY plávajúci medvedík (používateľ nechce). V kvíze animuje existujúceho medvedíka dole (`.peekbear`, `buddyMood(m, text)` → `peekSay`): po odpovediach `buddyAnswer` (zlá = smutný/plače, 3 správne = oslava). Zábavné fakty `BUDDY_FACTS` cez `hint(msg, silent)` v hornom pruhu (raz za ~3 min mimo kvízu/hier/rodiča, po výsledku). Nálady: wink, wave, smile, laugh, happy, cheer, sad, cry, love, think, surprise, shy, nod, yawn, spin, dance, hop, wiggle, peek (doplnky `buddyDecorate`).
- Bystrík vzhľad: 3D tieňovanie (defs `bfur`, `b3shade`, `b3gloss`, `b3rim` v head.html, prekrytia v `bearSvg`), väčšie očká (cx 41/79, cy 52), bucľatejšie telo; obrys jemný cez CSS `.bear [stroke="#5E3A18"]`.
- Angličtina: 31 tém (`-en-` v `prehlad.js`, vocab s emoji).
- Chat priateľov: hotové vety a smajlíky vždy, vlastný text až po `settings.msgOk` (rodič).

- Bystrík Plus (`src/app/14b-plus.js`): `PLUS_CFG` = Stripe Payment Links (prázdne → „čoskoro“), `isPlus()`, `plusLoad()` číta tabuľku `plus` (SQL `supabase/2026-11-plus.sql`), zapisuje ju len Edge Function `supabase/functions/stripe-webhook` (Stripe posiela `client_reference_id` = AUTH.uid). Ceny 3,99 €/mes, 29,99 €/rok, 7 dní zadarmo, trieda 49 €/rok. Ponuka len v rodičovskom účte (Nastavenia → Bystrík Plus), dieťaťu nikdy. Hotové výhody: pracovné listy na tlač (`wsPrint`, Prehľad), až 5 detí (zadarmo 2). Čoskoro: AI bez kľúča, týždenný e-mail, čítanka s hodnotením, mesačná kolekcia, licencia pre triedu.

- Vzhľad 2.0 („kamienkový“, blok `Bystrík 2.0` na konci CSS v head.html): krémová #FFF6E8, oranžová akcia #FF7A3D (`--accent-d` tieň), Baloo 2 + Nunito, karty bez obrysov s mäkkým tieňom, `--peb` tvar tlačidiel; noc = tmavomodrá #1C1640. Hry = „Bystríkov lunapark“ (`.lunahead`), Ja = `meWeek` + polica úspechov `meShelf` (ACH). Zvuky navyše: nav, back, purr, yum, chest, mic (`TAPSND` v 14-akcie).
- Učenie v predmete: Medový úľ (`hiveHTML`, `hiveBear`, prepínač `p.hive`, 0 = zoznam) – témy ako plásty, hviezdy = med. Strom NIE (kamarát používateľa má strom).
- Rodič 2.0: trieda `html.adult` (render) = pokojný vzhľad (#F7F5F2, tmavé tlačidlá, Nunito), `pTop` (týždeň vetou + graf, Ide jej / Potrénovať). Hry: `html.luna` = večerná obloha. Kvíz: kamienky `pebHTML`. Šatník/Obchod majú späť do Ja (`back-me`), Obchod `dealHero` (ponuka dňa). Čítanie: zvýrazňovanie slov `.rw` + vlna `.recwave` počas nahrávania. Domček: tapeta, obraz, lampa (v noci svieti), koberec. Nastavenia dieťaťa: dlaždice `.kstile` + výber Deň/Noc/Podľa času.
- Domov presne podľa návrhu: scéna, batôžtek, tlačidlo, 2 čipy (`.hchips2`: domček, rebríček), úlohy rozbaľovacie. Bystríkov domček je samostatná obrazovka `kutik` (ťuk na Bystríka alebo čip), späť `back-home`. Priatelia: hlavička `.frhero` s bublinkami kamarátov. Pozadie stránky je čisté (bez vzoru `body::after`, v noci hviezdy ostávajú).
- Postavička v proporciách návrhu (chibi): v `avatarSvg` sa telo kreslí cez `BODYT` (zmenšené, posunuté) a hlava cez `HEADT` (väčšia); orezy `crop` upravené. Oči lesklé (EYa/EYb).
- Predmet: farebná hlavička `.subhead`, výber režimu zmizol – ťuk na tému otvorí list `topicSheet` (Hrať kvíz + iné spôsoby, akcia `tmode`). Hry: veľká karta `lunaStage` + okrúhle atrakcie (`LUNASEL`, akcia `luna-sel`; potiahnutie prstom `AFTER.games` → `lunaGo(±1)`, šípky `.luside`, bodky `.ludots`).
- Úvod pre nové dieťa = `onboard2` (4 kroky podľa návrhu: meno, ročník kamienky, dievča alebo chlapec (`ob2-gen`, `OB.g2`) + 4 účesy `OB2_LOOKS[g]`, takto to funguje; `OB.step2`, akcie ob2-*). Úprava profilu (`OB.edit`) ostáva po starom.
- Kalkulačka: tip „ťukni na mňa“ len pri prvých 2 kvízoch (`DATA.calcHints`). Učenie: `lastTopicRow` (Pokračuj, kde si skončil), rýchle ikonky `.lqrow`, bez rebríčka. Prechody 2.1: `tIn`/`tOut` s premennými --tx/--ty/--ts.
- Návrh redizajnu: https://claude.ai/artifact/G2NpfEMXPSAHaUposn7xR9 (zatiaľ nepresunuté: nová postavička dieťaťa – treba spolu so šatníkom, Čítanie s rozsvecovaním slov, detailný Domček).

- Obchod 3.0 (`sh2*` v head.html, `VIEWS.shop`): peňaženka + časovač `shopHMS()` (#shopcd2), kategórie, mriežka `.sh2item` so štítkom vzácnosti (truhla odstránená), skúšanie v spodnom liste `.sh2sheet` (SHOPSEL, akcie `shop-prev`/`shop-prev-x`). Kalkulačka 2.0 = fialová hračka s LCD (#calccur mätový), farebné kamienkové klávesy. Zvuky 2.0 v 02-zvuky.js: `mar` = kalimba, `bub` bublinky, `air` šum. Animácia pri posúvaní: `scrollReveal()` v 07-router (triedy `.rv`/`.rv-in`, IntersectionObserver, nie v lite).
- Rodič → Zadať úlohu 2.0: `ptTasksHTML(p)` + stav `PTF` (prepínač Úloha s odmenou | Učivo zo školy, predmet → mriežka tém → cieľ → odmena → súhrn), akcie `pt-mode/pt-subj/pt-pick/pt-stars/pt-coins`, `sc-save`, `sc-clear`. Vstup do rodičovského účtu aj tlačidlom „Rodič“ v hlavičke Ja (`.japar`, akcia parent-open).
- Úľ 2.0: riadky 3 + 2, veľké plásty (`--w:min(31vw,128px)`), karta s medvedíkom nad úľom, ďalšia téma `.next` s „🐝 Tu!“.
- 1. a 2. ročník: v pomôckach počítacia os so žabkou (1. roč. 0–20, 2. roč. 0–100 so skokmi ±10, tlačidlo ↺); kalkulačka len keď otázka obsahuje číslo nad 20 (`qMaxNum`) (`HELP_TABS1`, `NL`, `nlHTML`, `nlDraw`, akcie nl-set/nl-step/nl-reset).
- Odmeny za level: najviac 3 na level (`spreadLvls()` v 04-levely posúva prebytok na ďalší level, `it.lvl0` + `p.lvMig` = kto už mal pôvodný level, o nič nepríde); okno darčeka `showRewardOverlay` zobrazí max 3, `.over .box` sa zmestí aj na iPhone SE.
- Polica úspechov 2.0 `meShelf` (`.shelf2`): 6 odznakov s kruhom postupu (bronz/striebro/zlato), ťuk = `shelf-tip`.
- Domček 2.0: detailná SVG izba `roomSvg(b)` (okno so záclonami a oblohou podľa dňa/noci, hodiny s reálnym časom, obraz, knižnica s rádiom a medom, kreslo, stolík s lampou a hrnčekom, koberec, kvetina rastie `b.plant` 1×/deň, truhla s hračkami); ťukacie akcie `room-clock/lamp/curtain/radio/book/honey/plant`, stav `ROOMST`.
- Bystríkov diktafón (Čítanka, `.dk`): veľké červené tlačidlo, čas mm:ss, živá vlna `recViz` (AnalyserNode), vlastný prehrávač `dk-play`, „Poslať rodičovi“ = IndexedDB + upload do Supabase Storage bucket `readings/<uid>/<id>.webm` (`recUpload/recDownload/recRemove`, SQL `supabase/2026-11-nahravky.sql` treba spustiť). Rodič prehrá aj z iného zariadenia (`play-rec` stiahne z cloudu). V artefakte mikrofón nie je (žiadna capability) → ostáva náhrada diktafónom.
- Rebríček: pri načítaní sa hráč hneď zapíše (`LBSELF`), obnova každých 30 s na obrazovke + tlačidlo `lb-refresh`, karta „Včerajší víťazi“ (`LB.yest`).
- AI Bystrík: odpovede max 2–3 krátke vety (`tutorIntro`), chat `max: 400` (v artefakte sa max/effort nepošlú).
- Animácia pri posúvaní je jemná (18 px, 1,1 s ease-out, bez vnorených prvkov).
- Výber učiva podľa toho, čo dieťa vie: `knownTopics(p, s)` = témy s úspešnosťou ≥60 % + témy, ktoré sa už v škole prebrali (`CURR[id]` = mesiac školského roka 0=sep…9=jún, `schoolMonth()`), sezónne len v sezóne (`SEASONAL`), príliš ťažké (<45 % po 5+) vynechá, téma zo školy má prednosť. Používajú ho Témy dňa (`dayTopics`), Pokračuj (`goPlan`), Denná výzva (`dailySeq`) a hry (`frogQ`). Hry podľa ročníka aj mesiaca (`schoolMonth`): Pravda či nie (`makeStatement`, 2. roč. bez násobenia), Balóny (`balloonTarget`), Slovný dážď (`rainSetup`, y/i v 2. roč. až od januára), Zoraď čísla (`orderNext`). Násobenie/delenie a dvojnásobok sú v 3. ročníku (malá násobilka je v SK až v 3. ročníku), nie v 2.
- Prihlásenie si pamätá: `bystrik.auth` v localStorage, obnova tokenu len raz naraz (`REFRESHING` v `supaToken`), odhlási len pri neplatnom refresh tokene (nie pri chybe siete/servera), obnova aj po návrate do appky; posledný e-mail `bystrik.lastEmail` sa predvyplní.
- Rebríček: na stupňoch víťazov len hráči s výsledkom > 0, ostatní (aj s 0) sú v zozname pod nimi (`top`/`others` vo `VIEWS.board`).
- Zásady súkromia (verzia 19. 11. 2026) spomínajú nahrávky čítania v súkromnom úložisku rodiča.
- Test `tests/smoke.js` prechádza aj všetky predmety × ročníky, domček a výber učiva/hier pre 1.–4. ročník. Kontrola učiva: každá téma vygeneruje otázky so správnou odpoveďou práve raz medzi možnosťami (skript vo scratchpade, val.js).
- Vlastné pozadie je zrušené: v šatníku nie je kategória Pozadie, v nastaveniach farba pozadia, úprava profilu končí účesom (krok 5 z 5, `ob-to-room` = uloženie); `DATA.settings.bgc` sa vynuluje.
- V artefakte je na Dnes karta `webCard()` s odkazom na plnú verziu na webe (`WEB_URL`). Web je hlavná verzia.
- Plus (kým nie sú platby, `plusFree()` → všetko zadarmo): podrobný prehľad pre rodiča (`T_detail`, inak `plusLockCard`), nahrávky do cloudu (`recUpload` len s `hasPlus()`), Moje poznámky, pracovné listy, až 5 detí. Nahrávky sa mažú po 60 dňoch (`recCleanup`, `REC_KEEP_DAYS`).
- Adventný kalendár: zatiaľ len návrh (nenasadený), https://claude.ai/artifact/MHiMhrvs9GHu1qT7msTNZx

## Otvorené
- Plus: Stripe účet + Payment Links do `PLUS_CFG`, spustiť SQL, nasadiť stripe-webhook + tajomstvá; potom AI cez server, týždenný e-mail (Resend, treba doménu), čítanka s hodnotením, kolekcia.
- Kontaktný e-mail do zásad súkromia (spýtať sa používateľa).

## Testovanie
Playwright (chromium predinštalovaný), lokálny server, telefónna emulácia (iPhone 13). Supabase sa v testoch mockuje cez `page.route`.
