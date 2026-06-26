const CACHE_NAME = 'tarifario-bambu-v5';
const ARCHIVOS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        ARCHIVOS.map((archivo) =>
          cache.add(archivo).catch((err) => {
            console.log('No se pudo guardar en cache:', archivo, err);
          })
        )
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((respuestaCache) => {
      if (respuestaCache) return respuestaCache;
      return fetch(event.request)
        .then((respuestaRed) => {
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, respuestaRed.clone()));
          return respuestaRed;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});
