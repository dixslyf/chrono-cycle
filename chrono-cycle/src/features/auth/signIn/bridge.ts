import { pipe } from "fp-ts/lib/function";
import * as T from "fp-ts/Task";
import * as TE from "fp-ts/TaskEither";
import { match } from "ts-pattern";

import { Session, toSession } from "@common/data/userSession";
import {
    AssertionError,
    InvalidCredentialsError,
    RestoreAssertionError,
} from "@common/errors";

import { verifyPassword } from "@lib/auth/passwords";
import {
    generateSessionToken,
    sessionIdFromToken,
    setSessionTokenCookie,
} from "@lib/auth/sessions";

import getDb, { DbLike } from "@db";
import { createSession } from "@db/queries/auth/createSession";
import { retrieveUserByUsername } from "@db/queries/auth/retrieveUser";
import { DbUser } from "@db/schema";

import { Failure, ParsedPayload } from "./data";

function retrieveUserByUsernameBridge(
    db: DbLike,
    username: string,
): TE.TaskEither<InvalidCredentialsError | AssertionError, DbUser> {
    return pipe(
        retrieveUserByUsername(db, username),
        TE.mapError((err) =>
            match(err)
                .with({ _errorKind: "DoesNotExistError" }, () =>
                    InvalidCredentialsError(),
                )
                .otherwise((err) => err),
        ),
    );
}

function verifyPasswordBridge(
    db: DbLike,
    dbUser: DbUser,
    password: string,
): TE.TaskEither<InvalidCredentialsError, void> {
    return pipe(
        TE.fromTask(() => verifyPassword(dbUser.hashedPassword, password)),
        TE.chain((isCorrect) =>
            isCorrect
                ? TE.right(undefined)
                : TE.left(InvalidCredentialsError()),
        ),
    );
}

function createSessionBridge(
    db: DbLike,
    token: string,
    userId: number,
): T.Task<Session> {
    return pipe(
        T.of(sessionIdFromToken(token)),
        T.flatMap(
            (sessionId) => () =>
                createSession(db, {
                    id: sessionId,
                    userId,
                    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
                }),
        ),
        T.map((dbSession) => toSession(dbSession)),
    );
}

export function bridge(
    payloadP: ParsedPayload,
): TE.TaskEither<RestoreAssertionError<Failure>, void> {
    return pipe(
        T.Do,
        // Get the database.
        T.bind("db", () => getDb),
        TE.fromTask,
        // Check if the user exists.
        TE.bind("dbUser", ({ db }) =>
            retrieveUserByUsernameBridge(db, payloadP.username),
        ),
        // Verify password.
        TE.tap(({ db, dbUser }) =>
            verifyPasswordBridge(db, dbUser, payloadP.password),
        ),
        // Create session token and session.
        TE.bind("sessionToken", () => TE.right(generateSessionToken())),
        TE.bind("session", ({ db, dbUser, sessionToken }) =>
            TE.fromTask(createSessionBridge(db, sessionToken, dbUser.id)),
        ),
        // Set cookie if "remember me".
        TE.flatMapTask(
            ({ sessionToken, session }) =>
                () =>
                    setSessionTokenCookie(
                        sessionToken,
                        // If "remember me", create a cookie that lasts until the session expiry.
                        // Otherwise, set no expiry (meaning the cookie will expire at the end of the browser session).
                        payloadP.remember ? session.expiresAt : undefined,
                    ),
        ),
        TE.map(() => undefined), // Ignore return values.
    );
}
