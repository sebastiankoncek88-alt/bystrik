// Zminifikuje web/index.html: JS bez komentárov a medzier (lokálne premenné premenované), CSS skomprimované.
const fs = require('fs'); const { minify } = require('terser'); const CleanCSS = require('clean-css');
(async () => {
  const f = process.argv[2]; let h = fs.readFileSync(f, 'utf8'); const before = h.length;
  const scripts = [...h.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  for (const m of scripts) { const r = await minify(m[1], { compress: { passes: 2 }, mangle: true, format: { comments: false } }); h = h.replace(m[0], () => '<script>' + r.code + '</script>'); }
  h = h.replace(/<style>([\s\S]*?)<\/style>/g, (_, c) => '<style>' + new CleanCSS({ level: 1 }).minify(c).styles + '</style>');
  h = h.replace(/<!--[\s\S]*?-->/g, '');
  fs.writeFileSync(f, h); console.log('minify', before, '->', h.length);
})().catch(e => { console.error(e); process.exit(1); });
