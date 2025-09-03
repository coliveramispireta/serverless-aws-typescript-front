import { cleanData, getRefreshToken, setToken } from "./xstorage.cross.service";
import { SPParameters } from "../model/params.model";
import { ROLES } from "@/app/global";
import { DatosUsuarioState } from "@/context/usercontext/usercontext";

export function mapDatosUsuario(user: any): DatosUsuarioState {
  return {
    id: user.event_id,
    email: user.email || "",
    userName: user.name || "",
    phoneNumber: user.phoneNumber || "",
    role: ROLES.USERLOGGED,
    isLogged: true,
    photoURL: user.photoURL || "",
  };
}

// return {
//     id: user.uid,
//     email: user.email || "",
//     userName: user.displayName || "",
//     phoneNumber: user.phoneNumber || "",
//     role: ROLES.USERLOGGED,
//     isLogged: true,
//     photoURL: user.photoURL || "",
//   };

export function buildParameter(parameter: any) {
  if (parameter) {
    return `${parameter.replace(/\//g, "%2F")}`;
  }
  return null;
}

export const addLineBreak = (str: string) =>
  str.split("\n").map((subStr) => {
    return (
      <>
        {subStr}
        <br />
      </>
    );
  });

// JSON PARA RESPUESTAS SP
export const formatJson = (parameters: SPParameters): SPParameters => ({
  ...parameters,
  // @ts-ignore
  params: JSON.stringify(parameters.params), // Convierte `params` a JSON
});

// AÑADIR ID DINAMICO
export const addId = (data: any[]): any[] =>
  data.map((item, index) => ({ ...item, ID: index + 1 }));
