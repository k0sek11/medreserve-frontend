import { Avatar, Box, Typography } from "@mui/material";

type RoundIconInfoProps = {
    icon: string;
    text: string;
};

export const RoundIconInfo = ({ icon, text }: RoundIconInfoProps) => {
    return (
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Avatar sx={{ width: 34, height: 34, bgcolor: "#eef6ff", color: "#0b74c9" }}>
                {icon}
            </Avatar>
            <Typography sx={{ color: "#5a6e86", fontSize: 13 }}>{text}</Typography>
        </Box>
    );
};
