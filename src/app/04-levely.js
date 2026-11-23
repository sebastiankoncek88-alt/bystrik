/* ===== Levely, odmeny ===== */
const needOld = L => 60 + 30 * (L - 1);
const need = L => 90 + 50 * (L - 1) + 4 * (L - 1) * (L - 1);
/* prevod starých bodov na nové levely: level a rozrobený postup ostanú rovnaké */
function xpMigrate(p) { if (!p || p.xpv === 2) return; let L = 1, r = p.xp || 0; while (r >= needOld(L)) { r -= needOld(L); L++; } const fr = r / needOld(L); let x = 0; for (let k = 1; k < L; k++) x += need(k); p.xp = Math.round(x + fr * need(L)); p.xpv = 2; }
function levelInfo(xp) { let L = 1, r = xp; while (r >= need(L)) { r -= need(L); L++; } return { L, cur: r, need: need(L), pct: Math.round(r / need(L) * 100) }; }
const TITLES = ['Zvedavé vajíčko', 'Malý bystrík', 'Šikovná hlávka', 'Pátrač', 'Objaviteľ', 'Vynálezca', 'Majster slov', 'Kráľ čísel', 'Profesor', 'Génius', 'Legenda'];
const title = L => TITLES[Math.min(TITLES.length - 1, Math.floor(L / 2))];
/* najviac 3 odmeny na level: prebytočné veci sa posunú na ďalší level; kto už mal pôvodný level, o nič nepríde (p.lvMig) */
function spreadLvls() {
  if (spreadLvls.d) return; spreadLvls.d = 1; const items = [];
  try { for (const c of REW_CATS) for (const it of CATALOG[c]) if (it.lvl) items.push(it); for (const L of [HAIRC, PAL, THEMES, STICKERS]) for (const it of L) if (it.lvl) items.push(it); } catch (e) { }
  items.sort((a, b) => a.lvl - b.lvl); const cnt = { d: {}, c: {} };
  for (const it of items) { const gs = it.g ? [it.g] : ['d', 'c']; let L = it.lvl; while (gs.some(g => (cnt[g][L] || 0) >= 3)) L++; it.lvl0 = it.lvl; it.lvl = L; gs.forEach(g => cnt[g][L] = (cnt[g][L] || 0) + 1); }
}
const unlocked = (it, p) => (spreadLvls(), !it.lvl || levelInfo(p.xp).L >= it.lvl || (it.lvl0 && (p.lvMig || 0) >= it.lvl0)) && (!it.streak || (p.streak.best || 0) >= it.streak) && (!it.price || (p.owned || []).includes(it.sid)) && (!it.lb || (p.owned || []).includes('lb:' + it.id)) && (!it.chest || (p.owned || []).includes(it.sid));
const lockLabel = it => (spreadLvls(), 0) || it.lb ? `Rebríček: ${it.lb}. miesto` : it.price ? `Obchod 🪙 ${it.price}` : it.lvl ? `Level ${it.lvl}` : `Séria ${it.streak} dní`;
const REW_CATS = ['hair', 'top', 'bottom', 'shoes', 'acc', 'eyes', 'mouth'];
function allRewardItems(g) {
  spreadLvls();
  const out = [];
  for (const c of REW_CATS) for (const it of CATALOG[c]) if ((it.lvl || it.streak) && (!it.g || it.g === g)) out.push([c, it]);
  for (const it of HAIRC) if ((it.lvl || it.streak) && (!it.g || it.g === g)) out.push(['hairColor', it]);
  for (const it of PAL) if ((it.lvl || it.streak) && (!it.g || it.g === g)) out.push(['color', it]);
  for (const it of THEMES) if (it.lvl || it.streak) out.push(['theme', it]);
  for (const it of STICKERS) if (it.lvl || it.streak) out.push(['sticker', it]);
  return out;
}
const rewardsAt = (L, g) => allRewardItems(g).filter(([, it]) => it.lvl === L);
const streakRewards = g => allRewardItems(g).filter(([, it]) => it.streak).sort((a, b) => a[1].streak - b[1].streak);
function rewardName(c, it) { if (c === 'theme') return `Pozadie: ${it.n}`; if (c === 'sticker') return `Nálepka: ${it.n}`; if (c === 'hairColor') return `${it.n} vlasy`; if (c === 'color') return `${it.n} farba`; if (c === 'bgp') return `Pozadie: ${it.n}`; return it.n; }
function itemThumb(cat, it, av) {
  if (cat === 'pet' || cat === 'sticker') return `<span>${it.e || '🚫'}</span>`;
  if (cat === 'theme') return `<span style="display:block;width:100%;height:100%;background:${themeBg(it.id)}"></span>`;
  if (cat === 'hairColor' || cat === 'color') return `<span class="sw ${it.c === 'RAINBOW' ? 'rb' : ''}" style="display:block;width:62%;background:${it.c}"></span>`;
  if (cat === 'skin' || cat === 'bg') return `<span class="sw" style="display:block;width:62%;background:${it.c}"></span>`;
  if (cat === 'bgp') { const a = { ...av, bgp: it.id }; const id = 'bp' + (++AVID); return `<svg viewBox="40 60 120 120">${'<defs>' + bgPatternDef(a, id) + '</defs>' + bgLayer(a, id)}</svg>`; }
  const a = { ...av, [cat]: it.id };
  if (cat === 'bottom' && ['saty', 'princezna', 'astronaut'].includes(a.top)) a.top = 'tricko';
  if (cat !== 'top' && a.top === 'astronaut') a.top = 'tricko';
  const crop = { hair: 'head', eyes: 'head', mouth: 'head', acc: 'acc', top: 'top', bottom: 'bottom', shoes: 'shoes' }[cat];
  return avatarSvg(a, { crop, noBg: true });
}

