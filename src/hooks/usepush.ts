"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { axiosInstanceLambda } from "@/interceptors/interceptors";
import { getUserInfo } from "@/services/xstorage.cross.service";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const PENDING_KEY = "kf-push-pending";

export type PushPermission = "granted" | "denied" | "default" | "unsupported";

interface SubJSON {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i);
  return output;
}

async function getRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return null;
  try {
    return await navigator.serviceWorker.ready;
  } catch {
    return null;
  }
}

export interface PushState {
  supported: boolean;
  permission: PushPermission;
  subscribed: boolean;
  /** Suscripción hecha como invitado, pendiente de registrar tras login */
  pendingRegister: boolean;
  busy: boolean;
  isStandalone: boolean;
}

/**
 * Gestión de notificaciones Web Push.
 * - enable(): flujo completo para usuarios autenticados
 * - subscribeGuest(): pide permiso y suscribe en páginas públicas (/login, /instalar);
 *   la suscripción queda PENDIENTE y se registra en backend al iniciar sesión
 *   (flushPendingRegistration, llamado desde el AppShell)
 */
export default function usePush() {
  const [state, setState] = useState<PushState>({
    supported: false,
    permission: "default",
    subscribed: false,
    pendingRegister: false,
    busy: false,
    isStandalone: false,
  });

  // Estado inicial
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
    void (async () => {
      const reg = await getRegistration();
      const sub = reg ? await reg.pushManager.getSubscription().catch(() => null) : null;
      const pending = !!window.localStorage.getItem(PENDING_KEY);
      if (cancelled) return;
      setState({
        supported: true,
        permission: Notification.permission,
        subscribed: (!!sub || pending) && !!VAPID_PUBLIC_KEY,
        pendingRegister: pending && !sub,
        busy: false,
        isStandalone: standalone,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  /** Permiso + suscripción local. Devuelve el JSON listo para el backend o null */
  const subscribeInBrowser = useCallback(async (): Promise<SubJSON | null> => {
    if (!VAPID_PUBLIC_KEY) {
      console.warn("usePush: falta NEXT_PUBLIC_VAPID_PUBLIC_KEY");
      return null;
    }
    const permission = await Notification.requestPermission();
    setState((s) => ({ ...s, permission: permission as PushPermission }));
    if (permission !== "granted") return null;

    const reg = await getRegistration();
    if (!reg) return null;

    const existing = await reg.pushManager.getSubscription().catch(() => null);
    const sub =
      existing ??
      (await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      }));

    const json = sub.toJSON() as SubJSON;
    if (!json.endpoint || !json.keys?.p256dh || !json.keys.auth) throw new Error("bad subscription");
    return json;
  }, []);

  const postSubscription = useCallback(async (json: SubJSON): Promise<boolean> => {
    try {
      await axiosInstanceLambda.post("/notifications/subscriptions", {
        endpoint: json.endpoint,
        keys: json.keys,
        plataforma: typeof navigator !== "undefined" ? navigator.platform || undefined : undefined,
      });
      return true;
    } catch (err) {
      console.error("postSubscription:", err);
      return false;
    }
  }, []);

  /** Registra en backend una suscripción hecha antes del login */
  const flushPendingRegistration = useCallback(async (): Promise<void> => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(PENDING_KEY);
      if (!raw || !getUserInfo().isLogged) return;
      const json = JSON.parse(raw) as SubJSON;
      const ok = await postSubscription(json);
      if (ok) {
        window.localStorage.removeItem(PENDING_KEY);
        setState((s) => ({ ...s, subscribed: true, pendingRegister: false }));
        console.log("usePush: suscripción pendiente registrada ✔");
      }
    } catch (err) {
      console.warn("flushPendingRegistration:", err);
    }
  }, [postSubscription]);

  // Tras iniciar sesión, registrar la suscripción pendiente
  useEffect(() => {
    void flushPendingRegistration();
  }, [flushPendingRegistration]);

  /** Flujo completo (usuario autenticado, ej. banner en inicio / toggle perfil) */
  const enable = useCallback(async (): Promise<boolean> => {
    setState((s) => ({ ...s, busy: true }));
    try {
      const json = await subscribeInBrowser();
      if (!json) {
        setState((s) => ({ ...s, busy: false }));
        return false;
      }
      const ok = await postSubscription(json);
      if (ok) window.localStorage.removeItem(PENDING_KEY);
      setState((s) => ({ ...s, permission: "granted", subscribed: ok, busy: false }));
      return ok;
    } catch (err) {
      console.error("usePush enable:", err);
      setState((s) => ({ ...s, busy: false }));
      return false;
    }
  }, [subscribeInBrowser, postSubscription]);

  /** Solo permiso + suscripción local (páginas públicas). Queda pendiente de registro */
  const subscribeGuest = useCallback(async (): Promise<boolean> => {
    setState((s) => ({ ...s, busy: true }));
    try {
      const json = await subscribeInBrowser();
      if (!json) {
        setState((s) => ({ ...s, busy: false }));
        return false;
      }
      window.localStorage.setItem(PENDING_KEY, JSON.stringify(json));
      setState((s) => ({ ...s, permission: "granted", pendingRegister: true, busy: false }));
      return true;
    } catch (err) {
      console.error("subscribeGuest:", err);
      setState((s) => ({ ...s, busy: false }));
      return false;
    }
  }, [subscribeInBrowser]);

  const disable = useCallback(async (): Promise<void> => {
    setState((s) => ({ ...s, busy: true }));
    try {
      window.localStorage.removeItem(PENDING_KEY);
      const reg = await getRegistration();
      const sub = reg ? await reg.pushManager.getSubscription().catch(() => null) : null;
      if (sub) {
        try {
          await axiosInstanceLambda.delete("/notifications/subscriptions", {
            data: { endpoint: sub.endpoint },
          });
        } catch {
          /* cancelar igual localmente */
        }
        await sub.unsubscribe();
      }
      setState((s) => ({ ...s, subscribed: false, pendingRegister: false, busy: false }));
    } catch {
      setState((s) => ({ ...s, busy: false }));
    }
  }, []);

  /**
   * 🧪 PRUEBA: reenvía la suscripción actual al backend → este responde
   * reenviando el push de BIENVENIDA. Útil para verificar el pipeline
   * (VAPID/SSM/SW) sin esperar a los crons.
   */
  const test = useCallback(async (): Promise<boolean> => {
    setState((s) => ({ ...s, busy: true }));
    try {
      let json: SubJSON | null = null;
      const reg = await getRegistration();
      if (reg) {
        const sub = await reg.pushManager.getSubscription().catch(() => null);
        if (sub) json = sub.toJSON() as SubJSON;
      }

      if (!json) {
        // No suscrito aún: hacer flujo completo primero
        const okEnable = await enable();
        if (!okEnable) {
          setState((s) => ({ ...s, busy: false }));
          return false;
        }
        const reg2 = await getRegistration();
        if (!reg2) return false;
        const sub2 = await reg2.pushManager.getSubscription().catch(() => null);
        if (!sub2) return false;
        json = sub2.toJSON() as SubJSON;      }

      const ok = await postSubscription(json as SubJSON);
      if (!ok) {
        // NO tocar subscribed: el dispositivo sigue suscrito localmente
        setState((s) => ({ ...s, busy: false }));
        return false;
      }
      window.localStorage.removeItem(PENDING_KEY);
      setState((s) => ({ ...s, subscribed: true, busy: false }));
      return true;
    } catch (err) {
      console.error("usePush test:", err);
      setState((s) => ({ ...s, busy: false }));
      return false;
    }
  }, [enable, postSubscription]);

  return useMemo(
    () => ({ ...state, enable, disable, subscribeGuest, flushPendingRegistration, test }),
    [state, enable, disable, subscribeGuest, flushPendingRegistration, test]
  );
}
