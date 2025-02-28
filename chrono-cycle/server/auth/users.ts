import type { DbUser } from "@/server/db/schema/users";
import getDb from "@/server/db";
import { users } from "@/server/db/schema";
import { hashPassword } from "@/server/auth/passwords";

import { eq } from "drizzle-orm";

export async function createUser(
    username: string,
    email: string,
    password: string,
): Promise<DbUser> {
    const db = await getDb();

    const hashedPassword = await hashPassword(password);
    const result = await db
        .insert(users)
        .values({ username, email, hashedPassword })
        .returning();

    if (result.length < 1) {
        throw new Error("Failed to create user");
    }

    return result[0];
}

export async function getUserFromUsername(
    username: string,
): Promise<DbUser | null> {
    const db = await getDb();

    const result = await db
        .select()
        .from(users)
        .where(eq(users.username, username));

    if (result.length < 1) {
        return null;
    }

    return result[0];
}

export async function getUserFromEmail(email: string): Promise<DbUser | null> {
    const db = await getDb();

    const result = await db.select().from(users).where(eq(users.email, email));
    if (result.length < 1) {
        return null;
    }

    return result[0];
}
