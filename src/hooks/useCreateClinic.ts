import { useMemo, useState } from "react";
import dayjs, { type Dayjs } from "dayjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import type { SelectChangeEvent } from "@mui/material";
import { clinicsApi } from "../api/clinics";
import { useAuthUser } from "./useAuthUser";

export const useCreateClinic = () => {
    const { data: authUser, isLoading: isAuthLoading } = useAuthUser();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const isDoctor = Boolean(authUser?.doctorProfileId);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        streetAddress: "",
        mapLocation: "",
        cityId: "",
        phoneNumber: "",
        email: "",
    });
    const [openingFrom, setOpeningFrom] = useState<Dayjs | null>(dayjs().hour(8).minute(0));
    const [openingTo, setOpeningTo] = useState<Dayjs | null>(dayjs().hour(16).minute(0));
    const [submitError, setSubmitError] = useState<string | null>(null);

    const citiesQuery = useQuery({
        queryKey: ["clinic-cities"],
        queryFn: () => clinicsApi.list({ view: "cities" }),
        enabled: isDoctor,
    });

    const createClinicMutation = useMutation({
        mutationFn: clinicsApi.create,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["clinic-mine"] });
            navigate("/moje-przychodnie", { replace: true });
        },
        onError: (error) => {
            setSubmitError(
                error instanceof Error ? error.message : "Nie udało się utworzyć przychodni.",
            );
        },
    });

    const phonePattern = /^\+?[0-9\s()-]{7,20}$/;
    const phoneValue = formData.phoneNumber.trim();
    const phoneError = phoneValue.length > 0 && !phonePattern.test(phoneValue);
    const openingHoursValue = useMemo(() => {
        if (!openingFrom || !openingTo) return null;
        return `${openingFrom.format("HH:mm")}-${openingTo.format("HH:mm")}`;
    }, [openingFrom, openingTo]);
    const openingHoursInvalid = Boolean(
        openingFrom && openingTo && openingTo.isBefore(openingFrom),
    );

    const canSubmit =
        Boolean(formData.name.trim()) &&
        Boolean(formData.streetAddress.trim()) &&
        Boolean(formData.cityId) &&
        Boolean(openingHoursValue) &&
        !openingHoursInvalid &&
        !phoneError &&
        !createClinicMutation.isPending;

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (event: SelectChangeEvent<string>) => {
        setFormData((prev) => ({ ...prev, [event.target.name as string]: event.target.value }));
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        setSubmitError(null);
        if (!openingHoursValue || openingHoursInvalid) {
            setSubmitError("Godziny otwarcia muszą mieć poprawny zakres.");
            return;
        }
        if (phoneError) {
            setSubmitError("Podaj poprawny numer telefonu albo zostaw pole puste.");
            return;
        }
        createClinicMutation.mutate({
            name: formData.name.trim(),
            description: formData.description.trim() || null,
            streetAddress: formData.streetAddress.trim(),
            openingHours: openingHoursValue,
            mapLocation: formData.mapLocation.trim() || null,
            cityId: Number(formData.cityId),
            phoneNumber: phoneValue || null,
            email: formData.email.trim() || null,
        });
    };

    const shouldRedirect = !isAuthLoading && !isDoctor;

    return {
        isDoctor,
        isAuthLoading,
        shouldRedirect,
        formData,
        openingFrom,
        openingTo,
        submitError,
        citiesQuery,
        createClinicMutation,
        phoneError,
        openingHoursInvalid,
        openingHoursValue,
        canSubmit,
        setOpeningFrom,
        setOpeningTo,
        handleChange,
        handleSelectChange,
        handleSubmit,
    };
};
