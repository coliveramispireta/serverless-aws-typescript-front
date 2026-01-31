import { axiosInstanceLambda } from "@/interceptors/interceptors";

export const registrarPago = async (body: any) => {
  try {
    const response = await axiosInstanceLambda.post("/payments", body);
    return response;
  } catch (error) {
    console.error("Error creating payment:", error);
    throw error;
  }
};
