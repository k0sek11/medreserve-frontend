import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { Box, Chip, Stack, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar as BigCalendar, dayjsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { notificationsApi } from "../../api/notifications";
import { buildAppointmentEvent, type DoctorAppointmentEvent, type AppointmentAction } from "../DoctorProfileComponents/DoctorProfilehelpers";
import { OfflinePaymentAction } from "../Payment/OfflinePaymentAction";

const calendarLocalizer = dayjsLocalizer(dayjs);

export const DoctorCalendar = () => {
  const queryClient = useQueryClient();
  const [calendarDate, setCalendarDate] = useState(() => dayjs().startOf("week").toDate());
  const [selectedAppointment, setSelectedAppointment] = useState<DoctorAppointmentEvent | null>(null);
  const [appointmentAction, setAppointmentAction] = useState<AppointmentAction>("Confirmed");

  const { data } = useQuery({
    queryKey: ["doctor-appointment-notifications"],
    queryFn: () => notificationsApi.getAppointmentNotifications(),
  });

  const updateAppointmentStatusMutation = useMutation({
    mutationFn: async (status: AppointmentAction) => {
      if (!selectedAppointment) throw new Error("Wybierz wizytę.");
      if (status === "Confirmed") return notificationsApi.confirmAppointment(selectedAppointment.notificationId);
      return notificationsApi.cancelAppointment(selectedAppointment.notificationId);
    },
    onSuccess: async () => {
      setSelectedAppointment(null);
      await queryClient.invalidateQueries({ queryKey: ["doctor-appointment-notifications"] });
    },
  });

  const appointmentEvents = useMemo(() => {
    return (data ?? [])
      .filter((a) => !["Cancelled", "Canceled", "Rejected"].includes(a.status))
      .map(buildAppointmentEvent)
      .filter((event): event is DoctorAppointmentEvent => event !== null)
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [data]);

  const appointmentCounts = useMemo(() => {
    const counts = { pending: 0, confirmed: 0, completed: 0 };
    appointmentEvents.forEach((event) => {
      const normalized = event.status.toLowerCase();
      if (normalized === "pending") counts.pending += 1;
      else if (normalized === "confirmed") counts.confirmed += 1;
      else if (normalized === "completed") counts.completed += 1;
    });
    return counts;
  }, [appointmentEvents]);

  return (
    <Stack spacing={2}>
      <Box>
        <Typography sx={{ fontWeight: 800, color: "#11223a", fontSize: 20 }}>Kalendarz wizyt</Typography>
        <Typography sx={{ color: "#4f627a" }}>
          Tygodniowy widok wszystkich wizyt. Kliknij wizytę, żeby zmienić status.
        </Typography>
      </Box>

      <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
        <Chip label={`Oczekujące: ${appointmentCounts.pending}`} sx={{ bgcolor: "#fff3cd", color: "#8a5b00" }} />
        <Chip label={`Zaakceptowane: ${appointmentCounts.confirmed}`} sx={{ bgcolor: "#e8f7ee", color: "#1f9b45" }} />
        <Chip label={`Zrealizowane: ${appointmentCounts.completed}`} sx={{ bgcolor: "#eef6ff", color: "#0b74c9" }} />
      </Stack>

      <Box sx={{ height: { xs: 760, lg: 820 }, "& .rbc-event": { borderRadius: 10 } }}>
        <BigCalendar
          localizer={calendarLocalizer}
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
          eventPropGetter={(event) => ({
            style: {
              backgroundColor: event.status === "Pending" ? "#f59f00" : event.status === "Confirmed" ? "#1f9b45" : "#0b74c9",
              color: "#fff", border: "none", borderRadius: 12
            },
          })}
        />
      </Box>

      {/* Modal Szczegółów Wizyty */}
      <Dialog open={Boolean(selectedAppointment)} onClose={() => setSelectedAppointment(null)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 800 }}>Szczegóły wizyty</DialogTitle>
        <DialogContent dividers>
          {selectedAppointment && (
            <Stack spacing={2}>
              <Typography sx={{ fontWeight: 800, fontSize: 18 }}>{selectedAppointment.patientName}</Typography>
              <Typography sx={{ color: "#4f627a" }}>{selectedAppointment.appointmentType} • {dayjs(selectedAppointment.start).format("DD.MM.YYYY HH:mm")}</Typography>
              
              <Box sx={{ p: 2, bgcolor: "#f8f9fa", borderRadius: 2 }}>
                <Typography sx={{ color: "#4f627a", fontSize: 14 }}>Rozliczenie</Typography>
                {selectedAppointment.paymentStatus === 'Paid' && <Chip label="Opłacona" color="success" />}
                {selectedAppointment.paymentStatus === 'Pending' && selectedAppointment.paymentMethod === 'Offline' && (
                  <OfflinePaymentAction paymentId={selectedAppointment.paymentId!} />
                )}
              </Box>

              <FormControl fullWidth>
                <InputLabel>Zmień status wizyty</InputLabel>
                <Select value={appointmentAction} onChange={(e) => setAppointmentAction(e.target.value as AppointmentAction)}>
                  <MenuItem value="Confirmed">Zaakceptowano</MenuItem>
                  <MenuItem value="Cancelled">Anuluj</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedAppointment(null)}>Zamknij</Button>
          <Button variant="contained" onClick={() => updateAppointmentStatusMutation.mutate(appointmentAction)} disabled={updateAppointmentStatusMutation.isPending}>
            Zatwierdź
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};