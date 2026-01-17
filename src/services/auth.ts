import { apiClient } from "@/src/lib/apiClient";
import { setStoredAuth } from "@/src/lib/authStorage";

export type LoginResponse = {
  token: string;
  _id: string;
};

export const login = async (email: string, password: string) => {
  const response = await apiClient<LoginResponse>("/api/users/auth/login", {
    method: "POST",
    auth: false,
    body: { email, password },
  });

  if (response.ok) {
    setStoredAuth({ token: response.data.token, userId: response.data._id });
  }

  return response;
};
