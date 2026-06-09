import { Alert, Button, CircularProgress, Stack, TextField, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AuthPageShell from "../components/auth/AuthPageShell";
import useRegisterForm from "../hooks/useRegisterForm";
import { Show } from "../components/shared/ShowHide";

const RegisterPage = () => {
    const { t } = useTranslation();
    const { values, error, isLoading, isSuccess, handleInputChange, handleSubmit } =
        useRegisterForm();

    return (
        <AuthPageShell
            title={t("auth.registerTitle")}
            subtitle={t("auth.registerSubtitle")}
            footer={
                <Typography sx={{ color: "#4f627a", textAlign: "center" }}>
                    {t("auth.haveAccount")}{" "}
                    <Typography
                        component={RouterLink}
                        to="/login"
                        sx={{
                            display: "inline",
                            color: "#0b74c9",
                            textDecoration: "none",
                            fontWeight: 700,
                            "&:hover": { textDecoration: "underline" },
                        }}
                    >
                        {t("nav.login")}
                    </Typography>
                </Typography>
            }
        >
            <Stack component="form" spacing={2.2} onSubmit={handleSubmit}>
                <Show when={Boolean(error)}>
                    <Alert severity="error">{error}</Alert>
                </Show>
                <Show when={isSuccess}>
                    <Alert severity="success">{t("auth.registerSuccess")}</Alert>
                </Show>

                <TextField
                    name="email"
                    label={t("auth.emailLabel")}
                    type="email"
                    autoComplete="email"
                    value={values.email}
                    onChange={handleInputChange}
                    fullWidth
                    required
                />
                <TextField
                    name="password"
                    label={t("auth.passwordLabel")}
                    type="password"
                    autoComplete="new-password"
                    value={values.password}
                    onChange={handleInputChange}
                    fullWidth
                    required
                />
                <TextField
                    name="confirmPassword"
                    label={t("auth.confirmPasswordLabel")}
                    type="password"
                    autoComplete="new-password"
                    value={values.confirmPassword}
                    onChange={handleInputChange}
                    fullWidth
                    required
                />

                <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={isLoading}
                    startIcon={
                        isLoading ? <CircularProgress size={20} color="inherit" /> : undefined
                    }
                    sx={{
                        mt: 1,
                        py: 1.2,
                        fontWeight: 700,
                        textTransform: "none",
                        bgcolor: "#0b74c9",
                        "&:hover": { bgcolor: "#095fa6" },
                    }}
                >
                    {isLoading ? t("auth.registering") : t("auth.registerButton")}
                </Button>
            </Stack>
        </AuthPageShell>
    );
};

export default RegisterPage;
