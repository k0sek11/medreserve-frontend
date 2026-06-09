import { useState, useEffect, useMemo } from "react";
import {
    Button,
    FormControl,
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

export const DoctorBio = () => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [bioDraft, setBioDraft] = useState<string | null>(null);
    const [specializationDraft, setSpecializationDraft] = useState<number[] | null>(null);

    const profileQuery = useQuery({
        queryKey: ["doctor-my-profile"],
        queryFn: () => doctorsApi.getMyProfile(),
    });
    const specializationsQuery = useQuery({
        queryKey: ["doctor-specializations"],
        queryFn: () => doctorsApi.getSpecializations(),
    });

    const saveProfileMutation = useMutation({
        mutationFn: () =>
            doctorsApi.updateMyProfile({
                bio: (bioDraft ?? profileQuery.data?.bio ?? "").trim() || null,
                specializationIds: specializationDraft ?? undefined,
            }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["doctor-my-profile"] });
            setBioDraft(null);
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

    return (
        <Stack spacing={1.5}>
            <Typography sx={{ fontWeight: 800, color: "#11223a", fontSize: 20 }}>
                {profileQuery.data?.fullName ?? t("doctorProfile.profileName")}
            </Typography>
            <Typography sx={{ color: "#4f627a", mb: 2 }}>
                {t("doctorProfile.licenseNumber")}: {profileQuery.data?.licenseNumber ?? "-"}
            </Typography>

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
