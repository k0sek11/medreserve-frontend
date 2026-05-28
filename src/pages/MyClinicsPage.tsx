import { Button, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import ClinicsPage from "./ClinicsPage";

const MyClinicsPage = () => {
    return (
        <Stack spacing={2.5}>
            <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{ justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" } }}
            >
                <div>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: "#11223a" }}>
                        Moje przychodnie
                    </Typography>
                    <Typography sx={{ color: "#4f627a" }}>
                        Lista przychodni, do których masz dostęp jako lekarz.
                    </Typography>
                </div>

                <Button
                    component={RouterLink}
                    to="/poradnie/nowa"
                    variant="contained"
                    sx={{ textTransform: "none", fontWeight: 700 }}
                >
                    Zarejestruj przychodnię
                </Button>
            </Stack>

            <ClinicsPage mine />
        </Stack>
    );
};

export default MyClinicsPage;
