import type { ReactNode } from "react";
import { Box, Container, Paper, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

type AuthPageShellProps = {
  title: string;
  subtitle: string;
  footer: ReactNode;
  children: ReactNode;
};

const AuthPageShell = ({
  title,
  subtitle,
  footer,
  children,
}: AuthPageShellProps) => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        py: { xs: 3, md: 6 },
        background:
          "radial-gradient(circle at top left, rgba(11, 116, 201, 0.14), transparent 44%), radial-gradient(circle at bottom right, rgba(11, 116, 201, 0.2), transparent 40%), #f5f8fc",
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            border: "1px solid #d6e1ef",
            borderRadius: 3,
            p: { xs: 3, md: 4 },
            backgroundColor: "white",
          }}
        >
          <Stack spacing={1.5} sx={{ mb: 3 }}>
            <Typography
              component={RouterLink}
              to="/"
              sx={{
                textDecoration: "none",
                color: "#0b74c9",
                fontWeight: 800,
                letterSpacing: 0.3,
                width: "fit-content",
              }}
            >
              MedReserve
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "#11223a" }}>
              {title}
            </Typography>
            <Typography sx={{ color: "#4f627a" }}>{subtitle}</Typography>
          </Stack>

          {children}

          <Box sx={{ mt: 3 }}>{footer}</Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default AuthPageShell;
