// Gör att spelet fungerar utan nät och uppdateras automatiskt
const CACHE = 'utryckning-52165409';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== 'utryckning-orto').map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (u.origin === location.origin && u.pathname.includes('/orto/')) {
    // flygfotorutor ändras aldrig: cache först, egen cache som inte rensas vid ny version
    e.respondWith(caches.open('utryckning-orto').then(c => c.match(e.request).then(r => r || fetch(e.request).then(n => { if (n.ok) c.put(e.request, n.clone()); return n; }))));
  } else if (u.origin === location.origin) {
    // nät först så att uppdateringar syns direkt, cache som reserv utan nät
    // sidan hämtas alltid färsk från servern (ingen 10-minuterscache), så en ny version syns direkt
    const net = e.request.mode === 'navigate' ? fetch(e.request.url, { cache: 'no-cache', credentials: 'same-origin' }) : fetch(e.request);
    e.respondWith(net.then(r => { if (r.ok) { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); } return r; }).catch(() => caches.match(e.request).then(r => r || caches.match('index.html'))));
  } else if (u.host.includes('fonts.')) {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(n => { const c = n.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); return n; })));
  }
});
