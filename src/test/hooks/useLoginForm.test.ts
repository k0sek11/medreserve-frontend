import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import useLoginForm from "../../hooks/useLoginForm";
import { createWrapper } from "../testUtils";

const mockLogin = vi.fn();
const mockMe = vi.fn();

vi.mock("../../api/auth", () => ({
    authApi: {
        login: (...args: any[]) => mockLogin(...args),
        me: (...args: any[]) => mockMe(...args),
    },
}));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { language: "pl" },
    }),
}));

describe("useLoginForm", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockLogin.mockRejectedValue(new Error("not mocked"));
        mockMe.mockResolvedValue(null);
    });

    it("returns default empty form values", () => {
        const { result } = renderHook(() => useLoginForm(), {
            wrapper: createWrapper(),
        });

        expect(result.current.rootError).toBeNull();
        expect(result.current.isSuccess).toBe(false);
    });

    it("validates email is required", async () => {
        const { result } = renderHook(() => useLoginForm(), {
            wrapper: createWrapper(),
        });

        await act(async () => {
            await result.current.handleSubmit();
        });

        expect(result.current.errors.email).toBeDefined();
        expect(result.current.errors.email?.message).toBe("validation.required");
    });

    it("validates email format", async () => {
        const { result } = renderHook(() => useLoginForm(), {
            wrapper: createWrapper(),
        });

        const { register } = result.current;
        const emailInput = register("email");

        await act(async () => {
            emailInput.onChange({ target: { value: "invalid-email", name: "email" } });
            await result.current.handleSubmit();
        });

        expect(result.current.errors.email?.message).toBe("validation.emailInvalid");
    });

    it("validates password is required", async () => {
        const { result } = renderHook(() => useLoginForm(), {
            wrapper: createWrapper(),
        });

        const { register } = result.current;
        const emailInput = register("email");
        const passwordInput = register("password");

        await act(async () => {
            emailInput.onChange({ target: { value: "test@example.com", name: "email" } });
            passwordInput.onChange({ target: { value: "", name: "password" } });
            await result.current.handleSubmit();
        });

        expect(result.current.errors.password).toBeDefined();
    });

    it("submits valid form data and calls login", async () => {
        mockLogin.mockResolvedValueOnce({ token: "test-token" });
        mockMe.mockResolvedValueOnce({
            id: "1",
            email: "user@test.com",
            firstName: "Jan",
            lastName: "Kowalski",
            isActive: true,
            roles: ["Patient"],
            doctorProfileId: null,
        });
        const onLoggedIn = vi.fn();

        const { result } = renderHook(() => useLoginForm(onLoggedIn), {
            wrapper: createWrapper(),
        });

        const { register } = result.current;
        const emailInput = register("email");
        const passwordInput = register("password");

        await act(async () => {
            emailInput.onChange({ target: { value: "user@test.com", name: "email" } });
            passwordInput.onChange({ target: { value: "password123", name: "password" } });
            await result.current.handleSubmit();
        });

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith({
                email: "user@test.com",
                password: "password123",
            });
        });
    });

    it("shows loading state during submission", async () => {
        mockLogin.mockImplementation(() => new Promise(() => {})); // never resolves

        const { result } = renderHook(() => useLoginForm(), {
            wrapper: createWrapper(),
        });

        const { register } = result.current;
        const emailInput = register("email");
        const passwordInput = register("password");

        await act(async () => {
            emailInput.onChange({ target: { value: "user@test.com", name: "email" } });
            passwordInput.onChange({ target: { value: "password123", name: "password" } });
            result.current.handleSubmit();
        });

        expect(result.current.isLoading).toBe(true);
    });
});
