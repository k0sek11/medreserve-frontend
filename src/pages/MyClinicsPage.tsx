import { Button, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ClinicsPage from "./ClinicsPage";

const MyClinicsPage = () => {
    const { t } = useTranslation();

    return (
        <Stack spacing={2.5}>
            <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{
                    justifyContent: "space-between",
                    alignItems: { xs: "flex-start", sm: "center" },
                }}
            >
                <div>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: "#11223a" }}>
                        {t("clinics.myClinics")}
                    </Typography>
                    <Typography sx={{ color: "#4f627a" }}>{t("clinics.myClinicsDesc")}</Typography>
                </div>

                <Button
                    component={RouterLink}
                    to="/poradnie/nowa"
                    variant="contained"
                    sx={{ textTransform: "none", fontWeight: 700 }}
                >
                    {t("clinics.registerClinic")}
                </Button>
            </Stack>

            <ClinicsPage mine />
        </Stack>
    );
};

export default MyClinicsPage;
