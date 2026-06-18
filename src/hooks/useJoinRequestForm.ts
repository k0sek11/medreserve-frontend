import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { clinicsApi } from "../api/clinics";
import { joinRequestSchema, type JoinRequestFormData } from "../lib/validations";

export const useJoinRequestForm = (
    clinicId: number,
    onSuccess: () => void,
    onClose: () => void,
) => {
    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<JoinRequestFormData>({
        resolver: zodResolver(joinRequestSchema),
        defaultValues: {
            confirmDoctor: true,
            joinMessage: "",
        },
    });

    const joinMutation = useMutation({
        mutationFn: (data: JoinRequestFormData) =>
            clinicsApi.requestJoin(clinicId, {
                confirmDoctor: true,
                message: data.joinMessage?.trim() || undefined,
            }),
        onSuccess: () => {
            onSuccess();
            onClose();
            reset();
        },
    });

    const onSubmit = handleSubmit((data) => {
        joinMutation.mutate(data);
    });

    return {
        register,
        control,
        errors,
        isSubmitting,
        joinMutation,
        onSubmit,
    };
};
