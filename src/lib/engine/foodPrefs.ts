"use client";

import { FoodItem } from "@/model/keto.models";

/**
 * Preferencias locales de alimentos: "recientes" y "favoritos".
 * Guardadas en localStorage por usuario para que al agregar comidas sea
 * más rápido volver a seleccionar los alimentos que más se usan.
 */

const RECENTS_KEY = "keto-food-recents";
const FAVS_KEY = "keto-food-favs";
const MAX_RECENTS = 8;

function read<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function write<T>(key: string, value: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export function getRecentFoodIds(): string[] {
  return read<{ foodId: string; nombre: string; at: number }>(RECENTS_KEY)
    .sort((a, b) => b.at - a.at)
    .slice(0, MAX_RECENTS)
    .map((r) => r.foodId);
}

export function markFoodUsed(food: FoodItem): void {
  const recents = read<{ foodId: string; nombre: string; at: number }>(RECENTS_KEY).filter(
    (r) => r.foodId !== food.foodId
  );
  recents.unshift({ foodId: food.foodId, nombre: food.nombre, at: Date.now() });
  write(RECENTS_KEY, recents.slice(0, MAX_RECENTS));

  // Si el alimento fue usado varias veces, lo sugiere como favorito automático
  const usage = recents.filter((r) => r.foodId === food.foodId).length;
  if (usage >= 3) addToFavorites(food);
}

export function getFavoriteFoodIds(): string[] {
  return read<{ foodId: string; nombre: string; at: number }>(FAVS_KEY)
    .sort((a, b) => b.at - a.at)
    .map((f) => f.foodId);
}

export function addToFavorites(food: FoodItem): void {
  const favs = read<{ foodId: string; nombre: string; at: number }>(FAVS_KEY).filter(
    (f) => f.foodId !== food.foodId
  );
  favs.unshift({ foodId: food.foodId, nombre: food.nombre, at: Date.now() });
  write(FAVS_KEY, favs);
}

export function removeFromFavorites(foodId: string): void {
  const favs = read<{ foodId: string; nombre: string; at: number }>(FAVS_KEY).filter(
    (f) => f.foodId !== foodId
  );
  write(FAVS_KEY, favs);
}

export function isFavorite(foodId: string): boolean {
  return getFavoriteFoodIds().includes(foodId);
}
