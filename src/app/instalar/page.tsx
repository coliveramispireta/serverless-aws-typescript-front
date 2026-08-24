"use client";
import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import { AddToHomeScreen, ContentCopy, IosShare, MoreVert, Share } from "@mui/icons-material";

import InstallAppButton from "@/components/ui/installappbutton";

/**
 * Página pública y compartible: /instalar
 * Enlace directo para que cualquier persona instale KetoFlow en su celular.
 */
export default function InstalarPage() {
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== "undefined" ? window.location.origin : "";

  const handleShare = async () => {
    const payload = {
      title: "KetoFlow",
      text: "Tu transformación empieza con una decisión. Instala la app aquí:",
      url: shareUrl,
    };
    try {
      if (navigator.share) {
        await navigator.share(payload);
        return;
      }
      throw new Error("no-share");
    } catch (err) {
      if ((err as Error).name === "AbortError") return; // usuario cerró el diálogo
      // Fallback: copiar al portapapeles
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch {
        /* clipboard bloqueado */
      }
    }
  };

  return (
    <Box
      className="pageContainer"
      sx={{ background: "linear-gradient(180deg, #ecfdf5 0%, #f8fafc 45%)" }}
    >
      {/* Marca */}
      <Box textAlign="center" pt={6} pb={3} px={2}>
        <Box component="img" src="/keto/logo.svg" alt="KetoFlow" sx={{ width: 72, height: 72, mx: "auto" }} />
        <Typography variant="h4" fontWeight={800} mt={1.5}>
          Keto<span style={{ color: "#059669" }}>Flow</span>
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Tu transformación empieza con una decisión.
        </Typography>
      </Box>

      <Box maxWidth={480} mx="auto" px={2} pb={6}>
        {/* Instalación */}
        <Paper elevation={0} sx={{ p: { xs: 3, sm: 4 }, borderRadius: "24px", border: "1px solid", borderColor: "#e2e8f0", boxShadow: "0 12px 40px rgba(15,23,42,.06)", mb: 3 }}>
          <Typography variant="h5" fontWeight={800} textAlign="center">
            Instala la app en tu celular
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" mt={0.5} mb={3}>
            Sin tiendas de aplicaciones. Gratis y se actualiza sola.
          </Typography>

          <InstallAppButton showInstalledState />
        </Paper>

        {/* Instrucciones por plataforma */}
        <Typography variant="subtitle2" fontWeight={700} mb={1}>
          Instrucciones según tu teléfono
        </Typography>
        <Card elevation={0} sx={{ border: "1px solid", borderColor: "AMSnowGray.main", mb: 1.5 }}>
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <Typography fontWeight={700} gutterBottom>
              🤖 Android (Chrome)
            </Typography>
            <List dense disablePadding>
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <MoreVert fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Menú ⋮ → “Instalar app” o “Agregar a pantalla de inicio”" primaryTypographyProps={{ variant: "body2" }} />
              </ListItem>
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <IosShare fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Confirma y listo: ícono junto a tus apps" primaryTypographyProps={{ variant: "body2" }} />
              </ListItem>
            </List>
          </CardContent>
        </Card>

        <Card elevation={0} sx={{ border: "1px solid", borderColor: "AMSnowGray.main", mb: 3 }}>
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <Typography fontWeight={700} gutterBottom>
              🍎 iPhone / iPad (Safari)
            </Typography>
            <List dense disablePadding>
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <IosShare fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Toca Compartir ⬆️ (barra inferior)" primaryTypographyProps={{ variant: "body2" }} />
              </ListItem>
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <AddToHomeScreen fontSize="small" />
                </ListItemIcon>
                <ListItemText primary='“Agregar a pantalla de inicio” → Agregar' primaryTypographyProps={{ variant: "body2" }} />
              </ListItem>
            </List>
            <Typography variant="caption" color="text.secondary" display="block" mt={1}>
              En iPhone las notificaciones requieren la app instalada (iOS 16.4+).
            </Typography>
          </CardContent>
        </Card>

        <Divider sx={{ my: 3 }}>
          <Typography variant="caption" color="text.secondary" px={1}>
            comparte con tu grupo
          </Typography>
        </Divider>

        {/* Compartir enlace */}
        <Button variant="contained" fullWidth size="large" startIcon={<Share />} onClick={handleShare}>
          Compartir enlace de instalación
        </Button>
        <Button
          fullWidth
          size="small"
          startIcon={<ContentCopy />}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(shareUrl);
              setCopied(true);
              setTimeout(() => setCopied(false), 2500);
            } catch {
              /* portapapeles bloqueado */
            }
          }}
          sx={{ mt: 1 }}
          color="inherit"
        >
          Copiar enlace ({shareUrl})
        </Button>
        {copied && (
          <Typography variant="caption" color="primary" display="block" textAlign="center" mt={1}>
            ✓ Enlace copiado — pégalo en WhatsApp
          </Typography>
        )}
      </Box>
    </Box>
  );
}
