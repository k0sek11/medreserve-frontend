import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useTheme } from "@mui/material";
import { appointmentsApi } from "../api/appointments";
import { notificationsApi } from "../api/notifications";
import {
    buildAppointmentEvent,
    type DoctorAppointmentEvent,
    type AppointmentAction,
} from "../components/DoctorProfileComponents/DoctorProfilehelpers";

export const useDoctorCalendar = () => {
    const { t } = useTranslation();
    const theme = useTheme();
    const queryClient = useQueryClient();
    const [calendarDate, setCalendarDate] = useState(() => dayjs().startOf("week").toDate());
    const [selectedAppointment, setSelectedAppointment] = useState<DoctorAppointmentEvent | null>(
        null,
    );
    const [appointmentAction, setAppointmentAction] = useState<AppointmentAction>("Confirmed");
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({
        open: false,
        message: "",
    });

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
            .filter((a) => !["Cancelled", "Canceled", "Rejected"].includes(a.status))
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

    const eventPropGetter = (event: DoctorAppointmentEvent) => {
        const isDark = theme.palette.mode === "dark";
        let color = isDark ? "#94a3b8" : "#64748b";
        if (event.status === "PendingConfirmation") color = "#f59f00";
        else if (event.status === "AwaitingPayment") color = "#f97316";
        else if (event.status === "AwaitingOnSitePayment") color = isDark ? "#a89f3a" : "#fef08a";
        else if (event.status === "Confirmed") color = isDark ? "#2ecc71" : "#1f9b45";
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
    };

    const handleSelectEvent = (event: object) => {
        setSelectedAppointment(event as DoctorAppointmentEvent);
        setAppointmentAction("Confirmed");
    };

    const handleCloseDialog = () => setSelectedAppointment(null);
    const handleCloseSnackbar = () => setSnackbar((s) => ({ ...s, open: false }));

    return {
        calendarDate,
        setCalendarDate,
        selectedAppointment,
        appointmentAction,
        setAppointmentAction,
        snackbar,
        handleCloseSnackbar,
        appointmentEvents,
        calendarMessages,
        eventPropGetter,
        updateAppointmentStatusMutation,
        handleSelectEvent,
        handleCloseDialog,
    };
};
