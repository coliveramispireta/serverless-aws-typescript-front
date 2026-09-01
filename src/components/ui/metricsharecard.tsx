"use client";

import { Box, Typography } from "@mui/material";

export interface MetricShareStat {
  label: string;
  value: string;
}

export interface MetricShareData {
  emoji: string;
  titulo: string;
  subtitulo?: string;
  stats: MetricShareStat[];
  nombre?: string;
}

/** Tamaño de diseño base del card (px) — también se usa para el PNG 1:1 */
export const METRIC_CARD_SIZE = 1080;
/** Tamaño de la vista previa en el diálogo (px) */
export const METRIC_PREVIEW_SIZE = 240;
/** Escala exacta para que el contenido centrado caiga en el centro de la preview */
export const METRIC_PREVIEW_SCALE = METRIC_PREVIEW_SIZE / METRIC_CARD_SIZE;

/**
 * Card visual de una métrica (peso, cetosis, hidratación o general) para
 * compartir como imagen. Se renderiza en un nodo oculto para generar el PNG.
 */
export default function MetricShareCard({
  data,
  compact,
}: {
  data: MetricShareData;
  compact?: boolean;
}) {
  const S = compact ? METRIC_PREVIEW_SCALE : 1;

  return (
    <Box
      sx={{
        width: METRIC_CARD_SIZE,
        height: METRIC_CARD_SIZE,
        transform: compact ? `scale(${S})` : undefined,
        transformOrigin: "top left",
        flexShrink: 0,
        background: "linear-gradient(160deg, #059669 0%, #0d9488 45%, #0f172a 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        boxSizing: "border-box",
        padding: "64px",
      }}
    >
      <Typography sx={{ fontSize: 140, lineHeight: 1.2 }}>{data.emoji}</Typography>

      <Typography
        sx={{
          color: "#f8fafc",
          fontWeight: 900,
          fontSize: 60,
          lineHeight: 1.1,
          mt: 1,
          px: 4,
          fontFamily: "inherit",
        }}
      >
        {data.titulo}
      </Typography>

      {data.subtitulo && (
        <Typography
          sx={{
            color: "rgba(248,250,252,0.8)",
            fontSize: 26,
            lineHeight: 1.4,
            mt: 1,
            px: 4,
            maxWidth: 900,
          }}
        >
          {data.subtitulo}
        </Typography>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: data.stats.length >= 3 ? "repeat(3, 1fr)" : "repeat(2, 1fr)",
          gap: "24px",
          width: "86%",
          mt: 4,
        }}
      >
        {data.stats.map((st) => (
          <Box
            key={st.label}
            sx={{
              bgcolor: "rgba(255,255,255,0.08)",
              borderRadius: 3,
              p: "22px 12px",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <Typography sx={{ color: "#a7f3d0", fontSize: 34, fontWeight: 900 }}>
              {st.value}
            </Typography>
            <Typography sx={{ color: "rgba(248,250,252,0.7)", fontSize: 20, mt: 0.5 }}>
              {st.label}
            </Typography>
          </Box>
        ))}
      </Box>

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
