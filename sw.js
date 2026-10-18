// Service worker: permite instalar la app y usarla sin conexión.
// Sube CACHE_VERSION cada vez que cambies archivos de la app.
const CACHE_VERSION = 'v0.2.0';
const SHELL_CACHE = `shell-${CACHE_VERSION}`;
const DATA_CACHE = 'data';

const SHELL = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/app.css',
  'js/app.js',
  'js/db.js',
  'js/data.js',
  'js/theme.js',
  'js/util.js',
  'js/views/inicio.js',
  'js/views/noticias.js',
  'js/views/escuchar.js',
  'js/views/mercados.js',
  'js/views/finanzas.js',
  'js/views/ocio.js',
  'js/views/ajustes.js',
  'js/views/soon.js',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SHELL_CACHE).then((c) => c.addAll(SHELL.map((u) => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('shell-') && k !== SHELL_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Datos del día: primero red (para tener lo último), si no hay conexión, caché.
  if (url.origin === location.origin && url.pathname.includes('/data/')) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) { const copy = res.clone(); caches.open(DATA_CACHE).then((c) => c.put(req, copy)); }
          return res;
        })
        .catch(() => caches.match(req)),
    );
    return;
  }

  // Archivos de la app y fuentes: primero caché, luego red.
  if (url.origin === location.origin || url.hostname.endsWith('gstatic.com') || url.hostname.endsWith('googleapis.com')) {
    event.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok || res.type === 'opaque') {
          const copy = res.clone();
          caches.open(url.origin === location.origin ? SHELL_CACHE : 'fonts').then((c) => c.put(req, copy));
        }
        return res;
      })),
    );
  }
});
