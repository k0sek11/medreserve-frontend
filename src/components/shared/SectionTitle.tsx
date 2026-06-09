import { Typography } from "@mui/material";

type SectionTitleProps = {
    title: string;
};

export const SectionTitle = ({ title }: SectionTitleProps) => (
    <Typography variant="h5" sx={{ fontWeight: 800, color: "#11223a", mb: 1.5 }}>
        {title}
    </Typography>
);
