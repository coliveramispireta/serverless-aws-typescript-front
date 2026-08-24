"use client";
import { useState } from "react";
import {
  AppBar,
  Avatar,
  Box,
  Divider,
  Fab,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Paper,
  Toolbar,
  Typography,
  BottomNavigation,
  BottomNavigationAction,
} from "@mui/material";
import {
  Add,
  Groups,
  Home,
  Logout,
  Person,
  Restaurant,
  School,
} from "@mui/icons-material";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "aws-amplify/auth";

import { getUserInfo, cleanData } from "@/services/xstorage.cross.service";
import { isCoachEmail } from "@/lib/auth/roles";

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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  // Valor activo del bottom nav según la ruta actual
  const activeIndex = BOTTOM_NAV_ITEMS.findIndex(
    (item) => !item.href.startsWith("__") && pathname.startsWith(item.href)
  );

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch {
      // aunque falle el signOut remoto, limpiamos sesión local
    }
    cleanData();
    router.push("/login");
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
              <Image src="/keto/logo.svg" alt="KetoCoach" width={32} height={32} />
              <Typography variant="h6" fontWeight={800} letterSpacing={0.5}>
                Keto
                <Box component="span" sx={{ color: "primary.main" }}>Coach</Box>
              </Typography>
            </Box>
          </Link>

          <Box display="flex" alignItems="center" gap={1}>
            {isCoachEmail(userInfo.email) && (
              <IconButton onClick={() => router.push("/coach")} color="primary">
                <School />
              </IconButton>
            )}
            <IconButton onClick={handleMenuClick} size="small">
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
            <MenuItem onClick={() => router.push("/perfil")} sx={{ mt: 0.5 }}>
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
      <main className="appMain">{children}</main>

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
