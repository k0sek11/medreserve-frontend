import { Badge } from "@mui/material";
import { PickerDay, type PickerDayProps } from "@mui/x-date-pickers";

export type BookingCalendarDayProps = PickerDayProps & {
    availableDays: Set<string>;
};

export const BookingCalendarDay = ({
    availableDays,
    day,
    outsideCurrentMonth,
    ...other
}: BookingCalendarDayProps) => {
    const isAvailable = !outsideCurrentMonth && availableDays.has(day.format("YYYY-MM-DD"));

    return (
        <Badge overlap="circular" variant="dot" color="success" invisible={!isAvailable}>
            <PickerDay {...other} day={day} outsideCurrentMonth={outsideCurrentMonth} />
        </Badge>
    );
};
