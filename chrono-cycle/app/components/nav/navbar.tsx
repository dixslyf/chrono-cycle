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
                    <div className="grid justify-items-center gap-1.5">
                        <span className="h-1 w-8 rounded-full bg-black"></span>
                        <span className="h-1 w-8 rounded-full bg-black"></span>
                        <span className="h-1 w-8 rounded-full bg-black"></span>
                    </div>
                    {/* logo here */}
                    <Logo className=" text-palette3 h-14 w-auto"/>
                </div>
            </nav>
        </>
    )
}

export default Navbar;