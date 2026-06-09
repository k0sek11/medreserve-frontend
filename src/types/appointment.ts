export type BookAppointmentRequest = {
    doctorId: number;
    appointmentTypeId: number;
    clinicId: number;
    date: string;
    startTime: string;
};

export type BookAppointmentResultDto = {
    appointmentId: number;
    doctorId: number;
    appointmentTypeId: number;
    date: string;
    startTime: string;
    endTime: string;
    status: string;
    doctorName?: string;
    doctorSpecialization?: string;
};

export type AppointmentSummaryDto = {
    appointmentId: number;
    doctorId: number;
    doctorName: string;
    doctorSpecialization: string;
    appointmentType: string | null;
    date: string;
    startTime: string;
    endTime: string;
    status: string;
    paymentId?: number | null;
    paymentStatus?: string | null;
    paymentMethod?: string | null;
    price: number;
};

export type AppointmentDetailDto = AppointmentSummaryDto & {
    createdAt: string;
    doctorNotes?: string | null;
};

export type DoctorAppointmentEvent = {
    id: number;
    notificationId: number;
    appointmentId: number;
    title: string;
    patientName: string;
    doctorName: string;
    appointmentType: string | null;
    status: string;
    notificationStatus: string;
    message: string | null;
    start: Date;
    end: Date;
    paymentId?: number | null;
    paymentStatus?: string | null;
    paymentMethod?: string | null;
};
