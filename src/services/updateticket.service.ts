import { axiosInstanceLambda } from "@/interceptors/interceptors";

export const updateTicket = async (id: string, ticketData: any) => {
  try {
    console.log("ticketData:", ticketData);
    const response = await axiosInstanceLambda.put(`/tickets/${id}`, ticketData);
    console.log("response:", response);
    return response.data;
  } catch (error) {
    console.error("Error updating ticket:", error);
    throw error;
  }
};
