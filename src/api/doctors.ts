import { api } from "../lib/axios";

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

export type DoctorSearchItemDto = {
  doctorId: number;
  fullName: string;
  city: string;
  specialization: string;
  lowestPrice: number;
  rating: number | null;
};

export type PagedResultDto<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export type DoctorSearchParams = {
  cityId?: number;
  specializationId?: number;
  date?: string;
  priceMax?: number;
  sort?: string;
  page?: number;
  pageSize?: number;
};

export const doctorsApi = {
  getCities: async (): Promise<CityDto[]> => {
    const response = await api.get("/api/clinics/cities");
    return response.data;
  },

  getCitiesBySpecialization: async (
    specializationId: number,
  ): Promise<CityDto[]> => {
    const response = await api.get(
      `/api/clinics/cities/by-specialization/${specializationId}`,
    );
    return response.data;
  },

  getSpecializationsByCity: async (
    cityId: number,
  ): Promise<SpecializationDto[]> => {
    const response = await api.get(`/api/clinics/cities/${cityId}/specializations`);
    return response.data;
  },

  getSpecializations: async (): Promise<SpecializationDto[]> => {
    const response = await api.get("/api/clinics/specializations");
    return response.data;
  },

  search: async (
    params: DoctorSearchParams,
  ): Promise<PagedResultDto<DoctorSearchItemDto>> => {
    const response = await api.get("/api/doctors/search", { params });
    return response.data;
  },
};
