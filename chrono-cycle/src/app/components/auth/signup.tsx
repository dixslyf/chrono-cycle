// sign up component
"use client";

import { useActionState, useEffect, useState } from "react";
import { signUpAction } from "@/server/features/auth/signUp/action";
import {
    type SignUpFormData,
    type SignUpFormErrors,
    signUpFormSchema,
} from "@/server/features/auth/signUp/data";

const SignupForm = () => {
    // Server-side action for form submission.
    const [formState, formAction, isPending] = useActionState(signUpAction, {
        submitSuccess: false,
    });

    // Client-side states (form data and errors) for real-time form validation.
    const [formData, setFormData] = useState<SignUpFormData>({
        username: "",
        email: "",
        password: "",
    });

    const [formErrors, setFormErrors] = useState<SignUpFormErrors>({});

    // Update the form data after each change to an input field.
    const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Check for validation errors on the client side.
    useEffect(() => {
        const parseResult = signUpFormSchema.safeParse(formData);
        if (!parseResult.success) {
            const fieldErrors = parseResult.error.format();
            // Errors are only displayed if the field is not empty.
            setFormErrors({
                username: formData.username && fieldErrors.username?._errors[0],
                email: formData.email && fieldErrors.email?._errors[0],
                password: formData.password && fieldErrors.password?._errors[0],
            });
            console.log(fieldErrors.password);
        } else {
            setFormErrors({});
        }
    }, [formData]); // Runs validation whenever formData changes

    return (
        <div className="w-full h-full flex flex-col gap-10">
            {/* header */}
            <h1 className="text-palette1 font-bold text-3xl p-5">Sign Up</h1>
            <form action={formAction}>
                {/* error or success message */}
                <div className="w-full flex justify-center mb-4 font-semibold">
                    {formState?.submitSuccess && !formState?.errorMessage && (
                        <p className="text-green-500 text-lg">
                            Account successfully created! Please sign in.
                        </p>
                    )}
                    {formState?.errorMessage && (
                        <p className="text-red-500 text-lg">
                            {`${formState.errorMessage}`}
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
                                onChange={handleFieldChange}
                                value={formData.username}
                                className="rounded-xl bg-[#dfdfdf] placeholder-[#989898] p-1 pl-2 focus:outline-none focus:border-[#949494] focus:ring-[#949494] focus:ring-1"
                                placeholder="Username"
                                required
                            />
                            <p
                                id="username-error"
                                className="text-red-600 pl-2"
                            >
                                {formErrors?.username && formErrors.username}
                            </p>
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
                                onChange={handleFieldChange}
                                value={formData.email}
                                className="rounded-xl bg-[#dfdfdf] placeholder-[#989898] p-1 pl-2 focus:outline-none focus:border-[#949494] focus:ring-[#949494] focus:ring-1"
                                placeholder="abc@example.com"
                                required
                            />
                            <p id="email-error" className="text-red-600 pl-2">
                                {formErrors?.email && formErrors.email}
                            </p>
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
                                onChange={handleFieldChange}
                                value={formData.password}
                                className="rounded-xl bg-[#dfdfdf] placeholder-[#989898] p-1 pl-2 focus:outline-none focus:border-[#949494] focus:ring-[#949494] focus:ring-1"
                                placeholder="Password"
                                required
                            />
                            <p
                                id="password-error"
                                className="text-red-600 pl-2"
                            >
                                {formErrors?.password && formErrors.password}
                            </p>
                        </div>
                    </div>

                    {/* button */}
                    <button
                        type="submit"
                        disabled={
                            // Disable while submitting and if there are validation errors.
                            isPending || Object.keys(formErrors).length > 0
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
