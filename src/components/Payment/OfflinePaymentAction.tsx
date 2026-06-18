import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, CircularProgress, Paper, TextField, Typography } from "@mui/material";
import { confirmOfflinePayment } from "../../api/paymentApi";

interface Props {
    paymentId: number;
}

export const OfflinePaymentAction = ({ paymentId }: Props) => {
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
        onError: (error) => {
            console.error("Błąd podczas zatwierdzania płatności offline:", error);
            setErrorMsg("Nie udało się zatwierdzić płatności.");
        },
    });

    return (
        <Paper
            elevation={0}
            sx={{ p: 2.5, border: (t) => `1px solid ${t.palette.divider}`, borderRadius: 2 }}
        >
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                Zatwierdź płatność w placówce
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
                Użyj tego przycisku, gdy pacjent uregulował należność gotówką lub kartą na miejscu.
            </Typography>

            <TextField
                fullWidth
                size="small"
                placeholder="Np. zapłacono odliczoną gotówką..."
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
                {confirmMutation.isPending ? "Zatwierdzanie..." : "Potwierdzam otrzymanie wpłaty"}
            </Button>

            {confirmMutation.isSuccess && (
                <Typography sx={{ color: "success.main", mt: 1.5, fontWeight: 600 }}>
                    ✅ Płatność została zaksięgowana w bazie.
                </Typography>
            )}
        </Paper>
    );
};
