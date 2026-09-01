"use client";
import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import { CameraAlt, Check, Close, ContentCopy, Send, Share as ShareIcon } from "@mui/icons-material";
import {
  canSystemShare,
  copyText,
  shareNodeAsImage,
} from "@/lib/shareImage";
import MetricShareCard, {
  METRIC_CARD_SIZE,
  METRIC_PREVIEW_SCALE,
  METRIC_PREVIEW_SIZE,
  MetricShareData,
} from "./metricsharecard";

interface ShareMetricDialogProps {
  open: boolean;
  metric: MetricShareData | null;
  onClose: () => void;
}

const WHATSAPP_URL = (t: string) =>
  `https://wa.me/?text=${encodeURIComponent(t)}`;
const FACEBOOK_URL = (t: string) =>
  `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent("https://ketoflow.app")}&quote=${encodeURIComponent(t)}`;

/**
 * Diálogo para compartir una métrica (peso, cetosis, hidratación o general)
 * como imagen PNG. Vías: WhatsApp (imagen), Facebook (texto), menú nativo
 * (Web Share) y copiar texto.
 */
export default function ShareMetricDialog({ open, metric, onClose }: ShareMetricDialogProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [building, setBuilding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    if (open) {
      setError(null);
      setCopied(false);
      setPreview(false);
      // Pequeño delay para que el nodo esté montado antes de capturar
      if (metric) {
        const t = window.setTimeout(() => setPreview(true), 60);
        return () => window.clearTimeout(t);
      }
    }
  }, [open, metric]);

  if (!metric) return null;

  const shareText = [
    `${metric.emoji} ${metric.titulo}${metric.subtitulo ? ` — ${metric.subtitulo}` : ""}`,
    ...metric.stats.map((s) => `• ${s.label}: ${s.value}`),
    "Unite a mi progreso en KetoFlow 🥑",
  ].join("\n");

  const handleCopy = async () => {
    const ok = await copyText(shareText);
    setCopied(ok);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const handleSystemShare = async () => {
    if (!canSystemShare()) {
      await handleCopy();
      return;
    }
    try {
      await navigator.share({ title: metric.titulo, text: shareText });
    } catch {
      // Usuario canceló
    }
  };

  const handleShareImage = async () => {
    if (!cardRef.current || !preview) return;
    setBuilding(true);
    setError(null);
    try {
      await shareNodeAsImage(cardRef.current, "ketoflow-metrica.png", {
        title: metric.titulo,
        text: shareText,
        size: { width: METRIC_CARD_SIZE, height: METRIC_CARD_SIZE },
      });
    } catch {
      setError("No se pudo generar la imagen. Intenta con otras vías.");
    } finally {
      setBuilding(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pr: 1,
        }}
      >
        <Typography fontWeight={800}>Compartir métrica</Typography>
        <IconButton onClick={onClose} size="small" aria-label="Cerrar">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        {/* Vista previa del card que se comparte */}
        <Box display="flex" justifyContent="center" my={2}>
          <Box
            sx={{
              width: METRIC_PREVIEW_SIZE,
              height: METRIC_PREVIEW_SIZE,
              overflow: "hidden",
              borderRadius: 2,
              boxShadow: 3,
            }}
          >
            <MetricShareCard data={metric} compact />
          </Box>
        </Box>

        {/* Nodo oculto en tamaño completo para el PNG.
            Se mantiene dentro del viewport pero invisible (opacity 0) para que el
            navegador le dé layout/render real y html-to-image lo capture bien. */}
        <Box
          ref={cardRef}
          sx={{
            position: "fixed",
            left: 0,
            top: 0,
            zIndex: -5,
            width: METRIC_CARD_SIZE,
            height: METRIC_CARD_SIZE,
            opacity: 0,
            pointerEvents: "none",
            overflow: "hidden",
          }}
        >
          {preview && <MetricShareCard data={metric} />}
        </Box>

        {error && (
          <Typography color="error" variant="caption" display="block" mb={1}>
            {error}
          </Typography>
        )}

        <Box display="flex" flexDirection="column" gap={1}>
          <Button
            variant="contained"
            fullWidth
            startIcon={building ? <CircularProgress size={18} color="inherit" /> : <CameraAlt />}
            disabled={building || !preview}
            onClick={handleShareImage}
          >
            {building ? "Generando imagen…" : "Compartir como imagen"}
          </Button>

          <Button
            variant="outlined"
            fullWidth
            startIcon={<Send />}
            onClick={() => window.open(WHATSAPP_URL(shareText), "_blank", "noopener,noreferrer")}
          >
            WhatsApp
          </Button>

          <Button
            variant="outlined"
            fullWidth
            startIcon={<ShareIcon />}
            onClick={() => window.open(FACEBOOK_URL(shareText), "_blank", "noopener,noreferrer")}
          >
            Facebook
          </Button>

          <Button
            variant="outlined"
            fullWidth
            startIcon={canSystemShare() ? <ShareIcon /> : <ContentCopy />}
            onClick={handleSystemShare}
          >
            {canSystemShare() ? "Menú de compartir" : "Copiar resumen"}
          </Button>

          {copied && (
            <Typography variant="caption" color="success.main" display="flex" alignItems="center" gap={0.5}>
              <Check fontSize="small" /> Resumen copiado
            </Typography>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
