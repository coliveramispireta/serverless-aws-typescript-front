import { axiosInstanceLambda } from "@/interceptors/interceptors";

export const createTicket = async (ticketData: any) => {
  try {
    const response = await axiosInstanceLambda.post("/tickets", ticketData);
    return response;
  } catch (error) {
    console.error("Error creating ticket:", error);
    throw error;
  }
};
