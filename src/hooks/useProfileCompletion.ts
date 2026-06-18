import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { authApi, type CompleteProfileRequest } from "../api/auth";
import { useAuthUser, authUserQueryKey } from "./useAuthUser";
import type { ProfileType } from "../types/profile";
import { profileCompletionSchema, type ProfileCompletionFormData } from "../lib/validations";

export const useProfileCompletion = () => {
    const { t } = useTranslation();
    const { data: user, isLoading } = useAuthUser();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [profileType, setProfileType] = useState<ProfileType>(null);

    const genderOptions = [
        { value: "Kobieta", label: t("profileCompletion.genderOptions.female") },
        { value: "Mezczyzna", label: t("profileCompletion.genderOptions.male") },
        { value: "Inne", label: t("profileCompletion.genderOptions.other") },
    ];

    const {
        register,
        handleSubmit,
        control,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<ProfileCompletionFormData>({
        resolver: zodResolver(profileCompletionSchema),
        defaultValues: {
            profileType: undefined,
            firstName: user?.firstName ?? "",
            lastName: user?.lastName ?? "",
            phoneNumber: "",
            birthDate: "",
            gender: genderOptions[0].value,
            licenseNumber: "",
        },
    });

    const completionMutation = useMutation({
        mutationFn: (payload: CompleteProfileRequest) => authApi.completeProfile(payload),
        onSuccess: async (_, variables) => {
            await queryClient.invalidateQueries({ queryKey: authUserQueryKey });
            navigate(variables.profileType === "Doctor" ? "/powiadomienia" : "/", {
                replace: true,
            });
        },
    });

    const selectProfileType = (type: ProfileType) => {
        setProfileType(type);
        setValue("profileType", type as "Doctor" | "Patient", { shouldValidate: true });
    };

    const onSubmit = handleSubmit((data) => {
        if (data.profileType !== "Doctor" && data.profileType !== "Patient") return;
        completionMutation.mutate({
            profileType: data.profileType,
            firstName: data.firstName.trim(),
            lastName: data.lastName.trim(),
            phoneNumber: data.phoneNumber.trim(),
            birthDate: data.birthDate,
            gender: data.gender,
            licenseNumber: data.profileType === "Doctor" ? (data.licenseNumber ?? "").trim() : null,
        });
    });

    const watchedProfileType = watch("profileType");
    const isPending = completionMutation.isPending || isSubmitting;

    return {
        user,
        isLoading,
        profileType,
        selectProfileType,
        register,
        handleSubmit: onSubmit,
        control,
        errors,
        isPending,
        completionMutation,
        genderOptions,
        watchedProfileType,
    };
};
