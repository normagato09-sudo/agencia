// Service worker de Mi Oficina: muestra las notificaciones aunque la app esté cerrada.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

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
