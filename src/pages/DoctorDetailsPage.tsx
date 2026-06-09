import { useEffect, useMemo, useState } from "react";
import dayjs, { type Dayjs } from "dayjs";
import {
    Badge,
    Alert,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    Grid,
    MenuItem,
    Paper,
    Select,
    Stack,
    Typography,
} from "@mui/material";
import { DateCalendar, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { plPL } from "@mui/x-date-pickers/locales";
import { PickerDay, type PickerDayProps } from "@mui/x-date-pickers";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams, Link as RouterLink } from "react-router-dom";
import doctorImage from "../assets/Cr7_doctor.png";
import { doctorsApi } from "../api/doctors";
import { appointmentsApi } from "../api/appointments";
import { useAuth } from "../context/AuthContext";

const formatMoney = (value: number) => `${value.toFixed(0)} zł`;

const DoctorDetailsPage = () => {
    const { doctorId } = useParams();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { user } = useAuth();

    const parsedDoctorId = Number(doctorId);
    const isValidDoctorId = Number.isFinite(parsedDoctorId) && parsedDoctorId > 0;
    const isOwnProfile = Boolean(user?.doctorProfileId && user.doctorProfileId === parsedDoctorId);

    const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs().startOf("day"));
    const [selectedAppointmentTypeId, setSelectedAppointmentTypeId] = useState<number | null>(null);
    const [selectedClinicId, setSelectedClinicId] = useState<number | null>(null);
    const [visibleMonth, setVisibleMonth] = useState<Dayjs>(dayjs().startOf("month"));
    const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
    const [bookingMessage, setBookingMessage] = useState<string | null>(null);

    const profileQuery = useQuery({
        queryKey: ["doctor-public-profile", parsedDoctorId],
        queryFn: () => doctorsApi.getPublicProfile(parsedDoctorId),
        enabled: isValidDoctorId,
    });

    const activeAppointmentTypeId =
        selectedAppointmentTypeId ??
        profileQuery.data?.appointmentTypes[0]?.appointmentTypeId ??
        null;

    useEffect(() => {
        if (selectedClinicId !== null) {
            return;
        }

        const firstClinic = profileQuery.data?.clinics[0];
        if (firstClinic) {
            setSelectedClinicId(firstClinic.clinicId);
        }
    }, [profileQuery.data?.clinics, selectedClinicId]);

    const selectedClinic = useMemo(() => {
        return (
            profileQuery.data?.clinics.find((clinic) => clinic.clinicId === selectedClinicId) ??
            null
        );
    }, [profileQuery.data?.clinics, selectedClinicId]);

    const availabilityQuery = useQuery({
        queryKey: [
            "doctor-availability",
            parsedDoctorId,
            selectedDate.format("YYYY-MM-DD"),
            activeAppointmentTypeId,
            selectedClinicId,
        ],
        queryFn: () =>
            doctorsApi.getAvailability(parsedDoctorId, {
                date: selectedDate.format("YYYY-MM-DD"),
                appointmentTypeId: activeAppointmentTypeId as number,
                clinicId: selectedClinicId as number,
            }),
        enabled: isValidDoctorId && activeAppointmentTypeId !== null && selectedClinicId !== null,
    });

    const monthAvailabilityQuery = useQuery({
        queryKey: [
            "doctor-availability-calendar",
            parsedDoctorId,
            visibleMonth.format("YYYY-MM"),
            activeAppointmentTypeId,
            selectedClinicId,
        ],
        queryFn: () =>
            doctorsApi.getAvailabilityCalendar(parsedDoctorId, {
                year: visibleMonth.year(),
                month: visibleMonth.month() + 1,
                appointmentTypeId: activeAppointmentTypeId as number,
                clinicId: selectedClinicId as number,
            }),
        enabled: isValidDoctorId && activeAppointmentTypeId !== null && selectedClinicId !== null,
    });

    const bookMutation = useMutation({
        mutationFn: () => {
            const selectedSlot = availabilityQuery.data?.slots.find(
                (slot) => slot.startAt === selectedSlotId,
            );

            if (!selectedSlot || activeAppointmentTypeId === null) {
                throw new Error("Wybierz wolny termin.");
            }

            if (selectedClinicId === null) {
                throw new Error("Wybierz przychodnię.");
            }

            return appointmentsApi.book({
                doctorId: parsedDoctorId,
                clinicId: selectedClinicId,
                appointmentTypeId: activeAppointmentTypeId,
                date: selectedDate.format("YYYY-MM-DD"),
                startTime: dayjs(selectedSlot.startAt).format("HH:mm"),
            });
        },
        onSuccess: async (result) => {
            setSelectedSlotId(null);
            await queryClient.invalidateQueries({
                queryKey: ["doctor-availability", parsedDoctorId],
            });
            await queryClient.invalidateQueries({
                queryKey: ["doctor-availability-calendar", parsedDoctorId],
            });
            navigate(`/wizyty/potwierdzenie/${result.appointmentId}`, {
                state: result,
                replace: true,
            });
        },
        onError: (error) => {
            setBookingMessage(
                error instanceof Error ? error.message : "Nie udało się zarezerwować wizyty.",
            );
        },
    });

    const selectedAppointmentType = useMemo(() => {
        return profileQuery.data?.appointmentTypes.find(
            (item) => item.appointmentTypeId === activeAppointmentTypeId,
        );
    }, [profileQuery.data, activeAppointmentTypeId]);

    const availableSlots = useMemo(() => {
        return availabilityQuery.data?.slots.filter((slot) => !slot.isBooked) ?? [];
    }, [availabilityQuery.data]);

    const availableDays = useMemo(() => {
        return new Set(monthAvailabilityQuery.data?.availableDates ?? []);
    }, [monthAvailabilityQuery.data]);

    if (!isValidDoctorId) {
        return (
            <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: "1px solid #dce5f2" }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: "#11223a" }}>
                    Nieprawidłowy lekarz
                </Typography>
            </Paper>
        );
    }

    if (profileQuery.isLoading) {
        return (
            <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: "1px solid #dce5f2" }}>
                <Typography sx={{ color: "#4f627a" }}>Ładowanie profilu lekarza...</Typography>
            </Paper>
        );
    }

    if (profileQuery.isError || !profileQuery.data) {
        return (
            <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: "1px solid #dce5f2" }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: "#11223a" }}>
                    Nie znaleziono lekarza
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
            <Box sx={{ py: { xs: 2, md: 4 } }}>
                <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Card elevation={0} sx={{ border: "1px solid #dce5f2", borderRadius: 3 }}>
                            <Box sx={{ position: "relative" }}>
                                <Box
                                    component="img"
                                    src={doctorImage}
                                    alt={profileQuery.data.fullName}
                                    sx={{ width: "100%", height: 320, objectFit: "cover" }}
                                />
                            </Box>

                            <CardContent>
                                <Stack spacing={1.2}>
                                    <Box>
                                        <Typography
                                            sx={{
                                                fontSize: 30,
                                                fontWeight: 800,
                                                color: "#11223a",
                                                lineHeight: 1.15,
                                            }}
                                        >
                                            {profileQuery.data.fullName}
                                        </Typography>
                                        <Typography sx={{ color: "#5a6e86", fontSize: 18 }}>
                                            {profileQuery.data.specializations.join(", ") ||
                                                "Brak specjalizacji"}
                                        </Typography>
                                    </Box>

                                    <Divider />

                                    <Stack spacing={0.8}>
                                        <RoundIconInfo
                                            icon="P"
                                            text={profileQuery.data.phoneNumber ?? "Brak telefonu"}
                                        />
                                        <RoundIconInfo
                                            icon="M"
                                            text={profileQuery.data.city ?? "Brak miasta"}
                                        />
                                        <RoundIconInfo
                                            icon="A"
                                            text={
                                                profileQuery.data.streetAddress ??
                                                "Brak adresu placówki"
                                            }
                                        />
                                    </Stack>

                                    {profileQuery.data.bio ? (
                                        <Typography sx={{ color: "#2f4258", lineHeight: 1.7 }}>
                                            {profileQuery.data.bio}
                                        </Typography>
                                    ) : null}

                                    {isOwnProfile ? (
                                        <Button
                                            component={RouterLink}
                                            to="/moj-profil"
                                            variant="outlined"
                                            sx={{ textTransform: "none", fontWeight: 700 }}
                                        >
                                            Przejdź do mojego profilu
                                        </Button>
                                    ) : null}
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12, md: 8 }}>
                        <Stack spacing={2.5}>
                            <Paper
                                elevation={0}
                                sx={{ border: "1px solid #dce5f2", borderRadius: 3, p: 2.5 }}
                            >
                                <Stack spacing={1.5}>
                                    <Box>
                                        <Typography
                                            sx={{ fontWeight: 800, color: "#11223a", fontSize: 22 }}
                                        >
                                            Umów wizytę
                                        </Typography>
                                        <Typography sx={{ color: "#4f627a" }}>
                                            Wybierz typ wizyty, datę i wolny termin z kalendarza.
                                        </Typography>
                                    </Box>

                                    {profileQuery.data.clinics.length === 0 ? (
                                        <Alert severity="info">
                                            Ten lekarz nie ma jeszcze przypisanej przychodni.
                                        </Alert>
                                    ) : profileQuery.data.appointmentTypes.length === 0 ? (
                                        <Alert severity="info">
                                            Ten lekarz nie ma przypisanych typów wizyt.
                                        </Alert>
                                    ) : (
                                        <Grid container spacing={2}>
                                            <Grid size={{ xs: 12, lg: 4 }}>
                                                <Stack spacing={2}>
                                                    <Select
                                                        value={selectedClinicId ?? ""}
                                                        onChange={(event) => {
                                                            setSelectedClinicId(
                                                                Number(event.target.value),
                                                            );
                                                            setSelectedSlotId(null);
                                                            setBookingMessage(null);
                                                        }}
                                                        fullWidth
                                                        displayEmpty
                                                    >
                                                        <MenuItem value="" disabled>
                                                            Wybierz przychodnię
                                                        </MenuItem>
                                                        {profileQuery.data.clinics.map((clinic) => (
                                                            <MenuItem
                                                                key={clinic.clinicId}
                                                                value={clinic.clinicId}
                                                            >
                                                                {clinic.name} • {clinic.city}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>

                                                    <Select
                                                        value={selectedAppointmentTypeId ?? ""}
                                                        onChange={(event) => {
                                                            setSelectedAppointmentTypeId(
                                                                Number(event.target.value),
                                                            );
                                                            setSelectedSlotId(null);
                                                            setBookingMessage(null);
                                                        }}
                                                        fullWidth
                                                        displayEmpty
                                                    >
                                                        <MenuItem value="" disabled>
                                                            Wybierz typ wizyty
                                                        </MenuItem>
                                                        {profileQuery.data.appointmentTypes.map(
                                                            (type) => (
                                                                <MenuItem
                                                                    key={type.appointmentTypeId}
                                                                    value={type.appointmentTypeId}
                                                                >
                                                                    {type.name} •{" "}
                                                                    {formatMoney(type.basePrice)} •{" "}
                                                                    {type.durationMinutes} min
                                                                </MenuItem>
                                                            ),
                                                        )}
                                                    </Select>

                                                    {selectedClinicId !== null &&
                                                        selectedAppointmentTypeId !== null && (
                                                            <Paper
                                                                elevation={0}
                                                                sx={{
                                                                    border: "1px solid #e2eaf5",
                                                                    borderRadius: 2.5,
                                                                    p: 1.5,
                                                                    bgcolor: "#fbfdff",
                                                                }}
                                                            >
                                                                <DateCalendar
                                                                    value={selectedDate}
                                                                    onChange={(value) => {
                                                                        if (value) {
                                                                            setSelectedDate(
                                                                                value.startOf(
                                                                                    "day",
                                                                                ),
                                                                            );
                                                                            setSelectedSlotId(null);
                                                                        }
                                                                    }}
                                                                    onMonthChange={(month) =>
                                                                        setVisibleMonth(
                                                                            month.startOf("month"),
                                                                        )
                                                                    }
                                                                    disablePast
                                                                    slots={{
                                                                        day: BookingCalendarDay,
                                                                    }}
                                                                    slotProps={{
                                                                        day: {
                                                                            availableDays,
                                                                        } as BookingCalendarDayProps,
                                                                    }}
                                                                />
                                                            </Paper>
                                                        )}
                                                </Stack>
                                            </Grid>

                                            {selectedClinicId !== null &&
                                                selectedAppointmentTypeId !== null && (
                                                    <Grid size={{ xs: 12, lg: 8 }}>
                                                        <Stack spacing={1.5}>
                                                            <Box>
                                                                <Typography
                                                                    sx={{
                                                                        fontWeight: 700,
                                                                        color: "#4f627a",
                                                                    }}
                                                                >
                                                                    {selectedAppointmentType
                                                                        ? `${selectedAppointmentType.name} • ${selectedAppointmentType.durationMinutes} min`
                                                                        : "Wybierz typ wizyty"}
                                                                </Typography>
                                                                <Typography
                                                                    sx={{
                                                                        color: "#11223a",
                                                                        fontWeight: 700,
                                                                        fontSize: 20,
                                                                    }}
                                                                >
                                                                    {selectedDate.format(
                                                                        "DD.MM.YYYY",
                                                                    )}
                                                                </Typography>
                                                            </Box>

                                                            {selectedClinicId === null ? (
                                                                <Alert severity="info">
                                                                    Wybierz przychodnię, aby
                                                                    zobaczyć dostępne terminy.
                                                                </Alert>
                                                            ) : availabilityQuery.isLoading ? (
                                                                <Typography
                                                                    sx={{ color: "#4f627a" }}
                                                                >
                                                                    Ładowanie dostępnych terminów...
                                                                </Typography>
                                                            ) : null}

                                                            {selectedClinicId !== null &&
                                                            !availabilityQuery.isLoading &&
                                                            availabilityQuery.data ? (
                                                                <>
                                                                    <Stack
                                                                        direction="row"
                                                                        spacing={1}
                                                                        useFlexGap
                                                                        sx={{ flexWrap: "wrap" }}
                                                                    >
                                                                        <Chip
                                                                            label="Wolny"
                                                                            sx={{
                                                                                bgcolor: "#e8f7ee",
                                                                                color: "#1f9b45",
                                                                            }}
                                                                        />
                                                                        <Chip
                                                                            label="Zajęty"
                                                                            sx={{
                                                                                bgcolor: "#edf2f7",
                                                                                color: "#73859c",
                                                                            }}
                                                                        />
                                                                    </Stack>

                                                                    {availableSlots.length === 0 ? (
                                                                        <Alert severity="info">
                                                                            Brak wolnych terminów
                                                                            dla wybranej daty i typu
                                                                            wizyty.
                                                                        </Alert>
                                                                    ) : (
                                                                        <Grid container spacing={1}>
                                                                            {availabilityQuery.data.slots.map(
                                                                                (slot) => (
                                                                                    <Grid
                                                                                        key={
                                                                                            slot.startAt
                                                                                        }
                                                                                        size={{
                                                                                            xs: 6,
                                                                                            sm: 4,
                                                                                            md: 3,
                                                                                        }}
                                                                                    >
                                                                                        <Button
                                                                                            fullWidth
                                                                                            disabled={
                                                                                                slot.isBooked
                                                                                            }
                                                                                            variant={
                                                                                                selectedSlotId ===
                                                                                                slot.startAt
                                                                                                    ? "contained"
                                                                                                    : "outlined"
                                                                                            }
                                                                                            onClick={() => {
                                                                                                if (
                                                                                                    !slot.isBooked
                                                                                                ) {
                                                                                                    setSelectedSlotId(
                                                                                                        slot.startAt,
                                                                                                    );
                                                                                                    setBookingMessage(
                                                                                                        null,
                                                                                                    );
                                                                                                }
                                                                                            }}
                                                                                            sx={{
                                                                                                textTransform:
                                                                                                    "none",
                                                                                                minHeight: 46,
                                                                                                justifyContent:
                                                                                                    "center",
                                                                                                borderColor:
                                                                                                    slot.isBooked
                                                                                                        ? "#d7e0eb"
                                                                                                        : undefined,
                                                                                                color: slot.isBooked
                                                                                                    ? "#9aa8ba"
                                                                                                    : undefined,
                                                                                                bgcolor:
                                                                                                    slot.isBooked
                                                                                                        ? "#f5f7fb"
                                                                                                        : undefined,
                                                                                            }}
                                                                                        >
                                                                                            {dayjs(
                                                                                                slot.startAt,
                                                                                            ).format(
                                                                                                "HH:mm",
                                                                                            )}
                                                                                        </Button>
                                                                                    </Grid>
                                                                                ),
                                                                            )}
                                                                        </Grid>
                                                                    )}
                                                                </>
                                                            ) : null}

                                                            {bookingMessage ? (
                                                                <Alert severity="success">
                                                                    {bookingMessage}
                                                                </Alert>
                                                            ) : null}
                                                            {bookMutation.isError ? (
                                                                <Alert severity="error">
                                                                    Nie udało się zarezerwować
                                                                    wizyty.
                                                                </Alert>
                                                            ) : null}

                                                            <Button
                                                                variant="contained"
                                                                disabled={
                                                                    selectedSlotId === null ||
                                                                    selectedAppointmentTypeId ===
                                                                        null ||
                                                                    selectedClinicId === null ||
                                                                    bookMutation.isPending
                                                                }
                                                                onClick={() =>
                                                                    bookMutation.mutate()
                                                                }
                                                                sx={{
                                                                    textTransform: "none",
                                                                    fontWeight: 700,
                                                                    alignSelf: "flex-start",
                                                                }}
                                                            >
                                                                {bookMutation.isPending
                                                                    ? "Rezerwowanie..."
                                                                    : "Zarezerwuj wizytę"}
                                                            </Button>
                                                        </Stack>
                                                    </Grid>
                                                )}
                                        </Grid>
                                    )}
                                </Stack>
                            </Paper>
                        </Stack>
                    </Grid>
                </Grid>
            </Box>
        </LocalizationProvider>
    );
};

type ChipRatingProps = {
    value: number | null;
};

const ChipRating = ({ value }: ChipRatingProps) => {
    return (
        <Paper
            elevation={2}
            sx={{
                position: "absolute",
                right: 14,
                bottom: -18,
                borderRadius: 99,
                px: 1.3,
                py: 0.45,
                display: "flex",
                alignItems: "center",
                gap: 0.5,
            }}
        >
            <Typography sx={{ color: "#ffb800", fontSize: 16, lineHeight: 1 }}>★</Typography>
            <Typography sx={{ fontWeight: 800 }}>{value?.toFixed(1) ?? "-"}</Typography>
        </Paper>
    );
};

type RoundIconInfoProps = {
    icon: string;
    text: string;
};

type BookingCalendarDayProps = PickerDayProps & {
    availableDays: Set<string>;
};

const BookingCalendarDay = ({
    availableDays,
    day,
    outsideCurrentMonth,
    ...other
}: BookingCalendarDayProps) => {
    const isAvailable = !outsideCurrentMonth && availableDays.has(day.format("YYYY-MM-DD"));

    return (
        <Badge overlap="circular" variant="dot" color="success" invisible={!isAvailable}>
            <PickerDay {...other} day={day} outsideCurrentMonth={outsideCurrentMonth} />
        </Badge>
    );
};

const RoundIconInfo = ({ icon, text }: RoundIconInfoProps) => {
    return (
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Avatar sx={{ width: 34, height: 34, bgcolor: "#eef6ff", color: "#0b74c9" }}>
                {icon}
            </Avatar>
            <Typography sx={{ color: "#5a6e86", fontSize: 13 }}>{text}</Typography>
        </Box>
    );
};

export default DoctorDetailsPage;
