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
import { useTranslation } from "react-i18next";
import { useAppointmentTypes } from "../../hooks/useAppointmentTypes";

export const AppointmentTypesSection = () => {
    const { t } = useTranslation();
    const a = useAppointmentTypes();

    return (
        <Box>
            <Stack
                direction="row"
                spacing={1}
                sx={{ justifyContent: "space-between", alignItems: "center", mb: 0.8 }}
            >
                <Typography sx={{ fontWeight: 700, color: "text.secondary" }}>
                    {t("doctorProfile.appointmentTypes")}
                </Typography>
                <Button
                    variant="outlined"
                    onClick={a.openCreateModal}
                    sx={{ textTransform: "none" }}
                >
                    {t("doctorProfile.addAppointmentType")}
                </Button>
            </Stack>

            {a.types.length === 0 ? (
                <Alert severity="info">{t("doctorProfile.noAppointmentTypesYet")}</Alert>
            ) : (
                <Stack spacing={1}>
                    {a.types.map((item) => (
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
                                        <Typography sx={{ fontWeight: 700, color: "text.primary" }}>
                                            {item.name}
                                        </Typography>
                                        <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
                                            {item.basePrice.toFixed(0)}{" "}
                                            {t("doctorProfile.currency")} • {item.durationMinutes}{" "}
                                            min
                                        </Typography>
                                    </Stack>
                                    <Button
                                        color="error"
                                        variant="outlined"
                                        onClick={() => a.setTypeToDelete(item)}
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
                open={a.modalOpen}
                onClose={() => a.setModalOpen(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle sx={{ fontWeight: 800, color: "text.primary" }}>
                    {t("doctorProfile.createAppointmentType")}
                </DialogTitle>
                <form onSubmit={a.onSubmit}>
                    <DialogContent dividers>
                        <Stack spacing={2} sx={{ pt: 0.5 }}>
                            {a.errors.root && (
                                <Alert severity="error">{a.errors.root.message}</Alert>
                            )}
                            <TextField
                                label={t("common.name")}
                                {...a.register("name")}
                                error={!!a.errors.name}
                                helperText={
                                    a.errors.name?.message ? t(a.errors.name.message) : undefined
                                }
                                fullWidth
                            />
                            <TextField
                                label={t("doctorProfile.priceLabel")}
                                type="number"
                                slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
                                {...a.register("basePrice", { valueAsNumber: true })}
                                error={!!a.errors.basePrice}
                                helperText={
                                    a.errors.basePrice?.message
                                        ? t(a.errors.basePrice.message)
                                        : undefined
                                }
                                fullWidth
                            />
                            <TextField
                                label={t("doctorProfile.durationLabel")}
                                type="number"
                                slotProps={{ htmlInput: { min: 1, step: 1 } }}
                                {...a.register("durationMinutes", { valueAsNumber: true })}
                                error={!!a.errors.durationMinutes}
                                helperText={
                                    a.errors.durationMinutes?.message
                                        ? t(a.errors.durationMinutes.message)
                                        : undefined
                                }
                                fullWidth
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, py: 2 }}>
                        <Button
                            onClick={() => {
                                a.setModalOpen(false);
                            }}
                            sx={{ textTransform: "none" }}
                        >
                            {t("common.cancel")}
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={a.createMutation.isPending || a.isSubmitting}
                            sx={{ textTransform: "none", fontWeight: 700 }}
                        >
                            {a.createMutation.isPending || a.isSubmitting
                                ? t("common.saving")
                                : t("doctorProfile.create")}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Dialog
                open={Boolean(a.typeToDelete)}
                onClose={() => a.setTypeToDelete(null)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle sx={{ fontWeight: 800, color: "text.primary" }}>
                    {t("doctorProfile.deleteAppointmentType")}
                </DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={1.5} sx={{ pt: 0.5 }}>
                        <Alert severity="warning">{t("doctorProfile.deleteWarning")}</Alert>
                        <Typography sx={{ color: "text.secondary" }}>
                            {t("doctorProfile.deleteConfirm")} {a.typeToDelete?.name ?? ""}?
                        </Typography>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={() => a.setTypeToDelete(null)} sx={{ textTransform: "none" }}>
                        {t("common.cancel")}
                    </Button>
                    <Button
                        color="error"
                        variant="contained"
                        onClick={() => {
                            if (a.typeToDelete)
                                a.deleteMutation.mutate(a.typeToDelete.appointmentTypeId);
                        }}
                        disabled={a.deleteMutation.isPending}
                        sx={{ textTransform: "none", fontWeight: 700 }}
                    >
                        {a.deleteMutation.isPending ? t("common.deleting") : t("common.delete")}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
