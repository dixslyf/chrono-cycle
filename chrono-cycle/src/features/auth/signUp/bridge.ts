import { pipe } from "fp-ts/lib/function";
import * as T from "fp-ts/Task";
import * as TE from "fp-ts/TaskEither";

import getDb, { DbLike } from "@root/src/db";

import { AssertionError, DuplicateNameError } from "@common/errors";

import { hashPassword } from "@lib/auth/passwords";

import {
    checkDuplicateEmail,
    checkDuplicateUsername,
} from "@db/queries/auth/checkDuplicate";
import { createUser } from "@db/queries/auth/createUser";
import { DbExpandedUser } from "@db/schema";

import { ParsedPayload } from "./data";

function createUserBridge(
    db: DbLike,
    payloadP: ParsedPayload,
): T.Task<DbExpandedUser> {
    return pipe(
        T.of(payloadP),
        T.chain((payloadP) => async () => ({
            username: payloadP.username,
            email: payloadP.email,
            hashedPassword: await hashPassword(payloadP.password),
        })),
        T.chain((userDetails) => async () => await createUser(db, userDetails)),
    );
}

export function bridge(
    payloadP: ParsedPayload,
): TE.TaskEither<DuplicateNameError | AssertionError, void> {
    return pipe(
        TE.fromTask(getDb),
        TE.tap((db) => checkDuplicateUsername(db, payloadP.username)),
        TE.tap((db) => checkDuplicateEmail(db, payloadP.email)),
        TE.chain((db) => TE.fromTask(createUserBridge(db, payloadP))),
        TE.map(() => undefined),
    );
}
