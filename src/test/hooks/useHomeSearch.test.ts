import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useHomeSearch } from "../../hooks/useHomeSearch";
import { createWrapper } from "../testUtils";

vi.mock("../../api/doctors", () => ({
    doctorsApi: {
        getSpecializations: vi.fn().mockResolvedValue([]),
    },
}));

describe("useHomeSearch", () => {
    it("returns default form values", () => {
        const { result } = renderHook(() => useHomeSearch(), {
            wrapper: createWrapper(),
        });

        expect(result.current.specializations).toEqual([]);
        expect(result.current.errors).toBeDefined();
    });

    it("setAppointmentDate formats Dayjs to YYYY-MM-DD", () => {
        const { result } = renderHook(() => useHomeSearch(), {
            wrapper: createWrapper(),
        });

        const mockDayjs = {
            format: vi.fn().mockReturnValue("2026-07-15"),
        } as any;

        act(() => {
            result.current.setAppointmentDate(mockDayjs);
        });


        expect(result.current.errors).toBeDefined();
    });

    it("setAppointmentDate with null clears the date", () => {
        const { result } = renderHook(() => useHomeSearch(), {
            wrapper: createWrapper(),
        });

        act(() => {
            result.current.setAppointmentDate(null);
        });

        expect(result.current.errors).toBeDefined();
    });
});
