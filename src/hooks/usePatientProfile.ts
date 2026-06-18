import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { usersApi } from "../api/users";
import { patientProfileSchema, type PatientProfileFormData } from "../lib/validations";

export const usePatientProfile = () => {
    const queryClient = useQueryClient();

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors, isSubmitting, isSubmitSuccessful },
    } = useForm<PatientProfileFormData>({
        resolver: zodResolver(patientProfileSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            phoneNumber: "",
            birthDate: "",
            gender: "",
        },
    });

    const profileQuery = useQuery({
        queryKey: ["patient-profile"],
        queryFn: () => usersApi.getMyProfile(),
    });

    useEffect(() => {
        if (profileQuery.data) {
            reset({
                firstName: profileQuery.data.firstName ?? "",
                lastName: profileQuery.data.lastName ?? "",
                phoneNumber: profileQuery.data.phoneNumber ?? "",
                birthDate: profileQuery.data.birthDate ?? "",
                gender: profileQuery.data.gender ?? "",
            });
        }
    }, [profileQuery.data, reset]);

    const saveMutation = useMutation({
        mutationFn: (data: PatientProfileFormData) =>
            usersApi.updateMyProfile({
                firstName: data.firstName.trim(),
                lastName: data.lastName.trim(),
                phoneNumber: data.phoneNumber.trim(),
                birthDate: data.birthDate,
                gender: data.gender,
            }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["patient-profile"] });
        },
    });

    const onSubmit = handleSubmit((data) => {
        saveMutation.mutate(data);
    });

    return {
        register,
        control,
        errors,
        isSubmitting,
        isSubmitSuccessful,
        profileQuery,
        saveMutation,
        onSubmit,
    };
};
