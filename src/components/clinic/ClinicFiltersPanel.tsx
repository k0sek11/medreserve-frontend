import { useEffect } from "react";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import type { SpecializationDto } from "../../types/common";
import { sortOptions } from "./ClinicSortOptions";
import { LocationPicker } from "../shared/LocationPicker";
import { clinicFiltersSchema, type ClinicFiltersFormData } from "../../lib/validations";

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

    const { register, reset } = useForm<ClinicFiltersFormData>({
        resolver: zodResolver(clinicFiltersSchema),
        defaultValues: {
            name: filters.name,
            location: filters.location,
            specializationId: filters.specializationId,
            sort: filters.sort,
            page: filters.page,
        },
    });

    // Sync external filter changes back to form
    useEffect(() => {
        reset({
            name: filters.name,
            location: filters.location,
            specializationId: filters.specializationId,
            sort: filters.sort,
            page: filters.page,
        });
    }, [filters, reset]);

    const handleClear = () => {
        clearFilters();
        reset({
            name: "",
            location: "",
            specializationId: "",
            sort: "nameAsc",
            page: "1",
        });
    };

    return (
        <Paper
            elevation={0}
            sx={{ p: 2, mb: 3, borderRadius: 2, border: (t) => `1px solid ${t.palette.divider}` }}
        >
            <Stack spacing={2}>
                <Typography sx={{ fontWeight: 700, color: "text.primary" }}>
                    {t("common.filters")}
                </Typography>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <TextField
                            fullWidth
                            label={t("clinics.searchByName")}
                            placeholder={t("clinics.searchByNamePlaceholder")}
                            {...register("name")}
                            onChange={(e) => {
                                register("name").onChange(e);
                                updateFilter("name", e.target.value);
                            }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <LocationPicker
                            label={t("clinics.searchByLocation")}
                            value={filters.location}
                            onChange={(v) => updateFilter("location", v)}
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
                                {...register("specializationId")}
                                onChange={(e) => {
                                    register("specializationId").onChange(e);
                                    updateFilter("specializationId", e.target.value as string);
                                }}
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
                                {...register("sort")}
                                onChange={(e) => {
                                    register("sort").onChange(e);
                                    updateFilter("sort", e.target.value as string);
                                }}
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
                    onClick={handleClear}
                    sx={{ alignSelf: "flex-start", textTransform: "none" }}
                >
                    {t("common.clearFilters")}
                </Button>
            </Stack>
        </Paper>
    );
};
