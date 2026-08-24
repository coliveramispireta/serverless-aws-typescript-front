"use client";
import { useEffect, useRef, useState } from "react";
import {
  Avatar,
  Box,
  IconButton,
  InputAdornment,
  LinearProgress,
  TextField as MuiTextField,
  Typography,
} from "@mui/material";
import { Send } from "@mui/icons-material";

import EmptyState from "@/components/ui/emptystate";
import SectionHeader from "@/components/ui/sectionheader";
import { listChatMessages, sendChatMessage } from "@/services/keto/chat.service";
import { ChatMessage } from "@/model/keto.models";
import { getUserInfo } from "@/services/xstorage.cross.service";

/**
 * Chat grupal del programa. Mensajería simple del grupo;
 * el historial proviene del backend (/chat/messages).
 */
export default function ChatPage() {
  const userInfo = getUserInfo();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    listChatMessages()
      .then((data) => setMessages(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error(err);
        setError("No se pudo cargar la conversación. El servicio aún no está disponible.");
        setMessages([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const texto = draft.trim();
    if (!texto || sending) return;
    setSending(true);
    try {
      await sendChatMessage(texto);
      setDraft("");
      load();
    } catch (err) {
      console.error(err);
      setError("Tu mensaje no pudo enviarse (servicio no disponible aún).");
    } finally {
      setSending(false);
    }
  };

  return (
    <Box>
      <SectionHeader title="Chat del grupo" subtitle="Apóyense y motívense entre todos 💚" />

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
          minHeight: "40vh",
        }}
      >
        {loading ? (
          <LinearProgress sx={{ borderRadius: 4, mt: 2 }} />
        ) : messages.length === 0 ? (
          <EmptyState
            emoji="💬"
            title={error ? "Sin conexión" : "Aún no hay mensajes"}
            description={
              error ??
              "Envía el primer mensaje para romper el hielo con el grupo."
            }
            actionLabel="Reintentar"
            onAction={load}
          />
        ) : (
          messages.map((msg) => {
            const mine = msg.autorUserId === userInfo.id;
            return (
              <Box
                key={msg.id}
                display="flex"
                justifyContent={mine ? "flex-end" : "flex-start"}
                gap={1}
              >
                {!mine && (
                  <Avatar src={msg.autorFotoUrl || undefined} sx={{ width: 30, height: 30, bgcolor: "AMTeal.main", fontSize: 13 }}>
                    {msg.autorNombre?.charAt(0)?.toUpperCase() || "?"}
                  </Avatar>
                )}
                <Box
                  sx={{
                    maxWidth: "78%",
                    bgcolor: mine ? "primary.main" : "background.paper",
                    color: mine ? "primary.contrastText" : "text.primary",
                    border: mine ? "none" : "1px solid",
                    borderColor: "AMSnowGray.main",
                    borderRadius: mine ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    px: 1.8,
                    py: 1.1,
                  }}
                >
                  {!mine && (
                    <Typography variant="caption" fontWeight={700} display="block">
                      {msg.autorNombre}
                    </Typography>
                  )}
                  <Typography variant="body2" whiteSpace="pre-line">
                    {msg.texto}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }} display="block" textAlign="right">
                    {new Date(msg.fechaEnvio).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
                  </Typography>
                </Box>
              </Box>
            );
          })
        )}
        <div ref={endRef} />
      </Box>

      {/* Caja de envío */}
      <Box
        position="sticky"
        bottom="76px"
        mt={2}
      >
        <MuiTextField
          fullWidth
          size="small"
          placeholder="Escribe un mensaje…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          disabled={!!error && loading}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton color="primary" disabled={sending || !draft.trim()} onClick={handleSend}>
                  <Send />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        {sending && (
          <Typography variant="caption" color="text.secondary">
            Enviando…
          </Typography>
        )}
      </Box>
    </Box>
  );
}
