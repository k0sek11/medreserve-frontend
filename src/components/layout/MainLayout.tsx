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
import { DarkMode, LightMode } from "@mui/icons-material";
import { Link as RouterLink, NavLink, Outlet } from "react-router-dom";
import { useMainLayout } from "../../hooks/useMainLayout";

const MainLayout = () => {
    const m = useMainLayout();

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
            <AppBar position="sticky" elevation={0} sx={{ bgcolor: "primary.main" }}>
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
                            {m.t("layout.brandName")}
                        </Typography>

                        <Stack direction="row" spacing={1} sx={{ flexGrow: 1 }}>
                            {m.visibleNavLinks.map((item) => (
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
                                    {m.t(item.labelKey)}
                                </Button>
                            ))}

                            {!m.isLoading && m.user && (
                                <Button
                                    component={NavLink}
                                    to={m.user.doctorProfileId ? "/moj-profil" : "/moje-konto"}
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
                                    {m.t("nav.profile")}
                                </Button>
                            )}
                            {!m.isLoading && m.user?.doctorProfileId ? (
                                <>
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
                                        {m.t("nav.myClinics")}
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
                                        {m.t("nav.notifications")}
                                    </Button>
                                </>
                            ) : null}
                        </Stack>

                        <IconButton
                            onClick={m.toggleTheme}
                            size="small"
                            sx={{
                                color: "white",
                                mr: 0.5,
                                "&:hover": {
                                    bgcolor: "rgba(255,255,255,0.15)",
                                },
                            }}
                            title={
                                m.mode === "dark" ? m.t("theme.lightMode") : m.t("theme.darkMode")
                            }
                        >
                            {m.mode === "dark" ? <LightMode /> : <DarkMode />}
                        </IconButton>

                        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ ml: 1 }}>
                            <IconButton
                                onClick={() => m.i18n.changeLanguage("pl")}
                                size="small"
                                sx={{
                                    color:
                                        m.i18n.language === "pl"
                                            ? "white"
                                            : "rgba(255,255,255,0.5)",
                                    fontWeight: m.i18n.language === "pl" ? 800 : 500,
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
                                onClick={() => m.i18n.changeLanguage("en")}
                                size="small"
                                sx={{
                                    color:
                                        m.i18n.language === "en"
                                            ? "white"
                                            : "rgba(255,255,255,0.5)",
                                    fontWeight: m.i18n.language === "en" ? 800 : 500,
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

                        {!m.isLoading && m.user && (
                            <Button
                                variant="contained"
                                onClick={() => m.logoutMutation.mutate()}
                                disabled={m.logoutMutation.isPending}
                                sx={{
                                    ml: 1.5,
                                    textTransform: "none",
                                    fontWeight: 700,
                                    bgcolor: "background.paper",
                                    color: "primary.main",
                                    "&:hover": {
                                        bgcolor: "grey.100",
                                    },
                                }}
                            >
                                {m.logoutMutation.isPending
                                    ? m.t("common.saving")
                                    : m.t("nav.logout")}
                            </Button>
                        )}
                    </Toolbar>
                </Container>
            </AppBar>

            <Box component="main">
                <Container maxWidth="xl" sx={{ py: 3 }}>
                    <Outlet />
                </Container>
            </Box>
        </Box>
    );
};

export default MainLayout;
