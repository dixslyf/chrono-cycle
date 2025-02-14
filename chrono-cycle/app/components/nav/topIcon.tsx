// react component for logo and hamburger icon
import Logo from "./logo";

interface IconLogoProps {
    isOpen: boolean;
}

const IconLogo: React.FC<IconLogoProps> = ({ isOpen }) => {
    return (
        <>
            {/* hamburger menu */}
            <button>
                <div className="grid justify-items-center gap-1.5">
                    <span
                        className={`h-1 w-9 rounded-full bg-palette3 transition-transform duration-[1s] ${
                            isOpen ? "rotate-45 translate-y-2.5" : ""
                        }`}
                    ></span>
                    <span
                        className={`h-1 w-9 rounded-full bg-palette3 transition-all duration-[1s] ${
                            isOpen ? "scale-x-0" : ""
                        }`}
                    ></span>
                    <span
                        className={`h-1 w-9 rounded-full bg-palette3 transition-transform duration-[1s] ${
                            isOpen ? "-rotate-45 -translate-y-2.5" : ""
                        }`}
                    ></span>
                </div>
            </button>
            {/* logo */}
            <Logo className="text-palette3 h-14 w-auto" />
        </>
    );
};

export default IconLogo;
