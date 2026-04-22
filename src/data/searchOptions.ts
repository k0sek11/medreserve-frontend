export const specializations = [
  "Kardiolog",
  "Dermatolog",
  "Internista",
  "Ortopeda",
  "Okulista",
] as const;

export const cities = [
  "Warszawa",
  "Krakow",
  "Wroclaw",
  "Gdansk",
  "Poznan",
] as const;

export const sortOptions = [
  { value: "priceAsc", label: "Cena rosnaco" },
  { value: "priceDesc", label: "Cena malejaco" },
  { value: "ratingDesc", label: "Najwyzsza ocena" },
] as const;
