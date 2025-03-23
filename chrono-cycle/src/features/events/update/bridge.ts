import * as A from "fp-ts/Array";
import { pipe } from "fp-ts/function";
import * as I from "fp-ts/Identity";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";

import { Event, toEvent } from "@/common/data/domain";
import {
    AssertionError,
    CancelReminderError,
    DoesNotExistError,
    InternalError,
    InvalidEventStatusError,
    ScheduleReminderError,
} from "@/common/errors";

import { decodeProjectId, decodeReminderId } from "@/lib/identifiers";
import { cancelReminder, scheduleReminders } from "@/lib/reminders";

import { DbLike, getDb } from "@/db";
import { updateEvent } from "@/db/queries/events/update";
import { retrieveReminders } from "@/db/queries/reminders/retrieve";
import { updateReminder } from "@/db/queries/reminders/update";
import { wrapWithTransaction } from "@/db/queries/utils/transaction";
import { DbExpandedEvent, DbReminder } from "@/db/schema";

import { ParsedPayload } from "./data";

function scheduleInsertedRemindersBridge(
    db: DbLike,
    insertedReminders: DbReminder[],
): TE.TaskEither<
    ScheduleReminderError | CancelReminderError | DoesNotExistError,
    void
> {
    return pipe(
        scheduleReminders(insertedReminders),

        // Save the run IDs into the database.
        TE.tap((scheduledDbReminders) =>
            pipe(
                scheduledDbReminders,
                A.traverse(TE.ApplicativePar)((scheduledDbReminder) =>
                    updateReminder(db, {
                        id: scheduledDbReminder.reminder.id,
                        triggerRunId: scheduledDbReminder.handle.id,
                    }),
                ),
            ),
        ),

        TE.map(() => undefined),
    );
}

function rescheduleUpdatedRemindersBridge(
    db: DbLike,
    dbExpandedEvent: DbExpandedEvent,
    updatedReminderIds: number[],
): TE.TaskEither<
    ScheduleReminderError | CancelReminderError | DoesNotExistError,
    void
> {
    return pipe(
        I.Do,

        // Get the updated reminders from the event
        // so that we can access their trigger run IDs
        // for cancellation.
        I.bind("reminders", () => dbExpandedEvent.reminders),
        I.bind("updatedReminders", ({ reminders }) =>
            reminders.filter((r) => updatedReminderIds.includes(r.id)),
        ),
        TE.of,

        // Cancel the existing triggers.
        TE.tap(({ updatedReminders }) =>
            pipe(
                updatedReminders,
                A.filterMap((r) =>
                    r.triggerRunId !== null ? O.some(r.triggerRunId) : O.none,
                ),
                A.traverse(TE.ApplicativePar)((triggerRunId) =>
                    cancelReminder(triggerRunId),
                ),
            ),
        ),

        // Schedule new triggers.
        TE.chain(({ updatedReminders }) => scheduleReminders(updatedReminders)),

        // Save the run IDs into the database.
        TE.tap((scheduledDbReminders) =>
            pipe(
                scheduledDbReminders,
                A.traverse(TE.ApplicativePar)((scheduledDbReminder) =>
                    updateReminder(db, {
                        id: scheduledDbReminder.reminder.id,
                        triggerRunId: scheduledDbReminder.handle.id,
                    }),
                ),
            ),
        ),

        TE.map(() => undefined),
    );
}

// Warning: Does not wrap everything in a transaction!
function unsafeBridge(
    db: DbLike,
    userId: number,
    payloadP: ParsedPayload,
): TE.TaskEither<
    | DoesNotExistError
    | InvalidEventStatusError
    | AssertionError
    | InternalError,
    Event
> {
    return pipe(
        TE.Do,
        TE.bind("decodedRemindersDelete", () =>
            TE.right(
                payloadP.remindersDelete.map((id) => decodeReminderId(id)),
            ),
        ),
        TE.bind("decodedRemindersUpdate", () =>
            TE.right(
                payloadP.remindersUpdate.map((r) => {
                    const { id, ...rest } = r;
                    return {
                        id: decodeReminderId(id),
                        ...rest,
                    };
                }),
            ),
        ),

        // We need to retrieve the run IDs for reminders to delete beforehand
        // because their reminder entries will be deleted.
        TE.bind("deletedReminderRunIds", ({ decodedRemindersDelete }) =>
            pipe(
                retrieveReminders(db, decodedRemindersDelete),
                TE.map((dbReminders) => dbReminders.map((r) => r.triggerRunId)),
            ),
        ),

        // Update the DB.
        TE.bind(
            "dbExpandedEvent",
            ({ decodedRemindersDelete, decodedRemindersUpdate }) => {
                const {
                    id,
                    remindersDelete: _remindersDelete,
                    remindersUpdate: _remindersUpdate,
                    ...rest
                } = payloadP;

                return updateEvent(db, userId, {
                    id: decodeProjectId(id),
                    remindersDelete: decodedRemindersDelete,
                    remindersUpdate: decodedRemindersUpdate,
                    ...rest,
                });
            },
        ),

        // Schedule inserted reminders.
        TE.tap(
            ({
                dbExpandedEvent,
                decodedRemindersUpdate,
                decodedRemindersDelete,
            }) =>
                pipe(
                    // Inserted reminders are the ones from the returned event that
                    // were not in the deleted or updated list.
                    decodedRemindersDelete.concat(
                        decodedRemindersUpdate.map((r) => r.id),
                    ),
                    (deletedUpdatedReminderIds) =>
                        dbExpandedEvent.reminders.filter(
                            (reminder) =>
                                !deletedUpdatedReminderIds.includes(
                                    reminder.id,
                                ),
                        ),
                    (insertedReminders) =>
                        scheduleInsertedRemindersBridge(db, insertedReminders),
                ),
        ),

        // Cancel all scheduled email reminders for deleted reminders.
        TE.tap(({ deletedReminderRunIds }) =>
            pipe(
                deletedReminderRunIds,
                A.filter((runId) => runId !== null),
                A.traverse(TE.ApplicativePar)((runId) => cancelReminder(runId)),
            ),
        ),

        // Re-schedule updated reminders.
        TE.tap(({ dbExpandedEvent, decodedRemindersUpdate }) =>
            rescheduleUpdatedRemindersBridge(
                db,
                dbExpandedEvent,
                decodedRemindersUpdate.map((r) => r.id),
            ),
        ),

        // Map reminder errors to `InternalError` since the client shouldn't
        // need to know about it.
        TE.mapError((err) =>
            err._errorKind === "ScheduleReminderError"
                ? InternalError("Failed to schedule reminders")
                : err._errorKind === "CancelReminderError"
                  ? InternalError("Failed to cancel reminders")
                  : err,
        ),

        // Map to domain object.
        TE.map(({ dbExpandedEvent }) => toEvent(dbExpandedEvent)),
    );
}

export function bridge(userId: number, payloadP: ParsedPayload) {
    return pipe(
        TE.fromTask(getDb),
        TE.chain((db) =>
            wrapWithTransaction(db, (tx) => unsafeBridge(tx, userId, payloadP)),
        ),
    );
}
