import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Box, Typography } from "@mui/material";
import { checkPaymentStatus } from "../../api/paymentApi";

interface Props {
    appointmentId: number;
    onRetry: () => void;
}

export const PaymentResultBanner = ({ appointmentId, onRetry }: Props) => {
    const { t } = useTranslation();
    const [status, setStatus] = useState<"LOADING" | "SUCCESS" | "FAILED">("LOADING");

    useEffect(() => {
        let isMounted = true;

        const verify = async () => {
            try {
                const data = await checkPaymentStatus(appointmentId);
                if (!isMounted) return;

                if (data.isPaid) {
                    setStatus("SUCCESS");
                } else if (
                    data.status === "CANCELED" ||
                    data.status === "REJECTED" ||
                    data.status === "FAILED"
                ) {
                    setStatus("FAILED");
                } else {
                    setStatus("LOADING");
                }
            } catch (error) {
                console.error(t("payment.networkError"), error);
                if (isMounted) setStatus("FAILED");
            }
        };

        verify();
        return () => {
            isMounted = false;
        };
    }, [appointmentId, t]);

    if (status === "LOADING") {
        return (
            <Alert severity="warning" sx={{ mb: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    {t("payment.awaitingPayment")}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1.5 }}>
                    {t("payment.awaitingPaymentDesc")}
                </Typography>
                <Typography
                    component="button"
                    onClick={onRetry}
                    sx={{
                        px: 2,
                        py: 0.8,
                        bgcolor: "warning.main",
                        color: "warning.contrastText",
                        border: "none",
                        borderRadius: 1,
                        cursor: "pointer",
                        fontWeight: "bold",
                        fontSize: 14,
                        "&:hover": { opacity: 0.9 },
                    }}
                >
                    {t("payment.retryPaymentBtn")}
                </Typography>
            </Alert>
        );
    }

    if (status === "SUCCESS") {
        return (
            <Alert severity="success">
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    {t("payment.paymentConfirmed")}
                </Typography>
                <Typography variant="body2">{t("payment.paymentConfirmedDesc")}</Typography>
            </Alert>
        );
    }

    if (status === "FAILED") {
        return (
            <Alert severity="error" sx={{ mb: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    {t("payment.paymentRejected")}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1.5 }}>
                    {t("payment.paymentRejectedDesc")}
                </Typography>
                <Typography
                    component="button"
                    onClick={onRetry}
                    sx={{
                        px: 2,
                        py: 0.8,
                        bgcolor: "error.main",
                        color: "error.contrastText",
                        border: "none",
                        borderRadius: 1,
                        cursor: "pointer",
                        fontWeight: "bold",
                        fontSize: 14,
                        "&:hover": { opacity: 0.9 },
                    }}
                >
                    {t("payment.retryPaymentAgain")}
                </Typography>
            </Alert>
        );
    }

    return null;
};
