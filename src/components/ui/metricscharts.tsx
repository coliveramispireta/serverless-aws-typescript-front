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
import { buildWeightSeries, computeNutritionStats, HydrationDayStats, NutritionStats } from "@/lib/engine/metrics";
import { MealEntry, WeightEntry } from "@/model/keto.models";
import dayjs from "dayjs";

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

// ─── Metabolismo: barras diarias de ayuno (glucolisis / cetosis / autofagia) ─

const MW = 320;
const MH = 175;
const MPAD_L = 34;
const MPAD_R = 8;
const MPAD_T = 14;
const MPAD_B = 16;

/** Umbrales de zonas metabólicas (horas de ayuno) */
const MET_GLUCOLISIS_H = 12;
const MET_CETOSIS_H = 12;
const MET_AUTOFAGIA_H = 16;

const C_GLUCOLISIS = "#94a3b8";
const C_CETOSIS = "#059669";
const C_AUTOFAGIA = "#6366f1";

/** Determina la zona metabólica según las horas de ayuno máximo. */
export function metabolismZone(ayunoMaxH?: number): "autofagia" | "cetosis" | "glucolisis" {
  const h = ayunoMaxH ?? 0;
  if (h >= MET_AUTOFAGIA_H) return "autofagia";
  if (h >= MET_CETOSIS_H) return "cetosis";
  return "glucolisis";
}

function zoneColor(zone: "autofagia" | "cetosis" | "glucolisis"): string {
  return zone === "autofagia" ? C_AUTOFAGIA : zone === "cetosis" ? C_CETOSIS : C_GLUCOLISIS;
}

const zoneLabel: Record<"autofagia" | "cetosis" | "glucolisis", string> = {
  autofagia: "🌀 Autofagia ≥16 h",
  cetosis: "🔥 Cetosis 12–16 h",
  glucolisis: "⚪ Glucolisis <12 h",
};

/**
 * Metabolismo = barras diarias de ayuno.
 * - Una barra por día: la altura = ayuno máximo de ese día (horas).
 * - De abajo a arriba, el eje Y tiene 3 zonas: glucolisis (fuera de keto, <12 h),
 *   cetosis (12–16 h) y autofagia (≥16 h).
 * - La barra se pinta del color de la zona más alta alcanzada. Si ese día hubo
 *   comida no KETO, el nivel efectivo baja un escalón (p.ej. autofagia→cetosis)
 *   y se marca 🔴, porque el tipo de comida rompe la cetosis aunque el ayuno sea largo.
 */
export function MetabolismChart({ stats }: { stats: NutritionStats }) {
  if (stats.days.length === 0) {
    return (
      <EmptyText>
        Registra tus comidas para ver tu metabolismo diario (glucolisis, cetosis, autofagia) 🍽️
      </EmptyText>
    );
  }

  const days = stats.days;
  const n = days.length;
  const last = days[n - 1];
  const maxAyuno = Math.max(...days.map((d) => d.ayunoMaxH ?? 0));

  // Eje Y con un tope un poco por encima del máximo para que la barra respire,
  // pero nunca por debajo del inicio de autofagia (16 h) para que se distinga.
  const yMax = Math.max(16, Math.ceil(maxAyuno) + 1);

  const plotW = MW - MPAD_L - MPAD_R;
  const plotH = MH - MPAD_T - MPAD_B;
  const slot = plotW / Math.max(n, 1);
  const barW = Math.min(18, slot * 0.6);

  const xCenter = (i: number) => MPAD_L + slot * i + slot / 2;
  const y = (h: number) => MPAD_T + (1 - h / yMax) * plotH;

  const yGlu = y(MET_GLUCOLISIS_H);
  const yAut = y(MET_AUTOFAGIA_H);

  /** Nivel efectivo del día: bajar un escalón si hubo comida no keto. */
  const effectiveZoneOf = (d: NutritionStats["days"][number]): "autofagia" | "cetosis" | "glucolisis" => {
    const base = metabolismZone(d.ayunoMaxH);
    if (!d.noKeto) return base;
    // Comida no keto: si estaba en autofagia baja a cetosis; si en cetosis baja a glucolisis.
    if (base === "autofagia") return "cetosis";
    if (base === "cetosis") return "glucolisis";
    return "glucolisis";
  };

  // Altura de la barra: la posición vertical superior corresponde a la zona
  // efectiva (para que visualmente "llegue" hasta el nivel que corresponde).
  const effectiveHeight = (d: NutritionStats["days"][number]): number => {
    const zone = effectiveZoneOf(d);
    if (zone === "autofagia") return y(MET_AUTOFAGIA_H);
    if (zone === "cetosis") return y(MET_CETOSIS_H);
    // glucolisis: dibujar baja (basada en ayuno real, acotada debajo de 12 h)
    return Math.max(y(MET_GLUCOLISIS_H), y(Math.min(d.ayunoMaxH ?? 0, MET_GLUCOLISIS_H)));
  };

  return (
    <Box>
      {/* Contexto breve */}
      <Typography variant="caption" color="text.secondary" display="block" mb={1}>
        Una barra por día: muestra hasta dónde llegó tu ayuno. <b>🌀 Autofagia</b> (arriba),{" "}
        <b>🔥 cetosis</b> (medio) y <b>⚪ glucolisis</b> (abajo, fuera de keto). Una 🔴 marca que
        comiste algo no KETO (baja un escalón).
      </Typography>

      {/* Resumen */}
      <Box display="flex" flexWrap="wrap" gap={0.5} mb={1}>
        <Chip size="small" color="info" variant="outlined" label={`🌀 Autofagia ${stats.diasAutofagia} d`} />
        <Chip size="small" color="success" variant="outlined" label={`🔥 Cetosis ${stats.diasCetosis} d`} />
        {stats.eventosNoKeto > 0 && (
          <Chip size="small" color="error" variant="outlined" label={`🔴 ${stats.eventosNoKeto} salida de cetosis`} />
        )}
      </Box>

      <svg viewBox={`0 0 ${MW} ${MH}`} width="100%" role="img" aria-label="Metabolismo diario (glucolisis, cetosis, autofagia)">
        {/* Bandas de zonas */}
        <rect x={MPAD_L} y={y(MET_AUTOFAGIA_H)} width={plotW} height={y(0) - y(MET_AUTOFAGIA_H)} fill={C_AUTOFAGIA} opacity={0.08} />
        <rect x={MPAD_L} y={y(MET_CETOSIS_H)} width={plotW} height={y(MET_AUTOFAGIA_H) - y(MET_CETOSIS_H)} fill={C_CETOSIS} opacity={0.08} />
        <rect x={MPAD_L} y={y(MET_GLUCOLISIS_H)} width={plotW} height={y(MET_CETOSIS_H) - y(MET_GLUCOLISIS_H)} fill={C_GLUCOLISIS} opacity={0.08} />

        {/* Umbrales horizontales */}
        <line x1={MPAD_L} x2={MW - MPAD_R} y1={yAut} y2={yAut} stroke={C_AUTOFAGIA} strokeWidth={1} strokeDasharray="3 3" />
        <line x1={MPAD_L} x2={MW - MPAD_R} y1={yGlu} y2={yGlu} stroke={C_GLUCOLISIS} strokeWidth={1} strokeDasharray="3 3" />

        {/* Barra base de cada día (zona efectiva coloreada) */}
        {days.map((d, i) => {
          const zone = effectiveZoneOf(d);
          const topY = effectiveHeight(d);
          const color = zoneColor(zone);
          return (
            <g key={d.date}>
              <rect
                x={xCenter(i) - barW / 2}
                y={topY}
                width={barW}
                height={Math.max(2, y(0) - topY)}
                rx={3}
                fill={color}
                opacity={0.85}
              />
              {/* Hora de ayuno sobre la barra */}
              <text
                x={xCenter(i)}
                y={topY - 4}
                textAnchor="middle"
                fontSize={7.5}
                fontWeight={700}
                fill="#64748b"
              >
                {d.ayunoMaxH != null ? fmtH(d.ayunoMaxH) : "—"}
              </text>
              {/* Marcador de comida no keto */}
              {d.noKeto && (
                <text x={xCenter(i)} y={MPAD_T + 4} textAnchor="middle" fontSize={9}>
                  🔴
                </text>
              )}
            </g>
          );
        })}

        {/* Etiquetas de zonas en el eje */}
        <text x={MW - MPAD_R} y={yAut + 9} textAnchor="end" fontSize={8} fontWeight={800} fill="#4f46e5">
          autofagia 16h
        </text>
        <text x={MW - MPAD_R} y={yGlu + 9} textAnchor="end" fontSize={8} fontWeight={800} fill="#047857">
          cetosis 12h
        </text>
        <text x={MW - MPAD_R} y={y(0) - 7} textAnchor="end" fontSize={8} fontWeight={800} fill="#64748b">
          glucolisis 0h
        </text>
      </svg>

      <Box display="flex" justifyContent="space-between" mt={0.5}>
        <Typography variant="caption" color="text.secondary">
          {fmtDate(days[0].date)} · inicio
        </Typography>
        <Typography variant="caption" fontWeight={700} sx={{ color: zoneColor(effectiveZoneOf(last)) }}>
          {fmtDate(last.date)} · {zoneLabel[effectiveZoneOf(last)].replace(/^(🌀|🔥|⚪) /, "")}
          {last.ayunoMaxH != null ? ` (${fmtH(last.ayunoMaxH)})` : ""}
        </Typography>
      </Box>

      {/* Leyenda */}
      <Box display="flex" gap={1.5} justifyContent="center" mt={1} flexWrap="wrap">
        <LegendDot color={C_AUTOFAGIA} text="🌀 autofagia ≥16 h" />
        <LegendDot color={C_CETOSIS} text="🔥 cetosis 12–16 h" />
        <LegendDot color={C_GLUCOLISIS} text="⚪ glucolisis <12 h" />
        <LegendDot color="#ef4444" text="🔴 no KETO" />
      </Box>
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
const GH = 165;
const GPAD_L = 10;
const GPAD_R = 10;
const GPAD_T = 18;
const GPAD_B = 16;
const C_WEIGHT = "#059669";

interface GeneralChartProps {
  weights: WeightEntry[];
  meals: MealEntry[];
  targetWeight?: number;
  stats?: NutritionStats;
}

/**
 * Gráfico "General" rediseñado: dos paneles apilados y legibles.
 * - Panel superior: línea de peso, idéntica a la pestaña Peso (WeightChart),
 *   con su escala de kg limpia y la línea punteada de objetivo.
 * - Panel inferior: barras de metabolismo diario (MetabolismChart), con las
 *   zonas glucolisis / cetosis / autofagia según el ayuno y la comida no keto.
 * Ya no se superponen escalas incompatibles en un mismo plot.
 */
export function GeneralMetricsChart({
  weights,
  meals,
  targetWeight,
  stats,
}: GeneralChartProps) {
  const series = buildWeightSeries(weights);
  const nutrition = stats ?? computeNutritionStats(meals);

  const hasWeight = series.length > 0;

  if (!hasWeight && nutrition.days.length === 0) {
    return (
      <EmptyText>Registra peso y comidas para ver tu resumen general 🎯</EmptyText>
    );
  }

  const values = series.map((p) => p.kg);
  let minV = values.length ? Math.min(...values) : 0;
  let maxV = values.length ? Math.max(...values) : 1;
  if (targetWeight != null) {
    minV = Math.min(minV, targetWeight);
    maxV = Math.max(maxV, targetWeight);
  }
  let range = maxV - minV || 1;
  const padV = range * 0.08;
  minV -= padV;
  maxV += padV;
  range = maxV - minV;

  const startMs = series.length ? dayjs(series[0].date).valueOf() : 0;
  const endMs = series.length ? dayjs(series[series.length - 1].date).valueOf() : 1;
  const spanMs = Math.max(1, endMs - startMs);
  const xMs = (t: number) => GPAD_L + ((t - startMs) / spanMs) * (GW - GPAD_L - GPAD_R);
  const x = (i: number) => xMs(dayjs(series[i].date).valueOf());
  const y = (kg: number) => GPAD_T + (1 - (kg - minV) / range) * (GH - GPAD_T - GPAD_B);

  const linePoints = series.map((p, i) => `${x(i)},${y(p.kg)}`).join(" ");
  const areaPath = hasWeight
    ? `M ${x(0)},${GH - GPAD_B} L ${linePoints.split(" ").join(" L ")} L ${x(series.length - 1)},${GH - GPAD_B} Z`
    : "";
  const wentDown = series.length >= 2 && series[series.length - 1].kg <= series[0].kg;
  const strokeColor = wentDown ? "#059669" : "#f59e0b";
  const showKgLabel = (i: number) =>
    series.length <= 8 || i === 0 || i === series.length - 1;

  return (
    <Box>
      {/* ── Panel 1: Peso ── */}
      <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={0.5}>
        ⚖️ Peso {series.length ? `${series[0].kg} → ${series[series.length - 1].kg} kg` : ""}
      </Typography>
      {hasWeight ? (
        <svg viewBox={`0 0 ${GW} ${GH}`} width="100%" role="img" aria-label="Evolución de peso">
          {targetWeight != null && (
            <>
              <line
                x1={GPAD_L}
                x2={GW - GPAD_R}
                y1={y(targetWeight)}
                y2={y(targetWeight)}
                stroke="#94a3b8"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <text x={GW - GPAD_R - 2} y={y(targetWeight) - 4} textAnchor="end" fontSize={9} fill="#64748b">
                objetivo {targetWeight} kg
              </text>
            </>
          )}
          {areaPath && <path d={areaPath} fill={strokeColor} opacity={0.08} />}
          {series.length > 1 && (
            <polyline
              points={linePoints}
              fill="none"
              stroke={strokeColor}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
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
              {i === series.length - 1 && series.length > 1 ? (
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
      ) : (
        <EmptyText>Registra tu peso para ver la evolución 📈</EmptyText>
      )}

      {/* ── Panel 2: Metabolismo ── */}
      <Box mt={2}>
        <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={0.5}>
          🔬 Metabolismo diario (a dónde llegó tu ayuno)
        </Typography>
        <MetabolismChart stats={nutrition} />
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