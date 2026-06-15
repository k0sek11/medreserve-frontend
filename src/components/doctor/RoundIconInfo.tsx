import { alpha, Avatar, Box, Typography, useTheme } from "@mui/material";

type RoundIconInfoProps = {
    icon: string;
    text: string;
};

export const RoundIconInfo = ({ icon, text }: RoundIconInfoProps) => {
    const theme = useTheme();
    return (
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Avatar
                sx={{
                    width: 34,
                    height: 34,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: "primary.main",
                }}
            >
                {icon}
            </Avatar>
            <Typography sx={{ color: "text.secondary", fontSize: 13 }}>{text}</Typography>
        </Box>
    );
};
