"use client";
import { useEffect, useState } from "react";
import { Box, Button, IconButton, Typography } from "@mui/material";
import { Close, NavigateNext } from "@mui/icons-material";
import { useOnboarding } from "@/context/onboarding/onboarding.context";

interface TourStep {
  /** Selector del elemento a resaltar (atributo data-tour en AppShell) */
  target: string;
  emoji: string;
  title: string;
  text: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    target: '[data-tour="nav-inicio"]',
    emoji: "🏠",
    title: "Inicio",
    text: "Tu panel: aquí ves tu progreso, métricas y mensajes del día.",
  },
  {
    target: '[data-tour="nav-alimentacion"]',
    emoji: "🍽️",
    title: "Comidas",
    text: "Registra lo que comes desde el catálogo y tu hidratación diaria.",
  },
  {
    target: '[data-tour="nav-peso"]',
    emoji: "⚖️",
    title: "Peso",
    text: "Toca + para anotar tu peso, con foto de la báscula si quieres.",
  },
  {
    target: '[data-tour="nav-comunidad"]',
    emoji: "👥",
    title: "Comunidad",
    text: "Publica avances, recetas y comparte con tu grupo.",
  },
  {
    target: '[data-tour="nav-perfil"]',
    emoji: "🙋",
    title: "Perfil",
    text: "Tus metas, preferencias y configuración personal.",
  },
  {
    target: '[data-tour="appbar-menu"]',
    emoji: "☰",
    title: "Menú",
    text: "Notificaciones, modo oscuro, Ver Introducción / Recorrido, Bases de keto y cerrar sesión.",
  },
];

interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * Tour "spotlight": dark overlay con un hueco de luz sobre cada elemento.
 * Los pasos referencian atributos `data-tour` agregados en AppShell.
 */
export default function OnboardingTour() {
  const { tourOpen, closeTour } = useOnboarding();
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);

  useEffect(() => {
    if (!tourOpen) return;
    setStep(0);
    setRect(null);
  }, [tourOpen]);

  useEffect(() => {
    if (!tourOpen) return;
    const measure = () => {
      const el = document.querySelector<HTMLElement>(TOUR_STEPS[step].target);
      if (!el) {
        setRect(null);
        return;
      }
      el.scrollIntoView({ block: "center", behavior: "smooth" });
      const r = el.getBoundingClientRect();
      setRect({ left: r.left, top: r.top, width: r.width, height: r.height });
    };
    const t = setTimeout(measure, 140);
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", measure);
    };
  }, [tourOpen, step]);

  if (!tourOpen) return null;

  const current = TOUR_STEPS[step];
  const isLast = step === TOUR_STEPS.length - 1;
  const placeTop = rect ? rect.top > window.innerHeight * 0.5 : true;

  const handleNext = () => {
    if (isLast) closeTour();
    else setStep((s) => s + 1);
  };

  return (
    <Box sx={{ position: "fixed", inset: 0, zIndex: 4800, pointerEvents: "none" }}>
      {/* Hueco de luz sobre el elemento objetivo */}
      {rect && (
        <Box
          sx={{
            position: "fixed",
            left: rect.left - 8,
            top: rect.top - 8,
            width: rect.width + 16,
            height: rect.height + 16,
            borderRadius: 16,
            boxShadow: "0 0 0 9999px rgba(2, 6, 23, 0.55)",
            pointerEvents: "none",
            transition:
              "left 0.25s ease, top 0.25s ease, width 0.25s ease, height 0.25s ease",
          }}
        />
      )}

      {/* Tarjeta flotante */}
      <Box
        sx={{
          position: "fixed",
          left: 16,
          right: 16,
          mx: "auto",
          maxWidth: 420,
          top: placeTop ? 20 : undefined,
          bottom: placeTop ? undefined : 20,
          zIndex: 4803,
          pointerEvents: "auto",
          bgcolor: "background.paper",
          color: "text.primary",
          borderRadius: 4,
          boxShadow: "0 16px 48px rgba(2, 6, 23, 0.4)",
          px: 3,
          py: 2.5,
          display: "flex",
          flexDirection: "column",
          gap: 1.25,
          animation: "kf-fadeUp 0.25s ease",
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="caption" color="text.secondary" fontWeight={700}>
            {step + 1} / {TOUR_STEPS.length}
          </Typography>
          <IconButton
            size="small"
            onClick={closeTour}
            color="inherit"
            aria-label="Saltar recorrido"
          >
            <Close fontSize="small" />
          </IconButton>
        </Box>

        <Box display="flex" gap={1.5} alignItems="flex-start">
          <Typography sx={{ fontSize: 34, lineHeight: 1.1, flexShrink: 0 }}>
            {current.emoji}
          </Typography>
          <Box>
            <Typography variant="h6" fontWeight={800} mb={0.25}>
              {current.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
              {current.text}
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          fullWidth
          onClick={handleNext}
          endIcon={<NavigateNext />}
          sx={{ mt: 0.5 }}
        >
          {isLast ? "¡Listo! A empezar" : "Siguiente"}
        </Button>
      </Box>
    </Box>
  );
}