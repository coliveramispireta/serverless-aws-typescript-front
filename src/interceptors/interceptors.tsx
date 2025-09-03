import axios from "axios";
import { API_URL_LAMBDA, AUTH_TOKEN } from "@/app/global";

/** ----INSTANCIA PARA LAMBDAS ------- */
export const axiosInstanceLambda = axios.create({
  baseURL: API_URL_LAMBDA, // URL base para todas las solicitudes de esta instancia
  timeout: 60000000, // Tiempo máximo de espera para las solicitudes (muy largo en este caso)
});

axiosInstanceLambda.interceptors.request.use(
  (config) => {
    const authToken = AUTH_TOKEN;
    config.headers["Content-Type"] = "application/json";
    if (!(authToken === null || authToken === undefined || authToken === "")) {
      //FALTA AGREGAR HEADERS DE AUTHORIZATIONTOKEN EN EL BACK
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
