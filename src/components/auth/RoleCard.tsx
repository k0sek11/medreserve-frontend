import { alpha, Card, CardActionArea, CardContent, Typography } from "@mui/material";

type RoleCardProps = {
    title: string;
    description: string;
    active: boolean;
    onClick: () => void;
};

export const RoleCard = ({ title, description, active, onClick }: RoleCardProps) => (
    <Card
        elevation={0}
        sx={(t) => ({
            flex: 1,
            border: active
                ? `2px solid ${t.palette.primary.main}`
                : `1px solid ${t.palette.divider}`,
            borderRadius: 3,
            overflow: "hidden",
            bgcolor: active
                ? t.palette.mode === "dark"
                    ? alpha(t.palette.primary.main, 0.12)
                    : "#f2f8ff"
                : "background.paper",
        })}
    >
        <CardActionArea onClick={onClick} sx={{ height: "100%", alignItems: "stretch" }}>
            <CardContent sx={{ height: "100%" }}>
                <Typography sx={{ fontWeight: 800, color: "text.primary", fontSize: 20, mb: 0.6 }}>
                    {title}
                </Typography>
                <Typography sx={{ color: "text.secondary" }}>{description}</Typography>
            </CardContent>
        </CardActionArea>
    </Card>
);
