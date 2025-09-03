"use client";
import { Dispatch, SetStateAction, createContext } from "react";
export interface UserState {
  datosUsuarioState: ContexReacttState<DatosUsuarioState>;
  successLogin: (loggedUser: DatosUsuarioState, token: string, refreshToken: string) => void;
  getToken: () => string;
}

export interface DatosUsuarioState {
  id: string;
  email: string;
  userName: string; // nombre
  phoneNumber: string; // celular, opcional
  role: string; // rol fijo por defecto
  isLogged: boolean;
  photoURL: string;
}

interface ContexReacttState<T> {
  value: T;
  setValue: Dispatch<SetStateAction<T>>;
}

const UserContext = createContext<UserState | undefined>(undefined);

export default UserContext;
