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
};

export type AppointmentSummaryDto = {
  appointmentId: number;
  doctorId: number;
  doctorName: string;
  doctorSpecialization: string;
  appointmentType: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
};

export type AppointmentDetailDto = AppointmentSummaryDto & {
  createdAt: string;
};

export const appointmentsApi = {
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

  mine: async (): Promise<AppointmentSummaryDto[]> => {
    const response = await api.get("/api/appointments/mine");
    return response.data;
  },

  getById: async (appointmentId: number): Promise<AppointmentDetailDto> => {
    const response = await api.get(`/api/appointments/${appointmentId}`);
    return response.data;
  },
};
