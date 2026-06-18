import { useState } from "react";
import {
    AppBar,
    Box,
    Button,
    Container,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItemButton,
    ListItemText,
    Stack,
    Toolbar,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import { DarkMode, LightMode, Menu as MenuIcon, Close } from "@mui/icons-material";
import { Link as RouterLink, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useMainLayout } from "../../hooks/useMainLayout";

const MainLayout = () => {
    const m = useMainLayout();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const [drawerOpen, setDrawerOpen] = useState(false);
    const navigate = useNavigate();

    const handleNavClick = (to: string) => {
        setDrawerOpen(false);
        navigate(to);
    };

    const handleLogout = () => {
        setDrawerOpen(false);
        m.logoutMutation.mutate();
    };

    const drawerContent = (
        <Box sx={{ width: 280, pt: 1 }}>
            <Stack
                direction="row"
                justifyContent="space-between"
                sx={{ alignItems: "center", px: 2, py: 1 }}
            >
                <Typography
                    component={RouterLink}
                    to="/"
                    onClick={() => setDrawerOpen(false)}
                    sx={{
                        color: "primary.main",
                        textDecoration: "none",
                        fontWeight: 800,
                        fontSize: 20,
                        letterSpacing: 0.4,
                    }}
                >
                    {m.t("layout.brandName")}
                </Typography>
                <IconButton onClick={() => setDrawerOpen(false)} size="small">
                    <Close />
                </IconButton>
            </Stack>
            <Divider />
            <List sx={{ pt: 1 }}>
                {m.visibleNavLinks.map((item) => (
                    <ListItemButton
                        key={item.to}
                        onClick={() => handleNavClick(item.to)}
                        sx={{ py: 1.5, px: 2 }}
                    >
                        <ListItemText
                            primary={m.t(item.labelKey)}
                            primaryTypographyProps={{ fontWeight: 500, fontSize: 16 }}
                        />
                    </ListItemButton>
                ))}

                {!m.isLoading && m.user && (
                    <ListItemButton
                        onClick={() =>
                            handleNavClick(m.user!.doctorProfileId ? "/moj-profil" : "/moje-konto")
                        }
                        sx={{ py: 1.5, px: 2 }}
                    >
                        <ListItemText
                            primary={m.t("nav.profile")}
                            primaryTypographyProps={{ fontWeight: 500, fontSize: 16 }}
                        />
                    </ListItemButton>
                )}
                {!m.isLoading && m.user?.doctorProfileId ? (
                    <>
                        <ListItemButton
                            onClick={() => handleNavClick("/moje-przychodnie")}
                            sx={{ py: 1.5, px: 2 }}
                        >
                            <ListItemText
                                primary={m.t("nav.myClinics")}
                                primaryTypographyProps={{ fontWeight: 500, fontSize: 16 }}
                            />
                        </ListItemButton>
                        <ListItemButton
                            onClick={() => handleNavClick("/powiadomienia")}
                            sx={{ py: 1.5, px: 2 }}
                        >
                            <ListItemText
                                primary={m.t("nav.notifications")}
                                primaryTypographyProps={{ fontWeight: 500, fontSize: 16 }}
                            />
                        </ListItemButton>
                    </>
                ) : null}
            </List>
            <Divider />
            <Box sx={{ px: 2, py: 2 }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1.5 }}>
                    <IconButton
                        onClick={m.toggleTheme}
                        size="small"
                        sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1 }}
                    >
                        {m.mode === "dark" ? <LightMode /> : <DarkMode />}
                    </IconButton>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        {m.mode === "dark" ? m.t("theme.lightMode") : m.t("theme.darkMode")}
                    </Typography>
                </Stack>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                    <Button
                        variant={m.i18n.language === "pl" ? "contained" : "outlined"}
                        size="small"
                        onClick={() => m.i18n.changeLanguage("pl")}
                        sx={{ minWidth: 48, fontWeight: 700 }}
                    >
                        PL
                    </Button>
                    <Button
                        variant={m.i18n.language === "en" ? "contained" : "outlined"}
                        size="small"
                        onClick={() => m.i18n.changeLanguage("en")}
                        sx={{ minWidth: 48, fontWeight: 700 }}
                    >
                        EN
                    </Button>
                </Stack>
            </Box>
            {!m.isLoading && m.user && (
                <>
                    <Divider />
                    <Box sx={{ px: 2, py: 2 }}>
                        <Button
                            variant="outlined"
                            color="error"
                            fullWidth
                            onClick={handleLogout}
                            disabled={m.logoutMutation.isPending}
                            sx={{ textTransform: "none", fontWeight: 700 }}
                        >
                            {m.logoutMutation.isPending ? m.t("common.saving") : m.t("nav.logout")}
                        </Button>
                    </Box>
                </>
            )}
        </Box>
    );

    const desktopNavLinkSx = {
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
    } as const;

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
            <AppBar position="sticky" elevation={0} sx={{ bgcolor: "primary.main" }}>
                <Container maxWidth="xl">
                    <Toolbar disableGutters sx={{ minHeight: { xs: 64, md: 72 } }}>
                        {/* Mobile: hamburger on the left */}
                        {isMobile && (
                            <IconButton
                                edge="start"
                                onClick={() => setDrawerOpen(true)}
                                sx={{ color: "white", mr: 1 }}
                            >
                                <MenuIcon />
                            </IconButton>
                        )}

                        <Typography
                            component={RouterLink}
                            to="/"
                            variant="h6"
                            sx={{
                                color: "white",
                                textDecoration: "none",
                                fontWeight: 700,
                                mr: { xs: "auto", md: 4 },
                                letterSpacing: 0.4,
                                fontSize: { xs: 18, md: 20 },
                            }}
                        >
                            {m.t("layout.brandName")}
                        </Typography>

                        {/* Desktop nav links - hidden on mobile */}
                        {!isMobile && (
                            <Stack direction="row" spacing={1} sx={{ flexGrow: 1 }}>
                                {m.visibleNavLinks.map((item) => (
                                    <Button
                                        key={item.to}
                                        component={NavLink}
                                        to={item.to}
                                        sx={desktopNavLinkSx}
                                    >
                                        {m.t(item.labelKey)}
                                    </Button>
                                ))}

                                {!m.isLoading && m.user && (
                                    <Button
                                        component={NavLink}
                                        to={m.user.doctorProfileId ? "/moj-profil" : "/moje-konto"}
                                        sx={desktopNavLinkSx}
                                    >
                                        {m.t("nav.profile")}
                                    </Button>
                                )}
                                {!m.isLoading && m.user?.doctorProfileId ? (
                                    <>
                                        <Button
                                            component={NavLink}
                                            to="/moje-przychodnie"
                                            sx={desktopNavLinkSx}
                                        >
                                            {m.t("nav.myClinics")}
                                        </Button>
                                        <Button
                                            component={NavLink}
                                            to="/powiadomienia"
                                            sx={desktopNavLinkSx}
                                        >
                                            {m.t("nav.notifications")}
                                        </Button>
                                    </>
                                ) : null}
                            </Stack>
                        )}

                        {/* Desktop: theme + language + logout */}
                        {!isMobile && (
                            <>
                                <IconButton
                                    onClick={m.toggleTheme}
                                    size="small"
                                    sx={{
                                        color: "white",
                                        mr: 0.5,
                                        "&:hover": { bgcolor: "rgba(255,255,255,0.15)" },
                                    }}
                                    title={
                                        m.mode === "dark"
                                            ? m.t("theme.lightMode")
                                            : m.t("theme.darkMode")
                                    }
                                >
                                    {m.mode === "dark" ? <LightMode /> : <DarkMode />}
                                </IconButton>

                                <Stack
                                    direction="row"
                                    spacing={0.5}
                                    sx={{ alignItems: "center", ml: 1 }}
                                >
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
                                    <Typography
                                        sx={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}
                                    >
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
                                            "&:hover": { bgcolor: "grey.100" },
                                        }}
                                    >
                                        {m.logoutMutation.isPending
                                            ? m.t("common.saving")
                                            : m.t("nav.logout")}
                                    </Button>
                                )}
                            </>
                        )}
                    </Toolbar>
                </Container>
            </AppBar>

            {/* Mobile Drawer */}
            <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                sx={{
                    "& .MuiDrawer-paper": {
                        borderRadius: "0 16px 16px 0",
                    },
                }}
            >
                {drawerContent}
            </Drawer>

            <Box component="main">
                <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 }, px: { xs: 2, md: 3 } }}>
                    <Outlet />
                </Container>
            </Box>
        </Box>
    );
};

export default MainLayout;
