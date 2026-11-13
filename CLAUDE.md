# Bystrík – poznámky pre Claude

Hravá učebná appka pre 1.–4. ročník ZŠ (SK). Používateľ píše po slovensky, chce KRÁTKE odpovede a priame kroky.
Web: https://sebastiankoncek88-alt.github.io/bystrik/ · Artefakt: https://claude.ai/artifact/7VQhwvFHjH2AopYAwfzzG3

## Štruktúra
- `src/` – zdroj, všetko sa spája do jedného HTML:
  - `head.html` CSS · `app.js` logika (VIEWS.x / AFTER.x, akcie v ACT cez `data-a`, `go(view,params,dir)`, `render()`)
  - `content.js`, `ucivo1-3.js`, `extra*.js`, `prehlad.js` – učivo (témy `{id,g,type:'qa',items:lines(\`otázka|správna|zlá;zlá;zlá\`)}`)
  - `avatar.js` SVG postavička · `emoji.js` mapa na 3D emoji (`web/emoji/*.webp`) · `citanka.js`
- `build.sh` → `bystrik.html` (artefakt) · `build_web.sh` → `web/` (GitHub Pages, PWA, `sw.js` cache `bystrik-vN` – pri väčšej zmene zvýšiť)
- `supabase/*.sql` – SQL, ktoré používateľ spúšťa ručne v Supabase SQL Editore

## Nasadenie
1. `./build_web.sh && ./build.sh`
2. skopírovať `web/*`, `src/`, build skripty do repa, commit, `git push origin main` aj `main:gh-pages`
3. publikovať `bystrik.html` do artefaktu (rovnaká URL)
Nové emoji v kóde → pregenerovať mapu (scan + webp z Fluent Emoji 3D).

## Backend
- Supabase (URL + publishable key v `app.js` sú OK verejne). Tabuľky: saves, scores, players, friends, messages, classes, class_members; RPC `delete_me`.
- AI (Gemini/Claude) – kľúč len v zariadení (`bystrik.apikey`), limit tokenov `aiGuard`. NIKDY kľúče do kódu, nikdy nežiadať tajomstvá do chatu.

## Hlavné časti appky
Menu: Domov (▶ Pokračuj = mix učenia), Učenie, Hry, Šatník (+Obchod), Ja (pokrok %, priatelia, rebríček, trieda).
Rodič (PIN): Prehľad, Zadať úlohu (+téma zo školy), Čítanka, Nastavenia (pravidlá, správy dieťaťa + história, režim učiteľa, GDPR/zmazanie účtu).
Písanie priateľom je predvolene vypnuté (`DATA.settings.msgOk`).

## Otvorené
- Stripe + Bystrík Plus (rodičia budúci mesiac), AI cez server, automatický týždenný e-mail.
- Kontaktný e-mail do zásad súkromia (spýtať sa používateľa).
- Ktorého medvedíka zväčšiť (nezodpovedané).

## Testovanie
Playwright (chromium predinštalovaný), lokálny server, telefónna emulácia (iPhone 13). Supabase sa v testoch mockuje cez `page.route`.
