// side bar component
"use client";

// import { useEffect } from "react";
import { Box, Group, Stack, Text } from "@mantine/core";
import { CircleHelp, Cog, House, LayoutTemplate } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import Logo from "./logo";
import HamburgerMenu from "./menu";

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
                className={`fixed top-0 left-0 h-full w-[20%] p-4 bg-palette1 text-palette3 transform transition-transform duration-300 ease-in-out z-10 ${
                    isSidebarOpen ? "translate-x-0 z-20" : "-translate-x-full"
                }`}
            >
                {/* logo and close button */}
                <Group onClick={toggleSidebar} justify="space-between">
                    <Logo className="text-palette3 h-14 w-auto" />
                    <HamburgerMenu isOpen={isSidebarOpen} />
                </Group>
                {/* Navigation links */}
                <Stack className="w-full mt-10 p-5" gap="lg">
                    {mounted && (
                        <>
                            {/* dashboard */}
                            <Box>
                                <Link
                                    href="/dashboard"
                                    className={`flex items-center gap-5 p-3 rounded-lg text-palette3 overflow-hidden ${
                                        pathname == "/dashboard"
                                            ? "bg-[#FFFFFF18] hover:bg-[#FFFFFF30]"
                                            : "hover:bg-[#FFFFFF18]"
                                    }`}
                                >
                                    <House className="w-10 h-10 min-w-[40px] flex-shrink-0" />
                                    <Text className="font-semibold text-2xl truncate">
                                        Dashboard
                                    </Text>
                                </Link>
                            </Box>
                            {/* template */}
                            <Box>
                                <Link
                                    href="/templates"
                                    className={`flex items-center gap-5 p-3 rounded-lg text-palette3 overflow-hidden ${
                                        pathname == "/templates"
                                            ? "bg-[#FFFFFF18] hover:bg-[#FFFFFF30]"
                                            : "hover:bg-[#FFFFFF18]"
                                    }`}
                                >
                                    <LayoutTemplate className="w-10 h-10 min-w-[40px] flex-shrink-0" />
                                    <Text className="font-semibold text-2xl truncate">
                                        Templates
                                    </Text>
                                </Link>
                            </Box>
                            {/* circle help */}
                            <Box>
                                <Link
                                    href="/help"
                                    className={`flex items-center gap-5 p-3 rounded-lg text-palette3 overflow-hidden ${
                                        pathname == "/help"
                                            ? "bg-[#FFFFFF18] hover:bg-[#FFFFFF30]"
                                            : "hover:bg-[#FFFFFF18]"
                                    }`}
                                >
                                    <CircleHelp className="w-10 h-10 min-w-[40px] flex-shrink-0" />
                                    <Text className="font-semibold text-2xl truncate">
                                        Help
                                    </Text>
                                </Link>
                            </Box>
                            {/* settings */}
                            <Box>
                                <Link
                                    href="/settings"
                                    className={`flex items-center gap-5 p-3 rounded-lg text-palette3 overflow-hidden ${
                                        pathname == "/settings"
                                            ? "bg-[#FFFFFF18] hover:bg-[#FFFFFF30]"
                                            : "hover:bg-[#FFFFFF18]"
                                    }`}
                                >
                                    <Cog className="w-10 h-10 min-w-[40px] flex-shrink-0" />
                                    <Text className="font-semibold text-2xl truncate">
                                        Settings
                                    </Text>
                                </Link>
                            </Box>
                        </>
                    )}
                </Stack>
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
