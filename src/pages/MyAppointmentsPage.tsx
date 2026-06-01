import { useState, useEffect } from "react"; 
import { Alert, Box, Card, CardContent, Chip, Stack, Typography, Button, Dialog } from "@mui/material"; 
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link as RouterLink } from "react-router-dom";
import { appointmentsApi } from "../api/appointments";
import { PaymentCheckout } from "../components/Payment/PaymentCheckout";

const statusColors: Record<string, "default" | "primary" | "success" | "error" | "warning"> = {
  Pending: "warning",
  Confirmed: "success",
  Cancelled: "error",
};

const MyAppointmentsPage = () => {
  const queryClient = useQueryClient();

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["my-appointments"],
    queryFn: () => appointmentsApi.mine(),
  });

  useEffect(() => {
    const autoCheckPayments = async () => {
      const pendingPayUAppointments = appointments.filter(
        (a) => a.paymentStatus === "Pending" && a.paymentMethod === "PayU"
      );

      for (const app of pendingPayUAppointments) {
        try {
          const result = await appointmentsApi.checkPaymentStatus(app.appointmentId);
          
          if (result.isPaid) {
            queryClient.invalidateQueries({ queryKey: ["my-appointments"] });
          }
        } catch (error) {
          console.error("Automatyczna weryfikacja płatności nie powiodła się:", error);
        }
      }
    };

    if (appointments.length > 0) {
      autoCheckPayments();
    }
  }, [appointments, queryClient]);

  const handleOpenPayment = (appointmentId: number) => {
    setSelectedAppointmentId(appointmentId);
    setIsPaymentModalOpen(true);
  };

  const selectedAppointment = appointments.find(
    (a) => a.appointmentId === selectedAppointmentId
  );

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

      {isLoading && <Alert severity="info">Ładowanie wizyt...</Alert>}
      {!isLoading && appointments.length === 0 && (
        <Alert severity="info">Nie masz jeszcze żadnych wizyt.</Alert>
      )}

      <Stack spacing={2}>
        {appointments.map((appointment) => (
          <Card key={appointment.appointmentId} elevation={0} sx={{ border: "1px solid #dce5f2", borderRadius: 2 }}>
            <CardContent>
              <Stack spacing={1.3}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}>
                  <Box>
                    <Typography sx={{ fontWeight: 800, color: "#11223a", fontSize: 20 }}>
                      {appointment.doctorName}
                    </Typography>
                    <Typography sx={{ color: "#4f627a" }}>
                      {appointment.appointmentType ?? "Nieznane"} • {appointment.doctorSpecialization || "Brak specjalizacji"}
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
                
                <Stack direction="row" spacing={2} sx={{ alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                  <Typography
                    component={RouterLink}
                    to={`/wizyty/potwierdzenie/${appointment.appointmentId}`}
                    sx={{ color: "#0b74c9", textDecoration: "none", fontWeight: 700 }}
                  >
                    Zobacz podsumowanie
                  </Typography>

                  {appointment.status !== "Cancelled" ? (
                    <>
                      {appointment.paymentStatus === 'Paid' && (
                        <Chip label="✅ Opłacono" color="success" size="small" sx={{ fontWeight: 'bold' }} />
                      )}

                      {appointment.paymentStatus === 'Pending' && appointment.paymentMethod === 'Offline' && (
                        <Chip label="⏳ Do zapłaty w gabinecie" color="warning" size="small" sx={{ fontWeight: 'bold' }} />
                      )}

                      {appointment.paymentStatus === 'Pending' && appointment.paymentMethod === 'PayU' && (
                        <Chip 
                          label="⏳ Automatyczna weryfikacja PayU..." 
                          color="warning" 
                          variant="outlined" 
                          size="small" 
                          sx={{ fontWeight: 'bold' }} 
                        />
                      )}

                      {!appointment.paymentStatus && (
                        <Button 
                          variant="contained" 
                          color="success" 
                          size="small" 
                          onClick={() => handleOpenPayment(appointment.appointmentId)}
                          sx={{ fontWeight: 700 }}
                        >
                          💳 Opłać wizytę
                        </Button>
                      )}
                    </>
                  ) : null}
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Dialog 
        open={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedAppointmentId && (
          <PaymentCheckout 
            appointmentId={selectedAppointmentId} 
            amount={selectedAppointment?.price ?? 0} 
            onSuccessClose={() => setIsPaymentModalOpen(false)} 
          />
        )}
      </Dialog>
    </Box>
  );
};

export default MyAppointmentsPage;