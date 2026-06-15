import { Box, CircularProgress, Stack, Typography } from "@mui/material";

export const PaperLikeLoading = () => (
    <Box
        sx={{
            minHeight: 220,
            display: "grid",
            placeItems: "center",
            border: (t) => `1px dashed ${t.palette.divider}`,
            borderRadius: 2,
            mb: 2,
        }}
    >
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <CircularProgress size={20} />
            <Typography sx={{ color: "text.secondary" }}>Ładowanie powiadomień...</Typography>
        </Stack>
    </Box>
);
