import { useMemo, useState } from "react";
import dayjs from "dayjs";
import {
    Alert,
    Box,
    Chip,
    Snackbar,
    Stack,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    useTheme,
} from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Calendar as BigCalendar, dayjsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { appointmentsApi } from "../../api/appointments";
import { notificationsApi } from "../../api/notifications";
import {
    buildAppointmentEvent,
    type DoctorAppointmentEvent,
    type AppointmentAction,
} from "../DoctorProfileComponents/DoctorProfilehelpers";
import { OfflinePaymentAction } from "../Payment/OfflinePaymentAction";

const calendarLocalizer = dayjsLocalizer(dayjs);

export const DoctorCalendar = () => {
    const { t } = useTranslation();
    const theme = useTheme();
    const queryClient = useQueryClient();
    const [calendarDate, setCalendarDate] = useState(() => dayjs().startOf("week").toDate());
    const [selectedAppointment, setSelectedAppointment] = useState<DoctorAppointmentEvent | null>(
        null,
    );
    const [appointmentAction, setAppointmentAction] = useState<AppointmentAction>("Confirmed");
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
    }>({ open: false, message: "" });

    const { data } = useQuery({
        queryKey: ["doctor-appointment-notifications"],
        queryFn: () => notificationsApi.getAppointmentNotifications(),
    });

    const updateAppointmentStatusMutation = useMutation({
        mutationFn: async (status: AppointmentAction) => {
            if (!selectedAppointment)
                throw new Error(t("doctorProfile.scheduleErrors.selectAppointment"));
            if (status === "Confirmed")
                return appointmentsApi.confirm(selectedAppointment.appointmentId, true);
            return appointmentsApi.cancel(selectedAppointment.appointmentId);
        },
        onSuccess: async () => {
            setSelectedAppointment(null);
            await queryClient.invalidateQueries({
                queryKey: ["doctor-appointment-notifications"],
            });
        },
        onError: (error) => {
            setSnackbar({
                open: true,
                message:
                    error instanceof Error
                        ? error.message
                        : t("doctorProfile.scheduleErrors.updateStatusError"),
            });
        },
    });

    const appointmentEvents = useMemo(() => {
        return (data ?? [])
            .filter((a) => !["Cancelled", "Canceled", "Rejected", "Cancelled"].includes(a.status))
            .map((a) => buildAppointmentEvent(a, t("doctorProfile.unknownType")))
            .filter((event): event is DoctorAppointmentEvent => event !== null)
            .sort((a, b) => a.start.getTime() - b.start.getTime());
    }, [data, t]);

    const calendarMessages = useMemo(
        () => ({
            today: t("doctorProfile.calendarToolbar.today"),
            previous: t("doctorProfile.calendarToolbar.previous"),
            next: t("doctorProfile.calendarToolbar.next"),
            month: t("doctorProfile.calendarToolbar.month"),
            week: t("doctorProfile.calendarToolbar.week"),
            day: t("doctorProfile.calendarToolbar.day"),
            agenda: t("doctorProfile.calendarToolbar.agenda"),
        }),
        [t],
    );

    return (
        <Stack spacing={2}>
            <Box>
                <Typography sx={{ fontWeight: 800, color: "text.primary", fontSize: 20 }}>
                    {t("doctorProfile.calendarTitle")}
                </Typography>
                <Typography sx={{ color: "text.secondary" }}>
                    {t("doctorProfile.calendarDesc")}
                </Typography>
            </Box>

            <Box sx={{ height: { xs: 760, lg: 820 }, "& .rbc-event": { borderRadius: 10 } }}>
                <BigCalendar
                    localizer={calendarLocalizer}
                    messages={calendarMessages}
                    events={appointmentEvents}
                    startAccessor="start"
                    endAccessor="end"
                    view="week"
                    views={["week"]}
                    date={calendarDate}
                    onNavigate={setCalendarDate}
                    onSelectEvent={(event) => {
                        setSelectedAppointment(event as DoctorAppointmentEvent);
                        setAppointmentAction("Confirmed");
                    }}
                    eventPropGetter={(event) => {
                        const isDark = theme.palette.mode === "dark";
                        let color = isDark ? "#94a3b8" : "#64748b";
                        if (event.status === "PendingConfirmation") color = "#f59f00";
                        else if (event.status === "AwaitingPayment") color = "#f97316";
                        else if (event.status === "AwaitingOnSitePayment")
                            color = isDark ? "#a89f3a" : "#fef08a";
                        else if (event.status === "Confirmed")
                            color = isDark ? "#2ecc71" : "#1f9b45";
                        else if (event.status === "Completed") color = theme.palette.primary.main;
                        else if (event.status === "Unpaid") color = "#ef4444";
                        return {
                            style: {
                                backgroundColor: color,
                                color: isDark ? "#e2e8f0" : "#1e293b",
                                border: "none",
                                borderRadius: 12,
                            },
                        };
                    }}
                />
            </Box>

            <Dialog
                open={Boolean(selectedAppointment)}
                onClose={() => setSelectedAppointment(null)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle sx={{ fontWeight: 800 }}>
                    {t("doctorProfile.appointmentDetails")}
                </DialogTitle>
                <DialogContent dividers>
                    {selectedAppointment && (
                        <Stack spacing={2}>
                            <Typography sx={{ fontWeight: 800, fontSize: 18 }}>
                                {selectedAppointment.patientName}
                            </Typography>
                            <Typography sx={{ color: "text.secondary" }}>
                                {selectedAppointment.appointmentType} •{" "}
                                {dayjs(selectedAppointment.start).format(
                                    t("doctorProfile.dateTimeFormat"),
                                )}
                            </Typography>

                            <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 2 }}>
                                <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
                                    {t("doctorProfile.settlement")}
                                </Typography>
                                {selectedAppointment.paymentStatus === "Paid" && (
                                    <Chip label={t("doctorProfile.paid")} color="success" />
                                )}
                                {selectedAppointment.paymentStatus === "Pending" &&
                                    selectedAppointment.paymentMethod === "Offline" && (
                                        <OfflinePaymentAction
                                            paymentId={selectedAppointment.paymentId!}
                                        />
                                    )}
                            </Box>

                            <FormControl fullWidth>
                                <InputLabel>{t("doctorProfile.changeStatus")}</InputLabel>
                                <Select
                                    value={appointmentAction}
                                    onChange={(e) =>
                                        setAppointmentAction(e.target.value as AppointmentAction)
                                    }
                                >
                                    <MenuItem value="Confirmed">
                                        {t("doctorProfile.accepted")}
                                    </MenuItem>
                                    <MenuItem value="Cancelled">
                                        {t("doctorProfile.cancelAppointment")}
                                    </MenuItem>
                                </Select>
                            </FormControl>
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSelectedAppointment(null)}>
                        {t("common.close")}
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => updateAppointmentStatusMutation.mutate(appointmentAction)}
                        disabled={updateAppointmentStatusMutation.isPending}
                    >
                        {t("common.confirm")}
                    </Button>
                </DialogActions>
            </Dialog>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={5000}
                onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    severity="error"
                    variant="filled"
                    onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
                    sx={{ width: "100%" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Stack>
    );
};
