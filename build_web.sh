#!/bin/sh
# Zostaví verziu na web (GitHub Pages) do priečinka web/
cd "$(dirname "$0")"
./build.sh >/dev/null
mkdir -p web
{
  printf '%s\n' '<!doctype html>' '<html lang="sk">' '<head>' \
    '<meta charset="utf-8">' \
    '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">' \
    '<meta name="theme-color" content="#FFE6F1">' \
    '<meta name="description" content="Bystrík – hravé učenie matematiky, slovenčiny a prehľadu pre 1. až 4. ročník.">' \
    '<link rel="manifest" href="manifest.webmanifest">' \
    '<link rel="icon" href="icon-192.png">' \
    '<link rel="apple-touch-icon" href="icon-512.png">' \
    '<meta name="apple-mobile-web-app-capable" content="yes">' \
    '<meta name="apple-mobile-web-app-title" content="Bystrík">' \
    '<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>' \
    '</head>' '<body>'
  printf '%s\n' "<script>window.EMO_BASE='emoji/';</script>"
  cat bystrik.html
  printf '%s\n' "<script>if('serviceWorker' in navigator){addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));}</script>" '</body>' '</html>'
} > web/index.html
cat > web/manifest.webmanifest <<'EOF'
{
  "name": "Bystrík – hravé učenie",
  "id": "./",
  "description": "Hravé učenie matematiky, slovenčiny a prehľadu pre 1. až 4. ročník.",
  "categories": ["education", "kids"],
  "short_name": "Bystrík",
  "lang": "sk",
  "start_url": "./",
  "scope": "./",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#FFF4F8",
  "theme_color": "#FFE6F1",
  "icons": [
    { "src": "icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
EOF
cat > web/sw.js <<'EOF'
const CACHE = 'bystrik-v2';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); if (new URL(e.request.url).origin === location.origin) caches.open(CACHE).then(c => c.put(e.request, copy)); return r; }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html'))));
});
EOF
echo "web ready: $(wc -c < web/index.html) bytes"
