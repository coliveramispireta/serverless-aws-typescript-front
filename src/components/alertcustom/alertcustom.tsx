import React, { useEffect } from "react";
import { Alert, Snackbar } from "@mui/material";

export interface AlertData {
  type: "success" | "error" | "info" | "warning";
  msg: string;
}

interface Props {
  alert: AlertData | null;
  setAlert: React.Dispatch<React.SetStateAction<AlertData | null>>;
  autoHideDuration?: number; // opcional (por defecto 5000 ms)
}

const CustomAlert: React.FC<Props> = ({ alert, setAlert, autoHideDuration = 5000 }) => {
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), autoHideDuration);
      return () => clearTimeout(timer);
    }
  }, [alert, autoHideDuration, setAlert]);

  // 🎨 Colores personalizados por tipo
  const getAlertColor = (type: string) => {
    switch (type) {
      case "success":
        return { bg: "#38b06c", text: "#fff" };
      case "error":
        return { bg: "#f44336", text: "#fff" };
      case "info":
        return { bg: "#2196f3", text: "#fff" };
      case "warning":
        return { bg: "#ff9800", text: "#fff" };
      default:
        return { bg: "#333", text: "#fff" };
    }
  };

  const color = alert ? getAlertColor(alert.type) : { bg: "#333", text: "#fff" };

  return (
  <>
    {alert && (
      <Snackbar
        open
        onClose={() => setAlert(null)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ mt: 7 }}
      >
        <Alert
          severity={alert.type}
          onClose={() => setAlert(null)}
          sx={{
            bgcolor: color.bg,
            color: color.text,
            fontSize: "1rem",
            px: 3,
            py: 1,
            borderRadius: 2,
            boxShadow: 3,
            minWidth: 260,
          }}
          icon={false}
        >
          {alert.msg}
        </Alert>
      </Snackbar>
    )}
  </>
);

};

export default CustomAlert;
