import {
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Checkbox,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    FormControlLabel,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { clinicsApi, type ClinicDetailDto, type ClinicUpdateRequest } from "../api/clinics";
import { notificationsApi } from "../api/notifications";
import { useAuthUser } from "../hooks/useAuthUser";

type ClinicEditDraft = {
    name: string;
    description: string;
    streetAddress: string;
    openingHours: string;
    mapLocation: string;
    cityId: number;
    phoneNumber: string;
    email: string;
};

const emptyDraft: ClinicEditDraft = {
    name: "",
    description: "",
    streetAddress: "",
    openingHours: "",
    mapLocation: "",
    cityId: 0,
    phoneNumber: "",
    email: "",
};

function toDraft(clinic: ClinicDetailDto): ClinicEditDraft {
    return {
        name: clinic.name,
        description: clinic.description ?? "",
        streetAddress: clinic.streetAddress,
        openingHours: clinic.openingHours ?? "",
        mapLocation: clinic.mapLocation ?? "",
        cityId: clinic.cityId,
        phoneNumber: clinic.phoneNumber ?? "",
        email: clinic.email ?? "",
    };
}

export default function ClinicDetailsPage() {
    const { clinicId } = useParams();
    const parsedClinicId = Number(clinicId);
    const queryClient = useQueryClient();
    const { data: authUser } = useAuthUser();
    const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
    const [confirmDoctor, setConfirmDoctor] = useState(true);
    const [joinMessage, setJoinMessage] = useState("");
    const [requestSent, setRequestSent] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [draft, setDraft] = useState<ClinicEditDraft>(emptyDraft);

    const clinicQuery = useQuery({
        queryKey: ["clinic-details", parsedClinicId],
        queryFn: () => clinicsApi.getDetails(parsedClinicId),
        enabled: Number.isFinite(parsedClinicId) && parsedClinicId > 0,
    });

    const citiesQuery = useQuery({
        queryKey: ["clinic-cities"],
        queryFn: clinicsApi.getCities,
        enabled: Boolean(authUser?.doctorProfileId),
    });

    useEffect(() => {
        if (clinicQuery.data) {
            setDraft(toDraft(clinicQuery.data));
            setRequestSent(false);
            setIsEditing(false);
        }
    }, [clinicQuery.data]);

    const updateMutation = useMutation({
        mutationFn: async () => {
            const payload: ClinicUpdateRequest = {
                name: draft.name.trim(),
                description: draft.description.trim() || null,
                streetAddress: draft.streetAddress.trim(),
                openingHours: draft.openingHours.trim() || null,
                mapLocation: draft.mapLocation.trim() || null,
                cityId: draft.cityId,
                phoneNumber: draft.phoneNumber.trim() || null,
                email: draft.email.trim() || null,
                isActive: clinicQuery.data?.isActive ?? true,
            };

            return clinicsApi.update(parsedClinicId, payload);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["clinic-details", parsedClinicId] });
            setIsEditing(false);
        },
    });

    const joinMutation = useMutation({
        mutationFn: () =>
            clinicsApi.requestJoin(parsedClinicId, {
                confirmDoctor,
                message: joinMessage.trim() || undefined,
            }),
        onSuccess: () => {
            setRequestSent(true);
            setIsJoinDialogOpen(false);
            setJoinMessage("");
            setConfirmDoctor(true);
        },
    });

    if (!Number.isFinite(parsedClinicId) || parsedClinicId <= 0) {
        return <Navigate to="/poradnie" replace />;
    }

    if (clinicQuery.isLoading || citiesQuery.isLoading) {
        return (
            <Box display="flex" alignItems="center" justifyContent="center" minHeight="50vh">
                <CircularProgress />
            </Box>
        );
    }

    if (clinicQuery.isError || !clinicQuery.data) {
        return (
            <Box sx={{ maxWidth: 960, mx: "auto", py: 6 }}>
                <Card>
                    <CardContent>
                        <Typography variant="h5" fontWeight={700} gutterBottom>
                            Nie udało się wczytać poradni
                        </Typography>
                        <Typography color="text.secondary">Spróbuj ponownie za chwilę.</Typography>
                    </CardContent>
                </Card>
            </Box>
        );
    }

    const clinic = clinicQuery.data;
    const isOwner = clinic.isCurrentUserOwner;
    const canRequestJoin =
        Boolean(authUser?.doctorProfileId) && !clinic.isCurrentUserMember && !isOwner;

    const handleSave = () => {
        updateMutation.mutate();
    };

    return (
        <Box sx={{ maxWidth: 1200, mx: "auto", py: { xs: 2, md: 4 }, px: { xs: 2, md: 0 } }}>
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 3, md: 4 },
                    mb: 3,
                    borderRadius: 4,
                    color: "white",
                    background:
                        "linear-gradient(135deg, rgba(26,32,44,0.95) 0%, rgba(45,55,72,0.95) 45%, rgba(20,184,166,0.85) 100%)",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                <Box
                    sx={{
                        position: "absolute",
                        inset: 0,
                        background:
                            "radial-gradient(circle at top right, rgba(255,255,255,0.14), transparent 30%), radial-gradient(circle at bottom left, rgba(255,255,255,0.08), transparent 26%)",
                        pointerEvents: "none",
                    }}
                />
                <Stack spacing={2} sx={{ position: "relative" }}>
                    <Box>
                        <Chip
                            label={clinic.isActive ? "Aktywna poradnia" : "Nieaktywna poradnia"}
                            sx={{
                                mb: 2,
                                bgcolor: clinic.isActive
                                    ? "rgba(34,197,94,0.2)"
                                    : "rgba(239,68,68,0.2)",
                                color: "white",
                            }}
                        />
                        <Typography variant="h3" fontWeight={800} gutterBottom>
                            {clinic.name}
                        </Typography>
                        <Typography
                            variant="h6"
                            sx={{ maxWidth: 780, color: "rgba(255,255,255,0.88)" }}
                        >
                            {clinic.description || "Ta poradnia nie ma jeszcze opisu."}
                        </Typography>
                    </Box>
                    <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={1.5}
                        alignItems={{ xs: "stretch", sm: "center" }}
                    >
                        <Button
                            variant="contained"
                            color="inherit"
                            sx={{ color: "#0f172a", fontWeight: 700 }}
                            href="#doctor-list"
                        >
                            Zobacz lekarzy
                        </Button>
                        <Button
                            variant="outlined"
                            sx={{ borderColor: "rgba(255,255,255,0.45)", color: "white" }}
                            href="#clinic-contact"
                        >
                            Kontakt i godziny
                        </Button>
                        {isOwner ? (
                            <Chip
                                label="Widok właściciela"
                                sx={{ color: "white", borderColor: "rgba(255,255,255,0.35)" }}
                                variant="outlined"
                            />
                        ) : null}
                    </Stack>
                </Stack>
            </Paper>

            <Grid container spacing={3}>
                <Grid item xs={12} lg={7}>
                    <Stack spacing={3}>
                        <Card sx={{ borderRadius: 4 }}>
                            <CardHeader
                                title="O przychodni"
                                action={
                                    isOwner && !isEditing ? (
                                        <Button variant="text" onClick={() => setIsEditing(true)}>
                                            Edytuj
                                        </Button>
                                    ) : null
                                }
                            />
                            <CardContent>
                                {isEditing ? (
                                    <Stack spacing={2}>
                                        <TextField
                                            label="Nazwa"
                                            value={draft.name}
                                            onChange={(event) =>
                                                setDraft((current) => ({
                                                    ...current,
                                                    name: event.target.value,
                                                }))
                                            }
                                            fullWidth
                                        />
                                        <TextField
                                            label="Opis"
                                            value={draft.description}
                                            onChange={(event) =>
                                                setDraft((current) => ({
                                                    ...current,
                                                    description: event.target.value,
                                                }))
                                            }
                                            fullWidth
                                            multiline
                                            minRows={4}
                                        />
                                    </Stack>
                                ) : (
                                    <Typography
                                        variant="body1"
                                        color="text.secondary"
                                        sx={{ whiteSpace: "pre-wrap" }}
                                    >
                                        {clinic.description ||
                                            "Właściciel nie dodał jeszcze opisu poradni."}
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>

                        <Card sx={{ borderRadius: 4 }} id="clinic-contact">
                            <CardHeader title="Kontakt i godziny" />
                            <CardContent>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                        {isEditing ? (
                                            <TextField
                                                label="Telefon"
                                                value={draft.phoneNumber}
                                                onChange={(event) =>
                                                    setDraft((current) => ({
                                                        ...current,
                                                        phoneNumber: event.target.value,
                                                    }))
                                                }
                                                fullWidth
                                            />
                                        ) : (
                                            <InfoBlock
                                                label="Telefon"
                                                value={clinic.phoneNumber || "Brak danych"}
                                            />
                                        )}
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        {isEditing ? (
                                            <TextField
                                                label="Email"
                                                value={draft.email}
                                                onChange={(event) =>
                                                    setDraft((current) => ({
                                                        ...current,
                                                        email: event.target.value,
                                                    }))
                                                }
                                                fullWidth
                                            />
                                        ) : (
                                            <InfoBlock
                                                label="Email"
                                                value={clinic.email || "Brak danych"}
                                            />
                                        )}
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        {isEditing ? (
                                            <TextField
                                                label="Godziny otwarcia"
                                                value={draft.openingHours}
                                                onChange={(event) =>
                                                    setDraft((current) => ({
                                                        ...current,
                                                        openingHours: event.target.value,
                                                    }))
                                                }
                                                fullWidth
                                                multiline
                                                minRows={3}
                                            />
                                        ) : (
                                            <InfoBlock
                                                label="Godziny otwarcia"
                                                value={clinic.openingHours || "Brak danych"}
                                            />
                                        )}
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        {isEditing ? (
                                            <TextField
                                                label="Adres"
                                                value={draft.streetAddress}
                                                onChange={(event) =>
                                                    setDraft((current) => ({
                                                        ...current,
                                                        streetAddress: event.target.value,
                                                    }))
                                                }
                                                fullWidth
                                            />
                                        ) : (
                                            <InfoBlock
                                                label="Adres"
                                                value={`${clinic.streetAddress}, ${clinic.city}`}
                                            />
                                        )}
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        {isEditing ? (
                                            <FormControl fullWidth>
                                                <InputLabel id="clinic-city-label">
                                                    Miasto
                                                </InputLabel>
                                                <Select
                                                    labelId="clinic-city-label"
                                                    label="Miasto"
                                                    value={draft.cityId}
                                                    onChange={(event) =>
                                                        setDraft((current) => ({
                                                            ...current,
                                                            cityId: Number(event.target.value),
                                                        }))
                                                    }
                                                >
                                                    {citiesQuery.data?.map((city) => (
                                                        <MenuItem
                                                            key={city.cityId}
                                                            value={city.cityId}
                                                        >
                                                            {city.name}, {city.district}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        ) : (
                                            <InfoBlock label="Miasto" value={clinic.city} />
                                        )}
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <InfoBlock label="Województwo" value={clinic.voivodeship} />
                                    </Grid>
                                    {isEditing ? (
                                        <Grid item xs={12}>
                                            <TextField
                                                label="Adres mapy"
                                                helperText="To pole nie jest jeszcze używane do edycji mapy, ale zapisujemy je w profilu poradni."
                                                value={draft.mapLocation}
                                                onChange={(event) =>
                                                    setDraft((current) => ({
                                                        ...current,
                                                        mapLocation: event.target.value,
                                                    }))
                                                }
                                                fullWidth
                                            />
                                        </Grid>
                                    ) : null}
                                </Grid>

                                {isEditing ? (
                                    <Stack
                                        direction={{ xs: "column", sm: "row" }}
                                        spacing={1.5}
                                        justifyContent="flex-end"
                                        sx={{ mt: 3 }}
                                    >
                                        <Button
                                            variant="text"
                                            onClick={() => {
                                                setDraft(toDraft(clinic));
                                                setIsEditing(false);
                                            }}
                                        >
                                            Anuluj
                                        </Button>
                                        <Button
                                            variant="contained"
                                            onClick={handleSave}
                                            disabled={updateMutation.isPending}
                                        >
                                            {updateMutation.isPending
                                                ? "Zapisywanie..."
                                                : "Zapisz zmiany"}
                                        </Button>
                                    </Stack>
                                ) : null}
                            </CardContent>
                        </Card>

                        <Card sx={{ borderRadius: 4 }}>
                            <CardHeader title="Mapa" />
                            <CardContent>
                                <Box
                                    sx={{
                                        minHeight: 260,
                                        borderRadius: 3,
                                        border: "1px dashed",
                                        borderColor: "divider",
                                        display: "grid",
                                        placeItems: "center",
                                        background:
                                            "linear-gradient(135deg, rgba(148,163,184,0.12) 0%, rgba(56,189,248,0.08) 100%)",
                                    }}
                                >
                                    <Stack spacing={1} alignItems="center">
                                        <Typography fontWeight={700}>Podgląd mapy</Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            textAlign="center"
                                        >
                                            W tym miejscu pojawi się osadzona mapa po podpięciu
                                            dostawcy map.
                                        </Typography>
                                    </Stack>
                                </Box>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="body2" color="text.secondary">
                                    Adres mapy:{" "}
                                    {clinic.mapLocation ||
                                        `${clinic.streetAddress}, ${clinic.city}`}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Stack>
                </Grid>

                <Grid item xs={12} lg={5}>
                    <Stack spacing={3} id="doctor-list">
                        <Card sx={{ borderRadius: 4 }}>
                            <CardHeader title={`Lekarze (${clinic.doctors.length})`} />
                            <CardContent>
                                <Stack spacing={2}>
                                    {clinic.doctors.map((doctor) => (
                                        <Paper
                                            key={doctor.doctorId}
                                            variant="outlined"
                                            sx={{
                                                p: 2,
                                                borderRadius: 3,
                                                backgroundColor: doctor.isOwner
                                                    ? "rgba(59,130,246,0.05)"
                                                    : undefined,
                                            }}
                                        >
                                            <Stack
                                                direction="row"
                                                spacing={2}
                                                alignItems="center"
                                                justifyContent="space-between"
                                            >
                                                <Box>
                                                    <Typography fontWeight={700}>
                                                        {doctor.fullName}
                                                    </Typography>
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                    >
                                                        {doctor.primarySpecialization}
                                                    </Typography>
                                                </Box>
                                                {doctor.isOwner ? (
                                                    <Chip
                                                        size="small"
                                                        label="Właściciel"
                                                        color="primary"
                                                    />
                                                ) : null}
                                            </Stack>
                                        </Paper>
                                    ))}
                                </Stack>
                            </CardContent>
                        </Card>
                    </Stack>
                </Grid>
            </Grid>

            {canRequestJoin ? (
                <Box sx={{ mt: 4, textAlign: "center" }}>
                    <Typography
                        component="button"
                        onClick={() => setIsJoinDialogOpen(true)}
                        sx={{
                            appearance: "none",
                            border: 0,
                            background: "transparent",
                            color: "text.secondary",
                            cursor: "pointer",
                            fontSize: 13,
                            textDecoration: "underline",
                            opacity: 0.72,
                            p: 0,
                            "&:hover": {
                                opacity: 1,
                                color: "text.primary",
                            },
                        }}
                    >
                        Jeśli jesteś lekarzem, możesz poprosić o dołączenie do tej poradni.
                    </Typography>
                    {requestSent ? (
                        <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                            Prośba o dołączenie została wysłana.
                        </Typography>
                    ) : null}
                </Box>
            ) : null}

            <Dialog
                open={isJoinDialogOpen}
                onClose={() => setIsJoinDialogOpen(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Prośba o dołączenie</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            Wyślij prośbę do właściciela poradni. Formularz jest celowo prosty, żeby
                            nie zajmował dużo miejsca.
                        </Typography>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={confirmDoctor}
                                    onChange={(event) => setConfirmDoctor(event.target.checked)}
                                />
                            }
                            label="Potwierdzam, że chcę dołączyć jako lekarz"
                        />
                        <TextField
                            label="Wiadomość opcjonalna"
                            value={joinMessage}
                            onChange={(event) => setJoinMessage(event.target.value)}
                            multiline
                            minRows={4}
                            fullWidth
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setIsJoinDialogOpen(false)}>Anuluj</Button>
                    <Button
                        variant="contained"
                        onClick={() => joinMutation.mutate()}
                        disabled={!confirmDoctor || joinMutation.isPending}
                    >
                        {joinMutation.isPending ? "Wysyłanie..." : "Wyślij prośbę"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
    return (
        <Stack spacing={0.5}>
            <Typography variant="caption" color="text.secondary">
                {label}
            </Typography>
            <Typography variant="body1" fontWeight={600}>
                {value}
            </Typography>
        </Stack>
    );
}
