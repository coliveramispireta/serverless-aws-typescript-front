"use client";
import { Box, Container, Typography } from "@mui/material";
import Link from "next/link";

/**
 * Layout para las pantallas de autenticación (login, registro, recuperar).
 * Mobile-first: marca centrada arriba + contenido en tarjeta.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box
      className="pageContainer"
      sx={{
        background: "linear-gradient(180deg, #ecfdf5 0%, #f8fafc 45%)",
      }}
    >
      <Box
        component="header"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          pt: { xs: 5, sm: 6 },
          pb: 3,
          px: 2,
          textAlign: "center",
        }}
      >
        <Link href="/" style={{ textDecoration: "none" }}>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={1}
          >
            <Box
              component="img"
              src="/keto/logo.svg"
              alt="KetoFlow"
              sx={{ width: 64, height: 64 }}
            />
            <Typography variant="h4" fontWeight={800} letterSpacing={0.5}>
              Keto<span style={{ color: "#059669" }}>Flow</span>
            </Typography>
          </Box>
        </Link>
        <Typography
          variant="body2"
          color="text.secondary"
          mt={1}
          maxWidth={320}
          textAlign="center"
        >
          Tu transformación empieza con una decisión.
        </Typography>
      </Box>
      <Container maxWidth="sm" sx={{ pb: 6 }}>
        {children}
      </Container>
    </Box>
  );
}
