import { useState } from "react";
import {
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { clinicsApi } from "../../api/clinics";

type JoinRequestDialogProps = {
    clinicId: number;
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
};

export const JoinRequestDialog = ({
    clinicId,
    open,
    onClose,
    onSuccess,
}: JoinRequestDialogProps) => {
    const { t } = useTranslation();
    const [confirmDoctor, setConfirmDoctor] = useState(true);
    const [joinMessage, setJoinMessage] = useState("");

    const joinMutation = useMutation({
        mutationFn: () =>
            clinicsApi.requestJoin(clinicId, {
                confirmDoctor,
                message: joinMessage.trim() || undefined,
            }),
        onSuccess: () => {
            onSuccess();
            onClose();
            setJoinMessage("");
            setConfirmDoctor(true);
        },
    });

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{t("clinicDetails.joinDialog.title")}</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ pt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                        {t("clinicDetails.joinDialog.description")}
                    </Typography>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={confirmDoctor}
                                onChange={(e) => setConfirmDoctor(e.target.checked)}
                            />
                        }
                        label={t("clinicDetails.joinDialog.confirmDoctor")}
                    />
                    <TextField
                        label={t("clinicDetails.joinDialog.optionalMessage")}
                        value={joinMessage}
                        onChange={(e) => setJoinMessage(e.target.value)}
                        multiline
                        minRows={4}
                        fullWidth
                    />
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button onClick={onClose}>{t("common.cancel")}</Button>
                <Button
                    variant="contained"
                    onClick={() => joinMutation.mutate()}
                    disabled={!confirmDoctor || joinMutation.isPending}
                >
                    {joinMutation.isPending
                        ? t("clinicDetails.joinDialog.sending")
                        : t("clinicDetails.joinDialog.send")}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
