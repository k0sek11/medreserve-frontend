import {
    AppBar,
    Box,
    Button,
    Container,
    IconButton,
    Stack,
    Toolbar,
    Typography,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useAuthUser } from "../../hooks/useAuthUser";
import { authApi } from "../../api/auth";
import { authUserQueryKey } from "../../hooks/useAuthUser";
import { Link as RouterLink, NavLink, Outlet, useNavigate } from "react-router-dom";

const navLinks = [
    { to: "/", labelKey: "nav.home" },
    { to: "/lekarze", labelKey: "nav.doctors" },
    { to: "/wizyty", labelKey: "nav.myAppointments" },
    { to: "/poradnie", labelKey: "nav.clinics" },
    { to: "/o-nas", labelKey: "nav.about" },
    { to: "/kontakt", labelKey: "nav.contact" },
];

const MainLayout = () => {
    const { t, i18n } = useTranslation();
    const { data: user, isLoading } = useAuthUser();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const isDoctor = Boolean(user?.roles.includes("Doctor"));
    const visibleNavLinks = navLinks.filter((item) => {
        if (!isDoctor) {
            return true;
        }

        return !["/", "/lekarze", "/wizyty"].includes(item.to);
    });

    const logoutMutation = useMutation({
        mutationFn: () => authApi.logout(),
        onSuccess: async () => {
            queryClient.setQueryData(authUserQueryKey, null);
            await queryClient.invalidateQueries({ queryKey: authUserQueryKey });
            navigate("/login", { replace: true });
        },
    });

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fb" }}>
            <AppBar position="sticky" elevation={0} sx={{ bgcolor: "#0b74c9" }}>
                <Container maxWidth="xl">
                    <Toolbar disableGutters sx={{ minHeight: 72 }}>
                        <Typography
                            component={RouterLink}
                            to="/"
                            variant="h6"
                            sx={{
                                color: "white",
                                textDecoration: "none",
                                fontWeight: 700,
                                mr: 4,
                                letterSpacing: 0.4,
                            }}
                        >
                            {t("layout.brandName")}
                        </Typography>

                        <Stack direction="row" spacing={1} sx={{ flexGrow: 1 }}>
                            {visibleNavLinks.map((item) => (
                                <Button
                                    key={item.to}
                                    component={NavLink}
                                    to={item.to}
                                    sx={{
                                        color: "white",
                                        px: 1.5,
                                        fontSize: 14,
                                        fontWeight: 500,
                                        textTransform: "none",
                                        borderBottom: "2px solid transparent",
                                        borderRadius: 0,
                                        "&.active": {
                                            borderBottomColor: "white",
                                        },
                                    }}
                                >
                                    {t(item.labelKey)}
                                </Button>
                            ))}

                            {!isLoading && user?.doctorProfileId ? (
                                <>
                                    <Button
                                        component={NavLink}
                                        to="/moj-profil"
                                        sx={{
                                            color: "white",
                                            px: 1.5,
                                            fontSize: 14,
                                            fontWeight: 500,
                                            textTransform: "none",
                                            borderBottom: "2px solid transparent",
                                            borderRadius: 0,
                                            "&.active": {
                                                borderBottomColor: "white",
                                            },
                                        }}
                                    >
                                        {t("nav.profile")}
                                    </Button>
                                    <Button
                                        component={NavLink}
                                        to="/moje-przychodnie"
                                        sx={{
                                            color: "white",
                                            px: 1.5,
                                            fontSize: 14,
                                            fontWeight: 500,
                                            textTransform: "none",
                                            borderBottom: "2px solid transparent",
                                            borderRadius: 0,
                                            "&.active": {
                                                borderBottomColor: "white",
                                            },
                                        }}
                                    >
                                        {t("nav.myClinics")}
                                    </Button>
                                    <Button
                                        component={NavLink}
                                        to="/powiadomienia"
                                        sx={{
                                            color: "white",
                                            px: 1.5,
                                            fontSize: 14,
                                            fontWeight: 500,
                                            textTransform: "none",
                                            borderBottom: "2px solid transparent",
                                            borderRadius: 0,
                                            "&.active": {
                                                borderBottomColor: "white",
                                            },
                                        }}
                                    >
                                        {t("nav.notifications")}
                                    </Button>
                                </>
                            ) : null}
                        </Stack>

                        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ ml: 1 }}>
                            <IconButton
                                onClick={() => i18n.changeLanguage("pl")}
                                size="small"
                                sx={{
                                    color:
                                        i18n.language === "pl" ? "white" : "rgba(255,255,255,0.5)",
                                    fontWeight: i18n.language === "pl" ? 800 : 500,
                                    fontSize: 13,
                                    minWidth: 36,
                                    borderRadius: 1,
                                    "&:hover": {
                                        color: "white",
                                        bgcolor: "rgba(255,255,255,0.15)",
                                    },
                                }}
                            >
                                PL
                            </IconButton>
                            <Typography sx={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
                                |
                            </Typography>
                            <IconButton
                                onClick={() => i18n.changeLanguage("en")}
                                size="small"
                                sx={{
                                    color:
                                        i18n.language === "en" ? "white" : "rgba(255,255,255,0.5)",
                                    fontWeight: i18n.language === "en" ? 800 : 500,
                                    fontSize: 13,
                                    minWidth: 36,
                                    borderRadius: 1,
                                    "&:hover": {
                                        color: "white",
                                        bgcolor: "rgba(255,255,255,0.15)",
                                    },
                                }}
                            >
                                EN
                            </IconButton>
                        </Stack>

                        {!isLoading && !user ? (
                            <Stack direction="row" spacing={1.2}>
                                <Button
                                    component={RouterLink}
                                    to="/login"
                                    variant="outlined"
                                    sx={{
                                        color: "white",
                                        borderColor: "rgba(255, 255, 255, 0.75)",
                                        textTransform: "none",
                                        fontWeight: 600,
                                        px: 2,
                                        "&:hover": {
                                            borderColor: "white",
                                            bgcolor: "rgba(255, 255, 255, 0.12)",
                                        },
                                    }}
                                >
                                    {t("nav.login")}
                                </Button>
                                <Button
                                    component={RouterLink}
                                    to="/register"
                                    variant="contained"
                                    sx={{
                                        textTransform: "none",
                                        fontWeight: 700,
                                        px: 2,
                                        bgcolor: "white",
                                        color: "#0b74c9",
                                        "&:hover": {
                                            bgcolor: "#eef6ff",
                                        },
                                    }}
                                >
                                    {t("nav.register")}
                                </Button>
                            </Stack>
                        ) : null}

                        {!isLoading && user ? (
                            <Stack direction="row" spacing={1.2}>
                                <Button
                                    variant="contained"
                                    onClick={() => logoutMutation.mutate()}
                                    disabled={logoutMutation.isPending}
                                    sx={{
                                        textTransform: "none",
                                        fontWeight: 700,
                                        px: 2,
                                        bgcolor: "white",
                                        color: "#0b74c9",
                                        "&:hover": {
                                            bgcolor: "#eef6ff",
                                        },
                                    }}
                                >
                                    {logoutMutation.isPending
                                        ? t("common.saving")
                                        : t("nav.logout")}
                                </Button>
                            </Stack>
                        ) : null}
                    </Toolbar>
                </Container>
            </AppBar>

            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Outlet />
            </Container>
        </Box>
    );
};

export default MainLayout;
