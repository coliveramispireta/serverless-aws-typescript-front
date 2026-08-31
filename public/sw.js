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

// ------------------------------------------------------------
// Historial persistente de notificaciones en IndexedDB del SW.
// Guardamos aquí cada push recibido para que la app pueda
// recuperarlo aunque la notificación llegara sin cliente activo
// (app cerrada), y para que al tocar NO se pierda la info.
// ------------------------------------------------------------
const NOTIF_DB_NAME = "ketoflow-notifs";
const NOTIF_DB_STORE = "push";
const NOTIF_MAX = 50;

function openNotifDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(NOTIF_DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(NOTIF_DB_STORE)) {
        const store = db.createObjectStore(NOTIF_DB_STORE, { keyPath: "id" });
        store.createIndex("ts", "ts");
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function addNotifToDB(notif) {
  return openNotifDB().then((db) =>
    new Promise((resolve, reject) => {
      const tx = db.transaction(NOTIF_DB_STORE, "readwrite");
      const store = tx.objectStore(NOTIF_DB_STORE);
      store.put(notif);
      // Podar: quedarse con el más reciente hasta NOTIF_MAX
      const allReq = store.getAll();
      allReq.onsuccess = () => {
        const all = allReq.result;
        if (all.length > NOTIF_MAX) {
          const sorted = all
            .slice()
            .sort((a, b) => (b.ts || 0) - (a.ts || 0));
          const toDelete = sorted.slice(NOTIF_MAX);
          const tx2 = db.transaction(NOTIF_DB_STORE, "readwrite");
          const store2 = tx2.objectStore(NOTIF_DB_STORE);
          toDelete.forEach((n) => store2.delete(n.id));
        }
      };
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    })
  );
}

function readAllNotifsFromDB() {
  return openNotifDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(NOTIF_DB_STORE, "readonly");
        const store = tx.objectStore(NOTIF_DB_STORE);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      })
  );
}

function clearNotifsFromDB() {
  return openNotifDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(NOTIF_DB_STORE, "readwrite");
        tx.objectStore(NOTIF_DB_STORE).clear();
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
      })
  );
}

// Reenvía el payload a todos los clientes abiertos de la app
function broadcastToClients(payload) {
  return self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
    clients.forEach((client) => {
      if (client.postMessage) {
        client.postMessage({ type: "KETO_PUSH", payload });
      }
    });
  });
}

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : "" };
  }

  const title = data.title || "KetoFlow";
  const notif = {
    id: data.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    body: data.body || "",
    url: data.url || "/inicio",
    tag: data.tag || "",
    emoji: data.emoji || "",
    ts: data.ts || Date.now(),
  };

  event.waitUntil(
    Promise.all([
      // Persistir en IndexedDB del SW (incluso sin cliente activo)
      addNotifToDB(notif).catch(() => {}),
      // Reenviar a la app si está abierta
      broadcastToClients(notif).catch(() => {}),
      self.registration.showNotification(title, {
        body: data.body || "",
        icon: "/keto/logo.svg",
        // Badge = smallIcon de la barra de estado en Android.
        // Debe ser silueta blanca con fondo transparente; si es opaco,
        // Android muestra un cuadrado blanco.
        badge: data.badge || "/keto/logo-badge.png",
        tag: data.tag || undefined,
        vibrate: [100, 50, 100],
        requireInteraction: true,
        data: { url: data.url || "/inicio", notif },
      }),
    ])
  );
});

// El clic en la notificación del SO: NO redirige a la app.
// Solo enfoca la ventana abierta (o la abre) y le envía el payload
// completo para que la app lo muestre en su centro de notificaciones.
self.addEventListener("notificationclick", (event) => {
  const data = (event.notification && event.notification.data) || {};
  const notif = data.notif || {
    title: event.notification ? event.notification.title : "",
    body: event.notification ? event.notification.body : "",
    url: data.url || "/inicio",
    tag: "",
    emoji: "",
    ts: Date.now(),
  };

  // No cerramos aquí de forma agresiva; la info ya está guardada y la
  // app la mostrará. Enfocamos sin cambiar la ruta de navegación.
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        const client = clientList[0];
        if (client.postMessage) {
          client.postMessage({ type: "KETO_PUSH", payload: notif, focus: true });
        }
        return client.focus ? client.focus() : Promise.resolve();
      }
      // No hay app abierta: abre la URL base (NO la URL de acción) y luego
      // la app recuperará la notificación de IndexedDB.
      const target = "/inicio";
      return self.clients.openWindow(target).then((win) => {
        if (win && win.postMessage) {
          win.postMessage({ type: "KETO_PUSH", payload: notif, focus: true });
        }
        return win;
      });
    })
  );
});

// La app le pide al SW el historial al arrancar (o al abrir el centro).
self.addEventListener("message", (event) => {
  const data = event.data || {};
  const msgType = typeof data === "string" ? data : data.type;

  if (msgType === "KETO_GET_NOTIFS") {
    readAllNotifsFromDB()
      .then((list) => {
        const sorted = (list || []).slice().sort((a, b) => (b.ts || 0) - (a.ts || 0));
        if (event.source && event.source.postMessage) {
          event.source.postMessage({ type: "KETO_NOTIFS", notifications: sorted });
        }
      })
      .catch(() => {});
    return;
  }

  if (msgType === "KETO_CLEAR_NOTIFS") {
    clearNotifsFromDB().catch(() => {});
    return;
  }
});
