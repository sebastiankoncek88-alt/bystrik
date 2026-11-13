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
function toast(msg) { const d = document.createElement('div'); d.className = 'tst'; d.textContent = msg; $('#toast').appendChild(d); setTimeout(() => d.remove(), 2900); }
function floatXp(el, txt) { if (!el) return; const r = el.getBoundingClientRect(); const d = document.createElement('div'); d.className = 'floatxp'; d.textContent = txt; d.style.left = (r.left + r.width / 2 - 20) + 'px'; d.style.top = (r.top - 6) + 'px'; document.body.appendChild(d); setTimeout(() => d.remove(), 1000); }

