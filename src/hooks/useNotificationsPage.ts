import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { notificationsApi } from "../api/notifications";
import { useAuthUser } from "./useAuthUser";

export const useNotificationsPage = () => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const queryClient = useQueryClient();
    const clinicIdParam = searchParams.get("clinicId");
    const clinicId = clinicIdParam ? Number(clinicIdParam) : undefined;
    const effectiveClinicId =
        clinicId !== undefined && Number.isFinite(clinicId) ? clinicId : undefined;
    const { data: user } = useAuthUser();

    const { data: clinicNotifications = [], isLoading: isClinicLoading } = useQuery({
        queryKey: ["clinic-join-requests", effectiveClinicId],
        queryFn: () => notificationsApi.getClinicJoinRequests(effectiveClinicId),
    });

    const { data: appointmentNotifications = [], isLoading: isAppointmentLoading } = useQuery({
        queryKey: ["appointment-notifications"],
        queryFn: () => notificationsApi.getAppointmentNotifications(),
        enabled: Boolean(user?.doctorProfileId),
    });

    const acceptClinicMutation = useMutation({
        mutationFn: (notificationId: number) =>
            notificationsApi.acceptClinicJoinRequest(notificationId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ["clinic-join-requests", effectiveClinicId],
            });
        },
    });

    const rejectClinicMutation = useMutation({
        mutationFn: (notificationId: number) =>
            notificationsApi.rejectClinicJoinRequest(notificationId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ["clinic-join-requests", effectiveClinicId],
            });
        },
    });

    const title = useMemo(() => {
        return effectiveClinicId ? t("notifications.forClinic") : t("notifications.title");
    }, [effectiveClinicId, t]);

    return {
        title,
        user,
        clinicNotifications,
        appointmentNotifications,
        isClinicLoading,
        isAppointmentLoading,
        acceptClinicMutation,
        rejectClinicMutation,
    };
};
