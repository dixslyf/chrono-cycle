import "dotenv/config";
import { sql } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { PgliteDatabase } from "drizzle-orm/pglite";

async function dev_db(): Promise<PgliteDatabase> {
    console.log("Using development database");

    // Use file-based postgres database using pglite.
    const { PGlite } = await import("@electric-sql/pglite");
    const { drizzle } = await import("drizzle-orm/pglite");
    const { DB_PATH } = await import("@/drizzle/config.dev");

    const client = new PGlite(DB_PATH);
    const db = drizzle({ client });

    return db;
}

async function prod_db(): Promise<NodePgDatabase> {
    console.log("Using production database");

    if (!process.env.DB_URL) {
        throw new Error(
            "Failed to determine database URL in production environment!",
        );
    }

    // Use real database.
    const { drizzle } = await import("drizzle-orm/node-postgres");
    const { Pool } = await import("pg");

    const db = drizzle(
        new Pool({
            connectionString: process.env.DB_URL,
        }),
    );

    // Dummy statement to test the connection and send an exception early if fail.
    try {
        await db.execute(sql`SELECT 1`);
    } catch {
        throw new Error(
            "Failed to determine database URL in production environment!",
        );
    }

    return db;
}

async function init_db(): Promise<NodePgDatabase | PgliteDatabase> {
    let deploy_env = process.env.DEPLOY_ENV;
    if (!deploy_env || !["dev", "prod"].includes(deploy_env)) {
        console.warn(
            "Failed to determine deployment environment — assuming `dev`",
        );
        deploy_env = "dev";
    }

    if (deploy_env === "dev") {
        return await dev_db();
    }

    console.assert(
        deploy_env === "prod",
        `Assertion failed: Unknown deployment environment "${deploy_env}"`,
    );

    return await prod_db();
}

export default await init_db();
