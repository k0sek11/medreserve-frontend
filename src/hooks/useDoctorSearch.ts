import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { doctorsApi } from "../api/doctors";
import useDoctorSearchFilters from "./useDoctorSearchFilters";

export const useDoctorSearch = () => {
    const { filters, updateFilter, clearFilters } = useDoctorSearchFilters();
    const selectedCityId = filters.cityId ? Number(filters.cityId) : undefined;
    const selectedSpecializationId = filters.specializationId
        ? Number(filters.specializationId)
        : undefined;
    const selectedPage = Math.max(Number(filters.page || "1"), 1);
    const maxPrice = filters.priceMax ? Number(filters.priceMax) : undefined;

    const { data: cities = [], isLoading: isCitiesLoading } = useQuery({
        queryKey: ["search-cities"],
        queryFn: () => doctorsApi.getCities(),
    });

    const { data: specializations = [], isLoading: isSpecializationsLoading } = useQuery({
        queryKey: ["search-specializations"],
        queryFn: () => doctorsApi.getSpecializations(),
    });

    const {
        data: doctorsPage,
        isLoading: isDoctorsLoading,
        isFetching: isDoctorsFetching,
    } = useQuery({
        queryKey: [
            "search-doctors",
            selectedCityId,
            selectedSpecializationId,
            filters.date,
            maxPrice,
            filters.sort,
            selectedPage,
        ],
        queryFn: () =>
            doctorsApi.search({
                cityId: selectedCityId,
                specializationId: selectedSpecializationId,
                date: filters.date || undefined,
                priceMax: maxPrice,
                sort: filters.sort,
                page: selectedPage,
                pageSize: 8,
            }),
        placeholderData: (prev) => prev,
    });

    const doctors = doctorsPage?.items ?? [];
    const isAnyLoading =
        isCitiesLoading || isDoctorsLoading || isDoctorsFetching || isSpecializationsLoading;

    const selectedCityOption = cities.find((c) => c.cityId === selectedCityId) ?? null;
    const selectedSpecializationOption =
        specializations.find((s) => s.specializationId === selectedSpecializationId) ?? null;

    const filtersSummary = useMemo(
        () => `Znaleziono ${doctorsPage?.totalCount ?? 0} lekarzy.`,
        [doctorsPage?.totalCount],
    );

    return {
        cities,
        specializations,
        doctors,
        doctorsPage,
        isAnyLoading,
        filtersSummary,
        selectedPage,
        filters,
        updateFilter,
        clearFilters,
        selectedCityOption,
        selectedSpecializationOption,
        isCitiesLoading,
        isSpecializationsLoading,
        isDoctorsLoading,
    };
};
