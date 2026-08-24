"use client";
import { useCallback, useEffect, useState } from "react";
import { axiosInstanceLambda } from "@/interceptors/interceptors";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

export type PushPermission = "granted" | "denied" | "default" | "unsupported";

interface PushState {
  supported: boolean;
  permission: PushPermission;
  subscribed: boolean;
  isStandalone: boolean;
  busy: boolean;
}

/** Convierte la clave base64url a Uint8Array (requerido por pushManager) */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}

/**
 * Gestión de notificaciones Web Push:
 * - supported: el navegador soporta push (iOS requiere app instalada)
 * - enable(): pide permiso, suscribe y registra en el backend
 * - disable(): cancela suscripción local y en backend
 */
export default function usePush() {
  const [state, setState] = useState<PushState>({
    supported: false,
    permission: "default",
    subscribed: false,
    isStandalone: false,
    busy: false,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    const supported =
      "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

    if (!supported) {
      setState((s) => ({ ...s, supported: false, permission: "unsupported", isStandalone: standalone }));
      return;
    }

    let cancelled = false;
    navigator.serviceWorker.ready
      .then(async (reg) => {
        const existing = await reg.pushManager.getSubscription().catch(() => null);
        if (cancelled) return;
        setState({
          supported: true,
          permission: Notification.permission,
          subscribed: !!existing && !!VAPID_PUBLIC_KEY,
          isStandalone: standalone,
          busy: false,
        });
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);

  const enable = useCallback(async (): Promise<boolean> => {
    if (!VAPID_PUBLIC_KEY) {
      console.warn("usePush: falta NEXT_PUBLIC_VAPID_PUBLIC_KEY");
      return false;
    }
    setState((s) => ({ ...s, busy: true }));

    try {
      // 1. Permiso
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState((s) => ({ ...s, permission, busy: false }));
        return false;
      }

      // 2. Suscripción
      const reg = await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();
      const sub =
        existing ??
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        }));

      const json = sub.toJSON() as { endpoint?: string; keys?: Record<string, string> };
      if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) throw new Error("bad sub");

      // 3. Registrar en backend
      await axiosInstanceLambda.post("/notifications/subscriptions", {
        endpoint: json.endpoint,
        keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
        plataforma: navigator.platform || undefined,
      });

      setState((s) => ({ ...s, permission: "granted", subscribed: true, busy: false }));
      return true;
    } catch (err) {
      console.error("usePush enable:", err);
      setState((s) => ({ ...s, busy: false }));
      return false;
    }
  }, []);

  const disable = useCallback(async (): Promise<void> => {
    setState((s) => ({ ...s, busy: true }));
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        try {
          await axiosInstanceLambda.delete("/notifications/subscriptions", {
            data: { endpoint: sub.endpoint },
          });
        } catch {
          /* backend no disponible: cancelar igual localmente */
        }
        await sub.unsubscribe();
      }
      setState((s) => ({ ...s, subscribed: false, busy: false }));
    } catch {
      setState((s) => ({ ...s, busy: false }));
    }
  }, []);

  return { ...state, enable, disable };
}
