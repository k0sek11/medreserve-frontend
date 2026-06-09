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
import { Show } from "../components/shared/ShowHide";
import { useCreateClinic } from "../hooks/useCreateClinic";

export const CreateClinicPage = () => {
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
                                Zarejestruj przychodnię
                            </Typography>
                            <Typography sx={{ color: "#4f627a", mt: 1 }}>
                                Uzupełnij dane podstawowe. Klinika zostanie utworzona jako aktywna i
                                przypisana do Twojego profilu lekarza.
                            </Typography>
                        </Box>

                        <Show when={Boolean(c.submitError)}>
                            <Alert severity="error">{c.submitError}</Alert>
                        </Show>

                        <Stack spacing={2}>
                            <TextField
                                label="Nazwa przychodni"
                                name="name"
                                value={c.formData.name}
                                onChange={c.handleChange}
                                required
                                fullWidth
                            />
                            <TextField
                                label="Opis"
                                name="description"
                                value={c.formData.description}
                                onChange={c.handleChange}
                                multiline
                                rows={3}
                                fullWidth
                            />
                            <TextField
                                label="Adres"
                                name="streetAddress"
                                value={c.formData.streetAddress}
                                onChange={c.handleChange}
                                required
                                fullWidth
                            />

                            <FormControl required fullWidth>
                                <InputLabel id="city-select-label">Miasto</InputLabel>
                                <Select
                                    labelId="city-select-label"
                                    name="cityId"
                                    value={c.formData.cityId}
                                    label="Miasto"
                                    onChange={c.handleSelectChange}
                                    disabled={c.citiesQuery.isLoading || c.citiesQuery.isError}
                                >
                                    <Show when={c.citiesQuery.isLoading}>
                                        <MenuItem disabled value="">
                                            <CircularProgress size={20} sx={{ mr: 2 }} /> Ładowanie
                                            miast...
                                        </MenuItem>
                                    </Show>
                                    <Show when={Boolean(c.citiesQuery.isError)}>
                                        <MenuItem disabled value="">
                                            Błąd pobierania miast
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
                                    label="Godzina otwarcia"
                                    value={c.openingFrom}
                                    onChange={c.setOpeningFrom}
                                    ampm={false}
                                    slotProps={{ textField: { fullWidth: true, required: true } }}
                                />
                                <TimePicker
                                    label="Godzina zamknięcia"
                                    value={c.openingTo}
                                    onChange={c.setOpeningTo}
                                    ampm={false}
                                    slotProps={{ textField: { fullWidth: true, required: true } }}
                                />
                            </Stack>

                            <Show when={c.openingHoursInvalid}>
                                <Typography variant="body2" sx={{ color: "#b42318" }}>
                                    Godzina zamknięcia musi być późniejsza niż otwarcie.
                                </Typography>
                            </Show>

                            <TextField
                                label="Telefon"
                                name="phoneNumber"
                                value={c.formData.phoneNumber}
                                onChange={c.handleChange}
                                type="tel"
                                inputMode="tel"
                                placeholder="np. +48 123 456 789"
                                error={c.phoneError}
                                helperText={
                                    c.phoneError
                                        ? "Podaj poprawny numer telefonu lub zostaw pole puste."
                                        : ""
                                }
                                fullWidth
                            />
                            <TextField
                                label="Email"
                                name="email"
                                type="email"
                                value={c.formData.email}
                                onChange={c.handleChange}
                                fullWidth
                            />
                            <TextField
                                label="Lokalizacja na mapie"
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
                                    ? "Zapisywanie..."
                                    : "Zapisz przychodnię"}
                            </Button>
                        </Stack>
                    </Stack>
                </Paper>
            </Box>
        </LocalizationProvider>
    );
};
