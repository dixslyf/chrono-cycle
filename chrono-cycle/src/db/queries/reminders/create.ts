import { pipe } from "fp-ts/function";
import { type NonEmptyArray } from "fp-ts/NonEmptyArray";
import * as TE from "fp-ts/TaskEither";

import { AssertionError, DoesNotExistError } from "@/common/errors";

import { DbLike } from "@/db";
import { checkUserOwnsEvents } from "@/db/queries/events/checkOwnership";
import {
    DbReminder,
    DbReminderInsert,
    reminders as remindersTable,
} from "@/db/schema";

export async function rawInsertReminders(
    db: DbLike,
    reminders: DbReminderInsert[],
): Promise<DbReminder[]> {
    if (reminders.length === 0) {
        return [];
    }
    return await db.insert(remindersTable).values(reminders).returning();
}

export function createReminders(
    db: DbLike,
    userId: number,
    reminders: DbReminderInsert[],
): TE.TaskEither<DoesNotExistError | AssertionError, DbReminder[]> {
    if (reminders.length === 0) {
        return TE.right([]);
    }

    // Safety: Guaranteed to have at least one value since we did the check above.
    reminders = reminders as NonEmptyArray<DbReminderInsert>;
    return pipe(
        // Check if the user owns the events.
        checkUserOwnsEvents(
            db,
            userId,
            new Set(reminders.map((reminder) => reminder.eventId)),
        ),

        // Insert the reminders.
        TE.chain(() => TE.fromTask(() => rawInsertReminders(db, reminders))),
    );
}
