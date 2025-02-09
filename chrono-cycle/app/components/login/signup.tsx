// sign up component
"use client";

import { useActionState } from "react";

import { signup, type SignupState } from "@/app/actions/auth";

const SignupForm = () => {
    const [signupState, formAction, isPending] = useActionState(signup, {
        submitSuccess: false,
        errorMessage: undefined,
    } satisfies SignupState);

    return (
        <div className="w-full h-full flex flex-col gap-10">
            {/* header */}
            <h1 className="text-palette1 font-bold text-3xl p-5">Sign Up</h1>
            <form action={formAction}>
                {/* error or success message */}
                <div className="w-full flex justify-center mb-4 font-semibold">
                    {signupState?.submitSuccess &&
                        !signupState?.errorMessage && (
                            <p className="text-green-500 text-lg">
                                Account successfully created! Please sign in.
                            </p>
                        )}
                    {signupState?.errorMessage && (
                        <p className="text-red-500 text-lg">
                            {signupState.errorMessage}
                        </p>
                    )}
                </div>
                <div className="flex flex-col items-center gap-16">
                    <div className="w-full flex flex-col items-center gap-5">
                        {/* username input */}
                        <div className="flex flex-col w-3/4 gap-2">
                            <label
                                htmlFor="username"
                                className=" text-palette5 pl-1"
                            >
                                Username<span className="text-red-600">*</span>
                            </label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                className="rounded-xl bg-[#dfdfdf] placeholder-[#989898] p-1 pl-2 focus:outline-none focus:border-[#949494] focus:ring-[#949494] focus:ring-1"
                                placeholder="Username"
                                required
                            />
                        </div>

                        {/* email input */}
                        <div className="flex flex-col w-3/4 gap-2">
                            <label
                                htmlFor="email"
                                className="text-palette5 pl-1"
                            >
                                Email<span className="text-red-600">*</span>
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className="rounded-xl bg-[#dfdfdf] placeholder-[#989898] p-1 pl-2 focus:outline-none focus:border-[#949494] focus:ring-[#949494] focus:ring-1"
                                placeholder="abc@example.com"
                                required
                            />
                        </div>

                        {/* password input */}
                        <div className="flex flex-col w-3/4 gap-2">
                            <label
                                htmlFor="password"
                                className="text-palette5 pl-1"
                            >
                                Password<span className="text-red-600">*</span>
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                className="rounded-xl bg-[#dfdfdf] placeholder-[#989898] p-1 pl-2 focus:outline-none focus:border-[#949494] focus:ring-[#949494] focus:ring-1"
                                placeholder="Password"
                                required
                            />
                        </div>
                    </div>

                    {/* button */}
                    <button
                        type="submit"
                        disabled={isPending}
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
