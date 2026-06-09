import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import "./lib/dayjsLocale";
import "./i18n";
import "./index.css";
import App from "./App.tsx";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "./context/AuthContext";

const queryClient = new QueryClient();
const theme = createTheme({
    components: {
        MuiTimePicker: {
            defaultProps: {
                ampm: false,
            },
        },
        MuiDesktopTimePicker: {
            defaultProps: {
                ampm: false,
            },
        },
        MuiMobileTimePicker: {
            defaultProps: {
                ampm: false,
            },
        },
    },
});

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <App />
                </AuthProvider>
                <ReactQueryDevtools initialIsOpen={true} />
            </QueryClientProvider>
        </ThemeProvider>
    </StrictMode>,
);
