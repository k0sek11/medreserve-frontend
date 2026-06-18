import { Alert, Button, Chip, Stack } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useConfirmation } from "../hooks/useConfirmation";
import { statusTranslations, statusColors } from "../lib/appointmentStatus";
import { getAppointmentDoctorName, getAppointmentSpecialization } from "../lib/appointmentHelpers";
import { SummaryCard } from "../components/shared/SummaryCard";

const AppointmentConfirmationPage = () => {
    const { t } = useTranslation();
    const c = useConfirmation();

    if (!c.hasValidId) return <ErrorScreen icon="🤷‍♂️" title={t("confirmation.invalidId")} />;
    if (c.isLoading) return <LoadingScreen t={t} />;
    if (!c.appointment) return <ErrorScreen icon="❌" title={t("confirmation.loadError")} />;

    const a = c.appointment;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#121212] py-12 px-4 sm:px-8 flex justify-center items-start">
            <div className="max-w-2xl w-full bg-white dark:bg-neutral-800 rounded-[2rem] p-6 sm:p-10 border border-slate-100 dark:border-neutral-700 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-2 bg-blue-500" />
                <Stack spacing={4}>
                    <div className="text-center mt-2">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-50 dark:bg-emerald-900/30 rounded-full mb-4">
                            <span className="text-4xl">
                                {a.status === "Confirmed" ? "✅" : "⏳"}
                            </span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-gray-100 tracking-tight mb-2">
                            {c.title}
                        </h1>
                        <p className="text-slate-500 dark:text-gray-400 font-medium">
                            {t("confirmation.subtitle")}
                        </p>
                    </div>
                    <div className="flex justify-center">
                        <Chip
                            label={`${t("confirmation.statusPrefix")}: ${statusTranslations[a.status] ?? a.status}`}
                            color={statusColors[a.status] ?? "default"}
                            sx={{
                                fontWeight: 800,
                                fontSize: "0.9rem",
                                px: 2,
                                py: 2.5,
                                borderRadius: "16px",
                            }}
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 bg-slate-50 dark:bg-neutral-900 p-4 sm:p-6 rounded-3xl border border-slate-100 dark:border-neutral-700">
                        <SummaryCard
                            label={t("confirmation.appointmentNumber")}
                            value={`#${a.appointmentId}`}
                        />
                        <SummaryCard
                            label={t("confirmation.doctor")}
                            value={getAppointmentDoctorName(a)}
                        />
                        <SummaryCard
                            label={t("confirmation.specialization")}
                            value={getAppointmentSpecialization(a)}
                        />
                        <SummaryCard label={t("confirmation.date")} value={a.date} />
                        <SummaryCard
                            label={t("confirmation.time")}
                            value={`${a.startTime} - ${a.endTime}`}
                        />
                    </div>
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
                            {t("confirmation.goToAppointments")}
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
                            {t("confirmation.bookAnother")}
                        </Button>
                    </div>
                </Stack>
            </div>
        </div>
    );
};

const ErrorScreen = ({ icon, title }: { icon: string; title: string }) => (
    <div className="min-h-screen bg-slate-50 dark:bg-[#121212] py-12 px-4 flex justify-center">
        <div className="max-w-md w-full bg-white dark:bg-neutral-800 p-8 rounded-3xl border border-slate-100 dark:border-neutral-700 shadow-sm text-center">
            <span className="text-5xl block mb-4">{icon}</span>
            <h2 className="text-xl font-bold text-slate-800 dark:text-gray-200">{title}</h2>
        </div>
    </div>
);

const LoadingScreen = ({ t }: { t: (key: string) => string }) => (
    <div className="min-h-screen bg-slate-50 dark:bg-[#121212] py-12 px-4 flex justify-center">
        <div className="max-w-xl w-full bg-white dark:bg-neutral-800 p-8 rounded-3xl border border-slate-100 dark:border-neutral-700 shadow-sm">
            <Alert severity="info" className="rounded-xl">
                {t("confirmation.loadingInfo")}
            </Alert>
        </div>
    </div>
);

export default AppointmentConfirmationPage;
