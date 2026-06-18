import { useEffect, useRef } from "react";
import { Box, Typography, Stack } from "@mui/material";
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

type LeafletMapProps = {
    
    lat?: number | null;
    
    lng?: number | null;
    
    address?: string;
    height?: number;
};

export const LeafletMap = ({ lat, lng, address, height = 300 }: LeafletMapProps) => {
    const { t } = useTranslation();
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);

    useEffect(() => {
        if (!mapContainerRef.current) return;
        let cancelled = false;

        const initMap = async () => {
            let center: [number, number] = [52.0, 19.0];
            let zoom = 6;
            let popupText = address || "";

            if (lat != null && lng != null) {
                center = [lat, lng];
                zoom = 15;
                popupText = address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            } else if (address?.trim()) {
                try {
                    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&accept-language=pl`;
                    const res = await fetch(url);
                    const data = (await res.json()) as {
                        lat: string;
                        lon: string;
                        display_name: string;
                    }[];
                    if (!cancelled && data.length) {
                        center = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
                        zoom = 15;
                        popupText = data[0].display_name || address;
                    }
                } catch {
                                    }
            }

            if (cancelled || !mapContainerRef.current) return;

            if (mapRef.current) {
                mapRef.current.remove();
            }

            const map = L.map(mapContainerRef.current, {
                attributionControl: false,
                zoomControl: true,
            }).setView(center, zoom);

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                maxZoom: 19,
                attribution:
                    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            }).addTo(map);

            if (markerRef.current) markerRef.current.remove();

            const marker = L.marker(center).addTo(map).bindPopup(popupText);
            markerRef.current = marker;
            mapRef.current = map;
        };

        initMap();

        return () => {
            cancelled = true;
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [lat, lng, address]);

    return (
        <Box
            ref={mapContainerRef}
            sx={{
                width: "100%",
                height,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                background:
                    "linear-gradient(135deg, rgba(148,163,184,0.12) 0%, rgba(56,189,248,0.08) 100%)",
                display: "grid",
                placeItems: "center",
                "& .leaflet-container": {
                    width: "100%",
                    height: "100%",
                    borderRadius: "12px",
                },
            }}
        >
            <Stack spacing={1} alignItems="center" sx={{ p: 2 }}>
                <Typography fontWeight={700}>{t("clinicDetails.mapPreview")}</Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                    {address || t("clinicDetails.mapInfo")}
                </Typography>
            </Stack>
        </Box>
    );
};
