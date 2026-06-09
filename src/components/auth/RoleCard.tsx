import { Card, CardActionArea, CardContent, Typography } from "@mui/material";

type RoleCardProps = {
    title: string;
    description: string;
    active: boolean;
    onClick: () => void;
};

export const RoleCard = ({ title, description, active, onClick }: RoleCardProps) => (
    <Card
        elevation={0}
        sx={{
            flex: 1,
            border: active ? "2px solid #0b74c9" : "1px solid #dce5f2",
            borderRadius: 3,
            overflow: "hidden",
            bgcolor: active ? "#f2f8ff" : "white",
        }}
    >
        <CardActionArea onClick={onClick} sx={{ height: "100%", alignItems: "stretch" }}>
            <CardContent sx={{ height: "100%" }}>
                <Typography sx={{ fontWeight: 800, color: "#11223a", fontSize: 20, mb: 0.6 }}>
                    {title}
                </Typography>
                <Typography sx={{ color: "#4f627a" }}>{description}</Typography>
            </CardContent>
        </CardActionArea>
    </Card>
);
