const CACHE_NAME = 'wave-merge-pwa-gh-v1';
const ASSETS = [
  '/waveboard/wave_222_pwa_gh.html',
  '/waveboard/manifest_gh.webmanifest',
  '/waveboard/icon-192.png',
  '/waveboard/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.allSettled(ASSETS.map(url => cache.add(url))).then(()=>self.skipWaiting())
    )
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    )).then(()=> self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  const isApi = url.pathname.includes('/api/');
  if (isApi) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
  } else {
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request).then(resp => {
        const clone = resp.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone)).catch(()=>{});
        return resp;
      }).catch(() => cached))
    );
  }
});
