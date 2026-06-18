import { Button, Chip } from "@mui/material";
import {
    CalendarToday,
    AccessTime,
    CheckCircle,
    HourglassEmpty,
    Block,
    Error,
    CreditCard,
} from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PaymentResultBanner } from "../Payment/PaymentResultBanner";
import type { AppointmentSummaryDto } from "../../types/appointment";
import { statusColors } from "../../lib/appointmentStatus";

type AppointmentCardProps = {
    appointment: AppointmentSummaryDto;
    onPay: (appointmentId: number) => void;
    onRefetch: () => void;
};

export const AppointmentCard = ({ appointment, onPay, onRefetch }: AppointmentCardProps) => {
    const { t } = useTranslation();

    return (
        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-5 sm:p-6 border border-slate-100 dark:border-neutral-700 shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                        {appointment.doctorName}
                    </h2>
                    <p className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wide mt-1">
                        {appointment.appointmentType ?? t("common.unknown")}{" "}
                        <span className="text-slate-300 dark:text-gray-600 mx-1">•</span>{" "}
                        {appointment.doctorSpecialization || t("doctors.noSpecialization")}
                    </p>
                </div>

                <Chip
                    label={t(`appointmentStatus.${appointment.status}`, appointment.status)}
                    color={statusColors[appointment.status] ?? "default"}
                    variant={
                        appointment.status === "Confirmed" || appointment.status === "Completed"
                            ? "filled"
                            : "outlined"
                    }
                    size="small"
                    className="font-bold shadow-sm"
                    sx={{ borderRadius: "8px" }}
                />
            </div>

            <div className="inline-flex items-center gap-1.5 bg-slate-50 dark:bg-neutral-900 text-slate-700 dark:text-neutral-300 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-neutral-700 mb-4 font-medium text-sm">
                <CalendarToday sx={{ fontSize: 14 }} />
                <span>{appointment.date}</span>
                <span className="text-slate-300 dark:text-gray-600 mx-1">|</span>
                <AccessTime sx={{ fontSize: 14 }} />
                <span>
                    {appointment.startTime} - {appointment.endTime}
                </span>
            </div>

            {appointment.paymentStatus === "Pending" && appointment.paymentMethod === "PayU" && (
                <div className="mb-4 rounded-xl overflow-hidden shadow-inner text-sm">
                    <PaymentResultBanner
                        appointmentId={appointment.appointmentId}
                        onRefetch={onRefetch}
                        onRetry={() => {
                            onRefetch();
                            onPay(appointment.appointmentId);
                        }}
                    />
                </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-100 dark:border-neutral-700">
                <RouterLink
                    to={`/wizyty/potwierdzenie/${appointment.appointmentId}`}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-bold text-xs uppercase tracking-wide flex items-center gap-1 transition-colors"
                >
                    {t("appointments.viewSummary")}
                    <span className="text-base leading-none">&rarr;</span>
                </RouterLink>

                <div className="flex flex-wrap items-center gap-2 text-sm">
                    {appointment.status !== "Cancelled" && (
                        <>
                            {appointment.paymentStatus === "Paid" && (
                                <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-lg font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                                    <CheckCircle sx={{ fontSize: 16 }} /> {t("appointments.paid")}
                                </div>
                            )}

                            {appointment.paymentStatus === "Pending" &&
                                appointment.paymentMethod === "Offline" && (
                                    <div className="bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-3 py-1.5 rounded-lg font-bold border border-amber-200 dark:border-amber-800 flex items-center gap-1.5">
                                        <HourglassEmpty sx={{ fontSize: 16 }} />{" "}
                                        {t("appointments.payAtClinic")}
                                    </div>
                                )}

                            {appointment.status === "Unpaid" && (
                                <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-3 py-1.5 rounded-lg font-bold border border-red-200 dark:border-red-800 flex items-center gap-1.5">
                                    <Block sx={{ fontSize: 16 }} />{" "}
                                    {t("appointments.unpaidExpired")}
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
                                        onClick={() => onPay(appointment.appointmentId)}
                                        size="small"
                                        sx={{
                                            fontWeight: 700,
                                            borderRadius: "8px",
                                            textTransform: "none",
                                            px: 2,
                                            py: 0.5,
                                        }}
                                        startIcon={
                                            appointment.paymentStatus === "Failed" ? (
                                                <Error />
                                            ) : (
                                                <CreditCard />
                                            )
                                        }
                                    >
                                        {appointment.paymentStatus === "Failed"
                                            ? t("appointments.retryPayment")
                                            : t("appointments.payVisit")}
                                    </Button>
                                )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
