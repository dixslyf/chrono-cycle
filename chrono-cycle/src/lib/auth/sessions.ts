import { sha256 } from "@oslojs/crypto/sha2";
import {
    encodeBase32LowerCaseNoPadding,
    encodeHexLowerCase,
} from "@oslojs/encoding";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import * as TO from "fp-ts/TaskOption";
import { cookies } from "next/headers";

import { toUserSession, UserSession } from "@/common/data/userSession";
import { AssertionError, DoesNotExistError } from "@/common/errors";

import { getDb } from "@/db";
import { deleteSession } from "@/db/queries/auth/deleteSession";
import { retrieveUserSession } from "@/db/queries/auth/retrieveUserSession";

export function sessionIdFromToken(token: string): string {
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

export function validateSessionToken(
    token: string,
): TO.TaskOption<UserSession> {
    const sessionId = sessionIdFromToken(token);
    return pipe(
        TE.fromTask(getDb),
        TE.chain((db) => retrieveUserSession(db, sessionId)),
        TO.fromTaskEither,
        TO.chain((dbUserSession) => {
            // Session expired.
            if (Date.now() >= dbUserSession.session.expiresAt.getTime()) {
                invalidateSession(dbUserSession.session.id);
                return TO.none;
            }

            // Successful validation.
            return TO.some(toUserSession(dbUserSession));
        }),
    );
}

export async function invalidateSession(
    sessionId: string,
): Promise<E.Either<DoesNotExistError | AssertionError, void>> {
    const db = await getDb();
    const task = pipe(
        deleteSession(db, sessionId),
        TE.map(() => undefined),
    );
    return await task();
}

export async function setSessionTokenCookie(
    token: string,
    expiresAt: Date | undefined,
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

export function getSessionTokenFromCookie(): TO.TaskOption<string> {
    return pipe(
        TO.fromTask(() => cookies()),
        TO.chain((cookieStore) =>
            TO.fromNullable(cookieStore.get("session")?.value),
        ),
    );
}

export async function getCurrentUserSession(): Promise<O.Option<UserSession>> {
    const task = pipe(
        getSessionTokenFromCookie(),
        TO.chain((token) => validateSessionToken(token)),
    );

    return await task();
}
