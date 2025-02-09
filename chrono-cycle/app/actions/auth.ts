"use server";

import { createUser } from "@/lib/auth/users";

export type SignupState = {
    submitSuccess: boolean;
    errorMessage?: string;
};

export async function signup(
    _prevState: SignupState,
    formData: FormData,
): Promise<SignupState> {
    const email = formData.get("email");
    const username = formData.get("username");
    const password = formData.get("password");

    // TODO: Form validation
    // - Check types and domain
    // - Check for duplicate database entries
    if (
        typeof email !== "string" ||
        typeof username !== "string" ||
        typeof password !== "string"
    ) {
        return {
            submitSuccess: false,
            errorMessage: "Invalid or missing fields",
        };
    }

    const user = await createUser(username, email, password); // eslint-disable-line @typescript-eslint/no-unused-vars

    // TODO: email verification

    return { submitSuccess: true };
}
