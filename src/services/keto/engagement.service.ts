import { axiosInstanceLambda } from "@/interceptors/interceptors";
import { Recommendation, MotivationalMessage } from "@/model/keto.models";

/**
 * Contrato del servicio de recomendaciones y mensajes.
 * Endpoints esperados del backend: /recommendations y /messages
 * El backend (o el coach) decide el contenido; el frontend distingue
 * el origen con el campo `source`.
 */

export const listRecommendations = async (): Promise<Recommendation[]> => {
  const response = await axiosInstanceLambda.get("/recommendations");
  return response.data;
};

/** Publicar recomendación (coach) */
export const createRecommendation = async (
  texto: string,
  destinatarioUserId?: string
): Promise<Recommendation> => {
  const response = await axiosInstanceLambda.post("/recommendations", {
    texto,
    destinatarioUserId,
    source: "coach",
  });
  return response.data;
};

export const listMessages = async (): Promise<MotivationalMessage[]> => {
  const response = await axiosInstanceLambda.get("/messages");
  return response.data;
};

/** Enviar mensaje personalizado a un usuario (coach) */
export const sendMessageToUser = async (
  texto: string,
  destinatarioUserId: string
): Promise<MotivationalMessage> => {
  const response = await axiosInstanceLambda.post("/messages", {
    texto,
    destinatarioUserId,
    source: "coach",
  });
  return response.data;
};
