"use client";
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  TextField as MuiTextField,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

import SourceBadge from "@/components/ui/sourcebadge";
import EmptyState from "@/components/ui/emptystate";
import { listMessages, sendMessageToUser } from "@/services/keto/engagement.service";
import { listCoachUsers, CoachUserSummary } from "@/services/keto/coach.service";
import { MotivationalMessage } from "@/model/keto.models";

/** Máx. de caracteres (incluidos espacios) para un MENSAJE personalizado. */
const MAX_MENSAJE_CHARS = 300;

/**
 * Mensajes personalizados: el coach envía ánimo o indicaciones
 * a un usuario concreto. Se marcan como contenido del coach.
 */
export default function CoachMensajesView() {
  const [texto, setTexto] = useState("");
  const [destinatario, setDestinatario] = useState<string>("");
  const [users, setUsers] = useState<CoachUserSummary[]>([]);
  const [sending, setSending] = useState(false);
  const [snack, setSnack] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [history, setHistory] = useState<MotivationalMessage[] | null>(null);
  const [visibleCount, setVisibleCount] = useState(20);
  const PAGE = 20;

  const loadUsers = () =>
    listCoachUsers()
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch(() => setUsers([]));

  const loadHistory = () =>
    listMessages()
      .then((data) => {
        setHistory(Array.isArray(data) ? data.filter((m) => m.source === "coach") : []);
        setVisibleCount(PAGE);
      })
      .catch(() => setHistory(null));

  useEffect(() => {
    loadUsers();
    loadHistory();
  }, []);

  const handleSend = async () => {
    if (!texto.trim() || !destinatario) return;
    setSending(true);
    try {
      await sendMessageToUser(texto.trim(), destinatario);
      setTexto("");
      setSnack({ type: "success", msg: "Mensaje enviado ✅" });
      try {
        await loadHistory();
      } catch {
        /* sin historial */
      }
    } catch (err) {
      console.error(err);
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data
        ?.message;
      setSnack({ type: "error", msg: msg ?? "No se pudo enviar el mensaje." });
    } finally {
      setSending(false);
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Card elevation={0} sx={{ border: "2px solid", borderColor: "secondary.main" }}>
        <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
            <Typography variant="subtitle2" fontWeight={700}>
              Enviar mensaje personalizado
            </Typography>
            <SourceBadge source="coach" />
          </Box>

          <MuiTextField
            select
            label="Para quién"
            fullWidth
            size="small"
            value={destinatario}
            onChange={(e) => setDestinatario(e.target.value)}
            SelectProps={{ native: true }}
          >
            <option value="">Selecciona un usuario…</option>
            {users.map((u) => (
              <option key={u.userId} value={u.userId}>
                {u.nombre}
              </option>
            ))}
          </MuiTextField>

          {users.length === 0 && (
            <Typography variant="caption" color="text.secondary" mt={0.5} display="block">
              La lista de usuarios estará disponible cuando el servicio /coach/users esté activo.
            </Typography>
          )}

          <MuiTextField
            label="Mensaje"
            fullWidth
            multiline
            minRows={3}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Ej: ¡Vas muy bien! Recuerda tu cita del viernes…"
            inputProps={{ maxLength: MAX_MENSAJE_CHARS }}
            helperText={`${texto.length} / ${MAX_MENSAJE_CHARS} caracteres. Los mensajes son cortos: para un feedback largo usa Recomendaciones.`}
            sx={{ mt: 2 }}
          />

          <Button
            variant="contained"
            color="secondary"
            endIcon={<SendIcon />}
            fullWidth
            sx={{ mt: 2 }}
            disabled={sending || !texto.trim() || !destinatario}
            onClick={handleSend}
          >
            {sending ? "Enviando…" : "Enviar mensaje"}
          </Button>
        </CardContent>
      </Card>

      {/* Historial */}
      {history === null ? (
        <EmptyState emoji="✉️" title="Historial no disponible" description="Se activará con el servicio /messages." />
      ) : history.length === 0 ? (
        <EmptyState emoji="✉️" title="Sin mensajes enviados todavía" />
      ) : (
        <>
          {history.slice(0, visibleCount).map((m) => (
            <Card key={m.id} elevation={0} sx={{ border: "1px solid", borderColor: "AMSnowGray.main" }}>
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Chip
                    size="small"
                    variant="outlined"
                    color="secondary"
                    label={`Para: ${m.destinatarioNombre ?? (m.destinatarioUserId ? "usuario" : "grupo")}`}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {new Date(m.fechaCreacion).toLocaleDateString("es-MX")}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>{m.texto}</Typography>
              </CardContent>
            </Card>
          ))}
          {visibleCount < history.length && (
            <Button
              variant="outlined"
              fullWidth
              onClick={() => setVisibleCount((v) => v + PAGE)}
              sx={{ mt: 1 }}
            >
              Cargar más ({history.length - visibleCount} restantes)
            </Button>
          )}
        </>
      )}

      <Snackbar
        open={!!snack}
        autoHideDuration={4000}
        onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snack?.type ?? "info"}>{snack?.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
