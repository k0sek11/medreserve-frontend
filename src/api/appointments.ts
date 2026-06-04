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
};
export const appointmentsApi = {
    // 1. Rezerwacja nowej wizyty
    book: async (data: BookAppointmentRequest): Promise<BookAppointmentResultDto> => {
        try {
            const response = await api.post("/api/appointments", data);
            return response.data;
        } catch (error: any) {
            const message =
                error?.response?.data?.message ||
                error?.response?.data?.title ||
                "Nie udało się zarezerwować wizyty.";

            throw new Error(message);
        }
    },

    // 2. PRZYWRÓCONA METODA: Pobieranie wizyt zalogowanego pacjenta
    mine: async (): Promise<AppointmentSummaryDto[]> => {
        try {
            const response = await api.get("/api/appointments/mine");
            return response.data;
        } catch (error: any) {
            const message =
                error?.response?.data?.message ||
                error?.response?.data?.title ||
                "Nie udało się pobrać listy Twoich wizyt.";

            throw new Error(message);
        }
    },

    // 3. Sprawdzanie statusu płatności w bramce PayU Sandbox
    checkPaymentStatus: async (appointmentId: number): Promise<{ isPaid: boolean }> => {
        try {
            const response = await api.post(`/api/payments/check-status/${appointmentId}`);
            return response.data;
        } catch (error: any) {
            const message =
                error?.response?.data?.message ||
                error?.response?.data?.title ||
                "Nie udało się zweryfikować statusu płatności w systemie PayU.";

            throw new Error(message);
        }
    },
    getById: async (id: number): Promise<AppointmentDetailDto> => {
    const response = await api.get(`/api/Appointments/${id}`); // upewnij się, że URL pasuje do Twojego backendu
    return response.data;
  },
};