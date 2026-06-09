import { Box, Button, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import type { ClinicListItemDto } from "../../api/clinics";

type ClinicCardProps = {
    clinic: ClinicListItemDto;
};

export const ClinicCard = ({ clinic }: ClinicCardProps) => (
    <Card elevation={0} sx={{ border: "1px solid #dce5f2", borderRadius: 2 }}>
        <CardContent>
            <Stack spacing={1.25}>
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1}
                    sx={{
                        justifyContent: "space-between",
                        alignItems: { xs: "flex-start", sm: "center" },
                    }}
                >
                    <Box>
                        <Typography sx={{ fontWeight: 700, color: "#11223a", fontSize: 20 }}>
                            {clinic.name}
                        </Typography>
                        <Typography sx={{ color: "#4f627a" }}>
                            {clinic.city} | {clinic.streetAddress}
                        </Typography>
                    </Box>

                    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                        <Chip
                            label={`${clinic.doctorCount} lekarzy`}
                            sx={{ bgcolor: "#eef6ff", color: "#0b74c9", fontWeight: 700 }}
                        />
                        {clinic.isOwner && (
                            <Chip
                                label="Twoja placówka"
                                sx={{ bgcolor: "#e7f7ee", color: "#146c43", fontWeight: 700 }}
                            />
                        )}
                    </Stack>
                </Stack>

                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                    {clinic.specializations.map((spec) => (
                        <Chip key={spec} label={spec} variant="outlined" />
                    ))}
                </Stack>

                <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                    }}
                >
                    <Typography sx={{ color: "#4f627a" }}>
                        Status: {clinic.isActive ? "aktywna" : "nieaktywna"}
                    </Typography>

                    <Button
                        component={RouterLink}
                        to={`/poradnie/${clinic.clinicId}`}
                        variant="contained"
                        sx={{ textTransform: "none" }}
                    >
                        Zobacz szczegóły
                    </Button>
                </Stack>
            </Stack>
        </CardContent>
    </Card>
);
