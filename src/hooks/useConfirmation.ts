import { useMemo } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { appointmentsApi } from "../api/appointments";
import type { BookAppointmentResultDto } from "../types/appointment";

export const useConfirmation = () => {
    const { appointmentId } = useParams();
    const location = useLocation();
    const state = location.state as BookAppointmentResultDto | null;
    const parsedAppointmentId = Number(appointmentId);
    const hasValidId = Number.isFinite(parsedAppointmentId) && parsedAppointmentId > 0;

    const { data, isLoading } = useQuery({
        queryKey: ["appointment-confirmation", parsedAppointmentId],
        queryFn: () => appointmentsApi.getById(parsedAppointmentId),
        enabled: hasValidId && !state,
    });

    const appointment = data ?? state;

    const title = useMemo(() => {
        if (appointment?.status === "Confirmed") return "Wizyta potwierdzona!";
        return "Wizyta została zarezerwowana!";
    }, [appointment?.status]);

    return { hasValidId, isLoading, appointment, title };
};
