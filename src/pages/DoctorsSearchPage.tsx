import { useMemo } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
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
import { Link as RouterLink } from "react-router-dom";
import { doctors } from "../data/doctors";
import { cities, sortOptions, specializations } from "../data/searchOptions";
import useDoctorSearchFilters from "../hooks/useDoctorSearchFilters";

const DoctorsSearchPage = () => {
  const { filters, updateFilter, clearFilters } = useDoctorSearchFilters();

  const filteredDoctors = useMemo(() => {
    const maxPrice = filters.priceMax ? Number(filters.priceMax) : undefined;

    const nextDoctors = doctors.filter((doctor) => {
      const specializationMatch =
        !filters.specialization ||
        doctor.specialization === filters.specialization;
      const cityMatch = !filters.city || doctor.city === filters.city;
      const dateMatch =
        !filters.date || doctor.availableDates.includes(filters.date);
      const priceMatch = !maxPrice || doctor.price <= maxPrice;

      return specializationMatch && cityMatch && dateMatch && priceMatch;
    });

    if (filters.sort === "priceDesc") {
      return nextDoctors.sort((a, b) => b.price - a.price);
    }

    if (filters.sort === "ratingDesc") {
      return nextDoctors.sort((a, b) => b.rating - a.rating);
    }

    return nextDoctors.sort((a, b) => a.price - b.price);
  }, [filters]);

  return (
    <Box sx={{ py: { xs: 2, md: 4 } }}>
      <Typography
        variant="h4"
        sx={{ fontWeight: 800, color: "#11223a", mb: 0.8 }}
      >
        Wyniki wyszukiwania lekarzy
      </Typography>
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 4, lg: 3.4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              border: "1px solid #dce5f2",
              position: { md: "sticky" },
              top: 88,
            }}
          >
            <Stack spacing={2}>
              <Typography sx={{ fontWeight: 700, color: "#11223a" }}>
                Filtry
              </Typography>

              <FormControl fullWidth>
                <InputLabel id="results-specialization">
                  Specjalizacja
                </InputLabel>
                <Select
                  labelId="results-specialization"
                  label="Specjalizacja"
                  value={filters.specialization}
                  onChange={(event) =>
                    updateFilter("specialization", event.target.value)
                  }
                >
                  <MenuItem value="">Wszystkie</MenuItem>
                  {specializations.map((item) => (
                    <MenuItem key={item} value={item}>
                      {item}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel id="results-city">Miasto</InputLabel>
                <Select
                  labelId="results-city"
                  label="Miasto"
                  value={filters.city}
                  onChange={(event) => updateFilter("city", event.target.value)}
                >
                  <MenuItem value="">Wszystkie</MenuItem>
                  {cities.map((item) => (
                    <MenuItem key={item} value={item}>
                      {item}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Data"
                type="date"
                value={filters.date}
                onChange={(event) => updateFilter("date", event.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                fullWidth
              />

              <TextField
                label="Cena maksymalna"
                type="number"
                value={filters.priceMax}
                onChange={(event) =>
                  updateFilter("priceMax", event.target.value)
                }
                fullWidth
                slotProps={{ htmlInput: { min: 0, step: 10 } }}
              />

              <FormControl fullWidth>
                <InputLabel id="results-sort">Sortowanie</InputLabel>
                <Select
                  labelId="results-sort"
                  label="Sortowanie"
                  value={filters.sort}
                  onChange={(event) => updateFilter("sort", event.target.value)}
                >
                  {sortOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="outlined"
                onClick={clearFilters}
                sx={{ textTransform: "none" }}
              >
                Wyczysc filtry
              </Button>
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 8, lg: 8.6 }}>
          <Stack spacing={1.6}>
            {filteredDoctors.map((doctor) => (
              <Card
                key={doctor.id}
                elevation={0}
                sx={{ border: "1px solid #dce5f2", borderRadius: 2 }}
              >
                <CardContent>
                  <Stack spacing={1.1}>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1}
                      sx={{
                        justifyContent: "space-between",
                        alignItems: { xs: "flex-start", sm: "center" },
                      }}
                    >
                      <Box>
                        <Typography
                          sx={{
                            fontWeight: 700,
                            color: "#11223a",
                            fontSize: 20,
                          }}
                        >
                          {doctor.name}
                        </Typography>
                        <Typography sx={{ color: "#4f627a" }}>
                          {doctor.specialization} | {doctor.city}
                        </Typography>
                      </Box>

                      <Chip
                        label={`${doctor.price} zl`}
                        sx={{
                          bgcolor: "#eef6ff",
                          color: "#0b74c9",
                          fontWeight: 700,
                        }}
                      />
                    </Stack>

                    <Typography sx={{ color: "#23354d" }}>
                      Ocena: {doctor.rating.toFixed(1)} | Najblizszy termin:{" "}
                      {doctor.availableDates[0]}
                    </Typography>

                    <Button
                      variant="contained"
                      component={RouterLink}
                      to={`/lekarze/${doctor.id}`}
                      sx={{ textTransform: "none", alignSelf: "flex-start" }}
                    >
                      Umow wizyte
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            ))}

            {filteredDoctors.length === 0 ? (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  border: "1px dashed #b8c8de",
                  borderRadius: 2,
                  textAlign: "center",
                }}
              >
                <Typography sx={{ color: "#4f627a" }}>
                  Brak wynikow dla podanych filtrow. Zmien kryteria
                  wyszukiwania.
                </Typography>
              </Paper>
            ) : null}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DoctorsSearchPage;
