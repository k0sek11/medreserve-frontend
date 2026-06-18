import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, CircularProgress, Paper, TextField, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { confirmOfflinePayment } from "../../api/paymentApi";

interface Props {
    paymentId: number;
}

export const OfflinePaymentAction = ({ paymentId }: Props) => {
    const { t } = useTranslation();
    const [comment, setComment] = useState("");
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const queryClient = useQueryClient();

    const confirmMutation = useMutation({
        mutationFn: confirmOfflinePayment,
        onSuccess: () => {
            setErrorMsg(null);
            queryClient.invalidateQueries({ queryKey: ["doctor-appointment-notifications"] });
            queryClient.invalidateQueries({ queryKey: ["appointmentDetails"] });
            queryClient.invalidateQueries({ queryKey: ["payments"] });
            setComment("");
        },
        onError: () => {
            setErrorMsg(t("errors.offlinePaymentFailed"));
        },
    });

    return (
        <Paper
            elevation={0}
            sx={{
                p: 2.5,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
            }}
        >
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                {t("payment.offlineConfirmTitle")}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
                {t("payment.offlineConfirmDesc")}
            </Typography>

            <TextField
                fullWidth
                size="small"
                placeholder={t("payment.offlineCommentPlaceholder")}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={confirmMutation.isPending}
                sx={{ mb: 2 }}
            />

            {errorMsg && (
                <Alert severity="error" onClose={() => setErrorMsg(null)} sx={{ mb: 2 }}>
                    {errorMsg}
                </Alert>
            )}

            <Button
                fullWidth
                variant="contained"
                color="success"
                onClick={() => confirmMutation.mutate({ paymentId, comment })}
                disabled={confirmMutation.isPending}
                sx={{ fontWeight: 700, textTransform: "none" }}
                startIcon={
                    confirmMutation.isPending ? (
                        <CircularProgress size={18} color="inherit" />
                    ) : undefined
                }
            >
                {confirmMutation.isPending ? t("payment.confirming") : t("payment.confirmReceipt")}
            </Button>

            {confirmMutation.isSuccess && (
                <Typography sx={{ color: "success.main", mt: 1.5, fontWeight: 600 }}>
                    {t("payment.offlineConfirmed")}
                </Typography>
            )}
        </Paper>
    );
};
