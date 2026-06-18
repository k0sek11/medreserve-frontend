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
import { Controller } from "react-hook-form";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AuthPageShell from "../components/auth/AuthPageShell";
import { RoleCard } from "../components/auth/RoleCard";
import { useProfileCompletion } from "../hooks/useProfileCompletion";

const ProfileCompletionPage = () => {
    const { t } = useTranslation();
    const p = useProfileCompletion();

    if (p.isLoading) {
        return (
            <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
                <Typography>{t("common.loading")}</Typography>
            </Box>
        );
    }

    if (!p.user) {
        return <Navigate to="/login" replace />;
    }

    if (p.user.isActive) {
        return <Navigate to={p.user.roles.includes("Doctor") ? "/powiadomienia" : "/"} replace />;
    }

    return (
        <AuthPageShell
            title={t("profileCompletion.title")}
            subtitle={t("profileCompletion.subtitle")}
            footer={
                <Typography sx={{ color: "text.secondary", textAlign: "center" }}>
                    {t("profileCompletion.footer")}
                </Typography>
            }
        >
            <Stack spacing={2.5}>
                <Box>
                    <Typography sx={{ fontWeight: 800, color: "text.primary", mb: 1 }}>
                        {t("profileCompletion.whoAreYou")}
                    </Typography>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                        <RoleCard
                            active={p.profileType === "Doctor"}
                            title={t("profileCompletion.doctor")}
                            description={t("profileCompletion.doctorDesc")}
                            onClick={() => p.selectProfileType("Doctor")}
                        />
                        <RoleCard
                            active={p.profileType === "Patient"}
                            title={t("profileCompletion.patient")}
                            description={t("profileCompletion.patientDesc")}
                            onClick={() => p.selectProfileType("Patient")}
                        />
                    </Stack>
                    {p.errors.profileType && (
                        <Typography variant="body2" sx={{ color: "error.main", mt: 0.5 }}>
                            {t(p.errors.profileType.message!)}
                        </Typography>
                    )}
                </Box>

                <Divider />

                <Stack spacing={2} component="form" onSubmit={p.handleSubmit}>
                    <TextField
                        label={t("profileCompletion.firstNameLabel")}
                        {...p.register("firstName")}
                        error={!!p.errors.firstName}
                        helperText={
                            p.errors.firstName?.message ? t(p.errors.firstName.message) : undefined
                        }
                        fullWidth
                    />
                    <TextField
                        label={t("profileCompletion.lastNameLabel")}
                        {...p.register("lastName")}
                        error={!!p.errors.lastName}
                        helperText={
                            p.errors.lastName?.message ? t(p.errors.lastName.message) : undefined
                        }
                        fullWidth
                    />
                    <TextField
                        label={t("profileCompletion.phoneLabel")}
                        {...p.register("phoneNumber")}
                        error={!!p.errors.phoneNumber}
                        helperText={
                            p.errors.phoneNumber?.message
                                ? t(p.errors.phoneNumber.message)
                                : undefined
                        }
                        fullWidth
                    />
                    <TextField
                        label={t("profileCompletion.birthDateLabel")}
                        type="date"
                        {...p.register("birthDate")}
                        error={!!p.errors.birthDate}
                        helperText={
                            p.errors.birthDate?.message ? t(p.errors.birthDate.message) : undefined
                        }
                        slotProps={{ inputLabel: { shrink: true } }}
                        fullWidth
                    />
                    <FormControl fullWidth error={!!p.errors.gender}>
                        <InputLabel id="gender-label">
                            {t("profileCompletion.genderLabel")}
                        </InputLabel>
                        <Controller
                            name="gender"
                            control={p.control}
                            render={({ field }) => (
                                <Select
                                    labelId="gender-label"
                                    label={t("profileCompletion.genderLabel")}
                                    {...field}
                                >
                                    {p.genderOptions.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            )}
                        />
                    </FormControl>

                    {p.watchedProfileType === "Doctor" && (
                        <TextField
                            label={t("profileCompletion.licenseNumberLabel")}
                            {...p.register("licenseNumber")}
                            error={!!p.errors.licenseNumber}
                            helperText={
                                p.errors.licenseNumber?.message
                                    ? t(p.errors.licenseNumber.message)
                                    : undefined
                            }
                            fullWidth
                            required
                        />
                    )}

                    {p.completionMutation.isError && (
                        <Alert severity="error">{t("profileCompletion.saveError")}</Alert>
                    )}

                    <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={!p.profileType || p.isPending}
                        sx={{ textTransform: "none", fontWeight: 700, py: 1.2 }}
                    >
                        {p.isPending ? t("common.saving") : t("profileCompletion.saveButton")}
                    </Button>
                </Stack>
            </Stack>
        </AuthPageShell>
    );
};

export default ProfileCompletionPage;
