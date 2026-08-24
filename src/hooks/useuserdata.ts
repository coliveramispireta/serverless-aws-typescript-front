"use client";
import { useCallback, useEffect, useState } from "react";
import { listMeals } from "@/services/keto/meals.service";
import { listWeights } from "@/services/keto/weights.service";
import { MealEntry, WeightEntry } from "@/model/keto.models";

/**
 * Carga los registros de peso y alimentación del usuario logueado.
 * Mientras el backend no exponga los endpoints, las pantallas muestran
 * estados vacíos / de error con opción de reintentar.
 */
export default function useUserData() {
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [w, m] = await Promise.all([listWeights(), listMeals()]);
      setWeights(Array.isArray(w) ? w : []);
      setMeals(Array.isArray(m) ? m : []);
    } catch (err) {
      console.error("useUserData:", err);
      setError(
        "No se pudo conectar con el servidor para traer tus registros. Inténtalo de nuevo."
      );
      setWeights([]);
      setMeals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { weights, meals, loading, error, reload: load };
}
