import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { authApi, type UserSessionDto } from "../api/auth";
import { authUserQueryKey } from "./useAuthUser";
import { loginSchema, type LoginFormData } from "../lib/validations";

const useLoginForm = (onLoggedIn?: (session: UserSessionDto) => void) => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting, isSubmitSuccessful },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });

    const loginMutation = useMutation({
        mutationFn: async (data: LoginFormData) => {
            return await authApi.login(data);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: authUserQueryKey });
            const session = await authApi.me();
            onLoggedIn?.(session);
        },
        onError: (err: any) => {
            setError("root", {
                message:
                    err.response?.data?.message ||
                    err.response?.data?.title ||
                    t("errors.loginInvalid"),
            });
        },
    });

    const onSubmit = (data: LoginFormData) => {
        loginMutation.mutate(data);
    };

    return {
        register,
        handleSubmit: handleSubmit(onSubmit),
        errors,
        rootError: errors.root?.message || null,
        isLoading: loginMutation.isPending || isSubmitting,
        isSuccess: isSubmitSuccessful && loginMutation.isSuccess,
    };
};

export default useLoginForm;
export type { LoginFormData };
