const CACHE = 'irankiai-v2';
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./index.html', './config.js'])));
  self.skipWaiting();
});
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())
));
function key(u) { return u.origin + (u.pathname.endsWith('/') ? u.pathname + 'index.html' : u.pathname); }
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  const k = key(u);
  e.respondWith(
    fetch(e.request).then(r => {
      if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(k, copy)); }
      return r;
    }).catch(() => caches.match(k).then(m => m || caches.match(u.origin + '/index.html')))
  );
});
