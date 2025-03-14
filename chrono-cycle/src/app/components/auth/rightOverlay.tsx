// right overlay function for the login page
import React, { Dispatch, SetStateAction } from "react";

interface RightOverlayProps {
    isSignUpActive: boolean;
    setSignUpActive: Dispatch<SetStateAction<boolean>>;
}

const RightOverlay: React.FC<RightOverlayProps> = ({
    isSignUpActive: isSignUpActive,
    setSignUpActive: setSignUpActive,
}) => {
    return (
        <div className="flex flex-col h-full items-center justify-center gap-20">
            <h1 className="w-4/5 text-5xl text-palette3 font-bold text-center">
                Welcome back to ChronoCycle!
            </h1>

            <div className="w-full flex flex-col items-center gap-3">
                <h3 className="text-lg text-gray-200">
                    Don&apos;t have an account?
                </h3>
                <button
                    className="w-1/5 p-1 rounded-xl border-palette3 border text-palette3 transition-colors duration-400 hover:bg-[#6e5a42] hover:border-[#b1b1b1] hover:text-[#b1b1b1]"
                    onClick={() => {
                        setSignUpActive(!isSignUpActive);
                    }}
                >
                    Sign Up
                </button>
            </div>
        </div>
    );
};

export default RightOverlay;
