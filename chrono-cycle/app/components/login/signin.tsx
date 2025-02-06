// sign in component 
'use client';

import { useState } from "react";

const SigninForm = () =>  {
    const [rememberMe, setRememberMe] = useState<boolean>(false);

    const rememberMeHandler = () => {
        setRememberMe(!rememberMe)
    }
    
    return (
        <div className="w-full h-full flex flex-col gap-10">
            {/* header */}
            <h1 className="text-palette1 font-bold text-3xl p-5">Sign In</h1>       
            <form action="" className="flex flex-col items-center gap-10">
    
                {/* username input */}
                <div className="flex flex-col w-3/4 gap-2">
                    <label htmlFor="uname" className="text-palette5">
                        Username<span className="text-red-600">*</span>
                    </label>
                    <input type="text" id="uname" name="uname" className="rounded-xl bg-[#dfdfdf] text-[#989898] p-1 focus:outline-none focus:border-[#949494] focus:ring-[#949494] focus:ring-1" placeholder="Username" required />
                </div>
    
                {/* password input */}
                <div className="flex flex-col w-3/4 gap-2">
                    <label htmlFor="pwd" className="text-[#0a0906]">
                        Password<span className="text-red-600">*</span>
                    </label>
                    <input type="password" id="pwd" name="pwd" className="rounded-xl bg-[#dfdfdf] text-[#989898] p-1 focus:outline-none focus:border-[#949494] focus:ring-[#949494] focus:ring-1" placeholder="Password" required/>
                </div>
    
                {/* button */}
                <button className="w-3/4 p-1 rounded-xl bg-palette2 hover:bg-[#a08368] transition duration-300 text-palette3">
                    Sign In
                </button>

                {/* remember me & forget password wrapper */}
                <div className="w-3/4 flex justify-between text-sm">
                    {/* remember me */}
                    <div className="flex gap-1 justify-center items-center">
                        {/* Will have to redo the checkbox styling */}
                        <input type="checkbox" className="w-4 h-4 rounded-md checked:bg-[#8a6d53] checked:border-[#a9927d] checked:text-[#f2f4f3] focus:ring-2 focus:ring-[#5a3d2b] focus:ring-offset-0" id="rmb" name="rmb" checked={rememberMe} onChange={rememberMeHandler} />
                        <span className="font-medium text-[#a9927d]">Remember Me</span>
                    </div>

                    {/* forget password */}
                    <div>
                        <a href="#">Forget Password?</a>
                    </div>
                </div>
                
            </form>  
        </div>      
    )
}

export default SigninForm;