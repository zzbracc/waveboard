const CACHE_NAME = 'wave-merge-pwa-v1';
const ASSETS = [
  './wave_222_pwa.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  'https://code.jquery.com/jquery-3.7.1.min.js',
  'https://cdn.datatables.net/2.0.8/js/dataTables.min.js',
  'https://cdn.datatables.net/2.0.8/css/dataTables.dataTables.min.css',
  'https://cdn.datatables.net/buttons/3.0.2/js/dataTables.buttons.min.js',
  'https://cdn.datatables.net/buttons/3.0.2/js/buttons.html5.min.js',
  'https://cdn.datatables.net/buttons/3.0.2/css/buttons.dataTables.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'
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
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
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
