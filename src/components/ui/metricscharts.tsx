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
import {
  buildGeneralSeries,
  HydrationDayStats,
  NutritionStats,
} from "@/lib/engine/metrics";
import { LiquidEntry, MealEntry, WeightEntry } from "@/model/keto.models";

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

function LegendDot({ color, text }: { color: string; text: string }) {
  return (
    <Box display="flex" alignItems="center" gap={0.5}>
      <Box sx={{ width: 10, height: 10, borderRadius: 999, bgcolor: color }} />
      <Typography variant="caption" color="text.secondary">
        {text}
      </Typography>
    </Box>
  );
}

// ─── Alimentación: ayunos y cetosis (gráfica de línea) ─────────

const NW = 320;
const NH = 170;
const NPAD_X = 26;
const NPAD_Y = 18;
const CETOSIS_H = 12;
const AUTOFAGIA_H = 16;

/**
 * Gráfico de alimentación (línea tipo "peso"):
 * - Eje Y: horas de ayuno máximo por día (con etiquetas y bandas).
 * - Bandas y líneas de umbral que resaltan la zona de cetosis (12–16 h)
 *   y la zona de autofagia (≥16 h).
 * - Puntos con la hora de ayuno y marcador rojo 🔴 en días con no KETO.
 */
export function NutritionChart({ stats }: { stats: NutritionStats }) {
  if (stats.days.length === 0) {
    return (
      <EmptyText>Registra tus comidas para ver tus ayunos y ventanas de cetosis 🍽️</EmptyText>
    );
  }

  const days = stats.days;
  const n = days.length;
  const last = days[n - 1];
  const maxAyuno = Math.max(...days.map((d) => d.ayunoMaxH ?? 0));
  const yMax = Math.max(20, Math.ceil(maxAyuno + 1));

  // Etiquetas del eje Y (0, 12, 16, yMax) en valores enteros de horas
  const yTicks = Array.from(new Set([Math.max(0, yMax - 1), yMax]));
  const tickValues = Array.from(new Set([0, 12, AUTOFAGIA_H, Math.max(12, Math.floor(maxAyuno))].concat(yTicks).filter((t) => t <= yMax))).sort((a, b) => a - b);

  const x = (i: number) => NPAD_X + (n === 1 ? 0.5 : i / (n - 1)) * (NW - NPAD_X - 8);
  const y = (h: number) => NPAD_Y + (1 - h / yMax) * (NH - 2 * NPAD_Y);

  const linePoints = days.map((d, i) => `${x(i)},${y(d.ayunoMaxH ?? 0)}`).join(" ");
  const areaPath =
    n > 1
      ? `M ${x(0)},${NH - NPAD_Y} L ${linePoints.split(" ").join(" L ")} L ${x(n - 1)},${NH - NPAD_Y} Z`
      : "";

  const yCet = y(CETOSIS_H);
  const yAut = y(AUTOFAGIA_H);

  const zoneColor = (h: number): string =>
    h >= AUTOFAGIA_H ? "#6366f1" : h >= CETOSIS_H ? "#059669" : "#94a3b8";

  return (
    <Box>
      {/* Contexto breve para que se entienda qué muestra */}
      <Typography variant="caption" color="text.secondary" display="block" mb={1}>
        La línea sube con tus ayunos más largos: a partir de <b>12&nbsp;h</b> entras en
        cetosis 🔥 y desde <b>16&nbsp;h</b> en autofagia 🌀.
      </Typography>

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
          <Chip size="small" color="error" variant="outlined" label={`🔴 ${stats.eventosNoKeto} salida de cetosis`} />
        )}
      </Box>

      <svg viewBox={`0 0 ${NW} ${NH}`} width="100%" role="img" aria-label="Ayunos y cetosis por día">
        {/* Eje Y: etiquetas de horas con gridlines */}
        {tickValues.map((t) => (
          <g key={t}>
            <line x1={NPAD_X} x2={NW - 8} y1={y(t)} y2={y(t)} stroke="#e2e8f0" strokeWidth={1} />
            <text x={NPAD_X - 4} y={y(t) + 3} textAnchor="end" fontSize={8.5} fill="#94a3b8">
              {t}h
            </text>
          </g>
        ))}

        {/* Bandas de zonas: autofagia (≥16 h) y cetosis (12–16 h) */}
        <rect x={NPAD_X} y={yAut} width={NW - NPAD_X - 8} height={y(0) - yAut} fill="#6366f1" opacity={0.09} />
        <rect x={NPAD_X} y={yCet} width={NW - NPAD_X - 8} height={yAut - yCet} fill="#059669" opacity={0.09} />
        {/* Umbral autofagia */}
        <line x1={NPAD_X} x2={NW - 8} y1={yAut} y2={yAut} stroke="#6366f1" strokeWidth={1} strokeDasharray="4 4" />
        <text x={NW - 10} y={yAut - 4} textAnchor="end" fontSize={9} fontWeight={700} fill="#4f46e5">
          autofagia 16 h
        </text>
        {/* Umbral cetosis */}
        <line x1={NPAD_X} x2={NW - 8} y1={yCet} y2={yCet} stroke="#059669" strokeWidth={1} strokeDasharray="4 4" />
        <text x={NW - 10} y={yCet + 11} textAnchor="end" fontSize={9} fontWeight={700} fill="#047857">
          cetosis 12 h
        </text>
        {/* Área bajo la curva */}
        {areaPath && <path d={areaPath} fill="#0d9488" opacity={0.08} />}
        {/* Línea de ayuno máximo */}
        {n > 1 && (
          <polyline
            points={linePoints}
            fill="none"
            stroke="#0d9488"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {/* Puntos por día: color según zona; 🔴 si hubo salida de cetosis; con hora */}
        {days.map((d, i) => {
          const h = d.ayunoMaxH ?? 0;
          const label = d.noKeto ? "🔴" : "";
          return (
            <g key={d.date}>
              {d.noKeto && (
                <>
                  <circle cx={x(i)} cy={y(h)} r={10} fill="#ef4444" opacity={0.15} />
                  <circle cx={x(i)} cy={y(h)} r={7} fill="none" stroke="#ef4444" strokeWidth={2} />
                </>
              )}
              <circle cx={x(i)} cy={y(h)} r={3.2} fill={zoneColor(h)} stroke="#fff" strokeWidth={1} />
              {/* Etiqueta de horas sobre el punto (oculta si está muy pegado al borde) */}
              {y(h) > NPAD_Y + 8 && (
                <text
                  x={x(i)}
                  y={y(h) - 5}
                  textAnchor="middle"
                  fontSize={7.5}
                  fontWeight={700}
                  fill="#64748b"
                >
                  {label}{h}h
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <Box display="flex" justifyContent="space-between" mt={0.5}>
        <Typography variant="caption" color="text.secondary">
          {fmtDate(days[0].date)} · inicio
        </Typography>
        <Typography variant="caption" fontWeight={700} sx={{ color: "#0d9488" }}>
          {fmtDate(last.date)} · ayuno máximo {fmtH(last.ayunoMaxH ?? 0)}
        </Typography>
      </Box>

      {/* Leyenda de la gráfica */}
      <Box display="flex" gap={1.5} justifyContent="center" mt={1} flexWrap="wrap">
        <LegendDot color="#6366f1" text="🌀 autofagia ≥16 h" />
        <LegendDot color="#059669" text="🔥 cetosis 12–16 h" />
        <LegendDot color="#ef4444" text="🔴 salida de cetosis" />
      </Box>

      {stats.ayunoMasLargo && stats.ayunoMasLargo.horas >= 12 && (
        <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mt={1}>
          Tu ayuno más largo: <b>{fmtH(stats.ayunoMasLargo.horas)}</b> el {fmtDate(stats.ayunoMasLargo.date)}{" "}
          {stats.ayunoMasLargo.horas >= 16
            ? "(ventana ideal de autofagia)"
            : "(buena ventana de cetosis)"}
        </Typography>
      )}
    </Box>
  );
}

// ─── Hidratación (gráfica de línea) ───────────────────────────

const HW = 320;
const HH = 150;
const HPAD_X = 8;
const HPAD_Y = 16;

function barColor(pct: number): string {
  if (pct >= 80) return "#0d9488";
  if (pct >= 50) return "#f59e0b";
  return "#ef4444";
}

/**
 * Gráfico de hidratación (línea tipo "peso"):
 * - Eje X: días registrados · Eje Y: mililitros consumidos.
 * - Línea punteada de la meta diaria (por peso y talla).
 * - Puntos con color según el % de cumplimiento de ese día.
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

  const n = days.length;
  const last = days[n - 1];
  const values = days.map((d) => d.ml);
  const target = objetivoMl ?? 0;
  const rawMax = Math.max(...values, target);
  const yMax = Math.max(500, Math.ceil(rawMax / 500) * 500);

  const x = (i: number) => HPAD_X + (n === 1 ? 0.5 : i / (n - 1)) * (HW - 2 * HPAD_X);
  const y = (ml: number) => HPAD_Y + (1 - ml / yMax) * (HH - 2 * HPAD_Y);

  const linePoints = days.map((d, i) => `${x(i)},${y(d.ml)}`).join(" ");
  const areaPath =
    n > 1
      ? `M ${x(0)},${HH - HPAD_Y} L ${linePoints.split(" ").join(" L ")} L ${x(n - 1)},${HH - HPAD_Y} Z`
      : "";

  const strokeColor = cumplimiento7d != null ? barColor(cumplimiento7d) : "#0d9488";

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

      <svg viewBox={`0 0 ${HW} ${HH}`} width="100%" role="img" aria-label="Agua diaria en mililitros">
        {/* Gridline media */}
        <line x1={HPAD_X} x2={HW - HPAD_X} y1={y(yMax / 2)} y2={y(yMax / 2)} stroke="#e2e8f0" strokeWidth={1} />
        {/* Línea de meta */}
        {objetivoMl != null && (
          <>
            <line
              x1={HPAD_X}
              x2={HW - HPAD_X}
              y1={y(objetivoMl)}
              y2={y(objetivoMl)}
              stroke="#94a3b8"
              strokeWidth={1}
              strokeDasharray="4 4"
            />
            <text x={HW - HPAD_X - 2} y={y(objetivoMl) - 4} textAnchor="end" fontSize={9} fill="#64748b" fontWeight={700}>
              meta {(objetivoMl / 1000).toFixed(1)} L
            </text>
          </>
        )}
        {/* Área bajo la curva */}
        {areaPath && <path d={areaPath} fill={strokeColor} opacity={0.08} />}
        {/* Línea de consumo */}
        {n > 1 && (
          <polyline
            points={linePoints}
            fill="none"
            stroke={strokeColor}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {/* Puntos por día: color según % de la meta */}
        {days.map((d, i) => (
          <g key={d.date}>
            {i === n - 1 && (
              <circle cx={x(i)} cy={y(d.ml)} r={7} fill={strokeColor} opacity={0.2} />
            )}
            <circle cx={x(i)} cy={y(d.ml)} r={3.2} fill={barColor(d.pct)} stroke="#fff" strokeWidth={1} />
          </g>
        ))}
      </svg>

      <Box display="flex" justifyContent="space-between" mt={0.5}>
        <Typography variant="caption" color="text.secondary">
          {fmtDate(days[0].date)} · inicio
        </Typography>
        <Typography variant="caption" fontWeight={700} sx={{ color: strokeColor }}>
          {last.ml} ml · {last.pct}% de la meta
        </Typography>
      </Box>

      <Box display="flex" gap={1.5} justifyContent="center" mt={1} flexWrap="wrap">
        {objetivoMl && <LegendDot color="#94a3b8" text={`meta ${(objetivoMl / 1000).toFixed(1)} L`} />}
        <LegendDot color={barColor(90)} text="≥80% de la meta" />
        <LegendDot color={barColor(65)} text="50–80%" />
        <LegendDot color={barColor(30)} text="<50%" />
      </Box>
    </Box>
  );
}

// ─── Vista General combinada ──────────────────────────────────

const GW = 320;
const GH = 190;
const GPAD_L = 30;
const GPAD_R = 30;
const GPAD_T = 16;
const GPAD_B = 14;
const C_WEIGHT = "#059669";
const C_CETO = "#f59e0b";
const C_WATER = "#0ea5e9";
const C_NOKETO = "#ef4444";
const C_MEAL = "#8b5cf6";

interface GeneralChartProps {
  weights: WeightEntry[];
  meals: MealEntry[];
  liquids: LiquidEntry[];
  targetWeight?: number;
  objetivoMl?: number;
}

/**
 * Gráfico "General": superpone en un mismo eje de días las métricas del usuario.
 * - Línea principal y gruesa: peso (⚖️, verde).
 * - Línea ámbar en zigzag: horas de ayuno máximo → cetosis/autofagia.
 * - Puntos morados: nº de comidas; rojos: alimento no KETO (salida de cetosis).
 * - Línea celeste: cumplimiento de hidratación (% de la meta diaria).
 * Ejes: izquierda = kg (y horas de ayuno), derecha = % de agua.
 */
export function GeneralMetricsChart({
  weights,
  meals,
  liquids,
  targetWeight,
  objetivoMl,
}: GeneralChartProps) {
  const { days, startLabel, endLabel } = buildGeneralSeries(
    weights,
    meals,
    liquids,
    objetivoMl
  );

  const hasWeight = days.some((d) => d.pesoKg != null);
  const hasMeals = days.some((d) => (d.nComidas ?? 0) > 0 || d.ayunoMaxH != null);
  const hasWater = days.some((d) => d.ml != null);

  if (days.length === 0) {
    return (
      <EmptyText>
        Registra peso, comidas o agua para ver tu resumen general 🎯
      </EmptyText>
    );
  }

  const n = days.length;
  const x = (i: number) =>
    GPAD_L + (n === 1 ? 0.5 : i / (n - 1)) * (GW - GPAD_L - GPAD_R);

  const kgValues = days.map((d) => d.pesoKg).filter((v): v is number => v != null);
  let minKg = kgValues.length ? Math.min(...kgValues) : 0;
  let maxKg = kgValues.length ? Math.max(...kgValues) : 1;
  if (targetWeight != null) {
    minKg = Math.min(minKg, targetWeight);
    maxKg = Math.max(maxKg, targetWeight);
  }
  let kgRange = maxKg - minKg || 1;
  minKg -= kgRange * 0.1;
  maxKg += kgRange * 0.1;
  kgRange = maxKg - minKg;
  const yKg = (kg: number) => GPAD_T + (1 - (kg - minKg) / kgRange) * (GH - GPAD_T - GPAD_B);

  // Ayuno: escala propia (0..max 20+) dentro de la misma área
  const ayunoValues = days.map((d) => d.ayunoMaxH ?? 0);
  const ayunoMax = Math.max(12, Math.max(...ayunoValues));
  const yAyuno = (h: number) => GPAD_T + (1 - h / ayunoMax) * (GH - GPAD_T - GPAD_B);
  const yAut = yAyuno(16);
  const yCet = yAyuno(12);

  // Hidratación: escala de % a la derecha
  const waterMax = Math.max(100, ...days.map((d) => d.pctHidro ?? 0));
  const yWater = (pct: number) =>
    GPAD_T + (1 - pct / waterMax) * (GH - GPAD_T - GPAD_B);

  // Máximo de comidas para escalar los puntos morados
  const maxComidas = Math.max(1, ...days.map((d) => d.nComidas ?? 0));

  return (
    <Box>
      <Box display="flex" flexWrap="wrap" gap={0.5} mb={1}>
        {hasWeight && (
          <Chip size="small" variant="outlined" label={`⚖️ ${days[0].pesoKg ?? "—"}→${days[n - 1].pesoKg ?? "—"} kg`} />
        )}
        {hasMeals && (
          <Chip size="small" color="success" variant="outlined" label="🔥 cetosis / 🌀 autofagia" />
        )}
        {hasWater && (
          <Chip size="small" variant="outlined" label="💧 agua" />
        )}
      </Box>

      <svg viewBox={`0 0 ${GW} ${GH}`} width="100%" role="img" aria-label="Resumen general de métricas">
        {/* Bandas de cetosis/autofagia */}
        <rect x={GPAD_L} y={yAut} width={GW - GPAD_L - GPAD_R} height={yAyuno(0) - yAut} fill="#6366f1" opacity={0.06} />
        <rect x={GPAD_L} y={yCet} width={GW - GPAD_L - GPAD_R} height={yAut - yCet} fill="#059669" opacity={0.06} />

        {/* Línea de agua */} 
        {hasWater && n > 1 && (
          <polyline
            points={days.map((d, i) => `${x(i)},${yWater(d.pctHidro ?? 0)}`).join(" ")}
            fill="none"
            stroke={C_WATER}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.7}
          />
        )}
        {hasWater &&
          days.map((d, i) => (
            <circle key={`w${i}`} cx={x(i)} cy={yWater(d.pctHidro ?? 0)} r={2} fill={C_WATER} />
          ))}

        {/* Línea de ayuno (cetosis) */}
        {hasMeals && n > 1 && (
          <polyline
            points={days.map((d, i) => `${x(i)},${yAyuno(d.ayunoMaxH ?? 0)}`).join(" ")}
            fill="none"
            stroke={C_CETO}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Puntos de comidas (morados) y no-keto (rojos) */}
        {hasMeals &&
          days.map((d, i) => {
            const hasMealDay = (d.nComidas ?? 0) > 0 || d.ayunoMaxH != null;
            if (!hasMealDay) return null;
            const cy = yAyuno(d.ayunoMaxH ?? 0) - (d.noKeto ? 5 : 0);
            return (
              <g key={`m${i}`}>
                {d.noKeto && (
                  <circle cx={x(i)} cy={cy} r={4} fill={C_NOKETO} stroke="#fff" strokeWidth={1} />
                )}
                {(d.nComidas ?? 0) > 0 && (
                  <circle
                    cx={x(i)}
                    cy={cy}
                    r={2 + (d.nComidas ?? 0) / maxComidas * 2}
                    fill={C_MEAL}
                    opacity={0.75}
                  />
                )}
              </g>
            );
          })}

        {/* Línea principal de peso */}
        {hasWeight && n > 1 && (
          <polyline
            points={days.map((d, i) => `${x(i)},${yKg(d.pesoKg ?? 0)}`).join(" ")}
            fill="none"
            stroke={C_WEIGHT}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {hasWeight &&
          days.map((d, i) =>
            d.pesoKg != null ? (
              <g key={`kg${i}`}>
                <circle cx={x(i)} cy={yKg(d.pesoKg)} r={3} fill={C_WEIGHT} stroke="#fff" strokeWidth={1} />
                {i === n - 1 && (
                  <>
                    <circle cx={x(i)} cy={yKg(d.pesoKg)} r={7} fill={C_WEIGHT} opacity={0.2} />
                    <text x={x(i)} y={yKg(d.pesoKg) - 6} textAnchor="middle" fontSize={8} fontWeight={700} fill="#5b7c66">
                      {d.pesoKg}kg
                    </text>
                  </>
                )}
              </g>
            ) : null
          )}

        {/* Umbral cetosis */}
        {hasMeals && (
          <>
            <line x1={GPAD_L} x2={GW - GPAD_R} y1={yCet} y2={yCet} stroke="#059669" strokeWidth={1} strokeDasharray="3 3" opacity={0.5} />
            <line x1={GPAD_L} x2={GW - GPAD_R} y1={yAut} y2={yAut} stroke="#6366f1" strokeWidth={1} strokeDasharray="3 3" opacity={0.5} />
          </>
        )}
      </svg>

      <Box display="flex" justifyContent="space-between" mt={0.5}>
        <Typography variant="caption" color="text.secondary">{startLabel}</Typography>
        <Typography variant="caption" color="text.secondary">{endLabel}</Typography>
      </Box>

      {/* Leyenda */}
      <Box display="flex" gap={1.5} justifyContent="center" mt={1} flexWrap="wrap">
        {hasWeight && <LegendDot color={C_WEIGHT} text="⚖️ peso" />}
        {hasMeals && (
          <>
            <LegendDot color={C_CETO} text="🔥 ayuno/cetosis" />
            <LegendDot color={C_MEAL} text="🍽️ comidas" />
            <LegendDot color={C_NOKETO} text="🔴 no KETO" />
          </>
        )}
        {hasWater && <LegendDot color={C_WATER} text="💧 hidratación" />}
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