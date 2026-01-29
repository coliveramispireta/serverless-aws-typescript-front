"use client";

import { cleanData, getUserInfo } from "@/services/xstorage.cross.service";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Link as MuiLink,
  Tooltip,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
} from "@mui/material";
import { get } from "http";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { handleClientScriptLoad } from "next/script";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useScreenDetector } from "@/hooks/usescreendetector";
import {
  AccountCircle,
  EmojiEvents,
  Logout,
  ReceiptLong,
  Settings,
  SettingsInputComponent,
  SpaceDashboardRounded,
  WorkspacePremium,
} from "@mui/icons-material";

const pages = [
  { label: "Inicio", href: "/" },
  { label: "Bases de la Apuesta", href: "/" },
];

export default function NavbarBets() {
  const { isMobile } = useScreenDetector();
  const [vibrate, setVibrate] = useState(false);
  const userInfo = getUserInfo();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const router = useRouter();
  const pathname = usePathname();

  //efecto para console de userInfo
  //  useEffect(() => {
  //    console.log('userInfo', userInfo);
  //  }, [userInfo]);

  useEffect(() => {
    const loop = () => {
      setVibrate(true);
      setTimeout(() => setVibrate(false), 4000); // 4s vibrando
    };

    loop(); // iniciar de inmediato
    const interval = setInterval(loop, 8000); // cada 8s (4s vibrando + 4s pausa)

    return () => clearInterval(interval);
  }, []);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    cleanData();
    router.push("/");
    handleClose();
  };

  return (
    <AppBar position="sticky" sx={{ backgroundColor: "#191a18" }} elevation={20}>
      <Toolbar sx={{ justifyContent: "space-between", px: { xs: 2, md: 10 } }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none" }}>
          <Box display="flex" alignItems="center">
            <img src="/bets/logo_wfc.png" alt="ImpulsoWeb logo" width={160} height={55} />
            {/* <Typography variant="h6" color="white" component="div" sx={{ ml: 1, fontWeight: 700 }}>
              SERVERLESS&nbsp;<span style={{ color: "#32bb81" }}>AWS</span>
            </Typography> */}
          </Box>
        </Link>

        {/* Links */}
        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 3 }}>
          {pages.map(({ label, href }) => (
            <MuiLink
              key={label}
              href={href}
              underline="none"
              sx={{ color: "white", fontWeight: 500, "&:hover": { color: "#32bb81" } }}
            >
              {label}
            </MuiLink>
          ))}
        </Box>

        {/* Botones a la derecha */}
        <Box sx={{ display: "flex", gap: 2 }}>
          {/* Botón de sorteo */}
          {pathname.includes("dashboard") ? (
            <Typography
              variant="body1"
              color="white"
              sx={{ mr: -3.6, display: "flex", alignItems: "center" }}
            >
              Hola {userInfo.userName.split(" ")[0]}!
            </Typography>
          ) : !pathname.includes("dashboard") && !isMobile ? null : //     size="small" //     color="secondary" //     variant="contained" //     fullWidth //   <Button // <Link href="/dashboard" style={{ textDecoration: "none" }}>
          //     className={vibrate ? "vibrate" : ""}
          //     sx={{
          //       borderRadius: 50,
          //       textTransform: "none",
          //       fontWeight: 500,
          //       fontSize: 16,
          //       px: 3,
          //       py: 1.05,
          //       my: 1,
          //     }}
          //   >
          //     Accede&nbsp;al&nbsp;dashboard
          //   </Button>
          // </Link>
          !pathname.includes("dashboard") &&
            isMobile ? null : //     className={vibrate ? "vibrate" : ""} //     size="small" //     color="secondary" //     variant="contained" //   <Button // <Link href="/dashboard" style={{ textDecoration: "none", width: "100%" }}>
          //     sx={{
          //       width: "90%",
          //       position: "fixed",
          //       top: 68,
          //       left: "5%",
          //       zIndex: 1300,
          //       borderRadius: 50,
          //       textTransform: "none",
          //       fontWeight: 500,
          //       fontSize: 16,
          //       px: 4,
          //       py: 1.2,
          //       boxShadow: 3,
          //     }}
          //   >
          //     Accede&nbsp;al&nbsp;dashboard
          //   </Button>
          // </Link>
          null}

          {!userInfo.isLogged ? (
            <Link href="/loginbets" style={{ textDecoration: "none" }}>
              <Button
                variant="outlined"
                color="inherit"
                size="small"
                sx={{
                  borderRadius: 50,
                  textTransform: "none",
                  fontWeight: 500,
                  fontSize: 16,
                  px: 3,
                  py: 1.05,
                  my: 1,
                  color: "white",
                  borderColor: "transparent",
                  "&:hover": {
                    backgroundColor: "primary.main",
                  },
                }}
              >
                Iniciar&nbsp;sesión
              </Button>
            </Link>
          ) : (
            //avatar
            <>
              <Tooltip title={userInfo.userName}>
                <IconButton
                  onClick={handleClick}
                  size="small"
                  sx={{ ml: 2 }}
                  aria-controls={open ? "avatar-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? "true" : undefined}
                >
                  <Avatar
                    src={userInfo.photoURL}
                    alt={userInfo.userName}
                    sx={{ width: 40, height: 40 }}
                  />
                </IconButton>
              </Tooltip>

              <Menu
                anchorEl={anchorEl}
                id="avatar-menu"
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                PaperProps={{
                  elevation: 8,
                  sx: {
                    mt: 1.3,
                    px: 1,
                    ml: 4,
                    minWidth: 170,
                    "& .MuiAvatar-root": {
                      width: 32,
                      height: 32,
                      mr: 2,
                    },
                  },
                }}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              >
                {/* Dashboard */}
                <Link href="/dashboard" passHref>
                  <MenuItem component="a">
                    <ListItemIcon>
                      <SpaceDashboardRounded fontSize="small" />
                    </ListItemIcon>
                    Dashboard
                  </MenuItem>
                </Link>

                {/* Perfil */}
                <Link href="/dashboard/profile" passHref>
                  <MenuItem component="a">
                    <ListItemIcon>
                      <AccountCircle fontSize="small" />
                    </ListItemIcon>
                    Mi Perfil
                  </MenuItem>
                </Link>

                <Divider />

                {/* Cierre de sesión */}
                <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
                  <ListItemIcon sx={{ color: "error.main" }}>
                    <Logout fontSize="small" />
                  </ListItemIcon>
                  Cerrar sesión
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
