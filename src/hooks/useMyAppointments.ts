import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { appointmentsApi } from "../api/appointments";

export const useMyAppointments = () => {
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
    const [page, setPage] = useState(1);

    const {
        data: appointments = [],
        isLoading,
        refetch,
    } = useQuery({
        queryKey: ["my-appointments"],
        queryFn: () => appointmentsApi.mine(),
    });

    const handleOpenPayment = (appointmentId: number) => {
        setSelectedAppointmentId(appointmentId);
        setIsPaymentModalOpen(true);
    };

    const handleClosePayment = () => setIsPaymentModalOpen(false);

    const selectedAppointment =
        appointments.find((a) => a.appointmentId === selectedAppointmentId) ?? null;

    const itemsPerPage = 5;
    const totalPages = Math.ceil(appointments.length / itemsPerPage);
    const paginatedAppointments = appointments.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage,
    );

    return {
        isLoading,
        appointments,
        paginatedAppointments,
        totalPages,
        page,
        setPage,
        isPaymentModalOpen,
        handleOpenPayment,
        handleClosePayment,
        selectedAppointment,
        selectedAppointmentId,
        refetch,
    };
};
