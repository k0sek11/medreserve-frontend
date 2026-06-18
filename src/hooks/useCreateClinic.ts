import { useState } from "react";
import dayjs, { type Dayjs } from "dayjs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { clinicsApi } from "../api/clinics";
import { useAuthUser } from "./useAuthUser";
import { clinicSchema, type ClinicFormData } from "../lib/validations";

export const useCreateClinic = () => {
    const { data: authUser, isLoading: isAuthLoading } = useAuthUser();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const isDoctor = Boolean(authUser?.doctorProfileId);

    const {
        register,
        handleSubmit,
        control,
        setValue,
        watch,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<ClinicFormData>({
        resolver: zodResolver(clinicSchema),
        defaultValues: {
            name: "",
            description: "",
            city: "",
            lat: 0,
            lng: 0,
            phoneNumber: "",
            email: "",
            openingFrom: "08:00",
            openingTo: "16:00",
        },
    });

    const [openingFrom, setOpeningFrom] = useState<Dayjs | null>(dayjs().hour(8).minute(0));
    const [openingTo, setOpeningTo] = useState<Dayjs | null>(dayjs().hour(16).minute(0));

    const createClinicMutation = useMutation({
        mutationFn: clinicsApi.create,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["clinic-mine"] });
            navigate("/moje-przychodnie", { replace: true });
        },
        onError: (error) => {
            setError("root", {
                message:
                    error instanceof Error ? error.message : "Nie udało się utworzyć przychodni.",
            });
        },
    });

    const phonePattern = /^\+?[0-9\s()-]{7,20}$/;
    const phoneValue = watch("phoneNumber")?.trim() ?? "";
    const phoneError = phoneValue.length > 0 && !phonePattern.test(phoneValue);
    const openingHoursInvalid = Boolean(
        openingFrom && openingTo && openingTo.isBefore(openingFrom),
    );

    const onSubmit = (data: ClinicFormData) => {
        if (!openingFrom || !openingTo || openingHoursInvalid) {
            setError("root", { message: "Godziny otwarcia muszą mieć poprawny zakres." });
            return;
        }
        if (phoneError) {
            setError("root", { message: "Podaj poprawny numer telefonu albo zostaw pole puste." });
            return;
        }

        const openingHoursValue = `${data.openingFrom}-${data.openingTo}`;
        createClinicMutation.mutate({
            name: data.name.trim(),
            description: data.description?.trim() || null,
            streetAddress: data.city.trim(),
            openingHours: openingHoursValue,
            latitude: data.lat,
            longitude: data.lng,
            city: data.city.trim(),
            phoneNumber: phoneValue || null,
            email: data.email?.trim() || null,
        });
    };

    const setLocation = (loc: { lat: number; lng: number; city: string }) => {
        setValue("lat", loc.lat, { shouldValidate: true });
        setValue("lng", loc.lng, { shouldValidate: true });
        setValue("city", loc.city, { shouldValidate: true });
    };

    const canSubmit =
        Boolean(watch("name")?.trim()) &&
        Boolean(watch("city")?.trim()) &&
        Boolean(watch("lat")) &&
        Boolean(watch("lng")) &&
        Boolean(openingFrom) &&
        Boolean(openingTo) &&
        !openingHoursInvalid &&
        !phoneError &&
        !createClinicMutation.isPending &&
        !isSubmitting;

    const shouldRedirect = !isAuthLoading && !isDoctor;

    return {
        isDoctor,
        isAuthLoading,
        shouldRedirect,
        register,
        control,
        handleSubmit: handleSubmit(onSubmit),
        errors,
        rootError: errors.root?.message || null,
        submitError: errors.root?.message || null,
        createClinicMutation,
        phoneError,
        openingHoursInvalid,
        canSubmit,
        openingFrom,
        openingTo,
        setOpeningFrom,
        setOpeningTo,
        setLocation,
        watch,
        setValue,
    };
};
