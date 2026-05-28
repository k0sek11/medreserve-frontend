import { useMemo } from "react";
import { Alert, Box, Button, Paper, Stack, Typography } from "@mui/material";
import { useLocation, useParams, Link as RouterLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
    appointmentsApi,
    type AppointmentDetailDto,
    type BookAppointmentResultDto,
} from "../api/appointments";

const AppointmentConfirmationPage = () => {
    const { appointmentId } = useParams();
    const location = useLocation();
    const state = location.state as BookAppointmentResultDto | null;
    const parsedAppointmentId = Number(appointmentId);
    const hasValidId = Number.isFinite(parsedAppointmentId) && parsedAppointmentId > 0;

    const { data, isLoading } = useQuery({
        queryKey: ["appointment-confirmation", parsedAppointmentId],
        queryFn: () => appointmentsApi.getById(parsedAppointmentId),
        enabled: hasValidId && !state,
    });

    const appointment = data ?? state;

    const title = useMemo(() => {
        if (appointment?.status === "Confirmed") {
            return "Wizyta potwierdzona";
        }

        return "Wizyta została zarezerwowana";
    }, [appointment?.status]);

    if (!hasValidId) {
        return (
            <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: "1px solid #dce5f2" }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: "#11223a" }}>
                    Nieprawidłowy numer wizyty
                </Typography>
            </Paper>
        );
    }

    if (isLoading) {
        return (
            <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: "1px solid #dce5f2" }}>
                <Typography sx={{ color: "#4f627a" }}>Ładowanie podsumowania wizyty...</Typography>
            </Paper>
        );
    }

    if (!appointment) {
        return (
            <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: "1px solid #dce5f2" }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: "#11223a" }}>
                    Nie udało się pobrać podsumowania wizyty
                </Typography>
            </Paper>
        );
    }

    return (
        <Paper
            elevation={0}
            sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 3, border: "1px solid #dce5f2" }}
        >
            <Stack spacing={2.5}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: "#11223a", mb: 1 }}>
                        {title}
                    </Typography>
                    <Typography sx={{ color: "#4f627a" }}>
                        Poniżej znajdziesz numer wizyty i najważniejsze informacje.
                    </Typography>
                </Box>

                <Alert severity="info">Status wizyty: {appointment.status}</Alert>

                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
                        gap: 2,
                    }}
                >
                    <SummaryCard label="Numer wizyty" value={`#${appointment.appointmentId}`} />
                    <SummaryCard label="Lekarz" value={getAppointmentDoctorName(appointment)} />
                    <SummaryCard
                        label="Specjalizacja"
                        value={getAppointmentSpecialization(appointment)}
                    />
                    <SummaryCard label="Typ wizyty" value={getAppointmentType(appointment)} />
                    <SummaryCard label="Data" value={appointment.date} />
                    <SummaryCard
                        label="Godzina"
                        value={`${appointment.startTime} - ${appointment.endTime}`}
                    />
                </Box>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                    <Button
                        component={RouterLink}
                        to="/moje-wizyty"
                        variant="contained"
                        sx={{ textTransform: "none", fontWeight: 700 }}
                    >
                        Przejdź do moich wizyt
                    </Button>
                    <Button
                        component={RouterLink}
                        to="/lekarze"
                        variant="outlined"
                        sx={{ textTransform: "none" }}
                    >
                        Umów kolejną wizytę
                    </Button>
                </Stack>
            </Stack>
        </Paper>
    );
};

const SummaryCard = ({ label, value }: { label: string; value: string }) => (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Typography sx={{ color: "#4f627a", fontSize: 13, mb: 0.5 }}>{label}</Typography>
        <Typography sx={{ color: "#11223a", fontWeight: 700 }}>{value}</Typography>
    </Paper>
);

const getAppointmentDoctorName = (appointment: BookAppointmentResultDto | AppointmentDetailDto) => {
    if ("doctorName" in appointment) {
        return appointment.doctorName ?? "-";
    }

    return "-";
};

const getAppointmentSpecialization = (
    appointment: BookAppointmentResultDto | AppointmentDetailDto,
) => {
    if ("doctorSpecialization" in appointment) {
        return appointment.doctorSpecialization || "-";
    }

    return "-";
};

const getAppointmentType = (appointment: BookAppointmentResultDto | AppointmentDetailDto) => {
    if ("appointmentType" in appointment) {
        return appointment.appointmentType ?? "Nieznane";
    }

    return "-";
};

export default AppointmentConfirmationPage;
