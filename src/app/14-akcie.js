/* ===== Akcie ===== */
const ACT = {
  nav: d => { if (d.v === 'settings') CSET = null; sfx('tap'); if (d.v === 'profiles') return go('profiles', {}, 'b'); go(d.v, {}, d.v === 'home' ? 'b' : 'f'); },
  home: () => { sfx('tap'); go('home', {}, 'b'); },
  'learn-back': () => { sfx('tap'); go('learn', {}, 'b'); },
  wave: () => { WAVEN = (WAVEN || 0) + 1; const st = $('.stage .fig'); if (st && WAVEN % 3 === 0 && !st.querySelector('.cw')) { celebrateWear(st, P().av); const n = st.querySelector('.cwnew'); if (n) n.textContent = 'Juchú!'; return; } const a = $('.stage .avatar, #wfig .avatar'); if (a) { a.classList.remove('waving', 'dance'); void a.offsetWidth; a.classList.add(Math.random() < .5 ? 'waving' : 'dance'); sfx('pop'); } },
  'ob-say': () => { say(OB.step > 0 ? OB_T[OB.step] : OB_HELLO); const b = $('.herobub'); if (b) b.remove(); },
  'ob-next': () => { sfx('tap'); OB.step = 1; go('onboard', {}, 'f'); },
  'ob-back': () => { sfx('tap'); if (OB.edit && OB.step <= 1) return go('settings', {}, 'b'); OB.step = OB.step === 5 ? 3 : OB.step - 1; go('onboard', {}, 'b'); },
  'ob-name': () => { const v = ($('#ob-name').value || '').trim(); if (!v) { toast('Napíš svoje meno 🙂'); return; } OB.name = v; sfx('tap'); OB.step = 2; go('onboard', {}, 'f'); },
  'ob-g': d => { if (OB.gender !== d.g || !OB.edit) { const keep = OB.edit ? { col: OB.av.col, bg: OB.av.bg, bgp: OB.av.bgp, skin: OB.av.skin, pet: OB.av.pet, petName: OB.av.petName } : {}; OB.av = { ...defaultAvatar(d.g), ...keep }; if (!OB.edit) OB.room = defaultRoom(d.g); } OB.gender = d.g; sfx('pop'); $$('.pickg button').forEach(b => b.classList.toggle('on', b.dataset.g === d.g)); OB.step = 3; setTimeout(() => go('onboard', {}, 'f'), 220); },
  'ob-grade': d => { OB.grade = +d.g; sfx('pop'); $$('.grades button').forEach(b => b.classList.toggle('on', b.dataset.g === d.g)); OB.step = 5; setTimeout(() => go('onboard', {}, 'f'), 220); },
  'ob-pet': d => { const inp = $('#ob-petname'); const oldDef = petName({ pet: OB.av.pet }); if (inp && (!inp.value.trim() || inp.value.trim() === oldDef)) inp.value = itemOf('pet', d.i).n; OB.av.pet = d.i; OB.av.petName = ''; sfx('pop'); $$('.petpick button').forEach(b => b.classList.toggle('on', b.dataset.i === d.i)); },
  'ob-pet-next': () => { const v = ($('#ob-petname').value || '').trim(); OB.av.petName = v && v !== itemOf('pet', OB.av.pet).n ? v : ''; sfx('tap'); OB.step = 5; go('onboard', {}, 'f'); },
  'ob-to-room': () => { sfx('tap'); OB.step = 6; go('onboard', {}, 'f'); },
  'ob-hair': d => { OB.av.hair = d.i; sfx('pop'); render(null); const f = $('#ob-fig .avatar'); f && f.classList.add('jump'); },
  'ob-done': () => { if (OB.edit) { const p = P(); p.name = OB.name; p.grade = OB.grade; p.av = { ...OB.av, gender: OB.gender }; p.room = OB.room; save(); sfx('level'); confetti(100); toast('Uložené ✓'); return go('home', { wave: true }, 'u'); } const p = newProfile(OB.name, OB.gender, OB.grade, OB.av); p.room = OB.room || defaultRoom(OB.gender); DATA.profiles.push(p); DATA.current = p.id; PARENT_OK = false; save(); sfx('level'); confetti(150); go('home', { wave: true }, 'u'); setTimeout(() => { if (UI.view === 'home' && !P().tourDone) showGuide(TOUR, 0, endTour); }, 1400); },
  'pick-prof': d => { DATA.current = d.id; save(); sfx('pop'); go('home', { wave: true }, 'f'); },
  'edit-prof': () => { const p = P(); OB = { step: 1, edit: true, name: p.name, gender: p.av.gender, grade: p.grade, av: JSON.parse(JSON.stringify(p.av)), room: JSON.parse(JSON.stringify(p.room)) }; sfx('tap'); go('onboard', {}, 'f'); },
  'new-prof': () => { OB = { step: 1, name: '', gender: 'd', grade: 1, av: defaultAvatar('d'), room: defaultRoom('d') }; go('onboard', {}, 'f'); },
  subject: d => { sfx('tap'); go('subject', { s: d.s }, 'f'); },
  mode: d => { P().mode[d.s] = d.m; save(); sfx('pop'); render(null); },
  'grade-chip': d => { sfx('tap'); UI.params.g = +d.g; render(null); },
  topic: d => { sfx('tap'); startMode(d.id); },
  'close-sheet': () => closeSheet(),
  'go-start': () => { const p = P(); sfx('tap'); const g = goPlan(p); if (g.kind === 'rev') { p.goRev = today(); save(); return startReview(); } startQuiz([...new Set(g.seq)], 'go', { v: 'home', p: {} }, { seq: g.seq }); },
  daily: () => { const p = P(); sfx('tap'); const seq = dailySeq(p); startQuiz([...new Set(seq)], 'daily', { v: 'home', p: {} }, { seq }); },
  ans: (d, el) => answer(Q.cur.options[+d.i], el),
  key: (d, el) => { if (Q.answered) return; const k = d.k; sfx('tap'); if (k === 'del') Q.input = Q.input.slice(0, -1); else if (k === 'ok') { if (Q.input) answer(Q.input, el); return; } else if (Q.input.length < 7) Q.input += k; $('#padshow').innerHTML = Q.input ? fmt(Q.input) : '&nbsp;'; },
  next: () => nextStep(), explain: () => explainQ(), speak: () => say(Q.cur.speak, Q.cur.speakLang),
  calc: () => openCalc(), ck: d => calcKey(d.k),
  'help-tab': d => { HELPTAB[d.s] = d.t; sfx('tap'); $$('.htabs .chip').forEach(c => c.classList.toggle('on', c.dataset.t === d.t)); const b = $('#hbody'); if (b) b.innerHTML = helpBody(d.s, d.t); },
  quit: () => { const b = Q.back; Q = null; go(b.v, b.p, 'b'); },
  'quit-mode': () => { const b = (UI.view === 'cards' ? CD : UI.view === 'pexeso' ? PX : UI.view === 'match' ? MT : ST).back; go(b.v, b.p, 'b'); },
  flip: () => { $('#flip').classList.toggle('on'); sfx('flip'); },
  'card-say': (d, el, e) => { e.stopPropagation(); say(CD.deck[0].speak, 'en-GB'); },
  'card-yes': () => cardAnswer(true), 'card-no': () => cardAnswer(false),
  tile: d => tileTap(+d.i), 'm-pick': d => mPick(d.s, +d.i), bin: (d, el) => binTap(+d.i, el),
  game: d => { sfx('tap'); const p = P(); if (gameLocked(p, d.g)) { const g = GAMES[d.g]; const can = (p.coins || 0) >= g.cost; const w = document.createElement('div'); w.className = 'over'; w.innerHTML = `<div class="card box"><div style="font-size:4rem;line-height:1">${g.i}</div><h2>${g.n}</h2><p class="muted b">${g.d}</p><p class="b">Odomknutie stojí ${COIN} ${g.cost}. Máš ${COIN} ${p.coins || 0}.</p>${can ? `<button class="btn primary block" data-a="game-buy" data-g="${d.g}">🔓 Odomknúť hru</button>` : `<p class="b" style="color:var(--bad)">Chýba ti ešte ${g.cost - (p.coins || 0)} slniečok. Uč sa a zbieraj!</p><button class="btn primary block" data-a="ov-learn">📚 Ísť sa učiť</button>`}<button class="btn block" data-a="ov-close">Zrušiť</button></div>`; document.body.appendChild(w); return; } startGame(d.g); },
  'game-buy': d => { const p = P(); const g = GAMES[d.g]; if (!g || !gameLocked(p, d.g) || (p.coins || 0) < g.cost) return; p.coins -= g.cost; p.gown = [...(p.gown || []), d.g]; save(); $$('.over').forEach(e => e.parentNode.removeChild(e)); JUSTUNL = d.g; render(null); unlockAnim(d.g); },
  'ord': (d, el) => { if (!GM || GM.ended || GM.busy) return; const o = GM.o; const v = +el.dataset.v; if (v === o.sorted[o.pos]) { o.pos++; el.classList.add('done'); el.disabled = true; sfx('pop'); buzz(8); if (o.pos >= o.sorted.length) { GM.busy = true; if (GM.qt) clearTimeout(GM.qt); gHit(true, $('#ordgrid')); if (o.sorted.length >= 8) { GM.score++; const sc = $('#gscore'); if (sc) sc.textContent = '⭐ ' + GM.score; } setTimeout(() => { if (!GM || GM.ended) return; GM.busy = false; orderNext(); const b = $('#ordwrap'); if (b) b.innerHTML = orderHTML(); qTimer(orderOut, 3); }, 600); } } else { el.classList.remove('bad'); void el.offsetWidth; el.classList.add('bad'); gHit(false, el); } },
  'simon-pad': (d, el) => { if (!GM || GM.ended || GM.lockIn) return; const i = +el.dataset.i; simonLit(i, 220); if (i === GM.seq[GM.in]) { GM.in++; if (GM.in >= GM.seq.length) { GM.lockIn = true; gHit(true, $('#simon')); GM.seq.push(R(0, 3)); GM.in = 0; TIMERS.push(setTimeout(simonPlay, 900)); } } else { GM.lockIn = true; gHit(false, $('#simon')); GM.in = 0; const el2 = $('#simoninfo'); if (el2) el2.textContent = 'Ups! Pozri sa ešte raz.'; if (!GM.ended) TIMERS.push(setTimeout(simonPlay, 1100)); } },
  'race-ans': (d, el) => { if (!GM || GM.ended || GM.busy) return; const ok = GM.rq.opts[+el.dataset.i] === GM.rq.answer; if (ok) { GM.pos++; gHit(true, el); if (GM.pos >= 10) { GM.busy = true; GM.score += 5; const sc = $('#gscore'); if (sc) sc.textContent = '⭐ ' + GM.score; sfx('level'); try { confetti(80, .3); } catch (e) { } toast('🏁 Vyhral(a) si preteky! +5 ⭐'); TIMERS.push(setTimeout(() => { if (!GM || GM.ended) return; GM.pos = 0; GM.bot = 0; GM.busy = false; GM.rq = frogQ(GM.g); raceDraw(true); }, 1200)); return; } } else gHit(false, el); if (GM.ended) return; GM.rq = frogQ(GM.g); raceDraw(true); },
  wl: (d, el) => {
    if (!GM || GM.ended || GM.busy) return; const w = GM.w; const t = w.tiles.find(x => x.i === +el.dataset.i); if (!t || t.used) return;
    if (t.c === w.word[w.pos]) { t.used = true; w.pos++; sfx('pop'); buzz(8);
      if (w.pos >= w.word.length) { GM.busy = true; if (GM.qt) clearTimeout(GM.qt); const b = $('#wordwrap'); if (b) b.innerHTML = wordHTML(); gHit(true, $('.wslots')); GM.score += w.word.length >= 6 ? 1 : 0; const sc = $('#gscore'); if (sc) sc.textContent = '⭐ ' + GM.score; try { say(w.word.join('').toLowerCase()); } catch (e) { } setTimeout(() => { if (!GM || GM.ended) return; GM.busy = false; wordNext(); const b2 = $('#wordwrap'); if (b2) b2.innerHTML = wordHTML(); qTimer(wordOut, 2.4); }, 800); }
      else { const b = $('#wordwrap'); if (b) b.innerHTML = wordHTML(); } }
    else { el.classList.remove('bad'); void el.offsetWidth; el.classList.add('bad'); gHit(false, el); }
  },
  frog: (d, el) => {
    if (GM.ended || GM.busy) return; GM.busy = true; if (GM.qt) clearTimeout(GM.qt); const ok = GM.fq.opts[+el.dataset.i] === GM.fq.answer; const fr = $('#frog'); const pond = $('#pond');
    const pr = pond.getBoundingClientRect(), r = el.getBoundingClientRect(), f = fr.getBoundingClientRect();
    fr.style.transform = `translate(${r.left + r.width / 2 - (f.left + f.width / 2)}px, ${r.top + r.height / 2 - (f.top + f.height / 2)}px)`; fr.classList.add('jump'); sfx('whoosh');
    setTimeout(() => {
      if (ok) { el.classList.add('good'); gHit(true, el); GM.step++; if (GM.step % 5 === 0) { GM.shores++; GM.score += 3; const s2 = $('#gscore'); if (s2) s2.textContent = '⭐ ' + GM.score; try { confetti(70, .3); } catch (e) { } sfx('coin'); toast('🏡 Žabka je na brehu! +3 ⭐'); } }
      else { el.classList.add('sink'); fr.classList.add('splash'); gHit(false, el); const ex = $('.deckinfo'); if (ex) ex.textContent = 'Správne bolo: ' + GM.fq.answer; }
      setTimeout(() => { if (GM.ended) return; GM.fq = frogQ(GM.g); GM.busy = false; const w = $('#fwrap'); if (w) w.innerHTML = frogHTML(); qTimer(frogOut); }, ok ? 450 : 1100);
    }, 380);
  },
  mole: (d, el) => { if (GM.ended || !el.classList.contains('up') || el.classList.contains('hit')) return; const ok = el.dataset.good === '1'; el.classList.add(ok ? 'hit' : 'miss'); setTimeout(() => el.classList.remove('up'), 250); gHit(ok, el); },
  'quit-game': () => { GM.ended = true; go('games', {}, 'b'); },
  balloon: (d, el) => { if (GM.ended || el.classList.contains('popped')) return; const ok = d.v !== 'x' && d.v !== 'old' && +d.v === GM.target; el.classList.add('popped'); setTimeout(() => el.remove(), 300); gHit(ok, el); if (ok && ++GM.hits % 4 === 0) { GM.target = balloonTarget(GM.g); const t = $('#gtarget'); if (t) { t.innerHTML = `Nové číslo! Praskni balóny s výsledkom <b>${GM.target}</b>`; t.style.animation = 'none'; void t.offsetWidth; t.style.animation = 'yay .5s'; } $$('.balloon').forEach(b => { if (b.dataset.v !== 'x') b.dataset.v = 'old'; }); } },
  drop: (d, el) => { if (GM.ended || el.classList.contains('popped')) return; const ok = d.good === '1'; el.style.background = ok ? 'var(--good)' : 'var(--bad)'; el.style.color = '#fff'; el.classList.add('popped'); setTimeout(() => el.remove(), 300); gHit(ok, el); },
  tf: (d, el) => { if (GM.ended || GM.lock) return; tfResolve((d.v === '1') === GM.st.truth, el); },
  'gdiff': d => { $$('.over').forEach(e => e.remove()); sfx('tap'); startGame(d.g, d.d); },
  'res-back': () => { const r = UI.params; go(r.back.v, r.back.p, 'b'); },
  'res-again': () => { const r = UI.params; if (r.kind === 'read') return go('reads', {}, 'b'); if (r.kind === 'review') { if (reviewDue(P()).length) return startReview(); return go('home', {}, 'b'); } if (r.kind === 'write') return go('write', {}, 'b'); if (r.kind === 'dict') return go('dict', {}, 'b'); if (r.kind === 'game') return startGame(r.game, (P().gdiff || {})[r.game]); if (r.kind === 'go') return ACT['go-start'](); if (r.kind === 'test' || r.kind === 'quiz' || r.kind === 'time' || r.kind === 'daily') return startQuiz(r.retry, r.kind, r.back); startMode(r.retry[0]); },
  gift: (d, el) => { el.classList.add('open'); sfx('gift'); confetti(80, .4); setTimeout(() => { el.remove(); $('.over .rewards').hidden = false; $('[data-a="ov-wear"]').hidden = false; }, 450); },
  'ov-close': () => { $('.over')?.remove(); setTimeout(flushPending, 200); },
  'ov-wear': () => { $('.over')?.remove(); PENDING = []; go('wardrobe', {}, 'f'); },
  dreward: () => { sfx('tap'); const p = P(); if (UI.view !== 'home') { go('home', {}, 'f'); return setTimeout(() => { const e = $('#drcard'); if (e) e.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 300); } if (drReady(p)) ACT['dr-claim']({}, $('#drcard')); else { const e = $('#drcard'); if (e) e.scrollIntoView({ behavior: 'smooth', block: 'center' }); } },
  'dr-claim': (d, el) => { const p = P(); if (!drReady(p)) return; const dn = drNextDay(p); p.dailyReward = { last: today(), day: dn }; $('.over')?.remove(); confetti(120); touchStreak(p); grant(DR[dn - 1].xp, el); if (UI.view === 'home' || UI.view === 'rewards') render(null); },
  claim: (d, el) => { const p = P(); const dd = ensureDay(p); if (dd.claimed.includes(d.id)) return; dd.claimed.push(d.id); p.stats.tasks++; checkBadges(p); const T = TASKS.find(x => x.id === d.id); confetti(50, .5); grant(T.xp, el); render(null); },
  'claim-bonus': (d, el) => { const p = P(); const dd = ensureDay(p); if (dd.bonus) return; dd.bonus = true; giveKey(p); save(); openChest(50); },
  'rtab-go': d => { RTAB = d.t; go('rewards', {}, 'f'); },
  wcat: d => { WCAT = d.c; sfx('tap'); $$('.cats .chip').forEach(c => c.classList.toggle('on', c.dataset.c === d.c)); $('#witems').innerHTML = wardItems(); },
  wear: d => wear(d.i), color: d => setColor(d.s, d.i),
  gender: d => { const p = P(); if (p.av.gender === d.g) return; const def = defaultAvatar(d.g); Object.assign(p.av, { gender: d.g, hair: def.hair, eyes: def.eyes }); for (const c of ['top', 'bottom', 'acc', 'pet']) { const it = itemOf(c, p.av[c]); if (it.g && it.g !== d.g) p.av[c] = def[c]; } for (const k of Object.keys(p.av.col)) { const list = k === 'hair' ? HAIRC : PAL; const it = list.find(x => x.id === p.av.col[k]); if (it && it.g && it.g !== d.g) p.av.col[k] = def.col[k]; } save(); sfx('pop'); render(null); $('#wfig .avatar').classList.add('jump'); },
  rtab: d => { RTAB = d.t; sfx('tap'); render(null); },
  toggle: d => { DATA.settings[d.k] = !DATA.settings[d.k]; if (d.k === 'lite') { document.documentElement.classList.toggle('lite', !!DATA.settings.lite); toast(DATA.settings.lite ? '🔋 Úsporný režim zapnutý' : '✨ Všetky efekty zapnuté'); } if (d.k === 'lb') { DATA.lbDel = 0; LB = null; } save(); render(null); sfx('tap'); },
  'parent-open': () => { sfx('tap'); PSET = null; if (PARENT_OK && !DATA.parent.tour) setTimeout(() => { if (UI.view === 'parent' && !GUIDE) showGuide(PTOUR, 0, endPTour); }, 700); if (!DATA.parentSeen) { DATA.parentSeen = 1; save(); } PSEL = DATA.current; PTAB = 'over'; go('parent', {}, 'f'); },
  'parent-lock': () => { PARENT_OK = false; PDEL = false; go(P() ? 'home' : 'profiles', {}, 'b'); },
  'pin-back': () => go(P() ? 'settings' : 'profiles', {}, 'b'),
  pk: d => pinKey(d.k),
  'pin-change': () => { PARENT_OK = false; PIN = { mode: 'create', val: '', first: '' }; UI.view = 'pin'; render('f'); },
  psel: d => { PSEL = d.id; PDEL = false; render(null); },
  'p-grade': d => { const p = DATA.profiles.find(x => x.id === PSEL); p.grade = +d.g; save(); toast(`Ročník: ${d.g}.`); render(null); },
  'bk-copy': async (d, el) => { const code = await makeBackup(); const ta = $('#bkcode'); ta.value = code; ta.hidden = false; let ok = false; try { await navigator.clipboard.writeText(code); ok = true; } catch (e) { ta.focus(); ta.select(); } DATA.backupAt = Date.now(); save(); toast(ok ? 'Kód zálohy je skopírovaný ✓ Uložte si ho, napríklad do e-mailu.' : 'Kód je označený. Skopírujte ho a uložte si ho.'); sfx('coin'); burst(el, 24); setTimeout(() => { const card = $('.backup'); if (card) { card.classList.remove('blink'); } }, 50); },
  'bk-file': async () => { const code = await makeBackup(); const d = new Date(); const ok = await saveFile(`bystrik-zaloha-${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}.txt`, code, 'text/plain'); if (!ok) return; DATA.backupAt = Date.now(); save(); toast('Súbor so zálohou je uložený ✓'); render(null); },
  'bk-restore': () => { RESTORE = true; render(null); setTimeout(() => { const f = $('#bkfile'); if (f) f.addEventListener('change', async () => { const file = f.files && f.files[0]; if (file) $('#bkin').value = await file.text(); }); const b = $('.bkrestore'); if (b) b.scrollIntoView({ block: 'center' }); }, 50); },
  'bk-cancel': () => { RESTORE = false; render(null); },
  'bk-apply': async () => { try { const o = await readBackup($('#bkin').value); const data = o.data || o; if (!data || !Array.isArray(data.profiles)) throw new Error('bad'); DATA = Object.assign({ profiles: [], current: null }, data); normalize(); DATA.backupAt = Date.now(); if (!P()) DATA.current = DATA.profiles[0] ? DATA.profiles[0].id : null; save(); RESTORE = false; PSEL = DATA.current; toast(`Obnovené ✓ Hráči: ${DATA.profiles.map(p => p.name).join(', ')}`); sfx('level'); confetti(120); render(null); } catch (e) { sfx('no'); toast('Tento kód zálohy sa nedá prečítať. Skontrolujte, či je celý.'); } },
  'ai-save': () => { const v = ($('#aikey').value || '').trim(); if (!v) { toast('Najprv vložte AI kľúč.'); return; } if (v.length < 20 || /\s/.test(v)) { toast('Kľúč vyzerá neúplne. Skopírujte ho znova.'); return; } setApiKey(v); sfx('coin'); toast('AI kľúč uložený ✓ Bystrík teraz funguje aj na webe.'); render(null); },
  'ai-link': async () => { const u = location.origin + location.pathname + '#k=' + encodeURIComponent(getApiKey()); try { if (navigator.share) { await navigator.share({ title: 'Bystrík', url: u }); return; } } catch (e) { return; } try { await navigator.clipboard.writeText(u); toast('Odkaz skopírovaný. Pošlite si ho do druhého telefónu a otvorte. Nikomu inému ho nedávajte.'); } catch (e) { prompt('Skopírujte odkaz:', u); } },
  'ai-guide': () => { if (CHG) chgEnd(); sfx('whoosh'); aiGuide(0); },
  'aig-go': (d, el) => { sfx('tap'); aiGuide(AIG + (+el.dataset.i)); },
  'aig-close': () => { try { speechSynthesis.cancel(); } catch (e) { } const o = $('#aigover'); if (o) o.remove(); },
  'aig-paste': async () => { const t = await readClip(); if (t) { $('#aigkey').value = t; sfx('pop'); } else toast('Ťuknite do políčka, podržte prst a zvoľte „Prilepiť“.'); },
  'ai-paste': async () => { const t = await readClip(); if (t) { $('#aikey').value = t; sfx('pop'); } else toast('Ťuknite do políčka, podržte prst a zvoľte „Prilepiť“.'); },
  'aig-save': async (d, el) => {
    const v = ($('#aigkey').value || '').trim(); const msg = $('#aigmsg');
    if (v.length < 20 || /\s/.test(v)) { msg.textContent = '❗ Kľúč vyzerá neúplne. Vráťte sa o krok a skopírujte ho znova.'; sfx('no'); return; }
    el.disabled = true; el.textContent = '⏳ Skúšam…'; setApiKey(v);
    try { const s2 = await getSample(); const r = await s2('Odpovedz po slovensky jednou krátkou veselou vetou: pozdrav dieťa.', { cache: false });
      const o = $('#aigover'); o.innerHTML = `<div class="box card aigbox">${bearSvg('cheer')}<h2>Hurá, funguje to! 🎉</h2><p class="b">Bystrík hovorí: „${esc(r.text.slice(0, 120))}“</p><p class="muted">Teraz funguje chat, „Vysvetli mi to“ aj Moje poznámky. Na ďalšie zariadenie: Rodičovský účet → 📲 Odkaz pre ďalší telefón.</p><button class="btn primary" data-a="aig-close">Super!</button></div>`; sfx('coin'); try { confetti && confetti(); } catch (e) { } render(null);
    } catch (e) {
      if (e && e.code === 'not_granted') { setApiKey(''); msg.textContent = '❌ Tento kľúč nefunguje. Skopírujte ho znova (celý).'; }
      else msg.textContent = e && (e.code === 'rate_limited' || /high demand|503/i.test(e.message || '')) ? '✅ Kľúč je uložený. Google je teraz preťažený, skúste Bystríka o chvíľu.' : '⚠️ Kľúč je uložený, ale test sa nepodaril: ' + ((e && e.message) || 'chyba');
      el.disabled = false; el.textContent = '✅ Uložiť a vyskúšať'; sfx('no');
    }
  },
  'auth-mode': d => { LOGIN.email = ($('#aemail') || {}).value || ''; LOGIN.mode = d.m; LOGIN.msg = ''; LOGIN.ok = false; sfx('tap'); render(null); },
  'auth-go': async () => {
    if (LOGIN.busy) return; const email = ($('#aemail').value || '').trim().toLowerCase(), pass = $('#apass').value || ''; LOGIN.email = email;
    const fail = m => { LOGIN.busy = false; LOGIN.ok = false; LOGIN.msg = m; sfx('no'); render(null); };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return fail('Zadajte platný e-mail.');
    if (pass.length < 6) return fail('Heslo musí mať aspoň 6 znakov.');
    if (LOGIN.mode === 'up') { const cb = $('#aconsent'); LOGIN.consent = !!(cb && cb.checked); if (!LOGIN.consent) return fail('Potvrďte, prosím, súhlas rodiča so zásadami.'); DATA.consent = { t: Date.now(), v: 1 }; }
    LOGIN.busy = true; LOGIN.msg = ''; render(null);
    try {
      const j = LOGIN.mode === 'in' ? await supaAuth('token?grant_type=password', { email, password: pass }) : await supaAuth('signup', { email, password: pass });
      if (!j.access_token) { LOGIN.mode = 'in'; return fail('Poslali sme vám e-mail. Potvrďte ho odkazom a potom sa prihláste.'); }
      setAuth(authFrom(j));
    } catch (e) { return fail(authErr(e)); }
    try { await supaSync(); } catch (e) { DBREF = SUPADB; toast('Postup sa zatiaľ nepodarilo načítať. Skúsime to neskôr.'); }
    LOGIN = { mode: 'in', busy: false, msg: '' }; sfx('coin'); boot();
  },
  'auth-link': async () => {
    if (LOGIN.busy) return; const email = ($('#aemail').value || '').trim().toLowerCase(); LOGIN.email = email; LOGIN.ok = false;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { LOGIN.msg = 'Najprv hore napíšte svoj e-mail.'; sfx('no'); return render(null); }
    LOGIN.busy = true; LOGIN.msg = ''; render(null);
    try { await supaAuth('otp?redirect_to=' + encodeURIComponent(location.origin + location.pathname), { email, create_user: true }); LOGIN.ok = true; LOGIN.msg = 'Poslali sme vám e-mail. Otvorte ho na tomto zariadení a kliknite na odkaz. Pozrite aj spam.'; }
    catch (e) { LOGIN.msg = /rate|429/i.test((e.message || '') + (e.code || '') + (e.status || '')) ? 'Teraz sa nedá poslať ďalší e-mail. Skúste to neskôr alebo použite heslo.' : authErr(e); }
    LOGIN.busy = false; render(null);
  },
  'auth-forgot': async () => {
    if (LOGIN.busy) return; const email = ($('#aemail').value || '').trim().toLowerCase(); LOGIN.email = email; LOGIN.ok = false;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { LOGIN.msg = 'Najprv hore napíšte svoj e-mail.'; sfx('no'); return render(null); }
    LOGIN.busy = true; LOGIN.msg = ''; render(null);
    try { await supaAuth('recover?redirect_to=' + encodeURIComponent(location.origin + location.pathname), { email }); LOGIN.ok = true; LOGIN.msg = 'Ak účet existuje, poslali sme naň e-mail s odkazom na nové heslo. Pozrite aj spam.'; }
    catch (e) { LOGIN.msg = /rate|429/i.test((e.message || '') + (e.code || '') + (e.status || '')) ? 'Teraz sa nedá poslať ďalší e-mail. Skúste to o hodinu.' : authErr(e); }
    LOGIN.busy = false; render(null);
  },
  'auth-newpass': async () => {
    if (LOGIN.busy || !RECOVER) return; const pass = $('#npass').value || '';
    if (pass.length < 6) { LOGIN.msg = 'Heslo musí mať aspoň 6 znakov.'; sfx('no'); return render(null); }
    LOGIN.busy = true; LOGIN.msg = ''; render(null);
    try {
      const r = await fetch(SUPA.url + '/auth/v1/user', { method: 'PUT', headers: { apikey: SUPA.key, Authorization: 'Bearer ' + RECOVER.at, 'content-type': 'application/json' }, body: JSON.stringify({ password: pass }) });
      const j = await r.json().catch(() => ({})); if (!r.ok) throw { message: j.msg || j.message || ('HTTP ' + r.status), code: j.error_code || '' };
      setAuth({ at: RECOVER.at, rt: RECOVER.rt, exp: RECOVER.exp, uid: j.id, email: j.email }); RECOVER = null;
    } catch (e) { LOGIN.busy = false; LOGIN.msg = /same_password|different/i.test((e.message || '') + (e.code || '')) ? 'Nové heslo musí byť iné ako staré.' : /expired|invalid|JWT|401|403/i.test((e.message || '') + (e.code || '')) ? 'Odkaz už neplatí. Požiadajte o nový.' : authErr(e); sfx('no'); return render(null); }
    try { await supaSync(); } catch (e) { DBREF = SUPADB; }
    LOGIN = { mode: 'in', busy: false, msg: '' }; sfx('coin'); toast('Heslo je zmenené ✓'); boot();
  },
  'auth-newpass-cancel': () => { RECOVER = null; LOGIN = { mode: 'in', busy: false, msg: '' }; boot(); },
  'mail-manage': () => { sfx('tap'); PSEL = DATA.current; PTAB = 'set'; PSET = null; go('parent', {}, 'f'); setTimeout(() => { const b = [...document.querySelectorAll('[data-a="pset"]')].find(x => /Účet a AI/.test(x.textContent)); if (b) b.click(); }, 120); },
  'auth-chmail': () => { const w = document.createElement('div'); w.className = 'over'; w.innerHTML = `<div class="card box"><h2>✉️ Nový e-mail</h2><p class="muted b">Teraz: ${esc(AUTH.email || '')}. Zadajte novú adresu. Na potvrdenie vám príde e-mail.</p><input class="field" id="chm" type="email" inputmode="email" autocapitalize="off" autocomplete="email" placeholder="novy@email.sk" style="width:100%;box-sizing:border-box;font-size:1.05rem;padding:12px;text-align:left"><p class="loginmsg" id="chmmsg"></p><button class="btn primary block" data-a="auth-chmail-go">Poslať potvrdenie</button><button class="btn block" data-a="ov-close">Zavrieť</button></div>`; document.body.appendChild(w); },
  'auth-chmail-go': async (d, el) => { const v = ($('#chm').value || '').trim().toLowerCase(); const m = $('#chmmsg'); if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { m.textContent = 'Zadajte platný e-mail.'; sfx('no'); return; } if (v === (AUTH.email || '').toLowerCase()) { m.textContent = 'To je váš terajší e-mail.'; sfx('no'); return; } el.disabled = true; try { const t = await supaToken(); const r = await fetch(SUPA.url + '/auth/v1/user?redirect_to=' + encodeURIComponent(location.origin + location.pathname), { method: 'PUT', headers: { apikey: SUPA.key, Authorization: 'Bearer ' + t, 'content-type': 'application/json' }, body: JSON.stringify({ email: v }) }); const j = await r.json().catch(() => ({})); if (!r.ok) throw { message: j.msg || j.message || '', code: j.error_code || '', status: r.status }; if (j.email && j.email.toLowerCase() === v) { setAuth({ ...AUTH, email: j.email }); m.className = 'loginmsg ok'; m.textContent = 'E-mail je zmenený ✓'; sfx('ok'); render(null); } else { m.className = 'loginmsg ok'; m.textContent = 'Poslali sme potvrdzovací e-mail. Kliknite na odkaz v ňom (pozrite starú aj novú schránku a spam). Dovtedy platí starý e-mail.'; sfx('ok'); } } catch (e) { el.disabled = false; const x = (e.message || '') + (e.code || '') + (e.status || ''); m.className = 'loginmsg'; m.textContent = /exists|registered|taken/i.test(x) ? 'Tento e-mail už používa iný účet.' : /rate|429/i.test(x) ? 'Teraz sa nedá poslať e-mail. Skúste to o hodinu.' : 'Nepodarilo sa. Skúste to znova.'; sfx('no'); } },
  'auth-switch': async (d, el) => { await ACT['auth-out'](d, el); if (UI.view === 'login') { LOGIN.mode = 'up'; LOGIN.msg = ''; render(null); toast('Odhlásené. Prihláste sa iným e-mailom alebo si vytvorte nový účet.'); } },
  'bear-tap': () => { const p = P(); const b = bearInit(p); const fig = $('.bcfig svg'); if (b.asleep) { bearSay('Psst… Bystrík spí 💤'); return; } BTAP = (BTAP || 0) + 1; const trick = BTAP % 4 === 0 ? 'bflip' : BTAP % 4 === 2 ? 'bspin' : ''; if (trick && fig && !fig.classList.contains('bdance')) { fig.classList.remove('bflip', 'bspin'); void fig.getBoundingClientRect(); fig.classList.add(trick); setTimeout(() => fig.classList.remove(trick), 1100); sfx('level'); if (trick === 'bflip') setTimeout(() => { bearSay('Salto! 🤸'); try { burst(fig, 20); } catch (e) { } }, 600); } else { try { bearJoy(fig); } catch (e) { } } const last = (p.lastEx && Date.now() - p.lastEx.t < 6 * HRS) ? 'Pamätáš? ' + p.lastEx.x : pick(BEAR_PEP); say(last); if ($('#brbub')) bearSay(last); else toast('🧸 ' + last); },
  'bear-feed': (d, el) => { const p = P(); const b = bearInit(p); if (!b.honey) { bearSay('Med zatiaľ nemáš. Dokonči nejaké učenie a dostaneš 🍯'); sfx('no'); return; } b.honey--; b.fed = Date.now(); b.asleep = false; const fig = $('.bcfig svg'); if (fig && el) { const a = el.getBoundingClientRect(), t = fig.getBoundingClientRect(); const j = document.createElement('span'); j.className = 'brfly'; j.textContent = '🍯'; j.style.left = a.left + a.width / 2 + 'px'; j.style.top = a.top + 'px'; j.style.setProperty('--dx', (t.left + t.width / 2 - a.left - a.width / 2) + 'px'); j.style.setProperty('--dy', (t.top + t.height * .55 - a.top) + 'px'); document.body.appendChild(j); setTimeout(() => j.remove(), 800); }
    sfx('pop'); setTimeout(() => { try { bearJoy($('.bcfig svg')); } catch (e) { } bearSay('Mňam, mňam! Ďakujem 🍯'); bearLoveUp(p, 2); setTimeout(() => { if (UI.view === 'home') { const c = $('#bearcorner'); if (c) c.outerHTML = bearCorner(P()); } }, 1500); }, 700); },
  'bear-pet': () => { const p = P(); const b = bearInit(p); if (b.asleep) { bearSay('Psst… Bystrík spí 💤'); return; } try { bearJoy($('.bcfig svg')); } catch (e) { } sfx('pop'); const t = pick(BEAR_PET); bearSay(t); say(t); bearLoveUp(p, 1); },
  'bear-dance': () => { const p = P(); const b = bearInit(p); if (b.asleep) { bearSay('Najprv ma zobuď ☀️'); return; } const fig = $('.bcfig svg'); if (!fig || fig.classList.contains('bdance')) return; fig.classList.add('bdance'); bearSay('Tancujeme! 🎶'); sfx('level'); const sc = $('#brscene'); for (let i = 0; i < 6; i++) setTimeout(() => { if (!sc) return; const n = document.createElement('span'); n.className = 'brnote'; n.textContent = pick(['🎵', '🎶', '✨']); n.style.left = (20 + Math.random() * 60) + '%'; sc.appendChild(n); setTimeout(() => n.remove(), 1600); }, i * 350); setTimeout(() => { fig.classList.remove('bdance'); bearSay('Uf, to bola zábava! 😄'); }, 2600); bearLoveUp(p, 1); },
  'bear-sleep': () => {
    const p = P(); const b = bearInit(p); const room = $('#bearcorner'), sc = $('#brscene'), fig = $('.bcfig svg'); if (room && room.classList.contains('busy')) return;
    const going = !b.asleep; b.asleep = going; if (going) b.slept = Date.now(); bearCare(p); sfx('tap');
    if (!room || !sc || !fig) { render(null); return; }
    room.classList.add('busy'); fig.classList.remove('comfort'); const btn = $('[data-a="bear-sleep"]'); if (btn) btn.innerHTML = going ? '<span>☀️</span>Zobudiť' : '<span>🌙</span>Spať';
    const fin = () => { room.classList.remove('busy'); const e = $('.brst:nth-child(2) .brbar i'); if (e) e.style.width = bearStats(b).energy + '%'; };
    if (going) {
      sc.classList.add('dusk'); bearSay('Slniečko zapadá… 🌅'); setTimeout(() => { fig.classList.add('byawn'); bearSay('Uaaah… som ospalý 🥱'); }, 900);
      setTimeout(() => { fig.classList.remove('byawn'); sc.classList.add('night'); room.className = room.className.replace(/bm-\w+/, 'bm-sleep'); }, 2300);
      setTimeout(() => { sc.classList.remove('dusk'); bearSay('Dobrú noc… 🌙'); applyTheme(true); toast('🌙 Bystrík spí, appka prešla do nočného režimu'); }, 3600);
      setTimeout(() => { bearSay(BEAR_TXT.sleep); fin(); }, 5200);
    } else {
      sc.classList.add('dusk'); sc.classList.remove('night'); room.className = room.className.replace(/bm-\w+/, 'bm-' + bearMood(p)); bearSay('Slniečko vychádza… 🌄'); applyTheme(true);
      setTimeout(() => { if (!bearEve()) sc.classList.remove('dusk'); }, 1800);
      setTimeout(() => { fig.classList.add('bstretch'); bearSay('Dobré ráno! ☀️ Poďme sa učiť!'); sfx('level'); }, 2000);
      setTimeout(() => { fig.classList.remove('bstretch'); fin(); }, 3700);
    }
  },
  'bear-rec': async (d, el) => {
    if (BREC) { try { BREC.mr.stop(); } catch (e) { } return; }
    if (!navigator.mediaDevices || !window.MediaRecorder) { toast('Tu sa mikrofón zapnúť nedá.'); return; }
    let st; try { st = await navigator.mediaDevices.getUserMedia({ audio: true }); } catch (e) { toast('Mikrofón nie je povolený. Rodič ho môže povoliť v prehliadači.'); return; }
    const ch = []; const mr = new MediaRecorder(st); BREC = { mr }; el.classList.add('on'); el.innerHTML = '<span>⏹️</span>Hotovo';
    mr.ondataavailable = e => { if (e.data && e.data.size) ch.push(e.data); };
    mr.onstop = () => { st.getTracks().forEach(t => t.stop()); BREC = null; el.classList.remove('on'); el.innerHTML = '<span>🎤</span>Zopakuj'; const url = URL.createObjectURL(new Blob(ch, { type: mr.mimeType || 'audio/webm' })); const a = new Audio(url); a.preservesPitch = false; a.mozPreservesPitch = false; a.webkitPreservesPitch = false; a.playbackRate = 1.45; const fig = $('.bcfig svg'); if (fig) fig.classList.add('talking'); a.onended = () => { URL.revokeObjectURL(url); if (fig) fig.classList.remove('talking'); }; a.play().catch(() => { }); bearCare(P()); };
    mr.start(); setTimeout(() => { if (BREC && BREC.mr === mr) try { mr.stop(); } catch (e) { } }, 5000);
  },
  'pl-open': d => { const l = plinks()[+d.i]; if (l) openBrowser(l.u, l.n); },
  'pl-reload': () => { const f = $('#mbframe'); if (f) f.src = f.src; },
  'pl-add': () => { const n = ($('#plname').value || '').trim(); let u = ($('#plurl').value || '').trim(); if (u && !/^https?:\/\//i.test(u)) u = 'https://' + u; let ok = false; try { const x = new URL(u); ok = /^https?:$/.test(x.protocol) && x.host.includes('.'); } catch (e) { } if (!ok) { toast('Zadajte platnú adresu stránky.'); sfx('no'); return; } DATA.parent.links = [...(DATA.parent.links || []), { n: n || new URL(u).host, u, i: '🔗' }].slice(0, 12); save(); sfx('pop'); toast('Odkaz pridaný ✓'); render(null); },
  'pl-del': d => { DATA.parent.links = (DATA.parent.links || []).filter((_, i) => i !== +d.i); save(); sfx('tap'); render(null); },
  'auth-login': () => { PARENT_OK = false; go('login', {}, 'f'); },
  'auth-chpass': () => { const w = document.createElement('div'); w.className = 'over'; w.innerHTML = `<div class="card box"><h2>🔑 Nové heslo</h2><p class="muted b">Zadajte nové heslo k účtu ${esc(AUTH.email || '')}.</p><input class="field" id="chp" type="password" autocomplete="new-password" placeholder="Aspoň 6 znakov" style="width:100%;box-sizing:border-box;font-size:1.05rem;padding:12px;text-align:left"><p class="loginmsg" id="chpmsg"></p><button class="btn primary block" data-a="auth-chpass-go">💾 Uložiť heslo</button><button class="btn block" data-a="ov-close">Zrušiť</button></div>`; document.body.appendChild(w); },
  'auth-chpass-go': async (d, el) => { const v = ($('#chp').value || ''); const m = $('#chpmsg'); if (v.length < 6) { m.textContent = 'Heslo musí mať aspoň 6 znakov.'; sfx('no'); return; } el.disabled = true; try { const t = await supaToken(); const r = await fetch(SUPA.url + '/auth/v1/user', { method: 'PUT', headers: { apikey: SUPA.key, Authorization: 'Bearer ' + t, 'content-type': 'application/json' }, body: JSON.stringify({ password: v }) }); const j = await r.json().catch(() => ({})); if (!r.ok) throw { message: j.msg || j.message || '', code: j.error_code || '' }; $$('.over').forEach(e => e.parentNode.removeChild(e)); sfx('ok'); toast('Heslo je zmenené ✓'); } catch (e) { el.disabled = false; m.textContent = /same_password|different/i.test((e.message || '') + (e.code || '')) ? 'Nové heslo musí byť iné ako staré.' : 'Nepodarilo sa. Skúste to znova.'; sfx('no'); } },
  'auth-out': async (d, el) => {
    el.disabled = true; el.textContent = '⏳ Ukladám…';
    try { clearTimeout(syncT); if (DATA.profiles.length) await SUPADB.set({ json: JSON.stringify(DATA), t: DATA.t }); } catch (e) { toast('Bez internetu sa nedá odhlásiť, postup by sa neuložil.'); return render(null); }
    try { fetch(SUPA.url + '/auth/v1/logout', { method: 'POST', headers: { apikey: SUPA.key, Authorization: 'Bearer ' + AUTH.at } }).catch(() => { }); } catch (e) { }
    setAuth(null); DBREF = null; try { localStorage.removeItem('bystrik.owner'); } catch (e) { } resetData(); PARENT_OK = false; go('login', {}, 'u');
  },
  'nav-settings': () => go('settings', {}, 'b'),
  'nav-me': () => go('me', {}, 'b'),
  'cset': d => { CSET = +d.i < 0 ? null : +d.i; sfx('tap'); render(null); scrollTo({ top: 0 }); },
  'aig-start': () => { CHG = { on: 1 }; sfx('pop'); chgStep(); },
  'aig-x': () => chgEnd(),
  'pset': d => { PSET = +d.i < 0 ? null : +d.i; sfx('tap'); render(null); scrollTo({ top: 0 }); },
  'ptab': d => { PSET = null; PTAB = d.t; sfx('tap'); render(null); scrollTo({ top: 0 }); const td = $('.pacc.todo'); if (td) setTimeout(() => td.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150); },
  'set-bg': d => { DATA.settings.bgc = d.c; const c = PAGE_BG.find(x => x[0] === d.c); if (c && c[4]) { DATA.settings.theme = c[4]; applyTheme(); } save(); applyPageBg(); sfx('pop'); render(null); if (c && c[4]) toast(c[4] === 'dark' ? 'Čierne pozadie zapína tmavý režim 🌙' : 'Toto pozadie zapína svetlý režim ☀️'); },
  'ev-practice': () => { const r = UI.params; const ids = [...new Set((r.tlog || []).filter(x => !x.ok && x.id && TOPIC[x.id]).map(x => x.id))]; if (!ids.length) return; sfx('tap'); startQuiz(ids, 'quiz', r.back || { v: 'home', p: {} }, ids.length > 1 ? { seq: Array.from({ length: 10 }, (_, i) => ids[i % ids.length]) } : {}); },
  'review': () => { sfx('tap'); startReview(); },
  'remind-t': d => { DATA.settings.remind = d.t; save(); sfx('tap'); render(null); },
  'remind-add': async () => {
    const t = DATA.settings.remind || '17:00'; const [hh, mm] = t.split(':'); const d = new Date(); const z = n => String(n).padStart(2, '0'); const day = `${d.getFullYear()}${z(d.getMonth() + 1)}${z(d.getDate())}`; const url = location.origin + location.pathname;
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Bystrik//SK', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT', 'UID:bystrik-ucenie-' + day + '@bystrik', 'DTSTAMP:' + day + 'T000000Z', 'DTSTART:' + day + 'T' + hh + mm + '00', 'DURATION:PT15M', 'RRULE:FREQ=DAILY', 'SUMMARY:Bystrík: čas na učenie 🧸', 'DESCRIPTION:Desať minút s Bystríkom. Otvor apku: ' + url, 'URL:' + url, 'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:Bystrík čaká! Poď sa učiť 🧸', 'TRIGGER:PT0M', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    if (IN_ART()) { toast('Pripomienku do kalendára pridáte vo webovej verzii Bystríka (sebastiankoncek88-alt.github.io/bystrik).'); return; }
    await saveFile('bystrik-pripomienka.ics', ics, 'text/calendar'); toast('Súbor stiahnutý. Otvorte ho a potvrďte pridanie do kalendára.');
  },
  'learn-back': () => { try { speechSynthesis.cancel(); } catch (e) { } go('learn', {}, 'b'); },
  'dk-say': () => { sfx('tap'); dkSay(false); }, 'dk-slow': () => { sfx('tap'); dkSay(true); },
  'dk-peek': () => { const el = $('#dkpeek'); if (!el || !DK) return; DK.peeks++; DK.peeked = true; el.textContent = DK.list[DK.i]; el.classList.add('on'); sfx('pop'); setTimeout(() => { el.classList.remove('on'); el.textContent = ''; }, DK.list[DK.i].length > 12 ? 3500 : 2200); },
  'dk-check': () => { if (!DK || DK.done) return; const typed = ($('#dkin').value || '').trim(); if (!typed) { toast('Najprv napíš, čo počuješ.'); sfx('no'); return; } const t = DK.list[DK.i]; const ok = dkNorm(typed) === dkNorm(t); const near = !ok && dkPlain(typed) === dkPlain(t); if (ok) { if (!DK.peeked) DK.ok++; sfx('ok'); try { burst($('.dictbox'), 18); } catch (e) { } } else sfx('no'); const p = P(); p.stats.answered++; if (ok) p.stats.correct++; countDay(ok); DK.done = { ok, near, typed }; render(null); },
  'dk-next': () => { if (!DK) return; DK.i++; DK.done = null; DK.peeked = false; DK.spoken = false; if (DK.i >= DK.list.length) return dkFinish(); render(null); },
  'write-set': d => { sfx('tap'); writeStart(d.s); render(null); },
  'write-clear': () => { const d = $('#wdraw'); if (d) d.getContext('2d').clearRect(0, 0, 340, 340); W.drawn = false; sfx('tap'); },
  'write-done': () => {
    if (W.busy) return; const msg = $('#wmsg'); if (!W.drawn) { msg.textContent = 'Najprv písmeno obtiahni prstom. ✍️'; sfx('no'); return; }
    const sc = wScore(); const good = sc.recall >= .5 && sc.prec >= .55;
    if (good) { W.busy = true; if (!W.tries) W.ok++; W.tries = 0; sfx('ok'); buzz(15); try { burst($('#wdraw'), 18); } catch (e) { } msg.innerHTML = '✅ <b>' + pick(['Krásne!', 'Výborne!', 'Paráda!', 'Presne tak!']) + '</b>'; setTimeout(() => { W.i++; W.busy = false; W.drawn = false; if (W.i >= W.list.length) return writeFinish(); render(null); }, 850); }
    else { W.tries++; sfx('no'); msg.innerHTML = sc.recall < .5 ? 'Skús obtiahnuť <b>celé</b> písmeno.' : 'Skús ostať viac <b>na predlohe</b>.'; if (W.tries >= 3) { msg.innerHTML += ' Nevadí, ideme ďalej.'; W.busy = true; setTimeout(() => { W.i++; W.tries = 0; W.busy = false; W.drawn = false; if (W.i >= W.list.length) return writeFinish(); render(null); }, 1100); } else { const d = $('#wdraw'); setTimeout(() => { d.getContext('2d').clearRect(0, 0, 340, 340); W.drawn = false; }, 700); } }
  },
  'games-back': () => go('games', {}, 'b'),
  'duel-create': () => { sfx('tap'); duelCreate(); render(null); },
  'duel-join': () => { const code = ($('#dcode').value || '').replace(/\D/g, ''); if (code.length !== 4) { D.err = 'Zadaj 4-miestny kód od kamaráta.'; sfx('no'); return render(null); } sfx('tap'); duelJoin(code); render(null); },
  'duel-ans': (d, el) => {
    if (!D || D.st !== 'play' || D.lock) return; D.lock = true; const q = D.qs[D.i]; const ok = q.o[+el.dataset.i] === q.a; if (ok) { D.s++; sfx('ok'); } else sfx('no');
    $$('#dopts .opt').forEach(b => { const v = q.o[+b.dataset.i]; b.classList.add(v === q.a ? 'right' : b === el ? 'wrong' : 'dim'); }); D.ws.say('prog', { i: D.i + 1, s: D.s });
    setTimeout(() => { if (!D) return; D.lock = false; D.i++; if (D.i >= 8) { D.mdone = { s: D.s, ms: Date.now() - D.t0 }; const send = () => D && D.ws && D.ws.say('done', D.mdone); send(); D.rep = setInterval(send, 2000); D.st = 'waitend'; D.to = setTimeout(() => duelMaybeEnd(true), 60000); render(null); duelMaybeEnd(); } else render(null); }, ok ? 500 : 900);
  },
  'duel-quit': () => { if (D && D.ws) D.ws.say('bye', {}); duelClose(); D = null; go('games', {}, 'b'); },
  'duel-again': () => { if (D && D.ws) D.ws.say('bye', {}); duelClose(); D = { st: 'lobby' }; render(null); },
  'lbtab': d => { LBTAB = d.t; sfx('tap'); render(null); },
  'ps-role': d => { PS.name = ($('#psname') || {}).value || PS.name; PS.role = d.r; sfx('tap'); render(null); },
  'ps-goal': d => { PS.goal = +d.n; sfx('tap'); render(null); },
  'ps-next': () => { if (PS.step === 0) { PS.name = ($('#psname').value || '').trim(); if (PS.name.length < 2) { $('#psmsg').textContent = 'Napíšte svoje meno.'; sfx('no'); return; } } PS.step++; sfx('tap'); if (PS.step === 2) { DATA.parent.name = PS.name; DATA.parent.role = PS.role; DATA.parent.goal = PS.goal; save(); } render('f'); },
  'ps-back': () => { if (PS && PS.step > 0) { PS.step--; return render('b'); } const ed = PS && PS.edit; PS = null; go(ed ? 'parent' : (P() ? 'settings' : 'profiles'), {}, 'b'); },
  'ps-done': () => { const ed = PS.edit; PS = null; sfx('ok'); go('parent', {}, 'f'); if (ed) toast('Údaje rodiča uložené ✓'); },
  'ps-edit': () => { PS = { step: 0, name: DATA.parent.name || '', role: DATA.parent.role || 'mama', goal: DATA.parent.goal || 2, edit: true }; go('psetup', {}, 'f'); },
  'getapp-web': () => { try { localStorage.setItem('bystrik.web', '1'); } catch (e) { } boot(); },
  'getapp-install': async () => { if (!A2HS) return; try { A2HS.prompt(); const r = await A2HS.userChoice; if (r && r.outcome === 'accepted') { try { localStorage.setItem('bystrik.web', '1'); } catch (e) { } toast('Bystrík je na ploche 🎉 Otvor ho odtiaľ.'); boot(); return; } } catch (e) { } render(null); },
  'install': async () => { if (!A2HS) return; try { A2HS.prompt(); const r = await A2HS.userChoice; if (r && r.outcome === 'accepted') toast('Bystrík je na ploche 🎉'); } catch (e) { } A2HS = null; render(null); },
  'fr-copy': async () => { const c = P().fc || ''; try { await navigator.clipboard.writeText(c); toast('Kód skopírovaný: ' + c); } catch (e) { toast('Tvoj kód: ' + c); } },
  'fr-add': async (d, el) => {
    const me = P(); const code = ($('#frcode').value || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); const say = (m, ok) => { FR = { ...(FR || {}), msg: m, ok: !!ok }; render(null); };
    if (code.length !== 6) return say('Kód má 6 znakov.'); if (code === me.fc) return say('To je tvoj vlastný kód. 🙂'); if ((FR && FR.list || []).some(f => f.code === code)) return say('Tohto priateľa už máš.'); if ((FR && FR.out || []).some(f => f.code === code)) return say('Žiadosť si už poslal(a). Čaká na potvrdenie.');
    el.disabled = true;
    try { const f = await sb('GET', 'players?select=code,name&code=eq.' + code); if (!f.length) return say('Taký kód neexistuje. Skontroluj ho.'); const wasInc = (FR && FR.inc || []).some(x => x.code === code); me.fblock = (me.fblock || []).filter(c => c !== code); await sb('POST', 'friends', { my_code: me.fc, friend_code: code }, 'resolution=ignore-duplicates,return=minimal'); save(); sfx('gift'); inboxSend(code, wasInc ? 'facc' : 'freq', { from: me.fc, name: me.name }); FR = { ...(FR || {}), msg: wasInc ? f[0].name + ' je teraz tvoj priateľ! 🎉' : 'Žiadosť odoslaná. Počkaj, kým ju ' + f[0].name + ' prijme.', ok: true, at: 0, loading: false }; toast(FR.msg); FTAB = wasInc ? 'friends' : 'req'; await frLoad(); }
    catch (e) { say(e && e.status === 404 ? 'Priatelia ešte nie sú zapnutí.' : 'Nepodarilo sa. Skús to znova.'); }
  },
  'fr-accept': async (d, el) => { const me = P(); el.disabled = true; try { await sb('POST', 'friends', { my_code: me.fc, friend_code: d.c }, 'resolution=ignore-duplicates,return=minimal'); sfx('gift'); try { confetti(60, .4); } catch (e) { } inboxSend(d.c, 'facc', { from: me.fc, name: me.name }); const f = (FR.inc || []).find(x => x.code === d.c); FR = { ...FR, msg: (f ? f.name : 'Kamarát') + ' je teraz tvoj priateľ! 🎉', ok: true, at: 0, loading: false }; toast(FR.msg); FTAB = 'friends'; await frLoad(); } catch (e) { toast('Nepodarilo sa. Skús to znova.'); render(null); } },
  'fr-reject': d => { const me = P(); me.fblock = [...new Set([...(me.fblock || []), d.c])]; save(); sfx('tap'); if (FR) { FR.inc = (FR.inc || []).filter(x => x.code !== d.c); FR.total = Math.max(0, FR.total - 1); FR.msg = ''; } render(null); },
  'fr-cancel': async d => { const me = P(); try { await sb('DELETE', `friends?my_code=eq.${me.fc}&friend_code=eq.${d.c}`); } catch (e) { } if (FR) { FR.out = (FR.out || []).filter(x => x.code !== d.c); FR.msg = ''; } sfx('tap'); render(null); },
  'fr-open': d => { sfx('tap'); go('fchat', { code: d.c }, 'f'); },
  'ftab': d => { FTAB = d.t; if (FR) FR.msg = ''; sfx('tap'); render(null); },
  'duel-invite-go': d => { go('duel', {}, 'u'); setTimeout(() => ACT['duel-invite']({ c: d.c }), 350); },
  'fr-menu': d => { const f = (FR && FR.list || []).find(x => x.code === d.c); const w = document.createElement('div'); w.className = 'over'; w.innerHTML = `<div class="card box"><h2>${esc(f ? f.name : 'Priateľ')}</h2><p class="muted b">Ak priateľa odstrániš, zmizne zo zoznamu a jeho správy sa ti prestanú zobrazovať.</p><button class="btn block" data-a="fr-remove" data-c="${d.c}">🚫 Odstrániť priateľa</button><button class="btn primary block" data-a="ov-close">Zrušiť</button></div>`; document.body.appendChild(w); },
  'fc-say': d => fcSend('text', FC_PRESETS[+d.i]),
  'fc-emo': d => fcSend('text', FC_EMOJI[+d.i]),
  'fc-text': () => { const tx = $('#fctext'); if (!tx) return; const v = tx.value; tx.value = ''; fcSend('text', v); },
  'fc-duel': async () => { if (!FC) return; const to = FC.code; const me = P(); const code = duelCreate(); D.inv = ((FR && FR.list || []).find(f => f.code === to) || {}).name || ''; await fcSend('duel', code); inboxSend(to, 'invite', { from: me.fc, name: me.name, code }); go('duel', {}, 'u'); },
  'fc-join': d => { const code = String(d.c || '').replace(/\D/g, ''); if (code.length !== 4) return; $$('.over').forEach(e => e.remove()); sfx('tap'); duelJoin(code); go('duel', {}, 'u'); },
  'duel-invite': async d => { const me = P(); const f = (FR && FR.list || []).find(x => x.code === d.c); if (!f) return; sfx('tap'); const code = duelCreate(); D.inv = f.name; render(null); try { await sb('POST', 'messages', { from_code: me.fc, to_code: f.code, kind: 'duel', body: code }, 'return=minimal'); } catch (e) { } inboxSend(f.code, 'invite', { from: me.fc, name: me.name, code }); },
  'fc-menu': () => { if (FC) return ACT['fr-menu']({ c: FC.code }); const w = document.createElement('div'); w.className = 'over'; w.innerHTML = `<div class="card box"><h2>Priateľ</h2><p class="muted b">Ak priateľa odstrániš, zmizne zo zoznamu a jeho správy sa ti prestanú zobrazovať.</p><button class="btn block" data-a="fr-remove">🚫 Odstrániť priateľa</button><button class="btn primary block" data-a="ov-close">Zrušiť</button></div>`; document.body.appendChild(w); },
  'fr-remove': async d => { const code = (d && d.c) || (FC && FC.code); if (!code) return; const me = P(); me.fblock = [...new Set([...(me.fblock || []), code])]; save(); try { await sb('DELETE', `friends?my_code=eq.${me.fc}&friend_code=eq.${code}`); } catch (e) { } $$('.over').forEach(e => e.remove()); if (FR) FR.at = 0; go('friends', {}, 'b'); toast('Priateľ odstránený.'); },
  'ai-limit': d => { DATA.settings.aiLimit = +d.n; save(); sfx('tap'); toast('Denný limit AI: ' + fmt(+d.n) + ' tokenov'); render(null); },
  'ai-del': () => { setApiKey(''); toast('AI kľúč odstránený.'); render(null); },
  'ai-test': async (d, el) => { el.disabled = true; el.textContent = '⏳ Testujem…'; try { const s2 = await getSample(); const r = await s2('Odpovedz po slovensky jednou krátkou vetou: pozdrav dieťa.', { cache: false }); toast('✅ Funguje! Bystrík hovorí: ' + r.text.slice(0, 80)); } catch (e) { toast(e && e.code === 'ai_limit' ? '⏳ Denný limit AI je vyčerpaný. Zvýšte ho nižšie alebo počkajte do zajtra.' : e && e.code === 'not_granted' ? '❌ Kľúč nie je platný. Skontrolujte ho.' : e && e.code === 'no_credit' ? '❌ Na účte chýba kredit (Billing).' : e && e.code === 'rate_limited' ? '⏳ Dnešný limit je minutý alebo príliš veľa požiadaviek. Skúste neskôr.' : '❌ Nepodarilo sa: ' + ((e && e.message) || 'chyba')); } render(null); },
  'priv-back': () => go(PARENT_OK ? 'parent' : 'settings', {}, 'b'), 'priv-back-login': () => go('login', {}, 'b'),
  'del-ask': () => { DELACC = 1; sfx('tap'); render(null); }, 'del-no': () => { DELACC = 0; render(null); },
  'del-yes': async (d, el) => { const v = (($('#delconf') || {}).value || '').trim().toUpperCase(); if (v !== 'ZMAZAŤ' && v !== 'ZMAZAT') { toast('Napíšte slovo ZMAZAŤ.'); sfx('no'); return; } el.disabled = true; el.textContent = '⏳ Mažem…'; await deleteAccount(); },
  'teacher': () => { TC = null; sfx('tap'); go('teacher', {}, 'f'); },
  'tc-back': () => go('parent', {}, 'b'),
  'tc-reload': () => { TC = TC ? { ...TC, loading: false } : null; tcLoad(); },
  'tc-sel': d => { TC.sel = d.c || null; TC.loading = true; sfx('tap'); render(null); tcLoad(); },
  'tc-copy': async d => { try { await navigator.clipboard.writeText(d.c); toast('Kód triedy skopírovaný: ' + d.c); } catch (e) { toast('Kód triedy: ' + d.c); } },
  'tc-new': async (d, el) => { const n = ($('#tcname').value || '').trim().slice(0, 30); if (!n) { toast('Napíšte názov triedy.'); return; } el.disabled = true; let ok = false; for (let i = 0; i < 4 && !ok; i++) { try { const code = clsCode(); await sb('POST', 'classes', { code, name: n, owner: AUTH.uid }, 'return=minimal'); ok = true; TC.sel = code; } catch (e) { if (e.code !== '23505') { toast('Triedu sa nepodarilo vytvoriť.'); break; } } } el.disabled = false; if (ok) { sfx('pop'); tcLoad(); } },
  'tc-kick': async d => { if (!confirm('Odstrániť žiaka z triedy?')) return; try { await sb('DELETE', 'class_members?class_code=eq.' + TC.sel + '&player_code=eq.' + d.p); tcLoad(); } catch (e) { toast('Nepodarilo sa.'); } },
  'tc-delcls': async d => { if (!confirm('Naozaj zrušiť triedu? Žiaci z nej vypadnú.')) return; try { await sb('DELETE', 'class_members?class_code=eq.' + d.c); } catch (e) { } try { await sb('DELETE', 'classes?code=eq.' + d.c); TC.sel = null; tcLoad(); } catch (e) { toast('Nepodarilo sa.'); } },
  'cls-join': async (d, el) => { const p = P(); const c = ($('#clscode').value || '').trim().toUpperCase(); if (!/^[A-Z0-9]{6}$/.test(c)) { toast('Kód triedy má 6 znakov.'); sfx('no'); return; } el.disabled = true;
    try { const f = await sb('GET', 'classes?select=code,name&code=eq.' + c); if (!f.length) { toast('Taká trieda neexistuje. Skontroluj kód.'); sfx('no'); el.disabled = false; return; } if (!p.fc) fcode(p); await playersPush(); await sb('POST', 'class_members', { class_code: c, player_code: p.fc }, 'resolution=ignore-duplicates,return=minimal'); p.cls = [...new Set([...(p.cls || []), c])]; save(); sfx('win'); toast('Si v triede ' + f[0].name + '! 🎉'); MYCLS = null; render(null); }
    catch (e) { toast(e && e.status === 404 ? 'Triedy ešte nie sú zapnuté.' : 'Nepodarilo sa pridať.'); el.disabled = false; } },
  'cls-leave': async d => { const p = P(); try { await sb('DELETE', 'class_members?class_code=eq.' + d.c + '&player_code=eq.' + p.fc); } catch (e) { } p.cls = (p.cls || []).filter(x => x !== d.c); save(); MYCLS = null; render(null); },
  'wk-share': async () => { const p = DATA.profiles.find(x => x.id === PSEL) || P(); const t = wkText(p); try { if (navigator.share) { await navigator.share({ title: 'Bystrík – týždeň: ' + p.name, text: t }); return; } } catch (e) { if (e && e.name === 'AbortError') return; } try { await navigator.clipboard.writeText(t); toast('Report skopírovaný – môžete ho vložiť do správy.'); } catch (e) { location.href = 'mailto:?subject=' + encodeURIComponent('Bystrík – týždeň: ' + p.name) + '&body=' + encodeURIComponent(t); } },
  'pm-open': d => { if (!PM) return; PM.sel = PM.sel === d.c ? null : d.c; sfx('tap'); render(null); },
  'pm-reload': () => { PM = null; render(null); },
  'sc-save': () => { const p = DATA.profiles.find(x => x.id === PSEL); p.school = $('#sc-topic').value || null; save(); sfx('pop'); toast(p.school ? 'Uložené. Pokračuj ju bude uprednostňovať.' : 'Téma zo školy zrušená.'); render(null); },
  'pt-add': () => { const p = DATA.profiles.find(x => x.id === PSEL); p.ptasks = p.ptasks || []; if (p.ptasks.filter(t => !t.done).length >= 3) { toast('Naraz môžu byť najviac 3 aktívne úlohy.'); return; } p.ptasks.unshift({ id: 'pt' + Date.now().toString(36), topic: $('#pt-topic').value, stars: +$('#pt-stars').value, coins: +$('#pt-coins').value, t: Date.now(), done: 0 }); if (p.ptasks.length > 20) p.ptasks.length = 20; save(); sfx('pop'); toast('Úloha zadaná ✓ Dieťa ju uvidí na domovskej obrazovke.'); render(null); },
  'pt-del': d => { const p = DATA.profiles.find(x => x.id === PSEL); p.ptasks = (p.ptasks || []).filter(t => t.id !== d.id); save(); render(null); },
  'pt-go': d => { sfx('tap'); const t = TOPIC[d.id]; startQuiz([d.id], 'quiz', { v: 'home', p: {} }); },
  'remote-open': async () => { try { const o = await readBackup($('#rmcode').value); const data = o.data || o; if (!data || !Array.isArray(data.profiles) || !data.profiles.length) throw new Error('bad'); VIEWDATA = JSON.parse(JSON.stringify(data)); VIEWDATA._at = o.t || Date.now(); const saved = DATA; DATA = VIEWDATA; try { DATA.profiles.forEach(migrate); } finally { DATA = saved; } PSEL_SAVED = PSEL; PSEL = VIEWDATA.current; go('remote', {}, 'f'); } catch (e) { sfx('no'); toast('Tento kód sa nedá prečítať. Skontrolujte, či je celý.'); } },
  'remote-close': () => { VIEWDATA = null; PSEL = PSEL_SAVED || DATA.current; go('parent', {}, 'b'); },
  'p-glimit': d => { DATA.settings.gameLimit = +d.n; save(); sfx('tap'); toast(+d.n ? `Minihry: ${d.n}× za deň ✓` : 'Minihry bez limitu ✓'); render(null); },
  'ov-learn': () => { const o = $('.over'); if (o) o.parentNode.removeChild(o); go('learn', {}, 'f'); },
  'p-gift': (d, el) => { const p = DATA.profiles.find(x => x.id === PSEL); if (giftsToday(p) >= 2 || ![5, 10, 15, 20].includes(+d.n)) { sfx('no'); toast('Dnes ste už odmenili 2×. Skúste zajtra.'); return; } p.coins = (p.coins || 0) + (+d.n); p.log.unshift({ t: Date.now(), k: 'gift', id: null, c: +d.n, n: 0 }); save(); burst(el, 30); sfx('coin'); toast(`Dieťa dostalo ${d.n} slniečok 🎁`); render(null); },
  'voice-test': () => say('Ahoj! Čítam mäkčene, dĺžne aj vety. Ďakujem, že sa učíš. Výborne!'),
  'pdel-ask': () => { PDEL = true; render(null); }, 'pdel-no': () => { PDEL = false; render(null); },
  'pdel-yes': () => { DATA.profiles = DATA.profiles.filter(p => p.id !== PSEL); if (DATA.current === PSEL) DATA.current = DATA.profiles[0]?.id || null; PSEL = DATA.current; PDEL = false; save(); if (!DATA.profiles.length) { PARENT_OK = false; return boot(); } render(null); },
  ask: d => askBot(d.q),
  'note-cam': () => { const f = $('#notecam'); if (f) f.click(); }, 'note-pick': () => { const f = $('#notepick'); if (f) f.click(); },
  'note-quiz': d => { const n = (P().notes || []).find(x => x.id === d.id); if (!n) return; noteTopic(n); startQuiz(['note-' + n.id], 'quiz', { v: 'notes', p: {} }, { total: Math.min(10, n.qs.length) }); },
  'note-test': d => { const n = (P().notes || []).find(x => x.id === d.id); if (!n) return; noteTopic(n); startQuiz(['note-' + n.id], 'test', { v: 'notes', p: {} }, { total: Math.min(10, n.qs.length) }); },
  'note-del': d => { const p = P(); p.notes = (p.notes || []).filter(x => x.id !== d.id); save(); render(null); },
  parea: d => { PAREA = d.k; sfx('tap'); render(null); },
  theme: d => { const bc = PAGE_BG.find(x => x[0] === DATA.settings.bgc); if (bc && bc[4] && bc[4] !== d.t) DATA.settings.bgc = 'auto'; DATA.settings.theme = d.t; save(); applyTheme(); sfx('pop'); render(null); },
  'tour-again': () => { go('home', {}, 'b'); setTimeout(() => showGuide(TOUR, 0, endTour), 700); },
  shopcat: d => { SHOPCAT = d.c; SHOPSEL = null; sfx('tap'); render(null); },
  'shop-prev': d => { const it = itemOf(d.c, d.i); SHOPSEL = it.sid; sfx('pop'); render(null); const e = $('#shopprev'); if (e) e.scrollIntoView({ behavior: 'smooth', block: 'center' }); },
  'shop-prev-x': () => { SHOPSEL = null; sfx('tap'); render(null); },
  'buy-ask': d => { const p = P(); const it = itemOf(d.c, d.i); if ((p.coins || 0) < it.price) { sfx('no'); toast(`Chýba ti ešte ${it.price - (p.coins || 0)} slniečok. Uč sa a zbieraj! 🪙`); return; } SHOPSEL = it.sid; sfx('tap'); render(null); },
  buy: (d, el) => { const p = P(); if (!learnedToday(p)) { sfx('no'); toast(SHOP_LOCK_MSG); return; } const it = itemOf(d.c, d.i); if ((p.coins || 0) < it.price || p.owned.includes(it.sid)) return; p.coins -= it.price; p.owned.push(it.sid); p.av[d.c] = it.id; if (d.c === 'bottom' && ['saty', 'princezna', 'astronaut'].includes(p.av.top)) p.av.top = 'tricko'; save(); sfx('gift'); buzz([30, 40, 30]); burst(el, 40); confetti(90, .4); toast(`Kúpené a oblečené: ${it.n}! 🎉`); render(null); celebrateWear($('#shopprev .spfig'), p.av); },
  'shop-wear': d => { const p = P(); p.av[d.c] = d.i; if (d.c === 'bottom' && ['saty', 'princezna', 'astronaut'].includes(p.av.top)) p.av.top = 'tricko'; save(); sfx('pop'); toast('Oblečené ✓'); render(null); celebrateWear($('#shopprev .spfig'), p.av); },
  'mystery': () => { const p = P(); if (!learnedToday(p)) { sfx('no'); toast(SHOP_LOCK_MSG); return; } if (!((p.keys || 0) > 0)) { sfx('no'); toast('Zatiaľ nemáš kľúč 🔑. Získaš ho za splnenú dennú cestu alebo test aspoň na 2 hviezdy.'); return; } const w = mysteryRoll(p); if (!w) { toast('Máš už všetky veci! 🏆'); return; } p.keys--; p.owned.push(w[1].sid); save(); render(null); openMystery(...w); },
  'myst-wear': (d, el) => { const p = P(); const it = itemOf(d.c, d.i); p.av[d.c] = it.id; if (d.c === 'bottom' && ['saty', 'princezna', 'astronaut'].includes(p.av.top)) p.av.top = 'tricko'; save(); el.closest('.rowbtns').innerHTML = '<button class="btn primary block" data-a="ov-close">Paráda! 😎</button>'; const mc = $('.myov .mycard'); if (mc) mc.hidden = true; const mf = $('.myov .myfig'); if (mf) { mf.innerHTML = avatarSvg(p.av, { noBg: true }); celebrateWear(mf, p.av); } },
  'rd-grade': d => { RDG = +d.g; sfx('tap'); render(null); },
  'rd-open': d => { RD = { id: d.id, opts: {}, ans: {}, correct: 0 }; sfx('tap'); go('read', {}, 'f'); },
  'rd-back': () => { if (REC && RD.recording) { try { REC.mr.stop(); } catch (e) { } } RD = null; go('reads', {}, 'b'); },
  'rd-say': () => say(READ[RD.id].text),
  'tut-say': () => { if (GUIDE) say(GUIDE.cur); }, 'tut-open': () => showTut(0), 'tut-skip': () => { const g = GUIDE; GUIDE = null; (g ? g.end : endTut)(); }, 'tut-next': d => { const i = +d.i; const g = GUIDE || { steps: TUT, end: endTut }; if (i >= g.steps.length) { GUIDE = null; g.end(); } else showGuide(g.steps, i, g.end); },
  'pguide': () => { sfx('tap'); go('home', {}, 'f'); setTimeout(() => showGuide(PGUIDE, 0, endPGuide), 350); },
  'a2hs-hide': () => { DATA.a2hsHide = 1; save(); render(null); },
  'ptour': () => { PTAB = 'over'; render(null); scrollTo(0, 0); setTimeout(() => showGuide(PTOUR, 0, endPTour), 250); },
  'rec-start': () => recStart(), 'dikt-open': () => openDiktafon(), 'mic-retry': () => { closeSheet(); MIC_BLOCKED = false; render(null); recStart(); },
  'rec-pick': () => { closeSheet(); const f = $('#recfile'); if (f) f.click(); },
  'rec-stop': () => { if (REC && REC.mr.state !== 'inactive') REC.mr.stop(); },
  'rec-again': () => { RD.blobUrl = null; RD.blob = null; RD.saved = false; render(null); if (!MIC_BLOCKED) recStart(); },
  'rd-done': (d, el) => { const p = P(); p.readings.unshift({ id: 'rd' + Date.now().toString(36), r: RD.id, t: Date.now(), rating: null, noAudio: true }); if (p.readings.length > 60) p.readings.length = 60; RD.done = true; if (!RD.recXp) { RD.recXp = true; gain(p, 20); floatXp(el, '+20'); } burst(el, 40); logAct('read', null, 1, 1); touchStreak(p); save(); sfx('coin'); render(null); },
  'rec-save': async (d, el) => { const p = P(); const id = 'rec' + Date.now().toString(36); try { await idbOp('readwrite', st => st.put({ id, pid: p.id, r: RD.id, t: Date.now(), blob: RD.blob })); p.readings.unshift({ id, r: RD.id, t: Date.now(), rating: null }); if (p.readings.length > 60) p.readings.length = 60; RD.saved = true; if (!RD.recXp) { RD.recXp = true; gain(p, 20); floatXp(el, '+20'); } logAct('read', null, 1, 1); touchStreak(p); save(); sfx('coin'); burst(el); toast('Nahrávka uložená. Rodič si ju vypočuje 🎧'); render(null); } catch (e) { toast('Nahrávku sa nepodarilo uložiť v tomto prehliadači.'); } },
  'rd-ans': (d, el) => { const qi = +d.q; if (RD.ans[qi] !== undefined) return; const [, a] = READ[RD.id].q[qi].split('|'); RD.ans[qi] = d.o; const ok = d.o === a; const p = P(); p.stats.answered++; countDay(ok); if (ok) { RD.correct++; p.stats.correct++; bump('correct'); sfx('ok'); burst(el); } else sfx('no'); save(); render(null); },
  'rd-finish': (d, el) => { const p = P(); const before = p.xp; const g = 10 + RD.correct * 10; gain(p, g); logAct('readq', null, RD.correct, READ[RD.id].q.length); touchStreak(p); checkBadges(p); save(); go('result', { kind: 'read', correct: RD.correct, total: READ[RD.id].q.length, xp: g, bonus: 0, before, after: p.xp, back: { v: 'reads', p: {} } }, 'u'); },
  'play-rec': async d => { const box = $('#aud-' + d.id); if (!box) return; try { const o = await idbOp('readonly', st => st.get(d.id)); if (!o) { box.innerHTML = '<span class="muted b">Nahrávka je uložená v inom zariadení alebo bola vymazaná.</span>'; return; } box.innerHTML = `<audio controls autoplay src="${URL.createObjectURL(o.blob)}" style="width:100%"></audio>`; } catch (e) { box.innerHTML = '<span class="muted b">Nahrávku sa nepodarilo načítať.</span>'; } },
  'reward-rec': d => { const p = DATA.profiles.find(x => x.id === PSEL); const r = p && p.readings.find(x => x.id === d.id); if (!r || r.rewarded) return; r.rewarded = true; p.xp += 5; p.log.unshift({ t: Date.now(), k: 'rread', id: null, c: 5, n: 0 }); save(); sfx('ok'); toast('🎁 Odmena pridaná: +5 bodov'); render(null); },
  'rate-rec': d => { const p = DATA.profiles.find(x => x.id === PSEL); const r = p.readings.find(x => x.id === d.id); if (r) { r.rating = +d.r; save(); toast('Hodnotenie uložené ✓'); render(null); } },
  'del-rec': async d => { const p = DATA.profiles.find(x => x.id === PSEL); p.readings = p.readings.filter(x => x.id !== d.id); save(); try { await idbOp('readwrite', st => st.delete(d.id)); } catch (e) { } render(null); },
  'room-back': () => { sfx('tap'); go('wardrobe', {}, 'b'); },
  'room-page': () => { const p = P(); p.room.page = !p.room.page; save(); render(null); sfx('tap'); },
  petname: () => { const p = P(); const v = ($('#petname').value || '').trim(); p.av.petName = v && v !== itemOf('pet', p.av.pet).n ? v : ''; save(); toast(`Tvoje zvieratko sa volá ${petName(p.av)} ✓`); sfx('pop'); },
  'ds-tab': d => { DS.tab = d.t; sfx('tap'); const b = $('#dsgn'); if (b) b.innerHTML = designerHTML(); },
  'ds-add': d => { const it = STICKERS[+d.i]; if (!unlocked(it, DS.lockP)) { sfx('no'); toast(`🔒 Odomkneš: ${lockLabel(it)}`); return; } if (DS.room.stickers.length >= 16) { toast('Viac nálepiek sa už nezmestí. Niektorú zmaž.'); return; } DS.room.stickers.push({ e: it.e, x: R(12, 88), y: R(10, 70), s: 1, r: R(-15, 15) }); DS.sel = DS.room.stickers.length - 1; sfx('pop'); buzz(10); dsRefresh(); const el = $(`#designer .stk[data-i="${DS.sel}"]`); if (el) el.animate([{ transform: 'translate(-50%,-50%) scale(0)' }, { transform: 'translate(-50%,-50%) scale(1.3)' }, { transform: `translate(-50%,-50%) rotate(var(--r)) scale(var(--s))` }], { duration: 450, easing: 'cubic-bezier(.3,1.6,.5,1)' }); },
  'ds-theme': d => { const t = themeOf(d.i); if (!unlocked(t, DS.lockP)) { sfx('no'); toast(`🔒 Odomkneš: ${lockLabel(t)}`); return; } DS.room.theme = d.i; sfx('pop'); dsRefresh(); },
  'ds-pat': d => { DS.room.pat = d.i; sfx('pop'); dsRefresh(); },
  'ds-int': d => { DS.room.int = d.i; sfx('pop'); dsRefresh(); },
  'ds-desel': (d, el, e) => { if (e.target.closest('.stk')) return; if (DS.sel !== null) { DS.sel = null; const b = $('#dsgn'); if (b) b.innerHTML = designerHTML(); } },
  'ds-tool': d => { const s = DS.room.stickers[DS.sel]; if (!s) return; if (d.t === 'plus') s.s = Math.min(2.6, +(s.s + .25).toFixed(2)); if (d.t === 'minus') s.s = Math.max(.5, +(s.s - .25).toFixed(2)); if (d.t === 'rot') s.r = (s.r + 20) % 360; if (d.t === 'del') { DS.room.stickers.splice(DS.sel, 1); DS.sel = null; } sfx('tap'); dsRefresh(); }
};
function newProfile(name, gender, grade, av) { const p = { id: 'p' + Date.now().toString(36), name, grade, av: { ...av, gender }, xp: 0, stats: {}, topics: {}, badges: [], streak: {}, dailyDone: '', created: Date.now() }; migrate(p); return p; }
function closeSheet() { const w = $('#sheetwrap'); if (w) w.remove(); document.body.classList.remove('calcopen'); }
function bearJoy(svg) { if (!svg) return; svg.classList.remove('bhappy'); void svg.getBoundingClientRect(); svg.classList.add('bhappy'); setTimeout(() => svg.classList.remove('bhappy'), 1300); const r = svg.getBoundingClientRect(); for (let i = 0; i < 5; i++) { const h = document.createElement('span'); h.className = 'bheart'; h.textContent = pick(['💛', '💖', '⭐', '✨', '💜']); h.style.left = (r.left + r.width * (.2 + Math.random() * .6)) + 'px'; h.style.top = (r.top + r.height * .3) + 'px'; h.style.setProperty('--dx', ((Math.random() - .5) * 90) + 'px'); h.style.animationDelay = (i * 70) + 'ms'; document.body.appendChild(h); setTimeout(() => h.remove(), 1500); } sfx('pop'); }
document.addEventListener('pointerdown', e => { const bear = e.target.closest('svg.bear'); if (bear) bearJoy(bear); });
document.addEventListener('pointerdown', e => { const b = e.target.closest('.btn,.opt,.key,.chip,.mp,.bin,.mi2'); if (!b || matchMedia('(prefers-reduced-motion: reduce)').matches) return; const r = b.getBoundingClientRect(); const sz = Math.max(r.width, r.height); const sp = document.createElement('span'); sp.className = 'ripple'; sp.style.cssText = `width:${sz}px;height:${sz}px;left:${e.clientX - r.left - sz / 2}px;top:${e.clientY - r.top - sz / 2}px`; b.appendChild(sp); setTimeout(() => sp.remove(), 550); });
document.addEventListener('pointerdown', e => { const el = e.target.closest('.btn,.press,.nav button,.chip'); if (!el || el.closest('.designer') || matchMedia('(prefers-reduced-motion: reduce)').matches) return; const r = document.createElement('i'); r.className = 'tapfx'; r.style.left = e.clientX + 'px'; r.style.top = e.clientY + 'px'; document.body.appendChild(r); setTimeout(() => r.remove(), 520); }, { passive: true });
document.addEventListener('click', e => { const el = e.target.closest('[data-a]'); if (!el) return; ac(); const f = ACT[el.dataset.a]; if (f) { e.preventDefault(); f(el.dataset, el, e); } });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeSheet(); return; }
  if (UI.view === 'pin' && /^\d$/.test(e.key)) return pinKey(e.key);
  if (UI.view === 'quiz' && Q && !Q.answered && Q.cur.input) { if (/^\d$/.test(e.key)) ACT.key({ k: e.key }); else if (e.key === 'Backspace') ACT.key({ k: 'del' }); else if (e.key === 'Enter') ACT.key({ k: 'ok' }); }
  else if (UI.view === 'quiz' && $('#fb') && e.key === 'Enter') nextStep();
  else if (e.target.id === 'flip' && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); ACT.flip(); }
});
