"use server";

import {
    createUser,
    createUserSettings,
    getUserFromUsername,
} from "@/server/auth/users";
import getDb from "@/server/db";
import { users } from "@/server/db/schema";
import {
    type SignupFormState,
    signupFormSchema,
} from "@/server/auth/forms/signup";

import { eq } from "drizzle-orm";
import { signinFormSchema, SigninFormState } from "@/server/auth/forms/signin";
import { verifyPassword } from "@/server/auth/passwords";
import {
    createSession,
    deleteSessionTokenCookie,
    generateSessionToken,
    invalidateSession,
    UserSession,
    setSessionTokenCookie,
} from "@/server/auth/sessions";
import { redirect } from "next/navigation";
import { SignoutFormState } from "@/server/auth/forms/signout";
import { checkAuth } from "./decorators";

export async function signup(
    _prevState: SignupFormState,
    formData: FormData,
): Promise<SignupFormState> {
    // Validate form schema.
    const parseResult = signupFormSchema.safeParse({
        username: formData.get("username"),
        email: formData.get("email"),
        password: formData.get("password"),
    });

    if (!parseResult.success) {
        const formattedZodErrors = parseResult.error.format();
        return {
            submitSuccess: false,
            errorMessage: "Invalid or missing fields",
            errors: {
                username: formattedZodErrors.username?._errors[0],
                email: formattedZodErrors.email?._errors[0],
                password: formattedZodErrors.password?._errors[0],
            },
        };
    }

    const { username, email, password } = parseResult.data;

    const db = await getDb();

    // Check with the database if username is already taken.
    const matching_users = await db
        .select()
        .from(users)
        .where(eq(users.username, username));
    if (matching_users.length > 0) {
        return {
            submitSuccess: false,
            errorMessage: "Username is already taken",
            errors: {
                username: "Username is already taken",
            },
        };
    }

    // Check with the database if email is already taken.
    const matching_email = await db
        .select()
        .from(users)
        .where(eq(users.email, email));
    if (matching_email.length > 0) {
        return {
            submitSuccess: false,
            errorMessage: "Email address is already registered",
            errors: {
                email: "Email address is already registered",
            },
        };
    }

    const user = await createUser(username, email, password);
    await createUserSettings(user.id);

    // TODO: email verification

    return { submitSuccess: true };
}

export async function signin(
    _prevState: SigninFormState,
    formData: FormData,
): Promise<SigninFormState> {
    // Validate form inputs.
    const parseResult = signinFormSchema.safeParse({
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

export const signout = checkAuth(async function(
    userSession: UserSession,
): Promise<SignoutFormState> {
    invalidateSession(userSession.session.id);
    deleteSessionTokenCookie();

    return redirect("/");
});
