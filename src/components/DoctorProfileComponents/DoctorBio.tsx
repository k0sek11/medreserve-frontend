import { useEffect, useMemo, useRef } from "react";
import {
    Avatar,
    Badge,
    Box,
    Button,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
    Checkbox,
    ListItemText,
} from "@mui/material";
import { CameraAlt } from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { doctorsApi } from "../../api/doctors";
import { api } from "../../lib/axios";
import { doctorBioSchema, type DoctorBioFormData } from "../../lib/validations";

type UserProfileDto = {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    birthDate: string | null;
    gender: string | null;
    isActive: boolean;
};

const usersApi = {
    getMyProfile: async (): Promise<UserProfileDto> => {
        const response = await api.get("/api/users/me");
        return response.data;
    },
    updateMyProfile: async (data: { firstName: string; lastName: string }) => {
        const response = await api.put("/api/users/me", data);
        return response.data;
    },
};

export const DoctorBio = () => {
    const { t } = useTranslation();
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

    const onSubmit = (data: DoctorBioFormData) => {
        saveProfileMutation.mutate(data);
    };

    return (
        <Stack spacing={1.5} component="form" onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    badgeContent={
                        <IconButton
                            size="small"
                            sx={{
                                bgcolor: "primary.main",
                                color: "white",
                                width: 28,
                                height: 28,
                                "&:hover": { bgcolor: (t) => t.palette.primary.dark },
                            }}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <CameraAlt sx={{ fontSize: 16 }} />
                        </IconButton>
                    }
                >
                    <Avatar
                        src={profileImageSrc}
                        sx={{
                            width: 72,
                            height: 72,
                            fontSize: 30,
                            bgcolor: (t) => t.palette.divider,
                        }}
                    >
                        {profileQuery.data?.fullName?.charAt(0) ?? "?"}
                    </Avatar>
                </Badge>
                <Box>
                    <Typography sx={{ fontWeight: 800, color: "text.primary", fontSize: 20 }}>
                        {profileQuery.data?.fullName ?? t("doctorProfile.profileName")}
                    </Typography>
                    <Typography sx={{ color: "text.secondary" }}>
                        {t("doctorProfile.licenseNumber")}:{" "}
                        {profileQuery.data?.licenseNumber ?? "-"}
                    </Typography>
                </Box>
            </Box>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadPhotoMutation.mutate(file);
                    if (e.target) e.target.value = "";
                }}
            />
            {uploadPhotoMutation.isPending && (
                <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
                    {t("common.saving")}
                </Typography>
            )}
            {uploadPhotoMutation.isError && (
                <Typography sx={{ color: "error.main", fontSize: 13 }}>
                    {t("common.errorOccurred")}
                </Typography>
            )}

            <TextField
                label={t("doctorProfile.firstName")}
                {...register("firstName")}
                error={!!errors.firstName}
                helperText={errors.firstName?.message ? t(errors.firstName.message) : undefined}
                fullWidth
            />
            <TextField
                label={t("doctorProfile.lastName")}
                {...register("lastName")}
                error={!!errors.lastName}
                helperText={errors.lastName?.message ? t(errors.lastName.message) : undefined}
                fullWidth
            />

            <TextField
                label={t("doctorProfile.bio")}
                {...register("bio")}
                minRows={5}
                multiline
                fullWidth
            />

            <FormControl fullWidth disabled={specializationsQuery.isLoading}>
                <InputLabel>{t("doctorProfile.specializations")}</InputLabel>
                <Controller
                    name="specializationIds"
                    control={control}
                    render={({ field }) => (
                        <Select
                            multiple
                            label={t("doctorProfile.specializations")}
                            value={field.value}
                            onChange={(e) => {
                                const val = e.target.value;
                                field.onChange(
                                    typeof val === "string"
                                        ? val.split(",").map(Number)
                                        : (val as number[]),
                                );
                            }}
                            renderValue={(selected) =>
                                (selected as number[])
                                    .map(
                                        (id) =>
                                            specializationsQuery.data?.find(
                                                (s) => s.specializationId === id,
                                            )?.name,
                                    )
                                    .join(", ")
                            }
                        >
                            {specializationsQuery.data?.map((item) => (
                                <MenuItem key={item.specializationId} value={item.specializationId}>
                                    <Checkbox
                                        checked={(field.value ?? []).includes(
                                            item.specializationId,
                                        )}
                                    />
                                    <ListItemText primary={item.name} />
                                </MenuItem>
                            ))}
                        </Select>
                    )}
                />
            </FormControl>

            {saveProfileMutation.isError && (
                <Typography sx={{ color: "error.main", fontSize: 13 }}>
                    {t("doctorProfile.scheduleErrors.updateProfileError")}
                </Typography>
            )}

            <Button
                type="submit"
                variant="contained"
                disabled={saveProfileMutation.isPending || isSubmitting}
                sx={{ fontWeight: 700 }}
            >
                {saveProfileMutation.isPending || isSubmitting
                    ? t("common.saving")
                    : t("doctorProfile.saveBio")}
            </Button>
        </Stack>
    );
};
