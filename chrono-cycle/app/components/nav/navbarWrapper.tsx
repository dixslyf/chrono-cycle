"use client";

import { usePathname } from "next/navigation";
import Navbar from "./navbar";

const NavbarWrapper = () => {
    const pathname = usePathname();

    // hide navbar only on the main page ("/")
    if (pathname === "/") return null;

    return <Navbar />;
};

export default NavbarWrapper;
