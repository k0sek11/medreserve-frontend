import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useDoctorProfile } from "../../hooks/useDoctorProfile";
import { createWrapper } from "../testUtils";

vi.mock("../../api/doctors", () => ({
    doctorsApi: {
        getMyProfile: vi.fn().mockResolvedValue(null),
    },
}));

describe("useDoctorProfile", () => {
    it("returns isDoctor false when user has no doctorProfileId", () => {
        const { result } = renderHook(() => useDoctorProfile(), {
            wrapper: createWrapper(),
        });

        expect(result.current.isDoctor).toBe(false);
    });
});
