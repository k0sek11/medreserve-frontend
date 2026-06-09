import { Paper, Typography } from "@mui/material";

type ChipRatingProps = {
    value: number | null;
};

export const ChipRating = ({ value }: ChipRatingProps) => {
    return (
        <Paper
            elevation={2}
            sx={{
                position: "absolute",
                right: 14,
                bottom: -18,
                borderRadius: 99,
                px: 1.3,
                py: 0.45,
                display: "flex",
                alignItems: "center",
                gap: 0.5,
            }}
        >
            <Typography sx={{ color: "#ffb800", fontSize: 16, lineHeight: 1 }}>★</Typography>
            <Typography sx={{ fontWeight: 800 }}>{value?.toFixed(1) ?? "-"}</Typography>
        </Paper>
    );
};
