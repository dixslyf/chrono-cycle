"use client";

import { useState } from "react";

import LeftOverlay from "./leftOverlay";
import RightOverlay from "./rightOverlay";
import SigninForm from "./signin";
import SignupForm from "./signup";

const Auth = () => {
    const [isSignUpActive, setSignUpActive] = useState<boolean>(false);
    return (
        <section className="w-full h-full flex justify-center items-center">
            {/* sign in / sign up wrapper */}
            <div className="shadow-2xl w-2/4 h-3/4 relative overflow-hidden">
                {/* sign in section */}
                <div
                    className={`absolute top-0 left-0 h-full w-1/2 z-20 transition-all duration-700 ease-in-out ${
                        isSignUpActive ? "translate-x-full opacity-0" : ""
                    }`}
                >
                    <SigninForm />
                </div>

                {/* sign up section */}
                <div
                    className={`absolute top-0 left-0 h-full w-1/2 transition-all duration-700 ease-in-out ${
                        isSignUpActive
                            ? "translate-x-full opacity-100 z-40"
                            : "opacity-0 z-10"
                    }`}
                >
                    <SignupForm />
                </div>

                {/* overlay section */}
                {/* overlay container */}
                <div
                    className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition transition-transform duration-700 ease-in-out z-50 ${
                        isSignUpActive ? "-translate-x-full" : ""
                    }`}
                >
                    {/* overlay */}
                    <div
                        className={`bg-palette1 relative h-full w-[200%] -left-full transform transition transition-transform duration-700 ease-in-out ${
                            isSignUpActive ? "translate-x-1/2" : "translate-x-0"
                        }`}
                    >
                        {/* left overlay */}
                        <div
                            className={`w-1/2 h-full absolute top-0 transform -translate-x-[20%] transition transition-transform duration-700 ease-in-out ${
                                isSignUpActive
                                    ? "translate-x-0"
                                    : "-translate-x-[20%]"
                            }`}
                        >
                            <LeftOverlay
                                isSignUpActive={isSignUpActive}
                                setSignUpActive={setSignUpActive}
                            />
                        </div>

                        {/* right overlay */}
                        <div
                            className={`w-1/2 h-full absolute top-0 right-0 transform transition transition-transform duration-700 ease-in-out ${
                                isSignUpActive
                                    ? "translate-x-[20%]"
                                    : "translate-x-0"
                            }`}
                        >
                            <RightOverlay
                                isSignUpActive={isSignUpActive}
                                setSignUpActive={setSignUpActive}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Auth;
