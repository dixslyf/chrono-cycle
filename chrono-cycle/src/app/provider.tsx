"use client";

import {
    Badge,
    createTheme,
    DEFAULT_THEME,
    Fieldset,
    MantineProvider,
    mergeMantineTheme,
    SegmentedControl,
    Textarea,
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
        green: [
            "#eafaef",
            "#deeee3",
            "#c1d8c8",
            "#a1c2ac",
            "#85af93",
            "#74a383",
            "#699e7b",
            "#588968",
            "#4b7b5b",
            "#3b6a4c",
        ],
        yellow: [
            "#fffbe1",
            "#fcf4ce",
            "#f6e8a2",
            "#f1db71",
            "#edd148",
            "#eaca2d",
            "#e9c61c",
            "#cfaf0b",
            "#b89b00",
            "#9e8500",
        ],
        blue: [
            "#e6f6ff",
            "#d5e8fa",
            "#afceec",
            "#85b3de",
            "#629cd3",
            "#4b8ecc",
            "#3d86ca",
            "#2c74b3",
            "#2067a2",
            "#045991",
        ],
        red: [
            "#ffedee",
            "#f7dadc",
            "#e7b4b7",
            "#d88b90",
            "#cb696f",
            "#c45359",
            "#c1474e",
            "#ab383f",
            "#993037",
            "#87252e",
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
        Textarea: Textarea.extend({
            defaultProps: {
                autosize: true,
                minRows: 4,
                maxRows: 4,
            },
        }),
        Fieldset: Fieldset.extend({
            defaultProps: {
                styles: {
                    legend: {
                        paddingLeft: 4,
                        paddingRight: 4,
                    },
                },
            },
        }),
        SegmentedControl: SegmentedControl.extend({
            defaultProps: {
                color: "brown",
                bg: "gray.3",
            },
        }),
    },
});

export const theme = mergeMantineTheme(DEFAULT_THEME, themeOverride);

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
