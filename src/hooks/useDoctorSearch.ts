import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { doctorsApi } from "../api/doctors";
import useDoctorSearchFilters from "./useDoctorSearchFilters";

export const useDoctorSearch = () => {
    const { t } = useTranslation();
    const { filters, updateFilter, clearFilters } = useDoctorSearchFilters();
    const location = filters.location || undefined;
    const selectedSpecializationId = filters.specializationId
        ? Number(filters.specializationId)
        : undefined;
    const selectedPage = Math.max(Number(filters.page || "1"), 1);
    const maxPrice = filters.priceMax ? Number(filters.priceMax) : undefined;

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
            location,
            selectedSpecializationId,
            filters.date,
            maxPrice,
            filters.sort,
            selectedPage,
        ],
        queryFn: () =>
            doctorsApi.search({
                location,
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
    const isAnyLoading = isDoctorsLoading || isDoctorsFetching || isSpecializationsLoading;

    const selectedSpecializationOption =
        specializations.find((s) => s.specializationId === selectedSpecializationId) ?? null;

    const filtersSummary = useMemo(
        () => t("doctors.foundCount_many", { count: doctorsPage?.totalCount ?? 0 }),
        [doctorsPage?.totalCount, t],
    );

    return {
        specializations,
        doctors,
        doctorsPage,
        isAnyLoading,
        filtersSummary,
        selectedPage,
        filters,
        updateFilter,
        clearFilters,
        selectedSpecializationOption,
        isSpecializationsLoading,
        isDoctorsLoading,
    };
};
