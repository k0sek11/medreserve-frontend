import {
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Chip,
    CircularProgress,
    Divider,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { Navigate } from "react-router-dom";
import { useClinicDetails } from "../hooks/useClinicDetails";
import { InfoBlock } from "../components/shared/InfoBlock";
import { ClinicHeroBanner } from "../components/clinic/ClinicHeroBanner";
import { JoinRequestDialog } from "../components/clinic/JoinRequestDialog";
import { Show } from "../components/shared/ShowHide";

export default function ClinicDetailsPage() {
    const d = useClinicDetails();

    if (!d.isValid) return <Navigate to="/poradnie" replace />;
    if (d.clinicQuery.isLoading || d.citiesQuery.isLoading) {
        return (
            <Box display="flex" alignItems="center" justifyContent="center" minHeight="50vh">
                <CircularProgress />
            </Box>
        );
    }
    if (d.clinicQuery.isError || !d.clinic) {
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

    const clinic = d.clinic;

    return (
        <Box sx={{ maxWidth: 1200, mx: "auto", py: { xs: 2, md: 4 }, px: { xs: 2, md: 0 } }}>
            <ClinicHeroBanner clinic={clinic} isOwner={d.isOwner} />
            <Grid container spacing={3}>
                <Grid item xs={12} lg={7}>
                    <Stack spacing={3}>
                        <Card sx={{ borderRadius: 4 }}>
                            <CardHeader
                                title="O przychodni"
                                action={
                                    d.isOwner && !d.isEditing ? (
                                        <Button variant="text" onClick={() => d.setIsEditing(true)}>
                                            Edytuj
                                        </Button>
                                    ) : null
                                }
                            />
                            <CardContent>
                                <Show when={d.isEditing}>
                                    <Stack spacing={2}>
                                        <TextField
                                            label="Nazwa"
                                            value={d.draft.name}
                                            onChange={(e) =>
                                                d.setDraft((c) => ({ ...c, name: e.target.value }))
                                            }
                                            fullWidth
                                        />
                                        <TextField
                                            label="Opis"
                                            value={d.draft.description}
                                            onChange={(e) =>
                                                d.setDraft((c) => ({
                                                    ...c,
                                                    description: e.target.value,
                                                }))
                                            }
                                            fullWidth
                                            multiline
                                            minRows={4}
                                        />
                                    </Stack>
                                </Show>
                                <Show when={!d.isEditing}>
                                    <Typography
                                        variant="body1"
                                        color="text.secondary"
                                        sx={{ whiteSpace: "pre-wrap" }}
                                    >
                                        {clinic.description ||
                                            "Właściciel nie dodał jeszcze opisu poradni."}
                                    </Typography>
                                </Show>
                            </CardContent>
                        </Card>
                        <Card sx={{ borderRadius: 4 }} id="clinic-contact">
                            <CardHeader title="Kontakt i godziny" />
                            <CardContent>
                                <Grid container spacing={2}>
                                    {[
                                        {
                                            label: "Telefon",
                                            field: "phoneNumber" as const,
                                            value: clinic.phoneNumber,
                                        },
                                        {
                                            label: "Email",
                                            field: "email" as const,
                                            value: clinic.email,
                                        },
                                        {
                                            label: "Godziny otwarcia",
                                            field: "openingHours" as const,
                                            value: clinic.openingHours,
                                            multiline: true,
                                            minRows: 3,
                                        },
                                        {
                                            label: "Adres",
                                            field: "streetAddress" as const,
                                            value: `${clinic.streetAddress}, ${clinic.city}`,
                                        },
                                    ].map((f) => (
                                        <Grid item xs={12} md={6} key={f.label}>
                                            <Show when={d.isEditing}>
                                                <TextField
                                                    label={f.label}
                                                    value={d.draft[f.field]}
                                                    onChange={(e) =>
                                                        d.setDraft((c) => ({
                                                            ...c,
                                                            [f.field]: e.target.value,
                                                        }))
                                                    }
                                                    fullWidth
                                                    multiline={f.multiline}
                                                    minRows={f.minRows}
                                                />
                                            </Show>
                                            <Show when={!d.isEditing}>
                                                <InfoBlock
                                                    label={f.label}
                                                    value={f.value || "Brak danych"}
                                                />
                                            </Show>
                                        </Grid>
                                    ))}
                                    <Grid item xs={12} md={6}>
                                        <Show when={d.isEditing}>
                                            <FormControl fullWidth>
                                                <InputLabel id="clinic-city-label">
                                                    Miasto
                                                </InputLabel>
                                                <Select
                                                    labelId="clinic-city-label"
                                                    label="Miasto"
                                                    value={d.draft.cityId}
                                                    onChange={(e) =>
                                                        d.setDraft((c) => ({
                                                            ...c,
                                                            cityId: Number(e.target.value),
                                                        }))
                                                    }
                                                >
                                                    {d.citiesQuery.data?.map((city) => (
                                                        <MenuItem
                                                            key={city.cityId}
                                                            value={city.cityId}
                                                        >
                                                            {city.name}, {city.district}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Show>
                                        <Show when={!d.isEditing}>
                                            <InfoBlock label="Miasto" value={clinic.city} />
                                        </Show>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <InfoBlock label="Województwo" value={clinic.voivodeship} />
                                    </Grid>
                                    <Show when={d.isEditing}>
                                        <Grid item xs={12}>
                                            <TextField
                                                label="Adres mapy"
                                                helperText="To pole nie jest jeszcze używane do edycji mapy."
                                                value={d.draft.mapLocation}
                                                onChange={(e) =>
                                                    d.setDraft((c) => ({
                                                        ...c,
                                                        mapLocation: e.target.value,
                                                    }))
                                                }
                                                fullWidth
                                            />
                                        </Grid>
                                    </Show>
                                </Grid>
                                <Show when={d.isEditing}>
                                    <Stack
                                        direction={{ xs: "column", sm: "row" }}
                                        spacing={1.5}
                                        justifyContent="flex-end"
                                        sx={{ mt: 3 }}
                                    >
                                        <Button
                                            variant="text"
                                            onClick={() => {
                                                d.setDraft(d.toDraft());
                                                d.setIsEditing(false);
                                            }}
                                        >
                                            Anuluj
                                        </Button>
                                        <Button
                                            variant="contained"
                                            onClick={d.handleSave}
                                            disabled={d.updateMutation.isPending}
                                        >
                                            {d.updateMutation.isPending
                                                ? "Zapisywanie..."
                                                : "Zapisz zmiany"}
                                        </Button>
                                    </Stack>
                                </Show>
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
                                    {clinic.doctors.map((doc) => (
                                        <Paper
                                            key={doc.doctorId}
                                            variant="outlined"
                                            sx={{
                                                p: 2,
                                                borderRadius: 3,
                                                backgroundColor: doc.isOwner
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
                                                        {doc.fullName}
                                                    </Typography>
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                    >
                                                        {doc.primarySpecialization}
                                                    </Typography>
                                                </Box>
                                                <Show when={doc.isOwner}>
                                                    <Chip
                                                        size="small"
                                                        label="Właściciel"
                                                        color="primary"
                                                    />
                                                </Show>
                                            </Stack>
                                        </Paper>
                                    ))}
                                </Stack>
                            </CardContent>
                        </Card>
                    </Stack>
                </Grid>
            </Grid>
            <Show when={d.canRequestJoin}>
                <Box sx={{ mt: 4, textAlign: "center" }}>
                    <Typography
                        component="button"
                        onClick={() => d.setIsJoinDialogOpen(true)}
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
                            "&:hover": { opacity: 1, color: "text.primary" },
                        }}
                    >
                        Jeśli jesteś lekarzem, możesz poprosić o dołączenie do tej poradni.
                    </Typography>
                    <Show when={d.requestSent}>
                        <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                            Prośba o dołączenie została wysłana.
                        </Typography>
                    </Show>
                </Box>
            </Show>
            <JoinRequestDialog
                clinicId={d.parsedClinicId}
                open={d.isJoinDialogOpen}
                onClose={() => d.setIsJoinDialogOpen(false)}
                onSuccess={() => d.setRequestSent(true)}
            />
        </Box>
    );
}
