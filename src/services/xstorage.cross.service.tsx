"use client";
import { ROLES } from "@/app/global";
import { ProfileKeys } from "../context/pagecontext/pagecontext";
import { DatosUsuarioState } from "../context/usercontext/usercontext";

/**
 * Storage PERSISTENTE (localStorage, no sessionStorage):
 * la sesión sobrevive al cierre de pestaña/app — estilo WhatsApp.
 * La expiración real la maneja el refresh token de Cognito (~30 días,
 * configurable en consola) junto con el interceptor que renueva el idToken.
 */

const USER_INFO = "user-info";
const REFRESHED_USERPROFILE = "refresshed-userprofile";
const USER_TOKEN = "auth-token";
const REFRESH_TOKEN = "refresh-auth-token";
const FIRST_LOAD = "first-load";

const initialState: DatosUsuarioState = {
  id: "",
  email: "",
  userName: "",
  phoneNumber: "",
  role: ROLES.INVITADO,
  isLogged: false,
  photoURL: "",
};

/** Migración one-time: si había datos en sessionStorage (versión anterior), traerlos */
function migrateFromSessionStorage(): void {
  if (typeof window === "undefined") return;
  try {
    const pairs: [string, string][] = [
      [USER_INFO, "user-info"],
      [USER_TOKEN, "auth-token"],
      [REFRESH_TOKEN, "refresh-auth-token"],
      [REFRESHED_USERPROFILE, REFRESHED_USERPROFILE],
      [FIRST_LOAD, FIRST_LOAD],
    ];
    for (const [localKey, sessionKey] of pairs) {
      const localValue = window.localStorage.getItem(localKey);
      const sessionValue = window.sessionStorage.getItem(sessionKey);
      if (!localValue && sessionValue) {
        window.localStorage.setItem(localKey, sessionValue);
      }
    }
  } catch {
    /* storage bloqueado */
  }
}
migrateFromSessionStorage();

export function clean(): void {
  window.localStorage.clear();
}

export function setUserInfo(state: DatosUsuarioState): void {
  window.localStorage.removeItem(USER_INFO);
  window.localStorage.setItem(USER_INFO, JSON.stringify(state));
}
export function setUserProfile(profile: ProfileKeys): void {
  window.localStorage.removeItem(REFRESHED_USERPROFILE);
  window.localStorage.setItem(REFRESHED_USERPROFILE, profile);
}

export function getUserProfile(): ProfileKeys {
  if (typeof window !== "undefined") {
    return window.localStorage.getItem(REFRESHED_USERPROFILE) as ProfileKeys;
  }
  return "pristine";
}

export function setGlobalFirstLoad(firstLoad: boolean): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(FIRST_LOAD);
    window.localStorage.setItem(FIRST_LOAD, firstLoad.toString());
  }
}

export function getGlobalFirstLoad(): boolean {
  const firstLoad = window.localStorage.getItem(FIRST_LOAD);

  return (window.localStorage.getItem(FIRST_LOAD) as string) == "true";
}

/**
 * Marca local de "onboarding visto" (scoped por usuario, no por navegador).
 * Fast-path offline; el source of truth es el perfil del usuario (backend).
 */
function onboardingKey(): string {
  const userInfo = getUserInfo();
  const scope = userInfo.id || userInfo.email || "anon";
  return `kf-onboarding-done:${scope}`;
}

export function setOnboardingDone(done: boolean): void {
  if (typeof window !== "undefined") {
    const key = onboardingKey();
    window.localStorage.removeItem(key);
    window.localStorage.setItem(key, done.toString());
  }
}

export function getOnboardingDone(): boolean {
  if (typeof window !== "undefined") {
    return window.localStorage.getItem(onboardingKey()) === "true";
  }
  return false;
}

export function setToken(token: any): void {
  window.localStorage.removeItem(USER_TOKEN);
  window.localStorage.setItem(USER_TOKEN, token);
}

export function setRefreshToken(refreshToken: any): void {
  window.localStorage.removeItem(REFRESH_TOKEN);
  window.localStorage.setItem(REFRESH_TOKEN, refreshToken);
}

export function getToken(): string {
  return window.localStorage.getItem(USER_TOKEN) as string;
}

export function getRefreshToken(): string {
  return window.localStorage.getItem(REFRESH_TOKEN) as string;
}

export function getUserInfo(): DatosUsuarioState {
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(USER_INFO);
      return raw ? { ...initialState, ...(JSON.parse(raw) as DatosUsuarioState) } : initialState;
    } catch (err) {
      // Storage corrupto: limpiar y tratar como invitado (NUNCA crashear en render)
      console.warn("getUserInfo: storage corrupto, se restablece", err);
      window.localStorage.removeItem(USER_INFO);
      return initialState;
    }
  }
  return initialState;
}

export function cleanData() {
  window.localStorage.removeItem(USER_TOKEN);
  window.localStorage.removeItem(USER_INFO);
}

export function cleanToken() {
  window.localStorage.removeItem(USER_TOKEN);
}
