import { useState, useMemo } from "react";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { doctorsApi, type UpsertDoctorScheduleDto } from "../../api/doctors";
import { clinicsApi } from "../../api/clinics";
import {
    createEmptyScheduleDraft,
    parseTime,
    toDateString,
    toTimeString,
    weekdayOptions,
} from "./DoctorProfilehelpers";

export const DoctorSchedules = () => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [scheduleDraft, setScheduleDraft] = useState(createEmptyScheduleDraft());
    const [scheduleError, setScheduleError] = useState<string | null>(null);

    const schedulesQuery = useQuery({
        queryKey: ["doctor-my-schedules"],
        queryFn: () => doctorsApi.getMySchedules(),
    });
    const clinicsQuery = useQuery({
        queryKey: ["doctor-my-clinics"],
        queryFn: () => clinicsApi.mine(),
    });

    const saveScheduleMutation = useMutation({
        mutationFn: (payload: UpsertDoctorScheduleDto) =>
            scheduleDraft.scheduleId
                ? doctorsApi.updateMySchedule(scheduleDraft.scheduleId, payload)
                : doctorsApi.upsertMySchedule(payload),
        onSuccess: async () => {
            setScheduleError(null);
            setScheduleDraft(createEmptyScheduleDraft());
            await queryClient.invalidateQueries({ queryKey: ["doctor-my-schedules"] });
        },
        onError: (err) =>
            setScheduleError(
                err instanceof Error ? err.message : t("doctorProfile.scheduleErrors.saveError"),
            ),
    });

    const deleteScheduleMutation = useMutation({
        mutationFn: (id: number) => doctorsApi.deleteMySchedule(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["doctor-my-schedules"] }),
    });

    const submitSchedule = () => {
        if (!scheduleDraft.clinicId)
            return setScheduleError(t("doctorProfile.scheduleErrors.selectClinic"));
        if (scheduleDraft.endTime.valueOf() <= scheduleDraft.startTime.valueOf())
            return setScheduleError(t("doctorProfile.scheduleErrors.badHours"));

        saveScheduleMutation.mutate({
            scheduleId: scheduleDraft.scheduleId,
            clinicId: Number(scheduleDraft.clinicId),
            dayOfWeek: scheduleDraft.dayOfWeek,
            startTime: toTimeString(scheduleDraft.startTime),
            endTime: toTimeString(scheduleDraft.endTime),
            validFrom: toDateString(scheduleDraft.validFrom),
            validTo: scheduleDraft.validTo ? toDateString(scheduleDraft.validTo) : null,
            isActive: true,
        });
    };

    const orderedSchedules = useMemo(() => {
        return [...(schedulesQuery.data ?? [])].sort((a, b) => a.dayOfWeek - b.dayOfWeek);
    }, [schedulesQuery.data]);

    return (
        <Stack spacing={4}>
            <Box>
                <Typography sx={{ fontWeight: 800, fontSize: 20, mb: 2 }}>
                    {scheduleDraft.scheduleId
                        ? t("doctorProfile.editSchedule")
                        : t("doctorProfile.addSchedule")}
                </Typography>
                {scheduleError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {scheduleError}
                    </Alert>
                )}

                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <FormControl fullWidth>
                            <InputLabel>{t("doctorProfile.clinic")}</InputLabel>
                            <Select
                                value={scheduleDraft.clinicId}
                                onChange={(e) =>
                                    setScheduleDraft({
                                        ...scheduleDraft,
                                        clinicId: String(e.target.value),
                                    })
                                }
                            >
                                {clinicsQuery.data?.map((c) => (
                                    <MenuItem key={c.clinicId} value={String(c.clinicId)}>
                                        {c.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <FormControl fullWidth>
                            <InputLabel>{t("doctorProfile.dayOfWeek")}</InputLabel>
                            <Select
                                value={scheduleDraft.dayOfWeek}
                                onChange={(e) =>
                                    setScheduleDraft({
                                        ...scheduleDraft,
                                        dayOfWeek: Number(e.target.value),
                                    })
                                }
                            >
                                {weekdayOptions.map((opt) => (
                                    <MenuItem key={opt.value} value={opt.value}>
                                        {t(`doctorProfile.weekdays.${opt.labelKey}`)}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TimePicker
                            label={t("doctorProfile.from")}
                            value={scheduleDraft.startTime}
                            onChange={(v) =>
                                setScheduleDraft({
                                    ...scheduleDraft,
                                    startTime: v ?? parseTime("08:00"),
                                })
                            }
                            slotProps={{ textField: { fullWidth: true } }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TimePicker
                            label={t("doctorProfile.to")}
                            value={scheduleDraft.endTime}
                            onChange={(v) =>
                                setScheduleDraft({
                                    ...scheduleDraft,
                                    endTime: v ?? parseTime("16:00"),
                                })
                            }
                            slotProps={{ textField: { fullWidth: true } }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <DatePicker
                            label={t("doctorProfile.validFrom")}
                            value={scheduleDraft.validFrom}
                            onChange={(v) =>
                                setScheduleDraft({ ...scheduleDraft, validFrom: v ?? dayjs() })
                            }
                            slotProps={{ textField: { fullWidth: true } }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <DatePicker
                            label={t("doctorProfile.validTo")}
                            value={scheduleDraft.validTo}
                            onChange={(v) => setScheduleDraft({ ...scheduleDraft, validTo: v })}
                            slotProps={{ textField: { fullWidth: true } }}
                        />
                    </Grid>
                </Grid>
                <Button
                    variant="contained"
                    onClick={submitSchedule}
                    sx={{ mt: 2, fontWeight: 700 }}
                >
                    {t("doctorProfile.saveSchedule")}
                </Button>
            </Box>

            <Box>
                <Typography sx={{ fontWeight: 800, fontSize: 20, mb: 2 }}>
                    {t("doctorProfile.currentSchedules")}
                </Typography>
                <Stack spacing={1.5}>
                    {orderedSchedules.map((schedule) => (
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
                                            setScheduleDraft({
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
                                            deleteScheduleMutation.mutate(schedule.scheduleId)
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
