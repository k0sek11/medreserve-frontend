import { useState, useEffect, useRef } from "react";
import {
    TextField,
    List,
    ListItemButton,
    ListItemText,
    Paper,
    type TextFieldProps,
} from "@mui/material";
import { useTranslation } from "react-i18next";

type NominatimResult = {
    display_name: string;
    lat: string;
    lon: string;
};

type LocationPickerProps = Omit<TextFieldProps, "onChange"> & {
    value: string;
    onChange: (value: string) => void;
};

/**
 * Location input with free text autocomplete using Nominatim (OpenStreetMap).
 * No API key required. Respects Nominatim usage policy (1 req/s).
 */
export const LocationPicker = ({
    value,
    onChange,
    label,
    placeholder,
    required,
    fullWidth = true,
    error,
    helperText,
    ...rest
}: LocationPickerProps) => {
    const { t } = useTranslation();
    const [query, setQuery] = useState(value);
    const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
    const [open, setOpen] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        setQuery(value);
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchSuggestions = async (q: string) => {
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
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = e.target.value;
        setQuery(newVal);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => fetchSuggestions(newVal), 400);
    };

    const handleSelect = (item: NominatimResult) => {
        setQuery(item.display_name);
        onChange(item.display_name);
        setOpen(false);
    };

    return (
        <div
            ref={containerRef}
            style={{ position: "relative", width: fullWidth ? "100%" : undefined }}
        >
            <TextField
                label={label ?? t("common.location")}
                placeholder={placeholder ?? t("common.locationPlaceholder")}
                value={query}
                onChange={handleInputChange}
                required={required}
                fullWidth={fullWidth}
                error={error}
                helperText={helperText}
                autoComplete="off"
                {...rest}
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
                        maxHeight: 280,
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
        </div>
    );
};
