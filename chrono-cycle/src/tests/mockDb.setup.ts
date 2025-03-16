import { createRequire } from "node:module";

import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { afterEach, beforeEach, vi, type Mock } from "vitest";

import * as dbMod from "@/db";
import * as schema from "@/db/schema";

// Mock `getDb()`.
vi.mock(import("@/db"), async (importOriginal) => {
    const dbMod = await importOriginal();
    return {
        ...dbMod,
        getDb: vi.fn(),
    };
});

beforeEach(async () => {
    const client = new PGlite();
    const testDb = drizzle(client);

    const require = createRequire(import.meta.url);
    const { pushSchema } =
        require("drizzle-kit/api") as typeof import("drizzle-kit/api");

    // Push schema migrations.
    const { apply } = await pushSchema(schema, testDb);
    await apply();

    (dbMod.getDb as Mock).mockResolvedValue(testDb);
});

afterEach(() => {
    vi.clearAllMocks();
});
