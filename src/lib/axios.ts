import axios from "axios";

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? "",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            const message =
                error.response.data?.message ||
                error.response.data?.title ||
                `Request failed with status ${error.response.status}`;
            error.message = message;
        } else if (error.request) {
            error.message = "No response from server. Check your connection.";
        }
        return Promise.reject(error);
    },
);
