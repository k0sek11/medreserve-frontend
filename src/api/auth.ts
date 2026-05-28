import { api } from "../lib/axios";

export type RegisterRequest = {
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
    doctorProfileId: number | null;
};

export type CompleteProfileRequest = {
    profileType: "Doctor" | "Patient";
    firstName: string;
    lastName: string;
    phoneNumber: string;
    birthDate: string;
    gender: string;
    licenseNumber?: string | null;
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
    completeProfile: async (data: CompleteProfileRequest) => {
        const response = await api.post("/api/Auth/complete-profile", data);
        return response.data;
    },
    loginWithGoogleApi : async (googleToken: string) => {
      const response = await api.post('/api/Auth/google-login', {
        token: googleToken
      });
      return response.data; 
    }  
};
