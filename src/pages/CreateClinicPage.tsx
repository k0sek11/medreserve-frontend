import {
    Alert,
    Box,
    Button,
    CircularProgress,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { plPL } from "@mui/x-date-pickers/locales";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Show } from "../components/shared/ShowHide";
import { useCreateClinic } from "../hooks/useCreateClinic";

export const CreateClinicPage = () => {
    const { t } = useTranslation();
    const c = useCreateClinic();

    if (c.shouldRedirect) return <Navigate to="/" replace />;

    return (
        <LocalizationProvider
            dateAdapter={AdapterDayjs}
            adapterLocale="pl"
            localeText={plPL.components.MuiLocalizationProvider.defaultProps.localeText}
        >
            <Box
                component="form"
                onSubmit={c.handleSubmit}
                sx={{ maxWidth: 760, mx: "auto", p: 2 }}
            >
                <Paper
                    elevation={0}
                    sx={{ p: { xs: 3, md: 4 }, border: "1px solid #dce5f2", borderRadius: 3 }}
                >
                    <Stack spacing={3}>
                        <Box>
                            <Typography
                                variant="h4"
                                component="h1"
                                sx={{ fontWeight: 800, color: "#11223a" }}
                            >
                                {t("createClinic.title")}
                            </Typography>
                            <Typography sx={{ color: "#4f627a", mt: 1 }}>
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
                            <TextField
                                label={t("createClinic.address")}
                                name="streetAddress"
                                value={c.formData.streetAddress}
                                onChange={c.handleChange}
                                required
                                fullWidth
                            />

                            <FormControl required fullWidth>
                                <InputLabel id="city-select-label">
                                    {t("createClinic.city")}
                                </InputLabel>
                                <Select
                                    labelId="city-select-label"
                                    name="cityId"
                                    value={c.formData.cityId}
                                    label={t("createClinic.city")}
                                    onChange={c.handleSelectChange}
                                    disabled={c.citiesQuery.isLoading || c.citiesQuery.isError}
                                >
                                    <Show when={c.citiesQuery.isLoading}>
                                        <MenuItem disabled value="">
                                            <CircularProgress size={20} sx={{ mr: 2 }} />{" "}
                                            {t("createClinic.loadingCities")}
                                        </MenuItem>
                                    </Show>
                                    <Show when={Boolean(c.citiesQuery.isError)}>
                                        <MenuItem disabled value="">
                                            {t("createClinic.citiesError")}
                                        </MenuItem>
                                    </Show>
                                    {c.citiesQuery.data?.map((city) => (
                                        <MenuItem key={city.cityId} value={String(city.cityId)}>
                                            {city.name} ({city.voivodeship})
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

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
                                <Typography variant="body2" sx={{ color: "#b42318" }}>
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
                            <TextField
                                label={t("createClinic.mapLocation")}
                                name="mapLocation"
                                value={c.formData.mapLocation}
                                onChange={c.handleChange}
                                fullWidth
                            />
                        </Stack>

                        <Stack direction="row" spacing={2} sx={{ justifyContent: "flex-end" }}>
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={!c.canSubmit || c.citiesQuery.isLoading || !c.isDoctor}
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
