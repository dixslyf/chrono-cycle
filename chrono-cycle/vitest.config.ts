import path from "path";

import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
        setupFiles: [
            "./src/tests/fpTsMatchers.setup.ts",
            "./src/tests/mock.setup.ts",
        ],
        hookTimeout: 30000, // Default is 10 seconds, which can be too strict for some of the tests.
    },
});
