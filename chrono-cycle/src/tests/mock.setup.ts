import { createRequire } from "node:module";

import { PGlite } from "@electric-sql/pglite";
import { encodeBase32LowerCaseNoPadding } from "@oslojs/encoding";
import { drizzle } from "drizzle-orm/pglite";
import { reset } from "drizzle-seed";
import * as O from "fp-ts/Option";
import { afterEach, beforeAll, beforeEach, vi, type Mock } from "vitest";

import { hashPassword } from "@/lib/auth/passwords";
import * as authSessionsMod from "@/lib/auth/sessions";
import { sessionIdFromToken } from "@/lib/auth/sessions";

import * as dbMod from "@/db";
import { getDb } from "@/db";
import * as schema from "@/db/schema";
import { sessions, users, userSettings } from "@/db/schema";

// Mock `getDb()`.
vi.mock(import("@/db"), async (importOriginal) => {
    const dbMod = await importOriginal();
    return {
        ...dbMod,
        getDb: vi.fn(),
    };
});

// Mock the auth functions.
vi.mock(import("@/lib/auth/sessions"), async (importOriginal) => {
    const authSessionsMod = await importOriginal();
    return {
        ...authSessionsMod,
        getCurrentUserSession: vi.fn(),
        setSessionTokenCookie: vi.fn(),
    };
});

// Mock next.js functions.
vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
}));

vi.mock("next/navigation", () => ({
    redirect: vi.fn(),
}));

// Mock reminder lib functions.
vi.mock(import("@/lib/reminders"), async (importOriginal) => {
    const libRemindersMod = await importOriginal();
    return {
        ...libRemindersMod,
        cancelReminder: vi.fn(),
        scheduleReminder: vi.fn(),
    };
});

// Mock trigger.dev functions.
vi.mock(import("@trigger.dev/sdk/v3"), async (importOriginal) => {
    const sdkMod = await importOriginal();
    return {
        ...sdkMod,
        runs: {
            replay: vi.fn(),
            cancel: vi.fn(),
            retrieve: vi.fn(),
            list: vi.fn(),
            reschedule: vi.fn(),
            poll: vi.fn(),
            subscribeToRun: vi.fn(),
            subscribeToRunsWithTag: vi.fn(),
            subscribeToBatch: vi.fn(),
            fetchStream: vi.fn(),
        },
        tasks: {
            trigger: vi.fn(),
            triggerAndPoll: vi.fn(),
            batchTrigger: vi.fn(),
            triggerAndWait: vi.fn(),
            batchTriggerAndWait: vi.fn(),
        },
    };
});

beforeAll(async () => {
    // Mock database.
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

beforeEach(async () => {
    const testDb = await getDb();

    // Mock user session.
    const token = encodeBase32LowerCaseNoPadding(new Uint8Array(20));
    const sessionId = sessionIdFromToken(token);
    (authSessionsMod.getCurrentUserSession as Mock).mockResolvedValue(
        O.some({
            user: {
                id: 1,
                username: "asdf",
                email: "asdf@email.com",
                createdAt: new Date("2025-01-01"),
            },
            session: {
                id: sessionId,
                expiresAt: new Date("2025-03-01"),
            },
        }),
    );

    // Insert fake user.
    await testDb.insert(users).values({
        id: 1,
        username: "asdf",
        email: "asdf@email.com",
        hashedPassword: await hashPassword("asdfASDF1234"),
        createdAt: new Date("2025-01-01"),
    });

    // Insert fake session.
    await testDb.insert(sessions).values({
        id: sessionId,
        userId: 1,
        expiresAt: new Date("2025-03-01"),
    });

    // Insert fake user setting.
    await testDb.insert(userSettings).values({
        userId: 1,
        startDayOfWeek: "Monday",
        dateFormat: "DD/MM/YYYY",
        enableDesktopNotifications: false,
        enableEmailNotifications: false,
    });
});

afterEach(async () => {
    // Reset the database.
    const testDb = await getDb();
    await reset(testDb, schema);

    vi.clearAllMocks();
});
