// sign up component 
'use client'

import { ChangeEvent, FormEvent, useState } from "react";

interface FormData {
    username: string;
    email: string;
    password: string;
}

const initalForm: FormData = {
    username: "",
    email: "",
    password: ""
}

const SignupForm = () => {
    const [formData, setFormData] = useState<FormData>(initalForm);
    const [isSubmitting, setSubmitting] = useState<boolean>(false);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // handler 
    const inputHandler = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({...prev, [name]: value}));
    };

    const submitHandler = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setSuccessMsg(null);
        setErrorMsg(null);

        try{
            // TODO
            // same for signin page
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setSuccessMsg("Account created. Please Sign In");
            setFormData(initalForm);

        } catch (err) {
            console.error(err);
            setErrorMsg("An Error Occured.");
        } finally {
            setSubmitting(false);
        }
    }
    
    return (
        <div className="w-full h-full flex flex-col gap-10">
            {/* header */}
            <h1 className="text-palette1 font-bold text-3xl p-5">Sign Up</h1>
            <form onSubmit={submitHandler}>
                {/* error or success message */}
                <div className="w-full flex justify-center mb-4 font-semibold">
                    {successMsg && <p className="text-green-500 text-lg">{successMsg}</p>}
                    {errorMsg && <p className="text-red-500 text-lg">{errorMsg}</p>}
                </div>
                <div className="flex flex-col items-center gap-10">
                    {/* username input */}
                    <div className="flex flex-col w-3/4 gap-2">
                        <label htmlFor="username" className=" text-palette5">
                            Username<span className="text-red-600">*</span>
                        </label>
                        <input type="text" id="username" name="username" onChange={inputHandler} value={formData.username} className="rounded-xl bg-[#dfdfdf] text-[#989898] p-1 focus:outline-none focus:border-[#949494] focus:ring-[#949494] focus:ring-1" placeholder="Username" required />
                    </div>

                    {/* email input */}
                    <div className="flex flex-col w-3/4 gap-2">
                        <label htmlFor="email" className="text-palette5">
                            Email<span className="text-red-600">*</span>
                        </label>
                        <input type="email" id="email" name="email" onChange={inputHandler} value={formData.email} className="rounded-xl bg-[#dfdfdf] text-[#989898] p-1 focus:outline-none focus:border-[#949494] focus:ring-[#949494] focus:ring-1" placeholder="abc@example.com" required/>
                    </div>

                    {/* password input */}
                    <div className="flex flex-col w-3/4 gap-2">
                        <label htmlFor="password" className="text-palette5">
                            Password<span className="text-red-600">*</span>
                        </label>
                        <input type="password" id="password" name="password" onChange={inputHandler} value={formData.password} className="rounded-xl bg-[#dfdfdf] text-[#989898] p-1 focus:outline-none focus:border-[#949494] focus:ring-[#949494] focus:ring-1" placeholder="Password" required/>
                    </div>

                    {/* button */}
                    <button type="submit" disabled={isSubmitting} className="w-3/4 p-1 rounded-xl bg-palette2 hover:bg-[#a08368] transition duration-300 text-palette3">
                        {/* Sign Up */}
                        {isSubmitting ? "Signing Up" : "Sign Up"}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default SignupForm;