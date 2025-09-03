"use client";

import { Dispatch, SetStateAction, createContext } from "react";
import ErrorIcon from "@mui/icons-material/Error";
export interface PageState {
  requestFileSelectedId: ContexReactState<number>;
  pageErrorState: ContexReactState<string>;
  currentProfile: ContexReactState<ProfileKeys>;
  successState: ContextDialogState;
  errorState: ContextDialogState;
  warningState: ContextDialogState;
  // snackBarMessages: ContexReactState<MultiMessageSnackBarState>;
  infoState: ContextDialogState;
  ajaxDownloadingState: AjaxDownloadingState;
  ajaxGeneratingState: AjaxGeneratingState;
  apiCallState: ContexReactState<boolean>;
  serviceErrorState: ContexReactState<KeyValueState>;
}

export type ProfileKeys = "pristine" | "individual" | "masivo";
// de preferencia no usar "default"
export type AllowKeys = "default" | "forgot" | "confirm";

export type KeyValueState = { [key in AllowKeys]: boolean };

export interface ContextDialogState {
  pageMessage: ContexReactState<string>;
  pageDialog: ContexReactState<boolean>;
  handleOpenDialog: () => void;
  handleCloseDialog: () => void;
}

export interface AjaxDownloadingState {
  downloading: ContexReactState<boolean>;
  infoPendientes: ContexReactState<number>;
}

export interface AjaxGeneratingState {
  generating: ContexReactState<boolean>;
  infoPendientes: ContexReactState<number>;
}

export interface ContexReactState<T> {
  value: T;
  setValue: Dispatch<SetStateAction<T>>;
}

const PageContext = createContext<PageState | undefined>(undefined);

export default PageContext;
