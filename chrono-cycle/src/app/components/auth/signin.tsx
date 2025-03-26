// sign in component
"use client";

import { Checkbox, Flex, Group, Stack } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { useMutation } from "@tanstack/react-query";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { match } from "ts-pattern";

import { notifyError } from "@/app/utils/notifications";

import { signInAction } from "@/features/auth/signIn/action";
import { Failure, payloadSchema } from "@/features/auth/signIn/data";

import { AuthButton } from "./button";
import { AuthTextInput } from "./textInput";

function getErrorMessage(failure: Failure): string {
    return match(failure)
        .with(
            { _errorKind: "InvalidCredentialsError" },
            () => "Incorrect username or password!",
        )
        .with(
            { _errorKind: "InternalError" },
            () => "An internal error occurred!",
        )
        .with(
            { _errorKind: "ValidationError" },
            () => "Invalid or missing fields!",
        )
        .exhaustive();
}

const SigninForm = () => {
    const form = useForm({
        mode: "uncontrolled",
        initialValues: {
            username: "",
            password: "",
            remember: false,
        },
        validate: zodResolver(payloadSchema),
    });
    type FormValues = typeof form.values;

    const signInMutation = useMutation({
        mutationFn: async (values: FormValues) => {
            const result = await signInAction(null, values);
            return pipe(
                result,
                E.getOrElseW((err) => {
                    throw err;
                }),
            );
        },
        onError: (failure: Failure) => {
            notifyError(
                {
                    title: "Incorrect credentials",
                    message: getErrorMessage(failure),
                },
                { authStyle: true },
            );
        },
    });

    return (
        <Stack className="w-full h-full gap-10">
            {/* header */}
            <h1 className="text-palette1 font-bold text-3xl p-5">Sign In</h1>
            <form
                onSubmit={form.onSubmit((values) =>
                    signInMutation.mutate(values),
                )}
            >
                <Flex justify="center">
                    <Stack className="w-3/4 gap-16">
                        <Stack className="w-full gap-5">
                            {/* username input */}
                            <AuthTextInput
                                type="text"
                                id="username"
                                label="Username"
                                name="username"
                                placeholder="Username"
                                required
                                {...form.getInputProps("username")}
                            />

                            {/* password input */}
                            <AuthTextInput
                                type="password"
                                id="password"
                                label="Password"
                                name="password"
                                placeholder="Password"
                                required
                                {...form.getInputProps("password")}
                            />
                        </Stack>
                        <Stack className="w-full items-center gap-5">
                            <AuthButton
                                type="submit"
                                loading={signInMutation.isPending}
                            >
                                Sign In
                            </AuthButton>

                            {/* remember me */}
                            <Group justify="flex-end" className="w-full">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    label="Remember Me"
                                    labelPosition="right"
                                    classNames={{
                                        input: "border-palette2 border-2",
                                        label: "text-palette2 font-medium ml-[-5]",
                                    }}
                                    {...form.getInputProps("remember", {
                                        type: "checkbox",
                                    })}
                                />
                            </Group>
                        </Stack>
                    </Stack>
                </Flex>
            </form>
        </Stack>
    );
};

export default SigninForm;
