// react component for hamburger menu

interface HamburgerMenuProps {
    isOpen: boolean;
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ isOpen }) => {
    return (
        <>
            <button>
                <div className="grid justify-items-center gap-1.5">
                    <span
                        className={`h-1 w-9 rounded-full bg-palette3 transition-transform duration-500 ${
                            isOpen ? "rotate-45 translate-y-2.5" : ""
                        }`}
                    ></span>
                    <span
                        className={`h-1 w-9 rounded-full bg-palette3 transition-all duration-500 ${
                            isOpen ? "scale-x-0" : ""
                        }`}
                    ></span>
                    <span
                        className={`h-1 w-9 rounded-full bg-palette3 transition-transform duration-500 ${
                            isOpen ? "-rotate-45 -translate-y-2.5" : ""
                        }`}
                    ></span>
                </div>
            </button>
        </>
    );
};

export default HamburgerMenu;
