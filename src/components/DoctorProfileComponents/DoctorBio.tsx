import { useState, useEffect, useMemo, useRef } from "react";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { doctorsApi } from "../../api/doctors";
import { api } from "../../lib/axios";

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
    const [bioDraft, setBioDraft] = useState<string | null>(null);
    const [specializationDraft, setSpecializationDraft] = useState<number[] | null>(null);
    const [firstNameDraft, setFirstNameDraft] = useState<string>("");
    const [lastNameDraft, setLastNameDraft] = useState<string>("");

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
            setFirstNameDraft(userProfileQuery.data.firstName ?? "");
            setLastNameDraft(userProfileQuery.data.lastName ?? "");
        }
    }, [userProfileQuery.data]);

    const saveProfileMutation = useMutation({
        mutationFn: async () => {
            await Promise.all([
                usersApi.updateMyProfile({
                    firstName: firstNameDraft.trim(),
                    lastName: lastNameDraft.trim(),
                }),
                doctorsApi.updateMyProfile({
                    bio: (bioDraft ?? profileQuery.data?.bio ?? "").trim() || null,
                    specializationIds: specializationDraft ?? undefined,
                }),
            ]);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["doctor-my-profile"] });
            await queryClient.invalidateQueries({ queryKey: ["user-my-profile"] });
            setBioDraft(null);
        },
    });

    const uploadPhotoMutation = useMutation({
        mutationFn: (file: File) => doctorsApi.uploadProfilePhoto(file),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["doctor-my-profile"] });
            await queryClient.invalidateQueries({ queryKey: ["user-my-profile"] });
        },
    });

    const selectedSpecializationIds = useMemo(() => {
        if (!profileQuery.data || !specializationsQuery.data) return [] as number[];
        return specializationsQuery.data
            .filter((item) => profileQuery.data.specializations.includes(item.name))
            .map((item) => item.specializationId);
    }, [profileQuery.data, specializationsQuery.data]);

    useEffect(() => {
        if (specializationDraft === null && profileQuery.data && specializationsQuery.data) {
            setSpecializationDraft(selectedSpecializationIds);
        }
    }, [
        profileQuery.data,
        specializationsQuery.data,
        selectedSpecializationIds,
        specializationDraft,
    ]);

    const profileImageSrc = profileQuery.data?.profileImageUrl ?? undefined;

    return (
        <Stack spacing={1.5}>
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
                            <div></div>
                        </IconButton>
                    }
                >
                    <Avatar
                        src={profileImageSrc}
                        sx={{ width: 72, height: 72, fontSize: 30, bgcolor: (t) => t.palette.divider }}
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
                value={firstNameDraft}
                onChange={(e) => setFirstNameDraft(e.target.value)}
                fullWidth
            />
            <TextField
                label={t("doctorProfile.lastName")}
                value={lastNameDraft}
                onChange={(e) => setLastNameDraft(e.target.value)}
                fullWidth
            />

            <TextField
                label={t("doctorProfile.bio")}
                value={bioDraft ?? profileQuery.data?.bio ?? ""}
                onChange={(e) => setBioDraft(e.target.value)}
                minRows={5}
                multiline
                fullWidth
            />

            <FormControl fullWidth disabled={specializationsQuery.isLoading}>
                <InputLabel>{t("doctorProfile.specializations")}</InputLabel>
                <Select
                    multiple
                    label={t("doctorProfile.specializations")}
                    value={specializationDraft ?? []}
                    onChange={(e) =>
                        setSpecializationDraft(
                            typeof e.target.value === "string"
                                ? e.target.value.split(",").map(Number)
                                : (e.target.value as number[]),
                        )
                    }
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
                                checked={(specializationDraft ?? []).includes(
                                    item.specializationId,
                                )}
                            />
                            <ListItemText primary={item.name} />
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {saveProfileMutation.isError && (
                <Typography sx={{ color: "error.main", fontSize: 13 }}>
                    {t("doctorProfile.scheduleErrors.updateProfileError")}
                </Typography>
            )}

            <Button
                variant="contained"
                onClick={() => saveProfileMutation.mutate()}
                disabled={saveProfileMutation.isPending}
                sx={{ fontWeight: 700 }}
            >
                {saveProfileMutation.isPending ? t("common.saving") : t("doctorProfile.saveBio")}
            </Button>
        </Stack>
    );
};
