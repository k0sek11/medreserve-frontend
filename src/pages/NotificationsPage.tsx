import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Stack,
    Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { notificationsApi } from "../api/notifications";

const NotificationsPage = () => {
    const [searchParams] = useSearchParams();
    const queryClient = useQueryClient();
    const clinicIdParam = searchParams.get("clinicId");
    const clinicId = clinicIdParam ? Number(clinicIdParam) : undefined;
    const effectiveClinicId =
        clinicId !== undefined && Number.isFinite(clinicId) ? clinicId : undefined;

    const { data: notifications = [], isLoading } = useQuery({
        queryKey: ["clinic-join-requests", effectiveClinicId],
        queryFn: () => notificationsApi.getClinicJoinRequests(effectiveClinicId),
    });

    const acceptMutation = useMutation({
        mutationFn: (notificationId: number) =>
            notificationsApi.acceptClinicJoinRequest(notificationId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ["clinic-join-requests", effectiveClinicId],
            });
        },
    });

    const rejectMutation = useMutation({
        mutationFn: (notificationId: number) =>
            notificationsApi.rejectClinicJoinRequest(notificationId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ["clinic-join-requests", effectiveClinicId],
            });
        },
    });

    const title = useMemo(() => {
        if (effectiveClinicId) {
            return "Powiadomienia dla przychodni";
        }

        return "Powiadomienia";
    }, [effectiveClinicId]);

    return (
        <Box sx={{ py: { xs: 2, md: 4 } }}>
            <Stack spacing={0.8} sx={{ mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: "#11223a" }}>
                    {title}
                </Typography>
                <Typography sx={{ color: "#4f627a" }}>
                    Lista próśb o dołączenie od lekarzy.
                </Typography>
            </Stack>

            {isLoading ? <PaperLikeLoading /> : null}

            {!isLoading && notifications.length === 0 ? (
                <Alert severity="info" sx={{ mb: 2 }}>
                    Brak nowych próśb o dołączenie.
                </Alert>
            ) : null}

            <Stack spacing={2}>
                {notifications.map((notification) => (
                    <Card
                        key={notification.notificationId}
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
                                            sx={{ fontWeight: 800, color: "#11223a", fontSize: 20 }}
                                        >
                                            {notification.clinicName}
                                        </Typography>
                                        <Typography sx={{ color: "#4f627a" }}>
                                            {notification.requesterName}
                                        </Typography>
                                    </Box>

                                    <Chip
                                        label={notification.status}
                                        sx={{
                                            bgcolor:
                                                notification.status === "Pending"
                                                    ? "#fff3cd"
                                                    : "#eef6ff",
                                            color: "#11223a",
                                            fontWeight: 700,
                                        }}
                                    />
                                </Stack>

                                {notification.message ? (
                                    <Alert severity="info">{notification.message}</Alert>
                                ) : null}

                                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                                    <Button
                                        variant="contained"
                                        disabled={
                                            notification.status !== "Pending" ||
                                            acceptMutation.isPending
                                        }
                                        onClick={() =>
                                            acceptMutation.mutate(notification.notificationId)
                                        }
                                        sx={{ textTransform: "none" }}
                                    >
                                        Akceptuj
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        disabled={
                                            notification.status !== "Pending" ||
                                            rejectMutation.isPending
                                        }
                                        onClick={() =>
                                            rejectMutation.mutate(notification.notificationId)
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
            </Stack>
        </Box>
    );
};

const PaperLikeLoading = () => (
    <Box
        sx={{
            minHeight: 220,
            display: "grid",
            placeItems: "center",
            border: "1px dashed #b8c8de",
            borderRadius: 2,
            mb: 2,
        }}
    >
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <CircularProgress size={20} />
            <Typography sx={{ color: "#4f627a" }}>Ladowanie powiadomien...</Typography>
        </Stack>
    </Box>
);

export default NotificationsPage;
