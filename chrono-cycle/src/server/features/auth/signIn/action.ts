"use server";

import { getUserFromUsername } from "@/server/common/auth/users";
import { signInFormSchema, SignInFormState } from "./data";
import { verifyPassword } from "@/server/common/auth/passwords";
import {
    createSession,
    generateSessionToken,
    setSessionTokenCookie,
} from "@/server/common/auth/sessions";
import { redirect } from "next/navigation";
import { wrapServerActionWith } from "@/server/features/decorators";

async function signInActionImpl(
    _prevState: SignInFormState,
    formData: FormData,
): Promise<SignInFormState> {
    // Validate form inputs.
    const parseResult = signInFormSchema.safeParse({
        username: formData.get("username"),
        password: formData.get("password"),
        remember: formData.get("remember"),
    });

    if (!parseResult.success) {
        const formattedZodErrors = parseResult.error.format();
        return {
            errorMessage: "Invalid or missing fields",
            errors: {
                username: formattedZodErrors.username?._errors[0],
                password: formattedZodErrors.password?._errors[0],
            },
        };
    }

    const { username, password, remember } = parseResult.data;

    // Check if the user exists.
    const user = await getUserFromUsername(username);
    if (!user) {
        return {
            errorMessage: "Incorrect username or password",
        };
    }

    // Check if the password is correct.
    const passwordCorrect = await verifyPassword(user.hashedPassword, password);
    if (!passwordCorrect) {
        return {
            errorMessage: "Incorrect username or password",
        };
    }

    // Create session.
    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, user.id);

    if (remember) {
        // If "remember me", create a cookie that lasts until the session expiry.
        await setSessionTokenCookie(sessionToken, session.expiresAt);
    } else {
        // Otherwise, set no expiry (meaning the cookie will expire at the end of the browser session).
        await setSessionTokenCookie(sessionToken, undefined);
    }

    return redirect("/dashboard");
}

export const signInAction = wrapServerActionWith(
    "signIn",
    { auth: false },
    signInActionImpl,
);
