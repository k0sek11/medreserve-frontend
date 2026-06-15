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
    TextField,
    Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useHomeSearch } from "../hooks/useHomeSearch";
import { LocationPicker } from "../components/shared/LocationPicker";

const HomePage = () => {
    const { t } = useTranslation();
    const h = useHomeSearch();

    return (
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
                <Grid container spacing={2} sx={{ mb: 2.5 }}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <FormControl fullWidth>
                            <InputLabel id="specialization-label">
                                {t("home.specializationLabel")}
                            </InputLabel>
                            <Select
                                labelId="specialization-label"
                                label={t("home.specializationLabel")}
                                value={h.specialization}
                                onChange={(e) => h.setSpecialization(e.target.value)}
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
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <LocationPicker
                            label={t("home.cityLabel")}
                            value={h.location}
                            onChange={h.setLocation}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <TextField
                            fullWidth
                            label={t("home.dateLabel")}
                            type="date"
                            value={h.appointmentDate}
                            onChange={(e) => h.setAppointmentDate(e.target.value)}
                            slotProps={{ inputLabel: { shrink: true } }}
                        />
                    </Grid>
                </Grid>
                <Button
                    type="button"
                    variant="contained"
                    onClick={h.handleSearch}
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
            </Paper>
        </Box>
    );
};

export default HomePage;
