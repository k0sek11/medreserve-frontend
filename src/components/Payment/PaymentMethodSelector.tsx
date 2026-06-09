import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { initPayuPayment, createOfflinePaymentIntent } from "../../api/paymentApi";

interface Props {
    appointmentId: number;
    amount: number;
    onSuccessClose?: () => void;
}

export const PaymentMethodSelector = ({ appointmentId, amount, onSuccessClose }: Props) => {
    const [selectedMethod, setSelectedMethod] = useState<"PAYU" | "OFFLINE" | null>(null);
    const queryClient = useQueryClient();

    const payuMutation = useMutation({
        mutationFn: initPayuPayment,
        onSuccess: (data) => {
            window.location.href = data.redirectUri;
        },
        onError: () => alert("Wystąpił błąd podczas łączenia z systemem PayU."),
    });

    const offlineMutation = useMutation({
        mutationFn: createOfflinePaymentIntent,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["my-appointments"] });
            alert("Wybrano płatność na miejscu. Wizyta została zarezerwowana!");
            if (onSuccessClose) onSuccessClose();
        },
        onError: () => alert("Nie udało się zapisać wyboru płatności."),
    });

    const handlePaymentSubmit = () => {
        if (selectedMethod === "PAYU") {
            payuMutation.mutate(appointmentId);
        } else if (selectedMethod === "OFFLINE") {
            offlineMutation.mutate(appointmentId);
        }
    };

    const isLoading = payuMutation.isPending || offlineMutation.isPending;

    return (
        <div
            style={{
                maxWidth: "400px",
                padding: "20px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                backgroundColor: "#fff",
            }}
        >
            <h2 style={{ marginTop: "0" }}>Finalizacja płatności</h2>
            <p>
                Kwota do zapłaty:{" "}
                <strong style={{ fontSize: "18px", color: "#007bff" }}>
                    {amount.toFixed(2)} PLN
                </strong>
            </p>

            <div
                style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "20px" }}
            >
                {/* Opcja PayU */}
                <label
                    style={{
                        border: selectedMethod === "PAYU" ? "2px solid #007bff" : "1px solid #ccc",
                        padding: "15px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        backgroundColor: selectedMethod === "PAYU" ? "#f0f7ff" : "#fff",
                    }}
                >
                    <input
                        type="radio"
                        name="payMethod"
                        checked={selectedMethod === "PAYU"}
                        onChange={() => setSelectedMethod("PAYU")}
                    />
                    <strong>💳 Szybki przelew / BLIK (PayU)</strong>
                </label>

                <label
                    style={{
                        border:
                            selectedMethod === "OFFLINE" ? "2px solid #007bff" : "1px solid #ccc",
                        padding: "15px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        backgroundColor: selectedMethod === "OFFLINE" ? "#f0f7ff" : "#fff",
                    }}
                >
                    <input
                        type="radio"
                        name="payMethod"
                        checked={selectedMethod === "OFFLINE"}
                        onChange={() => setSelectedMethod("OFFLINE")}
                    />
                    <strong>🏥 Zapłacę na miejscu w gabinecie</strong>
                </label>
            </div>

            <button
                onClick={handlePaymentSubmit}
                disabled={!selectedMethod || isLoading}
                style={{
                    marginTop: "25px",
                    width: "100%",
                    padding: "12px",
                    backgroundColor: selectedMethod ? "#28a745" : "#ccc",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "16px",
                    fontWeight: "bold",
                    cursor: selectedMethod ? "pointer" : "not-allowed",
                }}
            >
                {isLoading
                    ? "Przetwarzanie..."
                    : selectedMethod === "PAYU"
                      ? "Przejdź do PayU"
                      : "Potwierdzam rezerwację"}
            </button>
        </div>
    );
};
