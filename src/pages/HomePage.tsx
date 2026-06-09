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
import { useHomeSearch } from "../hooks/useHomeSearch";

const HomePage = () => {
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
                    border: "1px solid #dde7f3",
                    backgroundColor: "#ffffff",
                }}
            >
                <Stack spacing={1} sx={{ textAlign: "center", mb: 4 }}>
                    <Typography
                        variant="h2"
                        sx={{
                            fontSize: { xs: "2rem", md: "3rem" },
                            lineHeight: 1.15,
                            fontWeight: 800,
                            color: "#11223a",
                        }}
                    >
                        Znajdź i Umów Wizytę u Specjalisty
                    </Typography>
                    <Typography sx={{ color: "#4f627a", fontSize: { xs: 16, md: 22 } }}>
                        Najszybszy sposób na rezerwację medyczną online.
                    </Typography>
                </Stack>
                <Grid container spacing={2} sx={{ mb: 2.5 }}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <FormControl fullWidth>
                            <InputLabel id="specialization-label">Wybierz specjalizację</InputLabel>
                            <Select
                                labelId="specialization-label"
                                label="Wybierz specjalizację"
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
                        <FormControl fullWidth>
                            <InputLabel id="city-label">Wybierz miasto</InputLabel>
                            <Select
                                labelId="city-label"
                                label="Wybierz miasto"
                                value={h.city}
                                onChange={(e) => h.setCity(e.target.value)}
                            >
                                {h.cities.map((item) => (
                                    <MenuItem key={item.cityId} value={String(item.cityId)}>
                                        {item.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <TextField
                            fullWidth
                            label="Data"
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
                        bgcolor: "#0b74c9",
                        "&:hover": { bgcolor: "#095fa6" },
                    }}
                >
                    Szukaj terminu
                </Button>
            </Paper>
        </Box>
    );
};

export default HomePage;
