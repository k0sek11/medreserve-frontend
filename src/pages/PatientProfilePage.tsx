import { useState, useEffect } from "react";
import {
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { api } from "../lib/axios";

type PatientProfileDto = {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    birthDate: string | null;
    gender: string | null;
    isActive: boolean;
};

type UpdatePatientProfileRequest = {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    birthDate: string;
    gender: string;
};

const usersApi = {
    getMyProfile: async (): Promise<PatientProfileDto> => {
        const response = await api.get("/api/users/me");
        return response.data;
    },
    updateMyProfile: async (data: UpdatePatientProfileRequest) => {
        const response = await api.put("/api/users/me", data);
        return response.data;
    },
};

const PatientProfilePage = () => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [gender, setGender] = useState("");

    const profileQuery = useQuery({
        queryKey: ["patient-profile"],
        queryFn: () => usersApi.getMyProfile(),
    });

    useEffect(() => {
        if (profileQuery.data) {
            setFirstName(profileQuery.data.firstName ?? "");
            setLastName(profileQuery.data.lastName ?? "");
            setPhoneNumber(profileQuery.data.phoneNumber ?? "");
            setBirthDate(profileQuery.data.birthDate ?? "");
            setGender(profileQuery.data.gender ?? "");
        }
    }, [profileQuery.data]);

    const saveMutation = useMutation({
        mutationFn: () =>
            usersApi.updateMyProfile({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                phoneNumber: phoneNumber.trim(),
                birthDate,
                gender,
            }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["patient-profile"] });
        },
    });

    if (profileQuery.isLoading) {
        return (
            <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: (t) => `1px solid ${t.palette.divider}` }}>
                <Typography sx={{ color: "text.secondary" }}>{t("common.loadingData")}</Typography>
            </Paper>
        );
    }

    return (
        <Box sx={{ maxWidth: 640 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "text.primary", mb: 0.8 }}>
                {t("patientProfile.title")}
            </Typography>
            <Typography sx={{ color: "text.secondary", mb: 3 }}>{t("patientProfile.subtitle")}</Typography>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: (t) => `1px solid ${t.palette.divider}` }}>
                <Stack spacing={2.5}>
                    <TextField
                        label={t("profileCompletion.firstNameLabel")}
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label={t("profileCompletion.lastNameLabel")}
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label={t("profileCompletion.phoneLabel")}
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label={t("profileCompletion.birthDateLabel")}
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        slotProps={{ inputLabel: { shrink: true } }}
                        fullWidth
                    />
                    <FormControl fullWidth>
                        <InputLabel>{t("profileCompletion.genderLabel")}</InputLabel>
                        <Select
                            label={t("profileCompletion.genderLabel")}
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                        >
                            <MenuItem value="Female">
                                {t("profileCompletion.genderOptions.female")}
                            </MenuItem>
                            <MenuItem value="Male">
                                {t("profileCompletion.genderOptions.male")}
                            </MenuItem>
                            <MenuItem value="Other">
                                {t("profileCompletion.genderOptions.other")}
                            </MenuItem>
                        </Select>
                    </FormControl>
                    <Button
                        variant="contained"
                        onClick={() => saveMutation.mutate()}
                        disabled={saveMutation.isPending}
                        sx={{ fontWeight: 700 }}
                    >
                        {saveMutation.isPending ? t("common.saving") : t("common.save")}
                    </Button>
                    {saveMutation.isSuccess && (
                        <Typography sx={{ color: "success.main", fontWeight: 600 }}>
                            {t("patientProfile.saved")}
                        </Typography>
                    )}
                    {saveMutation.isError && (
                        <Typography sx={{ color: "error.main", fontWeight: 600 }}>
                            {t("common.errorOccurred")}
                        </Typography>
                    )}
                </Stack>
            </Paper>
        </Box>
    );
};

export default PatientProfilePage;
