import dayjs, { type Dayjs } from "dayjs";
import { type AppointmentNotificationDto } from "../../api/notifications";

export const weekdayOptions = [
  { value: 1, label: "Poniedziałek" },
  { value: 2, label: "Wtorek" },
  { value: 3, label: "Środa" },
  { value: 4, label: "Czwartek" },
  { value: 5, label: "Piątek" },
  { value: 6, label: "Sobota" },
  { value: 7, label: "Niedziela" },
] as const;

export const toDateString = (value: Dayjs | null) => (value ? value.format("YYYY-MM-DD") : "");
export const toTimeString = (value: Dayjs | null) => (value ? value.format("HH:mm") : "");

export const parseTime = (value: string) => {
  const [hours, minutes] = value.split(":").map(Number);
  return dayjs()
    .startOf("day")
    .hour(Number.isFinite(hours) ? hours : 0)
    .minute(Number.isFinite(minutes) ? minutes : 0);
};

export const createEmptyScheduleDraft = () => ({
  scheduleId: null as number | null,
  clinicId: "",
  dayOfWeek: 1,
  startTime: parseTime("08:00"),
  endTime: parseTime("16:00"),
  validFrom: dayjs().startOf("day"),
  validTo: null as Dayjs | null,
});

export const createEmptyAppointmentTypeDraft = () => ({
  name: "",
  basePrice: "",
  durationMinutes: "",
});

export type AppointmentAction = "Confirmed" | "Cancelled";

export type DoctorAppointmentEvent = {
  id: number;
  notificationId: number;
  appointmentId: number;
  title: string;
  patientName: string;
  doctorName: string;
  appointmentType: string | null;
  status: string;
  notificationStatus: string;
  message: string | null;
  start: Date;
  end: Date;
  paymentId?: number | null;
  paymentStatus?: string | null;
  paymentMethod?: string | null;
};

export const buildAppointmentEvent = (
  appointment: AppointmentNotificationDto & { paymentId?: number; paymentStatus?: string; paymentMethod?: string }
): DoctorAppointmentEvent | null => {
  const start = dayjs(`${appointment.date}T${appointment.startTime}`);
  const end = dayjs(`${appointment.date}T${appointment.endTime}`);

  if (!start.isValid() || !end.isValid()) return null;

  return {
    id: appointment.notificationId,
    notificationId: appointment.notificationId,
    appointmentId: appointment.appointmentId,
    title: `${appointment.patientName} • ${appointment.appointmentType ?? "Nieznane"}`,
    patientName: appointment.patientName,
    doctorName: appointment.doctorName,
    appointmentType: appointment.appointmentType,
    status: appointment.status,
    notificationStatus: appointment.notificationStatus,
    message: appointment.message,
    start: start.toDate(),
    end: end.toDate(),
    paymentId: appointment.paymentId,
    paymentStatus: appointment.paymentStatus,
    paymentMethod: appointment.paymentMethod,
  };
};