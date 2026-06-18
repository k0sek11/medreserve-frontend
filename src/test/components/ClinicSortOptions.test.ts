import { describe, it, expect } from "vitest";
import { sortOptions } from "../../components/clinic/ClinicSortOptions";

describe("ClinicSortOptions", () => {
    it("exports an array of sort options", () => {
        expect(Array.isArray(sortOptions)).toBe(true);
        expect(sortOptions.length).toBeGreaterThan(0);
    });

    it("each option has value and label", () => {
        for (const opt of sortOptions) {
            expect(opt).toHaveProperty("value");
            expect(opt).toHaveProperty("label");
            expect(typeof opt.value).toBe("string");
            expect(typeof opt.label).toBe("string");
        }
    });

    it("contains expected sort options", () => {
        const values = sortOptions.map((o) => o.value);
        expect(values).toContain("nameAsc");
        expect(values).toContain("nameDesc");
        expect(values).toContain("cityAsc");
        expect(values).toContain("doctorCountDesc");
    });
});
