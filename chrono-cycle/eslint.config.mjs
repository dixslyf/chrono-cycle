import { dirname } from "path";
import { fileURLToPath } from "url";

import { FlatCompat } from "@eslint/eslintrc";
import boundaries from "eslint-plugin-boundaries";
import importPlugin from "eslint-plugin-import";
import noRelativeImportPaths from "eslint-plugin-no-relative-import-paths";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

import { MIGRATIONS_BASE_PATH } from "./drizzle/shared.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const eslintConfig = [
    ...compat.extends("next/core-web-vitals", "next/typescript"),
    eslintPluginPrettierRecommended,
    {
        rules: {
            ...importPlugin.flatConfigs.recommended.rules,
            "import/no-useless-path-segments": "error",
            "import/no-self-import": "error",
        },
        settings: {
            "import/parsers": {
                "@typescript-eslint/parser": [".ts", ".tsx"],
            },
            "import/resolver": {
                typescript: {},
            },
        },
    },
    {
        plugins: {
            "no-relative-import-paths": noRelativeImportPaths,
        },
        rules: {
            "no-relative-import-paths/no-relative-import-paths": [
                "error",
                {
                    allowSameFolder: true,
                    rootDir: "src",
                    prefix: "@",
                },
            ],
        },
    },
    {
        plugins: {
            boundaries,
        },
        rules: {
            ...boundaries.configs.recommended.rules,
            "boundaries/element-types": [
                2,
                {
                    default: "disallow",
                    rules: [
                        {
                            from: ["common"],
                            allow: ["common"],
                        },
                        {
                            from: [["common", { base: "mappers" }]],
                            allow: [
                                ["db", { category: "schema" }],
                                ["lib", { base: "identifiers" }],
                            ],
                        },
                        {
                            from: ["ui"],
                            allow: ["ui", "features", "common"],
                        },
                        {
                            from: [["ui", { base: "redirectWrapper" }]],
                            allow: [["lib", { dir: "auth" }]],
                        },
                        {
                            from: ["features"],
                            allow: ["common"],
                        },
                        {
                            from: [["features", { base: "action" }]],
                            allow: [
                                ["features", { dir: "utils" }],
                                [
                                    "features",
                                    { dir: "${from.dir}", base: "data" },
                                ],
                                [
                                    "features",
                                    { dir: "${from.dir}", base: "bridge" },
                                ],
                            ],
                        },
                        {
                            from: [["features", { base: "bridge" }]],
                            allow: [
                                [
                                    "features",
                                    { dir: "${from.dir}", base: "data" },
                                ],
                                "db",
                                "lib",
                            ],
                        },
                        {
                            from: [["features", { base: "data" }]],
                            allow: [
                                ["features", { base: "data" }],
                                ["db", { category: "schema" }],
                                "lib",
                            ],
                        },
                        {
                            from: [["features", { dir: "utils" }]],
                            allow: [["features", { dir: "utils" }], "lib"],
                        },
                        {
                            from: ["lib"],
                            allow: ["lib", "common", "db"],
                        },
                        {
                            from: ["db"],
                            allow: ["db", ["common", { base: "errors" }]],
                        },
                    ],
                },
            ],
        },
        settings: {
            "boundaries/elements": [
                {
                    type: "ui",
                    mode: "full",
                    pattern: "src/app/**/*.*",
                    capture: ["dir", "base", "extension"],
                },
                {
                    type: "middleware",
                    mode: "full",
                    pattern: "src/middleware.ts",
                },
                {
                    type: "common",
                    mode: "full",
                    pattern: "src/common/**/*.*",
                    capture: ["dir", "base", "extension"],
                },
                {
                    type: "features",
                    mode: "full",
                    pattern: "src/features/**/*.*",
                    capture: ["dir", "base", "extension"],
                },
                {
                    type: "lib",
                    mode: "full",
                    pattern: "src/lib/**/*.*",
                    capture: ["dir", "base", "extension"],
                },
                {
                    type: "db",
                    mode: "full",
                    pattern: "src/db/*/**/*.*",
                    capture: ["category", "dir", "base", "extension"],
                },
                {
                    type: "tests",
                    mode: "full",
                    pattern: "src/tests/**/*.*",
                    capture: ["dir", "base", "extension"],
                },
            ],
        },
    },
    {
        ignores: [`${MIGRATIONS_BASE_PATH}/*`],
        rules: {
            // Ignore unused variables, arguments or caught errors that start with `_`.
            // Also, lower the rule to "warn" instead of "error".
            "@typescript-eslint/no-unused-vars": [
                "warn",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                    caughtErrorsIgnorePattern: "^_",
                },
            ],
        },
    },
];

export default eslintConfig;
