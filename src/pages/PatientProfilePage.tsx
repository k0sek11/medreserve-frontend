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
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { usePatientProfile } from "../hooks/usePatientProfile";

const PatientProfilePage = () => {
    const { t } = useTranslation();
    const p = usePatientProfile();

    if (p.profileQuery.isLoading) {
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
                <Stack spacing={2.5} component="form" onSubmit={p.onSubmit}>
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
                        <InputLabel>{t("profileCompletion.genderLabel")}</InputLabel>
                        <Controller
                            name="gender"
                            control={p.control}
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
                        disabled={p.saveMutation.isPending || p.isSubmitting}
                        sx={{ fontWeight: 700 }}
                    >
                        {p.saveMutation.isPending || p.isSubmitting
                            ? t("common.saving")
                            : t("common.save")}
                    </Button>
                    {p.saveMutation.isSuccess && p.isSubmitSuccessful && (
                        <Typography sx={{ color: "success.main", fontWeight: 600 }}>
                            {t("patientProfile.saved")}
                        </Typography>
                    )}
                    {p.saveMutation.isError && (
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
