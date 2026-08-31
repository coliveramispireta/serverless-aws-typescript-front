"use client";

import { Box, LinearProgress, Typography } from "@mui/material";

export interface ShareCardData {
  emoji: string;
  titulo: string;
  descripcion?: string;
  progreso?: { actual: number; meta: number } | null;
  nombre?: string;
  fecha?: string;
}

/**
 * Card visual del logro que se comparte por imagen (WhatsApp) o se muestra
 * como vista previa. Diseño keto con degradado, emoji grande, título y
 * progreso. Se renderiza en un nodo oculto para generar el PNG con html-to-image.
 */
export default function AchievementShareCard({ data, compact }: { data: ShareCardData; compact?: boolean }) {
  const pct =
    data.progreso && data.progreso.meta > 0
      ? Math.min(100, Math.round((data.progreso.actual / data.progreso.meta) * 100))
      : null;

  const S = compact ? 0.22 : 1;

  return (
    <Box
      sx={{
        width: 1080,
        height: 1080,
        transform: compact ? `scale(${S})` : undefined,
        transformOrigin: "top left",
        flexShrink: 0,
        background: "linear-gradient(160deg, #0d9488 0%, #134e4a 45%, #0f172a 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        boxSizing: "border-box",
        padding: "64px",
      }}
    >
      <Typography sx={{ fontSize: 160, lineHeight: 1.2 }}>{data.emoji}</Typography>

      <Typography
        sx={{
          color: "#f8fafc",
          fontWeight: 900,
          fontSize: 72,
          lineHeight: 1.1,
          mt: 2,
          px: 4,
          fontFamily: "inherit",
        }}
      >
        {data.titulo}
      </Typography>

      {data.descripcion && (
        <Typography
          sx={{
            color: "rgba(248,250,252,0.85)",
            fontSize: 30,
            lineHeight: 1.4,
            mt: 2,
            px: 4,
            maxWidth: 900,
          }}
        >
          {data.descripcion}
        </Typography>
      )}

      {pct !== null && (
        <Box sx={{ width: "72%", mt: 4 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              color: "#a7f3d0",
              fontSize: 24,
              fontWeight: 700,
              mb: 1,
            }}
          >
            <span>Progreso</span>
            <span>
              {data.progreso!.actual} / {data.progreso!.meta}
            </span>
          </Box>
          <LinearProgress
            variant="determinate"
            value={pct}
            sx={{
              height: 18,
              borderRadius: 9,
              bgcolor: "rgba(255,255,255,0.15)",
              "& .MuiLinearProgress-bar": { bgcolor: "#2dd4bf", borderRadius: 9 },
            }}
          />
        </Box>
      )}

      <Typography
        sx={{
          color: "rgba(248,250,252,0.6)",
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: 1,
          mt: 4,
          textTransform: "uppercase",
        }}
      >
        {data.nombre ? `${data.nombre} · ` : ""}KetoFlow
      </Typography>
    </Box>
  );
}
