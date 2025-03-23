import { redirect } from "next/navigation";
import { describe, expect, it, vi } from "vitest";

import { InvalidCredentialsError, ValidationError } from "@/common/errors";

import { signInAction } from "@/features/auth/signIn/action";

import { setSessionTokenCookie } from "@/lib/auth/sessions";

vi.mock(import("@/lib/auth/sessions"), async (importOriginal) => ({
    ...(await importOriginal()),
    setSessionTokenCookie: vi.fn(),
}));

vi.mock("next/navigation", () => ({
    redirect: vi.fn(),
}));

describe("Sign-in server action", () => {
    it("should return validation error if username is empty", async () => {
        const result = await signInAction(null, {
            username: "",
            password: "asdfASDF1234",
            remember: false,
        });

        expect(result).toEqualLeft(
            ValidationError({ username: expect.any(Array) }),
        );
    });

    it("should return validation error if password is empty", async () => {
        const result = await signInAction(null, {
            username: "asdf",
            password: "",
            remember: false,
        });

        expect(result).toEqualLeft(
            ValidationError({ password: expect.any(Array) }),
        );
    });

    it("should return validation error if payload has wrong types", async () => {
        // Type casts just to silence Typescript warnings.
        // We're intentionally passing incorrect types to verify
        // that the action still validates correctly.
        const result = await signInAction(null, {
            username: 1234 as unknown as string,
            password: 5678 as unknown as string,
            remember: 1234 as unknown as boolean,
        });

        expect(result).toEqualLeft(
            ValidationError({
                username: expect.any(Array),
                password: expect.any(Array),
                remember: expect.any(Array),
            }),
        );
    });

    it("should return invalid credentials error if user does not exist", async () => {
        const result = await signInAction(null, {
            username: "fdas",
            password: "fdsaFDSA1234",
            remember: false,
        });

        expect(result).toEqualLeft(InvalidCredentialsError());
    });

    it("should return invalid credentials error if password is wrong", async () => {
        const result = await signInAction(null, {
            username: "asdf",
            password: "asdf",
            remember: false,
        });

        expect(result).toEqualLeft(InvalidCredentialsError());
    });

    it("should redirect to dashboard on successful sign-in", async () => {
        const signInResult = await signInAction(null, {
            username: "asdf",
            password: "asdfASDF1234",
            remember: false,
        });

        // In production, this would actually not return as `redirect()`
        // would throw a `RedirectError` and interrupt the execution flow.
        // However, because we mocked `redirect()`, the function returns
        // with a right value.
        expect(signInResult).toBeRight();

        expect(setSessionTokenCookie).toHaveBeenCalled();
        expect(redirect).toHaveBeenCalled();
    });
});
