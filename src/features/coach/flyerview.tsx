"use client";
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  TextField as MuiTextField,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import { Campaign, CloudUpload } from "@mui/icons-material";

import EmptyState from "@/components/ui/emptystate";
import { createPost, listPosts, requestPostMediaUrl } from "@/services/keto/community.service";
import { Post } from "@/model/keto.models";
import { getUserInfo } from "@/services/xstorage.cross.service";

/**
 * 📣 Publicar flyer: el coach sube una imagen + texto opcional.
 * La publicación llega al feed de la comunidad y dispara
 * notificación push a TODOS los usuarios suscritos.
 */
export default function CoachFlyerView() {
  const userInfo = getUserInfo();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [snack, setSnack] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [recent, setRecent] = useState<Post[]>([]);

  const loadRecent = () => {
    listPosts()
      .then((data) => {
        const mine = (Array.isArray(data) ? data : []).filter(
          (p) => p.autorUserId === userInfo.id && !!p.imagenKey
        );
        setRecent(mine.slice(0, 6));
      })
      .catch(() => setRecent([]));
  };

  useEffect(loadRecent, []);

  const onFileSelected = (selected?: File | null) => {
    if (!selected || !selected.type.startsWith("image/")) return;
    setFile(selected);
    const reader = new FileReader();
    reader.onload = () => setPreview(String(reader.result));
    reader.readAsDataURL(selected);
  };

  const handlePublish = async () => {
    if (!file) return;
    setPublishing(true);
    try {
      // 1. URL prefirmada y subida directa a S3
      const { uploadUrl, imagenKey } = await requestPostMediaUrl(file.name, file.type);
      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      // 2. Publicación en el feed (+ push a todos por ser coach)
      await createPost({ texto: caption.trim(), imagenKey });

      setFile(null);
      setPreview(null);
      setCaption("");
      setSnack({ type: "success", msg: "📣 Flyer publicado y notificado a todo el grupo" });
      loadRecent();
    } catch (err) {
      console.error(err);
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setSnack({ type: "error", msg: msg || "No se pudo publicar. Intenta de nuevo." });
    } finally {
      setPublishing(false);
    }
  };

  if (publishing) return <LinearProgress sx={{ borderRadius: 4 }} />;

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {/* Formulario de publicación */}
      <Card elevation={0} sx={{ border: "2px solid", borderColor: "secondary.main" }}>
        <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
          <Box display="flex" alignItems="center" gap={1} mb={1.5}>
            <Campaign color="secondary" />
            <Typography variant="subtitle2" fontWeight={700}>
              Publicar flyer al grupo
            </Typography>
          </Box>

          {!preview ? (
            <Button variant="outlined" component="label" fullWidth startIcon={<CloudUpload />} sx={{ py: 3 }}>
              Elegir imagen del flyer
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => onFileSelected(e.target.files?.[0])}
              />
            </Button>
          ) : (
            <Box textAlign="center">
              <Box
                component="img"
                src={preview}
                alt="Vista previa del flyer"
                sx={{ maxHeight: 260, maxWidth: "100%", borderRadius: 4, border: "1px solid", borderColor: "AMSnowGray.main" }}
              />
              <Button size="small" onClick={() => { setFile(null); setPreview(null); }} sx={{ mt: 1 }}>
                Cambiar imagen
              </Button>
            </Box>
          )}

          <MuiTextField
            label="Texto del flyer (opcional)"
            fullWidth
            multiline
            minRows={2}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Ej: 🎉 Nuevo taller gratuito este sábado…"
            sx={{ mt: 2 }}
          />

          <Button
            variant="contained"
            color="secondary"
            fullWidth
            sx={{ mt: 2 }}
            disabled={!file || publishing}
            onClick={handlePublish}
          >
            {publishing ? "Publicando…" : "📣 Publicar y notificar a todos"}
          </Button>
        </CardContent>
      </Card>

      {/* Últimos flyers publicados */}
      <Box>
        <Typography variant="subtitle2" fontWeight={700} mb={1}>
          Mis últimos flyers
        </Typography>
        {recent.length === 0 ? (
          <EmptyState emoji="🖼️" title="Aún no has publicado flyers" />
        ) : (
          <Grid container spacing={1.5}>
            {recent.map((p) => (
              <Grid item xs={6} sm={4} key={p.id}>
                {p.imagenUrl && (
                  <Box component="img" src={p.imagenUrl} alt={p.texto} sx={{ width: "100%", borderRadius: 3, border: "1px solid", borderColor: "AMSnowGray.main" }} />
                )}
                <Typography variant="caption" color="text.secondary" noWrap display="block">
                  {p.texto || "(sin texto)"}
                </Typography>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

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
