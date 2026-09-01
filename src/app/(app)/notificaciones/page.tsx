"use client";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Typography,
} from "@mui/material";
import { Check, DeleteSweep, DoneAll, OpenInNew } from "@mui/icons-material";

import SectionHeader from "@/components/ui/sectionheader";
import EmptyState from "@/components/ui/emptystate";
import { useNotifications } from "@/context/notifications/notifications.context";

/**
 * Centro de notificaciones: lista interna con el diseño completo de cada
 * notificación recibida. Tocar una notificación del sistema NO navega; aquí
 * el usuario la lee y, si la notificación tiene URL, la abre con "Ir al app".
 */
export default function NotificacionesPage() {
  const router = useRouter();
  const { notifications, unread, markRead, markAllRead, clearAll, syncFromSW } =
    useNotifications();

  const go = (url?: string) => {
    if (!url) return;
    if (url.startsWith("/")) {
      router.push(url);
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Box>
      <SectionHeader
        title="Notificaciones"
        subtitle={
          unread > 0
            ? `${unread} sin leer`
            : notifications.length > 0
              ? "Todo leído"
              : undefined
        }
        action={
          notifications.length > 0 ? (
            <Box display="flex" gap={0.5}>
              {unread > 0 && (
                <Button
                  size="small"
                  startIcon={<DoneAll />}
                  onClick={markAllRead}
                  variant="outlined"
                >
                  Leer todas
                </Button>
              )}
              <IconButton
                size="small"
                color="inherit"
                onClick={clearAll}
                aria-label="Vaciar notificaciones"
                title="Vaciar"
              >
                <DeleteSweep />
              </IconButton>
            </Box>
          ) : undefined
        }
      />

      {notifications.length === 0 ? (
        <EmptyState
          emoji="🔔"
          title="No tienes notificaciones"
          description="Cuando tu coach o la comunidad te envíen un aviso, lo verás aquí con el texto completo."
        />
      ) : (
        <Box display="flex" flexDirection="column" gap={1.5}>
          {notifications.map((n) => {
            const read = Boolean(n.read);
            const when = formatWhen(n.ts);
            return (
              <Card
                key={n.id}
                elevation={0}
                sx={{
                  border: "1px solid",
                  borderColor: read ? "AMSnowGray.main" : "primary.main",
                  borderRadius: 3,
                }}
              >
                <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                  <Box display="flex" alignItems="flex-start" gap={1}>
                    <Box sx={{ fontSize: 26, lineHeight: 1, mt: 0.4 }}>
                      {n.emoji || emojiFallback(n.title)}
                    </Box>
                    <Box flex={1} minWidth={0}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body1" fontWeight={800} sx={{ flex: 1 }}>
                          {n.title}
                        </Typography>
                        {!read && (
                          <Chip
                            size="small"
                            label="NUEVO"
                            color="primary"
                            sx={{ height: 18, "& .MuiChip-label": { px: 0.8, fontSize: 10 } }}
                          />
                        )}
                      </Box>
                      <Typography
                        variant="body2"
                        color="text.primary"
                        whiteSpace="pre-wrap"
                        sx={{ mt: 0.5, color: read ? "text.secondary" : "text.primary" }}
                      >
                        {n.body}
                      </Typography>

                      {n.image && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={n.image}
                          alt=""
                          style={{
                            width: "100%",
                            maxHeight: 260,
                            objectFit: "cover",
                            borderRadius: 12,
                            marginTop: 8,
                          }}
                        />
                      )}
                      <Box display="flex" alignItems="center" justifyContent="space-between" mt={1}>
                        <Typography variant="caption" color="text.secondary">
                          {when}
                        </Typography>
                        <Box display="flex" gap={0.5}>
                          {!read && (
                            <Button
                              size="small"
                              startIcon={<Check />}
                              onClick={() => markRead(n.id)}
                            >
                              Leída
                            </Button>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      <Divider sx={{ my: 2 }} />
      <Box textAlign="center">
        <Button size="small" color="inherit" onClick={syncFromSW}>
          Sincronizar notificaciones
        </Button>
      </Box>
    </Box>
  );
}

function formatWhen(ts?: number): string {
  if (!ts) return "";
  const d = new Date(ts);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) {
    return `Hoy ${d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}`;
  }
  return d.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function emojiFallback(title?: string): string {
  const t = (title || "").toLowerCase();
  if (title && /^[^\w]/.test(title.trim()) && title.trim().length > 0) {
    const first = Array.from(title.trim())[0];
    return first;
  }
  if (t.includes("comentario")) return "💬";
  if (t.includes("recomendaci")) return "📋";
  if (t.includes("mensaje")) return "👤";
  if (t.includes("public")) return "📣";
  if (t.includes("bienvenid")) return "🎉";
  return "🔔";
}
