"use client";
import { Box, Card, Typography } from "@mui/material";
import { buildWeightSeries } from "@/lib/engine/metrics";
import { WeightEntry } from "@/model/keto.models";

interface WeightChartProps {
  weights: WeightEntry[];
  targetWeight?: number;
}

const W = 320;
const H = 140;
const PAD_X = 8;
const PAD_Y = 12;

/**
 * Gráfica de evolución de peso (SVG ligero, sin dependencias extra).
 * Incluye línea punteada del objetivo cuando existe.
 */
export default function WeightChart({ weights, targetWeight }: WeightChartProps) {
  const series = buildWeightSeries(weights);

  if (series.length < 2) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minHeight={120}
      >
        <Typography variant="body2" color="text.secondary">
          Registra al menos dos pesos para ver tu evolución 📈
        </Typography>
      </Box>
    );
  }

  const values = series.map((p) => p.kg);
  let min = Math.min(...values);
  let max = Math.max(...values);
  if (targetWeight != null) {
    min = Math.min(min, targetWeight);
    max = Math.max(max, targetWeight);
  }
  const range = max - min || 1;

  const x = (i: number) => PAD_X + (i / (series.length - 1)) * (W - 2 * PAD_X);
  const y = (kg: number) => PAD_Y + (1 - (kg - min) / range) * (H - 2 * PAD_Y);

  const linePoints = series.map((p, i) => `${x(i)},${y(p.kg)}`).join(" ");
  const areaPath = `M ${x(0)},${H - PAD_Y} L ${linePoints.split(" ").join(" L ")} L ${x(
    series.length - 1
  )},${H - PAD_Y} Z`;

  const firstKg = series[0].kg;
  const lastKg = series[series.length - 1].kg;
  const wentDown = lastKg <= firstKg;
  const strokeColor = wentDown ? "#059669" : "#f59e0b";

  return (
    <Box>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Evolución de peso">
        {/* Área bajo la curva */}
        <path d={areaPath} fill={strokeColor} opacity={0.08} />
        {/* Línea de objetivo */}
        {targetWeight != null && (
          <>
            <line
              x1={PAD_X}
              x2={W - PAD_X}
              y1={y(targetWeight)}
              y2={y(targetWeight)}
              stroke="#94a3b8"
              strokeWidth={1}
              strokeDasharray="4 4"
            />
            <text x={W - PAD_X - 2} y={y(targetWeight) - 4} textAnchor="end" fontSize={9} fill="#64748b">
              objetivo {targetWeight} kg
            </text>
          </>
        )}
        {/* Línea de peso */}
        <polyline
          points={linePoints}
          fill="none"
          stroke={strokeColor}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Último punto destacado */}
        <circle cx={x(series.length - 1)} cy={y(lastKg)} r={4} fill={strokeColor} />
        <circle cx={x(series.length - 1)} cy={y(lastKg)} r={7} fill={strokeColor} opacity={0.2} />
      </svg>
      <Box display="flex" justifyContent="space-between" mt={0.5}>
        <Typography variant="caption" color="text.secondary">
          {firstKg} kg · inicio
        </Typography>
        <Typography variant="caption" fontWeight={700} sx={{ color: strokeColor }}>
          {lastKg} kg · actual
        </Typography>
      </Box>
    </Box>
  );
}
