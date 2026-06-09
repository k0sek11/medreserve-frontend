import { api } from "../lib/axios";

const BASE = "/api/payments";

export const confirmOfflinePayment = async ({
    paymentId,
    comment,
}: {
    paymentId: number;
    comment?: string;
}) => {
    const response = await api.post(`${BASE}/${paymentId}/confirm-offline`, {
        comment: comment || null,
    });
    return response.data;
};

export const initPayuPayment = async (appointmentId: number) => {
    const response = await api.post(`${BASE}/init-payu`, { appointmentId });
    return response.data;
};

export const createOfflinePaymentIntent = async (appointmentId: number) => {
    const response = await api.post(`${BASE}/init-offline`, { appointmentId });
    return response.data;
};

export const checkPaymentStatus = async (appointmentId: number) => {
    const response = await api.post(`/api/payments/check-status/${appointmentId}`);
    return response.data;
};
