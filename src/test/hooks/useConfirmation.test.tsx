import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useConfirmation } from "../../hooks/useConfirmation";

vi.mock("../../api/appointments", () => ({
    appointmentsApi: {
        getById: vi.fn().mockResolvedValue(null),
    },
}));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { language: "pl" },
    }),
}));

function createConfirmationWrapper(id: string) {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });

    return function Wrapper({ children }: { children: React.ReactNode }) {
        return (
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={[`/wizyty/potwierdzenie/${id}`]}>
                    <Routes>
                        <Route path="/wizyty/potwierdzenie/:appointmentId" element={children} />
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        );
    };
}

describe("useConfirmation", () => {
    it("returns hasValidId false when appointmentId is not a valid number", () => {
        const { result } = renderHook(() => useConfirmation(), {
            wrapper: createConfirmationWrapper("abc"),
        });

        expect(result.current.hasValidId).toBe(false);
    });

    it("returns hasValidId true when appointmentId is a valid number", () => {
        const { result } = renderHook(() => useConfirmation(), {
            wrapper: createConfirmationWrapper("123"),
        });

        expect(result.current.hasValidId).toBe(true);
    });

    it("uses default title when no state", () => {
        const { result } = renderHook(() => useConfirmation(), {
            wrapper: createConfirmationWrapper("1"),
        });

        expect(result.current.title).toBe("confirmation.reservedTitle");
    });
});
