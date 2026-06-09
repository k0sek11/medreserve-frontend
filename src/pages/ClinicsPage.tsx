import {
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
    Paper,
    Select,
    Stack,
    TextField,
    Typography,
    Pagination,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import useClinicSearchFilters from "../hooks/useClinicSearchFilters";
import { clinicsApi, type ClinicListItemDto } from "../api/clinics";
import { doctorsApi } from "../api/doctors";
import { Link as RouterLink } from "react-router-dom";

const sortOptions = [
    { value: "nameAsc", label: "Nazwa A-Z" },
    { value: "nameDesc", label: "Nazwa Z-A" },
    { value: "cityAsc", label: "Lokalizacja A-Z" },
    { value: "doctorCountDesc", label: "Najwiecej lekarzy" },
] as const;

type ClinicsPageProps = {
    mine?: boolean;
};

const ClinicsPage = ({ mine = false }: ClinicsPageProps) => {
    const { filters, updateFilter, clearFilters } = useClinicSearchFilters();
    const selectedSpecializationId = filters.specializationId
        ? Number(filters.specializationId)
        : undefined;
    const selectedPage = Math.max(Number(filters.page || "1"), 1);

    const { data: specializations = [] } = useQuery({
        queryKey: ["clinic-search-specializations"],
        queryFn: () => doctorsApi.getSpecializations(),
        enabled: !mine,
    });

    const { data: mineClinics = [], isLoading: isMineLoading } = useQuery({
        queryKey: ["clinic-mine", mine],
        queryFn: () => clinicsApi.mine(),
        enabled: mine,
    });

    const { data: clinicsPage, isLoading: isSearchLoading } = useQuery({
        queryKey: [
            "clinic-search",
            filters.name,
            filters.location,
            selectedSpecializationId,
            filters.sort,
            selectedPage,
        ],
        queryFn: () =>
            clinicsApi.list({
                name: filters.name || undefined,
                location: filters.location || undefined,
                specializationId: selectedSpecializationId,
                sort: filters.sort,
                page: selectedPage,
                pageSize: 6,
            }),
        enabled: !mine,
    });

    const clinics = (mine ? mineClinics : (clinicsPage?.items ?? [])) as ClinicListItemDto[];
    const isLoading = mine ? isMineLoading : isSearchLoading;

    const title = mine ? "Moje przychodnie" : "Poradnie";
    const subtitle = mine
        ? "Lista przychodni przypisanych do Twojego profilu lekarza."
        : "Szukaj przychodni po nazwie, lokalizacji i specjalizacji.";

    const filtersSummary = useMemo(() => {
        return mine
            ? `Znaleziono ${clinics.length} poradni.`
            : `Znaleziono ${clinicsPage?.totalCount ?? 0} poradni.`;
    }, [clinics.length, clinicsPage?.totalCount, mine]);

    return (
        <Box sx={{ py: { xs: 2, md: 4 } }}>
            <Stack spacing={0.8} sx={{ mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: "#11223a" }}>
                    {title}
                </Typography>
                <Typography sx={{ color: "#4f627a" }}>{subtitle}</Typography>
            </Stack>

            {!mine ? (
                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        mb: 3,
                        borderRadius: 2,
                        border: "1px solid #dce5f2",
                    }}
                >
                    <Stack spacing={2}>
                        <Typography sx={{ fontWeight: 700, color: "#11223a" }}>Filtry</Typography>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    fullWidth
                                    label="Szukaj po nazwie"
                                    placeholder='np. Przychodnia "Zdrowko"'
                                    value={filters.name}
                                    onChange={(event) => updateFilter("name", event.target.value)}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    fullWidth
                                    label="Szukaj po lokalizacji / adresie"
                                    placeholder="np. Warszawa, al. Jerozolimskie"
                                    value={filters.location}
                                    onChange={(event) =>
                                        updateFilter("location", event.target.value)
                                    }
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <FormControl fullWidth>
                                    <InputLabel id="clinic-specialization-label">
                                        Wybierz specjalizacje
                                    </InputLabel>
                                    <Select
                                        labelId="clinic-specialization-label"
                                        label="Wybierz specjalizacje"
                                        value={filters.specializationId}
                                        onChange={(event) =>
                                            updateFilter("specializationId", event.target.value)
                                        }
                                    >
                                        <MenuItem value="">Wszystkie</MenuItem>
                                        {specializations.map((item) => (
                                            <MenuItem
                                                key={item.specializationId}
                                                value={String(item.specializationId)}
                                            >
                                                {item.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <FormControl fullWidth>
                                    <InputLabel id="clinic-sort-label">Sortowanie</InputLabel>
                                    <Select
                                        labelId="clinic-sort-label"
                                        label="Sortowanie"
                                        value={filters.sort}
                                        onChange={(event) =>
                                            updateFilter("sort", event.target.value)
                                        }
                                    >
                                        {sortOptions.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>

                        <Button
                            variant="outlined"
                            onClick={clearFilters}
                            sx={{ alignSelf: "flex-start", textTransform: "none" }}
                        >
                            Wyczyść filtry
                        </Button>
                    </Stack>
                </Paper>
            ) : null}

            <Typography sx={{ color: "#4f627a", fontWeight: 600, mb: 2 }}>
                {filtersSummary}
            </Typography>

            {isLoading ? (
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        border: "1px dashed #b8c8de",
                        borderRadius: 2,
                        textAlign: "center",
                        mb: 2,
                    }}
                >
                    <Stack
                        direction="row"
                        spacing={1}
                        sx={{ justifyContent: "center", alignItems: "center" }}
                    >
                        <CircularProgress size={20} />
                        <Typography sx={{ color: "#4f627a" }}>Ladowanie poradni...</Typography>
                    </Stack>
                </Paper>
            ) : null}

            <Stack spacing={2}>
                {clinics.map((clinic) => (
                    <Card
                        key={clinic.clinicId}
                        elevation={0}
                        sx={{ border: "1px solid #dce5f2", borderRadius: 2 }}
                    >
                        <CardContent>
                            <Stack spacing={1.25}>
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
                                            sx={{ fontWeight: 700, color: "#11223a", fontSize: 20 }}
                                        >
                                            {clinic.name}
                                        </Typography>
                                        <Typography sx={{ color: "#4f627a" }}>
                                            {clinic.city} | {clinic.streetAddress}
                                        </Typography>
                                    </Box>

                                    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                                        <Chip
                                            label={`${clinic.doctorCount} lekarzy`}
                                            sx={{
                                                bgcolor: "#eef6ff",
                                                color: "#0b74c9",
                                                fontWeight: 700,
                                            }}
                                        />
                                        {clinic.isOwner ? (
                                            <Chip
                                                label="Twoja placówka"
                                                sx={{
                                                    bgcolor: "#e7f7ee",
                                                    color: "#146c43",
                                                    fontWeight: 700,
                                                }}
                                            />
                                        ) : null}
                                    </Stack>
                                </Stack>

                                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                                    {clinic.specializations.map((specialization) => (
                                        <Chip
                                            key={specialization}
                                            label={specialization}
                                            variant="outlined"
                                        />
                                    ))}
                                </Stack>

                                <Stack
                                    direction="row"
                                    spacing={1}
                                    sx={{
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        flexWrap: "wrap",
                                    }}
                                >
                                    <Typography sx={{ color: "#4f627a" }}>
                                        Status: {clinic.isActive ? "aktywna" : "nieaktywna"}
                                    </Typography>

                                    <Button
                                        component={RouterLink}
                                        to={`/poradnie/${clinic.clinicId}`}
                                        variant="contained"
                                        sx={{ textTransform: "none" }}
                                    >
                                        Zobacz szczegoly
                                    </Button>
                                </Stack>
                            </Stack>
                        </CardContent>
                    </Card>
                ))}

                {!isLoading && clinics.length === 0 ? (
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
                            Brak poradni dla podanych filtrów. Zmień kryteria wyszukiwania.
                        </Typography>
                    </Paper>
                ) : null}
            </Stack>

            {!mine && clinicsPage && clinicsPage.totalPages > 1 ? (
                <Stack direction="row" sx={{ pt: 2, justifyContent: "center" }}>
                    <Pagination
                        count={clinicsPage.totalPages}
                        page={selectedPage}
                        onChange={(_, value) => updateFilter("page", String(value))}
                        color="primary"
                    />
                </Stack>
            ) : null}
        </Box>
    );
};

export default ClinicsPage;
