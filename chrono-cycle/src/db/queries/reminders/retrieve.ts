import { eq, or } from "drizzle-orm";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";

import { AssertionError, DoesNotExistError } from "@/common/errors";

import { DbLike } from "@/db";
import { DbReminder, reminders as remindersTable } from "@/db/schema";

export function retrieveReminders(
    db: DbLike,
    reminderIds: number[],
): TE.TaskEither<DoesNotExistError | AssertionError, DbReminder[]> {
    if (reminderIds.length === 0) {
        return TE.right([]);
    }

    return pipe(
        TE.fromTask(() =>
            db
                .select()
                .from(remindersTable)
                .where(
                    or(
                        ...reminderIds.map((reminderId) =>
                            eq(remindersTable.id, reminderId),
                        ),
                    ),
                ),
        ),
        TE.chain((selected) => {
            if (selected.length < reminderIds.length) {
                return TE.left(
                    DoesNotExistError() as DoesNotExistError | AssertionError,
                );
            }

            if (selected.length > reminderIds.length) {
                return TE.left(
                    AssertionError("Unexpected too many matching reminders"),
                );
            }

            return TE.right(selected);
        }),
    );
}
