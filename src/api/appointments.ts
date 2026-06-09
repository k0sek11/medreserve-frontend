import { api } from "../lib/axios";

export type BookAppointmentRequest = {
    doctorId: number;
    appointmentTypeId: number;
    clinicId: number;
    date: string;
    startTime: string;
};

export type BookAppointmentResultDto = {
    appointmentId: number;
    doctorId: number;
    appointmentTypeId: number;
    date: string;
    startTime: string;
    endTime: string;
    status: string;
    doctorName?: string;
    doctorSpecialization?: string;
};

export type AppointmentSummaryDto = {
    appointmentId: number;
    doctorId: number;
    doctorName: string;
    doctorSpecialization: string;
    appointmentType: string | null;
    date: string;
    startTime: string;
    endTime: string;
    status: string;
    paymentId?: number | null;
    paymentStatus?: string | null;
    paymentMethod?: string | null;
    price: number;
};

export type AppointmentDetailDto = AppointmentSummaryDto & {
    createdAt: string;
    doctorNotes?: string | null;
};

function extractErrorMessage(error: unknown, fallback: string): string {
    if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { data?: { message?: string; title?: string } } };
        return axiosError.response?.data?.message || axiosError.response?.data?.title || fallback;
    }
    return fallback;
}

export const appointmentsApi = {
    // 1. Rezerwacja nowej wizyty
    book: async (data: BookAppointmentRequest): Promise<BookAppointmentResultDto> => {
        try {
            const response = await api.post("/api/appointments", data);
            return response.data;
        } catch (error: unknown) {
            throw new Error(extractErrorMessage(error, "Nie udało się zarezerwować wizyty."));
        }
    },

    // 2. Potwierdzenie wizyty przez lekarza (POST /api/appointments/{id}/confirm)
    confirm: async (appointmentId: number, isOnline: boolean): Promise<{ message: string }> => {
        try {
            const response = await api.post(`/api/appointments/${appointmentId}/confirm`, {
                isOnline,
            });
            return response.data;
        } catch (error: unknown) {
            throw new Error(extractErrorMessage(error, "Nie udało się potwierdzić wizyty."));
        }
    },

    // 3. Anulowanie wizyty (POST /api/appointments/{id}/cancel)
    cancel: async (appointmentId: number): Promise<{ message: string }> => {
        try {
            const response = await api.post(`/api/appointments/${appointmentId}/cancel`);
            return response.data;
        } catch (error: unknown) {
            throw new Error(extractErrorMessage(error, "Nie udało się anulować wizyty."));
        }
    },

    // 4. Oznaczanie wizyty jako Completed (POST /api/appointments/{id}/complete)
    complete: async (appointmentId: number, comment?: string): Promise<{ message: string }> => {
        try {
            const response = await api.post(`/api/appointments/${appointmentId}/complete`, {
                comment,
            });
            return response.data;
        } catch (error: unknown) {
            throw new Error(
                extractErrorMessage(error, "Nie udało się oznaczyć wizyty jako zakończona."),
            );
        }
    },

    // 5. Pobieranie wizyt zalogowanego użytkownika
    mine: async (): Promise<AppointmentSummaryDto[]> => {
        try {
            const response = await api.get("/api/appointments/mine");
            return response.data;
        } catch (error: unknown) {
            throw new Error(extractErrorMessage(error, "Nie udało się pobrać listy Twoich wizyt."));
        }
    },

    // 6. Sprawdzanie statusu płatności w bramce PayU Sandbox
    checkPaymentStatus: async (appointmentId: number): Promise<{ isPaid: boolean }> => {
        try {
            const response = await api.post(`/api/payments/check-status/${appointmentId}`);
            return response.data;
        } catch (error: unknown) {
            throw new Error(
                extractErrorMessage(
                    error,
                    "Nie udało się zweryfikować statusu płatności w systemie PayU.",
                ),
            );
        }
    },

    // 7. Pobieranie szczegółów wizyty
    getById: async (id: number): Promise<AppointmentDetailDto> => {
        const response = await api.get(`/api/appointments/${id}`);
        return response.data;
    },
};
