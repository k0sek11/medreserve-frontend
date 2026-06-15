import type { ReactNode } from "react";
import { Box, Container, Paper, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

type AuthPageShellProps = {
    title: string;
    subtitle: string;
    footer: ReactNode;
    children: ReactNode;
};

const AuthPageShell = ({ title, subtitle, footer, children }: AuthPageShellProps) => {
    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                py: { xs: 3, md: 6 },
                background: (t) =>
                    `radial-gradient(circle at top left, ${t.palette.mode === "dark" ? "rgba(91,173,245,0.12)" : "rgba(11,116,201,0.14)"}, transparent 44%), radial-gradient(circle at bottom right, ${t.palette.mode === "dark" ? "rgba(91,173,245,0.16)" : "rgba(11,116,201,0.2)"}, transparent 40%), ${t.palette.background.default}`,
            }}
        >
            <Container maxWidth="sm">
                <Paper
                    elevation={0}
                    sx={{
                        border: (t) => `1px solid ${t.palette.divider}`,
                        borderRadius: 3,
                        p: { xs: 3, md: 4 },
                        bgcolor: "background.paper",
                    }}
                >
                    <Stack spacing={1.5} sx={{ mb: 3 }}>
                        <Typography
                            component={RouterLink}
                            to="/"
                            sx={{
                                textDecoration: "none",
                                color: "primary.main",
                                fontWeight: 800,
                                letterSpacing: 0.3,
                                width: "fit-content",
                            }}
                        >
                            MedReserve
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: "text.primary" }}>
                            {title}
                        </Typography>
                        <Typography sx={{ color: "text.secondary" }}>{subtitle}</Typography>
                    </Stack>

                    {children}

                    <Box sx={{ mt: 3 }}>{footer}</Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default AuthPageShell;
