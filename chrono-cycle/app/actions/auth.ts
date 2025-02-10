"use server";

import { createUser } from "@/lib/auth/users";
import db from "@/lib/db";
import { users } from "@/lib/db/schema";
import {
    type SignupState,
    signupFormSchema,
} from "@/lib/app/components/login/signup";

import { eq } from "drizzle-orm";

export async function signup(
    _prevState: SignupState,
    formData: FormData,
): Promise<SignupState> {
    // Validate form fields.
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

    await createUser(username, email, password);

    // TODO: email verification

    return { submitSuccess: true };
}
