import { api } from "../lib/axios";

export type UserProfileDto = {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    birthDate: string | null;
    gender: string | null;
    isActive: boolean;
};

export type UpdateUserProfileRequest = {
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    birthDate?: string;
    gender?: string;
};

export const usersApi = {
    getMyProfile: async (): Promise<UserProfileDto> => {
        const response = await api.get("/api/users/me");
        return response.data;
    },
    updateMyProfile: async (data: UpdateUserProfileRequest) => {
        const response = await api.put("/api/users/me", data);
        return response.data;
    },
};
