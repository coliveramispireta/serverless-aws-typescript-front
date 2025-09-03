"use client";
import { theme } from "@/app/theme";
//importar estilos del modulo
import styles from "./successdialog.module.scss";
import { Button, DialogActions, DialogContent, DialogContentText, Icon } from "@mui/material";
import { ReactNode } from "react";
import MessageDialog from "@/smartcomponents/messagedialog/messagedialog";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export interface MessageDialogDialogProps {
  title?: string; //Aqui ya no esperamos el icono porque pues ya sabemos que es el icono de success
  message: string;
  open: boolean;
  onClose: () => void;
}

export default function SuccessDialog(props: MessageDialogDialogProps) {
  //estaria bien poner un mensaje de titulo default

  return (
    <MessageDialog
      title={props.title ?? "Exito"} //El operador ?? te dice que si props.title no es nulo o indefinido, pone el titulo, de lo contrario, pone el coso despues de ??, en este caso, exito
      message={props.message}
      open={props.open}
      icon={<CheckCircleIcon fontSize="large" color="success" />} //hay tres variantes: success, warning, error e info
      onClose={props.onClose}
    />
  );
}
