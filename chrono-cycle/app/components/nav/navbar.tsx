// main navbar
"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import IconLogo from "./topIcon";
import {
    Bell,
    User,
    House,
    LayoutTemplate,
    CircleHelp,
    Cog,
} from "lucide-react";
import Link from "next/link";

const Navbar = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false); // handles sidebar
    const [isNotiOpen, setIsNotiOpen] = useState<boolean>(false); // handles notification dropdown
    const [notifications, setNotifications] = useState<number>(3); // eslint-disable-line @typescript-eslint/no-unused-vars
    const [isUserOpen, setIsUserOpen] = useState<boolean>(false);

    const pathname = usePathname();

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // toggle notification dropdown
    const toggleNoti = () => {
        setIsNotiOpen(!isNotiOpen);
    };

    // toggle profile dropdown
    const toggleProfile = () => {
        setIsUserOpen(!isUserOpen);
    };

    return (
        <>
            {/* top nav bar */}
            <nav className="bg-palette1 text-palette3 p-4 flex items-center justify-between">
                {/* Hamburger menu & Logo */}
                <div
                    onClick={toggleSidebar}
                    className="flex items-center gap-4"
                >
                    <IconLogo isOpen={isSidebarOpen} />
                </div>

                {/* Notifications & User Profile */}
                <div className="flex items-center gap-4">
                    {/* notification here */}
                    <button onClick={toggleNoti} className="relative">
                        <Bell className="w-8 h-8" />
                        {notifications > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-palette3 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                {notifications}
                            </span>
                        )}
                    </button>
                    <button onClick={toggleProfile}>
                        <User className="w-8 h-8" />
                    </button>
                </div>
            </nav>
            {/* side navbar */}
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
                            <span className="font-semibold text-3xl">
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
                            <span className="font-semibold text-3xl">
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
                            <span className="font-semibold text-3xl">Help</span>
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
                            <span className="font-semibold text-3xl">
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

export default Navbar;
