"use client";

import { Box, Typography, Container } from "@mui/material";

export default function FooterBets() {
  return (
    <Box
      component="footer"
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        py: 1,
        backgroundColor: "#191a18",
        color: "#fff",
        zIndex: 1300,
      }}
    >
      <Container>
        <Typography textAlign="center" variant="body2" sx={{ opacity: 0.7 }}>
          © {new Date().getFullYear()} Los Bandidos Fullstack — Todos los derechos reservados
        </Typography>
      </Container>
    </Box>
  );
}
