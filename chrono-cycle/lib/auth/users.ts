import type { User } from "@/lib/db/schema/users";
import db from "@/lib/db";
import { users } from "@/lib/db/schema";
import { hashPassword } from "@/lib/auth/passwords";

import { eq } from "drizzle-orm";

export async function createUser(
    username: string,
    email: string,
    password: string,
): Promise<User> {
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

export function checkUsername(username: string): boolean {
    return (
        username.length >= 3 &&
        username.length <= 255 &&
        username.trim() == username
    );
}

export async function getUserFromUsername(
    username: string,
): Promise<User | null> {
    const result = await db
        .select()
        .from(users)
        .where(eq(users.username, username));

    if (result.length < 1) {
        return null;
    }

    return result[0];
}

export async function getUserFromEmail(email: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.email, email));

    if (result.length < 1) {
        return null;
    }

    return result[0];
}
