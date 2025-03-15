import { eq } from "drizzle-orm";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";

import { DoesNotExistError } from "@/common/errors";

import { DbLike } from "@/db";
import {
    DbReminder,
    DbReminderUpdate,
    reminders as remindersTable,
} from "@/db/schema";

export function updateReminder(
    db: DbLike,
    data: DbReminderUpdate,
): TE.TaskEither<DoesNotExistError, DbReminder> {
    const task = pipe(
        TE.fromTask(() =>
            db
                .update(remindersTable)
                .set(data)
                .where(eq(remindersTable.id, data.id))
                .returning(),
        ),
        TE.chain((updated) =>
            updated.length === 0
                ? TE.left(DoesNotExistError())
                : TE.right(updated[0]),
        ),
    );

    return task;
}
