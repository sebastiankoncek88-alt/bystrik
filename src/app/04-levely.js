/* ===== Levely, odmeny ===== */
const need = L => 60 + 30 * (L - 1);
function levelInfo(xp) { let L = 1, r = xp; while (r >= need(L)) { r -= need(L); L++; } return { L, cur: r, need: need(L), pct: Math.round(r / need(L) * 100) }; }
const TITLES = ['Zvedavé vajíčko', 'Malý bystrík', 'Šikovná hlávka', 'Pátrač', 'Objaviteľ', 'Vynálezca', 'Majster slov', 'Kráľ čísel', 'Profesor', 'Génius', 'Legenda'];
const title = L => TITLES[Math.min(TITLES.length - 1, Math.floor(L / 2))];
const unlocked = (it, p) => (!it.lvl || levelInfo(p.xp).L >= it.lvl) && (!it.streak || (p.streak.best || 0) >= it.streak) && (!it.price || (p.owned || []).includes(it.sid)) && (!it.lb || (p.owned || []).includes('lb:' + it.id)) && (!it.chest || (p.owned || []).includes(it.sid));
const lockLabel = it => it.chest ? '🎁 Len zo záhadnej truhly' : it.lb ? `Rebríček: ${it.lb}. miesto` : it.price ? `Obchod 🪙 ${it.price}` : it.lvl ? `Level ${it.lvl}` : `Séria ${it.streak} dní`;
const REW_CATS = ['hair', 'top', 'bottom', 'shoes', 'acc', 'eyes', 'mouth'];
function allRewardItems(g) {
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

