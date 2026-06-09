import type { BookAppointmentResultDto, AppointmentDetailDto } from "../types/appointment";

export const getAppointmentDoctorName = (
    appointment: BookAppointmentResultDto | AppointmentDetailDto,
) => {
    if ("doctorName" in appointment) return appointment.doctorName ?? "-";
    return "-";
};

export const getAppointmentSpecialization = (
    appointment: BookAppointmentResultDto | AppointmentDetailDto,
) => {
    if ("doctorSpecialization" in appointment) return appointment.doctorSpecialization || "-";
    return "-";
};
