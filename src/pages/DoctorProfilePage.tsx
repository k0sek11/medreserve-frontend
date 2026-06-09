import { Box, Chip, Grid, Paper, Stack, Typography } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { plPL } from "@mui/x-date-pickers/locales";
import { useDoctorProfile } from "../hooks/useDoctorProfile";
import { DoctorBio } from "../components/DoctorProfileComponents/DoctorBio";
import { DoctorCalendar } from "../components/DoctorProfileComponents/DoctorCalendar";
import { DoctorSchedules } from "../components/DoctorProfileComponents/DoctorSchedules";
import { AppointmentTypesSection } from "../components/DoctorProfileComponents/AppointmentTypesSection";
import { Show } from "../components/shared/ShowHide";

const DoctorProfilePage = () => {
    const { isDoctor, profileQuery } = useDoctorProfile();

    if (!isDoctor) {
        return (
            <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: "1px solid #dce5f2" }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: "#11223a", mb: 1 }}>
                    Brak profilu lekarza
                </Typography>
                <Typography sx={{ color: "#4f627a" }}>
                    To konto nie ma jeszcze przypisanego profilu lekarza.
                </Typography>
            </Paper>
        );
    }

    return (
        <LocalizationProvider
            dateAdapter={AdapterDayjs}
            adapterLocale="pl"
            localeText={plPL.components.MuiLocalizationProvider.defaultProps.localeText}
        >
            <Stack spacing={3}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: "#11223a", mb: 0.8 }}>
                        Mój profil lekarza
                    </Typography>
                    <Typography sx={{ color: "#4f627a" }}>
                        Zarządzaj opisem profilu i grafikami przypisanymi do konkretnych przychodni.
                    </Typography>
                </Box>
                <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid #dce5f2" }}>
                    <DoctorCalendar />
                </Paper>
                <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12, md: 4.2 }}>
                        <Paper
                            elevation={0}
                            sx={{ p: 2.5, borderRadius: 3, border: "1px solid #dce5f2" }}
                        >
                            <Stack spacing={1.5}>
                                <DoctorBio />
                                <Show when={Boolean(profileQuery.data?.specializations?.length)}>
                                    <Box>
                                        <Typography
                                            sx={{ fontWeight: 700, color: "#4f627a", mb: 0.8 }}
                                        >
                                            Specjalizacje
                                        </Typography>
                                        <Stack
                                            direction="row"
                                            spacing={1}
                                            useFlexGap
                                            sx={{ flexWrap: "wrap" }}
                                        >
                                            {profileQuery.data?.specializations.map((item) => (
                                                <Chip
                                                    key={item}
                                                    label={item}
                                                    sx={{ bgcolor: "#eef6ff", color: "#0b74c9" }}
                                                />
                                            ))}
                                        </Stack>
                                    </Box>
                                </Show>
                                <AppointmentTypesSection />
                            </Stack>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, md: 7.8 }}>
                        <Paper
                            elevation={0}
                            sx={{ p: 2.5, borderRadius: 3, border: "1px solid #dce5f2" }}
                        >
                            <DoctorSchedules />
                        </Paper>
                    </Grid>
                </Grid>
            </Stack>
        </LocalizationProvider>
    );
};

export default DoctorProfilePage;
