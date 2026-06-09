import { api } from "../lib/axios";

export type ClinicListItemDto = {
    clinicId: number;
    name: string;
    streetAddress: string;
    city: string;
    doctorCount: number;
    specializations: string[];
    isActive: boolean;
    isOwner: boolean;
};

export type ClinicDoctorSummaryDto = {
    doctorId: number;
    fullName: string;
    primarySpecialization: string;
    isOwner: boolean;
};

export type ClinicDetailDto = {
    clinicId: number;
    name: string;
    description: string | null;
    streetAddress: string;
    openingHours: string | null;
    mapLocation: string | null;
    phoneNumber: string | null;
    email: string | null;
    cityId: number;
    city: string;
    district: string;
    voivodeship: string;
    isActive: boolean;
    doctorCount: number;
    specializations: string[];
    doctors: ClinicDoctorSummaryDto[];
    isCurrentUserMember: boolean;
    isCurrentUserOwner: boolean;
};

export type PagedResultDto<T> = {
    items: T[];
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
};

export type ClinicListParams = {
    name?: string;
    location?: string;
    cityId?: number;
    specializationId?: number;
    sort?: string;
    page?: number;
    pageSize?: number;
    view?: "cities" | "specializations";
};

export type CreateClinicJoinRequestDto = {
    confirmDoctor: boolean;
    message?: string;
};

export type CreateClinicRequest = {
    name: string;
    description?: string | null;
    streetAddress: string;
    openingHours?: string | null;
    mapLocation?: string | null;
    cityId: number;
    phoneNumber?: string | null;
    email?: string | null;
};

export type ClinicUpdateRequest = {
    name?: string;
    description?: string | null;
    streetAddress?: string;
    openingHours?: string | null;
    mapLocation?: string | null;
    cityId?: number;
    phoneNumber?: string | null;
    email?: string | null;
    isActive?: boolean;
};

export type CityDto = {
    cityId: number;
    name: string;
    district: string;
    voivodeship: string;
};

export type SpecializationDto = {
    specializationId: number;
    name: string;
    description: string | null;
};

export const clinicsApi = {
    // ─────────── Consolidated GET /api/clinics ───────────

    list: async (params: ClinicListParams = {}) => {
        const response = await api.get("/api/clinics", { params });
        return response.data;
    },

    // ─────────── GET /api/clinics/{id} (merged details) ───

    getById: async (clinicId: number): Promise<ClinicDetailDto> => {
        const response = await api.get(`/api/clinics/${clinicId}`);
        return response.data;
    },

    // ─────────── GET /api/clinics/mine ───────────

    mine: async (): Promise<ClinicListItemDto[]> => {
        const response = await api.get("/api/clinics/mine");
        return response.data;
    },

    // ─────────── CRUD ───────────

    create: async (data: CreateClinicRequest) => {
        const response = await api.post("/api/clinics", data);
        return response.data;
    },

    update: async (clinicId: number, data: ClinicUpdateRequest) => {
        const response = await api.put(`/api/clinics/${clinicId}`, data);
        return response.data;
    },

    // ─────────── Join request ───────────

    requestJoin: async (clinicId: number, data: CreateClinicJoinRequestDto) => {
        const response = await api.post(`/api/clinics/${clinicId}/join-request`, data);
        return response.data;
    },
};
