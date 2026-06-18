import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import useClinicSearchFilters from "./useClinicSearchFilters";
import { clinicsApi, type ClinicListItemDto } from "../api/clinics";
import { doctorsApi } from "../api/doctors";

export const useClinicsSearch = (mine: boolean) => {
    const { t } = useTranslation();
    const { filters, updateFilter, clearFilters } = useClinicSearchFilters();
    const selectedSpecializationId = filters.specializationId
        ? Number(filters.specializationId)
        : undefined;
    const selectedPage = Math.max(Number(filters.page || "1"), 1);

    const { data: specializations = [] } = useQuery({
        queryKey: ["clinic-search-specializations"],
        queryFn: () => doctorsApi.getSpecializations(),
        enabled: !mine,
    });

    const { data: mineClinics = [], isLoading: isMineLoading } = useQuery({
        queryKey: ["clinic-mine", mine],
        queryFn: () => clinicsApi.mine(),
        enabled: mine,
    });

    const { data: clinicsPage, isLoading: isSearchLoading } = useQuery({
        queryKey: [
            "clinic-search",
            filters.name,
            filters.location,
            selectedSpecializationId,
            filters.sort,
            selectedPage,
        ],
        queryFn: () =>
            clinicsApi.list({
                name: filters.name || undefined,
                location: filters.location || undefined,
                specializationId: selectedSpecializationId,
                sort: filters.sort,
                page: selectedPage,
                pageSize: 6,
            }),
        enabled: !mine,
    });

    const clinics = (mine ? mineClinics : (clinicsPage?.items ?? [])) as ClinicListItemDto[];
    const isLoading = mine ? isMineLoading : isSearchLoading;
    const title = mine ? t("clinics.myClinics") : t("clinics.allClinics");
    const subtitle = mine ? t("clinics.myClinicsDesc") : t("clinics.allClinicsDesc");

    const filtersSummary = useMemo(() => {
        const count = mine ? clinics.length : (clinicsPage?.totalCount ?? 0);
        if (count === 1) return t("clinics.foundCount_one", { count });
        if (count % 10 >= 2 && count % 10 <= 4 && !(count % 100 >= 12 && count % 100 <= 14))
            return t("clinics.foundCount_few", { count });
        return t("clinics.foundCount_many", { count });
    }, [clinics.length, clinicsPage?.totalCount, mine, t]);

    return {
        specializations,
        clinics,
        isLoading,
        title,
        subtitle,
        filtersSummary,
        filters,
        updateFilter,
        clearFilters,
        clinicsPage,
        selectedPage,
    };
};
