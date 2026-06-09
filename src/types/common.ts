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

export type PagedResultDto<T> = {
    items: T[];
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
};
