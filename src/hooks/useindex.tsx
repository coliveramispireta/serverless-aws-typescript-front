"use client";
import { useContext, useEffect, useState } from "react";
import UserContext from "../context/usercontext/usercontext";

import { useRouter } from "next/navigation";
import { useScreenDetector } from "./usescreendetector";
import PageContext from "../context/pagecontext/pagecontext";

type UserEmail = {
  username: string;
  email: string;
  password: string;
};

export default function useIndex() {
  //Context

  const pageContext = useContext(PageContext);
  if (pageContext === undefined) {
    throw new Error("PageStateContext must be inside a PageStateContextProvider");
  }

  const { successState, errorState, warningState, infoState, apiCallState, pageErrorState } =
    pageContext!;

  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("UserContext must be inside a UserContextProvider");
  }

  const { datosUsuarioState, successLogin, getToken } = context!;

  const { isMobile, isTablet, isDesktop, isDesktopLarge } = useScreenDetector();

  const [isRegistrado, setIsRegistrado] = useState(false);
  const [showForgotPasswordForm, setShowForgotPasswordForm] = useState(false);
  const [showSignupForm, setShowSignupForm] = useState(false);
  const [showConfirmationForm, setShowConfirmationForm] = useState(false);
  const [isInvitado, setIsInvitado] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loginSuccessful, setLoginSuccessful] = useState(false);
  const [oldUserEmail, setOldUserEmail] = useState("");

  const [newUser, setNewUser] = useState<UserEmail>();
  const router = useRouter();

  const state = {
    pageErrorState,
    isRegistrado,
    setIsRegistrado,
    isInvitado,
    setIsInvitado,
    showForgotPasswordForm,
    showSignupForm,
    showConfirmationForm,
    errorMessage,
    isMobile,
    isTablet,
    isDesktop,
    isDesktopLarge,
    apiCallState,
    successState,
    errorState,
    warningState,
    infoState,
    oldUserEmail,
  };

  return state;
}
