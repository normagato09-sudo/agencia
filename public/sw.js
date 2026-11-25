// Service worker de Mi Oficina: permite instalar la app y recibir notificaciones aunque esté cerrada.
const CACHE = 'mi-oficina-v2';
const SIN_CONEXION = '/offline.html';

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll([SIN_CONEXION, '/icono-192.png'])).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

// Siempre va a internet (los datos tienen que ser frescos); solo si no hay conexión enseña una página de aviso.
self.addEventListener('fetch', (e) => {
  if (e.request.mode !== 'navigate') return;
  e.respondWith(fetch(e.request).catch(() => caches.match(SIN_CONEXION)));
});

self.addEventListener('push', (event) => {
  let d = {};
  try { d = event.data ? event.data.json() : {}; } catch { d = { body: event.data && event.data.text() }; }
  event.waitUntil(self.registration.showNotification(d.title || 'Mi Oficina', {
    body: d.body || '',
    icon: '/icono-192.png',
    badge: '/icono-192.png',
    tag: d.tag,
    requireInteraction: !!d.urgente,
    data: { url: d.url || '/' },
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil((async () => {
    const ventanas = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const v of ventanas) { if ('focus' in v) { v.navigate(url); return v.focus(); } }
    return self.clients.openWindow(url);
  })());
});
