import { Alert, Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useConfirmation } from "../hooks/useConfirmation";
import { statusColors } from "../lib/appointmentStatus";
import { getAppointmentDoctorName, getAppointmentSpecialization } from "../lib/appointmentHelpers";
import { SummaryCard } from "../components/shared/SummaryCard";

const AppointmentConfirmationPage = () => {
    const { t } = useTranslation();
    const c = useConfirmation();

    if (!c.hasValidId) return <ErrorScreen icon="🤷‍♂️" title={t("confirmation.invalidId")} />;
    if (c.isLoading) return <LoadingScreen t={t} />;
    if (!c.appointment) return <ErrorScreen icon="❌" title={t("confirmation.loadError")} />;

    const a = c.appointment;

    return (
        <Box sx={{ py: { xs: 2, md: 4 }, display: "flex", justifyContent: "center" }}>
            <Paper
                elevation={0}
                sx={{
                    maxWidth: 672,
                    width: "100%",
                    borderRadius: 4,
                    border: (t) => `1px solid ${t.palette.divider}`,
                    p: { xs: 3, md: 5 },
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                <Box
                    sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        bgcolor: "primary.main",
                    }}
                />
                <Stack spacing={4}>
                    <Box sx={{ textAlign: "center", mt: 2 }}>
                        <Box
                            sx={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: 80,
                                height: 80,
                                bgcolor: (t) =>
                                    t.palette.mode === "dark" ? "rgba(52,211,153,0.15)" : "#ecfdf5",
                                borderRadius: "50%",
                                mb: 2,
                            }}
                        >
                            <Typography sx={{ fontSize: 40 }}>
                                {a.status === "Confirmed" ? "✅" : "⏳"}
                            </Typography>
                        </Box>
                        <Typography
                            variant="h4"
                            sx={{ fontWeight: 800, color: "text.primary", mb: 1 }}
                        >
                            {c.title}
                        </Typography>
                        <Typography sx={{ color: "text.secondary" }}>
                            {t("confirmation.subtitle")}
                        </Typography>
                    </Box>

                    <Stack direction="row" sx={{ justifyContent: "center" }}>
                        <Chip
                            label={`${t("confirmation.statusPrefix")}: ${t(`appointmentStatus.${a.status}`, a.status)}`}
                            color={statusColors[a.status] ?? "default"}
                            sx={{
                                fontWeight: 800,
                                fontSize: "0.9rem",
                                px: 2,
                                py: 2.5,
                                borderRadius: "16px",
                            }}
                        />
                    </Stack>

                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                            gap: { xs: 2, sm: 3 },
                            bgcolor: (t) =>
                                t.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "grey.50",
                            p: { xs: 2, sm: 3 },
                            borderRadius: 3,
                            border: (t) => `1px solid ${t.palette.divider}`,
                        }}
                    >
                        <SummaryCard
                            label={t("confirmation.appointmentNumber")}
                            value={`#${a.appointmentId}`}
                        />
                        <SummaryCard
                            label={t("confirmation.doctor")}
                            value={getAppointmentDoctorName(a)}
                        />
                        <SummaryCard
                            label={t("confirmation.specialization")}
                            value={getAppointmentSpecialization(a)}
                        />
                        <SummaryCard label={t("confirmation.date")} value={a.date} />
                        <SummaryCard
                            label={t("confirmation.time")}
                            value={`${a.startTime} - ${a.endTime}`}
                        />
                    </Box>

                    <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={2}
                        sx={{ pt: 2, justifyContent: "center" }}
                    >
                        <Button
                            component={RouterLink}
                            to="/moje-wizyty"
                            variant="contained"
                            disableElevation
                            sx={{
                                textTransform: "none",
                                fontWeight: 700,
                                borderRadius: "12px",
                                px: 4,
                                py: 1.5,
                            }}
                        >
                            {t("confirmation.goToAppointments")}
                        </Button>
                        <Button
                            component={RouterLink}
                            to="/lekarze"
                            variant="outlined"
                            sx={{
                                textTransform: "none",
                                fontWeight: 700,
                                borderRadius: "12px",
                                px: 4,
                                py: 1.5,
                            }}
                        >
                            {t("confirmation.bookAnother")}
                        </Button>
                    </Stack>
                </Stack>
            </Paper>
        </Box>
    );
};

const ErrorScreen = ({ icon, title }: { icon: string; title: string }) => (
    <Box sx={{ py: { xs: 2, md: 4 }, display: "flex", justifyContent: "center" }}>
        <Paper
            elevation={0}
            sx={{
                maxWidth: 448,
                width: "100%",
                p: 4,
                borderRadius: 3,
                border: (t) => `1px solid ${t.palette.divider}`,
                textAlign: "center",
            }}
        >
            <Typography sx={{ fontSize: 48, mb: 2 }}>{icon}</Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "text.primary" }}>
                {title}
            </Typography>
        </Paper>
    </Box>
);

const LoadingScreen = ({ t }: { t: (key: string) => string }) => (
    <Box sx={{ py: { xs: 2, md: 4 }, display: "flex", justifyContent: "center" }}>
        <Paper
            elevation={0}
            sx={{
                maxWidth: 576,
                width: "100%",
                p: 4,
                borderRadius: 3,
                border: (t) => `1px solid ${t.palette.divider}`,
            }}
        >
            <Alert severity="info" sx={{ borderRadius: "12px" }}>
                {t("confirmation.loadingInfo")}
            </Alert>
        </Paper>
    </Box>
);

export default AppointmentConfirmationPage;
