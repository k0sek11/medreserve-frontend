import { useEffect, useMemo, useState } from "react";
import dayjs, { type Dayjs } from "dayjs";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Checkbox,
    FormControl,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    InputLabel,
    MenuItem,
    ListItemText,
    Paper,
    Select,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { DatePicker, LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { plPL } from "@mui/x-date-pickers/locales";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar as BigCalendar, dayjsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
    doctorsApi,
    type CreateDoctorAppointmentTypeDto,
    type DoctorAppointmentTypeDto,
    type UpsertDoctorScheduleDto,
} from "../api/doctors";
import { clinicsApi, type ClinicListItemDto } from "../api/clinics";
import { notificationsApi, type AppointmentNotificationDto } from "../api/notifications";
import { useAuth } from "../context/AuthContext";
import { OfflinePaymentAction } from "../components/Payment/OfflinePaymentAction";

const calendarLocalizer = dayjsLocalizer(dayjs);

const weekdayOptions = [
    { value: 1, label: "Poniedziałek" },
    { value: 2, label: "Wtorek" },
    { value: 3, label: "Środa" },
    { value: 4, label: "Czwartek" },
    { value: 5, label: "Piątek" },
    { value: 6, label: "Sobota" },
    { value: 7, label: "Niedziela" },
] as const;

const toDateString = (value: Dayjs | null) => (value ? value.format("YYYY-MM-DD") : "");
const toTimeString = (value: Dayjs | null) => (value ? value.format("HH:mm") : "");

const parseTime = (value: string) => {
    const [hours, minutes] = value.split(":").map(Number);
    return dayjs()
        .startOf("day")
        .hour(Number.isFinite(hours) ? hours : 0)
        .minute(Number.isFinite(minutes) ? minutes : 0);
};

const createEmptyScheduleDraft = () => ({
    scheduleId: null as number | null,
    clinicId: "",
    dayOfWeek: 1,
    startTime: parseTime("08:00"),
    endTime: parseTime("16:00"),
    validFrom: dayjs().startOf("day"),
    validTo: null as Dayjs | null,
});

const createEmptyAppointmentTypeDraft = () => ({
    name: "",
    basePrice: "",
    durationMinutes: "",
});

type AppointmentAction = "Confirmed" | "Cancelled";

type DoctorAppointmentEvent = {
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
const buildAppointmentEvent = (
    appointment: AppointmentNotificationDto & {
        paymentId?: number;
        paymentStatus?: string;
        paymentMethod?: string;
    },
): DoctorAppointmentEvent | null => {
    const start = dayjs(`${appointment.date}T${appointment.startTime}`);
    const end = dayjs(`${appointment.date}T${appointment.endTime}`);

    if (!start.isValid() || !end.isValid()) {
        return null;
    }

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

const DoctorProfilePage = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [bioDraft, setBioDraft] = useState<string | null>(null);
    const [specializationDraft, setSpecializationDraft] = useState<number[] | null>(null);
    const [scheduleDraft, setScheduleDraft] = useState(createEmptyScheduleDraft());
    const [scheduleError, setScheduleError] = useState<string | null>(null);
    const [selectedAppointment, setSelectedAppointment] = useState<DoctorAppointmentEvent | null>(
        null,
    );
    const [appointmentAction, setAppointmentAction] = useState<AppointmentAction>("Confirmed");
    const [calendarDate, setCalendarDate] = useState(() => dayjs().startOf("week").toDate());
    const [appointmentTypeModalOpen, setAppointmentTypeModalOpen] = useState(false);
    const [appointmentTypeDraft, setAppointmentTypeDraft] = useState(
        createEmptyAppointmentTypeDraft(),
    );
    const [appointmentTypeError, setAppointmentTypeError] = useState<string | null>(null);
    const [appointmentTypeToDelete, setAppointmentTypeToDelete] =
        useState<DoctorAppointmentTypeDto | null>(null);

    const isDoctor = Boolean(user?.doctorProfileId);

    const profileQuery = useQuery({
        queryKey: ["doctor-my-profile"],
        queryFn: () => doctorsApi.getMyProfile(),
        enabled: isDoctor,
    });

    const schedulesQuery = useQuery({
        queryKey: ["doctor-my-schedules"],
        queryFn: () => doctorsApi.getMySchedules(),
        enabled: isDoctor,
    });

    const clinicsQuery = useQuery({
        queryKey: ["doctor-my-clinics"],
        queryFn: () => clinicsApi.mine(),
        enabled: isDoctor,
    });

    const specializationsQuery = useQuery({
        queryKey: ["doctor-specializations"],
        queryFn: () => doctorsApi.getSpecializations(),
        enabled: isDoctor,
    });

    const appointmentNotificationsQuery = useQuery({
        queryKey: ["doctor-appointment-notifications"],
        queryFn: () => notificationsApi.getAppointmentNotifications(),
        enabled: isDoctor,
    });

    const saveProfileMutation = useMutation({
        mutationFn: () =>
            doctorsApi.updateMyProfile({
                bio: (bioDraft ?? profileQuery.data?.bio ?? "").trim() || null,
                specializationIds: specializationDraft ?? undefined,
            }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["doctor-my-profile"] });
            setBioDraft(null);
        },
    });

    const saveScheduleMutation = useMutation({
        mutationFn: (payload: UpsertDoctorScheduleDto) => {
            if (scheduleDraft.scheduleId) {
                return doctorsApi.updateMySchedule(scheduleDraft.scheduleId, payload);
            }

            return doctorsApi.upsertMySchedule(payload);
        },
        onSuccess: async () => {
            setScheduleError(null);
            setScheduleDraft(createEmptyScheduleDraft());
            await queryClient.invalidateQueries({
                queryKey: ["doctor-my-schedules"],
            });
            await queryClient.invalidateQueries({ queryKey: ["doctor-my-profile"] });
        },
        onError: (error) => {
            setScheduleError(
                error instanceof Error ? error.message : "Nie udało się zapisać grafiku.",
            );
        },
    });

    const deleteScheduleMutation = useMutation({
        mutationFn: (scheduleId: number) => doctorsApi.deleteMySchedule(scheduleId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ["doctor-my-schedules"],
            });
            await queryClient.invalidateQueries({ queryKey: ["doctor-my-profile"] });
        },
    });

    const createAppointmentTypeMutation = useMutation({
        mutationFn: (payload: CreateDoctorAppointmentTypeDto) =>
            doctorsApi.createMyAppointmentType(payload),
        onSuccess: async () => {
            setAppointmentTypeError(null);
            setAppointmentTypeModalOpen(false);
            setAppointmentTypeDraft(createEmptyAppointmentTypeDraft());
            await queryClient.invalidateQueries({ queryKey: ["doctor-my-profile"] });
        },
        onError: (error) => {
            setAppointmentTypeError(
                error instanceof Error ? error.message : "Nie udało się utworzyć typu wizyty.",
            );
        },
    });

    const deleteAppointmentTypeMutation = useMutation({
        mutationFn: (appointmentTypeId: number) =>
            doctorsApi.deleteMyAppointmentType(appointmentTypeId),
        onSuccess: async () => {
            setAppointmentTypeToDelete(null);
            await queryClient.invalidateQueries({ queryKey: ["doctor-my-profile"] });
            await queryClient.invalidateQueries({
                queryKey: ["doctor-appointment-notifications"],
            });
            await queryClient.invalidateQueries({
                queryKey: ["appointment-notifications"],
            });
        },
    });

    const updateAppointmentStatusMutation = useMutation({
        mutationFn: async (status: AppointmentAction) => {
            if (!selectedAppointment) {
                throw new Error("Wybierz wizytę.");
            }

            if (status === "Confirmed") {
                return notificationsApi.confirmAppointment(selectedAppointment.notificationId);
            }

            return notificationsApi.cancelAppointment(selectedAppointment.notificationId);
        },
        onSuccess: async () => {
            setSelectedAppointment(null);
            await queryClient.invalidateQueries({
                queryKey: ["doctor-appointment-notifications"],
            });
            await queryClient.invalidateQueries({
                queryKey: ["appointment-notifications"],
            });
        },
    });

    const orderedSchedules = useMemo(() => {
        return [...(schedulesQuery.data ?? [])].sort((left, right) => {
            if ((left.clinicName ?? "") !== (right.clinicName ?? "")) {
                return (left.clinicName ?? "").localeCompare(right.clinicName ?? "");
            }

            if (left.dayOfWeek !== right.dayOfWeek) {
                return left.dayOfWeek - right.dayOfWeek;
            }

            return left.startTime.localeCompare(right.startTime);
        });
    }, [schedulesQuery.data]);

    const appointmentEvents = useMemo(() => {
        return (appointmentNotificationsQuery.data ?? [])
            .filter(
                (appointment) =>
                    !["Cancelled", "Canceled", "Rejected"].includes(appointment.status),
            )
            .map(buildAppointmentEvent)
            .filter((event): event is DoctorAppointmentEvent => event !== null)
            .sort((left, right) => left.start.getTime() - right.start.getTime());
    }, [appointmentNotificationsQuery.data]);

    const appointmentCounts = useMemo(() => {
        const counts = {
            pending: 0,
            confirmed: 0,
            completed: 0,
            other: 0,
        };

        appointmentEvents.forEach((event) => {
            const normalized = event.status.toLowerCase();

            if (normalized === "pending") {
                counts.pending += 1;
            } else if (normalized === "confirmed") {
                counts.confirmed += 1;
            } else if (normalized === "completed") {
                counts.completed += 1;
            } else {
                counts.other += 1;
            }
        });

        return counts;
    }, [appointmentEvents]);

    const handleSelectAppointment = (event: DoctorAppointmentEvent) => {
        setSelectedAppointment(event);
        setAppointmentAction(event.status === "Cancelled" ? "Confirmed" : "Confirmed");
    };

    const editingLabel = scheduleDraft.scheduleId ? "Edytuj grafik" : "Dodaj grafik";

    const selectedSpecializationIds = useMemo(() => {
        if (!profileQuery.data || !specializationsQuery.data) {
            return [] as number[];
        }

        return specializationsQuery.data
            .filter((item) => profileQuery.data.specializations.includes(item.name))
            .map((item) => item.specializationId);
    }, [profileQuery.data, specializationsQuery.data]);

    useEffect(() => {
        if (specializationDraft !== null) {
            return;
        }

        if (!profileQuery.data || !specializationsQuery.data) {
            return;
        }

        setSpecializationDraft(selectedSpecializationIds);
    }, [
        profileQuery.data,
        selectedSpecializationIds,
        specializationDraft,
        specializationsQuery.data,
    ]);

    const submitAppointmentType = () => {
        const name = appointmentTypeDraft.name.trim();
        const basePrice = Number(appointmentTypeDraft.basePrice);
        const durationMinutes = Number(appointmentTypeDraft.durationMinutes);

        if (!name) {
            setAppointmentTypeError("Podaj nazwę typu wizyty.");
            return;
        }

        if (!Number.isFinite(basePrice) || basePrice < 0) {
            setAppointmentTypeError("Podaj prawidłową cenę.");
            return;
        }

        if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
            setAppointmentTypeError("Podaj prawidłowy czas trwania w minutach.");
            return;
        }

        createAppointmentTypeMutation.mutate({
            name,
            basePrice,
            durationMinutes,
        });
    };

    const submitSchedule = () => {
        const hasClinic = Boolean(scheduleDraft.clinicId);
        const startTime = scheduleDraft.startTime.valueOf();
        const endTime = scheduleDraft.endTime.valueOf();

        if (!hasClinic) {
            setScheduleError("Wybierz przychodnię dla grafiku.");
            return;
        }

        if (endTime <= startTime) {
            setScheduleError("Godzina zakończenia musi być późniejsza niż godzina rozpoczęcia.");
            return;
        }

        if (
            scheduleDraft.validTo &&
            scheduleDraft.validTo.isBefore(scheduleDraft.validFrom, "day")
        ) {
            setScheduleError('Pole "Obowiązuje do" nie może być wcześniejsze niż "Obowiązuje od".');
            return;
        }

        saveScheduleMutation.mutate({
            scheduleId: scheduleDraft.scheduleId,
            clinicId: Number(scheduleDraft.clinicId),
            dayOfWeek: scheduleDraft.dayOfWeek,
            startTime: toTimeString(scheduleDraft.startTime),
            endTime: toTimeString(scheduleDraft.endTime),
            validFrom: toDateString(scheduleDraft.validFrom),
            validTo: scheduleDraft.validTo ? toDateString(scheduleDraft.validTo) : null,
            isActive: true,
        });
    };

    if (!isDoctor) {
        return (
            <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: "1px solid #dce5f2" }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: "#11223a", mb: 1 }}>
                    Brak profilu lekarza
                </Typography>
                <Typography sx={{ color: "#4f627a" }}>
                    To konto nie ma jeszcze przypisanego profilu lekarza.
                </Typography>
            </Paper>
        );
    }

    return (
        <LocalizationProvider
            dateAdapter={AdapterDayjs}
            adapterLocale="pl"
            localeText={plPL.components.MuiLocalizationProvider.defaultProps.localeText}
        >
            <Stack spacing={3}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: "#11223a", mb: 0.8 }}>
                        Mój profil lekarza
                    </Typography>
                    <Typography sx={{ color: "#4f627a" }}>
                        Zarządzaj opisem profilu i grafikami przypisanymi do konkretnych przychodni.
                    </Typography>
                </Box>

                <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid #dce5f2" }}>
                    <Stack spacing={2}>
                        <Box>
                            <Typography sx={{ fontWeight: 800, color: "#11223a", fontSize: 20 }}>
                                Kalendarz wizyt
                            </Typography>
                            <Typography sx={{ color: "#4f627a" }}>
                                Tygodniowy widok wszystkich wizyt, także oczekujących. Kliknij
                                wizytę, żeby zmienić status.
                            </Typography>
                        </Box>

                        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
                            <Chip
                                label={`Oczekujące: ${appointmentCounts.pending}`}
                                sx={{ bgcolor: "#fff3cd", color: "#8a5b00" }}
                            />
                            <Chip
                                label={`Zaakceptowane: ${appointmentCounts.confirmed}`}
                                sx={{ bgcolor: "#e8f7ee", color: "#1f9b45" }}
                            />
                            <Chip
                                label={`Zrealizowane: ${appointmentCounts.completed}`}
                                sx={{ bgcolor: "#eef6ff", color: "#0b74c9" }}
                            />
                        </Stack>

                        <Box
                            sx={{
                                height: { xs: 760, lg: 820 },
                                "& .rbc-calendar": {
                                    fontFamily: "inherit",
                                },
                                "& .rbc-toolbar": {
                                    display: "flex",
                                    flexDirection: { xs: "column", sm: "row" },
                                    gap: 1,
                                    alignItems: { sm: "center" },
                                    justifyContent: "space-between",
                                    mb: 2,
                                },
                                "& .rbc-toolbar-label": {
                                    fontWeight: 800,
                                    color: "#11223a",
                                    fontSize: 18,
                                },
                                "& .rbc-event": {
                                    borderRadius: 10,
                                    paddingLeft: 8,
                                    paddingRight: 8,
                                    paddingTop: 4,
                                    paddingBottom: 4,
                                    fontWeight: 700,
                                },
                                "& .rbc-today": {
                                    backgroundColor: "#f6fbff",
                                },
                            }}
                        >
                            <BigCalendar
                                localizer={calendarLocalizer}
                                events={appointmentEvents}
                                startAccessor="start"
                                endAccessor="end"
                                view="week"
                                views={["week"]}
                                date={calendarDate}
                                onNavigate={(nextDate) => setCalendarDate(nextDate)}
                                onSelectEvent={handleSelectAppointment}
                                popup
                                eventPropGetter={(event) => ({
                                    style: {
                                        backgroundColor:
                                            event.status === "Pending"
                                                ? "#f59f00"
                                                : event.status === "Confirmed"
                                                  ? "#1f9b45"
                                                  : event.status === "Completed"
                                                    ? "#0b74c9"
                                                    : "#64748b",
                                        border: "none",
                                        color: "#ffffff",
                                        borderRadius: 3,
                                        padding: 0,
                                        margin: 0,
                                    },
                                })}
                            />
                        </Box>
                    </Stack>
                </Paper>

                <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12, md: 4.2 }}>
                        <Paper
                            elevation={0}
                            sx={{ p: 2.5, borderRadius: 3, border: "1px solid #dce5f2" }}
                        >
                            <Stack spacing={1.5}>
                                <Box>
                                    <Typography
                                        sx={{ fontWeight: 800, color: "#11223a", fontSize: 20 }}
                                    >
                                        {profileQuery.data?.fullName ?? "Profil lekarza"}
                                    </Typography>
                                    <Typography sx={{ color: "#4f627a" }}>
                                        Licencja: {profileQuery.data?.licenseNumber ?? "-"}
                                    </Typography>
                                </Box>

                                <TextField
                                    label="Bio"
                                    value={bioDraft ?? profileQuery.data?.bio ?? ""}
                                    onChange={(event) => setBioDraft(event.target.value)}
                                    minRows={5}
                                    multiline
                                    fullWidth
                                />

                                <FormControl fullWidth disabled={specializationsQuery.isLoading}>
                                    <InputLabel id="doctor-specializations-label">
                                        Specjalizacje
                                    </InputLabel>
                                    <Select
                                        labelId="doctor-specializations-label"
                                        multiple
                                        label="Specjalizacje"
                                        value={specializationDraft ?? []}
                                        onChange={(event) => {
                                            const value = event.target.value;
                                            setSpecializationDraft(
                                                typeof value === "string"
                                                    ? value.split(",").map(Number)
                                                    : (value as number[]),
                                            );
                                        }}
                                        renderValue={(selected) => {
                                            const selectedIds = selected as number[];

                                            if (selectedIds.length === 0) {
                                                return "Wybierz specjalizacje";
                                            }

                                            return selectedIds
                                                .map(
                                                    (id) =>
                                                        specializationsQuery.data?.find(
                                                            (item) => item.specializationId === id,
                                                        )?.name ?? String(id),
                                                )
                                                .join(", ");
                                        }}
                                    >
                                        {specializationsQuery.data?.map((item) => {
                                            const checked = (specializationDraft ?? []).includes(
                                                item.specializationId,
                                            );

                                            return (
                                                <MenuItem
                                                    key={item.specializationId}
                                                    value={item.specializationId}
                                                >
                                                    <Checkbox checked={checked} />
                                                    <ListItemText primary={item.name} />
                                                </MenuItem>
                                            );
                                        })}
                                    </Select>
                                </FormControl>

                                {specializationsQuery.isError ? (
                                    <Alert severity="error">
                                        Nie udało się pobrać listy specjalizacji.
                                    </Alert>
                                ) : null}

                                <Button
                                    variant="contained"
                                    onClick={() => saveProfileMutation.mutate()}
                                    disabled={saveProfileMutation.isPending}
                                    sx={{ textTransform: "none", fontWeight: 700 }}
                                >
                                    {saveProfileMutation.isPending
                                        ? "Zapisywanie..."
                                        : "Zapisz bio"}
                                </Button>

                                {profileQuery.data?.specializations?.length ? (
                                    <Box>
                                        <Typography
                                            sx={{ fontWeight: 700, color: "#4f627a", mb: 0.8 }}
                                        >
                                            Specjalizacje
                                        </Typography>
                                        <Stack
                                            direction="row"
                                            spacing={1}
                                            useFlexGap
                                            sx={{ flexWrap: "wrap" }}
                                        >
                                            {profileQuery.data.specializations.map((item) => (
                                                <Chip
                                                    key={item}
                                                    label={item}
                                                    sx={{ bgcolor: "#eef6ff", color: "#0b74c9" }}
                                                />
                                            ))}
                                        </Stack>
                                    </Box>
                                ) : null}

                                {profileQuery.data?.appointmentTypes?.length ? (
                                    <Box>
                                        <Stack
                                            direction="row"
                                            spacing={1}
                                            sx={{
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                mb: 0.8,
                                            }}
                                        >
                                            <Typography sx={{ fontWeight: 700, color: "#4f627a" }}>
                                                Typy wizyt
                                            </Typography>
                                            <Button
                                                variant="outlined"
                                                onClick={() => setAppointmentTypeModalOpen(true)}
                                                sx={{ textTransform: "none" }}
                                            >
                                                Dodaj typ wizyty
                                            </Button>
                                        </Stack>
                                        <Stack spacing={1}>
                                            {profileQuery.data.appointmentTypes.map((item) => (
                                                <Card
                                                    key={item.appointmentTypeId}
                                                    variant="outlined"
                                                    sx={{ borderRadius: 2 }}
                                                >
                                                    <CardContent
                                                        sx={{
                                                            py: 1.5,
                                                            "&:last-child": { pb: 1.5 },
                                                        }}
                                                    >
                                                        <Stack
                                                            direction={{ xs: "column", sm: "row" }}
                                                            spacing={1}
                                                            sx={{
                                                                justifyContent: "space-between",
                                                                alignItems: { sm: "center" },
                                                            }}
                                                        >
                                                            <Stack spacing={0.3}>
                                                                <Typography
                                                                    sx={{
                                                                        fontWeight: 700,
                                                                        color: "#11223a",
                                                                    }}
                                                                >
                                                                    {item.name}
                                                                </Typography>
                                                                <Typography
                                                                    sx={{
                                                                        color: "#4f627a",
                                                                        fontSize: 14,
                                                                    }}
                                                                >
                                                                    {item.basePrice.toFixed(0)} zł •{" "}
                                                                    {item.durationMinutes} min
                                                                </Typography>
                                                            </Stack>
                                                            <Button
                                                                color="error"
                                                                variant="outlined"
                                                                onClick={() =>
                                                                    setAppointmentTypeToDelete(item)
                                                                }
                                                                sx={{ textTransform: "none" }}
                                                            >
                                                                Usuń
                                                            </Button>
                                                        </Stack>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </Stack>
                                    </Box>
                                ) : (
                                    <Box>
                                        <Stack
                                            direction="row"
                                            spacing={1}
                                            sx={{
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                mb: 0.8,
                                            }}
                                        >
                                            <Typography sx={{ fontWeight: 700, color: "#4f627a" }}>
                                                Typy wizyt
                                            </Typography>
                                            <Button
                                                variant="outlined"
                                                onClick={() => setAppointmentTypeModalOpen(true)}
                                                sx={{ textTransform: "none" }}
                                            >
                                                Dodaj typ wizyty
                                            </Button>
                                        </Stack>
                                        <Alert severity="info">
                                            Nie masz jeszcze żadnych typów wizyt.
                                        </Alert>
                                    </Box>
                                )}
                            </Stack>
                        </Paper>
                    </Grid>

                    <Grid size={{ xs: 12, md: 7.8 }}>
                        <Paper
                            elevation={0}
                            sx={{ p: 2.5, borderRadius: 3, border: "1px solid #dce5f2" }}
                        >
                            <Stack spacing={2}>
                                <Box>
                                    <Typography
                                        sx={{ fontWeight: 800, color: "#11223a", fontSize: 20 }}
                                    >
                                        {editingLabel}
                                    </Typography>
                                    <Typography sx={{ color: "#4f627a" }}>
                                        Ustaw przychodnię, dzień tygodnia, zakres godzin i okres
                                        obowiązywania grafiku.
                                    </Typography>
                                </Box>

                                {scheduleError ? (
                                    <Alert severity="error">{scheduleError}</Alert>
                                ) : saveScheduleMutation.isError ? (
                                    <Alert severity="error">Nie udało się zapisać grafiku.</Alert>
                                ) : null}

                                {clinicsQuery.isLoading ? (
                                    <Alert severity="info">Ładowanie Twoich przychodni...</Alert>
                                ) : null}

                                {!clinicsQuery.isLoading &&
                                (clinicsQuery.data?.length ?? 0) === 0 ? (
                                    <Alert severity="warning">
                                        Najpierw zarejestruj lub dołącz do przychodni, aby móc dodać
                                        grafik.
                                    </Alert>
                                ) : null}

                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <FormControl fullWidth required>
                                            <InputLabel id="clinic-label">Przychodnia</InputLabel>
                                            <Select
                                                labelId="clinic-label"
                                                label="Przychodnia"
                                                value={scheduleDraft.clinicId}
                                                onChange={(event) =>
                                                    setScheduleDraft((current) => ({
                                                        ...current,
                                                        clinicId: String(event.target.value),
                                                    }))
                                                }
                                                disabled={
                                                    clinicsQuery.isLoading ||
                                                    (clinicsQuery.data?.length ?? 0) === 0
                                                }
                                            >
                                                {(clinicsQuery.data ?? []).map(
                                                    (clinic: ClinicListItemDto) => (
                                                        <MenuItem
                                                            key={clinic.clinicId}
                                                            value={String(clinic.clinicId)}
                                                        >
                                                            {clinic.name} - {clinic.streetAddress}
                                                        </MenuItem>
                                                    ),
                                                )}
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <FormControl fullWidth>
                                            <InputLabel id="weekday-label">
                                                Dzień tygodnia
                                            </InputLabel>
                                            <Select
                                                labelId="weekday-label"
                                                label="Dzień tygodnia"
                                                value={scheduleDraft.dayOfWeek}
                                                onChange={(event) =>
                                                    setScheduleDraft((current) => ({
                                                        ...current,
                                                        dayOfWeek: Number(event.target.value),
                                                    }))
                                                }
                                            >
                                                {weekdayOptions.map((option) => (
                                                    <MenuItem
                                                        key={option.value}
                                                        value={option.value}
                                                    >
                                                        {option.label}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TimePicker
                                            label="Od"
                                            value={scheduleDraft.startTime}
                                            onChange={(value) =>
                                                setScheduleDraft((current) => ({
                                                    ...current,
                                                    startTime: value ?? parseTime("08:00"),
                                                }))
                                            }
                                            minutesStep={15}
                                            ampm={false}
                                            slotProps={{ textField: { fullWidth: true } }}
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TimePicker
                                            label="Do"
                                            value={scheduleDraft.endTime}
                                            onChange={(value) =>
                                                setScheduleDraft((current) => ({
                                                    ...current,
                                                    endTime: value ?? parseTime("16:00"),
                                                }))
                                            }
                                            minutesStep={15}
                                            ampm={false}
                                            slotProps={{ textField: { fullWidth: true } }}
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <DatePicker
                                            label="Obowiązuje od"
                                            value={scheduleDraft.validFrom}
                                            onChange={(value) =>
                                                setScheduleDraft((current) => ({
                                                    ...current,
                                                    validFrom: value ?? dayjs().startOf("day"),
                                                }))
                                            }
                                            slotProps={{ textField: { fullWidth: true } }}
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <DatePicker
                                            label="Obowiązuje do"
                                            value={scheduleDraft.validTo}
                                            onChange={(value) =>
                                                setScheduleDraft((current) => ({
                                                    ...current,
                                                    validTo: value,
                                                }))
                                            }
                                            slotProps={{ textField: { fullWidth: true } }}
                                        />
                                    </Grid>
                                </Grid>

                                <Stack direction="row" spacing={1.2}>
                                    <Button
                                        variant="contained"
                                        onClick={submitSchedule}
                                        disabled={
                                            saveScheduleMutation.isPending || clinicsQuery.isLoading
                                        }
                                        sx={{ textTransform: "none", fontWeight: 700 }}
                                    >
                                        {saveScheduleMutation.isPending
                                            ? "Zapisywanie..."
                                            : "Zapisz grafik"}
                                    </Button>
                                </Stack>
                            </Stack>
                        </Paper>

                        <Paper
                            elevation={0}
                            sx={{
                                p: 2.5,
                                borderRadius: 3,
                                border: "1px solid #dce5f2",
                                mt: 2.5,
                            }}
                        >
                            <Stack spacing={1.5}>
                                <Typography
                                    sx={{ fontWeight: 800, color: "#11223a", fontSize: 20 }}
                                >
                                    Aktualne grafiki
                                </Typography>

                                {schedulesQuery.isLoading ? (
                                    <Typography sx={{ color: "#4f627a" }}>
                                        Ładowanie grafików...
                                    </Typography>
                                ) : null}

                                {!schedulesQuery.isLoading && orderedSchedules.length === 0 ? (
                                    <Typography sx={{ color: "#4f627a" }}>
                                        Brak zapisanych grafików. Dodaj pierwszy termin.
                                    </Typography>
                                ) : null}

                                <Stack spacing={1.2}>
                                    {orderedSchedules.map((schedule) => (
                                        <Card
                                            key={schedule.scheduleId}
                                            variant="outlined"
                                            sx={{ borderRadius: 2 }}
                                        >
                                            <CardContent>
                                                <Stack
                                                    direction={{ xs: "column", sm: "row" }}
                                                    spacing={1}
                                                    sx={{
                                                        justifyContent: "space-between",
                                                        alignItems: { sm: "center" },
                                                    }}
                                                >
                                                    <Box>
                                                        <Typography
                                                            sx={{
                                                                fontWeight: 700,
                                                                color: "#11223a",
                                                            }}
                                                        >
                                                            {weekdayOptions.find(
                                                                (item) =>
                                                                    item.value ===
                                                                    schedule.dayOfWeek,
                                                            )?.label ??
                                                                `Dzień ${schedule.dayOfWeek}`}
                                                        </Typography>
                                                        <Typography
                                                            sx={{
                                                                color: "#4f627a",
                                                                fontWeight: 600,
                                                            }}
                                                        >
                                                            {schedule.clinicName ??
                                                                "Brak przypisanej przychodni"}
                                                        </Typography>
                                                        <Typography sx={{ color: "#4f627a" }}>
                                                            {schedule.startTime} -{" "}
                                                            {schedule.endTime}
                                                        </Typography>
                                                        <Typography
                                                            sx={{ color: "#4f627a", fontSize: 14 }}
                                                        >
                                                            {schedule.validFrom}{" "}
                                                            {schedule.validTo
                                                                ? `- ${schedule.validTo}`
                                                                : "- bez końca"}
                                                        </Typography>
                                                    </Box>

                                                    <Stack direction="row" spacing={1}>
                                                        <Button
                                                            variant="outlined"
                                                            onClick={() =>
                                                                setScheduleDraft({
                                                                    scheduleId: schedule.scheduleId,
                                                                    clinicId: schedule.clinicId
                                                                        ? String(schedule.clinicId)
                                                                        : "",
                                                                    dayOfWeek: schedule.dayOfWeek,
                                                                    startTime: parseTime(
                                                                        schedule.startTime,
                                                                    ),
                                                                    endTime: parseTime(
                                                                        schedule.endTime,
                                                                    ),
                                                                    validFrom: dayjs(
                                                                        schedule.validFrom,
                                                                    ),
                                                                    validTo: schedule.validTo
                                                                        ? dayjs(schedule.validTo)
                                                                        : null,
                                                                })
                                                            }
                                                            sx={{ textTransform: "none" }}
                                                        >
                                                            Edytuj
                                                        </Button>
                                                        <Button
                                                            color="error"
                                                            variant="outlined"
                                                            onClick={() =>
                                                                deleteScheduleMutation.mutate(
                                                                    schedule.scheduleId,
                                                                )
                                                            }
                                                            disabled={
                                                                deleteScheduleMutation.isPending
                                                            }
                                                            sx={{ textTransform: "none" }}
                                                        >
                                                            Usuń
                                                        </Button>
                                                    </Stack>
                                                </Stack>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </Stack>
                            </Stack>
                        </Paper>
                    </Grid>
                </Grid>

                <Dialog
                    open={Boolean(selectedAppointment)}
                    onClose={() => setSelectedAppointment(null)}
                    fullWidth
                    maxWidth="sm"
                >
                    <DialogTitle sx={{ fontWeight: 800, color: "#11223a" }}>
                        Szczegóły wizyty
                    </DialogTitle>
                    <DialogContent dividers>
                        {selectedAppointment ? (
                            <Stack spacing={2} sx={{ pt: 0.5 }}>
                                <Box>
                                    <Typography
                                        sx={{ fontWeight: 800, color: "#11223a", fontSize: 18 }}
                                    >
                                        {selectedAppointment.patientName}
                                    </Typography>
                                    <Typography sx={{ color: "#4f627a" }}>
                                        {selectedAppointment.appointmentType ?? "Nieznane"} •{" "}
                                        {dayjs(selectedAppointment.start).format(
                                            "DD.MM.YYYY HH:mm",
                                        )}
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography sx={{ color: "#4f627a", fontSize: 14 }}>
                                        Lekarz
                                    </Typography>
                                    <Typography sx={{ fontWeight: 700 }}>
                                        {selectedAppointment.doctorName}
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography sx={{ color: "#4f627a", fontSize: 14 }}>
                                        Status wizyty
                                    </Typography>
                                    <Typography sx={{ fontWeight: 700 }}>
                                        {selectedAppointment.status}
                                    </Typography>
                                </Box>

                                <Box
                                    sx={{
                                        p: 2,
                                        bgcolor: "#f8f9fa",
                                        borderRadius: 2,
                                        border: "1px solid #e9ecef",
                                    }}
                                >
                                    <Typography sx={{ color: "#4f627a", fontSize: 14, mb: 0.5 }}>
                                        Rozliczenie
                                    </Typography>

                                    {selectedAppointment.paymentStatus === "Paid" && (
                                        <Chip
                                            label="Opłacona"
                                            color="success"
                                            sx={{ fontWeight: "bold" }}
                                        />
                                    )}

                                    {selectedAppointment.paymentStatus === "Pending" &&
                                        selectedAppointment.paymentMethod === "Offline" &&
                                        selectedAppointment.paymentId && (
                                            <Box sx={{ mt: 1 }}>
                                                <Chip
                                                    label="Oczekuje na zapłatę w placówce"
                                                    color="warning"
                                                    sx={{ mb: 2, fontWeight: "bold" }}
                                                />
                                                <OfflinePaymentAction
                                                    paymentId={selectedAppointment.paymentId}
                                                />
                                            </Box>
                                        )}

                                    {selectedAppointment.paymentStatus === "Pending" &&
                                        selectedAppointment.paymentMethod === "PayU" && (
                                            <Chip
                                                label="Oczekuje na płatność online (PayU)"
                                                color="warning"
                                                variant="outlined"
                                            />
                                        )}

                                    {!selectedAppointment.paymentStatus && (
                                        <Typography
                                            sx={{
                                                color: "#888",
                                                fontStyle: "italic",
                                                fontSize: 14,
                                            }}
                                        >
                                            Brak informacji o płatnościach.
                                        </Typography>
                                    )}
                                </Box>

                                {selectedAppointment &&
                                    selectedAppointment.paymentStatus !== "Paid" && (
                                        <FormControl fullWidth>
                                            <InputLabel id="appointment-action-label">
                                                Zmień status wizyty
                                            </InputLabel>
                                            <Select
                                                labelId="appointment-action-label"
                                                label="Zmień status wizyty"
                                                value={appointmentAction}
                                                onChange={(event) =>
                                                    setAppointmentAction(
                                                        event.target.value as AppointmentAction,
                                                    )
                                                }
                                            >
                                                <MenuItem value="Confirmed">Zaakceptowano</MenuItem>
                                                <MenuItem value="Cancelled">Anuluj</MenuItem>
                                            </Select>
                                        </FormControl>
                                    )}
                            </Stack>
                        ) : null}
                    </DialogContent>
                    <DialogActions sx={{ px: 3, py: 2 }}>
                        <Button
                            onClick={() => setSelectedAppointment(null)}
                            sx={{ textTransform: "none" }}
                        >
                            Zamknij
                        </Button>
                        {selectedAppointment && selectedAppointment.paymentStatus !== "Paid" && (
                            <Button
                                variant="contained"
                                onClick={() =>
                                    updateAppointmentStatusMutation.mutate(appointmentAction)
                                }
                                disabled={
                                    updateAppointmentStatusMutation.isPending ||
                                    !selectedAppointment
                                }
                                sx={{ textTransform: "none", fontWeight: 700 }}
                            >
                                {updateAppointmentStatusMutation.isPending
                                    ? "Zapisywanie..."
                                    : "Zatwierdź"}
                            </Button>
                        )}
                    </DialogActions>
                </Dialog>

                <Dialog
                    open={Boolean(appointmentTypeToDelete)}
                    onClose={() => setAppointmentTypeToDelete(null)}
                    fullWidth
                    maxWidth="sm"
                >
                    <DialogTitle sx={{ fontWeight: 800, color: "#11223a" }}>
                        Usuń typ wizyty
                    </DialogTitle>
                    <DialogContent dividers>
                        <Stack spacing={1.5} sx={{ pt: 0.5 }}>
                            <Alert severity="warning">
                                Usunięcie typu wizyty nie skasuje historii wizyt. W istniejących
                                wpisach nazwa typu będzie widoczna jako „Nieznane”.
                            </Alert>
                            <Typography sx={{ color: "#4f627a" }}>
                                Czy na pewno chcesz usunąć typ wizyty{" "}
                                {appointmentTypeToDelete?.name ?? ""}?
                            </Typography>
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, py: 2 }}>
                        <Button
                            onClick={() => setAppointmentTypeToDelete(null)}
                            sx={{ textTransform: "none" }}
                        >
                            Anuluj
                        </Button>
                        <Button
                            color="error"
                            variant="contained"
                            onClick={() => {
                                if (appointmentTypeToDelete) {
                                    deleteAppointmentTypeMutation.mutate(
                                        appointmentTypeToDelete.appointmentTypeId,
                                    );
                                }
                            }}
                            disabled={deleteAppointmentTypeMutation.isPending}
                            sx={{ textTransform: "none", fontWeight: 700 }}
                        >
                            {deleteAppointmentTypeMutation.isPending ? "Usuwanie..." : "Usuń"}
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog
                    open={appointmentTypeModalOpen}
                    onClose={() => {
                        setAppointmentTypeModalOpen(false);
                        setAppointmentTypeError(null);
                    }}
                    fullWidth
                    maxWidth="sm"
                >
                    <DialogTitle sx={{ fontWeight: 800, color: "#11223a" }}>
                        Dodaj typ wizyty
                    </DialogTitle>
                    <DialogContent dividers>
                        <Stack spacing={2} sx={{ pt: 0.5 }}>
                            {appointmentTypeError ? (
                                <Alert severity="error">{appointmentTypeError}</Alert>
                            ) : null}
                            <TextField
                                label="Nazwa"
                                value={appointmentTypeDraft.name}
                                onChange={(event) => {
                                    setAppointmentTypeDraft((current) => ({
                                        ...current,
                                        name: event.target.value,
                                    }));
                                }}
                                fullWidth
                            />
                            <TextField
                                label="Cena"
                                type="number"
                                slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
                                value={appointmentTypeDraft.basePrice}
                                onChange={(event) => {
                                    setAppointmentTypeDraft((current) => ({
                                        ...current,
                                        basePrice: event.target.value,
                                    }));
                                }}
                                fullWidth
                            />
                            <TextField
                                label="Czas trwania w minutach"
                                type="number"
                                slotProps={{ htmlInput: { min: 1, step: 1 } }}
                                value={appointmentTypeDraft.durationMinutes}
                                onChange={(event) => {
                                    setAppointmentTypeDraft((current) => ({
                                        ...current,
                                        durationMinutes: event.target.value,
                                    }));
                                }}
                                fullWidth
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, py: 2 }}>
                        <Button
                            onClick={() => {
                                setAppointmentTypeModalOpen(false);
                                setAppointmentTypeError(null);
                            }}
                            sx={{ textTransform: "none" }}
                        >
                            Anuluj
                        </Button>
                        <Button
                            variant="contained"
                            onClick={submitAppointmentType}
                            disabled={createAppointmentTypeMutation.isPending}
                            sx={{ textTransform: "none", fontWeight: 700 }}
                        >
                            {createAppointmentTypeMutation.isPending ? "Zapisywanie..." : "Utwórz"}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Stack>
        </LocalizationProvider>
    );
};

export default DoctorProfilePage;
