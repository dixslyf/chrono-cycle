import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import { revalidatePath } from "next/cache";
import { describe, expect, it, vi } from "vitest";

import { ValidationError } from "@/common/errors";

import { updateSettingsAction } from "@/features/settings/update/action";

vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
}));

describe("updateSettingsAction", () => {
    it("should update user settings and revalidate path", async () => {
        const result = await updateSettingsAction(null, {
            startDayOfWeek: "Monday",
            dateFormat: "DD/MM/YYYY",
            enableEmailNotifications: true,
            enableDesktopNotifications: false,
        });

        expect(result).toBeRight();
        expect(revalidatePath).toHaveBeenCalledWith("/settings");
    });

    it("should return validation error if payload has wrong types", async () => {
        const result = await updateSettingsAction(null, {
            startDayOfWeek: 1234 as unknown as "Monday" | "Sunday",
            dateFormat: 1234 as unknown as
                | "MM/DD/YYYY"
                | "DD/MM/YYYY"
                | "YYYY/MM/DD",
            enableEmailNotifications: 1234 as unknown as boolean,
            enableDesktopNotifications: 4567 as unknown as boolean,
        });

        expect(result).toEqualLeft(
            ValidationError({
                startDayOfWeek: expect.any(Array),
                dateFormat: expect.any(Array),
                enableEmailNotifications: expect.any(Array),
                enableDesktopNotifications: expect.any(Array),
            }),
        );
    });
});
