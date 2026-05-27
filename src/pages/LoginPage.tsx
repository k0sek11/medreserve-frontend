import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Link as RouterLink, Navigate, useNavigate } from "react-router-dom";
import AuthPageShell from "../components/auth/AuthPageShell";
import { useAuthUser } from "../hooks/useAuthUser";
import useLoginForm from "../hooks/useLoginForm";
import { GoogleLogin } from '@react-oauth/google';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from "../api/auth";



const LoginPage = () => {
  const { data: user, isLoading: isAuthLoading } = useAuthUser();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const {
    values,
    error,
    isLoading,
    isSuccess,
    handleInputChange,
    handleRememberMeChange,
    handleSubmit,
    loginWithGoogle,
    loginWithFacebook,
  } = useLoginForm();

  const loginMutation = useMutation({
    mutationFn: authApi.loginWithGoogleApi,
    onSuccess: (data) => {
      if (data?.token) {
        localStorage.setItem('token', data.token);
      }

      queryClient.invalidateQueries({ queryKey: ['authUser'] });

      navigate('/', { replace: true });
    },
    onError: (error) => {
      console.error("Backend odrzucił token Google lub wystąpił błąd sieci:", error);
    }
  });

  const handleGoogleSuccess = (credentialResponse: any) => {
    const googleToken = credentialResponse.credential;
    
    if (googleToken) {
      loginMutation.mutate(googleToken);
    }
  };

  if (!isAuthLoading && user) {
    return <Navigate to="/" replace />;
  }


  return (
    <AuthPageShell
      title="Zaloguj sie"
      subtitle="Wpisz dane konta, aby przejsc do rezerwacji wizyt."
      footer={
        <Typography sx={{ color: "#4f627a", textAlign: "center" }}>
          Nie masz konta?{" "}
          <Typography
            component={RouterLink}
            to="/register"
            sx={{
              display: "inline",
              color: "#0b74c9",
              textDecoration: "none",
              fontWeight: 700,
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            Zarejestruj sie
          </Typography>
        </Typography>
      }
    >
      <Stack component="form" spacing={2.2} onSubmit={handleSubmit}>
        {error && <Alert severity="error">{error}</Alert>}
        {isSuccess && <Alert severity="success">Pomyślnie zalogowano!</Alert>}

        <TextField
          name="email"
          label="Adres e-mail"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={handleInputChange}
          fullWidth
          required
        />
        <TextField
          name="password"
          label="Haslo"
          type="password"
          autoComplete="current-password"
          value={values.password}
          onChange={handleInputChange}
          fullWidth
          required
        />

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            rowGap: 1,
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={values.rememberMe}
                onChange={handleRememberMeChange}
              />
            }
            label="Zapamietaj mnie"
          />
          <Typography
            component={RouterLink}
            to="/reset-hasla"
            sx={{
              color: "#0b74c9",
              textDecoration: "none",
              fontWeight: 600,
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            Nie pamietasz hasla?
          </Typography>
        </Box>


        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={isLoading}
          startIcon={
            isLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : undefined
          }
          sx={{
            mt: 1,
            py: 1.2,
            fontWeight: 700,
            textTransform: "none",
            bgcolor: "#0b74c9",
            "&:hover": {
              bgcolor: "#095fa6",
            },
          }}
        >
          {isLoading ? "Logowanie..." : "Zaloguj sie"}
        </Button>

        <Divider sx={{ color: "#71839a", fontSize: 13, mt: 1 }}>lub</Divider>

        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => console.error('Okienko Google zostało zamknięte lub wystąpił błąd.')}
          useOneTap={false}
        />


      </Stack>
    </AuthPageShell>
  );
};

export default LoginPage;
