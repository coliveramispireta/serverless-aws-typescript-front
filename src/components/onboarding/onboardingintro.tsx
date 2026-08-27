"use client";
import { useEffect, useMemo, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { ArrowForward, PlayCircleOutline } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { INTRO_SLIDES, KETOSIS_POSTER_URL, KETOSIS_VIDEO_URL } from "@/content/welcome";
import { getUserInfo } from "@/services/xstorage.cross.service";
import { useOnboarding } from "@/context/onboarding/onboarding.context";

/** Escribe el texto letra a letra y avisa cuando termina. */
function useTypewriter(text: string, active: boolean, speed = 42) {
  const [output, setOutput] = useState("");
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    setOutput("");
    setFinished(false);
    if (!active) {
      setOutput(text);
      setFinished(true);
      return;
    }
    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      setOutput(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setFinished(true);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, active, speed]);

  return { output, finished };
}

/**
 * Overlay de bienvenida (primer ingreso o "Ver Introducción" desde el menú).
 * Full-screen, mobile-first, con efecto de escritura y transiciones suaves.
 */
export default function OnboardingIntro() {
  const { introOpen, finishIntro, openTour } = useOnboarding();
  const router = useRouter();
  const userInfo = getUserInfo();
  const nombre = userInfo.userName || "bienvenido(a)";

  const [step, setStep] = useState(0);
  const slide = INTRO_SLIDES[Math.min(step, INTRO_SLIDES.length - 1)];
  const isLast = step >= INTRO_SLIDES.length - 1;

  // Al abrir la intro, reiniciar al primer slide
  useEffect(() => {
    if (introOpen) setStep(0);
  }, [introOpen]);

  const title = useMemo(
    () => slide.title.replace("{nombre}", nombre),
    [slide.title, nombre]
  );
  const tw = useTypewriter(title, introOpen ? slide.typewriter ?? false : false);
  const showCursor = !!slide.typewriter && !tw.finished;

  // Avance automático solo en frases puras (sin listas/media/CTA) al terminar de escribir
  const autoAdvance =
    !!slide.typewriter &&
    !slide.bullets &&
    !slide.features &&
    !slide.isVideo &&
    !slide.isDone &&
    !slide.link;

  useEffect(() => {
    if (!introOpen || !autoAdvance || !tw.finished) return;
    const t = setTimeout(() => {
      setStep((s) => Math.min(s + 1, INTRO_SLIDES.length - 1));
    }, 2200);
    return () => clearTimeout(t);
  }, [introOpen, autoAdvance, tw.finished, step]);

  if (!introOpen) return null;

  const handlePrimary = () => {
    if (isLast) {
      finishIntro();
      openTour();
      return;
    }
    setStep((s) => Math.min(s + 1, INTRO_SLIDES.length - 1));
  };

  // "Omitir" (o secundario en el slide final) → marca como visto y cierra
  const handleFinish = () => finishIntro();

  return (
    <Box
      className="kf-intro-bg"
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 5000,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Progreso */}
      <Box sx={{ px: 3, pt: 2.5 }}>
        <Box
          sx={{
            height: 6,
            borderRadius: 3,
            bgcolor: "action.hover",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              height: "100%",
              width: `${((step + 1) / INTRO_SLIDES.length) * 100}%`,
              borderRadius: 3,
              bgcolor: "primary.main",
              transition: "width 0.4s ease",
            }}
          />
        </Box>
      </Box>

      {/* Omitir */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", pr: 2, pt: 1 }}>
        <Button size="small" sx={{ color: "text.secondary" }} onClick={handleFinish}>
          Omitir
        </Button>
      </Box>

      {/* Contenido */}
      <Box
        key={slide.id}
        className="kf-fade-up"
        sx={{
          flex: 1,
          width: "100%",
          maxWidth: 480,
          mx: "auto",
          px: 3,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          gap: 3,
        }}
      >
        {slide.emoji && (
          <Typography sx={{ fontSize: 64, lineHeight: 1, flexShrink: 0 }}>
            {slide.emoji}
          </Typography>
        )}

        <Typography
          variant="h4"
          fontWeight={800}
          sx={{ fontSize: { xs: 24, sm: 30 }, lineHeight: 1.25, minHeight: "3.1em" }}
        >
          {tw.output}
          {showCursor && <span className="kf-cursor" />}
        </Typography>

        {slide.subtitle && (
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ lineHeight: 1.6, maxWidth: 380, display: "block", mt: -2 }}
          >
            {slide.subtitle}
          </Typography>
        )}

        {/* Viñetas (metabolismo / coach) */}
        {slide.bullets && (
          <Box
            component="ul"
            sx={{
              width: "100%",
              listStyle: "none",
              p: 0,
              m: 0,
              display: "flex",
              flexDirection: "column",
              gap: 1.25,
              textAlign: "left",
            }}
          >
            {slide.bullets.map((b, i) => (
              <Box
                component="li"
                key={i}
                className={`kf-fade-up kf-delay-${Math.min(i + 1, 3)}`}
                sx={{ display: "flex", gap: 1.25, alignItems: "flex-start" }}
              >
                <Typography sx={{ color: "primary.main", fontSize: 18, lineHeight: 1.5 }}>
                  •
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ lineHeight: 1.55 }}
                >
                  {b}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        {/* Refuerzo (Bases de keto) */}
        {slide.link && (
          <Button
            size="small"
            variant="text"
            onClick={() => router.push(slide.link!.href)}
            sx={{ color: "primary.main", fontWeight: 700 }}
          >
            {slide.link.label} →
          </Button>
        )}

        {/* Video de cetosis */}
        {slide.isVideo &&
          (KETOSIS_VIDEO_URL ? (
            <Box
              sx={{
                position: "relative",
                width: "100%",
                pt: "56.25%", // 16:9
                borderRadius: 3,
                overflow: "hidden",
                bgcolor: "background.paper",
              }}
            >
              <video
                src={KETOSIS_VIDEO_URL}
                poster={KETOSIS_POSTER_URL}
                title="Cetosis explicada"
                controls
                playsInline
                preload="metadata"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  border: 0,
                  background: "#000",
                  objectFit: "contain",
                }}
              />
            </Box>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1.5,
                borderRadius: 3,
                border: "1px dashed",
                borderColor: "primary.main",
                bgcolor: "background.paper",
                px: 3,
                py: 4,
                width: "100%",
              }}
            >
              <PlayCircleOutline sx={{ fontSize: 48, color: "primary.main" }} />
              <Typography variant="body2" color="text.secondary">
                Nuestro coach preparará un video explicativo de cetosis para ti.
              </Typography>
            </Box>
          ))}

        {/* Características de la plataforma */}
        {slide.features && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 1.5,
              width: "100%",
            }}
          >
            {slide.features.map((f) => (
              <Box
                key={f.label}
                sx={{
                  bgcolor: "background.paper",
                  borderRadius: 3,
                  px: 1.5,
                  py: 2,
                  textAlign: "center",
                  boxShadow: "0 4px 16px rgba(15, 23, 42, 0.06)",
                }}
              >
                <Typography sx={{ fontSize: 32, lineHeight: 1.2 }}>{f.emoji}</Typography>
                <Typography variant="body2" fontWeight={700}>
                  {f.label}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  {f.desc}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Controles */}
      <Box
        sx={{
          width: "100%",
          maxWidth: 480,
          mx: "auto",
          px: 3,
          pb: "calc(24px + env(safe-area-inset-bottom, 0px))",
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
        }}
      >
        {/* Puntos de progreso */}
        <Box sx={{ display: "flex", justifyContent: "center", gap: 0.75 }}>
          {INTRO_SLIDES.map((s, i) => (
            <Box
              key={s.id}
              sx={{
                width: i === step ? 22 : 7,
                height: 7,
                borderRadius: 4,
                bgcolor: i === step ? "primary.main" : "text.disabled",
                opacity: i === step ? 1 : 0.5,
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </Box>

        {slide.isDone ? (
          <>
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handlePrimary}
              endIcon={<ArrowForward />}
            >
              {slide.ctaLabel ?? "Comenzar recorrido"}
            </Button>
            <Button
              variant="text"
              fullWidth
              onClick={handleFinish}
              sx={{ color: "text.secondary" }}
            >
              {slide.secondaryLabel ?? "Explorar por mi cuenta"}
            </Button>
          </>
        ) : (
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handlePrimary}
            endIcon={<ArrowForward />}
          >
            {slide.ctaLabel ?? "Siguiente"}
          </Button>
        )}
      </Box>
    </Box>
  );
}