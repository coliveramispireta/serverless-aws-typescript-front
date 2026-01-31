import { axiosInstanceLambda } from "@/interceptors/interceptors";

export const getBets = async () => {
  try {
    const response = await axiosInstanceLambda.get("/payments");
    return response.data;
  } catch (error) {
    console.error("Error fetching payments:", error);
    throw error;
  }
};
