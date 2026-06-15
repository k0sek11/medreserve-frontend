import { useEffect, useRef, useCallback, useState } from "react";
import {
    Box,
    TextField,
    Typography,
    Stack,
    List,
    ListItemButton,
    ListItemText,
    Paper,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

type NominatimResult = {
    display_name: string;
    lat: string;
    lon: string;
};

type MapLocationPickerProps = {
    label?: string;
    lat?: number | null;
    lng?: number | null;
    city?: string;
    onChange: (data: { lat: number; lng: number; city: string }) => void;
    initialCenter?: [number, number];
    height?: number;
    required?: boolean;
    error?: boolean;
    helperText?: string;
};

/**
 * Combined location picker: search-as-you-type input + clickable map.
 * - Type in the input to search via Nominatim, pick from dropdown
 * - Click on the map to place/move the pin (reverse geocodes to short name)
 */
export const MapLocationPicker = ({
    label,
    lat,
    lng,
    city,
    onChange,
    initialCenter = [52.0, 19.0],
    height = 300,
    required,
    error,
    helperText,
}: MapLocationPickerProps) => {
    const { t } = useTranslation();
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const [query, setQuery] = useState(city || "");
    const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
    const [open, setOpen] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Sync external city changes
    useEffect(() => {
        setQuery(city || "");
    }, [city]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // ──── Nominatim search for text input ────
    const fetchSuggestions = useCallback(async (q: string) => {
        if (q.trim().length < 2) {
            setSuggestions([]);
            setOpen(false);
            return;
        }
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&addressdetails=1&limit=5&accept-language=pl`,
            );
            const data = (await res.json()) as NominatimResult[];
            setSuggestions(data);
            setOpen(data.length > 0);
        } catch {
            setSuggestions([]);
            setOpen(false);
        }
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = e.target.value;
        setQuery(newVal);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => fetchSuggestions(newVal), 400);
    };

    // ──── Reverse geocode (map click) ────
    const reverseGeocode = useCallback(async (latVal: number, lngVal: number) => {
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latVal}&lon=${lngVal}&accept-language=pl&zoom=14`,
            );
            const data = (await res.json()) as {
                address?: {
                    city?: string;
                    town?: string;
                    village?: string;
                    municipality?: string;
                    county?: string;
                    suburb?: string;
                    neighbourhood?: string;
                };
                display_name?: string;
            };
            const addr = data.address || {};
            const parts = [
                addr.city || addr.town || addr.village || addr.municipality,
                addr.suburb || addr.neighbourhood || addr.county,
            ].filter(Boolean);
            return (
                parts.join(", ") ||
                data.display_name ||
                `${latVal.toFixed(4)}, ${lngVal.toFixed(4)}`
            );
        } catch {
            return `${latVal.toFixed(4)}, ${lngVal.toFixed(4)}`;
        }
    }, []);

    // ──── Place/update marker and call onChange ────
    const placeMarker = useCallback(
        async (newLat: number, newLng: number, placeName?: string) => {
            if (!mapRef.current) return;
            if (markerRef.current) {
                markerRef.current.setLatLng([newLat, newLng]);
            } else {
                markerRef.current = L.marker([newLat, newLng]).addTo(mapRef.current);
            }
            mapRef.current.setView([newLat, newLng], mapRef.current.getZoom());

            const name = placeName || (await reverseGeocode(newLat, newLng));
            setQuery(name);
            onChange({ lat: newLat, lng: newLng, city: name });
        },
        [onChange, reverseGeocode],
    );

    // ──── Handle dropdown selection (forward geocode → place marker) ────
    const handleSelect = useCallback(
        (item: NominatimResult) => {
            setQuery(item.display_name);
            setOpen(false);
            const newLat = parseFloat(item.lat);
            const newLng = parseFloat(item.lon);
            if (!isNaN(newLat) && !isNaN(newLng)) {
                placeMarker(newLat, newLng, item.display_name);
            }
        },
        [placeMarker],
    );

    // ──── Initialize map ────
    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        const center: [number, number] = lat && lng ? [lat, lng] : initialCenter;
        const zoom = lat && lng ? 15 : 6;

        const map = L.map(mapContainerRef.current, {
            attributionControl: false,
            zoomControl: true,
        }).setView(center, zoom);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        mapRef.current = map;

        if (lat && lng) {
            markerRef.current = L.marker([lat, lng]).addTo(map);
        }

        map.on("click", async (e: L.LeafletMouseEvent) => {
            const { lat: newLat, lng: newLng } = e.latlng;
            await placeMarker(newLat, newLng);
        });

        return () => {
            map.remove();
            mapRef.current = null;
            markerRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Update marker when coords change externally
    useEffect(() => {
        if (!mapRef.current || lat == null || lng == null) return;
        if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
        } else {
            markerRef.current = L.marker([lat, lng]).addTo(mapRef.current);
        }
        mapRef.current.setView([lat, lng], mapRef.current.getZoom());
    }, [lat, lng]);

    return (
        <Stack spacing={1} ref={containerRef}>
            {label && (
                <Typography
                    variant="body2"
                    sx={{ fontWeight: 500, color: error ? "#b42318" : "text.primary" }}
                >
                    {label} {required ? "*" : ""}
                </Typography>
            )}
            <Box sx={{ position: "relative" }}>
                <TextField
                    value={query}
                    onChange={handleInputChange}
                    placeholder={t("common.locationPlaceholder")}
                    size="small"
                    fullWidth
                    error={error}
                    helperText={helperText || t("map.clickToSelect")}
                    autoComplete="off"
                />
                {open && suggestions.length > 0 && (
                    <Paper
                        elevation={4}
                        sx={{
                            position: "absolute",
                            top: "100%",
                            left: 0,
                            right: 0,
                            zIndex: 1300,
                            maxHeight: 240,
                            overflowY: "auto",
                            mt: 0.5,
                        }}
                    >
                        <List dense disablePadding>
                            {suggestions.map((item, idx) => (
                                <ListItemButton
                                    key={idx}
                                    onClick={() => handleSelect(item)}
                                    sx={{ py: 1 }}
                                >
                                    <ListItemText
                                        primary={item.display_name}
                                        slotProps={{
                                            primary: {
                                                sx: { fontSize: 14, wordBreak: "break-word" },
                                            },
                                        }}
                                    />
                                </ListItemButton>
                            ))}
                        </List>
                    </Paper>
                )}
            </Box>
            <Box
                ref={mapContainerRef}
                sx={{
                    width: "100%",
                    height,
                    borderRadius: 2,
                    border: `1px solid ${error ? "#b42318" : "divider"}`,
                    cursor: "crosshair",
                    "& .leaflet-container": {
                        width: "100%",
                        height: "100%",
                        borderRadius: "8px",
                    },
                }}
            />
        </Stack>
    );
};
