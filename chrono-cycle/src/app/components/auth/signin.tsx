// sign in component
"use client";

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
        <div className="w-full h-full flex flex-col gap-10">
            {/* header */}
            <h1 className="text-palette1 font-bold text-3xl p-5">Sign In</h1>
            <form
                onSubmit={form.onSubmit((values) =>
                    signInMutation.mutate(values),
                )}
                className="flex flex-col items-center gap-16"
            >
                <div className="w-full flex flex-col items-center gap-5">
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
                </div>

                <div className="w-full flex flex-col items-center gap-5">
                    <AuthButton
                        type="submit"
                        loading={signInMutation.isPending}
                    >
                        Sign In
                    </AuthButton>

                    {/* remember me & forget password wrapper */}
                    <div className="w-3/4 flex justify-between text-sm">
                        {/* remember me */}
                        <div className="flex items-center gap-1">
                            <input
                                type="checkbox"
                                className="
                                relative peer mt-1
                                appearance-none w-4 h-4 border-2 border-palette2 bg-white rounded-sm
                                checked:bg-palette2 checked:border-0
                                "
                                id="remember"
                                name="remember"
                                {...form.getInputProps("remember", {
                                    type: "checkbox",
                                })}
                            />
                            <label
                                htmlFor="remember"
                                className="font-medium text-palette2 mt-1"
                            >
                                Remember Me
                            </label>
                            <svg
                                className="
                                absolute
                                w-4 h-4 mt-1
                                hidden peer-checked:block
                                pointer-events-none text-palette3
                                "
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </div>

                        {/* forget password */}
                        <div>
                            <a href="#" className=" text-gray-400">
                                Forget Password?
                            </a>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default SigninForm;
