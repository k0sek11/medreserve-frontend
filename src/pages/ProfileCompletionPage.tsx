import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Navigate, useNavigate } from "react-router-dom";
import AuthPageShell from "../components/auth/AuthPageShell";
import { authApi, type CompleteProfileRequest } from "../api/auth";
import { useAuthUser } from "../hooks/useAuthUser";
import { authUserQueryKey } from "../hooks/useAuthUser";

type ProfileType = "Doctor" | "Patient" | null;

const genderOptions = [
  { value: "Kobieta", label: "Kobieta" },
  { value: "Mezczyzna", label: "Mężczyzna" },
  { value: "Inne", label: "Inne" },
];

const ProfileCompletionPage = () => {
  const { data: user, isLoading } = useAuthUser();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [profileType, setProfileType] = useState<ProfileType>(null);
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [phoneNumber, setPhoneNumber] = useState(user?.email ? "" : "");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState(genderOptions[0].value);
  const [licenseNumber, setLicenseNumber] = useState("");

  const completionMutation = useMutation({
    mutationFn: (payload: CompleteProfileRequest) => authApi.completeProfile(payload),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: authUserQueryKey });
      navigate(variables.profileType === "Doctor" ? "/powiadomienia" : "/", { replace: true });
    },
  });

  const canSubmit =
    Boolean(profileType) &&
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    phoneNumber.trim().length > 0 &&
    birthDate.trim().length > 0 &&
    gender.trim().length > 0 &&
    (profileType !== "Doctor" || licenseNumber.trim().length > 0);

  if (isLoading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <Typography>Ładowanie...</Typography>
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.isActive) {
    return <Navigate to={user.roles.includes("Doctor") ? "/powiadomienia" : "/"} replace />;
  }

  const submit = () => {
    if (!profileType) {
      return;
    }

    completionMutation.mutate({
      profileType,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phoneNumber: phoneNumber.trim(),
        birthDate,
      gender,
      licenseNumber: profileType === "Doctor" ? licenseNumber.trim() : null,
    });
  };

  return (
    <AuthPageShell
      title="Dokończ konfigurację konta"
      subtitle="Wybierz, czy zakładasz konto lekarza czy pacjenta, a następnie uzupełnij dane profilu."
      footer={
        <Typography sx={{ color: "#4f627a", textAlign: "center" }}>
          Po zapisaniu profil zostanie aktywowany i będziesz mógł korzystać z aplikacji.
        </Typography>
      }
    >
      <Stack spacing={2.5}>
        <Box>
          <Typography sx={{ fontWeight: 800, color: "#11223a", mb: 1 }}>
            Kim jesteś?
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <RoleCard
              active={profileType === "Doctor"}
              title="Lekarz"
              description="Profil lekarza, numer licencji i później grafik wizyt."
              onClick={() => setProfileType("Doctor")}
            />
            <RoleCard
              active={profileType === "Patient"}
              title="Pacjent"
              description="Profil pacjenta do rezerwacji i śledzenia wizyt."
              onClick={() => setProfileType("Patient")}
            />
          </Stack>
        </Box>

        <Divider />

        <Stack spacing={2} component="form" onSubmit={(event) => { event.preventDefault(); submit(); }}>
          <TextField label="Imię" value={firstName} onChange={(event) => setFirstName(event.target.value)} fullWidth required />
          <TextField label="Nazwisko" value={lastName} onChange={(event) => setLastName(event.target.value)} fullWidth required />
          <TextField label="Telefon" value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} fullWidth required />
          <TextField
            label="Data urodzenia"
            type="date"
            value={birthDate}
            onChange={(event) => setBirthDate(event.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
            required
          />
          <FormControl fullWidth required>
            <InputLabel id="gender-label">Płeć</InputLabel>
            <Select
              labelId="gender-label"
              label="Płeć"
              value={gender}
              onChange={(event) => setGender(event.target.value)}
            >
              {genderOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {profileType === "Doctor" ? (
            <TextField
              label="Numer licencji"
              value={licenseNumber}
              onChange={(event) => setLicenseNumber(event.target.value)}
              fullWidth
              required
            />
          ) : null}

          {completionMutation.isError ? (
            <Alert severity="error">Nie udało się zapisać profilu. Sprawdź dane i spróbuj ponownie.</Alert>
          ) : null}

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={!canSubmit || completionMutation.isPending}
            sx={{ textTransform: "none", fontWeight: 700, py: 1.2 }}
          >
            {completionMutation.isPending ? "Zapisywanie..." : "Zapisz i przejdź dalej"}
          </Button>
        </Stack>
      </Stack>
    </AuthPageShell>
  );
};

type RoleCardProps = {
  title: string;
  description: string;
  active: boolean;
  onClick: () => void;
};

const RoleCard = ({ title, description, active, onClick }: RoleCardProps) => (
  <Card
    elevation={0}
    sx={{
      flex: 1,
      border: active ? "2px solid #0b74c9" : "1px solid #dce5f2",
      borderRadius: 3,
      overflow: "hidden",
      bgcolor: active ? "#f2f8ff" : "white",
    }}
  >
    <CardActionArea onClick={onClick} sx={{ height: "100%", alignItems: "stretch" }}>
      <CardContent sx={{ height: "100%" }}>
        <Typography sx={{ fontWeight: 800, color: "#11223a", fontSize: 20, mb: 0.6 }}>
          {title}
        </Typography>
        <Typography sx={{ color: "#4f627a" }}>{description}</Typography>
      </CardContent>
    </CardActionArea>
  </Card>
);

export default ProfileCompletionPage;