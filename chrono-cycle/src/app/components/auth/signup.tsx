// sign up component
"use client";

import { TextInput } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import * as E from "fp-ts/Either";
import { startTransition, useActionState } from "react";
import { match } from "ts-pattern";

import { signUpAction } from "@/features/auth/signUp/action";
import { payloadSchema, Result } from "@/features/auth/signUp/data";

function getErrorMessage(formState: Result): string {
    return match(formState)
        .with(
            { left: { _errorKind: "ValidationError" } },
            () => "Invalid or missing fields",
        )
        .with(
            { left: { _errorKind: "DuplicateNameError" } },
            () => "Username or email address is already taken",
        )
        .with(
            { left: { _errorKind: "InternalError" } },
            () => "An internal error occurred",
        )
        .otherwise(() => "");
}

const SignupForm = () => {
    // Server-side action for form submission.
    const [formState, formAction, isPending] = useActionState(
        signUpAction,
        null,
    );

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

    return (
        <div className="w-full h-full flex flex-col gap-10">
            {/* header */}
            <h1 className="text-palette1 font-bold text-3xl p-5">Sign Up</h1>
            <form
                onSubmit={form.onSubmit((values) =>
                    startTransition(() => formAction(values)),
                )}
            >
                {/* error or success message */}
                <div className="w-full flex justify-center mb-4 font-semibold">
                    {formState &&
                        (E.isRight(formState) ? (
                            <p className={"text-green-500 text-lg"}>
                                Account successfully created! Please sign in.
                            </p>
                        ) : (
                            <p className={"text-red-500 text-lg"}>
                                {getErrorMessage(formState)}
                            </p>
                        ))}
                </div>
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

                    {/* button */}
                    <button
                        type="submit"
                        disabled={
                            // TODO: Disable while submitting and if there are validation errors.
                            isPending
                        }
                        className="w-3/4 p-1 rounded-xl bg-palette2 hover:bg-[#a08368] transition duration-300 text-palette3"
                    >
                        {/* Sign Up */}
                        {isPending ? "Signing Up..." : "Sign Up"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SignupForm;
