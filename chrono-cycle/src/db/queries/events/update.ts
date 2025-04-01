import { eq } from "drizzle-orm";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";

import {
    AssertionError,
    DoesNotExistError,
    InvalidEventStatusError,
} from "@/common/errors";

import { DbLike } from "@/db";
import { rawInsertReminders } from "@/db/queries/reminders/create";
import { rawDeleteReminders } from "@/db/queries/reminders/delete";
import { updateReminder } from "@/db/queries/reminders/update";
import { wrapWithTransaction } from "@/db/queries/utils/transaction";
import {
    DbEvent,
    DbEventUpdate,
    DbExpandedEvent,
    DbExpandedEventUpdate,
    events as eventsTable,
    eventTags as eventTagsTable,
    tags as tagsTable,
} from "@/db/schema";

import { checkUserOwnsEvents } from "./checkOwnership";

function rawUpdateEvent(
    db: DbLike,
    data: DbEventUpdate,
): TE.TaskEither<
    DoesNotExistError | InvalidEventStatusError | AssertionError,
    DbEvent
> {
    return pipe(
        TE.fromTask(() =>
            db.select().from(eventsTable).where(eq(eventsTable.id, data.id)),
        ),
        TE.chain((selected) => {
            if (selected.length < 1) {
                return TE.left(
                    DoesNotExistError() as
                        | DoesNotExistError
                        | InvalidEventStatusError
                        | AssertionError,
                );
            }

            if (selected.length > 1) {
                return TE.left(
                    AssertionError("Unexpected multiple matching events"),
                );
            }

            const dbEvent = selected[0];

            if (
                (dbEvent.eventType === "task" && data.status === "none") ||
                (dbEvent.eventType === "activity" && data.status !== "none")
            ) {
                return TE.left(InvalidEventStatusError());
            }

            return TE.right(dbEvent);
        }),
        TE.chain(() =>
            TE.fromTask(() =>
                db
                    .update(eventsTable)
                    .set({ ...data, updatedAt: new Date() })
                    .where(eq(eventsTable.id, data.id))
                    .returning(),
            ),
        ),
        TE.chain((updated) =>
            // We already checked for existence earlier.
            updated.length === 0
                ? TE.left(AssertionError("Unexpected missing event"))
                : TE.right(updated[0]),
        ),
    );
}

// Does not wrap database operations in a transaction!
function unsafeUpdateExpandedEvent(
    db: DbLike,
    data: DbExpandedEventUpdate,
): TE.TaskEither<
    DoesNotExistError | InvalidEventStatusError | AssertionError,
    DbExpandedEvent
> {
    return pipe(
        // Try updating the event.
        rawUpdateEvent(db, data),

        // Update existing reminders.
        TE.bindW("updatedRts", () =>
            pipe(
                data.remindersUpdate ?? [],
                TE.traverseArray((rt) => updateReminder(db, rt)),
            ),
        ),

        // Delete removed reminders.
        TE.tap(() =>
            pipe(data.remindersDelete, (toDeleteRts) =>
                // Raw delete since we already know the user owns the reminder s.
                rawDeleteReminders(db, new Set(toDeleteRts)),
            ),
        ),

        // Insert new reminders.
        TE.bindW("insertedRts", ({ id: eventId }) =>
            TE.fromTask(() =>
                rawInsertReminders(
                    db,
                    data.remindersInsert?.map((reminder) => ({
                        eventId,
                        ...reminder,
                    })) ?? [],
                ),
            ),
        ),

        // Retrieve tags.
        TE.bindW("tags", () =>
            TE.fromTask(() =>
                db
                    .select({
                        id: tagsTable.id,
                        userId: tagsTable.userId,
                        name: tagsTable.name,
                    })
                    .from(eventTagsTable)
                    .innerJoin(
                        tagsTable,
                        eq(eventTagsTable.tagId, tagsTable.id),
                    )
                    .where(eq(eventTagsTable.eventId, data.id)),
            ),
        ),

        TE.map((ctx) => {
            const { updatedRts, insertedRts, ...rest } = ctx;
            return {
                reminders: updatedRts.concat(insertedRts),
                ...rest,
            } satisfies DbExpandedEvent;
        }),
    );
}

export function updateEvent(
    db: DbLike,
    userId: number,
    data: DbExpandedEventUpdate,
): TE.TaskEither<
    DoesNotExistError | InvalidEventStatusError | AssertionError,
    DbExpandedEvent
> {
    return pipe(
        checkUserOwnsEvents(db, userId, new Set([data.id])),
        TE.chainW(() =>
            wrapWithTransaction(db, (tx) =>
                unsafeUpdateExpandedEvent(tx, data),
            ),
        ),
    );
}
