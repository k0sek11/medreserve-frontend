import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useClinicSearchFilters from "../../hooks/useClinicSearchFilters";
import { createWrapper } from "../testUtils";

describe("useClinicSearchFilters", () => {
    it("returns default filters when no search params are set", () => {
        const { result } = renderHook(() => useClinicSearchFilters(), {
            wrapper: createWrapper(),
        });

        expect(result.current.filters).toEqual({
            name: "",
            location: "",
            specializationId: "",
            sort: "nameAsc",
            page: "1",
        });
    });

    it("reads filters from URL search params", () => {
        const { result } = renderHook(() => useClinicSearchFilters(), {
            wrapper: createWrapper([
                "/?name=Klinika&location=Wroclaw&specializationId=2&sort=nameDesc&page=4",
            ]),
        });

        expect(result.current.filters).toEqual({
            name: "Klinika",
            location: "Wroclaw",
            specializationId: "2",
            sort: "nameDesc",
            page: "4",
        });
    });

    it("updateFilter sets a filter and resets page", () => {
        const { result } = renderHook(() => useClinicSearchFilters(), {
            wrapper: createWrapper(["/?page=10"]),
        });

        act(() => {
            result.current.updateFilter("name", "Nowa Klinika");
        });

        expect(result.current.filters.name).toBe("Nowa Klinika");
        expect(result.current.filters.page).toBe("1");
    });

    it("clearFilters resets all filters", () => {
        const { result } = renderHook(() => useClinicSearchFilters(), {
            wrapper: createWrapper([
                "/?name=Test&location=Test&specializationId=1&sort=nameDesc&page=5",
            ]),
        });

        act(() => {
            result.current.clearFilters();
        });

        expect(result.current.filters).toEqual({
            name: "",
            location: "",
            specializationId: "",
            sort: "nameAsc",
            page: "1",
        });
    });
});
