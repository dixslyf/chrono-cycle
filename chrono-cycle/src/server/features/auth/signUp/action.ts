"use server";

import { eq } from "drizzle-orm";
import getDb from "@/server/db";
import { signUpFormSchema, SignUpFormState } from "./data";
import { users } from "@/server/db/schema";
import { wrapServerActionWith } from "@/server/features/decorators";
import { createUser, createUserSettings } from "@/server/common/auth/users";

async function signUpActionImpl(
    _prevState: SignUpFormState,
    formData: FormData,
): Promise<SignUpFormState> {
    // Validate form schema.
    const parseResult = signUpFormSchema.safeParse({
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

export const signUpAction = wrapServerActionWith(
    "signUp",
    { auth: false },
    signUpActionImpl,
);
