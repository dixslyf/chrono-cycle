// main navbar 
"use client"

import { useState } from "react"
import Image from "next/image"
// import Logo from "@/assets/logo.svg"
import Logo from "./logo"

const Navbar = () => {
    return (
        <>
            <nav className="bg-palette1 text-palette3 p-4 flex items-center justify-between">
                {/* Hamburger menu & Logo */}
                <div className="flex items-center gap-3">
                    {/* hamburger menu here */}

                    {/* logo here */}
                    <Logo className=" text-palette3 h-14 w-auto"/>
                </div>
            </nav>
        </>
    )
}

export default Navbar;