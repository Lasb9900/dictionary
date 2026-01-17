import { apiClient } from "@/src/lib/apiClient";
import { setStoredAuth, StoredAuth } from "@/src/lib/authStorage";

export type LoginResponse = {
  token: string;
  _id: string;
  email: string;
  roles: string[];
};

export const login = async (email: string, password: string) => {
  const response = await apiClient<LoginResponse>("/api/users/auth/login", {
    method: "POST",
    auth: false,
    body: { email, password },
  });

  if (response.ok) {
    const authData: StoredAuth = {
      token: response.data.token,
      userId: response.data._id,
      email: response.data.email,
      roles: response.data.roles ?? [],
    };
    setStoredAuth(authData);
  }

  return response;
};
