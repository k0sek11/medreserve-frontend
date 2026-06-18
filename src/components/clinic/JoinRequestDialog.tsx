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
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useJoinRequestForm } from "../../hooks/useJoinRequestForm";

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
    const f = useJoinRequestForm(clinicId, onSuccess, onClose);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{t("clinicDetails.joinDialog.title")}</DialogTitle>
            <form onSubmit={f.onSubmit}>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            {t("clinicDetails.joinDialog.description")}
                        </Typography>
                        <Controller
                            name="confirmDoctor"
                            control={f.control}
                            render={({ field }) => (
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={!!field.value}
                                            onChange={(e) => field.onChange(e.target.checked)}
                                        />
                                    }
                                    label={t("clinicDetails.joinDialog.confirmDoctor")}
                                />
                            )}
                        />
                        {f.errors.confirmDoctor && (
                            <Typography variant="body2" color="error">
                                {t(f.errors.confirmDoctor.message!)}
                            </Typography>
                        )}
                        <TextField
                            label={t("clinicDetails.joinDialog.optionalMessage")}
                            {...f.register("joinMessage")}
                            multiline
                            minRows={4}
                            fullWidth
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={onClose}>{t("common.cancel")}</Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={f.joinMutation.isPending || f.isSubmitting}
                    >
                        {f.joinMutation.isPending || f.isSubmitting
                            ? t("clinicDetails.joinDialog.sending")
                            : t("clinicDetails.joinDialog.send")}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};
