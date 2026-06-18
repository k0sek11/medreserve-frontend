import type { ChipOwnProps } from "@mui/material";

export const statusColors: Record<string, ChipOwnProps["color"]> = {
    PendingConfirmation: "warning",
    AwaitingPayment: "primary",
    AwaitingOnSitePayment: "warning",
    Confirmed: "success",
    Completed: "primary",
    Cancelled: "error",
    Unpaid: "error",
};
