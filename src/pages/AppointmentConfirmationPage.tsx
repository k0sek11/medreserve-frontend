import { useMemo } from "react";
import { Alert, Button, Chip, Stack } from "@mui/material";
import { useLocation, useParams, Link as RouterLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
    appointmentsApi,
    type AppointmentDetailDto,
    type BookAppointmentResultDto,
} from "../api/appointments";

// Słowniki (żeby zachować spójność z poprzednią stroną)
const statusTranslations: Record<string, string> = {
    PendingConfirmation: "Oczekuje na potwierdzenie",
    AwaitingPayment: "Oczekuje na płatność online",
    AwaitingOnSitePayment: "Płatność na miejscu",
    Confirmed: "Potwierdzona",
    Cancelled: "Anulowana",
    Unpaid: "Niezapłacona (przeterminowana)",
};

const statusColors: Record<string, "default" | "primary" | "success" | "error" | "warning"> = {
    PendingConfirmation: "warning",
    AwaitingPayment: "primary",
    AwaitingOnSitePayment: "warning",
    Confirmed: "success",
    Cancelled: "error",
    Unpaid: "error",
};

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
            return "Wizyta potwierdzona!";
        }
        return "Wizyta została zarezerwowana!";
    }, [appointment?.status]);

    // --- Ekrany błędów / ładowania w nowoczesnym stylu ---
    if (!hasValidId) {
        return (
            <div className="min-h-screen bg-slate-50 py-12 px-4 flex justify-center">
                <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-center">
                    <span className="text-5xl block mb-4">🤷‍♂️</span>
                    <h2 className="text-xl font-bold text-slate-800">Nieprawidłowy numer wizyty</h2>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 py-12 px-4 flex justify-center">
                <div className="max-w-xl w-full bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                    <Alert severity="info" className="rounded-xl">
                        Ładowanie podsumowania wizyty...
                    </Alert>
                </div>
            </div>
        );
    }

    if (!appointment) {
        return (
            <div className="min-h-screen bg-slate-50 py-12 px-4 flex justify-center">
                <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-center">
                    <span className="text-5xl block mb-4">❌</span>
                    <h2 className="text-xl font-bold text-slate-800">
                        Nie udało się pobrać podsumowania
                    </h2>
                </div>
            </div>
        );
    }

    // --- Główny ekran podsumowania ---
    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-8 flex justify-center items-start">
            {/* Główna karta "Bilet" */}
            <div className="max-w-2xl w-full bg-white rounded-[2rem] p-6 sm:p-10 border border-slate-100 shadow-sm relative overflow-hidden">
                {/* Dekoracyjny pasek na górze karty */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-blue-500"></div>

                <Stack spacing={4}>
                    {/* Sekcja nagłówka (Ikona + Tytuł) */}
                    <div className="text-center mt-2">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-50 rounded-full mb-4">
                            <span className="text-4xl">
                                {appointment.status === "Confirmed" ? "✅" : "⏳"}
                            </span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                            {title}
                        </h1>
                        <p className="text-slate-500 font-medium">
                            Poniżej znajdziesz unikalny numer rezerwacji oraz najważniejsze
                            informacje o Twojej wizycie.
                        </p>
                    </div>

                    {/* Status na środku */}
                    <div className="flex justify-center">
                        <Chip
                            label={`Status: ${statusTranslations[appointment.status] ?? appointment.status}`}
                            color={statusColors[appointment.status] ?? "default"}
                            sx={{
                                fontWeight: 800,
                                fontSize: "0.9rem",
                                px: 2,
                                py: 2.5,
                                borderRadius: "16px",
                            }}
                        />
                    </div>

                    {/* Siatka z danymi wizyty (Grid 2-kolumnowy) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 bg-slate-50 p-4 sm:p-6 rounded-3xl border border-slate-100">
                        <SummaryCard label="Numer wizyty" value={`#${appointment.appointmentId}`} />
                        <SummaryCard label="Lekarz" value={getAppointmentDoctorName(appointment)} />
                        <SummaryCard
                            label="Specjalizacja"
                            value={getAppointmentSpecialization(appointment)}
                        />
                        <SummaryCard label="Data" value={appointment.date} />
                        <SummaryCard
                            label="Godzina"
                            value={`${appointment.startTime} - ${appointment.endTime}`}
                        />
                    </div>

                    {/* Akcje / Przyciski powrotu */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center">
                        <Button
                            component={RouterLink}
                            to="/moje-wizyty"
                            variant="contained"
                            disableElevation
                            sx={{
                                textTransform: "none",
                                fontWeight: 700,
                                borderRadius: "12px",
                                px: 4,
                                py: 1.5,
                            }}
                        >
                            Przejdź do moich wizyt
                        </Button>
                        <Button
                            component={RouterLink}
                            to="/lekarze"
                            variant="outlined"
                            sx={{
                                textTransform: "none",
                                fontWeight: 700,
                                borderRadius: "12px",
                                px: 4,
                                py: 1.5,
                            }}
                        >
                            Umów kolejną wizytę
                        </Button>
                    </div>
                </Stack>
            </div>
        </div>
    );
};

// --- Nowoczesny komponent karty z detalami ---
const SummaryCard = ({ label, value }: { label: string; value: string }) => (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            {label}
        </span>
        <span className="text-slate-800 font-bold text-base">{value}</span>
    </div>
);

// --- Funkcje pomocnicze ---
const getAppointmentDoctorName = (appointment: BookAppointmentResultDto | AppointmentDetailDto) => {
    if ("doctorName" in appointment) return appointment.doctorName ?? "-";
    return "-";
};

const getAppointmentSpecialization = (
    appointment: BookAppointmentResultDto | AppointmentDetailDto,
) => {
    if ("doctorSpecialization" in appointment) return appointment.doctorSpecialization || "-";
    return "-";
};

const getAppointmentType = (appointment: BookAppointmentResultDto | AppointmentDetailDto) => {
    if ("appointmentType" in appointment) return appointment.appointmentType ?? "Nieznane";
    return "-";
};

export default AppointmentConfirmationPage;
