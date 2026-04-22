import { useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  Paper,
  Stack,
  Tab,
  TextField,
  Tabs,
  Typography,
} from "@mui/material";
import doctorImage from "../assets/Cr7_doctor.png";

const doctorProfile = {
  name: "Dr Anna Nowak",
  specialization: "Kardiolog",
  rating: 4.9,
  city: "Warszawa",
  address: "ul. Mokotowska 11, Warszawa",
  phone: "+48 500 222 333",
};

const appointmentHours = [
  "08:00",
  "09:00",
  "11:00",
  "13:00",
  "16:00",
  "18:00",
  "21:00",
];

const formatDateForInput = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const dateToSeed = (date: string) => {
  return date
    .split("-")
    .join("")
    .split("")
    .reduce((acc, digit) => acc + Number(digit), 0);
};

const getBookedHoursForDate = (date: string) => {
  const seed = dateToSeed(date);

  return appointmentHours.filter((_, index) => (seed + index * 3) % 5 === 0);
};

const sectionContent = {
  about:
    " Lorem ipsum dolor sit amet consectetur adipisicing elit. Nihil fugit quidem ratione eos molestias veritatis rem ullam maiores dicta iure consequuntur non ducimus voluptatem, consectetur necessitatibus ad neque est ab",
  experience:
    "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nihil fugit quidem ratione eos molestias veritatis rem ullam maiores dicta iure consequuntur non ducimus voluptatem, consectetur necessitatibus ad neque est ab",
  pricing:
    " Lorem ipsum dolor sit amet consectetur adipisicing elit. Nihil fugit quidem ratione eos molestias veritatis rem ullam maiores dicta iure consequuntur non ducimus voluptatem, consectetur necessitatibus ad neque est ab",
};

const DoctorDetailsPage = () => {
  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);
  const todayString = useMemo(() => formatDateForInput(today), [today]);

  const [activeTab, setActiveTab] = useState(0);
  const [selectedDate, setSelectedDate] = useState(todayString);
  const [selectedHour, setSelectedHour] = useState("");

  const timeSlots = useMemo(() => {
    const bookedHours = getBookedHoursForDate(selectedDate);

    return appointmentHours.map((hour) => ({
      hour,
      isBooked: bookedHours.includes(hour),
    }));
  }, [selectedDate]);

  const canConfirmReservation = useMemo(() => {
    return timeSlots.some(
      (slot) => slot.hour === selectedHour && !slot.isBooked,
    );
  }, [selectedHour, timeSlots]);

  const activeSection = useMemo(() => {
    if (activeTab === 1) {
      return sectionContent.experience;
    }

    if (activeTab === 2) {
      return sectionContent.pricing;
    }

    return sectionContent.about;
  }, [activeTab]);

  return (
    <Box sx={{ py: { xs: 2, md: 4 } }}>
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 3.3 }}>
          <Card
            elevation={0}
            sx={{ border: "1px solid #dce5f2", borderRadius: 2.5 }}
          >
            <Box sx={{ position: "relative" }}>
              <Box
                component="img"
                src={doctorImage}
                alt={doctorProfile.name}
                sx={{ width: "100%", height: 300, objectFit: "cover" }}
              />
              <ChipRating value={doctorProfile.rating} />
            </Box>

            <CardContent>
              <Stack spacing={0.5}>
                <Typography
                  sx={{
                    fontSize: 36,
                    fontWeight: 700,
                    color: "#11223a",
                    lineHeight: 1.2,
                  }}
                >
                  {doctorProfile.name}
                </Typography>
                <Typography sx={{ color: "#5a6e86", fontSize: 22 }}>
                  {doctorProfile.specialization}
                </Typography>
              </Stack>
            </CardContent>

            <Divider />

            <Box
              sx={{
                py: 1.3,
                display: "flex",
                justifyContent: "space-around",
                alignItems: "center",
                gap: 1,
              }}
            >
              <RoundIconInfo icon="P" text={doctorProfile.phone} />
              <RoundIconInfo icon="M" text={doctorProfile.city} />
            </Box>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5.9 }}>
          <Paper
            elevation={0}
            sx={{ border: "1px solid #dce5f2", borderRadius: 2.5 }}
          >
            <Tabs
              value={activeTab}
              onChange={(_, nextValue) => setActiveTab(nextValue)}
              variant="fullWidth"
              sx={{
                borderBottom: "1px solid #e2eaf5",
                "& .MuiTab-root": { textTransform: "none", fontWeight: 700 },
              }}
            >
              <Tab label="O mnie" />
              <Tab label="Doswiadczenie" />
              <Tab label="Cennik" />
            </Tabs>

            <Box sx={{ p: { xs: 2, md: 3 } }}>
              <Typography
                sx={{
                  color: "#11223a",
                  fontWeight: 700,
                  fontSize: 30,
                  mb: 1.1,
                }}
              >
                {activeTab === 0
                  ? "O mnie"
                  : activeTab === 1
                    ? "Doswiadczenie"
                    : "Cennik"}
              </Typography>
              <Typography
                sx={{ color: "#2f4258", lineHeight: 1.65, fontSize: 23 }}
              >
                {activeSection}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 2.8 }}>
          <Paper
            elevation={0}
            sx={{
              border: "1px solid #dce5f2",
              borderRadius: 2.5,
              p: 2,
              height: "fit-content",
            }}
          >
            <Typography
              sx={{ fontWeight: 800, color: "#11223a", fontSize: 44, mb: 1.5 }}
            >
              Umow Wizyte
            </Typography>

            <Typography
              sx={{ fontWeight: 700, color: "#4f627a", mb: 0.8, fontSize: 19 }}
            >
              Dzien
            </Typography>
            <TextField
              fullWidth
              type="date"
              value={selectedDate}
              onChange={(event) => {
                setSelectedDate(event.target.value);
                setSelectedHour("");
              }}
              slotProps={{ htmlInput: { min: todayString } }}
              sx={{ mb: 1.5 }}
            />

            <Box sx={{ display: "flex", gap: 1.8, mb: 1.4 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.7 }}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: 99,
                    bgcolor: "#1f9b45",
                  }}
                />
                <Typography sx={{ color: "#4f627a", fontSize: 13 }}>
                  Wolne
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.7 }}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: 99,
                    bgcolor: "#cbd5e2",
                  }}
                />
                <Typography sx={{ color: "#4f627a", fontSize: 13 }}>
                  Zajete
                </Typography>
              </Box>
            </Box>

            <Typography
              sx={{ fontWeight: 700, color: "#4f627a", mb: 1, fontSize: 19 }}
            >
              Godzina
            </Typography>
            <Grid container spacing={0.8} sx={{ mb: 1.5 }}>
              {timeSlots.map((slot) => (
                <Grid key={slot.hour} size={6}>
                  <Button
                    fullWidth
                    disabled={slot.isBooked}
                    variant={
                      selectedHour === slot.hour && !slot.isBooked
                        ? "contained"
                        : "outlined"
                    }
                    onClick={() => {
                      if (!slot.isBooked) {
                        setSelectedHour(slot.hour);
                      }
                    }}
                    sx={{
                      textTransform: "none",
                      minHeight: 38,
                      borderColor: slot.isBooked ? "#d8e0ec" : undefined,
                      color: slot.isBooked ? "#9aa8ba" : undefined,
                      bgcolor: slot.isBooked ? "#f5f7fb" : undefined,
                    }}
                  >
                    {slot.hour}
                  </Button>
                </Grid>
              ))}
            </Grid>

            <Typography sx={{ color: "#4f627a", fontSize: 13, mb: 1.2 }}>
              {canConfirmReservation
                ? `Wybrany termin: ${selectedDate}, ${selectedHour}`
                : "Wybierz wolna godzine, aby potwierdzic rezerwacje."}
            </Typography>

            <Button
              variant="contained"
              fullWidth
              disabled={!canConfirmReservation}
              sx={{ textTransform: "none", fontWeight: 700, py: 1.1 }}
            >
              Zarezerwuj wizytę
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

type ChipRatingProps = {
  value: number;
};

const ChipRating = ({ value }: ChipRatingProps) => {
  return (
    <Paper
      elevation={2}
      sx={{
        position: "absolute",
        right: 14,
        bottom: -18,
        borderRadius: 99,
        px: 1.3,
        py: 0.45,
        display: "flex",
        alignItems: "center",
        gap: 0.5,
      }}
    >
      <Typography sx={{ color: "#ffb800", fontSize: 16, lineHeight: 1 }}>
        ★
      </Typography>
      <Typography sx={{ fontWeight: 800 }}>{value.toFixed(1)}</Typography>
    </Paper>
  );
};

type RoundIconInfoProps = {
  icon: string;
  text: string;
};

const RoundIconInfo = ({ icon, text }: RoundIconInfoProps) => {
  return (
    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
      <Avatar
        sx={{ width: 34, height: 34, bgcolor: "#eef6ff", color: "#0b74c9" }}
      >
        {icon}
      </Avatar>
      <Typography sx={{ color: "#5a6e86", fontSize: 13 }}>{text}</Typography>
    </Box>
  );
};

export default DoctorDetailsPage;
