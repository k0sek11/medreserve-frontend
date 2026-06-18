import {
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Chip,
    CircularProgress,
    Grid,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { Navigate, Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useClinicDetails } from "../hooks/useClinicDetails";
import { InfoBlock } from "../components/shared/InfoBlock";
import { ClinicHeroBanner } from "../components/clinic/ClinicHeroBanner";
import { JoinRequestDialog } from "../components/clinic/JoinRequestDialog";
import { MapLocationPicker } from "../components/shared/MapLocationPicker";
import { LeafletMap } from "../components/shared/LeafletMap";
import { Show } from "../components/shared/ShowHide";

export default function ClinicDetailsPage() {
    const { t } = useTranslation();
    const d = useClinicDetails();

    if (!d.isValid) return <Navigate to="/poradnie" replace />;
    if (d.clinicQuery.isLoading) {
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
    const fullAddress = clinic.city || clinic.streetAddress;
    const googleMapsUrl =
        clinic.latitude && clinic.longitude
            ? `https://www.google.com/maps?q=${clinic.latitude},${clinic.longitude}`
            : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;

    return (
        <Box sx={{ maxWidth: 1200, mx: "auto", py: { xs: 2, md: 4 }, px: { xs: 2, md: 0 } }}>
            <ClinicHeroBanner clinic={clinic} isOwner={d.isOwner} />
            <Stack spacing={3}>
                <Card sx={{ borderRadius: 4 }}>
                    <CardHeader
                        title={t("clinicDetails.about")}
                        action={
                            d.isOwner && !d.isEditing ? (
                                <Button variant="text" onClick={() => d.setIsEditing()}>
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
                                    {...d.register("name")}
                                    error={!!d.errors.name}
                                    helperText={
                                        d.errors.name?.message
                                            ? t(d.errors.name.message)
                                            : undefined
                                    }
                                    fullWidth
                                />
                                <TextField
                                    label={t("common.description")}
                                    {...d.register("description")}
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
                            ].map((f) => (
                                <Grid sx={{ width: { xs: "100%", md: "50%" } }} key={f.label}>
                                    <Show when={d.isEditing}>
                                        <TextField
                                            label={f.label}
                                            {...d.register(f.field)}
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
                        </Grid>

                        <Show when={d.isEditing}>
                            <Box sx={{ mt: 2 }}>
                                <MapLocationPicker
                                    label={t("createClinic.location")}
                                    lat={d.watch("lat")}
                                    lng={d.watch("lng")}
                                    city={d.watch("city")}
                                    onChange={d.setLocation}
                                    height={250}
                                />
                            </Box>
                        </Show>
                        <Show when={!d.isEditing}>
                            <Grid sx={{ width: { xs: "100%", md: "50%" } }}>
                                <InfoBlock
                                    label={t("common.address")}
                                    value={fullAddress || t("common.noData")}
                                />
                            </Grid>
                        </Show>

                        <Show when={d.isEditing}>
                            <Stack
                                direction={{ xs: "column", sm: "row" }}
                                spacing={1.5}
                                sx={{ justifyContent: "flex-end", mt: 3 }}
                            >
                                <Button variant="text" onClick={d.cancelEditing}>
                                    {t("clinicDetails.cancel")}
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={d.handleSave}
                                    disabled={d.updateMutation.isPending || d.isSubmitting}
                                >
                                    {d.updateMutation.isPending || d.isSubmitting
                                        ? t("common.saving")
                                        : t("clinicDetails.saveChanges")}
                                </Button>
                            </Stack>
                        </Show>
                    </CardContent>
                </Card>
                <Card sx={{ borderRadius: 4 }}>
                    <CardHeader
                        title={t("clinicDetails.map")}
                        action={
                            <Button
                                variant="outlined"
                                size="small"
                                href={googleMapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ textTransform: "none" }}
                            >
                                {t("clinicDetails.openInGoogleMaps")}
                            </Button>
                        }
                    />
                    <CardContent>
                        <LeafletMap
                            lat={clinic.latitude}
                            lng={clinic.longitude}
                            address={fullAddress}
                            height={300}
                        />
                    </CardContent>
                </Card>
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
                                        component={RouterLink}
                                        to={`/lekarze/${doc.doctorId}`}
                                        sx={{
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            textDecoration: "none",
                                            color: "inherit",
                                            "&:hover": { opacity: 0.85 },
                                        }}
                                    >
                                        <Box>
                                            <Typography fontWeight={700}>{doc.fullName}</Typography>
                                            <Typography variant="body2" color="text.secondary">
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
