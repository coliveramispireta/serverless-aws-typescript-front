"use client";
import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import { InstallMobile, IosShare, MoreVert, AddToHomeScreen } from "@mui/icons-material";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface InstallAppButtonProps {
  /** En páginas dedicadas (ej. /instalar) mostrar confirmación si ya está instalada */
  showInstalledState?: boolean;
}

/**
 * Botón visible "Instalar app":
 * - Si el navegador ofrece instalación nativa (Chrome/Android), lanza el prompt.
 * - Si no (iOS Safari), abre instrucciones guiadas según la plataforma.
 * - Se oculta cuando la app ya está instalada (salvo showInstalledState).
 */
export default function InstallAppButton({
  showInstalledState = false,
}: InstallAppButtonProps = {}) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // ¿Ya está instalada / en modo app?
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) {
      setInstalled(true);
      return;
    }

    setIsIOS(/iphone|ipad|ipod/i.test(window.navigator.userAgent));

    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const onAppInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  if (installed && !showInstalledState) return null;

  const handleClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        await deferredPrompt.userChoice;
      } catch {
        /* usuario canceló o falló */
      }
      setDeferredPrompt(null);
    } else {
      setHelpOpen(true);
    }
  };

  if (installed) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "AMSnowGray.main",
          bgcolor: "AMUltraLightBlue.main",
          textAlign: "center",
        }}
      >
        <Typography variant="body2" fontWeight={700}>
          ✅ Ya tienes KetoFlow instalada
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Búscala junto a tus otras apps
        </Typography>
      </Paper>
    );
  }

  return (
    <>
      <Button
        variant="outlined"
        color="primary"
        fullWidth
        startIcon={<InstallMobile />}
        onClick={handleClick}
        sx={{ borderRadius: 999 }}
      >
        Instalar app
      </Button>

      <Dialog open={helpOpen} onClose={() => setHelpOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle fontWeight={800}>Instalar KetoFlow</DialogTitle>
        <DialogContent dividers>
          {isIOS ? (
            <List dense disablePadding>
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <IosShare />
                </ListItemIcon>
                <ListItemText primary="Toca Compartir en Safari" secondary="El ícono de caja con flecha hacia arriba" />
              </ListItem>
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <AddToHomeScreen />
                </ListItemIcon>
                <ListItemText primary='Elige "Agregar a inicio"' secondary="Desliza si no lo ves a simple vista" />
              </ListItem>
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <InstallMobile />
                </ListItemIcon>
                <ListItemText primary="Confirma con Agregar" secondary="KetoFlow quedará como una app más" />
              </ListItem>
            </List>
          ) : (
            <List dense disablePadding>
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <MoreVert />
                </ListItemIcon>
                <ListItemText primary="Abre el menú del navegador" secondary="El ícono de los tres puntos ⋮" />
              </ListItem>
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <InstallMobile />
                </ListItemIcon>
                <ListItemText primary='Toca "Instalar app" o "Agregar a pantalla de inicio"' />
              </ListItem>
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <AddToHomeScreen />
                </ListItemIcon>
                <ListItemText primary="Confirma y listo" secondary="KetoFlow quedará como una app más" />
              </ListItem>
            </List>
          )}
          <Typography variant="caption" color="text.secondary" display="block" mt={2}>
            Funciona sin instalar nada extra y se actualiza sola.
          </Typography>
          <Button fullWidth onClick={() => setHelpOpen(false)} sx={{ mt: 1 }}>
            Entendido
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
