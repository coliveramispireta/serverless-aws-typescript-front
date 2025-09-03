"use client";

import { Box, Typography, Button, Grid } from "@mui/material";
import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <Box
      component="section"
      sx={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        pl: { xs: 2, md: 30 },
        pr: { xs: 2, md: 5 },
        py: 8,
        bgcolor: "transparent",
        width: "100%",
      }}
    >
      <Grid container spacing={4} alignItems="center">
        {/* Texto principal */}
        <Grid item xs={12} md={6}>
          <Typography color="white" variant="h3" component="h1" fontWeight={700} gutterBottom>
            Challenge <span style={{ color: "#32bb81" }}>Serverless AWS</span>
          </Typography>

          <Typography color="white" variant="h6" component="p">
            CRUD de registro de boletos
          </Typography>

          <Typography color="gray" variant="h6" component="p" sx={{ mb: 4 }}>
            #AWS #Lambda #DynamoDB #Serverless #TypeScript
          </Typography>

          {/* Botón de contacto */}
          <Link href="/dashboard" style={{ textDecoration: "none" }}>
            <Button
              variant="contained"
              color="info"
              size="large"
              sx={{ borderRadius: 8, textTransform: "none", fontWeight: 600 }}
            >
              ¡PRUEBA AHORA!
            </Button>
          </Link>
        </Grid>

        {/* Imagen o mockup */}
        <Grid item xs={12} md={6} textAlign="center">
          <img
            src="/img/png/imageImpulsoWeb2.png"
            alt=""
            width={400}
            height={400}
            style={{
              maxWidth: "100%",
              height: "auto",
              marginTop: "-50px",
              filter: "brightness(1.02) contrast(1.15) sepia(0.25) hue-rotate(-30deg) saturate(1)",
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
