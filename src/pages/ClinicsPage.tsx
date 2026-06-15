import { Box, CircularProgress, Pagination, Paper, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useClinicsSearch } from "../hooks/useClinicsSearch";
import { ClinicCard } from "../components/clinic/ClinicCard";
import { ClinicFiltersPanel } from "../components/clinic/ClinicFiltersPanel";
import { Show } from "../components/shared/ShowHide";

type ClinicsPageProps = { mine?: boolean };

const ClinicsPage = ({ mine = false }: ClinicsPageProps) => {
    const { t } = useTranslation();
    const {
        specializations,
        clinics,
        isLoading,
        title,
        subtitle,
        filtersSummary,
        filters,
        updateFilter,
        clearFilters,
        clinicsPage,
        selectedPage,
    } = useClinicsSearch(mine);

    return (
        <Box sx={{ py: { xs: 2, md: 4 } }}>
            <Stack spacing={0.8} sx={{ mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: "text.primary" }}>
                    {title}
                </Typography>
                <Typography sx={{ color: "text.secondary" }}>{subtitle}</Typography>
            </Stack>
            <Show when={!mine}>
                <ClinicFiltersPanel
                    filters={filters}
                    specializations={specializations}
                    updateFilter={(k, v) => updateFilter(k, v)}
                    clearFilters={clearFilters}
                />
            </Show>
            <Typography sx={{ color: "text.secondary", fontWeight: 600, mb: 2 }}>
                {filtersSummary}
            </Typography>
            <Show when={isLoading}>
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        border: (t) => `1px dashed ${t.palette.divider}`,
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
                        <Typography sx={{ color: "text.secondary" }}>
                            {t("clinics.loadingClinics")}
                        </Typography>
                    </Stack>
                </Paper>
            </Show>
            <Stack spacing={2}>
                {clinics.map((c) => (
                    <ClinicCard key={c.clinicId} clinic={c} />
                ))}
                <Show when={!isLoading && clinics.length === 0}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            border: (t) => `1px dashed ${t.palette.divider}`,
                            borderRadius: 2,
                            textAlign: "center",
                        }}
                    >
                        <Typography sx={{ color: "text.secondary" }}>{t("clinics.noClinics")}</Typography>
                    </Paper>
                </Show>
            </Stack>
            <Show when={!mine && clinicsPage && clinicsPage?.totalPages > 1}>
                <Stack direction="row" sx={{ pt: 2, justifyContent: "center" }}>
                    <Pagination
                        count={clinicsPage?.totalPages}
                        page={selectedPage}
                        onChange={(_, v) => updateFilter("page", String(v))}
                        color="primary"
                    />
                </Stack>
            </Show>
        </Box>
    );
};

export default ClinicsPage;
