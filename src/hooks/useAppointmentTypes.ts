import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
    doctorsApi,
    type DoctorAppointmentTypeDto,
    type CreateDoctorAppointmentTypeDto,
} from "../api/doctors";
import { appointmentTypeSchema, type AppointmentTypeFormData } from "../lib/validations";

export const useAppointmentTypes = () => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [modalOpen, setModalOpen] = useState(false);
    const [typeToDelete, setTypeToDelete] = useState<DoctorAppointmentTypeDto | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<AppointmentTypeFormData>({
        resolver: zodResolver(appointmentTypeSchema),
        defaultValues: {
            name: "",
            basePrice: 0,
            durationMinutes: 30,
        },
    });

    const profileQuery = useQuery({
        queryKey: ["doctor-my-profile"],
        queryFn: () => doctorsApi.getMyProfile(),
    });

    const createMutation = useMutation({
        mutationFn: (payload: CreateDoctorAppointmentTypeDto) =>
            doctorsApi.createMyAppointmentType(payload),
        onSuccess: async () => {
            setModalOpen(false);
            reset();
            await queryClient.invalidateQueries({ queryKey: ["doctor-my-profile"] });
        },
        onError: (err) => {
            setError("root", {
                message:
                    err instanceof Error
                        ? err.message
                        : t("doctorProfile.scheduleErrors.createTypeError"),
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => doctorsApi.deleteMyAppointmentType(id),
        onSuccess: async () => {
            setTypeToDelete(null);
            await queryClient.invalidateQueries({ queryKey: ["doctor-my-profile"] });
            await queryClient.invalidateQueries({ queryKey: ["doctor-appointment-notifications"] });
            await queryClient.invalidateQueries({ queryKey: ["appointment-notifications"] });
        },
    });

    const onSubmit = handleSubmit((data) => {
        createMutation.mutate({
            name: data.name.trim(),
            basePrice: data.basePrice,
            durationMinutes: data.durationMinutes,
        });
    });

    const types = profileQuery.data?.appointmentTypes ?? [];

    const openCreateModal = () => {
        reset({ name: "", basePrice: 0, durationMinutes: 30 });
        setModalOpen(true);
    };

    return {
        types,
        modalOpen,
        setModalOpen,
        typeToDelete,
        setTypeToDelete,
        register,
        errors,
        isSubmitting,
        createMutation,
        deleteMutation,
        onSubmit,
        openCreateModal,
    };
};
