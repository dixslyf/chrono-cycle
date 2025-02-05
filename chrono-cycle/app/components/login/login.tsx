'use client';
import { useState } from "react";
import SigninForm from "./signin";
import SignupForm from "./signup";
import LeftOverlay from "./leftOverlay";
import RightOverlay from "./rightOverlay";

const Login = () => {
    const [isAnimated, setAnimate] = useState<boolean>(false);
    return (
        <section className="w-full h-full flex justify-center items-center">
            {/* sign in / sign up wrapper */}
            <div className="border border-red-200 w-2/4 h-3/4 relative overflow-hidden">
                {/* sign in section */}
                <div className={`absolute top-0 left-0 h-full w-1/2 z-20 ${isAnimated ? "translate-x-full opacity-0" : ""}`}>
                    <SigninForm />
                </div>

                {/* sign up section */}
                <div className={`absolute top-0 left-0 h-full w-1/2 ${isAnimated ? "translate-x-full opacity-100 z-50" : "opacity-0 z-10"}`}>
                    <SignupForm />
                </div>

                {/* overlay section */}
                {/* overlay container */}
                <div className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition transition-transform duration-700 ease-in-out z-100 ${
                    isAnimated ? "-translate-x-full" : ""    
                }`}>
                    {/* overlay */}
                    <div className={`bg-palette1 relative -left-full h-full w-[200%] transform transition-transform duration-700 ease-in-out ${
                        isAnimated ? "translate-x-0" : "-translate-x-[20%]"
                    }`}>
                        {/* overlay left */}
                            <div>
                                <LeftOverlay 
                                    isAnimated={isAnimated}
                                    setAnimate={setAnimate}
                                />
                            </div>
                        {/* overlay right */}
                            <div>
                                <RightOverlay 
                                    isAnimated={isAnimated}
                                    setAnimate={setAnimate}
                                />
                            </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Login;