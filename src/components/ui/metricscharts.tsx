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
import { buildGeneralSeries, HydrationDayStats, NutritionStats } from "@/lib/engine/metrics";
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

function fmtToday(): string {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}`;
}

/** Clave YYYY-MM-DD de hace 29 días (para el rango "ver solo mes actual"). */
function cutoffKey29d(): string {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 29);
  cutoff.setHours(0, 0, 0, 0);
  return `${cutoff.getFullYear()}-${String(cutoff.getMonth() + 1).padStart(2, "0")}-${String(cutoff.getDate()).padStart(2, "0")}`;
}

/** Etiquetas del eje X: K fechas equiespaciadas entre tStartMs y tEndMs (ms). La última = "hoy". */
function dateAxisLabels(tStartMs: number, tEndMs: number, count = 4): { ms: number; label: string }[] {
  const out: { ms: number; label: string }[] = [];
  const steps = Math.max(1, count - 1);
  const span = Math.max(1, tEndMs - tStartMs);
  for (let i = 0; i < count; i++) {
    const ms = tStartMs + (span * i) / steps;
    const d = new Date(ms);
    const label =
      i === count - 1
        ? "hoy"
        : `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
    out.push({ ms, label });
  }
  return out;
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
  glucolisis: "⚪ Fuera de cetosis",
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
  const [rango, setRango] = useState<"todo" | "mes">("todo");

  const allDays = stats.days;
  if (allDays.length === 0) {
    return (
      <EmptyText>
        Registra tus comidas para ver tu metabolismo diario (cetosis y autofagia) 🍽️
      </EmptyText>
    );
  }

  const days =
    rango === "mes"
      ? (() => {
          const cutKey = cutoffKey29d();
          const filtered = allDays.filter((d) => d.date >= cutKey);
          return filtered.length > 0 ? filtered : allDays;
        })()
      : allDays;
  const n = days.length;
  const last = days[n - 1];

  // Eje Y FIJO de 0 a 24 h (escala completa). Ticks cada 4 h → 0,4,8,12,16,20,24.
  const yMax = 24;
  const hourStep = 4;

  const plotW = MW - MPAD_L - MPAD_R;
  const plotH = MH - MPAD_T - MPAD_B;

  // Eje X por fecha real: 1er día del rango = izquierda, HOY = derecha.
  const DAY_MS = 1000 * 60 * 60 * 24;
  const tStart = new Date(days[0].date).getTime();
  const tEnd = Date.now();
  const spanMs = Math.max(DAY_MS, tEnd - tStart);
  const xByDate = (date: string) =>
    MPAD_L + ((new Date(date).getTime() - tStart) / spanMs) * plotW;
  const daySpanUnits = spanMs / DAY_MS;
  const slot = plotW / Math.max(1, daySpanUnits);
  const barW = Math.min(18, slot * 0.6);
  const xAxisTicks = dateAxisLabels(tStart, tEnd, 4).map((t) => ({
    x: MPAD_L + ((t.ms - tStart) / spanMs) * plotW,
    label: t.label,
  }));

  const y = (h: number) => MPAD_T + (1 - h / yMax) * plotH;

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
        Una barra por día: muestra hasta dónde llegó tu ayuno en dos zonas. <b>🔥 Cetosis</b> (≥12 h) y{" "}
        <b>🌀 autofagia</b> (≥16 h). Si comés algo <b>no KETO</b> (🔴), bajás al piso: eso sí activa la
        glucolisis y rompe la cetosis aunque el ayuno sea largo.
      </Typography>

      {/* Resumen */}
      <Box display="flex" flexWrap="wrap" gap={0.5} mb={1} alignItems="center">
        <Chip size="small" color="info" variant="outlined" label={`🌀 Autofagia ${stats.diasAutofagia} d`} />
        <Chip size="small" color="success" variant="outlined" label={`🔥 Cetosis ${stats.diasCetosis} d`} />
        {stats.eventosNoKeto > 0 && (
          <Chip size="small" color="error" variant="outlined" label={`🔴 ${stats.eventosNoKeto} salida de cetosis`} />
        )}
        <Chip
          size="small"
          clickable
          onClick={() => setRango(rango === "todo" ? "mes" : "todo")}
          color={rango === "mes" ? "primary" : "default"}
          variant={rango === "mes" ? "filled" : "outlined"}
          label={rango === "mes" ? "ver todo" : "ver solo mes actual"}
          sx={{ ml: "auto", height: 24, fontSize: 11 }}
        />
      </Box>

      <svg viewBox={`0 0 ${MW} ${MH}`} width="100%" role="img" aria-label="Metabolismo diario (cetosis y autofagia)">
        {/* Bandas: solo cetosis (12–16 h) y autofagia (≥16 h). Debajo de 12 h = fondo neutro (aún no en cetosis). */}
        <rect x={MPAD_L} y={y(MET_AUTOFAGIA_H)} width={plotW} height={y(0) - y(MET_AUTOFAGIA_H)} fill={C_AUTOFAGIA} opacity={0.08} />
        <rect x={MPAD_L} y={y(MET_CETOSIS_H)} width={plotW} height={y(MET_AUTOFAGIA_H) - y(MET_CETOSIS_H)} fill={C_CETOSIS} opacity={0.08} />

        {/* Umbrales horizontales de cetosis y autofagia */}
        <line x1={MPAD_L} x2={MW - MPAD_R} y1={yAut} y2={yAut} stroke={C_AUTOFAGIA} strokeWidth={1} strokeDasharray="3 3" />
        <line x1={MPAD_L} x2={MW - MPAD_R} y1={y(MET_CETOSIS_H)} y2={y(MET_CETOSIS_H)} stroke={C_CETOSIS} strokeWidth={1} strokeDasharray="3 3" />

        {/* Eje Y de horas: ticks numéricos de 0 a 24 h */}
        {Array.from({ length: Math.floor(yMax / hourStep) + 1 }, (_, k) => {
          const h = k * hourStep;
          return (
            <g key={`mh${h}`}>
              <line x1={MPAD_L} x2={MW - MPAD_R} y1={y(h)} y2={y(h)} stroke="#e2e8f0" strokeWidth={0.6} opacity={0.7} />
              <text x={MPAD_L - 3} y={y(h) + 2.5} textAnchor="end" fontSize={7.5} fill="#94a3b8">
                {h}
              </text>
            </g>
          );
        })}

        {/* Barra base de cada día (zona efectiva coloreada) */}
        {days.map((d) => {
          const zone = effectiveZoneOf(d);
          const topY = effectiveHeight(d);
          const color = zone === "autofagia" ? C_AUTOFAGIA : zone === "cetosis" ? C_CETOSIS : C_GLUCOLISIS;
          return (
            <g key={d.date}>
              <rect
                x={xByDate(d.date) - barW / 2}
                y={topY}
                width={barW}
                height={Math.max(2, y(0) - topY)}
                rx={3}
                fill={color}
                opacity={0.85}
              />
              {/* Marcador de comida no keto (glucolisis por comer fuera de keto) */}
              {d.noKeto && (
                <text x={xByDate(d.date)} y={MPAD_T + 4} textAnchor="middle" fontSize={9}>
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
        <text x={MW - MPAD_R} y={y(MET_CETOSIS_H) + 9} textAnchor="end" fontSize={8} fontWeight={800} fill="#047857">
          cetosis 12h
        </text>
        <text x={MW - MPAD_R} y={y(0) - 7} textAnchor="end" fontSize={7.5} fontWeight={700} fill="#94a3b8">
          fuera de cetosis
        </text>

        {/* Eje X: fechas inicio → hoy */}
        {xAxisTicks.map((t) => (
          <text key={`mx${t.x}`} x={t.x} y={MH - MPAD_B + 8} textAnchor="middle" fontSize={7.5} fill="#94a3b8">
            {t.label}
          </text>
        ))}
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
        <LegendDot color={C_GLUCOLISIS} text="⚪ fuera de cetosis" />
        <LegendDot color="#ef4444" text="🔴 comida no KETO (glucolisis)" />
      </Box>
    </Box>
  );
}

// ─── Hidratación (gráfica de línea) ───────────────────────────

const HW = 320;
const HH = 150;
const HPAD_X = 30; // margen izquierdo para el eje Y en ml
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
  days: allDays,
  objetivoMl,
  cumplimiento7d,
}: {
  days: HydrationDayStats[];
  objetivoMl?: number;
  cumplimiento7d?: number;
}) {
  const [rango, setRango] = useState<"todo" | "mes">("todo");

  if (allDays.length === 0) {
    return (
      <EmptyText>
        Registra tus líquidos (💧 en Alimentación) para ver tu cumplimiento de agua
      </EmptyText>
    );
  }

  const days =
    rango === "mes"
      ? (() => {
          const cutKey = cutoffKey29d();
          const filtered = allDays.filter((d) => d.date >= cutKey);
          return filtered.length > 0 ? filtered : allDays;
        })()
      : allDays;
  const n = days.length;
  const last = days[n - 1];
  const values = days.map((d) => d.ml);
  const target = objetivoMl ?? 0;
  const rawMax = Math.max(...values, target);
  const yMax = Math.max(500, Math.ceil(rawMax / 500) * 500);

  // Eje X por fecha real: inicio → hoy (mismo patrón que el General).
  const DAY_MS = 1000 * 60 * 60 * 24;
  const tStart = new Date(days[0].date).getTime();
  const tEnd = Date.now();
  const spanMs = Math.max(DAY_MS, tEnd - tStart);
  const xByDate = (date: string) =>
    HPAD_X + ((new Date(date).getTime() - tStart) / spanMs) * (HW - 2 * HPAD_X);
  const xAxisTicks = dateAxisLabels(tStart, tEnd, 4).map((t) => ({
    x: HPAD_X + ((t.ms - tStart) / spanMs) * (HW - 2 * HPAD_X),
    label: t.label,
  }));
  const y = (ml: number) => HPAD_Y + (1 - ml / yMax) * (HH - 2 * HPAD_Y);

  // Ticks del eje Y en ml (pasos redondos de 0,5 L)
  const waterTicks: number[] = (() => {
    const rough = yMax / 4;
    const step = rough <= 250 ? 250 : rough <= 500 ? 500 : rough <= 1000 ? 1000 : 2000;
    const ticks: number[] = [];
    for (let v = 0; v <= yMax + 1e-9; v += step) ticks.push(v);
    return ticks.length >= 2 ? ticks : [0, yMax];
  })();

  const linePoints = days.map((d) => `${xByDate(d.date)},${y(d.ml)}`).join(" ");
  const areaPath =
    n > 1
      ? `M ${xByDate(days[0].date)},${HH - HPAD_Y} L ${linePoints.split(" ").join(" L ")} L ${xByDate(days[n - 1].date)},${HH - HPAD_Y} Z`
      : "";

  const strokeColor = cumplimiento7d != null ? barColor(cumplimiento7d) : "#0d9488";

  return (
    <Box>
      <Box display="flex" flexWrap="wrap" gap={0.5} mb={1} alignItems="center">
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
        <Chip
          size="small"
          clickable
          onClick={() => setRango(rango === "todo" ? "mes" : "todo")}
          color={rango === "mes" ? "primary" : "default"}
          variant={rango === "mes" ? "filled" : "outlined"}
          label={rango === "mes" ? "ver todo" : "ver solo mes actual"}
          sx={{ ml: "auto", height: 24, fontSize: 11 }}
        />
      </Box>

      <Typography variant="caption" color="text.secondary" display="block" mb={1}>
        Agua diaria frente a tu meta (🎯). El color del punto indica el % de cumplimiento de ese día.
      </Typography>

      <svg viewBox={`0 0 ${HW} ${HH}`} width="100%" role="img" aria-label="Agua diaria en mililitros">
        {/* Eje Y en ml: pasos redondos */}
        {waterTicks.map((v, vi) => (
          <g key={`yt${vi}`}>
            <line x1={HPAD_X} x2={HW - HPAD_X} y1={y(v)} y2={y(v)} stroke="#e2e8f0" strokeWidth={0.6} />
            <text x={HPAD_X - 3} y={y(v) + 2.5} textAnchor="end" fontSize={8} fill="#94a3b8">
              {Math.round(v / 100) / 10}L
            </text>
          </g>
        ))}
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
              <circle cx={xByDate(d.date)} cy={y(d.ml)} r={7} fill={strokeColor} opacity={0.2} />
            )}
            <circle cx={xByDate(d.date)} cy={y(d.ml)} r={3.2} fill={barColor(d.pct)} stroke="#fff" strokeWidth={1} />
          </g>
        ))}

        {/* Eje X: fechas inicio → hoy */}
        {xAxisTicks.map((t) => (
          <text key={`hx${t.x}`} x={t.x} y={HH - HPAD_Y + 8} textAnchor="middle" fontSize={7.5} fill="#94a3b8">
            {t.label}
          </text>
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

// ─── Vista General combinada (un solo plot con capas interactivas) ──

const GW = 320;
const GH = 185;
const GPAD_L = 30;
const GPAD_R = 8;
const GPAD_T = 18;
const GPAD_B = 16;
const C_WATER = "#0ea5e9";
const C_GLU = "#94a3b8";
const C_CET = "#059669";
const C_AUT = "#6366f1";

type GeneralFocus = "metab" | "agua" | "peso";

interface GeneralChartProps {
  weights: WeightEntry[];
  meals: MealEntry[];
  liquids?: LiquidEntry[];
  targetWeight?: number;
  objetivoMl?: number;
}

/** Baja un escalón la zona metabólica si el día tuvo comida no KETO. */
function lowerZoneByNoKeto(zone: "autofagia" | "cetosis" | "glucolisis", noKeto: boolean) {
  if (!noKeto) return zone;
  if (zone === "autofagia") return "cetosis";
  if (zone === "cetosis") return "glucolisis";
  return "glucolisis";
}

function generalZoneColor(zone: "autofagia" | "cetosis" | "glucolisis"): string {
  return zone === "autofagia" ? C_AUT : zone === "cetosis" ? C_CET : C_GLU;
}

/**
 * Gráfico "General": UN solo plot con capas superpuestas y legibles mediante
 * transparencia + interacción.
 * - Barras de metabolismo (transparentes) DETRÁS de la línea de peso.
 * - Línea de hidratación (celeste, semitransparente) en el mismo plot.
 * - Al hacer clic/tap en una barra o en la línea de agua, esa capa pasa a primer
 *   plano (z-order superior y mayor opacidad); clic en el fondo/peso la devuelve.
 */
export function GeneralMetricsChart({
  weights,
  meals,
  liquids = [],
  targetWeight,
  objetivoMl,
}: GeneralChartProps) {
  const { days: allDays } = buildGeneralSeries(weights, meals, liquids, objetivoMl);
  const [focus, setFocus] = useState<GeneralFocus>("peso");
  const [rango, setRango] = useState<"todo" | "mes">("todo");

  // Rango temporal: "todo" = data completa desde el 1er dato hasta hoy;
  // "mes" = últimos ~30 días.
  const days = (() => {
    if (rango !== "mes" || allDays.length === 0) return allDays;
    const cutKey = cutoffKey29d();
    const filtered = allDays.filter((d) => d.date >= cutKey);
    return filtered.length > 0 ? filtered : allDays;
  })();

  const hasWeight = days.some((d) => d.pesoKg != null);
  const hasMetab = days.some((d) => d.ayunoMaxH != null || (d.nComidas ?? 0) > 0);
  const hasWater = days.some((d) => d.ml != null);

  if (days.length === 0 || (!hasWeight && !hasMetab && !hasWater)) {
    return (
      <EmptyText>Registra peso, comidas o agua para ver tu resumen general 🎯</EmptyText>
    );
  }

  const n = days.length;
  const plotW = GW - GPAD_L - GPAD_R;
  const plotH = GH - GPAD_T - GPAD_B;

  // Eje X por FECHA REAL (tiempo), no por índice: todas las capas (peso, metab,
  // agua) comparten el mismo eje temporal. El 1er día del rango = izquierda y
  // HOY = derecha (la serie llega hasta el borde derecho aunque el último dato
  // sea anterior a hoy; así no queda todo "pegado a la izquierda").
  const DAY_MS = 1000 * 60 * 60 * 24;
  const tStart = new Date(days[0].date).getTime();
  const tEnd = Date.now();
  const spanMs = Math.max(DAY_MS, tEnd - tStart);
  const xByDate = (date: string) =>
    GPAD_L + ((new Date(date).getTime() - tStart) / spanMs) * plotW;

  // Ancho de las barras según el espacio de ~1 día en el eje temporal
  const daySpanUnits = spanMs / DAY_MS;
  const barW = Math.min(16, (plotW / Math.max(1, daySpanUnits)) * 0.55);

  // Etiquetas de fecha del eje X (inicio → hoy)
  const xAxisTicks = dateAxisLabels(tStart, tEnd, 4).map((t) => ({
    x: GPAD_L + ((t.ms - tStart) / spanMs) * plotW,
    label: t.label,
  }));

  // Escala de peso (kg): eje panorámico — base = meta (objetivo) o piso redondeado a 20;
  // tope = máximo redondeado hacia ARRIBA a múltiplos de 20 (102 → 120, 122 → 140).
  const kgVals = days.map((d) => d.pesoKg).filter((v): v is number => v != null);
  const ceil20 = (v: number) => Math.ceil(v / 20) * 20;
  const floor20 = (v: number) => Math.floor(v / 20) * 20;
  const rawMinKg = kgVals.length ? Math.min(...kgVals) : 0;
  const rawMaxKg = kgVals.length ? Math.max(...kgVals) : 1;
  const minV = targetWeight != null ? Math.min(targetWeight, floor20(rawMinKg)) : floor20(rawMinKg);
  const maxV = Math.max(ceil20(rawMaxKg), targetWeight ?? ceil20(rawMaxKg));
  const range = maxV - minV || 20;
  const yKg = (kg: number) => GPAD_T + (1 - (kg - minV) / range) * plotH;

  // Eje Y de peso: ticks "redondos" (paso 1/2/5 ×10^k) que cubran minV..maxV e
  // incluyan los valores reales de los datos (p.ej. el primer peso 102).
  const yTicks = (() => {
    const raw = range || 1;
    const roughStep = raw / 4;
    const mag = Math.pow(10, Math.floor(Math.log10(roughStep)));
    const norm = roughStep / mag;
    const step = (norm >= 5 ? 5 : norm >= 2 ? 2 : 1) * mag;
    const start = Math.ceil(minV / step) * step;
    const ticks: number[] = [];
    for (let v = start; v <= maxV + 1e-9; v += step) ticks.push(v);
    return ticks.length >= 2 ? ticks : [minV, maxV];
  })();

  // Escala de ayuno (horas) para las barras
  const ayunoMax = Math.max(12, ...days.map((d) => d.ayunoMaxH ?? 0)) + 1;
  const yAyuno = (h: number) => GPAD_T + (1 - h / ayunoMax) * plotH;
  const y12 = yAyuno(12);
  const y16 = yAyuno(16);

  // Escala de hidratación (%)
  const waterMax = Math.max(100, ...days.map((d) => d.pctHidro ?? 0));
  const yWater = (pct: number) => GPAD_T + (1 - pct / waterMax) * plotH;

  const linePoints = days
    .map((d) => (d.pesoKg != null ? `${xByDate(d.date)},${yKg(d.pesoKg)}` : null))
    .filter((p): p is string => p != null)
    .join(" ");
  const waterPoints = days
    .map((d) => (d.pctHidro != null ? `${xByDate(d.date)},${yWater(d.pctHidro)}` : null))
    .filter((p): p is string => p != null)
    .join(" ");
  const wentDown =
    kgVals.length >= 2 && kgVals[kgVals.length - 1] <= kgVals[0];
  const weightColor = wentDown ? "#059669" : "#f59e0b";
  // Mostrar etiqueta de valor en todos si hay pocos pesos; si no, SOLO el primer
  // y el último peso (evaluado sobre kgVals, no sobre days) para que el 102 salga.
  const showKgLabel = (kgIdx: number, totalKg: number) =>
    totalKg <= 8 || kgIdx === 0 || kgIdx === totalKg - 1;

  const weightOpacity = focus === "peso" ? 1 : 0.4;
  const metabOpacity = focus === "metab" ? 0.85 : 0.22;
  const waterOpacity = focus === "agua" ? 1 : 0.5;

  // Altura efectiva de la barra por zona (con el descuento por no-keto)
  const barTopOf = (d: typeof days[number]): number => {
    const base = metabolismZone(d.ayunoMaxH);
    const zone = lowerZoneByNoKeto(base, Boolean(d.noKeto));
    if (zone === "autofagia") return y16;
    if (zone === "cetosis") return y12;
    return Math.max(y12, yAyuno(Math.min(d.ayunoMaxH ?? 0, 12)));
  };

  /** Barras de metabolismo (capa). `active`: render en primer plano. */
  const metabLayer = (active: boolean) => (
    <g>
      {days.map((d, i) => {
        const base = metabolismZone(d.ayunoMaxH);
        const zone = lowerZoneByNoKeto(base, Boolean(d.noKeto));
        const top = barTopOf(d);
        const cx = xByDate(d.date);
        return (
          <g key={`m${i}`}>
            <rect
              x={cx - barW / 2}
              y={top}
              width={barW}
              height={Math.max(2, yAyuno(0) - top)}
              rx={3}
              fill={generalZoneColor(zone)}
              opacity={active ? 0.8 : metabOpacity}
              style={{ cursor: "pointer" }}
              onClick={() => setFocus("metab")}
              onPointerDown={() => setFocus("metab")}
            >
              <title>ayuno {fmtH(d.ayunoMaxH ?? 0)}</title>
            </rect>
            {active && d.noKeto && (
              <text x={cx} y={GPAD_T + 3} textAnchor="middle" fontSize={8}>🔴</text>
            )}
          </g>
        );
      })}
    </g>
  );

  /** Línea de hidratación (capa). `active`: render en primer plano. */
  const waterLayer = (active: boolean) =>
    hasWater && n > 1 ? (
      <g style={{ cursor: "pointer" }} onClick={() => setFocus("agua")} onPointerDown={() => setFocus("agua")}>
        <polyline
          points={waterPoints}
          fill="none"
          stroke={C_WATER}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={active ? 1 : waterOpacity}
        />
        {days.map((d, i) =>
          d.pctHidro != null ? (
            <circle key={`w${i}`} cx={xByDate(d.date)} cy={yWater(d.pctHidro)} r={2} fill={C_WATER} opacity={active ? 1 : 0.7} />
          ) : null
        )}
      </g>
    ) : null;

  const weightLayer = (
    <g style={{ cursor: "pointer" }} onClick={() => setFocus("peso")} onPointerDown={() => setFocus("peso")}>
      {targetWeight != null && (
        <>
          <line x1={GPAD_L} x2={GW - GPAD_R} y1={yKg(targetWeight)} y2={yKg(targetWeight)} stroke="#94a3b8" strokeWidth={1} strokeDasharray="4 4" />
          <text x={GW - GPAD_R - 2} y={yKg(targetWeight) - 4} textAnchor="end" fontSize={9} fill="#64748b">
            objetivo {targetWeight} kg
          </text>
        </>
      )}
      {hasWeight && linePoints && n > 1 && (
        <polyline
          points={linePoints}
          fill="none"
          stroke={weightColor}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={weightOpacity}
        />
      )}
      {hasWeight &&
        (() => {
          let kgIdx = -1;
          const totalKg = kgVals.length;
          return days.map((d, i) => {
            if (d.pesoKg == null) return null;
            kgIdx += 1;
            const nearTop = yKg(d.pesoKg) - 6 < GPAD_T + 1;
            const labelY = nearTop ? yKg(d.pesoKg) + 14 : yKg(d.pesoKg) - 6;
            return (
              <g key={`kg${i}`}>
                {showKgLabel(kgIdx, totalKg) && (
                  <text x={xByDate(d.date)} y={labelY} textAnchor="middle" fontSize={8.5} fontWeight={700} fill="#64748b">
                    {d.pesoKg}
                  </text>
                )}
                {i === days.length - 1 && n > 1 ? (
                  <>
                    <circle cx={xByDate(d.date)} cy={yKg(d.pesoKg)} r={4} fill={weightColor} opacity={weightOpacity} />
                    <circle cx={xByDate(d.date)} cy={yKg(d.pesoKg)} r={7} fill={weightColor} opacity={0.2 * weightOpacity} />
                  </>
                ) : (
                  <circle cx={xByDate(d.date)} cy={yKg(d.pesoKg)} r={3} fill={weightColor} stroke="#fff" strokeWidth={1} opacity={weightOpacity} />
                )}
              </g>
            );
          });
        })()}
    </g>
  );

  return (
    <Box>
      <Box display="flex" flexWrap="wrap" gap={0.5} mb={1} alignItems="center">
        {hasWeight && (
          <Chip
            size="small"
            clickable
            onClick={() => setFocus("peso")}
            color={focus === "peso" ? "primary" : "default"}
            variant={focus === "peso" ? "filled" : "outlined"}
            label={`⚖️ ${kgVals[0] ?? "—"}→${kgVals[kgVals.length - 1] ?? "—"} kg`}
          />
        )}
        {hasMetab && (
          <Chip
            size="small"
            clickable
            onClick={() => setFocus("metab")}
            color={focus === "metab" ? "primary" : "success"}
            variant={focus === "metab" ? "filled" : "outlined"}
            label="🔬 metabolismo"
          />
        )}
        {hasWater && (
          <Chip
            size="small"
            clickable
            onClick={() => setFocus("agua")}
            color={focus === "agua" ? "primary" : "default"}
            variant={focus === "agua" ? "filled" : "outlined"}
            label="💧 agua"
          />
        )}
        <Chip
          size="small"
          clickable
          onClick={() => setRango(rango === "todo" ? "mes" : "todo")}
          color={rango === "mes" ? "primary" : "default"}
          variant={rango === "mes" ? "filled" : "outlined"}
          label={rango === "mes" ? "ver todo" : "ver solo mes actual"}
          sx={{ ml: "auto", height: 24, fontSize: 11 }}
        />
      </Box>

      <Typography variant="caption" color="text.secondary" display="block" mb={1}>
        Peso (⚖️) + metabolismo diario (🔬) + agua (💧) sobre la misma línea de tiempo, de tu{" "}
        primer registro hasta hoy. Tocá una barra o la línea de agua para ponerla en primer plano.
      </Typography>

      <svg viewBox={`0 0 ${GW} ${GH}`} width="100%" role="img" aria-label="Resumen general (peso, metabolismo, agua)">
        {/* Fondo / zona de clic para volver al peso */}
        <rect x={GPAD_L} y={GPAD_T} width={plotW} height={plotH} fill="transparent" onClick={() => setFocus("peso")} onPointerDown={() => setFocus("peso")} />

        {/* Bandas de zonas metabólicas (decorativas, detrás de todo) */}
        <rect x={GPAD_L} y={y16} width={plotW} height={yAyuno(0) - y16} fill={C_AUT} opacity={0.06} />
        <rect x={GPAD_L} y={y12} width={plotW} height={y16 - y12} fill={C_CET} opacity={0.06} />
        <line x1={GPAD_L} x2={GW - GPAD_R} y1={y16} y2={y16} stroke={C_AUT} strokeWidth={0.8} strokeDasharray="3 3" opacity={0.4} />
        <line x1={GPAD_L} x2={GW - GPAD_R} y1={y12} y2={y12} stroke={C_CET} strokeWidth={0.8} strokeDasharray="3 3" opacity={0.4} />

        {/* Eje Y de peso: gridlines + etiquetas (kg) */}
        {hasWeight &&
          yTicks.map((t, ti) => (
            <g key={`yt${ti}`}>
              <line x1={GPAD_L} x2={GW - GPAD_R} y1={yKg(t)} y2={yKg(t)} stroke="#e2e8f0" strokeWidth={0.6} opacity={0.8} />
              <text x={GPAD_L - 3} y={yKg(t) + 2.5} textAnchor="end" fontSize={7.5} fill="#94a3b8">
                {Math.round(t)}
              </text>
            </g>
          ))}

        {/* Etiquetas de zonas */}
        <text x={GW - GPAD_R} y={y16 - 3} textAnchor="end" fontSize={7.5} fontWeight={700} fill="#4f46e5" opacity={0.7}>autofagia</text>
        <text x={GW - GPAD_R} y={y12 - 3} textAnchor="end" fontSize={7.5} fontWeight={700} fill="#047857" opacity={0.7}>cetosis</text>

        {/* Orden de capas según foco (las enfocadas al final = primer plano) */}
        {focus === "peso" && (
          <>
            {metabLayer(false)}
            {waterLayer(false)}
            {weightLayer}
          </>
        )}
        {focus === "metab" && (
          <>
            {waterLayer(false)}
            {weightLayer}
            {metabLayer(true)}
          </>
        )}
        {focus === "agua" && (
          <>
            {metabLayer(false)}
            {weightLayer}
            {waterLayer(true)}
          </>
        )}

        {/* Eje X: fechas inicio → hoy */}
        {xAxisTicks.map((t) => (
          <text key={`gx${t.x}`} x={t.x} y={GH - GPAD_B + 8} textAnchor="middle" fontSize={7.5} fill="#94a3b8">
            {t.label}
          </text>
        ))}
      </svg>

      <Box display="flex" justifyContent="space-between" mt={0.5}>
        <Typography variant="caption" color="text.secondary">{fmtDate(days[0].date)} · inicio</Typography>
        <Typography variant="caption" color="text.secondary">{fmtToday()} · hoy</Typography>
      </Box>

      {/* Leyenda interactiva */}
      <Box display="flex" gap={1.5} justifyContent="center" mt={1} flexWrap="wrap">
        <LegendDot color={weightColor} text="⚖️ peso" />
        {hasMetab && <LegendDot color={C_CET} text="🔬 metabolismo" />}
        {hasWater && <LegendDot color={C_WATER} text="💧 agua" />}
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