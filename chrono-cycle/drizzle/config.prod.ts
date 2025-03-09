import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { MIGRATIONS_BASE_PATH, SCHEMA_PATH } from "@root/drizzle/shared";

export default defineConfig({
    dialect: "postgresql",
    schema: SCHEMA_PATH,
    out: `${MIGRATIONS_BASE_PATH}/prod`,
    dbCredentials: {
        url: process.env.DB_URL!,
    },
});
