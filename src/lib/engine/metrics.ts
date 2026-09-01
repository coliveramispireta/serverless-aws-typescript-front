import { LiquidEntry, MealEntry, WeightEntry } from "@/model/keto.models";

/**
 * Motor de métricas automáticas.
 * Funciones puras: calculan el progreso del usuario a partir de sus registros.
 */

export interface KetoMetrics {
  hasData: boolean;
  registrosPeso: number;
  pesoInicial?: number;
  pesoActual?: number;
  pesoObjetivo?: number;
  perdidaTotalKg?: number; // positivo = ha perdido
  perdidaPorcentaje?: number;
  cambioUltimos7DiasKg?: number; // negativo = bajó
  rachaDias: number; // días consecutivos registrando algo
  imc?: number;
  fechaUltimoRegistro?: string;
  tieneEvidencias: boolean;
}

const DAY_MS = 1000 * 60 * 60 * 24;
const HOUR_MS = 1000 * 60 * 60;
const CLUSTER_MS = 10 * 60 * 1000; // comidas separadas por <10 min = mismo bloque

const MIN_OBJETIVO_AGUA_ML = 1200;
const MAX_OBJETIVO_AGUA_ML = 4000;

function toDate(iso: string): Date {
  return new Date(iso);
}

/** Normaliza una fecha a medianoche para comparar por día */
function dayKey(date: Date): number {
  return Math.floor(date.getTime() / DAY_MS);
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/**
 * Corrige la altura del usuario a centímetros.
 * - 100–230 → ya viene en cm (ej. 170).
 * - 0.5–3 → viene en metros (ej. 1.70) → se convierte a cm.
 * - cualquier otro valor → inválido (undefined).
 */
export function normalizeAlturaCm(raw?: number): number | undefined {
  if (raw == null || raw <= 0) return undefined;
  if (raw >= 100 && raw <= 230) return Math.round(raw);
  if (raw > 0.5 && raw < 3) return Math.round(raw * 100);
  return undefined;
}

export function computeMetrics(
  weights: WeightEntry[],
  meals: MealEntry[],
  options?: { alturaCm?: number; pesoObjetivoKg?: number }
): KetoMetrics {
  const ordered = [...weights].sort(
    (a, b) => toDate(a.fechaHora).getTime() - toDate(b.fechaHora).getTime()
  );

  const metrics: KetoMetrics = {
    hasData: ordered.length > 0 || meals.length > 0,
    registrosPeso: ordered.length,
    rachaDias: computeStreak(ordered, meals),
    tieneEvidencias: ordered.some((w) => !!w.evidenciaFotoUrl),
  };

  if (ordered.length === 0) return metrics;

  const first = ordered[0];
  const last = ordered[ordered.length - 1];

  metrics.pesoInicial = first.pesoKg;
  metrics.pesoActual = last.pesoKg;
  metrics.pesoObjetivo = options?.pesoObjetivoKg;
  metrics.perdidaTotalKg = Number((first.pesoKg - last.pesoKg).toFixed(1));
  metrics.fechaUltimoRegistro = last.fechaHora;

  if (first.pesoKg > 0) {
    metrics.perdidaPorcentaje = Number(
      ((metrics.perdidaTotalKg / first.pesoKg) * 100).toFixed(1)
    );
  }

  // Variación de los últimos 7 días: comparar contra el registro más
  // cercano disponible hace ~7 días (o el primero anterior).
  const lastTime = toDate(last.fechaHora).getTime();
  const weekAgo = lastTime - 7 * DAY_MS;
  let reference = null as WeightEntry | null;
  for (const entry of ordered) {
    const t = toDate(entry.fechaHora).getTime();
    if (t <= weekAgo) reference = entry;
  }
  if (!reference && ordered.length > 1) reference = ordered[ordered.length - 2];
  if (reference) {
    metrics.cambioUltimos7DiasKg = Number((last.pesoKg - reference.pesoKg).toFixed(1));
  }

  // IMC si conocemos la altura (normalizada: admite cm o metros)
  const alturaCm = normalizeAlturaCm(options?.alturaCm);
  if (alturaCm) {
    const alturaM = alturaCm / 100;
    metrics.imc = Number((last.pesoKg / (alturaM * alturaM)).toFixed(1));
  }

  return metrics;
}

/**
 * Racha de días consecutivos con al menos un registro (peso o comida),
 * contando hacia atrás desde hoy (tolerando que hoy aún no se registre).
 */
export function computeStreak(weights: WeightEntry[], meals: MealEntry[]): number {
  const days = new Set<number>();
  for (const w of weights) days.add(dayKey(toDate(w.fechaHora)));
  for (const meal of meals) days.add(dayKey(toDate(meal.fechaHora)));

  if (days.size === 0) return 0;

  const today = dayKey(new Date());
  let cursor = days.has(today) ? today : today - 1;

  if (!days.has(cursor)) return 0;

  let streak = 0;
  while (days.has(cursor)) {
    streak += 1;
    cursor -= 1;
  }
  return streak;
}

/** Puntos para dibujar la gráfica de evolución de peso */
export function buildWeightSeries(weights: WeightEntry[]): { date: string; kg: number }[] {
  return [...weights]
    .sort((a, b) => toDate(a.fechaHora).getTime() - toDate(b.fechaHora).getTime())
    .map((w) => ({ date: w.fechaHora, kg: w.pesoKg }));
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** Fecha local YYYY-MM-DD a partir de un ISO datetime (sin dependencias). */
function toLocalDateKey(iso: string): string | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** Comidas agrupadas por día local: para la cinta "horas de comida" del gráfico. */
export function buildMealTimeline(meals: MealEntry[]): { date: string; count: number }[] {
  const map = new Map<string, number>();
  for (const m of meals) {
    const key = toLocalDateKey(m.fechaHora);
    if (!key) continue;
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

// ─── Hidratación ──────────────────────────────────────────────

export interface HydrationDayStats {
  date: string; // YYYY-MM-DD (día local)
  ml: number;
  pct: number; // 0-100 respecto al objetivo diario
}

/**
 * Objetivo diario de agua = promedio de dos métodos:
 * - por peso: 35 ml × kg
 * - por talla: (alturaCm − 100) × 30
 * Si falta la altura, se usa solo el método de peso.
 * Redondeado a 100 ml, con clamp [1200, 4000].
 */
export function computeHydrationStats(
  liquids: LiquidEntry[],
  pesoActualKg?: number,
  alturaCm?: number
): { objetivoMl?: number; days: HydrationDayStats[]; cumplimiento7d?: number } {
  const altura = normalizeAlturaCm(alturaCm);
  let objetivoMl: number | undefined;
  if (pesoActualKg && pesoActualKg > 0) {
    const porPeso = pesoActualKg * 35;
    const porTalla = altura ? (altura - 100) * 30 : 0;
    const bruto = altura ? (porPeso + porTalla) / 2 : porPeso;
    objetivoMl = Math.min(
      MAX_OBJETIVO_AGUA_ML,
      Math.max(MIN_OBJETIVO_AGUA_ML, Math.round(bruto / 100) * 100),
    );
  }

  const byDay = new Map<string, number>();
  for (const l of liquids) {
    const key = localDayKey(l.fechaHora);
    byDay.set(key, (byDay.get(key) ?? 0) + l.cantidadMl);
  }

  const dates = Array.from(byDay.keys()).sort();
  const recent = dates.slice(-14);
  const days: HydrationDayStats[] = recent.map((date) => {
    const ml = byDay.get(date)!;
    return {
      date,
      ml,
      pct: objetivoMl ? Math.round((ml / objetivoMl) * 100) : 0,
    };
  });

  const ultimos7 = days.slice(-7);
  const cumplimiento7d = ultimos7.length
    ? Math.round(ultimos7.reduce((s, d) => s + d.pct, 0) / ultimos7.length)
    : undefined;

  return { objetivoMl, days, cumplimiento7d };
}

// ─── Alimentación: ayunos, cetosis, autofagia ─────────────────

export interface NutritionDayStats {
  date: string; // YYYY-MM-DD
  nComidas: number;
  primera?: string; // HH:mm local
  ultima?: string; // HH:mm local
  ayunoNocturnoH?: number; // última comida → primera del día siguiente
  ayunoMaxH?: number; // mayor ayuno del día (nocturno o entre comidas)
  noKeto: boolean;
  noKetoCount: number;
}

export interface NutritionStats {
  days: NutritionDayStats[];
  ayunoNocturnoPromedioH?: number;
  diasCetosis: number; // días con ayuno ≥12 h
  diasAutofagia: number; // días con ayuno ≥16 h
  eventosNoKeto: number;
  ayunoMasLargo?: { horas: number; date: string };
}

/** Palabras de alimentos altos en carbos usadas como heurística para
 *  registros sin categoría (antiguos o importados). Sin tildes. */
const NO_KETO_KEYWORDS = [
  "pan", "tortilla", "oblea", "arroz", "fideos", "papa", "camote", "yuca",
  "choclo", "cancha", "azucar", "miel", "gaseosa", "cerveza", "jugo",
  "helado", "gallet", "torta", "harina", "chicha", "maiz", "masa",
  "croissant", "donut", "empanada", "queque", "mazamorra", "arroz con leche",
];

function stripAccents(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

/** Detecta si un alimento registrado es no KETO (por categoría o por nombre). */
export function esNoKeto(meal: { alimento: string; categoria?: string }): boolean {
  if (meal.categoria === "no_keto") return true;
  if (meal.categoria) return false; // tiene categoría y no es no_keto
  const name = stripAccents(meal.alimento || "");
  return NO_KETO_KEYWORDS.some((k) => name.includes(k));
}

function localDayKey(iso: string): string {
  const d = toDate(iso);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function localHHMM(ms: number): string {
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/**
 * Analiza ayunos y riesgo de cetosis a partir de las comidas registradas.
 * Heurística educativa (no medición real de cetonas):
 * - ≈12–14 h sin comer → ventana de cetosis.
 * - ≥16 h → ventana de autofagia.
 * - Alimentos no KETO → posible pérdida de cetosis.
 */
export function computeNutritionStats(meals: MealEntry[]): NutritionStats {
  const empty: NutritionStats = {
    days: [],
    diasCetosis: 0,
    diasAutofagia: 0,
    eventosNoKeto: 0,
  };
  if (meals.length === 0) return empty;

  // Agrupar en comidas: items con <10 min de diferencia = mismo bloque
  const ordered = [...meals].sort(
    (a, b) => toDate(a.fechaHora).getTime() - toDate(b.fechaHora).getTime(),
  );
  const clusters: { time: number; iso: string; items: MealEntry[] }[] = [];
  for (const meal of ordered) {
    const t = toDate(meal.fechaHora).getTime();
    const last = clusters[clusters.length - 1];
    if (last && t - last.time < CLUSTER_MS) {
      last.items.push(meal);
    } else {
      clusters.push({ time: t, iso: meal.fechaHora, items: [meal] });
    }
  }

  // Por día local
  const byDay = new Map<string, { first: number; last: number; times: number[]; noKetoCount: number }>();
  for (const c of clusters) {
    const key = localDayKey(c.iso);
    const day = byDay.get(key) ?? { first: c.time, last: c.time, times: [], noKetoCount: 0 };
    day.times.push(c.time);
    if (c.time < day.first) day.first = c.time;
    if (c.time > day.last) day.last = c.time;
    day.noKetoCount += c.items.filter((it) => esNoKeto(it)).length;
    byDay.set(key, day);
  }

  const dates = Array.from(byDay.keys()).sort();
  const ayunoNocturno = new Map<string, number>();
  for (let i = 0; i < dates.length - 1; i++) {
    const nextFirst = byDay.get(dates[i + 1])!.first;
    const thisLast = byDay.get(dates[i])!.last;
    ayunoNocturno.set(dates[i], round1((nextFirst - thisLast) / HOUR_MS));
  }

  const recent = dates.slice(-14);
  const days: NutritionDayStats[] = recent.map((dateKey) => {
    const day = byDay.get(dateKey)!;
    const sorted = [...day.times].sort((a, b) => a - b);
    const primera = sorted[0];
    const ultima = sorted[sorted.length - 1];
    let intradayMax = 0;
    for (let i = 1; i < sorted.length; i++) {
      intradayMax = Math.max(intradayMax, (sorted[i] - sorted[i - 1]) / HOUR_MS);
    }
    const ayunoNocturnoH = ayunoNocturno.get(dateKey);
    const ayunoMaxH = round1(Math.max(intradayMax, ayunoNocturnoH ?? 0));
    return {
      date: dateKey,
      nComidas: day.times.length,
      primera: localHHMM(primera),
      ultima: localHHMM(ultima),
      ayunoNocturnoH,
      ayunoMaxH,
      noKeto: day.noKetoCount > 0,
      noKetoCount: day.noKetoCount,
    };
  });

  const conAyuno = days.filter((d) => d.ayunoNocturnoH != null);
  const ayunoNocturnoPromedioH = conAyuno.length
    ? round1(conAyuno.reduce((s, d) => s + (d.ayunoNocturnoH ?? 0), 0) / conAyuno.length)
    : undefined;
  const diasCetosis = days.filter((d) => d.ayunoMaxH != null && d.ayunoMaxH >= 12).length;
  const diasAutofagia = days.filter((d) => d.ayunoMaxH != null && d.ayunoMaxH >= 16).length;
  const eventosNoKeto = days.reduce((s, d) => s + d.noKetoCount, 0);

  let ayunoMasLargo: { horas: number; date: string } | undefined;
  for (const d of days) {
    if (d.ayunoMaxH != null && (!ayunoMasLargo || d.ayunoMaxH > ayunoMasLargo.horas)) {
      ayunoMasLargo = { horas: d.ayunoMaxH, date: d.date };
    }
  }

  return {
    days,
    ayunoNocturnoPromedioH,
    diasCetosis,
    diasAutofagia,
    eventosNoKeto,
    ayunoMasLargo,
  };
}

// ─── Serie general combinada (peso + cetosis + comidas + hidratación) ──

export interface GeneralDayPoint {
  date: string; // YYYY-MM-DD (día local)
  pesoKg?: number;
  ayunoMaxH?: number;
  noKeto?: boolean;
  nComidas?: number;
  ml?: number;
  pctHidro?: number; // 0-100 respecto al objetivo diario
}

/** Etiqueta breve de fecha (DD/MM) para texto */
function fmtShort(d: string): string {
  const [, m, day] = d.split("-");
  return `${day}/${m}`;
}

/**
 * Une, por día local, los datos de peso, comidas/cetosis e hidratación en un
 * solo rango ordenado (unión de días con algún registro). Cada día puede
 * tener solo algunas series. Se usa en la vista "General" combinada.
 */
export function buildGeneralSeries(
  weights: WeightEntry[],
  meals: MealEntry[],
  liquids: LiquidEntry[],
  objetivoMl?: number
): { days: GeneralDayPoint[]; startLabel: string; endLabel: string } {
  const byDate = new Map<string, GeneralDayPoint>();

  const touch = (d: string) => {
    if (!byDate.has(d)) byDate.set(d, { date: d });
    return byDate.get(d)!;
  };

  for (const w of weights) {
    const key = localDayKey(w.fechaHora);
    if (!key) continue;
    touch(key).pesoKg = w.pesoKg;
  }
  for (const m of meals) {
    const key = localDayKey(m.fechaHora);
    if (!key) continue;
    const pt = touch(key);
    pt.nComidas = (pt.nComidas ?? 0) + 1;
    if (esNoKeto(m)) pt.noKeto = true;
  }
  // Cálculo de ayuno máximo por día, reutilizando la heurística de cetosis.
  for (const n of computeNutritionStats(meals).days) {
    const pt = touch(n.date);
    pt.ayunoMaxH = n.ayunoMaxH;
    pt.noKeto = pt.noKeto || n.noKeto;
  }
  for (const l of liquids) {
    const key = localDayKey(l.fechaHora);
    if (!key) continue;
    const pt = touch(key);
    pt.ml = (pt.ml ?? 0) + l.cantidadMl;
  }

  for (const pt of Array.from(byDate.values())) {
    if (pt.ml != null) {
      pt.pctHidro = objetivoMl && objetivoMl > 0 ? Math.round((pt.ml / objetivoMl) * 100) : 0;
    }
  }

  const days = Array.from(byDate.values()).sort((a, b) => (a.date < b.date ? -1 : 1));
  // Limitar a los últimos ~40 días para no saturar
  const capped = days.length > 40 ? days.slice(-40) : days;

  return {
    days: capped,
    startLabel: fmtShort(capped[0]?.date ?? ""),
    endLabel: fmtShort(capped[capped.length - 1]?.date ?? ""),
  };
}