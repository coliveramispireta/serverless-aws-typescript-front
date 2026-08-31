"use client";
import { useEffect, useState } from "react";
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Divider,
  Fab,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Switch,
  Toolbar,
  Typography,
  BottomNavigation,
  BottomNavigationAction,
} from "@mui/material";
import {
  Add,
  AutoAwesome,
  DarkModeOutlined,
  Explore,
  Groups,
  Home,
  LightModeOutlined,
  Logout,
  MenuBook,
  NotificationsActive,
  NotificationsNone,
  Person,
  Restaurant,
  School,
  Share,
} from "@mui/icons-material";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "aws-amplify/auth";

import { getUserInfo, cleanData } from "@/services/xstorage.cross.service";
import { isCoachEmail } from "@/lib/auth/roles";
import { useThemeMode } from "@/theme/thememode";
import { useOnboarding } from "@/context/onboarding/onboarding.context";
import { useNotifications } from "@/context/notifications/notifications.context";
import usePush from "@/hooks/usepush";
import ErrorBoundary from "@/components/ui/errorboundary";

const BOTTOM_NAV_ITEMS = [
  { label: "Inicio", href: "/inicio", icon: <Home /> },
  { label: "Comidas", href: "/alimentacion", icon: <Restaurant /> },
  { label: "__center__", href: "/peso", icon: <Add /> }, // slot especial (FAB central)
  { label: "Comunidad", href: "/comunidad", icon: <Groups /> },
  { label: "Perfil", href: "/perfil", icon: <Person /> },
];

/**
 * Shell principal de la app (mobile-first):
 *  - AppBar superior con logo y menú de usuario
 *  - Barra de navegación inferior con acción central destacada
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const userInfo = getUserInfo();
  const { mode, toggle: toggleTheme } = useThemeMode();
  const onboarding = useOnboarding();
  const notifs = useNotifications();
  const push = usePush();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  // Al iniciar sesión: registrar suscripción push pendiente (hecha en /login o
  // /instalar → backend envía la BIENVENIDA), re-asignar el dispositivo si ya
  // tenía suscripción local de una sesión anterior, y avisar inicio de sesión
  // (el backend saluda "bienvenido de vuelta" máx. 1 vez cada 24 h)
  useEffect(() => {
    if (!userInfo.isLogged) return;
    void (async () => {
      await push.flushPendingRegistration();
      await push.reassignOnLogin();
      void push.pingSession();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo.isLogged]);

  // Valor activo del bottom nav según la ruta actual
  const activeIndex = BOTTOM_NAV_ITEMS.findIndex(
    (item) => !item.href.startsWith("__") && pathname.startsWith(item.href)
  );

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    // Des-asignar el dispositivo ANTES de limpiar la sesión: deja de recibir
    // push de esta cuenta (la suscripción local se conserva para el próximo login)
    try {
      await push.unassignOnLogout();
    } catch {
      /* no bloquear el logout por esto */
    }
    try {
      await signOut();
    } catch {
      // aunque falle el signOut remoto, limpiamos sesión local
    }
    cleanData();
    router.push("/login");
    handleMenuClose();
  };

  // Comparte el enlace de instalación (Web Share API con fallback a portapapeles)
  const handleShareApp = async () => {
    const url = window.location.origin + "/instalar";
    try {
      if (navigator.share) {
        await navigator.share({
          title: "KetoFlow",
          text: "Tu transformación empieza con una decisión. Instala la app aquí:",
          url,
        });
        return;
      }
      await navigator.clipboard.writeText(url);
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        console.warn("share:", err);
      }
    }
    handleMenuClose();
  };

  return (
    <Box className="pageContainer" sx={{ bgcolor: "background.default" }}>
      {/* ---------- AppBar superior ---------- */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: "background.paper",
          color: "text.primary",
          borderBottom: "1px solid",
          borderColor: "AMSnowGray.main",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", px: { xs: 2, sm: 3 } }}>
          <Link href="/inicio" style={{ textDecoration: "none", display: "flex" }}>
            <Box display="flex" alignItems="center" gap={1}>
              <Image src="/keto/logo.svg" alt="KetoFlow" width={32} height={32} />
              <Typography variant="h6" fontWeight={800} letterSpacing={0.5}>
                Keto
                <Box component="span" sx={{ color: "primary.main" }}>Flow</Box>
              </Typography>
            </Box>
          </Link>

          <Box display="flex" alignItems="center" gap={1}>
            {isCoachEmail(userInfo.email) && (
              <IconButton onClick={() => router.push("/coach")} color="primary">
                <School />
              </IconButton>
            )}
            <IconButton
              onClick={() => router.push("/notificaciones")}
              aria-label="Notificaciones"
              color={notifs.unread > 0 ? "primary" : "default"}
            >
              <Badge badgeContent={notifs.unread} color="error" overlap="circular">
                <NotificationsNone />
              </Badge>
            </IconButton>
            <IconButton onClick={handleMenuClick} size="small" data-tour="appbar-menu">
              <Avatar
                src={userInfo.photoURL || undefined}
                alt={userInfo.userName}
                sx={{ width: 36, height: 36, bgcolor: "primary.main" }}
              >
                {userInfo.userName?.charAt(0)?.toUpperCase() || "?"}
              </Avatar>
            </IconButton>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            PaperProps={{ elevation: 4, sx: { mt: 1.2, minWidth: 190, px: 1 } }}
          >
            <Box px={2} py={1}>
              <Typography variant="subtitle2" noWrap>
                {userInfo.userName}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap display="block">
                {userInfo.email}
              </Typography>
            </Box>
            <Divider />
            {/* Configuración › Notificaciones (switch directo) */}
            {push.supported && (
              <MenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  if (push.subscribed) void push.disable();
                  else void push.enable();
                }}
                sx={{ mt: 0.5 }}
              >
                <ListItemIcon>
                  <NotificationsActive fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Notificaciones"
                  secondary={
                    push.subscribed
                      ? "Activadas"
                      : push.permission === "denied"
                        ? "Bloqueadas en el navegador"
                        : "Desactivadas"
                  }
                />
                <Switch edge="end" checked={push.subscribed} disableRipple />
              </MenuItem>
            )}
            {/* Alternar tema claro/oscuro (el menú permanece abierto) */}
            <MenuItem
              onClick={(e) => {
                e.stopPropagation();
                toggleTheme();
              }}
              sx={{ mt: 0.5 }}
            >
              <ListItemIcon>
                {mode === "light" ? <DarkModeOutlined fontSize="small" /> : <LightModeOutlined fontSize="small" />}
              </ListItemIcon>
              {mode === "light" ? "Modo oscuro" : "Modo claro"}
            </MenuItem>
            <MenuItem onClick={() => router.push("/bases")}>
              <ListItemIcon>
                <MenuBook fontSize="small" />
              </ListItemIcon>
              Bases de keto
            </MenuItem>
            <MenuItem onClick={() => onboarding.openIntro()}>
              <ListItemIcon>
                <AutoAwesome fontSize="small" />
              </ListItemIcon>
              Ver Introducción
            </MenuItem>
            <MenuItem onClick={() => onboarding.openTour()}>
              <ListItemIcon>
                <Explore fontSize="small" />
              </ListItemIcon>
              Ver recorrido de ayuda
            </MenuItem>
            <MenuItem onClick={handleShareApp}>
              <ListItemIcon>
                <Share fontSize="small" />
              </ListItemIcon>
              Compartir app
            </MenuItem>
            <MenuItem onClick={() => router.push("/perfil")}>
              <ListItemIcon>
                <Person fontSize="small" />
              </ListItemIcon>
              Mi perfil
            </MenuItem>
            {isCoachEmail(userInfo.email) && (
              <MenuItem onClick={() => router.push("/coach")}>
                <ListItemIcon>
                  <School fontSize="small" />
                </ListItemIcon>
                Panel del coach
              </MenuItem>
            )}
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ color: "error.main", mb: 0.5 }}>
              <ListItemIcon sx={{ color: "error.main" }}>
                <Logout fontSize="small" />
              </ListItemIcon>
              Cerrar sesión
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* ---------- Contenido ---------- */}
      <main className="appMain">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>

      {/* ---------- Bottom navigation ---------- */}
      <Paper
        elevation={6}
        square
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1200,
          borderTop: "1px solid",
          borderColor: "AMSnowGray.main",
          pb: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <BottomNavigation value={activeIndex === -1 ? false : activeIndex} showLabels>
          {BOTTOM_NAV_ITEMS.map((item) =>
            item.label === "__center__" ? (
              <BottomNavigationAction
                key="center"
                label=""
                data-tour="nav-peso"
                icon={
                  <Fab
                    color="primary"
                    size="medium"
                    aria-label="Registrar peso"
                    sx={{
                      position: "absolute",
                      top: -22,
                      left: "50%",
                      transform: "translateX(-50%)",
                      boxShadow: "0 6px 16px rgba(5, 150, 105, 0.45)",
                    }}
                  >
                    <Add />
                  </Fab>
                }
                onClick={() => router.push(item.href)}
                sx={{ pt: 3 }}
              />
            ) : (
              <BottomNavigationAction
                key={item.href}
                label={item.label}
                icon={item.icon}
                data-tour={`nav-${item.href.replace("/", "")}`}
                component={Link}
                href={item.href}
                disableRipple
              />
            )
          )}
        </BottomNavigation>
      </Paper>
    </Box>
  );
}
