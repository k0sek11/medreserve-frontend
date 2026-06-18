import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePatientProfile } from "../../hooks/usePatientProfile";
import { createWrapper } from "../testUtils";

vi.mock("../../api/users", () => ({
    usersApi: {
        getMyProfile: vi.fn().mockResolvedValue({
            id: "1",
            email: "test@example.com",
            firstName: "Jan",
            lastName: "Kowalski",
            phoneNumber: "123456789",
            birthDate: "1990-01-01",
            gender: "Mezczyzna",
            isActive: true,
        }),
        updateMyProfile: vi.fn().mockResolvedValue({}),
    },
}));

describe("usePatientProfile", () => {
    it("returns form with initial state", () => {
        const { result } = renderHook(() => usePatientProfile(), {
            wrapper: createWrapper(),
        });

        expect(result.current.errors).toBeDefined();
        expect(result.current.isSubmitSuccessful).toBe(false);
    });

    it("saves with valid data", async () => {
        const { result } = renderHook(() => usePatientProfile(), {
            wrapper: createWrapper(),
        });

        const { register } = result.current;
        const firstNameInput = register("firstName");
        const lastNameInput = register("lastName");
        const phoneInput = register("phoneNumber");
        const birthInput = register("birthDate");
        const genderInput = register("gender");

        await act(async () => {
            firstNameInput.onChange({ target: { value: "Anna", name: "firstName" } });
            lastNameInput.onChange({ target: { value: "Nowak", name: "lastName" } });
            phoneInput.onChange({ target: { value: "123456789", name: "phoneNumber" } });
            birthInput.onChange({ target: { value: "1995-05-05", name: "birthDate" } });
            genderInput.onChange({ target: { value: "Kobieta", name: "gender" } });
        });

        expect(result.current.errors.firstName).toBeUndefined();
        expect(result.current.errors.lastName).toBeUndefined();
    });
});
