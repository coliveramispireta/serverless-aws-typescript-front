import { axiosInstanceLambda } from "@/interceptors/interceptors";
import { Achievement } from "@/model/keto.models";

/**
 * Contrato del servicio de logros.
 * Endpoints esperados del backend: /achievements
 * Los logros automáticos los calcula el frontend (lib/engine/achievements)
 * y este servicio los sincroniza/persiste.
 */

export const listAchievements = async (): Promise<Achievement[]> => {
  const response = await axiosInstanceLambda.get("/achievements");
  return response.data;
};

export const shareAchievement = async (
  achievementId: string,
  texto?: string
): Promise<void> => {
  await axiosInstanceLambda.post(`/achievements/${achievementId}/share`, { texto });
};
