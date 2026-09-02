"use client";

import {
  signIn,
  signUp,
  confirmSignUp,
  getCurrentUser,
  fetchAuthSession,
  signOut,
  resendSignUpCode,
  resetPassword,
  confirmResetPassword,
  signInWithRedirect,
  autoSignIn,
} from "aws-amplify/auth";
import { Amplify } from "aws-amplify";
import { awsConfig } from "../../aws.config";

import { cleanData, setToken, setUserInfo } from "./xstorage.cross.service";
import { mapDatosUsuario } from "./utils.cross.services";

// ============================================================
// Errores de autenticación → mensajes claros en español
// ============================================================

/** Clave canónica del error (para que la UI pueda reaccionar) */
export type AuthErrorCode =
  | "USER_NOT_FOUND"
  | "BAD_CREDENTIALS"
  | "NOT_CONFIRMED"
  | "CODE_MISMATCH"
  | "CODE_EXPIRED"
  | "TOO_MANY_ATTEMPTS"
  | "EMAIL_EXISTS"
  | "INVALID_PASSWORD"
  | "INVALID_PARAMS"
  | "RESET_REQUIRED"
  | "NETWORK"
  | "GENERIC";

function detectAuthErrorCode(error: any): AuthErrorCode {
  const name = String(error?.name ?? error?.__type ?? "");
  const msg = String(error?.message ?? "");
  const combined = `${name} ${msg}`.toLowerCase();

  if (name === "UserNotFoundException" || combined.includes("user does not exist") || combined.includes("usernotfound"))
    return "USER_NOT_FOUND";
  if (combined.includes("not confirmed") || combined.includes("usernotconfirmed"))
    return "NOT_CONFIRMED";
  if (name === "CodeMismatchException" || combined.includes("code mismatch"))
    return "CODE_MISMATCH";
  if (name === "ExpiredCodeException" || combined.includes("expired code") || combined.includes("invalid code provided"))
    return "CODE_EXPIRED";
  if (name === "LimitExceededException" || combined.includes("attempt limit") || combined.includes("limit exceeded"))
    return "TOO_MANY_ATTEMPTS";
  if (combined.includes("too many requests"))
    return "TOO_MANY_ATTEMPTS";
  if (name === "UsernameExistsException" || combined.includes("user already exists"))
    return "EMAIL_EXISTS";
  if (name === "InvalidPasswordException" || combined.includes("invalid password"))
    return "INVALID_PASSWORD";
  if (name === "InvalidParameterException" || combined.includes("invalid parameter"))
    return "INVALID_PARAMS";
  if (combined.includes("password reset required"))
    return "RESET_REQUIRED";
  if (combined.includes("network") || combined.includes("failed to fetch") || combined.includes("timeout"))
    return "NETWORK";
  if (combined.includes("incorrect username") || combined.includes("incorrect password") || name === "NotAuthorizedException")
    return "BAD_CREDENTIALS";
  return "GENERIC";
}

const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  USER_NOT_FOUND: "El usuario no existe. Verifica tu correo o crea una cuenta.",
  BAD_CREDENTIALS: "Credenciales incorrectas. Revisa tu correo y contraseña.",
  NOT_CONFIRMED: "Tu correo aún no está verificado. Revisa el código que te enviamos.",
  CODE_MISMATCH: "El código es incorrecto. Revísalo e intenta de nuevo.",
  CODE_EXPIRED: "El código expiró o ya fue usado. Solicita uno nuevo.",
  TOO_MANY_ATTEMPTS: "Demasiados intentos. Espera unos minutos e inténtalo de nuevo.",
  EMAIL_EXISTS: "El correo ya está registrado. Inicia sesión con tu contraseña.",
  INVALID_PASSWORD: "La contraseña no cumple los requisitos (mínimo 8 caracteres, una mayúscula y un caracter especial).",
  INVALID_PARAMS: "Datos inválidos. Revisa el correo, la contraseña y el código ingresado.",
  RESET_REQUIRED: "Debes restablecer tu contraseña antes de continuar.",
  NETWORK: "Problema de conexión. Verifica tu internet e inténtalo de nuevo.",
  GENERIC: "Ocurrió un error inesperado. Intenta de nuevo.",
};

/** Traduce cualquier error de Cognito/Amplify a un mensaje claro en español */
export function mapAuthError(error: unknown): string {
  const key = detectAuthErrorCode(error);
  const raw = String((error as any)?.message ?? "").trim();
  // Mensaje del banco salvo que sea genérico y haya texto útil del SDK
  if (key === "GENERIC" && raw && !raw.toLowerCase().includes("error")) return raw;
  return AUTH_ERROR_MESSAGES[key];
}

/** Lanza un Error con mensaje en español y .code para que la UI reaccione */
function throwMapped(error: unknown): never {
  const e = new Error(mapAuthError(error)) as Error & { code?: AuthErrorCode };
  e.code = detectAuthErrorCode(error);
  throw e;
}

// ============================================================
// Registro con verificación por código
// ============================================================

/**
 * Paso 1 del registro: crea el usuario NO confirmado.
 * Cognito envía el código de verificación al correo.
 * El usuario debe validar con verifySignupCode() antes de iniciar sesión.
 */
export async function createUser(model: { email: string; password: string; displayName: string }) {
  try {
    console.log("model:", model);
    await signUp({
      username: model.email,
      password: model.password,
      options: {
        userAttributes: {
          email: model.email,
          name: model.displayName,
        },
      },
    });
    console.log("Usuario creado (pendiente de verificación)");
    return { needsVerification: true as const, email: model.email };
  } catch (error) {
    throwMapped(error);
  }
}

/** Reenvía el código de verificación al correo indicado */
export async function resendVerificationCode(email: string): Promise<string> {
  try {
    await resendSignUpCode({ username: email });
    return "Código reenviado. Revisa tu correo (y la carpeta de spam).";
  } catch (error) {
    throwMapped(error);
  }
}

/**
 * Paso 2 del registro: valida el código y, si es correcto,
 * inicia sesión automáticamente con las credenciales registradas.
 */
export async function verifySignupCode(model: { email: string; password: string; code: string }) {
  try {
    await confirmSignUp({
      username: model.email,
      confirmationCode: model.code,
    });
    console.log("Correo verificado ✔");
    await loginWithEmail({ email: model.email, password: model.password });
    return true;
  } catch (error) {
    throwMapped(error);
  }
}

/**
 * Purga la sesión residual de Amplify/Cognito del storage.
 *
 * Sin esto, si al llegar al login queda una sesión previa firmada, `signIn` /
 * `signInWithRedirect` fallan con "There is already a signed in user".
 * NO usamos signOut() (con OAuth redirigiría al logout de Cognito y rompía el
 * login). Esto borra directamente las claves del storage de Amplify.
 */
let amplifyCleared = false;
function clearAmplifySession() {
  if (amplifyCleared) return; // idempotente por carga de página
  amplifyCleared = true;
  try {
    const clientId = String((awsConfig as any).aws_user_pools_web_client_id ?? "");
    const prefix = clientId ? `CognitoIdentityServiceProvider.${clientId}.` : "CognitoIdentityServiceProvider.";
    for (const store of [window.sessionStorage, window.localStorage]) {
      const toRemove: string[] = [];
      for (let i = 0; i < store.length; i++) {
        const k = store.key(i);
        if (k && (k.startsWith(prefix) || k === "LastAuthUser" || k.startsWith("CognitoIdentityServiceProvider"))) {
          toRemove.push(k);
        }
      }
      toRemove.forEach((k) => store.removeItem(k));
    }
  } catch (e) {
    console.warn("clearAmplifySession:", e);
  }
}

export async function loginWithEmail(model: { email: string; password: string }) {
  // ⚠️ NUNCA llamar signOut() aquí: con OAuth configurado REDIRIGE al logout de
  // Cognito y cancelaba el login recién hecho (bug "login exitoso → vuelve al login").
  // Limpieza local únicamente: la nueva sesión reemplaza a la anterior.
  cleanData();
  clearAmplifySession(); // purga la sesión residual de Amplify/Cognito ("already a signed in user")
  try {
    console.log("model:", model);
    const user = await signIn({
      username: model.email,
      password: model.password,
    });
    console.log("Inicio de sesión exitoso:", user);

    const sessionUser = await fetchAuthSession();
    if (!sessionUser.tokens) throw new Error("No tokens found in the session");
    console.log("sessionUser:", sessionUser);

    const datosUsuario = mapDatosUsuario(sessionUser.tokens.idToken?.payload);
    const idToken = sessionUser.tokens.idToken?.toString();
    console.log("datosUsuario:", datosUsuario);
    console.log("idToken:", idToken);
    setToken(idToken);
    setUserInfo(datosUsuario);
    return true;
  } catch (error: any) {
    // Mensaje claro en español + .code para que la UI reaccione (ej. reenviar código)
    throwMapped(error);
  }
}

export async function loginWithGoogle() {
  // ⚠️ Mismo fix que loginWithEmail: sin signOut() previo (redirigía al logout de
  // Cognito y cancelaba el flujo → "vuelve al login").
  cleanData();
  clearAmplifySession(); // purga la sesión residual de Amplify/Cognito

  // Marca del intento: si el hosted UI falla SIN redirigir con ?error=…,
  // /login puede mostrar feedback igualmente (ver useEffect de LoginPage).
  if (typeof window !== "undefined") {
    sessionStorage.setItem("kf-google-attempt", String(Date.now()));
  }

  // Blindaje extra: garantizar config completa justo antes del redirect
  Amplify.configure(awsConfig);

  try {
    await signInWithRedirect({ provider: "Google" });
    console.log("Inicio de sesión con google exitoso");
    return true;
  } catch (error: any) {
    const message = String(error?.message || error);

    /**
     * InvalidRedirectException: la config OAuth se perdió o llegó vacía.
     * Auto-reparación: re-configurar con awsConfig completo y reintentar UNA vez.
     */
    if (message.includes("InvalidRedirect") || message.includes("redirect")) {
      console.warn("loginWithGoogle: reconfigurando Amplify y reintentando…");
      try {
        Amplify.configure(awsConfig);
        await signInWithRedirect({ provider: "Google" });
        return true;
      } catch (retryError: any) {
        console.error("Detalle del error al iniciar sesión con Google (retry):", retryError);
        throw new Error(retryError?.message || "Error al iniciar sesión con Google.");
      }
    }

    console.error("Detalle del error al iniciar sesión con Google:", error);
    throw new Error(message || "Error al iniciar sesión con Google.");
  }
}

/**
 * Completa el login con Google en /dashboard (redirectSignIn).
 * Flujo authorization-code (responseType: "code"):
 *  - Si Cognito/hosted UI devolvió un error (?error=access_denied…), se mapea
 *    a una clave legible para que /login muestre el mensaje en español.
 *  - Si viene ?code=, fetchAuthSession() hace el intercambio automáticamente,
 *    se construye la sesión y se persiste en storage.
 */
export type GoogleSignInResult = { ok: boolean; errorKey?: string };

export async function completeGoogleSignIn(): Promise<GoogleSignInResult> {
  if (typeof window === "undefined") return { ok: false, errorKey: "GOOGLE_GENERIC" };
  const params = new URLSearchParams(window.location.search);
  console.info("[google-callback]", window.location.href);

  // 1) Errores OAuth / triggers rechazados (ej. cuenta Google inexistente)
  const oauthError = params.get("error");
  if (oauthError) {
    console.warn("OAuth error:", oauthError, "|", params.get("error_description"));
    sessionStorage.removeItem("kf-google-attempt");
    return {
      ok: false,
      errorKey: oauthError === "access_denied" ? "GOOGLE_NO_EXISTE" : "GOOGLE_GENERIC",
    };
  }

  // 2) Flujo feliz: intercambiar ?code= por tokens y guardar sesión
  try {
    cleanData();
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken;
    if (!idToken) {
      console.warn("completeGoogleSignIn: sin tokens tras fetchAuthSession");
      return { ok: false, errorKey: "GOOGLE_GENERIC" };
    }
    const datosUsuario = mapDatosUsuario(idToken.payload);
    setToken(idToken.toString());
    setUserInfo(datosUsuario);
    sessionStorage.removeItem("kf-google-attempt");
    console.log("Login con Google completado:", datosUsuario.email);
    return { ok: true };
  } catch (error) {
    console.error("completeGoogleSignIn:", error);
    return { ok: false, errorKey: "GOOGLE_GENERIC" };
  }
}

/**
 * Devuelve un idToken VIVO. Amplify renueva automáticamente el token usando
 * el refresh token cuando expiró (forceRefresh=true fuerza la llamada).
 * Sincroniza la copia en sessionStorage para guards y otros lectores.
 * Devuelve null si la sesión es irrecuperable o Amplify no está listo.
 */
export async function getFreshIdToken(force = false): Promise<string | null> {
  try {
    const session = await fetchAuthSession({ forceRefresh: force });
    const idToken = session.tokens?.idToken?.toString();
    if (!idToken) return null;
    setToken(idToken);
    return idToken;
  } catch (error) {
    console.warn("getFreshIdToken:", error);
    return null;
  }
}

// export async function resetPassword(email: string) {
export async function handleResetPassword(username: string) {
  try {
    const output = await resetPassword({ username });
    console.log("Código enviado:", output);
    return true;
  } catch (error) {
    console.error("Error al solicitar reset:", error);
    return false;
  }
}

export async function handleConfirmResetPassword(
  username: string,
  code: string,
  newPassword: string
) {
  try {
    await confirmResetPassword({
      username,
      confirmationCode: code,
      newPassword,
    });
    console.log("Contraseña actualizada correctamente ✅");
    return true;
  } catch (error) {
    console.error("Error al confirmar reset:", error);
    return false;
  }
}
