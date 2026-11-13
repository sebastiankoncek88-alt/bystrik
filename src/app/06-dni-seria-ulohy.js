/* ===== Dni, séria, úlohy, denné odmeny ===== */
const dkey = d => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
const today = () => dkey(new Date());
const weekId = () => { const d = new Date(); d.setDate(d.getDate() - (d.getDay() + 6) % 7); return dkey(d); };
const daysAgo = n => { const d = new Date(); d.setDate(d.getDate() - n); return dkey(d); };
function touchStreak(p) {
  const t = today(); if (p.streak.last === t) return;
  const before = p.streak.best || 0;
  p.streak.count = p.streak.last === daysAgo(1) ? p.streak.count + 1 : 1; p.streak.last = t; p.streak.best = Math.max(before, p.streak.count);
  if (p.streak.count > 1) setTimeout(() => { fxFire(p.streak.count); sfx('coin'); }, 400);
  const fresh = streakRewards(p.av.gender).filter(([, it]) => it.streak > before && it.streak <= p.streak.best);
  if (fresh.length) PENDING.push({ title: `Séria ${p.streak.best} dní!`, sub: 'Za to, že sa učíš každý deň, máš darček:', rw: fresh, num: '🔥' });
}
const TASKS = [
  { id: 'q1', n: 'Dokonči 1 kvíz', k: 'quizzes', t: 1, xp: 20, i: '❓' }, { id: 'q2', n: 'Dokonči 2 kvízy', k: 'quizzes', t: 2, xp: 35, i: '❓' },
  { id: 'c15', n: 'Odpovedz správne na 15 otázok', k: 'correct', t: 15, xp: 30, i: '✔️' }, { id: 'c30', n: 'Odpovedz správne na 30 otázok', k: 'correct', t: 30, xp: 45, i: '✔️' },
  { id: 'g1', n: 'Zahraj si minihru', k: 'games', t: 1, xp: 20, i: '🎮' }, { id: 'g2', n: 'Zahraj si 2 minihry', k: 'games', t: 2, xp: 30, i: '🎮' },
  { id: 'k10', n: 'Prejdi 10 kartičiek', k: 'cards', t: 10, xp: 25, i: '🃏' }, { id: 'm1', n: 'Dokonči spájačku alebo pexeso', k: 'match', t: 1, xp: 25, i: '🔗' },
  { id: 's3', n: 'Získaj 3 hviezdy v kvíze', k: 'stars3', t: 1, xp: 40, i: '⭐' }, { id: 'd1', n: 'Splň dennú výzvu', k: 'daily', t: 1, xp: 30, i: '🎯' },
  { id: 'mat', n: 'Vyrieš 10 príkladov z matiky', k: 'mat', t: 10, xp: 25, i: '🔢' }, { id: 'sjl', n: 'Odpovedz na 10 otázok zo slovenčiny', k: 'sjl', t: 10, xp: 25, i: '📝' },
  { id: 't1', n: 'Zahraj si výzvu na čas', k: 'time', t: 1, xp: 20, i: '⏱️' }
];
function seeded(str) { let h = 2166136261; for (const c of str) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return () => { h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; }; }
function ensureDay(p) {
  const t = today(); if (p.day && p.day.date === t) return p.day;
  const rnd = seeded(t + p.id); const pool = TASKS.slice().sort(() => rnd() - .5); const picked = [], keys = new Set();
  for (const x of pool) { if (keys.has(x.k)) continue; if (x.k === 'games' && DATA.settings.gameLimit && x.t > DATA.settings.gameLimit) continue; keys.add(x.k); picked.push(x.id); if (picked.length === 3) break; }
  p.day = { date: t, cnt: {}, tasks: picked, claimed: [], bonus: false }; return p.day;
}
function bump(k, n = 1) {
  const p = P(); const d = ensureDay(p);
  const before = d.tasks.filter(id => { const T = TASKS.find(x => x.id === id); return (d.cnt[T.k] || 0) >= T.t; });
  d.cnt[k] = (d.cnt[k] || 0) + n;
  d.tasks.forEach(id => { const T = TASKS.find(x => x.id === id); if (!before.includes(id) && (d.cnt[T.k] || 0) >= T.t) setTimeout(() => { toast(`✅ Úloha splnená: ${T.n}`); sfx('coin'); }, 300); });
}
function logAct(k, id, c, n) { const p = P(); if (p && k !== 'gift' && k !== 'ptask' && k !== 'rread') { bearInit(p); p.bear.honey = Math.min(5, (p.bear.honey || 0) + 1); } if (k !== 'gift' && k !== 'ptask') { const wk = weekId(); if (!p.wk || p.wk.w !== wk) p.wk = { w: wk, xp: 0 }; p.wk.n = (p.wk.n || 0) + 1; dyOf(p).n++; const dd = p.days[today()] || (p.days[today()] = { q: 0, c: 0 }); dd.n = (dd.n || 0) + 1; } p.log.unshift({ t: Date.now(), k, id, c, n }); if (p.log.length > 300) p.log.length = 300; }
function countDay(ok) { const p = P(); const d = p.days[today()] || (p.days[today()] = { q: 0, c: 0 }); d.q++; if (ok) d.c++; }
const DR = [{ xp: 20, i: '⭐' }, { xp: 25, i: '⭐' }, { xp: 30, i: '💎' }, { xp: 40, i: '⭐' }, { xp: 50, i: '💎' }, { xp: 60, i: '🎁' }, { xp: 100, i: '👑' }];
const drReady = p => p.dailyReward.last !== today();
const drNextDay = p => p.dailyReward.last === daysAgo(1) ? (p.dailyReward.day % 7) + 1 : 1;
let PENDING = [];
const dyOf = p => { const t = today(); if (!p.dy || p.dy.d !== t) p.dy = { d: t, n: 0, xp: 0 }; return p.dy; };
function gain(p, n) { const wk = weekId(); if (!p.wk || p.wk.w !== wk) p.wk = { w: wk, xp: 0 }; p.wk.xp += n; dyOf(p).xp += n; p.xp += n; p.coins = (p.coins || 0) + Math.max(1, Math.round(n / 5)); }
function addXp(n) { const p = P(); const a = levelInfo(p.xp).L; gain(p, n); const b = levelInfo(p.xp).L; return { from: a, to: b }; }
function flushPending() { if ($('.over')) return; const x = PENDING.shift(); if (x) showRewardOverlay(x); }
function coinFly(el, k = 6) {
  const to = $('.coinchip'); if (!el || !to || matchMedia('(prefers-reduced-motion: reduce)').matches) return; const a = el.getBoundingClientRect(), b = to.getBoundingClientRect();
  for (let i = 0; i < k; i++) { const c = document.createElement('span'); c.className = 'flycoin'; c.innerHTML = COIN; c.style.left = (a.left + a.width / 2 - 12) + 'px'; c.style.top = (a.top + a.height / 2 - 12) + 'px'; document.body.appendChild(c); const dx = b.left + b.width / 2 - a.left - a.width / 2, dy = b.top + b.height / 2 - a.top - a.height / 2; const mx = (Math.random() - .5) * 120; c.animate([{ transform: 'translate(0,0) scale(.6)', opacity: 0 }, { transform: `translate(${mx}px,${-60 - Math.random() * 40}px) scale(1.2)`, opacity: 1, offset: .35 }, { transform: `translate(${dx}px,${dy}px) scale(.7)`, opacity: 1 }], { duration: 900 + i * 90, easing: 'cubic-bezier(.5,0,.4,1)' }).onfinish = () => { c.remove(); to.classList.remove('bump'); void to.offsetWidth; to.classList.add('bump'); }; }
}
function grant(n, el) { const r = addXp(n); floatXp(el, '+' + n); coinFly(el); sfx('coin'); save(); if (r.to > r.from) queueLevelUp(r.from, r.to); flushPending(); }
function queueLevelUp(from, to) { const g = P().av.gender; const rw = []; for (let L = from + 1; L <= to; L++) rw.push(...rewardsAt(L, g)); PENDING.push({ title: title(to), sub: rw.length ? 'Máš darček! Ťukni naň.' : 'Len tak ďalej!', rw, num: to, level: true }); }

