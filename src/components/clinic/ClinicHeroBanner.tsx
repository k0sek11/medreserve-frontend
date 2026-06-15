import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { ClinicDetailDto } from "../../api/clinics";

type ClinicHeroBannerProps = {
    clinic: ClinicDetailDto;
    isOwner: boolean;
};

export const ClinicHeroBanner = ({ clinic, isOwner }: ClinicHeroBannerProps) => {
    const { t } = useTranslation();

    return (
        <PaperBanner>
            <InnerGlow />
            <Stack spacing={2} sx={{ position: "relative" }}>
                <Box>
                    <Chip
                        label={
                            clinic.isActive
                                ? t("clinicDetails.activeClinic")
                                : t("clinicDetails.inactiveClinic")
                        }
                        sx={{
                            mb: 2,
                            bgcolor: clinic.isActive
                                ? "rgba(34,197,94,0.2)"
                                : "rgba(239,68,68,0.2)",
                            color: "white",
                        }}
                    />
                    <Typography variant="h3" fontWeight={800} gutterBottom>
                        {clinic.name}
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{ maxWidth: 780, color: "rgba(255,255,255,0.88)" }}
                    >
                        {clinic.description || t("clinicDetails.noDescriptionHero")}
                    </Typography>
                </Box>
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.5}
                    alignItems={{ xs: "stretch", sm: "center" }}
                >
                    <Button
                        variant="contained"
                        color="inherit"
                        sx={{ color: "text.primary", fontWeight: 700 }}
                        href="#doctor-list"
                    >
                        {t("clinicDetails.seeDoctors")}
                    </Button>
                    <Button
                        variant="outlined"
                        sx={{ borderColor: "rgba(255,255,255,0.45)", color: "white" }}
                        href="#clinic-contact"
                    >
                        {t("clinicDetails.contactHours")}
                    </Button>
                    {isOwner && (
                        <Chip
                            label={t("clinicDetails.ownerView")}
                            sx={{ color: "white", borderColor: "rgba(255,255,255,0.35)" }}
                            variant="outlined"
                        />
                    )}
                </Stack>
            </Stack>
        </PaperBanner>
    );
};

const PaperBanner = ({ children }: { children: React.ReactNode }) => (
    <Box
        sx={{
            p: { xs: 3, md: 4 },
            mb: 3,
            borderRadius: 4,
            color: "white",
            background:
                "linear-gradient(135deg, rgba(26,32,44,0.95) 0%, rgba(45,55,72,0.95) 45%, rgba(20,184,166,0.85) 100%)",
            position: "relative",
            overflow: "hidden",
        }}
    >
        {children}
    </Box>
);

const InnerGlow = () => (
    <Box
        sx={{
            position: "absolute",
            inset: 0,
            background:
                "radial-gradient(circle at top right, rgba(255,255,255,0.14), transparent 30%), radial-gradient(circle at bottom left, rgba(255,255,255,0.08), transparent 26%)",
            pointerEvents: "none",
        }}
    />
);
