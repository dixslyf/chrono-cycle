import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";

import { BaseError } from "@/common/errors";

import { DbLike, DbTransaction } from "@/db";

export function wrapWithTransaction<E extends BaseError, R>(
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
            // Ensure only things that extend `BaseError` get returned.
            if (
                typeof err === "object" &&
                err !== null &&
                "_errorKind" in err
            ) {
                return err as E;
            }

            // Otherwise, we don't know what the error is, so propagate it.
            throw err;
        },
    );
}
