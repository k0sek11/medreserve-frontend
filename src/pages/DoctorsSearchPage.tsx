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
import { Link as RouterLink } from "react-router-dom";
import { useDoctorSearch } from "../hooks/useDoctorSearch";
import { Show } from "../components/shared/ShowHide";

const sortOptions = [
    { value: "priceAsc", label: "Cena rosnaco" },
    { value: "priceDesc", label: "Cena malejaco" },
    { value: "nameAsc", label: "Nazwisko A-Z" },
    { value: "nameDesc", label: "Nazwisko Z-A" },
] as const;

const DoctorsSearchPage = () => {
    const s = useDoctorSearch();

    return (
        <Box sx={{ py: { xs: 2, md: 4 } }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "#11223a", mb: 0.8 }}>
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
                                options={s.cities}
                                value={s.selectedCityOption}
                                loading={s.isCitiesLoading}
                                onChange={(_, v) =>
                                    s.updateFilter("cityId", v ? String(v.cityId) : "")
                                }
                                getOptionLabel={(o) => `${o.name} • ${o.district}`}
                                isOptionEqualToValue={(o, v) => o.cityId === v.cityId}
                                renderInput={(p) => (
                                    <TextField {...p} label="Miasto" placeholder="Szukaj miasta" />
                                )}
                            />
                            <Autocomplete
                                options={s.specializations}
                                value={s.selectedSpecializationOption}
                                loading={s.isSpecializationsLoading}
                                onChange={(_, v) =>
                                    s.updateFilter(
                                        "specializationId",
                                        v ? String(v.specializationId) : "",
                                    )
                                }
                                getOptionLabel={(o) => o.name}
                                isOptionEqualToValue={(o, v) =>
                                    o.specializationId === v.specializationId
                                }
                                renderInput={(p) => (
                                    <TextField
                                        {...p}
                                        label="Specjalizacja"
                                        placeholder="Szukaj specjalizacji"
                                    />
                                )}
                            />
                            <TextField
                                label="Data"
                                type="date"
                                value={s.filters.date}
                                onChange={(e) => s.updateFilter("date", e.target.value)}
                                slotProps={{ inputLabel: { shrink: true } }}
                                fullWidth
                            />
                            <TextField
                                label="Cena maksymalna"
                                type="number"
                                value={s.filters.priceMax}
                                onChange={(e) => s.updateFilter("priceMax", e.target.value)}
                                fullWidth
                                slotProps={{ htmlInput: { min: 0, step: 10 } }}
                            />
                            <FormControl fullWidth>
                                <InputLabel id="results-sort">Sortowanie</InputLabel>
                                <Select
                                    labelId="results-sort"
                                    label="Sortowanie"
                                    value={s.filters.sort}
                                    onChange={(e) => s.updateFilter("sort", e.target.value)}
                                >
                                    {sortOptions.map((o) => (
                                        <MenuItem key={o.value} value={o.value}>
                                            {o.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <Button
                                variant="outlined"
                                onClick={s.clearFilters}
                                sx={{ textTransform: "none" }}
                            >
                                Wyczyść filtry
                            </Button>
                        </Stack>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 8, lg: 8.6 }}>
                    <Stack spacing={1.6}>
                        <Typography sx={{ color: "#4f627a", fontWeight: 600 }}>
                            {s.filtersSummary}
                        </Typography>
                        <Show when={s.isAnyLoading}>
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
                                    <Typography sx={{ color: "#4f627a" }}>
                                        Ładowanie danych...
                                    </Typography>
                                </Stack>
                            </Paper>
                        </Show>
                        <Show when={!s.isAnyLoading && s.doctors.length === 0}>
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
                                    Brak wyników dla podanych filtrów.
                                </Typography>
                            </Paper>
                        </Show>
                        {s.doctors.map((d) => (
                            <Card
                                key={d.doctorId}
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
                                                    {d.fullName}
                                                </Typography>
                                                <Typography sx={{ color: "#4f627a" }}>
                                                    {d.specialization || "Brak specjalizacji"} |{" "}
                                                    {d.city}
                                                </Typography>
                                            </Box>
                                            <Chip
                                                label={`${d.lowestPrice.toFixed(0)} zł`}
                                                sx={{
                                                    bgcolor: "#eef6ff",
                                                    color: "#0b74c9",
                                                    fontWeight: 700,
                                                }}
                                            />
                                        </Stack>
                                        <Typography sx={{ color: "#23354d" }}>
                                            Ocena: {d.rating?.toFixed(1) ?? "brak danych"}
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            component={RouterLink}
                                            to={`/lekarze/${d.doctorId}`}
                                            sx={{ textTransform: "none", alignSelf: "flex-start" }}
                                        >
                                            Umów wizytę
                                        </Button>
                                    </Stack>
                                </CardContent>
                            </Card>
                        ))}
                        <Show when={!s.isAnyLoading && (s.doctorsPage?.totalPages ?? 1) > 1}>
                            <Stack direction="row" sx={{ pt: 1, justifyContent: "center" }}>
                                <Pagination
                                    count={s.doctorsPage?.totalPages ?? 1}
                                    page={s.selectedPage}
                                    onChange={(_, v) => s.updateFilter("page", String(v))}
                                    color="primary"
                                />
                            </Stack>
                        </Show>
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
};

export default DoctorsSearchPage;
