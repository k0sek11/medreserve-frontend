import { api } from "../lib/axios";

export type ClinicJoinRequestNotificationDto = {
    notificationId: number;
    clinicId: number;
    clinicName: string;
    requesterDoctorId: number;
    requesterName: string;
    message: string | null;
    status: string;
    createdAt: string;
};

export type AppointmentNotificationDto = {
    notificationId: number;
    appointmentId: number;
    doctorId: number;
    doctorName: string;
    patientName: string;
    appointmentType: string | null;
    date: string;
    startTime: string;
    endTime: string;
    status: string;
    notificationStatus: string;
    createdAt: string;
    message: string | null;
};

export const notificationsApi = {
    getClinicJoinRequests: async (
        clinicId?: number,
    ): Promise<ClinicJoinRequestNotificationDto[]> => {
        const response = await api.get("/api/notifications/clinic-join-requests", {
            params: clinicId ? { clinicId } : undefined,
        });
        return response.data;
    },
    acceptClinicJoinRequest: async (notificationId: number) => {
        const response = await api.post(
            `/api/notifications/clinic-join-requests/${notificationId}/accept`,
        );
        return response.data;
    },
    rejectClinicJoinRequest: async (notificationId: number) => {
        const response = await api.post(
            `/api/notifications/clinic-join-requests/${notificationId}/reject`,
        );
        return response.data;
    },
    getAppointmentNotifications: async (): Promise<AppointmentNotificationDto[]> => {
        const response = await api.get("/api/notifications/appointments");
        return response.data;
    },
    confirmAppointment: async (notificationId: number) => {
        const response = await api.post(`/api/notifications/appointments/${notificationId}/confirm`);
        return response.data;
    },
    cancelAppointment: async (notificationId: number) => {
        const response = await api.post(`/api/notifications/appointments/${notificationId}/cancel`);
        return response.data;
    },
};
