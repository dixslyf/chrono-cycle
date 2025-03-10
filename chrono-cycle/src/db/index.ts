import "dotenv/config";

import { ExtractTablesWithRelations, sql } from "drizzle-orm";
import {
    type NodePgDatabase,
    type NodePgQueryResultHKT,
} from "drizzle-orm/node-postgres";
import { type PgTransaction } from "drizzle-orm/pg-core";
import {
    type PgliteDatabase,
    type PgliteQueryResultHKT,
} from "drizzle-orm/pglite";

export type Db = NodePgDatabase | PgliteDatabase;
export type DbTransaction =
    | PgTransaction<
          NodePgQueryResultHKT,
          Record<string, never>,
          ExtractTablesWithRelations<Record<string, never>>
      >
    | PgTransaction<
          PgliteQueryResultHKT,
          Record<string, never>,
          ExtractTablesWithRelations<Record<string, never>>
      >;
export type DbLike = Db | DbTransaction;

async function devDb(): Promise<PgliteDatabase> {
    console.log("Using development database");

    // Use file-based postgres database using pglite.
    const { PGlite } = await import("@electric-sql/pglite");
    const { drizzle } = await import("drizzle-orm/pglite");
    const { DB_PATH } = await import("@root/drizzle/config.dev");

    const client = new PGlite(DB_PATH);
    const db = drizzle({ client });

    return db;
}

async function prodDb(): Promise<NodePgDatabase> {
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

async function initDb(): Promise<NodePgDatabase | PgliteDatabase> {
    let node_env = process.env.NODE_ENV;
    if (!node_env || !["development", "production"].includes(node_env)) {
        console.warn(
            "Failed to determine deployment environment — assuming `dev`",
        );
        node_env = "development";
    }

    if (node_env === "development") {
        return await devDb();
    }

    console.assert(
        node_env === "production",
        `Assertion failed: Unknown deployment environment "${node_env}"`,
    );

    return await prodDb();
}

let db: Db | null = null;
async function getDb(): Promise<NodePgDatabase | PgliteDatabase> {
    if (!db) {
        db = await initDb();
        return db;
    }
    return db;
}

export default getDb;
