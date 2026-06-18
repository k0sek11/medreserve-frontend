import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Paper,
    Radio,
    Snackbar,
    Typography,
    alpha,
    useTheme,
} from "@mui/material";
import { initPayuPayment, createOfflinePaymentIntent } from "../../api/paymentApi";

interface Props {
    appointmentId: number;
    amount: number;
    onSuccessClose?: () => void;
}

export const PaymentMethodSelector = ({ appointmentId, amount, onSuccessClose }: Props) => {
    const { t } = useTranslation();
    const theme = useTheme();
    const [selectedMethod, setSelectedMethod] = useState<"PAYU" | "OFFLINE" | null>(null);
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "success" | "error";
    }>({ open: false, message: "", severity: "success" });
    const queryClient = useQueryClient();

    const payuMutation = useMutation({
        mutationFn: initPayuPayment,
        onSuccess: (data) => {
            window.location.href = data.redirectUri;
        },
        onError: () =>
            setSnackbar({ open: true, message: t("payment.payuError"), severity: "error" }),
    });

    const offlineMutation = useMutation({
        mutationFn: createOfflinePaymentIntent,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["my-appointments"] });
            setSnackbar({
                open: true,
                message: t("payment.offlineSuccess"),
                severity: "success",
            });
            if (onSuccessClose) onSuccessClose();
        },
        onError: () =>
            setSnackbar({ open: true, message: t("payment.offlineError"), severity: "error" }),
    });

    const handlePaymentSubmit = () => {
        if (selectedMethod === "PAYU") {
            payuMutation.mutate(appointmentId);
        } else if (selectedMethod === "OFFLINE") {
            offlineMutation.mutate(appointmentId);
        }
    };

    const isLoading = payuMutation.isPending || offlineMutation.isPending;

    const optionStyles = (isSelected: boolean) => ({
        border: isSelected
            ? `2px solid ${theme.palette.primary.main}`
            : `1px solid ${theme.palette.divider}`,
        bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.06) : "background.paper",
    });

    return (
        <Paper elevation={0} sx={{ p: 3, border: (t) => `1px solid ${t.palette.divider}` }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                {t("payment.finalizationTitle")}
            </Typography>
            <Typography sx={{ mb: 2.5 }}>
                {t("payment.amount")}:{" "}
                <strong style={{ fontSize: 18, color: theme.palette.primary.main }}>
                    {amount.toFixed(2)} PLN
                </strong>
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Paper
                    component="label"
                    elevation={0}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        p: 2,
                        cursor: "pointer",
                        ...optionStyles(selectedMethod === "PAYU"),
                    }}
                >
                    <Radio
                        checked={selectedMethod === "PAYU"}
                        onChange={() => setSelectedMethod("PAYU")}
                    />
                    <Typography fontWeight={700}>{t("payment.payuLabel")}</Typography>
                </Paper>

                <Paper
                    component="label"
                    elevation={0}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        p: 2,
                        cursor: "pointer",
                        ...optionStyles(selectedMethod === "OFFLINE"),
                    }}
                >
                    <Radio
                        checked={selectedMethod === "OFFLINE"}
                        onChange={() => setSelectedMethod("OFFLINE")}
                    />
                    <Typography fontWeight={700}>{t("payment.offlineLabel")}</Typography>
                </Paper>
            </Box>

            <Button
                fullWidth
                variant="contained"
                color={selectedMethod ? "success" : "inherit"}
                disabled={!selectedMethod || isLoading}
                onClick={handlePaymentSubmit}
                size="large"
                sx={{ mt: 3, fontWeight: 700, textTransform: "none" }}
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : undefined}
            >
                {isLoading
                    ? t("payment.processing")
                    : selectedMethod === "PAYU"
                      ? t("payment.goPayu")
                      : t("payment.confirmReservation")}
            </Button>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={5000}
                onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    severity={snackbar.severity}
                    variant="filled"
                    onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
                    sx={{ width: "100%" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Paper>
    );
};
