import { useState, useMemo, useEffect } from "react";
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
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { doctorsApi, type UpsertDoctorScheduleDto } from "../../api/doctors";
import { clinicsApi } from "../../api/clinics";
import { doctorScheduleSchema, type DoctorScheduleFormData } from "../../lib/validations";
import { parseTime, toDateString, toTimeString, weekdayOptions } from "./DoctorProfilehelpers";

type ScheduleDraft = {
    scheduleId: number | null;
    clinicId: string;
    dayOfWeek: number;
    startTime: dayjs.Dayjs;
    endTime: dayjs.Dayjs;
    validFrom: dayjs.Dayjs;
    validTo: dayjs.Dayjs | null;
};

const createEmptyScheduleDraft = (): ScheduleDraft => ({
    scheduleId: null,
    clinicId: "",
    dayOfWeek: 1,
    startTime: parseTime("08:00"),
    endTime: parseTime("16:00"),
    validFrom: dayjs().startOf("day"),
    validTo: null,
});

export const DoctorSchedules = () => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [editingSchedule, setEditingSchedule] = useState<ScheduleDraft>(
        createEmptyScheduleDraft(),
    );

    const {
        handleSubmit,
        control,
        reset,
        setValue,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<DoctorScheduleFormData>({
        resolver: zodResolver(doctorScheduleSchema),
        defaultValues: {
            clinicId: "",
            dayOfWeek: 1,
            startTime: "08:00",
            endTime: "16:00",
            validFrom: dayjs().format("YYYY-MM-DD"),
            validTo: null,
        },
    });

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
            editingSchedule.scheduleId
                ? doctorsApi.updateMySchedule(editingSchedule.scheduleId, payload)
                : doctorsApi.upsertMySchedule(payload),
        onSuccess: async () => {
            setEditingSchedule(createEmptyScheduleDraft());
            reset({
                clinicId: "",
                dayOfWeek: 1,
                startTime: "08:00",
                endTime: "16:00",
                validFrom: dayjs().format("YYYY-MM-DD"),
                validTo: null,
            });
            await queryClient.invalidateQueries({ queryKey: ["doctor-my-schedules"] });
        },
        onError: (err) =>
            setError("root", {
                message:
                    err instanceof Error
                        ? err.message
                        : t("doctorProfile.scheduleErrors.saveError"),
            }),
    });

    const deleteScheduleMutation = useMutation({
        mutationFn: (id: number) => doctorsApi.deleteMySchedule(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["doctor-my-schedules"] }),
    });

    const onSubmit = (data: DoctorScheduleFormData) => {
        if (editingSchedule.endTime.valueOf() <= editingSchedule.startTime.valueOf()) {
            setError("root", { message: t("doctorProfile.scheduleErrors.badHours") });
            return;
        }

        saveScheduleMutation.mutate({
            scheduleId: editingSchedule.scheduleId ?? undefined,
            clinicId: Number(data.clinicId),
            dayOfWeek: data.dayOfWeek,
            startTime: toTimeString(editingSchedule.startTime),
            endTime: toTimeString(editingSchedule.endTime),
            validFrom: data.validFrom,
            validTo: data.validTo || null,
            isActive: true,
        });
    };

    // Sync editingSchedule changes to form values
    useEffect(() => {
        setValue("clinicId", editingSchedule.clinicId);
        setValue("dayOfWeek", editingSchedule.dayOfWeek);
        setValue("startTime", toTimeString(editingSchedule.startTime));
        setValue("endTime", toTimeString(editingSchedule.endTime));
        setValue("validFrom", toDateString(editingSchedule.validFrom));
        setValue("validTo", editingSchedule.validTo ? toDateString(editingSchedule.validTo) : null);
    }, [editingSchedule, setValue]);

    const orderedSchedules = useMemo(() => {
        return [...(schedulesQuery.data ?? [])].sort((a, b) => a.dayOfWeek - b.dayOfWeek);
    }, [schedulesQuery.data]);

    return (
        <Stack spacing={4}>
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                <Typography sx={{ fontWeight: 800, fontSize: 20, mb: 2 }}>
                    {editingSchedule.scheduleId
                        ? t("doctorProfile.editSchedule")
                        : t("doctorProfile.addSchedule")}
                </Typography>
                {errors.root && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {errors.root.message}
                    </Alert>
                )}

                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <FormControl fullWidth error={!!errors.clinicId}>
                            <InputLabel>{t("doctorProfile.clinic")}</InputLabel>
                            <Controller
                                name="clinicId"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        label={t("doctorProfile.clinic")}
                                        onChange={(e) => {
                                            field.onChange(e);
                                            setEditingSchedule((prev) => ({
                                                ...prev,
                                                clinicId: String(e.target.value),
                                            }));
                                        }}
                                    >
                                        {clinicsQuery.data?.map((c) => (
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
                        <FormControl fullWidth error={!!errors.dayOfWeek}>
                            <InputLabel>{t("doctorProfile.dayOfWeek")}</InputLabel>
                            <Controller
                                name="dayOfWeek"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        label={t("doctorProfile.dayOfWeek")}
                                        onChange={(e) => {
                                            field.onChange(Number(e.target.value));
                                            setEditingSchedule((prev) => ({
                                                ...prev,
                                                dayOfWeek: Number(e.target.value),
                                            }));
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
                            value={editingSchedule.startTime}
                            onChange={(v) =>
                                setEditingSchedule((prev) => ({
                                    ...prev,
                                    startTime: v ?? parseTime("08:00"),
                                }))
                            }
                            slotProps={{
                                textField: { fullWidth: true, error: !!errors.startTime },
                            }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TimePicker
                            label={t("doctorProfile.to")}
                            value={editingSchedule.endTime}
                            onChange={(v) =>
                                setEditingSchedule((prev) => ({
                                    ...prev,
                                    endTime: v ?? parseTime("16:00"),
                                }))
                            }
                            slotProps={{ textField: { fullWidth: true, error: !!errors.endTime } }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <DatePicker
                            label={t("doctorProfile.validFrom")}
                            value={editingSchedule.validFrom}
                            onChange={(v) =>
                                setEditingSchedule((prev) => ({
                                    ...prev,
                                    validFrom: v ?? dayjs(),
                                }))
                            }
                            slotProps={{
                                textField: { fullWidth: true, error: !!errors.validFrom },
                            }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <DatePicker
                            label={t("doctorProfile.validTo")}
                            value={editingSchedule.validTo}
                            onChange={(v) =>
                                setEditingSchedule((prev) => ({ ...prev, validTo: v }))
                            }
                            slotProps={{ textField: { fullWidth: true } }}
                        />
                    </Grid>
                </Grid>
                <Button
                    type="submit"
                    variant="contained"
                    disabled={saveScheduleMutation.isPending || isSubmitting}
                    sx={{ mt: 2, fontWeight: 700 }}
                >
                    {saveScheduleMutation.isPending || isSubmitting
                        ? t("common.saving")
                        : t("doctorProfile.saveSchedule")}
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
                                            setEditingSchedule({
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
