import { useState, useMemo } from "react";
import { Box, Button, Card, CardContent, FormControl, Grid, InputLabel, MenuItem, Select, Stack, Typography, Alert } from "@mui/material";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { doctorsApi, type UpsertDoctorScheduleDto } from "../../api/doctors";
import { clinicsApi } from "../../api/clinics";
import { createEmptyScheduleDraft, parseTime, toDateString, toTimeString, weekdayOptions } from "./DoctorProfilehelpers";

export const DoctorSchedules = () => {
  const queryClient = useQueryClient();
  const [scheduleDraft, setScheduleDraft] = useState(createEmptyScheduleDraft());
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  const schedulesQuery = useQuery({ queryKey: ["doctor-my-schedules"], queryFn: () => doctorsApi.getMySchedules() });
  const clinicsQuery = useQuery({ queryKey: ["doctor-my-clinics"], queryFn: () => clinicsApi.mine() });

  const saveScheduleMutation = useMutation({
    mutationFn: (payload: UpsertDoctorScheduleDto) => scheduleDraft.scheduleId ? doctorsApi.updateMySchedule(scheduleDraft.scheduleId, payload) : doctorsApi.upsertMySchedule(payload),
    onSuccess: async () => {
      setScheduleError(null);
      setScheduleDraft(createEmptyScheduleDraft());
      await queryClient.invalidateQueries({ queryKey: ["doctor-my-schedules"] });
    },
    onError: (err) => setScheduleError(err instanceof Error ? err.message : "Błąd zapisu"),
  });

  const deleteScheduleMutation = useMutation({
    mutationFn: (id: number) => doctorsApi.deleteMySchedule(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["doctor-my-schedules"] }),
  });

  const submitSchedule = () => {
    if (!scheduleDraft.clinicId) return setScheduleError("Wybierz przychodnię.");
    if (scheduleDraft.endTime.valueOf() <= scheduleDraft.startTime.valueOf()) return setScheduleError("Złe godziny.");
    
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
      {/* Formularz */}
      <Box>
        <Typography sx={{ fontWeight: 800, fontSize: 20, mb: 2 }}>{scheduleDraft.scheduleId ? "Edytuj grafik" : "Dodaj grafik"}</Typography>
        {scheduleError && <Alert severity="error" sx={{ mb: 2 }}>{scheduleError}</Alert>}
        
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Przychodnia</InputLabel>
              <Select value={scheduleDraft.clinicId} onChange={(e) => setScheduleDraft({ ...scheduleDraft, clinicId: String(e.target.value) })}>
                {clinicsQuery.data?.map(c => <MenuItem key={c.clinicId} value={String(c.clinicId)}>{c.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
<Grid size={{ xs: 12, md: 6 }}>
             <FormControl fullWidth>
                <InputLabel>Dzień tygodnia</InputLabel>
                <Select value={scheduleDraft.dayOfWeek} onChange={(e) => setScheduleDraft({...scheduleDraft, dayOfWeek: Number(e.target.value)})}>
                  {weekdayOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                </Select>
             </FormControl>
          </Grid>
<Grid size={{ xs: 12, md: 6 }}>
            <TimePicker label="Od" value={scheduleDraft.startTime} onChange={(v) => setScheduleDraft({...scheduleDraft, startTime: v ?? parseTime("08:00")})} slotProps={{ textField: { fullWidth: true } }} />
          </Grid>
<Grid size={{ xs: 12, md: 6 }}>
            <TimePicker label="Do" value={scheduleDraft.endTime} onChange={(v) => setScheduleDraft({...scheduleDraft, endTime: v ?? parseTime("16:00")})} slotProps={{ textField: { fullWidth: true } }} />
          </Grid>
<Grid size={{ xs: 12, md: 6 }}>
             <DatePicker label="Ważne od" value={scheduleDraft.validFrom} onChange={(v) => setScheduleDraft({...scheduleDraft, validFrom: v ?? dayjs()})} slotProps={{ textField: { fullWidth: true } }} />
          </Grid>
<Grid size={{ xs: 12, md: 6 }}>
             <DatePicker label="Ważne do" value={scheduleDraft.validTo} onChange={(v) => setScheduleDraft({...scheduleDraft, validTo: v})} slotProps={{ textField: { fullWidth: true } }} />
          </Grid>
        </Grid>
        <Button variant="contained" onClick={submitSchedule} sx={{ mt: 2, fontWeight: 700 }}>Zapisz grafik</Button>
      </Box>

      {/* Lista grafików */}
      <Box>
        <Typography sx={{ fontWeight: 800, fontSize: 20, mb: 2 }}>Aktualne grafiki</Typography>
        <Stack spacing={1.5}>
          {orderedSchedules.map(schedule => (
            <Card key={schedule.scheduleId} variant="outlined">
              <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
<Typography sx={{ fontWeight: 700 }}>
  {weekdayOptions.find(o => o.value === schedule.dayOfWeek)?.label}
</Typography>                  <Typography variant="body2" color="text.secondary">{schedule.clinicName}</Typography>
                  <Typography variant="body2">{schedule.startTime} - {schedule.endTime}</Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <Button variant="outlined" onClick={() => setScheduleDraft({
                    scheduleId: schedule.scheduleId, clinicId: String(schedule.clinicId), dayOfWeek: schedule.dayOfWeek,
                    startTime: parseTime(schedule.startTime), endTime: parseTime(schedule.endTime),
                    validFrom: dayjs(schedule.validFrom), validTo: schedule.validTo ? dayjs(schedule.validTo) : null
                  })}>Edytuj</Button>
                  <Button color="error" variant="outlined" onClick={() => deleteScheduleMutation.mutate(schedule.scheduleId)}>Usuń</Button>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Box>
    </Stack>
  );
};