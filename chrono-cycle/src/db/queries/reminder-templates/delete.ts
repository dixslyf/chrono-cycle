import { eq, or } from "drizzle-orm";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";

import { AssertionError, DoesNotExistError } from "@common/errors";

import { DbLike } from "@db";
import { checkUserOwnsReminderTemplates } from "@db/queries/reminder-templates/checkOwnership";
import {
    reminderTemplates,
    reminderTemplates as reminderTemplatesTable,
} from "@db/schema";

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
        TE.chain(() =>
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
        ),
        TE.chain((deleted) =>
            // `checkUserOwnsReminderTemplates()` should have already ensured
            // that we can safely delete.
            deleted.length !== ids.size
                ? TE.left(
                      AssertionError(
                          "Unexpected number of deleted reminder templates",
                      ),
                  )
                : TE.right(undefined),
        ),
    );
}
