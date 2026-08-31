import { axiosInstanceLambda } from "@/interceptors/interceptors";
import { LiquidEntry } from "@/model/keto.models";

/** Listar líquidos del usuario (opcionalmente filtrar por fecha YYYY-MM-DD) */
export const listLiquids = async (fecha?: string): Promise<LiquidEntry[]> => {
  const params = fecha ? { fecha } : {};
  const response = await axiosInstanceLambda.get("/liquids", { params });
  return response.data;
};

/** Registrar líquido (opcional fechaHora para registrar agua de otros días, y nota) */
export const createLiquid = async (
  cantidadMl: number,
  opts?: { fechaHora?: string; nota?: string },
): Promise<LiquidEntry> => {
  const response = await axiosInstanceLambda.post("/liquids", {
    cantidadMl,
    fechaHora: opts?.fechaHora,
    nota: opts?.nota,
  });
  return response.data;
};

/** Eliminar registro de líquido */
export const deleteLiquid = async (id: string): Promise<void> => {
  await axiosInstanceLambda.delete(`/liquids/${id}`);
};
