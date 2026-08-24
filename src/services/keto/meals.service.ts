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
