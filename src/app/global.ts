// Define una interfaz Configuration que describe la forma del objeto de configuración
interface Configuration {
  API_URL_LAMBDA: string;
  AUTH_TOKEN: string;
  REDIRECT_SIGNIN: string;
  REDIRECT_SIGNUP: string;
}

// Define una interfaz Enviroments que describe las configuraciones para diferentes entornos
interface Enviroments {
  local: Configuration; // Configuración para el entorno local
  development: Configuration; // Configuración para el entorno de desarrollo
  production: Configuration; // Configuración para el entorno de producción
}

const config: Enviroments = {
  local: {
    API_URL_LAMBDA: process.env.NEXT_PUBLIC_API_URL_LAMBDA_LOCAL!,
    AUTH_TOKEN: process.env.NEXT_PUBLIC_AUTH_TOKEN_LOCAL!,
    REDIRECT_SIGNIN: "http://localhost:3000/dashboard",
    REDIRECT_SIGNUP: "http://localhost:3000/login",
  },
  development: {
    API_URL_LAMBDA: process.env.NEXT_PUBLIC_API_URL_LAMBDA_DEV!,
    AUTH_TOKEN: process.env.NEXT_PUBLIC_AUTH_TOKEN_DEV!,
    REDIRECT_SIGNIN: process.env.NEXT_PUBLIC_REDIRECT_SIGNIN_DEV!,
    REDIRECT_SIGNUP: process.env.NEXT_PUBLIC_REDIRECT_SIGNUP_DEV!,
  },
  production: {
    API_URL_LAMBDA: process.env.NEXT_PUBLIC_API_URL_LAMBDA_PROD!,
    AUTH_TOKEN: process.env.NEXT_PUBLIC_AUTH_TOKEN_PROD!,
    REDIRECT_SIGNIN: process.env.NEXT_PUBLIC_REDIRECT_SIGNIN_PROD!,
    REDIRECT_SIGNUP: process.env.NEXT_PUBLIC_REDIRECT_SIGNUP_PROD!,
  },
};
const env = process.env.APP_ENV;

export const API_URL_LAMBDA = config[env as keyof Enviroments].API_URL_LAMBDA;
export const AUTH_TOKEN = config[env as keyof Enviroments].AUTH_TOKEN;
export const REDIRECT_SIGNIN = config[env as keyof Enviroments].REDIRECT_SIGNIN;
export const REDIRECT_SIGNUP = config[env as keyof Enviroments].REDIRECT_SIGNUP;
export const SITE_KEY = "";

export const ROLES = {
  INVITADO: "Invitado",
  USERLOGGED: "UserLogged",
  USERADMIN: "UserAdmin",
};
