import { useQuery } from "@tanstack/react-query";
import { authApi } from "../api/auth";

export const authUserQueryKey = ["authUser"] as const;

export const useAuthUser = () => {
    return useQuery({
        queryKey: authUserQueryKey,
        queryFn: async () => {
            try {
                return await authApi.me();
            } catch {
                return null;
            }
        },
        retry: false,
        staleTime: 1000 * 60 * 5,
    });
};
