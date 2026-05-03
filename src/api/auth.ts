import { api } from "../lib/axios";

export type RegisterRequest = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type UserSessionDto = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  roles: string[];
};

export const authApi = {
  register: async (data: RegisterRequest) => {
    const response = await api.post("/api/Auth/register", data);
    return response.data;
  },
  login: async (data: LoginRequest) => {
    const response = await api.post("/api/Auth/login", data);
    return response.data;
  },
  logout: async () => {
    const response = await api.post("/api/Auth/logout");
    return response.data;
  },
  me: async (): Promise<UserSessionDto> => {
    const response = await api.get("/api/Auth/me");
    return response.data;
  },
};
