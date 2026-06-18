import { useState, useMemo, useEffect } from "react";
import dayjs from "dayjs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { doctorsApi, type UpsertDoctorScheduleDto } from "../api/doctors";
import { clinicsApi } from "../api/clinics";
import { doctorScheduleSchema, type DoctorScheduleFormData } from "../lib/validations";
import {
    parseTime,
    toDateString,
    toTimeString,
} from "../components/DoctorProfileComponents/DoctorProfilehelpers";

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

export const useDoctorSchedulesForm = () => {
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

    const onSubmit = handleSubmit((data) => {
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
    });

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

    const updateEditingSchedule = (patch: Partial<ScheduleDraft>) => {
        setEditingSchedule((prev) => ({ ...prev, ...patch }));
    };

    const handleClinicChange = (value: string) => {
        updateEditingSchedule({ clinicId: value });
    };

    const handleDayOfWeekChange = (value: number) => {
        updateEditingSchedule({ dayOfWeek: value });
    };

    const handleStartTimeChange = (value: dayjs.Dayjs | null) => {
        if (value) updateEditingSchedule({ startTime: value });
    };

    const handleEndTimeChange = (value: dayjs.Dayjs | null) => {
        if (value) updateEditingSchedule({ endTime: value });
    };

    const handleValidFromChange = (value: dayjs.Dayjs | null) => {
        if (value) updateEditingSchedule({ validFrom: value });
    };

    const handleValidToChange = (value: dayjs.Dayjs | null) => {
        updateEditingSchedule({ validTo: value });
    };

    const startEdit = (schedule: ScheduleDraft) => {
        setEditingSchedule(schedule);
        reset({
            clinicId: schedule.clinicId,
            dayOfWeek: schedule.dayOfWeek,
            startTime: toTimeString(schedule.startTime),
            endTime: toTimeString(schedule.endTime),
            validFrom: toDateString(schedule.validFrom),
            validTo: schedule.validTo ? toDateString(schedule.validTo) : null,
        });
    };

    const cancelEdit = () => {
        setEditingSchedule(createEmptyScheduleDraft());
        reset({
            clinicId: "",
            dayOfWeek: 1,
            startTime: "08:00",
            endTime: "16:00",
            validFrom: dayjs().format("YYYY-MM-DD"),
            validTo: null,
        });
    };

    return {
        editingSchedule,
        control,
        errors,
        isSubmitting,
        schedulesQuery,
        clinicsQuery,
        saveScheduleMutation,
        deleteScheduleMutation,
        orderedSchedules,
        onSubmit,
        handleClinicChange,
        handleDayOfWeekChange,
        handleStartTimeChange,
        handleEndTimeChange,
        handleValidFromChange,
        handleValidToChange,
        startEdit,
        cancelEdit,
        updateEditingSchedule,
    };
};
