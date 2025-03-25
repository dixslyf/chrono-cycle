import { config as dotenvConfig } from "dotenv";
import { defineConfig } from "drizzle-kit";

import { MIGRATIONS_BASE_PATH, SCHEMA_PATH } from "@root/drizzle/shared";

dotenvConfig({ path: [".env.local", ".env"] });

export default defineConfig({
    dialect: "postgresql",
    schema: SCHEMA_PATH,
    out: `${MIGRATIONS_BASE_PATH}/dev-standard`,
    dbCredentials: {
        url: process.env.DEV_DATABASE_URL!,
    },
});
