import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import RootProvider from "./provider";

import "@mantine/core/styles.css";
import "mantine-datatable/styles.layer.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";

import { ColorSchemeScript } from "@mantine/core";
import { Notifications } from "@mantine/notifications";

import "./globals.css";
import "./mantine-styles.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "ChronoCycle",
    description: "Management tool for complex recurring processes",
    icons: {
        icon: "/logo.svg",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="w-full h-full" suppressHydrationWarning>
            <head>
                <ColorSchemeScript />
            </head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased w-full h-full`}
            >
                <RootProvider>
                    {/* Mantine notifications */}
                    <Notifications zIndex={1000} />
                    {children}
                </RootProvider>
            </body>
        </html>
    );
}
