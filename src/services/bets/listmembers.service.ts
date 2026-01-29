import { axiosInstanceLambda } from "@/interceptors/interceptors";

export const listMembers = async () => {
  try {
    const response = await axiosInstanceLambda.get("/members");
    return response.data;
  } catch (error) {
    console.error("Error fetching members:", error);
    throw error;
  }
};
