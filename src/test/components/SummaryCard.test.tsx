import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SummaryCard } from "../../components/shared/SummaryCard";

describe("SummaryCard", () => {
    it("renders label and value", () => {
        render(<SummaryCard label="Data" value="2026-07-15" />);
        expect(screen.getByText("Data")).toBeInTheDocument();
        expect(screen.getByText("2026-07-15")).toBeInTheDocument();
    });

    it("renders with empty value", () => {
        render(<SummaryCard label="Label" value="" />);
        expect(screen.getByText("Label")).toBeInTheDocument();
    });

    it("renders with numeric value as string", () => {
        render(<SummaryCard label="Count" value="42" />);
        expect(screen.getByText("42")).toBeInTheDocument();
    });
});
