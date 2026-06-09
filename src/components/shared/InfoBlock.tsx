import { Stack, Typography } from "@mui/material";

type InfoBlockProps = {
    label: string;
    value: string;
};

export const InfoBlock = ({ label, value }: InfoBlockProps) => {
    return (
        <Stack spacing={0.5}>
            <Typography variant="caption" color="text.secondary">
                {label}
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {value}
            </Typography>
        </Stack>
    );
};
