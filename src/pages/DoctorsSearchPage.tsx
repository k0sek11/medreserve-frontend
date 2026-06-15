import {
    alpha,
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
import { useTranslation } from "react-i18next";
import { useDoctorSearch } from "../hooks/useDoctorSearch";
import { LocationPicker } from "../components/shared/LocationPicker";
import { Show } from "../components/shared/ShowHide";

const sortOptions = [
    { value: "priceAsc", label: "doctors.sortOptions.priceAsc" },
    { value: "priceDesc", label: "doctors.sortOptions.priceDesc" },
    { value: "nameAsc", label: "doctors.sortOptions.nameAsc" },
    { value: "nameDesc", label: "doctors.sortOptions.nameDesc" },
] as const;

const DoctorsSearchPage = () => {
    const { t } = useTranslation();
    const s = useDoctorSearch();

    return (
        <Box sx={{ py: { xs: 2, md: 4 } }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "text.primary", mb: 0.8 }}>
                {t("doctors.searchResults")}
            </Typography>
            <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, md: 4, lg: 3.4 }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2,
                            borderRadius: 2,
                            border: (t) => `1px solid ${t.palette.divider}`,
                            position: { md: "sticky" },
                            top: 88,
                        }}
                    >
                        <Stack spacing={2}>
                            <Typography sx={{ fontWeight: 700, color: "text.primary" }}>
                                {t("common.filters")}
                            </Typography>
                            <LocationPicker
                                label={t("common.city")}
                                placeholder={t("doctors.cityPlaceholder")}
                                value={s.filters.location}
                                onChange={(v) => s.updateFilter("location", v)}
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
                                        label={t("common.specialization")}
                                        placeholder={t("doctors.specializationPlaceholder")}
                                    />
                                )}
                            />
                            <TextField
                                label={t("common.date")}
                                type="date"
                                value={s.filters.date}
                                onChange={(e) => s.updateFilter("date", e.target.value)}
                                slotProps={{ inputLabel: { shrink: true } }}
                                fullWidth
                            />
                            <TextField
                                label={t("doctors.maxPrice")}
                                type="number"
                                value={s.filters.priceMax}
                                onChange={(e) => s.updateFilter("priceMax", e.target.value)}
                                fullWidth
                                slotProps={{ htmlInput: { min: 0, step: 10 } }}
                            />
                            <FormControl fullWidth>
                                <InputLabel id="results-sort">{t("doctors.sortBy")}</InputLabel>
                                <Select
                                    labelId="results-sort"
                                    label={t("doctors.sortBy")}
                                    value={s.filters.sort}
                                    onChange={(e) => s.updateFilter("sort", e.target.value)}
                                >
                                    {sortOptions.map((o) => (
                                        <MenuItem key={o.value} value={o.value}>
                                            {t(o.label)}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <Button
                                variant="outlined"
                                onClick={s.clearFilters}
                                sx={{ textTransform: "none" }}
                            >
                                {t("common.clearFilters")}
                            </Button>
                        </Stack>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 8, lg: 8.6 }}>
                    <Stack spacing={1.6}>
                        <Typography sx={{ color: "text.secondary", fontWeight: 600 }}>
                            {s.filtersSummary}
                        </Typography>
                        <Show when={s.isAnyLoading}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    border: (t) => `1px dashed ${t.palette.divider}`,
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
                                    <Typography sx={{ color: "text.secondary" }}>
                                        {t("doctors.loadingDoctors")}
                                    </Typography>
                                </Stack>
                            </Paper>
                        </Show>
                        <Show when={!s.isAnyLoading && s.doctors.length === 0}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    border: (t) => `1px dashed ${t.palette.divider}`,
                                    borderRadius: 2,
                                    textAlign: "center",
                                }}
                            >
                                <Typography sx={{ color: "text.secondary" }}>
                                    {t("doctors.noResults")}
                                </Typography>
                            </Paper>
                        </Show>
                        {s.doctors.map((d) => (
                            <Card
                                key={d.doctorId}
                                elevation={0}
                                sx={{
                                    border: (t) => `1px solid ${t.palette.divider}`,
                                    borderRadius: 2,
                                }}
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
                                                        color: "text.primary",
                                                        fontSize: 20,
                                                    }}
                                                >
                                                    {d.fullName}
                                                </Typography>
                                                <Typography sx={{ color: "text.secondary" }}>
                                                    {d.specialization ||
                                                        t("doctors.noSpecialization")}{" "}
                                                    | {d.city}
                                                </Typography>
                                            </Box>
                                            <Chip
                                                label={`${d.lowestPrice.toFixed(0)} ${t("doctors.pricePrefix")}`}
                                                sx={(t) => ({
                                                    bgcolor: alpha(t.palette.primary.main, 0.1),
                                                    color: "primary.main",
                                                    fontWeight: 700,
                                                })}
                                            />
                                        </Stack>
                                        <Button
                                            variant="contained"
                                            component={RouterLink}
                                            to={`/lekarze/${d.doctorId}`}
                                            sx={{ textTransform: "none", alignSelf: "flex-start" }}
                                        >
                                            {t("doctors.bookVisit")}
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
