"use client";

import {
    Badge,
    createTheme,
    DEFAULT_THEME,
    MantineProvider,
    mergeMantineTheme,
} from "@mantine/core";
import { DatesProvider } from "@mantine/dates";
import {
    QueryCache,
    QueryClient,
    QueryClientProvider,
} from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import React from "react";

import { notifyError } from "./utils/notifications";

const themeOverride = createTheme({
    fontFamily: "Geist",
    fontFamilyMonospace: "Geist Mono",
    colors: {
        brown: [
            "#f7f5f3",
            "#e7e7e7",
            "#d0cdcb",
            "#bab1ab",
            "#a69990",
            "#9b8a7e",
            "#968274",
            "#837062",
            "#756355",
            "#685446",
        ],
        red: [
            "#ffedef",
            "#f6dbdd",
            "#e4b7ba",
            "#d49094",
            "#c56f74",
            "#bd5960",
            "#ba4e55",
            "#a43f46",
            "#94363d",
            "#832b33",
        ],
    },
    white: "#f2f4f3",
    black: "#0a0908",
    primaryShade: { light: 7, dark: 8 },
    primaryColor: "brown",
    components: {
        Badge: Badge.extend({
            defaultProps: {
                tt: "none",
            },
        }),
    },
});

const theme = mergeMantineTheme(DEFAULT_THEME, themeOverride);

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
            <MantineProvider theme={theme}>
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
            </MantineProvider>
        </QueryClientProvider>
    );
}
