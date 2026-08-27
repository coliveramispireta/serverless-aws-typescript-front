"use client";
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getProfile, updateProfile } from "@/services/keto/profile.service";
import {
  getOnboardingDone,
  getUserInfo,
  setOnboardingDone,
} from "@/services/xstorage.cross.service";

interface OnboardingContextValue {
  introOpen: boolean;
  tourOpen: boolean;
  openIntro: () => void;
  closeIntro: () => void;
  openTour: () => void;
  closeTour: () => void;
  /** Cierra la intro y persiste que el onboarding ya fue visto (server + local) */
  finishIntro: () => void;
}

const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined);

/**
 * Gestión del onboarding de bienvenida y el recorrido de ayuda.
 *
 * Gate de primer ingreso (requisito: mostrar sólo la primera vez, por CUENTA):
 *  1. Fuente de verdad = perfil del usuario (backend): campo `onboardingDone`.
 *  2. Fast-path offline en localStorage (`kf-onboarding-done`).
 *  3. Si `getProfile()` falla (sin red), se muestra la intro igualmente y la
 *     sincronización con el servidor se reintenta en el próximo login.
 */
export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [introOpen, setIntroOpen] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const userInfo = getUserInfo();
    if (!userInfo.isLogged) return;

    // Ya lo vio en este navegador → no vuelve a aparecer.
    if (getOnboardingDone()) return;

    let cancelled = false;
    void (async () => {
      try {
        const profile = await getProfile();
        if (cancelled) return;
        if (profile.onboardingDone) {
          setOnboardingDone(true);
        } else {
          setIntroOpen(true);
        }
      } catch {
        // Fallback sin red: mostrar la intro igualmente (persistencia local).
        if (!cancelled) setIntroOpen(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const openIntro = useCallback(() => setIntroOpen(true), []);
  const closeIntro = useCallback(() => setIntroOpen(false), []);
  const openTour = useCallback(() => setTourOpen(true), []);
  const closeTour = useCallback(() => setTourOpen(false), []);

  const finishIntro = useCallback(() => {
    setIntroOpen(false);
    setOnboardingDone(true);
    // Fuente de verdad en el perfil (server). Fire-and-forget con tolerancia a fallo.
    void updateProfile({ onboardingDone: true }).catch((err) => {
      console.warn("finishIntro: no se pudo sincronizar el onboarding en el servidor", err);
    });
  }, []);

  const value = useMemo(
    () => ({
      introOpen,
      tourOpen,
      openIntro,
      closeIntro,
      openTour,
      closeTour,
      finishIntro,
    }),
    [introOpen, tourOpen, openIntro, closeIntro, openTour, closeTour, finishIntro]
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboarding debe usarse dentro de OnboardingProvider");
  return ctx;
}