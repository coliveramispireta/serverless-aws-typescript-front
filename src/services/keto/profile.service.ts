import { axiosInstanceLambda } from "@/interceptors/interceptors";
import { UserProfile } from "@/model/keto.models";

/**
 * Contrato del servicio de perfil.
 * Endpoints del backend: GET /profile, PUT /profile
 */

export const getProfile = async (): Promise<UserProfile> => {
  const response = await axiosInstanceLambda.get("/profile");
  return response.data;
};

export const updateProfile = async (
  data: Partial<Pick<UserProfile, "alturaCm" | "pesoObjetivoKg" | "nombre">>
): Promise<UserProfile> => {
  const response = await axiosInstanceLambda.put("/profile", data);
  return response.data;
};
