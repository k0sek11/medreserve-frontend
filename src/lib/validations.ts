import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().min(1, "validation.required").email("validation.emailInvalid"),
    password: z.string().min(1, "validation.required"),
});

export const registerSchema = z
    .object({
        email: z.string().min(1, "validation.required").email("validation.emailInvalid"),
        password: z.string().min(6, "validation.passwordMinLength"),
        confirmPassword: z.string().min(1, "validation.required"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "validation.passwordsMustMatch",
        path: ["confirmPassword"],
    });

export const profileTypeSchema = z.enum(["Doctor", "Patient"]);

export const profileCompletionSchema = z
    .object({
        profileType: profileTypeSchema.optional(),
        firstName: z.string().min(1, "validation.required"),
        lastName: z.string().min(1, "validation.required"),
        phoneNumber: z.string().regex(/^\d{9}$/, "validation.invalidPhone"),
        birthDate: z.string().min(1, "validation.required"),
        gender: z.string().min(1, "validation.required"),
        licenseNumber: z.string().optional(),
    })
    .refine(
        (data) => {
            if (data.profileType === "Doctor") {
                return (data.licenseNumber?.trim().length ?? 0) > 0;
            }
            return true;
        },
        {
            message: "validation.required",
            path: ["licenseNumber"],
        },
    );

export const patientProfileSchema = z.object({
    firstName: z.string().min(1, "validation.required"),
    lastName: z.string().min(1, "validation.required"),
    phoneNumber: z.string().regex(/^\d{9}$/, "validation.invalidPhone"),
    birthDate: z.string().min(1, "validation.required"),
    gender: z.string().min(1, "validation.required"),
});

export const clinicSchema = z.object({
    name: z.string().min(1, "validation.required"),
    description: z.string().optional(),
    city: z.string().min(1, "validation.required"),
    lat: z.number({ message: "validation.required" }),
    lng: z.number({ message: "validation.required" }),
    phoneNumber: z
        .string()
        .optional()
        .refine((val) => !val || /^\d{7,15}$/.test(val), "validation.phoneInvalid"),
    email: z.string().email("validation.emailInvalid").optional().or(z.literal("")),
    openingFrom: z.string().min(1, "validation.required"),
    openingTo: z.string().min(1, "validation.required"),
});

export const clinicEditSchema = z.object({
    name: z.string().min(1, "validation.required"),
    description: z.string().optional(),
    city: z.string().min(1, "validation.required"),
    lat: z.number({ message: "validation.required" }),
    lng: z.number({ message: "validation.required" }),
    phoneNumber: z
        .string()
        .optional()
        .refine((val) => !val || /^\d{7,15}$/.test(val), "validation.phoneInvalid"),
    email: z.string().email("validation.emailInvalid").optional().or(z.literal("")),
    openingHours: z.string().optional(),
});

export const doctorBioSchema = z.object({
    firstName: z.string().min(1, "validation.required"),
    lastName: z.string().min(1, "validation.required"),
    bio: z.string().optional(),
    specializationIds: z.array(z.number()),
});

export const appointmentTypeSchema = z.object({
    name: z.string().min(1, "validation.required"),
    basePrice: z
        .number({ message: "validation.mustBeNumber" })
        .min(0, "validation.mustBeNonNegative"),
    durationMinutes: z
        .number({ message: "validation.mustBeNumber" })
        .int("validation.mustBeInteger")
        .positive("validation.mustBePositive"),
});

export const doctorScheduleSchema = z.object({
    clinicId: z.string().min(1, "validation.required"),
    dayOfWeek: z.number().min(1).max(7),
    startTime: z.string().min(1, "validation.required"),
    endTime: z.string().min(1, "validation.required"),
    validFrom: z.string().min(1, "validation.required"),
    validTo: z.string().nullable().optional(),
});

export const joinRequestSchema = z.object({
    confirmDoctor: z.boolean().refine((val) => val === true, {
        message: "validation.mustConfirm",
    }),
    joinMessage: z.string().optional(),
});

export const homeSearchSchema = z.object({
    specialization: z.string(),
    location: z.string(),
    appointmentDate: z.string(),
});

export const doctorSearchSchema = z.object({
    location: z.string(),
    specializationId: z.string(),
    date: z.string(),
    priceMax: z.string(),
});

export const clinicFiltersSchema = z.object({
    name: z.string(),
    location: z.string(),
    specializationId: z.string(),
    sort: z.string(),
    page: z.string(),
});

export const paymentMethodSchema = z.object({
    selectedMethod: z.enum(["PAYU", "OFFLINE"]).optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ProfileCompletionFormData = z.infer<typeof profileCompletionSchema>;
export type PatientProfileFormData = z.infer<typeof patientProfileSchema>;
export type ClinicFormData = z.infer<typeof clinicSchema>;
export type ClinicEditFormData = z.infer<typeof clinicEditSchema>;
export type DoctorBioFormData = z.infer<typeof doctorBioSchema>;
export type AppointmentTypeFormData = z.infer<typeof appointmentTypeSchema>;
export type DoctorScheduleFormData = z.infer<typeof doctorScheduleSchema>;
export type JoinRequestFormData = z.infer<typeof joinRequestSchema>;
export type HomeSearchFormData = z.infer<typeof homeSearchSchema>;
export type DoctorSearchFormData = z.infer<typeof doctorSearchSchema>;
export type ClinicFiltersFormData = z.infer<typeof clinicFiltersSchema>;
export type PaymentMethodFormData = z.infer<typeof paymentMethodSchema>;
