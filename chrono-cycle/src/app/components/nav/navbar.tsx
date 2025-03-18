// main navbar
"use client";

import { ActionIcon, Box, Text } from "@mantine/core";
import { Bell, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import {
    useActionState,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import { signOutAction } from "@/features/auth/signOut/action";

import Logo from "./logo";
import HamburgerMenu from "./menu";
import Sidebar from "./sidebar";

const Navbar = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false); // handles sidebar
    const [isNotiOpen, setIsNotiOpen] = useState<boolean>(false); // handles notification dropdown
    const [notifications, _setNotifications] = useState<number>(3);
    const pathname = usePathname();
    const formRef = useRef<HTMLFormElement>(null);

    // Server-side action for logging out.
    const [_signoutState, signoutFormAction, _signoutPending] = useActionState(
        signOutAction,
        null,
    );

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

    // handle log out
    const handleSignout = () => {
        if (formRef.current) {
            formRef.current.requestSubmit();
        }
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
                    {/* <IconLogo isOpen={isSidebarOpen} /> */}
                    <HamburgerMenu isOpen={isSidebarOpen} />
                    <Logo className="text-palette3 h-14 w-auto" />
                </div>

                {/* Notifications & User Profile */}
                <div className="flex items-center gap-4 justify-center">
                    {/* notification here */}
                    <Box className="relative flex justify-center">
                        <ActionIcon
                            onClick={toggleNoti}
                            variant="transparent"
                            className="text-palette3"
                        >
                            <Bell className="w-8 h-8" />
                        </ActionIcon>
                        {notifications > 0 && (
                            <Text className="absolute -top-1 -right-1 bg-red-500 text-palette3 text-sm font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                {notifications}
                            </Text>
                        )}
                    </Box>

                    <form ref={formRef} action={signoutFormAction}>
                        <ActionIcon
                            onClick={handleSignout}
                            variant="transparent"
                            className="text-palette3"
                            type="button"
                        >
                            <LogOut className="w-8 h-8" />
                        </ActionIcon>
                    </form>
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
