/* ===== Denný limit AI tokenov ===== */
let LAST_USAGE = null; const AIL_LS = 'bystrik.aiuse';
const AI_LIMITS = [5000, 10000, 20000, 40000, 80000];
const aiLimit = () => { const v = +(DATA.settings && DATA.settings.aiLimit); return v > 0 ? v : 20000; };
function aiUsed() { const t = today(); let a = 0, b = 0; try { const x = JSON.parse(localStorage.getItem(AIL_LS) || 'null'); if (x && x.d === t) a = +x.u || 0; } catch (e) { } if (DATA.aiUse && DATA.aiUse.d === t) b = +DATA.aiUse.u || 0; return Math.max(a, b); }
function aiAdd(n) { const t = today(); const u = aiUsed() + Math.max(1, Math.round(n || 0)); DATA.aiUse = { d: t, u }; try { localStorage.setItem(AIL_LS, JSON.stringify({ d: t, u })); } catch (e) { } save(); const L = aiLimit(); if (u >= L * .8 && u < L && DATA.aiWarn !== t) { DATA.aiWarn = t; save(); setTimeout(() => toast('🧸 Bystrík bude dnes čoskoro unavený. AI zostáva už len trochu.'), 300); } }
const aiLeft = () => Math.max(0, aiLimit() - aiUsed());
const aiEst = x => { if (x == null) return 0; if (typeof x === 'string') return Math.ceil(x.length / 3.5); if (Array.isArray(x)) return x.reduce((a, m) => a + aiEst(m && m.content != null ? String(m.content) : JSON.stringify(m)), 0); return Math.ceil(JSON.stringify(x).length / 3.5); };
const AIL_MSG = 'Na dnes som už minul všetky svoje AI sily 🧸. Zajtra ti zase rád odpoviem. Zatiaľ si môžeš zahrať kvíz alebo kartičky z tejto témy.';
function aiGuard(raw) {
  if (!raw) return null;
  const pre = (input, opts) => { const need = aiEst(input) + 200 + ((opts && opts.images && opts.images.length) || 0) * 1300; if (aiUsed() + need > aiLimit()) throw { code: 'ai_limit', message: AIL_MSG }; return need; };
  const w = async (input, opts = {}) => { const need = pre(input, opts); LAST_USAGE = null; const r = await raw(input, opts); aiAdd(LAST_USAGE || need + aiEst(r && r.text)); return r; };
  w.json = async (input, opts = {}) => { const need = pre(input, opts); LAST_USAGE = null; const r = await raw.json(input, opts); aiAdd(LAST_USAGE || need + aiEst(r)); return r; };
  w.limits = raw.limits ? (...a) => raw.limits(...a) : async () => null;
  return w;
}
function aiMeter(compact) { const L = aiLimit(), u = Math.min(aiUsed(), L), pct = Math.round(u / L * 100); const col = pct >= 100 ? 'var(--bad)' : pct >= 80 ? 'var(--sun)' : 'var(--good)'; return `<div class="aimeter ${compact ? 'cmp' : ''}" role="meter" aria-label="AI dnes" aria-valuemin="0" aria-valuemax="${L}" aria-valuenow="${u}"><div class="aimt"><b>${compact ? '🧸 AI dnes' : 'Využité dnes'}</b><span>${fmt(u)} / ${fmt(L)} tokenov · zostáva ${fmt(L - u)}</span></div><div class="aimb"><i style="width:${pct}%;background:${col}"></i></div>${pct >= 100 ? '<small>Limit je na dnes vyčerpaný. Obnoví sa o polnoci.</small>' : pct >= 80 ? '<small>Blíži sa denný limit.</small>' : ''}</div>`; }
function getSample() { if (!SAMPLE) SAMPLE = ((window.claude && window.claude.use) ? window.claude.use('sample').catch(() => null) : Promise.resolve(getApiKey() ? keySample(getApiKey()) : null)).then(aiGuard); return SAMPLE; }

