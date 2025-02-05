// left overlay function for the login page
import { Dispatch, SetStateAction } from "react";

const LeftOverlay = (
    isAnimated: boolean,
    setAnimate: Dispatch<SetStateAction<boolean>>
) => {
    return (
        <div>
            <h1>Welcome to ChronoCycle</h1>
            <h3>Already have an account?</h3>
            <button className="w-3/4 p-1 rounded-xl bg-palette1 hover:bg[#a08368] transition duration-300 text-palette3"
            onClick={() => {
                setAnimate(isAnimated)
            }}
            >
                Sign In
            </button>
        </div>
    )
}

export default LeftOverlay; 