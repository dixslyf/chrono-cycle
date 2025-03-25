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

async function dbNodePg(connectionString: string): Promise<NodePgDatabase> {
    const { drizzle } = await import("drizzle-orm/node-postgres");
    const { Pool } = await import("pg");

    return drizzle(
        new Pool({
            connectionString,
        }),
    );
}

async function dbPglite(): Promise<PgliteDatabase> {
    const { PGlite } = await import("@electric-sql/pglite");
    const { drizzle } = await import("drizzle-orm/pglite");
    const { DB_PATH } = await import("@root/drizzle/config.dev");

    const client = new PGlite(DB_PATH);
    const db = drizzle({ client });

    return db;
}

async function devDb(): Promise<NodePgDatabase | PgliteDatabase> {
    if (process.env.DEV_DATABASE_URL) {
        console.log("Using NodePg development database");
        return dbNodePg(process.env.DEV_DATABASE_URL);
    }

    // Fall back to PGlite database.
    console.log("Using PGLite development database");
    return dbPglite();
}

async function prodDb(): Promise<NodePgDatabase> {
    console.log("Using production database");

    if (!process.env.DATABASE_URL) {
        throw new Error(
            "Failed to determine database URL in production environment!",
        );
    }

    return dbNodePg(process.env.DATABASE_URL);
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
export async function getDb(): Promise<NodePgDatabase | PgliteDatabase> {
    if (!db) {
        db = await initDb();
        return db;
    }
    return db;
}
