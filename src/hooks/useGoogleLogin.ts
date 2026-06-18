import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { authApi } from "../api/auth";
import { authUserQueryKey } from "./useAuthUser";

export const useGoogleLogin = () => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const loginMutation = useMutation({
        mutationFn: authApi.loginWithGoogleApi,
        onSuccess: async (data) => {
            if (data?.token) {
                localStorage.setItem("token", data.token);
            }
            await queryClient.invalidateQueries({ queryKey: authUserQueryKey });
            const session = await authApi.me();
            navigate(
                session.isActive
                    ? session.roles.includes("Doctor")
                        ? "/powiadomienia"
                        : "/"
                    : "/uzupelnij-profil",
                { replace: true },
            );
        },
        onError: () => {
            console.error(t("auth.googleTokenRejected"));
        },
    });

    const handleGoogleSuccess = (credentialResponse: { credential?: string }) => {
        const googleToken = credentialResponse.credential;
        if (googleToken) {
            loginMutation.mutate(googleToken);
        }
    };

    return {
        loginMutation,
        handleGoogleSuccess,
    };
};
