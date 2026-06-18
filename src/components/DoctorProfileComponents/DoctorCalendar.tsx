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
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { Calendar as BigCalendar, dayjsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useDoctorCalendar } from "../../hooks/useDoctorCalendar";
import { OfflinePaymentAction } from "../Payment/OfflinePaymentAction";

const calendarLocalizer = dayjsLocalizer(dayjs);

export const DoctorCalendar = () => {
    const { t } = useTranslation();
    const c = useDoctorCalendar();

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
                    messages={c.calendarMessages}
                    events={c.appointmentEvents}
                    startAccessor="start"
                    endAccessor="end"
                    view="week"
                    views={["week"]}
                    date={c.calendarDate}
                    onNavigate={c.setCalendarDate}
                    onSelectEvent={c.handleSelectEvent}
                    eventPropGetter={c.eventPropGetter as any}
                />
            </Box>

            <Dialog
                open={Boolean(c.selectedAppointment)}
                onClose={c.handleCloseDialog}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle sx={{ fontWeight: 800 }}>
                    {t("doctorProfile.appointmentDetails")}
                </DialogTitle>
                <DialogContent dividers>
                    {c.selectedAppointment && (
                        <Stack spacing={2}>
                            <Typography sx={{ fontWeight: 800, fontSize: 18 }}>
                                {c.selectedAppointment.patientName}
                            </Typography>
                            <Typography sx={{ color: "text.secondary" }}>
                                {c.selectedAppointment.appointmentType} •{" "}
                                {dayjs(c.selectedAppointment.start).format(
                                    t("doctorProfile.dateTimeFormat"),
                                )}
                            </Typography>

                            <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 2 }}>
                                <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
                                    {t("doctorProfile.settlement")}
                                </Typography>
                                {c.selectedAppointment.paymentStatus === "Paid" && (
                                    <Chip label={t("paymentStatus.Paid")} color="success" />
                                )}
                                {c.selectedAppointment.paymentStatus === "Pending" &&
                                    c.selectedAppointment.paymentMethod === "Offline" && (
                                        <OfflinePaymentAction
                                            paymentId={c.selectedAppointment.paymentId!}
                                        />
                                    )}
                            </Box>

                            <FormControl fullWidth>
                                <InputLabel>{t("doctorProfile.changeStatus")}</InputLabel>
                                <Select
                                    value={c.appointmentAction}
                                    onChange={(e) => c.setAppointmentAction(e.target.value as any)}
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
                    <Button onClick={c.handleCloseDialog}>{t("common.close")}</Button>
                    <Button
                        variant="contained"
                        onClick={() =>
                            c.updateAppointmentStatusMutation.mutate(c.appointmentAction)
                        }
                        disabled={c.updateAppointmentStatusMutation.isPending}
                    >
                        {t("common.confirm")}
                    </Button>
                </DialogActions>
            </Dialog>
            <Snackbar
                open={c.snackbar.open}
                autoHideDuration={5000}
                onClose={c.handleCloseSnackbar}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    severity="error"
                    variant="filled"
                    onClose={c.handleCloseSnackbar}
                    sx={{ width: "100%" }}
                >
                    {c.snackbar.message}
                </Alert>
            </Snackbar>
        </Stack>
    );
};
