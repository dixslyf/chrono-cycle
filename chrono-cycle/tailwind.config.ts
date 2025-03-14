import type { Config } from "tailwindcss";

export default {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                palette1: "#5e503f",
                palette2: "#a9927d",
                palette3: "#f2f4f3",
                palette4: "#22333b",
                palette5: "#0a0908",
            },
        },
    },
    plugins: [],
} satisfies Config;
