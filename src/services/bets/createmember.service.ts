import { axiosInstanceLambda } from "@/interceptors/interceptors";

export const createMember = async (body: any) => {
  try {
    const response = await axiosInstanceLambda.post("/members", body);
    return response;
  } catch (error) {
    console.error("Error creating member:", error);
    throw error;
  }
};
