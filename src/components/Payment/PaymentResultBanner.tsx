import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { checkPaymentStatus } from "../../api/paymentApi";

interface Props {
    appointmentId: number;
    onRetry: () => void;
}

export const PaymentResultBanner = ({ appointmentId, onRetry }: Props) => {
    const { t } = useTranslation();
    const [status, setStatus] = useState<"LOADING" | "SUCCESS" | "FAILED">("LOADING");

    useEffect(() => {
        let isMounted = true;

        const verify = async () => {
            try {
                const data = await checkPaymentStatus(appointmentId);
                if (!isMounted) return;

                if (data.isPaid) {
                    setStatus("SUCCESS");
                } else if (
                    data.status === "CANCELED" ||
                    data.status === "REJECTED" ||
                    data.status === "FAILED"
                ) {
                    setStatus("FAILED");
                } else {
                    setStatus("LOADING");
                }
            } catch (error) {
                console.error(t("payment.networkError"), error);
                if (isMounted) setStatus("FAILED");
            }
        };

        verify();
        return () => {
            isMounted = false;
        };
    }, [appointmentId, t]);

    if (status === "LOADING") {
        return (
            <div
                style={{
                    padding: "15px",
                    backgroundColor: "#fff3cd",
                    color: "#856404",
                    borderRadius: "8px",
                    border: "1px solid #ffeeba",
                }}
            >
                <h4 style={{ margin: "0 0 10px 0" }}>{t("payment.awaitingPayment")}</h4>
                <p style={{ margin: "0 0 15px 0" }}>{t("payment.awaitingPaymentDesc")}</p>

                <button
                    onClick={onRetry}
                    style={{
                        padding: "8px 15px",
                        backgroundColor: "#ffc107",
                        color: "#212529",
                        border: "1px solid #d39e00",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontWeight: "bold",
                    }}
                >
                    {t("payment.retryPaymentBtn")}
                </button>
            </div>
        );
    }

    if (status === "SUCCESS") {
        return (
            <div
                style={{
                    padding: "15px",
                    backgroundColor: "#d4edda",
                    color: "#155724",
                    borderRadius: "8px",
                    border: "1px solid #c3e6cb",
                }}
            >
                <h4 style={{ margin: "0 0 10px 0" }}>{t("payment.paymentConfirmed")}</h4>
                <p style={{ margin: 0 }}>{t("payment.paymentConfirmedDesc")}</p>
            </div>
        );
    }

    if (status === "FAILED") {
        return (
            <div
                style={{
                    padding: "15px",
                    backgroundColor: "#f8d7da",
                    color: "#721c24",
                    borderRadius: "8px",
                    border: "1px solid #f5c6cb",
                }}
            >
                <h4 style={{ margin: "0 0 10px 0" }}>{t("payment.paymentRejected")}</h4>
                <p style={{ margin: "0 0 15px 0" }}>{t("payment.paymentRejectedDesc")}</p>
                <button
                    onClick={onRetry}
                    style={{
                        padding: "10px 15px",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontWeight: "bold",
                    }}
                >
                    {t("payment.retryPaymentAgain")}
                </button>
            </div>
        );
    }

    return null;
};
