import { axiosInstanceLambda } from "@/interceptors/interceptors";
import { Post, Comment } from "@/model/keto.models";

/**
 * Contrato del servicio de comunidad (feed grupal + comentarios).
 * Endpoints esperados del backend: /posts y /posts/{postId}/comments
 */

export const listPosts = async (): Promise<Post[]> => {
  const response = await axiosInstanceLambda.get("/posts");
  return response.data;
};

export const createPost = async (data: {
  texto: string;
  imagenUrl?: string;
  imagenKey?: string;
  logroId?: string;
}): Promise<Post> => {
  const response = await axiosInstanceLambda.post("/posts", data);
  return response.data;
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
  return response.data;
};

export const createComment = async (
  postId: string,
  texto: string
): Promise<Comment> => {
  const response = await axiosInstanceLambda.post(`/posts/${postId}/comments`, {
    texto,
  });
  return response.data;
};
