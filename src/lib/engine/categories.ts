import { FoodCategory } from "@/model/keto.models";

/**
 * Metadatos de cada categoría de alimento: etiqueta bonita + emoji.
 * Se usa en el diálogo de registro de comida (grilla visual) y, opcionalmente,
 * en la gestión del catálogo del coach.
 */
export const CAT_INFO: Record<FoodCategory, { label: string; emoji: string }> = {
  proteina: { label: "Proteínas", emoji: "🥩" },
  verdura: { label: "Verduras", emoji: "🥬" },
  grasa: { label: "Grasas", emoji: "🥑" },
  lacteo: { label: "Lácteos y huevos", emoji: "🧀" },
  fruto_seco: { label: "Frutos secos", emoji: "🥜" },
  semilla: { label: "Semillas", emoji: "🌱" },
  otro: { label: "Otros", emoji: "🍽️" },
  no_keto: { label: "No KETO", emoji: "⚠️" },
};

/** Emoji por defecto para alimentos sin emoji asignado */
export const FOOD_FALLBACK_EMOJI = "🍽️";

/** Orden en que se muestran las categorías (proteínas primero, no KETO al final) */
export const CATEGORY_ORDER: FoodCategory[] = [
  "proteina",
  "lacteo",
  "grasa",
  "verdura",
  "fruto_seco",
  "semilla",
  "otro",
  "no_keto",
];

export function catLabel(cat?: FoodCategory): string {
  return cat ? (CAT_INFO[cat]?.label ?? cat.replace(/_/g, " ")) : "";
}

export function catEmoji(cat?: FoodCategory): string {
  return cat ? (CAT_INFO[cat]?.emoji ?? "🍽️") : "🍽️";
}
