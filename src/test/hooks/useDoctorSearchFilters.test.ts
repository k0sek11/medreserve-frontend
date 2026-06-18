import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useDoctorSearchFilters from "../../hooks/useDoctorSearchFilters";
import { createWrapper } from "../testUtils";

describe("useDoctorSearchFilters", () => {
    it("returns default filters when no search params are set", () => {
        const { result } = renderHook(() => useDoctorSearchFilters(), {
            wrapper: createWrapper(),
        });

        expect(result.current.filters).toEqual({
            specializationId: "",
            location: "",
            date: "",
            priceMax: "",
            sort: "priceAsc",
            page: "1",
        });
    });

    it("reads filters from URL search params", () => {
        const { result } = renderHook(() => useDoctorSearchFilters(), {
            wrapper: createWrapper([
                "/?specializationId=5&location=Warszawa&date=2026-07-01&sort=nameAsc&page=2",
            ]),
        });

        expect(result.current.filters).toEqual({
            specializationId: "5",
            location: "Warszawa",
            date: "2026-07-01",
            priceMax: "",
            sort: "nameAsc",
            page: "2",
        });
    });

    it("reads legacy search params (specialization, cityId, city)", () => {
        const { result } = renderHook(() => useDoctorSearchFilters(), {
            wrapper: createWrapper(["/?specialization=3&cityId=Krakow"]),
        });

        expect(result.current.filters.specializationId).toBe("3");
        expect(result.current.filters.location).toBe("Krakow");
    });

    it("updateFilter sets a single filter and resets page to 1", () => {
        const { result } = renderHook(() => useDoctorSearchFilters(), {
            wrapper: createWrapper(["/?page=5"]),
        });

        act(() => {
            result.current.updateFilter("specializationId", "10");
        });

        expect(result.current.filters.specializationId).toBe("10");
        expect(result.current.filters.page).toBe("1");
    });

    it("updateFilter with empty value removes the filter", () => {
        const { result } = renderHook(() => useDoctorSearchFilters(), {
            wrapper: createWrapper(["/?priceMax=200"]),
        });

        act(() => {
            result.current.updateFilter("priceMax", "");
        });

        expect(result.current.filters.priceMax).toBe("");
    });

    it("clearFilters resets all filters to defaults", () => {
        const { result } = renderHook(() => useDoctorSearchFilters(), {
            wrapper: createWrapper([
                "/?specializationId=5&location=Gdansk&date=2026-01-01&priceMax=100&sort=priceDesc&page=3",
            ]),
        });

        act(() => {
            result.current.clearFilters();
        });

        expect(result.current.filters).toEqual({
            specializationId: "",
            location: "",
            date: "",
            priceMax: "",
            sort: "priceAsc",
            page: "1",
        });
    });

    it("updateFilter for page keeps the page value", () => {
        const { result } = renderHook(() => useDoctorSearchFilters(), {
            wrapper: createWrapper(["/?page=1"]),
        });

        act(() => {
            result.current.updateFilter("page", "3");
        });

        expect(result.current.filters.page).toBe("3");
    });
});
