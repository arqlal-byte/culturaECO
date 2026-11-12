/* Ecosistema ECO: la interfaz HTML siempre se consulta en red.
   Solo se conservan recursos visuales en caché como respaldo. */
const CACHE = 'cultura-eco-assets-2026-11-12-v5';
self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith('cultura-eco-') && name !== CACHE).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});
const OFFLINE_PAGE = '<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Ecosistema ECO · Sin conexión</title><body style="font:16px system-ui;background:#050a12;color:#fff;padding:35px;text-align:center"><h1>Ecosistema ECO</h1><p>No hay conexión a internet. Conéctate y vuelve a abrir la aplicación para ver su versión actualizada.</p></body></html>';
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  const isDocument = request.mode === 'navigate' || url.pathname.endsWith('/index.html');
  if (isDocument) {
    event.respondWith(fetch(request, { cache: 'no-store' }).catch(() =>
      new Response(OFFLINE_PAGE, {
        status: 503,
        headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }
      })
    ));
    return;
  }
  event.respondWith((async () => {
    try {
      const response = await fetch(request, { cache: 'no-store' });
      if (response.ok && /\.(?:png|jpe?g|gif|webp|svg)$/i.test(url.pathname)) {
        const copy = response.clone();
        event.waitUntil(caches.open(CACHE).then(cache => cache.put(request, copy)).catch(() => {}));
      }
      return response;
    } catch (error) {
      return (await caches.match(request)) || Response.error();
    }
  })());
});
