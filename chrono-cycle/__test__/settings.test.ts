import { payloadSchema } from "@/features/settings/update/data";

describe("User Settings Schema", () => {
    // Test valid payload
    describe("Valid Payload", () => {
        it("should succeed validation if correct data is provided", () => {
            const result = payloadSchema.safeParse({
                startDayOfWeek: "Monday",
                dateFormat: "MM/DD/YYYY",
                enableEmailNotifications: true,
                enableDesktopNotifications: false,
            });

            expect(result.success).toBe(true);
        });
    });

    // Test invalid payloads
    describe("Invalid Payload", () => {
        it("should fail validation if startDayOfWeek is invalid", () => {
            const result = payloadSchema.safeParse({
                startDayOfWeek: "", // Invalid value for startDayOfWeek
                dateFormat: "MM/DD/YYYY",
                enableEmailNotifications: true,
                enableDesktopNotifications: false,
            });

            expect(result.success).toBe(false);
            expect(
                result.error?.format()["startDayOfWeek"]?._errors,
            ).not.toHaveLength(0);
        });

        it("should fail validation if dateFormat is invalid", () => {
            const result = payloadSchema.safeParse({
                startDayOfWeek: "Monday",
                dateFormat: "InvalidFormat", // Invalid date format
                enableEmailNotifications: true,
                enableDesktopNotifications: false,
            });

            expect(result.success).toBe(false);
            expect(
                result.error?.format()["dateFormat"]?._errors,
            ).not.toHaveLength(0);
        });

        it("should fail validation if enableEmailNotifications is not a boolean", () => {
            const result = payloadSchema.safeParse({
                startDayOfWeek: "Monday",
                dateFormat: "MM/DD/YYYY",
                enableEmailNotifications: "yes", // Invalid value for enableEmailNotifications
                enableDesktopNotifications: false,
            });

            expect(result.success).toBe(false);
            expect(
                result.error?.format()["enableEmailNotifications"]?._errors,
            ).not.toHaveLength(0);
        });

        it("should fail validation if enableDesktopNotifications is not a boolean", () => {
            const result = payloadSchema.safeParse({
                startDayOfWeek: "Monday",
                dateFormat: "MM/DD/YYYY",
                enableEmailNotifications: true,
                enableDesktopNotifications: "no", // Invalid value for enableDesktopNotifications
            });

            expect(result.success).toBe(false);
            expect(
                result.error?.format()["enableDesktopNotifications"]?._errors,
            ).not.toHaveLength(0);
        });
    });
});
