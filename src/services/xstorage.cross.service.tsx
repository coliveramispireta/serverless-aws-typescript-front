"use client";
import { ROLES } from "@/app/global";
import { ProfileKeys } from "../context/pagecontext/pagecontext";
import { DatosUsuarioState } from "../context/usercontext/usercontext";

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

export function clean(): void {
  window.sessionStorage.clear();
}

export function setUserInfo(state: DatosUsuarioState): void {
  window.sessionStorage.removeItem(USER_INFO);
  window.sessionStorage.setItem(USER_INFO, JSON.stringify(state));
}
export function setUserProfile(profile: ProfileKeys): void {
  window.sessionStorage.removeItem(REFRESHED_USERPROFILE);
  window.sessionStorage.setItem(REFRESHED_USERPROFILE, profile);
}

export function getUserProfile(): ProfileKeys {
  if (typeof window !== "undefined") {
    return window.sessionStorage.getItem(REFRESHED_USERPROFILE) as ProfileKeys;
  }
  return "pristine";
}

export function setGlobalFirstLoad(firstLoad: boolean): void {
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(FIRST_LOAD);
    window.sessionStorage.setItem(FIRST_LOAD, firstLoad.toString());
  }
}

export function getGlobalFirstLoad(): boolean {
  let firstLoad = window.sessionStorage.getItem(FIRST_LOAD);

  return (window.sessionStorage.getItem(FIRST_LOAD) as string) == "true";
}

export function setToken(token: any): void {
  window.sessionStorage.removeItem(USER_TOKEN);
  window.sessionStorage.setItem(USER_TOKEN, token);
}

export function setRefreshToken(refreshToken: any): void {
  window.sessionStorage.removeItem(REFRESH_TOKEN);
  window.sessionStorage.setItem(REFRESH_TOKEN, refreshToken);
}

export function getToken(): string {
  return window.sessionStorage.getItem(USER_TOKEN) as string;
}

export function getRefreshToken(): string {
  return window.sessionStorage.getItem(REFRESH_TOKEN) as string;
}

export function getUserInfo(): DatosUsuarioState {
  if (typeof window !== "undefined") {
    var userInfo = window.sessionStorage.getItem(USER_INFO);
    var parsed = userInfo ? JSON.parse(userInfo) : initialState;
    return parsed;
  }
  return initialState;
}

export function cleanData() {
  window.sessionStorage.removeItem(USER_TOKEN);
  window.sessionStorage.removeItem(USER_INFO);
}

export function cleanToken() {
  window.sessionStorage.removeItem(USER_TOKEN);
}
