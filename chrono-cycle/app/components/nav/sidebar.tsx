// side bar component
"use client";
// import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { House, LayoutTemplate, CircleHelp, Cog } from "lucide-react";
import Link from "next/link";
import IconLogo from "./topIcon";

interface SidebarProps {
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
}

const Sidebar = ({ isSidebarOpen, toggleSidebar }: SidebarProps) => {
    const pathname = usePathname();

    return (
        <>
            <nav
                className={`fixed top-0 left-0 h-full w-[20%] p-4 bg-palette1 text-palette3 transform transition-transform duration-300 ease-in-out ${
                    isSidebarOpen ? "translate-x-0 z-20" : "-translate-x-full"
                }`}
            >
                {/* logo and close button */}
                <div
                    onClick={toggleSidebar}
                    className="flex flex-row-reverse justify-between"
                >
                    <IconLogo isOpen={isSidebarOpen} />
                </div>
                {/* Navigation links */}
                <div className="w-full mt-10 p-5 flex flex-col gap-8">
                    {/* dashboard */}
                    <div>
                        <Link
                            href="/dashboard"
                            className={`flex gap-5 p-3 rounded-lg text-palette3 ${
                                pathname == "/dashboard"
                                    ? "bg-[#2b2a28]"
                                    : "hover:bg-palette4"
                            }`}
                        >
                            <House
                                className="w-10 h-10"
                                style={{ fill: "none" }}
                            />
                            <span className="font-semibold text-2xl">
                                Dashboard
                            </span>
                        </Link>
                    </div>
                    {/* template */}
                    <div>
                        <Link
                            href="/templates"
                            className={`flex gap-5 p-3 rounded-lg text-palette3 ${
                                pathname == "/template"
                                    ? "bg-palette4"
                                    : "hover:bg-palette4"
                            }`}
                        >
                            <LayoutTemplate className="w-10 h-10" />
                            <span className="font-semibold text-2xl">
                                Template
                            </span>
                        </Link>
                    </div>
                    {/* circle help */}
                    <div>
                        <Link
                            href="/help"
                            className={`flex gap-5 p-3 rounded-lg text-palette3 ${
                                pathname == "/help"
                                    ? "bg-palette4"
                                    : "hover:bg-palette4"
                            }`}
                        >
                            <CircleHelp className="w-10 h-10" />
                            <span className="font-semibold text-2xl">Help</span>
                        </Link>
                    </div>
                    {/* settings */}
                    <div>
                        <Link
                            href="/settings"
                            className={`flex gap-5 p-3 rounded-lg text-palette3 ${
                                pathname == "/settings"
                                    ? "bg-palette4"
                                    : "hover:bg-palette4"
                            }`}
                        >
                            <Cog className="w-10 h-10" />
                            <span className="font-semibold text-2xl">
                                Setting
                            </span>
                        </Link>
                    </div>
                </div>
            </nav>
            {/* overlay */}
            {isSidebarOpen && (
                <div
                    className={`fixed inset-0 bg-black z-10 bg-opacity-50 transition-opacity duration-300 ease-in-out ${
                        isSidebarOpen
                            ? "opacity-100 pointer-events-auto"
                            : "opacity-0 pointer-events-none"
                    }`}
                    onClick={toggleSidebar}
                />
            )}
        </>
    );
};

export default Sidebar;
