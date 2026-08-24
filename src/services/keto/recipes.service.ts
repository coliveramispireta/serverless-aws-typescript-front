import { axiosInstanceLambda } from "@/interceptors/interceptors";
import { Recipe } from "@/model/keto.models";

/**
 * Contrato del servicio de recetas keto.
 * Endpoints esperados del backend: /recipes
 */

export const listRecipes = async (): Promise<Recipe[]> => {
  const response = await axiosInstanceLambda.get("/recipes");
  return response.data;
};

export const getRecipe = async (recipeId: string): Promise<Recipe> => {
  const response = await axiosInstanceLambda.get(`/recipes/${recipeId}`);
  return response.data;
};

/** Crear receta (coach) */
export const createRecipe = async (
  recipe: Omit<Recipe, "id">
): Promise<Recipe> => {
  const response = await axiosInstanceLambda.post("/recipes", recipe);
  return response.data;
};

/** Actualizar receta (coach) */
export const updateRecipe = async (recipe: Recipe): Promise<Recipe> => {
  const response = await axiosInstanceLambda.put(`/recipes/${recipe.id}`, recipe);
  return response.data;
};

/** Eliminar receta (coach) */
export const deleteRecipe = async (recipeId: string): Promise<void> => {
  await axiosInstanceLambda.delete(`/recipes/${recipeId}`);
};
