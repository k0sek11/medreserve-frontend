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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
    doctorsApi,
    type DoctorAppointmentTypeDto,
    type CreateDoctorAppointmentTypeDto,
} from "../../api/doctors";
import { appointmentTypeSchema, type AppointmentTypeFormData } from "../../lib/validations";

export const AppointmentTypesSection = () => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [modalOpen, setModalOpen] = useState(false);
    const [typeToDelete, setTypeToDelete] = useState<DoctorAppointmentTypeDto | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<AppointmentTypeFormData>({
        resolver: zodResolver(appointmentTypeSchema),
        defaultValues: {
            name: "",
            basePrice: 0,
            durationMinutes: 30,
        },
    });

    const profileQuery = useQuery({
        queryKey: ["doctor-my-profile"],
        queryFn: () => doctorsApi.getMyProfile(),
    });

    const createMutation = useMutation({
        mutationFn: (payload: CreateDoctorAppointmentTypeDto) =>
            doctorsApi.createMyAppointmentType(payload),
        onSuccess: async () => {
            setModalOpen(false);
            reset();
            await queryClient.invalidateQueries({ queryKey: ["doctor-my-profile"] });
        },
        onError: (err) => {
            setError("root", {
                message:
                    err instanceof Error
                        ? err.message
                        : t("doctorProfile.scheduleErrors.createTypeError"),
            });
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

    const onSubmit = (data: AppointmentTypeFormData) => {
        createMutation.mutate({
            name: data.name.trim(),
            basePrice: data.basePrice,
            durationMinutes: data.durationMinutes,
        });
    };

    const types = profileQuery.data?.appointmentTypes ?? [];

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
                    onClick={() => {
                        reset({ name: "", basePrice: 0, durationMinutes: 30 });
                        setModalOpen(true);
                    }}
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
                }}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle sx={{ fontWeight: 800, color: "text.primary" }}>
                    {t("doctorProfile.createAppointmentType")}
                </DialogTitle>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogContent dividers>
                        <Stack spacing={2} sx={{ pt: 0.5 }}>
                            {errors.root && <Alert severity="error">{errors.root.message}</Alert>}
                            <TextField
                                label={t("common.name")}
                                {...register("name")}
                                error={!!errors.name}
                                helperText={
                                    errors.name?.message ? t(errors.name.message) : undefined
                                }
                                fullWidth
                            />
                            <TextField
                                label={t("doctorProfile.priceLabel")}
                                type="number"
                                slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
                                {...register("basePrice", { valueAsNumber: true })}
                                error={!!errors.basePrice}
                                helperText={
                                    errors.basePrice?.message
                                        ? t(errors.basePrice.message)
                                        : undefined
                                }
                                fullWidth
                            />
                            <TextField
                                label={t("doctorProfile.durationLabel")}
                                type="number"
                                slotProps={{ htmlInput: { min: 1, step: 1 } }}
                                {...register("durationMinutes", { valueAsNumber: true })}
                                error={!!errors.durationMinutes}
                                helperText={
                                    errors.durationMinutes?.message
                                        ? t(errors.durationMinutes.message)
                                        : undefined
                                }
                                fullWidth
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, py: 2 }}>
                        <Button
                            onClick={() => {
                                setModalOpen(false);
                            }}
                            sx={{ textTransform: "none" }}
                        >
                            {t("common.cancel")}
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={createMutation.isPending || isSubmitting}
                            sx={{ textTransform: "none", fontWeight: 700 }}
                        >
                            {createMutation.isPending || isSubmitting
                                ? t("common.saving")
                                : t("doctorProfile.create")}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Dialog
                open={Boolean(typeToDelete)}
                onClose={() => setTypeToDelete(null)}
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
