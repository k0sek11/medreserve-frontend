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
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { clinicsApi } from "../../api/clinics";
import { joinRequestSchema, type JoinRequestFormData } from "../../lib/validations";

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

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<JoinRequestFormData>({
        resolver: zodResolver(joinRequestSchema),
        defaultValues: {
            confirmDoctor: true,
            joinMessage: "",
        },
    });

    const joinMutation = useMutation({
        mutationFn: (data: JoinRequestFormData) =>
            clinicsApi.requestJoin(clinicId, {
                confirmDoctor: true,
                message: data.joinMessage?.trim() || undefined,
            }),
        onSuccess: () => {
            onSuccess();
            onClose();
            reset();
        },
    });

    const onSubmit = (data: JoinRequestFormData) => {
        joinMutation.mutate(data);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{t("clinicDetails.joinDialog.title")}</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            {t("clinicDetails.joinDialog.description")}
                        </Typography>
                        <Controller
                            name="confirmDoctor"
                            control={control}
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
                        {errors.confirmDoctor && (
                            <Typography variant="body2" color="error">
                                {t(errors.confirmDoctor.message!)}
                            </Typography>
                        )}
                        <TextField
                            label={t("clinicDetails.joinDialog.optionalMessage")}
                            {...register("joinMessage")}
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
                        disabled={joinMutation.isPending || isSubmitting}
                    >
                        {joinMutation.isPending || isSubmitting
                            ? t("clinicDetails.joinDialog.sending")
                            : t("clinicDetails.joinDialog.send")}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};
