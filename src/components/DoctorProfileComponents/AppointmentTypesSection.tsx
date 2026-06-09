import { useState } from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
    doctorsApi,
    type DoctorAppointmentTypeDto,
    type CreateDoctorAppointmentTypeDto,
} from "../../api/doctors";
import { createEmptyAppointmentTypeDraft } from "./DoctorProfilehelpers";

export const AppointmentTypesSection = () => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [modalOpen, setModalOpen] = useState(false);
    const [draft, setDraft] = useState(createEmptyAppointmentTypeDraft());
    const [error, setError] = useState<string | null>(null);
    const [typeToDelete, setTypeToDelete] = useState<DoctorAppointmentTypeDto | null>(null);

    const profileQuery = useQuery({
        queryKey: ["doctor-my-profile"],
        queryFn: () => doctorsApi.getMyProfile(),
    });

    const createMutation = useMutation({
        mutationFn: (payload: CreateDoctorAppointmentTypeDto) =>
            doctorsApi.createMyAppointmentType(payload),
        onSuccess: async () => {
            setError(null);
            setModalOpen(false);
            setDraft(createEmptyAppointmentTypeDraft());
            await queryClient.invalidateQueries({ queryKey: ["doctor-my-profile"] });
        },
        onError: (err) => {
            setError(
                err instanceof Error
                    ? err.message
                    : t("doctorProfile.scheduleErrors.createTypeError"),
            );
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => doctorsApi.deleteMyAppointmentType(id),
        onSuccess: async () => {
            setTypeToDelete(null);
            await queryClient.invalidateQueries({ queryKey: ["doctor-my-profile"] });
            await queryClient.invalidateQueries({
                queryKey: ["doctor-appointment-notifications"],
            });
            await queryClient.invalidateQueries({ queryKey: ["appointment-notifications"] });
        },
    });

    const submit = () => {
        const name = draft.name.trim();
        const basePrice = Number(draft.basePrice);
        const durationMinutes = Number(draft.durationMinutes);

        if (!name) return setError(t("doctorProfile.scheduleErrors.enterName"));
        if (!Number.isFinite(basePrice) || basePrice < 0)
            return setError(t("doctorProfile.scheduleErrors.enterPrice"));
        if (!Number.isFinite(durationMinutes) || durationMinutes <= 0)
            return setError(t("doctorProfile.scheduleErrors.enterDuration"));

        createMutation.mutate({ name, basePrice, durationMinutes });
    };

    const types = profileQuery.data?.appointmentTypes ?? [];

    return (
        <Box>
            <Stack
                direction="row"
                spacing={1}
                sx={{ justifyContent: "space-between", alignItems: "center", mb: 0.8 }}
            >
                <Typography sx={{ fontWeight: 700, color: "#4f627a" }}>
                    {t("doctorProfile.appointmentTypes")}
                </Typography>
                <Button
                    variant="outlined"
                    onClick={() => setModalOpen(true)}
                    sx={{ textTransform: "none" }}
                >
                    {t("doctorProfile.addAppointmentType")}
                </Button>
            </Stack>

            {types.length === 0 ? (
                <Alert severity="info">{t("doctorProfile.noAppointmentTypesYet")}</Alert>
            ) : (
                <Stack spacing={1}>
                    {types.map((item) => (
                        <Card
                            key={item.appointmentTypeId}
                            variant="outlined"
                            sx={{ borderRadius: 2 }}
                        >
                            <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                                <Stack
                                    direction={{ xs: "column", sm: "row" }}
                                    spacing={1}
                                    sx={{
                                        justifyContent: "space-between",
                                        alignItems: { sm: "center" },
                                    }}
                                >
                                    <Stack spacing={0.3}>
                                        <Typography sx={{ fontWeight: 700, color: "#11223a" }}>
                                            {item.name}
                                        </Typography>
                                        <Typography sx={{ color: "#4f627a", fontSize: 14 }}>
                                            {item.basePrice.toFixed(0)} zł • {item.durationMinutes}{" "}
                                            min
                                        </Typography>
                                    </Stack>
                                    <Button
                                        color="error"
                                        variant="outlined"
                                        onClick={() => setTypeToDelete(item)}
                                        sx={{ textTransform: "none" }}
                                    >
                                        {t("common.delete")}
                                    </Button>
                                </Stack>
                            </CardContent>
                        </Card>
                    ))}
                </Stack>
            )}

            <Dialog
                open={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setError(null);
                }}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle sx={{ fontWeight: 800, color: "#11223a" }}>
                    {t("doctorProfile.createAppointmentType")}
                </DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2} sx={{ pt: 0.5 }}>
                        {error && <Alert severity="error">{error}</Alert>}
                        <TextField
                            label={t("common.name")}
                            value={draft.name}
                            onChange={(e) => setDraft((c) => ({ ...c, name: e.target.value }))}
                            fullWidth
                        />
                        <TextField
                            label={t("doctorProfile.priceLabel")}
                            type="number"
                            slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
                            value={draft.basePrice}
                            onChange={(e) => setDraft((c) => ({ ...c, basePrice: e.target.value }))}
                            fullWidth
                        />
                        <TextField
                            label={t("doctorProfile.durationLabel")}
                            type="number"
                            slotProps={{ htmlInput: { min: 1, step: 1 } }}
                            value={draft.durationMinutes}
                            onChange={(e) =>
                                setDraft((c) => ({ ...c, durationMinutes: e.target.value }))
                            }
                            fullWidth
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button
                        onClick={() => {
                            setModalOpen(false);
                            setError(null);
                        }}
                        sx={{ textTransform: "none" }}
                    >
                        {t("common.cancel")}
                    </Button>
                    <Button
                        variant="contained"
                        onClick={submit}
                        disabled={createMutation.isPending}
                        sx={{ textTransform: "none", fontWeight: 700 }}
                    >
                        {createMutation.isPending ? t("common.saving") : t("doctorProfile.create")}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={Boolean(typeToDelete)}
                onClose={() => setTypeToDelete(null)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle sx={{ fontWeight: 800, color: "#11223a" }}>
                    {t("doctorProfile.deleteAppointmentType")}
                </DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={1.5} sx={{ pt: 0.5 }}>
                        <Alert severity="warning">{t("doctorProfile.deleteWarning")}</Alert>
                        <Typography sx={{ color: "#4f627a" }}>
                            {t("doctorProfile.deleteConfirm")} {typeToDelete?.name ?? ""}?
                        </Typography>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={() => setTypeToDelete(null)} sx={{ textTransform: "none" }}>
                        {t("common.cancel")}
                    </Button>
                    <Button
                        color="error"
                        variant="contained"
                        onClick={() => {
                            if (typeToDelete) deleteMutation.mutate(typeToDelete.appointmentTypeId);
                        }}
                        disabled={deleteMutation.isPending}
                        sx={{ textTransform: "none", fontWeight: 700 }}
                    >
                        {deleteMutation.isPending ? t("common.deleting") : t("common.delete")}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
