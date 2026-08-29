"use client";
import { ReactNode, useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Collapse,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Typography,
} from "@mui/material";
import {
  Check,
  Close,
  ContentCopy,
  EmojiEvents,
  Groups,
  Send,
  Share as ShareIcon,
} from "@mui/icons-material";
import { shareAchievement } from "@/services/keto/achievements.service";

export interface ShareableAchievement {
  codigo: string;
  titulo: string;
  descripcion?: string;
  emoji: string;
}

interface ShareAchievementDialogProps {
  open: boolean;
  achievement: ShareableAchievement | null;
  onClose: () => void;
  onPublished: (codigo: string) => void;
  alreadyPublished?: boolean;
}

function BrandCircle({ bg, children }: { bg: string; children: ReactNode }) {
  return (
    <Avatar
      sx={{
        width: 38,
        height: 38,
        bgcolor: bg,
        fontSize: 15,
        fontWeight: 800,
        color: "#fff",
        margin: "0 auto",
      }}
    >
      {children}
    </Avatar>
  );
}

/**
 * Diálogo de compartir logro:
 * - Publicar en la comunidad (muro del grupo) → POST /achievements/share.
 * - Compartir en WhatsApp.
 * - Compartir en Facebook.
 * - Otras redes: menú nativo del dispositivo (Web Share API) o X, Telegram,
 *   LinkedIn y copiar al portapapeles como alternativas.
 */
export default function ShareAchievementDialog({
  open,
  achievement,
  onClose,
  onPublished,
  alreadyPublished,
}: ShareAchievementDialogProps) {
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [copied, setCopied] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setPublishing(false);
      setPublished(Boolean(alreadyPublished));
      setCopied(false);
      setMoreOpen(false);
      setError(null);
    }
  }, [open, alreadyPublished]);

  if (!achievement) return null;

  const shareText = `¡Logré "${achievement.titulo}" en mi camino keto! ${achievement.emoji}`;
  const shareUrl = typeof window !== "undefined" ? window.location.origin : "";
  const fullText = `${shareText}\n${shareUrl}`;

  const canSystemShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  const openUrl = (url: string) => window.open(url, "_blank", "noopener,noreferrer");

  const handlePublish = async () => {
    if (publishing || published) return;
    setPublishing(true);
    setError(null);
    try {
      await shareAchievement({
        codigo: achievement.codigo,
        titulo: achievement.titulo,
        descripcion: achievement.descripcion,
        emoji: achievement.emoji,
        texto: shareText,
      });
      setPublished(true);
      onPublished(achievement.codigo);
      window.setTimeout(onClose, 1500);
    } catch (err) {
      console.error("shareAchievement:", err);
      setError(
        "No se pudo publicar ahora en la comunidad. Inténtalo de nuevo o usa otra vía."
      );
    } finally {
      setPublishing(false);
    }
  };

  const handleSystemShare = async () => {
    if (!canSystemShare) {
      setMoreOpen((v) => !v);
      return;
    }
    try {
      await navigator.share({
        title: achievement.titulo,
        text: fullText,
        url: shareUrl,
      });
    } catch {
      // El usuario canceló el menú del sistema
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Sin permiso de portapapeles
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pr: 1 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <EmojiEvents color="primary" />
          <Typography fontWeight={800}>Compartir logro</Typography>
        </Box>
        <IconButton onClick={onClose} size="small" aria-label="Cerrar">
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 0 }}>
        {/* Vista previa de lo que se compartirá */}
        <Box
          sx={{
            p: 1.5,
            borderRadius: 3,
            bgcolor: "AMUltraLightBlue.main",
            border: "1px solid",
            borderColor: "AMSnowGray.main",
            mb: 2,
          }}
        >
          <Typography fontSize={28} lineHeight={1}>
            {achievement.emoji}
          </Typography>
          <Typography fontWeight={700} mt={0.5}>
            {achievement.titulo}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-line", mt: 0.5 }}>
            {shareText}
          </Typography>
        </Box>

        {/* Publicar en la comunidad (muro del grupo) */}
        <Button
          fullWidth
          variant="contained"
          startIcon={published ? <Check /> : <Groups />}
          disabled={publishing || published}
          onClick={handlePublish}
          sx={{ py: 1.1, textTransform: "none" }}
        >
          {publishing ? <CircularProgress size={18} color="inherit" sx={{ mr: 1 }} /> : null}
          {published ? "✓ Publicado en la comunidad" : "Publicar en la comunidad"}
        </Button>
        <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
          Aparecerá en el muro de la comunidad del grupo.
        </Typography>

        {error && (
          <Typography variant="caption" color="error" display="block" mt={1}>
            {error}
          </Typography>
        )}

        <Divider sx={{ my: 1.5 }} />
        <Typography variant="caption" color="text.secondary" fontWeight={700}>
          Compartir en
        </Typography>

        {/* WhatsApp / Facebook / Otras redes */}
        <Box display="flex" gap={1} mt={1}>
          <Box
            flex={1}
            textAlign="center"
            onClick={() => openUrl(`https://wa.me/?text=${encodeURIComponent(fullText)}`)}
            sx={{ cursor: "pointer" }}
          >
            <BrandCircle bg="#25D366">W</BrandCircle>
            <Typography variant="caption" display="block" mt={0.5}>
              WhatsApp
            </Typography>
          </Box>
          <Box
            flex={1}
            textAlign="center"
            onClick={() =>
              openUrl(
                `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`
              )
            }
            sx={{ cursor: "pointer" }}
          >
            <BrandCircle bg="#1877F2">f</BrandCircle>
            <Typography variant="caption" display="block" mt={0.5}>
              Facebook
            </Typography>
          </Box>
          <Box flex={1} textAlign="center" onClick={handleSystemShare} sx={{ cursor: "pointer" }}>
            <BrandCircle bg="#7c3aed">
              <ShareIcon sx={{ fontSize: 18 }} />
            </BrandCircle>
            <Typography variant="caption" display="block" mt={0.5}>
              Otras redes
            </Typography>
          </Box>
        </Box>

        {!moreOpen && (
          <Box display="flex" justifyContent="space-between" alignItems="center" mt={1.5}>
            <Typography variant="caption" color="text.secondary">
              {canSystemShare
                ? "Toca “Otras redes” para abrir el menú del sistema con todas tus apps."
                : "Ver más redes disponibles."}
            </Typography>
            <Button size="small" onClick={() => setMoreOpen(true)}>
              Ver más ˅
            </Button>
          </Box>
        )}

        {/* Otras redes (colapsado) */}
        <Collapse in={moreOpen}>
          <Box display="flex" gap={1} mt={1.5}>
            <Box
              flex={1}
              textAlign="center"
              onClick={() => openUrl(`https://twitter.com/intent/tweet?text=${encodeURIComponent(fullText)}`)}
              sx={{ cursor: "pointer" }}
            >
              <BrandCircle bg="#000">𝕏</BrandCircle>
              <Typography variant="caption" display="block" mt={0.5}>
                X / Twitter
              </Typography>
            </Box>
            <Box
              flex={1}
              textAlign="center"
              onClick={() =>
                openUrl(
                  `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`
                )
              }
              sx={{ cursor: "pointer" }}
            >
              <BrandCircle bg="#229ED9">
                <Send sx={{ fontSize: 16 }} />
              </BrandCircle>
              <Typography variant="caption" display="block" mt={0.5}>
                Telegram
              </Typography>
            </Box>
            <Box
              flex={1}
              textAlign="center"
              onClick={() =>
                openUrl(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`)
              }
              sx={{ cursor: "pointer" }}
            >
              <BrandCircle bg="#0A66C2">in</BrandCircle>
              <Typography variant="caption" display="block" mt={0.5}>
                LinkedIn
              </Typography>
            </Box>
            <Box flex={1} textAlign="center" onClick={handleCopy} sx={{ cursor: "pointer" }}>
              <BrandCircle bg="#64748b">
                <ContentCopy sx={{ fontSize: 16 }} />
              </BrandCircle>
              <Typography variant="caption" display="block" mt={0.5}>
                {copied ? "✓ Copiado" : "Copiar"}
              </Typography>
            </Box>
          </Box>
        </Collapse>
      </DialogContent>
    </Dialog>
  );
}