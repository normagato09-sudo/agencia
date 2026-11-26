// Service worker de Mi Oficina: permite instalar la app y recibir notificaciones aunque esté cerrada.
const CACHE = 'mi-oficina-v3';
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
    icon: d.icon || '/icono-192.png',
    badge: '/icono-192.png',
    tag: d.tag,
    renotify: !!d.tag,
    requireInteraction: !!d.urgente,
    actions: Array.isArray(d.acciones) ? d.acciones.slice(0, 2) : [],
    data: { url: d.url || '/', avisoId: d.avisoId || null },
  }));
});

async function abrir(url) {
  const ventanas = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  const interna = url.startsWith('/') || url.startsWith(self.location.origin);
  if (interna) {
    for (const v of ventanas) { if ('focus' in v) { await v.navigate(url).catch(() => {}); return v.focus(); } }
  }
  return self.clients.openWindow(url);
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const { url = '/', avisoId = null } = event.notification.data || {};
  if (event.action === 'tarde' && avisoId) {
    // «En 1 hora»: se apunta sin abrir la app.
    event.waitUntil(
      fetch(`/api/avisos/${avisoId}`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ accion: 'tarde', cuando: '1h' }) })
        .then((r) => (r.ok ? null : abrir('/')))
        .catch(() => abrir('/')),
    );
    return;
  }
  event.waitUntil(abrir(url));
});
