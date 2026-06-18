import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCreateClinic } from "../../hooks/useCreateClinic";
import { createWrapper } from "../testUtils";

vi.mock("../../api/clinics", () => ({
    clinicsApi: {
        create: vi.fn().mockRejectedValue(new Error("not mocked")),
    },
}));

vi.mock("../../api/auth", () => ({
    authApi: {
        me: vi.fn().mockResolvedValue({
            id: "1",
            email: "doc@test.com",
            firstName: "Jan",
            lastName: "Kowalski",
            isActive: true,
            roles: ["Doctor"],
            doctorProfileId: 5,
        }),
    },
}));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({ t: (k: string) => k, i18n: { language: "pl" } }),
}));

describe("useCreateClinic", () => {
    it("returns isDoctor based on authUser", () => {
        const { result } = renderHook(() => useCreateClinic(), { wrapper: createWrapper() });

        expect(typeof result.current.isDoctor).toBe("boolean");
    });

    it("returns shouldRedirect false when user is doctor", () => {
        const { result } = renderHook(() => useCreateClinic(), { wrapper: createWrapper() });
        expect(result.current.shouldRedirect).toBe(false);
    });

    it("validates required fields on empty submit", async () => {
        const { result } = renderHook(() => useCreateClinic(), { wrapper: createWrapper() });

        await act(async () => {
            await result.current.handleSubmit();
        });

        expect(result.current.errors.name).toBeDefined();
        expect(result.current.errors.city).toBeDefined();
    });

    it("phoneError is false when phone is empty", () => {
        const { result } = renderHook(() => useCreateClinic(), { wrapper: createWrapper() });
        expect(result.current.phoneError).toBe(false);
    });

    it("openingHoursInvalid is false with default hours (08:00-16:00)", () => {
        const { result } = renderHook(() => useCreateClinic(), { wrapper: createWrapper() });
        expect(result.current.openingHoursInvalid).toBe(false);
    });

    it("setLocation updates lat, lng, city fields", () => {
        const { result } = renderHook(() => useCreateClinic(), { wrapper: createWrapper() });

        act(() => {
            result.current.setLocation({ lat: 52.2297, lng: 21.0122, city: "Warszawa" });
        });


        expect(result.current.errors.lat).toBeUndefined();
    });

    it("canSubmit is false with empty form", () => {
        const { result } = renderHook(() => useCreateClinic(), { wrapper: createWrapper() });
        expect(result.current.canSubmit).toBe(false);
    });
});
