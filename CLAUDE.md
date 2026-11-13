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
Menu: Domov (▶ Pokračuj = mix učenia), Učenie, Hry, Šatník (+Obchod), Ja (pokrok %, priatelia, rebríček, trieda).
Rodič (PIN): Prehľad, Zadať úlohu (+téma zo školy), Čítanka, Nastavenia (pravidlá, správy dieťaťa + história, režim učiteľa, GDPR/zmazanie účtu).
Písanie priateľom je predvolene vypnuté (`DATA.settings.msgOk`). Úsporný režim `settings.lite` (trieda `html.lite`, bez obrysu postavičky a ťažkých animácií).
- Rebríček: predvolene zapnutý, rodič ho môže vypnúť (`settings.lb`; pri vypnutí sa riadky dieťaťa zmažú). Používateľ nechce, aby rodič musel všetko povoľovať – nové veci dávať predvolene zapnuté s možnosťou vypnúť. Denné kolo (`p.dy`, riadky `pid#d` s week=dátum), záložky Dnes/Týždeň/Séria, stupne víťazov `podium()`, 23 miest; kto 5 dní (`LB_IDLE`) neaktívny, nezobrazí sa; denné odmeny `LB_PRIZE` (`lbAwards`).
- Bystríkov kútik (`bearCorner`): hlad/energia/radosť, priateľstvo `b.love`, pohladkať/tanec; spánok = západ slnka → noc a celá appka v nočnom režime (`nightOn()`, `applyTheme(true)` cez View Transition); večer/ročné obdobia v okne.
- Obchod: nakupovať až po dnešnom učení (`learnedToday`). Truhla odmien sa otvára kľúčom 🔑 (`p.keys`, max 3, `giveKey`: denná cesta, test ≥2★), NIE za slniečka ani peniaze (loot box pre deti) – `mysteryRoll`, `openMystery`, ruleta `spinReel`, 90/7/2/1 %; po kúpe/obliekaní `celebrateWear` (3D otočenie so zadnou stranou).
- Efekty: `fxComet` (5/10 v rade), `openChest` (truhlica za úlohy), hviezdy pri leveli; tutoriál `TOUR` má ťukacie kroky (`tap:1`), sprievodca zapnutím chatu `CHG`.

## Otvorené
- Stripe + Bystrík Plus (rodičia budúci mesiac), AI cez server, automatický týždenný e-mail.
- Kontaktný e-mail do zásad súkromia (spýtať sa používateľa).

## Testovanie
Playwright (chromium predinštalovaný), lokálny server, telefónna emulácia (iPhone 13). Supabase sa v testoch mockuje cez `page.route`.
