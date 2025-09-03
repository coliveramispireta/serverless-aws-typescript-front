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

import { setToken, setUserInfo } from "./xstorage.cross.service";
import { mapDatosUsuario } from "./utils.cross.services";

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

    console.log("Usuario creado exitosamente");

    const loginSuccess = await loginWithEmail({ email: model.email, password: model.password });
    if (!loginSuccess) throw new Error("Error al iniciar sesión");
    return true;
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes("User already exists")) {
      throw new Error("El correo ya se encuentra registrado.");
    } else if (errorMessage.includes("InvalidPasswordException")) {
      throw new Error("La contraseña no cumple con los requisitos de seguridad.");
    } else if (errorMessage.includes("InvalidParameterException")) {
      throw new Error("Los datos ingresados no son válidos.");
    } else {
      throw new Error(errorMessage);
    }
  }
}

export async function loginWithEmail(model: { email: string; password: string }) {
  try {
    await signOut();
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
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes("User does not exist")) {
      throw new Error("El usuario no existe. Verifica tu correo.");
    } else if (errorMessage.includes("Incorrect username or password")) {
      throw new Error("Credenciales incorrectas. Revisa tu usuario y contraseña.");
    } else if (errorMessage.includes("User is not confirmed")) {
      throw new Error("Tu correo no ha sido verificado. Revisa tu bandeja de entrada.");
    } else if (
      errorMessage.includes(
        "InvalidParameterException: Cannot reset password for the user as there is no registered/verified email or phone_number"
      )
    ) {
      throw new Error("Tu correo no ha sido verificado. Revisa tu bandeja de entrada.");
    } else if (errorMessage.includes("Unauthenticated access is not supported")) {
      throw new Error("Acceso no permitido. Asegúrate de estar registrado y verificado.");
    } else {
      throw new Error(errorMessage);
    }
  }
}

export async function loginWithGoogle() {
  try {
    await signOut();
    await signInWithRedirect({ provider: "Google" });
    console.log("Inicio de sesión con google exitoso");
    return true;
  } catch (error: any) {
    console.error("Detalle del error al iniciar sesión con Google:", error);
    throw new Error(error.message || "Error al iniciar sesión con Google.");
  }
}

export async function handleGoogleCallback(hash: string) {
  console.log("se obtuvo el hash:", hash);
  try {
    const params = new URLSearchParams(hash.slice(1));
    const accessToken = params.get("access_token") || undefined;
    const idToken = params.get("id_token") || undefined;

    if (!accessToken) throw new Error("No token found in the session");
    if (!idToken) throw new Error("No token found in the session");

    console.log("accessToken: ", accessToken);
    console.log("idToken: ", idToken);

    const decode = idToken.split(".")[1];
    const payload = JSON.parse(atob(decode));

    console.log("payload: ", payload);

    const datosUsuario = mapDatosUsuario(payload);
    console.log("datosUsuario:", datosUsuario);
    console.log("idToken:", idToken);

    setToken(idToken);
    setUserInfo(datosUsuario);
    return true;
  } catch (error: any) {
    console.error("Error procesando callback de Google:", error);
    return false;
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
