export type DoctorItem = {
  id: number;
  name: string;
  specialization: string;
  city: string;
  rating: number;
  price: number;
  availableDates: string[];
};

export const doctors: DoctorItem[] = [
  {
    id: 1,
    name: "Dr Anna Nowak",
    specialization: "Kardiolog",
    city: "Warszawa",
    rating: 4.9,
    price: 220,
    availableDates: ["2026-04-25", "2026-04-26", "2026-04-29"],
  },
  {
    id: 2,
    name: "Dr Piotr Kowalski",
    specialization: "Kardiolog",
    city: "Krakow",
    rating: 4.7,
    price: 180,
    availableDates: ["2026-04-24", "2026-04-28", "2026-05-03"],
  },
  {
    id: 3,
    name: "Dr Katarzyna Wisniewska",
    specialization: "Dermatolog",
    city: "Wroclaw",
    rating: 4.8,
    price: 210,
    availableDates: ["2026-04-30", "2026-05-02", "2026-05-04"],
  },
  {
    id: 4,
    name: "Dr Michal Zielinski",
    specialization: "Internista",
    city: "Warszawa",
    rating: 4.5,
    price: 150,
    availableDates: ["2026-04-23", "2026-04-24", "2026-04-27"],
  },
  {
    id: 5,
    name: "Dr Ewa Kaminska",
    specialization: "Ortopeda",
    city: "Gdansk",
    rating: 4.6,
    price: 260,
    availableDates: ["2026-04-28", "2026-05-01", "2026-05-06"],
  },
  {
    id: 6,
    name: "Dr Tomasz Lewandowski",
    specialization: "Okulista",
    city: "Poznan",
    rating: 4.4,
    price: 190,
    availableDates: ["2026-04-22", "2026-04-26", "2026-05-05"],
  },
];
