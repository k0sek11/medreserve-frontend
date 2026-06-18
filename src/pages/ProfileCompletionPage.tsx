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
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AuthPageShell from "../components/auth/AuthPageShell";
import { RoleCard } from "../components/auth/RoleCard";
import { authApi, type CompleteProfileRequest } from "../api/auth";
import { useAuthUser, authUserQueryKey } from "../hooks/useAuthUser";
import type { ProfileType } from "../types/profile";
import { profileCompletionSchema, type ProfileCompletionFormData } from "../lib/validations";

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

    const {
        register,
        handleSubmit,
        control,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<ProfileCompletionFormData>({
        resolver: zodResolver(profileCompletionSchema),
        defaultValues: {
            profileType: undefined,
            firstName: user?.firstName ?? "",
            lastName: user?.lastName ?? "",
            phoneNumber: "",
            birthDate: "",
            gender: genderOptions[0].value,
            licenseNumber: "",
        },
    });

    const completionMutation = useMutation({
        mutationFn: (payload: CompleteProfileRequest) => authApi.completeProfile(payload),
        onSuccess: async (_, variables) => {
            await queryClient.invalidateQueries({ queryKey: authUserQueryKey });
            navigate(variables.profileType === "Doctor" ? "/powiadomienia" : "/", {
                replace: true,
            });
        },
    });

    const onSubmit = (data: ProfileCompletionFormData) => {
        if (data.profileType !== "Doctor" && data.profileType !== "Patient") return;
        completionMutation.mutate({
            profileType: data.profileType,
            firstName: data.firstName.trim(),
            lastName: data.lastName.trim(),
            phoneNumber: data.phoneNumber.trim(),
            birthDate: data.birthDate,
            gender: data.gender,
            licenseNumber: data.profileType === "Doctor" ? (data.licenseNumber ?? "").trim() : null,
        });
    };

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

    const watchedProfileType = watch("profileType");

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
                            active={profileType === "Doctor"}
                            title={t("profileCompletion.doctor")}
                            description={t("profileCompletion.doctorDesc")}
                            onClick={() => {
                                setProfileType("Doctor");
                                setValue("profileType", "Doctor", { shouldValidate: true });
                            }}
                        />
                        <RoleCard
                            active={profileType === "Patient"}
                            title={t("profileCompletion.patient")}
                            description={t("profileCompletion.patientDesc")}
                            onClick={() => {
                                setProfileType("Patient");
                                setValue("profileType", "Patient", { shouldValidate: true });
                            }}
                        />
                    </Stack>
                    {errors.profileType && (
                        <Typography variant="body2" sx={{ color: "error.main", mt: 0.5 }}>
                            {t(errors.profileType.message!)}
                        </Typography>
                    )}
                </Box>

                <Divider />

                <Stack spacing={2} component="form" onSubmit={handleSubmit(onSubmit)}>
                    <TextField
                        label={t("profileCompletion.firstNameLabel")}
                        {...register("firstName")}
                        error={!!errors.firstName}
                        helperText={
                            errors.firstName?.message ? t(errors.firstName.message) : undefined
                        }
                        fullWidth
                    />
                    <TextField
                        label={t("profileCompletion.lastNameLabel")}
                        {...register("lastName")}
                        error={!!errors.lastName}
                        helperText={
                            errors.lastName?.message ? t(errors.lastName.message) : undefined
                        }
                        fullWidth
                    />
                    <TextField
                        label={t("profileCompletion.phoneLabel")}
                        {...register("phoneNumber")}
                        error={!!errors.phoneNumber}
                        helperText={
                            errors.phoneNumber?.message ? t(errors.phoneNumber.message) : undefined
                        }
                        fullWidth
                    />
                    <TextField
                        label={t("profileCompletion.birthDateLabel")}
                        type="date"
                        {...register("birthDate")}
                        error={!!errors.birthDate}
                        helperText={
                            errors.birthDate?.message ? t(errors.birthDate.message) : undefined
                        }
                        slotProps={{ inputLabel: { shrink: true } }}
                        fullWidth
                    />
                    <FormControl fullWidth error={!!errors.gender}>
                        <InputLabel id="gender-label">
                            {t("profileCompletion.genderLabel")}
                        </InputLabel>
                        <Controller
                            name="gender"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    labelId="gender-label"
                                    label={t("profileCompletion.genderLabel")}
                                    {...field}
                                >
                                    {genderOptions.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            )}
                        />
                    </FormControl>

                    {watchedProfileType === "Doctor" && (
                        <TextField
                            label={t("profileCompletion.licenseNumberLabel")}
                            {...register("licenseNumber")}
                            error={!!errors.licenseNumber}
                            helperText={
                                errors.licenseNumber?.message
                                    ? t(errors.licenseNumber.message)
                                    : undefined
                            }
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
                        disabled={!profileType || completionMutation.isPending || isSubmitting}
                        sx={{ textTransform: "none", fontWeight: 700, py: 1.2 }}
                    >
                        {completionMutation.isPending || isSubmitting
                            ? t("common.saving")
                            : t("profileCompletion.saveButton")}
                    </Button>
                </Stack>
            </Stack>
        </AuthPageShell>
    );
};

export default ProfileCompletionPage;
