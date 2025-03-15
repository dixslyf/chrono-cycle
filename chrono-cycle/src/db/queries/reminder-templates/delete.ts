import { eq, or } from "drizzle-orm";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";

import { AssertionError, DoesNotExistError } from "@/common/errors";

import { DbLike } from "@/db";
import { checkUserOwnsReminderTemplates } from "@/db/queries/reminder-templates/checkOwnership";
import {
    reminderTemplates,
    reminderTemplates as reminderTemplatesTable,
} from "@/db/schema";

export function rawDeleteReminderTemplates(
    db: DbLike,
    ids: Set<number>,
): TE.TaskEither<DoesNotExistError, void> {
    return pipe(
        TE.fromTask(() =>
            db
                .delete(reminderTemplates)
                .where(
                    or(
                        ...Array.from(ids).map((id) =>
                            eq(reminderTemplatesTable.id, id),
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

export function deleteReminderTemplates(
    db: DbLike,
    userId: number,
    ids: Set<number>,
): TE.TaskEither<DoesNotExistError | AssertionError, void> {
    if (ids.size === 0) {
        return TE.right(undefined);
    }

    return pipe(
        checkUserOwnsReminderTemplates(db, userId, ids),
        TE.chainW(() => rawDeleteReminderTemplates(db, ids)),
        TE.mapError((err) =>
            err._errorKind === "DoesNotExistError"
                ? AssertionError(
                      "Unexpected number of deleted reminder templates",
                  )
                : err,
        ),
    );
}
