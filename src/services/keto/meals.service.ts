import { axiosInstanceLambda } from "@/interceptors/interceptors";
import { MealEntry } from "@/model/keto.models";

/**
 * Contrato del servicio de alimentación.
 * Endpoints esperados del backend: /meals
 */

export const listMeals = async (): Promise<MealEntry[]> => {
  const response = await axiosInstanceLambda.get("/meals");
  return response.data;
};

export const createMeal = async (
  meal: Omit<MealEntry, "id">
): Promise<MealEntry> => {
  const response = await axiosInstanceLambda.post("/meals", meal);
  return response.data;
};

export const deleteMeal = async (mealId: string): Promise<void> => {
  await axiosInstanceLambda.delete(`/meals/${mealId}`);
};

/** Registrar un bloque de comida completo (múltiples alimentos a la vez) */
export const createMealBlock = async (block: {
  fechaHora: string;
  comida?: string;
  nota?: string;
  alimentos: Array<{ foodId: string; cantidad: number }>;
}): Promise<{ imported: number }> => {
  const response = await axiosInstanceLambda.post("/meals/block", block);
  return response.data;
};

/** Importar comidas y líquidos retroactivos del usuario (ponerse al día, SIN pesos) */
export const importUserData = async (payload: {
  meals: Array<{
    fechaHora: string;
    alimento: string;
    gramos: number;
    comida?: string;
    nota?: string;
  }>;
  liquids: Array<{ fechaHora: string; cantidadMl: number; nota?: string }>;
}): Promise<{ imported: { meals: number; liquids: number } }> => {
  const response = await axiosInstanceLambda.post("/me/import", payload);
  return response.data;
};
