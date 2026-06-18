import { useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { doctorsApi } from "../api/doctors";
import { usersApi } from "../api/users";
import { doctorBioSchema, type DoctorBioFormData } from "../lib/validations";

export const useDoctorBioForm = () => {
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        register,
        handleSubmit,
        control,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<DoctorBioFormData>({
        resolver: zodResolver(doctorBioSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            bio: "",
            specializationIds: [],
        },
    });

    const profileQuery = useQuery({
        queryKey: ["doctor-my-profile"],
        queryFn: () => doctorsApi.getMyProfile(),
    });
    const userProfileQuery = useQuery({
        queryKey: ["user-my-profile"],
        queryFn: () => usersApi.getMyProfile(),
    });
    const specializationsQuery = useQuery({
        queryKey: ["doctor-specializations"],
        queryFn: () => doctorsApi.getSpecializations(),
    });

    useEffect(() => {
        if (userProfileQuery.data) {
            setValue("firstName", userProfileQuery.data.firstName ?? "");
            setValue("lastName", userProfileQuery.data.lastName ?? "");
        }
    }, [userProfileQuery.data, setValue]);

    const selectedSpecializationIds = useMemo(() => {
        if (!profileQuery.data || !specializationsQuery.data) return [] as number[];
        return specializationsQuery.data
            .filter((item) => profileQuery.data.specializations.includes(item.name))
            .map((item) => item.specializationId);
    }, [profileQuery.data, specializationsQuery.data]);

    useEffect(() => {
        if (profileQuery.data && specializationsQuery.data) {
            setValue("specializationIds", selectedSpecializationIds);
            setValue("bio", profileQuery.data.bio ?? "");
        }
    }, [profileQuery.data, specializationsQuery.data, selectedSpecializationIds, setValue]);

    const saveProfileMutation = useMutation({
        mutationFn: async (data: DoctorBioFormData) => {
            await Promise.all([
                usersApi.updateMyProfile({
                    firstName: data.firstName.trim(),
                    lastName: data.lastName.trim(),
                }),
                doctorsApi.updateMyProfile({
                    bio: (data.bio ?? "").trim() || null,
                    specializationIds: data.specializationIds,
                }),
            ]);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["doctor-my-profile"] });
            await queryClient.invalidateQueries({ queryKey: ["user-my-profile"] });
        },
    });

    const uploadPhotoMutation = useMutation({
        mutationFn: (file: File) => doctorsApi.uploadProfilePhoto(file),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["doctor-my-profile"] });
            await queryClient.invalidateQueries({ queryKey: ["user-my-profile"] });
        },
    });

    const profileImageSrc = profileQuery.data?.profileImageUrl ?? undefined;

    const onSubmit = handleSubmit((data) => {
        saveProfileMutation.mutate(data);
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) uploadPhotoMutation.mutate(file);
        if (e.target) e.target.value = "";
    };

    return {
        register,
        control,
        errors,
        isSubmitting,
        profileQuery,
        userProfileQuery,
        specializationsQuery,
        saveProfileMutation,
        uploadPhotoMutation,
        profileImageSrc,
        fileInputRef,
        onSubmit,
        handleFileChange,
    };
};
