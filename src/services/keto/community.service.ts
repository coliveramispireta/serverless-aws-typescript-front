import { axiosInstanceLambda } from "@/interceptors/interceptors";
import { Post, Comment } from "@/model/keto.models";

/**
 * Contrato del servicio de comunidad (feed grupal + comentarios).
 * Endpoints del backend: /posts y /posts/{postId}/comments
 *
 * Normalización defensiva: el backend puede responder con el DTO del front
 * (id/fechaCreacion/autorUserId) o con el ítem crudo de DynamoDB
 * (postId/createdAt/userId). Aquí se normaliza a un único shape para que la
 * UI nunca reciba `undefined` y evite "Invalid Date"/filtros vacíos.
 */

type RawPost = Partial<Post> & {
  postId?: string;
  userId?: string;
  createdAt?: string;
};

type RawComment = Partial<Comment> & {
  commentId?: string;
  userId?: string;
  createdAt?: string;
};

export const normalizePost = (p: RawPost): Post => ({
  id: p.id ?? p.postId ?? "",
  autorUserId: p.autorUserId ?? p.userId ?? "",
  autorNombre: p.autorNombre ?? "",
  autorFotoUrl: p.autorFotoUrl,
  texto: p.texto ?? "",
  imagenUrl: p.imagenUrl,
  imagenKey: p.imagenKey,
  logroId: p.logroId,
  fechaCreacion: p.fechaCreacion ?? p.createdAt ?? "",
  comentariosCount: p.comentariosCount,
});

export const normalizeComment = (c: RawComment): Comment => ({
  id: c.id ?? c.commentId ?? "",
  postId: c.postId ?? "",
  autorUserId: c.autorUserId ?? c.userId ?? "",
  autorNombre: c.autorNombre ?? "",
  autorFotoUrl: c.autorFotoUrl,
  texto: c.texto ?? "",
  fechaCreacion: c.fechaCreacion ?? c.createdAt ?? "",
});

export const listPosts = async (): Promise<Post[]> => {
  const response = await axiosInstanceLambda.get("/posts");
  const data = Array.isArray(response.data)
    ? response.data.map((p: RawPost) => normalizePost(p))
    : [];
  return data;
};

export const createPost = async (data: {
  texto: string;
  imagenUrl?: string;
  imagenKey?: string;
  logroId?: string;
}): Promise<Post> => {
  const response = await axiosInstanceLambda.post("/posts", data);
  return normalizePost(response.data as RawPost);
};

/**
 * Solicita URL prefirmada para subir la imagen de un flyer (coach).
 * Devuelve uploadUrl (PUT) e imagenKey para crearPost.
 */
export const requestPostMediaUrl = async (
  fileName: string,
  contentType: string
): Promise<{ uploadUrl: string; imagenKey: string }> => {
  const response = await axiosInstanceLambda.post("/posts/media-url", {
    fileName,
    contentType,
  });
  return response.data;
};

export const listComments = async (postId: string): Promise<Comment[]> => {
  const response = await axiosInstanceLambda.get(`/posts/${postId}/comments`);
  const data = Array.isArray(response.data)
    ? response.data.map((c: RawComment) => normalizeComment(c))
    : [];
  return data;
};

export const createComment = async (
  postId: string,
  texto: string
): Promise<Comment> => {
  const response = await axiosInstanceLambda.post(`/posts/${postId}/comments`, {
    texto,
  });
  return normalizeComment(response.data as RawComment);
};