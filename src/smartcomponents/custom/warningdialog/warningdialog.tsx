"use client";
import { theme } from "@/app/theme";
//importar estilos del modulo
import styles from "./warningdialog.module.scss";
import { Button, DialogActions, DialogContent, DialogContentText, Icon } from "@mui/material";
import { ReactNode } from "react";
import MessageDialog from "@/smartcomponents/messagedialog/messagedialog";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";

export interface WarningDialogProps {
  title?: string; //Aqui ya no esperamos el icono porque pues ya sabemos que es el icono de success
  message: string;
  icon?: ReactNode;
  open: boolean;
  onClose: () => void;
}

export default function WarningDialog(props: WarningDialogProps) {
  //estaria bien poner un mensaje de titulo default

  return (
    <MessageDialog
      title={props.title ?? "Warning"} //El operador ?? te dice que si props.title no es nulo o indefinido, pone el titulo, de lo contrario, pone el coso despues de ??, en este caso, exito
      message={props.message}
      open={props.open}
      icon={<WarningIcon fontSize="large" color="warning" />} //hay tres variantes: success, warning, error e info
      onClose={props.onClose}
    />
  );
}
