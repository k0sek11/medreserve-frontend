import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import {
    CssBaseline,
    GlobalStyles,
    ThemeProvider as MuiThemeProvider,
    createTheme,
    type PaletteMode,
} from "@mui/material";

type ThemeMode = PaletteMode;

interface ThemeContextValue {
    mode: ThemeMode;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "medreserve-theme-mode";

function getInitialMode(): ThemeMode {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "dark" || stored === "light") {
        return stored;
    }
    if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
        return "dark";
    }
    return "light";
}

function createAppTheme(mode: PaletteMode) {
    return createTheme({
        palette: {
            mode,
            primary: {
                main: mode === "light" ? "#0b74c9" : "#5badf5",
                dark: mode === "light" ? "#095fa6" : "#3d8bd0",
            },
            secondary: {
                main: mode === "light" ? "#f50057" : "#ff4081",
            },
            background: {
                default: mode === "light" ? "#f5f7fb" : "#121212",
                paper: mode === "light" ? "#ffffff" : "#1e1e1e",
            },
            text: {
                primary: mode === "light" ? "#11223a" : "#e0e0e0",
                secondary: mode === "light" ? "#4f627a" : "#a0aab4",
                disabled: mode === "light" ? "#71839a" : "#606870",
            },
            divider: mode === "light" ? "#dce5f2" : "rgba(255,255,255,0.12)",
        },
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
}

const globalDarkStyles = (
    <GlobalStyles
        styles={{
            ".dark": {
                colorScheme: "dark",
            },
        }}
    />
);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [mode, setMode] = useState<ThemeMode>(getInitialMode);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, mode);
        document.documentElement.classList.toggle("dark", mode === "dark");
    }, [mode]);

    const toggleTheme = useCallback(() => {
        setMode((prev) => (prev === "light" ? "dark" : "light"));
    }, []);

    const theme = useMemo(() => createAppTheme(mode), [mode]);
    const value = useMemo<ThemeContextValue>(() => ({ mode, toggleTheme }), [mode, toggleTheme]);

    return (
        <ThemeContext.Provider value={value}>
            <MuiThemeProvider theme={theme}>
                <CssBaseline />
                {mode === "dark" && globalDarkStyles}
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
};

export const useThemeMode = (): ThemeContextValue => {
    const ctx = useContext(ThemeContext);
    if (!ctx) {
        throw new Error("useThemeMode must be used within ThemeProvider");
    }
    return ctx;
};
