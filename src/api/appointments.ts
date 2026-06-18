import { api } from "../lib/axios";
import i18n from "../i18n";
import type {
    BookAppointmentRequest,
    BookAppointmentResultDto,
    AppointmentSummaryDto,
    AppointmentDetailDto,
} from "../types/appointment";

export type {
    BookAppointmentRequest,
    BookAppointmentResultDto,
    AppointmentSummaryDto,
    AppointmentDetailDto,
};

function extractErrorMessage(error: unknown, fallbackKey: string): string {
    if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { data?: { message?: string; title?: string } } };
        return (
            axiosError.response?.data?.message ||
            axiosError.response?.data?.title ||
            i18n.t(fallbackKey)
        );
    }
    return i18n.t(fallbackKey);
}

export const appointmentsApi = {
        book: async (data: BookAppointmentRequest): Promise<BookAppointmentResultDto> => {
        try {
            const response = await api.post("/api/appointments", data);
            return response.data;
        } catch (error: unknown) {
            throw new Error(extractErrorMessage(error, "errors.bookFailed"));
        }
    },

        confirm: async (appointmentId: number, isOnline: boolean): Promise<{ message: string }> => {
        try {
            const response = await api.post(`/api/appointments/${appointmentId}/confirm`, {
                isOnline,
            });
            return response.data;
        } catch (error: unknown) {
            throw new Error(extractErrorMessage(error, "errors.confirmFailed"));
        }
    },

        cancel: async (appointmentId: number): Promise<{ message: string }> => {
        try {
            const response = await api.post(`/api/appointments/${appointmentId}/cancel`);
            return response.data;
        } catch (error: unknown) {
            throw new Error(extractErrorMessage(error, "errors.cancelFailed"));
        }
    },

        complete: async (appointmentId: number, comment?: string): Promise<{ message: string }> => {
        try {
            const response = await api.post(`/api/appointments/${appointmentId}/complete`, {
                comment,
            });
            return response.data;
        } catch (error: unknown) {
            throw new Error(extractErrorMessage(error, "errors.completeFailed"));
        }
    },

        mine: async (): Promise<AppointmentSummaryDto[]> => {
        try {
            const response = await api.get("/api/appointments/mine");
            return response.data;
        } catch (error: unknown) {
            throw new Error(extractErrorMessage(error, "errors.fetchAppointmentsFailed"));
        }
    },

        checkPaymentStatus: async (appointmentId: number): Promise<{ isPaid: boolean }> => {
        try {
            const response = await api.post(`/api/payments/check-status/${appointmentId}`);
            return response.data;
        } catch (error: unknown) {
            throw new Error(extractErrorMessage(error, "errors.payuStatusFailed"));
        }
    },

        getById: async (id: number): Promise<AppointmentDetailDto> => {
        const response = await api.get(`/api/appointments/${id}`);
        return response.data;
    },
};
