// needed, does not work without it. since, react is server-side by default.
"use client";

import { useState } from "react";
import {
    Menu,
    Bell,
    User,
    House,
    LayoutTemplate,
    CircleHelp,
    Settings,
} from "lucide-react";
import Image from "next/image";
import logo from "@/assets/logo.svg";

export default function Navbar() {
    // State to manage sidebar visibility
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Toggle sidebar visibility
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // click handlers for other icons
    const handleBellClick = () => {
        // Add your notification click logic here
    };

    const handleUserClick = () => {
        // Add your user profile click logic here
    };

    return (
        <>
            {/* Navbar */}
            <nav className="bg-[#5E4A36] text-white p-4 flex items-center justify-between">
                {/* Left - Hamburger Menu & Logo */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleSidebar}
                        className="text-white text-2xl"
                    >
                        <Menu className="w-8 h-8" />
                    </button>
                    <div>
                        <Image priority src={logo} alt="" />
                    </div>
                </div>

                {/* Right - Notifications & User Profile */}
                <div className="flex items-center gap-4">
                    <button onClick={handleBellClick} className="relative">
                        <Bell className="w-8 h-8" />
                        <span className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                            5
                        </span>
                    </button>
                    <button onClick={handleUserClick}>
                        <User className="w-8 h-8" />
                    </button>
                </div>
            </nav>

            {/* Sidebar */}
            <div
                className={`fixed top-0 left-0 h-full w-64 bg-[#5E4A36] text-white transform transition-transform duration-300 ease-in-out ${
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                {/* Sidebar Header */}
                <div className="flex justify-center items-center p-4">
                    <Image priority src={logo} alt="" />
                </div>

                {/* Sidebar Navigation Links */}
                <div className="p-4">
                    <ul className="space-y-3">
                        <li>
                            <a
                                href="#"
                                className="flex items-center py-2 px-4 hover:bg-[#6B5A4A] rounded transition-colors"
                            >
                                <House className="w-6 h-6 mr-3" />
                                <span className="text-sm font-medium">
                                    Home
                                </span>
                            </a>
                        </li>
                        <li>
                            <a
                                href="#"
                                className="flex items-center py-2 px-4 hover:bg-[#6B5A4A] rounded transition-colors"
                            >
                                <LayoutTemplate className="w-6 h-6 mr-3" />
                                <span className="text-sm font-medium">
                                    Templates
                                </span>
                            </a>
                        </li>
                        <li>
                            <a
                                href="#"
                                className="flex items-center py-2 px-4 hover:bg-[#6B5A4A] rounded transition-colors"
                            >
                                <CircleHelp className="w-6 h-6 mr-3" />
                                <span className="text-sm font-medium">
                                    Help
                                </span>
                            </a>
                        </li>
                        <li>
                            <a
                                href="#"
                                className="flex items-center py-2 px-4 hover:bg-[#6B5A4A] rounded transition-colors"
                            >
                                <Settings className="w-6 h-6 mr-3" />
                                <span className="text-sm font-medium">
                                    Settings
                                </span>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-10"
                    onClick={toggleSidebar}
                />
            )}
        </>
    );
}
