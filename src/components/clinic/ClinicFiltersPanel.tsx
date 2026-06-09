import {
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
import type { SpecializationDto } from "../../types/common";
import { sortOptions } from "./ClinicSortOptions";

type ClinicFiltersPanelProps = {
    filters: {
        name: string;
        location: string;
        specializationId: string;
        sort: string;
        page: string;
    };
    specializations: SpecializationDto[];
    updateFilter: (key: string, value: string) => void;
    clearFilters: () => void;
};

export const ClinicFiltersPanel = ({
    filters,
    specializations,
    updateFilter,
    clearFilters,
}: ClinicFiltersPanelProps) => (
    <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2, border: "1px solid #dce5f2" }}>
        <Stack spacing={2}>
            <Typography sx={{ fontWeight: 700, color: "#11223a" }}>Filtry</Typography>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                        fullWidth
                        label="Szukaj po nazwie"
                        placeholder='np. Przychodnia "Zdrowko"'
                        value={filters.name}
                        onChange={(e) => updateFilter("name", e.target.value)}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                        fullWidth
                        label="Szukaj po lokalizacji / adresie"
                        placeholder="np. Warszawa, al. Jerozolimskie"
                        value={filters.location}
                        onChange={(e) => updateFilter("location", e.target.value)}
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
                            onChange={(e) => updateFilter("specializationId", e.target.value)}
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
                            onChange={(e) => updateFilter("sort", e.target.value)}
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
);
