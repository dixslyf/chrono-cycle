import { z } from "zod";

export const usernameSchema = z
    .string()
    .nonempty("Please enter your username.");

export const passwordSchema = z
    .string()
    .nonempty("Please enter your password.");

export const signinFormSchema = z.object({
    username: usernameSchema,
    password: passwordSchema,
});

export type SigninFormData = z.output<typeof signinFormSchema>;

export type SigninFormErrors = {
    username?: string;
    password?: string;
};

export type SigninState = {
    errorMessage?: string;
    errors?: SigninFormErrors;
};
