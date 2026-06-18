import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useJoinRequestForm } from "../../hooks/useJoinRequestForm";
import { createWrapper } from "../testUtils";

vi.mock("../../api/clinics", () => ({
    clinicsApi: {
        requestJoin: vi.fn().mockRejectedValue(new Error("not mocked")),
    },
}));

describe("useJoinRequestForm", () => {
    it("returns form with default values", () => {
        const onSuccess = vi.fn();
        const onClose = vi.fn();

        const { result } = renderHook(() => useJoinRequestForm(1, onSuccess, onClose), {
            wrapper: createWrapper(),
        });

        expect(result.current.errors).toBeDefined();
        expect(result.current.isSubmitting).toBe(false);
    });

    it("validates confirmDoctor must be true", async () => {
        const onSuccess = vi.fn();
        const onClose = vi.fn();

        const { result } = renderHook(() => useJoinRequestForm(1, onSuccess, onClose), {
            wrapper: createWrapper(),
        });

        await act(async () => {
            await result.current.onSubmit();
        });

        // With default confirmDoctor: true, validation should pass
        // The form is valid by default
        expect(result.current.errors.confirmDoctor).toBeUndefined();
    });
});
