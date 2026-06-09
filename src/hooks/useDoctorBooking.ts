import { useMemo, useState } from "react";
import dayjs, { type Dayjs } from "dayjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { doctorsApi } from "../api/doctors";
import { appointmentsApi } from "../api/appointments";
import { useAuth } from "../context/AuthContext";

export const useDoctorBooking = () => {
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

    const availabilityQuery = useQuery({
        queryKey: [
            "doctor-availability",
            parsedDoctorId,
            selectedDate.format("YYYY-MM-DD"),
            selectedAppointmentTypeId,
            selectedClinicId,
        ],
        queryFn: () =>
            doctorsApi.getAvailability(parsedDoctorId, {
                date: selectedDate.format("YYYY-MM-DD"),
                appointmentTypeId: selectedAppointmentTypeId as number,
                clinicId: selectedClinicId as number,
            }),
        enabled: isValidDoctorId && selectedAppointmentTypeId !== null && selectedClinicId !== null,
    });

    const monthAvailabilityQuery = useQuery({
        queryKey: [
            "doctor-availability-calendar",
            parsedDoctorId,
            visibleMonth.format("YYYY-MM"),
            selectedAppointmentTypeId,
            selectedClinicId,
        ],
        queryFn: () =>
            doctorsApi.getAvailabilityCalendar(parsedDoctorId, {
                year: visibleMonth.year(),
                month: visibleMonth.month() + 1,
                appointmentTypeId: selectedAppointmentTypeId as number,
                clinicId: selectedClinicId as number,
            }),
        enabled: isValidDoctorId && selectedAppointmentTypeId !== null && selectedClinicId !== null,
    });

    const bookMutation = useMutation({
        mutationFn: () => {
            const slot = availabilityQuery.data?.slots.find((s) => s.startAt === selectedSlotId);
            if (!slot || selectedAppointmentTypeId === null)
                throw new Error("Wybierz wolny termin.");
            if (selectedClinicId === null) throw new Error("Wybierz przychodnię.");
            return appointmentsApi.book({
                doctorId: parsedDoctorId,
                clinicId: selectedClinicId,
                appointmentTypeId: selectedAppointmentTypeId,
                date: selectedDate.format("YYYY-MM-DD"),
                startTime: dayjs(slot.startAt).format("HH:mm"),
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
            await queryClient.invalidateQueries({ queryKey: ["my-appointments"] });
            navigate(`/wizyty/potwierdzenie/${result.appointmentId}`, {
                state: result,
                replace: true,
            } as any);
        },
        onError: (error) => {
            setBookingMessage(
                error instanceof Error ? error.message : "Nie udało się zarezerwować wizyty.",
            );
        },
    });

    const selectedAppointmentType = useMemo(() => {
        return profileQuery.data?.appointmentTypes.find(
            (item) => item.appointmentTypeId === selectedAppointmentTypeId,
        );
    }, [profileQuery.data, selectedAppointmentTypeId]);

    const availableSlots = useMemo(() => {
        return availabilityQuery.data?.slots.filter((slot) => !slot.isBooked) ?? [];
    }, [availabilityQuery.data]);

    const availableDays = useMemo(() => {
        return new Set(monthAvailabilityQuery.data?.availableDates ?? []);
    }, [monthAvailabilityQuery.data]);

    const resetSlot = () => {
        setSelectedSlotId(null);
        setBookingMessage(null);
    };

    return {
        parsedDoctorId,
        isValidDoctorId,
        isOwnProfile,
        profileQuery,
        selectedAppointmentTypeId,
        selectedDate,
        selectedClinicId,
        selectedSlotId,
        visibleMonth,
        bookingMessage,
        selectedAppointmentType,
        availableSlots,
        availableDays,
        availabilityQuery,
        bookMutation,
        setSelectedDate,
        setSelectedClinicId,
        setSelectedAppointmentTypeId,
        setSelectedSlotId,
        setVisibleMonth,
        resetSlot,
    };
};
