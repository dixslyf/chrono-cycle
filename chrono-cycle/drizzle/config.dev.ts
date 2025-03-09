import { defineConfig } from "drizzle-kit";
import { MIGRATIONS_BASE_PATH, SCHEMA_PATH } from "@root/drizzle/shared";

export const DB_PATH = "dev-db";

export default defineConfig({
    dialect: "postgresql",
    driver: "pglite",
    schema: SCHEMA_PATH,
    out: `${MIGRATIONS_BASE_PATH}/dev`,
    dbCredentials: {
        url: DB_PATH,
    },
});
