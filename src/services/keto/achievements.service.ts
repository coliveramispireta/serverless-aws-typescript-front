import { axiosInstanceLambda } from "@/interceptors/interceptors";
import { Achievement, Post } from "@/model/keto.models";

/**
 * Contrato del servicio de logros.
 * Endpoints del backend: /achievements (GET) y /achievements/share (POST).
 * Los logros automáticos los calcula el frontend (lib/engine/achievements)
 * y este servicio los sincroniza/persiste.
 */

export const listAchievements = async (): Promise<Achievement[]> => {
  const response = await axiosInstanceLambda.get("/achievements");
  return response.data;
};

export interface ShareAchievementPayload {
  codigo: string;
  titulo: string;
  descripcion?: string;
  emoji: string;
  texto: string;
}

/**
 * POST /achievements/share — marca el logro como compartido y crea la
 * publicación en el muro de la comunidad (feed del grupo).
 */
export const shareAchievement = async (
  payload: ShareAchievementPayload
): Promise<{ achievement: Achievement; post: Post }> => {
  const response = await axiosInstanceLambda.post("/achievements/share", payload);
  return response.data;
};