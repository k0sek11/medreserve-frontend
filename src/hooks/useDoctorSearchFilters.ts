import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

export type DoctorSearchFilters = {
  specialization: string;
  city: string;
  date: string;
  priceMax: string;
  sort: string;
};

const DEFAULT_SORT = "priceAsc";

const useDoctorSearchFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo<DoctorSearchFilters>(
    () => ({
      specialization: searchParams.get("specialization") ?? "",
      city: searchParams.get("city") ?? "",
      date: searchParams.get("date") ?? "",
      priceMax: searchParams.get("priceMax") ?? "",
      sort: searchParams.get("sort") ?? DEFAULT_SORT,
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

      if (!nextParams.get("sort")) {
        nextParams.set("sort", DEFAULT_SORT);
      }

      return nextParams;
    });
  };

  const clearFilters = () => {
    setSearchParams({ sort: DEFAULT_SORT });
  };

  return {
    filters,
    updateFilter,
    clearFilters,
  };
};

export default useDoctorSearchFilters;
