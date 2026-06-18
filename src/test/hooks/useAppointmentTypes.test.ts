import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAppointmentTypes } from "../../hooks/useAppointmentTypes";
import { createWrapper } from "../testUtils";

const mockCreateType = vi.fn();
const mockDeleteType = vi.fn();
const mockGetProfile = vi.fn();

vi.mock("../../api/doctors", () => ({
    doctorsApi: {
        getMyProfile: () => mockGetProfile(),
        createMyAppointmentType: (p: any) => mockCreateType(p),
        deleteMyAppointmentType: (id: number) => mockDeleteType(id),
    },
}));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { language: "pl" },
    }),
}));

describe("useAppointmentTypes", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetProfile.mockResolvedValue({
            appointmentTypes: [
                { appointmentTypeId: 1, name: "Konsultacja", basePrice: 150, durationMinutes: 30 },
                { appointmentTypeId: 2, name: "Zabieg", basePrice: 300, durationMinutes: 60 },
            ],
        });
        mockCreateType.mockRejectedValue(new Error("not mocked"));
        mockDeleteType.mockRejectedValue(new Error("not mocked"));
    });

    it("returns empty types array initially", () => {
        const { result } = renderHook(() => useAppointmentTypes(), { wrapper: createWrapper() });
        expect(result.current.types).toEqual([]);
    });

    it("modal is closed by default", () => {
        const { result } = renderHook(() => useAppointmentTypes(), { wrapper: createWrapper() });
        expect(result.current.modalOpen).toBe(false);
    });

    it("typeToDelete is null by default", () => {
        const { result } = renderHook(() => useAppointmentTypes(), { wrapper: createWrapper() });
        expect(result.current.typeToDelete).toBeNull();
    });

    it("openCreateModal opens modal and resets form", () => {
        const { result } = renderHook(() => useAppointmentTypes(), { wrapper: createWrapper() });

        act(() => {
            result.current.openCreateModal();
        });

        expect(result.current.modalOpen).toBe(true);
    });

    it("setModalOpen closes modal", () => {
        const { result } = renderHook(() => useAppointmentTypes(), { wrapper: createWrapper() });

        act(() => {
            result.current.openCreateModal();
        });
        act(() => {
            result.current.setModalOpen(false);
        });

        expect(result.current.modalOpen).toBe(false);
    });

    it("setTypeToDelete sets the type to delete", () => {
        const { result } = renderHook(() => useAppointmentTypes(), { wrapper: createWrapper() });

        const typeToDelete = {
            appointmentTypeId: 1,
            name: "Test",
            basePrice: 100,
            durationMinutes: 30,
        };
        act(() => {
            result.current.setTypeToDelete(typeToDelete);
        });

        expect(result.current.typeToDelete).toEqual(typeToDelete);
    });

    it("onSubmit is callable", async () => {
        mockCreateType.mockResolvedValueOnce({});

        const { result } = renderHook(() => useAppointmentTypes(), { wrapper: createWrapper() });

        const { register } = result.current;
        const nameInput = register("name");

        await act(async () => {
            nameInput.onChange({ target: { value: "Nowa wizyta", name: "name" } });
        });


        expect(result.current.errors.name).toBeUndefined();
    });
});
