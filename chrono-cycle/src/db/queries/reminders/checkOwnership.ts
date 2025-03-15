import { and, eq, or } from "drizzle-orm";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";

import { AssertionError, DoesNotExistError } from "@/common/errors";

import { DbLike } from "@/db/index";
import {
    events as eventsTable,
    projects as projectsTable,
    reminders as remindersTable,
} from "@/db/schema";

// Checks that the user owns the reminders.
export function checkUserOwnsReminders(
    db: DbLike,
    userId: number,
    reminderIds: Set<number>,
): TE.TaskEither<DoesNotExistError | AssertionError, void> {
    const conditions = Array.from(reminderIds).map((reminderId) =>
        and(
            eq(projectsTable.userId, userId),
            eq(remindersTable.id, reminderId),
        ),
    );

    return pipe(
        TE.fromTask(() =>
            db
                .select()
                .from(projectsTable)
                .innerJoin(
                    eventsTable,
                    eq(projectsTable.id, eventsTable.projectId),
                )
                .innerJoin(
                    remindersTable,
                    eq(eventsTable.id, remindersTable.eventId),
                )
                .where(or(...conditions)),
        ),
        TE.chain((rows) => {
            if (rows.length < reminderIds.size) {
                return TE.left(
                    DoesNotExistError() as DoesNotExistError | AssertionError,
                );
            }

            if (rows.length > reminderIds.size) {
                return TE.left(
                    AssertionError("Unexpected multiple matching reminders"),
                );
            }

            return TE.right(undefined);
        }),
    );
}
