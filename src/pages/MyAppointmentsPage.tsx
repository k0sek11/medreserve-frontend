import { Dialog, Pagination } from "@mui/material";
import { useMyAppointments } from "../hooks/useMyAppointments";
import { Show } from "../components/shared/ShowHide";
import { PaymentMethodSelector } from "../components/Payment/PaymentMethodSelector";
import { AppointmentCard } from "../components/appointment/AppointmentCard";

const MyAppointmentsPage = () => {
    const h = useMyAppointments();

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
                {h.paginatedAppointments.map((a) => (
                    <AppointmentCard
                        key={a.appointmentId}
                        appointment={a}
                        onPay={h.handleOpenPayment}
                        onRefetch={h.refetch}
                    />
                ))}
                <Show when={h.totalPages > 1}>
                    <div className="flex justify-center mt-8 pt-4">
                        <Pagination
                            count={h.totalPages}
                            page={h.page}
                            onChange={(_, v) => {
                                h.setPage(v);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            color="primary"
                            shape="rounded"
                            size="large"
                        />
                    </div>
                </Show>
            </div>
            <Dialog
                open={h.isPaymentModalOpen}
                onClose={h.handleClosePayment}
                maxWidth="sm"
                fullWidth
                sx={{ "& .MuiDialog-paper": { borderRadius: "24px", padding: "16px" } }}
            >
                <Show when={Boolean(h.selectedAppointmentId)}>
                    <PaymentMethodSelector
                        appointmentId={h.selectedAppointmentId!}
                        amount={h.selectedAppointment?.price ?? 0}
                        onSuccessClose={h.handleClosePayment}
                    />
                </Show>
            </Dialog>
        </div>
    );
};

export default MyAppointmentsPage;
