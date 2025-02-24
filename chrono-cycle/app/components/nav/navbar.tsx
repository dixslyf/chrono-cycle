// main navbar
"use client";

import {
    useState,
    useCallback,
    useEffect,
    useRef,
    useActionState,
} from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import HamburgerMenu from "./menu";
import Logo from "./logo";
import { Bell, User, UserPen, LogOut } from "lucide-react";
import Sidebar from "./sidebar";
import { signout as signoutAction } from "@/server/auth/actions";

const Navbar = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false); // handles sidebar
    const [isNotiOpen, setIsNotiOpen] = useState<boolean>(false); // handles notification dropdown
    const [notifications, setNotifications] = useState<number>(3); // eslint-disable-line @typescript-eslint/no-unused-vars
    const [isUserOpen, setIsUserOpen] = useState<boolean>(false);
    const pathname = usePathname();

    // Server-side action for logging out.
    const [_signoutState, signoutFormAction, _signoutPending] = useActionState(
        signoutAction,
        null,
    );

    const profileContainerRef = useRef<HTMLDivElement | null>(null);

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
        setIsUserOpen((prev) => !prev);
    };

    // close profile dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                profileContainerRef.current &&
                !profileContainerRef.current.contains(event.target as Node)
            ) {
                setIsUserOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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

                    <div className="relative" ref={profileContainerRef}>
                        <button
                            onClick={toggleProfile}
                            className="flex items-center focus:outline-none"
                        >
                            <User className="w-8 h-8" />
                        </button>

                        {/* profile downdown */}
                        {isUserOpen && (
                            <div className="absolute right-0 mt-5 w-48 bg-palette3 text-palette5 rounded-xl shadow-xl overflow-hidden">
                                <ul>
                                    <li className="bg-palette2">
                                        <User />
                                        User
                                    </li>
                                    <li className="hover:bg-[#00000030]">
                                        <Link href="/profile">
                                            <UserPen />
                                            Profile
                                        </Link>
                                    </li>
                                    <li className="hover:bg-[#00000030]">
                                        <form action={signoutFormAction}>
                                            <button
                                                type="submit"
                                                className="w-full"
                                            >
                                                <LogOut />
                                                Logout
                                            </button>
                                        </form>
                                    </li>
                                </ul>
                            </div>
                        )}
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
