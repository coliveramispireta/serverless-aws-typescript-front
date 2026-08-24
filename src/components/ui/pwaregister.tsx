"use client";
import { useEffect } from "react";

/**
 * Registra el service worker de la PWA (solo en builds de producción).
 */
export default function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const isProd = process.env.NODE_ENV === "production" && process.env.APP_ENV !== "local";
    if (!isProd) return;

    const register = () => {
      navigator.serviceWorker
        .register("/keto/sw.js")
        .catch((err) => console.warn("PWA: no se pudo registrar el service worker:", err));
    };

    window.addEventListener("load", register);
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
