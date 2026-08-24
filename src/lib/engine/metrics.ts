import { MealEntry, WeightEntry } from "@/model/keto.models";

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

function toDate(iso: string): Date {
  return new Date(iso);
}

/** Normaliza una fecha a medianoche para comparar por día */
function dayKey(date: Date): number {
  return Math.floor(date.getTime() / DAY_MS);
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

  // IMC si conocemos la altura
  if (options?.alturaCm && options.alturaCm > 0) {
    const alturaM = options.alturaCm / 100;
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
