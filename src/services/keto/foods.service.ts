import { axiosInstanceLambda } from "@/interceptors/interceptors";
import { FoodItem } from "@/model/keto.models";

/** Listar catálogo de alimentos */
export const listFoods = async (): Promise<FoodItem[]> => {
  const response = await axiosInstanceLambda.get("/foods");
  return response.data;
};

/** Agregar alimento al catálogo (coach) */
export const createFood = async (
  food: Omit<FoodItem, "foodId">,
): Promise<FoodItem> => {
  const response = await axiosInstanceLambda.post("/foods", food);
  return response.data;
};

/** Eliminar alimento del catálogo (coach) */
export const deleteFood = async (foodId: string): Promise<void> => {
  await axiosInstanceLambda.delete(`/foods/${foodId}`);
};

/** Insertar catálogo inicial (coach) */
export const seedFoods = async (): Promise<{ inserted: number; updatedEmojis?: number }> => {
  const response = await axiosInstanceLambda.post("/foods/seed");
  return response.data;
};
