import {
    Box,
    Button,
    Card,
    CardContent,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Typography,
    Alert,
} from "@mui/material";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import { Controller } from "react-hook-form";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { useDoctorSchedulesForm } from "../../hooks/useDoctorSchedulesForm";
import { parseTime, weekdayOptions } from "./DoctorProfilehelpers";

export const DoctorSchedules = () => {
    const { t } = useTranslation();
    const s = useDoctorSchedulesForm();

    return (
        <Stack spacing={4}>
            <Box component="form" onSubmit={s.onSubmit}>
                <Typography sx={{ fontWeight: 800, fontSize: 20, mb: 2 }}>
                    {s.editingSchedule.scheduleId
                        ? t("doctorProfile.editSchedule")
                        : t("doctorProfile.addSchedule")}
                </Typography>
                {s.errors.root && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {s.errors.root.message}
                    </Alert>
                )}

                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <FormControl fullWidth error={!!s.errors.clinicId}>
                            <InputLabel>{t("doctorProfile.clinic")}</InputLabel>
                            <Controller
                                name="clinicId"
                                control={s.control}
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        label={t("doctorProfile.clinic")}
                                        onChange={(e) => {
                                            field.onChange(e);
                                            s.handleClinicChange(String(e.target.value));
                                        }}
                                    >
                                        {s.clinicsQuery.data?.map((c) => (
                                            <MenuItem key={c.clinicId} value={String(c.clinicId)}>
                                                {c.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                )}
                            />
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <FormControl fullWidth error={!!s.errors.dayOfWeek}>
                            <InputLabel>{t("doctorProfile.dayOfWeek")}</InputLabel>
                            <Controller
                                name="dayOfWeek"
                                control={s.control}
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        label={t("doctorProfile.dayOfWeek")}
                                        onChange={(e) => {
                                            field.onChange(Number(e.target.value));
                                            s.handleDayOfWeekChange(Number(e.target.value));
                                        }}
                                    >
                                        {weekdayOptions.map((opt) => (
                                            <MenuItem key={opt.value} value={opt.value}>
                                                {t(`doctorProfile.weekdays.${opt.labelKey}`)}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                )}
                            />
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TimePicker
                            label={t("doctorProfile.from")}
                            value={s.editingSchedule.startTime}
                            onChange={s.handleStartTimeChange}
                            slotProps={{
                                textField: { fullWidth: true, error: !!s.errors.startTime },
                            }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TimePicker
                            label={t("doctorProfile.to")}
                            value={s.editingSchedule.endTime}
                            onChange={s.handleEndTimeChange}
                            slotProps={{
                                textField: { fullWidth: true, error: !!s.errors.endTime },
                            }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <DatePicker
                            label={t("doctorProfile.validFrom")}
                            value={s.editingSchedule.validFrom}
                            onChange={s.handleValidFromChange}
                            slotProps={{
                                textField: { fullWidth: true, error: !!s.errors.validFrom },
                            }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <DatePicker
                            label={t("doctorProfile.validTo")}
                            value={s.editingSchedule.validTo}
                            onChange={s.handleValidToChange}
                            slotProps={{ textField: { fullWidth: true } }}
                        />
                    </Grid>
                </Grid>
                <Button
                    type="submit"
                    variant="contained"
                    disabled={s.saveScheduleMutation.isPending || s.isSubmitting}
                    sx={{ mt: 2, fontWeight: 700 }}
                >
                    {s.saveScheduleMutation.isPending || s.isSubmitting
                        ? t("common.saving")
                        : t("doctorProfile.saveSchedule")}
                </Button>
            </Box>

            <Box>
                <Typography sx={{ fontWeight: 800, fontSize: 20, mb: 2 }}>
                    {t("doctorProfile.currentSchedules")}
                </Typography>
                <Stack spacing={1.5}>
                    {s.orderedSchedules.map((schedule) => (
                        <Card key={schedule.scheduleId} variant="outlined">
                            <CardContent
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}
                            >
                                <Box>
                                    <Typography sx={{ fontWeight: 700 }}>
                                        {weekdayOptions.find((o) => o.value === schedule.dayOfWeek)
                                            ?.labelKey
                                            ? t(
                                                  `doctorProfile.weekdays.${weekdayOptions.find((o) => o.value === schedule.dayOfWeek)!.labelKey}`,
                                              )
                                            : ""}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {schedule.clinicName}
                                    </Typography>
                                    <Typography variant="body2">
                                        {schedule.startTime} - {schedule.endTime}
                                    </Typography>
                                </Box>
                                <Stack direction="row" spacing={1}>
                                    <Button
                                        variant="outlined"
                                        onClick={() =>
                                            s.startEdit({
                                                scheduleId: schedule.scheduleId,
                                                clinicId: String(schedule.clinicId),
                                                dayOfWeek: schedule.dayOfWeek,
                                                startTime: parseTime(schedule.startTime),
                                                endTime: parseTime(schedule.endTime),
                                                validFrom: dayjs(schedule.validFrom),
                                                validTo: schedule.validTo
                                                    ? dayjs(schedule.validTo)
                                                    : null,
                                            })
                                        }
                                    >
                                        {t("common.edit")}
                                    </Button>
                                    <Button
                                        color="error"
                                        variant="outlined"
                                        onClick={() =>
                                            s.deleteScheduleMutation.mutate(schedule.scheduleId)
                                        }
                                    >
                                        {t("common.delete")}
                                    </Button>
                                </Stack>
                            </CardContent>
                        </Card>
                    ))}
                </Stack>
            </Box>
        </Stack>
    );
};
