import type { ChipOwnProps } from "@mui/material";

export const statusTranslations: Record<string, string> = {
    PendingConfirmation: "Oczekuje na potwierdzenie",
    AwaitingPayment: "Oczekuje na płatność online",
    AwaitingOnSitePayment: "Płatność na miejscu",
    Confirmed: "Potwierdzona",
    Completed: "Zrealizowana",
    Cancelled: "Anulowana",
    Unpaid: "Niezapłacona (przeterminowana)",
};

export const statusColors: Record<string, ChipOwnProps["color"]> = {
    PendingConfirmation: "warning",
    AwaitingPayment: "primary",
    AwaitingOnSitePayment: "warning",
    Confirmed: "success",
    Completed: "primary",
    Cancelled: "error",
    Unpaid: "error",
};
