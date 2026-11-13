/* ===== Odznaky ===== */
const starsIn = (p, k) => Object.entries(p.topics).filter(([id]) => TOPIC[id] && TOPIC[id].s === k).reduce((a, [, v]) => a + (v.stars || 0), 0);
const ACH = [
  { id: 'spravne', i: '✔️', n: 'Šikovná hlávka', d: 'Správne odpovede', m: p => p.stats.correct, t: [50, 250, 1000] },
  { id: 'kvizy', i: '❓', n: 'Kvízový majster', d: 'Dokončené kvízy', m: p => p.stats.quizzes, t: [5, 25, 100] },
  { id: 'perfekt', i: '💎', n: 'Bez chyby', d: 'Kvízy na 10 z 10', m: p => p.stats.perfect, t: [1, 5, 20] },
  { id: 'seria', i: '🔥', n: 'Vytrvalec', d: 'Dni po sebe', m: p => p.streak.best || 0, t: [3, 7, 30] },
  { id: 'hviezdy', i: '⭐', n: 'Zberateľ hviezd', d: 'Hviezdy spolu', m: p => Object.values(p.topics).reduce((a, v) => a + (v.stars || 0), 0), t: [10, 50, 150] },
  { id: 'matika', i: '🔢', n: 'Matikár', d: 'Hviezdy z matematiky', m: p => starsIn(p, 'mat'), t: [10, 40, 90] },
  { id: 'slovina', i: '📝', n: 'Slovinár', d: 'Hviezdy zo slovenčiny', m: p => starsIn(p, 'sjl'), t: [10, 40, 90] },
  { id: 'prehlad', i: '🌍', n: 'Objaviteľ sveta', d: 'Hviezdy z prehľadu', m: p => starsIn(p, 'prv'), t: [10, 40, 90] },
  { id: 'citanie', i: '📖', n: 'Čitateľ', d: 'Prečítané texty', m: p => (p.readings || []).length, t: [1, 10, 30] },
  { id: 'karty', i: '🃏', n: 'Kartičkár', d: 'Zvládnuté kartičky', m: p => p.stats.cards, t: [30, 150, 500] },
  { id: 'spajacky', i: '🔗', n: 'Spájač', d: 'Spájačky a pexesá', m: p => p.stats.match + p.stats.pexeso, t: [5, 25, 75] },
  { id: 'hry', i: '🎮', n: 'Hráč', d: 'Odohrané minihry', m: p => p.stats.games, t: [5, 25, 75] },
  { id: 'rychlik', i: '⚡', n: 'Bleskový', d: 'Najviac správnych za minútu', m: p => p.stats.bestTime, t: [10, 15, 20] },
  { id: 'ulohy', i: '✅', n: 'Plnič úloh', d: 'Splnené denné úlohy', m: p => p.stats.tasks, t: [5, 30, 100] },
  { id: 'denne', i: '🎯', n: 'Denný hrdina', d: 'Splnené denné výzvy', m: p => p.stats.daily, t: [3, 15, 50] },
  { id: 'level', i: '👑', n: 'Na vrchole', d: 'Dosiahnutý level', m: p => levelInfo(p.xp).L, t: [5, 10, 20] },
  { id: 'moda', i: '👗', n: 'Módny návrhár', d: 'Zmeny v šatníku', m: p => p.stats.style, t: [15, 60, 200] },
  { id: 'nakupy', i: '🛍️', n: 'Zberateľ', d: 'Veci kúpené v obchode', m: p => (p.owned || []).length, t: [1, 5, 15] }
];
const MEDAL = ['🥉', '🥈', '🥇'], ACH_COINS = [10, 25, 50];
function achTier(p, a) { const v = a.m(p) || 0; let t = 0; a.t.forEach((x, i) => { if (v >= x) t = i + 1; }); return t; }
function checkBadges(p) {
  p.ach = p.ach || {}; const got = [];
  for (const a of ACH) { const t = achTier(p, a); const was = p.ach[a.id] || 0; if (t > was) { for (let k = was; k < t; k++) { p.coins = (p.coins || 0) + ACH_COINS[k]; got.push([a, k]); } p.ach[a.id] = t; } }
  got.forEach(([a, k], i) => setTimeout(() => achPop(a, k), 900 + i * 3700));
}
function achPop(a, k, custom) {
  const d = document.createElement('div'); d.className = 'achpop'; d.innerHTML = custom ? `<span class="am">🎉</span><div><span class="eyebrow">Výborne!</span><b>${a.i} ${a.n}</b><span>${a.d} · +${custom} ${COIN}</span></div>` : `<span class="am">${MEDAL[k]}</span><div><span class="eyebrow">Nový úspech!</span><b>${a.i} ${a.n}</b><span>${a.d}: ${a.t[k]} · +${ACH_COINS[k]} ${COIN}</span></div>`;
  document.body.appendChild(d); sfx('level'); buzz([20, 40, 20]); confetti(70, .12); setTimeout(() => d.classList.add('out'), 3000); setTimeout(() => d.remove(), 3600);
}

/* uloženie súboru: v artefakte cez schválenie (downloads), na webe obyčajným odkazom */
const IN_ART = () => !!(window.claude && window.claude.use);
async function saveFile(name, text, type) {
  if (IN_ART()) { try { const dl = await window.claude.use('downloads'); if (!dl) { toast('Ukladanie súborov tu nie je dostupné.'); return false; } await dl.save({ filename: name, data: new Blob([text], { type }) }); return true; } catch (e) { if (!(e && e.code === 'declined')) toast('Súbor sa nepodarilo uložiť.'); return false; } }
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000); return true;
}
