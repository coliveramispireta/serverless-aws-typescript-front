import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { API_URL_LAMBDA, AUTH_TOKEN } from "@/app/global";
import { getUserInfo, cleanData } from "@/services/xstorage.cross.service";
import { getFreshIdToken } from "@/services/auth.service";

/** ----INSTANCIA PARA LAMBDAS ------- */
export const axiosInstanceLambda = axios.create({
  baseURL: API_URL_LAMBDA,
  timeout: 60000000,
});

// Evita redirects múltiples simultáneos al expirar la sesión
let redirectingToLogin = false;

function redirectToLoginExpired() {
  if (redirectingToLogin) return;
  redirectingToLogin = true;
  cleanData();
  window.location.href = "/login?expired=1";
}

// Single-flight: si varias peticiones fallan a la vez, el refresh ocurre una sola vez
let refreshInFlight: Promise<string | null> | null = null;
function refreshOnce(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = getFreshIdToken(true).finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

axiosInstanceLambda.interceptors.request.use(async (config) => {
  config.headers["Content-Type"] = "application/json";

  /**
   * Prioridad: ID token VIVO de Cognito (endpoints KetoFlow). Amplify renueva
   * el token automáticamente si expiró — sin costo de red mientras esté vigente.
   */
  if (getUserInfo().isLogged) {
    const fresh = await getFreshIdToken();
    if (fresh) {
      config.headers.Authorization = `Bearer ${fresh}`;
    }
    // Sin token posible: se envía sin Authorization → 401 manejado abajo
    return config;
  }

  // Compatibilidad: endpoints legacy sin authorizer Cognito (token estático)
  if (AUTH_TOKEN) {
    config.headers.Authorization = `Bearer ${AUTH_TOKEN}`;
  }
  return config;
});

axiosInstanceLambda.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as (InternalAxiosRequestConfig & {
      _retry?: boolean;
      _recovered?: boolean;
    }) | undefined;
    const status = error.response?.status;

    // 401 con sesión activa → intentar UNA renovación y reintentar
    if (status === 401 && config && !config._retry && getUserInfo().isLogged) {
      config._retry = true;
      const fresh = await refreshOnce();

      if (fresh) {
        config.headers.Authorization = `Bearer ${fresh}`;
        return axiosInstanceLambda(config);
      }

      // Refresh imposible → sesión muerta (refresh token vencido/revocado)
      redirectToLoginExpired();
    }

    // Fallo de conexión (no 401): red caída, ERR_NETWORK, CORS o 5xx del gateway
    // durante un deploy. Fase 1: re-validar la sesión y reintentar una vez.
    if (config && isConnectionError(error) && !config._recovered) {
      config._recovered = true;
      config._retry = true;
      const fresh = await refreshOnce(); // re-valida sin pedir credenciales

      if (fresh) {
        config.headers.Authorization = `Bearer ${fresh}`;
        return axiosInstanceLambda(config); // reintenta la petición
      }

      // Sin token posible → sesión no recuperable → forzar logout
      redirectToLoginExpired();
      return Promise.reject(error);
    }

    // Fase 2 (fallback): ya se revalidó/reintentó y el fallo de conexión PERSISTE.
    // Forzamos el cierre de sesión para que el usuario no quede varado en "Sin conexión".
    if (config?._recovered && isConnectionError(error)) {
      redirectToLoginExpired();
    }

    return Promise.reject(error);
  }
);

/** Fallo de conexión/no disponible (a diferencia de un 4xx de negocio válido). */
function isConnectionError(error: AxiosError): boolean {
  return (
    error.response === undefined || // network/ERR_NETWORK/timeout/CORS
    (typeof error.response?.status === "number" && error.response.status >= 500)
  );
}
