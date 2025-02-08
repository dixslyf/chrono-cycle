// sign in component
"use client";

import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";

interface FormData {
    username: string;
    password: string;
}

const initialForm: FormData = {
    username: "",
    password: "",
};

const SigninForm = () => {
    const router = useRouter();

    // hold boolean value for remember me checkbox
    const [rememberMe, setRememberMe] = useState<boolean>(false);
    const [formData, setFormData] = useState<FormData>(initialForm);
    const [isSubmitting, setSubmitting] = useState<boolean>(false);

    // handler
    const rememberMeHandler = () => {
        setRememberMe(!rememberMe);
    };

    const inputHandler = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const submitHandler = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            // TODO
            // can use fetch() function to send form data to api for validation
            // for now will just redirect to dashboard page
            // for simulation purpose (API request)
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setFormData(initialForm);
            // navigate to dashboard
            router.push("/dashboard");
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="w-full h-full flex flex-col gap-10">
            {/* header */}
            <h1 className="text-palette1 font-bold text-3xl p-5">Sign In</h1>
            <form
                onSubmit={submitHandler}
                className="flex flex-col items-center gap-16"
            >
                <div className="w-full flex flex-col items-center gap-5">
                    {/* username input */}
                    <div className="flex flex-col w-3/4 gap-2">
                        <label htmlFor="uname" className="text-palette5 pl-1">
                            Username<span className="text-red-600">*</span>
                        </label>
                        <input
                            type="text"
                            id="uname"
                            name="uname"
                            onChange={inputHandler}
                            className="rounded-xl bg-[#dfdfdf] placeholder-[#989898] p-1 pl-2 focus:outline-none focus:border-[#949494] focus:ring-[#949494] focus:ring-1"
                            placeholder="Username"
                            required
                        />
                    </div>

                    {/* password input */}
                    <div className="flex flex-col w-3/4 gap-2">
                        <label htmlFor="pwd" className="text-[#0a0906] pl-1">
                            Password<span className="text-red-600">*</span>
                        </label>
                        <input
                            type="password"
                            id="pwd"
                            name="pwd"
                            onChange={inputHandler}
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
                        disabled={isSubmitting}
                        className="w-3/4 p-1 rounded-xl bg-palette2 hover:bg-[#a08368] transition duration-300 text-palette3"
                    >
                        {/* Sign In */}
                        {isSubmitting ? "Signing In" : "Sign In"}
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
                                id="rmb"
                                name="rmb"
                                checked={rememberMe}
                                onChange={rememberMeHandler}
                            />
                            <label
                                htmlFor="rmb"
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
