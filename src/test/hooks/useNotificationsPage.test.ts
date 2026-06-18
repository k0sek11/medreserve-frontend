import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useNotificationsPage } from "../../hooks/useNotificationsPage";
import { createWrapper } from "../testUtils";

vi.mock("../../api/notifications", () => ({
    notificationsApi: {
        getClinicJoinRequests: vi.fn().mockResolvedValue([]),
        getAppointmentNotifications: vi.fn().mockResolvedValue([]),
        acceptClinicJoinRequest: vi.fn().mockResolvedValue({}),
        rejectClinicJoinRequest: vi.fn().mockResolvedValue({}),
    },
}));

vi.mock("../../api/auth", () => ({
    authApi: {
        me: vi.fn().mockResolvedValue({
            id: "1",
            email: "test@test.com",
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

describe("useNotificationsPage", () => {
    it("returns default title when no clinicId param", () => {
        const { result } = renderHook(() => useNotificationsPage(), { wrapper: createWrapper() });
        expect(result.current.title).toBe("notifications.title");
    });

    it("returns clinic-specific title when clinicId is in URL", () => {
        const { result } = renderHook(() => useNotificationsPage(), {
            wrapper: createWrapper(["/?clinicId=42"]),
        });
        expect(result.current.title).toBe("notifications.forClinic");
    });

    it("returns mutations for accept and reject", () => {
        const { result } = renderHook(() => useNotificationsPage(), { wrapper: createWrapper() });
        expect(result.current.acceptClinicMutation).toBeDefined();
        expect(result.current.rejectClinicMutation).toBeDefined();
    });

    it("returns empty clinicNotifications initially", () => {
        const { result } = renderHook(() => useNotificationsPage(), { wrapper: createWrapper() });
        expect(result.current.clinicNotifications).toEqual([]);
    });

    it("returns empty appointmentNotifications initially", () => {
        const { result } = renderHook(() => useNotificationsPage(), { wrapper: createWrapper() });
        expect(result.current.appointmentNotifications).toEqual([]);
    });
});
