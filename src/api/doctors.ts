import { api } from "../lib/axios";
import type { SpecializationDto, PagedResultDto } from "../types/common";

export type { SpecializationDto, PagedResultDto };

export type DoctorAppointmentTypeDto = {
    appointmentTypeId: number;
    name: string;
    description: string | null;
    basePrice: number;
    durationMinutes: number;
};

export type CreateDoctorAppointmentTypeDto = {
    name: string;
    basePrice: number;
    durationMinutes: number;
};

export type DoctorClinicDto = {
    clinicId: number;
    name: string;
    city: string;
    streetAddress: string;
};

export type DoctorScheduleDto = {
    scheduleId: number;
    clinicId: number | null;
    clinicName: string | null;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    validFrom: string;
    validTo: string | null;
    isActive: boolean;
};

export type DoctorPublicProfileDto = {
    doctorId: number;
    fullName: string;
    licenseNumber: string;
    bio: string | null;
    phoneNumber: string | null;
    city: string | null;
    streetAddress: string | null;
    profileImageUrl: string | null;
    specializations: string[];
    appointmentTypes: DoctorAppointmentTypeDto[];
    clinics: DoctorClinicDto[];
};

export type DoctorProfileDto = DoctorPublicProfileDto & {
    schedules: DoctorScheduleDto[];
};

export type DoctorAvailabilitySlotDto = {
    startAt: string;
    endAt: string;
    isBooked: boolean;
};

export type DoctorAvailabilityDto = {
    doctorId: number;
    date: string;
    appointmentTypeId: number;
    clinicId: number | null;
    appointmentTypeName: string;
    durationMinutes: number;
    slots: DoctorAvailabilitySlotDto[];
};

export type DoctorAvailabilityCalendarDto = {
    doctorId: number;
    year: number;
    month: number;
    appointmentTypeId: number;
    clinicId: number | null;
    availableDates: string[];
};

export type UpsertDoctorScheduleDto = {
    scheduleId?: number | null;
    clinicId: number;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    validFrom: string;
    validTo?: string | null;
    isActive: boolean;
};

export type UpdateDoctorProfileDto = {
    bio?: string | null;
    specializationIds?: number[];
};

export type DoctorSearchItemDto = {
    doctorId: number;
    fullName: string;
    city: string;
    specialization: string;
    lowestPrice: number;
};

export type DoctorSearchParams = {
    location?: string;
    specializationId?: number;
    date?: string;
    priceMax?: number;
    sort?: string;
    page?: number;
    pageSize?: number;
};

export const doctorsApi = {
    
    getSpecializations: async (location?: string): Promise<SpecializationDto[]> => {
        const response = await api.get("/api/clinics", {
            params: { view: "specializations", location },
        });
        return response.data;
    },

    
    search: async (params: DoctorSearchParams): Promise<PagedResultDto<DoctorSearchItemDto>> => {
        const response = await api.get("/api/doctors/search", { params });
        return response.data;
    },

    getPublicProfile: async (doctorId: number): Promise<DoctorPublicProfileDto> => {
        const response = await api.get(`/api/doctors/${doctorId}/profile`);
        return response.data;
    },

    getMyProfile: async (): Promise<DoctorProfileDto> => {
        const response = await api.get("/api/doctors/me/profile");
        return response.data;
    },

    updateMyProfile: async (data: UpdateDoctorProfileDto) => {
        const response = await api.put("/api/doctors/me/profile", data);
        return response.data;
    },

    createMyAppointmentType: async (
        data: CreateDoctorAppointmentTypeDto,
    ): Promise<DoctorAppointmentTypeDto> => {
        const response = await api.post("/api/doctors/me/appointment-types", data);
        return response.data;
    },

    deleteMyAppointmentType: async (appointmentTypeId: number) => {
        const response = await api.delete(`/api/doctors/me/appointment-types/${appointmentTypeId}`);
        return response.data;
    },

    getMySchedules: async (): Promise<DoctorScheduleDto[]> => {
        const response = await api.get("/api/doctors/me/schedules");
        return response.data;
    },

    upsertMySchedule: async (data: UpsertDoctorScheduleDto): Promise<DoctorScheduleDto> => {
        const response = await api.post("/api/doctors/me/schedules", data);
        return response.data;
    },

    updateMySchedule: async (
        scheduleId: number,
        data: UpsertDoctorScheduleDto,
    ): Promise<DoctorScheduleDto> => {
        const response = await api.put(`/api/doctors/me/schedules/${scheduleId}`, data);
        return response.data;
    },

    deleteMySchedule: async (scheduleId: number) => {
        const response = await api.delete(`/api/doctors/me/schedules/${scheduleId}`);
        return response.data;
    },

    getAvailability: async (
        doctorId: number,
        params: { date: string; appointmentTypeId: number; clinicId: number },
    ): Promise<DoctorAvailabilityDto> => {
        const response = await api.get(`/api/doctors/${doctorId}/availability`, { params });
        return response.data;
    },

    getAvailabilityCalendar: async (
        doctorId: number,
        params: { year: number; month: number; appointmentTypeId: number; clinicId: number },
    ): Promise<DoctorAvailabilityCalendarDto> => {
        const response = await api.get(`/api/doctors/${doctorId}/availability/calendar`, {
            params,
        });
        return response.data;
    },

    uploadProfilePhoto: async (file: File): Promise<{ profileImageUrl: string }> => {
        const formData = new FormData();
        formData.append("file", file);
        const response = await api.post("/api/images/profiles", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },
};
