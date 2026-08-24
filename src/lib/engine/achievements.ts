import { MealEntry, WeightEntry, Achievement } from "@/model/keto.models";
import { computeMetrics, KetoMetrics } from "./metrics";

/**
 * Motor de logros automáticos.
 * Evalúa reglas sobre los datos del usuario y devuelve los logros obtenidos.
 * El frontend puede fusionar el resultado con los logros ya persistidos
 * (source: "coach" incluidos) sin duplicarlos por `codigo`.
 */

interface AchievementRule {
  codigo: string;
  titulo: string;
  descripcion: string;
  emoji: string;
  cond: (metrics: KetoMetrics, weights: WeightEntry[], meals: MealEntry[]) => boolean;
}

export const ACHIEVEMENT_RULES: AchievementRule[] = [
  {
    codigo: "primer-registro",
    titulo: "Primer paso",
    descripcion: "Registraste tu primer dato. ¡El viaje comienza!",
    emoji: "🌱",
    cond: (m) => m.hasData,
  },
  {
    codigo: "tres-registros-peso",
    titulo: "Constante en la báscula",
    descripcion: "3 registros de peso realizados.",
    emoji: "⚖️",
    cond: (m) => m.registrosPeso >= 3,
  },
  {
    codigo: "primera-evidencia",
    titulo: "Evidencia fotográfica",
    descripcion: "Subiste tu primera foto de evidencia.",
    emoji: "📸",
    cond: (m) => m.tieneEvidencias,
  },
  {
    codigo: "menos-1-kg",
    titulo: "−1 kg",
    descripcion: "Perdiste tu primer kilo. ¡Sigue así!",
    emoji: "🎯",
    cond: (m) => (m.perdidaTotalKg ?? 0) >= 1,
  },
  {
    codigo: "menos-2-kg",
    titulo: "−2 kg",
    descripcion: "Dos kilos menos. El keto funciona contigo.",
    emoji: "🔥",
    cond: (m) => (m.perdidaTotalKg ?? 0) >= 2,
  },
  {
    codigo: "menos-5-kg",
    titulo: "−5 kg",
    descripcion: "¡Cinco kilos! Un cambio enorme.",
    emoji: "🏅",
    cond: (m) => (m.perdidaTotalKg ?? 0) >= 5,
  },
  {
    codigo: "racha-7-dias",
    titulo: "Racha de 7 días",
    descripcion: "Una semana completa registrando tus comidas o peso.",
    emoji: "📅",
    cond: (m) => m.rachaDias >= 7,
  },
  {
    codigo: "racha-30-dias",
    titulo: "Racha de 30 días",
    descripcion: "¡Un mes entero de constancia!",
    emoji: "🏆",
    cond: (m) => m.rachaDias >= 30,
  },
  {
    codigo: "meta-alcanzada",
    titulo: "Meta alcanzada",
    descripcion: "Llegaste a tu peso objetivo. ¡Increíble!",
    emoji: "🎉",
    cond: (m) =>
      m.pesoObjetivo != null &&
      m.pesoActual != null &&
      m.pesoActual <= m.pesoObjetivo,
  },
];

/**
 * Devuelve los logros automáticos cumplidos según los datos actuales.
 * `existingCodes` permite excluir logros ya otorgados.
 */
export function evaluateAchievements(
  weights: WeightEntry[],
  meals: MealEntry[],
  options?: { alturaCm?: number; pesoObjetivoKg?: number; existingCodes?: string[] }
): Achievement[] {
  const metrics = computeMetrics(weights, meals, options);
  const existing = new Set(options?.existingCodes ?? []);
  const now = new Date().toISOString();

  const earned: Achievement[] = [];
  for (const rule of ACHIEVEMENT_RULES) {
    if (existing.has(rule.codigo)) continue;
    if (rule.cond(metrics, weights, meals)) {
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
