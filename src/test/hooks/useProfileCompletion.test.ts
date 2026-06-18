import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useProfileCompletion } from "../../hooks/useProfileCompletion";
import { createWrapper } from "../testUtils";

const mockCompleteProfile = vi.fn();
const mockMe = vi.fn();

vi.mock("../../api/auth", () => ({
    authApi: {
        me: (...args: any[]) => mockMe(...args),
        completeProfile: (...args: any[]) => mockCompleteProfile(...args),
    },
}));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { language: "pl" },
    }),
}));

describe("useProfileCompletion", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockMe.mockResolvedValue({
            id: "1",
            email: "test@example.com",
            firstName: "Jan",
            lastName: "Kowalski",
            isActive: false,
            roles: [],
            doctorProfileId: null,
        });
        mockCompleteProfile.mockRejectedValue(new Error("not mocked"));
    });

    it("returns default state", () => {
        const { result } = renderHook(() => useProfileCompletion(), {
            wrapper: createWrapper(),
        });

        expect(result.current.profileType).toBeNull();
        expect(result.current.isPending).toBe(false);
        expect(result.current.genderOptions).toHaveLength(3);
    });

    it("selectProfileType sets the profile type", () => {
        const { result } = renderHook(() => useProfileCompletion(), {
            wrapper: createWrapper(),
        });

        act(() => {
            result.current.selectProfileType("Doctor");
        });

        expect(result.current.profileType).toBe("Doctor");
    });

    it("watchedProfileType changes when Doctor selected", () => {
        const { result } = renderHook(() => useProfileCompletion(), {
            wrapper: createWrapper(),
        });

        act(() => {
            result.current.selectProfileType("Doctor");
        });

        expect(result.current.watchedProfileType).toBe("Doctor");
    });

    it("watchedProfileType changes when Patient selected", () => {
        const { result } = renderHook(() => useProfileCompletion(), {
            wrapper: createWrapper(),
        });

        act(() => {
            result.current.selectProfileType("Patient");
        });

        expect(result.current.watchedProfileType).toBe("Patient");
    });

    it("isPending is false initially", () => {
        const { result } = renderHook(() => useProfileCompletion(), {
            wrapper: createWrapper(),
        });

        expect(result.current.isPending).toBe(false);
    });

    it("genderOptions have correct values", () => {
        const { result } = renderHook(() => useProfileCompletion(), {
            wrapper: createWrapper(),
        });

        expect(result.current.genderOptions.map((g) => g.value)).toEqual([
            "Kobieta",
            "Mezczyzna",
            "Inne",
        ]);
    });
});
