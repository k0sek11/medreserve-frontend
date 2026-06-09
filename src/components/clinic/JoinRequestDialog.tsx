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
            <DialogTitle>Prośba o dołączenie</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ pt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                        Wyślij prośbę do właściciela poradni. Formularz jest celowo prosty, żeby nie
                        zajmował dużo miejsca.
                    </Typography>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={confirmDoctor}
                                onChange={(e) => setConfirmDoctor(e.target.checked)}
                            />
                        }
                        label="Potwierdzam, że chcę dołączyć jako lekarz"
                    />
                    <TextField
                        label="Wiadomość opcjonalna"
                        value={joinMessage}
                        onChange={(e) => setJoinMessage(e.target.value)}
                        multiline
                        minRows={4}
                        fullWidth
                    />
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button onClick={onClose}>Anuluj</Button>
                <Button
                    variant="contained"
                    onClick={() => joinMutation.mutate()}
                    disabled={!confirmDoctor || joinMutation.isPending}
                >
                    {joinMutation.isPending ? "Wysyłanie..." : "Wyślij prośbę"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
