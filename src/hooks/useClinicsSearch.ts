import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import useClinicSearchFilters from "./useClinicSearchFilters";
import { clinicsApi, type ClinicListItemDto } from "../api/clinics";
import { doctorsApi } from "../api/doctors";

export const useClinicsSearch = (mine: boolean) => {
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
    const title = mine ? "Moje przychodnie" : "Poradnie";
    const subtitle = mine
        ? "Lista przychodni przypisanych do Twojego profilu lekarza."
        : "Szukaj przychodni po nazwie, lokalizacji i specjalizacji.";

    const filtersSummary = useMemo(() => {
        return mine
            ? `Znaleziono ${clinics.length} poradni.`
            : `Znaleziono ${clinicsPage?.totalCount ?? 0} poradni.`;
    }, [clinics.length, clinicsPage?.totalCount, mine]);

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
