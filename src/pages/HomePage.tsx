import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { cities, specializations } from "../data/searchOptions";

const HomePage = () => {
  const navigate = useNavigate();
  const [specialization, setSpecialization] = useState("");
  const [city, setCity] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");

  const handleSearch = () => {
    const nextParams = new URLSearchParams();

    if (specialization) {
      nextParams.set("specialization", specialization);
    }

    if (city) {
      nextParams.set("city", city);
    }

    if (appointmentDate) {
      nextParams.set("date", appointmentDate);
    }

    nextParams.set("sort", "priceAsc");

    navigate({
      pathname: "/lekarze",
      search: `?${nextParams.toString()}`,
    });
  };

  return (
    <Box sx={{ py: { xs: 2, md: 6 } }}>
      <Paper
        elevation={0}
        sx={{
          mx: "auto",
          maxWidth: 980,
          p: { xs: 2.5, md: 5 },
          borderRadius: 3,
          border: "1px solid #dde7f3",
          backgroundColor: "#ffffff",
        }}
      >
        <Stack spacing={1} sx={{ textAlign: "center", mb: 4 }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: "2rem", md: "3rem" },
              lineHeight: 1.15,
              fontWeight: 800,
              color: "#11223a",
            }}
          >
            Znajdz i Umow Wizyte u Specjalisty
          </Typography>
          <Typography sx={{ color: "#4f627a", fontSize: { xs: 16, md: 22 } }}>
            Najszybszy sposob na rezerwacje medyczna online.
          </Typography>
        </Stack>

        <Grid container spacing={2} sx={{ mb: 2.5 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth>
              <InputLabel id="specialization-label">
                Wybierz specjalizacje
              </InputLabel>
              <Select
                labelId="specialization-label"
                label="Wybierz specjalizacje"
                value={specialization}
                onChange={(event) => setSpecialization(event.target.value)}
              >
                {specializations.map((item) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth>
              <InputLabel id="city-label">Wybierz miasto</InputLabel>
              <Select
                labelId="city-label"
                label="Wybierz miasto"
                value={city}
                onChange={(event) => setCity(event.target.value)}
              >
                {cities.map((item) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label="Data"
              type="date"
              value={appointmentDate}
              onChange={(event) => setAppointmentDate(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
        </Grid>

        <Button
          type="button"
          variant="contained"
          onClick={handleSearch}
          fullWidth
          size="large"
          sx={{
            py: 1.35,
            fontWeight: 700,
            textTransform: "none",
            bgcolor: "#0b74c9",
            "&:hover": {
              bgcolor: "#095fa6",
            },
          }}
        >
          Szukaj terminu
        </Button>
      </Paper>
    </Box>
  );
};

export default HomePage;
