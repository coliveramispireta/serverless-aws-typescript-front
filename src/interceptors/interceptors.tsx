import axios from "axios";
import { API_URL_LAMBDA, AUTH_TOKEN } from "@/app/global";
import { getToken } from "@/services/xstorage.cross.service";

/** ----INSTANCIA PARA LAMBDAS ------- */
export const axiosInstanceLambda = axios.create({
  baseURL: API_URL_LAMBDA, // URL base para todas las solicitudes de esta instancia
  timeout: 60000000, // Tiempo máximo de espera para las solicitudes (muy largo en este caso)
});

axiosInstanceLambda.interceptors.request.use(
  (config) => {
    config.headers["Content-Type"] = "application/json";
    /**
     * Prioridad: ID token de Cognito (endpoints KetoCoach, validados con
     * User Pool Authorizer). Fallback al token estático para endpoints legacy.
     */
    const cognitoToken = getToken();
    if (cognitoToken) {
      config.headers.Authorization = `Bearer ${cognitoToken}`;
    } else if (!(AUTH_TOKEN === null || AUTH_TOKEN === undefined || AUTH_TOKEN === "")) {
      config.headers.Authorization = `Bearer ${AUTH_TOKEN}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
