import { FoodUnit } from "@/model/keto.models";

/**
 * Raciones por defecto y pasos de ajuste (+/−) al registrar alimentos.
 * La idea es que el usuario NO tenga que teclear cantidades: cada alimento se
 * agrega con una ración típica y se ajusta con botones +/−.
 */

interface ServingSpec {
  /** Ración inicial al agregar el alimento */
  default: number;
  /** Paso de cada toque de + o − */
  step: number;
  min: number;
  max: number;
}

const SERVINGS: Record<FoodUnit, ServingSpec> = {
  g: { default: 100, step: 10, min: 10, max: 1000 },
  und: { default: 1, step: 1, min: 1, max: 10 },
  ml: { default: 100, step: 10, min: 10, max: 1000 },
};

export function defaultServing(unidad: FoodUnit): number {
  const s = SERVINGS[unidad] ?? SERVINGS.g;
  return s.default;
}

/** Pasos de ajuste +/− para una unidad */
export function stepFor(unidad: FoodUnit): number {
  return (SERVINGS[unidad] ?? SERVINGS.g).step;
}

export function servingMin(unidad: FoodUnit): number {
  return (SERVINGS[unidad] ?? SERVINGS.g).min;
}

export function servingMax(unidad: FoodUnit): number {
  return (SERVINGS[unidad] ?? SERVINGS.g).max;
}

/** Suma un paso a la cantidad, respetando mín/máx y redondeando bien el step. */
export function adjustCantidad(unidad: FoodUnit, cantidad: number, delta: number): number {
  const spec = SERVINGS[unidad] ?? SERVINGS.g;
  let next = Math.round(cantidad / spec.step) * spec.step + delta;
  if (Number.isNaN(next)) next = spec.default;
  next = Math.min(spec.max, Math.max(spec.min, next));
  // para "und" siempre entero
  if (unidad === "und") next = Math.round(next);
  return next;
}
