// sign up component
"use client";

import { Flex, Stack } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { useMutation } from "@tanstack/react-query";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/lib/function";
import { match } from "ts-pattern";

import { notifyError, notifySuccess } from "@/app/utils/notifications";

import { signUpAction } from "@/features/auth/signUp/action";
import { Failure, payloadSchema } from "@/features/auth/signUp/data";

import { AuthButton } from "./button";
import { AuthTextInput } from "./textInput";

function extractFormIssues(failure: Failure): {
    username?: string;
    email?: string;
    password?: string;
} {
    return match(failure)
        .with({ _errorKind: "UsernameTakenError" }, () => ({
            username: "Username is already taken",
        }))
        .with({ _errorKind: "EmailTakenError" }, () => ({
            email: "Email address is already registered",
        }))
        .otherwise(() => ({}));
}

const SignupForm = ({ onSuccess }: { onSuccess?: () => void }) => {
    const form = useForm({
        mode: "controlled",
        validateInputOnChange: true,
        initialValues: {
            username: "",
            email: "",
            password: "",
        },
        validate: zodResolver(payloadSchema),
    });
    type FormValues = typeof form.values;

    // Server-side action for form submission.
    const signUpMutation = useMutation({
        mutationFn: async (values: FormValues) => {
            const result = await signUpAction(null, values);
            return pipe(
                result,
                E.getOrElseW((err) => {
                    throw err;
                }),
            );
        },
        onSuccess: () => {
            notifySuccess(
                {
                    message:
                        "Your account has been successfully created! Please sign in.",
                },
                { authStyle: true },
            );
            if (onSuccess) onSuccess();
        },
        onError: (failure: Failure) => {
            const formIssues = extractFormIssues(failure);
            form.setErrors(formIssues);
            if (Object.keys(formIssues).length === 0) {
                notifyError(
                    {
                        message: "An internal error occurred.",
                    },
                    { authStyle: true },
                );
            }
        },
    });

    return (
        <Stack className="w-full h-full gap-10">
            {/* header */}
            <h1 className="text-palette1 font-bold text-3xl p-5">Sign Up</h1>
            <form
                onSubmit={form.onSubmit((values) =>
                    signUpMutation.mutate(values),
                )}
            >
                <Flex justify="center">
                    <Stack className="w-3/4 gap-16">
                        <Stack className="w-full gap-5">
                            {/* username input */}
                            <AuthTextInput
                                label="Username"
                                placeholder="Username"
                                required
                                {...form.getInputProps("username")}
                            />

                            {/* email input */}
                            <AuthTextInput
                                label="Email"
                                placeholder="abc@example.com"
                                required
                                {...form.getInputProps("email")}
                            />

                            {/* password input */}
                            <AuthTextInput
                                type="password"
                                label="Password"
                                placeholder="Password"
                                required
                                {...form.getInputProps("password")}
                            />
                        </Stack>
                        <AuthButton
                            type="submit"
                            disabled={Object.keys(form.errors).length > 0}
                            loading={signUpMutation.isPending}
                        >
                            Sign Up
                        </AuthButton>
                    </Stack>
                </Flex>
            </form>
        </Stack>
    );
};

export default SignupForm;
