import { api } from "../lib/axios";

api.defaults.withCredentials = true;

const BASE_URL = 'http://localhost:5000/api/payments';

 export const confirmOfflinePayment = async ({ paymentId, comment }: { paymentId: number, comment?: string }) => {
  const response = await api.post(`${BASE_URL}/${paymentId}/confirm-offline`, {
    comment: comment || null
  });
  return response.data;
};

 export const initPayuPayment = async (appointmentId: number) => {
  const response = await api.post(`${BASE_URL}/init-payu`, { appointmentId });
  return response.data; 
 };
 export const createOfflinePaymentIntent = async (appointmentId: number) => {
  const response = await api.post(`${BASE_URL}/init-offline`, { appointmentId });
  return response.data;
};
// api/paymentApi.ts (dodaj na końcu)

export const checkPaymentStatus = async (appointmentId: number) => {
  // Zakładam, że masz skonfigurowaną instancję axiosa np. jako 'api' lub używasz fetch
  // Jeśli używasz axiosa, zrób: const response = await axios.post(`/api/payments/check-status/${appointmentId}`);
  const response = await fetch(`/api/payments/check-status/${appointmentId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${token}` // Pamiętaj o tokenie, jeśli fetch tego nie robi z automatu
    }
  });

  if (!response.ok) {
    throw new Error('Błąd podczas sprawdzania statusu płatności');
  }

  return response.json(); // Zwróci { isPaid: boolean, status: string }
};