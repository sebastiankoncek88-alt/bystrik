/* ===== Efekty ===== */
const fx = { c: null, ctx: null, parts: [], run: false };
function confetti(n = 120, y = .35) { if (document.documentElement.classList.contains('lite')) n = Math.round(n / 3);
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const c = fx.c || (fx.c = $('#fx')); fx.ctx = fx.ctx || c.getContext('2d');
  c.width = innerWidth * devicePixelRatio; c.height = innerHeight * devicePixelRatio;
  const cols = ['#FF7A59', '#FFC94D', '#4C86F7', '#22B573', '#F25C8B', '#9C7CF4', '#86E3C9'];
  for (let i = 0; i < n; i++) fx.parts.push({ x: innerWidth / 2, y: innerHeight * y, vx: (Math.random() - .5) * 14, vy: -Math.random() * 13 - 4, r: Math.random() * 6 + 4, c: pick(cols), a: Math.random() * 6, va: (Math.random() - .5) * .4, life: 0, round: Math.random() < .3 });
  if (!fx.run) { fx.run = true; requestAnimationFrame(tickFx); }
}
function tickFx() {
  const { ctx, c } = fx; ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0); ctx.clearRect(0, 0, c.width, c.height);
  fx.parts = fx.parts.filter(p => p.life < 170 && p.y < innerHeight + 40);
  for (const p of fx.parts) { p.life++; p.vy += .35; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.a += p.va; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = p.c; if (p.round) { ctx.beginPath(); ctx.arc(0, 0, p.r / 2, 0, 7); ctx.fill(); } else ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); ctx.restore(); }
  if (fx.parts.length) requestAnimationFrame(tickFx); else { fx.run = false; ctx.clearRect(0, 0, c.width, c.height); }
}
function burst(el, n = 26) {
  if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return; const r = el.getBoundingClientRect();
  const c = fx.c || (fx.c = $('#fx')); fx.ctx = fx.ctx || c.getContext('2d'); c.width = innerWidth * devicePixelRatio; c.height = innerHeight * devicePixelRatio;
  const cols = ['#FF7A59', '#FFC94D', '#4C86F7', '#22B573', '#F25C8B', '#9C7CF4', '#86E3C9'];
  for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, v = 3 + Math.random() * 6; fx.parts.push({ x: r.left + r.width / 2, y: r.top + r.height / 2, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 4, r: Math.random() * 5 + 4, c: pick(cols), a: Math.random() * 6, va: (Math.random() - .5) * .4, life: 60, round: Math.random() < .4 }); }
  if (!fx.run) { fx.run = true; requestAnimationFrame(tickFx); }
}
/* upozornenie pre dieťa: Bystrík ho aj prečíta nahlas (prváci ešte nevedia čítať) */
function hint(msg) { const d = document.createElement('div'); d.className = 'tst tbear'; d.innerHTML = `<span class="tbi">${bearSvg('talking')}</span><span>${esc(msg)}</span>`; const ms = Math.max(3200, msg.length * 85); d.style.animationDuration = ms + 'ms'; $('#toast').appendChild(d); setTimeout(() => d.remove(), ms + 100); try { say(msg.replace(/\p{Extended_Pictographic}|\uFE0F|\u200D/gu, '').replace(/\s+/g, ' ').trim()); } catch (e) { } }
function toast(msg) { const d = document.createElement('div'); d.className = 'tst'; d.textContent = msg; $('#toast').appendChild(d); setTimeout(() => d.remove(), 2900); }
function floatXp(el, txt) { if (!el) return; const r = el.getBoundingClientRect(); const d = document.createElement('div'); d.className = 'floatxp'; d.textContent = txt; d.style.left = (r.left + r.width / 2 - 20) + 'px'; d.style.top = (r.top - 6) + 'px'; document.body.appendChild(d); setTimeout(() => d.remove(), 1000); }


/* ohňostroj: rakety vyletia, vybuchnú do farebných iskier (canvas, ~4 s) */
function fireworks(n) {
  const lite = document.documentElement.classList.contains('lite'); n = n || (lite ? 4 : 9);
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { confetti(80); return; }
  const cv = document.createElement('canvas'); cv.className = 'fwcv'; const dpr = Math.min(2, window.devicePixelRatio || 1); const W = innerWidth, H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; document.body.appendChild(cv); const g = cv.getContext('2d'); g.scale(dpr, dpr);
  const COLS = ['#FF4F7B', '#FFC94D', '#5FE0B8', '#7DB8FF', '#C59BFF', '#FF8A3D', '#FFFFFF']; const rockets = [], sparks = []; let t0 = performance.now();
  for (let i = 0; i < n; i++) rockets.push({ at: i * (lite ? 420 : 330) + Math.random() * 150, x: W * (.15 + Math.random() * .7), y: H, ty: H * (.18 + Math.random() * .3), c: COLS[i % COLS.length], up: false, done: false });
  const boom = r => { const k = lite ? 26 : 46; for (let i = 0; i < k; i++) { const a = Math.PI * 2 * i / k + Math.random() * .2, v = 2.2 + Math.random() * 2.6; sparks.push({ x: r.x, y: r.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, c: Math.random() < .25 ? '#FFFFFF' : r.c }); } sfx('pop'); setTimeout(() => sfx('star', Math.floor(Math.random() * 3)), 60); buzz(12); };
  const step = now => {
    const el = now - t0; g.clearRect(0, 0, W, H); let alive = false;
    for (const r of rockets) { if (r.done) continue; alive = true; if (el < r.at) continue; if (!r.up) { r.up = true; sfx('whoosh'); } r.y -= Math.max(4, (r.y - r.ty) * .07); g.fillStyle = r.c; g.beginPath(); g.arc(r.x, r.y, 3, 0, 7); g.fill(); g.fillStyle = 'rgba(255,220,150,.5)'; g.fillRect(r.x - 1, r.y + 4, 2, 14); if (r.y - r.ty < 6) { r.done = true; boom(r); } }
    for (const s of sparks) { if (s.life <= 0) continue; alive = true; s.x += s.vx; s.y += s.vy; s.vy += .05; s.vx *= .985; s.vy *= .985; s.life -= .012; g.globalAlpha = Math.max(0, s.life); g.fillStyle = s.c; g.beginPath(); g.arc(s.x, s.y, 2.4, 0, 7); g.fill(); }
    g.globalAlpha = 1; if (alive && el < 9000) requestAnimationFrame(step); else cv.remove();
  };
  requestAnimationFrame(step); try { buddyMood('dance', 'Hurá! 🎆'); } catch (e) { }
}
