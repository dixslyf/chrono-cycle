import { dirname } from "path";
import { fileURLToPath } from "url";

import { FlatCompat } from "@eslint/eslintrc";
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
