import { Alert, Button, CircularProgress, Stack, TextField, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AuthPageShell from "../components/auth/AuthPageShell";
import useRegisterForm from "../hooks/useRegisterForm";
import { Show } from "../components/shared/ShowHide";

const RegisterPage = () => {
    const { t } = useTranslation();
    const { register, handleSubmit, errors, rootError, isLoading, isSuccess } = useRegisterForm();

    return (
        <AuthPageShell
            title={t("auth.registerTitle")}
            subtitle={t("auth.registerSubtitle")}
            footer={
                <Typography sx={{ color: "text.secondary", textAlign: "center" }}>
                    {t("auth.haveAccount")}{" "}
                    <Typography
                        component={RouterLink}
                        to="/login"
                        sx={{
                            display: "inline",
                            color: "primary.main",
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
                <Show when={Boolean(rootError)}>
                    <Alert severity="error">{rootError}</Alert>
                </Show>
                <Show when={isSuccess}>
                    <Alert severity="success">{t("auth.registerSuccess")}</Alert>
                </Show>

                <TextField
                    label={t("auth.emailLabel")}
                    type="email"
                    autoComplete="email"
                    {...register("email")}
                    error={!!errors.email}
                    helperText={errors.email?.message ? t(errors.email.message) : undefined}
                    fullWidth
                />
                <TextField
                    label={t("auth.passwordLabel")}
                    type="password"
                    autoComplete="new-password"
                    {...register("password")}
                    error={!!errors.password}
                    helperText={errors.password?.message ? t(errors.password.message) : undefined}
                    fullWidth
                />
                <TextField
                    label={t("auth.confirmPasswordLabel")}
                    type="password"
                    autoComplete="new-password"
                    {...register("confirmPassword")}
                    error={!!errors.confirmPassword}
                    helperText={
                        errors.confirmPassword?.message
                            ? t(errors.confirmPassword.message)
                            : undefined
                    }
                    fullWidth
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
                        bgcolor: "primary.main",
                        "&:hover": { bgcolor: "primary.dark" },
                    }}
                >
                    {isLoading ? t("auth.registering") : t("auth.registerButton")}
                </Button>
            </Stack>
        </AuthPageShell>
    );
};

export default RegisterPage;
