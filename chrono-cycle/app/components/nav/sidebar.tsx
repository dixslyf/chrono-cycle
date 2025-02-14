// side bar component
"use client";
// import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { House, LayoutTemplate, CircleHelp, Cog } from "lucide-react";
import Link from "next/link";
import HamburgerMenu from "./menu";
import Logo from "./logo";
import { useEffect, useState } from "react";

interface SidebarProps {
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
}

const Sidebar = ({ isSidebarOpen, toggleSidebar }: SidebarProps) => {
    const [mounted, setMounted] = useState<boolean>(false);
    const pathname = usePathname();

    // Ensure component is mounted before rendering
    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <>
            <nav
                className={`fixed top-0 left-0 h-full w-[20%] p-4 bg-palette1 text-palette3 transform transition-transform duration-300 ease-in-out ${
                    isSidebarOpen ? "translate-x-0 z-20" : "-translate-x-full"
                }`}
            >
                {/* logo and close button */}
                <div onClick={toggleSidebar} className="flex justify-between">
                    <Logo className="text-palette3 h-14 w-auto" />
                    <HamburgerMenu isOpen={isSidebarOpen} />
                </div>
                {/* Navigation links */}
                <div className="w-full mt-10 p-5 flex flex-col gap-8">
                    {mounted && (
                        <>
                            {/* dashboard */}
                            <div>
                                <Link
                                    href="/dashboard"
                                    className={`flex items-center gap-5 p-3 rounded-lg text-palette3 ${
                                        pathname == "/dashboard"
                                            ? "bg-[#FFFFFF18] hover:bg-[#FFFFFF30]"
                                            : "hover:bg-[#FFFFFF18]"
                                    }`}
                                >
                                    <House className="w-10 h-10 min-w-[40px] flex-shrink-0" />
                                    <span className="font-semibold text-2xl truncate">
                                        Dashboard
                                    </span>
                                </Link>
                            </div>
                            {/* template */}
                            <div>
                                <Link
                                    href="/templates"
                                    className={`flex gap-5 p-3 rounded-lg text-palette3 ${
                                        pathname == "/templates"
                                            ? "bg-[#FFFFFF18] hover:bg-[#FFFFFF30]"
                                            : "hover:bg-[#FFFFFF18]"
                                    }`}
                                >
                                    <LayoutTemplate className="w-10 h-10 min-w-[40px] flex-shrink-0" />
                                    <span className="font-semibold text-2xl truncate">
                                        Templates
                                    </span>
                                </Link>
                            </div>
                            {/* circle help */}
                            <div>
                                <Link
                                    href="/help"
                                    className={`flex gap-5 p-3 rounded-lg text-palette3 ${
                                        pathname == "/help"
                                            ? "bg-[#FFFFFF18] hover:bg-[#FFFFFF30]"
                                            : "hover:bg-[#FFFFFF18]"
                                    }`}
                                >
                                    <CircleHelp className="w-10 h-10 min-w-[40px] flex-shrink-0" />
                                    <span className="font-semibold text-2xl truncate">
                                        Help
                                    </span>
                                </Link>
                            </div>
                            {/* settings */}
                            <div>
                                <Link
                                    href="/settings"
                                    className={`flex gap-5 p-3 rounded-lg text-palette3 ${
                                        pathname == "/settings"
                                            ? "bg-[#FFFFFF18] hover:bg-[#FFFFFF30]"
                                            : "hover:bg-[#FFFFFF18]"
                                    }`}
                                >
                                    <Cog className="w-10 h-10 min-w-[40px] flex-shrink-0" />
                                    <span className="font-semibold text-2xl truncate">
                                        Settings
                                    </span>
                                </Link>
                            </div>
                        </>
                    )}
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
