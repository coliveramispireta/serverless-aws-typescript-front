"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, CircularProgress, Typography } from "@mui/material";
import { completeGoogleSignIn } from "@/services/auth.service";

/**
 * /dashboard es la ruta de callback de Cognito/Google (REDIRECT_SIGNIN).
 * Aquí se completa el flujo authorization-code:
 *  - intercambia ?code= por tokens (fetchAuthSession) y guarda sesión → /inicio
 *  - si Cognito devolvió ?error=… → redirige a /login con mensaje en español
 */
export default function DashboardRedirect() {
  const router = useRouter();
  const [msg, setMsg] = useState("Completando inicio de sesión…");

  useEffect(() => {
    void (async () => {
      const res = await completeGoogleSignIn();
      if (res.ok) {
        router.replace("/inicio");
        return;
      }
      setMsg("No se pudo completar el acceso. Redirigiendo al login…");
      const key = res.errorKey ?? "GOOGLE_GENERIC";
      setTimeout(() => router.replace(`/login?googleError=${key}`), 800);
    })();
  }, [router]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      gap={2}
    >
      <CircularProgress size={44} />
      <Typography variant="body2" color="text.secondary">
        {msg}
      </Typography>
    </Box>
  );
}
