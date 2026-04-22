import { Button, Stack, TextField, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import AuthPageShell from "../components/auth/AuthPageShell";
import useRegisterForm from "../hooks/useRegisterForm";

const RegisterPage = () => {
  const { values, handleInputChange, handleSubmit } = useRegisterForm();

  return (
    <AuthPageShell
      title="Zaloz konto"
      subtitle="Utworz profil pacjenta i rezerwuj terminy online w kilka minut."
      footer={
        <Typography sx={{ color: "#4f627a", textAlign: "center" }}>
          Masz juz konto?{" "}
          <Typography
            component={RouterLink}
            to="/login"
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
            Zaloguj sie
          </Typography>
        </Typography>
      }
    >
      <Stack component="form" spacing={2.2} onSubmit={handleSubmit}>
        <TextField
          name="firstName"
          label="Imie"
          autoComplete="given-name"
          value={values.firstName}
          onChange={handleInputChange}
          fullWidth
          required
        />
        <TextField
          name="lastName"
          label="Nazwisko"
          autoComplete="family-name"
          value={values.lastName}
          onChange={handleInputChange}
          fullWidth
          required
        />
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
          autoComplete="new-password"
          value={values.password}
          onChange={handleInputChange}
          fullWidth
          required
        />
        <TextField
          name="confirmPassword"
          label="Powtorz haslo"
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
          Zarejestruj sie
        </Button>
      </Stack>
    </AuthPageShell>
  );
};

export default RegisterPage;
