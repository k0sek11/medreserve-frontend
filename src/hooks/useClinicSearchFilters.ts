import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

export type ClinicSearchFilters = {
    name: string;
    location: string;
    specializationId: string;
    sort: string;
    page: string;
};

const DEFAULT_SORT = "nameAsc";
const DEFAULT_PAGE = "1";

const useClinicSearchFilters = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const filters = useMemo<ClinicSearchFilters>(
        () => ({
            name: searchParams.get("name") ?? "",
            location: searchParams.get("location") ?? "",
            specializationId: searchParams.get("specializationId") ?? "",
            sort: searchParams.get("sort") ?? DEFAULT_SORT,
            page: searchParams.get("page") ?? DEFAULT_PAGE,
        }),
        [searchParams],
    );

    const updateFilter = (key: keyof ClinicSearchFilters, value: string) => {
        setSearchParams((prevParams) => {
            const nextParams = new URLSearchParams(prevParams);

            if (value) {
                nextParams.set(key, value);
            } else {
                nextParams.delete(key);
            }

            if (key !== "page") {
                nextParams.set("page", DEFAULT_PAGE);
            }

            if (!nextParams.get("sort")) {
                nextParams.set("sort", DEFAULT_SORT);
            }

            return nextParams;
        });
    };

    const clearFilters = () => {
        setSearchParams({ sort: DEFAULT_SORT, page: DEFAULT_PAGE });
    };

    return { filters, updateFilter, clearFilters };
};

export default useClinicSearchFilters;
