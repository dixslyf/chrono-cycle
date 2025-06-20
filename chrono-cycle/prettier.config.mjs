const config = {
    plugins: ["@ianvs/prettier-plugin-sort-imports"],
    importOrder: [
        "<BUILTIN_MODULES>",
        "",
        "<THIRD_PARTY_MODULES>",
        "",
        "^@root$",
        "^@root/(.*)$",
        "",
        "^@/app$",
        "^@/app/(.*)$",
        "",
        "^@/common$",
        "^@/common/(.*)$",
        "",
        "^@/features$",
        "^@/features/(.*)$",
        "",
        "^@/lib$",
        "^@/lib/(.*)$",
        "",
        "^@/db$",
        "^@/db/(.*)$",
        "",
        "^[./]",
        "",
        "^(?!.*[.]css$)[./].*$",
        ".css$",
    ],
};

export default config;
