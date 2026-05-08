import { useEffect, useMemo } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { Link as RouterLink } from "react-router-dom";
import { doctorsApi } from "../api/doctors";
import useDoctorSearchFilters from "../hooks/useDoctorSearchFilters";

const sortOptions = [
  { value: "priceAsc", label: "Cena rosnaco" },
  { value: "priceDesc", label: "Cena malejaco" },
  { value: "nameAsc", label: "Nazwisko A-Z" },
  { value: "nameDesc", label: "Nazwisko Z-A" },
] as const;

const DoctorsSearchPage = () => {
  const { filters, updateFilter, clearFilters } = useDoctorSearchFilters();
  const selectedCityId = filters.cityId ? Number(filters.cityId) : undefined;
  const selectedSpecializationId = filters.specializationId
    ? Number(filters.specializationId)
    : undefined;
  const selectedPage = Math.max(Number(filters.page || "1"), 1);
  const maxPrice = filters.priceMax ? Number(filters.priceMax) : undefined;

  const { data: cities = [], isLoading: isCitiesLoading } = useQuery({
    queryKey: ["search-cities", selectedSpecializationId],
    queryFn: () =>
      selectedSpecializationId
        ? doctorsApi.getCitiesBySpecialization(selectedSpecializationId)
        : doctorsApi.getCities(),
  });

  const {
    data: specializations = [],
    isLoading: isSpecializationsLoading,
    isFetching: isSpecializationsFetching,
  } = useQuery({
    queryKey: ["search-specializations", selectedCityId],
    queryFn: () =>
      selectedCityId
        ? doctorsApi.getSpecializationsByCity(selectedCityId)
        : doctorsApi.getSpecializations(),
  });

  const {
    data: doctorsPage,
    isLoading: isDoctorsLoading,
    isFetching: isDoctorsFetching,
  } = useQuery({
    queryKey: [
      "search-doctors",
      selectedCityId,
      selectedSpecializationId,
      filters.date,
      maxPrice,
      filters.sort,
      selectedPage,
    ],
    queryFn: () =>
      doctorsApi.search({
        cityId: selectedCityId,
        specializationId: selectedSpecializationId,
        date: filters.date || undefined,
        priceMax: maxPrice,
        sort: filters.sort,
        page: selectedPage,
        pageSize: 8,
      }),
    placeholderData: (previousData) => previousData,
  });

  const doctors = doctorsPage?.items ?? [];
  const isAnyLoading =
    isCitiesLoading || isDoctorsLoading || isDoctorsFetching || isSpecializationsFetching;

  const selectedCityOption = cities.find((item) => item.cityId === selectedCityId) ?? null;
  const selectedSpecializationOption =
    specializations.find((item) => item.specializationId === selectedSpecializationId) ?? null;

  useEffect(() => {
    if (selectedCityId && !selectedCityOption) {
      updateFilter("cityId", "");
    }
  }, [selectedCityId, selectedCityOption, updateFilter]);

  useEffect(() => {
    if (selectedSpecializationId && !selectedSpecializationOption) {
      updateFilter("specializationId", "");
    }
  }, [selectedSpecializationId, selectedSpecializationOption, updateFilter]);

  const filtersSummary = useMemo(() => {
    if (!selectedCityId) {
      return "Najpierw wybierz miasto, aby zawęzić specjalizacje i wyniki.";
    }

    return `Znaleziono ${doctorsPage?.totalCount ?? 0} lekarzy.`;
  }, [doctorsPage?.totalCount, selectedCityId]);

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

              <Autocomplete
                options={cities}
                value={selectedCityOption}
                loading={isCitiesLoading}
                onChange={(_, value) =>
                  updateFilter("cityId", value ? String(value.cityId) : "")
                }
                getOptionLabel={(option) => `${option.name} • ${option.district}`}
                isOptionEqualToValue={(option, value) => option.cityId === value.cityId}
                renderInput={(params) => (
                  <TextField {...params} label="Miasto" placeholder="Szukaj miasta" />
                )}
              />

              <Autocomplete
                options={specializations}
                value={selectedSpecializationOption}
                loading={isSpecializationsLoading}
                onChange={(_, value) =>
                  updateFilter("specializationId", value ? String(value.specializationId) : "")
                }
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(option, value) =>
                  option.specializationId === value.specializationId
                }
                renderInput={(params) => (
                  <TextField {...params} label="Specjalizacja" placeholder="Szukaj specjalizacji" />
                )}
              />

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
            <Typography sx={{ color: "#4f627a", fontWeight: 600 }}>
              {filtersSummary}
            </Typography>

            {isAnyLoading ? (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  border: "1px dashed #b8c8de",
                  borderRadius: 2,
                  textAlign: "center",
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ justifyContent: "center", alignItems: "center" }}
                >
                  <CircularProgress size={20} />
                  <Typography sx={{ color: "#4f627a" }}>Ladowanie danych...</Typography>
                </Stack>
              </Paper>
            ) : null}

            {!isAnyLoading
              ? doctors.map((doctor) => (
                  <Card
                    key={doctor.doctorId}
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
                              {doctor.fullName}
                            </Typography>
                            <Typography sx={{ color: "#4f627a" }}>
                              {doctor.specialization || "Brak specjalizacji"} | {doctor.city}
                            </Typography>
                          </Box>

                          <Chip
                            label={`${doctor.lowestPrice.toFixed(0)} zl`}
                            sx={{
                              bgcolor: "#eef6ff",
                              color: "#0b74c9",
                              fontWeight: 700,
                            }}
                          />
                        </Stack>

                        <Typography sx={{ color: "#23354d" }}>
                          Ocena: {doctor.rating?.toFixed(1) ?? "brak danych"}
                        </Typography>

                        <Button
                          variant="contained"
                          component={RouterLink}
                          to={`/lekarze/${doctor.doctorId}`}
                          sx={{ textTransform: "none", alignSelf: "flex-start" }}
                        >
                          Umow wizyte
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                ))
              : null}

            {!isAnyLoading && (doctorsPage?.totalPages ?? 1) > 1 ? (
              <Stack direction="row" sx={{ pt: 1, justifyContent: "center" }}>
                <Pagination
                  count={doctorsPage?.totalPages ?? 1}
                  page={selectedPage}
                  onChange={(_, value) => updateFilter("page", String(value))}
                  color="primary"
                />
              </Stack>
            ) : null}

            {!isAnyLoading && doctors.length === 0 ? (
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
                  Brak wynikow dla podanych filtrow. Zmien kryteria wyszukiwania.
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
