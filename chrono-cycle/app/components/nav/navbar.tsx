// main navbar 
"use client"

import { useState } from "react"
import Logo from "./logo"
import {
    Bell,
    User
} from "lucide-react";

const Navbar = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false); // handles sidebar
    const [isNotiOpen, setIsNotiOpen] = useState<boolean>(false); // handles notification dropdown
    const [notifications, setNotifications] = useState<number>(3); // handles notification numbers // eslint-disable-line @typescript-eslint/no-unused-vars
    const [isUserOpen, setIsUserOpen] = useState<boolean>(false);

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
                    {/* hamburger menu here */}
                    <button className="group h-15 w-15">
                        <div className="grid justify-items-center gap-1.5">
                            <span className="h-1 w-9 rounded-full bg-palette3 group-hover:rotate-45 group-hover:translate-y-2.5 duration-[3s]"></span>
                            <span className="h-1 w-9 rounded-full bg-palette3 group-hover:scale-x-0 transition duration-[3s]"></span>
                            <span className="h-1 w-9 rounded-full bg-palette3 group-hover:-rotate-45 group-hover:-translate-y-2.5 duration-[3s]"></span>
                        </div>
                    </button>
                    {/* logo here */}
                    <Logo className=" text-palette3 h-14 w-auto"/>
                </div>

                {/* Notifications & User Profile */}
                <div className="flex items-center gap-4">
                    {/* notification here */}
                    <button onClick={toggleNoti} className="relative">
                        <Bell className="w-8 h-8"/>
                        {notifications > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-palette3 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                {notifications}
                            </span>
                        )}
                    </button>
                    <button onClick={toggleProfile}>
                        <User className="w-8 h-8"/>
                    </button>
                </div>
            </nav>
        </>
    )
}

export default Navbar;