// sign up component 
'use client'

// import { useState } from "react"

const SignupForm = () => {
    return (
        <div className="w-full h-full flex flex-col gap-10">
            {/* header */}
            <h1 className="text-palette1 font-bold text-3xl p-5">Sign Up</h1>
            <form action="" className="flex flex-col items-center gap-10">
                {/* username input */}
                <div className="flex flex-col w-3/4 gap-2">
                    <label htmlFor="uname" className=" text-palette5">
                        Username<span className="text-red-600">*</span>
                    </label>
                    <input type="text" id="uname" name="uname" className="rounded-xl bg-[#dfdfdf] text-[#989898] p-1 focus:outline-none focus:border-[#949494] focus:ring-[#949494] focus:ring-1" placeholder="Username" required />
                </div>

                {/* email input */}
                <div className="flex flex-col w-3/4 gap-2">
                    <label htmlFor="email" className="text-palette5">
                        Email<span className="text-red-600">*</span>
                    </label>
                    <input type="email" id="email" name="email" className="rounded-xl bg-[#dfdfdf] text-[#989898] p-1 focus:outline-none focus:border-[#949494] focus:ring-[#949494] focus:ring-1" placeholder="abc@example.com" required/>
                </div>

                {/* password input */}
                <div className="flex flex-col w-3/4 gap-2">
                    <label htmlFor="pwd" className="text-palette5">
                        Password<span className="text-red-600">*</span>
                    </label>
                    <input type="password" id="pwd" name="pwd" className="rounded-xl bg-[#dfdfdf] text-[#989898] p-1 focus:outline-none focus:border-[#949494] focus:ring-[#949494] focus:ring-1" placeholder="Password" required/>
                </div>

                {/* button */}
                <button className="w-3/4 p-1 rounded-xl bg-palette2 hover:bg-[#a08368] transition duration-300 text-palette3">
                    Sign Up
                </button>
            </form>
        </div>
    )
}

export default SignupForm;