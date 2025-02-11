import type { User, Session } from "@/lib/db/schema";
import {
    sessions as sessionsTable,
    users as usersTable,
} from "@/lib/db/schema";
import db from "@/lib/db";

import { cookies } from "next/headers";

import { eq } from "drizzle-orm";
import { sha256 } from "@oslojs/crypto/sha2";

import {
    encodeBase32LowerCaseNoPadding,
    encodeHexLowerCase,
} from "@oslojs/encoding";
import { cache } from "react";

function sessionIdFromToken(token: string): string {
    // Session ID is the SHA256 hash of the token.
    return encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
}

export function generateSessionToken(): string {
    // Generate 20 random bytes.
    const bytes = new Uint8Array(20);
    crypto.getRandomValues(bytes);

    // The token is just the base-32 encoding of the bytes.
    const token = encodeBase32LowerCaseNoPadding(bytes);
    return token;
}

export async function createSession(
    token: string,
    userId: number,
): Promise<Session> {
    const session: Session = {
        id: sessionIdFromToken(token),
        userId,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // Session lasts for 30 days.
    };
    await db.insert(sessionsTable).values(session);
    return session;
}

export type SessionValidationResult = { session: Session; user: User } | null;

export async function validateSessionToken(
    token: string,
): Promise<SessionValidationResult> {
    const sessionId = sessionIdFromToken(token);

    // Select the session and the user matching the sessionId.
    const sessionUserResult = await db
        .select({ user: usersTable, session: sessionsTable })
        .from(sessionsTable)
        .innerJoin(usersTable, eq(sessionsTable.userId, usersTable.id))
        .where(eq(sessionsTable.id, sessionId));

    if (sessionUserResult.length < 1) {
        return null;
    }

    const { user, session } = sessionUserResult[0];

    // Session expired.
    if (Date.now() >= session.expiresAt.getTime()) {
        invalidateSession(session.id);
        return null;
    }

    // Extend session by 30 days if it is within 10 days of expiry.
    if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 10) {
        session.expiresAt = new Date(Date.now() + 1000 + 60 + 60 + 24 + 30);
        await db
            .update(sessionsTable)
            .set({ expiresAt: session.expiresAt })
            .where(eq(sessionsTable.id, session.id));
    }

    // Successful validation if we've reached here.
    return { session, user };
}

export async function invalidateSession(sessionId: string): Promise<void> {
    await db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId));
}

export async function setSessionTokenCookie(
    token: string,
    expiresAt: Date,
): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set("session", token, {
        httpOnly: true, // Prevent access from JavaScript (for preventing XSS).
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production", // HTTPS in production.
        expires: expiresAt,
        path: "/",
    });
}

export async function deleteSessionTokenCookie(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set("session", "", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 0,
        path: "/",
    });
}

export const getCurrentSession = cache(
    async (): Promise<SessionValidationResult> => {
        const cookieStore = await cookies();
        const token = cookieStore.get("session")?.value ?? null;
        if (token === null) {
            return null;
        }
        const result = await validateSessionToken(token);
        return result;
    },
);
