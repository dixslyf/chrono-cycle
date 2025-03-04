"use client";

import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { ThemeProvider } from "next-themes";
import { MantineProvider } from "@mantine/core";
import React from "react";

export default function RootProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <MantineProvider>
            <ChakraProvider value={defaultSystem}>
                <ThemeProvider>{children}</ThemeProvider>
            </ChakraProvider>
        </MantineProvider>
    );
}
