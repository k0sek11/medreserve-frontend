import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useClinicsSearch } from "../../hooks/useClinicsSearch";
import { createWrapper } from "../testUtils";

vi.mock("../../api/clinics", () => ({
    clinicsApi: {
        list: vi
            .fn()
            .mockResolvedValue({ items: [], totalCount: 0, totalPages: 0, page: 1, pageSize: 6 }),
        mine: vi.fn().mockResolvedValue([]),
    },
}));

vi.mock("../../api/doctors", () => ({
    doctorsApi: {
        getSpecializations: vi.fn().mockResolvedValue([]),
    },
}));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({ t: (k: string) => k, i18n: { language: "pl" } }),
}));

describe("useClinicsSearch", () => {
    it("returns correct title when mine=false (all clinics)", () => {
        const { result } = renderHook(() => useClinicsSearch(false), { wrapper: createWrapper() });
        expect(result.current.title).toBe("clinics.allClinics");
        expect(result.current.subtitle).toBe("clinics.allClinicsDesc");
    });

    it("returns correct title when mine=true (my clinics)", () => {
        const { result } = renderHook(() => useClinicsSearch(true), { wrapper: createWrapper() });
        expect(result.current.title).toBe("clinics.myClinics");
        expect(result.current.subtitle).toBe("clinics.myClinicsDesc");
    });

    it("returns filters from URL", () => {
        const { result } = renderHook(() => useClinicsSearch(false), {
            wrapper: createWrapper(["/?name=TestClinic&page=1&sort=nameAsc"]),
        });
        expect(result.current.filters.name).toBe("TestClinic");
    });

    it("returns clinics as empty array initially", () => {
        const { result } = renderHook(() => useClinicsSearch(false), { wrapper: createWrapper() });
        expect(result.current.clinics).toEqual([]);
    });

    it("returns filtersSummary for zero results", () => {
        const { result } = renderHook(() => useClinicsSearch(false), { wrapper: createWrapper() });
        expect(result.current.filtersSummary).toBe("clinics.foundCount_many");
    });
});
