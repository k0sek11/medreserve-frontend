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
import { useTranslation } from "react-i18next";
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
}: ClinicFiltersPanelProps) => {
    const { t } = useTranslation();

    return (
        <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2, border: "1px solid #dce5f2" }}>
            <Stack spacing={2}>
                <Typography sx={{ fontWeight: 700, color: "#11223a" }}>
                    {t("common.filters")}
                </Typography>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <TextField
                            fullWidth
                            label={t("clinics.searchByName")}
                            placeholder={t("clinics.searchByNamePlaceholder")}
                            value={filters.name}
                            onChange={(e) => updateFilter("name", e.target.value)}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <TextField
                            fullWidth
                            label={t("clinics.searchByLocation")}
                            placeholder={t("clinics.searchByLocationPlaceholder")}
                            value={filters.location}
                            onChange={(e) => updateFilter("location", e.target.value)}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <FormControl fullWidth>
                            <InputLabel id="clinic-specialization-label">
                                {t("clinics.selectSpecialization")}
                            </InputLabel>
                            <Select
                                labelId="clinic-specialization-label"
                                label={t("clinics.selectSpecialization")}
                                value={filters.specializationId}
                                onChange={(e) => updateFilter("specializationId", e.target.value)}
                            >
                                <MenuItem value="">{t("common.all")}</MenuItem>
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
                            <InputLabel id="clinic-sort-label">{t("common.sorting")}</InputLabel>
                            <Select
                                labelId="clinic-sort-label"
                                label={t("common.sorting")}
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
                    {t("common.clearFilters")}
                </Button>
            </Stack>
        </Paper>
    );
};
