// sign up component
"use client";

import { Button, TextInput } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { useMutation } from "@tanstack/react-query";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/lib/function";
import { startTransition, useActionState } from "react";
import { match, P } from "ts-pattern";

import { notifyError, notifySuccess } from "@/app/utils/notifications";

import { signUpAction } from "@/features/auth/signUp/action";
import { Failure, payloadSchema, Result } from "@/features/auth/signUp/data";

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

const SignupForm = () => {
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
        onSuccess: () =>
            notifySuccess({
                message:
                    "Your account has been successfully created! Please sign in.",
            }),
        onError: (failure: Failure) => {
            const formIssues = extractFormIssues(failure);
            form.setErrors(formIssues);
            console.log(formIssues);
            if (Object.keys(formIssues).length === 0) {
                notifyError({ message: "An internal error occurred." });
            }
        },
    });

    return (
        <div className="w-full h-full flex flex-col gap-10">
            {/* header */}
            <h1 className="text-palette1 font-bold text-3xl p-5">Sign Up</h1>
            <form
                onSubmit={form.onSubmit((values) =>
                    signUpMutation.mutate(values),
                )}
            >
                <div className="flex flex-col items-center gap-16">
                    <div className="w-full flex flex-col items-center gap-5">
                        {/* username input */}
                        <TextInput
                            label="Username"
                            placeholder="Username"
                            classNames={{
                                root: "flex flex-col w-3/4",
                                label: "text-base text-palette5 pl-1 pb-2",
                                required: "text-red-600",
                                error: "text-sm text-red-600 pl-1",
                                wrapper: "w-full outline-none outline-hidden",
                                input: "w-full rounded-xl bg-[#dfdfdf] placeholder-[#989898] p-1 pl-2 focus:outline-none focus:border-[#949494] focus:ring-[#949494] focus:ring-1",
                            }}
                            unstyled
                            required
                            {...form.getInputProps("username")}
                        />

                        {/* email input */}
                        <TextInput
                            label="Email"
                            placeholder="abc@example.com"
                            classNames={{
                                root: "flex flex-col w-3/4",
                                label: "text-base text-palette5 pl-1 pb-2",
                                required: "text-red-600",
                                error: "text-sm text-red-600 pl-1",
                                wrapper: "w-full outline-none outline-hidden",
                                input: "w-full rounded-xl bg-[#dfdfdf] placeholder-[#989898] p-1 pl-2 focus:outline-none focus:border-[#949494] focus:ring-[#949494] focus:ring-1",
                            }}
                            unstyled
                            required
                            {...form.getInputProps("email")}
                        />

                        {/* password input */}
                        <TextInput
                            type="password"
                            label="Password"
                            placeholder="Password"
                            classNames={{
                                root: "flex flex-col w-3/4",
                                label: "text-base text-palette5 pl-1 pb-2",
                                required: "text-red-600",
                                error: "text-sm text-red-600 pl-1",
                                wrapper: "w-full outline-none outline-hidden",
                                input: "w-full rounded-xl bg-[#dfdfdf] placeholder-[#989898] p-1 pl-2 focus:outline-none focus:border-[#949494] focus:ring-[#949494] focus:ring-1",
                            }}
                            unstyled
                            required
                            {...form.getInputProps("password")}
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={Object.keys(form.errors).length > 0}
                        loading={signUpMutation.isPending}
                        className="w-3/4 p-1 rounded-xl bg-palette2 hover:bg-[#a08368] transition duration-300 text-palette3"
                    >
                        Sign Up
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default SignupForm;
