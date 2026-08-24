import { UserProfile } from "@/model/keto.models";
import { getUserInfo } from "@/services/xstorage.cross.service";

/**
 * Preferencias locales del perfil (altura, objetivo) mientras el backend
 * no expone el endpoint de perfil. Persistidas en localStorage por usuario.
 */

const KEY_PREFIX = "keto-profile-prefs:";

export interface ProfilePrefs {
  alturaCm?: number;
  pesoObjetivoKg?: number;
}

function key(): string {
  const userInfo = getUserInfo();
  return `${KEY_PREFIX}${userInfo.email || "anon"}`;
}

export function getProfilePrefs(): ProfilePrefs {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(key());
    return raw ? (JSON.parse(raw) as ProfilePrefs) : {};
  } catch {
    return {};
  }
}

export function saveProfilePrefs(prefs: ProfilePrefs): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key(), JSON.stringify(prefs));
}

/** Perfil base del usuario logueado a partir de la sesión */
export function buildLocalUserProfile(): UserProfile {
  const userInfo = getUserInfo();
  return {
    userId: userInfo.id || userInfo.email,
    email: userInfo.email,
    nombre: userInfo.userName,
    fotoUrl: userInfo.photoURL,
    rol: "usuario",
  };
}
