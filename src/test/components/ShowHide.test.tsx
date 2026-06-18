import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Show } from "../../components/shared/ShowHide";

describe("Show", () => {
    it("renders children when 'when' is true", () => {
        render(
            <Show when={true}>
                <span>visible content</span>
            </Show>,
        );

        expect(screen.getByText("visible content")).toBeInTheDocument();
    });

    it("does not render children when 'when' is false", () => {
        render(
            <Show when={false}>
                <span>hidden content</span>
            </Show>,
        );

        expect(screen.queryByText("hidden content")).not.toBeInTheDocument();
    });

    it("renders nothing when 'when' is undefined", () => {
        const { container } = render(
            <Show when={undefined as any}>
                <span>content</span>
            </Show>,
        );

        expect(container).toBeEmptyDOMElement();
    });
});
