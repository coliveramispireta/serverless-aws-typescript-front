import { axiosInstanceLambda } from "@/interceptors/interceptors";
import { ChatMessage } from "@/model/keto.models";

/**
 * Contrato del servicio de chat grupal.
 * Endpoint esperado del backend: /chat/messages
 */

export const listChatMessages = async (): Promise<ChatMessage[]> => {
  const response = await axiosInstanceLambda.get("/chat/messages");
  return response.data;
};

export const sendChatMessage = async (texto: string): Promise<ChatMessage> => {
  const response = await axiosInstanceLambda.post("/chat/messages", { texto });
  return response.data;
};
