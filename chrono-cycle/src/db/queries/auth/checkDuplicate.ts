import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";
import { match } from "ts-pattern";

import { AssertionError, DuplicateNameError } from "@/common/errors";

import { DbLike } from "@/db";

import { retrieveUserByEmail, retrieveUserByUsername } from "./retrieveUser";

export function checkDuplicateUsername(
    db: DbLike,
    username: string,
): TE.TaskEither<DuplicateNameError | AssertionError, void> {
    return pipe(
        retrieveUserByUsername(db, username),
        TE.matchE(
            (err) =>
                match(err)
                    // If the user does not exist, then we know that the username is free.
                    .with(
                        { _errorKind: "DoesNotExistError" },
                        (_) =>
                            TE.right(undefined) as TE.TaskEither<
                                DuplicateNameError | AssertionError,
                                void
                            >,
                    )
                    .otherwise((err) => TE.left(err)),
            () => TE.left(DuplicateNameError()),
        ),
    );
}

export function checkDuplicateEmail(
    db: DbLike,
    email: string,
): TE.TaskEither<DuplicateNameError | AssertionError, void> {
    return pipe(
        retrieveUserByEmail(db, email),
        TE.matchE(
            (err) =>
                match(err)
                    // If the user does not exist, then we know that the email is free.
                    .with(
                        { _errorKind: "DoesNotExistError" },
                        (_) =>
                            TE.right(undefined) as TE.TaskEither<
                                DuplicateNameError | AssertionError,
                                void
                            >,
                    )
                    .otherwise((err) => TE.left(err)),
            () => TE.left(DuplicateNameError()),
        ),
    );
}
