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
import {
    doctorsApi,
    type DoctorAppointmentTypeDto,
    type CreateDoctorAppointmentTypeDto,
} from "../../api/doctors";
import { createEmptyAppointmentTypeDraft } from "./DoctorProfilehelpers";

export const AppointmentTypesSection = () => {
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
            setError(err instanceof Error ? err.message : "Nie udało się utworzyć typu wizyty.");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => doctorsApi.deleteMyAppointmentType(id),
        onSuccess: async () => {
            setTypeToDelete(null);
            await queryClient.invalidateQueries({ queryKey: ["doctor-my-profile"] });
            await queryClient.invalidateQueries({ queryKey: ["doctor-appointment-notifications"] });
            await queryClient.invalidateQueries({ queryKey: ["appointment-notifications"] });
        },
    });

    const submit = () => {
        const name = draft.name.trim();
        const basePrice = Number(draft.basePrice);
        const durationMinutes = Number(draft.durationMinutes);

        if (!name) return setError("Podaj nazwę typu wizyty.");
        if (!Number.isFinite(basePrice) || basePrice < 0) return setError("Podaj prawidłową cenę.");
        if (!Number.isFinite(durationMinutes) || durationMinutes <= 0)
            return setError("Podaj prawidłowy czas trwania.");

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
                <Typography sx={{ fontWeight: 700, color: "#4f627a" }}>Typy wizyt</Typography>
                <Button
                    variant="outlined"
                    onClick={() => setModalOpen(true)}
                    sx={{ textTransform: "none" }}
                >
                    Dodaj typ wizyty
                </Button>
            </Stack>

            {types.length === 0 ? (
                <Alert severity="info">Nie masz jeszcze żadnych typów wizyt.</Alert>
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
                                        Usuń
                                    </Button>
                                </Stack>
                            </CardContent>
                        </Card>
                    ))}
                </Stack>
            )}

            {/* Create dialog */}
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
                    Dodaj typ wizyty
                </DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2} sx={{ pt: 0.5 }}>
                        {error && <Alert severity="error">{error}</Alert>}
                        <TextField
                            label="Nazwa"
                            value={draft.name}
                            onChange={(e) => setDraft((c) => ({ ...c, name: e.target.value }))}
                            fullWidth
                        />
                        <TextField
                            label="Cena"
                            type="number"
                            slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
                            value={draft.basePrice}
                            onChange={(e) => setDraft((c) => ({ ...c, basePrice: e.target.value }))}
                            fullWidth
                        />
                        <TextField
                            label="Czas trwania w minutach"
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
                        Anuluj
                    </Button>
                    <Button
                        variant="contained"
                        onClick={submit}
                        disabled={createMutation.isPending}
                        sx={{ textTransform: "none", fontWeight: 700 }}
                    >
                        {createMutation.isPending ? "Zapisywanie..." : "Utwórz"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete confirmation dialog */}
            <Dialog
                open={Boolean(typeToDelete)}
                onClose={() => setTypeToDelete(null)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle sx={{ fontWeight: 800, color: "#11223a" }}>
                    Usuń typ wizyty
                </DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={1.5} sx={{ pt: 0.5 }}>
                        <Alert severity="warning">
                            Usunięcie typu wizyty nie skasuje historii wizyt. W istniejących wpisach
                            nazwa typu będzie widoczna jako „Nieznane".
                        </Alert>
                        <Typography sx={{ color: "#4f627a" }}>
                            Czy na pewno chcesz usunąć typ wizyty {typeToDelete?.name ?? ""}?
                        </Typography>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={() => setTypeToDelete(null)} sx={{ textTransform: "none" }}>
                        Anuluj
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
                        {deleteMutation.isPending ? "Usuwanie..." : "Usuń"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
