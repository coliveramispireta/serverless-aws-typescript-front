import { axiosInstanceLambda } from "@/interceptors/interceptors";
import { WeightEntry } from "@/model/keto.models";

/**
 * Contrato del servicio de pesos y evidencias.
 * Endpoints esperados del backend: /weights y /weights/{id}/evidence
 */

export const listWeights = async (): Promise<WeightEntry[]> => {
  const response = await axiosInstanceLambda.get("/weights");
  return response.data;
};

export const createWeight = async (
  weight: Omit<WeightEntry, "id">
): Promise<WeightEntry> => {
  const response = await axiosInstanceLambda.post("/weights", weight);
  return response.data;
};

export const deleteWeight = async (weightId: string): Promise<void> => {
  await axiosInstanceLambda.delete(`/weights/${weightId}`);
};

/**
 * Solicita una URL prefirmada para subir la foto de evidencia de la báscula.
 */
export const requestEvidenceUploadUrl = async (
  weightId: string,
  fileName: string,
  contentType: string
): Promise<{ uploadUrl: string; evidenciaFotoUrl: string }> => {
  const response = await axiosInstanceLambda.post(
    `/weights/${weightId}/evidence`,
    { fileName, contentType }
  );
  return response.data;
};
