import { MealEntry, WeightEntry, LiquidEntry, Achievement } from "@/model/keto.models";
import {
  computeMetrics,
  KetoMetrics,
  NutritionStats,
  HydrationDayStats,
} from "./metrics";

/**
 * Motor de logros automáticos.
 * Evalúa reglas sobre los datos del usuario y devuelve los logros obtenidos.
 * El frontend puede fusionar el resultado con los logros ya persistidos
 * (source: "coach" incluidos) sin duplicarlos por `codigo`.
 *
 * Cada regla puede exponer:
 * - `tipo`: agrupa los logros por tema para filtrar en la UI.
 * - `explicacion`: contexto de "por qué importa / cómo lograrlo".
 * - `progreso`: barra "X de Y" (muestra motivación aunque el logro esté bloqueado).
 */

export type AchievementType =
  | "peso"
  | "hidratacion"
  | "alimentacion"
  | "consistencia"
  | "general";

export interface AchievementContext {
  metrics: KetoMetrics;
  weights: WeightEntry[];
  meals: MealEntry[];
  liquids: LiquidEntry[];
  nutrition?: NutritionStats;
  hydration?: { objetivoMl?: number; days: HydrationDayStats[]; cumplimiento7d?: number };
}

export interface AchievementRule {
  codigo: string;
  titulo: string;
  descripcion: string;
  emoji: string;
  tipo: AchievementType;
  explicacion: string;
  cond: (ctx: AchievementContext) => boolean;
  progreso?: (ctx: AchievementContext) => { actual: number; meta: number } | null;
}

// ─── Helpers de contexto ───────────────────────────────────────

/** Días con ayuno nocturno/máximo ≥ N horas (conteo de cetosis/autofagia) */
function countDaysWithFast(nutrition: NutritionStats | undefined, hours: number): number {
  if (!nutrition) return 0;
  return nutrition.days.filter((d) => (d.ayunoMaxH ?? 0) >= hours).length;
}

/** Días consecutivos (hacia el pasado) cumpliendo la condición */
function consecutiveDays(
  days: { ayunoMaxH?: number; noKeto?: boolean }[] | undefined,
  pred: (d: { ayunoMaxH?: number; noKeto?: boolean }) => boolean,
): number {
  if (!days || days.length === 0) return 0;
  let count = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (pred(days[i])) count++;
    else break;
  }
  return count;
}

/** Días (de los disponibles, últimos 14) con cumplimiento de agua ≥ 80% */
function hydratedDays(hydration: AchievementContext["hydration"]): number {
  if (!hydration) return 0;
  return hydration.days.filter((d) => d.pct >= 80).length;
}

/** Días consecutivos cumpliendo el objetivo de agua */
function consecutiveHydratedDays(hydration: AchievementContext["hydration"]): number {
  if (!hydration) return 0;
  return consecutiveDays(
    hydration.days.map((d) => ({ ayunoMaxH: undefined, noKeto: d.pct < 80 })),
    (d) => d.noKeto === false,
  );
}

// ─── Reglas ────────────────────────────────────────────────────

export const ACHIEVEMENT_RULES: AchievementRule[] = [
  // ── Generales / primeros pasos ──
  {
    codigo: "primer-registro",
    titulo: "Primer paso",
    descripcion: "Registraste tu primer dato. ¡El viaje comienza!",
    emoji: "🌱",
    tipo: "general",
    explicacion:
      "Cada gran transformación empieza con un primer registro. El hábito se construye aquí.",
    cond: (ctx) => ctx.metrics.hasData,
  },

  // ── Registros de peso (escalones más cercanos) ──
  {
    codigo: "tres-registros-peso",
    titulo: "Constante en la báscula",
    descripcion: "3 registros de peso realizados.",
    emoji: "⚖️",
    tipo: "peso",
    explicacion: "Pesarte varias veces te da una tendencia real y te quita el peso del día a día.",
    cond: (ctx) => ctx.metrics.registrosPeso >= 3,
    progreso: (ctx) => ({ actual: ctx.metrics.registrosPeso, meta: 3 }),
  },
  {
    codigo: "cinco-registros-peso",
    titulo: "Báscula frecuente",
    descripcion: "5 registros de peso realizados.",
    emoji: "🧑‍⚖️",
    tipo: "peso",
    explicacion: "Cinco mediciones ya permiten ver tu curva de progreso claramente.",
    cond: (ctx) => ctx.metrics.registrosPeso >= 5,
    progreso: (ctx) => ({ actual: ctx.metrics.registrosPeso, meta: 5 }),
  },
  {
    codigo: "diez-registros-peso",
    titulo: "Báscula pro",
    descripcion: "10 registros de peso realizados.",
    emoji: "🎚️",
    tipo: "peso",
    explicacion: "Diez mediciones = una tendencia fiable para confirmar que el método funciona.",
    cond: (ctx) => ctx.metrics.registrosPeso >= 10,
    progreso: (ctx) => ({ actual: ctx.metrics.registrosPeso, meta: 10 }),
  },

  // ── Pérdida de peso (escalones) ──
  {
    codigo: "menos-050-kg",
    titulo: "−0.5 kg",
    descripcion: "Medio kilo menos. ¡Primer logro de peso!",
    emoji: "🌿",
    tipo: "peso",
    explicacion: "Medio kilo ya es un avance real. La pérdida sana es gradual y constante.",
    cond: (ctx) => (ctx.metrics.perdidaTotalKg ?? 0) >= 0.5,
    progreso: (ctx) => ({ actual: Math.round((ctx.metrics.perdidaTotalKg ?? 0) * 10) / 10, meta: 0.5 }),
  },
  {
    codigo: "menos-1-kg",
    titulo: "−1 kg",
    descripcion: "Perdiste tu primer kilo. ¡Sigue así!",
    emoji: "🎯",
    tipo: "peso",
    explicacion: "El primer kilo perdido es un hito: demuestra que el cuerpo está respondiendo.",
    cond: (ctx) => (ctx.metrics.perdidaTotalKg ?? 0) >= 1,
    progreso: (ctx) => ({ actual: ctx.metrics.perdidaTotalKg ?? 0, meta: 1 }),
  },
  {
    codigo: "menos-2-kg",
    titulo: "−2 kg",
    descripcion: "Dos kilos menos. El keto funciona contigo.",
    emoji: "🔥",
    tipo: "peso",
    explicacion: "Dos kilos ya se notan en ropa y energía. Sigue con el plan.",
    cond: (ctx) => (ctx.metrics.perdidaTotalKg ?? 0) >= 2,
    progreso: (ctx) => ({ actual: ctx.metrics.perdidaTotalKg ?? 0, meta: 2 }),
  },
  {
    codigo: "menos-3-kg",
    titulo: "−3 kg",
    descripcion: "Tres kilos menos. ¡Vas muy bien!",
    emoji: "💪",
    tipo: "peso",
    explicacion: "Tres kilos suelen ir acompañados de mejoras notables en composición corporal.",
    cond: (ctx) => (ctx.metrics.perdidaTotalKg ?? 0) >= 3,
    progreso: (ctx) => ({ actual: ctx.metrics.perdidaTotalKg ?? 0, meta: 3 }),
  },
  {
    codigo: "menos-5-kg",
    titulo: "−5 kg",
    descripcion: "¡Cinco kilos! Un cambio enorme.",
    emoji: "🏅",
    tipo: "peso",
    explicacion: "Cinco kilos es un logro mayor. Cuidado con los tropiezos: ¡el objetivo importa!",
    cond: (ctx) => (ctx.metrics.perdidaTotalKg ?? 0) >= 5,
    progreso: (ctx) => ({ actual: ctx.metrics.perdidaTotalKg ?? 0, meta: 5 }),
  },
  {
    codigo: "menos-7-kg",
    titulo: "−7 kg",
    descripcion: "Siete kilos menos. Transformación visible.",
    emoji: "🌟",
    tipo: "peso",
    explicacion: "A los siete kilos el cambio ya es evidente en fotos y medidas.",
    cond: (ctx) => (ctx.metrics.perdidaTotalKg ?? 0) >= 7,
    progreso: (ctx) => ({ actual: ctx.metrics.perdidaTotalKg ?? 0, meta: 7 }),
  },
  {
    codigo: "menos-10-kg",
    titulo: "−10 kg",
    descripcion: "¡Diez kilos! Un logro espectacular.",
    emoji: "🚀",
    tipo: "peso",
    explicacion: "Diez kilos es un cambio de vida. Celebra este hito enorme.",
    cond: (ctx) => (ctx.metrics.perdidaTotalKg ?? 0) >= 10,
    progreso: (ctx) => ({ actual: ctx.metrics.perdidaTotalKg ?? 0, meta: 10 }),
  },
  {
    codigo: "ritmo-semanal",
    titulo: "Ritmo constante",
    descripcion: "Perdiste al menos 0.5 kg en la última semana.",
    emoji: "📈",
    tipo: "peso",
    explicacion: "Un ritmo semanal sano está entre 0.5 y 1 kg. Vas en la dirección correcta.",
    cond: (ctx) => (ctx.metrics.cambioUltimos7DiasKg ?? 0) <= -0.5,
  },

  // ── Racha (escalones más cercanos) ──
  {
    codigo: "racha-3-dias",
    titulo: "Racha de 3 días",
    descripcion: "3 días seguidos registrando tu progreso.",
    emoji: "🗓️",
    tipo: "consistencia",
    explicacion: "Los primeros 3 días crean el impulso inicial del hábito.",
    cond: (ctx) => ctx.metrics.rachaDias >= 3,
    progreso: (ctx) => ({ actual: ctx.metrics.rachaDias, meta: 3 }),
  },
  {
    codigo: "racha-7-dias",
    titulo: "Racha de 7 días",
    descripcion: "Una semana completa registrando tus comidas o peso.",
    emoji: "📅",
    tipo: "consistencia",
    explicacion: "Una semana de constancia ya apunta a convertir el keto en hábito.",
    cond: (ctx) => ctx.metrics.rachaDias >= 7,
    progreso: (ctx) => ({ actual: ctx.metrics.rachaDias, meta: 7 }),
  },
  {
    codigo: "racha-14-dias",
    titulo: "Racha de 14 días",
    descripcion: "Dos semanas registrando seguido. ¡Imparable!",
    emoji: "📆",
    tipo: "consistencia",
    explicacion: "Dos semanas: tu constancia ya está generando datos valiosos.",
    cond: (ctx) => ctx.metrics.rachaDias >= 14,
    progreso: (ctx) => ({ actual: ctx.metrics.rachaDias, meta: 14 }),
  },
  {
    codigo: "racha-30-dias",
    titulo: "Racha de 30 días",
    descripcion: "¡Un mes entero de constancia!",
    emoji: "🏆",
    tipo: "consistencia",
    explicacion: "Un mes seguido registrando es el sello de un nuevo estilo de vida.",
    cond: (ctx) => ctx.metrics.rachaDias >= 30,
    progreso: (ctx) => ({ actual: ctx.metrics.rachaDias, meta: 30 }),
  },
  {
    codigo: "racha-60-dias",
    titulo: "Racha de 60 días",
    descripcion: "¡Dos meses de pura constancia!",
    emoji: "💎",
    tipo: "consistencia",
    explicacion: "Dos meses: el keto ya es parte de tu día a día.",
    cond: (ctx) => ctx.metrics.rachaDias >= 60,
    progreso: (ctx) => ({ actual: ctx.metrics.rachaDias, meta: 60 }),
  },
  {
    codigo: "racha-90-dias",
    titulo: "Racha de 90 días",
    descripcion: "¡Tres meses de constancia total!",
    emoji: "👑",
    tipo: "consistencia",
    explicacion: "Tres meses seguidos registrando: un logro de élite.",
    cond: (ctx) => ctx.metrics.rachaDias >= 90,
    progreso: (ctx) => ({ actual: ctx.metrics.rachaDias, meta: 90 }),
  },

  // ── Comidas (registros) ──
  {
    codigo: "primera-comida",
    titulo: "Primera comida",
    descripcion: "Registraste tu primer alimento.",
    emoji: "🍽️",
    tipo: "alimentacion",
    explicacion: "Registrar lo que comes es el pilar para entender tu cetosis.",
    cond: (ctx) => ctx.meals.length >= 1,
    progreso: (ctx) => ({ actual: ctx.meals.length, meta: 1 }),
  },
  {
    codigo: "diez-comidas",
    titulo: "10 comidas registradas",
    descripcion: "Registraste 10 alimentos o comidas.",
    emoji: "🥗",
    tipo: "alimentacion",
    explicacion: "Diez registros ya permiten analizar tus ayunos y patrones.",
    cond: (ctx) => ctx.meals.length >= 10,
    progreso: (ctx) => ({ actual: ctx.meals.length, meta: 10 }),
  },
  {
    codigo: "cincuenta-comidas",
    titulo: "50 comidas registradas",
    descripcion: "Registraste 50 alimentos o comidas.",
    emoji: "🥘",
    tipo: "alimentacion",
    explicacion: "Cincuenta registros te dan una visión completa de tu alimentación.",
    cond: (ctx) => ctx.meals.length >= 50,
    progreso: (ctx) => ({ actual: ctx.meals.length, meta: 50 }),
  },
  {
    codigo: "cien-comidas",
    titulo: "100 comidas registradas",
    descripcion: "Registraste 100 alimentos o comidas. Nivel maestro.",
    emoji: "🍲",
    tipo: "alimentacion",
    explicacion: "Cien registros: un control alimenticio de alto nivel.",
    cond: (ctx) => ctx.meals.length >= 100,
    progreso: (ctx) => ({ actual: ctx.meals.length, meta: 100 }),
  },

  // ── Cetosis / autofagia ──
  {
    codigo: "primera-cetosis",
    titulo: "¡Entraste en cetosis!",
    descripcion: "Alcanzaste un ayuno de 12 h, señal de cetosis.",
    emoji: "🔥",
    tipo: "alimentacion",
    explicacion: "Entre 12 y 16 h sin comer tu cuerpo quema grasa como combustible (cetosis).",
    cond: (ctx) => countDaysWithFast(ctx.nutrition, 12) >= 1,
    progreso: (ctx) => ({
      actual: countDaysWithFast(ctx.nutrition, 12),
      meta: 1,
    }),
  },
  {
    codigo: "cetosis-3-dias",
    titulo: "3 días en cetosis",
    descripcion: "3 días con ayuno de al menos 12 h.",
    emoji: "⚡",
    tipo: "alimentacion",
    explicacion: "Tres días de cetosis: tu cuerpo ya está adaptado a quemar grasa.",
    cond: (ctx) => countDaysWithFast(ctx.nutrition, 12) >= 3,
    progreso: (ctx) => ({
      actual: countDaysWithFast(ctx.nutrition, 12),
      meta: 3,
    }),
  },
  {
    codigo: "cetosis-7-dias",
    titulo: "Una semana en cetosis",
    descripcion: "7 días con ayunos de cetosis en tu historial.",
    emoji: "🌋",
    tipo: "alimentacion",
    explicacion: "Una semana acumulada de cetosis es un gran avance metabólico.",
    cond: (ctx) => countDaysWithFast(ctx.nutrition, 12) >= 7,
    progreso: (ctx) => ({
      actual: countDaysWithFast(ctx.nutrition, 12),
      meta: 7,
    }),
  },
  {
    codigo: "primera-autofagia",
    titulo: "¡Primera autofagia!",
    descripcion: "Alcanzaste un ayuno de 16 h, tu cuerpo entró en autofagia.",
    emoji: "🌀",
    tipo: "alimentacion",
    explicacion: "A partir de ~16 h tu cuerpo recicla células dañadas (autofagia).",
    cond: (ctx) => countDaysWithFast(ctx.nutrition, 16) >= 1,
    progreso: (ctx) => ({
      actual: countDaysWithFast(ctx.nutrition, 16),
      meta: 1,
    }),
  },
  {
    codigo: "autofagia-5-veces",
    titulo: "Autofagia 5 veces",
    descripcion: "5 días alcanzando ayunos de 16 h o más.",
    emoji: "🧬",
    tipo: "alimentacion",
    explicacion: "Cinco sesiones de autofagia: aprovechaste la reparación celular varias veces.",
    cond: (ctx) => countDaysWithFast(ctx.nutrition, 16) >= 5,
    progreso: (ctx) => ({
      actual: countDaysWithFast(ctx.nutrition, 16),
      meta: 5,
    }),
  },
  {
    codigo: "semana-sin-no-keto",
    titulo: "7 días en cetosis perfecta",
    descripcion: "7 días seguidos sin comer alimentos no keto (sin salir de cetosis).",
    emoji: "🛡️",
    tipo: "alimentacion",
    explicacion:
      "Una semana sin alimentos que rompen la cetosis: control alimenticio excelente.",
    cond: (ctx) => {
      if (!ctx.nutrition) return false;
      return (
        consecutiveDays(ctx.nutrition.days, (d) => d.noKeto === false) >= 7
      );
    },
    progreso: (ctx) => {
      if (!ctx.nutrition) return null;
      const c = consecutiveDays(ctx.nutrition.days, (d) => d.noKeto === false);
      return { actual: c, meta: 7 };
    },
  },

  // ── Hidratación ──
  {
    codigo: "primer-litro-agua",
    titulo: "Primer litro de agua",
    descripcion: "Registraste 1 litro (1000 ml) de agua en total.",
    emoji: "💧",
    tipo: "hidratacion",
    explicacion: "El agua es clave en keto: ayuda a evitar la 'gripe keto' y a la energía.",
    cond: (ctx) => ctx.liquids.reduce((s, l) => s + l.cantidadMl, 0) >= 1000,
    progreso: (ctx) => ({
      actual: ctx.liquids.reduce((s, l) => s + l.cantidadMl, 0),
      meta: 1000,
    }),
  },
  {
    codigo: "agua-objetivo-dia",
    titulo: "Meta de agua cumplida",
    descripcion: "Alcanzaste tu objetivo diario de agua en al menos un día.",
    emoji: "🥤",
    tipo: "hidratacion",
    explicacion: "Cumplir tu objetivo de agua (según peso y altura) mejora hidratación y saciedad.",
    cond: (ctx) => hydratedDays(ctx.hydration) >= 1,
    progreso: (ctx) => ({ actual: hydratedDays(ctx.hydration), meta: 1 }),
  },
  {
    codigo: "hidratado-3-dias",
    titulo: "Hidratado 3 días",
    descripcion: "3 días cumpliendo tu meta de agua.",
    emoji: "🚰",
    tipo: "hidratacion",
    explicacion: "Tres días bien hidratado: constancia que se nota en energía.",
    cond: (ctx) => hydratedDays(ctx.hydration) >= 3,
    progreso: (ctx) => ({ actual: hydratedDays(ctx.hydration), meta: 3 }),
  },
  {
    codigo: "hidratado-7-dias",
    titulo: "Hidratado 7 días",
    descripcion: "7 días cumpliendo tu meta de agua.",
    emoji: "🌊",
    tipo: "hidratacion",
    explicacion: "Una semana completa bien hidratado: excelente hábito.",
    cond: (ctx) => hydratedDays(ctx.hydration) >= 7,
    progreso: (ctx) => ({ actual: hydratedDays(ctx.hydration), meta: 7 }),
  },
  {
    codigo: "hidratado-consecutivo",
    titulo: "Racha de hidratación",
    descripcion: "2 días seguidos cumpliendo tu meta de agua.",
    emoji: "💦",
    tipo: "hidratacion",
    explicacion: "Encadenar días de buena hidratación refuerza el hábito.",
    cond: (ctx) => consecutiveHydratedDays(ctx.hydration) >= 2,
    progreso: (ctx) => ({
      actual: consecutiveHydratedDays(ctx.hydration),
      meta: 2,
    }),
  },

  // ── Evidencia ──
  {
    codigo: "primera-evidencia",
    titulo: "Evidencia fotográfica",
    descripcion: "Subiste tu primera foto de evidencia.",
    emoji: "📸",
    tipo: "consistencia",
    explicacion: "Las fotos de progreso son una herramienta súper motivadora.",
    cond: (ctx) => ctx.metrics.tieneEvidencias,
  },

  // ── Meta ──
  {
    codigo: "meta-alcanzada",
    titulo: "Meta alcanzada",
    descripcion: "Llegaste a tu peso objetivo. ¡Increíble!",
    emoji: "🎉",
    tipo: "peso",
    explicacion:
      "Alcanzaste tu peso objetivo. Este es el logro máximo de tu viaje. ¡Felicidades!",
    cond: (ctx) =>
      ctx.metrics.pesoObjetivo != null &&
      ctx.metrics.pesoActual != null &&
      ctx.metrics.pesoActual <= ctx.metrics.pesoObjetivo,
  },
];

/**
 * Devuelve los logros automáticos cumplidos según los datos actuales.
 * `existingCodes` permite excluir logros ya otorgados.
 *
 * `options` ampliado: además de `alturaCm`/`pesoObjetivoKg`/`existingCodes`,
 * acepta `liquids`, `nutrition` y `hydration` (stats ya calculadas) para
 * evaluar reglas de hidratación y cetosis.
 */
export function evaluateAchievements(
  weights: WeightEntry[],
  meals: MealEntry[],
  options?: {
    alturaCm?: number;
    pesoObjetivoKg?: number;
    existingCodes?: string[];
    liquids?: LiquidEntry[];
    nutrition?: NutritionStats;
    hydration?: AchievementContext["hydration"];
  }
): Achievement[] {
  const metrics = computeMetrics(weights, meals, {
    alturaCm: options?.alturaCm,
    pesoObjetivoKg: options?.pesoObjetivoKg,
  });
  const existing = new Set(options?.existingCodes ?? []);
  const now = new Date().toISOString();

  const ctx: AchievementContext = {
    metrics,
    weights,
    meals,
    liquids: options?.liquids ?? [],
    nutrition: options?.nutrition,
    hydration: options?.hydration,
  };

  const earned: Achievement[] = [];
  for (const rule of ACHIEVEMENT_RULES) {
    if (existing.has(rule.codigo)) continue;
    if (rule.cond(ctx)) {
      earned.push({
        id: `auto-${rule.codigo}`,
        codigo: rule.codigo,
        titulo: rule.titulo,
        descripcion: rule.descripcion,
        emoji: rule.emoji,
        source: "auto",
        fechaObtenido: now,
      });
    }
  }
  return earned;
}
