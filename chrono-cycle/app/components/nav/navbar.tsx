// main navbar
"use client";

import { useState, useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";
import IconLogo from "./topIcon";
import { Bell, User } from "lucide-react";
import Sidebar from "./sidebar";

const Navbar = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false); // handles sidebar
    const [isNotiOpen, setIsNotiOpen] = useState<boolean>(false); // handles notification dropdown
    const [notifications, setNotifications] = useState<number>(3); // eslint-disable-line @typescript-eslint/no-unused-vars
    const [isUserOpen, setIsUserOpen] = useState<boolean>(false);
    const pathname = usePathname();

    // useCallback used to prevent unnecessary re-renders
    const toggleSidebar = useCallback(() => {
        setIsSidebarOpen((prev) => !prev);
    }, []);

    // close sidebar when the route changes
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

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

            {/* sidebar component */}
            <Sidebar
                isSidebarOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
            />
        </>
    );
};

export default Navbar;
