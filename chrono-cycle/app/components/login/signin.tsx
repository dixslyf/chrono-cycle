// sign in component
"use client";

import { signin as signinAction } from "@/app/actions/auth";
import { useActionState } from "react";

const SigninForm = () => {
    // Server-side action for signing in.
    const [formState, formAction, isPending] = useActionState(signinAction, {});

    return (
        <div className="w-full h-full flex flex-col gap-10">
            {/* header */}
            <h1 className="text-palette1 font-bold text-3xl p-5">Sign In</h1>
            <form
                action={formAction}
                className="flex flex-col items-center gap-16"
            >
                <div className="w-full flex flex-col items-center gap-5">
                    {/* TODO: Style this properly. */}
                    {/* Error message for login failure. */}
                    <div className="w-full flex justify-center mb-4 font-semibold">
                        {formState?.errorMessage && (
                            <p className="text-red-500 text-lg">
                                {formState.errorMessage}
                            </p>
                        )}
                    </div>
                    {/* username input */}
                    <div className="flex flex-col w-3/4 gap-2">
                        <label
                            htmlFor="username"
                            className="text-palette5 pl-1"
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

                    {/* password input */}
                    <div className="flex flex-col w-3/4 gap-2">
                        <label
                            htmlFor="password"
                            className="text-[#0a0906] pl-1"
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

                <div className="w-full flex flex-col items-center gap-5">
                    {/* button */}
                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-3/4 p-1 rounded-xl bg-palette2 hover:bg-[#a08368] transition duration-300 text-palette3"
                    >
                        {/* Sign In */}
                        {isPending ? "Signing In..." : "Sign In"}
                    </button>

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
