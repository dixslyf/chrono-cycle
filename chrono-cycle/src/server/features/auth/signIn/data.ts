import { z } from "zod";

export const usernameSchema = z
    .string()
    .nonempty("Please enter your username.");

export const passwordSchema = z
    .string()
    .nonempty("Please enter your password.");

export const rememberSchema = z.string().optional().nullable();

export const signInFormSchema = z.object({
    username: usernameSchema,
    password: passwordSchema,
    remember: rememberSchema,
});

export type SignInFormData = z.output<typeof signInFormSchema>;

export type SignInFormErrors = {
    username?: string;
    password?: string;
};

export type SignInFormState = {
    errorMessage?: string;
    errors?: SignInFormErrors;
};
