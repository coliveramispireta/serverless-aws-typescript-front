"use client";
import { ReactNode, useState } from "react";
import UserContext, { DatosUsuarioState, UserState } from "./usercontext";
import {
  getToken,
  getUserInfo,
  setRefreshToken,
  setToken,
  setUserInfo,
} from "../../services/xstorage.cross.service";

export function UserContextProvider({ children }: { children: ReactNode }) {
  var initialState = getUserInfo();
  const [user, setUser] = useState<DatosUsuarioState>(initialState); //estado de los exitos de la pagina

  //Error handling para todos los procesos, si se desea customizar, favor de hacerlo dentro del if con errores customizados
  //Y no creando más ifs

  const successLogin = (loggedUser: DatosUsuarioState, token: string, refreshToken: string) => {
    setUserInfo(loggedUser);
    setUser(loggedUser);
    setToken(token);
    setRefreshToken(refreshToken);
  };

  const state: UserState = {
    datosUsuarioState: { value: user, setValue: setUser },
    successLogin,
    getToken,
  };

  return <UserContext.Provider value={state}>{children}</UserContext.Provider>;
}
