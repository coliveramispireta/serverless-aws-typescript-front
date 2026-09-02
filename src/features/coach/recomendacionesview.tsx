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
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { Snackbar, Alert } from "@mui/material";

import EmptyState from "@/components/ui/emptystate";
import SourceBadge from "@/components/ui/sourcebadge";
import {
  createRecommendation,
  listRecommendations,
} from "@/services/keto/engagement.service";
import { listCoachUsers, CoachUserSummary } from "@/services/keto/coach.service";
import { Recommendation } from "@/model/keto.models";

/**
 * Publicar recomendaciones PERSONALIZADAS para un usuario específico.
 * (El contenido general para todo el grupo se hace con publicaciones/flyers,
 * no con recomendaciones).
 */
export default function CoachRecomendacionesView() {
  const [texto, setTexto] = useState("");
  const [destinatario, setDestinatario] = useState<string>("");
  const [users, setUsers] = useState<CoachUserSummary[]>([]);
  const [sending, setSending] = useState(false);
  const [snack, setSnack] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Historial (si el servicio existe)
  const [history, setHistory] = useState<Recommendation[] | null>(null);

  useEffect(() => {
    listCoachUsers()
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch(() => setUsers([]));
    listRecommendations()
      .then((data) => setHistory(Array.isArray(data) ? data : []))
      .catch(() => setHistory(null));
  }, []);

  const handleSend = async () => {
    if (!texto.trim()) return;
    if (!destinatario) {
      setSnack({ type: "error", msg: "Elige a qué usuario va dirigida la recomendación" });
      return;
    }
    setSending(true);
    try {
      await createRecommendation(texto.trim(), destinatario);
      setTexto("");
      setDestinatario("");
      setSnack({ type: "success", msg: "Recomendación publicada ✅" });
      // refrescar historial si está disponible
      try {
        const data = await listRecommendations();
        setHistory(Array.isArray(data) ? data : []);
      } catch {
        /* historial no disponible */
      }
    } catch (err) {
      console.error(err);
      setSnack({
        type: "error",
        msg: "No se pudo publicar ahora. El servicio aún no está disponible.",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {/* Formulario */}
      <Card elevation={0} sx={{ border: "2px solid", borderColor: "secondary.main" }}>
        <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
            <Typography variant="subtitle2" fontWeight={700}>
              Nueva recomendación
            </Typography>
            <SourceBadge source="coach" />
          </Box>
          <MuiTextField
            label="¿Qué recomiendas?"
            fullWidth
            multiline
            minRows={3}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Ej: Aumenta la ingesta de electrolitos estos días…"
          />
          <MuiTextField
            select
            label="Destinatario (obligatorio)"
            fullWidth
            size="small"
            value={destinatario}
            onChange={(e) => setDestinatario(e.target.value)}
            sx={{ mt: 2 }}
            SelectProps={{ native: true }}
          >
            <option value="">— Elige un usuario —</option>
            {users.map((u) => (
              <option key={u.userId} value={u.userId}>
                {u.nombre} ({u.email})
              </option>
            ))}
          </MuiTextField>
          <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
            Las recomendaciones son personales. Para enviar un aviso a todo el grupo usa
            una publicación (flyer).
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            endIcon={<SendIcon />}
            fullWidth
            sx={{ mt: 2 }}
            disabled={sending || !texto.trim() || !destinatario}
            onClick={handleSend}
          >
            {sending ? "Publicando…" : "Publicar recomendación"}
          </Button>
        </CardContent>
      </Card>

      {/* Historial */}
      {history === null ? (
        <EmptyState
          emoji="🗂️"
          title="Historial no disponible"
          description="Cuando el backend publique /recommendations verás aquí lo enviado."
        />
      ) : history.length === 0 ? (
        <EmptyState emoji="🗂️" title="Aún no has publicado recomendaciones" />
      ) : (
        history.map((r) => (
          <Card key={r.id} elevation={0} sx={{ border: "1px solid", borderColor: "AMSnowGray.main" }}>
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
              <Box display="flex" justifyContent="space-between" mb={0.5}>
                <Chip size="small" variant="outlined" color="secondary" label="Personalizada" />
                <Typography variant="caption" color="text.secondary">
                  {new Date(r.fechaCreacion).toLocaleDateString("es-MX")}
                </Typography>
              </Box>
              <Typography variant="body2">{r.texto}</Typography>
            </CardContent>
          </Card>
        ))
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
