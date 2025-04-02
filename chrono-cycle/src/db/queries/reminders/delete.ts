import { eq, or } from "drizzle-orm";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";

import { AssertionError, DoesNotExistError } from "@/common/errors";

import { DbLike } from "@/db";
import { checkUserOwnsReminders } from "@/db/queries/reminders/checkOwnership";
import { reminders, reminders as remindersTable } from "@/db/schema";

export function rawDeleteReminders(
    db: DbLike,
    ids: Set<number>,
): TE.TaskEither<DoesNotExistError, void> {
    if (ids.size === 0) {
        return TE.of(undefined);
    }

    return pipe(
        TE.fromTask(() =>
            db
                .delete(reminders)
                .where(
                    or(
                        ...Array.from(ids).map((id) =>
                            eq(remindersTable.id, id),
                        ),
                    ),
                )
                .returning(),
        ),
        TE.chain((deleted) => {
            if (deleted.length !== ids.size) {
                return TE.left(DoesNotExistError());
            }

            return TE.right(undefined);
        }),
    );
}

export function deleteReminders(
    db: DbLike,
    userId: number,
    ids: Set<number>,
): TE.TaskEither<DoesNotExistError | AssertionError, void> {
    if (ids.size === 0) {
        return TE.right(undefined);
    }

    return pipe(
        checkUserOwnsReminders(db, userId, ids),
        TE.chainW(() => rawDeleteReminders(db, ids)),
        TE.mapError((err) =>
            err._errorKind === "DoesNotExistError"
                ? AssertionError("Unexpected number of deleted reminders")
                : err,
        ),
    );
}
