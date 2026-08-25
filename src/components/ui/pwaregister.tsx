"use client";
import { useEffect } from "react";

/**
 * Registra el Service Worker en la RAÍZ del sitio (scope "/")
 * para que controle todas las páginas — imprescindible para
 * notificaciones push fuera de /keto/.
 * También limpia registros legacy con scope /keto/ de versiones anteriores.
 */
export default function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const isProd = process.env.NODE_ENV === "production" && process.env.APP_ENV !== "local";
    if (!isProd) return;

    const register = async () => {
      try {
        await navigator.serviceWorker.register("/sw.js", { scope: "/" });

        // Limpieza de registros legacy (scope /keto/ no controlaba páginas)
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const r of regs) {
          if (r.active?.scriptURL.includes("/keto/sw.js")) {
            await r.unregister().catch(() => undefined);
          }
        }
      } catch (err) {
        console.warn("PWA: no se pudo registrar el service worker:", err);
      }
    };

    if (document.readyState === "complete") {
      void register();
    } else {
      window.addEventListener("load", register);
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}
