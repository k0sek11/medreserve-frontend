import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { clinicsApi, type ClinicDetailDto, type ClinicUpdateRequest } from "../api/clinics";
import { useAuthUser } from "./useAuthUser";
import { clinicEditSchema, type ClinicEditFormData } from "../lib/validations";

type ClinicEditDraft = ClinicEditFormData;

function toDraft(clinic: ClinicDetailDto): ClinicEditDraft {
    return {
        name: clinic.name,
        description: clinic.description ?? "",
        city: clinic.city,
        lat: clinic.latitude ?? 0,
        lng: clinic.longitude ?? 0,
        phoneNumber: clinic.phoneNumber ?? "",
        email: clinic.email ?? "",
        openingHours: clinic.openingHours ?? "",
    };
}

export const useClinicDetails = () => {
    const { clinicId } = useParams();
    const parsedClinicId = Number(clinicId);
    const queryClient = useQueryClient();
    const { data: authUser } = useAuthUser();
    const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
    const [requestSent, setRequestSent] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const {
        register,
        handleSubmit,
        control,
        reset,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<ClinicEditFormData>({
        resolver: zodResolver(clinicEditSchema),
        defaultValues: {
            name: "",
            description: "",
            city: "",
            lat: 0,
            lng: 0,
            phoneNumber: "",
            email: "",
            openingHours: "",
        },
    });

    const clinicQuery = useQuery({
        queryKey: ["clinic-details", parsedClinicId],
        queryFn: () => clinicsApi.getById(parsedClinicId),
        enabled: Number.isFinite(parsedClinicId) && parsedClinicId > 0,
    });

    useEffect(() => {
        if (clinicQuery.data) {
            reset(toDraft(clinicQuery.data));
            setRequestSent(false);
            setIsEditing(false);
        }
    }, [clinicQuery.data, reset]);

    const updateMutation = useMutation({
        mutationFn: async (data: ClinicEditFormData) => {
            const payload: ClinicUpdateRequest = {
                name: data.name.trim(),
                description: data.description?.trim() || null,
                streetAddress: data.city.trim(),
                openingHours: data.openingHours?.trim() || null,
                latitude: data.lat,
                longitude: data.lng,
                city: data.city.trim(),
                phoneNumber: data.phoneNumber?.trim() || null,
                email: data.email?.trim() || null,
                isActive: clinicQuery.data?.isActive ?? true,
            };
            return clinicsApi.update(parsedClinicId, payload);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["clinic-details", parsedClinicId] });
            setIsEditing(false);
        },
    });

    const isValid = Number.isFinite(parsedClinicId) && parsedClinicId > 0;
    const clinic = clinicQuery.data;
    const isOwner = clinic?.isCurrentUserOwner ?? false;
    const canRequestJoin =
        Boolean(authUser?.doctorProfileId) && !clinic?.isCurrentUserMember && !isOwner;

    const handleSave = handleSubmit((data) => {
        updateMutation.mutate(data);
    });

    const startEditing = () => {
        if (clinic) {
            reset(toDraft(clinic));
        }
        setIsEditing(true);
    };

    const cancelEditing = () => {
        if (clinic) {
            reset(toDraft(clinic));
        }
        setIsEditing(false);
    };

    return {
        parsedClinicId,
        isValid,
        clinicQuery,
        clinic,
        isOwner,
        canRequestJoin,
        register,
        control,
        errors,
        isSubmitting,
        isEditing,
        setIsEditing: startEditing,
        cancelEditing,
        setLocation: (loc: { lat: number; lng: number; city: string }) => {
            setValue("lat", loc.lat, { shouldValidate: true });
            setValue("lng", loc.lng, { shouldValidate: true });
            setValue("city", loc.city, { shouldValidate: true });
        },
        watch,
        updateMutation,
        isJoinDialogOpen,
        setIsJoinDialogOpen,
        requestSent,
        setRequestSent,
        handleSave,
    };
};
