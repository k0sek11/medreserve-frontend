import { alpha, Box, Chip, Grid, Paper, Stack, Typography } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { plPL } from "@mui/x-date-pickers/locales";
import { enUS } from "@mui/x-date-pickers/locales";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import "dayjs/locale/pl";
import "dayjs/locale/en";
import { useDoctorProfile } from "../hooks/useDoctorProfile";
import { DoctorBio } from "../components/DoctorProfileComponents/DoctorBio";
import { DoctorCalendar } from "../components/DoctorProfileComponents/DoctorCalendar";
import { DoctorSchedules } from "../components/DoctorProfileComponents/DoctorSchedules";
import { AppointmentTypesSection } from "../components/DoctorProfileComponents/AppointmentTypesSection";
import { Show } from "../components/shared/ShowHide";

const DoctorProfilePage = () => {
    const { t, i18n } = useTranslation();
    const { isDoctor, profileQuery } = useDoctorProfile();

    const locale = i18n.language?.startsWith("en") ? "en" : "pl";
    const localeText =
        locale === "en"
            ? enUS.components.MuiLocalizationProvider.defaultProps.localeText
            : plPL.components.MuiLocalizationProvider.defaultProps.localeText;

    useEffect(() => {
        dayjs.locale(locale);
    }, [locale]);

    if (!isDoctor) {
        return (
            <Paper
                elevation={0}
                sx={{ p: 4, borderRadius: 3, border: (t) => `1px solid ${t.palette.divider}` }}
            >
                <Typography variant="h5" sx={{ fontWeight: 800, color: "text.primary", mb: 1 }}>
                    {t("doctorProfile.noProfile")}
                </Typography>
                <Typography sx={{ color: "text.secondary" }}>
                    {t("doctorProfile.noProfileDesc")}
                </Typography>
            </Paper>
        );
    }

    return (
        <LocalizationProvider
            dateAdapter={AdapterDayjs}
            adapterLocale={locale}
            localeText={localeText}
        >
            <Stack spacing={3}>
                <Box>
                    <Typography
                        variant="h4"
                        sx={{ fontWeight: 800, color: "text.primary", mb: 0.8 }}
                    >
                        {t("doctorProfile.myProfile")}
                    </Typography>
                    <Typography sx={{ color: "text.secondary" }}>
                        {t("doctorProfile.profileManagementDesc")}
                    </Typography>
                </Box>
                <Paper
                    elevation={0}
                    sx={{
                        p: 2.5,
                        borderRadius: 3,
                        border: (t) => `1px solid ${t.palette.divider}`,
                    }}
                >
                    <DoctorCalendar />
                </Paper>
                <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12, md: 4.2 }}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2.5,
                                borderRadius: 3,
                                border: (t) => `1px solid ${t.palette.divider}`,
                            }}
                        >
                            <Stack spacing={1.5}>
                                <DoctorBio />
                                <Show when={Boolean(profileQuery.data?.specializations?.length)}>
                                    <Box>
                                        <Typography
                                            sx={{
                                                fontWeight: 700,
                                                color: "text.secondary",
                                                mb: 0.8,
                                            }}
                                        >
                                            {t("doctorProfile.specializations")}
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
                                                    sx={(t) => ({
                                                        bgcolor: alpha(t.palette.primary.main, 0.1),
                                                        color: "primary.main",
                                                    })}
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
                            sx={{
                                p: 2.5,
                                borderRadius: 3,
                                border: (t) => `1px solid ${t.palette.divider}`,
                            }}
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
