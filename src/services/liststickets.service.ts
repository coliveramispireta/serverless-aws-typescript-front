import { axiosInstanceLambda } from "@/interceptors/interceptors";

export const listTickets = async () => {
  try {
    const response = await axiosInstanceLambda.get("/tickets");
    return response.data;
  } catch (error) {
    console.error("Error fetching tickets:", error);
    throw error;
  }
};
