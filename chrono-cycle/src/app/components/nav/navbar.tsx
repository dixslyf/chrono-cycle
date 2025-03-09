// main navbar
"use client";

import { useState, useCallback, useEffect, useActionState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import HamburgerMenu from "./menu";
import Logo from "./logo";
import { Bell, User, UserPen, LogOut } from "lucide-react";
import Sidebar from "./sidebar";
import { signOutAction } from "@/server/features/auth/signOut/action";
import {
    MenuContent,
    MenuItem,
    MenuRoot,
    MenuTrigger,
    Text,
} from "@chakra-ui/react";

const Navbar = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false); // handles sidebar
    const [isNotiOpen, setIsNotiOpen] = useState<boolean>(false); // handles notification dropdown
    const [notifications, _setNotifications] = useState<number>(3); // eslint-disable-line @typescript-eslint/no-unused-vars
    const pathname = usePathname();

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

                    <div className="relative">
                        <MenuRoot>
                            <MenuTrigger asChild>
                                <button className="focus:outline-none">
                                    <User className="w-8 h-8" />
                                </button>
                            </MenuTrigger>
                            <MenuContent className="absolute right-0 bg-palette3 p-0 rounded-lg">
                                <Text className="text-palette3 flex gap-2 bg-palette2 p-2 font-semibold text-lg">
                                    <User />
                                    User
                                </Text>
                                <MenuItem
                                    asChild
                                    value="profile"
                                    className="text-palette5 text-lg hover:bg-[#00000030] transition-colors duration-200 ease-linear"
                                >
                                    <Link href="/profile">
                                        <UserPen />
                                        Profile
                                    </Link>
                                </MenuItem>
                                <MenuItem
                                    asChild
                                    value="logout"
                                    className="text-palette5 text-lg hover:bg-[#00000030] transition-colors duration-200 ease-linear"
                                >
                                    <form action={signoutFormAction}>
                                        <button
                                            type="submit"
                                            className="flex gap-2 focus:outline-none"
                                        >
                                            <LogOut />
                                            Logout
                                        </button>
                                    </form>
                                </MenuItem>
                            </MenuContent>
                        </MenuRoot>
                    </div>
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
