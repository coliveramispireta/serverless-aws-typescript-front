import { axiosInstanceLambda } from "@/interceptors/interceptors";

export const deleteTicket = async (id: string) => {
  try {
    const response = await axiosInstanceLambda.delete(`/tickets/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting ticket:", error);
    throw error;
  }
};
