import { useState } from "react";
import { Alert, Box, Chip, Button, Dialog, Pagination } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { Link as RouterLink } from "react-router-dom";
import { appointmentsApi } from "../api/appointments";
import { PaymentMethodSelector } from "../components/Payment/PaymentMethodSelector";
import { PaymentResultBanner } from "../components/Payment/PaymentResultBanner";

const statusColors: Record<string, "default" | "primary" | "success" | "error" | "warning"> = {
    PendingConfirmation: "warning",
    AwaitingPayment: "primary",
    AwaitingOnSitePayment: "warning",
    Confirmed: "success",
    Completed: "primary",
    Cancelled: "error",
    Unpaid: "error",
};

const statusTranslations: Record<string, string> = {
    PendingConfirmation: "Oczekuje na potwierdzenie",
    AwaitingPayment: "Oczekuje na płatność online",
    AwaitingOnSitePayment: "Płatność na miejscu",
    Confirmed: "Potwierdzona",
    Completed: "Zrealizowana",
    Cancelled: "Anulowana",
    Unpaid: "Niezapłacona (przeterminowana)",
};

const MyAppointmentsPage = () => {
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);

    // NOWOŚĆ: Stan dla paginacji
    const [page, setPage] = useState(1);
    const itemsPerPage = 5; // Ile wizyt chcemy na jednej stronie

    const {
        data: appointments = [],
        isLoading,
        refetch,
    } = useQuery({
        queryKey: ["my-appointments"],
        queryFn: () => appointmentsApi.mine(),
    });

    const handleOpenPayment = (appointmentId: number) => {
        setSelectedAppointmentId(appointmentId);
        setIsPaymentModalOpen(true);
    };

    const selectedAppointment = appointments.find((a) => a.appointmentId === selectedAppointmentId);

    // NOWOŚĆ: Logika paginacji (cięcie tablicy)
    const totalPages = Math.ceil(appointments.length / itemsPerPage);
    const paginatedAppointments = appointments.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage,
    );

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
        // Płynne przewinięcie do góry strony po zmianie zakładki
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-8 lg:px-16">
            <div className="mb-8 max-w-4xl mx-auto">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                    Moje wizyty
                </h1>
                <p className="text-base text-slate-500 font-medium">
                    Zarządzaj swoimi rezerwacjami, sprawdzaj status i opłacaj wizyty.
                </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-4">
                {" "}
                {/* Zmniejszony odstęp między kartami (space-y-4) */}
                {isLoading && (
                    <Alert severity="info" className="rounded-xl shadow-sm border border-blue-100">
                        Trwa ładowanie Twoich wizyt...
                    </Alert>
                )}
                {!isLoading && appointments.length === 0 && (
                    <Box className="bg-white p-10 text-center rounded-2xl border border-slate-100 shadow-sm">
                        <span className="text-5xl block mb-3">🩺</span>
                        <h3 className="text-lg font-bold text-slate-800 mb-1">
                            Brak zaplanowanych wizyt
                        </h3>
                        <p className="text-slate-500 text-sm">
                            Nie masz jeszcze żadnych rezerwacji w naszym systemie.
                        </p>
                    </Box>
                )}
                {/* Używamy pociętej tablicy (paginatedAppointments) zamiast wszystkich */}
                {paginatedAppointments.map((appointment) => (
                    <div
                        key={appointment.appointmentId}
                        className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group"
                    >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors duration-300">
                                    {appointment.doctorName}
                                </h2>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-1">
                                    {appointment.appointmentType ?? "Nieznane"}{" "}
                                    <span className="text-slate-300 mx-1">•</span>{" "}
                                    {appointment.doctorSpecialization || "Brak specjalizacji"}
                                </p>
                            </div>

                            <Chip
                                label={statusTranslations[appointment.status] ?? appointment.status}
                                color={statusColors[appointment.status] ?? "default"}
                                variant={
                                    appointment.status === "Confirmed" ||
                                    appointment.status === "Completed"
                                        ? "filled"
                                        : "outlined"
                                }
                                size="small" // Mniejszy Chip
                                className="font-bold shadow-sm"
                                sx={{ borderRadius: "8px" }}
                            />
                        </div>

                        <div className="inline-flex items-center gap-1.5 bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-100 mb-4 font-medium text-sm">
                            <span>📅</span>
                            <span>{appointment.date}</span>
                            <span className="text-slate-300 mx-1">|</span>
                            <span>
                                🕒 {appointment.startTime} - {appointment.endTime}
                            </span>
                        </div>

                        {appointment.paymentStatus === "Pending" &&
                            appointment.paymentMethod === "PayU" && (
                                <div className="mb-4 rounded-xl overflow-hidden shadow-inner text-sm">
                                    <PaymentResultBanner
                                        appointmentId={appointment.appointmentId}
                                        onRetry={() => {
                                            refetch();
                                            handleOpenPayment(appointment.appointmentId);
                                        }}
                                    />
                                </div>
                            )}

                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-100">
                            <RouterLink
                                to={`/wizyty/potwierdzenie/${appointment.appointmentId}`}
                                className="text-blue-600 hover:text-blue-800 font-bold text-xs uppercase tracking-wide flex items-center gap-1 transition-colors"
                            >
                                Zobacz podsumowanie
                                <span className="text-base leading-none">&rarr;</span>
                            </RouterLink>

                            <div className="flex flex-wrap items-center gap-2 text-sm">
                                {appointment.status !== "Cancelled" && (
                                    <>
                                        {appointment.paymentStatus === "Paid" && (
                                            <div className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg font-bold border border-emerald-200 flex items-center gap-1.5">
                                                <span>✅</span> Opłacono
                                            </div>
                                        )}

                                        {appointment.paymentStatus === "Pending" &&
                                            appointment.paymentMethod === "Offline" && (
                                                <div className="bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg font-bold border border-amber-200 flex items-center gap-1.5">
                                                    <span>⏳</span> Do zapłaty w gabinecie
                                                </div>
                                            )}

                                        {(appointment.status === "PendingConfirmation" ||
                                            appointment.status === "AwaitingPayment") && (
                                            <div className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg font-bold border border-slate-200 flex items-center gap-1.5">
                                                <span>👨‍⚕️</span> Oczekuje na potwierdzenie
                                            </div>
                                        )}

                                        {appointment.status === "Unpaid" && (
                                            <div className="bg-red-50 text-red-700 px-3 py-1.5 rounded-lg font-bold border border-red-200 flex items-center gap-1.5">
                                                <span>🚫</span> Niezapłacona – wizyta
                                                przeterminowana
                                            </div>
                                        )}

                                        {appointment.status !== "Unpaid" &&
                                            (appointment.status === "Confirmed" ||
                                                appointment.status === "AwaitingPayment") &&
                                            (!appointment.paymentStatus ||
                                                appointment.paymentStatus === "Failed") && (
                                                <Button
                                                    variant="contained"
                                                    color={
                                                        appointment.paymentStatus === "Failed"
                                                            ? "error"
                                                            : "primary"
                                                    }
                                                    disableElevation
                                                    onClick={() =>
                                                        handleOpenPayment(appointment.appointmentId)
                                                    }
                                                    size="small"
                                                    sx={{
                                                        fontWeight: 700,
                                                        borderRadius: "8px",
                                                        textTransform: "none",
                                                        px: 2,
                                                        py: 0.5,
                                                    }}
                                                >
                                                    {appointment.paymentStatus === "Failed"
                                                        ? "❌ Ponów płatność"
                                                        : "💳 Opłać wizytę"}
                                                </Button>
                                            )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {/* NOWOŚĆ: Komponent Paginacji na dole strony */}
                {totalPages > 1 && (
                    <div className="flex justify-center mt-8 pt-4">
                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={handlePageChange}
                            color="primary"
                            shape="rounded" // Nowoczesny, lekko zaokrąglony kształt
                            size="large"
                        />
                    </div>
                )}
            </div>

            <Dialog
                open={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                maxWidth="sm"
                fullWidth
                sx={{
                    "& .MuiDialog-paper": {
                        borderRadius: "24px",
                        padding: "16px",
                    },
                }}
            >
                {selectedAppointmentId && (
                    <PaymentMethodSelector
                        appointmentId={selectedAppointmentId}
                        amount={selectedAppointment?.price ?? 0}
                        onSuccessClose={() => setIsPaymentModalOpen(false)}
                    />
                )}
            </Dialog>
        </div>
    );
};

export default MyAppointmentsPage;
