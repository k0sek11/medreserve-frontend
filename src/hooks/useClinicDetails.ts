import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { clinicsApi, type ClinicDetailDto, type ClinicUpdateRequest } from "../api/clinics";
import { useAuthUser } from "./useAuthUser";

type ClinicEditDraft = {
    name: string;
    description: string;
    streetAddress: string;
    openingHours: string;
    latitude: number | null;
    longitude: number | null;
    city: string;
    phoneNumber: string;
    email: string;
};

const emptyDraft: ClinicEditDraft = {
    name: "",
    description: "",
    streetAddress: "",
    openingHours: "",
    latitude: null,
    longitude: null,
    city: "",
    phoneNumber: "",
    email: "",
};

function toDraft(clinic: ClinicDetailDto): ClinicEditDraft {
    return {
        name: clinic.name,
        description: clinic.description ?? "",
        streetAddress: clinic.streetAddress,
        openingHours: clinic.openingHours ?? "",
        latitude: clinic.latitude,
        longitude: clinic.longitude,
        city: clinic.city,
        phoneNumber: clinic.phoneNumber ?? "",
        email: clinic.email ?? "",
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
    const [draft, setDraft] = useState<ClinicEditDraft>(emptyDraft);

    const clinicQuery = useQuery({
        queryKey: ["clinic-details", parsedClinicId],
        queryFn: () => clinicsApi.getById(parsedClinicId),
        enabled: Number.isFinite(parsedClinicId) && parsedClinicId > 0,
    });

    useEffect(() => {
        if (clinicQuery.data) {
            setDraft(toDraft(clinicQuery.data));
            setRequestSent(false);
            setIsEditing(false);
        }
    }, [clinicQuery.data]);

    const updateMutation = useMutation({
        mutationFn: async () => {
            const payload: ClinicUpdateRequest = {
                name: draft.name.trim(),
                description: draft.description.trim() || null,
                streetAddress: draft.streetAddress.trim(),
                openingHours: draft.openingHours.trim() || null,
                latitude: draft.latitude,
                longitude: draft.longitude,
                city: draft.city.trim(),
                phoneNumber: draft.phoneNumber.trim() || null,
                email: draft.email.trim() || null,
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

    return {
        parsedClinicId,
        isValid,
        clinicQuery,
        clinic,
        isOwner,
        canRequestJoin,
        draft,
        setDraft,
        isEditing,
        setIsEditing,
        updateMutation,
        isJoinDialogOpen,
        setIsJoinDialogOpen,
        requestSent,
        setRequestSent,
        toDraft: () => clinic && toDraft(clinic),
        handleSave: () => updateMutation.mutate(),
    };
};
