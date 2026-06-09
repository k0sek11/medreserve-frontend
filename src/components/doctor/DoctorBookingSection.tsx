import dayjs from "dayjs";
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    MenuItem,
    Paper,
    Select,
    Stack,
    Typography,
} from "@mui/material";
import { DateCalendar } from "@mui/x-date-pickers";
import { useTranslation } from "react-i18next";
import { BookingCalendarDay, type BookingCalendarDayProps } from "./BookingCalendarDay";
import { formatMoney } from "../../lib/formatMoney";
import { Show } from "../shared/ShowHide";
import type { useDoctorBooking } from "../../hooks/useDoctorBooking";

type Props = ReturnType<typeof useDoctorBooking>;

export const DoctorBookingSection = ({
    profileQuery,
    selectedClinicId,
    setSelectedClinicId,
    selectedAppointmentTypeId,
    setSelectedAppointmentTypeId,
    selectedDate,
    setSelectedDate,
    visibleMonth,
    setVisibleMonth,
    selectedSlotId,
    setSelectedSlotId,
    bookingMessage,
    selectedAppointmentType,
    availableSlots,
    availableDays,
    availabilityQuery,
    bookMutation,
    resetSlot,
}: Props) => {
    const { t } = useTranslation();
    const profile = profileQuery.data;

    if (!profile) return null;

    const noClinics = profile.clinics.length === 0;
    const noTypes = profile.appointmentTypes.length === 0;
    const bothSelected = selectedClinicId !== null && selectedAppointmentTypeId !== null;

    const handleSelectClinic = (value: number) => {
        setSelectedClinicId(value);
        resetSlot();
    };

    const handleSelectType = (value: number) => {
        setSelectedAppointmentTypeId(value);
        resetSlot();
    };

    const handleDateChange = (value: dayjs.Dayjs | null) => {
        if (value) {
            setSelectedDate(value.startOf("day"));
            setSelectedSlotId(null);
        }
    };

    const allSlots = [...(availabilityQuery.data?.slots ?? [])].sort((a, b) =>
        a.startAt.localeCompare(b.startAt),
    );

    return (
        <Stack spacing={2.5}>
            <Paper elevation={0} sx={{ border: "1px solid #dce5f2", borderRadius: 3, p: 2.5 }}>
                <Stack spacing={2.5}>
                    <Box>
                        <Typography sx={{ fontWeight: 800, color: "#11223a", fontSize: 22 }}>
                            {t("doctorDetails.bookVisit")}
                        </Typography>
                        <Typography sx={{ color: "#4f627a" }}>
                            {t("doctorDetails.bookingSubtitle")}
                        </Typography>
                    </Box>

                    <Show when={noClinics}>
                        <Alert severity="info">{t("doctorDetails.noClinics")}</Alert>
                    </Show>
                    <Show when={!noClinics && noTypes}>
                        <Alert severity="info">{t("doctorDetails.noAppointmentTypes")}</Alert>
                    </Show>

                    <Show when={!noClinics && !noTypes}>
                        <Stack spacing={2.5}>
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                                <Select
                                    value={selectedClinicId ?? ""}
                                    onChange={(e) => handleSelectClinic(Number(e.target.value))}
                                    displayEmpty
                                    sx={{ minWidth: 240, flex: 1 }}
                                >
                                    <MenuItem value="" disabled>
                                        {t("doctorDetails.selectClinic")}
                                    </MenuItem>
                                    {profile.clinics.map((c) => (
                                        <MenuItem key={c.clinicId} value={c.clinicId}>
                                            {c.name} • {c.city}
                                        </MenuItem>
                                    ))}
                                </Select>

                                <Select
                                    value={selectedAppointmentTypeId ?? ""}
                                    onChange={(e) => handleSelectType(Number(e.target.value))}
                                    displayEmpty
                                    sx={{ minWidth: 260, flex: 1 }}
                                >
                                    <MenuItem value="" disabled>
                                        {t("doctorDetails.selectAppointmentType")}
                                    </MenuItem>
                                    {profile.appointmentTypes.map((t) => (
                                        <MenuItem
                                            key={t.appointmentTypeId}
                                            value={t.appointmentTypeId}
                                        >
                                            {t.name} • {formatMoney(t.basePrice)} •{" "}
                                            {t.durationMinutes} min
                                        </MenuItem>
                                    ))}
                                </Select>
                            </Stack>

                            <Show when={bothSelected}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        border: "1px solid #e2eaf5",
                                        borderRadius: 2.5,
                                        px: 1,
                                        bgcolor: "#fbfdff",
                                    }}
                                >
                                    <DateCalendar
                                        value={selectedDate}
                                        onChange={handleDateChange}
                                        onMonthChange={(month) =>
                                            setVisibleMonth(month.startOf("month"))
                                        }
                                        disablePast
                                        slots={{ day: BookingCalendarDay }}
                                        slotProps={{
                                            day: { availableDays } as BookingCalendarDayProps,
                                        }}
                                    />
                                </Paper>

                                <Box>
                                    <Stack
                                        direction="row"
                                        spacing={2}
                                        sx={{ alignItems: "center", mb: 1.5 }}
                                    >
                                        <Typography
                                            sx={{ fontWeight: 700, color: "#11223a", fontSize: 20 }}
                                        >
                                            {selectedDate.format("DD.MM.YYYY")}
                                        </Typography>
                                        <Show when={Boolean(selectedAppointmentType)}>
                                            <Chip
                                                label={`${selectedAppointmentType?.name} • ${selectedAppointmentType?.durationMinutes} min`}
                                                size="small"
                                                sx={{ bgcolor: "#eef6ff", color: "#0b74c9" }}
                                            />
                                        </Show>
                                    </Stack>

                                    <Show when={availabilityQuery.isLoading}>
                                        <Stack
                                            direction="row"
                                            spacing={1}
                                            sx={{ alignItems: "center" }}
                                        >
                                            <CircularProgress size={18} />
                                            <Typography sx={{ color: "#4f627a", fontSize: 14 }}>
                                                {t("doctorDetails.loadingSlots")}
                                            </Typography>
                                        </Stack>
                                    </Show>

                                    <Show
                                        when={
                                            !availabilityQuery.isLoading &&
                                            Boolean(availabilityQuery.data)
                                        }
                                    >
                                        {availableSlots.length === 0 ? (
                                            <Alert severity="info" sx={{ mt: 1 }}>
                                                {t("doctorDetails.noSlots")}
                                            </Alert>
                                        ) : (
                                            <Stack spacing={1}>
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        flexWrap: "wrap",
                                                        gap: 1,
                                                        maxHeight: 200,
                                                        overflowY: "auto",
                                                        pb: 1,
                                                    }}
                                                >
                                                    {allSlots.map((slot) => (
                                                        <Chip
                                                            key={slot.startAt}
                                                            label={dayjs(slot.startAt).format(
                                                                "HH:mm",
                                                            )}
                                                            disabled={slot.isBooked}
                                                            variant={
                                                                selectedSlotId === slot.startAt
                                                                    ? "filled"
                                                                    : "outlined"
                                                            }
                                                            color={
                                                                selectedSlotId === slot.startAt
                                                                    ? "primary"
                                                                    : "default"
                                                            }
                                                            onClick={() => {
                                                                if (!slot.isBooked)
                                                                    setSelectedSlotId(slot.startAt);
                                                            }}
                                                            sx={{
                                                                minWidth: 72,
                                                                fontWeight:
                                                                    selectedSlotId === slot.startAt
                                                                        ? 700
                                                                        : 500,
                                                                fontSize: 15,
                                                                cursor: slot.isBooked
                                                                    ? "not-allowed"
                                                                    : "pointer",
                                                                borderRadius: 2,
                                                                opacity: slot.isBooked ? 0.5 : 1,
                                                            }}
                                                        />
                                                    ))}
                                                </Box>
                                            </Stack>
                                        )}
                                    </Show>
                                </Box>
                            </Show>

                            <Show when={selectedSlotId !== null}>
                                <Stack spacing={1.5} sx={{ pt: 1 }}>
                                    <Show when={Boolean(bookingMessage)}>
                                        <Alert severity="success">{bookingMessage}</Alert>
                                    </Show>
                                    <Show when={bookMutation.isError}>
                                        <Alert severity="error">
                                            {t("doctorDetails.bookingError")}
                                        </Alert>
                                    </Show>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        disabled={bookMutation.isPending}
                                        onClick={() => bookMutation.mutate()}
                                        sx={{
                                            textTransform: "none",
                                            fontWeight: 700,
                                            alignSelf: "flex-start",
                                            px: 4,
                                        }}
                                    >
                                        {bookMutation.isPending
                                            ? t("doctorDetails.reserving")
                                            : `${t("doctorDetails.reserveButton")} ${selectedDate.format("DD.MM")} ${t("doctorProfile.from")} ${selectedSlotId ? dayjs(selectedSlotId).format("HH:mm") : ""}`}
                                    </Button>
                                </Stack>
                            </Show>
                        </Stack>
                    </Show>
                </Stack>
            </Paper>
        </Stack>
    );
};
