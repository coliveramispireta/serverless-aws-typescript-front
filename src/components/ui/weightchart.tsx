"use client";
import { Box, Chip, Typography } from "@mui/material";
import { buildWeightSeries } from "@/lib/engine/metrics";
import { WeightEntry } from "@/model/keto.models";
import dayjs from "dayjs";

interface WeightChartProps {
  weights: WeightEntry[];
  targetWeight?: number;
}

const W = 320;
const H = 150;
const PAD_X = 30; // margen izquierdo para el eje Y de kg
const PLOT_TOP = 18; // márgen superior para etiquetas de kg
const PLOT_BOTTOM = 138; // base del área del peso

/**
 * Gráfica de evolución de peso (SVG ligero, sin dependencias extras).
 * - Eje X cronológico: los puntos se ubican por su fecha real.
 * - Etiquetas de kg sobre cada punto (o primero/último si hay muchos).
 * - Solo peso y meta: las comidas ya no se mezclan en este gráfico.
 */
export default function WeightChart({ weights, targetWeight }: WeightChartProps) {
  const series = buildWeightSeries(weights);

  if (series.length < 2) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" minHeight={120}>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Registra al menos dos pesos para ver tu evolución 📈
        </Typography>
      </Box>
    );
  }

  const values = series.map((p) => p.kg);
  let minV = Math.min(...values);
  let maxV = Math.max(...values);
  if (targetWeight != null) {
    minV = Math.min(minV, targetWeight);
    maxV = Math.max(maxV, targetWeight);
  }
  // Padding vertical (~8%) para que la línea respire y quepan etiquetas
  let range = maxV - minV || 1;
  const padV = range * 0.08;
  minV -= padV;
  maxV += padV;
  range = maxV - minV;

  // Fecha real (ms) de cada punto de peso
  const startMs = dayjs(series[0].date).valueOf();
  const endMs = dayjs(series[series.length - 1].date).valueOf();
  const spanMs = Math.max(1, endMs - startMs);

  const xMs = (t: number) => PAD_X + ((t - startMs) / spanMs) * (W - 2 * PAD_X);
  const x = (i: number) => xMs(dayjs(series[i].date).valueOf());
  const y = (kg: number) => PLOT_TOP + (1 - (kg - minV) / range) * (PLOT_BOTTOM - PLOT_TOP);

  const linePoints = series.map((p, i) => `${x(i)},${y(p.kg)}`).join(" ");
  const areaPath = `M ${x(0)},${PLOT_BOTTOM} L ${linePoints.split(" ").join(" L ")} L ${x(
    series.length - 1
  )},${PLOT_BOTTOM} Z`;

  const firstKg = series[0].kg;
  const lastKg = series[series.length - 1].kg;
  const wentDown = lastKg <= firstKg;
  const strokeColor = wentDown ? "#059669" : "#f59e0b";

  // Etiquetas de kg: todas si hay pocos puntos; si no, primero y último
  const showKgLabel = (i: number) =>
    series.length <= 8 || i === 0 || i === series.length - 1;

  // Eje Y de kg: 3-5 ticks con gridlines
  const yTicks: number[] = (() => {
    const count = 4;
    const out: number[] = [];
    for (let i = 0; i < count; i++) out.push(minV + (range * i) / (count - 1));
    return out;
  })();

  return (
    <Box>
      <Typography variant="caption" color="text.secondary" display="block" mb={1}>
        Evolución de tu peso registrado. La línea baja = pérdida 🎉. La punteada es tu meta.
      </Typography>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Evolución de peso">
        {/* Eje Y de kg: gridlines + etiquetas */}
        {yTicks.map((t, ti) => (
          <g key={`yt${ti}`}>
            <line x1={PAD_X} x2={W - PAD_X} y1={y(t)} y2={y(t)} stroke="#e2e8f0" strokeWidth={0.6} />
            <text x={PAD_X - 3} y={y(t) + 2.5} textAnchor="end" fontSize={8} fill="#94a3b8">
              {Math.round(t)}
            </text>
          </g>
        ))}
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

        {/* Área bajo la curva */}
        <path d={areaPath} fill={strokeColor} opacity={0.08} />

        {/* Línea de peso */}
        <polyline
          points={linePoints}
          fill="none"
          stroke={strokeColor}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Puntos + etiquetas de kg */}
        {series.map((p, i) => (
          <g key={`${p.date}-${i}`}>
            {showKgLabel(i) && (
              <text
                x={x(i)}
                y={y(p.kg) - 6}
                textAnchor="middle"
                fontSize={8.5}
                fontWeight={700}
                fill="#64748b"
              >
                {p.kg}
              </text>
            )}
            {i === series.length - 1 ? (
              <>
                <circle cx={x(i)} cy={y(p.kg)} r={4} fill={strokeColor} />
                <circle cx={x(i)} cy={y(p.kg)} r={7} fill={strokeColor} opacity={0.2} />
              </>
            ) : (
              <circle cx={x(i)} cy={y(p.kg)} r={3} fill={strokeColor} stroke="#fff" strokeWidth={1} />
            )}
          </g>
        ))}
      </svg>

      <Box display="flex" justifyContent="space-between" mt={0.5}>
        <Typography variant="caption" color="text.secondary">
          {firstKg} kg · {dayjs(series[0].date).format("DD/MM")}
        </Typography>
        <Typography variant="caption" fontWeight={700} sx={{ color: strokeColor }}>
          {lastKg} kg · {dayjs(series[series.length - 1].date).format("DD/MM")}
        </Typography>
      </Box>

      {/* Leyenda */}
      <Box display="flex" gap={1.5} justifyContent="center" mt={1} flexWrap="wrap">
        <Box display="flex" alignItems="center" gap={0.5}>
          <Box sx={{ width: 10, height: 10, borderRadius: 999, bgcolor: strokeColor }} />
          <Typography variant="caption" color="text.secondary">
            ⚖️ peso
          </Typography>
        </Box>
        {targetWeight != null && (
          <Box display="flex" alignItems="center" gap={0.5}>
            <Box sx={{ width: 10, height: 3, borderTop: "2px dashed #94a3b8" }} />
            <Typography variant="caption" color="text.secondary">
              🎯 objetivo
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}