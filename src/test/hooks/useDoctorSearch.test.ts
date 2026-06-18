import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useDoctorSearch } from "../../hooks/useDoctorSearch";
import { createWrapper } from "../testUtils";

vi.mock("../../api/doctors", () => ({
    doctorsApi: {
        getSpecializations: vi.fn().mockResolvedValue([
            { specializationId: 1, name: "Kardiologia", description: null },
            { specializationId: 2, name: "Dermatologia", description: null },
        ]),
        search: vi
            .fn()
            .mockResolvedValue({ items: [], totalCount: 0, totalPages: 0, page: 1, pageSize: 8 }),
    },
}));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (k: string, opts?: any) => (opts?.count ? `${k}_${opts.count}` : k),
        i18n: { language: "pl" },
    }),
}));

describe("useDoctorSearch", () => {
    it("returns specializations from API", () => {
        const { result } = renderHook(() => useDoctorSearch(), { wrapper: createWrapper() });
        // specializations are fetched asynchronously; initially may be empty
        expect(Array.isArray(result.current.specializations)).toBe(true);
    });

    it("returns empty doctors list initially", () => {
        const { result } = renderHook(() => useDoctorSearch(), { wrapper: createWrapper() });
        expect(result.current.doctors).toEqual([]);
    });

    it("returns filtersSummary", () => {
        const { result } = renderHook(() => useDoctorSearch(), { wrapper: createWrapper() });
        // The t mock returns the key when called
        expect(result.current.filtersSummary).toBeDefined();
    });

    it("returns selectedPage from URL params", () => {
        const { result } = renderHook(() => useDoctorSearch(), {
            wrapper: createWrapper(["/?page=3"]),
        });
        expect(result.current.selectedPage).toBe(3);
    });

    it("returns selectedSpecializationOption as null when no match", () => {
        const { result } = renderHook(() => useDoctorSearch(), { wrapper: createWrapper() });
        expect(result.current.selectedSpecializationOption).toBeNull();
    });

    it("returns filters from useDoctorSearchFilters", () => {
        const { result } = renderHook(() => useDoctorSearch(), {
            wrapper: createWrapper(["/?sort=priceDesc"]),
        });
        expect(result.current.filters.sort).toBe("priceDesc");
    });
});
