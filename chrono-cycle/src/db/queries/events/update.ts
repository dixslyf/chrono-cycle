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
import { ensureTagsExist } from "@/db/queries/tags/create";
import { wrapWithTransaction } from "@/db/queries/utils/transaction";
import {
    DbEvent,
    DbEventUpdate,
    DbExpandedEvent,
    DbExpandedEventUpdate,
    events as eventsTable,
} from "@/db/schema";

import { checkUserOwnsEvents } from "./checkOwnership";
import { clearTags } from "./clearTags";
import { linkTags } from "./linkTags";
import { retrieveExpandedEvent } from "./retrieveExpanded";

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
        TE.Do,
        TE.bind("oldExpandedEvent", () => retrieveExpandedEvent(db, data.id)),

        // Try updating the event.
        TE.bind("updatedEvent", () => rawUpdateEvent(db, data)),

        // Update tags.
        TE.bindW("newTags", ({ oldExpandedEvent }) => {
            const newDesiredTags = data.tags;
            return newDesiredTags !== undefined
                ? pipe(
                      // Clear the current tags.
                      TE.fromTask(() => clearTags(db, data.id)),
                      // Ensure that all new tags exist.
                      TE.chain(() => ensureTagsExist(db, newDesiredTags)),
                      // Link the tags with the event template.
                      TE.tap((newTags) =>
                          TE.fromTask(() => linkTags(db, data.id, newTags)),
                      ),
                  )
                : TE.of(oldExpandedEvent.tags);
        }),

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
        TE.bindW("insertedRts", () =>
            TE.fromTask(() =>
                rawInsertReminders(
                    db,
                    data.remindersInsert?.map((reminder) => ({
                        eventId: data.id,
                        ...reminder,
                    })) ?? [],
                ),
            ),
        ),

        TE.map(({ updatedRts, insertedRts, newTags, oldExpandedEvent }) => {
            return {
                ...oldExpandedEvent,
                reminders: updatedRts.concat(insertedRts),
                tags: newTags,
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
