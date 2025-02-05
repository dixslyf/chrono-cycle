// right overlay function for the login page
import { Dispatch, SetStateAction } from "react";

const RightOverlay = (
    isAnimated: boolean,
    setAnimate: Dispatch<SetStateAction<boolean>>
) => {
    return (
        <div className="w-full h-full border border-red-700">
            <h1>Welcome Back to ChronoCycle</h1>
            <h3>Don&apost have an account?</h3>
            <button className="w-3/4 p-1 rounded-xl bg-palette1 hover:bg[#a08368] transition duration-300 text-palette3"
            onClick={() => {
                setAnimate(isAnimated)
            }}
            >
                Sign Up
            </button>
        </div>
    )
}

export default RightOverlay;
