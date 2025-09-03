"use client";
//importar css del modulo
import styles from "./simpledialog.module.scss";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
} from "@mui/material";
import { Children } from "react";
import CloseIcon from "@mui/icons-material/Close";

export interface SimpleDialogProps {
  title: string;
  open: boolean;
  excludeHeader?: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function SimpleDialog(props: SimpleDialogProps) {
  const { onClose, open, excludeHeader = false } = props;

  const handleClose = (event: any, reason?: any) => {
    if (reason !== "backdropClick") {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      disableEscapeKeyDown={true}
    >
      <DialogTitle
        sx={{
          paddingTop: 2,
        }}
        id="alert-dialog-title"
        className={(!excludeHeader && styles.dialogTitle) || styles.dialogTitleExcludeHeader}
      >
        {!excludeHeader && <span>{props.title}</span>}
        <IconButton
          sx={{
            position: "absolute",
            top: "5px",
            right: "20px",
          }}
          edge="end"
          color="inherit"
          onClick={handleClose}
          className={styles.closeIcon}
        >
          <CloseIcon aria-label="close"></CloseIcon>
        </IconButton>
      </DialogTitle>

      {props.children}
      {/* <DialogContentText id="alert-dialog-description">
            
          </DialogContentText> */}

      {/* <DialogActions>
          <Button onClick={handleClose} color="primary">
            Disagree
          </Button>
          <Button onClick={handleClose} color="primary" autoFocus>
            Agree
          </Button>
        </DialogActions> */}
    </Dialog>
  );
}
