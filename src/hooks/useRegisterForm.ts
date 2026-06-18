import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/auth";
import { registerSchema, type RegisterFormData } from "../lib/validations";

const useRegisterForm = () => {
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting, isSubmitSuccessful },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: { email: "", password: "", confirmPassword: "" },
    });

    const registerMutation = useMutation({
        mutationFn: async (data: Omit<RegisterFormData, "confirmPassword">) => {
            return await authApi.register(data);
        },
        onError: (err: any) => {
            setError("root", {
                message: err.response?.data?.message || "Wystąpił błąd podczas rejestracji",
            });
        },
        onSuccess: () => {
            navigate("/login", { replace: true });
        },
    });

    const onSubmit = (data: RegisterFormData) => {
        const { confirmPassword, ...registerPayload } = data;
        registerMutation.mutate(registerPayload);
    };

    return {
        register,
        handleSubmit: handleSubmit(onSubmit),
        errors,
        rootError: errors.root?.message || null,
        isLoading: registerMutation.isPending || isSubmitting,
        isSuccess: isSubmitSuccessful && registerMutation.isSuccess,
    };
};

export default useRegisterForm;
export type { RegisterFormData };
