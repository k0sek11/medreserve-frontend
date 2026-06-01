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