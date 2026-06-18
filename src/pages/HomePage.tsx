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
    Typography,
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { plPL } from "@mui/x-date-pickers/locales";
import { enUS } from "@mui/x-date-pickers/locales";
import { Controller } from "react-hook-form";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { useHomeSearch } from "../hooks/useHomeSearch";
import { LocationPicker } from "../components/shared/LocationPicker";

const HomePage = () => {
    const { t, i18n } = useTranslation();
    const h = useHomeSearch();

    const locale = i18n.language?.startsWith("en") ? "en" : "pl";
    const localeText =
        locale === "en"
            ? enUS.components.MuiLocalizationProvider.defaultProps.localeText
            : plPL.components.MuiLocalizationProvider.defaultProps.localeText;

    return (
        <LocalizationProvider
            dateAdapter={AdapterDayjs}
            adapterLocale={locale}
            localeText={localeText}
        >
            <Box sx={{ py: { xs: 2, md: 6 } }}>
                <Paper
                    elevation={0}
                    sx={{
                        mx: "auto",
                        maxWidth: 980,
                        p: { xs: 2.5, md: 5 },
                        borderRadius: 3,
                        border: (t) => `1px solid ${t.palette.divider}`,
                        bgcolor: "background.paper",
                    }}
                >
                    <Stack spacing={1} sx={{ textAlign: "center", mb: 4 }}>
                        <Typography
                            variant="h2"
                            sx={{
                                fontSize: { xs: "2rem", md: "3rem" },
                                lineHeight: 1.15,
                                fontWeight: 800,
                                color: "text.primary",
                            }}
                        >
                            {t("home.title")}
                        </Typography>
                        <Typography sx={{ color: "text.secondary", fontSize: { xs: 16, md: 22 } }}>
                            {t("home.subtitle")}
                        </Typography>
                    </Stack>
                    <Box component="form" onSubmit={h.handleSubmit}>
                        <Grid container spacing={2} sx={{ mb: 2.5 }}>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <FormControl fullWidth>
                                    <InputLabel id="specialization-label">
                                        {t("home.specializationLabel")}
                                    </InputLabel>
                                    <Controller
                                        name="specialization"
                                        control={h.control}
                                        render={({ field }) => (
                                            <Select
                                                labelId="specialization-label"
                                                label={t("home.specializationLabel")}
                                                {...field}
                                            >
                                                {h.specializations.map((item) => (
                                                    <MenuItem
                                                        key={item.specializationId}
                                                        value={String(item.specializationId)}
                                                    >
                                                        {item.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        )}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Controller
                                    name="location"
                                    control={h.control}
                                    render={({ field }) => (
                                        <LocationPicker
                                            label={t("home.cityLabel")}
                                            value={field.value}
                                            onChange={field.onChange}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Controller
                                    name="appointmentDate"
                                    control={h.control}
                                    render={({ field }) => (
                                        <DatePicker
                                            label={t("home.dateLabel")}
                                            value={field.value ? dayjs(field.value) : null}
                                            onChange={h.setAppointmentDate}
                                            disablePast
                                            slotProps={{
                                                textField: { fullWidth: true },
                                            }}
                                        />
                                    )}
                                />
                            </Grid>
                        </Grid>
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            size="large"
                            sx={{
                                py: 1.35,
                                fontWeight: 700,
                                textTransform: "none",
                                bgcolor: "primary.main",
                                "&:hover": { bgcolor: "primary.dark" },
                            }}
                        >
                            {t("home.searchButton")}
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </LocalizationProvider>
    );
};

export default HomePage;
