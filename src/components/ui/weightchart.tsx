"use client";
import { Box, Chip, Typography } from "@mui/material";
import { buildMealTimeline, buildWeightSeries } from "@/lib/engine/metrics";
import { MealEntry, WeightEntry } from "@/model/keto.models";
import dayjs from "dayjs";

interface WeightChartProps {
  weights: WeightEntry[];
  targetWeight?: number;
  meals?: MealEntry[];
}

const W = 320;
const H = 150;
const PAD_X = 8;
const PLOT_TOP = 18; // márgen superior para etiquetas de kg
const PLOT_BOTTOM = 124; // base del área del peso
const STRIP_TOP = 126; // zona de la cinta de comidas
const STRIP_BOTTOM = 148;
const STRIP_H = STRIP_BOTTOM - STRIP_TOP;

const MEAL_COLOR = "#f59e0b";

/**
 * Gráfica de evolución de peso (SVG ligero, sin dependencias extras).
 * - Eje X cronológico: los puntos se ubican por su fecha real.
 * - Franja inferior "comidas por día": barras ámbar con más altura/opacidad
 *   cuantas más comidas se registraron ese día (visible aunque no haya peso).
 * - Etiquetas de kg sobre cada punto (o primero/último si hay muchos).
 */
export default function WeightChart({ weights, targetWeight, meals }: WeightChartProps) {
  const series = buildWeightSeries(weights);
  const mealByDay = new Map(
    buildMealTimeline(meals ?? []).map((d) => [d.date, d.count])
  );

  if (series.length < 2) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" minHeight={120}>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Registra al menos dos pesos para ver tu evolución 📈
          {mealByDay.size > 0
            ? ` · ya tienes ${mealByDay.size} día${mealByDay.size !== 1 ? "s" : ""} con comidas 🍽️`
            : ""}
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

  // Días del rango del gráfico (desde el primer hasta el último peso)
  const firstDay = dayjs(series[0].date).startOf("day");
  const lastDay = dayjs(series[series.length - 1].date).startOf("day");
  const nDays = lastDay.diff(firstDay, "day") + 1;
  const barW = Math.max(2, Math.min(9, ((W - 2 * PAD_X) / nDays) * 0.6));

  // Resumen de comidas dentro del rango (coincide con la cinta)
  let mealsInRange = 0;
  let mealDaysInRange = 0;
  for (let d = firstDay; !d.isAfter(lastDay, "day"); d = d.add(1, "day")) {
    const count = mealByDay.get(d.format("YYYY-MM-DD")) ?? 0;
    if (count > 0) {
      mealsInRange += count;
      mealDaysInRange++;
    }
  }

  // Etiquetas de kg: todas si hay pocos puntos; si no, primero y último
  const showKgLabel = (i: number) =>
    series.length <= 8 || i === 0 || i === series.length - 1;

  return (
    <Box>
      {mealDaysInRange > 0 && (
        <Box display="flex" flexWrap="wrap" gap={0.5} mb={1}>
          <Chip
            size="small"
            variant="outlined"
            label={`🍽️ ${mealDaysInRange} día${mealDaysInRange !== 1 ? "s" : ""} con comidas · ${mealsInRange} ${mealsInRange !== 1 ? "comidas" : "comida"}`}
            sx={{ color: "#b45309", borderColor: MEAL_COLOR, fontWeight: 700 }}
          />
        </Box>
      )}

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Evolución de peso con horas de comida">
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

        {/* Cinta "comidas por día" en la base */}
        <rect
          x={PAD_X}
          y={STRIP_TOP}
          width={W - 2 * PAD_X}
          height={STRIP_H}
          rx={3}
          fill="#0d9488"
          opacity={0.04}
        />
        <line x1={PAD_X} x2={W - PAD_X} y1={STRIP_TOP} y2={STRIP_TOP} stroke="#e2e8f0" strokeWidth={1} />
        {(() => {
          const bars: React.ReactNode[] = [];
          for (let d = firstDay; !d.isAfter(lastDay, "day"); d = d.add(1, "day")) {
            const count = mealByDay.get(d.format("YYYY-MM-DD")) ?? 0;
            if (count <= 0) continue;
            const cx = xMs(d.add(12, "hour").valueOf());
            const h = Math.max(3, STRIP_H * (Math.min(count, 4) / 4));
            bars.push(
              <rect
                key={d.format("YYYY-MM-DD")}
                x={cx - barW / 2}
                y={STRIP_BOTTOM - h}
                width={barW}
                height={h}
                rx={1}
                fill={MEAL_COLOR}
                opacity={count >= 3 ? 0.9 : count === 2 ? 0.6 : 0.4}
              />
            );
          }
          return bars;
        })()}

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
        <Box display="flex" alignItems="center" gap={0.5}>
          <Box sx={{ width: 10, height: 10, borderRadius: 999, bgcolor: MEAL_COLOR }} />
          <Typography variant="caption" color="text.secondary">
            🍽️ comidas por día
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