import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useMainLayout } from "../../hooks/useMainLayout";
import { createWrapper } from "../testUtils";

vi.mock("../../api/auth", () => ({
    authApi: {
        me: vi.fn().mockResolvedValue({
            id: "1",
            email: "patient@test.com",
            firstName: "Jan",
            lastName: "Kowalski",
            isActive: true,
            roles: ["Patient"],
            doctorProfileId: null,
        }),
        logout: vi.fn().mockResolvedValue({}),
    },
}));

vi.mock("../../context/ThemeContext", () => ({
    useThemeMode: () => ({ mode: "light" as const, toggleTheme: vi.fn() }),
}));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (k: string) => k,
        i18n: { language: "pl", changeLanguage: vi.fn() },
    }),
}));

describe("useMainLayout", () => {
    it("returns t function and i18n", () => {
        const { result } = renderHook(() => useMainLayout(), { wrapper: createWrapper() });
        expect(result.current.t).toBeDefined();
        expect(result.current.i18n).toBeDefined();
    });

    it("returns visibleNavLinks as array", () => {
        const { result } = renderHook(() => useMainLayout(), { wrapper: createWrapper() });
        expect(Array.isArray(result.current.visibleNavLinks)).toBe(true);
    });

    it("returns mode and toggleTheme", () => {
        const { result } = renderHook(() => useMainLayout(), { wrapper: createWrapper() });
        expect(result.current.mode).toBe("light");
        expect(result.current.toggleTheme).toBeDefined();
    });

    it("returns logoutMutation", () => {
        const { result } = renderHook(() => useMainLayout(), { wrapper: createWrapper() });
        expect(result.current.logoutMutation).toBeDefined();
    });

    it("returns isDoctor as boolean", () => {
        const { result } = renderHook(() => useMainLayout(), { wrapper: createWrapper() });
        expect(typeof result.current.isDoctor).toBe("boolean");
    });
});
