import { axiosInstanceLambda } from "@/interceptors/interceptors";
import { ChatMessage } from "@/model/keto.models";

/**
 * Contrato del servicio de chat grupal.
 * Endpoint esperado del backend: /chat/messages
 *
 * Normalización defensiva: el backend puede responder con el DTO del front
 * (id/autorUserId/fechaEnvio) o con el ítem crudo de DynamoDB
 * (messageId/userId/sentAt). Se normaliza para que la UI nunca reciba
 * `undefined` (evita "Invalid Date" y alineación incorrecta del chat).
 */

type RawChatMessage = Partial<ChatMessage> & {
  messageId?: string;
  userId?: string;
  sentAt?: string;
};

export const normalizeChatMessage = (m: RawChatMessage): ChatMessage => ({
  id: m.id ?? m.messageId ?? "",
  autorUserId: m.autorUserId ?? m.userId ?? "",
  autorNombre: m.autorNombre ?? "",
  autorFotoUrl: m.autorFotoUrl,
  texto: m.texto ?? "",
  fechaEnvio: m.fechaEnvio ?? m.sentAt ?? "",
});

export const listChatMessages = async (): Promise<ChatMessage[]> => {
  const response = await axiosInstanceLambda.get("/chat/messages");
  const data = Array.isArray(response.data)
    ? response.data.map((m: RawChatMessage) => normalizeChatMessage(m))
    : [];
  return data;
};

export const sendChatMessage = async (texto: string): Promise<ChatMessage> => {
  const response = await axiosInstanceLambda.post("/chat/messages", { texto });
  return normalizeChatMessage(response.data as RawChatMessage);
};