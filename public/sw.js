/* Service Worker de KetoFlow — PWA mínima y segura
 * - Navegación: network-first con fallback a caché (y a "/" como último recurso)
 * - Assets estáticos (_next/static, /keto/*, fuentes, imágenes): cache-first
 * - Nunca interfiere con llamadas a otros orígenes (API Gateway, Cognito/Amplify)
 */

const CACHE_NAME = "ketoflow-v1";
const PRECACHE_URLS = ["/", "/login/"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }

  // Solo mismo origen: la API y Cognito viven en otros dominios
  if (url.origin !== self.location.origin) return;

  // ---------- Navegación (HTML) ----------
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() =>
          caches.match(request).then((hit) => hit || caches.match("/") || Response.error())
        )
    );
    return;
  }

  // ---------- Assets estáticos ----------
  const isStatic =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/keto/") ||
    /\.(css|js|png|jpg|jpeg|gif|svg|webp|ico|woff2?)$/.test(url.pathname);

  if (isStatic) {
    event.respondWith(
      caches.match(request).then((hit) => {
        if (hit) return hit;
        return fetch(request).then((response) => {
          if (response.ok && response.type === "basic") {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        });
      })
    );
  }
});

// ============================================================
// Notificaciones Push (Web Push / VAPID)
// ============================================================

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : "" };
  }

  const title = data.title || "KetoFlow";
  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || "",
      icon: "/keto/logo.svg",
      badge: "/keto/logo-maskable.svg",
      tag: data.tag || undefined,
      vibrate: [100, 50, 100],
      data: { url: data.url || "/inicio" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || "/inicio";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Si la app ya está abierta, enfócala y navega
      for (const client of clientList) {
        if ("focus" in client) {
          return client
            .navigate(target)
            .then(() => (client.focus ? client.focus() : undefined))
            .catch(() => undefined);
        }
      }
      return self.clients.openWindow(target);
    })
  );
});
