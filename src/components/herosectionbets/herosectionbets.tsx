"use client";

import { Box, Button, Typography, Container } from "@mui/material";
import Link from "next/link";
import { EmojiEvents, TrendingUp, Group } from "@mui/icons-material";
import { keyframes } from "@mui/system";
import { useEffect, useState } from "react";

// Animaciones
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export default function HeroSectionBets() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
<Box
  component="section"
  sx={{
    width: "100%",
    height: "100vh",          // 🔥 ocupa pantalla real
    position: "relative",     // 🔥 vuelve al flujo
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  }}
>
      {/* Flyer horizontal con efecto parallax */}
<Box
  component="img"
  src="/bets/flyer_apuesta_horizontal.png"
  alt="WFC Flyer"
  sx={{
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",

    /* 🔥 CLAVE */
    objectPosition: {
      xs: "center top",
      md: "center 20%",
    },

    transform: `translateY(-40px) scale(1.05)`,
    willChange: "transform",
  }}
/>


      {/* Gradient overlay mejorado - FIJO */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(ellipse at center, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%),
            linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.1))
          `,
          pointerEvents: "none",
        }}
      />

      {/* Efecto de brillo animado - FIJO */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, transparent, rgba(255,215,0,0.1), transparent)",
          backgroundSize: "1000px 100%",
          animation: `${shimmer} 3s infinite linear`,
          pointerEvents: "none",
        }}
      />

      {/* Contenido principal - FIJO */}
      <Container
        maxWidth="lg"
        sx={{
          position: "relative", // Cambio clave: de absolute a relative
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          minHeight: { xs: "60vh", md: "80vh" },
          py: { xs: 4, md: 6 },
          mt: -7
        }}
      >
        {/* Badges superiores - FIJO */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            animation: `${fadeInUp} 0.8s ease-out`,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              bgcolor: "rgba(255,215,0,0.15)",
              backdropFilter: "blur(10px)",
              px: 2,
              py: 1,
              borderRadius: 999,
              border: "1px solid rgba(255,215,0,0.3)",
              animation: `${float} 3s ease-in-out infinite`,
            }}
          >
            <EmojiEvents sx={{ color: "#ffd700", fontSize: 20 }} />
            <Typography
              variant="body2"
              fontWeight="700"
              sx={{ color: "#ffd700" }}
            >
              Premio + S/. 600
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              bgcolor: "rgba(76,175,80,0.15)",
              backdropFilter: "blur(10px)",
              px: 2,
              py: 1,
              borderRadius: 999,
              border: "1px solid rgba(76,175,80,0.3)",
              animation: `${float} 3s ease-in-out infinite 0.2s`,
            }}
          >
            <Group sx={{ color: "#4caf50", fontSize: 20 }} />
            <Typography
              variant="body2"
              fontWeight="700"
              sx={{ color: "#4caf50" }}
            >
              06 Meses
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              bgcolor: "rgba(33,150,243,0.15)",
              backdropFilter: "blur(10px)",
              px: 2,
              py: 1,
              borderRadius: 999,
              border: "1px solid rgba(33,150,243,0.3)",
              animation: `${float} 3s ease-in-out infinite 0.4s`,
            }}
          >
            <TrendingUp sx={{ color: "#2196f3", fontSize: 20 }} />
            <Typography
              variant="body2"
              fontWeight="700"
              sx={{ color: "#2196f3" }}
            >
              Resultados Reales
            </Typography>
          </Box>
        </Box>

        {/* Título central - FIJO */}
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            animation: `${fadeInUp} 1s ease-out 0.3s backwards`,
          }}
        >
          <Typography
            variant="h2"
            fontWeight="900"
            sx={{
              color: "white",
              textShadow: "0 4px 20px rgba(0,0,0,0.8)",
              mb: 2,
              background: "linear-gradient(45deg, #fff 30%, #ffd700 90%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            WFC · RETO DE PESO
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "rgba(255,255,255,0.9)",
              textShadow: "0 2px 10px rgba(0,0,0,0.8)",
              maxWidth: 600,
            }}
          >
            Transforma tu cuerpo, compite con amigos y gana premios increíbles
          </Typography>
        </Box>

        {/* Sección inferior con botones y stats - FIJO */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "center", md: "flex-end" },
            gap: 3,
            animation: `${fadeInUp} 1s ease-out 0.5s backwards`,
          }}
        >
          {/* Stats cards (solo desktop) - FIJO */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              gap: 2,
            }}
          >
            <Box
              sx={{
                bgcolor: "rgba(0,0,0,0.5)",
                backdropFilter: "blur(10px)",
                px: 3,
                py: 2,
                borderRadius: 3,
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <Typography variant="h4" fontWeight="900" color="#ffd700">
                4
              </Typography>
              <Typography variant="caption" color="rgba(255,255,255,0.7)">
                Participantes
              </Typography>
            </Box>

            <Box
              sx={{
                bgcolor: "rgba(0,0,0,0.5)",
                backdropFilter: "blur(10px)",
                px: 3,
                py: 2,
                borderRadius: 3,
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <Typography variant="h4" fontWeight="900" color="#4caf50">
                24kg
              </Typography>
              <Typography variant="caption" color="rgba(255,255,255,0.7)">
                Total perdido
              </Typography>
            </Box>
          </Box>

          {/* Botones de acción - FIJO */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexDirection: { xs: "column", sm: "row" },
              width: { xs: "100%", sm: "auto" },
            }}
          >
            <Link href="/bets" style={{ textDecoration: "none" }}>
              <Button
                variant="contained"
                size="large"
                sx={{
                  px: 5,
                  py: 1.8,
                  borderRadius: 999,
                  fontWeight: 800,
                  fontSize: "1.1rem",
                  textTransform: "none",
                  background: "linear-gradient(45deg, #ffd700 30%, #ff6b35 90%)",
                  boxShadow: "0 10px 40px rgba(255,215,0,0.4)",
                  animation: `${pulse} 2s ease-in-out infinite`,
                  minWidth: { xs: "100%", sm: 200 },
                  "&:hover": {
                    background:
                      "linear-gradient(45deg, #ffed4e 30%, #ff8c42 90%)",
                    boxShadow: "0 15px 50px rgba(255,215,0,0.5)",
                    transform: "translateY(-2px)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                🎯 Inscribirse Ahora
              </Button>
            </Link>

            <Link href="/bets" style={{ textDecoration: "none" }}>
              <Button
                variant="outlined"
                size="large"
                sx={{
                  px: 4,
                  py: 1.8,
                  borderRadius: 999,
                  fontWeight: 700,
                  textTransform: "none",
                  color: "white",
                  borderColor: "rgba(255,255,255,0.5)",
                  backdropFilter: "blur(10px)",
                  bgcolor: "rgba(0,0,0,0.3)",
                  minWidth: { xs: "100%", sm: "auto" },
                  "&:hover": {
                    borderColor: "#ffd700",
                    bgcolor: "rgba(255,215,0,0.1)",
                    transform: "translateY(-2px)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Ver Ranking
              </Button>
            </Link>
          </Box>
        </Box>
      </Container>

      {/* Partículas flotantes decorativas - FIJAS */}
      {[...Array(5)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: "absolute",
            width: { xs: 4, md: 6 },
            height: { xs: 4, md: 6 },
            borderRadius: "50%",
            bgcolor: "rgba(255,215,0,0.4)",
            top: `${20 + i * 15}%`,
            left: `${10 + i * 20}%`,
            animation: `${float} ${3 + i * 0.5}s ease-in-out infinite`,
            animationDelay: `${i * 0.3}s`,
            boxShadow: "0 0 20px rgba(255,215,0,0.5)",
            zIndex: 1,
          }}
        />
      ))}
    </Box>
  );
}