"use client";
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getUserInfo } from "@/services/xstorage.cross.service";
import {
  AppNotification,
  clearNotifications,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  unreadCount,
  upsertNotification,
} from "@/lib/notificationsstore";

interface NotificationsContextValue {
  notifications: AppNotification[];
  unread: number;
  /** Pide al SW el historial (notifs que llegaron con la app cerrada) */
  syncFromSW: () => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

/**
 * Gestión del centro de notificaciones:
 *  - Escucha los mensajes del Service Worker (KETO_PUSH) y BroadcastChannel.
 *  - Persiste en localStorage por usuario (localForage-like, cap 50 / 30 días).
 *  - Expone lista, contador de no leídas y acciones (leer / todas / vaciar).
 *
 * El SW envía cada push recibido (incluso con la app cerrada lo guarda en su
 * IndexedDB) y la app lo recupera con `syncFromSW()` al arrancar y al abrir.
 */
export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const workerRef = useRef<ServiceWorkerRegistration | null>(null);

  // userId actual (para la clave de localStorage)
  useEffect(() => {
    const user = getUserInfo();
    setUserId(user.id || user.email || null);
  }, []);

  const handlePush = useCallback(
    (notif: AppNotification, focus?: boolean) => {
      const uid = userId || getUserInfo().id || getUserInfo().email || "anon";
      if (!uid) return;
      setNotifications(() => upsertNotification(uid, notif));
      if (focus) {
        // La app fue enfocada desde una notificación: opcionalmente abrir el centro,
        // pero NO navegar a la URL de acción. Simplemente actualizamos.
        return;
      }
    },
    [userId]
  );

  // Escuchar mensajes del SW + BroadcastChannel + recuperar historia al montar
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const onMessage = (event: MessageEvent) => {
      const data = event.data || {};
      if (!data || !data.type) return;
      if (data.type === "KETO_PUSH" && data.payload) {
        handlePush(data.payload, Boolean(data.focus));
      } else if (data.type === "KETO_NOTIFS" && Array.isArray(data.notifications)) {
        const uid = userId || getUserInfo().id || getUserInfo().email || "anon";
        if (!uid) return;
        const stored = listNotifications(uid);
        const storedIds = new Set(stored.map((n) => n.id));
        const missing = (data.notifications as AppNotification[]).filter(
          (n) => !storedIds.has(n.id)
        );
        if (missing.length > 0) {
          let updated = stored.slice();
          for (const n of missing) updated = upsertNotification(uid, n);
          updated = updated.slice().sort((a, b) => (b.ts || 0) - (a.ts || 0));
          setNotifications(updated);
        }
      }
    };

    // Mensajes directos de navigator.serviceWorker
    navigator.serviceWorker.addEventListener("message", onMessage);

    // BroadcastChannel como canal redundante
    let channel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== "undefined") {
      try {
        channel = new BroadcastChannel("kf-push");
        channel.onmessage = (e: MessageEvent) => {
          const data = e.data || {};
          if (data && data.type === "KETO_PUSH" && data.payload) {
            handlePush(data.payload, Boolean(data.focus));
          }
        };
      } catch {
        channel = null;
      }
    }

    navigator.serviceWorker.getRegistration().then((reg) => {
      if (reg) workerRef.current = reg;
      // Recuperar el historial que pudo quedar en IndexedDB del SW
      const active = reg?.active as ServiceWorker | null;
      if (active && active.postMessage) {
        active.postMessage({ type: "KETO_GET_NOTIFS" });
      }
    });

    return () => {
      navigator.serviceWorker.removeEventListener("message", onMessage);
      if (channel) channel.close();
    };
  }, [handlePush, userId]);

  const syncFromSW = useCallback(() => {
    const active = workerRef.current?.active as ServiceWorker | null;
    if (active && active.postMessage) {
      active.postMessage({ type: "KETO_GET_NOTIFS" });
    }
  }, []);

  const markRead = useCallback(
    (id: string) => {
      const uid = userId || getUserInfo().id || getUserInfo().email || "anon";
      if (!uid) return;
      setNotifications(() => markNotificationRead(uid, id));
    },
    [userId]
  );

  const markAllRead = useCallback(() => {
    const uid = userId || getUserInfo().id || getUserInfo().email || "anon";
    if (!uid) return;
    setNotifications(() => markAllNotificationsRead(uid));
  }, [userId]);

  const clearAll = useCallback(() => {
    const uid = userId || getUserInfo().id || getUserInfo().email || "anon";
    if (!uid) return;
    setNotifications(() => clearNotifications(uid));
    // Limpiar también el historial del SW (IndexedDB)
    const active = workerRef.current?.active as ServiceWorker | null;
    if (active && active.postMessage) {
      active.postMessage({ type: "KETO_CLEAR_NOTIFS" });
    }
  }, [userId]);

  // Cargar el estado inicial desde localStorage
  useEffect(() => {
    if (!userId) return;
    setNotifications(listNotifications(userId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const unread = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const value = useMemo(
    () => ({
      notifications,
      unread,
      syncFromSW,
      markRead,
      markAllRead,
      clearAll,
    }),
    [notifications, unread, syncFromSW, markRead, markAllRead, clearAll]
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications debe usarse dentro de NotificationsProvider");
  return ctx;
}
