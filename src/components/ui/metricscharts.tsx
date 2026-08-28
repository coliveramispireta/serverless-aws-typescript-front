"use client";
import { ReactNode, useRef, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import { ChevronLeft, ChevronRight, InfoOutlined } from "@mui/icons-material";
import { HydrationDayStats, NutritionStats } from "@/lib/engine/metrics";

/** Botón de ayuda (tooltip) para explicar métricas y cálculos */
export function MetricHelp({ children }: { children: ReactNode }) {
  return (
    <Tooltip title={children} arrow placement="top">
      <IconButton size="small" sx={{ p: 0.5, color: "text.secondary" }} aria-label="Ayuda">
        <InfoOutlined
          fontSize="small"
          style={{ fontSize: 15, display: "flex" }}
        />
      </IconButton>
    </Tooltip>
  );
}

function EmptyText({ children }: { children: ReactNode }) {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight={120}
      textAlign="center"
      p={1}
    >
      <Typography variant="body2" color="text.secondary">
        {children}
      </Typography>
    </Box>
  );
}

function fmtDate(isoDate: string): string {
  const [, m, d] = isoDate.split("-");
  return `${d}/${m}`;
}

function fmtH(h: number): string {
  return h % 1 === 0 ? `${h} h` : `${h.toFixed(1)} h`;
}

// ─── Alimentación ─────────────────────────────────────────────

/**
 * Gráfico de alimentación: por día muestra el nº de comidas, la franja
 * horaria y las ventanas de cetosis 🔥 (≥12 h) / autofagia 🌀 (≥16 h),
 * además de los 🔴 por alimentos no KETO (posible pérdida de cetosis).
 */
export function NutritionChart({ stats }: { stats: NutritionStats }) {
  if (stats.days.length === 0) {
    return (
      <EmptyText>Registra tus comidas para ver tus ayunos y ventanas de cetosis 🍽️</EmptyText>
    );
  }

  return (
    <Box>
      {/* Resumen */}
      <Box display="flex" flexWrap="wrap" gap={0.5} mb={1}>
        {stats.ayunoNocturnoPromedioH != null && (
          <Chip
            size="small"
            variant="outlined"
            label={`🌙 Ayuno nocturno ${fmtH(stats.ayunoNocturnoPromedioH)}`}
          />
        )}
        <Chip size="small" color="success" variant="outlined" label={`🔥 Cetosis ${stats.diasCetosis} d`} />
        <Chip size="small" color="info" variant="outlined" label={`🌀 Autofagia ${stats.diasAutofagia} d`} />
        {stats.eventosNoKeto > 0 && (
          <Chip size="small" color="error" variant="outlined" label={`🔴 ${stats.eventosNoKeto} no KETO`} />
        )}
      </Box>

      {/* Días */}
      {stats.days.map((d) => (
        <Box
          key={d.date}
          display="flex"
          alignItems="center"
          gap={1}
          py={0.5}
          sx={{ borderBottom: "1px solid", borderColor: "divider" }}
        >
          <Typography variant="caption" fontWeight={700} sx={{ width: 40, flexShrink: 0 }}>
            {fmtDate(d.date)}
          </Typography>
          <Box flex={1} minWidth={0}>
            <Typography variant="caption" color="text.secondary">
              {d.nComidas} comidas{" "}
              {d.primera && d.ultima ? `· ${d.primera}–${d.ultima}` : ""}
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={0.5} mt={0.25}>
              {(d.ayunoMaxH ?? 0) >= 16 && (
                <Chip
                  size="small"
                  color="info"
                  variant="outlined"
                  label={`🌀 ayuno ${fmtH(d.ayunoMaxH!)}`}
                />
              )}
              {(d.ayunoMaxH ?? 0) >= 12 && (d.ayunoMaxH ?? 0) < 16 && (
                <Chip
                  size="small"
                  color="success"
                  variant="outlined"
                  label={`🔥 ayuno ${fmtH(d.ayunoMaxH!)}`}
                />
              )}
              {d.noKeto && (
                <Chip size="small" color="error" variant="outlined" label={`🔴×${d.noKetoCount} no KETO`} />
              )}
            </Box>
          </Box>
        </Box>
      ))}

      {stats.ayunoMasLargo && stats.ayunoMasLargo.horas >= 12 && (
        <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mt={1}>
          Tu ayuno más largo: <b>{fmtH(stats.ayunoMasLargo.horas)}</b> el{" "}
          {fmtDate(stats.ayunoMasLargo.date)}{" "}
          {stats.ayunoMasLargo.horas >= 16
            ? "(ventana ideal de autofagia)"
            : "(buena ventana de cetosis)"}
        </Typography>
      )}
    </Box>
  );
}

// ─── Hidratación ──────────────────────────────────────────────

function barColor(pct: number): string {
  if (pct >= 80) return "#0d9488";
  if (pct >= 50) return "#f59e0b";
  return "#ef4444";
}

function Legend({ color, text }: { color: string; text: string }) {
  return (
    <Box display="flex" alignItems="center" gap={0.5}>
      <Box sx={{ width: 10, height: 10, borderRadius: 1, bgcolor: color }} />
      <Typography variant="caption" color="text.secondary">
        {text}
      </Typography>
    </Box>
  );
}

/**
 * Gráfico de hidratación: barras diarias de ml consumidos vs la meta
 * (por peso y talla). Color por % de cumplimiento de la meta diaria.
 */
export function HydrationChart({
  days,
  objetivoMl,
  cumplimiento7d,
}: {
  days: HydrationDayStats[];
  objetivoMl?: number;
  cumplimiento7d?: number;
}) {
  if (days.length === 0) {
    return (
      <EmptyText>
        Registra tus líquidos (💧 en Alimentación) para ver tu cumplimiento de agua
      </EmptyText>
    );
  }

  return (
    <Box>
      <Box display="flex" flexWrap="wrap" gap={0.5} mb={1}>
        {objetivoMl ? (
          <Chip size="small" variant="outlined" label={`🎯 Meta ${(objetivoMl / 1000).toFixed(1)} L/día`} />
        ) : (
          <Chip size="small" variant="outlined" label="🎯 Configura peso y altura para tu meta" />
        )}
        {cumplimiento7d != null && (
          <Chip
            size="small"
            variant="outlined"
            label={`📊 Cumplimiento 7d ${cumplimiento7d}%`}
            sx={{ color: barColor(cumplimiento7d), borderColor: barColor(cumplimiento7d), fontWeight: 700 }}
          />
        )}
      </Box>

      <Box display="flex" alignItems="flex-end" gap={0.5} sx={{ height: 140, position: "relative" }}>
        {/* Línea de la meta (100%) */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            borderTop: "2px dashed",
            borderColor: "divider",
          }}
        />
        {days.map((d) => {
          const pct = Math.min(100, Math.max(3, d.pct));
          return (
            <Tooltip
              key={d.date}
              title={`${fmtDate(d.date)} · ${d.ml} ml (${d.pct}% de la meta)`}
              arrow
            >
              <Box
                sx={{
                  flex: 1,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  minWidth: 0,
                }}
              >
                <Box
                  sx={{
                    height: `${pct}%`,
                    bgcolor: barColor(d.pct),
                    borderRadius: "4px 4px 2px 2px",
                    minHeight: 3,
                  }}
                />
                <Typography variant="caption" sx={{ fontSize: 8, lineHeight: 1.4 }} align="center">
                  {fmtDate(d.date)}
                </Typography>
              </Box>
            </Tooltip>
          );
        })}
      </Box>

      <Box display="flex" gap={1.5} justifyContent="center" mt={1} flexWrap="wrap">
        <Legend color={barColor(90)} text="≥80% de la meta" />
        <Legend color={barColor(65)} text="50–80%" />
        <Legend color={barColor(30)} text="<50%" />
      </Box>
    </Box>
  );
}

// ─── Carrusel ─────────────────────────────────────────────────

export interface MetricTab {
  id: string;
  label: string;
  content: ReactNode;
}

/**
 * Carrusel de métricas: selector segmentado + flechas + swipe.
 * Muestra un gráfico a la vez (peso, alimentación o hidratación).
 */
export function MetricsCarousel({ tabs }: { tabs: MetricTab[] }) {
  const [index, setIndex] = useState(0);
  const touchX = useRef<number | null>(null);
  const count = tabs.length;

  const go = (next: number) => setIndex(Math.max(0, Math.min(count - 1, next)));

  return (
    <Card elevation={0} sx={{ border: "1px solid", borderColor: "AMSnowGray.main" }}>
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Box display="flex" alignItems="center" mb={1}>
          <IconButton
            size="small"
            onClick={() => go(index - 1)}
            disabled={index === 0}
            aria-label="Gráfico anterior"
          >
            <ChevronLeft />
          </IconButton>
          <Tabs
            value={index}
            onChange={(_, v) => go(v as number)}
            variant="fullWidth"
            sx={{
              flex: 1,
              mx: 0.5,
              minHeight: 38,
              "& .MuiTab-root": { minHeight: 38, fontSize: 12, fontWeight: 700 },
            }}
          >
            {tabs.map((t) => (
              <Tab key={t.id} label={t.label} />
            ))}
          </Tabs>
          <IconButton
            size="small"
            onClick={() => go(index + 1)}
            disabled={index === count - 1}
            aria-label="Siguiente gráfico"
          >
            <ChevronRight />
          </IconButton>
        </Box>

        <Box
          key={tabs[index].id}
          onTouchStart={(e) => {
            touchX.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            if (touchX.current == null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (dx > 60) go(index - 1);
            else if (dx < -60) go(index + 1);
            touchX.current = null;
          }}
        >
          {tabs[index].content}
        </Box>
      </CardContent>
    </Card>
  );
}