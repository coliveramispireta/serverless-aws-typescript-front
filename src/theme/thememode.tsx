"use client";
import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type ThemeMode = "light" | "dark";

interface ThemeModeState {
  mode: ThemeMode;
  toggle: () => void;
}

const ThemeModeContext = createContext<ThemeModeState | undefined>(undefined);
const STORAGE_KEY = "kf-mode";

/** Modo inicial: lo guardado en localStorage o la preferencia del sistema */
function getInitialMode(): ThemeMode {
  if (typeof window === "undefined") return "light";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    /* storage bloqueado */
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/**
 * Proveedor del modo de tema (claro/oscuro) con persistencia.
 * Arranca en "light" y ajusta en useEffect para evitar mismatch de hidratación.
 */
export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("light");

  // Restaurar preferencia después de montar
  useEffect(() => {
    setMode(getInitialMode());
  }, []);

  // Exponer el modo en <html data-kf-theme="…"> para estilos globales
  useEffect(() => {
    document.documentElement.dataset.kfTheme = mode;
  }, [mode]);

  const toggle = useCallback(() => {
    setMode((prev) => {
      const next: ThemeMode = prev === "light" ? "dark" : "light";
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* storage bloqueado */
      }
      return next;
    });
  }, []);

  const value = useMemo(() => ({ mode, toggle }), [mode, toggle]);

  return <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>;
}

export function useThemeMode(): ThemeModeState {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) throw new Error("useThemeMode debe usarse dentro de ThemeModeProvider");
  return ctx;
}
