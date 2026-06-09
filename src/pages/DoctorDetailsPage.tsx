import {
    Box,
    Button,
    Card,
    CardContent,
    Divider,
    Grid,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { plPL } from "@mui/x-date-pickers/locales";
import { Link as RouterLink } from "react-router-dom";
import doctorImage from "../assets/Cr7_doctor.png";
import { useDoctorBooking } from "../hooks/useDoctorBooking";
import { RoundIconInfo } from "../components/doctor/RoundIconInfo";
import { ChipRating } from "../components/doctor/ChipRating";
import { DoctorBookingSection } from "../components/doctor/DoctorBookingSection";
import { Show } from "../components/shared/ShowHide";

const DoctorDetailsPage = () => {
    const booking = useDoctorBooking();
    const { isValidDoctorId, profileQuery, isOwnProfile } = booking;

    if (!isValidDoctorId) {
        return (
            <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: "1px solid #dce5f2" }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: "#11223a" }}>
                    Nieprawidłowy lekarz
                </Typography>
            </Paper>
        );
    }

    if (profileQuery.isLoading) {
        return (
            <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: "1px solid #dce5f2" }}>
                <Typography sx={{ color: "#4f627a" }}>Ładowanie profilu lekarza...</Typography>
            </Paper>
        );
    }

    if (profileQuery.isError || !profileQuery.data) {
        return (
            <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: "1px solid #dce5f2" }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: "#11223a" }}>
                    Nie znaleziono lekarza
                </Typography>
            </Paper>
        );
    }

    const profile = profileQuery.data;

    return (
        <LocalizationProvider
            dateAdapter={AdapterDayjs}
            adapterLocale="pl"
            localeText={plPL.components.MuiLocalizationProvider.defaultProps.localeText}
        >
            <Box sx={{ py: { xs: 2, md: 4 } }}>
                <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Card elevation={0} sx={{ border: "1px solid #dce5f2", borderRadius: 3 }}>
                            <Box sx={{ position: "relative" }}>
                                <Box
                                    component="img"
                                    src={doctorImage}
                                    alt={profile.fullName}
                                    sx={{ width: "100%", height: 320, objectFit: "cover" }}
                                />
                                <ChipRating value={profile.rating} />
                            </Box>
                            <CardContent>
                                <Stack spacing={1.2}>
                                    <Box>
                                        <Typography
                                            sx={{
                                                fontSize: 30,
                                                fontWeight: 800,
                                                color: "#11223a",
                                                lineHeight: 1.15,
                                            }}
                                        >
                                            {profile.fullName}
                                        </Typography>
                                        <Typography sx={{ color: "#5a6e86", fontSize: 18 }}>
                                            {profile.specializations.join(", ") ||
                                                "Brak specjalizacji"}
                                        </Typography>
                                    </Box>
                                    <Divider />
                                    <Stack spacing={0.8}>
                                        <RoundIconInfo
                                            icon="P"
                                            text={profile.phoneNumber ?? "Brak telefonu"}
                                        />
                                        <RoundIconInfo
                                            icon="M"
                                            text={profile.city ?? "Brak miasta"}
                                        />
                                        <RoundIconInfo
                                            icon="A"
                                            text={profile.streetAddress ?? "Brak adresu placówki"}
                                        />
                                    </Stack>
                                    <Show when={Boolean(profile.bio)}>
                                        <Typography sx={{ color: "#2f4258", lineHeight: 1.7 }}>
                                            {profile.bio}
                                        </Typography>
                                    </Show>
                                    <Show when={isOwnProfile}>
                                        <Button
                                            component={RouterLink}
                                            to="/moj-profil"
                                            variant="outlined"
                                            sx={{ textTransform: "none", fontWeight: 700 }}
                                        >
                                            Przejdź do mojego profilu
                                        </Button>
                                    </Show>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, md: 8 }}>
                        <DoctorBookingSection {...booking} />
                    </Grid>
                </Grid>
            </Box>
        </LocalizationProvider>
    );
};

export default DoctorDetailsPage;
