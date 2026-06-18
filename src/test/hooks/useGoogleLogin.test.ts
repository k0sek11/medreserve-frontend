import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useGoogleLogin } from "../../hooks/useGoogleLogin";
import { createWrapper } from "../testUtils";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("../../api/auth", () => ({
    authApi: {
        loginWithGoogleApi: vi.fn().mockResolvedValue({ token: "google-token-123" }),
        me: vi.fn().mockResolvedValue({
            id: "1",
            email: "test@test.com",
            firstName: "Jan",
            lastName: "Kowalski",
            isActive: true,
            roles: ["Patient"],
            doctorProfileId: null,
        }),
    },
}));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({ t: (k: string) => k, i18n: { language: "pl" } }),
}));

describe("useGoogleLogin", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it("returns loginMutation and handleGoogleSuccess", () => {
        const { result } = renderHook(() => useGoogleLogin(), { wrapper: createWrapper() });
        expect(result.current.loginMutation).toBeDefined();
        expect(result.current.handleGoogleSuccess).toBeDefined();
    });

    it("handleGoogleSuccess calls loginMutation with credential", () => {
        const { result } = renderHook(() => useGoogleLogin(), { wrapper: createWrapper() });

        act(() => {
            result.current.handleGoogleSuccess({ credential: "google-credential-abc" });
        });


        expect(result.current.loginMutation).toBeDefined();
    });

    it("handleGoogleSuccess does nothing without credential", () => {
        const { result } = renderHook(() => useGoogleLogin(), { wrapper: createWrapper() });

        act(() => {
            result.current.handleGoogleSuccess({});
        });

        expect(result.current.loginMutation.isPending).toBe(false);
    });

    it("handleGoogleSuccess does nothing with undefined credential", () => {
        const { result } = renderHook(() => useGoogleLogin(), { wrapper: createWrapper() });

        act(() => {
            result.current.handleGoogleSuccess({ credential: undefined });
        });

        expect(result.current.loginMutation.isPending).toBe(false);
    });
});
