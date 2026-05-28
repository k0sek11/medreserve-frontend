import { Alert, Box, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { Link as RouterLink } from "react-router-dom";
import { appointmentsApi } from "../api/appointments";

const statusColors: Record<string, "default" | "primary" | "success" | "error" | "warning"> = {
  Pending: "warning",
  Confirmed: "success",
  Cancelled: "error",
};

const MyAppointmentsPage = () => {
  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["my-appointments"],
    queryFn: () => appointmentsApi.mine(),
  });

  return (
    <Box sx={{ py: { xs: 2, md: 4 } }}>
      <Stack spacing={0.8} sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: "#11223a" }}>
          Moje wizyty
        </Typography>
        <Typography sx={{ color: "#4f627a" }}>
          Tutaj widać wszystkie twoje wizyty i ich aktualny status.
        </Typography>
      </Stack>

      {isLoading ? (
        <Alert severity="info">Ładowanie wizyt...</Alert>
      ) : null}

      {!isLoading && appointments.length === 0 ? (
        <Alert severity="info">Nie masz jeszcze żadnych wizyt.</Alert>
      ) : null}

      <Stack spacing={2}>
        {appointments.map((appointment) => (
          <Card key={appointment.appointmentId} elevation={0} sx={{ border: "1px solid #dce5f2", borderRadius: 2 }}>
            <CardContent>
              <Stack spacing={1.3}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
                >
                  <Box>
                    <Typography sx={{ fontWeight: 800, color: "#11223a", fontSize: 20 }}>
                      {appointment.doctorName}
                    </Typography>
                    <Typography sx={{ color: "#4f627a" }}>
                      {appointment.appointmentType} • {appointment.doctorSpecialization || "Brak specjalizacji"}
                    </Typography>
                  </Box>

                  <Chip
                    label={appointment.status}
                    color={statusColors[appointment.status] ?? "default"}
                    sx={{ fontWeight: 700 }}
                  />
                </Stack>

                <Typography sx={{ color: "#23354d" }}>
                  {appointment.date} • {appointment.startTime} - {appointment.endTime}
                </Typography>

                <Stack direction="row" spacing={1.2}>
                  <Typography
                    component={RouterLink}
                    to={`/wizyty/potwierdzenie/${appointment.appointmentId}`}
                    sx={{ color: "#0b74c9", textDecoration: "none", fontWeight: 700 }}
                  >
                    Zobacz podsumowanie
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
};

export default MyAppointmentsPage;
