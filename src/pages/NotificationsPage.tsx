import {
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
import { useNotificationsPage } from "../hooks/useNotificationsPage";
import { SectionTitle } from "../components/shared/SectionTitle";
import { PaperLikeLoading } from "../components/shared/PaperLikeLoading";

const NotificationsPage = () => {
    const n = useNotificationsPage();

    return (
        <Box sx={{ py: { xs: 2, md: 4 } }}>
            <Stack spacing={0.8} sx={{ mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: "#11223a" }}>
                    {n.title}
                </Typography>
                <Typography sx={{ color: "#4f627a" }}>
                    Powiadomienia o zaproszeniach do poradni i nowych wizytach.
                </Typography>
            </Stack>
            <Stack spacing={3}>
                <Box>
                    <SectionTitle title="Prośby o dołączenie do poradni" />
                    {n.isClinicLoading && <PaperLikeLoading />}
                    {n.clinicNotifications.map((n2) => (
                        <Card
                            key={n2.notificationId}
                            elevation={0}
                            sx={{ border: "1px solid #dce5f2", borderRadius: 2 }}
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
                                                    color: "#11223a",
                                                    fontSize: 20,
                                                }}
                                            >
                                                {n2.clinicName}
                                            </Typography>
                                            <Typography sx={{ color: "#4f627a" }}>
                                                {n2.requesterName}
                                            </Typography>
                                        </Box>
                                        <Chip
                                            label={n2.status}
                                            sx={{
                                                bgcolor:
                                                    n2.status === "Pending" ? "#fff3cd" : "#eef6ff",
                                                color: "#11223a",
                                                fontWeight: 700,
                                            }}
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
                                            Akceptuj
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
                                            Odrzuć
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
                        <SectionTitle title="Wizyty" />
                        {n.isAppointmentLoading && <PaperLikeLoading />}
                        {n.appointmentNotifications.map((a) => (
                            <Card
                                key={a.notificationId}
                                elevation={0}
                                sx={{ border: "1px solid #dce5f2", borderRadius: 2 }}
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
                                                        color: "#11223a",
                                                        fontSize: 20,
                                                    }}
                                                >
                                                    {a.patientName}
                                                </Typography>
                                                <Typography sx={{ color: "#4f627a" }}>
                                                    {a.appointmentType ?? "Nieznane"} • {a.date} •{" "}
                                                    {a.startTime}
                                                </Typography>
                                            </Box>
                                            <Chip
                                                label={a.notificationStatus}
                                                sx={{
                                                    bgcolor: "#eef6ff",
                                                    color: "#11223a",
                                                    fontWeight: 700,
                                                }}
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
