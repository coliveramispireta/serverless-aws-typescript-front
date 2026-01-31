"use client";

import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import styles from "./loading.module.scss";

const motivationalPhrases = [
  "Cargando tu reto...",
  "Preparando tu transformación...",
  "Tu mejor versión está cerca...",
  "Cada paso cuenta...",
  "¡Vamos por ese objetivo!",
];

export default function LoadingComponent() {
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [weight, setWeight] = useState(100);
  const [progress, setProgress] = useState(0);

  // Cambiar frases motivacionales
  useEffect(() => {
    const phraseInterval = setInterval(() => {
      setCurrentPhrase((prev) => (prev + 1) % motivationalPhrases.length);
    }, 2000);
    return () => clearInterval(phraseInterval);
  }, []);

  // Animación de pérdida de peso
  useEffect(() => {
    const weightInterval = setInterval(() => {
      setWeight((prev) => {
        if (prev > 70) return prev - 0.5;
        return 70;
      });
      setProgress((prev) => {
        if (prev < 100) return prev + 1.67;
        return 100;
      });
    }, 100);
    return () => clearInterval(weightInterval);
  }, []);

  return (
    <Box
      className="loader"
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        width: "100vw",
        height: "100vh",
        zIndex: "5000",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <div className={styles.container}>
        {/* Animación de báscula */}
        <div className={styles.scaleContainer}>
          <div className={styles.scale}>
            <div className={styles.scaleDisplay}>
              <Typography
                variant="h1"
                sx={{
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "4rem",
                  textShadow: "0 4px 20px rgba(0,0,0,0.3)",
                }}
              >
                {weight.toFixed(1)}
              </Typography>
              <Typography
                variant="h5"
                sx={{ color: "#fff", opacity: 0.9, mt: -1 }}
              >
                kg
              </Typography>
            </div>
            <div className={styles.scalePlatform}></div>
          </div>

          {/* Indicador de progreso circular */}
          <div className={styles.progressRing}>
            <svg width="200" height="200">
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="8"
              />
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="#4ade80"
                strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 90}`}
                strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
                strokeLinecap="round"
                className={styles.progressCircle}
              />
            </svg>
            <div className={styles.progressText}>
              <Typography variant="h4" sx={{ color: "#fff", fontWeight: 700 }}>
                {Math.round(progress)}%
              </Typography>
            </div>
          </div>

          {/* Iconos de fitness animados */}
          <div className={styles.fitnessIcons}>
            <div className={`${styles.icon} ${styles.iconDumbbell}`}>💪</div>
            <div className={`${styles.icon} ${styles.iconApple}`}>🍎</div>
            <div className={`${styles.icon} ${styles.iconFire}`}>🔥</div>
            <div className={`${styles.icon} ${styles.iconTrophy}`}>🏆</div>
          </div>
        </div>

        {/* Frase motivacional */}
        <Box mt={6}>
          <Typography
            variant="h4"
            sx={{
              color: "#fff",
              fontWeight: 600,
              textAlign: "center",
              animation: `${styles.fadeInOut} 2s ease-in-out infinite`,
            }}
          >
            {motivationalPhrases[currentPhrase]}
          </Typography>
        </Box>

        {/* Logo */}
        <Box display="flex" alignItems="center" justifyContent="center" mt={4}>
          <div className={styles.logoIcon}>⚡</div>
          <Typography
            variant="h3"
            sx={{
              color: "#fff",
              fontWeight: 700,
              ml: 2,
              textShadow: "0 4px 20px rgba(0,0,0,0.3)",
            }}
          >
            FIT<span style={{ color: "#4ade80" }}>CHALLENGE</span>
          </Typography>
        </Box>
      </div>
    </Box>
  );
}