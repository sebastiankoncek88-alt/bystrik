/* Bystrík – rýchly test pred nasadením: node tests/smoke.js
   Otvorí web/index.html v emulácii iPhone 13 (Supabase/Google sú zablokované),
   prejde hlavné obrazovky a vypíše chyby JS. Končí kódom 1, ak nejaká chyba nastala. */
const { chromium, devices } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ ...devices['iPhone 13'] }); const page = await ctx.newPage();
  await page.route(/supabase|googleapis|gstatic/, r => r.abort()); const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto('file://' + path.resolve(__dirname, '../web/index.html')); await page.waitForTimeout(800);
  await page.evaluate(() => { const p = newProfile('Test', 'c', 2, defaultAvatar('c')); p.room = defaultRoom('c'); p.tourDone = true; p.coins = 300; DATA.profiles.push(p); DATA.current = p.id; DATA.pguideSeen = 1; save(); });
  for (const v of ['home', 'learn', 'games', 'wardrobe', 'shop', 'me', 'board', 'settings', 'room', 'rewards', 'friends', 'chat', 'reads']) { await page.evaluate(v => go(v), v); await page.waitForTimeout(350); }
  await page.evaluate(() => { go('home'); }); await page.waitForTimeout(400);
  await page.evaluate(() => { fxComet(5); openChest(10); }); await page.waitForTimeout(400);
  await page.evaluate(() => { document.querySelectorAll('.over').forEach(o => o.remove()); PARENT_OK = true; DATA.parent.pin = '1234'; DATA.parent.tour = 1; PSEL = DATA.current; for (const t of ['over', 'tasks', 'read', 'set']) { PTAB = t; go('parent'); } });
  await page.waitForTimeout(400); await b.close();
  if (errs.length) { console.log('CHYBY:\n' + errs.join('\n')); process.exit(1); } console.log('OK – žiadne chyby');
})();
