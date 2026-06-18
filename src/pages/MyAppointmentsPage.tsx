import { Box, Dialog, Pagination, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useMyAppointments } from "../hooks/useMyAppointments";
import { Show } from "../components/shared/ShowHide";
import { PaymentMethodSelector } from "../components/Payment/PaymentMethodSelector";
import { AppointmentCard } from "../components/appointment/AppointmentCard";

const MyAppointmentsPage = () => {
    const { t } = useTranslation();
    const h = useMyAppointments();

    return (
        <Box sx={{ py: { xs: 2, md: 4 } }}>
            <Stack spacing={0.8} sx={{ mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: "text.primary" }}>
                    {t("appointments.myAppointments")}
                </Typography>
                <Typography sx={{ color: "text.secondary" }}>
                    {t("appointments.myAppointmentsDesc")}
                </Typography>
            </Stack>
            <Stack spacing={2}>
                {h.paginatedAppointments.map((a) => (
                    <AppointmentCard
                        key={a.appointmentId}
                        appointment={a}
                        onPay={h.handleOpenPayment}
                        onRefetch={h.refetch}
                    />
                ))}
                <Show when={h.totalPages > 1}>
                    <Stack direction="row" sx={{ pt: 2, justifyContent: "center" }}>
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
                    </Stack>
                </Show>
            </Stack>
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
        </Box>
    );
};

export default MyAppointmentsPage;
