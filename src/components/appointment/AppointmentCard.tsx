import { Button, Chip } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PaymentResultBanner } from "../Payment/PaymentResultBanner";
import type { AppointmentSummaryDto } from "../../types/appointment";
import { statusTranslations, statusColors } from "../../lib/appointmentStatus";

type AppointmentCardProps = {
    appointment: AppointmentSummaryDto;
    onPay: (appointmentId: number) => void;
    onRefetch: () => void;
};

export const AppointmentCard = ({ appointment, onPay, onRefetch }: AppointmentCardProps) => {
    const { t } = useTranslation();

    return (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors duration-300">
                        {appointment.doctorName}
                    </h2>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-1">
                        {appointment.appointmentType ?? t("common.unknown")}{" "}
                        <span className="text-slate-300 mx-1">•</span>{" "}
                        {appointment.doctorSpecialization || t("doctors.noSpecialization")}
                    </p>
                </div>

                <Chip
                    label={statusTranslations[appointment.status] ?? appointment.status}
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

            <div className="inline-flex items-center gap-1.5 bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-100 mb-4 font-medium text-sm">
                <span>📅</span>
                <span>{appointment.date}</span>
                <span className="text-slate-300 mx-1">|</span>
                <span>
                    🕒 {appointment.startTime} - {appointment.endTime}
                </span>
            </div>

            {appointment.paymentStatus === "Pending" && appointment.paymentMethod === "PayU" && (
                <div className="mb-4 rounded-xl overflow-hidden shadow-inner text-sm">
                    <PaymentResultBanner
                        appointmentId={appointment.appointmentId}
                        onRetry={() => {
                            onRefetch();
                            onPay(appointment.appointmentId);
                        }}
                    />
                </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-100">
                <RouterLink
                    to={`/wizyty/potwierdzenie/${appointment.appointmentId}`}
                    className="text-blue-600 hover:text-blue-800 font-bold text-xs uppercase tracking-wide flex items-center gap-1 transition-colors"
                >
                    {t("appointments.viewSummary")}
                    <span className="text-base leading-none">&rarr;</span>
                </RouterLink>

                <div className="flex flex-wrap items-center gap-2 text-sm">
                    {appointment.status !== "Cancelled" && (
                        <>
                            {appointment.paymentStatus === "Paid" && (
                                <div className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg font-bold border border-emerald-200 flex items-center gap-1.5">
                                    <span>✅</span> {t("appointments.paid")}
                                </div>
                            )}

                            {appointment.paymentStatus === "Pending" &&
                                appointment.paymentMethod === "Offline" && (
                                    <div className="bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg font-bold border border-amber-200 flex items-center gap-1.5">
                                        <span>⏳</span> {t("appointments.payAtClinic")}
                                    </div>
                                )}

                            {(appointment.status === "PendingConfirmation" ||
                                appointment.status === "AwaitingPayment") && (
                                <div className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg font-bold border border-slate-200 flex items-center gap-1.5">
                                    <span>👨‍⚕️</span> {t("appointments.awaitingConfirmation")}
                                </div>
                            )}

                            {appointment.status === "Unpaid" && (
                                <div className="bg-red-50 text-red-700 px-3 py-1.5 rounded-lg font-bold border border-red-200 flex items-center gap-1.5">
                                    <span>🚫</span> {t("appointments.unpaidExpired")}
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
                                    >
                                        {appointment.paymentStatus === "Failed"
                                            ? `❌ ${t("appointments.retryPayment")}`
                                            : `💳 ${t("appointments.payVisit")}`}
                                    </Button>
                                )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
