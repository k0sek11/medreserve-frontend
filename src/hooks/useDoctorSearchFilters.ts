import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

export type DoctorSearchFilters = {
  specializationId: string;
  cityId: string;
  date: string;
  priceMax: string;
  sort: string;
  page: string;
};

const DEFAULT_SORT = "priceAsc";
const DEFAULT_PAGE = "1";

const useDoctorSearchFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo<DoctorSearchFilters>(
    () => ({
      specializationId: searchParams.get("specializationId") ?? "",
      cityId: searchParams.get("cityId") ?? "",
      date: searchParams.get("date") ?? "",
      priceMax: searchParams.get("priceMax") ?? "",
      sort: searchParams.get("sort") ?? DEFAULT_SORT,
      page: searchParams.get("page") ?? DEFAULT_PAGE,
    }),
    [searchParams],
  );

  const updateFilter = (key: keyof DoctorSearchFilters, value: string) => {
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

  return {
    filters,
    updateFilter,
    clearFilters,
  };
};

export default useDoctorSearchFilters;
