import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

export const PaperLikeLoading = () => {
    const { t } = useTranslation();

    return (
        <Box
            sx={{
                minHeight: 220,
                display: "grid",
                placeItems: "center",
                border: (theme) => `1px dashed ${theme.palette.divider}`,
                borderRadius: 2,
                mb: 2,
            }}
        >
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <CircularProgress size={20} />
                <Typography sx={{ color: "text.secondary" }}>
                    {t("common.loadingNotifications")}
                </Typography>
            </Stack>
        </Box>
    );
};
