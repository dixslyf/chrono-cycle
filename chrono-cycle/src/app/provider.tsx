"use client";

import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { MantineProvider } from "@mantine/core";
import { DatesProvider } from "@mantine/dates";
import {
    QueryCache,
    QueryClient,
    QueryClientProvider,
} from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import React from "react";

import { notifyError } from "./utils/notifications";

const queryClient = new QueryClient({
    queryCache: new QueryCache({
        onError: (error, query) => {
            // Show error notification.
            if (query.meta?.errorMessage) {
                notifyError({ message: query.meta.errorMessage as string });
            } else if (error.message) {
                notifyError({
                    message: `An error occurred: ${error.message}`,
                });
            } else {
                notifyError({ message: "An error occurred." });
            }

            // Call onError callback if it exists.
            // Used to e.g. close modals.
            if (typeof query.meta?.onError === "function") {
                query.meta.onError(error);
            }
        },
    }),
});

export default function RootProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <QueryClientProvider client={queryClient}>
            <MantineProvider>
                <ChakraProvider value={defaultSystem}>
                    <ThemeProvider>
                        <DatesProvider
                            settings={{
                                // FIXME: For now, we assume the timezone is Singapore's.
                                timezone: "Asia/Singapore",
                            }}
                        >
                            {children}
                        </DatesProvider>
                    </ThemeProvider>
                </ChakraProvider>
            </MantineProvider>
        </QueryClientProvider>
    );
}
