/* ===== Vlastné pozadie ===== */
const PAGE_BG = [['auto', 'Základná', '', ''], ['ruzova', 'Ružová', '#FFE4EE', '#3A1B33'], ['modra', 'Modrá', '#DFEBFF', '#152242'], ['matova', 'Mätová', '#D8F5E9', '#12302A'], ['fialova', 'Fialová', '#EAE2FF', '#2A1D4A'], ['zlta', 'Žltá', '#FFF2C7', '#30280F'], ['broskyna', 'Broskyňová', '#FFE5D4', '#33211A'], ['siva', 'Sivá', '#EEF0F5', '#1A1C25'], ['biela', 'Biela', '#FFFFFF', '#FFFFFF', 'light'], ['kremova', 'Krémová', '#FBF3E1', '#FBF3E1', 'light'], ['cierna', 'Čierna', '#000000', '#000000', 'dark'], ['tyrkys', 'Tyrkysová', '#D2F3F1', '#0F2E2E'], ['levandula', 'Levanduľová', '#E9E4F7', '#241F3A'], ['koral', 'Koralová', '#FFD9D2', '#3A1C1C'], ['limetka', 'Limetková', '#EAF7C8', '#25300F'], ['zapad', 'Západ slnka', 'linear-gradient(160deg,#FFE1B8,#FFC4DD)', 'linear-gradient(160deg,#3A2416,#3A1B33)'], ['ocean', 'Oceán', 'linear-gradient(160deg,#CFF6F1,#D5E2FF)', 'linear-gradient(160deg,#0F2E2E,#1A2148)'], ['cukrik', 'Cukrík', 'linear-gradient(160deg,#FFE0F0,#E2DEFF)', 'linear-gradient(160deg,#3A1B33,#241C4A)'], ['les', 'Les', 'linear-gradient(160deg,#EAF7C8,#CDF1E6)', 'linear-gradient(160deg,#25300F,#10302E)'], ['duha', 'Dúha', 'linear-gradient(135deg,#FFE0E6,#FFF1C7,#DDF6E6,#DCE8FF,#EDE2FF)', 'linear-gradient(135deg,#3A1B26,#33280F,#12301F,#152242,#2A1D4A)']];
function applyPageBg() { const c = PAGE_BG.find(x => x[0] === (DATA.settings.bgc || 'auto')) || PAGE_BG[0]; const st = document.documentElement.style; if (c[0] === 'cierna') { st.setProperty('--topoc', '#fff'); st.setProperty('--topoo', '.14'); } else { st.removeProperty('--topoc'); st.removeProperty('--topoo'); } if (c[0] === 'auto') { st.removeProperty('--pg'); return; } st.setProperty('--pg', isDark() ? c[3] : c[2]); }
const isDark = () => { const t = document.documentElement.dataset.theme; return t === 'dark' || (t !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches); };
function applyRoom() {
  const p = P(); const on = false; applyPageBg();
  let pb = $('#pagebg');
  if (!on) { if (pb) pb.remove(); document.documentElement.classList.remove('fdark'); return; }
  if (!pb) { pb = document.createElement('div'); pb.id = 'pagebg'; document.body.prepend(pb); }
  pb.innerHTML = roomHTML(p.room, null, isDark()); document.documentElement.classList.toggle('fdark', !!themeOf(p.room.theme).dark);
}
try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => applyRoom()); } catch (e) { }
let DS = null, DRAG = null;
function designerHTML() {
  const r = DS.room, lp = DS.lockP;
  const tools = DS.sel !== null && r.stickers[DS.sel] ? `<div class="stktools"><button class="btn" data-a="ds-tool" data-t="minus">➖ Menšia</button><button class="btn" data-a="ds-tool" data-t="plus">➕ Väčšia</button><button class="btn" data-a="ds-tool" data-t="rot">↻ Otočiť</button><button class="btn" data-a="ds-tool" data-t="del">🗑️ Zmazať</button></div>` : `<p class="deckinfo">Ťukni na nálepku dole a pridá sa do obrázka. Potom ju prstom posuň, kam chceš. Ťuknutím na nálepku v obrázku ju vyberieš.</p>`;
  const tab = DS.tab; let grid;
  if (tab === 'stk') grid = `<div class="stkpal">${STICKERS.map((it, i) => { const u = unlocked(it, lp); return `<button class="press ${u ? '' : 'lockb'}" data-a="ds-add" data-i="${i}" aria-label="Nálepka ${it.n}${u ? '' : ', ' + lockLabel(it)}">${it.e}</button>`; }).join('')}</div><p class="muted b" style="font-size:.82rem">Nálepky so zámkom odomkneš za level alebo sériu. Najviac ${16} nálepiek.</p>`;
  else if (tab === 'col') grid = `<div class="themes">${THEMES.map(t => { const u = unlocked(t, lp); return `<button class="press ${r.theme === t.id ? 'on' : ''} ${u ? '' : 'lockb'} ${t.dark ? 'dk' : ''}" style="background:${themeBg(t.id)}" data-a="ds-theme" data-i="${t.id}">${t.n}</button>`; }).join('')}</div>`;
  else if (tab === 'int') grid = `<div class="themes ints">${INTS.map(it => `<button class="press ${(r.int || 'izba') === it.id ? 'on' : ''}" data-a="ds-int" data-i="${it.id}"><span class="intprev">${roomHTML({ ...r, int: it.id, stickers: [] })}</span><span class="intn">${it.e} ${it.n}</span></button>`).join('')}</div>`;
  else grid = `<div class="themes">${PATS.map(pt => `<button class="press ${r.pat === pt.id ? 'on' : ''} ${themeOf(r.theme).dark ? 'dk' : ''}" style="background:${themeBg(r.theme)}" data-a="ds-pat" data-i="${pt.id}"><span class="pat pat-${pt.id}" style="position:absolute;inset:0"></span><span style="position:relative">${pt.n}</span></button>`).join('')}</div>`;
  return `<div class="designer" id="designer" data-a="ds-desel">${roomHTML(r, DS.sel)}<div class="dfig">${avatarSvg(DS.av, { noBg: true, cls: 'idle' })}</div></div>${tools}<div class="seg"><button class="${tab === 'stk' ? 'on' : ''}" data-a="ds-tab" data-t="stk">⭐ Nálepky</button><button class="${tab === 'int' ? 'on' : ''}" data-a="ds-tab" data-t="int">🏠 Miesto</button><button class="${tab === 'col' ? 'on' : ''}" data-a="ds-tab" data-t="col">🎨 Farby</button><button class="${tab === 'pat' ? 'on' : ''}" data-a="ds-tab" data-t="pat">🔲 Vzor</button></div>${grid}`;
}
function dsRefresh() { const b = $('#dsgn'); if (b) b.innerHTML = designerHTML(); DS.save && DS.save(); }
document.addEventListener('pointerdown', e => {
  const st = e.target.closest('.designer .stk'); if (!st || !DS) return; e.preventDefault();
  DS.sel = +st.dataset.i; DRAG = { i: DS.sel, el: st, box: st.closest('.designer').getBoundingClientRect() };
  try { st.setPointerCapture(e.pointerId); } catch (_) { }
  $$('.designer .stk').forEach(x => x.classList.toggle('sel', x === st)); sfx('tap');
  const tl = $('#dsgn .stktools, #dsgn .deckinfo'); if (tl) { const tmp = document.createElement('div'); const sel = DS.sel; tmp.innerHTML = designerHTML(); const nt = tmp.querySelector('.stktools'); if (nt) tl.replaceWith(nt); DS.sel = sel; }
});
document.addEventListener('pointermove', e => {
  if (!DRAG) return; const { box, el, i } = DRAG; const s = DS.room.stickers[i]; if (!s) return;
  s.x = +Math.max(3, Math.min(97, (e.clientX - box.left) / box.width * 100)).toFixed(1); s.y = +Math.max(3, Math.min(97, (e.clientY - box.top) / box.height * 100)).toFixed(1);
  el.style.left = s.x + '%'; el.style.top = s.y + '%'; DRAG.moved = true;
});
document.addEventListener('pointerup', () => { if (DRAG) { DRAG = null; DS.save && DS.save(); } });
const lockProfile = () => (OB && UI.view === 'onboard' && !OB.edit) ? { xp: 0, streak: { best: 0 } } : P();
function roomView() {
  const p = P(); DS = { room: p.room, av: p.av, sel: null, tab: DS && DS.tab || 'stk', lockP: p, save: () => { save(); applyRoom(); } };
  return `${topbar('room-back')}<main class="view"><h1 style="font-size:2rem">Moje pozadie</h1><p class="muted b">Navrhni si vlastné pozadie: vyber miesto (izba, trieda, pláž…) alebo len vzor, farby a nalep nálepky. Ukáže sa za tvojou postavičkou.</p><div id="dsgn" style="display:flex;flex-direction:column;gap:12px">${designerHTML()}</div><button class="btn primary block" data-a="room-back">Hotovo</button></main>`;
};

