import { axiosInstanceLambda } from "@/interceptors/interceptors";

export const getTicket = async (id: string) => {
  try {
    const response = await axiosInstanceLambda.get(`/tickets/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching ticket:", error);
    throw error;
  }
};
