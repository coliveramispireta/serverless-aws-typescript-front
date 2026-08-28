import { axiosInstanceLambda } from "@/interceptors/interceptors";
import { UserProfile, WeightEntry, MealEntry, Achievement, Post, LiquidEntry } from "@/model/keto.models";

/**
 * Contrato de los servicios exclusivos del Coach.
 * Endpoints esperados del backend: /coach/*
 */

export interface CoachUserSummary extends UserProfile {
  pesoInicialKg?: number;
  pesoActualKg?: number;
  perdidaTotalKg?: number;
  ultimoRegistro?: string;
  diasSinRegistrar?: number;
}

export interface UserProgress {
  usuario: UserProfile;
  pesos: WeightEntry[];
  comidas: MealEntry[];
  liquidos: LiquidEntry[];
  logros: Achievement[];
  publicaciones: Post[];
}

/** Lista resumida de usuarios del grupo */
export const listCoachUsers = async (): Promise<CoachUserSummary[]> => {
  const response = await axiosInstanceLambda.get("/coach/users");
  return response.data;
};

/** Progreso completo de un usuario para revisión del coach */
export const getUserProgress = async (userId: string): Promise<UserProgress> => {
  const response = await axiosInstanceLambda.get(`/coach/users/${userId}/progress`);
  return response.data;
};

/** Deshabilitar/Habilitar un usuario */
export const toggleUserDisabled = async (
  userId: string,
  disabled: boolean,
): Promise<{ userId: string; disabled: boolean }> => {
  const response = await axiosInstanceLambda.patch(`/coach/users/${userId}/disabled`, { disabled });
  return response.data;
};

/** Eliminar un usuario (acción irreversible) */
export const deleteUser = async (
  userId: string,
): Promise<{ userId: string; deleted: boolean }> => {
  const response = await axiosInstanceLambda.delete(`/coach/users/${userId}`);
  return response.data;
};

/** Importar datos retroactivos (pesos + comidas + líquidos) en batch */
export const bulkImportData = async (
  userId: string,
  weights: Array<{ fechaHora: string; pesoKg: number; nota?: string }>,
  meals: Array<{ fechaHora: string; alimento: string; gramos: number; comida?: string; nota?: string }>,
  liquids: Array<{ fechaHora: string; cantidadMl: number; nota?: string }> = [],
): Promise<{ imported: { weights: number; meals: number; liquids: number } }> => {
  const response = await axiosInstanceLambda.post("/coach/bulk-import", {
    userId,
    weights,
    meals,
    liquids,
  });
  return response.data;
};
