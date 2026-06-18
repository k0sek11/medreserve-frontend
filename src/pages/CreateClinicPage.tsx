import { Alert, Box, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { plPL } from "@mui/x-date-pickers/locales";
import { enUS } from "@mui/x-date-pickers/locales";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { Controller } from "react-hook-form";
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
                    sx={{
                        p: { xs: 3, md: 4 },
                        border: (t) => `1px solid ${t.palette.divider}`,
                        borderRadius: 3,
                    }}
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

                        <Show when={Boolean(c.rootError)}>
                            <Alert severity="error">{c.rootError}</Alert>
                        </Show>

                        <Stack spacing={2}>
                            <TextField
                                label={t("createClinic.clinicName")}
                                {...c.register("name")}
                                error={!!c.errors.name}
                                helperText={
                                    c.errors.name?.message ? t(c.errors.name.message) : undefined
                                }
                                fullWidth
                            />
                            <TextField
                                label={t("createClinic.description")}
                                {...c.register("description")}
                                error={!!c.errors.description}
                                helperText={
                                    c.errors.description?.message
                                        ? t(c.errors.description.message)
                                        : undefined
                                }
                                multiline
                                rows={3}
                                fullWidth
                            />

                            <Controller
                                name="lat"
                                control={c.control}
                                render={({ field }) => (
                                    <MapLocationPicker
                                        label={t("createClinic.location")}
                                        lat={field.value || null}
                                        lng={c.watch("lng") || null}
                                        city={c.watch("city")}
                                        onChange={c.setLocation}
                                        height={300}
                                    />
                                )}
                            />

                            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                                <Controller
                                    name="openingFrom"
                                    control={c.control}
                                    render={({ field }) => (
                                        <TimePicker
                                            label={t("createClinic.openingTime")}
                                            value={c.openingFrom}
                                            onChange={(val) => {
                                                c.setOpeningFrom(val);
                                                field.onChange(val ? val.format("HH:mm") : "08:00");
                                            }}
                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    error: !!c.errors.openingFrom,
                                                },
                                            }}
                                        />
                                    )}
                                />
                                <Controller
                                    name="openingTo"
                                    control={c.control}
                                    render={({ field }) => (
                                        <TimePicker
                                            label={t("createClinic.closingTime")}
                                            value={c.openingTo}
                                            onChange={(val) => {
                                                c.setOpeningTo(val);
                                                field.onChange(val ? val.format("HH:mm") : "16:00");
                                            }}
                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    error: !!c.errors.openingTo,
                                                },
                                            }}
                                        />
                                    )}
                                />
                            </Stack>

                            <Show when={c.openingHoursInvalid}>
                                <Typography variant="body2" sx={{ color: "error.main" }}>
                                    {t("createClinic.openingHoursInvalid")}
                                </Typography>
                            </Show>

                            <TextField
                                label={t("common.phone")}
                                {...c.register("phoneNumber")}
                                type="tel"
                                inputMode="tel"
                                placeholder={t("createClinic.phonePlaceholder")}
                                error={c.phoneError || !!c.errors.phoneNumber}
                                helperText={
                                    c.phoneError
                                        ? t("createClinic.phoneError")
                                        : c.errors.phoneNumber?.message
                                          ? t(c.errors.phoneNumber.message)
                                          : ""
                                }
                                fullWidth
                            />
                            <TextField
                                label={t("common.email")}
                                type="email"
                                {...c.register("email")}
                                error={!!c.errors.email}
                                helperText={
                                    c.errors.email?.message ? t(c.errors.email.message) : undefined
                                }
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
