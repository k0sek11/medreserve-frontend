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
};
