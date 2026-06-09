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
import { useTranslation } from "react-i18next";
import { useClinicDetails } from "../hooks/useClinicDetails";
import { InfoBlock } from "../components/shared/InfoBlock";
import { ClinicHeroBanner } from "../components/clinic/ClinicHeroBanner";
import { JoinRequestDialog } from "../components/clinic/JoinRequestDialog";
import { Show } from "../components/shared/ShowHide";

export default function ClinicDetailsPage() {
    const { t } = useTranslation();
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
                            {t("clinicDetails.loadError")}
                        </Typography>
                        <Typography color="text.secondary">{t("common.tryAgain")}</Typography>
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
                                title={t("clinicDetails.about")}
                                action={
                                    d.isOwner && !d.isEditing ? (
                                        <Button variant="text" onClick={() => d.setIsEditing(true)}>
                                            {t("clinicDetails.edit")}
                                        </Button>
                                    ) : null
                                }
                            />
                            <CardContent>
                                <Show when={d.isEditing}>
                                    <Stack spacing={2}>
                                        <TextField
                                            label={t("common.name")}
                                            value={d.draft.name}
                                            onChange={(e) =>
                                                d.setDraft((c) => ({ ...c, name: e.target.value }))
                                            }
                                            fullWidth
                                        />
                                        <TextField
                                            label={t("common.description")}
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
                                        {clinic.description || t("clinicDetails.noDescription")}
                                    </Typography>
                                </Show>
                            </CardContent>
                        </Card>
                        <Card sx={{ borderRadius: 4 }} id="clinic-contact">
                            <CardHeader title={t("clinicDetails.contactAndHours")} />
                            <CardContent>
                                <Grid container spacing={2}>
                                    {[
                                        {
                                            label: t("common.phone"),
                                            field: "phoneNumber" as const,
                                            value: clinic.phoneNumber,
                                        },
                                        {
                                            label: t("common.email"),
                                            field: "email" as const,
                                            value: clinic.email,
                                        },
                                        {
                                            label: t("clinicDetails.openingHours"),
                                            field: "openingHours" as const,
                                            value: clinic.openingHours,
                                            multiline: true,
                                            minRows: 3,
                                        },
                                        {
                                            label: t("common.address"),
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
                                                    value={f.value || t("common.noData")}
                                                />
                                            </Show>
                                        </Grid>
                                    ))}
                                    <Grid item xs={12} md={6}>
                                        <Show when={d.isEditing}>
                                            <FormControl fullWidth>
                                                <InputLabel id="clinic-city-label">
                                                    {t("common.city")}
                                                </InputLabel>
                                                <Select
                                                    labelId="clinic-city-label"
                                                    label={t("common.city")}
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
                                            <InfoBlock
                                                label={t("common.city")}
                                                value={clinic.city}
                                            />
                                        </Show>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <InfoBlock
                                            label={t("clinicDetails.voivodeship")}
                                            value={clinic.voivodeship}
                                        />
                                    </Grid>
                                    <Show when={d.isEditing}>
                                        <Grid item xs={12}>
                                            <TextField
                                                label={t("clinicDetails.mapAddressField")}
                                                helperText={t("clinicDetails.mapAddressHelper")}
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
                                            {t("clinicDetails.cancel")}
                                        </Button>
                                        <Button
                                            variant="contained"
                                            onClick={d.handleSave}
                                            disabled={d.updateMutation.isPending}
                                        >
                                            {d.updateMutation.isPending
                                                ? t("common.saving")
                                                : t("clinicDetails.saveChanges")}
                                        </Button>
                                    </Stack>
                                </Show>
                            </CardContent>
                        </Card>
                        <Card sx={{ borderRadius: 4 }}>
                            <CardHeader title={t("clinicDetails.map")} />
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
                                        <Typography fontWeight={700}>
                                            {t("clinicDetails.mapPreview")}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            textAlign="center"
                                        >
                                            {t("clinicDetails.mapInfo")}
                                        </Typography>
                                    </Stack>
                                </Box>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="body2" color="text.secondary">
                                    {t("clinicDetails.mapAddress")}:{" "}
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
                            <CardHeader
                                title={`${t("clinicDetails.doctors")} (${clinic.doctors.length})`}
                            />
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
                                                        label={t("clinicDetails.owner")}
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
                        {t("clinicDetails.joinRequest")}
                    </Typography>
                    <Show when={d.requestSent}>
                        <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                            {t("clinicDetails.requestSent")}
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
