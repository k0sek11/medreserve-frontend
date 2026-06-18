import { describe, it, expect } from "vitest";
import dayjs from "dayjs";
import {
    toDateString,
    toTimeString,
    parseTime,
    weekdayOptions,
    createEmptyScheduleDraft,
    createEmptyAppointmentTypeDraft,
    buildAppointmentEvent,
} from "../../components/DoctorProfileComponents/DoctorProfilehelpers";

describe("DoctorProfileHelpers", () => {
    describe("toDateString", () => {
        it("formats Dayjs to YYYY-MM-DD", () => {
            const date = dayjs("2026-07-15");
            expect(toDateString(date)).toBe("2026-07-15");
        });

        it("returns empty string for null", () => {
            expect(toDateString(null)).toBe("");
        });
    });

    describe("toTimeString", () => {
        it("formats Dayjs to HH:mm", () => {
            const time = dayjs().hour(14).minute(30).startOf("minute");
            expect(toTimeString(time)).toBe("14:30");
        });

        it("returns empty string for null", () => {
            expect(toTimeString(null)).toBe("");
        });
    });

    describe("parseTime", () => {
        it("parses time string to Dayjs", () => {
            const result = parseTime("09:15");
            expect(result.hour()).toBe(9);
            expect(result.minute()).toBe(15);
        });
    });

    describe("weekdayOptions", () => {
        it("has 7 days", () => {
            expect(weekdayOptions).toHaveLength(7);
        });

        it("each day has value, label, labelKey", () => {
            for (const day of weekdayOptions) {
                expect(day).toHaveProperty("value");
                expect(day).toHaveProperty("label");
                expect(day).toHaveProperty("labelKey");
            }
        });
    });

    describe("createEmptyScheduleDraft", () => {
        it("returns a draft with default values", () => {
            const draft = createEmptyScheduleDraft();
            expect(draft.scheduleId).toBeNull();
            expect(draft.dayOfWeek).toBe(1);
            expect(draft.clinicId).toBe("");
        });
    });

    describe("createEmptyAppointmentTypeDraft", () => {
        it("returns a draft with empty strings", () => {
            const draft = createEmptyAppointmentTypeDraft();
            expect(draft.name).toBe("");
            expect(draft.basePrice).toBe("");
        });
    });

    describe("buildAppointmentEvent", () => {
        it("returns null for invalid date", () => {
            const result = buildAppointmentEvent({
                notificationId: 1,
                appointmentId: 1,
                doctorId: 1,
                doctorName: "Doc",
                patientName: "Patient",
                appointmentType: "Checkup",
                date: "invalid",
                startTime: "10:00",
                endTime: "10:30",
                status: "Confirmed",
                notificationStatus: "Sent",
                createdAt: "2026-01-01",
                message: null,
            });
            expect(result).toBeNull();
        });

        it("builds valid event for correct date/time", () => {
            const result = buildAppointmentEvent({
                notificationId: 1,
                appointmentId: 10,
                doctorId: 2,
                doctorName: "Dr. Smith",
                patientName: "John Doe",
                appointmentType: "Konsultacja",
                date: "2026-07-15",
                startTime: "10:00",
                endTime: "10:30",
                status: "Confirmed",
                notificationStatus: "Sent",
                createdAt: "2026-06-01",
                message: null,
            });

            expect(result).not.toBeNull();
            expect(result!.appointmentId).toBe(10);
            expect(result!.patientName).toBe("John Doe");
        });
    });
});
