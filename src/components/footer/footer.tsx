"use client";

import { Box, Typography, Grid, Container, Link, IconButton, Divider, Button } from "@mui/material";
import { Facebook, Twitter, Instagram, YouTube, MenuBook } from "@mui/icons-material";

export default function Footer() {
  return (
    <Box component="footer" sx={{ py: 6, backgroundColor: "#0d1a28", color: "#fff" }}>
      <Container>
        <Grid container spacing={4}>
          {/* Branding */}
          <Grid item xs={12} md={6}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Developer Cloud Fullstack
            </Typography>
            <Typography variant="body1" sx={{ maxWidth: 400, lineHeight: 1.6 }}>
              Challenge Serverless AWS
            </Typography>
            <Typography variant="body1" sx={{ maxWidth: 400, lineHeight: 1.6 }}>
              CRUD de registro de boletos.
            </Typography>
            <Box mt={2}>
              <IconButton href="#" sx={{ color: "#fff", "&:hover": { color: "#90caf9" } }}>
                <Facebook />
              </IconButton>
              <IconButton href="#" sx={{ color: "#fff", "&:hover": { color: "#90caf9" } }}>
                <Twitter />
              </IconButton>
              <IconButton href="#" sx={{ color: "#fff", "&:hover": { color: "#90caf9" } }}>
                <Instagram />
              </IconButton>
              <IconButton href="#" sx={{ color: "#fff", "&:hover": { color: "#ff5252" } }}>
                <YouTube />
              </IconButton>
              <IconButton href="#" sx={{ color: "#fff", "&:hover": { color: "#69C9D0" }, p: 1 }}>
                {/* TikTok icon custom SVG */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12.75 2h2.016c.085 1.052.424 1.835 1.008 2.35.584.514 1.357.795 2.32.844v2.056a5.55 5.55 0 0 1-1.792-.28 4.863 4.863 0 0 1-1.344-.688v7.803a4.883 4.883 0 0 1-.781 2.781 5.16 5.16 0 0 1-1.969 1.719 5.487 5.487 0 0 1-2.438.531c-1.328 0-2.469-.368-3.422-1.104-.953-.736-1.469-1.82-1.547-3.25v-.688c0-1.49.45-2.61 1.352-3.359.901-.75 2.063-1.125 3.484-1.125.469 0 .922.054 1.359.162v2.125a2.66 2.66 0 0 0-.906-.156c-.693 0-1.26.229-1.703.688-.443.458-.684 1.063-.719 1.813v.531c0 .792.236 1.406.709 1.844.472.437 1.062.656 1.77.656.792 0 1.424-.276 1.898-.828.474-.553.711-1.26.711-2.125V2z" />
                </svg>
              </IconButton>
            </Box>
          </Grid>

          {/* Enlaces principales */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Enlaces útiles
            </Typography>
            <Box>
              {[
                { label: "Inicio", href: "/" },
                { label: "Contacto", href: "/#contacto" },
                { label: "Preguntas frecuentes", href: "/preguntas-frecuentes" },
              ].map((link, i) => (
                <Link
                  key={i}
                  href={link.href}
                  underline="hover"
                  color="inherit"
                  variant="body1"
                  sx={{
                    display: "block",
                    mb: 1,
                    "&:hover": { color: "#90caf9" },
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: "rgba(255,255,255,0.2)" }} />

        {/* Ayuda + Libro de Reclamaciones */}
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              ¿Necesitas ayuda? Escríbenos a:{" "}
              <Link href="mailto:coliveramispireta@gmail" color="inherit" underline="always">
                coliveramispireta@gmail
              </Link>
            </Typography>
          </Grid>
          <Grid item xs={12} md={4} textAlign={{ xs: "left", md: "right" }}>
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              href="/cv/CV-CARLOS-OLIVERA-MISPIRETA.pdf"
              startIcon={<MenuBook />}
              sx={{
                borderColor: "#90caf9",
                color: "#90caf9",
                "&:hover": {
                  backgroundColor: "rgba(144, 202, 249, 0.1)",
                },
              }}
            >
              Descarga mi CV
            </Button>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: "rgba(255,255,255,0.2)" }} />

        {/* Enlaces legales */}
        <Grid container justifyContent="center" spacing={2} mb={2}>
          {[
            { label: "Política de Privacidad", href: "/" },
            { label: "Política de Cookies", href: "/" },
            { label: "Términos y Condiciones", href: "/" },
          ].map((item, i) => (
            <Grid item key={i}>
              <Link href={item.href} color="inherit" underline="hover" variant="body2">
                {item.label}
              </Link>
            </Grid>
          ))}
        </Grid>

        {/* Copyright */}
        <Typography textAlign="center" variant="body2" sx={{ opacity: 0.7 }}>
          © {new Date().getFullYear()} Carlos Olivera Mispireta — Todos los derechos reservados
        </Typography>
      </Container>
    </Box>
  );
}
