"use client";
import { useCallback, useEffect, useState } from "react";
import { listLiquids } from "@/services/keto/liquids.service";
import { listMeals } from "@/services/keto/meals.service";
import { listWeights } from "@/services/keto/weights.service";
import { LiquidEntry, MealEntry, WeightEntry } from "@/model/keto.models";

/**
 * Carga los registros de peso, alimentación y líquidos del usuario logueado.
 * Mientras el backend no exponga los endpoints, las pantallas muestran
 * estados vacíos / de error con opción de reintentar.
 */
export default function useUserData() {
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [liquids, setLiquids] = useState<LiquidEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [w, m, lq] = await Promise.all([listWeights(), listMeals(), listLiquids()]);
      setWeights(Array.isArray(w) ? w : []);
      setMeals(Array.isArray(m) ? m : []);
      setLiquids(Array.isArray(lq) ? lq : []);
    } catch (err) {
      console.error("useUserData:", err);
      setError(
        "No se pudo conectar con el servidor para traer tus registros. Inténtalo de nuevo."
      );
      setWeights([]);
      setMeals([]);
      setLiquids([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { weights, meals, liquids, loading, error, reload: load };
}
