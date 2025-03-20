import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";

import { BaseError, isBaseError } from "@/common/errors";

import { DbLike, DbTransaction } from "@/db";

export function wrapWithTransaction<E extends BaseError | Array<BaseError>, R>(
    db: DbLike,
    taskEitherF: (tx: DbTransaction) => TE.TaskEither<E, R>,
): TE.TaskEither<E, R> {
    return TE.tryCatch(
        () =>
            db.transaction(async (tx) => {
                const insertTask = pipe(
                    taskEitherF(tx),
                    TE.getOrElse((err) => {
                        // Throwing will cause the transaction to rollback.
                        throw err;
                    }),
                );
                return await insertTask();
            }),
        (err) => {
            // Ensure only things that extend or contain `BaseError` get returned.
            if (
                isBaseError(err) ||
                (Array.isArray(err) && err.every(isBaseError))
            ) {
                return err as E;
            }

            // Otherwise, we don't know what the error is, so propagate it.
            throw err;
        },
    );
}
