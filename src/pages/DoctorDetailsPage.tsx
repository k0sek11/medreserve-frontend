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
import { enUS } from "@mui/x-date-pickers/locales";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDoctorBooking } from "../hooks/useDoctorBooking";
import { RoundIconInfo } from "../components/doctor/RoundIconInfo";
import { DoctorBookingSection } from "../components/doctor/DoctorBookingSection";
import doctorImage from "../assets/Cr7_doctor.png";
import { Show } from "../components/shared/ShowHide";

const DoctorDetailsPage = () => {
    const { t, i18n } = useTranslation();
    const booking = useDoctorBooking();
    const { isValidDoctorId, profileQuery, isOwnProfile } = booking;

    const locale = i18n.language?.startsWith("en") ? "en" : "pl";
    const localeText =
        locale === "en"
            ? enUS.components.MuiLocalizationProvider.defaultProps.localeText
            : plPL.components.MuiLocalizationProvider.defaultProps.localeText;

    if (!isValidDoctorId) {
        return (
            <Paper
                elevation={0}
                sx={{ p: 4, borderRadius: 3, border: (t) => `1px solid ${t.palette.divider}` }}
            >
                <Typography variant="h5" sx={{ fontWeight: 800, color: "text.primary" }}>
                    {t("doctorDetails.invalidDoctor")}
                </Typography>
            </Paper>
        );
    }

    if (profileQuery.isLoading) {
        return (
            <Paper
                elevation={0}
                sx={{ p: 4, borderRadius: 3, border: (t) => `1px solid ${t.palette.divider}` }}
            >
                <Typography sx={{ color: "text.secondary" }}>
                    {t("doctorDetails.loadingProfile")}
                </Typography>
            </Paper>
        );
    }

    if (profileQuery.isError || !profileQuery.data) {
        return (
            <Paper
                elevation={0}
                sx={{ p: 4, borderRadius: 3, border: (t) => `1px solid ${t.palette.divider}` }}
            >
                <Typography variant="h5" sx={{ fontWeight: 800, color: "text.primary" }}>
                    {t("doctorDetails.notFound")}
                </Typography>
            </Paper>
        );
    }

    const profile = profileQuery.data;

    return (
        <LocalizationProvider
            dateAdapter={AdapterDayjs}
            adapterLocale={locale}
            localeText={localeText}
        >
            <Box sx={{ py: { xs: 2, md: 4 } }}>
                <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Card
                            elevation={0}
                            sx={{
                                border: (t) => `1px solid ${t.palette.divider}`,
                                borderRadius: 3,
                            }}
                        >
                            <Box sx={{ position: "relative" }}>
                                <Box
                                    component="img"
                                    src={profile.profileImageUrl ?? doctorImage}
                                    alt={profile.fullName}
                                    sx={{ width: "100%", height: 320, objectFit: "contain" }}
                                />
                            </Box>
                            <CardContent>
                                <Stack spacing={1.2}>
                                    <Box>
                                        <Typography
                                            sx={{
                                                fontSize: 30,
                                                fontWeight: 800,
                                                color: "text.primary",
                                                lineHeight: 1.15,
                                            }}
                                        >
                                            {profile.fullName}
                                        </Typography>
                                        <Typography sx={{ color: "text.secondary", fontSize: 18 }}>
                                            {profile.specializations.join(", ") ||
                                                t("doctors.noSpecialization")}
                                        </Typography>
                                    </Box>
                                    <Divider />
                                    <Stack spacing={0.8}>
                                        <RoundIconInfo
                                            icon="P"
                                            text={profile.phoneNumber ?? t("doctorDetails.noPhone")}
                                        />
                                        <RoundIconInfo
                                            icon="M"
                                            text={profile.city ?? t("doctorDetails.noCity")}
                                        />
                                        <RoundIconInfo
                                            icon="A"
                                            text={
                                                profile.streetAddress ??
                                                t("doctorDetails.noAddress")
                                            }
                                        />
                                    </Stack>
                                    <Show when={Boolean(profile.bio)}>
                                        <Typography
                                            sx={{ color: "text.secondary", lineHeight: 1.7 }}
                                        >
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
                                            {t("doctorDetails.goToMyProfile")}
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
