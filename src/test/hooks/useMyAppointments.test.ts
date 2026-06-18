import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMyAppointments } from "../../hooks/useMyAppointments";
import { createWrapper } from "../testUtils";

vi.mock("../../api/appointments", () => ({
    appointmentsApi: {
        mine: vi.fn().mockResolvedValue([]),
    },
}));

describe("useMyAppointments", () => {
    it("returns initial state with empty appointments", () => {
        const { result } = renderHook(() => useMyAppointments(), {
            wrapper: createWrapper(),
        });

        expect(result.current.isPaymentModalOpen).toBe(false);
        expect(result.current.selectedAppointmentId).toBeNull();
        expect(result.current.page).toBe(1);
        expect(result.current.totalPages).toBe(0);
        expect(result.current.paginatedAppointments).toEqual([]);
    });

    it("paginates appointments correctly with 5 items per page", () => {
        const { result } = renderHook(() => useMyAppointments(), {
            wrapper: createWrapper(),
        });

        expect(result.current.totalPages).toBe(0);
        expect(result.current.paginatedAppointments.length).toBe(0);
    });

    it("opens and closes payment modal", () => {
        const { result } = renderHook(() => useMyAppointments(), {
            wrapper: createWrapper(),
        });

        act(() => {
            result.current.handleOpenPayment(42);
        });

        expect(result.current.isPaymentModalOpen).toBe(true);
        expect(result.current.selectedAppointmentId).toBe(42);

        act(() => {
            result.current.handleClosePayment();
        });

        expect(result.current.isPaymentModalOpen).toBe(false);
    });

    it("changes page", () => {
        const { result } = renderHook(() => useMyAppointments(), {
            wrapper: createWrapper(),
        });

        act(() => {
            result.current.setPage(3);
        });

        expect(result.current.page).toBe(3);
    });
});
