// main navbar
"use client";

import { ActionIcon, Box, Group, Text } from "@mantine/core";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/lib/function";
import { Bell, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import {
    startTransition,
    useActionState,
    useCallback,
    useEffect,
    useState,
} from "react";

import { notifyError } from "@/app/utils/notifications";

import { signOutAction } from "@/features/auth/signOut/action";

import Logo from "./logo";
import HamburgerMenu from "./menu";
import Sidebar from "./sidebar";

function NavbarClient<F>({
    usernameResult,
}: {
    usernameResult: E.Either<F, string>;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false); // handles sidebar
    const pathname = usePathname();

    // Server-side action for logging out.
    const [_signoutState, signOut, _signoutPending] = useActionState(
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

    // Show error message if username result is a failure.
    useEffect(() => {
        if (E.isRight(usernameResult)) return;
        notifyError({ message: "Failed to retrieve user information!" });
    }, [usernameResult]);

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

                {/* User Profile */}
                <Group gap="lg">
                    <Group gap="md" justify="center" p={0}>
                        <Text className="text-xl font-semibold text-palette3">
                            {pipe(
                                usernameResult,
                                E.match(
                                    (_err) => "unknown",
                                    (username) => username,
                                ),
                            )}
                        </Text>

                        <Box className="relative group flex justify-center">
                            {/* rounded hover */}
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] rounded-full bg-gray-400 opacity-0 group-hover:opacity-20 transition-opacity z-0" />
                            <ActionIcon
                                component="button"
                                onClick={() => startTransition(signOut)}
                                variant="transparent"
                                className="text-palette3 z-10"
                                type="button"
                                unstyled
                            >
                                <LogOut className="w-8 h-8" />
                            </ActionIcon>
                        </Box>
                    </Group>
                    {/* </Box> */}
                </Group>
            </nav>

            {/* sidebar component */}
            <Sidebar
                isSidebarOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
            />
        </>
    );
}

export default NavbarClient;
