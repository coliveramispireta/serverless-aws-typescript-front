"use client";
import { Box, Container, Typography } from "@mui/material";
import Link from "next/link";

/**
 * Layout simple para las pantallas de autenticación (login, registro, recuperar).
 * Mobile-first: contenido centrado con encabezado ligero.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box className="pageContainer" sx={{ bgcolor: "background.default" }}>
      <Box
        component="header"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          py: 4,
        }}
      >
        <Link href="/" style={{ textDecoration: "none", display: "flex" }}>
          <Typography variant="h5" fontWeight={800} letterSpacing={0.5}>
            Keto<span style={{ color: "#059669" }}>Coach</span>
          </Typography>
        </Link>
      </Box>
      <Container maxWidth="sm" sx={{ pb: 6 }}>
        {children}
      </Container>
    </Box>
  );
}
