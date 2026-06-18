import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useRegisterForm from "../../hooks/useRegisterForm";
import { createWrapper } from "../testUtils";

vi.mock("../../api/auth", () => ({
    authApi: {
        register: vi.fn().mockRejectedValue(new Error("not mocked")),
    },
}));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { language: "pl" },
    }),
}));

describe("useRegisterForm", () => {
    it("returns default empty form values", () => {
        const { result } = renderHook(() => useRegisterForm(), {
            wrapper: createWrapper(),
        });

        expect(result.current.rootError).toBeNull();
        expect(result.current.isSuccess).toBe(false);
    });

    it("validates email is required", async () => {
        const { result } = renderHook(() => useRegisterForm(), {
            wrapper: createWrapper(),
        });

        await act(async () => {
            await result.current.handleSubmit();
        });

        expect(result.current.errors.email).toBeDefined();
    });

    it("validates password minimum length", async () => {
        const { result } = renderHook(() => useRegisterForm(), {
            wrapper: createWrapper(),
        });

        const { register } = result.current;
        const emailInput = register("email");
        const passwordInput = register("password");

        await act(async () => {
            emailInput.onChange({ target: { value: "test@example.com", name: "email" } });
            passwordInput.onChange({ target: { value: "123", name: "password" } });
            await result.current.handleSubmit();
        });

        expect(result.current.errors.password?.message).toBe("validation.passwordMinLength");
    });

    it("validates passwords must match", async () => {
        const { result } = renderHook(() => useRegisterForm(), {
            wrapper: createWrapper(),
        });

        const { register } = result.current;
        const emailInput = register("email");
        const passwordInput = register("password");
        const confirmInput = register("confirmPassword");

        await act(async () => {
            emailInput.onChange({ target: { value: "test@example.com", name: "email" } });
            passwordInput.onChange({ target: { value: "password123", name: "password" } });
            confirmInput.onChange({ target: { value: "different", name: "confirmPassword" } });
            await result.current.handleSubmit();
        });

        expect(result.current.errors.confirmPassword?.message).toBe(
            "validation.passwordsMustMatch",
        );
    });

    it("passes validation with valid data", async () => {
        const { result } = renderHook(() => useRegisterForm(), {
            wrapper: createWrapper(),
        });

        const { register } = result.current;
        const emailInput = register("email");
        const passwordInput = register("password");
        const confirmInput = register("confirmPassword");

        await act(async () => {
            emailInput.onChange({ target: { value: "user@test.com", name: "email" } });
            passwordInput.onChange({ target: { value: "password123", name: "password" } });
            confirmInput.onChange({ target: { value: "password123", name: "confirmPassword" } });
        });

        expect(result.current.errors.email).toBeUndefined();
        expect(result.current.errors.password).toBeUndefined();
        expect(result.current.errors.confirmPassword).toBeUndefined();
    });
});
