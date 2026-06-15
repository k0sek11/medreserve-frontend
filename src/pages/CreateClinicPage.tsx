import { Alert, Box, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { plPL } from "@mui/x-date-pickers/locales";
import { enUS } from "@mui/x-date-pickers/locales";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Show } from "../components/shared/ShowHide";
import { MapLocationPicker } from "../components/shared/MapLocationPicker";
import { useCreateClinic } from "../hooks/useCreateClinic";

export const CreateClinicPage = () => {
    const { t, i18n } = useTranslation();
    const c = useCreateClinic();

    const locale = i18n.language?.startsWith("en") ? "en" : "pl";
    const localeText =
        locale === "en"
            ? enUS.components.MuiLocalizationProvider.defaultProps.localeText
            : plPL.components.MuiLocalizationProvider.defaultProps.localeText;

    if (c.shouldRedirect) return <Navigate to="/" replace />;

    return (
        <LocalizationProvider
            dateAdapter={AdapterDayjs}
            adapterLocale={locale}
            localeText={localeText}
        >
            <Box
                component="form"
                onSubmit={c.handleSubmit}
                sx={{ maxWidth: 760, mx: "auto", p: 2 }}
            >
                <Paper
                    elevation={0}
                    sx={{ p: { xs: 3, md: 4 }, border: (t) => `1px solid ${t.palette.divider}`, borderRadius: 3 }}
                >
                    <Stack spacing={3}>
                        <Box>
                            <Typography
                                variant="h4"
                                component="h1"
                                sx={{ fontWeight: 800, color: "text.primary" }}
                            >
                                {t("createClinic.title")}
                            </Typography>
                            <Typography sx={{ color: "text.secondary", mt: 1 }}>
                                {t("createClinic.subtitle")}
                            </Typography>
                        </Box>

                        <Show when={Boolean(c.submitError)}>
                            <Alert severity="error">{c.submitError}</Alert>
                        </Show>

                        <Stack spacing={2}>
                            <TextField
                                label={t("createClinic.clinicName")}
                                name="name"
                                value={c.formData.name}
                                onChange={c.handleChange}
                                required
                                fullWidth
                            />
                            <TextField
                                label={t("createClinic.description")}
                                name="description"
                                value={c.formData.description}
                                onChange={c.handleChange}
                                multiline
                                rows={3}
                                fullWidth
                            />

                            <MapLocationPicker
                                label={t("createClinic.location")}
                                lat={c.formData.lat}
                                lng={c.formData.lng}
                                city={c.formData.city}
                                onChange={c.setLocation}
                                height={300}
                                required
                            />

                            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                                <TimePicker
                                    label={t("createClinic.openingTime")}
                                    value={c.openingFrom}
                                    onChange={c.setOpeningFrom}
                                    ampm={false}
                                    slotProps={{ textField: { fullWidth: true, required: true } }}
                                />
                                <TimePicker
                                    label={t("createClinic.closingTime")}
                                    value={c.openingTo}
                                    onChange={c.setOpeningTo}
                                    ampm={false}
                                    slotProps={{ textField: { fullWidth: true, required: true } }}
                                />
                            </Stack>

                            <Show when={c.openingHoursInvalid}>
                                <Typography variant="body2" sx={{ color: "error.main" }}>
                                    {t("createClinic.openingHoursInvalid")}
                                </Typography>
                            </Show>

                            <TextField
                                label={t("common.phone")}
                                name="phoneNumber"
                                value={c.formData.phoneNumber}
                                onChange={c.handleChange}
                                type="tel"
                                inputMode="tel"
                                placeholder={t("createClinic.phonePlaceholder")}
                                error={c.phoneError}
                                helperText={c.phoneError ? t("createClinic.phoneError") : ""}
                                fullWidth
                            />
                            <TextField
                                label={t("common.email")}
                                name="email"
                                type="email"
                                value={c.formData.email}
                                onChange={c.handleChange}
                                fullWidth
                            />
                        </Stack>

                        <Stack direction="row" spacing={2} sx={{ justifyContent: "flex-end" }}>
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={!c.canSubmit || !c.isDoctor}
                                sx={{ textTransform: "none", fontWeight: 700 }}
                            >
                                {c.createClinicMutation.isPending
                                    ? t("common.saving")
                                    : t("createClinic.saveClinic")}
                            </Button>
                        </Stack>
                    </Stack>
                </Paper>
            </Box>
        </LocalizationProvider>
    );
};
