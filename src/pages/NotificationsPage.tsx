import {
    alpha,
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    Stack,
    Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNotificationsPage } from "../hooks/useNotificationsPage";
import { SectionTitle } from "../components/shared/SectionTitle";
import { PaperLikeLoading } from "../components/shared/PaperLikeLoading";

const NotificationsPage = () => {
    const { t } = useTranslation();
    const n = useNotificationsPage();

    return (
        <Box sx={{ py: { xs: 2, md: 4 } }}>
            <Stack spacing={0.8} sx={{ mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: "text.primary" }}>
                    {n.title}
                </Typography>
                <Typography sx={{ color: "text.secondary" }}>
                    {t("notifications.subtitle")}
                </Typography>
            </Stack>
            <Stack spacing={3}>
                <Box>
                    <SectionTitle title={t("notifications.clinicRequests")} />
                    {n.isClinicLoading && <PaperLikeLoading />}
                    {n.clinicNotifications.map((n2) => (
                        <Card
                            key={n2.notificationId}
                            elevation={0}
                            sx={{
                                border: (t) => `1px solid ${t.palette.divider}`,
                                borderRadius: 2,
                            }}
                        >
                            <CardContent>
                                <Stack spacing={1.5}>
                                    <Stack
                                        direction="row"
                                        sx={{
                                            justifyContent: "space-between",
                                            flexWrap: "wrap",
                                            gap: 1,
                                        }}
                                    >
                                        <Box>
                                            <Typography
                                                sx={{
                                                    fontWeight: 800,
                                                    color: "text.primary",
                                                    fontSize: 20,
                                                }}
                                            >
                                                {n2.clinicName}
                                            </Typography>
                                            <Typography sx={{ color: "text.secondary" }}>
                                                {n2.requesterName}
                                            </Typography>
                                        </Box>
                                        <Chip
                                            label={n2.status}
                                            sx={(t) => ({
                                                bgcolor:
                                                    n2.status === "Pending"
                                                        ? t.palette.warning.light
                                                        : alpha(t.palette.primary.main, 0.1),
                                                color: "text.primary",
                                                fontWeight: 700,
                                            })}
                                        />
                                    </Stack>
                                    {n2.message && <Alert severity="info">{n2.message}</Alert>}
                                    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                                        <Button
                                            variant="contained"
                                            disabled={
                                                n2.status !== "Pending" ||
                                                n.acceptClinicMutation.isPending
                                            }
                                            onClick={() =>
                                                n.acceptClinicMutation.mutate(n2.notificationId)
                                            }
                                            sx={{ textTransform: "none" }}
                                        >
                                            {t("notifications.accept")}
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            disabled={
                                                n2.status !== "Pending" ||
                                                n.rejectClinicMutation.isPending
                                            }
                                            onClick={() =>
                                                n.rejectClinicMutation.mutate(n2.notificationId)
                                            }
                                            sx={{ textTransform: "none" }}
                                        >
                                            {t("notifications.reject")}
                                        </Button>
                                    </Stack>
                                </Stack>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
                {n.user?.doctorProfileId && (
                    <Box>
                        <Divider sx={{ my: 1 }} />
                        <SectionTitle title={t("notifications.appointments")} />
                        {n.isAppointmentLoading && <PaperLikeLoading />}
                        {n.appointmentNotifications.map((a) => (
                            <Card
                                key={a.notificationId}
                                elevation={0}
                                sx={{
                                    border: (t) => `1px solid ${t.palette.divider}`,
                                    borderRadius: 2,
                                }}
                            >
                                <CardContent>
                                    <Stack spacing={1.5}>
                                        <Stack
                                            direction="row"
                                            sx={{
                                                justifyContent: "space-between",
                                                flexWrap: "wrap",
                                                gap: 1,
                                            }}
                                        >
                                            <Box>
                                                <Typography
                                                    sx={{
                                                        fontWeight: 800,
                                                        color: "text.primary",
                                                        fontSize: 20,
                                                    }}
                                                >
                                                    {a.patientName}
                                                </Typography>
                                                <Typography sx={{ color: "text.secondary" }}>
                                                    {a.appointmentType ?? t("common.unknown")} •{" "}
                                                    {a.date} • {a.startTime}
                                                </Typography>
                                            </Box>
                                            <Chip
                                                label={a.notificationStatus}
                                                sx={(t) => ({
                                                    bgcolor: alpha(t.palette.primary.main, 0.1),
                                                    color: "text.primary",
                                                    fontWeight: 700,
                                                })}
                                            />
                                        </Stack>
                                        {a.message && <Alert severity="info">{a.message}</Alert>}
                                    </Stack>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                )}
            </Stack>
        </Box>
    );
};

export default NotificationsPage;
