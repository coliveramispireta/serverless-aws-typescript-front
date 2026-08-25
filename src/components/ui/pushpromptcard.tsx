"use client";
import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
} from "@mui/material";
import { NotificationsActive } from "@mui/icons-material";

import usePush from "@/hooks/usepush";

const ASK_FLAG = "kf-push-asked";

/**
 * Tarjeta para páginas públicas (/login, /instalar):
 * pide permiso de notificaciones y suscribe al visitante.
 * La suscripción queda PENDIENTE y se registra en el backend
 * automáticamente cuando la persona inicia sesión — así el push
 * de bienvenida llega apenas entra a la app.
 */
export default function PushPromptCard() {
  const push = usePush();
  const askedOnce = useRef(false);
  // Detección iOS solo en cliente (evita ReferenceError en prerender)
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    try {
      setIsIOS(/iphone|ipad|ipod/i.test(window.navigator.userAgent));
    } catch {
      setIsIOS(false);
    }
  }, []);

  // Auto-pedido UNA sola vez al abrir la página (si aún no hay respuesta)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!push.supported || push.permission !== "default") return;
    if (localStorage.getItem(ASK_FLAG)) return;

    localStorage.setItem(ASK_FLAG, "1");
    const t = setTimeout(() => {
      void push.subscribeGuest();
    }, 1200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [push.supported]);

  if (!push.supported) {
    // iOS Safari sin instalar: PushManager no existe → guía mínima
    if (!isIOS) return null;
    return (
      <Card elevation={0} sx={{ mb: 2, borderRadius: 3, border: "1px solid", borderColor: "AMSnowGray.main" }}>
        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
          <Typography variant="body2" fontWeight={700}>
            📲 Para recibir notificaciones en iPhone
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Primero instala la app con el botón de arriba (Compartir → Agregar a inicio).
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Ya activas: confirmación discreta
  if (push.subscribed) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={2}>
        <NotificationsActive fontSize="small" color="primary" />
        <Typography variant="caption" color="text.secondary">
          Notificaciones activas 🔔
        </Typography>
      </Box>
    );
  }

  const denied = push.permission === "denied";

  return (
    <Card
      elevation={0}
      sx={{
        mb: 2,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "AMSnowGray.main",
        bgcolor: "#ecfdf5",
      }}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Typography variant="body2" fontWeight={700} gutterBottom>
          🔔 No te pierdas nada
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
          Recibe comentarios de la comunidad, avisos de tu coach y mensajitos de ánimo.
        </Typography>

        {denied ? (
          <Typography variant="caption" color="error">
            Bloqueaste las notificaciones. Actívalas desde el ícono 🔒 junto a la dirección del sitio.
          </Typography>
        ) : (
          <Button
            fullWidth
            variant="outlined"
            color="primary"
            disabled={push.busy}
            onClick={() => void push.subscribeGuest()}
          >
            {push.pendingRegister
              ? "✓ Listo — se activará al iniciar sesión"
              : push.busy
                ? "Solicitando…"
                : "Permitir notificaciones"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
