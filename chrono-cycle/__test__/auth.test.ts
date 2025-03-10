import { payloadSchema as signInPayloadSchema } from "@/features/auth/signIn/data";
import { payloadSchema as signUpPayloadSchema } from "@/features/auth/signUp/data";

describe("Authentication Schemas", () => {
    // Test Signin Schema
    describe("Signin Form Schema", () => {
        it("should succeed validation if correct username and password", () => {
            const result = signInPayloadSchema.safeParse({
                username: "validUsername",
                password: "ValidP@ssw0rd",
                remember: false,
            });
            expect(result.success).toBe(true);
        });

        it("should fail validation if username is empty", () => {
            const result = signInPayloadSchema.safeParse({
                username: "",
                password: "ValidP@ssw0rd",
                remember: false,
            });

            expect(result.success).toBe(false);
            expect(
                result.error?.format()["username"]?._errors,
            ).not.toHaveLength(0);
        });

        it("should fail validation if password is empty", () => {
            const result = signInPayloadSchema.safeParse({
                username: "validUsername",
                password: "",
                remember: false,
            });

            expect(result.success).toBe(false);
            expect(
                result.error?.format()["password"]?._errors,
            ).not.toHaveLength(0);
        });
    });

    // Test Signup Schema
    describe("Signup Form Schema", () => {
        it("should validate valid username, email, and password", () => {
            const result = signUpPayloadSchema.safeParse({
                username: "validUsername",
                email: "validemail@example.com",
                password: "ValidP@ssw0rd",
            });
            expect(result.success).toBe(true);
        });

        it("should fail validation if username contains spaces", () => {
            const result = signUpPayloadSchema.safeParse({
                username: "invalid username",
                email: "validemail@example.com",
                password: "ValidP@ssw0rd",
            });

            expect(result.success).toBe(false);
            expect(
                result.error?.format()["username"]?._errors,
            ).not.toHaveLength(0);
        });

        it("should fail validation if email is invalid", () => {
            const result = signUpPayloadSchema.safeParse({
                username: "validUsername",
                email: "invalidemail",
                password: "ValidP@ssw0rd",
            });

            expect(result.success).toBe(false);
            expect(result.error?.format()["email"]?._errors).not.toHaveLength(
                0,
            );
        });

        it("should fail validation if password is too short", () => {
            const result = signUpPayloadSchema.safeParse({
                username: "validUsername",
                email: "validemail@example.com",
                password: "Short1",
            });

            expect(result.success).toBe(false);
            expect(
                result.error?.format()["password"]?._errors,
            ).not.toHaveLength(0);
        });

        it("should fail validation if password does not contain uppercase letter", () => {
            const result = signUpPayloadSchema.safeParse({
                username: "validUsername",
                email: "validemail@example.com",
                password: "validpassword1",
            });

            expect(result.success).toBe(false);
            expect(
                result.error?.format()["password"]?._errors,
            ).not.toHaveLength(0);
        });

        it("should validate when password has proper complexity", () => {
            const result = signUpPayloadSchema.safeParse({
                username: "validUsername",
                email: "validemail@example.com",
                password: "ValidP@ssw0rd",
            });
            expect(result.success).toBe(true);
        });
    });
});
