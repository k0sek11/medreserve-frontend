import {
    Alert,
    Button,
    CircularProgress,
    Divider,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { Link as RouterLink, Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AuthPageShell from "../components/auth/AuthPageShell";
import { useAuthUser } from "../hooks/useAuthUser";
import useLoginForm from "../hooks/useLoginForm";
import { GoogleLogin } from "@react-oauth/google";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../api/auth";

const LoginPage = () => {
    const { t } = useTranslation();
    const { data: user, isLoading: isAuthLoading } = useAuthUser();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const {
        values,
        error,
        isLoading,
        isSuccess,
        handleInputChange,
        handleSubmit,
    } = useLoginForm((session) => {
        navigate(
            session.isActive
                ? session.roles.includes("Doctor")
                    ? "/powiadomienia"
                    : "/"
                : "/uzupelnij-profil",
            { replace: true },
        );
    });

    const loginMutation = useMutation({
        mutationFn: authApi.loginWithGoogleApi,
        onSuccess: async (data) => {
            if (data?.token) {
                localStorage.setItem("token", data.token);
            }

            await queryClient.invalidateQueries({ queryKey: ["authUser"] });
            const session = await authApi.me();
            navigate(
                session.isActive
                    ? session.roles.includes("Doctor")
                        ? "/powiadomienia"
                        : "/"
                    : "/uzupelnij-profil",
                { replace: true },
            );
        },
        onError: () => {
            console.error(t("auth.googleTokenRejected"));
        },
    });

    const handleGoogleSuccess = (credentialResponse: any) => {
        const googleToken = credentialResponse.credential;

        if (googleToken) {
            loginMutation.mutate(googleToken);
        }
    };

    if (!isAuthLoading && user) {
        const nextRoute = user.isActive
            ? user.roles.includes("Doctor")
                ? "/powiadomienia"
                : "/"
            : "/uzupelnij-profil";
        return <Navigate to={nextRoute} replace />;
    }

    return (
        <AuthPageShell
            title={t("auth.loginTitle")}
            subtitle={t("auth.loginSubtitle")}
            footer={
                <Typography sx={{ color: "text.secondary", textAlign: "center" }}>
                    {t("auth.noAccount")}{" "}
                    <Typography
                        component={RouterLink}
                        to="/register"
                        sx={{
                            display: "inline",
                            color: "primary.main",
                            textDecoration: "none",
                            fontWeight: 700,
                            "&:hover": {
                                textDecoration: "underline",
                            },
                        }}
                    >
                        {t("nav.register")}
                    </Typography>
                </Typography>
            }
        >
            <Stack component="form" spacing={2.2} onSubmit={handleSubmit}>
                {error && <Alert severity="error">{error}</Alert>}
                {isSuccess && <Alert severity="success">{t("auth.loginSuccess")}</Alert>}

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
                    autoComplete="current-password"
                    value={values.password}
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
                        bgcolor: "primary.main",
                        "&:hover": {
                            bgcolor: "primary.dark",
                        },
                    }}
                >
                    {isLoading ? t("auth.loggingIn") : t("auth.loginButton")}
                </Button>

                <Divider sx={{ color: "text.disabled", fontSize: 13, mt: 1 }}>
                    {t("auth.orDivider")}
                </Divider>

                <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => console.error(t("auth.googleError"))}
                    useOneTap={false}
                />
            </Stack>
        </AuthPageShell>
    );
};

export default LoginPage;
