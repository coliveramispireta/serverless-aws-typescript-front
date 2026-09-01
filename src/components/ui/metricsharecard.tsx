"use client";

import { Box, Typography } from "@mui/material";

export interface MetricShareStat {
  label: string;
  value: string;
}

/** Gráfico opcional que se dibuja dentro del card compartido. */
export interface MetricShareChartData {
  kind: "peso" | "metabolismo" | "agua";
  // peso: serie de kg por fecha + objetivo opcional
  points?: { kg: number; date: string }[];
  target?: number;
  // metabolismo: días con ayuno máximo y si hubo comida no keto
  days?: { ayunoMaxH?: number; noKeto: boolean }[];
  // agua: % de cumplimiento diario
  pct?: number[];
}

export interface MetricShareData {
  emoji: string;
  titulo: string;
  subtitulo?: string;
  stats: MetricShareStat[];
  nombre?: string;
  chart?: MetricShareChartData;
}

/** Tamaño de diseño base del card (px) — también se usa para el PNG 1:1 */
export const METRIC_CARD_SIZE = 1080;
/** Tamaño de la vista previa en el diálogo (px) */
export const METRIC_PREVIEW_SIZE = 240;
/** Escala exacta para que el contenido centrado caiga en el centro de la preview */
export const METRIC_PREVIEW_SCALE = METRIC_PREVIEW_SIZE / METRIC_CARD_SIZE;

const CW = 700;
const CH = 230;
const CPAD_L = 10;
const CPAD_R = 10;
const CPAD_T = 12;
const CPAD_B = 14;

function fmtDate2(isoDate: string): string {
  const [, m, d] = isoDate.split("-");
  return `${d}/${m}`;
}

function fmtH(h: number): string {
  return h % 1 === 0 ? `${h}h` : `${h.toFixed(1)}h`;
}

function metabZone(h?: number): "autofagia" | "cetosis" | "glucolisis" {
  const v = h ?? 0;
  if (v >= 16) return "autofagia";
  if (v >= 12) return "cetosis";
  return "glucolisis";
}

function lowerByNoKeto(zone: "autofagia" | "cetosis" | "glucolisis", noKeto: boolean) {
  if (!noKeto) return zone;
  if (zone === "autofagia") return "cetosis";
  return "glucolisis";
}

const C_AUT = "#a78bfa";
const C_CET = "#6ee7b7";
const C_GLU = "#94a3b8";

/** Mini-gráfico de evolución de peso (para el card compartido). */
function PesoMiniChart({ points, target }: { points: { kg: number; date: string }[]; target?: number }) {
  if (!points || points.length === 0) return null;
  const kgs = points.map((p) => p.kg);
  let minV = Math.min(...kgs);
  let maxV = Math.max(...kgs);
  if (target != null) {
    minV = Math.min(minV, target);
    maxV = Math.max(maxV, target);
  }
  let range = maxV - minV || 1;
  const pad = range * 0.1;
  minV -= pad;
  maxV += pad;
  range = maxV - minV;

  const n = points.length;
  const x = (i: number) => CPAD_L + (n === 1 ? 0.5 : i / (n - 1)) * (CW - CPAD_L - CPAD_R);
  const y = (kg: number) => CPAD_T + (1 - (kg - minV) / range) * (CH - CPAD_T - CPAD_B);

  const pts = points.map((p, i) => `${x(i)},${y(p.kg)}`).join(" ");
  const wentDown = points[points.length - 1].kg <= points[0].kg;
  const color = wentDown ? "#6ee7b7" : "#fbbf24";
  const last = points[points.length - 1];

  return (
    <svg viewBox={`0 0 ${CW} ${CH}`} width="100%" style={{ display: "block" }} role="img" aria-label="Evolución de peso">
      {target != null && (
        <>
          <line x1={CPAD_L} x2={CW - CPAD_R} y1={y(target)} y2={y(target)} stroke="rgba(255,255,255,0.4)" strokeWidth={1.5} strokeDasharray="6 5" />
          <text x={CW - CPAD_R} y={y(target) - 6} textAnchor="end" fontSize={16} fill="rgba(255,255,255,0.75)" fontWeight={700}>
            meta {target} kg
          </text>
        </>
      )}
      {points.length > 1 && (
        <polyline points={pts} fill="none" stroke={color} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
      )}
      {points.map((p, i) => (
        <g key={`${p.date}-${i}`}>
          <circle cx={x(i)} cy={y(p.kg)} r={i === n - 1 ? 8 : 5} fill={color} stroke="#0f172a" strokeWidth={1.5} />
          {i === n - 1 && (
            <text x={x(i)} y={y(p.kg) - 14} textAnchor="middle" fontSize={20} fontWeight={900} fill="#f8fafc">
              {p.kg} kg
            </text>
          )}
        </g>
      ))}
      <text x={x(0)} y={CH - 2} textAnchor="middle" fontSize={15} fill="rgba(248,250,252,0.6)">
        {fmtDate2(points[0].date)}
      </text>
      <text x={x(n - 1)} y={CH - 2} textAnchor="middle" fontSize={15} fill="rgba(248,250,252,0.6)">
        {fmtDate2(last.date)}
      </text>
    </svg>
  );
}

/** Mini-gráfico de metabolismo (barras diarias) para el card compartido. */
function MetabMiniChart({ days }: { days: { ayunoMaxH?: number; noKeto: boolean }[] }) {
  if (!days || days.length === 0) return null;
  const n = days.length;
  const maxAyuno = Math.max(...days.map((d) => d.ayunoMaxH ?? 0));
  const yMax = Math.max(16, Math.ceil(maxAyuno) + 1);
  const slot = (CW - CPAD_L - CPAD_R) / Math.max(n, 1);
  const barW = Math.min(34, slot * 0.6);
  const xC = (i: number) => CPAD_L + slot * i + slot / 2;
  const y = (h: number) => CPAD_T + (1 - h / yMax) * (CH - CPAD_T - CPAD_B);
  const y12 = y(12);
  const y16 = y(16);

  const topOf = (d: { ayunoMaxH?: number; noKeto: boolean }): number => {
    const zone = lowerByNoKeto(metabZone(d.ayunoMaxH), d.noKeto);
    if (zone === "autofagia") return y16;
    if (zone === "cetosis") return y12;
    return Math.max(y12, y(Math.min(d.ayunoMaxH ?? 0, 12)));
  };
  const colorOf = (d: { ayunoMaxH?: number; noKeto: boolean }): string =>
    generalZoneColor(lowerByNoKeto(metabZone(d.ayunoMaxH), d.noKeto));

  return (
    <svg viewBox={`0 0 ${CW} ${CH}`} width="100%" style={{ display: "block" }} role="img" aria-label="Metabolismo diario">
      <rect x={CPAD_L} y={y16} width={CW - CPAD_L - CPAD_R} height={y(0) - y16} fill={C_AUT} opacity={0.14} />
      <rect x={CPAD_L} y={y12} width={CW - CPAD_L - CPAD_R} height={y16 - y12} fill={C_CET} opacity={0.14} />
      <line x1={CPAD_L} x2={CW - CPAD_R} y1={y16} y2={y16} stroke={C_AUT} strokeWidth={1} strokeDasharray="5 4" />
      <line x1={CPAD_L} x2={CW - CPAD_R} y1={y12} y2={y12} stroke={C_CET} strokeWidth={1} strokeDasharray="5 4" />
      <text x={CPAD_L + 4} y={y16 - 5} fontSize={15} fontWeight={800} fill={C_AUT}>🌀 autofagia</text>
      <text x={CPAD_L + 4} y={y12 - 5} fontSize={15} fontWeight={800} fill={C_CET}>🔥 cetosis</text>
      {days.map((d, i) => {
        const top = topOf(d);
        return (
          <g key={i}>
            <rect x={xC(i) - barW / 2} y={top} width={barW} height={Math.max(2, y(0) - top)} rx={4} fill={colorOf(d)} opacity={0.85} />
            <text x={xC(i)} y={top - 6} textAnchor="middle" fontSize={14} fontWeight={800} fill="#f8fafc">
              {d.ayunoMaxH != null ? fmtH(d.ayunoMaxH) : "—"}
            </text>
            {d.noKeto && <text x={xC(i)} y={CPAD_T + 2} textAnchor="middle" fontSize={16}>🔴</text>}
          </g>
        );
      })}
    </svg>
  );
}

/** Mini-gráfico de hidratación (cumplimiento %) para el card compartido. */
function AguaMiniChart({ pct }: { pct: number[] }) {
  if (!pct || pct.length === 0) return null;
  const n = pct.length;
  const slot = (CW - CPAD_L - CPAD_R) / Math.max(n, 1);
  const barW = Math.min(34, slot * 0.6);
  const xC = (i: number) => CPAD_L + slot * i + slot / 2;
  const y = (p: number) => CPAD_T + (1 - p / 100) * (CH - CPAD_T - CPAD_B);

  return (
    <svg viewBox={`0 0 ${CW} ${CH}`} width="100%" style={{ display: "block" }} role="img" aria-label="Cumplimiento de agua">
      <line x1={CPAD_L} x2={CW - CPAD_R} y1={y(100)} y2={y(100)} stroke="#7dd3fc" strokeWidth={1} strokeDasharray="5 4" opacity={0.7} />
      <text x={CPAD_L + 4} y={y(100) - 5} fontSize={15} fontWeight={800} fill="#7dd3fc">100%</text>
      {pct.map((p, i) => {
        const c = p >= 80 ? "#7dd3fc" : p >= 50 ? "#fbbf24" : "#f87171";
        return (
          <g key={i}>
            <rect x={xC(i) - barW / 2} y={y(Math.max(p, 4))} width={barW} height={Math.max(2, y(0) - y(Math.max(p, 4)))} rx={4} fill={c} />
            <text x={xC(i)} y={y(Math.max(p, 4)) - 6} textAnchor="middle" fontSize={14} fontWeight={800} fill="#f8fafc">
              {p}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function ChartFor({ chart }: { chart?: MetricShareChartData }) {
  if (!chart) return null;
  if (chart.kind === "peso") return <PesoMiniChart points={chart.points ?? []} target={chart.target} />;
  if (chart.kind === "metabolismo") return <MetabMiniChart days={chart.days ?? []} />;
  if (chart.kind === "agua") return <AguaMiniChart pct={chart.pct ?? []} />;
  return null;
}

function generalZoneColor(zone: "autofagia" | "cetosis" | "glucolisis"): string {
  return zone === "autofagia" ? C_AUT : zone === "cetosis" ? C_CET : C_GLU;
}

/**
 * Card visual de una métrica (peso, cetosis, hidratación o general) para
 * compartir como imagen. Se renderiza en un nodo oculto para generar el PNG.
 * Incluye el mini-gráfico de la métrica además de los datos de texto.
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
        padding: "56px",
      }}
    >
      <Typography sx={{ fontSize: 96, lineHeight: 1.15 }}>{data.emoji}</Typography>

      <Typography
        sx={{
          color: "#f8fafc",
          fontWeight: 900,
          fontSize: 46,
          lineHeight: 1.1,
          mt: 0.5,
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
            fontSize: 22,
            lineHeight: 1.4,
            mt: 0.5,
            px: 4,
            maxWidth: 880,
          }}
        >
          {data.subtitulo}
        </Typography>
      )}

      {/* Gráfico de la métrica */}
      <Box sx={{ width: "92%", mt: 2.5, px: 1 }}>
        <ChartFor chart={data.chart} />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: data.stats.length >= 3 ? "repeat(3, 1fr)" : "repeat(2, 1fr)",
          gap: "20px",
          width: "88%",
          mt: 3,
        }}
      >
        {data.stats.map((st) => (
          <Box
            key={st.label}
            sx={{
              bgcolor: "rgba(255,255,255,0.08)",
              borderRadius: 3,
              p: "18px 12px",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <Typography sx={{ color: "#a7f3d0", fontSize: 28, fontWeight: 900 }}>
              {st.value}
            </Typography>
            <Typography sx={{ color: "rgba(248,250,252,0.7)", fontSize: 18, mt: 0.5 }}>
              {st.label}
            </Typography>
          </Box>
        ))}
      </Box>

      <Typography
        sx={{
          color: "rgba(248,250,252,0.6)",
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: 1,
          mt: 3,
          textTransform: "uppercase",
        }}
      >
        {data.nombre ? `${data.nombre} · ` : ""}KetoFlow
      </Typography>
    </Box>
  );
}
