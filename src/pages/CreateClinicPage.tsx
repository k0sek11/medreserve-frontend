import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
    type SelectChangeEvent,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { plPL } from "@mui/x-date-pickers/locales";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import dayjs, { type Dayjs } from "dayjs";
import { Navigate, useNavigate } from "react-router-dom";

import { clinicsApi } from "../api/clinics";
import { useAuthUser } from "../hooks/useAuthUser";

export const CreateClinicPage = () => {
    const { data: authUser, isLoading: isAuthLoading } = useAuthUser();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const isDoctor = Boolean(authUser?.doctorProfileId);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        streetAddress: "",
        mapLocation: "",
        cityId: "",
        phoneNumber: "",
        email: "",
    });
    const [openingFrom, setOpeningFrom] = useState<Dayjs | null>(dayjs().hour(8).minute(0));
    const [openingTo, setOpeningTo] = useState<Dayjs | null>(dayjs().hour(16).minute(0));
    const [submitError, setSubmitError] = useState<string | null>(null);

    const citiesQuery = useQuery({
        queryKey: ["clinic-cities"],
        queryFn: () => clinicsApi.list({ view: "cities" }),
        enabled: isDoctor,
    });

    const createClinicMutation = useMutation({
        mutationFn: clinicsApi.create,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["clinic-mine"] });
            navigate("/moje-przychodnie", { replace: true });
        },
        onError: (error) => {
            setSubmitError(
                error instanceof Error ? error.message : "Nie udało się utworzyć przychodni.",
            );
        },
    });

    const phonePattern = /^\+?[0-9\s()-]{7,20}$/;
    const phoneValue = formData.phoneNumber.trim();
    const phoneError = phoneValue.length > 0 && !phonePattern.test(phoneValue);
    const openingHoursValue = useMemo(() => {
        if (!openingFrom || !openingTo) {
            return null;
        }

        return `${openingFrom.format("HH:mm")}-${openingTo.format("HH:mm")}`;
    }, [openingFrom, openingTo]);
    const openingHoursInvalid = Boolean(
        openingFrom && openingTo && openingTo.isBefore(openingFrom),
    );
    const canSubmit =
        Boolean(formData.name.trim()) &&
        Boolean(formData.streetAddress.trim()) &&
        Boolean(formData.cityId) &&
        Boolean(openingHoursValue) &&
        !openingHoursInvalid &&
        !phoneError &&
        !createClinicMutation.isPending;

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (event: SelectChangeEvent<string>) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name as string]: value }));
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        setSubmitError(null);

        if (!openingHoursValue || openingHoursInvalid) {
            setSubmitError("Godziny otwarcia muszą mieć poprawny zakres.");
            return;
        }

        if (phoneError) {
            setSubmitError("Podaj poprawny numer telefonu albo zostaw pole puste.");
            return;
        }

        createClinicMutation.mutate({
            name: formData.name.trim(),
            description: formData.description.trim() || null,
            streetAddress: formData.streetAddress.trim(),
            openingHours: openingHoursValue,
            mapLocation: formData.mapLocation.trim() || null,
            cityId: Number(formData.cityId),
            phoneNumber: phoneValue || null,
            email: formData.email.trim() || null,
        });
    };

    if (!isAuthLoading && !isDoctor) {
        return <Navigate to="/" replace />;
    }

    return (
        <LocalizationProvider
            dateAdapter={AdapterDayjs}
            adapterLocale="pl"
            localeText={plPL.components.MuiLocalizationProvider.defaultProps.localeText}
        >
            <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 760, mx: "auto", p: 2 }}>
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

                        {submitError ? <Alert severity="error">{submitError}</Alert> : null}

                        <Stack spacing={2}>
                            <TextField
                                label="Nazwa przychodni"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                fullWidth
                            />

                            <TextField
                                label="Opis"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                multiline
                                rows={3}
                                fullWidth
                            />

                            <TextField
                                label="Adres"
                                name="streetAddress"
                                value={formData.streetAddress}
                                onChange={handleChange}
                                required
                                fullWidth
                            />

                            <FormControl required fullWidth>
                                <InputLabel id="city-select-label">Miasto</InputLabel>
                                <Select
                                    labelId="city-select-label"
                                    name="cityId"
                                    value={formData.cityId}
                                    label="Miasto"
                                    onChange={handleSelectChange}
                                    disabled={citiesQuery.isLoading || citiesQuery.isError}
                                >
                                    {citiesQuery.isLoading && (
                                        <MenuItem disabled value="">
                                            <CircularProgress size={20} sx={{ mr: 2 }} /> Ładowanie
                                            miast...
                                        </MenuItem>
                                    )}

                                    {citiesQuery.isError && (
                                        <MenuItem disabled value="">
                                            Błąd pobierania miast
                                        </MenuItem>
                                    )}

                                    {citiesQuery.data?.map((city) => (
                                        <MenuItem key={city.cityId} value={String(city.cityId)}>
                                            {city.name} ({city.voivodeship})
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                                <TimePicker
                                    label="Godzina otwarcia"
                                    value={openingFrom}
                                    onChange={setOpeningFrom}
                                    ampm={false}
                                    slotProps={{ textField: { fullWidth: true, required: true } }}
                                />
                                <TimePicker
                                    label="Godzina zamknięcia"
                                    value={openingTo}
                                    onChange={setOpeningTo}
                                    ampm={false}
                                    slotProps={{ textField: { fullWidth: true, required: true } }}
                                />
                            </Stack>

                            {openingHoursInvalid ? (
                                <Typography variant="body2" sx={{ color: "#b42318" }}>
                                    Godzina zamknięcia musi być późniejsza niż otwarcie.
                                </Typography>
                            ) : null}

                            <TextField
                                label="Telefon"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                type="tel"
                                inputMode="tel"
                                placeholder="np. +48 123 456 789"
                                error={phoneError}
                                helperText={
                                    phoneError
                                        ? "Podaj poprawny numer telefonu lub zostaw pole puste."
                                        : ""
                                }
                                fullWidth
                            />

                            <TextField
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                fullWidth
                            />

                            <TextField
                                label="Lokalizacja na mapie"
                                name="mapLocation"
                                value={formData.mapLocation}
                                onChange={handleChange}
                                fullWidth
                            />
                        </Stack>

                        <Stack direction="row" spacing={2} sx={{ justifyContent: "flex-end" }}>
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={!canSubmit || citiesQuery.isLoading || !isDoctor}
                                sx={{ textTransform: "none", fontWeight: 700 }}
                            >
                                {createClinicMutation.isPending
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
