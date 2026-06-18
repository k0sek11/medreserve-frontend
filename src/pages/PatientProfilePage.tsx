import { useEffect } from "react";
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
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { api } from "../lib/axios";
import { patientProfileSchema, type PatientProfileFormData } from "../lib/validations";

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

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors, isSubmitting, isSubmitSuccessful },
    } = useForm<PatientProfileFormData>({
        resolver: zodResolver(patientProfileSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            phoneNumber: "",
            birthDate: "",
            gender: "",
        },
    });

    const profileQuery = useQuery({
        queryKey: ["patient-profile"],
        queryFn: () => usersApi.getMyProfile(),
    });

    useEffect(() => {
        if (profileQuery.data) {
            reset({
                firstName: profileQuery.data.firstName ?? "",
                lastName: profileQuery.data.lastName ?? "",
                phoneNumber: profileQuery.data.phoneNumber ?? "",
                birthDate: profileQuery.data.birthDate ?? "",
                gender: profileQuery.data.gender ?? "",
            });
        }
    }, [profileQuery.data, reset]);

    const saveMutation = useMutation({
        mutationFn: (data: PatientProfileFormData) =>
            usersApi.updateMyProfile({
                firstName: data.firstName.trim(),
                lastName: data.lastName.trim(),
                phoneNumber: data.phoneNumber.trim(),
                birthDate: data.birthDate,
                gender: data.gender,
            }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["patient-profile"] });
        },
    });

    const onSubmit = (data: PatientProfileFormData) => {
        saveMutation.mutate(data);
    };

    if (profileQuery.isLoading) {
        return (
            <Paper
                elevation={0}
                sx={{ p: 4, borderRadius: 3, border: (t) => `1px solid ${t.palette.divider}` }}
            >
                <Typography sx={{ color: "text.secondary" }}>{t("common.loadingData")}</Typography>
            </Paper>
        );
    }

    return (
        <Box sx={{ maxWidth: 640 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "text.primary", mb: 0.8 }}>
                {t("patientProfile.title")}
            </Typography>
            <Typography sx={{ color: "text.secondary", mb: 3 }}>
                {t("patientProfile.subtitle")}
            </Typography>
            <Paper
                elevation={0}
                sx={{ p: 3, borderRadius: 3, border: (t) => `1px solid ${t.palette.divider}` }}
            >
                <Stack spacing={2.5} component="form" onSubmit={handleSubmit(onSubmit)}>
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
                        <InputLabel>{t("profileCompletion.genderLabel")}</InputLabel>
                        <Controller
                            name="gender"
                            control={control}
                            render={({ field }) => (
                                <Select label={t("profileCompletion.genderLabel")} {...field}>
                                    <MenuItem value="Kobieta">
                                        {t("profileCompletion.genderOptions.female")}
                                    </MenuItem>
                                    <MenuItem value="Mezczyzna">
                                        {t("profileCompletion.genderOptions.male")}
                                    </MenuItem>
                                    <MenuItem value="Inne">
                                        {t("profileCompletion.genderOptions.other")}
                                    </MenuItem>
                                </Select>
                            )}
                        />
                    </FormControl>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={saveMutation.isPending || isSubmitting}
                        sx={{ fontWeight: 700 }}
                    >
                        {saveMutation.isPending || isSubmitting
                            ? t("common.saving")
                            : t("common.save")}
                    </Button>
                    {saveMutation.isSuccess && isSubmitSuccessful && (
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
