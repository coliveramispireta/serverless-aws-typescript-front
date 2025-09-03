"use client";

//importar estilos del modulo
import styles from "./messagedialog.module.scss";
import { DialogContent } from "@mui/material";
import { ReactNode } from "react";
import SimpleDialog from "../simpledialog/simpledialog";

export interface MessageDialogDialogProps {
  title: string;
  message: string;
  icon: ReactNode;
  open: boolean;
  onClose: () => void;
}

export default function MessageDialog(props: MessageDialogDialogProps) {
  return (
    <SimpleDialog title={props.title} open={props.open} onClose={props.onClose}>
      <DialogContent className={styles.dialogContent}>
        {props.icon}
        {/* <div>{props.message}</div> */}
        <div style={{ wordBreak: "break-word", whiteSpace: "pre-wrap", maxWidth: "100%" }}>
          {props.message}
        </div>
      </DialogContent>
    </SimpleDialog>
  );
}
