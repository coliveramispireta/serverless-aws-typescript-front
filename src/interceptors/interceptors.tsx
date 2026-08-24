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
    const config = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
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

    return Promise.reject(error);
  }
);
