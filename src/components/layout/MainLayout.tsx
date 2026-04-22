import {
  AppBar,
  Box,
  Button,
  Container,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import { Link as RouterLink, NavLink, Outlet } from "react-router-dom";

const navLinks = [
  { to: "/", label: "Glowna" },
  { to: "/lekarze", label: "Lekarze" },
  { to: "/poradnie", label: "Poradnie" },
  { to: "/o-nas", label: "O nas" },
  { to: "/kontakt", label: "Kontakt" },
];

const MainLayout = () => {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fb" }}>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: "#0b74c9" }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: 72 }}>
            <Typography
              component={RouterLink}
              to="/"
              variant="h6"
              sx={{
                color: "white",
                textDecoration: "none",
                fontWeight: 700,
                mr: 4,
                letterSpacing: 0.4,
              }}
            >
              MedReserve
            </Typography>

            <Stack direction="row" spacing={1} sx={{ flexGrow: 1 }}>
              {navLinks.map((item) => (
                <Button
                  key={item.to}
                  component={NavLink}
                  to={item.to}
                  sx={{
                    color: "white",
                    px: 1.5,
                    fontSize: 14,
                    fontWeight: 500,
                    textTransform: "none",
                    borderBottom: "2px solid transparent",
                    borderRadius: 0,
                    "&.active": {
                      borderBottomColor: "white",
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Stack>

            <Stack direction="row" spacing={1.2}>
              <Button
                component={RouterLink}
                to="/login"
                variant="outlined"
                sx={{
                  color: "white",
                  borderColor: "rgba(255, 255, 255, 0.75)",
                  textTransform: "none",
                  fontWeight: 600,
                  px: 2,
                  "&:hover": {
                    borderColor: "white",
                    bgcolor: "rgba(255, 255, 255, 0.12)",
                  },
                }}
              >
                Zaloguj sie
              </Button>
              <Button
                component={RouterLink}
                to="/register"
                variant="contained"
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  px: 2,
                  bgcolor: "white",
                  color: "#0b74c9",
                  "&:hover": {
                    bgcolor: "#eef6ff",
                  },
                }}
              >
                Zarejestruj sie
              </Button>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
};

export default MainLayout;
