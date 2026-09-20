// Service Worker de Mejoralito.
//
// Responsabilidades:
// 1. Cachear el "app shell" para que la aplicacion abra aunque no haya
//    conexion (no garantiza datos actualizados, solo que la interfaz cargue).
// 2. Mostrar notificaciones push cuando el servidor envia un recordatorio.
// 3. Reaccionar a que la persona toque una notificacion.
//
// Limitacion importante (ver README): en iOS, Web Push solo funciona si la
// PWA fue agregada a la pantalla de inicio, y el sistema operativo decide
// cuando entregar la notificacion; no hay garantia de entrega inmediata como
// una alarma nativa. En Android/Chrome el comportamiento es mas confiable
// pero tampoco esta garantizado si el navegador esta completamente cerrado
// y el sistema restringe procesos en segundo plano.

const CACHE_NAME = 'mejoralito-v2';
const OFFLINE_URL = '/offline';

const APP_SHELL = [
  '/',
  '/offline',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  // Navegacion (cargar una pagina): red primero, y si falla, shell offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match(OFFLINE_URL).then((r) => r || caches.match('/')))
    );
    return;
  }

  // Assets estaticos propios: cache primero, red como respaldo.
  const url = new URL(request.url);
  if (url.origin === self.location.origin && /\.(?:png|jpg|jpeg|svg|ico|webmanifest)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request))
    );
  }
});

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: 'Mejoralito', body: event.data.text() };
  }

  const title = payload.title || 'Hora de tu medicamento';
  const options = {
    body: payload.body || '',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-96.png',
    tag: payload.tag,
    data: payload.data || {},
    // "actions" no es soportado en iOS Safari: ahi la notificacion se
    // muestra igual, pero sin estos botones (limitacion del sistema, no
    // de la app). El toque simple siempre abre la app.
    actions: [
      { action: 'taken', title: 'Ya la tomé' },
      { action: 'snooze', title: 'Recordar en 15 min' },
      { action: 'skip', title: 'Omitir' },
    ],
    requireInteraction: true,
    // renotify: aunque ya haya una notificacion visible con el mismo
    // `tag` (porque el servidor la reenvio para "insistir"), el
    // dispositivo vuelve a sonar y vibrar en vez de actualizarla en
    // silencio. Es lo que en Android logra el efecto de "seguir sonando"
    // mientras el servidor siga reintentando (ver /api/cron/reminders).
    renotify: true,
    // Patron de vibracion largo e intermitente (en ms: vibra, pausa, ...)
    // para que se note incluso si el volumen de notificaciones esta bajo.
    vibrate: [400, 200, 400, 200, 400, 400, 800],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const data = event.notification.data || {};

  event.waitUntil(
    (async () => {
      if (event.action === 'taken' || event.action === 'skip' || event.action === 'snooze') {
        try {
          await fetch('/api/medication-logs/quick-action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: event.action,
              medicationId: data.medicationId,
              scheduleId: data.scheduleId,
              scheduledFor: data.scheduledFor,
            }),
          });
        } catch {
          // Sin conexion: igual abrimos la app para que la persona actue a mano.
        }
      }

      const targetUrl = '/inicio';
      const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      const existing = allClients.find((c) => c.url.includes(self.location.origin));
      if (existing) {
        existing.focus();
        existing.navigate(targetUrl);
      } else {
        self.clients.openWindow(targetUrl);
      }
    })()
  );
});
