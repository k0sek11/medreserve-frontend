import { useState } from "react";
import {
    Alert,
    Box,
    Button,
    Divider,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AuthPageShell from "../components/auth/AuthPageShell";
import { RoleCard } from "../components/auth/RoleCard";
import { authApi, type CompleteProfileRequest } from "../api/auth";
import { useAuthUser, authUserQueryKey } from "../hooks/useAuthUser";
import type { ProfileType } from "../types/profile";

const ProfileCompletionPage = () => {
    const { t } = useTranslation();
    const genderOptions = [
        { value: "Kobieta", label: t("profileCompletion.genderOptions.female") },
        { value: "Mezczyzna", label: t("profileCompletion.genderOptions.male") },
        { value: "Inne", label: t("profileCompletion.genderOptions.other") },
    ];

    const { data: user, isLoading } = useAuthUser();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [profileType, setProfileType] = useState<ProfileType>(null);
    const [firstName, setFirstName] = useState(user?.firstName ?? "");
    const [lastName, setLastName] = useState(user?.lastName ?? "");
    const [phoneNumber, setPhoneNumber] = useState(user?.email ? "" : "");
    const [birthDate, setBirthDate] = useState("");
    const [gender, setGender] = useState(genderOptions[0].value);
    const [licenseNumber, setLicenseNumber] = useState("");

    const completionMutation = useMutation({
        mutationFn: (payload: CompleteProfileRequest) => authApi.completeProfile(payload),
        onSuccess: async (_, variables) => {
            await queryClient.invalidateQueries({ queryKey: authUserQueryKey });
            navigate(variables.profileType === "Doctor" ? "/powiadomienia" : "/", {
                replace: true,
            });
        },
    });

    const canSubmit =
        Boolean(profileType) &&
        firstName.trim().length > 0 &&
        lastName.trim().length > 0 &&
        phoneNumber.trim().length > 0 &&
        birthDate.trim().length > 0 &&
        gender.trim().length > 0 &&
        (profileType !== "Doctor" || licenseNumber.trim().length > 0);

    if (isLoading) {
        return (
            <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
                <Typography>{t("common.loading")}</Typography>
            </Box>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.isActive) {
        return <Navigate to={user.roles.includes("Doctor") ? "/powiadomienia" : "/"} replace />;
    }

    const submit = () => {
        if (!profileType) return;
        completionMutation.mutate({
            profileType,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            phoneNumber: phoneNumber.trim(),
            birthDate,
            gender,
            licenseNumber: profileType === "Doctor" ? licenseNumber.trim() : null,
        });
    };

    return (
        <AuthPageShell
            title={t("profileCompletion.title")}
            subtitle={t("profileCompletion.subtitle")}
            footer={
                <Typography sx={{ color: "#4f627a", textAlign: "center" }}>
                    {t("profileCompletion.footer")}
                </Typography>
            }
        >
            <Stack spacing={2.5}>
                <Box>
                    <Typography sx={{ fontWeight: 800, color: "#11223a", mb: 1 }}>
                        {t("profileCompletion.whoAreYou")}
                    </Typography>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                        <RoleCard
                            active={profileType === "Doctor"}
                            title={t("profileCompletion.doctor")}
                            description={t("profileCompletion.doctorDesc")}
                            onClick={() => setProfileType("Doctor")}
                        />
                        <RoleCard
                            active={profileType === "Patient"}
                            title={t("profileCompletion.patient")}
                            description={t("profileCompletion.patientDesc")}
                            onClick={() => setProfileType("Patient")}
                        />
                    </Stack>
                </Box>

                <Divider />

                <Stack
                    spacing={2}
                    component="form"
                    onSubmit={(event) => {
                        event.preventDefault();
                        submit();
                    }}
                >
                    <TextField
                        label={t("profileCompletion.firstNameLabel")}
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        fullWidth
                        required
                    />
                    <TextField
                        label={t("profileCompletion.lastNameLabel")}
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        fullWidth
                        required
                    />
                    <TextField
                        label={t("profileCompletion.phoneLabel")}
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        fullWidth
                        required
                    />
                    <TextField
                        label={t("profileCompletion.birthDateLabel")}
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        slotProps={{ inputLabel: { shrink: true } }}
                        fullWidth
                        required
                    />
                    <FormControl fullWidth required>
                        <InputLabel id="gender-label">
                            {t("profileCompletion.genderLabel")}
                        </InputLabel>
                        <Select
                            labelId="gender-label"
                            label={t("profileCompletion.genderLabel")}
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                        >
                            {genderOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {profileType === "Doctor" && (
                        <TextField
                            label={t("profileCompletion.licenseNumberLabel")}
                            value={licenseNumber}
                            onChange={(e) => setLicenseNumber(e.target.value)}
                            fullWidth
                            required
                        />
                    )}

                    {completionMutation.isError && (
                        <Alert severity="error">{t("profileCompletion.saveError")}</Alert>
                    )}

                    <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={!canSubmit || completionMutation.isPending}
                        sx={{ textTransform: "none", fontWeight: 700, py: 1.2 }}
                    >
                        {completionMutation.isPending
                            ? t("common.saving")
                            : t("profileCompletion.saveButton")}
                    </Button>
                </Stack>
            </Stack>
        </AuthPageShell>
    );
};

export default ProfileCompletionPage;
