import { describe, it, expect, vi } from "vitest";
import { useAuthUser, authUserQueryKey } from "../../hooks/useAuthUser";

vi.mock("../../api/auth", () => ({
    authApi: {
        me: vi.fn().mockResolvedValue(null),
    },
}));

describe("useAuthUser", () => {
    it("returns correct query key", () => {
        expect(authUserQueryKey).toEqual(["authUser"]);
    });
});
