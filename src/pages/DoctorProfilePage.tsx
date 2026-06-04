import { Box,  Paper, Stack, Typography } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { plPL } from "@mui/x-date-pickers/locales";
import { useAuth } from "../context/AuthContext";
import { Grid } from "@mui/material";
// Importujemy zdefiniowane komponenty ze struktury components
import { DoctorCalendar} from "../components/DoctorProfileComponents/DoctorCalendar";
import { DoctorBio } from "../components/DoctorProfileComponents/DoctorBio";
import { DoctorSchedules } from "../components/DoctorProfileComponents/DoctorSchedules";

const DoctorProfilePage = () => {
  const { user } = useAuth();
  const isDoctor = Boolean(user?.doctorProfileId);

  if (!isDoctor) {
    return (
      <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: "1px solid #dce5f2" }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: "#11223a", mb: 1 }}>Brak profilu lekarza</Typography>
        <Typography sx={{ color: "#4f627a" }}>To konto nie ma jeszcze przypisanego profilu lekarza.</Typography>
      </Paper>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pl" localeText={plPL.components.MuiLocalizationProvider.defaultProps.localeText}>
      <Stack spacing={3} sx={{ pb: 6 }}>
        {/* Nagłówek strony */}
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: "#11223a", mb: 0.8 }}>
            Mój profil lekarza
          </Typography>
          <Typography sx={{ color: "#4f627a" }}>
            Zarządzaj opisem profilu i grafikami przypisanymi do konkretnych przychodni.
          </Typography>
        </Box>

        {/* Sekcja Kalendarza (Górna belka na całą szerokość) */}
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid #dce5f2" }}>
          <DoctorCalendar />
        </Paper>

        {/* Dolna sekcja (Dzielona na dwie kolumny) */}
        <Grid container spacing={2.5}>
          {/* Lewa kolumna: Formularz Bio (wąska) */}
          <Grid size={{xs:12, md: 4.2}} >
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid #dce5f2" }}>
              <DoctorBio />
            </Paper>
          </Grid>

          {/* Prawa kolumna: Grafiki (szeroka) */}
<Grid size={{ xs: 12, md: 7.8 }}>
                <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid #dce5f2" }}>
              <DoctorSchedules />
            </Paper>
          </Grid>
        </Grid>
      </Stack>
    </LocalizationProvider>
  );
};

export default DoctorProfilePage;