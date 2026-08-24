"use client";

import { useEffect, useState } from "react";
import { Box, Typography, LinearProgress } from "@mui/material";
import styles from "./loading.module.scss";

const phrases = [
  "Tu transformación empieza con una decisión.",
  "Cargando tu progreso…",
  "Cada registro cuenta…",
  "Preparando tus logros…",
  "No se trata de hacerlo perfecto. Se trata de no dejar de avanzar.",
];

/**
 * Loader de marca KetoFlow: logo con pulso + frase rotativa + barra fina.
 * Ligero y coherente con el tema verde keto.
 */
export default function LoadingComponent() {
  const [currentPhrase, setCurrentPhrase] = useState(0);

  useEffect(() => {
    const phraseInterval = setInterval(() => {
      setCurrentPhrase((prev) => (prev + 1) % phrases.length);
    }, 2400);
    return () => clearInterval(phraseInterval);
  }, []);

  return (
    <Box
      className="loader"
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 5000,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        background: "linear-gradient(180deg, #ecfdf5 0%, #f8fafc 60%)",
      }}
      role="status"
      aria-label="Cargando"
    >
      <Box className={styles.container} textAlign="center" px={3}>
        {/* Logo con pulso */}
        <div className={styles.logoWrap}>
          <img src="/keto/logo.svg" alt="" className={styles.logoImg} draggable={false} />
        </div>

        {/* Wordmark */}
        <Typography variant="h4" fontWeight={800} letterSpacing={0.5} mt={2}>
          Keto<span style={{ color: "#059669" }}>Flow</span>
        </Typography>

        {/* Frase rotativa */}
        <Typography
          key={currentPhrase}
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 1.5,
            maxWidth: 320,
            mx: "auto",
            minHeight: "2.6em",
            animation: `${styles.fadeIn} .5s ease`,
          }}
        >
          {phrases[currentPhrase]}
        </Typography>

        {/* Barra indeterminada */}
        <Box className={styles.barWrap}>
          <LinearProgress
            color="primary"
            sx={{ height: 5, borderRadius: 4, backgroundColor: "#d1fae5" }}
          />
        </Box>
      </Box>
    </Box>
  );
}
