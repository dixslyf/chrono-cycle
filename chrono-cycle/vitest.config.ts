import path from "path";

import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
        setupFiles: ["./src/tests/fpTsMatchers.setup.ts", "./src/tests/mockDb.setup.ts"],
    },
});
